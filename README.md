# UYAP Dosya İndirici - Chrome Extension

UYAP Vatandaş Portal'ından dava dosyalarını tree-view yapısına uygun şekilde seçerek indirme.

## Özellikler

- Dava dosyalarındaki tüm evrakları tarayıp listeler
- Klasör yapısına göre gruplandırılmış görünüm
- Seçerek indirme (checkbox ile)
- Dosya yapısını koruyarak yerel klasöre kaydetme
- Delta sync: Sadece yeni evrakları indir
- Session expired tespiti (magic byte kontrolü)
- WAF koruması (300ms delay)
- Progress tracking
- Pause/Resume/Cancel özellikleri

## Teknolojiler

- **Framework:** Preact + TypeScript
- **State Management:** Preact Signals
- **Styling:** Tailwind CSS (prefix: `uyap-`)
- **Build Tool:** Vite + @crxjs/vite-plugin
- **Manifest:** V3

## Kurulum

### Development

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Development modunda çalıştırın:
   ```bash
   npm run dev
   ```

3. Chrome'da extension'ı yükleyin:
   - Chrome'da `chrome://extensions/` adresine gidin
   - "Developer mode"u açın
   - "Load unpacked" butonuna tıklayın
   - `dist` klasörünü seçin

### Production Build

```bash
npm run build
```

Build çıktısı `dist` klasöründe oluşur.

## Kullanım

1. Extension popup'ını açın ve indirme klasörünü seçin
2. UYAP Vatandaş Portal'a giriş yapın
3. Dava dosyanızı açın
4. Sayfanın sağ tarafında extension sidebar'ı görünecektir
5. İndirmek istediğiniz evrakları seçin
6. "İndir" butonuna tıklayın

## Mimari

### Content Script
- UYAP modal'ını tespit eder (MutationObserver)
- Filetree'yi parse eder ve deduplikasyon yapar
- Preact UI'ı render eder (sidebar)
- UYAP'ın `window.downloadDoc()` fonksiyonunu çağırır

### Background Service Worker
- chrome.downloads API ile indirmeleri yakalar
- Magic byte kontrolü ile dosya tipini tespit eder
- Session expired durumunda uyarı verir
- File System Access API ile dosyaları hedef klasöre taşır
- IndexedDB'de FileSystemDirectoryHandle saklar

### Popup
- Klasör seçimi (showDirectoryPicker)
- Ayarlar (delay, auto retry, folder structure)
- Kullanım talimatları

## Kritik Uyarılar

### UYAP DOM'una Dokunma
- `span.file` elementlerine jQuery event'leri bağlı
- SADECE OKU: `getAttribute('evrak_id')`, `textContent`
- YAZMA: event handler, data attribute, style

### Session Expired Tespiti
- UYAP 401/403 dönmüyor
- HTTP 200 + HTML döndürüyor
- **Çift kontrol:** Content-Type + Magic byte

### WAF Koruması
- Minimum 300ms delay
- Burst request yapma

### Deduplikasyon
- 352 span ama 206 unique evrak_id
- "Son 20 Evrak" klasörünü atla
- Set ile dedupe

## Geliştirme Notları

### yargiTuru Fallback Chain
```typescript
1. (window as any).dosya_bilgileri?.yargiTuru
2. document.querySelector('#yargiTuru')?.value
3. '1' (Default: Hukuk)
```

### Magic Bytes
- PDF: `25 50 44 46` (%PDF)
- UDF/ZIP: `50 4B 03 04` (PK..)
- TIFF LE: `49 49 2A 00` (II*.)
- TIFF BE: `4D 4D 00 2A` (MM.*)

### File System Access API
- FileSystemDirectoryHandle IndexedDB'de saklanır
- Permission kontrolü her kullanımda yapılır
- Klasör yapısı otomatik oluşturulur

## Lisans

MIT

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Push yapın
5. Pull Request açın
