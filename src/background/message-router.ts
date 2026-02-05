import type { Message } from '@shared/types';
import {
  saveDirectoryHandle,
  loadDirectoryHandle,
  verifyDirectoryPermission
} from './idb-storage';
import { STORAGE_KEYS } from '@shared/constants';
import {
  queueDownloadMetadata,
  cancelAllDownloads
} from './download-interceptor';

/**
 * Handle messages from popup and content scripts
 */
export function initMessageRouter(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      handleMessage(message, sender)
        .then(sendResponse)
        .catch(error => {
          console.error('Message handler error:', error);
          sendResponse({ error: error.message });
        });

      // Return true to indicate async response
      return true;
    }
  );
}

async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender
): Promise<any> {
  console.log('Background received message:', message.type);

  switch (message.type) {
    case 'GET_DIRECTORY_HANDLE':
      return await handleGetDirectoryHandle();

    case 'SET_DIRECTORY_HANDLE':
      return await handleSetDirectoryHandle(message.payload);

    case 'GET_SETTINGS':
      return await handleGetSettings();

    case 'SET_SETTINGS':
      return await handleSetSettings(message.payload);

    case 'DOWNLOAD_START':
      return await handleDownloadStart(message.payload, sender);

    case 'DOWNLOAD_CANCEL':
      return handleDownloadCancel();

    default:
      console.warn('Unknown message type:', message.type);
      return { success: false, error: 'Unknown message type' };
  }
}

/**
 * Get saved directory handle
 */
async function handleGetDirectoryHandle(): Promise<{
  handle: FileSystemDirectoryHandle | null;
  hasPermission: boolean;
}> {
  const handle = await loadDirectoryHandle();

  if (!handle) {
    return { handle: null, hasPermission: false };
  }

  // Verify permission
  const hasPermission = await verifyDirectoryPermission(handle);

  return { handle, hasPermission };
}

/**
 * Save directory handle
 */
async function handleSetDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<{ success: boolean }> {
  try {
    await saveDirectoryHandle(handle);
    return { success: true };
  } catch (error) {
    console.error('Error saving directory handle:', error);
    return { success: false };
  }
}

/**
 * Get settings from chrome.storage
 */
async function handleGetSettings(): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.SETTINGS, (result) => {
      resolve(result[STORAGE_KEYS.SETTINGS] || null);
    });
  });
}

/**
 * Save settings to chrome.storage
 */
async function handleSetSettings(settings: any): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [STORAGE_KEYS.SETTINGS]: settings },
      () => {
        resolve({ success: true });
      }
    );
  });
}

/**
 * Handle download start - queue metadata for download matching
 * Content script sends this BEFORE calling UYAP's downloadDoc()
 * so the background can match the upcoming Chrome download with evrak metadata
 */
async function handleDownloadStart(
  payload: { evrakId: string; evrakName: string; relativePath: string },
  sender: chrome.runtime.MessageSender
): Promise<{ success: boolean }> {
  const tabId = sender.tab?.id;

  if (!tabId) {
    console.warn('DOWNLOAD_START received without tab ID');
    return { success: false };
  }

  queueDownloadMetadata({
    ...payload,
    tabId
  });

  console.log(`Queued metadata for evrak: ${payload.evrakId} (tab: ${tabId})`);
  return { success: true };
}

/**
 * Handle download cancel - clear all pending and active downloads
 */
function handleDownloadCancel(): { success: boolean } {
  cancelAllDownloads();
  console.log('All pending downloads cancelled');
  return { success: true };
}
