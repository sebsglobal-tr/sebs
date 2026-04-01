/**
 * Make user admin script
 * Belirtilen e-posta adresine sahip kullanıcıya admin yetkisi verir
 */

require('dotenv').config();
const { Pool } = require('pg');

const createPool = () => {
    if (process.env.DATABASE_URL) {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: (process.env.DATABASE_URL.includes('sslmode=require') || process.env.DATABASE_URL.includes('supabase'))
                ? { rejectUnauthorized: false, require: true } : false
        });
    }
    return new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME || 'sebs_education',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: (process.env.DB_HOST && process.env.DB_HOST.includes('supabase')) ? { rejectUnauthorized: false } : false
    });
};

const pool = createPool();

async function makeUserAdmin(email) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log(`\n🔍 Kullanıcı aranıyor: ${email}\n`);
        
        // Kullanıcıyı bul
        const userResult = await client.query(
            'SELECT id, email, first_name, last_name, role, access_level, is_verified, is_active FROM users WHERE email = $1',
            [email]
        );
        
        if (userResult.rows.length === 0) {
            console.error(`❌ Hata: ${email} adresine sahip kullanıcı bulunamadı!`);
            await client.query('ROLLBACK');
            return false;
        }
        
        const user = userResult.rows[0];
        console.log('📋 Mevcut kullanıcı bilgileri:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Ad: ${user.first_name || 'N/A'}`);
        console.log(`   Soyad: ${user.last_name || 'N/A'}`);
        console.log(`   Rol: ${user.role || 'user'}`);
        console.log(`   Erişim Seviyesi: ${user.access_level || 'beginner'}`);
        console.log(`   Doğrulanmış: ${user.is_verified ? 'Evet' : 'Hayır'}`);
        console.log(`   Aktif: ${user.is_active ? 'Evet' : 'Hayır'}`);
        
        // Admin yetkilerini ver
        await client.query(
            `UPDATE users 
             SET role = 'admin',
                 access_level = 'advanced',
                 is_verified = true,
                 is_active = true,
                 updated_at = CURRENT_TIMESTAMP
             WHERE email = $1`,
            [email]
        );
        
        // Tüm kategorilerde advanced seviyesinde paketler ekle
        const categories = ['cybersecurity', 'cloud', 'data-science'];
        const level = 'advanced';
        const price = 0.00; // Admin için ücretsiz
        
        console.log('\n📦 Tüm kategorilerde advanced paketler ekleniyor...\n');
        
        for (const category of categories) {
            try {
                // Önce purchases tablosunu dene
                await client.query(
                    `INSERT INTO purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
                     VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, TRUE)
                     ON CONFLICT (user_id, category, level) 
                     DO UPDATE SET 
                         price = EXCLUDED.price,
                         payment_status = 'completed',
                         is_active = TRUE,
                         purchased_at = CURRENT_TIMESTAMP,
                         updated_at = CURRENT_TIMESTAMP`,
                    [user.id, category, level, price]
                );
                console.log(`   ✅ ${category} - advanced paketi eklendi`);
            } catch (err) {
                // purchases tablosu yoksa user_package_purchases tablosunu dene
                try {
                    await client.query(
                        `INSERT INTO user_package_purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
                         VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, TRUE)
                         ON CONFLICT (user_id, category, level) 
                         DO UPDATE SET 
                             price = EXCLUDED.price,
                             payment_status = 'completed',
                             is_active = TRUE,
                             purchased_at = CURRENT_TIMESTAMP,
                             updated_at = CURRENT_TIMESTAMP`,
                        [user.id, category, level, price]
                    );
                    console.log(`   ✅ ${category} - advanced paketi eklendi (user_package_purchases)`);
                } catch (err2) {
                    console.log(`   ⚠️  ${category} paketi eklenemedi: ${err2.message}`);
                }
            }
        }
        
        // Güncellenmiş kullanıcı bilgilerini getir
        const updatedResult = await client.query(
            'SELECT id, email, first_name, last_name, role, access_level, is_verified, is_active FROM users WHERE email = $1',
            [email]
        );
        
        const updatedUser = updatedResult.rows[0];
        
        // Eklenen paketleri göster
        let purchasesResult = { rows: [] };
        try {
            purchasesResult = await client.query(
                `SELECT category, level FROM purchases 
                 WHERE user_id = $1 AND is_active = TRUE`,
                [user.id]
            );
        } catch (err) {
            // purchases tablosu yoksa user_package_purchases'den al
            try {
                purchasesResult = await client.query(
                    `SELECT category, level FROM user_package_purchases 
                     WHERE user_id = $1 AND is_active = TRUE`,
                    [user.id]
                );
            } catch (err2) {
                // Her iki tablo da yoksa boş bırak
                purchasesResult = { rows: [] };
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ Kullanıcı başarıyla admin yapıldı!\n');
        console.log('📋 Yeni kullanıcı bilgileri:');
        console.log(`   ID: ${updatedUser.id}`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Ad: ${updatedUser.first_name || 'N/A'}`);
        console.log(`   Soyad: ${updatedUser.last_name || 'N/A'}`);
        console.log(`   Rol: ${updatedUser.role}`);
        console.log(`   Erişim Seviyesi: ${updatedUser.access_level}`);
        console.log(`   Doğrulanmış: ${updatedUser.is_verified ? 'Evet' : 'Hayır'}`);
        console.log(`   Aktif: ${updatedUser.is_active ? 'Evet' : 'Hayır'}`);
        console.log('\n🎉 Admin yetkileri başarıyla verildi!');
        console.log('   - Tüm modüllere erişim');
        console.log('   - Admin panel erişimi');
        console.log('   - Kullanıcı yönetimi');
        console.log('   - Sistem ayarları');
        
        if (purchasesResult.rows.length > 0) {
            console.log('\n📦 Aktif Paketler:');
            purchasesResult.rows.forEach(p => {
                console.log(`   - ${p.category} (${p.level})`);
            });
        }
        console.log('');
        
        return true;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Hata oluştu:', error.message);
        console.error('   İşlem geri alındı.\n');
        return false;
    } finally {
        client.release();
    }
}

// Main execution
async function main() {
    const email = process.argv[2] || 'asasferfer4566@gmail.com';
    
    try {
        await makeUserAdmin(email);
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        await pool.end();
        process.exit(1);
    }
}

// Run script
if (require.main === module) {
    main();
}

module.exports = { makeUserAdmin };
