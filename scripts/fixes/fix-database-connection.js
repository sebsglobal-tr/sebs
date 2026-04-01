// Veritabanı bağlantısını düzeltme ve test script'i
require('dotenv').config();

console.log('🔍 Veritabanı Bağlantı Bilgileri Kontrol Ediliyor...\n');

// DATABASE_URL kontrolü
if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    console.log('✅ DATABASE_URL mevcut');
    console.log('📋 URL Formatı:', url.substring(0, 60) + '...');
    
    // URL'i parse et
    try {
        const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)(\?.*)?/;
        const match = url.match(urlPattern);
        
        if (match) {
            const [, user, password, host, database] = match;
            console.log('\n📊 Parse Edilen Bilgiler:');
            console.log('   Kullanıcı:', user);
            console.log('   Şifre Uzunluğu:', password.length, 'karakter');
            console.log('   Host:', host);
            console.log('   Veritabanı:', database.split('?')[0]);
            console.log('   Şifre URL Encoded:', password.includes('%') ? 'Evet ✅' : 'Hayır ⚠️');
            
            // Şifrede özel karakterler varsa encoding gerekebilir
            const decodedPassword = decodeURIComponent(password);
            if (decodedPassword !== password) {
                console.log('   Şifre decode edildi, uzunluk:', decodedPassword.length);
            }
        }
    } catch (e) {
        console.error('❌ URL parse hatası:', e.message);
    }
} else {
    console.log('⚠️  DATABASE_URL yok, DB_* değişkenleri kullanılıyor');
    console.log('   DB_HOST:', process.env.DB_HOST || 'tanımsız');
    console.log('   DB_USER:', process.env.DB_USER || 'tanımsız');
    console.log('   DB_NAME:', process.env.DB_NAME || 'tanımsız');
}

console.log('\n🔧 Bağlantı Testi Yapılıyor...\n');

// Pool oluştur ve test et
const { Pool } = require('pg');

const createPool = () => {
    const isSupabase = process.env.DATABASE_URL && (
        process.env.DATABASE_URL.includes('supabase') || 
        process.env.DATABASE_URL.includes('pooler')
    );
    
    const baseConfig = {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        ssl: (process.env.DATABASE_URL && (
            process.env.DATABASE_URL.includes('sslmode=require') || 
            process.env.DATABASE_URL.includes('supabase')
        )) || (process.env.DB_HOST && process.env.DB_HOST.includes('supabase'))
            ? { 
                rejectUnauthorized: false,
                require: true
            } 
            : false
    };
    
    if (process.env.DATABASE_URL) {
        console.log('📡 DATABASE_URL ile bağlantı deneniyor...');
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ...baseConfig
        });
    } else {
        console.log('📡 DB_* değişkenleri ile bağlantı deneniyor...');
        return new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'sebs_education',
            user: process.env.DB_USER || 'apple',
            password: process.env.DB_PASSWORD || '',
            ...baseConfig
        });
    }
};

async function testConnection() {
    const pool = createPool();
    
    try {
        console.log('🔄 Bağlantı kuruluyor...');
        const result = await pool.query('SELECT NOW(), version()');
        console.log('✅ BAŞARILI! Veritabanı bağlantısı kuruldu!');
        console.log('📅 Sunucu Zamanı:', result.rows[0].now);
        console.log('🗄️  PostgreSQL:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
        
        // Tabloları kontrol et
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log(`\n📊 Mevcut Tablolar (${tablesResult.rows.length} adet):`);
        if (tablesResult.rows.length > 0) {
            tablesResult.rows.slice(0, 10).forEach((row, index) => {
                console.log(`   ${index + 1}. ${row.table_name}`);
            });
            if (tablesResult.rows.length > 10) {
                console.log(`   ... ve ${tablesResult.rows.length - 10} tablo daha`);
            }
        } else {
            console.log('   ⚠️  Henüz tablo yok - migration gerekebilir');
        }
        
        await pool.end();
        return true;
    } catch (error) {
        console.error('\n❌ BAĞLANTI HATASI!');
        console.error('Hata Mesajı:', error.message);
        console.error('Hata Kodu:', error.code);
        
        if (error.message.includes('Tenant or user not found')) {
            console.error('\n🔍 SORUN TESPİT EDİLDİ: "Tenant or user not found"');
            console.error('\n📝 ÇÖZÜM ÖNERİLERİ:');
            console.error('   1. Supabase Dashboard\'a gidin: https://supabase.com/dashboard');
            console.error('   2. Settings → Database → Connection string');
            console.error('   3. Connection pooling bölümünden "Transaction" modunu seçin');
            console.error('   4. Connection string\'i kopyalayın');
            console.error('   5. Şifrede özel karakterler varsa URL encode edin:');
            console.error('      - # → %23');
            console.error('      - / → %2F');
            console.error('      - * → %2A');
            console.error('   6. .env dosyasındaki DATABASE_URL\'i güncelleyin');
        } else if (error.message.includes('password authentication')) {
            console.error('\n🔍 SORUN: Şifre yanlış veya kullanıcı bulunamadı');
            console.error('   .env dosyasındaki şifre bilgilerini kontrol edin');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n🔍 SORUN: Veritabanı sunucusuna ulaşılamıyor');
            console.error('   - Host adresini kontrol edin');
            console.error('   - Port\'u kontrol edin');
            console.error('   - Firewall ayarlarını kontrol edin');
        }
        
        await pool.end();
        return false;
    }
}

testConnection().then(success => {
    if (success) {
        console.log('\n✅ Veritabanı hazır! Sunucuyu başlatabilirsiniz: npm start');
    } else {
        console.log('\n❌ Veritabanı bağlantısı kurulamadı. Lütfen yukarıdaki önerileri takip edin.');
        process.exit(1);
    }
});
