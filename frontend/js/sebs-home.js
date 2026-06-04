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

  function initHeroFlowEvaluation() {
    var viewport = document.querySelector('.sh-hero-flow__viewport');
    var hub = document.querySelector('.sh-hero-flow__hub');
    var cards = document.querySelectorAll('.sh-hero-flow .sh-flow-card');
    if (!viewport || !hub || !cards.length) return;

    function updateCards() {
      var hubRect = hub.getBoundingClientRect();
      var hubCenter = hubRect.left + hubRect.width / 2;
      var gateIn = Math.max(hubRect.width * 0.48, 52);

      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var result = card.getAttribute('data-result');

        card.classList.remove('is-pending', 'is-processing', 'is-positive', 'is-negative');

        if (cx > hubCenter + gateIn) {
          card.classList.add('is-pending');
        } else if (cx < hubCenter - gateIn) {
          if (result === 'negative') {
            card.classList.add('is-negative');
          } else {
            card.classList.add('is-positive');
          }
        } else {
          card.classList.add('is-processing');
        }
      });

      requestAnimationFrame(updateCards);
    }

    requestAnimationFrame(updateCards);
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

    initHeroFlowEvaluation();

    var flowCube = document.querySelector('.sh-hero-flow__cube');
    var flowWrap = document.querySelector('.sh-hero-flow');
    if (flowCube && flowWrap) {
      window.addEventListener(
        'mousemove',
        function (ev) {
          var rect = flowWrap.getBoundingClientRect();
          var cx = (ev.clientX - rect.left) / rect.width - 0.5;
          var cy = (ev.clientY - rect.top) / rect.height - 0.5;
          flowCube.style.transform =
            'perspective(900px) rotateY(' + (-14 + cx * 10) + 'deg) rotateX(' + (10 + cy * 6) + 'deg) translateZ(0)';
        },
        { passive: true }
      );
    }
  } else {
    document.querySelectorAll('.sh-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.sh-flow-card').forEach(function (card) {
      var result = card.getAttribute('data-result');
      if (result === 'negative') {
        card.classList.add('is-negative');
      } else {
        card.classList.add('is-positive');
      }
    });
  }

  document.querySelectorAll('.landing-footer-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
