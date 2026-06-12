/* ============================================================
 * SEBS Global — Network Utilities (retry, loading, online check)
 * ============================================================
 * Tüm sayfalarda kullanılabilir, api-integration.js'den bağımsız.
 * Kullanım: <script src="/js/network-utils.js"></script>
 * ============================================================ */

(function (global) {
    'use strict';

    /* --------------------------------------------------------
     * Online / offline detection
     * -------------------------------------------------------- */
    var NetworkStatus = {
        _listeners: [],
        _online: true,

        init: function () {
            var self = this;
            this._online = typeof navigator !== 'undefined' ? navigator.onLine : true;

            function handleOnline() {
                self._online = true;
                self._notify(true);
            }
            function handleOffline() {
                self._online = false;
                self._notify(false);
            }

            if (typeof window !== 'undefined') {
                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOffline);
            }

            return this;
        },

        /** Anlık bağlantı durumu */
        isOnline: function () {
            return this._online;
        },

        /** Bağlantı durumu değişikliklerini dinle */
        onChange: function (fn) {
            if (typeof fn === 'function') {
                this._listeners.push(fn);
            }
            return this;
        },

        _notify: function (online) {
            for (var i = 0; i < this._listeners.length; i++) {
                try {
                    this._listeners[i](online);
                } catch (e) { /* ignore */ }
            }
        }
    };

    /* --------------------------------------------------------
     * Cleanup ekranı (offline uyarısı)
     * -------------------------------------------------------- */
    var OfflineOverlay = {
        _el: null,
        _shown: false,

        /** Offline uyarı banner'ını göster veya gizle */
        toggle: function (show) {
            if (show === this._shown) return;

            try {
                if (!this._el) {
                    this._el = document.createElement('div');
                    this._el.id = 'sebs-offline-banner';
                    this._el.setAttribute('role', 'alert');
                    this._el.style.cssText =
                        'position:fixed;top:0;left:0;right:0;z-index:99998;' +
                        'background:#fef2f2;color:#991b1b;' +
                        'padding:10px 16px;text-align:center;' +
                        'font-size:14px;font-family:sans-serif;' +
                        'border-bottom:1px solid #fecaca;' +
                        'transform:translateY(-100%);transition:transform .3s ease';
                    this._el.innerHTML =
                        '<span style="margin-right:8px">📡</span> ' +
                        'Bağlantı kesildi. Bazı özellikler çalışmayabilir.';
                    document.body.appendChild(this._el);
                }

                this._el.style.transform = show ? 'translateY(0)' : 'translateY(-100%)';
                this._shown = show;
            } catch (e) { /* DOM henüz hazır değil */ }
        }
    };

    /* --------------------------------------------------------
     * Retry helper (herhangi bir async işlem için)
     * -------------------------------------------------------- */
    function retryAsync(fn, options) {
        options = options || {};
        var maxRetries = options.maxRetries || 3;
        var baseDelay = options.baseDelay || 1000;
        var onRetry = options.onRetry || null;

        function attempt(remaining) {
            return fn().catch(function (err) {
                if (remaining <= 0) throw err;
                var delay = baseDelay * Math.pow(2, maxRetries - remaining);
                delay = delay * (0.75 + Math.random() * 0.5);
                if (onRetry) {
                    onRetry(maxRetries - remaining + 1, err, delay);
                }
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(attempt(remaining - 1));
                    }, delay);
                });
            });
        }

        return attempt(maxRetries);
    }

    /* --------------------------------------------------------
     * Fetch with retry (basit, bağımsız)
     * -------------------------------------------------------- */
    function fetchWithRetry(url, options, retryOpts) {
        retryOpts = retryOpts || {};
        var maxRetries = retryOpts.maxRetries || 2;
        var timeout = retryOpts.timeout || 10000;
        var onRetry = retryOpts.onRetry || null;

        function doFetch() {
            return new Promise(function (resolve, reject) {
                var controller = null;
                var timeoutId = null;

                if (typeof AbortController !== 'undefined') {
                    controller = new AbortController();
                    timeoutId = setTimeout(function () {
                        controller.abort();
                    }, timeout);
                }

                var fetchOpts = options ? Object.assign({}, options) : {};
                if (controller) {
                    fetchOpts.signal = controller.signal;
                }

                fetch(url, fetchOpts).then(function (response) {
                    if (timeoutId) clearTimeout(timeoutId);
                    resolve(response);
                }).catch(function (err) {
                    if (timeoutId) clearTimeout(timeoutId);
                    reject(err);
                });
            });
        }

        return retryAsync(doFetch, {
            maxRetries: maxRetries,
            baseDelay: 1000,
            onRetry: onRetry
        });
    }

    /* --------------------------------------------------------
     * Export
     * -------------------------------------------------------- */
    global.NetworkStatus = NetworkStatus.init();
    global.OfflineOverlay = OfflineOverlay;
    global.retryAsync = retryAsync;
    global.fetchWithRetry = fetchWithRetry;

})(typeof window !== 'undefined' ? window : this);
