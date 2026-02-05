# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
npm run dev      # Start Vite dev server with HMR (loads as unpacked extension from dist/)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```

**Loading in Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select `dist/` folder.

No test runner or linter is configured.

## Architecture

Chrome Extension (Manifest V3) for bulk-downloading court case documents from UYAP Citizen Portal (`*.uyap.gov.tr`).

**Tech stack:** Preact 10 + Preact Signals + TypeScript 5 + Vite 5 + Tailwind CSS 3 + @crxjs/vite-plugin

### Three execution contexts

1. **Content Script** (`src/content/`) — Injected into UYAP pages. Uses MutationObserver to detect the file modal, scans DOM for evrak metadata, renders a Preact FAB+Modal UI, orchestrates downloads via promise-based tracking.

2. **Background Service Worker** (`src/background/`) — Intercepts Chrome downloads via `chrome.downloads.onCreated`, matches them to queued metadata (FIFO), validates files with magic byte detection, moves files to user-selected directory via File System Access API, stores `FileSystemDirectoryHandle` in IndexedDB.

3. **Popup** (`src/popup/`) — Folder picker (File System Access API) and extension settings.

### Download flow

Content `fetch()`es the UYAP download URL directly (same-origin, `credentials: 'include'`) → Checks `Content-Type` header + magic bytes for session expiry (HTML = expired) → Converts `ArrayBuffer` to base64 → Sends `WRITE_FILE` message to background → Background loads `FileSystemDirectoryHandle` from IndexedDB → Creates folder structure → Writes file via File System Access API.

This approach avoids `file:///` protocol access which is blocked in MV3 service workers.

### State management

All reactive state lives in `src/store/signals.ts` using Preact Signals. Computed signals derive grouped/filtered views. Helper functions (toggleEvrakSecimi, tumunuSec, etc.) mutate signals directly.

### Path aliases

`@/*` → `src/*`, plus `@store/*`, `@lib/*`, `@hooks/*`, `@components/*`, `@content/*`, `@popup/*`, `@background/*`

## UYAP-Specific Constraints (Critical)

- **DO NOT modify UYAP DOM elements** — jQuery events are bound to `span.file` nodes. Only read `getAttribute('evrak_id')` and `textContent`.
- **Session expiry returns HTTP 200 + HTML**, not 401/403. Detect via magic bytes: check first 500 bytes for `<!DOCTYPE` / `<html>`.
- **WAF protection** — minimum 300ms delay between download requests (configurable 300–2000ms).
- **Deduplication** — DOM contains ~352 spans but only ~206 unique evrak_ids. Deduplicate with Set. Skip "Son 20 Evrak" folder.
- **yargiTuru fallback chain:** `window.dosya_bilgileri.yargiTuru` → `#yargiTuru` select element → default `'1'`.

## Magic byte signatures

| Format   | Bytes (hex)       | ASCII    |
|----------|-------------------|----------|
| PDF      | `25 50 44 46`     | `%PDF`   |
| UDF/ZIP  | `50 4B 03 04`     | `PK..`   |
| TIFF LE  | `49 49 2A 00`     | `II*.`   |
| TIFF BE  | `4D 4D 00 2A`     | `MM.*`   |

## Tailwind CSS

Custom prefix `uyap-` is configured to avoid class name collisions with UYAP's existing styles. All utility classes must use this prefix (e.g., `uyap-flex`, `uyap-bg-blue-500`).

## Messaging pattern

All cross-context communication uses `chrome.runtime.sendMessage` (content→background) and `chrome.tabs.sendMessage(tabId, ...)` (background→content). Message listeners return `true` to keep the channel open for async responses.

## File System Access API

`FileSystemDirectoryHandle` is persisted in IndexedDB (not `chrome.storage`, which can't serialize handles). Permission must be re-verified on each use via `queryPermission()` → `requestPermission()`.

## Windows path note

Project path contains a space (`uyap-evrak-yonetici v2`). For Bash commands, quote paths with forward slashes. The Edit tool works with backslash paths.
