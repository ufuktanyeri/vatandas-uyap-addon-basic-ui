import { MAGIC_BYTES, MIME_TYPES, FILE_EXTENSIONS } from '@shared/constants';
import type { Message } from '@shared/types';
import { loadDirectoryHandle } from './idb-storage';

/**
 * Match byte array with magic bytes
 */
function matchBytes(header: Uint8Array, magic: readonly number[]): boolean {
  if (header.length < magic.length) {
    return false;
  }

  for (let i = 0; i < magic.length; i++) {
    if (header[i] !== magic[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Detect file type from magic bytes
 * CRITICAL: Dual-layer check (Content-Type + Magic Bytes) for session detection
 */
async function detectFileType(filepath: string): Promise<{
  type: string;
  mimeType: string;
  extension: string;
}> {
  try {
    // Read the file
    const response = await fetch(`file:///${filepath}`);
    const blob = await response.blob();

    // Check magic bytes (first 4 bytes)
    const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());

    if (matchBytes(header, MAGIC_BYTES.PDF)) {
      return {
        type: 'pdf',
        mimeType: MIME_TYPES.PDF,
        extension: FILE_EXTENSIONS.PDF
      };
    }

    if (matchBytes(header, MAGIC_BYTES.ZIP)) {
      return {
        type: 'udf',
        mimeType: MIME_TYPES.UDF,
        extension: FILE_EXTENSIONS.UDF
      };
    }

    if (matchBytes(header, MAGIC_BYTES.TIFF_LE) || matchBytes(header, MAGIC_BYTES.TIFF_BE)) {
      return {
        type: 'tiff',
        mimeType: MIME_TYPES.TIFF,
        extension: FILE_EXTENSIONS.TIFF
      };
    }

    // CRITICAL: Check for HTML (session expired detection)
    const text = await blob.slice(0, 500).text();

    if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<HTML')) {
      return {
        type: 'html',
        mimeType: MIME_TYPES.HTML,
        extension: FILE_EXTENSIONS.HTML
      };
    }

    // Unknown type
    return {
      type: 'unknown',
      mimeType: MIME_TYPES.UNKNOWN,
      extension: ''
    };
  } catch (error) {
    console.error('Error detecting file type:', error);
    return {
      type: 'unknown',
      mimeType: MIME_TYPES.UNKNOWN,
      extension: ''
    };
  }
}

/**
 * Move downloaded file to target directory using File System Access API
 */
async function moveToTargetFolder(
  downloadPath: string,
  targetFileName: string,
  relativePath: string
): Promise<void> {
  try {
    // Get directory handle from IndexedDB
    const directoryHandle = await loadDirectoryHandle();

    if (!directoryHandle) {
      throw new Error('No directory handle found');
    }

    // Create subdirectories if needed
    let currentDir = directoryHandle;

    if (relativePath) {
      const pathParts = relativePath.split('/');

      for (const part of pathParts) {
        if (!part.trim()) continue;
        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
      }
    }

    // Read the downloaded file
    const response = await fetch(`file:///${downloadPath}`);
    const blob = await response.blob();

    // Create the target file
    const fileHandle = await currentDir.getFileHandle(targetFileName, { create: true });
    const writable = await fileHandle.createWritable();

    await writable.write(blob);
    await writable.close();

    console.log(`File moved to: ${relativePath}/${targetFileName}`);
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
}

/**
 * Process a completed download
 * CRITICAL: Uses tab-specific messaging (chrome.tabs.sendMessage) instead of
 * chrome.runtime.sendMessage which cannot reach content scripts
 */
async function processDownload(
  downloadId: number,
  downloadPath: string
): Promise<void> {
  // Get metadata FIRST to have tabId for notifications
  const metadata = getActiveDownload(downloadId);

  try {
    console.log('Processing download:', downloadId, downloadPath);

    // Detect file type
    const fileInfo = await detectFileType(downloadPath);

    // CRITICAL: Session expired check
    if (fileInfo.type === 'html') {
      console.warn('Session expired detected!');

      if (metadata) {
        // Notify content script about session expiry
        chrome.tabs.sendMessage(metadata.tabId, {
          type: 'SESSION_EXPIRED'
        } as Message);

        // Resolve the pending download promise with session_expired status
        chrome.tabs.sendMessage(metadata.tabId, {
          type: 'DOWNLOAD_PROGRESS',
          payload: {
            evrakId: metadata.evrakId,
            status: 'session_expired',
            error: 'Session expired'
          }
        } as Message);
      }

      // Cancel and remove the HTML file
      await chrome.downloads.cancel(downloadId);
      await chrome.downloads.removeFile(downloadId);

      return;
    }

    if (!metadata) {
      console.warn('No metadata found for download:', downloadId);
      return;
    }

    // Move file to target directory
    const fileName = `${metadata.evrakName}${fileInfo.extension}`;
    await moveToTargetFolder(downloadPath, fileName, metadata.relativePath);

    // Get file size from download info
    const downloadResults = await new Promise<chrome.downloads.DownloadItem[]>(
      (resolve) => chrome.downloads.search({ id: downloadId }, resolve)
    );
    const fileSize = downloadResults[0]?.fileSize || 0;

    // Notify content script of successful download
    chrome.tabs.sendMessage(metadata.tabId, {
      type: 'DOWNLOAD_PROGRESS',
      payload: {
        evrakId: metadata.evrakId,
        status: 'completed',
        fileName,
        mimeType: fileInfo.mimeType,
        fileSize
      }
    } as Message);

    // Clean up the original download
    await chrome.downloads.removeFile(downloadId);
    await chrome.downloads.erase({ id: downloadId });
  } catch (error) {
    console.error('Error processing download:', error);

    if (metadata) {
      // Notify content script of failure
      chrome.tabs.sendMessage(metadata.tabId, {
        type: 'DOWNLOAD_PROGRESS',
        payload: {
          evrakId: metadata.evrakId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      } as Message);
    }
  }
}

// Pending download queue (FIFO) - populated by DOWNLOAD_START messages
const pendingQueue: Array<{
  evrakId: string;
  evrakName: string;
  relativePath: string;
  tabId: number;
}> = [];

// Active downloads - matched download ID to metadata
const activeDownloads = new Map<number, {
  evrakId: string;
  evrakName: string;
  relativePath: string;
  tabId: number;
}>();

/**
 * Queue download metadata from DOWNLOAD_START message
 * Called by message-router when content script initiates a download
 */
export function queueDownloadMetadata(metadata: {
  evrakId: string;
  evrakName: string;
  relativePath: string;
  tabId: number;
}): void {
  pendingQueue.push(metadata);
}

/**
 * Match a new Chrome download with pending metadata from the queue
 */
function matchPendingDownload(downloadId: number): void {
  if (pendingQueue.length > 0) {
    const metadata = pendingQueue.shift()!;
    activeDownloads.set(downloadId, metadata);
    console.log(`Matched download ${downloadId} with evrak ${metadata.evrakId}`);
  }
}

/**
 * Get and remove active download metadata
 */
function getActiveDownload(downloadId: number) {
  const metadata = activeDownloads.get(downloadId);
  if (metadata) {
    activeDownloads.delete(downloadId);
  }
  return metadata || null;
}

/**
 * Cancel all pending and active downloads
 */
export function cancelAllDownloads(): void {
  pendingQueue.length = 0;
  activeDownloads.clear();
}

/**
 * Initialize download interceptor
 */
export function initDownloadInterceptor(): void {
  // Listen for new downloads
  chrome.downloads.onCreated.addListener((downloadItem) => {
    // Only process UYAP downloads
    if (!downloadItem.url.includes('uyap.gov.tr')) {
      return;
    }

    if (!downloadItem.url.includes('download_document')) {
      return;
    }

    console.log('UYAP download detected:', downloadItem.id);

    // Match with pending metadata from DOWNLOAD_START message
    matchPendingDownload(downloadItem.id);

    // Listen for download completion or failure
    const listener = (delta: chrome.downloads.DownloadDelta) => {
      if (delta.id !== downloadItem.id) {
        return;
      }

      if (delta.state?.current === 'complete') {
        chrome.downloads.onChanged.removeListener(listener);

        // Get the final download info
        chrome.downloads.search({ id: downloadItem.id }, (results) => {
          if (results.length > 0 && results[0].filename) {
            processDownload(downloadItem.id, results[0].filename);
          }
        });
      } else if (delta.state?.current === 'interrupted') {
        chrome.downloads.onChanged.removeListener(listener);

        // Notify content script of download failure
        const metadata = getActiveDownload(downloadItem.id);
        if (metadata) {
          chrome.tabs.sendMessage(metadata.tabId, {
            type: 'DOWNLOAD_PROGRESS',
            payload: {
              evrakId: metadata.evrakId,
              status: 'failed',
              error: 'Download interrupted'
            }
          } as Message);
        }
      }
    };

    chrome.downloads.onChanged.addListener(listener);
  });
}

// queueDownloadMetadata and cancelAllDownloads are exported directly from their declarations
