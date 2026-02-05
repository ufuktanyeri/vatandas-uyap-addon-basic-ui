import type { Message, MessageType } from '@/types';

/**
 * Send a message to the background service worker
 */
export async function sendToBackground<T = any>(
  type: MessageType,
  payload?: any
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type, payload } as Message,
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Send a message to the content script in the active tab
 */
export async function sendToContent<T = any>(
  type: MessageType,
  payload?: any
): Promise<T> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tabs.length === 0 || !tabs[0].id) {
    throw new Error('No active tab found');
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabs[0].id!,
      { type, payload } as Message,
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Send a message to a specific tab's content script (used by background)
 */
export function sendToTab(
  tabId: number,
  type: MessageType,
  payload?: any
): void {
  chrome.tabs.sendMessage(tabId, { type, payload } as Message);
}

/**
 * Listen for messages from any source
 */
export function onMessage(
  callback: (message: Message, sender: chrome.runtime.MessageSender) => void | Promise<any>
) {
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      const result = callback(message, sender);

      if (result instanceof Promise) {
        result.then(sendResponse).catch(console.error);
        return true; // Keep channel open for async response
      }

      return false;
    }
  );
}
