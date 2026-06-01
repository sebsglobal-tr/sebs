/**
 * SEBS Simülasyon Analiz Motoru animasyonu
 * — Görünür alan dışında duraklatma (performans)
 * — prefers-reduced-motion: CSS statik durum
 */
(function () {
  'use strict';

  var section = document.getElementById('sebs-simulation-engine');
  if (!section) return;

  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        section.classList.toggle('is-paused', !entry.isIntersecting);
      });
    },
    { root: null, rootMargin: '80px 0px', threshold: 0.08 }
  );

  observer.observe(section);
})();
