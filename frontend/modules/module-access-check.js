/**
 * Modül HTML sayfaları: erişim kontrolü bağımlılıklarını yükler ve kapıyı çalıştırır.
 */
(function () {
    'use strict';

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve();
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = function () {
                resolve();
            };
            s.onerror = function () {
                reject(new Error('Script yüklenemedi: ' + src));
            };
            document.head.appendChild(s);
        });
    }

    loadScript('/js/api-base.js')
        .then(function () {
            return loadScript('/utils/access-control.js');
        })
        .then(function () {
            return loadScript('/js/module-access-gate.js');
        })
        .catch(function (err) {
            console.warn('module-access-check:', err);
        });
})();
