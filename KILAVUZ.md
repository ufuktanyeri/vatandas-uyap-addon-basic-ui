# UYAP Dosya İndirici v2 - Proje Kılavuzu

> Bu dosya projedeki tüm özelliklerin, metotların, arayüzlerin ve bileşenlerin kapsamlı bir dokümantasyonudur.
> Son güncelleme: 2026-02-05

---

## 1. Proje Mimarisi

```
Chrome Extension (Manifest V3)
├── Background (Service Worker)    - Mesaj yönlendirme, indirme yakalama, dosya işleme
├── Content Script                 - UYAP DOM tarama, indirme tetikleme, UI render
├── Popup                          - Klasör seçimi, ayarlar yönetimi
└── Shared                         - Tipler, sabitler, sinyaller, yardımcı fonksiyonlar
```

**Teknoloji:** Preact + TypeScript + Vite + Tailwind CSS (prefix: `uyap-`) + @crxjs/vite-plugin

**İzinler:** `downloads`, `storage`, `tabs` | Host: `https://*.uyap.gov.tr/*`

---

## 2. Dosya Haritası ve Özellik Durumu

| Dosya | Rol | Durum |
|-------|-----|-------|
| `src/shared/types.ts` | Tip tanımları | AKTİF |
| `src/shared/constants.ts` | Sabitler | AKTİF (1 kullanılmayan sabit) |
| `src/shared/signals.ts` | Reaktif state yönetimi | AKTİF (1 sinyal bağlı değil) |
| `src/shared/messages.ts` | IPC mesajlaşma | AKTİF |
| `src/shared/filename.ts` | Dosya adı sanitizasyonu | KISMİ (3 fonksiyon kullanılmıyor) |
| `src/shared/export-io.ts` | Delta sync export/import | BEKLEMEDE (hiçbir fonksiyon akışa bağlı değil) |
| `src/shared/filesystem.d.ts` | FS Access API tip bildirimleri | AKTİF |
| `src/background/service-worker.ts` | Extension giriş noktası | AKTİF |
| `src/background/message-router.ts` | Mesaj yönlendirme | AKTİF |
| `src/background/download-interceptor.ts` | İndirme yakalama ve işleme | AKTİF |
| `src/background/idb-storage.ts` | IndexedDB işlemleri | AKTİF (1 fonksiyon kullanılmıyor) |
| `src/content/index.tsx` | Content script giriş noktası | AKTİF |
| `src/content/scanner.ts` | UYAP DOM tarayıcı | AKTİF |
| `src/content/downloader.ts` | İndirme orkestratörü | AKTİF |
| `src/content/ui/App.tsx` | Kök bileşen | AKTİF |
| `src/content/ui/Sidebar.tsx` | Ana sidebar UI | AKTİF |
| `src/content/ui/EvrakList.tsx` | Evrak listesi | AKTİF |
| `src/content/ui/EvrakGroup.tsx` | Klasör grubu | AKTİF |
| `src/content/ui/ProgressBar.tsx` | İlerleme çubuğu | AKTİF |
| `src/content/ui/SessionAlert.tsx` | Oturum uyarısı | AKTİF |
| `src/popup/Popup.tsx` | Popup ana bileşeni | AKTİF |
| `src/manifest.ts` | Manifest V3 tanımı | AKTİF |

---

## 3. Arayüzler (Interfaces) - `src/shared/types.ts`

### EvrakItem
UYAP dosya ağacından taranan tekil evrak bilgisi.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `evrakId` | `string` | Evet | UYAP evrak kimlik numarası |
| `name` | `string` | Evet | Evrak adı (DOM span içeriği) |
| `relativePath` | `string` | Evet | Klasör yolu ("Dilekçeler/Dava Dilekçesi") |
| `evrakTuru` | `string` | Hayır | Tooltip'ten alınan evrak türü |
| `evrakTarihi` | `string` | Hayır | Tooltip'ten alınan evrak tarihi |

### DosyaBilgileri
UYAP global nesnesinden (`window.dosya_bilgileri`) alınan dava dosyası bilgileri.

| Alan | Tip | Açıklama |
|------|-----|----------|
| `dosyaId` | `string` | Dosya kimlik numarası |
| `dosyaNo` | `string` | Dosya esas numarası ("2024/1234") |
| `birimId` | `string` | Birim kimlik numarası |
| `birimAdi` | `string` | Birim adı |
| `dosyaTurKod` | `string` | Dosya tür kodu |
| `yargiTuru` | `string` | Yargı türü (boş olabilir, fallback zinciri var) |
| `dosyaDurumu` | `string` | Dosya durumu |

### DownloadStartPayload
Content script'ten background'a gönderilen indirme başlangıç mesajı.

| Alan | Tip | Açıklama |
|------|-----|----------|
| `evrakId` | `string` | İndirilecek evrakın ID'si |
| `evrakName` | `string` | Evrak adı (dosya adı oluşturmak için) |
| `relativePath` | `string` | Hedef klasör yolu |

### DownloadProgressPayload
Background'dan content script'e gönderilen indirme ilerleme/sonuç mesajı.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `evrakId` | `string` | Evet | Evrak ID'si |
| `status` | `DownloadStatus` | Evet | İndirme durumu |
| `fileName` | `string` | Hayır | Kaydedilen dosya adı |
| `mimeType` | `string` | Hayır | Tespit edilen MIME tipi |
| `fileSize` | `number` | Hayır | Dosya boyutu (byte) |
| `error` | `string` | Hayır | Hata mesajı |

### DownloadState
Genel indirme durumu (sidebar progress bar için).

| Alan | Tip | Açıklama |
|------|-----|----------|
| `status` | `'idle' \| 'downloading' \| 'paused' \| 'completed' \| 'error'` | Mevcut durum |
| `currentIndex` | `number?` | Sıradaki evrak indeksi |
| `totalCount` | `number?` | Toplam evrak sayısı |
| `completedCount` | `number?` | Başarılı indirme sayısı |
| `failedCount` | `number?` | Başarısız indirme sayısı |
| `error` | `string?` | Genel hata mesajı |

### Settings
Kullanıcı ayarları.

| Alan | Tip | Varsayılan | Kullanım Durumu |
|------|-----|-----------|-----------------|
| `downloadDelay` | `number` | `300` (ms) | AKTİF - WAF korumasında kullanılıyor |
| `autoRetry` | `boolean` | `true` | UI VAR, MANTIK YOK |
| `keepFolderStructure` | `boolean` | `true` | UI VAR, MANTIK YOK |
| `selectedDirectory` | `string?` | - | KULLANILMIYOR |

### ExportData
Delta sync manifest dosyası yapısı.

| Alan | Tip | Açıklama | Kullanım Durumu |
|------|-----|----------|-----------------|
| `schemaVersion` | `'1.0'` | Şema versiyonu | BEKLEMEDE |
| `exportedAt` | `string` | ISO tarih | BEKLEMEDE |
| `exportedBy` | `string` | Kullanıcı adı | BEKLEMEDE |
| `dosya` | `DosyaBilgileri` | Dosya bilgileri | BEKLEMEDE |
| `stats` | `{totalEvrak, downloadedEvrak, failedEvrak}` | İstatistikler | BEKLEMEDE |
| `evraklar` | `Array<...>` | İndirilen evrak listesi | BEKLEMEDE |

### Message
Extension içi mesajlaşma yapısı.

| Alan | Tip | Açıklama |
|------|-----|----------|
| `type` | `MessageType` | Mesaj tipi |
| `payload` | `T` (generic) | Mesaj içeriği |

### DownloadStatus (Type)
```typescript
'pending' | 'downloading' | 'completed' | 'failed' | 'session_expired'
```

### MessageType (Type)
```typescript
'SCAN_COMPLETE' | 'DOWNLOAD_START' | 'DOWNLOAD_PROGRESS' | 'DOWNLOAD_COMPLETE' |
'DOWNLOAD_PAUSE' | 'DOWNLOAD_RESUME' | 'DOWNLOAD_CANCEL' | 'SESSION_EXPIRED' |
'GET_DIRECTORY_HANDLE' | 'SET_DIRECTORY_HANDLE' | 'GET_SETTINGS' | 'SET_SETTINGS'
```

**Aktif kullanılanlar:** `DOWNLOAD_START`, `DOWNLOAD_PROGRESS`, `DOWNLOAD_CANCEL`, `SESSION_EXPIRED`, `GET/SET_DIRECTORY_HANDLE`, `GET/SET_SETTINGS`

**Kullanılmayanlar:** `SCAN_COMPLETE`, `DOWNLOAD_COMPLETE`, `DOWNLOAD_PAUSE`, `DOWNLOAD_RESUME`

---

## 4. Sabitler - `src/shared/constants.ts`

### UYAP Endpoint'leri
| Sabit | Değer | Durum |
|-------|-------|-------|
| `UYAP_BASE_URL` | `'https://vatandas.uyap.gov.tr'` | KULLANILMIYOR |
| `DOWNLOAD_ENDPOINT` | `'download_document_brd.uyap'` | KULLANILMIYOR |

### Magic Bytes (Dosya Tipi Tespiti)
| Sabit | Byte Dizisi | Dosya Tipi |
|-------|-------------|-----------|
| `MAGIC_BYTES.PDF` | `[0x25, 0x50, 0x44, 0x46]` (%PDF) | PDF |
| `MAGIC_BYTES.ZIP` | `[0x50, 0x4B, 0x03, 0x04]` (PK..) | UDF/ZIP |
| `MAGIC_BYTES.TIFF_LE` | `[0x49, 0x49, 0x2A, 0x00]` (II*.) | TIFF Little Endian |
| `MAGIC_BYTES.TIFF_BE` | `[0x4D, 0x4D, 0x00, 0x2A]` (MM.*) | TIFF Big Endian |

### MIME Tipleri ve Uzantılar
| Tip | MIME | Uzantı |
|-----|------|--------|
| PDF | `application/pdf` | `.pdf` |
| UDF | `application/zip` | `.udf` |
| TIFF | `image/tiff` | `.tiff` |
| HTML | `text/html` | `.html` |
| UNKNOWN | `application/octet-stream` | (boş) |

### DOM Seçicileri
| Sabit | Değer | Kullanım |
|-------|-------|----------|
| `SELECTORS.FILETREE` | `'#browser.filetree'` | Evrak ağacı kökü |
| `SELECTORS.MODAL` | `'#dosya_goruntule_modal'` | UYAP dosya modalı |
| `SELECTORS.YARGI_TURU_SELECT` | `'#yargiTuru'` | Yargı türü seçim kutusu |
| `SELECTORS.USERNAME` | `'.username.username-hide-on-mobile'` | Kullanıcı adı |
| `SELECTORS.FILE_SPAN` | `'span.file'` | Dosya span'ı |
| `SELECTORS.FOLDER_SPAN` | `'span.folder'` | Klasör span'ı |

### Diğer Sabitler
| Sabit | Değer | Açıklama |
|-------|-------|----------|
| `SKIP_FOLDERS` | `['Son 20 Evrak', 'Son20']` | Taramada atlanan klasörler |
| `DEFAULT_SETTINGS` | `{downloadDelay: 300, autoRetry: true, keepFolderStructure: true}` | Varsayılan ayarlar |
| `DEFAULT_YARGI_TURU` | `'1'` | Hukuk yargı türü |
| `IDB_CONFIG` | `{DB_NAME, STORE_NAME, VERSION}` | IndexedDB yapılandırması |
| `STORAGE_KEYS` | `{SETTINGS, DIRECTORY_HANDLE, LAST_EXPORT}` | Depolama anahtarları |
| `EXPORT_FILE_NAME` | `'uyap-export.json'` | Export manifest dosya adı |

---

## 5. Sinyaller (Signals) - `src/shared/signals.ts`

### Temel Sinyaller

| Sinyal | Tip | Varsayılan | Açıklama | Durum |
|--------|-----|-----------|----------|-------|
| `evraklar` | `EvrakItem[]` | `[]` | Taranan evrak listesi | AKTİF |
| `seciliEvrakIds` | `Set<string>` | `new Set()` | Seçili evrak ID'leri | AKTİF |
| `indirmeDurumu` | `DownloadState` | `{status:'idle'}` | İndirme durumu | AKTİF |
| `dosyaBilgileri` | `DosyaBilgileri \| null` | `null` | Dosya bilgileri | AKTİF |
| `ayarlar` | `Settings` | `DEFAULT_SETTINGS` | Kullanıcı ayarları | AKTİF (popup'ta yerel state) |
| `mevcutExport` | `ExportData \| null` | `null` | Mevcut export verisi | BEKLEMEDE |
| `sidebarVisible` | `boolean` | `false` | Sidebar görünürlüğü | AKTİF |
| `sessionExpired` | `boolean` | `false` | Oturum durumu | AKTİF |
| `kisiAdi` | `string` | `''` | Kullanıcı adı | AKTİF (export için hazır) |

### Hesaplanan Sinyaller (Computed)

| Sinyal | Dönüş Tipi | Bağımlılık | Açıklama | Durum |
|--------|-----------|------------|----------|-------|
| `grupluEvraklar` | `Map<string, EvrakItem[]>` | `evraklar` | Klasöre göre gruplu evraklar | AKTİF |
| `deltaInfo` | `{toplam, yeni, mevcut}` | `evraklar`, `mevcutExport` | Yeni/mevcut evrak ayrımı | KISMİ (mevcutExport boş) |
| `seciliEvrakSayisi` | `number` | `seciliEvrakIds` | Seçili evrak sayısı | AKTİF |
| `indirmeYuzdesi` | `number` | `indirmeDurumu` | İndirme yüzde ilerlemesi | AKTİF |

### Yardımcı Fonksiyonlar

| Fonksiyon | Parametre | Açıklama | Durum |
|-----------|-----------|----------|-------|
| `toggleEvrakSecimi(evrakId)` | `string` | Tekil evrak seçimi aç/kapa | AKTİF |
| `tumunuSec()` | - | Tüm evrakları seç | AKTİF |
| `secimiTemizle()` | - | Tüm seçimi kaldır | AKTİF |
| `klasorEvraklariniSec(klasorAdi)` | `string` | Klasördeki tüm evrakları seç | AKTİF |
| `klasorEvraklariniKaldir(klasorAdi)` | `string` | Klasördeki tüm evrakların seçimini kaldır | AKTİF |
| `updateDownloadProgress(completed, failed)` | `number, number` | İndirme ilerlemesini güncelle | AKTİF |
| `resetDownloadState()` | - | İndirme durumunu sıfırla, seçimi temizle | AKTİF |

---

## 6. Mesajlaşma Sistemi - `src/shared/messages.ts`

### Fonksiyonlar

| Fonksiyon | Yönü | Parametre | Dönüş | Durum |
|-----------|------|-----------|-------|-------|
| `sendToBackground(type, payload?)` | Content/Popup -> Background | `MessageType, any` | `Promise<T>` | AKTİF |
| `sendToContent(type, payload?)` | Background -> Aktif Tab | `MessageType, any` | `Promise<T>` | KULLANILMIYOR |
| `sendToTab(tabId, type, payload?)` | Background -> Belirli Tab | `number, MessageType, any` | `void` | AKTİF |
| `onMessage(callback)` | Dinleyici kurulumu | `(Message, Sender) => void` | - | AKTİF |

### Mesaj Akışı

```
Content Script                    Background                      Popup
     |                                |                              |
     |-- DOWNLOAD_START ------------->|                              |
     |   (evrakId, evrakName, path)   |                              |
     |                                |-- [Chrome download match] -->|
     |                                |-- [Magic bytes check] ------>|
     |<-- DOWNLOAD_PROGRESS ----------|                              |
     |   (evrakId, status, file info) |                              |
     |                                |                              |
     |-- DOWNLOAD_CANCEL ------------>|                              |
     |                                |                              |
     |<-- SESSION_EXPIRED ------------|                              |
     |                                |                              |
     |                                |<-- GET_DIRECTORY_HANDLE -----|
     |                                |--- {handle, hasPermission}-->|
     |                                |                              |
     |                                |<-- SET_DIRECTORY_HANDLE -----|
     |                                |--- {success} -------------->|
     |                                |                              |
     |                                |<-- GET_SETTINGS -------------|
     |                                |--- Settings --------------->|
     |                                |                              |
     |                                |<-- SET_SETTINGS -------------|
     |                                |--- {success} -------------->|
```

---

## 7. Background Script

### service-worker.ts
Extension giriş noktası. Başlatma işlemleri:

| İşlem | Fonksiyon | Açıklama |
|-------|-----------|----------|
| Mesaj yönlendirici | `initMessageRouter()` | Tüm mesajları dinler ve dağıtır |
| İndirme yakalayıcı | `initDownloadInterceptor()` | Chrome download olaylarını yakalar |
| Kurulum dinleyici | `chrome.runtime.onInstalled` | install/update log'u |

### message-router.ts
Gelen mesajları ilgili handler'lara yönlendirir.

| Fonksiyon | Mesaj Tipi | Açıklama | Durum |
|-----------|-----------|----------|-------|
| `handleGetDirectoryHandle()` | `GET_DIRECTORY_HANDLE` | IDB'den handle yükle, izin doğrula | AKTİF |
| `handleSetDirectoryHandle(handle)` | `SET_DIRECTORY_HANDLE` | IDB'ye handle kaydet | AKTİF |
| `handleGetSettings()` | `GET_SETTINGS` | chrome.storage'dan ayar oku | AKTİF |
| `handleSetSettings(settings)` | `SET_SETTINGS` | chrome.storage'a ayar yaz | AKTİF |
| `handleDownloadStart(payload, sender)` | `DOWNLOAD_START` | Metadata'yı FIFO kuyruğuna ekle | AKTİF |
| `handleDownloadCancel()` | `DOWNLOAD_CANCEL` | Tüm bekleyen indirmeleri iptal et | AKTİF |

### download-interceptor.ts
Chrome download olaylarını yakalar, dosya tipini tespit eder, hedef klasöre kaydeder.

#### Dahili Fonksiyonlar

| Fonksiyon | Parametre | Açıklama | Durum |
|-----------|-----------|----------|-------|
| `matchBytes(header, magic)` | `Uint8Array, number[]` | Byte dizisi eşleştirme | AKTİF |
| `mimeToFileInfo(mime)` | `string` | MIME tipinden dosya bilgisi | AKTİF |
| `detectFileType(filepath, fallbackMime?)` | `string, string?` | Magic bytes + MIME fallback | AKTİF |
| `moveToTargetFolder(path, fileName, relativePath)` | `string, string, string` | File System Access API ile dosya taşıma | AKTİF |
| `processDownload(downloadId, downloadPath)` | `number, string` | İndirme sonrası dosya işleme | AKTİF |
| `matchPendingDownload(downloadId)` | `number` | FIFO kuyruğundan metadata eşleştirme | AKTİF |
| `getActiveDownload(downloadId)` | `number` | Aktif indirme metadata'sını al ve sil | AKTİF |

#### Dışarı Aktarılan (Exported) Fonksiyonlar

| Fonksiyon | Parametre | Açıklama | Çağıran |
|-----------|-----------|----------|---------|
| `queueDownloadMetadata(metadata)` | `{evrakId, evrakName, relativePath, tabId}` | FIFO kuyruğuna metadata ekle | `message-router.ts` |
| `cancelAllDownloads()` | - | Tüm kuyruk ve aktif indirmeleri temizle | `message-router.ts` |
| `initDownloadInterceptor()` | - | Download listener'ları kur | `service-worker.ts` |

#### Veri Yapıları

| Yapı | Tip | Açıklama |
|------|-----|----------|
| `pendingQueue` | `Array<{evrakId, evrakName, relativePath, tabId}>` | FIFO kuyruğu - DOWNLOAD_START ile dolduruluyor |
| `activeDownloads` | `Map<number, {...}>` | Download ID -> metadata eşleştirmesi |

#### İndirme İşleme Akışı

1. `chrome.downloads.onCreated` -> URL kontrolü (`uyap.gov.tr` + `download_document`)
2. `matchPendingDownload()` -> FIFO kuyruğundan metadata eşleştirme
3. `chrome.downloads.onChanged` -> Tamamlanma/hata dinleme
4. `processDownload()` -> Dosya tipi tespiti + hedef klasöre kaydetme
5. `chrome.tabs.sendMessage()` -> Content script'e sonuç bildirimi

#### Oturum Süresi Dolma Tespiti

UYAP oturum süresi dolduğunda HTTP 200 + HTML içerik döner (401/403 değil).
Tespit: Magic bytes ile HTML kontrolü -> `SESSION_EXPIRED` mesajı gönder.

### idb-storage.ts
FileSystemDirectoryHandle için IndexedDB sarmalayıcısı.

| Fonksiyon | Parametre | Dönüş | Durum |
|-----------|-----------|-------|-------|
| `openDB()` | - | `Promise<IDBDatabase>` | AKTİF (dahili) |
| `saveDirectoryHandle(handle)` | `FileSystemDirectoryHandle` | `Promise<void>` | AKTİF |
| `loadDirectoryHandle()` | - | `Promise<FileSystemDirectoryHandle \| null>` | AKTİF |
| `verifyDirectoryPermission(handle)` | `FileSystemDirectoryHandle` | `Promise<boolean>` | AKTİF |
| `clearStorage()` | - | `Promise<void>` | KULLANILMIYOR |

---

## 8. Content Script

### index.tsx
Content script giriş noktası. UYAP DOM'unu izler ve sidebar'ı yönetir.

| Fonksiyon | Açıklama | Durum |
|-----------|----------|-------|
| `initExtension()` | Filetree bekleme, tarama, dosya bilgisi, sidebar gösterme | AKTİF |
| `renderApp()` | Preact uygulamasını DOM'a render etme | AKTİF |
| `cleanupExtension()` | Tüm state'leri sıfırla, DOM'u temizle | AKTİF |
| `observeModal()` | MutationObserver ile modal açılma/kapanma tespiti (150ms debounce) | AKTİF |
| `setupMessageListener()` | `SESSION_EXPIRED` ve `DOWNLOAD_PROGRESS` mesajlarını dinle | AKTİF |

#### Mesaj İşleyicileri

| Mesaj | İşlem |
|-------|-------|
| `SESSION_EXPIRED` | `sessionExpired.value = true` |
| `DOWNLOAD_PROGRESS` | `resolveDownloadProgress()` + sinyal güncelleme |

### scanner.ts
UYAP dosya ağacı DOM tarayıcısı. **UYAP DOM'unu DEĞİŞTİRMEZ** (jQuery olayları bağlı).

| Fonksiyon | Parametre | Dönüş | Açıklama | Durum |
|-----------|-----------|-------|----------|-------|
| `getYargiTuru()` | - | `string` | 3 kademe fallback: global -> select -> varsayılan '1' | AKTİF |
| `findKisiAdi()` | - | `string` | Header veya global'den kullanıcı adı | AKTİF |
| `getDosyaBilgileri()` | - | `DosyaBilgileri \| null` | `window.dosya_bilgileri` nesnesini oku | AKTİF |
| `parseTooltip(tooltip)` | `string \| null` | `Record<string,string>` | `data-original-title` içeriğini parse et | AKTİF (dahili) |
| `scanFiletree()` | - | `EvrakItem[]` | Dosya ağacını tara, Set ile deduplikasyon | AKTİF |
| `waitForFiletree(timeout?)` | `number` (10000ms) | `Promise<HTMLUListElement>` | Filetree'nin DOM'a yüklenmesini bekle | AKTİF |

**Önemli Davranışlar:**
- 352 DOM span'ı, sadece 206 benzersiz evrak_id -> `Set` ile deduplikasyon
- `SKIP_FOLDERS` ile "Son 20 Evrak" klasörü atlanır
- `:scope > li` ile sadece doğrudan alt elemanlar taranır

### downloader.ts
Promise tabanlı indirme orkestratörü.

#### Dışarı Aktarılan Fonksiyon

| Fonksiyon | Parametre | Açıklama | Durum |
|-----------|-----------|----------|-------|
| `resolveDownloadProgress(payload)` | `DownloadProgressPayload` | Bekleyen indirme promise'ini çözer | AKTİF |

#### Downloader Sınıfı

| Metot | Erişim | Parametre | Dönüş | Açıklama |
|-------|--------|-----------|-------|----------|
| `constructor(onProgress, onSessionExpired)` | public | callback'ler | - | Geri çağırım fonksiyonlarını ayarla |
| `downloadAll(evraklar, dosya)` | public | `EvrakItem[], DosyaBilgileri` | `Promise<void>` | Tüm evrakları sıralı indir |
| `downloadSingleAndWait(evrak, dosya)` | private | `EvrakItem, DosyaBilgileri` | `Promise<DownloadProgressPayload>` | Tek evrak indir ve sonuç bekle |
| `triggerDownload(evrak, dosya)` | private | `EvrakItem, DosyaBilgileri` | `boolean` | UYAP `window.downloadDoc()` çağır |
| `pause()` | public | - | `void` | İndirmeyi duraklat |
| `resume()` | public | - | `void` | İndirmeye devam et |
| `cancel()` | public | - | `void` | İndirmeyi iptal et, background'a bildir |
| `getCurrentIndex()` | public | - | `number` | Mevcut indirme indeksi |
| `isPausedState()` | public | - | `boolean` | Duraklatıldı mı? |
| `isCancelled()` | public | - | `boolean` | İptal edildi mi? |
| `sleep(ms)` | private | `number` | `Promise<void>` | Bekleme yardımcısı |

**İndirme Akışı (downloadSingleAndWait):**
1. `sendToBackground('DOWNLOAD_START', metadata)` - Metadata'yı background'a gönder
2. `pendingResolvers.set(evrakId, resolve)` - Promise resolver'ı kaydet
3. `triggerDownload()` - UYAP `window.downloadDoc(evrakId, dosyaId, yargiTuru)` çağır
4. 30 saniye timeout ile sonuç bekle
5. Background `DOWNLOAD_PROGRESS` gönderdiğinde -> `resolveDownloadProgress()` promise'i çözer

**Önemli Davranışlar:**
- `DOWNLOAD_TIMEOUT`: 30 saniye
- WAF koruması: `ayarlar.value.downloadDelay` (min 300ms) bekleme
- Oturum dolma tespitinde indirme durur
- AbortController ile iptal mekanizması

---

## 9. UI Bileşenleri

### App.tsx
Kök bileşen. `sidebarVisible` sinyaline göre Sidebar'ı gösterir/gizler.

### Sidebar.tsx
Ana sidebar. Evrak seçimi, indirme kontrolü, bildirimler.

| Özellik | Açıklama |
|---------|----------|
| Tümünü Seç / Temizle | Evrak seçim işlemleri |
| İndir butonu | Seçili evrakları indir (`Downloader.downloadAll`) |
| Duraklat/Devam Et | `Downloader.pause()` / `Downloader.resume()` |
| İptal | `Downloader.cancel()` |
| Inline bildirimler | 3 saniye auto-dismiss (alert() yerine) |
| Oturum uyarısı | `SessionAlert` bileşeni |
| Evrak listesi | `EvrakList` bileşeni |
| İlerleme çubuğu | `ProgressBar` bileşeni |

### EvrakList.tsx
Evrakları klasör gruplarına göre listeler.

| Özellik | Açıklama |
|---------|----------|
| Gruplu gösterim | `grupluEvraklar` computed sinyal |
| Delta bilgisi | Yeni/mevcut evrak ayrımı gösterimi |
| Boş durum | "Evrak bulunamadı" mesajı |

### EvrakGroup.tsx
Tekil klasör grubu. Collapse/expand, toplu seçim.

| Özellik | Açıklama |
|---------|----------|
| Collapse/Expand | Klasör içeriği aç/kapa |
| Grup checkbox | Tüm/kısmi/hiç seçim durumu (indeterminate) |
| Evrak checkbox | Tekil evrak seçimi (`toggleEvrakSecimi`) |
| Metadata gösterimi | Evrak türü ve tarihi |

### ProgressBar.tsx
İndirme ilerleme çubuğu.

| Özellik | Açıklama |
|---------|----------|
| Yüzde gösterimi | `indirmeYuzdesi` computed sinyal |
| Renk kodları | Mavi (indirme), Yeşil (tamamlandı), Kırmızı (hata), Gri (duraklatıldı) |
| Animasyon | `uyap-progress-bar-animated` CSS sınıfı |
| Hata bildirimi | Başarısız evrak sayısı ve hata mesajı |

### SessionAlert.tsx
Oturum süresi dolma uyarısı.

| Özellik | Açıklama |
|---------|----------|
| Gösterim koşulu | `sessionExpired` sinyali `true` olduğunda |
| Sayfa yenile | `window.location.reload()` butonu |
| Kapatma | `sessionExpired.value = false` |

---

## 10. Popup

### Popup.tsx
Extension popup sayfası. Klasör seçimi ve ayarlar.

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| Klasör seçimi | `window.showDirectoryPicker()` -> IDB kaydetme | AKTİF |
| Klasör değiştirme | Mevcut seçimi güncelleme | AKTİF |
| İndirme gecikmesi | 300-2000ms aralık slider | AKTİF |
| Otomatik yeniden deneme | Checkbox (autoRetry) | UI VAR, MANTIK YOK |
| Klasör yapısı koru | Checkbox (keepFolderStructure) | UI VAR, MANTIK YOK |
| Ayarları kaydet | chrome.storage'a yazma | AKTİF |
| Inline bildirimler | 3 saniye auto-dismiss | AKTİF |
| Kullanım kılavuzu | 5 adımlı kullanım talimatı | AKTİF |

---

## 11. Dosya Adı Yardımcıları - `src/shared/filename.ts`

| Fonksiyon | Parametre | Dönüş | Açıklama | Durum |
|-----------|-----------|-------|----------|-------|
| `sanitizeName(name)` | `string` | `string` | Geçersiz karakterleri temizle, max 200 kar. | AKTİF |
| `formatFileName(baseName, extension)` | `string, string` | `string` | Sanitize + uzantı ekleme | KULLANILMIYOR |
| `joinPath(...parts)` | `string[]` | `string` | Parçaları birleştir | AKTİF |
| `getExtension(filename)` | `string` | `string` | Dosya uzantısını al | KULLANILMIYOR |
| `removeExtension(filename)` | `string` | `string` | Uzantıyı kaldır | KULLANILMIYOR |
| `makeUnique(baseName, existingNames, ext?)` | `string, Set<string>, string?` | `string` | Benzersiz dosya adı oluştur | KULLANILMIYOR |

---

## 12. Export/Import Sistemi - `src/shared/export-io.ts`

> **DURUM: TAMAMEN BEKLEMEDE** - Hiçbir fonksiyon ana akışa bağlanmamış.

| Fonksiyon | Parametre | Dönüş | Açıklama |
|-----------|-----------|-------|----------|
| `loadExistingExport(dirHandle)` | `FileSystemDirectoryHandle` | `Promise<ExportData \| null>` | Mevcut export JSON yükle |
| `compareWithExisting(evraklar, export)` | `EvrakItem[], ExportData \| null` | `{yeni, mevcut}` | Delta karşılaştırma |
| `writeExportData(dirHandle, data)` | `FileSystemDirectoryHandle, ExportData` | `Promise<void>` | Export JSON yazma |
| `createExportData(dosya, exportedBy)` | `DosyaBilgileri, string` | `ExportData` | Boş export yapısı oluştur |
| `addDownloadedEvrak(data, evrak, ...)` | 7 parametre | `ExportData` | İndirilen evrak ekle |

**Bağlantı Noktası:**
Bu sistemi aktif hale getirmek için, `Downloader.downloadAll` tamamlandığında `writeExportData` çağırılmalı ve `initExtension` sırasında `loadExistingExport` ile mevcut veri yüklenmeli.

---

## 13. Tip Bildirimleri - `src/shared/filesystem.d.ts`

File System Access API için TypeScript tip bildirimleri:

```typescript
interface FileSystemDirectoryHandle {
  queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
}
```

---

## 14. Konfigürasyon Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `vite.config.ts` | Vite + @crxjs/vite-plugin yapılandırması |
| `tailwind.config.ts` | Tailwind CSS (`uyap-` prefix), content path'leri |
| `tsconfig.json` | TypeScript strict mode, path alias'lar |
| `postcss.config.js` | PostCSS + Tailwind + Autoprefixer |
| `package.json` | Bağımlılıklar ve script'ler |
| `src/manifest.ts` | Chrome Extension Manifest V3 |

### Path Alias'lar (tsconfig.json)
| Alias | Hedef |
|-------|-------|
| `@shared/*` | `src/shared/*` |
| `@content/*` | `src/content/*` |
| `@background/*` | `src/background/*` |
| `@popup/*` | `src/popup/*` |
| `@/*` | `src/*` |

---

## 15. Kullanılmayan / Bağlı Olmayan Özellikler Özeti

| Özellik | Dosya | Açıklama |
|---------|-------|----------|
| Delta Sync sistemi | `export-io.ts` | 5 fonksiyon tanımlı, hiçbiri akışa bağlı değil |
| `mevcutExport` sinyali | `signals.ts` | Her zaman `null`, export-io bağlanmamış |
| `autoRetry` ayarı | `Popup.tsx` | UI mevcut, retry mantığı yok |
| `keepFolderStructure` ayarı | `Popup.tsx` | UI mevcut, koşul kontrolü yok |
| `selectedDirectory` alanı | `types.ts` | Settings'te tanımlı, hiçbir yerde kullanılmıyor |
| `formatFileName()` | `filename.ts` | Tanımlı, çağırılmıyor |
| `getExtension()` | `filename.ts` | Tanımlı, çağırılmıyor |
| `removeExtension()` | `filename.ts` | Tanımlı, çağırılmıyor |
| `makeUnique()` | `filename.ts` | Tanımlı, çağırılmıyor |
| `clearStorage()` | `idb-storage.ts` | Tanımlı, çağırılmıyor |
| `sendToContent()` | `messages.ts` | Tanımlı, çağırılmıyor |
| `UYAP_BASE_URL` | `constants.ts` | Tanımlı, çağırılmıyor |
| `DOWNLOAD_ENDPOINT` | `constants.ts` | Tanımlı, çağırılmıyor |
| 4 MessageType | `types.ts` | `SCAN_COMPLETE`, `DOWNLOAD_COMPLETE`, `DOWNLOAD_PAUSE`, `DOWNLOAD_RESUME` |

---

## 16. Kritik UYAP Davranışları

| Davranış | Açıklama |
|----------|----------|
| Oturum dolma | HTTP 200 + HTML içerik döner (401/403 değil) |
| DOM duplikasyonu | 352 span, 206 benzersiz evrak_id |
| WAF koruması | 300ms+ gecikme gerekli |
| Download tetikleme | `window.downloadDoc(evrakId, dosyaId, yargiTuru)` |
| yargiTuru | Boş olabilir, 3 kademe fallback zinciri |
| jQuery olayları | DOM değişikliği jQuery event'lerini bozar |
| Tooltip metadata | `data-original-title` attribute'unda evrak türü/tarihi |
