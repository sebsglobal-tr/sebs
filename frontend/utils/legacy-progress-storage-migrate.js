/**
 * Eski tarayıcı ilerlemesi (localStorage) tek sefer temizlenir; kanon kaynak API olur.
 * Sürüm yükseltmek için SEBS_PROGRESS_STORAGE_VER değerini değiştirin (tüm kullanıcılar tekrar temizlenir).
 */
(function (global) {
    var SEBS_PROGRESS_STORAGE_VER = '3';
    var KEY = 'sebs_progress_storage_version';

    function run() {
        try {
            if (typeof localStorage === 'undefined') return;
            if (localStorage.getItem(KEY) === SEBS_PROGRESS_STORAGE_VER) return;

            [
                'module_progress_temel_network',
                'module_progress_siber_guvenlik_giris',
                'moduleNameCache',
                'moduleNameCacheTime',
                'userProgress'
            ].forEach(function (k) {
                localStorage.removeItem(k);
            });

            var i;
            var k;
            for (i = localStorage.length - 1; i >= 0; i--) {
                k = localStorage.key(i);
                if (k && k.indexOf('userProgress_') === 0) {
                    localStorage.removeItem(k);
                }
            }

            localStorage.setItem(KEY, SEBS_PROGRESS_STORAGE_VER);
            if (typeof global.invalidateModuleIdCache === 'function') {
                global.invalidateModuleIdCache();
            }
        } catch (e) {
            /* ignore */
        }
    }

    global.runSebsLegacyProgressStorageMigrationOnce = run;
    run();
})(typeof window !== 'undefined' ? window : this);
