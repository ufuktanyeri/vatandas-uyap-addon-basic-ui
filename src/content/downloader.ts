import type {
  EvrakItem,
  DosyaBilgileri,
  DownloadProgress,
  WriteFileResponse
} from '@/types';
import { getYargiTuru } from './scanner';
import { ayarlar, sessionExpired } from '@store';
import {
  sendToBackground,
  UYAP_BASE_URL,
  DOWNLOAD_ENDPOINT,
  MAGIC_BYTES,
  MIME_TYPES,
  FILE_EXTENSIONS,
  RETRY_CONFIG
} from '@lib';

/**
 * Match byte array with magic bytes signature
 */
function matchBytes(header: Uint8Array, magic: readonly number[]): boolean {
  if (header.length < magic.length) return false;

  for (let i = 0; i < magic.length; i++) {
    if (header[i] !== magic[i]) return false;
  }

  return true;
}

/**
 * Detect file type from magic bytes
 * Returns MIME type and file extension
 */
function detectFileType(
  bytes: Uint8Array
): { mimeType: string; extension: string } {
  const header = bytes.slice(0, 4);

  if (matchBytes(header, MAGIC_BYTES.PDF)) {
    return { mimeType: MIME_TYPES.PDF, extension: FILE_EXTENSIONS.PDF };
  }

  if (matchBytes(header, MAGIC_BYTES.ZIP)) {
    return { mimeType: MIME_TYPES.UDF, extension: FILE_EXTENSIONS.UDF };
  }

  if (matchBytes(header, MAGIC_BYTES.TIFF_LE) || matchBytes(header, MAGIC_BYTES.TIFF_BE)) {
    return { mimeType: MIME_TYPES.TIFF, extension: FILE_EXTENSIONS.TIFF };
  }

  return { mimeType: MIME_TYPES.UNKNOWN, extension: '' };
}

/**
 * Check if response bytes indicate HTML content (session expired)
 * UYAP returns HTTP 200 + HTML login page when session expires
 */
function isHtmlResponse(bytes: Uint8Array): boolean {
  const snippet = new TextDecoder().decode(bytes.slice(0, 500));
  return snippet.includes('<!DOCTYPE') ||
    snippet.includes('<html') ||
    snippet.includes('<HTML');
}

/**
 * Convert ArrayBuffer to base64 string for Chrome messaging
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // Process in chunks to avoid call stack overflow on large files
  const CHUNK_SIZE = 8192;
  let binary = '';

  for (let i = 0; i < bytes.byteLength; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.byteLength));
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

interface SingleDownloadResult {
  success: boolean;
  sessionExpired?: boolean;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  error?: string;
}

/**
 * Downloader class - fetches files directly from UYAP and writes via background
 *
 * FLOW:
 * 1. Content script fetches download URL directly (same-origin, credentials included)
 * 2. Checks Content-Type header + magic bytes for session expired detection
 * 3. Converts ArrayBuffer to base64 and sends to background via WRITE_FILE message
 * 4. Background writes file to user-selected directory via File System Access API
 *
 * This approach eliminates the need for file:// protocol access in service workers,
 * which is blocked in Chrome MV3.
 */
export class Downloader {
  private abortController: AbortController | null = null;
  private isPaused = false;
  private currentIndex = 0;

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

      // Download and write the evrak (with retry support)
      const result = await this.downloadWithRetry(evrak, dosya);

      if (result.sessionExpired) {
        sessionExpired.value = true;
        this.onSessionExpired();
        break;
      }

      // Notify with result
      this.onProgress({
        evrakId: evrak.evrakId,
        status: result.success ? 'completed' : 'failed',
        error: result.error
      });

      // CRITICAL: WAF protection - wait before next download
      await this.sleep(ayarlar.value.downloadDelay);
    }
  }

  /**
   * Download with automatic retry on transient failures
   * Does NOT retry on session expiry or user cancellation
   */
  private async downloadWithRetry(
    evrak: EvrakItem,
    dosya: DosyaBilgileri
  ): Promise<SingleDownloadResult> {
    const maxAttempts = ayarlar.value.autoRetry
      ? RETRY_CONFIG.MAX_RETRIES + 1
      : 1;

    let lastResult: SingleDownloadResult = { success: false, error: 'Bilinmeyen hata' };

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      lastResult = await this.downloadSingle(evrak, dosya);

      // Don't retry on success, session expiry, or user cancellation
      if (
        lastResult.success ||
        lastResult.sessionExpired ||
        lastResult.error === 'Iptal edildi' ||
        this.abortController?.signal.aborted
      ) {
        return lastResult;
      }

      // If more attempts remaining, wait with exponential backoff
      if (attempt < maxAttempts) {
        const delay = RETRY_CONFIG.BASE_DELAY *
          Math.pow(RETRY_CONFIG.DELAY_MULTIPLIER, attempt - 1);
        console.log(
          `Retry ${attempt}/${RETRY_CONFIG.MAX_RETRIES} for ${evrak.evrakId} after ${delay}ms`
        );
        await this.sleep(delay);
      }
    }

    return lastResult;
  }

  /**
   * Download a single evrak via fetch() and write to target directory
   *
   * Steps:
   * 1. Fetch from UYAP (same-origin, with credentials)
   * 2. Check Content-Type header for quick session detection
   * 3. Read body as ArrayBuffer, check magic bytes
   * 4. Detect file type and build filename
   * 5. Send base64 data to background for writing
   */
  private async downloadSingle(
    evrak: EvrakItem,
    dosya: DosyaBilgileri
  ): Promise<SingleDownloadResult> {
    const yargiTuru = getYargiTuru();
    const url = `${UYAP_BASE_URL}/${DOWNLOAD_ENDPOINT}` +
      `?evrakId=${evrak.evrakId}` +
      `&dosyaId=${dosya.dosyaId}` +
      `&yargiTuru=${yargiTuru}`;

    try {
      // Step 1: Fetch from UYAP
      const response = await fetch(url, {
        credentials: 'include',
        signal: this.abortController?.signal
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      // Step 2: Quick session detection via Content-Type
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/html')) {
        return { success: false, sessionExpired: true };
      }

      // Step 3: Read body and check magic bytes
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Double-check with magic bytes (UYAP may not set Content-Type correctly)
      if (isHtmlResponse(bytes)) {
        return { success: false, sessionExpired: true };
      }

      // Step 4: Detect file type and build filename
      const { mimeType, extension } = detectFileType(bytes);
      const fileName = `${evrak.name}${extension || '.bin'}`;

      // Step 5: Send to background for writing
      const base64Data = arrayBufferToBase64(arrayBuffer);

      const writeResult = await sendToBackground<WriteFileResponse>('WRITE_FILE', {
        base64Data,
        fileName,
        relativePath: evrak.relativePath,
        mimeType,
        fileSize: arrayBuffer.byteLength
      });

      if (!writeResult.success) {
        return { success: false, error: writeResult.error };
      }

      return {
        success: true,
        fileName,
        mimeType,
        fileSize: arrayBuffer.byteLength
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { success: false, error: 'Iptal edildi' };
      }

      console.error('Download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  pause(): void {
    this.isPaused = true;
    console.log('Downloads paused');
  }

  resume(): void {
    this.isPaused = false;
    console.log('Downloads resumed');
  }

  cancel(): void {
    this.abortController?.abort();
    this.isPaused = false;
    console.log('Downloads cancelled');
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  isCancelled(): boolean {
    return this.abortController?.signal.aborted || false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
