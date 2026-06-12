(function (global) {
    if (typeof global === 'undefined') return;
    if (typeof global.SEBS_API_BASE_URL !== 'string') {
        global.SEBS_API_BASE_URL = '';
    }
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : undefined);
