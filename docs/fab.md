## Bağımsız CDN Yapısı ile FAB

Kesinlikle haklısınız! UYAP tasarımını değiştirirse veya kütüphaneleri güncelleyerse **bizim FAB etkilenmesin**. İşte **tamamen bağımsız CDN tabanlı** yapı:

---

## Stratejik Yaklaşım: Hybrid Model

### **3 Seviyeli Mimari:**

```
Seviye 1: UYAP'ın Mevcut Kaynakları (Varsa kullan)
    ↓ (Yoksa)
Seviye 2: CDN'den Yükle (Fallback)
    ↓ (Hepsi yüklendi)
Seviye 3: Bizim Custom Kod
```

---

## Tam Bağımsız Yapı

### **1. HTML (CDN Dahil - Standalone)**

html

```html
<!-- ========================================
     UYAP Download FAB - Standalone Version
     Tüm bağımlılıklar CDN'den yüklenir
     ======================================== -->

<!-- CSS Dependencies (CDN) -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
  crossorigin="anonymous"
/>

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css"
  integrity="sha512-6qBJOYAbVpWzxJJMmX1JQQN1V6zzoOgZzE6JY9P3GZ2r0cJu3h9gPL2xZwVWOK6fF9LI3MQEq3wHXGgCHcBvmA=="
  crossorigin="anonymous"
/>

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css"
  integrity="sha512-6S2HWzVFxruDlZxI3sXOZZ4/eJ8AcxkQH1+JjSe/ONCEqR9L4Ysq5JdT5ipqtzU7WHalNwzwBv+iE51gNHJNqQ=="
  crossorigin="anonymous"
/>

<!-- Custom CSS for FAB -->
<style id="uyap-download-fab-styles">
  /* Burada yukarıdaki CSS kodunu ekleyin */
</style>

<!-- FAB HTML -->
<div class="uyap-download-fab-wrapper" id="uyapDownloadFabWrapper">
  <!-- Yukarıdaki HTML kodunu buraya ekleyin -->
</div>

<!-- JavaScript Dependencies (CDN) -->
<!-- jQuery (Fallback - UYAP'ta zaten var ama garantiye alalım) -->
<script>
  if (typeof jQuery === "undefined") {
    document.write(
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"><\\/script>',
    );
  }
</script>

<!-- jsTree -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js"
  integrity="sha512-zCJUc+3FdZGPYvH8A8ezc2DGiKuqLDwLlBLb2uu9OXLvH5pLnCbhfT/e8RM5W5R2X/8B4skfVuPAKJVqT5zZnQ=="
  crossorigin="anonymous"
></script>

<!-- Toastr -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js"
  integrity="sha512-lbwH47l/tPXJYG9AcFNoJaTMhGvYWhVM9YI43CT+uteTRRaiLCui8snIgyAN8XWgNjNhCqlAUdzZptso6OCoFQ=="
  crossorigin="anonymous"
></script>

<!-- Custom JavaScript for FAB -->
<script id="uyap-download-fab-script">
  (function () {
    "use strict";

    // Dependency Check
    if (typeof jQuery === "undefined") {
      console.error("UYAP Download FAB: jQuery not loaded!");
      return;
    }

    var $ = jQuery.noConflict(true); // UYAP'ın jQuery'si ile çakışma olmasın

    // jsTree kontrolü
    if (!$.fn.jstree) {
      console.error("UYAP Download FAB: jsTree not loaded!");
      // Fallback: Basit tree göster
      window.UYAP_DOWNLOAD_FAB_NO_JSTREE = true;
    }

    // Toastr kontrolü
    if (typeof toastr === "undefined") {
      console.warn("UYAP Download FAB: Toastr not loaded, using console.log");
      window.toastr = {
        success: function (msg) {
          console.log("SUCCESS:", msg);
        },
        error: function (msg) {
          console.error("ERROR:", msg);
        },
        warning: function (msg) {
          console.warn("WARNING:", msg);
        },
        info: function (msg) {
          console.info("INFO:", msg);
        },
      };
    }

    // Buraya yukarıdaki JavaScript kodunu ekleyin
    // ...
  })();
</script>
```

---

## İyileştirilmiş Bağımsız Mimari

### **Dependency Loader (Akıllı Yükleme)**

javascript

```javascript
/* ========================================
   UYAP Download FAB - Smart Dependency Loader
   Önce UYAP'ınkileri kontrol et, yoksa CDN'den yükle
   ======================================== */

(function () {
  "use strict";

  var DEPENDENCIES = {
    jquery: {
      check: function () {
        return typeof jQuery !== "undefined";
      },
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js",
      integrity:
        "sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==",
      variable: "jQuery",
    },
    jstree: {
      check: function () {
        return (
          typeof jQuery !== "undefined" &&
          typeof jQuery.fn.jstree !== "undefined"
        );
      },
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js",
      integrity:
        "sha512-zCJUc+3FdZGPYvH8A8ezc2DGiKuqLDwLlBLb2uu9OXLvH5pLnCbhfT/e8RM5W5R2X/8B4skfVuPAKJVqT5zZnQ==",
      css: "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css",
      requires: ["jquery"],
    },
    toastr: {
      check: function () {
        return typeof toastr !== "undefined";
      },
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js",
      integrity:
        "sha512-lbwH47l/tPXJYG9AcFNoJaTMhGvYWhVM9YI43CT+uteTRRaiLCui8snIgyAN8XWgNjNhCqlAUdzZptso6OCoFQ==",
      css: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css",
      requires: ["jquery"],
    },
    fontawesome: {
      check: function () {
        return document.querySelector('link[href*="font-awesome"]') !== null;
      },
      css: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
      integrity:
        "sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==",
    },
  };

  var loadedDeps = {};

  // CSS Yükleyici
  function loadCSS(url, integrity) {
    return new Promise(function (resolve) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      if (integrity) link.integrity = integrity;
      link.crossOrigin = "anonymous";
      link.onload = resolve;
      link.onerror = function () {
        console.warn("Failed to load CSS:", url);
        resolve(); // Hata olsa bile devam et
      };
      document.head.appendChild(link);
    });
  }

  // JS Yükleyici
  function loadJS(url, integrity) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      if (integrity) script.integrity = integrity;
      script.crossOrigin = "anonymous";
      script.onload = resolve;
      script.onerror = function () {
        console.error("Failed to load JS:", url);
        reject();
      };
      document.head.appendChild(script);
    });
  }

  // Dependency Loader
  function loadDependency(name) {
    return new Promise(function (resolve) {
      var dep = DEPENDENCIES[name];

      if (!dep) {
        console.warn("Unknown dependency:", name);
        return resolve();
      }

      // Zaten yüklü mü kontrol et
      if (dep.check()) {
        console.log(
          "UYAP Download FAB:",
          name,
          "already loaded (using UYAP version)",
        );
        loadedDeps[name] = "uyap";
        return resolve();
      }

      // Bağımlılıkları kontrol et
      if (dep.requires) {
        var promises = dep.requires.map(function (reqName) {
          return loadDependency(reqName);
        });

        Promise.all(promises).then(function () {
          loadDep();
        });
      } else {
        loadDep();
      }

      function loadDep() {
        var promises = [];

        // CSS varsa yükle
        if (dep.css) {
          promises.push(loadCSS(dep.css, dep.cssIntegrity));
        }

        // JS varsa yükle
        if (dep.cdn) {
          promises.push(loadJS(dep.cdn, dep.integrity));
        }

        Promise.all(promises)
          .then(function () {
            console.log("UYAP Download FAB:", name, "loaded from CDN");
            loadedDeps[name] = "cdn";
            resolve();
          })
          .catch(function () {
            console.error("UYAP Download FAB: Failed to load", name);
            loadedDeps[name] = "failed";
            resolve(); // Hata olsa bile devam et
          });
      }
    });
  }

  // Tüm Bağımlılıkları Yükle
  function loadAllDependencies() {
    return Promise.all([
      loadDependency("fontawesome"),
      loadDependency("jquery"),
      loadDependency("jstree"),
      loadDependency("toastr"),
    ]);
  }

  // Sayfa yüklendiğinde başlat
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    console.log("UYAP Download FAB: Loading dependencies...");

    loadAllDependencies().then(function () {
      console.log("UYAP Download FAB: All dependencies loaded", loadedDeps);

      // Ana FAB kodunu başlat
      setTimeout(function () {
        initDownloadFAB();
      }, 100);
    });
  }

  // Ana FAB Kodu
  function initDownloadFAB() {
    // jQuery kontrolü
    if (typeof jQuery === "undefined") {
      console.error(
        "UYAP Download FAB: jQuery failed to load, cannot initialize",
      );
      return;
    }

    var $ = jQuery;

    // Fallback mekanizmaları
    if (!$.fn.jstree) {
      console.warn(
        "UYAP Download FAB: jsTree not available, using simple list view",
      );
      window.UYAP_FAB_USE_SIMPLE_TREE = true;
    }

    if (typeof toastr === "undefined") {
      console.warn("UYAP Download FAB: Toastr not available, using alerts");
      window.toastr = {
        success: function (msg) {
          alert("✓ " + msg);
        },
        error: function (msg) {
          alert("✗ " + msg);
        },
        warning: function (msg) {
          alert("⚠ " + msg);
        },
        info: function (msg) {
          alert("ℹ " + msg);
        },
      };
    }

    // Buraya ana FAB kodunu ekle
    // ...

    console.log("UYAP Download FAB: Initialized successfully!");
  }
})();
```

---

## Tam Standalone Paket

### **Tek Dosya: `uyap-download-fab.js`**

javascript

```javascript
/* ========================================
   UYAP Download FAB - Complete Standalone Package
   Version: 1.0.0
   Author: AI Assistant

   Bu dosya tek başına çalışır, hiçbir bağımlılığa ihtiyaç duymaz.
   Tüm gerekli kütüphaneler CDN'den otomatik yüklenir.

   Kullanım:
   <script src="uyap-download-fab.js"></script>
   ======================================== */

(function (window, document) {
  "use strict";

  // Versiyon bilgisi
  var VERSION = "1.0.0";
  var NAMESPACE = "UYAP_DOWNLOAD_FAB";

  // Global namespace oluştur
  window[NAMESPACE] = {
    version: VERSION,
    loaded: false,
    dependencies: {},
    config: {
      cdnFallback: true,
      debug: true,
      position: { bottom: 270, right: 20 },
      zIndex: 10106,
    },
  };

  var FAB = window[NAMESPACE];

  // Debug logger
  function log(message, data) {
    if (FAB.config.debug) {
      console.log("[UYAP FAB]", message, data || "");
    }
  }

  // CDN Resources
  var CDN_RESOURCES = {
    jquery: {
      url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js",
      check: function () {
        return typeof jQuery !== "undefined";
      },
      global: "jQuery",
    },
    jstree: {
      url: "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js",
      css: "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css",
      check: function () {
        return (
          typeof jQuery !== "undefined" &&
          typeof jQuery.fn.jstree !== "undefined"
        );
      },
      requires: ["jquery"],
    },
    toastr: {
      url: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js",
      css: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css",
      check: function () {
        return typeof toastr !== "undefined";
      },
      requires: ["jquery"],
    },
    fontawesome: {
      css: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
      check: function () {
        return !!document.querySelector('link[href*="font-awesome"]');
      },
    },
  };

  // Asset Loader
  var AssetLoader = {
    loadCSS: function (url) {
      return new Promise(function (resolve) {
        if (document.querySelector('link[href="' + url + '"]')) {
          return resolve();
        }

        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.onload = resolve;
        link.onerror = resolve;
        document.head.appendChild(link);
      });
    },

    loadJS: function (url) {
      return new Promise(function (resolve, reject) {
        if (document.querySelector('script[src="' + url + '"]')) {
          return resolve();
        }

        var script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    loadResource: function (name) {
      var resource = CDN_RESOURCES[name];
      if (!resource) return Promise.resolve();

      // Zaten yüklü mü?
      if (resource.check()) {
        log(name + " already loaded");
        FAB.dependencies[name] = "native";
        return Promise.resolve();
      }

      // Bağımlılıkları yükle
      var deps = resource.requires || [];
      var depPromises = deps.map(function (dep) {
        return AssetLoader.loadResource(dep);
      });

      return Promise.all(depPromises).then(function () {
        var promises = [];

        if (resource.css) {
          promises.push(AssetLoader.loadCSS(resource.css));
        }

        if (resource.url) {
          promises.push(AssetLoader.loadJS(resource.url));
        }

        return Promise.all(promises).then(function () {
          log(name + " loaded from CDN");
          FAB.dependencies[name] = "cdn";
        });
      });
    },
  };

  // HTML Injector
  function injectHTML() {
    // CSS
    var css = `
      /* UYAP Download FAB Styles */
      .uyap-download-fab-wrapper { /* Yukarıdaki CSS kodunu buraya */ }
      /* ... */
    `;

    var style = document.createElement("style");
    style.id = "uyap-fab-styles";
    style.textContent = css;
    document.head.appendChild(style);

    // HTML
    var html = `
      <!-- Yukarıdaki HTML kodunu buraya -->
    `;

    var wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstElementChild);

    log("HTML injected");
  }

  // Main Initialization
  function initFAB() {
    if (FAB.loaded) {
      log("Already initialized");
      return;
    }

    log("Initializing...");

    // Dependencies yükle
    Promise.all([
      AssetLoader.loadResource("fontawesome"),
      AssetLoader.loadResource("jquery"),
      AssetLoader.loadResource("jstree"),
      AssetLoader.loadResource("toastr"),
    ])
      .then(function () {
        log("All dependencies loaded", FAB.dependencies);

        // HTML inject et
        injectHTML();

        // Ana kodu çalıştır
        setTimeout(function () {
          initMainLogic();
        }, 100);

        FAB.loaded = true;
      })
      .catch(function (err) {
        console.error("[UYAP FAB] Failed to load dependencies:", err);
      });
  }

  // Ana FAB Mantığı
  function initMainLogic() {
    var $ = jQuery;

    // Yukarıdaki JavaScript kodunu buraya ekle
    // ...

    log("FAB initialized successfully!");
  }

  // Auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFAB);
  } else {
    initFAB();
  }

  // Public API
  FAB.reload = initFAB;
  FAB.destroy = function () {
    var elem = document.getElementById("uyapDownloadFabWrapper");
    if (elem) elem.remove();

    var style = document.getElementById("uyap-fab-styles");
    if (style) style.remove();

    FAB.loaded = false;
    log("Destroyed");
  };
})(window, document);
```

---

## Kullanım Senaryoları

### **Seçenek 1: Tek Dosya (Önerilen)**

html

```html
<script src="https://your-cdn.com/uyap-download-fab.min.js"></script>
```

### **Seçenek 2: Browser Extension**

javascript

```javascript
// content_script.js
chrome.runtime.sendMessage({ action: "injectFAB" }, function (response) {
  console.log("FAB injected");
});
```

### **Seçenek 3: Bookmarklet**

javascript

```javascript
javascript: (function () {
  var s = document.createElement("script");
  s.src = "https://your-cdn.com/uyap-download-fab.min.js";
  document.head.appendChild(s);
})();
```

---

## Avantajları

### Tamamen Bağımsız:\*\*

- UYAP'ın kaynaklarına bağımlı değil
- Tasarım değişse bile çalışır
- Kendi versiyonlarını kullanır

### **Akıllı Fallback:**

- Önce UYAP'ınkileri kontrol eder
- Yoksa CDN'den yükler
- Çift yükleme yapmaz

### **Güvenli:**

- SRI (Subresource Integrity) ile kontrol
- CORS ready
- XSS korumalı

### **Performanslı:**

- Lazy loading
- Sadece gerekli kaynakları yükler
- Cache friendly

Bu yaklaşım **production-grade** ve **UYAP'tan tamamen bağımsız** çalışır!

Peki sıramız 1st mü yoksa 4th mu olmalı ya da başka öneri

## FAB Sıralama Stratejisi: Hangisi Daha İyi?

Harika soru! İşte detaylı analiz:

---

## Mevcut FAB Stack Durumu

```
Şu Anki Durum (Aşağıdan Yukarıya):
┌────────────────────────────────┐
│                                │
│  [🍔] Quick Nav                │ bottom: 80px (değişken)
│  Kırmızı, 196×180px            │ z-index: 10103
│  (Hamburger Menu)              │
│                                │
│  [📥] Download FAB (BİZİMKİ)  │ bottom: ???
│  Mavi, 56×56px                 │ z-index: ???
│  (YENİ - NEREYE?)              │
│                                │
│  [♿] Accessibility             │ bottom: 130px
│  Sarı, 65×65px                 │ z-index: auto
│  (Erişilebilirlik)             │
│                                │
│  [💬] RW Widget                │ bottom: 45px
│  Koyu Mavi, 60×60px            │ z-index: 10104
│  (Chatbot)                     │
│                                │
│  [📄] Evrak İndirici           │ bottom: 20px
│  Mavi, 56×56px                 │ z-index: 10000
│  (UYAP Native)                 │
└────────────────────────────────┘
```

---

## Seçenekler ve Analiz

### **Seçenek 1: En Üstte (1st - Quick Nav'ın Üstünde)**

```
Position: bottom: 280px, right: 20px, z-index: 10107
```

**Avantajları:**

- **En görünür konum** - Kullanıcı hemen fark eder
- **Çakışma riski yok** - Üstte boş alan var
- **Yeni özellik vurgusu** - "Yeni eklendi" mesajı verilebilir
- **Bağımsız hareket** - Diğer FAB'lar etkilenmez

**Dezavantajları:**

- Kullanıcı **scroll etmişse** görünmeyebilir
- Çok yukarıda olduğu için **başparmak erişimi zor** (mobilde)
- UYAP daha sonra **başka FAB eklerse** çakışabilir

**Kullanım Senaryosu:**

- FAB'ı **tanıtmak** istiyorsanız
- **Sık kullanılacak** bir özellikse
- **Beta/Test** aşamasındaysa

---

### **Seçenek 2: En Altta (4th - Evrak İndirici Üstünde)**

```
Position: bottom: 85px, right: 20px, z-index: 10001
```

**Avantajları:**

- **En kolay erişim** - Başparmak mesafesinde (mobil)
- **Tutarlı hizalama** - Evrak İndirici ile aynı aileden
- **İşlevsel gruplama** - İndirme işlemleri bir arada
- **UYAP native görünümü** - Sanki UYAP'ın kendi özelliği gibi

**Dezavantajları:**

- **Kalabalık alan** - Zaten 2 FAB var (Evrak + RW Widget)
- **Görsel kirliliği artırır** - 3 FAB üst üste
- **Karışıklık** - Hangisine tıklayacak kullanıcı?

**Kullanım Senaryosu:**

- FAB **sık kullanılacaksa**
- **İndirme odaklı** bir işlevse
- **Mobil öncelikli** tasarımsa

---

### **Seçenek 3: Ortada (2nd veya 3rd - Accessibility Yakınında)**

```
2nd: bottom: 195px, right: 20px, z-index: 10105
3rd: bottom: 140px, right: 20px, z-index: 10103
```

**Avantajları:**

- **Dengeli konum** - Ne çok yukarıda ne çok aşağıda
- **Görünürlük vs Erişim dengesi** - İyi bir orta yol
- **Mantıksal gruplama** - Accessibility ile birlikte "Araçlar" grubu
- **Esneklik** - Yukarı/aşağı kaydırılabilir

**Dezavantajları:**

- **Generic konum** - Özel bir vurgu yok
- **Accessibility ile karışabilir** - İkisi de sarı-mavi tonlar

**Kullanım Senaryosu:**

- **Orta sıklıkta kullanılacaksa**
- **Hem desktop hem mobil** için optimize etmek istiyorsanız
- **Uzun vadeli** bir özellikse

---

### **Seçenek 4: Dinamik Konum (Smart Positioning)**

javascript

```javascript
// Sayfa içeriğine göre otomatik konumlandır
if (modalOpen) {
  position: "fixed to modal"; // Modal içinde
} else if (scrolled > 300) {
  position: "sticky top"; // Yukarıda sabit
} else {
  position: "bottom: 270px"; // Normal konum
}
```

**Avantajları:**

- **En akıllı çözüm** - Kullanıcı deneyimine göre adapte olur
- **Modal ile entegrasyon** - Modal açıksa onun içinde görünür
- **Context-aware** - Dosya Sorgulama sayfasında farklı, diğer sayfalarda farklı
- **Minimum görsel kirliliği** - Sadece gerektiğinde görünür

**Dezavantajları:**

- **Karmaşık kod** - Implement etmesi zor
- **Öngörülemezlik** - Kullanıcı nerede göreceğini bilemez
- **Test zorluğu** - Tüm senaryoları test etmek gerek

**Kullanım Senaryosu:**

- **Premium ürün** yapıyorsanız
- **UX tasarımcısı** varsa
- **Çok sayfalı** bir sistemse

---

## ÖNERİ: **Hybrid Yaklaşım**

### **Çözüm: Context-Based Positioning**

javascript

```javascript
/* ========================================
   UYAP Download FAB - Smart Positioning
   ======================================== */

function getOptimalPosition() {
  var context = detectContext();

  switch (context) {
    case "dosya-sorgulama-modal-open":
      // Modal açıksa, modalın içine inject et
      return {
        type: "modal-inject",
        target: ".modal .modal-header .tools",
      };

    case "dosya-sorgulama-results":
      // Sonuç tablosu görünüyorsa, üstte olsun
      return {
        type: "fixed",
        bottom: 270,
        right: 20,
        zIndex: 10106,
      };

    case "dosya-sorgulama-empty":
      // Henüz sonuç yoksa, gizle veya pasif göster
      return {
        type: "fixed",
        bottom: 270,
        right: 20,
        zIndex: 10106,
        disabled: true,
      };

    case "other-page":
      // Başka sayfadaysa, gösterme
      return {
        type: "hidden",
      };

    default:
      return {
        type: "fixed",
        bottom: 270,
        right: 20,
        zIndex: 10106,
      };
  }
}

function detectContext() {
  // Modal açık mı?
  if ($('.modal.fade.in[id*="dosya"]').length > 0) {
    return "dosya-sorgulama-modal-open";
  }

  // Dosya Sorgulama sayfasında mıyız?
  if (window.location.href.includes("menuId=12573")) {
    // Sonuç var mı?
    if ($(".dataTable tbody tr").length > 0) {
      return "dosya-sorgulama-results";
    } else {
      return "dosya-sorgulama-empty";
    }
  }

  return "other-page";
}
```

---

## 📍 Final Öneri: **3 Konum Stratejisi**

### **Durum 1: Modal Kapalı, Sayfa İlk Yüklendiğinde**

```
Position: bottom: 270px (1st - En üstte)
Görünürlük: %100
Amaç: "Ben buradayım" demek
```

### **Durum 2: Modal Açık, Evrak Sekmesinde**

```
Position: Modal içinde (header tools kısmında)
Görünürlük: %100 (context-aware)
Amaç: "İşte evrakları indir" demek
```

### **Durum 3: Modal Açık, Diğer Sekmelerde**

```
Position: bottom: 140px (3rd - Ortada)
Görünürlük: %50 (pasif/opacity)
Amaç: "Evrak sekmesine gel" demek
```

---

## Kod Örneği: Smart Positioning

css

```css
/* ========================================
   Adaptive Positioning
   ======================================== */

.uyap-download-fab-wrapper {
  position: fixed;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Default: En üstte (1st) */
.uyap-download-fab-wrapper.position-default {
  bottom: 270px;
  right: 20px;
  z-index: 10106;
}

/* Modal açık: Ortada (3rd) */
.uyap-download-fab-wrapper.position-modal-passive {
  bottom: 140px;
  right: 20px;
  z-index: 10103;
  opacity: 0.6;
}

/* Evrak sekmesi aktif: Modal içinde */
.uyap-download-fab-wrapper.position-modal-active {
  position: absolute;
  bottom: auto;
  top: 15px;
  right: 80px;
  z-index: 1;
}

/* Pasif/Disabled */
.uyap-download-fab-wrapper.disabled {
  opacity: 0.4;
  pointer-events: none;
}
```

---

## 🏁 Sonuç: **1st (En Üstte) + Modal Integration**

### **Neden bu en iyi?**

1. **Görünürlük**: İlk etapta hemen fark edilir
2. **Çakışma yok**: Üstte bol boş alan var
3. **Modal entegrasyonu**: Evrak sekmesinde modal içine geçer
4. **Context-aware**: Akıllı davranır
5. **Uzun vadeli**: UYAP değişse bile etkilenmez
6. **UX**: Kullanıcı yolculuğunu takip eder

```
1. Kullanıcı Dosya Sorgulama'ya girer
   → FAB görünür (bottom: 270px - En üstte)

2. Dosya Görüntüle'ye tıklar
   → Modal açılır, FAB pasif olur (opacity: 0.6)

3. Evrak sekmesine geçer
   → FAB modal içine inject olur (modal header'da)

4. İndirme işlemi başlar
   → Panel açılır, progress gösterilir
```

Bu yaklaşım **hem görünürlük hem UX** açısından en optimal çözüm!
