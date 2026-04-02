/**
 * Statik HTML için Supabase public yapılandırması (Vite env isimleriyle uyumlu).
 * Vite kullanan bir bundle’da bunun yerine import.meta.env.VITE_* kullanın.
 * Anon key tarayıcıda görünür (Supabase “public” anahtarıdır); yine de repo paylaşımında dikkat edin.
 */
(function () {
    if (typeof window === 'undefined') return;
    window.VITE_SUPABASE_URL =
        window.VITE_SUPABASE_URL || 'https://ackfobwtkozvgsnuezcx.supabase.co';
    window.VITE_SUPABASE_ANON_KEY =
        window.VITE_SUPABASE_ANON_KEY ||
        window.SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFja2ZvYnd0a296dmdzbnVlemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDYyODEsImV4cCI6MjA4NzE4MjI4MX0.0C5ZrG7tUQxO2rDv3ZiaapCdSSUtvgAtp0CCqMGIWbI';
})();
