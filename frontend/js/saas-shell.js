/* Footer year and other lightweight shell helpers (pages without navigation.js). */
(function () {
    'use strict';
    function setFooterYear() {
        document.querySelectorAll('.saas-footer-year').forEach(function (el) {
            el.textContent = String(new Date().getFullYear());
        });
    }

    /** Gizli .content-section içindeki lazy img bazen bölüm açılınca yüklenmez; bölüm değişiminde dürt. */
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
