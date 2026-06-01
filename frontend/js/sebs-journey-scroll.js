/**
 * SEBS Journey Scroll — pinned scene narrative (vanilla, no deps)
 */
(function () {
  'use strict';

  var root = document.getElementById('sebs-journey-scroll');
  if (!root) return;

  var track = root.querySelector('.sebs-journey-scroll__track');
  var copyPanels = root.querySelectorAll('.sebs-journey-scroll__copy');
  var mockups = root.querySelectorAll('.sebs-journey-scroll__mockup');
  var stepBtns = root.querySelectorAll('.sebs-journey-scroll__step-btn');
  var progressFill = root.querySelector('.sebs-journey-scroll__progress-fill');
  var progressLabel = root.querySelector('.sebs-journey-scroll__progress-label');
  var sceneCount = copyPanels.length;

  if (!sceneCount) return;

  var motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return motionMq.matches;
  }
  var ticking = false;
  var currentScene = 0;

  function setScene(index) {
    index = Math.max(0, Math.min(sceneCount - 1, index));
    if (index === currentScene && root.getAttribute('data-scene') === String(index)) return;
    currentScene = index;
    root.setAttribute('data-scene', String(index));

    copyPanels.forEach(function (panel, i) {
      var active = i === index;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    mockups.forEach(function (mock, i) {
      var active = i === index;
      mock.classList.toggle('is-active', active);
      mock.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    stepBtns.forEach(function (btn, i) {
      var active = i === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-current', active ? 'step' : 'false');
    });

    if (progressLabel) {
      progressLabel.textContent = '0' + (index + 1) + ' / 0' + sceneCount;
    }
  }

  function updateFromScroll() {
    if (!track || prefersReducedMotion() || window.innerWidth < 1024) return;

    var rect = track.getBoundingClientRect();
    var trackHeight = track.offsetHeight;
    var viewport = window.innerHeight;
    var scrollable = Math.max(1, trackHeight - viewport);
    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / scrollable));

    var index = Math.min(sceneCount - 1, Math.floor(progress * sceneCount));
    if (progress >= 0.999) index = sceneCount - 1;

    setScene(index);

    if (progressFill) {
      var fillPct = ((index + 1) / sceneCount) * 100;
      var blend = (progress * sceneCount - index) * (100 / sceneCount);
      progressFill.style.width = Math.min(100, fillPct - (100 / sceneCount) + blend) + '%';
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        updateFromScroll();
        ticking = false;
      });
    }
  }

  function scrollToScene(index) {
    if (!track || prefersReducedMotion() || window.innerWidth < 1024) return;
    var trackTop = track.getBoundingClientRect().top + window.scrollY;
    var scrollable = track.offsetHeight - window.innerHeight;
    var segment = scrollable / sceneCount;
    var target = trackTop + segment * index + segment * 0.15;
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  stepBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      scrollToScene(i);
    });
  });

  function bindScroll() {
    if (prefersReducedMotion() || window.innerWidth < 1024) return;
    updateFromScroll();
  }

  if (typeof motionMq.addEventListener === 'function') {
    motionMq.addEventListener('change', bindScroll);
  } else if (typeof motionMq.addListener === 'function') {
    motionMq.addListener(bindScroll);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  setScene(0);
  bindScroll();
})();
