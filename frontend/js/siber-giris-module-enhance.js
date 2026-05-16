/**
 * Siber Güvenliğe Giriş: Modül 2–8 görsel kartları (kr-inline-breakout).
 * Yan menüdeki konu başlıkları yeterli; ek alt başlık üretilmez (subNavScroll kapalı).
 */
(function () {
  'use strict';

  var path = (typeof location !== 'undefined' && location.pathname) || '';
  if (path.indexOf('guncel-siber-guvenlige-giris') === -1 && path.indexOf('siber-guvenlik') === -1) {
    return;
  }
  if (!document.querySelector('.module-layout')) return;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function card(icon, title, body) {
    return (
      '<details class="kr-exp-goal">' +
      '<summary><span class="kr-exp-goal__icon" aria-hidden="true"><i class="fas ' +
      esc(icon) +
      '"></i></span><span class="kr-exp-goal__title">' +
      esc(title) +
      '</span></summary>' +
      '<div class="kr-exp-goal__body">' +
      body +
      '</div></details>'
    );
  }

  function breakout(ariaLabel, headIcon, headTitle, hint, cardsHtml) {
    var el = document.createElement('div');
    el.className = 'kr-inline-breakout kr-mid-cards sg-viz-injected';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', ariaLabel);
    el.innerHTML =
      '<div class="kr-inline-breakout__head"><i class="fas ' +
      esc(headIcon) +
      '" aria-hidden="true"></i><span>' +
      esc(headTitle) +
      '</span></div>' +
      '<p class="kr-inline-breakout__hint">' +
      esc(hint) +
      '</p>' +
      '<div class="kr-cia-grid">' +
      cardsHtml +
      '</div>';
    return el;
  }

  function insertAfterSectionStart(sectionId, breakoutEl) {
    var sec = document.getElementById(sectionId);
    if (!sec) return;
    var inner = sec.querySelector('.section-inner');
    if (!inner || inner.querySelector('.sg-viz-injected')) return;
    var anchor =
      inner.querySelector('h2, h3, p') ||
      inner.firstElementChild;
    if (!anchor) {
      inner.insertBefore(breakoutEl, inner.firstChild);
      return;
    }
    if (anchor.tagName === 'H1') {
      anchor = anchor.nextElementSibling || anchor;
    }
    inner.insertBefore(breakoutEl, anchor.nextSibling);
  }

  function insertAfterSelector(sectionId, selector, breakoutEl) {
    var sec = document.getElementById(sectionId);
    if (!sec) return;
    var inner = sec.querySelector('.section-inner');
    if (!inner || inner.querySelector('.sg-viz-injected')) return;
    var anchor = inner.querySelector(selector);
    if (!anchor) {
      insertAfterSectionStart(sectionId, breakoutEl);
      return;
    }
    anchor.parentNode.insertBefore(breakoutEl, anchor.nextSibling);
  }

  function addHeroImage(sectionId, src, alt, caption) {
    var sec = document.getElementById(sectionId);
    if (!sec) return;
    var inner = sec.querySelector('.section-inner');
    if (!inner || inner.querySelector('.sg-hero-injected')) return;
    var wrap = document.createElement('div');
    wrap.className = 'lesson-image-wrap sg-hero-injected';
    wrap.innerHTML =
      '<img src="' +
      esc(src) +
      '" alt="' +
      esc(alt) +
      '" class="lesson-image" loading="lazy" referrerpolicy="no-referrer">' +
      '<p class="lesson-image-caption">' +
      esc(caption) +
      '</p>';
    var h1 = inner.querySelector('h1');
    if (h1 && h1.nextSibling) {
      inner.insertBefore(wrap, h1.nextSibling);
    } else {
      inner.insertBefore(wrap, inner.firstChild);
    }
  }

  function run() {
    document.querySelectorAll('.nav-sublist').forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll('.nav-section-item').forEach(function (li) {
      li.classList.remove('nav-section-item', 'is-open');
    });
    document.querySelectorAll('.nav-link-section .nav-expand-indicator').forEach(function (i) {
      i.remove();
    });
    document.querySelectorAll('.nav-link-section .nav-label').forEach(function (span) {
      var link = span.closest('.nav-link-section');
      if (!link) return;
      var icon = link.querySelector('i.fas');
      var text = span.textContent.trim();
      link.textContent = '';
      if (icon) link.appendChild(icon);
      link.appendChild(document.createTextNode(' ' + text));
    });

    insertAfterSectionStart(
      'modül-2-siber-tehdit-aktörleri-ve-saldırı-türleri',
      breakout(
        'Tehdit aktörü spektrumu',
        'fa-users',
        'Modül 2 — Kim saldırır?',
        'Her olayda önce motivasyon ve kaynak kapasitesini düşünün; aşağıdaki kartlar aktör tiplerini özetler.',
        card('fa-child', 'Script kiddie', 'Düşük derinlik, hazır araçlar; <strong>rastgele</strong> hedef ve yüksek deneme sayısı.') +
          card('fa-bullhorn', 'Hacktivist', 'İdeoloji ve görünürlük; çoğunlukla <strong>erişilebilirlik</strong> ve itibar hedefi.') +
          card('fa-mask', 'Siber suç', 'Finansal kazanç; fidye, hesap hırsızlığı, organize iş modeli.') +
          card('fa-flag', 'APT / Devlet', 'Uzun süreli kalıcılık, stratejik hedefler, yüksek kaynak.') +
          card('fa-user-tie', 'İç tehdit', 'Yetkili erişim; kasıtlı veya <strong>kazara</strong> insan hatası.')
      )
    );

    addHeroImage(
      'büyük-resim-kim-saldırır-ve-nasıl-saldırır',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&q=85',
      'Tehdit aktörleri ve saldırı yöntemleri',
      'İki soru: Kim saldırır? Hangi yöntem ve hangi CIA boyutu etkilenir?'
    );

    insertAfterSectionStart(
      'büyük-resim-kim-saldırır-ve-nasıl-saldırır',
      breakout(
        'Saldırı analiz çerçevesi',
        'fa-project-diagram',
        'Kim · Nasıl · Ne etkilenir',
        'Modül 1 dilini bu modülde her senaryoya uygulayın.',
        card('fa-user-secret', 'Aktör', 'Motivasyon, kapasite, hedef seçimi.') +
          card('fa-bug', 'Yöntem', 'Malware, oltalama, brute force, DoS…') +
          card('fa-bullseye', 'Varlık', 'Veri, sistem veya hizmet hangisi?') +
          card('fa-shield-alt', 'CIA etkisi', 'Gizlilik, bütünlük veya erişilebilirlik.')
      )
    );

    insertAfterSelector(
      'yaygın-siber-saldırı-türleri-başlangıç-seviyesi',
      'h2',
      breakout(
        'Saldırı türü hızlı rehber',
        'fa-th-large',
        'Yaygın saldırı türleri',
        'Her saldırıyı okurken üç soruyu yanıtlayın: varlık, zafiyet, CIA.',
        card('fa-virus', 'Malware', 'Virüs, solucan, truva, fidye, casus — bulaşma ve etki farklıdır.') +
          card('fa-envelope', 'Sosyal mühendislik', 'Güven, korku, acele — insan psikolojisi.') +
          card('fa-key', 'Brute force', 'Zayıf parola/PIN; deneme-yanılma.') +
          card('fa-network-wired', 'DoS / DDoS', 'Kaynak tüketimi → <strong>erişilebilirlik</strong>.')
      )
    );

    insertAfterSectionStart(
      'modül-amaçları-2',
      breakout(
        'Kimlik ve hesap güvenliği',
        'fa-id-card',
        'Modül 3 — Kimlik üçlüsü',
        'Identification, authentication ve authorization birbirinin yerine geçmez.',
        card('fa-at', 'Identification', 'Kullanıcı adı/e-posta — <strong>kim olduğunu söyleme</strong>.') +
          card('fa-fingerprint', 'Authentication', 'Parola, MFA — <strong>kanıtlama</strong>.') +
          card('fa-user-lock', 'Authorization', 'Ne yapabilir? — <strong>yetki</strong> ve rol.') +
          card('fa-layer-group', 'Defense in depth', 'Parola + MFA + izleme birlikte çalışır.')
      )
    );

    addHeroImage(
      'büyük-resim-neden-kimlik-ve-hesap-güvenliği-kritik',
      'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=900&q=85',
      'Hesap ve kimlik güvenliği',
      'Hesaplar dijital erişimin anahtarıdır.'
    );

    insertAfterSelector(
      'ana-içerik',
      'h3',
      breakout(
        'Güvenli zemin katmanları',
        'fa-desktop',
        'Modül 4 — OS · Yazılım · Tarayıcı',
        'Güncelleme ve sıkılaştırma hesap güvenliğini tamamlar.',
        card('fa-sync-alt', 'Yama (patch)', 'Bilinen zafiyet penceresini kapatır.') +
          card('fa-cog', 'Sıkılaştırma', 'Gereksiz servis ve yetki kapatma.') +
          card('fa-globe', 'Tarayıcı', 'Eklenti, çerez, güvenli site alışkanlığı.') +
          card('fa-shield-virus', 'Malware önleme', 'İndirme ve çalıştırma disiplini.')
      )
    );

    insertAfterSelector(
      'ana-içerik-1',
      'h3',
      breakout(
        'Ağ ve veri koruma',
        'fa-network-wired',
        'Modül 5 — Ağ + kripto giriş',
        'IP/DNS, güvenli bağlantı ve temel şifreleme kavramları.',
        card('fa-sitemap', 'IP & DNS', 'Adresleme ve isim çözümleme.') +
          card('fa-lock', 'TLS / HTTPS', 'Aktarımda gizlilik ve bütünlük.') +
          card('fa-fire', 'Firewall', 'İzin ver / engelle — temel segmentasyon.') +
          card('fa-key', 'Şifreleme', 'Simetrik/asimetrik fikir düzeyi.')
      )
    );

    insertAfterSelector(
      'ana-içerik-2',
      'h3',
      breakout(
        'Etik ve hukuk',
        'fa-balance-scale',
        'Modül 6 — Etik · Hukuk · Uyumluluk',
        'Teknik yetenek, yazılı yetki ve yasal çerçeve olmadan kullanılmamalıdır.',
        card('fa-hand-paper', 'Etik', 'İzin, şeffaflık, zarar vermeme.') +
          card('fa-gavel', 'Hukuk', 'KVKK, suç tanımları, delil bütünlüğü.') +
          card('fa-clipboard-check', 'Uyumluluk', 'Politika ve standartlara uyum.') +
          card('fa-file-signature', 'ROE', 'Kapsam ve yazılı yetki belgesi.')
      )
    );

    insertAfterSelector(
      'ana-içerik-3',
      'h3',
      breakout(
        'Olay müdahalesi',
        'fa-ambulance',
        'Modül 7 — Olay yaşam döngüsü',
        'SOC ve müdahale ekipleri bu aşamaları sırayla işler.',
        card('fa-search', 'Tespit', 'Log, alarm, kullanıcı bildirimi.') +
          card('fa-filter', 'Triyaj', 'Öncelik ve etki sınıflandırması.') +
          card('fa-microscope', 'Analiz', 'Kök neden ve kapsam.') +
          card('fa-band-aid', 'Müdahale', 'İzolasyon, temizlik, iyileştirme.') +
          card('fa-book', 'Ders çıkarma', 'Rapor ve süreç iyileştirme.')
      )
    );

    insertAfterSelector(
      'ana-içerik-4',
      'h3',
      breakout(
        'Günlük farkındalık',
        'fa-shield-alt',
        'Modül 8 — Günlük alışkanlıklar',
        'Teknik kontroller + davranış = sürdürülebilir güvenlik.',
        card('fa-link', 'Bağlantı', 'Şüpheli link ve ek — doğrula.') +
          card('fa-wifi', 'Ağ', 'Herkese açık Wi-Fi riski; VPN bilinci.') +
          card('fa-mobile-alt', 'Cihaz', 'Kilit ekranı, güncelleme, yedek.') +
          card('fa-user-check', 'Hesap', 'MFA, benzersiz parola, parola yöneticisi.')
      )
    );

    addHeroImage(
      'modül-9-linux-siber-guvenlik-araçları',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&q=85',
      'Linux terminal ve güvenlik araçları',
      'Komut satırı — yalnızca yetkili lab ortamında pratik yapın.'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
