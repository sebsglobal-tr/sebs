/**
 * Modül sayfalarında doğrudan URL erişimini paket satın alımına bağlar.
 * module-access-check.js üzerinden yüklenir.
 */
(function () {
    'use strict';

    const SKIP_SLUGS = new Set(['coming-soon', 'ag-guvenligi', 'temel-siber-guvenlik']);

    const CATEGORY_BY_SLUG = {
        'aws-temelleri': 'cloud',
        'azure-cloud': 'cloud',
        gcp: 'cloud'
    };

    function slugFromPath() {
        const m = window.location.pathname.match(/\/modules\/([^/?#]+)\.html/i);
        return m ? m[1].toLowerCase() : '';
    }

    function categoryForSlug(slug) {
        return CATEGORY_BY_SLUG[slug] || 'cybersecurity';
    }

    function hasAuthToken() {
        if (localStorage.getItem('authToken')) return true;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && /^sb-.*-auth-token$/.test(key)) {
                    const raw = localStorage.getItem(key);
                    if (!raw) continue;
                    const data = JSON.parse(raw);
                    const at =
                        data?.access_token ||
                        data?.session?.access_token ||
                        data?.currentSession?.access_token;
                    if (at && typeof at === 'string' && at.length > 20) return true;
                }
            }
        } catch (e) {
            /* ignore */
        }
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    function dimPageContent() {
        document.documentElement.classList.add('sebs-access-blocked');
        document.body.classList.add('sebs-access-blocked');
        const targets = document.querySelectorAll(
            'main, .module-layout, .module-shell, .premium-module-layout, .coming-soon-container'
        );
        targets.forEach((el) => {
            el.setAttribute('aria-hidden', 'true');
            el.style.filter = 'blur(6px)';
            el.style.pointerEvents = 'none';
            el.style.userSelect = 'none';
        });
    }

    async function runGate() {
        const slug = slugFromPath();
        if (!slug || SKIP_SLUGS.has(slug)) return;

        if (!hasAuthToken()) {
            const redirect = encodeURIComponent(
                window.location.pathname + window.location.search + window.location.hash
            );
            window.location.replace('/login.html?redirect=' + redirect);
            return;
        }

        if (!window.AccessControl || typeof window.AccessControl.checkModuleAccess !== 'function') {
            console.warn('module-access-gate: AccessControl yüklenemedi');
            return;
        }

        const category = categoryForSlug(slug);
        const access = await window.AccessControl.checkModuleAccess(slug, category);

        if (access.hasAccess) return;

        dimPageContent();
        if (typeof window.AccessControl.showAccessDeniedModal === 'function') {
            window.AccessControl.showAccessDeniedModal(access.message);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runGate);
    } else {
        runGate();
    }
})();
