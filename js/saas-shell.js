(function () {
    'use strict';
    var THEME_KEY = 'sebs-theme';

    function getSavedTheme() {
        try {
            var v = localStorage.getItem(THEME_KEY);
            if (v === 'dark' || v === 'light') return v;
            var legacy = localStorage.getItem('theme');
            if (legacy === 'dark' || legacy === 'light') {
                localStorage.setItem(THEME_KEY, legacy);
                return legacy;
            }
            return '';
        } catch (e) {
            return '';
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
            localStorage.setItem('theme', theme);
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

    function syncThemeToggleButton(btn) {
        if (!btn) return;
        var theme = document.documentElement.getAttribute('data-theme') || 'light';
        var dark = theme === 'dark';
        btn.classList.toggle('is-dark', dark);
        btn.setAttribute('aria-checked', dark ? 'true' : 'false');
        btn.setAttribute('title', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
    }

    function isAppShellPage() {
        return document.body && document.body.classList.contains('sebs-app-page');
    }

    function isSimulationRoute() {
        var p = (window.location && window.location.pathname) ? window.location.pathname : '';
        if (!p) return false;
        if (p.indexOf('/simulation/') === 0) return true;
        if (p.indexOf('/simulasyonlar') === 0) return true;
        return false;
    }

    function isListingShellPage() {
        var p = (window.location && window.location.pathname) ? window.location.pathname : '';
        if (!p) return false;
        return (
            p === '/simulasyonlar' ||
            p === '/simulations.html' ||
            p === '/egitimler' ||
            p === '/modules.html' ||
            p === '/hakkimizda' ||
            p === '/about.html'
        );
    }

    function injectThemeToggle() {
        if (document.getElementById('themeToggleBtn')) return;

        var headerBar = document.querySelector('header.fixed .mx-auto.flex');
        var rightActions = headerBar
            ? headerBar.querySelector('.flex.items-center.gap-1\\.5') || headerBar.querySelector('.flex.items-center.gap-2')
            : null;

        var mount = document.getElementById('userMenuThemeMount');
        if (!mount && !rightActions) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'themeToggleBtn';
        btn.className = 'theme-toggle-btn theme-toggle-switch focus-ring';
        btn.setAttribute('role', 'switch');
        btn.setAttribute('aria-label', 'Koyu tema');
        /* İkonlar yalnızca ortadaki mandalda: gündüz = güneş, gece = ay */
        btn.innerHTML =
            '<span class="theme-toggle-knob" aria-hidden="true">' +
            '<span class="theme-toggle-knob-face theme-toggle-knob-face--sun">' +
            '<svg class="theme-toggle-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path fill="currentColor" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"/>' +
            '</svg></span>' +
            '<span class="theme-toggle-knob-face theme-toggle-knob-face--moon">' +
            '<svg class="theme-toggle-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path fill="currentColor" fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>' +
            '</svg></span></span>';
        syncThemeToggleButton(btn);

        btn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var now = document.documentElement.getAttribute('data-theme') || 'light';
            var next = now === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            saveTheme(next);
            syncThemeToggleButton(btn);
        });

        if (mount) {
            mount.appendChild(btn);
        } else {
            rightActions.appendChild(btn);
        }
    }

    function initTheme() {
        /* Eğitimler / Simülasyonlar — ana sayfa ile aynı açık tema */
        if (isListingShellPage()) {
            applyTheme('light');
            injectThemeToggle();
            return;
        }
        /* Uygulama shell (modül içi vb.) — koyu */
        if (isAppShellPage()) {
            document.body.classList.add('sebs-sim-theme-lock');
            applyTheme('dark');
            injectThemeToggle();
            return;
        }
        if (isSimulationRoute()) {
            document.body.classList.add('sebs-sim-theme-lock');
            applyTheme('dark');
            injectThemeToggle();
            return;
        }
        applyTheme(resolveInitialTheme());
        injectThemeToggle();
    }

    function setFooterYear() {
        document.querySelectorAll('.saas-footer-year').forEach(function (el) {
            el.textContent = '2025';
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
