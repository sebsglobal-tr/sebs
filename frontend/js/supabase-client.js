/**
 * Supabase client — önce resmi UMD SDK (CDN), sonra env, sonra bu dosya.
 *
 * HTML sırası (kritik):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.x/dist/umd/supabase.min.js"></script>
 *   <script src="/js/supabase-env.js"></script>
 *   <script src="/js/supabase-client.js"></script>
 *   <script src="/js/supabase-auth.js"></script>
 *
 * Yerel /assets/vendor/supabase.min.js kullanmayın (Vercel’de 404); CDN veya npm+bundle.
 * Bundle (Vite/Webpack): cd frontend && npm i @supabase/supabase-js
 *   → import { createClient } from '@supabase/supabase-js'
 */
(function () {
    'use strict';

    var supabase = null;

    function getCredentials() {
        var url =
            (typeof window !== 'undefined' && window.VITE_SUPABASE_URL) ||
            (typeof window !== 'undefined' && window.SUPABASE_URL) ||
            '';
        var key =
            (typeof window !== 'undefined' && window.VITE_SUPABASE_ANON_KEY) ||
            (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ||
            '';
        return { url: String(url || '').trim(), key: String(key || '').trim() };
    }

    function waitForSdk(maxMs) {
        maxMs = maxMs || 5000;
        var start = Date.now();
        return new Promise(function (resolve) {
            function tick() {
                if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
                    resolve(true);
                    return;
                }
                if (Date.now() - start > maxMs) {
                    resolve(false);
                    return;
                }
                setTimeout(tick, 50);
            }
            tick();
        });
    }

    async function initSupabase() {
        if (supabase) {
            return supabase;
        }

        var ok = await waitForSdk(8000);
        if (!ok || !window.supabase || typeof window.supabase.createClient !== 'function') {
            var err = new Error(
                'Supabase SDK yüklenmedi! HTML’de @supabase/supabase-js UMD script, supabase-env.js’den ÖNCE veya hemen üstünde olmalı (cdn.jsdelivr.net/.../supabase.min.js).'
            );
            console.error('❌', err.message);
            throw err;
        }

        var cfg = getCredentials();
        if (!cfg.url || !cfg.key) {
            console.error('❌ Supabase env eksik!');
            throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — supabase-env.js dosyasını kontrol edin.');
        }

        supabase = window.supabase.createClient(cfg.url, cfg.key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'sb-' + cfg.url.split('//')[1].split('.')[0] + '-auth-token'
            }
        });

        if (typeof window !== 'undefined') {
            window.supabaseClient = supabase;
        }
        return supabase;
    }

    if (typeof window !== 'undefined') {
        window.initSupabase = initSupabase;
    }
})();
