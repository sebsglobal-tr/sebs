(function () {
    'use strict';

    const SKIP = new Set(['web-app-security']);

    function slugFromPath() {
        const m = window.location.pathname.match(/\/simulation\/([^/?#]+)\.html/i);
        return m ? m[1].toLowerCase() : '';
    }

    function hasAuthToken() {
        if (localStorage.getItem('authToken')) return true;
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    async function runGate() {
        const slug = slugFromPath();
        if (!slug || SKIP.has(slug)) return;

        if (!hasAuthToken()) {
            const redirect = encodeURIComponent(
                window.location.pathname + window.location.search + window.location.hash
            );
            window.location.replace('/login.html?redirect=' + redirect);
            return;
        }

        if (!window.AccessControl?.checkSimulationAccess) return;

        const access = await window.AccessControl.checkSimulationAccess(slug, 'cybersecurity');
        if (access.hasAccess) return;

        document.documentElement.classList.add('sebs-access-blocked');
        const main = document.querySelector('main, .simulation-container, .container');
        if (main) {
            main.style.filter = 'blur(6px)';
            main.style.pointerEvents = 'none';
        }
        window.AccessControl.showAccessDeniedModal(access.message);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runGate);
    } else {
        runGate();
    }
})();
