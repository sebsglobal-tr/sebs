/**
 * SEBS Premium Animations — görünür alan dışında duraklatma
 * Tüm .sebs-anim-section ve #sebs-simulation-engine bölümleri
 */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  var selectors = '.sebs-anim-section, #sebs-simulation-engine';
  var sections = document.querySelectorAll(selectors);
  if (!sections.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      });
    },
    { root: null, rootMargin: '60px 0px', threshold: 0.06 }
  );

  sections.forEach(function (el) {
    observer.observe(el);
  });
})();
