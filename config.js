/* ============================================
 * SEBS Global — Merkezi Yapılandırma
 * ============================================
 * Bu dosya window.SEBS_API_BASE_URL değişkenini
 * tanımlar. Detaylı API base URL mantığı için
 * js/api-base.js dosyasına bakın.
 * ============================================ */

(function (global) {
    if (typeof global === 'undefined') return;

    var SEBS_VERSION = '1.0.0';
    var API_BASE = global.SEBS_API_BASE_URL || '';
    var SITE_NAME = 'SEBS Global';
    var SITE_URL = 'https://sebsglobal.com';

    global.SEBS_CONFIG = {
        version: SEBS_VERSION,
        siteName: SITE_NAME,
        siteUrl: SITE_URL,
        apiBaseUrl: API_BASE
    };

    /* API base URL override: HTML <meta name="sebs-api-base" content="..."> ile değiştirilebilir */
    if (typeof global.document !== 'undefined') {
        var meta = global.document.querySelector('meta[name="sebs-api-base"]');
        if (meta && meta.getAttribute('content')) {
            global.SEBS_CONFIG.apiBaseUrl = meta.getAttribute('content');
        }
    }

    /* Eski API (geriye dönük uyumluluk) */
    if (typeof global.SEBS_API_BASE_URL !== 'string') {
        global.SEBS_API_BASE_URL = global.SEBS_CONFIG.apiBaseUrl;
    }
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : undefined);
