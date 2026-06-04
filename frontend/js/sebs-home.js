(function () {
  'use strict';

  var nav = document.getElementById('shNav');
  var burger = document.getElementById('shNavBurger');
  var mobileMenu = document.getElementById('shMobileMenu');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  function initMountainPath() {
    var viz = document.getElementById('shMountainViz');
    var trail = document.getElementById('shMountainTrail');
    var trailPulse = viz ? viz.querySelector('.sh-mountain-viz__trail-pulse') : null;
    var cards = document.querySelectorAll('.sh-path-card[data-path-step]');
    if (!viz || !trail || !cards.length) return;

    var pathD = trail.getAttribute('d');
    var pathSteps = [0.04, 0.48, 0.74];
    var labelOffsets = [
      { dx: 0, dy: 74, anchor: 'middle' },
      { dx: 44, dy: 6, anchor: 'start' },
      { dx: 44, dy: 6, anchor: 'start' }
    ];

    function syncPathAnchors() {
      var lenNow = trail.getTotalLength();
      var markers = viz.querySelectorAll('.sh-mountain-viz__marker');
      var labels = viz.querySelectorAll('.sh-mountain-viz__label');
      var runner = viz.querySelector('.sh-mountain-viz__runner');

      if (trailPulse && pathD) {
        trailPulse.setAttribute('d', pathD);
      }

      pathSteps.forEach(function (ratio, i) {
        var pt = trail.getPointAtLength(lenNow * ratio);
        if (markers[i]) {
          markers[i].setAttribute('cx', pt.x);
          markers[i].setAttribute('cy', pt.y);
        }
        if (labels[i]) {
          labels[i].setAttribute('x', pt.x + labelOffsets[i].dx);
          labels[i].setAttribute('y', pt.y + labelOffsets[i].dy);
          labels[i].setAttribute('text-anchor', labelOffsets[i].anchor);
        }
      });

      if (runner && pathD) {
        runner.style.offsetPath = "path('" + pathD + "')";
      }
    }

    syncPathAnchors();

    var len = trail.getTotalLength();
    var progresses = pathSteps.slice();
    if (trailPulse) {
      trailPulse.style.strokeDasharray = len;
      trailPulse.style.strokeDashoffset = String(len);
    }
    viz.style.setProperty('--sh-mt-len', String(len));

    var markers = viz.querySelectorAll('.sh-mountain-viz__marker');
    var labels = viz.querySelectorAll('.sh-mountain-viz__label');
    var runner = viz.querySelector('.sh-mountain-viz__runner');
    var autoPlay = !reduced;
    var paused = false;
    var activeStep = 0;

    function setMarkers(step) {
      markers.forEach(function (m) {
        var s = parseInt(m.getAttribute('data-path-step'), 10);
        m.classList.toggle('is-active', s === step);
      });
      labels.forEach(function (l) {
        var s = parseInt(l.getAttribute('data-path-step'), 10);
        l.classList.toggle('is-active', s === step);
      });
    }

    function setProgress(p) {
      var offset = len * (1 - Math.min(1, Math.max(0, p)));
      if (trailPulse) {
        trailPulse.style.strokeDashoffset = String(offset);
      }
      if (runner) {
        runner.style.offsetDistance = Math.round(p * 100) + '%';
        runner.style.opacity = '1';
      }
    }

    function activateStep(step, freeze) {
      activeStep = step;
      cards.forEach(function (c) {
        c.classList.toggle('is-active', parseInt(c.getAttribute('data-path-step'), 10) === step);
      });
      setMarkers(step);
      if (freeze) {
        viz.classList.add('is-paused');
        paused = true;
        setProgress(progresses[step] !== undefined ? progresses[step] : 1);
      }
    }

    function resumeAnimation() {
      paused = false;
      viz.classList.remove('is-paused');
      if (trailPulse) {
        trailPulse.style.strokeDashoffset = String(len);
      }
      if (runner) {
        runner.style.offsetDistance = '';
        runner.style.opacity = '';
      }
    }

    if (autoPlay) {
      viz.classList.add('is-animated');
      activateStep(0, false);
    } else {
      viz.classList.remove('is-animated');
      if (trailPulse) {
        trailPulse.style.strokeDashoffset = '0';
      }
      activateStep(2, false);
    }

    cards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      function onFocus() {
        var step = parseInt(card.getAttribute('data-path-step'), 10);
        activateStep(step, true);
      }
      card.addEventListener('mouseenter', onFocus);
      card.addEventListener('focus', onFocus);
    });

    var pathCards = document.querySelector('.sh-path-cards');
    if (pathCards && autoPlay) {
      pathCards.addEventListener('mouseleave', resumeAnimation);
    }
  }

  function initHeroFlowEvaluation(continuous) {
    var gate = document.querySelector('.sh-hero-flow__gate');
    var cards = document.querySelectorAll('.sh-hero-flow .sh-flow-card');
    if (!gate || !cards.length) return;

    cards.forEach(function (card) {
      card.classList.add('is-pending');
    });

    function updateCards() {
      var gateRect = gate.getBoundingClientRect();
      var gateLeft = gateRect.left;
      var gateRight = gateRect.right;
      var zonePad = 10;

      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var cardCx = rect.left + rect.width / 2;
        var result = card.getAttribute('data-result');

        card.classList.remove('is-pending', 'is-processing', 'is-positive', 'is-negative');

        if (cardCx > gateRight + zonePad) {
          card.classList.add('is-pending');
        } else if (cardCx < gateLeft - zonePad) {
          if (result === 'negative') {
            card.classList.add('is-negative');
          } else {
            card.classList.add('is-positive');
          }
        } else {
          card.classList.add('is-processing');
        }
      });
    }

    if (continuous) {
      function tick() {
        updateCards();
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    } else {
      updateCards();
      window.addEventListener('resize', updateCards, { passive: true });
    }
  }

  if (!reduced) {
    var reveals = document.querySelectorAll('.sh-reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
      );
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    initHeroFlowEvaluation(true);
    initMountainPath();

    var heroFlow = document.querySelector('.sh-hero-flow.sh-reveal');
    if (heroFlow) {
      heroFlow.classList.add('is-visible');
    }
  } else {
    document.querySelectorAll('.sh-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    initHeroFlowEvaluation(false);
    initMountainPath();
  }

  document.querySelectorAll('.landing-footer-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
