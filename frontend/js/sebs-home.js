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
    var stepPoints = [
      { x: 238, y: 972, label: { dx: 0, dy: 52, anchor: 'middle' } },
      { x: 598, y: 498, label: { dx: 0, dy: 34, anchor: 'middle' } },
      { x: 762, y: 192, label: { dx: 0, dy: 24, anchor: 'middle' } }
    ];
    var progresses = [0.02, 0.5, 0.76];
    var animId = null;
    var animStart = 0;
    var animDuration = 6000;

    function syncPathAnchors() {
      var lenNow = trail.getTotalLength();
      var markers = viz.querySelectorAll('.sh-mountain-viz__marker');
      var labels = viz.querySelectorAll('.sh-mountain-viz__label');
      var runner = viz.querySelector('.sh-mountain-viz__runner');

      if (trailPulse && pathD) {
        trailPulse.setAttribute('d', pathD);
      }

      function ratioNearPoint(x, y) {
        var best = 0;
        var bestDist = Infinity;
        var samples = 120;
        for (var s = 0; s <= samples; s++) {
          var r = s / samples;
          var p = trail.getPointAtLength(lenNow * r);
          var d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
          if (d < bestDist) {
            bestDist = d;
            best = r;
          }
        }
        return best;
      }

      progresses = [];
      stepPoints.forEach(function (pt, i) {
        if (markers[i]) {
          markers[i].setAttribute('cx', pt.x);
          markers[i].setAttribute('cy', pt.y);
        }
        if (labels[i]) {
          labels[i].setAttribute('x', pt.x + pt.label.dx);
          labels[i].setAttribute('y', pt.y + pt.label.dy);
          labels[i].setAttribute('text-anchor', pt.label.anchor);
        }
        progresses[i] = ratioNearPoint(pt.x, pt.y);
      });

      if (runner && pathD) {
        runner.style.offsetPath = "path('" + pathD + "')";
      }
    }

    syncPathAnchors();

    var len = trail.getTotalLength();
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

    function runProgressLoop(ts) {
      if (!animStart) animStart = ts;
      if (!paused) {
        var p = ((ts - animStart) % animDuration) / animDuration;
        setProgress(p);
        var step = p < progresses[1] ? 0 : p < progresses[2] ? 1 : 2;
        if (step !== activeStep) {
          activeStep = step;
          setMarkers(step);
          cards.forEach(function (c) {
            c.classList.toggle('is-active', parseInt(c.getAttribute('data-path-step'), 10) === step);
          });
        }
      }
      animId = requestAnimationFrame(runProgressLoop);
    }

    function resumeAnimation() {
      paused = false;
      viz.classList.remove('is-paused');
    }

    if (autoPlay) {
      viz.classList.add('is-animated');
      activateStep(0, false);
      animId = requestAnimationFrame(runProgressLoop);
    } else {
      viz.classList.remove('is-animated');
      if (trailPulse) {
        trailPulse.style.strokeDashoffset = '0';
      }
      setProgress(1);
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

  function initSkillHub() {
    var hub = document.getElementById('shSkillHub');
    if (!hub) return;

    var scoreEl = hub.querySelector('[data-count-target]');
    var barEl = hub.querySelector('[data-bar-target]');
    var targetScore = scoreEl
      ? parseFloat(scoreEl.getAttribute('data-count-target'), 10)
      : 0;
    var targetBar = barEl ? parseFloat(barEl.getAttribute('data-bar-target'), 10) : 0;

    function activate() {
      if (hub.classList.contains('is-visible')) return;
      hub.classList.add('is-visible');
      if (barEl && targetBar) {
        barEl.style.setProperty('--sh-bar-target', String(targetBar));
      }
      if (!scoreEl || !targetScore) return;
      if (reduced) {
        scoreEl.textContent = String(Math.round(targetScore));
        return;
      }
      var countDelay = 520;
      var duration = 2400;
      window.setTimeout(function () {
        var start = performance.now();
        function frame(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 4);
          scoreEl.textContent = String(Math.round(targetScore * eased));
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }, countDelay);
    }

    if (reduced) {
      if (barEl && targetBar) {
        barEl.style.setProperty('--sh-bar-target', String(targetBar));
      }
      if (scoreEl && targetScore) {
        scoreEl.textContent = String(Math.round(targetScore));
      }
      hub.classList.add('is-visible');
      return;
    }

    if ('IntersectionObserver' in window) {
      var hubIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              activate();
              hubIo.unobserve(hub);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.15 }
      );
      hubIo.observe(hub);
    } else {
      activate();
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
    initSkillHub();

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
    initSkillHub();
  }

  document.querySelectorAll('.landing-footer-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
