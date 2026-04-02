// Önce supabase-env.js yüklenmeli (window.VITE_SUPABASE_*). Vite kullanıyorsanız import.meta.env doludur.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

const supabaseUrl =
    import.meta.env?.VITE_SUPABASE_URL ??
    (typeof window !== 'undefined' ? window.VITE_SUPABASE_URL : '');
const supabaseKey =
    import.meta.env?.VITE_SUPABASE_ANON_KEY ??
    (typeof window !== 'undefined' ? window.VITE_SUPABASE_ANON_KEY : '');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase env eksik!');
}

const _url = String(supabaseUrl || '').trim();
const _key = String(supabaseKey || '').trim();

export const supabase =
    _url && _key
        ? createClient(_url, _key, {
              auth: {
                  persistSession: true,
                  autoRefreshToken: true,
                  detectSessionInUrl: true,
                  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
                  storageKey: 'sb-' + _url.split('//')[1].split('.')[0] + '-auth-token'
              }
          })
        : null;

if (typeof window !== 'undefined') {
    window.initSupabase = async function () {
        if (!supabase) {
            throw new Error('Supabase env eksik (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
        }
        return supabase;
    };
}
