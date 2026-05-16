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
                reject(new Error(src));
            };
            document.head.appendChild(s);
        });
    }
    loadScript('/js/api-base.js')
        .then(function () {
            return loadScript('/utils/access-control.js');
        })
        .then(function () {
            return loadScript('/js/simulation-access-gate.js');
        })
        .catch(function (e) {
            console.warn('simulation-access-check:', e);
        });
})();
