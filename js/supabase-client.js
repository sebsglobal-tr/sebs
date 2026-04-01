// Supabase Client Configuration
// Frontend için Supabase client oluşturur

// Üretimde yalnızca /api/supabase-config veya window.SUPABASE_* (sunucu enjekte eder)
const DEFAULT_SUPABASE_URL = '';
const DEFAULT_ANON_KEY = '';

// Supabase client oluştur (CDN'den yüklenecek)
let supabase = null;

// Sunucudan Supabase config al (.env'de SUPABASE_URL, SUPABASE_ANON_KEY varsa)
async function getSupabaseConfig() {
  if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    return { url: window.SUPABASE_URL, anonKey: window.SUPABASE_ANON_KEY };
  }
  try {
    const base = window.location.origin;
    if (!base || base === 'null' || base === 'file://') {
      console.error('Sayfayı file:// ile açmayın. Sunucuyu çalıştırın: npm start veya node server.js; adres: http://localhost:8006');
      return { url: null, anonKey: null };
    }
    const r = await fetch(base + '/api/supabase-config', { credentials: 'same-origin' });
    if (r.ok) {
      const cfg = await r.json();
      if (cfg.url && cfg.anonKey) return { url: cfg.url, anonKey: cfg.anonKey };
      if (cfg.hint) console.warn('Supabase config:', cfg.hint);
    }
  } catch (e) {
    console.warn('/api/supabase-config erişilemedi. Site ve API aynı adreste mi? (örn. http://localhost:8006)', e?.message || e);
  }
  return { url: DEFAULT_SUPABASE_URL || null, anonKey: DEFAULT_ANON_KEY || null };
}

// Supabase'i dinamik olarak yükle
async function initSupabase() {
  if (supabase) {
    console.log('✅ Supabase client zaten mevcut');
    return supabase;
  }

  const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = await getSupabaseConfig();

  // Supabase URL ve Key kontrolü
  if (!SUPABASE_URL || SUPABASE_URL.includes('your-project-id')) {
    console.error('❌ SUPABASE_URL yapılandırılmamış!');
    throw new Error(
      'Supabase URL eksik. Sunucu kökündeki .env dosyasına SUPABASE_URL ekleyin (Supabase Dashboard → Settings → API) ve sunucuyu yeniden başlatın.'
    );
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-anon-key')) {
    console.error('❌ SUPABASE_ANON_KEY yapılandırılmamış!');
    throw new Error(
      'Supabase anon key eksik. .env SUPABASE_ANON_KEY= satırına Dashboard → API → anon public anahtarını yapıştırın (DATABASE ile aynı proje). Sunucuyu yeniden başlatın; sayfayı http://localhost:8006 üzerinden açın.'
    );
  }

  // Supabase JS library'yi CDN'den yükle
  // Eğer zaten yüklenmişse (script tag ile), direkt kullan
  if (typeof window.supabase !== 'undefined') {
    try {
      console.log('✅ Supabase script zaten yüklü, client oluşturuluyor...');
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true, // Session'ı localStorage'da sakla
          autoRefreshToken: true, // Otomatik token yenileme
          detectSessionInUrl: true, // URL'deki session'ı algıla
          storage: window.localStorage, // Session storage olarak localStorage kullan
          storageKey: 'sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token' // Unique storage key
        }
      });
      console.log('✅ Supabase client oluşturuldu (session persistence enabled)');
      return supabase;
    } catch (error) {
      console.error('❌ Supabase client oluşturulamadı:', error);
      throw new Error('Supabase client oluşturulamadı: ' + error.message);
    }
  }

  // Eğer yüklenmemişse, bekleyip tekrar dene
  console.log('⏳ Supabase script yüklenmesi bekleniyor...');
  let attempts = 0;
  const maxAttempts = 100; // 10 saniye
  while (typeof window.supabase === 'undefined' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
    
    // Her 2 saniyede bir durum yazdır
    if (attempts % 20 === 0) {
      console.log(`⏳ Supabase script yüklenmesi bekleniyor... (${attempts * 100 / 1000}s)`);
    }
  }

  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase script yüklenemedi (timeout)');
    console.error('   Kontrol edin:');
    console.error('   1. Internet bağlantınız');
    console.error('   2. CDN erişimi (cdn.jsdelivr.net veya unpkg.com)');
    console.error('   3. Tarayıcı console\'unda script yükleme hataları');
    throw new Error('Supabase kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin (F5) veya internet bağlantınızı kontrol edin.');
  }

  // Script yüklendi, client oluştur
  try {
    console.log('✅ Supabase script yüklendi, client oluşturuluyor...');
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true, // Session'ı localStorage'da sakla
        autoRefreshToken: true, // Otomatik token yenileme
        detectSessionInUrl: true, // URL'deki session'ı algıla
        storage: window.localStorage, // Session storage olarak localStorage kullan
        storageKey: 'sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token' // Unique storage key
      }
    });
    console.log('✅ Supabase client başarıyla oluşturuldu (session persistence enabled)');
    console.log('   URL:', SUPABASE_URL);
    console.log('   Session persistence: enabled');
    console.log('   Auto refresh token: enabled');
    return supabase;
  } catch (error) {
    console.error('❌ Supabase client oluşturulamadı:', error);
    console.error('   Hata detayı:', error.message);
    console.error('   Stack:', error.stack);
    throw new Error('Supabase client oluşturulamadı: ' + error.message);
  }
}

// Script yükleme helper
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Global olarak erişilebilir yap
window.initSupabase = initSupabase;
