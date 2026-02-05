import type { Message, WriteFilePayload } from '@/types';
import {
  saveDirectoryHandle,
  loadDirectoryHandle,
  verifyDirectoryPermission
} from './idb-storage';
import { STORAGE_KEYS } from '@lib';
import { writeFileToDirectory } from './file-writer';

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
  _sender: chrome.runtime.MessageSender
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

    case 'WRITE_FILE':
      return await writeFileToDirectory(message.payload as WriteFilePayload);

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
