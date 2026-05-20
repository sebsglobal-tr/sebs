/**
 * Big Five + kariyer testleri — paket kontrolü (İlk Adım veya üst)
 */
(function () {
    async function guard() {
        if (!window.AccessControl || !window.AccessControl.checkAssessmentAccess) {
            return;
        }
        const result = await window.AccessControl.checkAssessmentAccess();
        if (result.hasAccess) return;

        if (window.AccessControl.showAccessDeniedModal) {
            window.AccessControl.showAccessDeniedModal(result.message);
        } else {
            alert(result.message);
        }
        setTimeout(function () {
            window.location.href = '/fiyatlandirma?need=plan';
        }, 3500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', guard);
    } else {
        guard();
    }
})();
