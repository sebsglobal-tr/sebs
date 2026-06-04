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

    var heroFlow = document.querySelector('.sh-hero-flow.sh-reveal');
    if (heroFlow) {
      heroFlow.classList.add('is-visible');
    }
  } else {
    document.querySelectorAll('.sh-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    initHeroFlowEvaluation(false);
  }

  document.querySelectorAll('.landing-footer-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
