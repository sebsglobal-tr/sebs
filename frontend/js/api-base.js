/**
 * Backend API kökü (…/api). Statik site ayrı origin’deyse burada tam adresi verin.
 *
 * Örnek (HTML’de bu dosyadan ÖNCE):
 *   <script>window.SEBS_API_BASE_URL = 'https://api.sizin-domain.com';</script>
 *
 * Veya Vite: VITE_API_BASE_URL — build çıktısında window’a yazılır.
 */
(function (global) {
    function normalizeApiBase(raw) {
        if (!raw || typeof raw !== 'string') return '';
        var u = raw.trim().replace(/\/$/, '');
        if (!u) return '';
        if (u.endsWith('/api')) return u;
        return u + '/api';
    }

    global.getSebsApiBase = function getSebsApiBase() {
        var fromWindow =
            (typeof global.SEBS_API_BASE_URL === 'string' && global.SEBS_API_BASE_URL.trim()) ||
            (typeof global.VITE_API_BASE_URL === 'string' && global.VITE_API_BASE_URL.trim()) ||
            '';
        var n = normalizeApiBase(fromWindow);
        if (n) return n;
        if (global.location && global.location.origin) {
            return global.location.origin.replace(/\/$/, '') + '/api';
        }
        return 'http://localhost:8006/api';
    };
})(typeof window !== 'undefined' ? window : this);
