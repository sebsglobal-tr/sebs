/* Blog sayfalarinda kayitli tema tercihini (sebs-theme / theme) sayfa acilisinda uygular.
   navigation.js / saas-shell olmadan da landing ile uyumlu kalir. */
(function () {
    try {
        var keys = ['sebs-theme', 'theme'];
        for (var i = 0; i < keys.length; i++) {
            var v = localStorage.getItem(keys[i]);
            if (v === 'dark' || v === 'light') {
                document.documentElement.setAttribute('data-theme', v);
                return;
            }
        }
    } catch (e) {
        /* noop */
    }
})();
