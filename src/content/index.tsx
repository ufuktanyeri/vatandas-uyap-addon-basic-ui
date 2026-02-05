import "@/styles/sidebar.css";
import { SELECTORS } from "@lib";
import {
  dosyaBilgileri,
  evraklar,
  kisiAdi,
  paginationInfo,
  sessionExpired,
} from "@store";
import { render } from "preact";
import {
  detectPagination,
  findKisiAdi,
  getDosyaBilgileri,
  scanFiletree,
  waitForFiletree,
} from "./scanner";
import { App } from "./ui/App";

console.log("UYAP Extension: Content script loaded");

let appContainer: HTMLDivElement | null = null;
let isInitialized = false;

/**
 * Wait for UYAP dosya_bilgileri global object to become available
 * This object is only set when a specific case/dosya is opened,
 * NOT on the main portal page.
 */
function waitForDosyaBilgileri(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if ((window as any).dosya_bilgileri) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("dosya_bilgileri not available - not a dosya detail page"));
        return;
      }

      setTimeout(check, 500);
    };

    check();
  });
}

/**
 * Initialize the extension when UYAP modal is detected
 */
async function initExtension() {
  if (isInitialized) {
    console.log("Extension already initialized");
    return;
  }

  // Set flag immediately to prevent race conditions
  isInitialized = true;

  try {
    console.log("Initializing extension...");

    // Wait for dosya_bilgileri to be available first
    // This ensures we're on a dosya detail page, not the main portal
    await waitForDosyaBilgileri(10000);

    // Wait for filetree to load with longer timeout
    await waitForFiletree(30000);

    // Scan filetree
    const scannedEvraklar = scanFiletree();
    evraklar.value = scannedEvraklar;

    // Detect pagination (warn if not all evraklar are visible)
    const pagination = detectPagination();
    paginationInfo.value = pagination;
    if (pagination?.hasMultiplePages) {
      console.warn(
        `Pagination detected: page ${pagination.currentPage}/${pagination.totalPages}. ` +
        `Only current page evraklar are scanned.`
      );
    }

    // Get dosya bilgileri
    const dosya = getDosyaBilgileri();
    dosyaBilgileri.value = dosya;

    // Get kisi adi and store in signal (used by export manifest)
    const kisiAdiValue = findKisiAdi();
    kisiAdi.value = kisiAdiValue;

    console.log("Extension initialized:", {
      evrakCount: scannedEvraklar.length,
      dosyaNo: dosya?.dosyaNo,
      kisiAdi: kisiAdiValue,
    });

    // Render Preact app
    renderApp();
  } catch (error) {
    console.log("Extension init skipped:", (error as Error).message);
    // Reset flag to allow retry when actual dosya page is opened
    isInitialized = false;
  }
}

/**
 * Render Preact app to the page
 */
function renderApp() {
  if (!appContainer) {
    // Create container
    appContainer = document.createElement("div");
    appContainer.id = "uyap-extension-root";
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
  evraklar.value = [];
  dosyaBilgileri.value = null;
  sessionExpired.value = false;
  paginationInfo.value = null;
  kisiAdi.value = "";

  console.log("Extension cleaned up");
}

/**
 * Check if the UYAP modal is actually visible and active
 * The modal element exists as an empty shell in the DOM at all times,
 * so we must check visibility, not just existence.
 */
function isModalVisible(): boolean {
  const modal = document.querySelector<HTMLElement>(SELECTORS.MODAL);
  if (!modal) return false;

  // Check CSS display/visibility
  const style = window.getComputedStyle(modal);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  // Check Bootstrap/jQuery modal classes
  if (modal.classList.contains('show') || modal.classList.contains('in')) return true;

  // Fallback: check if modal has actual dimensions (rendered on screen)
  return modal.offsetWidth > 0 && modal.offsetHeight > 0;
}

/**
 * Observe UYAP DOM for modal appearance
 * Uses debounce to prevent excessive callback firing on every DOM mutation
 */
function observeModal() {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isProcessing = false;

  const observer = new MutationObserver(() => {
    // Skip if already processing to prevent multiple simultaneous operations
    if (isProcessing) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      // Double-check inside timeout
      if (isProcessing) return;

      const modalVisible = isModalVisible();

      if (modalVisible && !isInitialized) {
        console.log("UYAP modal detected and visible");
        isProcessing = true;

        initExtension()
          .catch((err) => {
            console.error("Init failed:", err);
          })
          .finally(() => {
            isProcessing = false;
          });
      } else if (!modalVisible && isInitialized) {
        console.log("UYAP modal closed");
        isProcessing = true;
        cleanupExtension();
        isProcessing = false;
      }
    }, 150);
  });

  // Observe the modal element directly if it exists, otherwise body
  const modalEl = document.querySelector(SELECTORS.MODAL);
  const observeTarget = modalEl?.parentElement || document.body;

  observer.observe(observeTarget, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  console.log("Started observing for UYAP modal");

  // Check if modal is already visible
  if (isModalVisible()) {
    console.log("UYAP modal already visible");
    isProcessing = true;
    initExtension()
      .catch((err) => console.error("Init failed:", err))
      .finally(() => {
        isProcessing = false;
      });
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    observeModal();
  });
} else {
  observeModal();
}
