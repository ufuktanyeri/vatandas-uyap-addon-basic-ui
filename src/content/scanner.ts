import type { EvrakItem, DosyaBilgileri, PaginationInfo } from '@/types';
import {
  SELECTORS,
  SKIP_FOLDERS,
  DEFAULT_YARGI_TURU,
  sanitizeName
} from '@lib';

/**
 * Find dosyaId from page HTML
 * CRITICAL: Uses regex on document.body.innerHTML (v1 approach)
 * Fallback: Parse jQuery event handler if available
 */
export function findDosyaId(): string | null {
  // Approach 1: HTML regex (v1 mantığı - en güvenilir)
  const htmlMatch = document.body.innerHTML.match(/dosyaId\s*=\s*['"]?(\d+)['"]?/);
  if (htmlMatch?.[1]) {
    return htmlMatch[1];
  }

  // Approach 2: jQuery event handler parse (solution.txt mantığı)
  try {
    const fileSpan = document.querySelector<HTMLElement>('span.file[evrak_id]');
    if (fileSpan && typeof (window as any).jQuery !== 'undefined') {
      const jQuery = (window as any).jQuery;
      const events = jQuery._data?.(fileSpan, 'events');

      if (events?.dblclick?.[0]) {
        const handlerStr = events.dblclick[0].handler.toString();
        const match = handlerStr.match(/downloadDoc\([^,]+,\s*['"]([^'"]+)['"]/);
        if (match?.[1]) {
          return match[1];
        }
      }
    }
  } catch (err) {
    console.warn('jQuery event parse failed:', err);
  }

  console.warn('dosyaId not found');
  return null;
}

/**
 * Get yargiTuru with fallback chain
 * CRITICAL: yargiTuru can be empty in UYAP, so we use a fallback chain
 */
export function getYargiTuru(): string {
  // Fallback 1: jQuery event handler parse (solution.txt mantığı)
  try {
    const fileSpan = document.querySelector<HTMLElement>('span.file[evrak_id]');
    if (fileSpan && typeof (window as any).jQuery !== 'undefined') {
      const jQuery = (window as any).jQuery;
      const events = jQuery._data?.(fileSpan, 'events');

      if (events?.dblclick?.[0]) {
        const handlerStr = events.dblclick[0].handler.toString();
        // downloadDoc(evrakId, dosyaId, yargiTuru) pattern
        const match = handlerStr.match(/downloadDoc\([^,]+,\s*[^,]+,\s*['"]([^'"]+)['"]/);
        if (match?.[1] && match[1].trim() !== '') {
          return match[1].trim();
        }
      }
    }
  } catch (err) {
    console.warn('jQuery yargiTuru parse failed:', err);
  }

  // Fallback 2: Check #yargiTuru select element
  const selectEl = document.querySelector<HTMLSelectElement>(
    SELECTORS.YARGI_TURU_SELECT
  );
  if (selectEl?.value && selectEl.value.trim() !== '') {
    return selectEl.value.trim();
  }

  // Fallback 3: Default to Hukuk (1)
  return DEFAULT_YARGI_TURU;
}

/**
 * Find the current user's name from the header
 */
export function findKisiAdi(): string {
  const headerEl = document.querySelector(SELECTORS.USERNAME);

  if (headerEl?.textContent) {
    return sanitizeName(headerEl.textContent.trim());
  }

  // Fallback: HTML search
  const adElement = document.getElementById('ad');
  if (adElement?.textContent) {
    return sanitizeName(adElement.textContent.trim());
  }

  return 'Bilinmeyen';
}

/**
 * Get dosya bilgileri from DOM (not from global object!)
 * CRITICAL: No window.dosya_bilgileri access - fully DOM-based
 */
export function getDosyaBilgileri(): DosyaBilgileri | null {
  const dosyaId = findDosyaId();

  if (!dosyaId) {
    console.error('dosyaId not found in page');
    return null;
  }

  // Extract dosyaNo from page if available
  const dosyaNoMatch = document.body.innerHTML.match(/Dosya\s+No\s*:?\s*([^\s<]+)/i);
  const dosyaNo = dosyaNoMatch?.[1] || '';

  return {
    dosyaId,
    dosyaNo,
    yargiTuru: getYargiTuru()
  };
}

/**
 * Parse tooltip content to extract metadata
 * UYAP stores evrak metadata in data-original-title attribute
 * Format: HTML with <br> separators, e.g.:
 *   "Birim Evrak No: 12345<br>Onay Tarihi: 15.01.2024<br>..."
 * Also handles plain newlines (\n) as fallback
 */
function parseTooltip(tooltip: string | null): Record<string, string> {
  const result: Record<string, string> = {};

  if (!tooltip) {
    return result;
  }

  // Split by <br>, <br/>, <br /> tags AND newlines
  const lines = tooltip.split(/<br\s*\/?>|\n/gi);

  for (const line of lines) {
    // Strip any remaining HTML tags from the line
    const clean = line.replace(/<[^>]*>/g, '').trim();

    const colonIndex = clean.indexOf(':');

    if (colonIndex === -1) {
      continue;
    }

    const key = clean.substring(0, colonIndex).trim();
    const value = clean.substring(colonIndex + 1).trim();

    if (key && value) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Scan the UYAP filetree and extract evrak items
 * CRITICAL: Uses Set for deduplication (352 spans → 206 unique evrak_id)
 * CRITICAL: Skips "Son 20 Evrak" folder to avoid duplicates
 * CRITICAL: Only reads DOM, never modifies (jQuery events are attached!)
 */
export function scanFiletree(): EvrakItem[] {
  const filetree = document.querySelector<HTMLUListElement>(
    SELECTORS.FILETREE
  );

  if (!filetree) {
    console.warn('Filetree not found');
    return [];
  }

  const seen = new Set<string>(); // Deduplikasyon
  const evraklar: EvrakItem[] = [];

  function parseNode(ul: HTMLUListElement, currentPath: string) {
    // Use :scope to get only direct children
    const items = ul.querySelectorAll<HTMLLIElement>(':scope > li');

    items.forEach(li => {
      // Get the span element (either folder or file)
      const span = li.querySelector<HTMLSpanElement>(':scope > span');
      const childUl = li.querySelector<HTMLUListElement>(':scope > ul');

      if (!span) {
        return;
      }

      const name = span.textContent?.trim() || '';
      const isFolder = span.classList.contains('folder');

      if (isFolder) {
        // Skip duplicate folders like "Son 20 Evrak"
        if (SKIP_FOLDERS.some(skip => name.includes(skip))) {
          return;
        }

        // Recursively parse folder contents
        const newPath = currentPath ? `${currentPath}/${name}` : name;

        if (childUl) {
          parseNode(childUl, newPath);
        }
      } else {
        // File item - extract evrak_id
        const evrakId = span.getAttribute('evrak_id');

        if (!evrakId) {
          return;
        }

        // CRITICAL: Deduplicate using Set
        // UYAP has 352 spans but only 206 unique evrak_id
        if (seen.has(evrakId)) {
          return;
        }

        seen.add(evrakId);

        // Parse metadata from tooltip
        const tooltip = span.getAttribute('data-original-title');
        const metadata = parseTooltip(tooltip);

        evraklar.push({
          evrakId,
          name,
          relativePath: currentPath,
          evrakTuru: metadata['Evrak Türü'],
          evrakTarihi: metadata['Evrak Tarihi']
        });
      }
    });
  }

  // Start parsing from root
  parseNode(filetree, '');

  console.log(`Scanner: Found ${evraklar.length} unique evraklar`);

  return evraklar;
}

/**
 * Detect if the UYAP filetree has pagination
 * UYAP shows "Toplam X sayfadan Y. sayfa" when there are multiple pages
 * This means not all evraklar are visible in the current DOM
 */
export function detectPagination(): PaginationInfo | null {
  const resultContainer = document.querySelector(SELECTORS.EVRAK_RESULT);
  if (!resultContainer) return null;

  // Look for pagination text: "Toplam X sayfadan Y. sayfa"
  const text = resultContainer.textContent || '';
  const match = text.match(/Toplam\s+(\d+)\s+sayfadan\s+(\d+)\.\s*sayfa/i);

  if (!match) return null;

  const totalPages = parseInt(match[1], 10);
  const currentPage = parseInt(match[2], 10);

  return {
    currentPage,
    totalPages,
    hasMultiplePages: totalPages > 1
  };
}

/**
 * Wait for filetree to load in the DOM
 * @param timeout - Maximum time to wait in milliseconds (default: 30000ms = 30s)
 * @returns Promise that resolves with the filetree element
 */
export function waitForFiletree(timeout = 30000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const filetree = document.querySelector(SELECTORS.FILETREE);

      if (filetree) {
        // Filetree found, but check if it has content
        const hasContent = filetree.querySelector('li');
        if (hasContent) {
          console.log('Filetree loaded with content');
          resolve(filetree);
          return;
        } else {
          console.log('Filetree found but empty, waiting for content...');
        }
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        reject(new Error('Filetree load timeout'));
        return;
      }

      // Check again after 500ms
      setTimeout(check, 500);
    };

    check();
  });
}
