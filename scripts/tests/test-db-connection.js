// Veritabanı bağlantı test script'i
require('dotenv').config();
const { Pool } = require('pg');

const createPool = () => {
    const isSupabase = process.env.DATABASE_URL && (
        process.env.DATABASE_URL.includes('supabase') || 
        process.env.DATABASE_URL.includes('pooler')
    );
    
    const baseConfig = {
        max: 10,
        min: 2,
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
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ...baseConfig
        });
    } else {
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
    console.log('🔌 Veritabanı bağlantısı test ediliyor...\n');
    
    try {
        const result = await pool.query('SELECT NOW(), version()');
        console.log('✅ Veritabanı bağlantısı BAŞARILI!');
        console.log('📅 Sunucu Zamanı:', result.rows[0].now);
        console.log('🗄️  PostgreSQL Versiyonu:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
        
        // Temel tabloları kontrol et
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log('\n📊 Mevcut Tablolar (' + tablesResult.rows.length + ' adet):');
        tablesResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });
        
        await pool.end();
        return true;
    } catch (error) {
        console.error('❌ Veritabanı bağlantısı BAŞARISIZ!');
        console.error('Hata:', error.message);
        console.error('\n🔍 Kontrol Edilecekler:');
        console.error('   1. .env dosyasında DATABASE_URL veya DB_* değişkenleri doğru mu?');
        console.error('   2. Veritabanı sunucusu çalışıyor mu?');
        console.error('   3. Firewall/güvenlik duvarı bağlantıyı engelliyor mu?');
        await pool.end();
        return false;
    }
}

testConnection();
