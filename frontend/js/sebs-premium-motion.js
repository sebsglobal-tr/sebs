/**
 * SEBS Premium Motion — GSAP scroll reveals + hero (Lenis yok: journey scroll uyumu)
 */
(function () {
  'use strict';

  if (!document.body || !document.body.classList.contains('sebs-premium-site')) {
    return;
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markVisible() {
    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (reduced) {
    markVisible();
    return;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
  var ST = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';

  Promise.all([loadScript(GSAP), loadScript(ST)])
    .then(function () {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        fallbackReveal();
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      document.body.classList.add('sebs-motion-ready');
      window.__sebsPremiumGsap = true;

      runHeroIntro();
      runScrollReveals();

      /* Alt sayfalarda yumuşak scroll (journey pin yok) */
      if (!document.getElementById('sebs-journey-scroll')) {
        return loadScript('https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js').then(function () {
          if (typeof Lenis === 'undefined') return;
          var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
          function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
        });
      }
    })
    .catch(fallbackReveal);

  function runHeroIntro() {
    var inner = document.querySelector('.ertay-hero__inner');
    var preview = document.querySelector('.sebs-hero-preview');
    if (!inner) return;

    gsap.set(inner.children, { opacity: 0, y: 32 });
    if (preview) gsap.set(preview, { opacity: 0, y: 40, scale: 0.98 });

    gsap.to(inner.children, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.09,
      ease: 'power3.out',
      delay: 0.12,
    });

    if (preview) {
      gsap.to(preview, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        delay: 0.35,
      });
    }
  }

  function runScrollReveals() {
    var nodes = document.querySelectorAll(
      '.reveal-on-scroll:not(.sebs-journey-scroll__mobile-card)'
    );

    nodes.forEach(function (el) {
      if (el.closest('#sebs-journey-scroll')) return;

      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          onComplete: function () {
            el.classList.add('is-visible');
          },
        }
      );
    });

    /* Journey mobil kartları — hafif stagger */
    var journeyCards = document.querySelectorAll('.sebs-journey-scroll__mobile-card.reveal-on-scroll');
    if (journeyCards.length) {
      gsap.from(journeyCards, {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: journeyCards[0].parentElement,
          start: 'top 85%',
        },
        onComplete: function () {
          journeyCards.forEach(function (c) {
            c.classList.add('is-visible');
          });
        },
      });
    }
  }

  function fallbackReveal() {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
        io.observe(el);
      });
    } else {
      markVisible();
    }
  }
})();
