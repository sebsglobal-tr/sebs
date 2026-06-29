/**
 * Modül içeriği: başlıklara konuya göre ikon, görünür bloklara hafif giriş animasyonu.
 * Web Uygulama Güvenliği seviyesinde görsel ritim için tamamlayıcı (CSS + bu script).
 */
(function () {
  'use strict';

  if (!document.querySelector('.module-layout')) return;
  if (document.body.classList.contains('module-page--temel-kriptografi')) return;

  var title = (document.title || '').toLowerCase();
  var path = (typeof location !== 'undefined' && location.pathname) ? location.pathname.toLowerCase() : '';

  function pickIcon(text) {
    var t = (text || '').toLowerCase();
    var hay = title + ' ' + path + ' ' + t;
    var pairs = [
      [/owasp|zafiyet|xss|csrf|injection|web|http|api|jwt|oauth|cookie|session|oturum|kimlik|auth/i, 'fa-shield-alt'],
      [/malware|zararl|yara|sandbox|reverse|imza|hash/i, 'fa-bug'],
      [/soc|siem|olay|log|izleme|alarm|playbook/i, 'fa-eye'],
      [/threat|hunt|avcı|istihbarat/i, 'fa-crosshairs'],
      [/incident|müdahale|dfir|forensic|kaza/i, 'fa-fire-extinguisher'],
      [/penetration|pentest|sızma|exploit|metasploit/i, 'fa-user-secret'],
      [/network|ağ|tcp|ip|firewall|segment|vlan/i, 'fa-network-wired'],
      [/cloud|aws|azure|gcp|iam|s3|bulut/i, 'fa-cloud'],
      [/kripto|şifre|aes|rsa|tls|anahtar/i, 'fa-key'],
      [/sosyal|phishing|oltalama|kimlik avı/i, 'fa-comments'],
      [/linux|windows|işletim|kernel|privilege/i, 'fa-server'],
      [/etik|yasal|roe|kapsam|kanıt/i, 'fa-scale-balanced'],
      [/veri|gdpr|maskeleme|şifreleme|koruma/i, 'fa-database'],
      [/risk|tehdit|model|zincir/i, 'fa-exclamation-triangle'],
    ];
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i][0].test(hay)) return pairs[i][1];
    }
    return 'fa-layer-group';
  }

  function wrapHeading(el) {
    if (!el || el.classList.contains('sebs-visual-heading')) return;
    if (el.querySelector('i[class*="fa-"]')) return;
    var text = el.textContent || '';
    var icon = pickIcon(text);
    el.classList.add('sebs-visual-heading');
    var span = document.createElement('span');
    span.className = 'sebs-visual-heading__icon';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<i class="fas ' + icon + '"></i>';
    el.insertBefore(span, el.firstChild);
  }

  function enhanceHeadings(root) {
    if (!root) return;
    root.querySelectorAll('.section-inner > h1, .section-inner > h2, .content-card.docx-content > h1').forEach(wrapHeading);
    root.querySelectorAll('.section-inner > h3').forEach(function (h3) {
      if (h3.closest('.learning-objectives')) return;
      wrapHeading(h3);
    });
  }

  function ioReveal() {
    if (!('IntersectionObserver' in window)) return;
    var sel = '.lesson-image-wrap, .kr-inline-breakout, .key-concept-card';
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('sebs-in-view');
          obs.unobserve(e.target);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    document.querySelectorAll(sel).forEach(function (el) {
      obs.observe(el);
    });
  }

  function run() {
    document.querySelectorAll('main .section-inner, main .content-card.docx-content').forEach(enhanceHeadings);
    ioReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
