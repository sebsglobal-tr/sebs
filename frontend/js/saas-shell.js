(function () {
    'use strict';
    var THEME_KEY = 'sebs-theme';

    function getSavedTheme() {
        try {
            return localStorage.getItem(THEME_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            // noop
        }
    }

    function resolveInitialTheme() {
        var saved = getSavedTheme();
        if (saved === 'dark' || saved === 'light') return saved;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    }

    function applyTheme(theme) {
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        var isDark = theme === 'dark';
        document.body.classList.toggle('theme-dark', isDark);
        document.body.classList.toggle('theme-light', !isDark);
    }

    function getThemeLabel(theme) {
        return theme === 'dark' ? 'Açık Tema' : 'Koyu Tema';
    }

    function isSimulationRoute() {
        var p = (window.location && window.location.pathname) ? window.location.pathname : '';
        if (!p) return false;
        if (p.indexOf('/simulation/') === 0) return true;
        if (p.indexOf('/simulasyonlar/') === 0) return true;
        return false;
    }

    function injectThemeToggle() {
        var headerBar = document.querySelector('header.fixed .mx-auto.flex');
        if (!headerBar) return;
        var rightActions = headerBar.querySelector('.flex.items-center.gap-1\\.5') || headerBar.querySelector('.flex.items-center.gap-2');
        if (!rightActions) return;

        if (document.getElementById('themeToggleBtn')) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'themeToggleBtn';
        btn.className = 'theme-toggle-btn rounded-full border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-ring sm:px-3 sm:text-sm';

        var current = document.documentElement.getAttribute('data-theme') || 'light';
        btn.textContent = getThemeLabel(current);

        btn.addEventListener('click', function () {
            var now = document.documentElement.getAttribute('data-theme') || 'light';
            var next = now === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            saveTheme(next);
            btn.textContent = getThemeLabel(next);
        });

        rightActions.insertBefore(btn, rightActions.firstChild);
    }

    function initTheme() {
        if (isSimulationRoute()) {
            document.body.classList.add('sebs-sim-theme-lock');
            return;
        }
        applyTheme(resolveInitialTheme());
        injectThemeToggle();
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
