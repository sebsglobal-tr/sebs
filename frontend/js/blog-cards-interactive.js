/**
 * Blog liste kartlari — hafif 3D egim (fare). prefers-reduced-motion: kapali.
 */
(function () {
  var cards = document.querySelectorAll('.blog-card--interactive');
  if (!cards.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  var maxTilt = 5;

  cards.forEach(function (card) {
    card.addEventListener(
      'mousemove',
      function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--tilt-x', String(-py * maxTilt));
        card.style.setProperty('--tilt-y', String(px * maxTilt));
      },
      { passive: true }
    );

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--tilt-x', '0');
      card.style.setProperty('--tilt-y', '0');
    });
  });
})();
