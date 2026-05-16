/**
 * Modül HTML sunucu kapısı için HttpOnly oturum çerezi (görünümü değiştirmez).
 */
(function (global) {
    'use strict';

    async function syncSebsSessionCookie() {
        try {
            var token = global.localStorage && global.localStorage.getItem('authToken');
            if (!token) {
                for (var i = 0; i < (global.localStorage && global.localStorage.length) || 0; i++) {
                    var key = global.localStorage.key(i);
                    if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
                    var raw = global.localStorage.getItem(key);
                    if (!raw) continue;
                    var data = JSON.parse(raw);
                    token =
                        data?.access_token ||
                        data?.session?.access_token ||
                        data?.currentSession?.access_token;
                    if (token) break;
                }
            }
            var apiBase =
                typeof global.getSebsApiBase === 'function'
                    ? global.getSebsApiBase()
                    : (global.location && global.location.origin
                          ? global.location.origin + '/api'
                          : '/api');

            if (!token) {
                await fetch(apiBase + '/auth/session-cookie/clear', {
                    method: 'POST',
                    credentials: 'include'
                }).catch(function () {});
                return;
            }

            await fetch(apiBase + '/auth/session-cookie', {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token },
                credentials: 'include'
            });
        } catch (e) {
            console.warn('session-cookie-sync:', e);
        }
    }

    global.syncSebsSessionCookie = syncSebsSessionCookie;
})(typeof window !== 'undefined' ? window : this);
