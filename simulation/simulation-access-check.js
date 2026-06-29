/**
 * Simülasyon sayfası erişim kontrolü — satın alınan paket kademesine göre.
 * Acil kapatma: sessionStorage.setItem('SEBS_SIMULATION_ACCESS_OFF', '1')
 */
(function () {
    'use strict';

    if (typeof window === 'undefined') return;

    try {
        if (window.sessionStorage && window.sessionStorage.getItem('SEBS_SIMULATION_ACCESS_OFF') === '1') {
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

    var guardStyleInjected = false;

    function armContentGuard() {
        if (guardStyleInjected) return;
        guardStyleInjected = true;
        var style = document.createElement('style');
        style.id = 'sebs-simulation-access-guard-style';
        style.textContent =
            'html.sebs-simulation-guard-pending body{visibility:hidden!important}' +
            'html.sebs-simulation-guard-pending::before{content:"";position:fixed;inset:0;z-index:99998;' +
            'background:#fff;display:block}';
        (document.head || document.documentElement).appendChild(style);
        document.documentElement.classList.add('sebs-simulation-guard-pending');
    }

    function releaseContentGuard() {
        document.documentElement.classList.remove('sebs-simulation-guard-pending');
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
                if (window.AccessControl && window.AccessControl.checkSimulationAccess) {
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
        var path = window.location.pathname || '';
        if (!/\/simulation\//i.test(path)) return;

        armContentGuard();

        try {
            await syncSessionCookieIfAvailable();
        } catch (e) {
            /* ignore */
        }

        var acReady = window.AccessControl && window.AccessControl.checkSimulationAccess;
        if (!acReady) {
            try {
                await loadScript('/utils/access-control.js');
            } catch (loadErr) {
                console.warn('simulation-access-check: access-control yüklenemedi', loadErr);
                releaseContentGuard();
                return;
            }
            acReady = await waitForAccessControl(8000);
        }

        if (!acReady || !window.AccessControl.checkSimulationAccess) {
            console.warn('simulation-access-check: AccessControl kullanılamıyor, sayfa açık bırakıldı');
            releaseContentGuard();
            return;
        }

        var access;
        try {
            access = await window.AccessControl.checkSimulationAccess(path, 'cybersecurity');
        } catch (err) {
            console.warn('simulation-access-check:', err);
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
                    'Bu simülasyona erişim için uygun SEBS Yolu planını satın almanız gerekiyor.'
            );
        } else {
            alert(
                (access && access.message) ||
                    'Bu simülasyona erişim için uygun SEBS Yolu planını satın almanız gerekiyor.'
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
