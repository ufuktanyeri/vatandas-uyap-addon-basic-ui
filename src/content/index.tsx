import { render } from 'preact';
import { App } from './ui/App';
import {
  scanFiletree,
  getDosyaBilgileri,
  findKisiAdi,
  waitForFiletree
} from './scanner';
import {
  evraklar,
  sidebarVisible,
  dosyaBilgileri,
  sessionExpired,
  indirmeDurumu,
  updateDownloadProgress
} from '@shared/signals';
import type { DownloadProgressPayload } from '@shared/types';
import { resolveDownloadProgress } from './downloader';
import { SELECTORS } from '@shared/constants';
import { onMessage } from '@shared/messages';
import '@/styles/sidebar.css';

console.log('UYAP Extension: Content script loaded');

let appContainer: HTMLDivElement | null = null;
let isInitialized = false;

/**
 * Initialize the extension when UYAP modal is detected
 */
async function initExtension() {
  if (isInitialized) {
    console.log('Extension already initialized');
    return;
  }

  try {
    console.log('Initializing extension...');

    // Wait for filetree to load
    await waitForFiletree();

    // Scan filetree
    const scannedEvraklar = scanFiletree();
    evraklar.value = scannedEvraklar;

    // Get dosya bilgileri
    const dosya = getDosyaBilgileri();
    dosyaBilgileri.value = dosya;

    // Get kisi adi
    const kisiAdi = findKisiAdi();

    console.log('Extension initialized:', {
      evrakCount: scannedEvraklar.length,
      dosyaNo: dosya?.dosyaNo,
      kisiAdi
    });

    // Show sidebar
    sidebarVisible.value = true;

    // Render Preact app
    renderApp();

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

/**
 * Render Preact app to the page
 */
function renderApp() {
  if (!appContainer) {
    // Create container
    appContainer = document.createElement('div');
    appContainer.id = 'uyap-extension-root';
    document.body.appendChild(appContainer);

    // Render Preact app
    render(<App />, appContainer);
  }
}

/**
 * Clean up when modal is closed
 */
function cleanupExtension() {
  if (appContainer) {
    render(null, appContainer);
    appContainer.remove();
    appContainer = null;
  }

  isInitialized = false;
  sidebarVisible.value = false;
  evraklar.value = [];
  dosyaBilgileri.value = null;
  sessionExpired.value = false;

  console.log('Extension cleaned up');
}

/**
 * Observe UYAP DOM for modal appearance
 */
function observeModal() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check if modal appeared
        const modal = document.querySelector(SELECTORS.MODAL);

        if (modal && !isInitialized) {
          // Modal opened
          console.log('UYAP modal detected');
          initExtension();
        } else if (!modal && isInitialized) {
          // Modal closed
          console.log('UYAP modal closed');
          cleanupExtension();
        }
      }
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('Started observing for UYAP modal');

  // Check if modal already exists
  const existingModal = document.querySelector(SELECTORS.MODAL);
  if (existingModal) {
    console.log('UYAP modal already exists');
    initExtension();
  }
}

/**
 * Listen for messages from background script
 */
function setupMessageListener() {
  onMessage((message, _sender) => {
    console.log('Content script received message:', message.type);

    switch (message.type) {
      case 'SESSION_EXPIRED':
        sessionExpired.value = true;
        break;

      case 'DOWNLOAD_PROGRESS': {
        const progressPayload = message.payload as DownloadProgressPayload;

        // Resolve the pending download promise in Downloader
        resolveDownloadProgress(progressPayload);

        // Update download state signals
        const currentState = indirmeDurumu.value;
        if (progressPayload.status === 'completed') {
          updateDownloadProgress(
            (currentState.completedCount || 0) + 1,
            currentState.failedCount || 0
          );
        } else if (progressPayload.status === 'failed') {
          updateDownloadProgress(
            currentState.completedCount || 0,
            (currentState.failedCount || 0) + 1
          );
        }
        break;
      }

      default:
        break;
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    observeModal();
    setupMessageListener();
  });
} else {
  observeModal();
  setupMessageListener();
}
