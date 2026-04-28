const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const logger = require('./utils/logger');
/** Statik site (ayrı deploy edilirse API sunucusunda klasör olmayabilir) */
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: false });
// Boş SUPABASE_ANON_KEY= satırı dotenv'de "set" sayılır ve backend'den gelen anahtarı ezmez; temizleyip tekrar yükle
['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].forEach((k) => {
    if (process.env[k] !== undefined && String(process.env[k]).trim() === '') {
        delete process.env[k];
    }
});

if (process.env.NODE_ENV !== 'production' && !(process.env.SUPABASE_ANON_KEY || '').trim()) {
    logger.warn(
        'SUPABASE_ANON_KEY tanımlı değil — giriş/kayıt çalışmaz. Kök .env içine ' +
            'Supabase Dashboard → Project Settings → API → anon public anahtarını ekleyin ve sunucuyu yeniden başlatın.'
    );
}

function supabaseRefFromDatabaseUrl(databaseUrl) {
    if (!databaseUrl || typeof databaseUrl !== 'string') return null;
    // Pooler: postgresql://postgres.PROJECT_REF:password@host
    const pooler = databaseUrl.match(/postgres\.([a-z0-9]+)[:@]/i);
    if (pooler) return pooler[1];
    const direct = databaseUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/i);
    return direct ? direct[1] : null;
}

function supabaseRefFromSupabaseUrl(supabaseUrl) {
    if (!supabaseUrl || typeof supabaseUrl !== 'string') return null;
    const m = supabaseUrl.trim().match(/^https?:\/\/([^.]+)\.supabase\.co/i);
    return m ? m[1] : null;
}

const _dbRef = supabaseRefFromDatabaseUrl(process.env.DATABASE_URL);
const _suRef = supabaseRefFromSupabaseUrl(process.env.SUPABASE_URL);
const _supabaseProjectMismatchMsg =
    `SUPABASE_URL projesi (${_suRef}) ile DATABASE_URL projesi (${_dbRef}) farklı. ` +
    'Giriş/kayıt bir projede, veritabanı başka projede olur; profil ve API tutmaz. ' +
    'Supabase Dashboard → Settings → API: aynı projeden SUPABASE_URL ve anon key kullanın veya DATABASE_URL\'i auth ile aynı projeye taşıyın.';
if (_dbRef && _suRef && _dbRef !== _suRef) {
    const fatalProd =
        process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== '1';
    if (fatalProd) {
        logger.error(`CRITICAL: ${_supabaseProjectMismatchMsg}`);
        process.exit(1);
    }
    logger.warn(_supabaseProjectMismatchMsg);
}

// Supabase self-signed sertifika uyumluluğu
if (process.env.DATABASE_URL?.includes('supabase') || process.env.DB_PASSWORD) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();

// Reverse proxy (Render, nginx) arkasında doğru istemci IP’si ve rate limit için
if (process.env.TRUST_PROXY !== '0') {
    app.set('trust proxy', 1);
}

// Tam erişim (super admin) e-posta — canlıda SUPER_ADMIN_EMAIL ile tanımlayın
const FULL_ACCESS_EMAIL = (process.env.SUPER_ADMIN_EMAIL ||
    (process.env.NODE_ENV === 'production' ? '' : 'asasferfer4566@gmail.com')).toLowerCase().trim();

/** CORS: CORS_ORIGIN (virgülle çoklu) + PUBLIC_SITE_URL birleştirilir; biri yalnızca Vercel diğeri canlı alan adı olsa bile ikisi de izinli olur. */
function parseCorsOrigins() {
    const set = new Set();
    function addOrigin(raw) {
        let u = String(raw || '').trim();
        if (!u) return;
        u = u.replace(/\/+$/, '');
        set.add(u);
    }
    (process.env.CORS_ORIGIN || '')
        .split(',')
        .forEach((s) => addOrigin(s));

    const pub = (process.env.PUBLIC_SITE_URL || '').trim();
    if (pub) {
        addOrigin(pub);
        try {
            const urlStr = /^https?:\/\//i.test(pub) ? pub : `https://${pub}`;
            const parsed = new URL(urlStr);
            const proto = parsed.protocol;
            const host = parsed.hostname.toLowerCase();
            if (host.startsWith('www.')) {
                addOrigin(`${proto}//${host.slice(4)}`);
            } else if (host.split('.').length === 2) {
                addOrigin(`${proto}//www.${host}`);
            }
        } catch (_) {
            /* geçersiz PUBLIC_SITE_URL */
        }
    }

    const out = Array.from(set);
    return out.length ? out : null;
}

// Production: JWT_SECRET yoksa ama Supabase JWT secret varsa aynı HS256 anahtarı kullan (Render’da tek secret yeter)
if (process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== '1') {
    const j0 = (process.env.JWT_SECRET || '').trim();
    const supaJwt = (process.env.SUPABASE_JWT_SECRET || '').trim();
    if ((!j0 || j0 === 'your_super_secret_jwt_key_here') && supaJwt) {
        process.env.JWT_SECRET = supaJwt;
        logger.warn(
            'JWT_SECRET yoktu; SUPABASE_JWT_SECRET ile dolduruldu. İsterseniz Render → Environment’da ayrı JWT_SECRET ekleyin (openssl rand -hex 32).'
        );
    }
}

// Validate critical environment variables in production (npm run build / verify-build için SKIP_ENV_VALIDATION=1)
if (process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== '1') {
    const jwtSecretTrim = (process.env.JWT_SECRET || '').trim();
    if (!jwtSecretTrim || jwtSecretTrim === 'your_super_secret_jwt_key_here') {
        logger.error(
            'CRITICAL: JWT_SECRET boş. Render → Environment: SUPABASE_JWT_SECRET ekleyin (Supabase Dashboard → Project Settings → API → JWT Secret / JWT Signing Key) veya JWT_SECRET=openssl rand -hex 32 çıktısı.'
        );
        process.exit(1);
    }
    
    if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
        logger.error(
            'CRITICAL: DATABASE_URL veya DB_PASSWORD yok. Render → Environment → DATABASE_URL ekleyin (Supabase: Project Settings → Database → Connection string → URI).'
        );
        process.exit(1);
    }

    if (!parseCorsOrigins()?.length) {
        logger.error(
            'CRITICAL: CORS için CORS_ORIGIN ve/veya PUBLIC_SITE_URL tanımlayın. İkisi birden kullanılırsa birleştirilir (örn. Vercel + sebsglobal.com). Virgülle çoklu origin: CORS_ORIGIN içinde.'
        );
        process.exit(1);
    }

    if (!(process.env.SUPABASE_JWT_SECRET || '').trim()) {
        logger.error(
            'CRITICAL: SUPABASE_JWT_SECRET boş. Supabase Dashboard → Project Settings → API → "JWT Secret" (veya Legacy JWT secret) — kopyala; Render’da Key tam olarak SUPABASE_JWT_SECRET olsun.'
        );
        process.exit(1);
    }

    const supaUrl = (process.env.SUPABASE_URL || '').trim();
    const supaAnon = (process.env.SUPABASE_ANON_KEY || '').trim();
    if (!supaUrl || !supaUrl.startsWith('https://') || !supaUrl.includes('.supabase.co')) {
        logger.error('CRITICAL: SUPABASE_URL canlıda zorunludur (https://<ref>.supabase.co).');
        process.exit(1);
    }
    if (!supaAnon || supaAnon.length < 80 || !supaAnon.startsWith('eyJ')) {
        logger.error('CRITICAL: SUPABASE_ANON_KEY canlıda zorunludur (Supabase Dashboard → API → anon public).');
        process.exit(1);
    }

    logger.info('Production mode initialized');
    logger.info('Environment validation passed');
}

// ============================================
// MIDDLEWARE (ARA KATMAN YAPILANDIRMALARI)
// ============================================

// Hız sınırlama — sadece /api/auth/* (giriş/kayıt brute-force). Tüm /api/ üzerinde limit,
// modül listesi ve ilerleme uçlarında 429 üretiyordu (express-rate-limit + mount path uyumu).
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 80,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/auth', authLimiter);

// İletişim formu — IP başına sınırlı (spam önleme)
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_CONTACT_MAX, 10) || 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Çok fazla mesaj gönderimi. Lütfen bir süre sonra tekrar deneyin.'
        });
    }
});
// CORS — CORS_ORIGIN (virgülle çoklu) + PUBLIC_SITE_URL birleşimi (parseCorsOrigins)
const corsOrigins = parseCorsOrigins();
if (corsOrigins && corsOrigins.length) {
    logger.info('CORS izinli kökenler: ' + corsOrigins.join(', '));
}
app.use(cors({
    origin: corsOrigins && corsOrigins.length
        ? (corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins)
        : 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
}));

// Helmet güvenlik başlıkları - XSS, clickjacking ve diğer saldırıları önlemek için
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false, // Varsayılan ayarları kullanma, tam kontrol için
        directives: {
            defaultSrc: ["'self'"], // Varsayılan kaynaklar: sadece kendi domain'imiz
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", // Inline stiller için
                "https://fonts.googleapis.com", // Google Fonts
                "https://cdnjs.cloudflare.com" // Font Awesome CDN
            ],
            styleSrcElem: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", // Inline script'ler için
                "'unsafe-eval'", // Eval kullanımı için (bazı kütüphaneler için gerekli)
                "https://cdn.jsdelivr.net", // Supabase CDN
                "https://unpkg.com", // Alternatif Supabase CDN
                "https://cdnjs.cloudflare.com" // Font Awesome ve diğer CDN'ler
            ],
            scriptSrcAttr: [
                "'none'" // Inline event handler'lar kullanılmıyor (CSP uyumlu)
            ],
            scriptSrcElem: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net", // Supabase CDN - script-src-elem için
                "https://unpkg.com", // Alternatif Supabase CDN
                "https://cdnjs.cloudflare.com" // Font Awesome ve diğer CDN'ler
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com", // Google Fonts
                "https://cdnjs.cloudflare.com" // Font Awesome
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https:" // Tüm HTTPS görseller
            ],
            connectSrc: [
                "'self'",
                "https://api.openai.com",
                "https://*.supabase.co",
                "wss://*.supabase.co"
            ]
        },
    },
    hsts: {
        maxAge: 31536000, // HSTS (HTTP Strict Transport Security) süresi: 1 yıl (saniye cinsinden)
        includeSubDomains: true, // Alt domain'leri de dahil et
        preload: true // Tarayıcı preload listesine eklenmesine izin ver
    }
}));

// JSON formatındaki request body'lerini parse et (maksimum 10MB)
app.use(express.json({ limit: '10mb' }));

// URL-encoded formatındaki request body'lerini parse et (maksimum 10MB)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statik dosyalar (frontend/); yalnızca klasör varsa — üretimde site ayrı origin'de olabilir
if (fs.existsSync(FRONTEND_DIR)) {
    app.use(express.static(FRONTEND_DIR, {
        extensions: ['html', 'htm'],
        index: ['index.html', 'index.htm']
    }));
    app.use('/css', express.static(path.join(FRONTEND_DIR, 'public', 'css')));
    app.use('/favicons', express.static(path.join(FRONTEND_DIR, 'public', 'favicons')));
    app.use('/images', express.static(path.join(FRONTEND_DIR, 'public', 'images')));
    app.use('/public', express.static(path.join(FRONTEND_DIR, 'public')));
    app.use('/js', express.static(path.join(FRONTEND_DIR, 'js')));
    app.use('/assets', express.static(path.join(FRONTEND_DIR, 'assets')));
}

// ============================================
// VERİTABANI BAĞLANTI POOL YAPILANDIRMASI
// ============================================
// Supabase: DB_PASSWORD ile otomatik URL oluşturma desteklenir
const SUPABASE_POOLER = process.env.SUPABASE_POOLER || 'aws-1-eu-central-1.pooler.supabase.com';

function getDatabaseUrl() {
    let url = (process.env.DATABASE_URL || '').trim();
    const dbPass = process.env.DB_PASSWORD;
    const projectRef = (process.env.SUPABASE_PROJECT_REF || '').trim();

    // DB_PASSWORD varsa şifreyi URL'de güncelle veya sıfırdan oluştur
    if (dbPass && projectRef) {
        const enc = encodeURIComponent(String(dbPass));
        if (!url || url.includes('[YOUR-PASSWORD]') || url.includes('YOUR-PASSWORD')) {
            url = `postgresql://postgres.${projectRef}:${enc}@${SUPABASE_POOLER}:6543/postgres?pgbouncer=true`;
        } else if (url.includes('supabase') || url.includes('pooler')) {
            url = url.replace(/postgres(ql)?:\/\/([^:]+):[^@]+@/, (m, p, user) => `postgresql://${user}:${enc}@`);
        }
    }

    if (!url || url.includes('YOUR-PASSWORD')) return null;
    return url;
}

const createPool = () => {
    const dbUrl = getDatabaseUrl();

    // Supabase pooler limiti: max düşük tut (exhaustion önleme)
    const baseConfig = {
        max: parseInt(process.env.DB_POOL_MAX) || 5,
        min: parseInt(process.env.DB_POOL_MIN) || 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 5000,
        ssl: (dbUrl && (dbUrl.includes('supabase') || dbUrl.includes('pooler')))
            ? { rejectUnauthorized: false }
            : false
    };

    if (dbUrl) {
        try {
            const match = dbUrl.match(/postgres(ql)?:\/\/([^:]+):[^@]+@([^:\/]+)/);
            if (match) {
                logger.info(`DB: Using DATABASE_URL (host: ${match[3]}, user: ${match[2]})`);
            }
        } catch (e) {}

        const cleanUrl = dbUrl.replace(/\?.*$/, '');
        return new Pool({
            connectionString: cleanUrl,
            ...baseConfig,
            ssl: (baseConfig.ssl && typeof baseConfig.ssl === 'object')
                ? { ...baseConfig.ssl }
                : baseConfig.ssl
        });
    } else {
        const dbUser = process.env.DB_USER || 'postgres';
        logger.info(`DB: Using DB_* (host: ${process.env.DB_HOST || 'localhost'}, user: ${dbUser})`);
        return new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            database: process.env.DB_NAME || 'sebs_education',
            user: dbUser,
            password: process.env.DB_PASSWORD || '',
            ...baseConfig
        });
    }
};

// Veritabanı bağlantı pool'unu oluştur
const pool = createPool();

// ============================================
// VERİTABANI POOL OLAY İZLEYİCİLERİ (İZLEME İÇİN)
// ============================================
// Boşta kalan client'ta hata (Supabase shutdown vb.) - sessizce logla
pool.on('error', (err) => {
    logger.warn('DB pool error (reconnecting):', err.message);
});

// ============================================
// VERİTABANI BAĞLANTI SAĞLIK KONTROLÜ
// ============================================
// Yeniden deneme mekanizması ile bağlantı sağlık kontrolü
// Veritabanı bağlantısını test et - Başarısız olursa yeniden dene
// retries: Maksimum deneme sayısı (varsayılan: 3)
// delay: Denemeler arasındaki bekleme süresi - milisaniye (varsayılan: 2000ms)
const testConnection = async (retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Veritabanına basit bir sorgu gönder (sunucu zamanı ve versiyonu al)
            const result = await pool.query('SELECT NOW(), version()');
            console.log('✅ Database connection successful');
            console.log(`📅 Server time: ${result.rows[0].now}`);
            return true;
        } catch (err) {
            logger.error(`Database connection attempt ${i + 1}/${retries} failed: ${err.message}`);
            if (i < retries - 1) {
                logger.info(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                logger.error('All database connection attempts failed.');
                if (err.message && err.message.includes('password authentication failed')) {
                    logger.error('Kontrol edin: .env içinde DATABASE_URL (Supabase: Dashboard -> Project Settings -> Database -> Connection string, şifre = Database password) veya DB_USER / DB_PASSWORD doğru mu?');
                }
                return false;
            }
        }
    }
    return false;
};

// Uygulama başlatıldığında bağlantıyı test et
testConnection();

// Periyodik sağlık kontrolü - Her 5 dakikada bir çalışır
// Veritabanı bağlantısının canlı olduğundan emin olur
setInterval(async () => {
    try {
        // Basit bir test sorgusu gönder
        await pool.query('SELECT 1');
    } catch (err) {
        console.error('⚠️  Database health check failed:', err.message);
        // Bağlantı başarısızsa, yeniden bağlanmayı dene
        await testConnection(1, 1000);
    }
}, 5 * 60 * 1000); // 5 dakika (milisaniye cinsinden)

// ============================================
// E-POSTA YAPILANDIRMASI
// ============================================
// E-posta gönderimi için SMTP transporter oluştur
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com', // SMTP sunucu adresi
        port: process.env.SMTP_PORT || 587, // SMTP portu (587: TLS, 465: SSL)
        secure: false, // SSL kullanılsın mı? (465 portu için true, diğerleri için false)
        auth: {
            user: process.env.SMTP_USER, // SMTP kullanıcı adı (e-posta adresi)
            pass: process.env.SMTP_PASS  // SMTP şifresi (uygulama şifresi)
        }
    });
};

const isSmtpConfigured = () => {
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').trim();
    if (!user || !pass) return false;
    // Common placeholders that should not be treated as valid credentials.
    if (user === 'your_email@gmail.com') return false;
    if (pass === 'your_app_password') return false;
    if (pass === 'your_gmail_app_password_here') return false;
    return true;
};

// Doğrulama e-postası gönder
// email: Alıcı e-posta adresi
// verificationCode: Gönderilecek 6 haneli doğrulama kodu
// firstName: Alıcının adı (e-postada kullanılır)
const sendVerificationEmail = async (email, verificationCode, firstName) => {
    try {
        // SMTP kimlik bilgilerinin yapılandırılıp yapılandırılmadığını kontrol et
        if (!isSmtpConfigured()) {
            console.log('⚠️ SMTP credentials not configured, skipping email send');
            return { success: false, error: 'SMTP not configured' };
        }

        // E-posta transporter'ı oluştur
        const transporter = createEmailTransporter();
        
        // SMTP bağlantısını test et
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        
        const mailOptions = {
            from: `"SEBS Global" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'SEBS Global - Güvenlik Doğrulama Kodu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">SEBS Global</h1>
                        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Eğitim Platformu</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #333; margin-top: 0;">Merhaba ${firstName || 'Değerli Kullanıcı'},</h2>
                        <p style="color: #666; line-height: 1.6;">
                            SEBS Global eğitim platformuna hoş geldiniz! Hesabınızı güvenli hale getirmek için aşağıdaki güvenlik kodunu kullanın:
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea;">
                            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
                                ${verificationCode}
                            </div>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Bu kod <strong>15 dakika</strong> geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                        </p>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #1976d2; font-size: 14px;">
                                <strong>Güvenlik Uyarısı:</strong> Bu kodu kimseyle paylaşmayın. SEBS Global hiçbir zaman sizden şifre veya doğrulama kodunuzu istemez.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #999; font-size: 14px;">
                        <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
                        <p>© 2025 SEBS Global. Tüm hakları saklıdır.</p>
                        <p>İletişim: info@sebsglobal.com</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully:', info.messageId);
        console.log('📧 Email sent to:', email);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Email sending error:', error.message);
        return { success: false, error: error.message };
    }
};

/** İletişim formu mesajlarının gideceği gelen kutusu (SMTP ile aynı hesap olmak zorunda değil) */
const CONTACT_INBOX_EMAIL = (process.env.CONTACT_INBOX_EMAIL || 'sebsglobal@gmail.com').trim();

async function sendContactFormNotification({ firstName, lastName, email, phone, subjectKey, message }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_gmail_app_password_here') {
        logger.warn('Contact form: SMTP not configured');
        return { success: false, error: 'SMTP not configured' };
    }
    try {
        const transporter = createEmailTransporter();
        await transporter.verify();
        const subjectLabels = {
            general: 'Genel Bilgi',
            support: 'Teknik Destek',
            partnership: 'İş Birliği',
            feedback: 'Geri Bildirim',
            other: 'Diğer'
        };
        const topic = subjectLabels[subjectKey] || subjectKey || 'İletişim';
        const subjectLine = `[SEBS İletişim] ${topic}`;
        const safePhone = phone ? sanitizeInput(String(phone).slice(0, 40)) : '—';
        const textBody =
            `Yeni iletişim formu mesajı\n\n` +
            `Ad Soyad: ${firstName} ${lastName}\n` +
            `E-posta: ${email}\n` +
            `Telefon: ${safePhone}\n` +
            `Konu: ${topic}\n\n` +
            `Mesaj:\n${message}\n`;
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
                <h2 style="color:#1e40af;">SEBS Global — İletişim formu</h2>
                <table style="border-collapse:collapse;width:100%;">
                    <tr><td style="padding:8px 0;color:#64748b;width:120px;">Ad Soyad</td><td style="padding:8px 0;"><strong>${firstName} ${lastName}</strong></td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">E-posta</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">Telefon</td><td style="padding:8px 0;">${safePhone}</td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">Konu</td><td style="padding:8px 0;">${topic}</td></tr>
                </table>
                <h3 style="margin-top:24px;color:#334155;">Mesaj</h3>
                <div style="background:#f8fafc;border-radius:8px;padding:16px;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>`;

        const info = await transporter.sendMail({
            from: `"SEBS Global Web" <${process.env.SMTP_USER}>`,
            to: CONTACT_INBOX_EMAIL,
            replyTo: email,
            subject: subjectLine,
            text: textBody,
            html: htmlBody
        });
        logger.info(`Contact form email sent to ${CONTACT_INBOX_EMAIL}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Contact form email error:', error.message);
        return { success: false, error: error.message };
    }
}


// ============================================
// GÜVENLİK YARDIMCI FONKSİYONLARI
// ============================================

// Girdi temizleme (Input Sanitization) yardımcı fonksiyonu
// XSS (Cross-Site Scripting) saldırılarını önlemek için kullanıcı girdilerini temizler
// input: Temizlenecek girdi değeri
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        // Potansiyel olarak tehlikeli karakterleri ve HTML etiketlerini kaldır
        return input
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Script etiketlerini kaldır
            .replace(/<[^>]+>/g, '') // Tüm HTML etiketlerini kaldır
            .trim(); // Baştaki ve sondaki boşlukları temizle
    }
    return input;
};

// Güvenli hata yönetimi - Bilgi sızıntısını önler
// Production ortamında detaylı hata mesajları kullanıcıya gösterilmez
// res: Express response nesnesi
// error: Oluşan hata nesnesi
// customMessage: Kullanıcıya gösterilecek özel hata mesajı
const handleError = (res, error, customMessage = 'Internal server error') => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: customMessage,
        // Geliştirme ortamında detaylı hata bilgilerini göster, production'da gösterme
        ...(isDevelopment && { error: error.message, stack: error.stack })
    });
};

// ============================================
// JWT KİMLİK DOĞRULAMA MIDDLEWARE'İ
// ============================================
// Supabase ile giriş: ilerleme tek satırda toplansın diye e-posta ile mevcut users.id kullanılır
// (Eski e-posta/şifre kaydı + aynı e-posta ile Supabase → aynı users.id, tek ilerleme)
const SUPABASE_PASSWORD_PLACEHOLDER = '[SUPABASE]';

/**
 * Supabase auth.sub ile senkronize eder; aynı e-posta zaten users’ta varsa o satırın id’sini döner (yeni INSERT yapmaz).
 * @returns {Promise<string>} Veritabanındaki kanonik kullanıcı UUID’si
 */
async function ensureUserFromSupabase(supabaseUserId, email, userMetadata = {}) {
    const em = String(email || '').trim();
    if (!em) {
        throw new Error('Supabase JWT içinde email yok');
    }
    const emNorm = em.toLowerCase();
    const fullName = userMetadata.full_name || userMetadata.name || '';
    const firstName = (typeof fullName === 'string' ? fullName.split(' ')[0] : '') || null;
    const lastName = (typeof fullName === 'string' ? fullName.split(' ').slice(1).join(' ') : '') || null;
    const now = new Date();

    const existing = await pool.query(
        `SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
        [em]
    );

    if (existing.rows.length > 0) {
        const { id } = existing.rows[0];
        await pool.query(
            `UPDATE users SET
                first_name = COALESCE(NULLIF($2::varchar, ''), first_name),
                last_name = COALESCE(NULLIF($3::varchar, ''), last_name),
                last_login = $4,
                updated_at = $4,
                is_verified = true
             WHERE id = $1::uuid`,
            [id, firstName, lastName, now]
        );
        return id;
    }

    await pool.query(
        `INSERT INTO users (id, email, first_name, last_name, password_hash, is_verified, role, is_active, access_level, last_login, created_at, updated_at)
         VALUES ($1::uuid, $2, $3, $4, $5, true, 'user', true, 'beginner', $6, $6, $6)`,
        [supabaseUserId, emNorm, firstName, lastName, SUPABASE_PASSWORD_PLACEHOLDER, now]
    );
    return supabaseUserId;
}

// JWT veya Supabase access token kabul eder; req.user = { userId, email, role? }
// userId her zaman public.users.id (e-posta ile tek kayıt)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET environment variable is not set!');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // 1) Kendi JWT'imiz ile dene
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err && decoded && decoded.userId) {
            (async () => {
                try {
                    if (decoded.email && String(decoded.email).trim()) {
                        const r = await pool.query(
                            `SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
                            [String(decoded.email).trim()]
                        );
                        if (r.rows.length > 0) {
                            const u = r.rows[0];
                            req.user = { userId: u.id, email: u.email, role: u.role || 'user' };
                            if (
                                FULL_ACCESS_EMAIL &&
                                req.user.email &&
                                req.user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL
                            ) {
                                req.user.role = 'admin';
                            }
                            return next();
                        }
                    }
                    req.user = decoded;
                    if (
                        FULL_ACCESS_EMAIL &&
                        req.user.email &&
                        req.user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL
                    ) {
                        req.user.role = 'admin';
                    }
                    return next();
                } catch (resolveErr) {
                    logger.error('authenticateToken legacy email resolve:', resolveErr);
                    return res.status(500).json({ success: false, message: 'Kimlik doğrulama sırasında bir hata oluştu.' });
                }
            })();
            return;
        }
        // 2) Supabase JWT ile dene (SUPABASE_JWT_SECRET varsa)
        if (!process.env.SUPABASE_JWT_SECRET || !String(process.env.SUPABASE_JWT_SECRET).trim()) {
            logger.warn(
                'authenticateToken: SUPABASE_JWT_SECRET .env içinde yok — tarayıcı Supabase access_token gönderiyorsa tüm korumalı API 401 döner. ' +
                    'Supabase Dashboard → Project Settings → API → JWT Secret değerini backend/.env dosyasına ekleyin.'
            );
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        jwt.verify(token, process.env.SUPABASE_JWT_SECRET, async (supaErr, supabaseDecoded) => {
            if (supaErr || !supabaseDecoded || !supabaseDecoded.sub) {
                return res.status(401).json({ success: false, message: 'Invalid or expired token' });
            }
            try {
                const supaEmail =
                    supabaseDecoded.email ||
                    (supabaseDecoded.user_metadata && supabaseDecoded.user_metadata.email) ||
                    '';
                const canonicalUserId = await ensureUserFromSupabase(
                    supabaseDecoded.sub,
                    supaEmail,
                    supabaseDecoded.user_metadata || {}
                );
                const userRow = await pool.query(
                    'SELECT id, email, role FROM users WHERE id = $1::uuid',
                    [canonicalUserId]
                );
                if (userRow.rows.length === 0) {
                    return res.status(500).json({ success: false, message: 'Kullanıcı kaydı bulunamadı.' });
                }
                const u = userRow.rows[0];
                req.user = {
                    userId: u.id,
                    email: u.email,
                    role: u.role || 'user'
                };
                if (FULL_ACCESS_EMAIL && req.user.email && req.user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL) {
                    req.user.role = 'admin';
                }
                next();
            } catch (syncErr) {
                logger.error('Supabase user sync error:', syncErr);
                res.status(500).json({ success: false, message: 'Kimlik doğrulama sırasında bir hata oluştu.' });
            }
        });
    });
};

// ============================================
// KULLANICI ENDPOINT'LERİ
// ============================================

// Mevcut kullanıcı bilgilerini getir (satın alımlarla birlikte)
// Kullanıcının kendi bilgilerini ve aktif satın alımlarını döndürür
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const result = await pool.query(
            'SELECT id, email, first_name, last_name, role, access_level, is_verified, created_at, last_login FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        // Super admin: bu e-posta her zaman admin + tam erişim
        const isFullAccessEmail = !!(FULL_ACCESS_EMAIL && user.email && user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL);
        if (isFullAccessEmail) {
            user.role = 'admin';
            user.access_level = 'advanced';
        }
        
        // Kullanıcının aktif satın alımlarını veritabanından getir (her iki tabloyu da kontrol et)
        // Hem 'purchases' hem de 'user_package_purchases' tablolarından veri çekilir
        let purchases = [];
        
        // Önce 'purchases' tablosunu dene
        try {
            const purchasesResult = await pool.query(
                `SELECT id, category, level, price, purchased_at, expires_at 
                 FROM purchases 
                 WHERE user_id = $1 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY purchased_at DESC`,
                [userId]
            );
            // Satın alım verilerini frontend formatına dönüştür
            purchases = purchasesResult.rows.map(p => ({
                id: p.id,
                category: p.category,
                level: p.level,
                price: parseFloat(p.price), // Fiyatı sayıya dönüştür
                purchasedAt: p.purchased_at,
                expiresAt: p.expires_at
            }));
        } catch (err) {
            // 'purchases' tablosu henüz yoksa sorun değil (geçiş dönemi için)
            console.log('Could not fetch from purchases table (table may not exist):', err.message);
        }
        
        // Ayrıca 'user_package_purchases' tablosunu da dene
        try {
            const userPackagePurchasesResult = await pool.query(
                `SELECT id, category, level, price, purchased_at, expires_at 
                 FROM user_package_purchases 
                 WHERE user_id = $1 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY purchased_at DESC`,
                [userId]
            );
            const userPackagePurchases = userPackagePurchasesResult.rows.map(p => ({
                id: p.id,
                category: p.category,
                level: p.level,
                price: parseFloat(p.price),
                purchasedAt: p.purchased_at,
                expiresAt: p.expires_at
            }));
            // Satın alımları birleştir (duplikasyonları önle - aynı kategori ve seviyeye sahip satın alımlar)
            purchases = [...purchases, ...userPackagePurchases.filter(up => 
                !purchases.some(p => p.category === up.category && p.level === up.level)
            )];
        } catch (err) {
            console.log('Could not fetch from user_package_purchases table:', err.message);
        }

        // Super admin için tüm kategorilerde erişim sağla
        if (isFullAccessEmail) {
            const allCategories = ['cybersecurity', 'cloud', 'data-science'];
            for (const cat of allCategories) {
                if (!purchases.some(p => p.category === cat && p.level === 'advanced')) {
                    purchases.push({ id: 'super', category: cat, level: 'advanced', price: 0, purchasedAt: null, expiresAt: null });
                }
            }
        }
        
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                accessLevel: user.access_level,
                isVerified: isFullAccessEmail ? true : user.is_verified,
                createdAt: user.created_at,
                lastLogin: user.last_login,
                purchases: purchases
            }
        });
    } catch (error) {
        console.error('Get user me error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ============================================
// CSP TEST ENDPOINT'İ (Sadece development için)
// ============================================
// CSP header'ını test etmek için
if (process.env.NODE_ENV === 'development') {
    app.get('/api/test-csp', (req, res) => {
        res.json({
            message: 'CSP test endpoint',
            cspHeader: req.headers['content-security-policy'] || 'Not set in request',
            note: 'Check response headers for Content-Security-Policy'
        });
    });
}

// ============================================
// SAĞLIK KONTROLÜ (Railway / Render / load balancer)
// ============================================
// Her zaman 200 — süreç ayakta mı (DB kapalı olsa bile deploy sağlık kontrolü geçsin)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Veritabanı + pool detayı (izleme; DB yoksa 503)
app.get('/api/health/ready', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT NOW(), version()');
        const dbHealthy = dbResult.rows.length > 0;

        res.json({
            status: 'healthy',
            database: {
                status: dbHealthy ? 'connected' : 'disconnected',
                type: 'postgresql',
                serverTime: dbResult.rows[0]?.now,
                version: dbResult.rows[0]?.version?.split(' ')[0] + ' ' + dbResult.rows[0]?.version?.split(' ')[1]
            },
            pool: {
                totalCount: pool.totalCount || 0,
                idleCount: pool.idleCount || 0,
                waitingCount: pool.waitingCount || 0
            },
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: {
                status: 'error',
                error: error.message
            },
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    }
});

// ============================================
// İLETİŞİM FORMU (SMTP → CONTACT_INBOX_EMAIL)
// ============================================
app.post('/api/contact', contactFormLimiter, async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message, privacyAccepted } = req.body || {};

        if (!privacyAccepted) {
            return res.status(400).json({
                success: false,
                message: 'Gizlilik politikasını kabul etmelisiniz.'
            });
        }

        const fn = sanitizeInput(String(firstName || '').slice(0, 100));
        const ln = sanitizeInput(String(lastName || '').slice(0, 100));
        if (!fn || !ln) {
            return res.status(400).json({
                success: false,
                message: 'Ad ve soyad zorunludur.'
            });
        }

        const emailRaw = String(email || '').trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailRaw)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir e-posta adresi girin.'
            });
        }

        const allowedSubjects = ['general', 'support', 'partnership', 'feedback', 'other'];
        if (!allowedSubjects.includes(subject)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir konu seçin.'
            });
        }

        const msg = sanitizeInput(String(message || '').slice(0, 8000));
        if (msg.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Mesaj en az 10 karakter olmalıdır.'
            });
        }

        const phoneSanitized = phone ? sanitizeInput(String(phone).slice(0, 40)) : '';

        const result = await sendContactFormNotification({
            firstName: fn,
            lastName: ln,
            email: emailRaw,
            phone: phoneSanitized,
            subjectKey: subject,
            message: msg
        });

        if (!result.success) {
            return res.status(503).json({
                success: false,
                message:
                    'Mesaj şu an e-posta ile iletilemiyor. Lütfen daha sonra tekrar deneyin veya info@sebsglobal.com adresine yazın.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mesajınız alındı. En kısa sürede size dönüş yapılacaktır.'
        });
    } catch (error) {
        return handleError(res, error, 'Mesaj gönderilemedi');
    }
});

// ============================================
// KİMLİK DOĞRULAMA ENDPOINT'LERİ
// ============================================

// Kullanıcı kaydı (register)
// Yeni kullanıcı hesabı oluşturur ve doğrulama e-postası gönderir
app.post('/api/auth/register', async (req, res) => {
    try {
        // Request body'den kullanıcı bilgilerini al
        const { email, password, firstName, lastName } = req.body;

        // Girdi doğrulaması - Tüm alanların doldurulup doldurulmadığını kontrol et
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // E-posta formatı doğrulaması - Geçerli bir e-posta formatı olup olmadığını kontrol et
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Şifre doğrulaması - Şifre en az 6 karakter olmalı
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
        const existingUser = await pool.query(
            'SELECT id, is_verified FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            const user = existingUser.rows[0];
            if (user.is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered but not verified. Please check your email for verification code.'
                });
            }
        }

        // Şifreyi hash'le (bcrypt ile güvenli şifreleme)
        // Salt rounds: Hash işleminde kullanılan güvenlik katmanı (12 = güvenli ve dengeli)
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 6 haneli doğrulama kodu oluştur (100000-999999 arası rastgele sayı)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Doğrulama kodunun geçerlilik süresi: 15 dakika
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        // Kullanıcıyı veritabanına ekle
        // UUID generate et (crypto.randomUUID kullan)
        const { randomUUID } = require('crypto');
        const userId = randomUUID();
        const publicId = randomUUID();
        const now = new Date();
        const result = await pool.query(
            `INSERT INTO users (id, "publicId", email, password_hash, first_name, last_name, verification_code, verification_code_expires, created_at, updated_at)
             VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, first_name, last_name, is_verified`,
            [userId, publicId, email, passwordHash, firstName, lastName, verificationCode, verificationExpires, now, now]
        );

        const user = result.rows[0];

        console.log('✅ New user registered:', {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationCode, firstName);
        
        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            const allowDevBypass = process.env.NODE_ENV !== 'production';
            if (!allowDevBypass) {
                // Production safety: keep strict behavior.
                await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
                return res.status(500).json({
                    success: false,
                    message: 'E-posta gönderilemedi. Lütfen e-posta adresinizi kontrol edin ve tekrar deneyin.'
                });
            }

            // Development fallback: keep the account, return verification code for local testing.
            return res.json({
                success: true,
                message: 'Kayıt başarılı! SMTP yapılandırılmadığı için doğrulama kodu test modunda döndürüldü.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        isVerified: user.is_verified
                    },
                    emailSent: false,
                    requiresVerification: true,
                    verificationCode
                }
            });
        }

        // Don't generate JWT token until email is verified
        res.json({
            success: true,
            message: 'Kayıt başarılı! E-posta adresinize gönderilen güvenlik kodunu girin.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    isVerified: user.is_verified
                },
                emailSent: true,
                requiresVerification: true
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// E-posta doğrulama
// Kullanıcının e-posta adresine gönderilen doğrulama kodunu kontrol eder ve hesabı aktifleştirir
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Girdi doğrulaması
        if (!email || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        // Kullanıcıyı ve doğrulama kodunu kontrol et
        const userResult = await pool.query(
            'SELECT id, verification_code, verification_code_expires FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        if (!user.verification_code || user.verification_code !== verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        if (new Date() > new Date(user.verification_code_expires)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code expired'
            });
        }

        // Update user as verified
        await pool.query(
            'UPDATE users SET is_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1',
            [user.id]
        );

        // Generate JWT token after successful verification
        const token = jwt.sign(
            { userId: user.id, email: email },
            process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required'); })(),
            { expiresIn: '24h' }
        );

        // Güncellenmiş kullanıcı verilerini getir
        const updatedUser = await pool.query(
            'SELECT id, email, first_name, last_name, is_verified FROM users WHERE id = $1',
            [user.id]
        );

        // Başarılı yanıt döndür (JWT token ile birlikte)
        res.json({
            success: true,
            message: 'E-posta başarıyla doğrulandı! Hesabınız aktif edildi.',
            data: {
                user: {
                    id: updatedUser.rows[0].id,
                    email: updatedUser.rows[0].email,
                    firstName: updatedUser.rows[0].first_name,
                    lastName: updatedUser.rows[0].last_name,
                    isVerified: updatedUser.rows[0].is_verified
                },
                token, // JWT token - kullanıcı oturum açmış sayılır
                verified: true
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Doğrulama kodunu yeniden gönder
// Kullanıcı doğrulama kodunu almadıysa veya süresi dolduysa yeni kod gönderir
app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'E-posta adresi gereklidir'
            });
        }

        // Kullanıcının var olup olmadığını ve doğrulanmamış olduğunu kontrol et
        const userResult = await pool.query(
            'SELECT id, first_name, is_verified FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        const user = userResult.rows[0];

        // Kullanıcı zaten doğrulanmışsa hata döndür
        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten doğrulanmış'
            });
        }

        // Yeni doğrulama kodu oluştur (6 haneli rastgele sayı)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Yeni kodun geçerlilik süresi: 15 dakika
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        // Veritabanındaki doğrulama kodunu güncelle
        await pool.query(
            'UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3',
            [verificationCode, verificationExpires, user.id]
        );

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationCode, user.first_name);
        
        if (!emailResult.success) {
            const allowDevBypass = process.env.NODE_ENV !== 'production';
            if (!allowDevBypass) {
                return res.status(500).json({
                    success: false,
                    message: 'E-posta gönderilemedi. Lütfen tekrar deneyin.'
                });
            }
            return res.json({
                success: true,
                message: 'SMTP yapılandırılmadı. Yeni doğrulama kodu test modunda döndürüldü.',
                data: { verificationCode }
            });
        }

        res.json({
            success: true,
            message: 'Yeni güvenlik kodu gönderildi!'
        });

    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Kullanıcı girişi (login)
// E-posta ve şifre ile kullanıcı kimlik doğrulaması yapar ve JWT token döndürür
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Girdi doğrulaması
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Kullanıcıyı bul - rol ve erişim seviyesi bilgilerini de dahil et
        const userResult = await pool.query(
            'SELECT id, email, password_hash, first_name, last_name, is_verified, role, is_active, access_level FROM users WHERE email = $1',
            [email]
        );

        // Kullanıcı bulunamazsa hata döndür (güvenlik için aynı mesaj)
        if (userResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = userResult.rows[0];

        // Supabase ile kayıtlı kullanıcılar şifre ile giriş yapamaz
        if (user.password_hash === SUPABASE_PASSWORD_PLACEHOLDER) {
            return res.status(400).json({
                success: false,
                message: 'Bu hesap Supabase ile giriş kullanıyor. Lütfen "Giriş Yap" sayfasından e-posta ve şifre ile giriş yapın.'
            });
        }

        // Şifreyi kontrol et (bcrypt ile hash'lenmiş şifreyi karşılaştır)
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Kullanıcı hesabının aktif olup olmadığını kontrol et
        if (!user.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Account is inactive. Please contact support.'
            });
        }

        // Kullanıcının e-posta adresini doğrulayıp doğrulamadığını kontrol et (super admin hariç)
        if (!user.is_verified && (!FULL_ACCESS_EMAIL || user.email.toLowerCase().trim() !== FULL_ACCESS_EMAIL)) {
            return res.status(400).json({
                success: false,
                message: 'E-posta adresinizi doğrulamanız gerekiyor. E-posta kutunuzu kontrol edin.'
            });
        }

        // Super admin: bu e-posta her zaman admin + tam erişim alır
        const isFullAccessEmail = !!(FULL_ACCESS_EMAIL && user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL);
        if (isFullAccessEmail) {
            user.role = 'admin';
            user.access_level = 'advanced';
        }

        // JWT token oluştur - kullanıcı rolünü de dahil et
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }
        
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Kullanıcının aktif satın alımlarını veritabanından getir
        let purchases = [];
        try {
            const purchasesResult = await pool.query(
                `SELECT id, category, level, price, purchased_at, expires_at 
                 FROM purchases 
                 WHERE user_id = $1 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY purchased_at DESC`,
                [user.id]
            );
            purchases = purchasesResult.rows.map(p => ({
                id: p.id,
                category: p.category,
                level: p.level,
                price: parseFloat(p.price),
                purchasedAt: p.purchased_at,
                expiresAt: p.expires_at
            }));
        } catch (err) {
            // 'purchases' tablosu henüz yoksa sorun değil (geçiş dönemi için)
            console.log('Could not fetch purchases during login (table may not exist):', err.message);
        }

        // Ayrıca 'user_package_purchases' tablosunu da dene
        try {
            const userPackagePurchasesResult = await pool.query(
                `SELECT id, category, level, price, purchased_at, expires_at 
                 FROM user_package_purchases 
                 WHERE user_id = $1 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY purchased_at DESC`,
                [user.id]
            );
            const userPackagePurchases = userPackagePurchasesResult.rows.map(p => ({
                id: p.id,
                category: p.category,
                level: p.level,
                price: parseFloat(p.price),
                purchasedAt: p.purchased_at,
                expiresAt: p.expires_at
            }));
            // Satın alımları birleştir (duplikasyonları önle - aynı kategori ve seviyeye sahip satın alımlar)
            purchases = [...purchases, ...userPackagePurchases.filter(up => 
                !purchases.some(p => p.category === up.category && p.level === up.level)
            )];
        } catch (err) {
            // Tablo henüz yoksa sorun değil
            console.log('Could not fetch user_package_purchases during login:', err.message);
        }

        // Super admin için tüm kategorilerde advanced satın alım doldur (tam erişim)
        if (isFullAccessEmail && (!purchases || purchases.length === 0)) {
            purchases = [
                { id: 'super', category: 'cybersecurity', level: 'advanced', price: 0, purchasedAt: null, expiresAt: null },
                { id: 'super', category: 'cloud', level: 'advanced', price: 0, purchasedAt: null, expiresAt: null },
                { id: 'super', category: 'data-science', level: 'advanced', price: 0, purchasedAt: null, expiresAt: null }
            ];
        } else if (isFullAccessEmail) {
            const categories = ['cybersecurity', 'cloud', 'data-science'];
            for (const cat of categories) {
                if (!purchases.some(p => p.category === cat && p.level === 'advanced')) {
                    purchases.push({ id: 'super', category: cat, level: 'advanced', price: 0, purchasedAt: null, expiresAt: null });
                }
            }
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    isVerified: isFullAccessEmail ? true : user.is_verified,
                    role: user.role || 'user',
                    accessLevel: user.access_level || 'beginner',
                    purchases: purchases
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ============================================
// MODÜL ENDPOINT'LERİ
// ============================================

// Kurslar: modüller kategoriye göre gruplanmış (module-progress.js getModuleIdFromName, dashboard senkron)
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, category, level, sort_order
             FROM modules
             WHERE is_active = true
             ORDER BY category NULLS LAST, sort_order NULLS LAST, title`
        );
        const categoryCourseTitles = {
            cybersecurity: 'Siber Güvenlik',
            cloud: 'Bulut Bilişim',
            'data-science': 'Veri Bilimleri'
        };
        const byCat = new Map();
        for (const row of result.rows) {
            const cat = row.category || 'cybersecurity';
            if (!byCat.has(cat)) {
                byCat.set(cat, []);
            }
            byCat.get(cat).push({
                id: row.id,
                title: row.title,
                description: row.description,
                level: row.level
            });
        }
        const data = [];
        for (const [cat, modules] of byCat) {
            data.push({
                title: categoryCourseTitles[cat] || cat,
                category: cat,
                modules
            });
        }
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Tüm modülleri getir (kullanıcı kimlik doğrulaması yapıldıysa erişim kontrolü ile)
// Kullanıcı giriş yapmışsa satın aldığı paketlere göre erişim bilgisi döndürür
app.get('/api/modules', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        let userPurchases = [];
        let userAccessLevel = 'beginner';
        
        // Kullanıcı kimlik doğrulaması yapıldıysa satın alımlarını getir
        if (token) {
            try {
                if (!process.env.JWT_SECRET) {
                    throw new Error('JWT_SECRET environment variable is required');
                }
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.userId;
                
                // Kullanıcının aktif satın alımlarını getir
                try {
                    const purchasesResult = await pool.query(
                        `SELECT category, level FROM purchases 
                         WHERE user_id = $1 AND is_active = TRUE 
                         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
                        [userId]
                    );
                    userPurchases = purchasesResult.rows;
                } catch (err) {
                    // 'purchases' tablosu henüz yoksa sorun değil
                    console.log('Could not fetch purchases:', err.message);
                }
                
                // Kullanıcının erişim seviyesini getir
                const userResult = await pool.query(
                    'SELECT access_level FROM users WHERE id = $1',
                    [userId]
                );
                if (userResult.rows.length > 0) {
                    userAccessLevel = userResult.rows[0].access_level || 'beginner';
                }
            } catch (err) {
                // Geçersiz token, misafir olarak devam et
                console.log('Token verification failed, serving as guest');
            }
        }
        
        // Tüm aktif modülleri getir
        const result = await pool.query(
            'SELECT * FROM modules WHERE is_active = true ORDER BY id'
        );

        // Modülleri erişim bilgileriyle birlikte döndür
        // Frontend satın alımlara göre filtrelemeyi yapacak
        const modules = result.rows.map(module => {
            // Modül seviyesini belirle (modules tablosuna level alanı eklemeniz gerekebilir)
            const moduleLevel = module.level || 'beginner';
            const moduleCategory = module.category || 'cybersecurity';
            
            // Kullanıcının bu kategori ve seviyeye erişimi olup olmadığını kontrol et
            const hasAccess = !token || userPurchases.some(p => 
                p.category === moduleCategory && p.level === moduleLevel
            );
            
            return {
                ...module,
                hasAccess: hasAccess,
                userAccessLevel: token ? userAccessLevel : null
            };
        });

        res.json({
            success: true,
            data: modules,
            userPurchases: token ? userPurchases : [],
            userAccessLevel: token ? userAccessLevel : null
        });
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ID'ye göre modül getir
// Belirli bir modülün detaylarını döndürür
app.get('/api/modules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM modules WHERE id = $1 AND is_active = true',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Genel modül ilerlemesi (HTML modülleri — frontend/utils/module-progress.js → POST /api/progress)
app.post('/api/progress', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { moduleId, percentComplete, lastStep, isCompleted } = req.body || {};
        if (!moduleId) {
            return res.status(400).json({ success: false, message: 'moduleId gerekli.' });
        }
        const pct = Math.max(0, Math.min(100, Number(percentComplete) || 0));
        let lastStepObj = {};
        if (typeof lastStep === 'string') {
            try {
                lastStepObj = JSON.parse(lastStep || '{}');
            } catch (e) {
                lastStepObj = {};
            }
        } else if (lastStep && typeof lastStep === 'object') {
            lastStepObj = lastStep;
        }
        const lessonsArr = Array.isArray(lastStepObj.completedLessons) ? lastStepObj.completedLessons : [];
        const completedCount = lessonsArr.length;
        const totalLessons = Math.max(
            0,
            Number(lastStepObj.totalLessons) || (completedCount > 0 ? completedCount : 0) || 1
        );
        const done = Boolean(isCompleted) || pct >= 100;
        const status = done ? 'completed' : 'in_progress';

        await pool.query(
            `INSERT INTO user_module_progress (user_id, module_id, completed_lessons, total_lessons, progress_percentage, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id, module_id)
             DO UPDATE SET
                 completed_lessons = EXCLUDED.completed_lessons,
                 total_lessons = EXCLUDED.total_lessons,
                 progress_percentage = EXCLUDED.progress_percentage,
                 status = EXCLUDED.status,
                 updated_at = CURRENT_TIMESTAMP`,
            [userId, moduleId, completedCount, totalLessons, pct, status]
        );

        await pool.query(
            `INSERT INTO module_progress (user_id, module_id, percent_complete, is_completed, last_step, last_accessed_at)
             VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
             ON CONFLICT (user_id, module_id)
             DO UPDATE SET
                 percent_complete = EXCLUDED.percent_complete,
                 is_completed = EXCLUDED.is_completed,
                 last_step = EXCLUDED.last_step,
                 last_accessed_at = NOW(),
                 updated_at = NOW()`,
            [userId, moduleId, pct, done, JSON.stringify(lastStepObj)]
        );

        res.json({ success: true, message: 'İlerleme kaydedildi.', data: { moduleId, percentComplete: pct } });
    } catch (err) {
        logger.error('POST /api/progress error:', err);
        res.status(500).json({ success: false, message: 'İlerleme kaydedilemedi.' });
    }
});

// Ders ilerlemesini güncelle
// Kullanıcının bir ders üzerindeki ilerlemesini kaydeder ve modül ilerlemesini günceller
app.post('/api/progress/lesson/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progressPercentage, lastPositionSeconds } = req.body;
        const progressPct = progressPercentage;
        const userId = req.user.userId;

        // Dersin var olup olmadığını kontrol et
        const lessonResult = await pool.query(
            'SELECT id, module_id FROM lessons WHERE id = $1',
            [id]
        );

        if (lessonResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        const lesson = lessonResult.rows[0];

        // Ders ilerlemesini ekle veya güncelle (upsert)
        // Eğer kayıt varsa güncelle, yoksa yeni kayıt oluştur
        await pool.query(
            `INSERT INTO user_lesson_progress (user_id, lesson_id, status, progress_percentage, last_position_seconds)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, lesson_id)
             DO UPDATE SET 
                 status = EXCLUDED.status,
                 progress_percentage = EXCLUDED.progress_percentage,
                 last_position_seconds = EXCLUDED.last_position_seconds,
                 updated_at = CURRENT_TIMESTAMP`,
            [userId, id, status, (progressPct != null ? progressPct : 0), lastPositionSeconds || 0]
        );

        // Modül ilerlemesini güncelle (tamamlanan ders sayısına göre)
        const moduleProgressResult = await pool.query(
            `SELECT 
                 COUNT(*) as total_lessons,
                 COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) as completed_lessons
             FROM lessons l
             LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = $1
             WHERE l.module_id = $2`,
            [userId, lesson.module_id]
        );

        const { total_lessons, completed_lessons } = moduleProgressResult.rows[0];
        const moduleProgressPercentage = Math.round((completed_lessons / total_lessons) * 100);

        await pool.query(
            `INSERT INTO user_module_progress (user_id, module_id, completed_lessons, total_lessons, progress_percentage, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id, module_id)
             DO UPDATE SET 
                 completed_lessons = EXCLUDED.completed_lessons,
                 total_lessons = EXCLUDED.total_lessons,
                 progress_percentage = EXCLUDED.progress_percentage,
                 status = EXCLUDED.status,
                 updated_at = CURRENT_TIMESTAMP`,
            [userId, lesson.module_id, completed_lessons, total_lessons, moduleProgressPercentage, 
             moduleProgressPercentage === 100 ? 'completed' : 'in_progress']
        );

        res.json({
            success: true,
            message: 'Progress updated successfully'
        });

    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Giriş kaydı (günlük giriş takibi)
app.post('/api/progress/activity/login', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        await pool.query(
            `INSERT INTO user_login_logs (user_id, logged_at) VALUES ($1, NOW())`,
            [userId]
        ).catch(() => {});
        res.json({ success: true, message: 'Giriş kaydedildi.' });
    } catch (err) {
        res.json({ success: true, message: 'Giriş kaydedildi.' });
    }
});

// Modül süresi güncelle (time-tracker, dashboard süre toplamı)
app.post('/api/progress/time', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { moduleId, minutes, timeSpentMinutes } = req.body || {};
        if (!moduleId) {
            return res.status(400).json({ success: false, message: 'moduleId gerekli.' });
        }
        const mins = Math.max(0, Math.min(Number(timeSpentMinutes ?? minutes) || 0, 24 * 60)); // 0..1440 dakika (max 24 saat tek istek)
        await pool.query(
            `INSERT INTO module_progress (user_id, module_id, time_spent_minutes, last_accessed_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (user_id, module_id)
             DO UPDATE SET
                 time_spent_minutes = COALESCE(module_progress.time_spent_minutes, 0) + EXCLUDED.time_spent_minutes,
                 last_accessed_at = NOW(),
                 updated_at = NOW()`,
            [userId, moduleId, mins]
        );
        // Günlük modül süresi (user_module_sessions)
        const today = new Date().toISOString().slice(0, 10);
        await pool.query(
            `INSERT INTO user_module_sessions (user_id, module_id, session_date, minutes_spent, last_updated_at)
             VALUES ($1, $2, $3::date, $4, NOW())
             ON CONFLICT (user_id, module_id, session_date)
             DO UPDATE SET minutes_spent = user_module_sessions.minutes_spent + EXCLUDED.minutes_spent, last_updated_at = NOW()`,
            [userId, moduleId, today, mins]
        ).catch(() => {});
        res.json({ success: true, message: 'Süre kaydedildi.', data: { moduleId, minutes: mins } });
    } catch (err) {
        logger.error('Progress time error:', err);
        res.status(500).json({ success: false, message: 'Süre kaydedilirken bir hata oluştu.' });
    }
});

// Quiz sonucu kaydet (module_progress.last_step içinde quizResults)
app.post('/api/progress/quiz', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { moduleId, quizId, score, correctAnswers, wrongAnswers, answers, timeSpent } = req.body || {};
        if (!moduleId || quizId == null) {
            return res.status(400).json({ success: false, message: 'moduleId ve quizId gerekli.' });
        }
        const entry = {
            quizId: String(quizId),
            score: Math.max(0, Math.min(100, Number(score) || 0)),
            correctAnswers: Math.max(0, Number(correctAnswers) || 0),
            wrongAnswers: Math.max(0, Number(wrongAnswers) || 0),
            timeSpent: Math.max(0, Number(timeSpent) || 0),
            answers: Array.isArray(answers) ? answers : []
        };
        const existing = await pool.query(
            `SELECT id, last_step FROM module_progress WHERE user_id = $1 AND module_id = $2`,
            [userId, moduleId]
        );
        let newLastStep = { quizResults: [entry] };
        if (existing.rows.length > 0 && existing.rows[0].last_step) {
            try {
                const prev = typeof existing.rows[0].last_step === 'string'
                    ? JSON.parse(existing.rows[0].last_step) : existing.rows[0].last_step;
                const list = Array.isArray(prev.quizResults) ? prev.quizResults : [];
                const without = list.filter(q => String(q.quizId) !== String(quizId));
                newLastStep = { ...prev, quizResults: [...without, entry] };
            } catch (e) { /* keep new */ }
        }
        await pool.query(
            `INSERT INTO module_progress (user_id, module_id, time_spent_minutes, last_step, last_accessed_at)
             VALUES ($1, $2, 0, $3::jsonb, NOW())
             ON CONFLICT (user_id, module_id)
             DO UPDATE SET last_step = $3::jsonb, last_accessed_at = NOW(), updated_at = NOW()`,
            [userId, moduleId, JSON.stringify(newLastStep)]
        );
        // quiz_attempts tablosuna kaydet (kaç doğru, kaç yanlış)
        const total = Math.max(0, (entry.correctAnswers || 0) + (entry.wrongAnswers || 0)) || 1;
        await pool.query(
            `INSERT INTO quiz_attempts (user_id, module_id, quiz_section_id, total_questions, correct_count, wrong_count, score_percent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, moduleId, String(quizId), total, entry.correctAnswers || 0, entry.wrongAnswers || 0, entry.score || 0]
        ).catch(() => {});
        res.json({ success: true, message: 'Quiz sonucu kaydedildi.', data: { moduleId, quizId, score: entry.score } });
    } catch (err) {
        logger.error('Progress quiz error:', err);
        if (err.message && /column.*last_step|does not exist/i.test(err.message)) {
            return res.status(501).json({ success: false, message: 'Quiz kaydı için veritabanı güncellemesi (migration 009) gerekli.' });
        }
        res.status(500).json({ success: false, message: 'Quiz sonucu kaydedilirken bir hata oluştu.' });
    }
});

// Simülasyon başlatma (started_at; tamamlanınca POST /complete ile güncellenir)
app.post('/api/simulations/start', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const body = req.body || {};
        const moduleId = body.moduleId || body.module_id || null;
        const simulationId = String(body.simulationId || body.simulation_id || '');
        if (!simulationId.trim()) {
            return res.status(400).json({ success: false, message: 'simulationId gerekli.' });
        }
        const r = await pool.query(
            `INSERT INTO simulation_runs (user_id, module_id, simulation_id, started_at)
             VALUES ($1, $2, $3, NOW()) RETURNING id`,
            [userId, moduleId, simulationId.trim()]
        );
        res.json({
            success: true,
            message: 'Simülasyon başlangıcı kaydedildi.',
            data: { runId: r.rows[0].id }
        });
    } catch (err) {
        logger.error('Simulations start error:', err);
        if (err.message && /column.*started_at|does not exist/i.test(String(err.message))) {
            return res.status(501).json({
                success: false,
                message: 'Veritabanı güncellemesi gerekli: database/migrations/014_simulation_runs_extended.sql'
            });
        }
        res.status(500).json({ success: false, message: 'Simülasyon başlatma kaydı sırasında bir hata oluştu.' });
    }
});

// Simülasyon tamamlama kaydı (simulation_runs)
app.post('/api/simulations/complete', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const body = req.body || {};
        const moduleId = body.moduleId || body.module_id || null;
        const simulationId = String(body.simulationId || body.simulation_id || '');
        const runId = body.runId || body.run_id || null;
        const score = Math.max(0, Math.min(100, Number(body.score) || 0));
        const timeSpent = Math.max(0, Number(body.timeSpent) || 0);
        const attempts = Math.max(1, Number(body.attempts) || 1);
        const correctRaw = body.correctCount != null ? body.correctCount : body.correct_count;
        const wrongRaw = body.wrongCount != null ? body.wrongCount : body.wrong_count;
        const correctCount = Math.max(0, Math.min(100000, parseInt(String(correctRaw), 10) || 0));
        const wrongCount = Math.max(0, Math.min(100000, parseInt(String(wrongRaw), 10) || 0));
        let passed = body.passed;
        if (typeof passed === 'string') {
            passed = passed === 'true' || passed === '1';
        }
        if (typeof passed !== 'boolean') {
            passed = score >= 70;
        }
        const startedAtIso = body.startedAt || body.started_at;
        if (!simulationId.trim()) {
            return res.status(400).json({ success: false, message: 'simulationId gerekli.' });
        }
        if (runId) {
            const u = await pool.query(
                `UPDATE simulation_runs
                 SET score = $1, time_spent = $2, attempts = $3,
                     correct_count = $4, wrong_count = $5, passed = $6,
                     completed_at = NOW()
                 WHERE id = $7::uuid AND user_id = $8::uuid
                 RETURNING id`,
                [score, timeSpent, attempts, correctCount, wrongCount, passed, runId, userId]
            );
            if (u.rowCount === 0) {
                logger.warn('simulations/complete: runId güncellenemedi, yeni satır ekleniyor', { runId });
                let saParam = null;
                if (startedAtIso) {
                    const d = new Date(startedAtIso);
                    if (!Number.isNaN(d.getTime())) saParam = d.toISOString();
                }
                await pool.query(
                    `INSERT INTO simulation_runs
                     (user_id, module_id, simulation_id, score, time_spent, attempts, completed_at,
                      started_at, correct_count, wrong_count, passed)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), COALESCE($7::timestamptz, NOW()), $8, $9, $10)`,
                    [userId, moduleId, simulationId.trim(), score, timeSpent, attempts, saParam, correctCount, wrongCount, passed]
                );
            }
        } else {
            let saParam = null;
            if (startedAtIso) {
                const d = new Date(startedAtIso);
                if (!Number.isNaN(d.getTime())) saParam = d.toISOString();
            }
            await pool.query(
                `INSERT INTO simulation_runs
                 (user_id, module_id, simulation_id, score, time_spent, attempts, completed_at,
                  started_at, correct_count, wrong_count, passed)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), COALESCE($7::timestamptz, NOW()), $8, $9, $10)`,
                [userId, moduleId, simulationId.trim(), score, timeSpent, attempts, saParam, correctCount, wrongCount, passed]
            );
        }
        res.json({
            success: true,
            message: 'Simülasyon tamamlama kaydedildi.',
            data: {
                simulationId: simulationId.trim(),
                score,
                timeSpent,
                attempts,
                correctCount,
                wrongCount,
                passed
            }
        });
    } catch (err) {
        logger.error('Simulations complete error:', err);
        if (err.message && /column.*correct_count|column.*started_at|does not exist/i.test(String(err.message))) {
            return res.status(501).json({
                success: false,
                message: 'Veritabanı güncellemesi gerekli: database/migrations/014_simulation_runs_extended.sql'
            });
        }
        res.status(500).json({ success: false, message: 'Simülasyon kaydı sırasında bir hata oluştu.' });
    }
});

// Modül ilerlemesini getir (module-progress.js: GET /api/progress/:moduleId ile uyumlu)
// Kullanıcının belirli bir modül üzerindeki ilerleme bilgilerini döndürür
app.get('/api/progress/module/:moduleId', authenticateToken, async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT ump.*, m.title as module_title,
                    mp.last_step AS mp_last_step,
                    mp.percent_complete AS mp_percent_complete,
                    mp.is_completed AS mp_is_completed
             FROM user_module_progress ump
             JOIN modules m ON ump.module_id = m.id
             LEFT JOIN module_progress mp ON mp.user_id = ump.user_id AND mp.module_id = ump.module_id
             WHERE ump.user_id = $1 AND ump.module_id = $2`,
            [userId, moduleId]
        );

        if (result.rows.length === 0) {
            const mpOnly = await pool.query(
                `SELECT mp.*, m.title as module_title
                 FROM module_progress mp
                 LEFT JOIN modules m ON mp.module_id = m.id
                 WHERE mp.user_id = $1 AND mp.module_id = $2`,
                [userId, moduleId]
            );
            if (mpOnly.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Module progress not found'
                });
            }
            const row = mpOnly.rows[0];
            let ls = row.last_step;
            if (typeof ls === 'string') {
                try {
                    ls = JSON.parse(ls || '{}');
                } catch (e) {
                    ls = {};
                }
            }
            return res.json({
                success: true,
                data: {
                    ...row,
                    percentComplete: row.percent_complete,
                    lastStep: ls || {},
                    progress_percentage: row.percent_complete
                }
            });
        }

        const row = result.rows[0];
        let lastStepMerged = row.mp_last_step;
        if (typeof lastStepMerged === 'string') {
            try {
                lastStepMerged = JSON.parse(lastStepMerged || '{}');
            } catch (e) {
                lastStepMerged = {};
            }
        }
        if (!lastStepMerged || typeof lastStepMerged !== 'object') {
            lastStepMerged = {};
        }

        res.json({
            success: true,
            data: {
                ...row,
                percentComplete: row.progress_percentage,
                progress_percentage: row.progress_percentage,
                lastStep: lastStepMerged,
                isCompleted: row.status === 'completed' || row.mp_is_completed === true
            }
        });
    } catch (error) {
        console.error('Get module progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Dashboard özet bilgilerini getir
// user_module_progress (ders ilerlemesi) + module_progress (süre/last_step) birlikte kullanılır
app.get('/api/progress/overview', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Önce user_module_progress (POST /progress/lesson ile doldurulur), varsa module_progress ile süre bilgisi
        const progressResult = await pool.query(
            `SELECT 
                 ump.module_id,
                 ump.progress_percentage AS percent_complete,
                 (ump.status = 'completed') AS is_completed,
                 mp.time_spent_minutes,
                 COALESCE(mp.updated_at, ump.updated_at) AS updated_at,
                 m.title AS module_title,
                 m.description AS module_description
             FROM user_module_progress ump
             LEFT JOIN modules m ON ump.module_id = m.id
             LEFT JOIN module_progress mp ON mp.user_id = ump.user_id AND mp.module_id = ump.module_id
             WHERE ump.user_id = $1
             ORDER BY COALESCE(mp.updated_at, ump.updated_at) DESC`,
            [userId]
        );

        // module_progress'ta olup user_module_progress'ta olmayan kayıtlar (eski veri)
        const onlyMpResult = await pool.query(
            `SELECT mp.module_id, mp.percent_complete, mp.is_completed, mp.time_spent_minutes, mp.updated_at,
                    m.title AS module_title, m.description AS module_description
             FROM module_progress mp
             LEFT JOIN modules m ON mp.module_id = m.id
             WHERE mp.user_id = $1 AND NOT EXISTS (
                 SELECT 1 FROM user_module_progress ump WHERE ump.user_id = mp.user_id AND ump.module_id = mp.module_id
             )
             ORDER BY mp.updated_at DESC`,
            [userId]
        );

        const mapRow = (row) => ({
            moduleId: row.module_id,
            moduleTitle: row.module_title || 'Unknown Module',
            moduleDescription: row.module_description || '',
            percentComplete: parseFloat(row.percent_complete) || 0,
            isCompleted: row.is_completed || false,
            lastStep: row.time_spent_minutes != null ? { timeSpentMinutes: row.time_spent_minutes } : null,
            updatedAt: row.updated_at
        });

        let modules = progressResult.rows.map(mapRow);
        const existingIds = new Set(modules.map(m => m.moduleId));
        onlyMpResult.rows.forEach(row => {
            if (!existingIds.has(row.module_id)) {
                modules.push(mapRow(row));
                existingIds.add(row.module_id);
            }
        });
        modules.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

        const totalModules = modules.length;
        const completedModules = modules.filter(m => m.isCompleted).length;
        let totalStudyTime = 0;
        modules.forEach(module => {
            if (module.lastStep && module.lastStep.timeSpentMinutes) {
                totalStudyTime += module.lastStep.timeSpentMinutes;
            }
        });

        let simulationRuns = [];
        try {
            const simRes = await pool.query(
                `SELECT id, simulation_id, module_id, started_at, completed_at, score, time_spent, attempts,
                        COALESCE(correct_count, 0) AS correct_count,
                        COALESCE(wrong_count, 0) AS wrong_count,
                        passed
                 FROM simulation_runs
                 WHERE user_id = $1
                 ORDER BY COALESCE(completed_at, started_at, created_at) DESC NULLS LAST
                 LIMIT 50`,
                [userId]
            );
            simulationRuns = simRes.rows.map((r) => {
                const done = r.completed_at != null;
                let status = 'started';
                if (done) {
                    if (r.passed === true) status = 'success';
                    else if (r.passed === false) status = 'failure';
                    else status = Number(r.score) >= 70 ? 'success' : 'failure';
                }
                return {
                    id: r.id,
                    simulationId: r.simulation_id,
                    moduleId: r.module_id,
                    startedAt: r.started_at,
                    completedAt: r.completed_at,
                    score: r.score,
                    timeSpent: r.time_spent,
                    attempts: r.attempts,
                    correctCount: r.correct_count,
                    wrongCount: r.wrong_count,
                    passed: r.passed,
                    statusLabel: done ? (status === 'success' ? 'Başarılı' : 'Başarısız') : 'Başlatıldı',
                    status
                };
            });
        } catch (simErr) {
            logger.warn('Get overview simulation_runs:', simErr.message);
            try {
                const legacy = await pool.query(
                    `SELECT simulation_id, score, time_spent, completed_at
                     FROM simulation_runs WHERE user_id = $1 ORDER BY completed_at DESC NULLS LAST LIMIT 50`,
                    [userId]
                );
                simulationRuns = legacy.rows.map((r) => ({
                    simulationId: r.simulation_id,
                    score: r.score,
                    timeSpent: r.time_spent,
                    completedAt: r.completed_at,
                    correctCount: 0,
                    wrongCount: 0,
                    passed: null,
                    statusLabel: Number(r.score) >= 70 ? 'Başarılı' : 'Başarısız',
                    status: Number(r.score) >= 70 ? 'success' : 'failure'
                }));
            } catch (e2) {
                simulationRuns = [];
            }
        }

        res.json({
            success: true,
            data: {
                totalModules,
                completedModules,
                totalStudyTime,
                modules,
                simulationRuns
            }
        });
    } catch (error) {
        logger.error('Get overview error:', error);
        res.status(500).json({
            success: false,
            message: 'İlerleme verisi yüklenirken bir hata oluştu.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Kullanıcı istatistiklerini getir
// Kullanıcının tamamladığı modül ve ders sayılarını döndürür
app.get('/api/user-stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT 
                 COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) as completed_modules,
                 COUNT(CASE WHEN ump.status = 'in_progress' THEN 1 END) as in_progress_modules,
                 SUM(ump.completed_lessons) as total_completed_lessons,
                 SUM(ump.total_lessons) as total_lessons
             FROM user_module_progress ump
             WHERE ump.user_id = $1`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Kullanıcı aktivitelerini getir
// Kullanıcının son aktivitelerini (ders tamamlama, modül başlatma vb.) döndürür
app.get('/api/user-activities', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = req.query.limit || 10;

        const result = await pool.query(
            `SELECT * FROM user_activities 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, limit]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get user activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Kullanıcı başarımlarını getir
// Kullanıcının kazandığı rozet ve başarımları döndürür
app.get('/api/user-achievements', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT * FROM user_achievements 
             WHERE user_id = $1 
             ORDER BY achieved_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get user achievements error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ============================================
// SATIN ALMA ENDPOINT'LERİ
// ============================================

// Paket satın alma
// Kullanıcının eğitim paketi satın almasını işler ve erişim seviyesini günceller
app.post('/api/purchase', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { category, level, price } = req.body;

        // Girdi doğrulaması - Tüm gerekli alanların doldurulup doldurulmadığını kontrol et
        if (!category || !level || price == null || price === '') {
            return res.status(400).json({
                success: false,
                message: 'Category, level ve price gerekli.'
            });
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0 || priceNum > 999999.99) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz fiyat. 0 ile 999999.99 arasında olmalıdır.'
            });
        }

        // Geçerli seviye değerlerini kontrol et
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz level. beginner, intermediate veya advanced olmalıdır.'
            });
        }

        // Mevcut kullanıcı bilgilerini getir
        const userResult = await pool.query(
            'SELECT id, email, access_level FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Kullanıcının bu pakete zaten sahip olup olmadığını kontrol et
        try {
            const existingPurchase = await pool.query(
                `SELECT id FROM purchases 
                 WHERE user_id = $1 AND category = $2 AND level = $3 AND is_active = TRUE`,
                [userId, category, level]
            );
            
            if (existingPurchase.rows.length > 0) {
                const levelNames = {
                    beginner: 'Temel',
                    intermediate: 'Orta',
                    advanced: 'İleri'
                };
                return res.status(400).json({
                    success: false,
                    message: `Bu pakete zaten sahipsiniz. ${levelNames[level] || level} seviyesi ${category === 'cybersecurity' ? 'Siber Güvenlik' : category === 'cloud' ? 'Bulut Bilişim' : 'Veri Bilimleri'} alanında aktif.`
                });
            }
        } catch (err) {
            // 'purchases' tablosu henüz yoksa devam et (geçiş dönemi için)
            console.log('Could not check existing purchases:', err.message);
        }

        // Satın alımı veritabanına kaydet (her iki tabloyu da dene)
        let purchaseId;
        
        // Önce 'user_package_purchases' tablosunu dene (mevcut tablo)
        try {
            const userPackagePurchaseResult = await pool.query(
                `INSERT INTO user_package_purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
                 VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, TRUE)
                 ON CONFLICT (user_id, category, level) 
                 DO UPDATE SET 
                     price = EXCLUDED.price,
                     payment_status = 'completed',
                     is_active = TRUE,
                     purchased_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 RETURNING id`,
                [userId, category, level, priceNum]
            );
            purchaseId = userPackagePurchaseResult.rows[0]?.id;
            console.log('✅ Purchase recorded in user_package_purchases table');
        } catch (err) {
            console.log('Could not insert into user_package_purchases:', err.message);
        }
        
        // Ayrıca 'purchases' tablosunu da dene (yeni tablo)
        try {
            const purchaseResult = await pool.query(
                `INSERT INTO purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
                 VALUES ($1, $2, $3, $4::decimal, 'completed', CURRENT_TIMESTAMP, TRUE)
                 ON CONFLICT (user_id, category, level) 
                 DO UPDATE SET 
                     price = EXCLUDED.price,
                     payment_status = 'completed',
                     is_active = TRUE,
                     purchased_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 RETURNING id`,
                [userId, category, level, priceNum]
            );
            if (!purchaseId) {
                purchaseId = purchaseResult.rows[0]?.id;
            }
            console.log('✅ Purchase recorded in purchases table');
        } catch (err) {
            // Eğer 'purchases' tablosu yoksa, oluşturmayı dene
            if (err.code === '42P01') { // Tablo mevcut değil hatası
                console.log('Purchases table not found, attempting to create...');
                try {
                    const migrationSQL = fs.readFileSync(
                        path.join(__dirname, '..', 'database', 'migrations', 'create_purchases_table.sql'),
                        'utf8'
                    );
                    await pool.query(migrationSQL);
                    // Tablo oluşturulduktan sonra tekrar ekleme işlemini dene
                    const purchaseResult = await pool.query(
                        `INSERT INTO purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
                         VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, TRUE)
                         ON CONFLICT (user_id, category, level) 
                         DO UPDATE SET 
                             price = EXCLUDED.price,
                             payment_status = 'completed',
                             is_active = TRUE,
                             purchased_at = CURRENT_TIMESTAMP,
                             updated_at = CURRENT_TIMESTAMP
                         RETURNING id`,
                        [userId, category, level, priceNum]
                    );
                    if (!purchaseId) {
                        purchaseId = purchaseResult.rows[0]?.id;
                    }
                    console.log('✅ Purchases table created and purchase recorded');
                } catch (createErr) {
                    console.error('Failed to create purchases table:', createErr);
                    // 'purchases' tablosunda kayıt olmadan devam et (user_package_purchases'de kayıt olabilir)
                }
            } else {
                console.log('Purchase record error (purchases table):', err.message);
                // Devam et - user_package_purchases tablosunda kayıt yapılmış olabilir
            }
        }

        // Kullanıcının erişim seviyesini bu kategori için satın aldığı en yüksek seviyeye güncelle
        // Bu kullanıcının bu kategorideki tüm aktif satın alımlarını getir
        try {
            const userPurchasesResult = await pool.query(
                `SELECT level FROM purchases 
                 WHERE user_id = $1 AND category = $2 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY 
                     CASE level 
                         WHEN 'beginner' THEN 1 
                         WHEN 'intermediate' THEN 2 
                         WHEN 'advanced' THEN 3 
                     END DESC
                 LIMIT 1`,
                [userId, category]
            );

            if (userPurchasesResult.rows.length > 0) {
                const highestLevel = userPurchasesResult.rows[0].level;
                // Kullanıcının erişim seviyesini sadece bu en yüksek seviye ise güncelle
                await pool.query(
                    'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [highestLevel, userId]
                );
            }
        } catch (err) {
            console.error('Error updating user access level:', err);
            // Yedek çözüm: satın alınan seviyeye güncelle
            await pool.query(
                'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [level, userId]
            );
        }

        // Güncellenmiş kullanıcı verilerini satın alımlarla birlikte getir
        const updatedUserResult = await pool.query(
            'SELECT id, email, first_name, last_name, role, access_level, is_verified, created_at, last_login FROM users WHERE id = $1',
            [userId]
        );

        const updatedUser = updatedUserResult.rows[0];

        // Get all active purchases for this user
        let purchases = [];
        try {
            const purchasesResult = await pool.query(
                `SELECT id, category, level, price, purchased_at, expires_at 
                 FROM purchases 
                 WHERE user_id = $1 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY purchased_at DESC`,
                [userId]
            );
            purchases = purchasesResult.rows.map(p => ({
                id: p.id,
                category: p.category,
                level: p.level,
                price: parseFloat(p.price),
                purchasedAt: p.purchased_at,
                expiresAt: p.expires_at
            }));
        } catch (err) {
            console.log('Could not fetch purchases after purchase:', err.message);
        }

        // Also try user_package_purchases table
        try {
            const userPackagePurchasesResult = await pool.query(
                `SELECT id, category, level, price, purchased_at, expires_at 
                 FROM user_package_purchases 
                 WHERE user_id = $1 AND is_active = TRUE 
                 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                 ORDER BY purchased_at DESC`,
                [userId]
            );
            const userPackagePurchases = userPackagePurchasesResult.rows.map(p => ({
                id: p.id,
                category: p.category,
                level: p.level,
                price: parseFloat(p.price),
                purchasedAt: p.purchased_at,
                expiresAt: p.expires_at
            }));
            // Merge with purchases (avoid duplicates)
            purchases = [...purchases, ...userPackagePurchases.filter(up => 
                !purchases.some(p => p.category === up.category && p.level === up.level)
            )];
        } catch (err) {
            console.log('Could not fetch user_package_purchases after purchase:', err.message);
        }

        res.json({
            success: true,
            message: 'Paket başarıyla satın alındı! Erişim seviyeniz güncellendi.',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    role: updatedUser.role,
                    accessLevel: updatedUser.access_level,
                    isVerified: updatedUser.is_verified,
                    createdAt: updatedUser.created_at,
                    lastLogin: updatedUser.last_login,
                    purchases: purchases
                },
                purchase: {
                    category,
                    level,
                    price
                }
            }
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({
            success: false,
            message: 'Satın alma işlemi sırasında bir hata oluştu',
            error: error.message
        });
    }
});

// ============================================
// DEĞERLENDİRME RAPORU (AI için gerekli veriler - kanıta dayalı)
// ============================================
// Quiz, simülasyon ve süre verilerinden skor hesaplar; yorumlama metni döndürür
app.get('/api/evaluation/report', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Kullanıcı bilgisi
        const userResult = await pool.query(
            'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
            [userId]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }
        const user = userResult.rows[0];

        // 2. Modül ilerlemesi (süre: time_spent_minutes; last_step varsa quiz sonuçları)
        let progressResult;
        try {
            progressResult = await pool.query(
                `SELECT module_id, percent_complete, time_spent_minutes, updated_at
                 FROM module_progress WHERE user_id = $1`,
                [userId]
            );
        } catch (e) {
            progressResult = { rows: [] };
        }

        const quizResults = [];
        let totalTimeMinutes = 0;
        for (const row of progressResult.rows) {
            const mins = row.time_spent_minutes || 0;
            totalTimeMinutes += mins;
        }
        // last_step kolonu varsa quiz verisi al (opsiyonel)
        try {
            const stepResult = await pool.query(
                `SELECT module_id, last_step FROM module_progress WHERE user_id = $1`,
                [userId]
            );
            for (const row of stepResult.rows) {
                if (row.last_step) {
                    try {
                        const meta = typeof row.last_step === 'string' ? JSON.parse(row.last_step) : row.last_step;
                        if (meta.quizResults && Array.isArray(meta.quizResults)) {
                            for (const q of meta.quizResults) {
                                quizResults.push({
                                    score: q.score != null ? q.score : 0,
                                    moduleId: row.module_id,
                                    quizId: q.quizId || q.id
                                });
                            }
                        }
                    } catch (e) { /* skip */ }
                }
            }
        } catch (e) { /* last_step kolonu yoksa görmezden gel */ }

        // 3. Simülasyon sonuçları (yalnızca tamamlananlar — ortalamaya dahil)
        const simResult = await pool.query(
            `SELECT simulation_id, score, time_spent, completed_at
             FROM simulation_runs
             WHERE user_id = $1 AND completed_at IS NOT NULL
             ORDER BY completed_at DESC`,
            [userId]
        );
        const simulationResults = simResult.rows.map(r => ({
            simulationId: r.simulation_id,
            score: r.score != null ? r.score : 0,
            timeSpent: r.time_spent || 0
        }));

        // 4. Skor hesaplama (deterministik - ağırlıklı ortalama)
        const quizScores = quizResults.map(q => q.score).filter(s => typeof s === 'number');
        const simScores = simulationResults.map(s => s.score).filter(s => typeof s === 'number');
        const allScores = [...quizScores, ...simScores];

        let overallScore = 0;
        if (allScores.length > 0) {
            const sum = allScores.reduce((a, b) => a + b, 0);
            overallScore = Math.round((sum / allScores.length) * 100) / 100;
        }

        const quizAvg = quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
        const simAvg = simScores.length ? simScores.reduce((a, b) => a + b, 0) / simScores.length : 0;

        // 5. Yorumlama metni (skor aralığına göre - AI yoksa fallback)
        let overallText = '';
        if (overallScore >= 90) {
            overallText = `Mükemmel bir performans (${overallScore}%). Tüm konularda güçlü bir temel oluşturmuşsunuz.`;
        } else if (overallScore >= 80) {
            overallText = `İyi bir performans (${overallScore}%). Çoğu konuda başarılısınız; birkaç alanda daha gelişim fırsatı var.`;
        } else if (overallScore >= 70) {
            overallText = `Orta-iyi seviye (${overallScore}%). Temel bilgilere sahipsiniz; düzenli pratikle ilerleyebilirsiniz.`;
        } else if (overallScore >= 60) {
            overallText = `Geliştirilebilir (${overallScore}%). Bazı temel konularda tekrar ve pratik önerilir.`;
        } else if (allScores.length > 0) {
            overallText = `Genel skor ${overallScore}%. Temel konuları tekrar gözden geçirmeniz faydalı olacaktır.`;
        } else {
            overallText = 'Henüz yeterli quiz veya simülasyon verisi yok. Modülleri tamamlayıp quiz/simülasyon yaptıkça raporunuz dolacaktır.';
        }

        const report = {
            scores: {
                overall: overallScore,
                quizAverage: Math.round(quizAvg * 100) / 100,
                simulationAverage: Math.round(simAvg * 100) / 100,
                quizCount: quizResults.length,
                simulationCount: simulationResults.length,
                totalTimeMinutes
            },
            interpretation: {
                overall: overallText,
                strengths: overallScore >= 75 ? ['Performansınız hedef seviyede veya üzerinde.'] : [],
                weaknesses: overallScore < 70 && allScores.length > 0 ? ['Zayıf konularda ek çalışma ve simülasyon tekrarları önerilir.'] : [],
                recommendations: overallScore < 80 && allScores.length > 0
                    ? ['Quiz ve simülasyonları tekrar çözün.', 'Zayıf gördüğünüz modülleri yeniden gözden geçirin.']
                    : []
            },
            evidence: {
                quizCount: quizResults.length,
                simulationCount: simulationResults.length,
                totalTimeSpent: totalTimeMinutes
            },
            generatedAt: new Date().toISOString()
        };

        res.json({ success: true, data: report });
    } catch (error) {
        logger.error('Evaluation report error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme raporu oluşturulurken bir hata oluştu.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================
// SERTİFİKALAR API (Dashboard uyumlu)
// ============================================
function isDbUnavailableError(err) {
    return err && (err.code === '42P01' || err.code === '42P07' || /does not exist|relation.*does not exist/i.test(String(err.message)));
}

app.get('/api/certificates', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const certResult = await pool.query(
            `SELECT id, user_id, category, title, description, completion_time, earned_at, certificate_url, metadata
             FROM certificates WHERE user_id = $1 ORDER BY earned_at DESC`,
            [userId]
        );
        const certificates = certResult.rows.map(c => ({
            id: c.id,
            userId: c.user_id,
            category: c.category,
            title: c.title,
            description: c.description,
            completionTime: c.completion_time,
            earnedAt: c.earned_at,
            certificateUrl: c.certificate_url,
            metadata: c.metadata
        }));
        res.json({ success: true, data: { certificates } });
    } catch (err) {
        logger.error('Certificates list error:', err);
        const msg = isDbUnavailableError(err) ? 'Veritabanı geçici olarak kullanılamıyor. Lütfen daha sonra deneyin.' : 'Sertifikalar yüklenirken bir hata oluştu.';
        res.status(500).json({ success: false, message: msg });
    }
});

// İzin verilen sertifika kategorileri (normalize edilmiş: backend’te kullanılan değerler)
const CERTIFICATE_CATEGORIES = new Set(['cybersecurity', 'cloud', 'data_science']);

// Sertifika kazanma kontrolü (daha spesifik route önce tanımlanmalı)
app.get('/api/certificates/check/:category', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const raw = (req.params.category || '').trim().toLowerCase().replace(/-/g, '_') || 'cybersecurity';
        const categoryNorm = raw === 'siber_guvenlik' ? 'cybersecurity' : raw;
        if (!CERTIFICATE_CATEGORIES.has(categoryNorm)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kategori. İzin verilen: cybersecurity, siber-guvenlik, cloud, data-science.'
            });
        }

        const completed = await pool.query(
            `SELECT ump.module_id, m.title, m.category
             FROM user_module_progress ump
             JOIN modules m ON m.id = ump.module_id
             WHERE ump.user_id = $1 AND ump.status = 'completed'
             AND (LOWER(COALESCE(m.category, 'cybersecurity')) = $2 OR LOWER(REPLACE(COALESCE(m.category, ''), '-', '_')) = $2)`,
            [userId, categoryNorm]
        );
        const existing = await pool.query(
            `SELECT id, category, title, description, completion_time, earned_at, certificate_url
             FROM certificates WHERE user_id = $1 AND (LOWER(REPLACE(COALESCE(category, ''), '-', '_')) = $2) LIMIT 1`,
            [userId, categoryNorm]
        );

        if (existing.rows.length > 0) {
            const c = existing.rows[0];
            return res.json({
                success: true,
                alreadyHad: true,
                certificate: {
                    id: c.id,
                    category: c.category,
                    title: c.title,
                    description: c.description,
                    completionTime: c.completion_time,
                    earnedAt: c.earned_at,
                    certificateUrl: c.certificate_url
                }
            });
        }

        if (completed.rows.length === 0) {
            return res.json({
                success: true,
                earned: false,
                message: 'Bu kategoride sertifika kazanmak için en az bir modülü tamamlamanız gerekiyor (tüm dersler + quiz).'
            });
        }

        const totalMinutes = await pool.query(
            `SELECT COALESCE(SUM(mp.time_spent_minutes), 0) AS total
             FROM module_progress mp
             JOIN modules m ON m.id = mp.module_id
             WHERE mp.user_id = $1 AND LOWER(COALESCE(m.category, 'cybersecurity')) = $2`,
            [userId, categoryNorm]
        );
        const completionMinutes = Number(totalMinutes.rows[0]?.total) || 60;
        const categoryTitles = { cybersecurity: 'Siber Güvenlik', cloud: 'Bulut', 'data_science': 'Veri Bilimleri' };
        const title = (categoryTitles[categoryNorm] || categoryNorm) + ' Temel Sertifikası';
        const description = `Bu kategoride ${completed.rows.length} modül tamamlandı. Toplam ${Math.round(completionMinutes / 60)} saat çalışma.`;

        const insertResult = await pool.query(
            `INSERT INTO certificates (user_id, category, title, description, completion_time, earned_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6::jsonb)
             RETURNING id, user_id, category, title, description, completion_time, earned_at, certificate_url`,
            [userId, categoryNorm, title, description, completionMinutes, JSON.stringify({ moduleCount: completed.rows.length })]
        );
        const cert = insertResult.rows[0];
        res.json({
            success: true,
            earned: true,
            certificate: {
                id: cert.id,
                userId: cert.user_id,
                category: cert.category,
                title: cert.title,
                description: cert.description,
                completionTime: cert.completion_time,
                earnedAt: cert.earned_at,
                certificateUrl: cert.certificate_url
            }
        });
    } catch (err) {
        logger.error('Certificates check error:', err);
        const msg = isDbUnavailableError(err) ? 'Veritabanı geçici olarak kullanılamıyor. Lütfen daha sonra deneyin.' : 'Sertifika kontrolü sırasında bir hata oluştu.';
        res.status(500).json({ success: false, message: msg });
    }
});

app.get('/api/certificates/:certificateId/report', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { certificateId } = req.params;
        const certResult = await pool.query(
            `SELECT id, category, title, description, completion_time, earned_at, metadata
             FROM certificates WHERE id = $1 AND user_id = $2`,
            [certificateId, userId]
        );
        if (certResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sertifika bulunamadı.' });
        }
        const c = certResult.rows[0];
        const meta = c.metadata && (typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata) || {};
        const hours = Math.round((c.completion_time || 0) / 60);
        const summary = c.description || `${c.title} sertifikasını ${hours} saatte tamamladınız.`;
        const report = {
            generatedBy: 'summary',
            summary,
            performanceAnalysis: {
                overall: {
                    level: hours >= 20 ? 'İleri' : hours >= 10 ? 'Orta' : 'Başlangıç',
                    description: `Toplam ${hours} saat çalışma ile bu kategoride sertifika kazandınız.`
                }
            },
            learningPattern: {
                pace: 'Orta',
                paceDescription: 'Düzenli ilerleme kaydedildi.',
                focus: c.category || 'Genel',
                focusDescription: 'Kategori odaklı tamamlama.',
                learningStyle: 'Karma',
                learningStyleDescription: 'Modül ve pratik birleşimi.'
            },
            strengths: ['Sertifika tamamlandı.', 'Hedef kategoride ilerleme gösterildi.'],
            areasForImprovement: [],
            detailedRecommendations: [],
            nextSteps: [{ step: 1, title: 'Pratik', description: 'İlgili simülasyonları tekrarlayın.', estimatedTime: '2-4 saat' }],
            resources: []
        };
        res.json({ success: true, data: { report } });
    } catch (err) {
        logger.error('Certificate report error:', err);
        const msg = isDbUnavailableError(err) ? 'Veritabanı geçici olarak kullanılamıyor. Lütfen daha sonra deneyin.' : 'Sertifika raporu oluşturulurken bir hata oluştu.';
        res.status(500).json({ success: false, message: msg });
    }
});

// E-posta doğrulama (frontend/public)
app.get('/verify-email.html', (req, res) => {
    if (!fs.existsSync(FRONTEND_DIR)) {
        return res.status(404).send('Frontend klasörü yok (ayrı deploy).');
    }
    res.sendFile(path.join(FRONTEND_DIR, 'public', 'verify-email.html'));
});

// Ana route — statik site (frontend mevcutsa)
app.get('/', (req, res) => {
    if (!fs.existsSync(FRONTEND_DIR)) {
        return res.status(404).json({ message: 'API only — frontend ayrı origin.' });
    }
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// HTML catch-all (frontend mevcutsa)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    if (!fs.existsSync(FRONTEND_DIR)) {
        return next();
    }
    const filePath = path.join(FRONTEND_DIR, req.path.replace(/^\//, ''));
    if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
        return res.sendFile(filePath);
    }
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Pool'u diğer modüller için export et
const getPool = () => pool;

// ============================================
// KULLANICI İLERLEME SIFIRLAMA ENDPOINT'İ
// ============================================

// Kullanıcı ilerlemesini sıfırla (sadece admin veya kendi ilerlemesini sıfırlama)
// Kullanıcının tüm modül ilerlemelerini, satın alımlarını ve ilerleme kayıtlarını siler
app.post('/api/users/reset-progress', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { targetUserId, confirm } = req.body;
        
        // Kullanıcının kendi ilerlemesini mi sıfırladığını veya admin olup olmadığını kontrol et
        const userResult = await pool.query(
            'SELECT id, role FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const user = userResult.rows[0];
        const targetId = targetUserId || userId; // Varsayılan olarak kendi ID'si
        
        // Sadece admin başka kullanıcıların ilerlemesini sıfırlayabilir
        if (targetId !== userId && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Sadece admin kullanıcılar başka kullanıcıların ilerlemesini sıfırlayabilir'
            });
        }
        
        // Onay gerektir (güvenlik için - geri alınamaz işlem)
        if (confirm !== true && confirm !== 'true') {
            return res.status(400).json({
                success: false,
                message: 'İlerleme sıfırlama işlemi için onay gereklidir. confirm: true gönderin.'
            });
        }
        
        // Veritabanı transaction'ı başlat (tüm işlemlerin atomik olması için)
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN'); // Transaction başlat
            
            // Tüm ilerleme verilerini sil
            // İlerleme kayıtlarını, satın alımları ve sertifikaları temizler
            const operations = [
                { name: 'module_progress', query: 'DELETE FROM module_progress WHERE user_id = $1' },
                { name: 'enrollments', query: 'DELETE FROM enrollments WHERE user_id = $1' },
                { name: 'simulation_runs', query: 'DELETE FROM simulation_runs WHERE user_id = $1' },
                { name: 'certificates', query: 'DELETE FROM certificates WHERE user_id = $1' },
                { name: 'purchases', query: 'DELETE FROM purchases WHERE user_id = $1' },
                { name: 'user_package_purchases', query: 'DELETE FROM user_package_purchases WHERE user_id = $1' }
            ];
            
            const results = {};
            let totalDeleted = 0;
            
            // Her bir tablodan silme işlemini gerçekleştir
            for (const op of operations) {
                try {
                    const result = await client.query(op.query, [targetId]);
                    const count = result.rowCount || 0;
                    results[op.name] = count;
                    totalDeleted += count;
                } catch (err) {
                    // Tablo mevcut olmayabilir, sorun değil (geçiş dönemi için)
                    if (err.code !== '42P01') {
                        console.error(`Error deleting from ${op.name}:`, err);
                    }
                    results[op.name] = 0;
                }
            }
            
            // Eski tablodan da silmeyi dene (varsa)
            try {
                const oldResult = await client.query(
                    'DELETE FROM user_module_progress WHERE user_id = $1',
                    [targetId]
                );
                results['user_module_progress'] = oldResult.rowCount || 0;
                totalDeleted += results['user_module_progress'];
            } catch (err) {
                // Tablo mevcut olmayabilir
                results['user_module_progress'] = 0;
            }
            
            // Erişim seviyesini başlangıç seviyesine sıfırla (satın alımlar silindiği için)
            await client.query(
                'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['beginner', targetId]
            );
            
            await client.query('COMMIT'); // Transaction'ı commit et (tüm değişiklikleri kalıcı hale getir)
            
            // Başarılı yanıt döndür
            res.json({
                success: true,
                message: 'Kullanıcı ilerlemesi başarıyla sıfırlandı',
                data: {
                    userId: targetId,
                    deletedRecords: results, // Her tablodan silinen kayıt sayıları
                    totalDeleted: totalDeleted // Toplam silinen kayıt sayısı
                }
            });
            
        } catch (error) {
            // Hata oluşursa transaction'ı geri al (rollback)
            await client.query('ROLLBACK');
            throw error;
        } finally {
            // Client bağlantısını pool'a geri ver
            client.release();
        }
        
    } catch (error) {
        console.error('Reset progress error:', error);
        res.status(500).json({
            success: false,
            message: 'İlerleme sıfırlama sırasında bir hata oluştu',
            error: error.message
        });
    }
});

// Diğer modüller için export et
module.exports = { app, pool, getPool };

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    // Railway / Render / Docker: dışarıdan gelen trafik için tüm arayüzlere bağlan (yalnızca 127.0.0.1 değil)
    const host = process.env.HOST || '0.0.0.0';
    const server = app.listen(port, host, () => {
        console.log(`Server running on http://${host}:${port}`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.error(
                `Port ${port} kullanımda. Çözüm: PORT=8010 npm start  veya  lsof -i :${port}  ile süreci bulup kapatın.`
            );
        } else {
            logger.error('Sunucu dinleyicisi hatası:', err.message);
        }
        process.exit(1);
    });
}
