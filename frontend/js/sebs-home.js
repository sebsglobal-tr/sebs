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

    var mock = document.querySelector('.sh-hero__mock');
    if (mock) {
      window.addEventListener(
        'mousemove',
        function (ev) {
          var x = (ev.clientX / window.innerWidth - 0.5) * 6;
          var y = (ev.clientY / window.innerHeight - 0.5) * 4;
          mock.style.transform =
            'perspective(1200px) rotateY(' + (-6 + x * 0.3) + 'deg) rotateX(' + (4 + y * 0.2) + 'deg)';
        },
        { passive: true }
      );
    }
  } else {
    document.querySelectorAll('.sh-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  document.querySelectorAll('.landing-footer-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
