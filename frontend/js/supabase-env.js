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
    /**
     * Backend kökü (protokol + host, /api ile bitmez). Boş = sayfa ile aynı origin + /api.
     * Vercel statik + Render API örneği: window.SEBS_API_BASE_URL = 'https://sebs-api.onrender.com';
     */
    if (window.SEBS_API_BASE_URL === undefined) {
        window.SEBS_API_BASE_URL = '';
    }
})();

/**
 * #signupBtn (üst bar): giriş yoksa kayıt, varsa panel.
 * [data-sebs-primary-cta] (ana sayfa hero/alt CTA): giriş yoksa göster + kayıt; girişte gizle.
 */
(function () {
    if (typeof window === 'undefined') return;
    window.sebsApplySignupNavCta = function (loggedIn, _user) {
        var signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            if (loggedIn) {
                // Panel metni kaldırıldı; yönlendirme kullanıcı adı / profil alanından yapılır.
                signupBtn.style.display = 'none';
            } else {
                signupBtn.setAttribute('href', '/signup.html');
                signupBtn.textContent = 'Ücretsiz başla';
                signupBtn.removeAttribute('aria-label');
                signupBtn.style.removeProperty('display');
            }
        }

        document.querySelectorAll('[data-sebs-primary-cta]').forEach(function (el) {
            if (loggedIn) {
                el.style.display = 'none';
                el.setAttribute('hidden', '');
                el.setAttribute('aria-hidden', 'true');
            } else {
                el.style.removeProperty('display');
                el.removeAttribute('hidden');
                el.removeAttribute('aria-hidden');
                el.setAttribute('href', '/signup.html');
            }
        });
    };
})();
