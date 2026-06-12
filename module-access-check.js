/**
 * Modül sayfası erişim kontrolü — HTML/CSS’e dokunmaz.
 * localhost: kapalı. Canlı: modal + isteğe bağlı içerik gizleme (flash önleme).
 * Acil kapatma: sessionStorage.setItem('SEBS_MODULE_ACCESS_OFF', '1')
 */
(function () {
    'use strict';

    if (typeof window === 'undefined') return;

    try {
        if (window.sessionStorage && window.sessionStorage.getItem('SEBS_MODULE_ACCESS_OFF') === '1') {
            return;
        }
    } catch (e) {
        /* ignore */
    }

    function isLocalDevHost() {
        try {
            var h = window.location.hostname;
            return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
        } catch (err) {
            return false;
        }
    }

    if (isLocalDevHost()) {
        return;
    }

    var FREE_MODULE_SLUGS = ['guncel-siber-guvenlige-giris', 'coming-soon'];
    var guardStyleInjected = false;

    function moduleSlugFromPath() {
        var m = window.location.pathname.match(/\/modules\/([^/?#]+)/i);
        if (!m) return '';
        return String(m[1] || '')
            .replace(/\.html$/i, '')
            .toLowerCase();
    }

    function categoryFromSlug(slug) {
        if (['aws-temelleri', 'azure-cloud', 'gcp'].indexOf(slug) >= 0) return 'cloud';
        return 'cybersecurity';
    }

    function armContentGuard() {
        if (guardStyleInjected) return;
        guardStyleInjected = true;
        var style = document.createElement('style');
        style.id = 'sebs-module-access-guard-style';
        style.textContent =
            'html.sebs-module-guard-pending body{visibility:hidden!important}' +
            'html.sebs-module-guard-pending::before{content:"";position:fixed;inset:0;z-index:99998;' +
            'background:#fff;display:block}';
        (document.head || document.documentElement).appendChild(style);
        document.documentElement.classList.add('sebs-module-guard-pending');
    }

    function releaseContentGuard() {
        document.documentElement.classList.remove('sebs-module-guard-pending');
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[data-sebs-access-control="1"]')) {
                resolve();
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.setAttribute('data-sebs-access-control', '1');
            s.onload = function () {
                resolve();
            };
            s.onerror = function () {
                reject(new Error('access-control load failed'));
            };
            (document.head || document.documentElement).appendChild(s);
        });
    }

    function waitForAccessControl(maxMs) {
        var start = Date.now();
        return new Promise(function (resolve) {
            (function tick() {
                if (window.AccessControl && window.AccessControl.checkModuleAccess) {
                    resolve(true);
                    return;
                }
                if (Date.now() - start > maxMs) {
                    resolve(false);
                    return;
                }
                setTimeout(tick, 50);
            })();
        });
    }

    function syncSessionCookieIfAvailable() {
        if (typeof window.syncSebsSessionCookie === 'function') {
            return window.syncSebsSessionCookie();
        }
        return Promise.resolve();
    }

    async function runCheck() {
        var slug = moduleSlugFromPath();
        if (!slug) return;

        if (FREE_MODULE_SLUGS.indexOf(slug) >= 0) return;

        armContentGuard();

        try {
            await syncSessionCookieIfAvailable();
        } catch (e) {
            /* ignore */
        }

        var acReady = window.AccessControl && window.AccessControl.checkModuleAccess;
        if (!acReady) {
            try {
                await loadScript('/utils/access-control.js');
            } catch (loadErr) {
                console.warn('module-access-check: access-control yüklenemedi', loadErr);
                releaseContentGuard();
                return;
            }
            acReady = await waitForAccessControl(8000);
        }

        if (!acReady || !window.AccessControl.checkModuleAccess) {
            console.warn('module-access-check: AccessControl kullanılamıyor, sayfa açık bırakıldı');
            releaseContentGuard();
            return;
        }

        var category = categoryFromSlug(slug);
        var access;
        try {
            access = await window.AccessControl.checkModuleAccess(slug, category);
        } catch (err) {
            console.warn('module-access-check:', err);
            releaseContentGuard();
            return;
        }

        if (access && access.hasAccess) {
            releaseContentGuard();
            return;
        }

        releaseContentGuard();

        if (window.AccessControl.showAccessDeniedModal) {
            window.AccessControl.showAccessDeniedModal(
                (access && access.message) ||
                    'Bu modüle erişim için uygun paketi satın almanız gerekiyor.'
            );
        } else {
            alert(
                (access && access.message) ||
                    'Bu modüle erişim için uygun paketi satın almanız gerekiyor.'
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            runCheck();
        });
    } else {
        runCheck();
    }
})();
