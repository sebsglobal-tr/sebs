(function () {
    'use strict';

    function applyTheme(theme) {
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        document.body.classList.toggle('theme-dark', theme === 'dark');
        document.body.classList.toggle('theme-light', theme !== 'dark');
    }

    function initTheme() {
        applyTheme('light');
    }

    function setFooterYear() {
        document.querySelectorAll('.saas-footer-year').forEach(function (el) {
            el.textContent = String(new Date().getFullYear());
        });
    }

    function nudgeLazyImagesInActiveSection() {
        if (!document.body.classList.contains('landing-site-body')) return;
        var sec = document.querySelector('.content-section.active');
        if (!sec) return;
        sec.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
            if (img.complete && img.naturalHeight > 0) return;
            img.loading = 'eager';
        });
    }

    function wireLandingModuleLazyImages() {
        if (!document.body.classList.contains('landing-site-body')) return;
        document.addEventListener(
            'click',
            function (ev) {
                if (!ev.target || !ev.target.closest || !ev.target.closest('.nav-link-section')) return;
                window.requestAnimationFrame(function () {
                    window.requestAnimationFrame(nudgeLazyImagesInActiveSection);
                });
            },
            true
        );
    }

    function init() {
        initTheme();
        setFooterYear();
        wireLandingModuleLazyImages();
        nudgeLazyImagesInActiveSection();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
