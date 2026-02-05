import type {
  EvrakItem,
  DosyaBilgileri,
  DownloadProgress,
  DownloadProgressPayload
} from '@/types';
import { getYargiTuru } from './scanner';
import { ayarlar, sessionExpired } from '@store';
import { sendToBackground } from '@lib';

// Registry of pending download promises (resolved by message handler in index.tsx)
const pendingResolvers = new Map<string, (payload: DownloadProgressPayload) => void>();

/**
 * Resolve a pending download promise from external message handler
 * Called when background sends DOWNLOAD_PROGRESS to content script
 */
export function resolveDownloadProgress(payload: DownloadProgressPayload): void {
  const resolver = pendingResolvers.get(payload.evrakId);
  if (resolver) {
    pendingResolvers.delete(payload.evrakId);
    resolver(payload);
  }
}

/**
 * Downloader class
 * CRITICAL: Calls UYAP's native downloadDoc() function
 * CRITICAL: Respects WAF protection with 300ms+ delay between downloads
 * CRITICAL: Never modifies UYAP DOM (jQuery events attached)
 */
export class Downloader {
  private abortController: AbortController | null = null;
  private isPaused = false;
  private currentIndex = 0;
  private static readonly DOWNLOAD_TIMEOUT = 30000; // 30 seconds

  constructor(
    private onProgress: (progress: DownloadProgress) => void,
    private onSessionExpired: () => void
  ) {}

  /**
   * Download all selected evraklar
   */
  async downloadAll(
    evraklar: EvrakItem[],
    dosya: DosyaBilgileri
  ): Promise<void> {
    this.abortController = new AbortController();
    this.currentIndex = 0;

    for (let i = this.currentIndex; i < evraklar.length; i++) {
      // Check for pause
      while (this.isPaused && !this.abortController.signal.aborted) {
        await this.sleep(100);
      }

      // Check for abort
      if (this.abortController.signal.aborted) {
        console.log('Download cancelled');
        break;
      }

      // Check for session expiry
      if (sessionExpired.value) {
        console.log('Session expired, stopping downloads');
        this.onSessionExpired();
        break;
      }

      const evrak = evraklar[i];
      this.currentIndex = i;

      // Notify progress: downloading
      this.onProgress({
        evrakId: evrak.evrakId,
        status: 'downloading'
      });

      // Download the evrak and wait for completion
      const result = await this.downloadSingleAndWait(evrak, dosya);

      if (result.status === 'session_expired') {
        console.log('Session expired during download');
        this.onSessionExpired();
        break;
      }

      // Notify with actual result
      this.onProgress({
        evrakId: evrak.evrakId,
        status: result.status === 'completed' ? 'completed' : 'failed',
        error: result.error
      });

      // CRITICAL: WAF protection - wait before next download
      await this.sleep(ayarlar.value.downloadDelay);
    }
  }

  /**
   * Download a single evrak and wait for completion via background script
   * Flow: Send metadata -> Trigger UYAP download -> Wait for background response
   */
  private async downloadSingleAndWait(
    evrak: EvrakItem,
    dosya: DosyaBilgileri
  ): Promise<DownloadProgressPayload> {
    try {
      // Step 1: Send metadata to background for download matching
      await sendToBackground('DOWNLOAD_START', {
        evrakId: evrak.evrakId,
        evrakName: evrak.name,
        relativePath: evrak.relativePath
      });

      // Step 2: Create a promise that resolves when background sends DOWNLOAD_PROGRESS
      const resultPromise = new Promise<DownloadProgressPayload>((resolve) => {
        pendingResolvers.set(evrak.evrakId, resolve);

        // Timeout safety: resolve with failure if no response
        setTimeout(() => {
          if (pendingResolvers.has(evrak.evrakId)) {
            pendingResolvers.delete(evrak.evrakId);
            resolve({
              evrakId: evrak.evrakId,
              status: 'failed',
              error: 'Download timeout'
            });
          }
        }, Downloader.DOWNLOAD_TIMEOUT);
      });

      // Step 3: Trigger UYAP's native download
      const initiated = this.triggerDownload(evrak, dosya);

      if (!initiated) {
        pendingResolvers.delete(evrak.evrakId);
        return {
          evrakId: evrak.evrakId,
          status: 'failed',
          error: 'UYAP downloadDoc function not found'
        };
      }

      // Step 4: Wait for background to process and respond
      return await resultPromise;
    } catch (error) {
      console.error('Error downloading evrak:', error);
      pendingResolvers.delete(evrak.evrakId);
      return {
        evrakId: evrak.evrakId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Trigger UYAP's native download function
   * CRITICAL: Only calls downloadDoc, does NOT wait for completion
   * CRITICAL: Never modifies UYAP DOM (jQuery events attached)
   */
  private triggerDownload(
    evrak: EvrakItem,
    dosya: DosyaBilgileri
  ): boolean {
    try {
      const downloadDoc = (window as any).downloadDoc;

      if (typeof downloadDoc !== 'function') {
        console.error('UYAP downloadDoc function not found');
        return false;
      }

      const yargiTuru = getYargiTuru();
      downloadDoc(evrak.evrakId, dosya.dosyaId, yargiTuru);
      console.log(`Download triggered for evrak: ${evrak.evrakId}`);
      return true;
    } catch (error) {
      console.error('Error triggering download:', error);
      return false;
    }
  }

  /**
   * Pause downloads
   */
  pause(): void {
    this.isPaused = true;
    console.log('Downloads paused');
  }

  /**
   * Resume downloads
   */
  resume(): void {
    this.isPaused = false;
    console.log('Downloads resumed');
  }

  /**
   * Cancel all downloads
   */
  cancel(): void {
    this.abortController?.abort();
    this.isPaused = false;

    // Clear all pending resolvers
    pendingResolvers.clear();

    // Notify background to cancel pending downloads
    sendToBackground('DOWNLOAD_CANCEL').catch(console.error);

    console.log('Downloads cancelled');
  }

  /**
   * Get current download index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Check if downloads are paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Check if downloads are cancelled
   */
  isCancelled(): boolean {
    return this.abortController?.signal.aborted || false;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
