# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
npm run dev      # Start Vite dev server with HMR (loads as unpacked extension from dist/)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```

**Loading in Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select `dist/` folder.

No test runner, linter, or CI is configured.

## Architecture

Chrome Extension (Manifest V3) for bulk-downloading court case documents from UYAP Citizen Portal (`*.uyap.gov.tr`).

**Tech stack:** Preact 10 + Preact Signals + TypeScript 5 + Vite 5 + Tailwind CSS 3 + @crxjs/vite-plugin

### Three execution contexts

1. **Content Script** (`src/content/`) — Injected into all UYAP frames (`all_frames: true`). FAB renders immediately on page load. MutationObserver watches for UYAP modal visibility (checks visibility, not just DOM existence — modal shell always exists). On modal open: waits for filetree DOM (30s timeout), then scans evraklar. **CRITICAL:** Does NOT use `window.dosya_bilgileri` — fully DOM-based approach extracts `dosyaId` via HTML regex and jQuery event parsing. Downloads use direct `fetch()` with retry (max 2, exponential backoff 1s/2s).

2. **Background Service Worker** (`src/background/`) — Receives base64 file data via `WRITE_FILE` message, writes files to user-selected directory via File System Access API, stores `FileSystemDirectoryHandle` in IndexedDB. Also handles `GET_DIRECTORY_HANDLE`, `SET_DIRECTORY_HANDLE`, `GET_SETTINGS`, `SET_SETTINGS` messages.

3. **Popup** (`src/popup/`) — Folder picker (File System Access API) and settings management (downloadDelay, autoRetry, keepFolderStructure). Uses `chrome.storage.local` for settings, IndexedDB (via background) for directory handle.

**No direct communication between popup and content** — both use background as mediator.

### Download flow

Content `fetch()`es the UYAP download URL directly (same-origin, `credentials: 'include'`) → Checks `Content-Type` header + magic bytes for session expiry (HTML = expired) → Converts `ArrayBuffer` to base64 → Sends `WRITE_FILE` message to background → Background loads `FileSystemDirectoryHandle` from IndexedDB → Creates folder structure → Writes file via File System Access API.

This approach avoids `file:///` protocol access which is blocked in MV3 service workers.

**Retry does NOT fire on:** session expiry, user cancellation (`AbortError`), or success. Respects `ayarlar.value.autoRetry` setting.

### State management

All reactive state lives in `src/store/signals.ts` using Preact Signals. Key signals: `evraklar`, `seciliEvrakIds`, `indirmeDurumu`, `dosyaBilgileri`, `ayarlar`, `sessionExpired`, `paginationInfo`, `kisiAdi`, `mevcutExport`. Computed signals derive grouped/filtered views (`grupluEvraklar`, `deltaInfo`, `seciliEvrakSayisi`, `indirmeYuzdesi`). Helper functions (toggleEvrakSecimi, tumunuSec, klasorEvraklariniSec, etc.) mutate signals directly.

### Delta sync

`src/lib/export-io.ts` manages a JSON manifest (`uyap-export.json`) in the output directory. On scan, `compareWithExisting()` identifies new vs previously downloaded evraklar. After each download, `addDownloadedEvrak()` appends to the manifest. This enables incremental downloads across sessions.

### Manifest

Defined programmatically in `src/manifest.ts` using `defineManifest()` from `@crxjs/vite-plugin` (not a static JSON file). Permissions: `downloads`, `storage`, `tabs`. Host permissions: `https://*.uyap.gov.tr/*`.

### Path aliases

```typescript
// Barrel exports (direct import)
import { ayarlar, evraklar } from '@store';
import { SELECTORS, sendToBackground } from '@lib';
import { useToast } from '@hooks';

// Explicit paths
import { scanFiletree } from '@content/scanner';
import { Button, Modal, Fab } from '@components/ui';
import { EvrakCard } from '@components/evrak';
```

Aliases: `@/*` → `src/*`, `@store`, `@lib`, `@hooks` (barrel exports), `@components/*`, `@content/*`, `@popup/*`, `@background/*`

## Key modules

| Module | Purpose |
|--------|---------|
| `src/lib/constants.ts` | DOM selectors, UYAP endpoints, magic bytes, retry/IndexedDB config |
| `src/lib/messages.ts` | Chrome messaging wrappers: `sendToBackground()`, `sendToContent()`, `sendToTab()`, `onMessage()` |
| `src/lib/filename.ts` | `sanitizeName()`, `formatFileName()`, `joinPath()` |
| `src/lib/export-io.ts` | Delta sync manifest operations |
| `src/content/scanner.ts` | `scanFiletree()`, `detectPagination()`, `getDosyaBilgileri()` |
| `src/content/downloader.ts` | Downloader class with retry, pause/resume via `AbortController` |
| `src/background/file-writer.ts` | File System Access API write operations |
| `src/background/idb-storage.ts` | `FileSystemDirectoryHandle` persistence |
| `src/types/index.ts` | All interfaces and `MessageType` union type |
| `src/content/index.tsx` | Content script entry: renders App, sets up MutationObserver for modal |
| `src/content/ui/App.tsx` | Content Preact root: FAB + Modal + Sidebar composition |
| `src/background/message-router.ts` | Background message handler: routes all incoming messages by type |

## UYAP-Specific Constraints (Critical)

- **DO NOT modify UYAP DOM elements** — jQuery events are bound to `span.file` nodes. Only read `getAttribute('evrak_id')` and `textContent`.
- **Session expiry returns HTTP 200 + HTML**, not 401/403. Detect via magic bytes: check first 500 bytes for `<!DOCTYPE` / `<html>`.
- **WAF protection** — minimum 300ms delay between download requests (configurable 300–2000ms).
- **Deduplication** — DOM contains ~352 spans but only ~206 unique evrak_ids. Deduplicate with Set. Skip folders in `SKIP_FOLDERS` constant.
- **yargiTuru fallback chain:** jQuery event handler parsing (extracts from `downloadDoc()` call) → `#yargiTuru` select element → default `'1'`. **No `window.dosya_bilgileri` access** — fully DOM-based.
- **Pagination** — Large cases may have multiple filetree pages. `detectPagination()` warns via `paginationInfo` signal.
- **UYAP uses iframes** — Content script must run with `all_frames: true`.
- **Modal shell always exists** — Check `isModalVisible()` (display/visibility), not just DOM presence.

## Styling

**Tailwind CSS:** Custom prefix `uyap-` required for all utility classes (e.g., `uyap-flex`, `uyap-bg-blue-500`). `preflight: false` prevents CSS reset from overriding UYAP styles.

**z-index stacking:** FAB: `10106` (above UYAP's 10000–10105), Modal overlay: `10107`. FAB position: `right: 20px`, `bottom: 270px`.

**CSS files:** `src/styles/sidebar.css` (content script UI), `src/styles/popup.css` (popup page). Content script imports `sidebar.css` in `src/content/index.tsx`.

## Messaging

Content→Background: `chrome.runtime.sendMessage`. Background→Content: `chrome.tabs.sendMessage(tabId, ...)`. Listeners return `true` for async responses. Message types: `MessageType` union type in `src/types/index.ts`.

## File System Access API

`FileSystemDirectoryHandle` persisted in IndexedDB (`uyap-extension-db/handles/directory-handle`) — `chrome.storage` cannot serialize handles. Permission re-verified on each use via `queryPermission()` → `requestPermission()`.

## Dil Kuralları

- **Yazışma dili:** Türkçe. Kullanıcıyla tüm iletişim Türkçe yapılır.
- **Raporlar ve açıklamalar:** Türkçe yazılır.
- **Kod yorumları (comments):** İngilizce veya Türkçe (mevcut dosyadaki dile uyulur).
- **Commit mesajları:** Türkçe veya İngilizce (conventional commits formatında).
- **Değişken/fonksiyon isimleri:** Koddaki mevcut isimlendirme kurallarına uyulur (Türkçe isimler: `evraklar`, `seciliEvrakIds`, `indirmeDurumu` vb.).

## Development Environment

**OS:** Windows 10 Pro
- Terminal komutları PowerShell syntax ile yazılır
- Unix komutları (ls, cat, grep, rm) yerine Windows karşılıkları kullanılır:
  - `ls` → `dir` veya `Get-ChildItem`
  - `cat` → `type` veya `Get-Content`
  - `grep` → `findstr` veya `Select-String`
  - `rm` → `del` veya `Remove-Item`
  - `mkdir -p` → `mkdir` (PowerShell otomatik parent oluşturur) veya `New-Item -ItemType Directory -Force`
  - `touch` → `New-Item -ItemType File`
- Yol ayırıcı: backslash (`\`) veya forward slash (`/`)

## Project File Organization

**Non-project files must be placed in `.claude/` directory.** This includes:
- Test environments and scripts
- Reports and analysis files
- Documentation files (`.md`)
- Project maps and diagrams
- Temporary/experimental code

Only production code belongs in `src/`. The `.claude/` directory is gitignored and local to each developer.

**No inline/internal CSS/JS:** Always use external CSS and JS files. Inline `<style>` and `<script>` blocks are prohibited unless absolutely necessary (e.g., critical render path optimization).
