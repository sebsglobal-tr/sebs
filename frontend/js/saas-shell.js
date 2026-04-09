/* Footer year and other lightweight shell helpers (pages without navigation.js). */
(function () {
    'use strict';
    function setFooterYear() {
        document.querySelectorAll('.saas-footer-year').forEach(function (el) {
            el.textContent = String(new Date().getFullYear());
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setFooterYear);
    } else {
        setFooterYear();
    }
})();
