# Vatandaş UYAP Chrome Eklentisi - Sohbet Parçası 4/5

**Sohbet Numaraları:** 31-40

---

## Sohbet 31

**Kullanıcı:**

Hybrid Mimari Değerlendirme Raporu UYAP Vatandaş Portal (vatandas.uyap.gov.tr) Teknik Kısıtlar Analizi KRİTİK RİSKLER 1. UYAP Oturum Bağımlılığı — En Büyük Darboğaz Extension UYAP'a kullanıcının JSESSIONID cookie'si ile bağlanıyor. Bu oturum UYAP sunucusu tarafından yönetiliyor ve extension'ın kont

PASTED

Aşağıda bazı tespitlerim var ve bu yüzden acaba tekrar extension'a mı dönsek diyorum. İncele tartışalım. Bu uygulama sadece aynı anda bir kişi tarafından kullanılsın diye değiştiriyorum bir de

4 Şub

**Claude:**

Tek kullanıcıya dönüş mantıklı. Hybrid'in getirdiği karmaşıklık, senin de analiz ettiğin gibi, faydayı aşıyor.

Extension vs WPF+WebView2 — Tek Kullanıcı Senaryosu
Kriter	Chrome Extension	WPF + WebView2
UYAP erişimi	✅ Doğrudan (aynı tarayıcı, aynı session)	✅ Doğrudan (WebView2 içinde login)
Dosya sistemi	⚠️ Sadece Downloads klasörü	✅ İstediğin klasör + yapı
Klasör organizasyonu	❌ chrome.downloads flat structure	✅ /2024/E.123/Dilekçeler/evrak.pdf
UDF→PDF	❌ Gotenberg'e istek atman lazım (network)	✅ Local Gotenberg veya native lib
Kurulum	✅ Extension yükle, bitti	⚠️ Installer (.exe / .msix)
Güncelleme	✅ Chrome otomatik	⚠️ Manuel veya auto-update
Geliştirme hızı	✅ Daha az kod	⚠️ Daha fazla boilerplate
Kritik Soru: Dosya Organizasyonu Ne Kadar Önemli?

Extension ile yapabileceklerin:

C:\Users\Avukat\Downloads\
  ├── 2024-1-E-12345_Dava_Dilekçesi.pdf
  ├── 2024-1-E-12345_Cevap_Dilekçesi.pdf
  ├── 2024-1-E-12345_Bilirkişi_Raporu.pdf
  └── ... (düz liste, klasör yok)

WPF ile yapabileceklerin:

D:\UYAP-Evraklar\
  └── 2024\
      └── 1. Asliye Hukuk\
          └── E.12345 - Alacak Davası\
              ├── 01-Dilekçeler\
              │   ├── Dava_Dilekçesi.pdf
              │   └── Cevap_Dilekçesi.pdf
              ├── 02-Bilirkişi\
              │   └── Rapor.pdf
              └── metadata.json
Benim Önerim

Eğer klasör yapısı şart değilse → Pure Extension (daha hızlı geliştirme)

Eğer dosya organizasyonu önemliyse → WPF + WebView2 (zaten teknik tasarımı hazır)

Şu soruları cevaplayabilir misin:

İndirilen evraklar nasıl organize olsun? (düz liste yeterli mi, klasör yapısı şart mı?)
UDF dosyaları PDF'e dönüştürülecek mi, yoksa UDF olarak mı kalacak?
Evrak metadata'sı (tarih, tür, dosya no) ayrıca saklanacak mı?

---

## Sohbet 32

**Kullanıcı:**

Nasıl ya. Zaten daha önce bu dosya yapısını olayını yaptık ya. Yeni edindiğin bilgiler ve geçmiş yazışmadakileri tekrar kontrol et ve bağlamına kaydet

4 Şub

**Claude:**

Reconciled prior decisions with current context and unified documentation

Kullanıcı, daha önce dosya yapısı konusunu çözdüğümüzü söylüyor ve transcript'i kontrol etmemi istiyor. Transcript dosyasını okumam gerekiyor.

Önceki konuşmayı kontrol edip dosya yapısı kararlarını bulmak için

Kullanıcı haklı, daha önceki transcript'te dosya yapısı kararlarını görmem gerekiyor. Ama bu transcript WPF+WebView2'ye geçiş kısmını gösteriyor. Asıl Chrome Extension teknik tasarım dokümanı başka bir transcript'te olabilir. Bakalım orada ne var. Ayrıca TECHNICAL_DESIGN.md dosyasını da okumalıyım.

Compacted summary'de şunlar var:

Download flow: Scan → parse → select → batch download with pause/cancel → UDF→PDF conversion → progress events
Klasör yapısı: /DosyaNo/EvrakAdi.pdf şeklinde

Ama kullanıcı "daha önce dosya yapısını yaptık" diyor. Muhtemelen TECHNICAL_DESIGN.md'de bu detaylar var. Onu kontrol edeyim.

Show more
Teknik tasarım dokümanında dosya yapısı kararlarını kontrol etmek için

Şimdi daha iyi anlıyorum. Kullanıcı haklı - zaten detaylı bir teknik tasarım dokümanı var ve WPF + WebView2 kararı alınmış. Dosya yapısı şöyle belirlendi:

Proje yapısı: UyapEvrakYoneticisi.sln altında App/Core/WebUI katmanları
Evrak kayıt yolu: %USERPROFILE%\Documents\UYAP Evraklar (appsettings.json'da DefaultSavePath)
Mimari: WPF Shell + WebView2 içinde Preact overlay + .NET Core services

Ve şimdi kullanıcı:

Hybrid yerine tek kullanıcı senaryosuna dönmek istiyor (bu zaten WPF+WebView2 ile uyumlu)
Analiz dokümanındaki riskleri (UYAP session, double download vb.) değerlendirdik
Extension vs WPF sorusuna cevap arıyor

Ama benim son mesajımda sanki hiçbir şey kararlaştırılmamış gibi "dosya yapısı nasıl olsun" diye sormuşum. Kullanıcı haklı olarak "zaten yaptık bunu" diyor.

Özet:

WPF + WebView2 kararı alındı ✓
Teknik tasarım dokümanı hazır ✓
Dosya yapısı belirlendi: %USERPROFILE%\Documents\UYAP Evraklar ✓
UDF→PDF dönüşümü Gotenberg ile yapılacak ✓
Tek kullanıcı senaryosu (hybrid değil) ✓

Hybrid mimarinin risklerini anlattığı doküman aslında WPF+WebView2 seçimini destekliyor. Şimdi özür dileyip durumu netleştirmem, bu kararın doğru olduğunu teyit etmem ve kullanıcının belleğe kaydetmek istediği noktaları açıklığa kavuşturmam gerekiyor.

Show more
Done

Haklısın, özür dilerim. Zaten TECHNICAL_DESIGN.md'de her şey belirlenmiş:

Mevcut Kararlar (Zaten Alınmış)
Konu	Karar
Mimari	WPF + WebView2
Dosya Yapısı	%USERPROFILE%\Documents\UYAP Evraklar
UDF→PDF	Gotenberg (localhost:3000)
UI	Preact overlay injected into UYAP
Kullanıcı	Tek kullanıcı (hybrid değil)

Senin paylaştığın analiz dokümanı, hybrid mimarinin neden riskli olduğunu detaylıca açıklıyor — bu da WPF+WebView2 (tek kullanıcı, local indirme) kararımızı destekliyor:

❌ Çift indirme → WPF'te yok (UYAP → local disk, tek transfer)
❌ İki session yönetimi → WPF'te yok (sadece UYAP session)
❌ Hukuki risk → WPF'te minimum (veri kullanıcının PC'sinde kalıyor)

Memory'ye kaydediyorum:

Belleğe kaydetti, durumu özetlemeye ve sonraki adımları sorgulmaya hazırlandı
Managing memory...
Result

Memory'ye ekledim. Şimdi kullanıcıya durumu özetleyip sonraki adımları sorayım.

Done

Kaydedildi.

Sonuç: WPF + WebView2 ile devam ediyoruz. Analiz dokümanındaki riskler hybrid için geçerli — bizim mimarimiz bunlardan muaf.

Sonraki adım ne olsun?

Kod yazmaya başlayalım mı? (Solution setup, Core katmanı)
Tasarıma eklenecek bir şey var mı? (Analiz dokümanındaki önerilerden: chunked download, session heartbeat vb.)

---

## Sohbet 33

**Kullanıcı:**

Ama sen soruma cevap yazmadın. Ben bağlamdan koptuğunu fark ettim ve uyardım. Daha projenin tam olarak nasıl yürütülmesi gerektiğini onaylamadım ki

4 Şub

**Claude:**

Haklısın, özür dilerim. Acele ettim ve onaylamadan memory'ye kaydettim.

Şimdi düzgünce anlayayım. Sen şunu söyledin:

"Acaba tekrar extension'a mı dönsek diyorum"
"Bu uygulama sadece aynı anda bir kişi tarafından kullanılsın"

Netleştirmem gereken:

"Extension'a dönmek" derken neyi kastediyorsun?

Chrome Extension'a dönmek — WPF+WebView2'yi bırakıp sade Chrome Extension yapmak?
Hybrid'i bırakmak — Web API olmadan, sadece local çalışan uygulama (WPF veya Extension)?

Ve analiz dokümanını paylaşma amacın:

Hybrid mimarinin neden riskli olduğunu göstermek mi?
Yoksa WPF+WebView2 için de geçerli endişeler mi var?

Tek kullanıcı kararını anladım. Ama mimari seçimi (Chrome Extension vs WPF+WebView2) henüz netleşmedi. Hangisini tartışmamı istiyorsun?

---

## Sohbet 34

**Kullanıcı:**

Sen bana elindeki tüm bilgileri derle ve tablo halinde bu üç fikrini de avantaj dezavantaj gerekçelerinle paylaş. Ben de sana kısıtları tanımlayım:
* Aynı anda bir kişinin erişmesi yeterli
* Acilen beklentim dava dosyalarını seçerek ister tamamını istersem işaretli olanları indirmek.
* İndirdiğim dosyalarda tiff için tessaract udf için pdf dönüşümü şart
* Windows işletim sisteminde çalışması yeterli
* İleride genişletip yargıya ait portallardan haberleri çektiğim küçük bir duyuru alanı koymak

4 Şub

**Claude:**

Tamam, tüm bilgileri derliyorum. Senin kısıtlarını da tabloya yansıtacağım.

Mimari Karşılaştırma Tablosu
Kriter	Chrome Extension	WPF + WebView2	Hybrid (Ext + Web API)
Tek kullanıcı	✅ Yeterli	✅ Yeterli	⚠️ Overkill
Dosya seçimi (tümü/işaretli)	✅ DOM'dan parse	✅ DOM'dan parse	✅ DOM'dan parse
Klasör yapısı	❌ Sadece Downloads, flat	✅ İstediğin yere, hiyerarşik	✅ Sunucu tarafında
TIFF → OCR (Tesseract)	⚠️ Tesseract.js (yavaş, ~10s/sayfa)	✅ Tesseract.NET (hızlı, native)	✅ Sunucuda native
UDF → PDF	⚠️ Gotenberg'e HTTP istek	✅ Local Gotenberg veya native	✅ Sunucuda
Windows only	✅ Chrome yeterli	✅ Native WPF	✅
Duyuru alanı (ileride)	⚠️ Popup/sidebar (sınırlı alan)	✅ Ayrı panel/tab	✅ Dashboard
Kurulum	✅ Extension yükle	⚠️ Installer (.exe)	❌ Extension + sunucu
Geliştirme hızı	✅ Hızlı (JS/TS)	⚠️ Orta (C# + TS)	❌ Yavaş
UYAP session	✅ Aynı tarayıcı	✅ WebView2 içinde	⚠️ Extension'da
Çift indirme	❌ Yok	❌ Yok	⚠️ Var (UYAP→browser→server)
Hukuki risk (KVKK)	✅ Yok (local)	✅ Yok (local)	❌ Var (3. parti sunucu)
Session karmaşıklığı	✅ Tek (UYAP)	✅ Tek (UYAP)	❌ İki (UYAP + JWT)
Rate limiting riski	⚠️ Var	⚠️ Var	❌ Daha yüksek (uzun süre)
Kritik Kısıt Analizi
Senin Kısıtın	Chrome Extension	WPF + WebView2	Hybrid
TIFF→Tesseract	Zayıf (JS runtime)	Güçlü (native)	Güçlü
UDF→PDF	Bağımlı (Gotenberg servisi şart)	Esnek (local veya servis)	Bağımlı
Klasör organizasyonu	Yapamaz	Tam kontrol	Tam kontrol
Duyuru genişletme	Sınırlı (popup max 800x600)	Sınırsız (WPF window)	Sınırsız
Özet Değerlendirme
Mimari	Uygunluk	Gerekçe
Chrome Extension	⚠️ Kısmen	Tesseract.js yavaş, klasör yapısı yok, duyuru alanı kısıtlı. Hızlı MVP için uygun ama kısıtların %60'ını karşılar.
WPF + WebView2	✅ Tam	Tüm kısıtları karşılar. Native Tesseract, esnek klasör, genişletilebilir UI. Kurulum dezavantajı var ama Windows-only zaten.
Hybrid	❌ Gereksiz	Tek kullanıcı için overkill. Çift indirme, session karmaşıklığı, hukuki risk. Faydası yok.

Benim görüşüm: Senin kısıtlarına göre WPF + WebView2 en uygun. Ama son karar senin — eksik veya yanlış değerlendirdiğim bir nokta var mı?

---

## Sohbet 35

**Kullanıcı:**

İki ayrı bağımsız uygulama yapalım. Birincisi bir chrome eklentisi olsun. Amacı dava dosyalarını vatandas.uyap'daki durumları gözeterek (readme.md) treeview yapısına uygun ve oradaki içerikleri dosya ve dizin isimlerinde kullanarak seçmeli indirme işlemi. İkincisi ise bir WPF uygulaması olsun. O da programı genişletmek için düşündüğüm işleri eklentiden gelen çıktılara uygulanarak yapar. Buna göre yeni planı sun:

4 Şub

**Claude:**

Architected dual-application strategy: extension and WPF processor

Kullanıcı yeni bir mimari karar verdi: İki ayrı bağımsız uygulama yapmak istiyor.

Chrome Extension - UYAP'tan dosya indirme, TreeView yapısı ile klasör/dosya isimlendirme
WPF Uygulaması - Extension'dan gelen çıktıları işleme (TIFF→OCR, UDF→PDF, duyurular vs.)

Önce README.md dosyasını okuyup UYAP portal yapısını anlamam gerekiyor. Sonra yeni planı sunacağım.

Done

Önce README.md'yi inceleyeyim, sonra yeni mimariyi planlayayım.

Mimariye göre iki bağımsız uygulamanın yapısını tasarladı
UYAP portal yapısını ve TreeView düzenini anlamak için

README dosyasını inceledim. UYAP yapısını artık anlıyorum. Şimdi kullanıcının istediği yeni mimariye göre plan hazırlayayım:

Yeni Mimari:

Chrome Extension - UYAP'tan dosya indirme (TreeView yapısı korunarak)
WPF Uygulaması - İndirilen dosyaları işleme (TIFF→OCR, UDF→PDF, duyurular)

Bu iki uygulama bağımsız olacak. Extension işini bitirdikten sonra WPF uygulaması o çıktıları işleyecek.

Avantajları:

Extension kurulumu kolay
Session yönetimi basit (tarayıcı kendisi yönetir)
WPF tarafında dosya dönüşümleri native yapılabilir
Her ikisi de ayrı ayrı geliştirilebilir

Şimdi detaylı planı sunayım.

Show more
Done

Dosyayı inceledim. Şimdi yeni mimariyi sunuyorum:

Yeni Mimari: Chrome Extension + WPF (Bağımsız)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KULLANICI                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    ▼                                    ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────────┐
│      CHROME EXTENSION           │    │         WPF UYGULAMASI              │
│  "UYAP Dosya İndirici"          │    │    "UYAP Evrak Yöneticisi"          │
├─────────────────────────────────┤    ├─────────────────────────────────────┤
│ • UYAP'ta oturum (tarayıcı)     │    │ • İndirilen klasörü izle            │
│ • Filetree parse                │    │ • TIFF → OCR (Tesseract.NET)        │
│ • Seçmeli indirme UI            │    │ • UDF → PDF (Gotenberg/Native)      │
│ • Klasör yapısı oluştur         │    │ • Metadata index (SQLite)           │
│ • manifest.json (download_toc)  │    │ • Duyuru paneli (RSS/scrape)        │
└─────────────────────────────────┘    │ • Arama/filtreleme                  │
         │                             └─────────────────────────────────────┘
         │ Çıktı:                                       ▲
         ▼                                             │ Girdi:
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAYLAŞILAN KLASÖR                                   │
│  %USERPROFILE%\Documents\UYAP Evraklar\                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  2024-E-1234_Ankara-1-Asliye-Hukuk\                                         │
│  ├── manifest.json          ← Extension oluşturur                          │
│  ├── Dilekçeler\                                                            │
│  │   ├── Dava_Dilekcesi_2024-01-15.udf                                      │
│  │   └── Dava_Dilekcesi_2024-01-15.pdf   ← WPF dönüştürür                   │
│  ├── Bilirkişi_Raporları\                                                   │
│  │   ├── Rapor_2024-03-20.tiff                                              │
│  │   └── Rapor_2024-03-20_ocr.pdf        ← WPF dönüştürür                   │
│  └── Kararlar\                                                              │
│      └── Ara_Karar_2024-05-10.pdf                                           │
└─────────────────────────────────────────────────────────────────────────────┘
1. Chrome Extension Detayları
Kapsam
Özellik	Açıklama
Filetree Okuma	#browser.filetree DOM parse, span.file[evrak_id]
Seçmeli İndirme	TreeView checkbox UI (Preact/vanilla)
Klasör Yapısı	UYAP filetree → Windows klasör hiyerarşisi
Dosya İsimlendirme	{EvrakTürü}_{Tarih}_{EvrakId}.{ext}
Manifest Çıktısı	Her dava klasörüne manifest.json yaz
İndirme Modu	Tümü / Sadece seçili / Yeni evraklar
manifest.json Formatı
json
{
  "version": "1.0",
  "exportedAt": "2024-01-20T14:30:00Z",
  "dosya": {
    "dosyaId": "123456",
    "dosyaNo": "2024/1234",
    "birimAdi": "Ankara 1. Asliye Hukuk Mahkemesi",
    "yargiTuru": 1,
    "dosyaDurumu": "Açık"
  },
  "evraklar": [
    {
      "evrakId": "789012",
      "fileName": "Dava_Dilekcesi_2024-01-15.udf",
      "relativePath": "Dilekçeler/Dava_Dilekcesi_2024-01-15.udf",
      "mimeType": "application/udf",
      "evrakTuru": "Dava Dilekçesi",
      "evrakTarihi": "2024-01-15",
      "downloadedAt": "2024-01-20T14:30:05Z",
      "processed": false
    }
  ]
}
```

### Extension Dosya Yapısı
```
uyap-dosya-indirici/
├── manifest.json          # MV3
├── background.js          # Service worker
├── content/
│   ├── scanner.js         # Filetree parser
│   ├── downloader.js      # Batch download logic
│   └── ui.js              # Overlay panel
├── popup/
│   ├── popup.html
│   └── popup.js
├── lib/
│   └── preact.min.js      # (opsiyonel)
└── styles/
    └── overlay.css
```

---

## 2. WPF Uygulaması Detayları

### Kapsam

| Özellik | Açıklama |
|---------|----------|
| **Klasör İzleme** | FileSystemWatcher + manifest.json trigger |
| **UDF → PDF** | Gotenberg HTTP veya SharpZipLib + wkhtmltopdf |
| **TIFF → OCR** | Tesseract.NET (leptonica binding) |
| **Duyuru Paneli** | Yargıtay, Danıştay RSS/HTML scrape |
| **Metadata Index** | SQLite (evrakId, path, OCR text, tarih) |
| **Arama** | Full-text search (FTS5) |

### Solution Yapısı
```
UyapEvrakYonetici.sln
├── UyapEvrakYonetici/              # WPF Ana Proje
│   ├── App.xaml
│   ├── MainWindow.xaml
│   ├── Views/
│   │   ├── DosyaListView.xaml
│   │   ├── EvrakDetailView.xaml
│   │   ├── DuyuruView.xaml
│   │   └── SettingsView.xaml
│   └── ViewModels/
├── UyapEvrakYonetici.Core/         # Domain + Services
│   ├── Models/
│   │   ├── Dosya.cs
│   │   ├── Evrak.cs
│   │   └── Manifest.cs
│   ├── Services/
│   │   ├── FolderWatcherService.cs
│   │   ├── ManifestService.cs
│   │   ├── OcrService.cs
│   │   ├── PdfConverterService.cs
│   │   └── DuyuruService.cs
│   └── Data/
│       └── EvrakDbContext.cs       # SQLite
└── UyapEvrakYonetici.Converter/    # Dönüşüm kütüphanesi
    ├── UdfConverter.cs
    ├── TiffOcrProcessor.cs
    └── GotenbergClient.cs
3. İki Uygulama Arası Entegrasyon
Senaryo	Akış
Yeni indirme	Extension indirir → manifest.json yazar → WPF FileSystemWatcher tetiklenir → İşleme kuyruğuna ekler
Dönüşüm	WPF manifest okur → processed: false olanları bulur → UDF/TIFF dönüştürür → manifest günceller
Tekrar indirme	Extension mevcut manifest okur → sadece yeni evrakları indirir (delta sync)
4. Geliştirme Sırası
Aşama	Uygulama	Çıktı
1	Extension	Filetree parser + manifest.json
2	Extension	Seçmeli indirme UI
3	Extension	Batch download + klasör yapısı
4	WPF	FolderWatcher + manifest okuma
5	WPF	UDF → PDF dönüşümü
6	WPF	TIFF → OCR
7	WPF	Duyuru paneli
8	WPF	Arama/indeks
5. Avantaj / Dezavantaj
Kriter	Bu Mimari	Tek WPF+WebView2
Session yönetimi	✅ Tarayıcı yönetir	⚠️ Cookie aktarımı
Kurulum	⚠️ Extension + WPF ayrı	✅ Tek installer
Geliştirme hızı	✅ Paralel geliştirme	⚠️ Sıralı
UYAP değişikliklerine uyum	✅ Extension güncelle	⚠️ Tüm app güncelle
Offline çalışma	✅ WPF bağımsız	✅ Aynı
Modülerlik	✅ Yüksek	⚠️ Orta

Onay bekliyor: Bu plan uygun mu? Uygunsa hangi aşamadan başlayalım?

---

## Sohbet 36

**Kullanıcı:**

Eklenti için öneri
Stack: Preact + TypeScript + Tailwind (prefix: uyap-) + Vite + @crxjs/vite-plugin
Mimari: Content Script ↔ Background Service Worker. Sunucu yok. Dosyalar doğrudan kullanıcının diskine iner.
Kritik Güncellemeler (yeni bulgulardan):
1. Session expired tespiti — UYAP 401/403 dönmüyor, HTTP 200 ile login HTML'i döndürüyor. Downloader her response'un Content-Type'ını ve ilk byte'larını kontrol etmeli (%PDF magic byte). HTML gelirse "oturum düştü" uyarısı verip durmalı.
2. Evrak duplikasyonu — 240 evrak span'ı, 215 benzersiz evrak_id. Scanner'da Set ile deduplikasyon şart.
3. yargiTuru kesinlikle boş — Canlıda doğrulandı. Fallback zinciri zorunlu: dosya_bilgileri.yargiTuru || #yargiTuru.value || "1"
4. WAF koruması — TS01953787 cookie'si mevcut. İndirme hızı 300ms minimum bekleme ile tutulmalı, burst request'ten kaçınılmalı.
5. HTTP/1.1 — Multiplexing yok, ardışık indirme doğru yaklaşım.

Show more
4 Şub

**Claude:**

Entegre etti teknoloji stack'i ve kritik gereksinimleri detaylandırdı

Kullanıcı Chrome Extension için teknoloji stack'ini ve kritik gereksinimleri belirledi. Şimdi bu bilgileri entegre edip güncellenmiş planı sunmam gerekiyor.

Stack:

Preact + TypeScript + Tailwind (prefix: uyap-) + Vite + @crxjs/vite-plugin

Kritik güncellemeler:

Session expired - HTTP 200 + HTML döner, Content-Type ve magic byte kontrolü gerekli
Evrak duplikasyonu - Set ile dedupe
yargiTuru boş - Fallback zinciri zorunlu
WAF - 300ms minimum bekleme
HTTP/1.1 - Ardışık indirme

Bu bilgilerle extension yapısını detaylandırayım.

Show more
Done

Güncellenen stack ve kritik bulgularla extension planını detaylandırıyorum:

Chrome Extension: UYAP Dosya İndirici
Proje Yapısı
uyap-dosya-indirici/
├── src/
│   ├── manifest.ts                    # @crxjs/vite-plugin config
│   ├── background/
│   │   └── index.ts                   # Service Worker
│   ├── content/
│   │   ├── index.ts                   # Entry point
│   │   ├── scanner.ts                 # Filetree parser + dedupe
│   │   ├── downloader.ts              # Sequential download + session check
│   │   └── components/
│   │       ├── App.tsx                # Ana Preact component
│   │       ├── TreeView.tsx           # Seçmeli evrak listesi
│   │       ├── ProgressPanel.tsx      # İndirme durumu
│   │       └── SessionAlert.tsx       # Oturum düştü uyarısı
│   ├── shared/
│   │   ├── types.ts                   # Ortak tipler
│   │   ├── constants.ts               # Endpoint'ler, magic bytes
│   │   ├── manifest-writer.ts         # manifest.json oluşturucu
│   │   └── filename-utils.ts          # Sanitize, format
│   └── styles/
│       └── overlay.css                # Tailwind + uyap- prefix
├── public/
│   └── icons/
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
Temel Tipler (shared/types.ts)
typescript
// Evrak bilgisi (scanner çıktısı)
export interface EvrakItem {
  evrakId: string;
  name: string;
  path: string;           // "Dilekçeler/Dava Dilekçesi"
  evrakTuru?: string;
  evrakTarihi?: string;
  mimeType?: string;
}

// Dosya bilgisi (UYAP global object)
export interface DosyaBilgileri {
  dosyaId: string;
  dosyaNo: string;
  birimId: string;
  birimAdi: string;
  dosyaTurKod: string;
  yargiTuru: string;      // Boş olabilir!
  dosyaDurumu: string;
}

// İndirme durumu
export type DownloadStatus = 
  | 'pending' 
  | 'downloading' 
  | 'completed' 
  | 'failed' 
  | 'session_expired';

export interface DownloadProgress {
  evrakId: string;
  status: DownloadStatus;
  bytesReceived?: number;
  error?: string;
}

// manifest.json formatı
export interface ExportManifest {
  version: '1.0';
  exportedAt: string;
  dosya: DosyaBilgileri;
  evraklar: Array<{
    evrakId: string;
    fileName: string;
    relativePath: string;
    mimeType: string;
    evrakTuru: string;
    evrakTarihi: string;
    downloadedAt: string;
    processed: boolean;
  }>;
}

// Content ↔ Background mesajları
export type MessageType =
  | { type: 'START_DOWNLOAD'; payload: { evraklar: EvrakItem[]; dosya: DosyaBilgileri } }
  | { type: 'DOWNLOAD_PROGRESS'; payload: DownloadProgress }
  | { type: 'DOWNLOAD_COMPLETE'; payload: { manifestPath: string } }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'PAUSE_DOWNLOAD' }
  | { type: 'RESUME_DOWNLOAD' }
  | { type: 'CANCEL_DOWNLOAD' };
Scanner (content/scanner.ts)
typescript
import type { EvrakItem, DosyaBilgileri } from '../shared/types';

const SKIP_FOLDERS = ['Son 20 Evrak', 'Son20'];

export function getYargiTuru(): string {
  // Fallback zinciri - ZORUNLU
  const fromGlobal = (window as any).dosya_bilgileri?.yargiTuru;
  if (fromGlobal && fromGlobal.trim() !== '') return fromGlobal;

  const selectEl = document.querySelector<HTMLSelectElement>('#yargiTuru');
  if (selectEl?.value && selectEl.value.trim() !== '') return selectEl.value;

  return '1'; // Default: Hukuk
}

export function getDosyaBilgileri(): DosyaBilgileri | null {
  const raw = (window as any).dosya_bilgileri;
  if (!raw?.dosyaId) return null;

  return {
    ...raw,
    yargiTuru: getYargiTuru() // Her zaman fallback uygula
  };
}

export function scanFiletree(): EvrakItem[] {
  const filetree = document.querySelector<HTMLUListElement>('#browser.filetree');
  if (!filetree) return [];

  const seen = new Set<string>(); // Deduplikasyon için
  const evraklar: EvrakItem[] = [];

  function parseNode(ul: HTMLUListElement, currentPath: string) {
    const items = ul.querySelectorAll<HTMLLIElement>(':scope > li');

    items.forEach(li => {
      const span = li.querySelector<HTMLSpanElement>(':scope > span');
      const childUl = li.querySelector<HTMLUListElement>(':scope > ul');
      if (!span) return;

      const name = span.textContent?.trim() || '';
      const isFolder = span.classList.contains('folder');

      if (isFolder) {
        // Skip duplikasyon kaynağı klasörler
        if (SKIP_FOLDERS.some(skip => name.includes(skip))) return;

        const newPath = currentPath ? `${currentPath}/${name}` : name;
        if (childUl) parseNode(childUl, newPath);
      } else {
        const evrakId = span.getAttribute('evrak_id');
        if (!evrakId) return;

        // Deduplikasyon: 240 span → 215 unique
        if (seen.has(evrakId)) return;
        seen.add(evrakId);

        const metadata = parseTooltip(span.getAttribute('data-original-title'));

        evraklar.push({
          evrakId,
          name,
          path: currentPath,
          evrakTuru: metadata['Evrak Türü'],
          evrakTarihi: metadata['Evrak Tarihi'],
        });
      }
    });
  }

  parseNode(filetree, '');
  return evraklar;
}

function parseTooltip(tooltip: string | null): Record<string, string> {
  if (!tooltip) return {};

  const result: Record<string, string> = {};
  const lines = tooltip.split('<br>');

  lines.forEach(line => {
    const clean = line.replace(/<[^>]*>/g, '').trim();
    const colonIdx = clean.indexOf(':');
    if (colonIdx > 0) {
      const key = clean.slice(0, colonIdx).trim();
      const value = clean.slice(colonIdx + 1).trim();
      if (key && value) result[key] = value;
    }
  });

  return result;
}
Downloader (content/downloader.ts)
typescript
import type { EvrakItem, DosyaBilgileri, DownloadProgress } from '../shared/types';

const DOWNLOAD_DELAY_MS = 300;  // WAF koruması - minimum bekleme
const UYAP_BASE = 'https://vatandas.uyap.gov.tr';

// Magic bytes for session check
const MAGIC_BYTES = {
  PDF: [0x25, 0x50, 0x44, 0x46],       // %PDF
  TIFF_LE: [0x49, 0x49, 0x2A, 0x00],   // II*. (little-endian)
  TIFF_BE: [0x4D, 0x4D, 0x00, 0x2A],   // MM.* (big-endian)
  ZIP: [0x50, 0x4B, 0x03, 0x04],       // PK.. (UDF = ZIP)
};

interface DownloadResult {
  success: boolean;
  blob?: Blob;
  mimeType?: string;
  sessionExpired?: boolean;
  error?: string;
}

export class Downloader {
  private abortController: AbortController | null = null;
  private isPaused = false;
  private currentIndex = 0;

  constructor(
    private onProgress: (progress: DownloadProgress) => void,
    private onSessionExpired: () => void
  ) {}

  async downloadAll(
    evraklar: EvrakItem[],
    dosya: DosyaBilgileri,
    baseHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    this.abortController = new AbortController();

    for (let i = this.currentIndex; i < evraklar.length; i++) {
      // Pause check
      while (this.isPaused) {
        await this.sleep(100);
      }

      // Abort check
      if (this.abortController.signal.aborted) {
        break;
      }

      const evrak = evraklar[i];
      this.currentIndex = i;

      this.onProgress({ evrakId: evrak.evrakId, status: 'downloading' });

      const result = await this.downloadSingle(evrak, dosya);

      if (result.sessionExpired) {
        this.onSessionExpired();
        return;
      }

      if (result.success && result.blob) {
        await this.saveFile(baseHandle, evrak, dosya, result.blob, result.mimeType!);
        this.onProgress({ evrakId: evrak.evrakId, status: 'completed' });
      } else {
        this.onProgress({ 
          evrakId: evrak.evrakId, 
          status: 'failed', 
          error: result.error 
        });
      }

      // WAF koruması: 300ms bekleme
      await this.sleep(DOWNLOAD_DELAY_MS);
    }
  }

  private async downloadSingle(
    evrak: EvrakItem,
    dosya: DosyaBilgileri
  ): Promise<DownloadResult> {
    const url = `${UYAP_BASE}/download_document_brd.uyap` +
      `?evrakId=${evrak.evrakId}` +
      `&dosyaId=${dosya.dosyaId}` +
      `&yargiTuru=${dosya.yargiTuru}`;

    try {
      const response = await fetch(url, {
        credentials: 'include',
        signal: this.abortController?.signal
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      // Session expired tespiti - UYAP 200 OK + HTML döner
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('text/html')) {
        return { success: false, sessionExpired: true };
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Magic byte kontrolü - ek güvenlik
      if (this.isHtmlResponse(bytes)) {
        return { success: false, sessionExpired: true };
      }

      const mimeType = this.detectMimeType(bytes, contentType);
      const blob = new Blob([arrayBuffer], { type: mimeType });

      return { success: true, blob, mimeType };

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'İptal edildi' };
      }
      return { success: false, error: String(err) };
    }
  }

  private isHtmlResponse(bytes: Uint8Array): boolean {
    // HTML genellikle < ile başlar veya DOCTYPE içerir
    const start = String.fromCharCode(...bytes.slice(0, 50));
    return start.includes('<!DOCTYPE') || start.includes('<html');
  }

  private detectMimeType(bytes: Uint8Array, contentType: string): string {
    const head = Array.from(bytes.slice(0, 4));

    if (this.matchMagic(head, MAGIC_BYTES.PDF)) return 'application/pdf';
    if (this.matchMagic(head, MAGIC_BYTES.ZIP)) return 'application/udf';
    if (this.matchMagic(head, MAGIC_BYTES.TIFF_LE)) return 'image/tiff';
    if (this.matchMagic(head, MAGIC_BYTES.TIFF_BE)) return 'image/tiff';

    // Fallback to Content-Type header
    if (contentType.includes('pdf')) return 'application/pdf';
    if (contentType.includes('tiff')) return 'image/tiff';

    return 'application/octet-stream';
  }

  private matchMagic(bytes: number[], magic: number[]): boolean {
    return magic.every((b, i) => bytes[i] === b);
  }

  private async saveFile(
    baseHandle: FileSystemDirectoryHandle,
    evrak: EvrakItem,
    dosya: DosyaBilgileri,
    blob: Blob,
    mimeType: string
  ): Promise<void> {
    // Klasör yapısını oluştur
    const pathParts = evrak.path.split('/').filter(Boolean);
    let currentDir = baseHandle;

    for (const part of pathParts) {
      const safeName = this.sanitizeName(part);
      currentDir = await currentDir.getDirectoryHandle(safeName, { create: true });
    }

    // Dosya adını oluştur
    const ext = this.getExtension(mimeType);
    const fileName = this.buildFileName(evrak, ext);

    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  private buildFileName(evrak: EvrakItem, ext: string): string {
    const parts: string[] = [];

    if (evrak.evrakTuru) parts.push(evrak.evrakTuru);
    if (evrak.evrakTarihi) parts.push(evrak.evrakTarihi.replace(/\//g, '-'));
    parts.push(evrak.evrakId);

    return this.sanitizeName(parts.join('_')) + ext;
  }

  private getExtension(mimeType: string): string {
    switch (mimeType) {
      case 'application/pdf': return '.pdf';
      case 'application/udf': return '.udf';
      case 'image/tiff': return '.tiff';
      default: return '.bin';
    }
  }

  private sanitizeName(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }
  cancel() { this.abortController?.abort(); }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
Vite Config (vite.config.ts)
typescript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest';

export default defineConfig({
  plugins: [
    preact(),
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        content: 'src/content/index.ts',
        background: 'src/background/index.ts'
      }
    }
  }
});
Tailwind Config (tailwind.config.ts)
typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  prefix: 'uyap-',  // .uyap-flex, .uyap-bg-blue-500 vs.
  corePlugins: {
    preflight: false  // UYAP CSS ile çakışma önleme
  },
  theme: {
    extend: {
      colors: {
        uyap: {
          primary: '#2c5282',
          success: '#276749',
          danger: '#c53030',
          warning: '#c05621'
        }
      }
    }
  }
} satisfies Config;
Geliştirme Sırası
Adım	Modül	Çıktı
1	Proje scaffold	Vite + Preact + Tailwind + crxjs
2	scanner.ts	Filetree parse + dedupe + yargiTuru fallback
3	TreeView.tsx	Checkbox'lı evrak listesi UI
4	downloader.ts	Sequential download + session check + WAF delay
5	manifest-writer.ts	manifest.json oluşturma
6	ProgressPanel.tsx	İlerleme durumu + pause/cancel
7	SessionAlert.tsx	Oturum düştü modal
8	Background SW	chrome.downloads API entegrasyonu

Onay? Uygunsa 1. adımdan başlayalım (proje scaffold + package.json + config dosyaları).

---

## Sohbet 37

**Kullanıcı:**

İyide kod niye yazdın ki şimdi. Benim yazdıklarımı samna uygula demedim ki. Öneri diye de yazdım. İkimizin fikrine uygun proje fikrini koyuyoruz daha

4 Şub

**Claude:**

Haklısın, acele ettim. Senin önerilerini değerlendireyim ve kendi görüşlerimi ekleyeyim:

Senin Önerilerin + Benim Değerlendirmem
Öneri	Benim Görüşüm
Preact + TypeScript	✅ Katılıyorum. React'e göre ~3KB, UYAP sayfasına enjekte için ideal.
Tailwind (prefix: uyap-)	✅ Katılıyorum. Prefix şart, yoksa UYAP'ın Bootstrap'ı ile çakışır.
Vite + @crxjs/vite-plugin	✅ Katılıyorum. HMR desteği, manifest v3 otomatik.
Content Script ↔ Background SW	✅ Standart mimari.
300ms minimum bekleme	⚠️ Değişken yapılabilir mi? Bazı kullanıcılar riski göze alıp hızlandırmak isteyebilir. Settings'e koymak mantıklı olabilir.
Session expired: HTML + magic byte kontrolü	✅ İki katmanlı kontrol sağlam.
Set ile deduplikasyon	✅ Basit ve etkili.
yargiTuru fallback zinciri	✅ Zorunlu, canlıda doğrulanmış.
Benim Ek Önerilerim
Konu	Öneri	Gerekçe
State management	Preact signals veya basit Context	Küçük uygulama, Redux/Zustand overkill
File System Access API	showDirectoryPicker()	Kullanıcı klasör seçsin, Downloads'a düşmesin
manifest.json yazımı	Her dava klasörüne otomatik	WPF tarafı bunu trigger olarak kullanacak
Delta sync	Mevcut manifest varsa sadece yeni evrakları indir	Tekrar indirme senaryosu için
Error retry	Başarısız indirmeleri sonra tekrar dene (max 2)	Geçici ağ hatalarına karşı
UI yerleşimi	UYAP modal içine sidebar mı, floating panel mi?	Kullanıcı deneyimi açısından karar vermemiz lazım
Tartışmaya Açık Noktalar
UI nereye yerleşsin?
A) UYAP modalının yanına sidebar
B) Sayfanın sağ alt köşesinde floating panel
C) Popup'tan kontrol
İndirme başlatma UX'i nasıl olsun?
A) TreeView'da checkbox'lar + "İndir" butonu
B) Sağ tık context menu
C) Her ikisi
300ms delay ayarlanabilir mi?
Riskli ama kullanıcıya bıraksak mı?

Senin tercihlerin neler?

---

## Sohbet 38

**Kullanıcı:**

Güzel öneriler, özellikle File System Access API ve manifest.json/delta sync noktaları projeyi ciddi şekilde olgunlaştırıyor. Tek tek değerlendireyim:
State Management — Preact Signals Katılıyorum. Bu uygulama için signals ideal. useSignal/useComputed ile 3-4 reactive state yeterli (evraklar, indirmeDurumu, ayarlar). Context bile fazla kalabilir — signals zaten component tree dışında da erişilebilir, bu da scanner/downloader gibi non-UI modüllerden state güncellemeyi kolaylaştırır.
File System Access API — showDirectoryPicker() Çok iyi fikir. Kullanıcı bir kez klasör seçer, handle chrome.storage'da saklanır, sonraki indirmelerde aynı klasöre yazar. Ama bir kısıt var: File System Access API sadece user gesture ile çalışır (ilk seferde). Ve Chrome Extension content script'te destekleniyor ama bazı edge case'ler var. Fallback olarak chrome.downloads kalmalı. Ayrıca WPF tarafı bunu izleyecekse, seçilen klasör FileSystemDirectoryHandle olarak saklanır — WPF doğrudan bu handle'ı okuyamaz ama klasör yolunu biliyorsa FileSystemWatcher ile izler. Yani manifest.json yazımı bu köprüyü kuruyor.
manifest.json yazımı (dava dosyası manifest'i) Bu WPF entegrasyonu için kritik. Her dava klasörüne yazılan manifest.json şöyle bir şey olmalı: dosyaId, dosyaNo, birimAdi, evrak listesi (evrakId, ad, indirmeTarihi, hash), toplam evrak sayısı. WPF FileSystemWatcher bu dosyanın oluşturulmasını/güncellenmesini trigger olarak kullanır. Güzel mimari.
Delta Sync manifest.json zaten bunu mümkün kılıyor. Yeni taramada scanner mevcut manifest'i okur, evrak_id'leri karşılaştırır, sadece yeni olanları indirir. Basit ve etkili.
Error Retry — max 2 Tamam, ama bir ekleme: retry arasında bekleme süresini artırsak iyi olur (exponential backoff değil, basitçe ilk retry 600ms, ikinci 1200ms). UYAP WAF'ını tetiklememek için.
Tartışmaya Açık Noktalar — Benim Tercihlerim:
UI Yerleşimi → A) Modal yanına sidebar
Gerekçem: UYAP'ın modal'i .modal-dialog.modal-lg — ekranın büyük kısmını kaplıyor ama yanında boşluk var. Extension UI'ını modal'in sağına veya soluna fixed-position sidebar olarak koymak en doğal UX. Kullanıcı evrak ağacını solda görürken sağda extension kontrollerini görür. Floating panel dikkat dağıtır ve z-index savaşı başlar. Popup ise kullanıcıyı modal'den koparır — evrak seçimi modal'de, kontrol popup'ta olursa sürekli geçiş yapması gerekir.
Somut öneri: Modal'in .modal-content elementinin sağına position:fixed bir panel, right:0, top: modal.top, width: 320px. Modal açıkken görünür, kapanınca kaybolur.
İndirme UX'i → C) Her ikisi
TreeView checkbox'ları temel kullanım için (toplu seç/indir). Sağ tık context menu ise "sadece şunu indir" gibi tek evrak senaryosu için. Ama context menu'yü UYAP'ın kendi context menu'süne müdahale etmeden yapmak lazım — extension kendi sidebar'ındaki listede sağ tık menüsü açar, UYAP'ın filetree'sindeki context menu'ye dokunmaz.
300ms delay → Ayarlanabilir ama sınırlı
Kullanıcıya bırakalım ama alt limit koyalım: minimum 200ms, varsayılan 300ms, maksimum 2000ms. Slider ile. 200ms altı UYAP WAF riski taşır, bunu UI'da uyarı olarak gösterelim. "200-300ms: Hızlı (risk), 300-500ms: Normal, 500+: Güvenli" gibi.

Show more
4 Şub

**Claude:**

Mükemmel, tüm kararları derleyip final planı oluşturuyorum:

UYAP Dosya İndirici — Chrome Extension Final Planı
Kesinleşen Kararlar
Konu	Karar
Stack	Preact + TypeScript + Tailwind (prefix: uyap-) + Vite + @crxjs/vite-plugin
State	Preact Signals (useSignal, useComputed)
Mimari	Content Script ↔ Background Service Worker
Dosya Sistemi	File System Access API (birincil) + chrome.downloads (fallback)
UI Yerleşimi	Modal yanına fixed sidebar (sağ taraf, 320px)
İndirme UX	TreeView checkbox + Sidebar'da sağ tık context menu
İndirme Hızı	Ayarlanabilir: min 200ms, varsayılan 300ms, max 2000ms
Retry	Max 2 deneme, artan bekleme (600ms → 1200ms)
Session Kontrolü	Content-Type + Magic byte (çift katman)
Deduplikasyon	Set<evrakId> ile scanner'da
yargiTuru	Fallback zinciri: dosya_bilgileri.yargiTuru → #yargiTuru.value → "1"
Çıktı	Klasör yapısı + manifest.json (WPF entegrasyonu için)
Modül Yapısı
src/
├── manifest.ts
├── background/
│   └── service-worker.ts
├── content/
│   ├── index.ts              # Entry, modal observer
│   ├── scanner.ts            # Filetree parse, dedupe, yargiTuru
│   ├── downloader.ts         # Sequential fetch, session check, retry
│   ├── storage.ts            # FileSystemDirectoryHandle + chrome.storage
│   └── ui/
│       ├── App.tsx           # Ana container
│       ├── Sidebar.tsx       # Fixed panel wrapper
│       ├── TreeView.tsx      # Evrak listesi + checkbox
│       ├── ProgressBar.tsx   # İndirme durumu
│       ├── SettingsPanel.tsx # Delay slider, klasör seçimi
│       └── SessionAlert.tsx  # Oturum düştü uyarısı
├── shared/
│   ├── types.ts
│   ├── constants.ts
│   ├── signals.ts            # Global reactive state
│   ├── manifest-io.ts        # manifest.json okuma/yazma
│   └── filename.ts           # Sanitize, format
└── styles/
    └── sidebar.css
Signal Yapısı (3-4 temel state)
Signal	Tip	Açıklama
evraklar	Signal<EvrakItem[]>	Taranmış evrak listesi
seciliEvraklar	Signal<Set<string>>	Checkbox ile seçilenler
indirmeDurumu	Signal<DownloadState>	idle / downloading / paused / completed / error
ayarlar	Signal<Settings>	delay, klasör handle, vb.
UI Akışı
UYAP Modal Açılır
    ↓
MutationObserver: #dosya_goruntule_modal tespit
    ↓
Scanner: Filetree parse → evraklar signal güncelle
    ↓
Sidebar render (modal'in sağına fixed)
    ↓
Kullanıcı: Evrak seç (checkbox veya tümünü seç)
    ↓
Kullanıcı: "İndir" tıkla
    ↓
[İlk kullanım] showDirectoryPicker() → handle sakla
    ↓
Downloader: Sequential fetch (delay ile)
    ↓
Her evrak: Session check → Save → Progress güncelle
    ↓
Tamamlandı: manifest.json yaz
    ↓
Modal kapanır → Sidebar kaybol
manifest.json Şeması
{
  "schemaVersion": "1.0",
  "exportedAt": ISO timestamp,
  "exportedBy": "UYAP Dosya İndirici v1.0",
  
  "dosya": {
    "dosyaId": string,
    "dosyaNo": string,
    "birimAdi": string,
    "yargiTuru": number,
    "dosyaDurumu": string
  },
  
  "stats": {
    "totalEvrak": number,
    "downloadedEvrak": number,
    "failedEvrak": number
  },
  
  "evraklar": [
    {
      "evrakId": string,
      "fileName": string,
      "relativePath": string,
      "mimeType": string,
      "evrakTuru": string,
      "evrakTarihi": string,
      "downloadedAt": ISO timestamp,
      "fileSize": number,
      "status": "completed" | "failed",
      "error": string | null
    }
  ]
}
Delta Sync Akışı
Kullanıcı aynı davayı tekrar açar
    ↓
Scanner: Filetree'den evrakları topla
    ↓
manifest-io: Mevcut manifest.json oku (varsa)
    ↓
Karşılaştır: yeniEvraklar = tapinan - manifest'tekiler
    ↓
UI'da göster: "215 evrak, 12 yeni"
    ↓
Kullanıcı seçer: "Sadece yenileri indir" veya "Tümünü indir"
Hata Yönetimi
Hata Tipi	Davranış
Session expired	İndirmeyi durdur, SessionAlert göster, manifest'e yazma
Network hatası	Retry (600ms → 1200ms), 2. başarısızlıkta status: failed
Dosya yazma hatası	Log, sonraki evrakla devam et
WAF engeli (429)	İndirmeyi durdur, "Çok hızlı, delay artırın" uyarısı
Settings Paneli
Ayar	Kontrol	Varsayılan
İndirme hızı	Slider (200-2000ms)	300ms
Klasör	"Klasör Seç" butonu	—
Otomatik yeniden dene	Toggle	Açık
Klasör yapısını koru	Toggle	Açık

Slider'da görsel indicator:

200-300ms: 🟡 Hızlı (risk)
300-500ms: 🟢 Normal
500ms+: 🔵 Güvenli
Geliştirme Aşamaları
#	Aşama	Çıktı
1	Proje scaffold	Vite + Preact + Tailwind + crxjs config
2	Signals + Types	Shared state ve tip tanımları
3	Scanner	Filetree parse + dedupe + yargiTuru
4	Sidebar UI	Modal observer + fixed panel + TreeView
5	Storage	FileSystemDirectoryHandle + chrome.storage
6	Downloader	Sequential fetch + session check + retry
7	manifest-io	Okuma/yazma + delta sync
8	Settings	Delay slider + klasör seçimi
9	Polish	Error handling, UX iyileştirme

Bu plan tamam mı? Eksik veya değiştirmek istediğin bir şey var mı?

---

## Sohbet 39

**Kullanıcı:**

Plan çok sağlam, gerçekten iyi konsolide etmişsin. Birkaç eksik ve ince ayar noktası var:
1. manifest.ts vs manifest.json karışıklığı
Dosya yapısında src/manifest.ts var — bu @crxjs/vite-plugin'in Chrome Extension manifest'i için kullanılan dosya. Ama projedeki "manifest.json" terimi aynı zamanda dava klasörüne yazılan çıktı manifest'i için de kullanılıyor. İkisini karıştırmamak için çıktı dosyasına farklı isim vermeni öneririm: uyap-export.json veya dosya-manifest.json. Kod içinde de manifest-io.ts modülü "dava export manifest'i" ile ilgilendiğini açıkça belirtmeli.
2. File System Access API kısıtları
showDirectoryPicker() content script'te çalışmıyor — sadece user gesture ile ve secure context'te çağrılabilir ama content script'ler kısıtlı. İki yol var: ya bu çağrıyı popup'tan yap (popup.html'de küçük bir "Klasör Seç" ekranı), ya da background service worker üzerinden. Benim önerim: popup'ta sadece klasör seçimi + ayarlar olsun, sidebar'da indirme kontrolü. FileSystemDirectoryHandle serialize edilemez doğrudan — IndexedDB'de saklanmalı (chrome.storage'da saklanamaz). Bu storage.ts'in tasarımını etkiliyor.
3. Background Service Worker'ın rolü eksik tanımlı
Planda SW ne yapacak net değil. Eski mimaride SW chrome.downloads.download() yapıyordu. File System Access API birincil olunca SW'nin rolü değişiyor. Benim önerim: SW şu işleri yapsın — (a) popup ↔ content script mesaj köprüsü, (b) FileSystemDirectoryHandle'ı IndexedDB'den okuma/yazma, (c) fallback olarak chrome.downloads, (d) badge update (indirme sayısı). Dosya yazma işlemi content script'te File System Access API ile yapılsın.
4. Scanner'da eksik: findKisiAdi()
Dosya adında kişi adı kullanılıyor (output/kisiAdi/klasor/evrak.pdf). Scanner'da findKisiAdi() fonksiyonu plan'da yok. UYAP'ta kullanıcı adı header'da görünüyor ("NURTEN YAVUZ"). Bu ya DOM'dan parse edilir ya da dosya_bilgileri'nden alınır. Eklenmeli.
5. TreeView — UYAP'ın filetree'sini mi klonluyorsun?
Plan'da TreeView.tsx var ama bu extension'ın kendi tree view'ı mı yoksa UYAP'ın mevcut filetree'sine checkbox inject mi? Benim önerim: UYAP'ın tree'sine dokunma (jQuery event riski). Sidebar'da kendi flat listeni göster, ama klasör gruplarıyla. Daha güvenli ve kontrol edilebilir.
6. Signals'a ek: manifestData
Delta sync için mevcut manifest verisi de signal olmalı. Scanner çalıştığında manifest-io'dan okunan veri ile karşılaştırma yapılacak. manifestData: Signal<ManifestData | null> eklenebilir. Bu sayede UI'da "215 evrak, 12 yeni" gibi bilgi reactive olarak gösterilir.
7. Content-Type + Magic byte kontrolü detayı
Session check'te şu sırayı öneriyorum: (a) response.headers.get('content-type') — text/html ise session expired, (b) değilse ilk 4 byte oku — %PDF (25 50 44 46) ise PDF, PK (50 4B) ise UDF/ZIP, diğer ise bilinmeyen format. UDF dosyaları da indirilebilir (ileride Gotenberg ile dönüştürme için), bu yüzden sadece PDF kontrolü yetmez.
8. Geliştirme aşamalarına ek: Aşama 0
Vite + Preact + Tailwind + crxjs config zaten 1 saat sürebilir (özellikle prefix ayarı, JSX config, path alias). Bunu "Aşama 0: Dev environment" olarak ayırıp, aşama 1'i "Signals + Types + Constants" yapmak daha gerçekçi.

Show more
4 Şub

**Claude:**

Değerlendirdi, sekiz kritik geri bildirimi planla bütünleştirdi

Kullanıcı çok değerli geri bildirimler vermiş. Her birini değerlendirip planı güncellemem gerekiyor. Bunları tek tek ele alayım:

manifest.ts vs manifest.json - Haklı, isim karışıklığı var. uyap-export.json veya dosya-manifest.json önerisi mantıklı. Ben uyap-export.json tercih ederim - daha kısa ve net.
File System Access API kısıtları - Kritik bir teknik detay. Content script'te showDirectoryPicker() çalışmıyor. Popup'ta klasör seçimi + IndexedDB'de saklama doğru yaklaşım.
Background SW rolü - Haklı, net tanımlamamıştım. Mesaj köprüsü, IndexedDB erişimi, fallback chrome.downloads, badge update.
findKisiAdi() - Eksik, eklenmeli. DOM'dan parse veya dosya_bilgileri'nden.
TreeView - Kendi flat listemizi göstermek daha güvenli. UYAP DOM'una dokunmamak önemli.
manifestData signal - Delta sync için mantıklı ekleme.
Magic byte kontrolü - TIFF de eklemem lazım (49 49 veya 4D 4D). UDF = ZIP formatı.
Aşama 0 - Doğru, dev environment ayrı aşama olmalı.

Planı güncelleyeyim.

Show more
Done

Mükemmel geri bildirimler. Her birini değerlendirip planı güncelliyorum:

Güncellenmiş Plan
1. İsimlendirme Düzeltmesi
Eski	Yeni	Açıklama
manifest.json (çıktı)	uyap-export.json	Dava klasörüne yazılan export dosyası
manifest-io.ts	export-io.ts	Modül adı da uyumlu olsun
ManifestData tipi	ExportData	Tip adı da uyumlu

Chrome Extension manifest'i: src/manifest.ts (crxjs için) — değişmez.

2. File System Access API — Düzeltilmiş Mimari
┌─────────────────────────────────────────────────────────────┐
│                         POPUP                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  "Klasör Seç" butonu → showDirectoryPicker()        │    │
│  │  Ayarlar (delay slider, toggles)                    │    │
│  │  Seçili klasör gösterimi                            │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ chrome.runtime.sendMessage
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKGROUND SERVICE WORKER                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • IndexedDB: FileSystemDirectoryHandle sakla/oku   │    │
│  │  • Popup ↔ Content Script mesaj köprüsü             │    │
│  │  • Fallback: chrome.downloads.download()            │    │
│  │  • Badge update (indirme sayacı)                    │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ chrome.runtime.sendMessage
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONTENT SCRIPT                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Scanner: Filetree parse                          │    │
│  │  • Sidebar UI: Kendi flat liste (TreeView değil)    │    │
│  │  • Downloader: fetch() + SW'den handle al + yaz     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

IndexedDB Şeması:

typescript
interface StoredHandle {
  id: 'rootDirectory';
  handle: FileSystemDirectoryHandle;
  path: string; // Görüntüleme için
  savedAt: number;
}
```

---

### 3. Güncellenmiş Modül Yapısı
```
src/
├── manifest.ts                    # Chrome Extension manifest (crxjs)
├── background/
│   ├── service-worker.ts          # Ana SW entry
│   ├── idb-storage.ts             # IndexedDB: handle sakla/oku
│   ├── message-router.ts          # Popup ↔ Content mesaj yönlendirme
│   └── fallback-downloader.ts     # chrome.downloads fallback
├── popup/
│   ├── index.html
│   ├── Popup.tsx                  # Klasör seçimi + Ayarlar
│   └── popup.css
├── content/
│   ├── index.ts                   # Entry, modal observer
│   ├── scanner.ts                 # Filetree parse, dedupe, yargiTuru, kisiAdi
│   ├── downloader.ts              # fetch + dosya yazma
│   └── ui/
│       ├── App.tsx
│       ├── Sidebar.tsx
│       ├── EvrakList.tsx          # Flat liste, klasör gruplarıyla (TreeView değil)
│       ├── EvrakGroup.tsx         # Klasör başlığı + evraklar
│       ├── ProgressBar.tsx
│       └── SessionAlert.tsx
├── shared/
│   ├── types.ts
│   ├── constants.ts
│   ├── signals.ts
│   ├── export-io.ts               # uyap-export.json okuma/yazma
│   ├── filename.ts
│   └── messages.ts                # Message type tanımları
└── styles/
    ├── sidebar.css
    └── popup.css
4. Scanner — findKisiAdi() Eklendi
typescript
// scanner.ts

export function findKisiAdi(): string {
  // Öncelik 1: Header'daki kullanıcı adı
  // UYAP'ta genelde "#kullaniciAdi" veya ".user-name" gibi bir element var
  const headerEl = document.querySelector('.navbar-right .user-name, #kullaniciAdi');
  if (headerEl?.textContent) {
    return sanitizeName(headerEl.textContent.trim());
  }
  
  // Öncelik 2: dosya_bilgileri içinde varsa
  const dosyaBilgileri = (window as any).dosya_bilgileri;
  if (dosyaBilgileri?.kisiAdi) {
    return sanitizeName(dosyaBilgileri.kisiAdi);
  }
  
  // Fallback
  return 'Bilinmeyen';
}

function sanitizeName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .substring(0, 50);
}
```

**Not:** UYAP'ta header'daki kullanıcı elementi selector'ını canlı ortamda doğrulamamız lazım.

---

### 5. EvrakList — Flat Liste (TreeView Değil)

UYAP'ın filetree'sine dokunmuyoruz. Sidebar'da kendi flat listemizi gösteriyoruz:
```
┌─────────────────────────────────────┐
│  📁 Dilekçeler (12)            [☑]  │
│  ├─ ☑ Dava Dilekçesi (15.01.2024)  │
│  ├─ ☑ Cevap Dilekçesi (22.01.2024) │
│  └─ ☑ Islah Dilekçesi (05.02.2024) │
│                                     │
│  📁 Bilirkişi Raporları (3)    [☑]  │
│  ├─ ☑ Rapor (20.03.2024)           │
│  └─ ☑ Ek Rapor (15.04.2024)        │
│                                     │
│  📁 Kararlar (2)               [☐]  │
│  └─ ☐ Ara Karar (10.05.2024)       │
└─────────────────────────────────────┘

Klasör grupları scanner'dan gelen relativePath'in ilk segmentine göre oluşturulur.

6. Signals — Güncellenmiş
typescript
// signals.ts
import { signal, computed } from '@preact/signals';

// Core state
export const evraklar = signal<EvrakItem[]>([]);
export const seciliEvrakIds = signal<Set<string>>(new Set());
export const indirmeDurumu = signal<DownloadState>({ status: 'idle' });
export const ayarlar = signal<Settings>(defaultSettings);

// Export data (delta sync için)
export const mevcutExport = signal<ExportData | null>(null);

// Computed
export const grupluEvraklar = computed(() => {
  const groups = new Map<string, EvrakItem[]>();
  for (const evrak of evraklar.value) {
    const folder = evrak.relativePath.split('/')[0] || 'Diğer';
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder)!.push(evrak);
  }
  return groups;
});

export const yeniEvrakSayisi = computed(() => {
  if (!mevcutExport.value) return evraklar.value.length;
  const mevcutIds = new Set(mevcutExport.value.evraklar.map(e => e.evrakId));
  return evraklar.value.filter(e => !mevcutIds.has(e.evrakId)).length;
});

export const deltaInfo = computed(() => ({
  toplam: evraklar.value.length,
  yeni: yeniEvrakSayisi.value,
  mevcut: evraklar.value.length - yeniEvrakSayisi.value
}));
7. Magic Byte Kontrolü — Genişletilmiş
typescript
// downloader.ts

const MAGIC_BYTES = {
  PDF:  [0x25, 0x50, 0x44, 0x46], // %PDF
  ZIP:  [0x50, 0x4B, 0x03, 0x04], // PK.. (UDF de bu)
  TIFF_LE: [0x49, 0x49, 0x2A, 0x00], // II*.
  TIFF_BE: [0x4D, 0x4D, 0x00, 0x2A], // MM.*
} as const;

type FileType = 'pdf' | 'udf' | 'tiff' | 'unknown' | 'html';

async function detectFileType(response: Response): Promise<{ type: FileType; blob: Blob }> {
  // 1. Content-Type kontrolü
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    return { type: 'html', blob: await response.blob() };
  }
  
  // 2. Magic byte kontrolü
  const blob = await response.blob();
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  
  if (matchBytes(header, MAGIC_BYTES.PDF)) {
    return { type: 'pdf', blob };
  }
  if (matchBytes(header, MAGIC_BYTES.ZIP)) {
    return { type: 'udf', blob }; // UDF = ZIP
  }
  if (matchBytes(header, MAGIC_BYTES.TIFF_LE) || matchBytes(header, MAGIC_BYTES.TIFF_BE)) {
    return { type: 'tiff', blob };
  }
  
  return { type: 'unknown', blob };
}

function matchBytes(header: Uint8Array, expected: readonly number[]): boolean {
  return expected.every((byte, i) => header[i] === byte);
}

// Kullanım
async function downloadEvrak(evrak: EvrakItem): Promise<DownloadResult> {
  const response = await fetch(buildUrl(evrak));
  const { type, blob } = await detectFileType(response);
  
  if (type === 'html') {
    return { status: 'session_expired', evrakId: evrak.evrakId };
  }
  
  // type: pdf | udf | tiff | unknown — hepsini kaydet
  const ext = type === 'unknown' ? 'bin' : type;
  await saveFile(blob, evrak, ext);
  
  return { status: 'completed', evrakId: evrak.evrakId, fileType: type };
}
8. Güncellenmiş Geliştirme Aşamaları
#	Aşama	Çıktı	Tahmini Süre
0	Dev Environment	Vite + Preact + Tailwind (prefix) + crxjs + path alias + JSX config	1-2 saat
1	Types + Signals + Constants	Tip tanımları, signals, sabitler	30 dk
2	Scanner	Filetree parse + dedupe + yargiTuru + kisiAdi	1 saat
3	Popup	Klasör seçimi + showDirectoryPicker + ayarlar UI	1 saat
4	Background SW	IndexedDB, mesaj router, badge	1 saat
5	Sidebar + EvrakList	Modal observer + flat liste UI	1.5 saat
6	Downloader	fetch + session check + retry + dosya yazma	2 saat
7	export-io	uyap-export.json okuma/yazma + delta sync	1 saat
8	Settings entegrasyonu	Delay slider, toggles, popup ↔ content sync	30 dk
9	Polish	Error handling, UX, edge cases	1-2 saat

Başka eklemek veya değiştirmek istediğin bir şey var mı? Yoksa Aşama 0'a başlayalım mı?

---

## Sohbet 40

**Kullanıcı:**

🎯 UYAP Chrome Eklentisi İçin Detaylı Bulgular ve Öneriler Harika haber! Sayfayı detaylı inceledim ve size tam olarak ihtiyacınız olanları buldum. İşte bulgularım: 📊 1. Evrak Listesi Çıkarma Evrakların data-original-title attributeunda tüm bilgiler var: javascript// Tüm evrakları çıkarma kodu func

PASTED

Ekteki sonuçları claude web eklentisinden aldım. downloadDocURL fonksiyonunun tam parametrelerini bulsun mu? Bana gerekli prompt'u yaz

4 Şub

**Claude:**

İşte downloadDocURL fonksiyonunu tam analiz etmesi için prompt:

UYAP sayfasında `downloadDocURL` fonksiyonunu detaylı analiz et:

1. **Fonksiyon Tanımı**
   - Tarayıcı konsolunda `downloadDocURL.toString()` çalıştır ve fonksiyonun tam kaynak kodunu göster
   - Kaç parametre alıyor, isimleri ve sırası nedir?

2. **İlgili Fonksiyonlar**
   - `downloadDoc.toString()` çalıştır
   - `viewDocURL.toString()` çalıştır (varsa)
   - Bu fonksiyonlar arasındaki ilişkiyi açıkla

3. **Gerçek Kullanım Örnekleri**
   - Sayfada bu fonksiyonların çağrıldığı yerleri bul (onclick attributeleri, event listener'lar)
   - Evrak indirme butonlarına tıklandığında hangi parametrelerle çağrılıyor?

4. **URL Formatı**
   - Fonksiyonun döndürdüğü URL'nin tam formatını göster
   - Örnek bir evrak için gerçek URL oluştur ve göster

5. **Gerekli Parametrelerin Kaynağı**
   - Her parametre nereden geliyor? (DOM element, global değişken, data attribute)
   - `window.dosya_bilgileri` objesinin tam içeriğini göster
   - Evrak span elementlerindeki tüm data attributelerini listele

6. **Session/Cookie Gereksinimleri**
   - İndirme isteği için hangi cookie'ler gerekli?
   - CSRF token var mı?

Bu prompt ile fonksiyonun tam imzasını, parametrelerini ve URL formatını öğrenebiliriz. Sonuçlara göre downloader.ts'i kesinleştirelim.

---

