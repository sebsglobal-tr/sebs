/**
 * Ertay-style services panels — expand active column on desktop
 */
(function () {
  'use strict';

  var panels = document.querySelectorAll('.ertay-service-panel');
  if (!panels.length) return;

  function setActive(panel) {
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p === panel);
    });
  }

  panels.forEach(function (panel) {
    panel.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setActive(panel);
      }
    });
    panel.addEventListener('focus', function () {
      setActive(panel);
    });
    panel.addEventListener('click', function () {
      setActive(panel);
    });
  });

  if (!panels[0].classList.contains('is-active')) {
    panels[0].classList.add('is-active');
  }
})();
