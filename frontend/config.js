/**
 * İsteğe bağlı kök yapılandırma (simülasyon / modül sayfalarında ../config.js ile yüklenir).
 * API adresi: dolu SEBS_API_BASE_URL → js/api-base.js içinde önceliklidir; boşsa api-base host mantığı kullanılır.
 */
(function (global) {
    if (typeof global === 'undefined') return;
    if (typeof global.SEBS_API_BASE_URL !== 'string') {
        global.SEBS_API_BASE_URL = '';
    }
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : undefined);
