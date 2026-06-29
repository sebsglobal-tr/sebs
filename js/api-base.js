(function (global) {
    /** Varsayılan API base URL — `SEBS_API_BASE_URL` (window) veya `VITE_API_BASE_URL` env var ile override edilebilir */
    var DEFAULT_REMOTE_API_ORIGIN = 'https://api.sebsglobal.com';

    function normalizeApiBase(raw) {
        if (!raw || typeof raw !== 'string') return '';
        var u = raw.trim().replace(/\/$/, '');
        if (!u) return '';
        if (u.endsWith('/api')) return u;
        return u + '/api';
    }

    function sameOriginApi(loc) {
        return (loc.origin || '').replace(/\/$/, '') + '/api';
    }

    function hostnameNeedsDefaultRemoteApi(hostname) {
        if (!hostname) return false;
        var h = String(hostname).toLowerCase();
        if (h === 'localhost' || h === '127.0.0.1') return false;
        if (h === 'sebsglobal.com' || h === 'www.sebsglobal.com') return true;
        if (h.endsWith('.vercel.app')) return true;
        if (h.endsWith('.pages.dev')) return true;
        if (h.endsWith('.netlify.app')) return true;
        if (h.endsWith('.cloudflarepages.com')) return true;
        return false;
    }

    global.getSebsApiBase = function getSebsApiBase() {
        var fromWindow =
            (typeof global.SEBS_API_BASE_URL === 'string' && global.SEBS_API_BASE_URL.trim()) ||
            (typeof global.VITE_API_BASE_URL === 'string' && global.VITE_API_BASE_URL.trim()) ||
            '';
        var n = normalizeApiBase(fromWindow);
        if (n) return n;

        var loc = global.location;
        if (!loc || !loc.hostname) {
            return 'http://localhost:8006/api';
        }

        if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
            return sameOriginApi(loc);
        }


        if (hostnameNeedsDefaultRemoteApi(loc.hostname)) {
            return normalizeApiBase(DEFAULT_REMOTE_API_ORIGIN);
        }

        return sameOriginApi(loc);
    };
})(typeof window !== 'undefined' ? window : this);
