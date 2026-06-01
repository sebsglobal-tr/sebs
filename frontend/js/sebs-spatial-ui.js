/**
 * SEBS Spatial UI — services list highlight + reduced-motion safe
 */
(function () {
  'use strict';

  var services = document.querySelectorAll('.sebs-spatial-service');
  if (services.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    services.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        services.forEach(function (s) {
          s.classList.remove('is-active');
        });
        item.classList.add('is-active');
      });
    });
    services[0].classList.add('is-active');
  }

  var marquee = document.querySelector('.sebs-spatial-marquee__track');
  if (marquee && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    marquee.style.animation = 'none';
    marquee.style.flexWrap = 'wrap';
    marquee.style.justifyContent = 'center';
    marquee.style.width = '100%';
  }
})();
