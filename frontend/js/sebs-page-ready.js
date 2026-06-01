(function () {
    'use strict';

    function hideLoadingOverlays() {
        document.querySelectorAll('.loading-overlay, #loadingOverlay').forEach(function (el) {
            el.classList.add('is-hidden');
            el.setAttribute('hidden', '');
            el.setAttribute('aria-hidden', 'true');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideLoadingOverlays);
    } else {
        hideLoadingOverlays();
    }

    window.addEventListener('load', hideLoadingOverlays);
})();
