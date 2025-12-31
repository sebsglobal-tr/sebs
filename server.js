const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8006;

// ============================================
// MIDDLEWARE (ARA KATMAN YAPILANDIRMALARI)
// ============================================

// Hız sınırlama (Rate Limiting) - DDoS saldırılarını önlemek için
// Her IP adresinden gelen istek sayısını sınırlar
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Zaman penceresi: 15 dakika (milisaniye cinsinden)
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Her IP adresi için zaman penceresi içinde maksimum 100 istek
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Rate limit bilgisini `RateLimit-*` başlıklarında döndür
    legacyHeaders: false, // Eski `X-RateLimit-*` başlıklarını devre dışı bırak
    skip: (req) => {
        // Sağlık kontrolü endpoint'i için hız sınırlamasını atla
        return req.path === '/api/health';
    }
});

// Tüm API route'larına hız sınırlamasını uygula
app.use('/api/', limiter);
// CORS (Cross-Origin Resource Sharing) yapılandırması
// Farklı domain'lerden gelen isteklere izin verir
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000', // İzin verilen origin (kaynak)
    credentials: true, // Çerezler ve kimlik bilgilerinin gönderilmesine izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type', 'Authorization'], // İzin verilen HTTP başlıkları
    maxAge: 86400 // Preflight isteklerinin önbellekte tutulma süresi: 24 saat (saniye cinsinden)
}));

// Helmet güvenlik başlıkları - XSS, clickjacking ve diğer saldırıları önlemek için
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Varsayılan kaynaklar: sadece kendi domain'imiz
            styleSrc: ["'self'", "'unsafe-inline'"], // CSS dosyaları: kendi domain ve inline stiller
            scriptSrc: ["'self'"], // JavaScript dosyaları: sadece kendi domain'imiz
            imgSrc: ["'self'", "data:", "https:"], // Görseller: kendi domain, data URI'lar ve HTTPS bağlantıları
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

// Statik dosyaları servis et (HTML, CSS, JS, görseller vb.)
app.use(express.static(__dirname, {
    extensions: ['html', 'htm'],
    index: ['index.html', 'index.htm']
}));

// ============================================
// VERİTABANI BAĞLANTI POOL YAPILANDIRMASI
// ============================================
// Optimize edilmiş pool ayarları ile veritabanı bağlantısı
// Hem DATABASE_URL (Supabase) hem de ayrı bağlantı parametrelerini destekler
const createPool = () => {
    // Supabase kullanılıp kullanılmadığını kontrol et
    const isSupabase = process.env.DATABASE_URL && (
        process.env.DATABASE_URL.includes('supabase') || 
        process.env.DATABASE_URL.includes('pooler')
    );
    
    // Temel bağlantı pool yapılandırması
    // Yüksek ölçekli sistemler için optimize edilmiştir (3K-40K kullanıcı)
    const baseConfig = {
        max: parseInt(process.env.DB_POOL_MAX) || 200, // Pool'daki maksimum client sayısı (Supabase Pro: 200)
        min: parseInt(process.env.DB_POOL_MIN) || 10, // Pool'daki minimum client sayısı
        idleTimeoutMillis: 60000, // Boşta kalan client'ları 60 saniye sonra kapat
        connectionTimeoutMillis: 10000, // Bağlantı kurulamazsa 10 saniye sonra hata döndür
        // Bağlantıları canlı tut
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000, // İlk keep-alive kontrolü için gecikme: 10 saniye
        // SSL yapılandırması - Güvenli bağlantı için
        ssl: (process.env.DATABASE_URL && (
            process.env.DATABASE_URL.includes('sslmode=require') || 
            process.env.DATABASE_URL.includes('supabase')
        )) || (process.env.DB_HOST && process.env.DB_HOST.includes('supabase'))
            ? { 
                rejectUnauthorized: false, // Sertifika doğrulamasını atla (Supabase için gerekli)
                require: true // SSL bağlantısı zorunlu
            } 
            : false
    };
    
    // DATABASE_URL varsa (Supabase veya diğer managed servisler), connection string kullan
    if (process.env.DATABASE_URL) {
        return new Pool({
            connectionString: process.env.DATABASE_URL, // Tam bağlantı string'i
            ...baseConfig
        });
    } else {
        // Aksi halde, ayrı bağlantı parametreleri kullan
        return new Pool({
            host: process.env.DB_HOST || 'localhost', // Veritabanı sunucusu adresi
            port: process.env.DB_PORT || 5432, // Veritabanı portu (PostgreSQL varsayılan: 5432)
            database: process.env.DB_NAME || 'sebs_education', // Veritabanı adı
            user: process.env.DB_USER || 'apple', // Veritabanı kullanıcı adı
            password: process.env.DB_PASSWORD || '', // Veritabanı şifresi
            ...baseConfig
        });
    }
};

// Veritabanı bağlantı pool'unu oluştur
const pool = createPool();

// ============================================
// VERİTABANI POOL OLAY İZLEYİCİLERİ (İZLEME İÇİN)
// ============================================
// Yeni bir veritabanı client'ı bağlandığında
pool.on('connect', (client) => {
    console.log('🔌 New database client connected');
});

// Boşta kalan client'ta beklenmeyen bir hata oluştuğunda
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle database client:', err);
    // Process'i sonlandırma, pool'un yeniden bağlanmayı yönetmesine izin ver
});

// Pool'dan bir client alındığında (log için)
pool.on('acquire', (client) => {
    // Pool'dan client alındı
});

// Pool'dan bir client kaldırıldığında
pool.on('remove', (client) => {
    console.log('🔌 Database client removed from pool');
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
            console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
            if (i < retries - 1) {
                // Son deneme değilse, belirtilen süre kadar bekle ve tekrar dene
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Tüm denemeler başarısız oldu
                console.error('❌ All database connection attempts failed');
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

// Doğrulama e-postası gönder
// email: Alıcı e-posta adresi
// verificationCode: Gönderilecek 6 haneli doğrulama kodu
// firstName: Alıcının adı (e-postada kullanılır)
const sendVerificationEmail = async (email, verificationCode, firstName) => {
    try {
        // SMTP kimlik bilgilerinin yapılandırılıp yapılandırılmadığını kontrol et
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_gmail_app_password_here') {
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
                        <p>İletişim: info@sebs-global.com</p>
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
// JWT token'ı doğrular ve kullanıcı bilgilerini request nesnesine ekler
// Korumalı route'lar için kullanılır
// req: Express request nesnesi
// res: Express response nesnesi
// next: Bir sonraki middleware'e geçmek için callback fonksiyonu
const authenticateToken = (req, res, next) => {
    // Authorization başlığından token'ı al (format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer" kelimesinden sonraki token'ı al

    // Token yoksa 401 Unauthorized hatası döndür
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access token required' 
        });
    }

    // JWT secret anahtarı yapılandırılmamışsa hata döndür
    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET environment variable is not set!');
        return res.status(500).json({
            success: false,
            message: 'Server configuration error'
        });
    }
    
    // Token'ı doğrula
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token geçersiz veya süresi dolmuşsa 401 hatası döndür
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token' 
            });
        }
        // Token geçerliyse, kullanıcı bilgilerini request nesnesine ekle
        req.user = user;
        next(); // Bir sonraki middleware'e geç
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
        
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                accessLevel: user.access_level,
                isVerified: user.is_verified,
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
// SAĞLIK KONTROLÜ ENDPOINT'İ
// ============================================
// Sistem sağlığını ve veritabanı bağlantısını kontrol eder
// Monitoring ve load balancer'lar için kullanılır
app.get('/api/health', async (req, res) => {
    try {
        // Veritabanı bağlantısını test et (sunucu zamanı ve versiyonu al)
        const dbResult = await pool.query('SELECT NOW(), version()');
        const dbHealthy = dbResult.rows.length > 0;
        
        // Sistem sağlık durumunu döndür
        res.json({
            status: 'healthy',
            database: {
                status: dbHealthy ? 'connected' : 'disconnected', // Veritabanı bağlantı durumu
                type: 'postgresql',
                serverTime: dbResult.rows[0]?.now, // Veritabanı sunucu zamanı
                version: dbResult.rows[0]?.version?.split(' ')[0] + ' ' + dbResult.rows[0]?.version?.split(' ')[1] // PostgreSQL versiyonu
            },
            pool: {
                totalCount: pool.totalCount || 0, // Toplam bağlantı sayısı
                idleCount: pool.idleCount || 0, // Boşta bekleyen bağlantı sayısı
                waitingCount: pool.waitingCount || 0 // Bağlantı bekleyen istek sayısı
            },
            timestamp: new Date().toISOString(), // Kontrol zamanı
            version: '1.0.0'
        });
    } catch (error) {
        // Veritabanı bağlantısı başarısızsa 503 (Service Unavailable) hatası döndür
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
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, verification_code, verification_expires)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, is_verified`,
            [email, passwordHash, firstName, lastName, verificationCode, verificationExpires]
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
            // Delete user if email fails
            await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
            return res.status(500).json({
                success: false,
                message: 'E-posta gönderilemedi. Lütfen e-posta adresinizi kontrol edin ve tekrar deneyin.'
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
            'SELECT id, verification_code, verification_expires FROM users WHERE email = $1',
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

        if (new Date() > new Date(user.verification_expires)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code expired'
            });
        }

        // Update user as verified
        await pool.query(
            'UPDATE users SET is_verified = true, verification_code = NULL, verification_expires = NULL WHERE id = $1',
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
            'UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3',
            [verificationCode, verificationExpires, user.id]
        );

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationCode, user.first_name);
        
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'E-posta gönderilemedi. Lütfen tekrar deneyin.'
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

        // Kullanıcının e-posta adresini doğrulayıp doğrulamadığını kontrol et
        if (!user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'E-posta adresinizi doğrulamanız gerekiyor. E-posta kutunuzu kontrol edin.'
            });
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

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    isVerified: user.is_verified,
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

// Ders ilerlemesini güncelle
// Kullanıcının bir ders üzerindeki ilerlemesini kaydeder ve modül ilerlemesini günceller
app.post('/api/progress/lesson/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progressPercentage: progressPct, lastPositionSeconds } = req.body;
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
            [userId, id, status, progressPercentage || 0, lastPositionSeconds || 0]
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

// Modül ilerlemesini getir
// Kullanıcının belirli bir modül üzerindeki ilerleme bilgilerini döndürür
app.get('/api/progress/module/:moduleId', authenticateToken, async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT ump.*, m.title as module_title
             FROM user_module_progress ump
             JOIN modules m ON ump.module_id = m.id
             WHERE ump.user_id = $1 AND ump.module_id = $2`,
            [userId, moduleId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Module progress not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
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
// Kullanıcının genel ilerleme istatistiklerini döndürür
app.get('/api/progress/overview', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT 
                 COUNT(*) as total_modules,
                 COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) as completed_modules,
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
        console.error('Get overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
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
        if (!category || !level || !price) {
            return res.status(400).json({
                success: false,
                message: 'Category, level, and price are required'
            });
        }

        // Geçerli seviye değerlerini kontrol et
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level. Must be beginner, intermediate, or advanced'
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
                [userId, category, level, price]
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
                 VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, TRUE)
                 ON CONFLICT (user_id, category, level) 
                 DO UPDATE SET 
                     price = EXCLUDED.price,
                     payment_status = 'completed',
                     is_active = TRUE,
                     purchased_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 RETURNING id`,
                [userId, category, level, price]
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
                    const fs = require('fs');
                    // Migration SQL dosyasını oku ve tabloyu oluştur
                    const migrationSQL = fs.readFileSync(__dirname + '/backend/migrations/create_purchases_table.sql', 'utf8');
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
                        [userId, category, level, price]
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

// Ana route için index.html dosyasını servis et (API route'larından sonra olmalı)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Tüm HTML dosyaları için catch-all route (SPA - Single Page Application desteği)
// React Router gibi client-side routing için gerekli
app.get('*', (req, res, next) => {
    // API route ise atla (404 dönsün)
    if (req.path.startsWith('/api/')) {
        return next();
    }
    // HTML dosyasını servis etmeyi dene
    const filePath = __dirname + req.path;
    const fs = require('fs');
    if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
        return res.sendFile(filePath);
    }
    // Dosya bulunamazsa index.html'i servis et (SPA için)
    res.sendFile(__dirname + '/index.html');
});

// Pool'u diğer modüller için export et
const getPool = () => pool;

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n📄 Available pages:`);
    console.log(`   - Home: http://localhost:${PORT}/`);
    console.log(`   - Modules: http://localhost:${PORT}/modules.html`);
    console.log(`   - Simulations: http://localhost:${PORT}/simulations.html`);
    console.log(`   - About: http://localhost:${PORT}/about.html`);
    console.log(`   - Contact: http://localhost:${PORT}/contact.html`);
    console.log(`   - Dashboard: http://localhost:${PORT}/dashboard.html`);
});

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
