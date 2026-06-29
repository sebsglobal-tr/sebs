/**
 * Supabase oturumunu tazeler; API 401 sonrası bir kez yeniden dener.
 */
(function (global) {
    'use strict';

    var refreshPromise = null;

    function getSupabaseClient() {
        if (global.supabaseAuthSystem && global.supabaseAuthSystem.supabase) {
            return global.supabaseAuthSystem.supabase;
        }
        if (global.supabaseClient) return global.supabaseClient;
        return null;
    }

    function persistSession(session) {
        if (!session) return;
        try {
            if (session.access_token) {
                global.localStorage.setItem('authToken', session.access_token);
            }
            global.localStorage.setItem('isLoggedIn', 'true');
        } catch (e) {
            /* */
        }
        if (typeof global.syncSebsSessionCookie === 'function') {
            global.syncSebsSessionCookie().catch(function () {});
        }
    }

    function clearLocalAuth() {
        try {
            global.localStorage.removeItem('isLoggedIn');
            global.localStorage.removeItem('authToken');
        } catch (e) {
            /* */
        }
        if (global.supabaseAuthSystem) {
            global.supabaseAuthSystem.isLoggedIn = false;
            global.supabaseAuthSystem.user = null;
        }
        if (typeof global.clearPurchasesCache === 'function') {
            global.clearPurchasesCache();
        }
    }

    function sessionNeedsRefresh(session) {
        if (!session) return true;
        if (!session.expires_at) return false;
        var expiresMs = session.expires_at * 1000;
        return Date.now() >= expiresMs - 5 * 60 * 1000;
    }

    async function ensureSebsFreshAuth(options) {
        var force = options && options.force;
        var supabase = getSupabaseClient();
        if (!supabase) return null;

        if (refreshPromise && !force) {
            return refreshPromise;
        }

        refreshPromise = (async function () {
            try {
                var sessionRes = await supabase.auth.getSession();
                var session = sessionRes.data && sessionRes.data.session;

                if (sessionNeedsRefresh(session)) {
                    var ref = await supabase.auth.refreshSession();
                    if (ref.error) {
                        if (!session) {
                            clearLocalAuth();
                            return null;
                        }
                    } else if (ref.data && ref.data.session) {
                        session = ref.data.session;
                    }
                }

                if (session && session.user) {
                    persistSession(session);
                    if (global.supabaseAuthSystem) {
                        global.supabaseAuthSystem.isLoggedIn = true;
                        global.supabaseAuthSystem.user = session.user;
                    }
                    return session;
                }

                clearLocalAuth();
                return null;
            } catch (err) {
                console.warn('ensureSebsFreshAuth:', err);
                return null;
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    }

    async function sebsAuthFetch(url, options) {
        var opts = options ? Object.assign({}, options) : {};
        var headers = new Headers(opts.headers || {});

        await ensureSebsFreshAuth();

        var token = global.localStorage && global.localStorage.getItem('authToken');
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', 'Bearer ' + token);
        }
        opts.headers = headers;

        var res = await fetch(url, opts);
        if (res.status !== 401) return res;

        var refreshed = await ensureSebsFreshAuth({ force: true });
        if (!refreshed || !refreshed.access_token) return res;

        headers.set('Authorization', 'Bearer ' + refreshed.access_token);
        opts.headers = headers;
        return fetch(url, opts);
    }

    function installSebsAuthRefreshHooks() {
        if (global.__sebsAuthRefreshHooksInstalled) return;
        global.__sebsAuthRefreshHooksInstalled = true;

        global.addEventListener('focus', function () {
            ensureSebsFreshAuth().catch(function () {});
        });

        global.document.addEventListener('visibilitychange', function () {
            if (!global.document.hidden) {
                ensureSebsFreshAuth().catch(function () {});
            }
        });
    }

    global.ensureSebsFreshAuth = ensureSebsFreshAuth;
    global.sebsAuthFetch = sebsAuthFetch;
    global.installSebsAuthRefreshHooks = installSebsAuthRefreshHooks;

    if (global.document && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', installSebsAuthRefreshHooks);
    } else {
        installSebsAuthRefreshHooks();
    }
})(typeof window !== 'undefined' ? window : this);
