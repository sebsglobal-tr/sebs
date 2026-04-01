// Tüm başlangıç seviyesi satın alımlarını sıfırlama script'i
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function resetAllBeginnerPurchases() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🔍 Başlangıç seviyesi satın alımları kontrol ediliyor...\n');
        
        // purchases tablosundan başlangıç seviyesi satın alımları bul
        const purchases = await client.query(`
            SELECT id, user_id, category, level 
            FROM purchases 
            WHERE level = 'beginner' AND is_active = TRUE
        `);
        
        if (purchases.rows.length === 0) {
            console.log('✅ Başlangıç seviyesi satın alımı bulunamadı.');
            
            // Yine de access_level'ı beginner olmayan kullanıcıları kontrol et
            const nonBeginner = await client.query(`
                SELECT id, email, access_level 
                FROM users 
                WHERE access_level != 'beginner'
            `);
            
            if (nonBeginner.rows.length > 0) {
                console.log(`\n⚠️  ${nonBeginner.rows.length} kullanıcının access_level'ı beginner değil:`);
                nonBeginner.rows.forEach(u => {
                    console.log(`   - ${u.email}: ${u.access_level}`);
                });
                
                // Bu kullanıcıların başka satın alımları var mı kontrol et
                for (const user of nonBeginner.rows) {
                    const otherPurchases = await client.query(`
                        SELECT level FROM purchases 
                        WHERE user_id = $1 AND is_active = TRUE AND level != 'beginner'
                        ORDER BY 
                            CASE level 
                                WHEN 'intermediate' THEN 2 
                                WHEN 'advanced' THEN 3 
                            END DESC
                        LIMIT 1
                    `, [user.id]);
                    
                    if (otherPurchases.rows.length === 0) {
                        // Başka satın alım yoksa beginner'a sıfırla
                        await client.query(
                            'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                            ['beginner', user.id]
                        );
                        console.log(`   ✅ ${user.email}: access_level 'beginner' olarak sıfırlandı`);
                    }
                }
            }
            
            await client.query('COMMIT');
            return;
        }
        
        console.log(`📊 Bulunan başlangıç seviyesi satın alımları: ${purchases.rows.length}\n`);
        
        // Satın alımları sil
        const deleteResult = await client.query(`
            DELETE FROM purchases 
            WHERE level = 'beginner' AND is_active = TRUE
        `);
        
        console.log(`✅ ${deleteResult.rowCount} başlangıç seviyesi satın alımı silindi\n`);
        
        // Etkilenen kullanıcıların access_level'ını güncelle
        const affectedUsers = [...new Set(purchases.rows.map(p => p.user_id))];
        console.log(`👥 Etkilenen kullanıcı sayısı: ${affectedUsers.length}\n`);
        
        for (const userId of affectedUsers) {
            // Kullanıcının başka aktif satın alımı var mı kontrol et
            const otherPurchases = await client.query(`
                SELECT level FROM purchases 
                WHERE user_id = $1 AND is_active = TRUE AND level != 'beginner'
                ORDER BY 
                    CASE level 
                        WHEN 'intermediate' THEN 2 
                        WHEN 'advanced' THEN 3 
                    END DESC
                LIMIT 1
            `, [userId]);
            
            if (otherPurchases.rows.length > 0) {
                const highestLevel = otherPurchases.rows[0].level;
                await client.query(
                    'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [highestLevel, userId]
                );
                console.log(`   ✅ Kullanıcı ${userId}: access_level '${highestLevel}' olarak güncellendi`);
            } else {
                await client.query(
                    'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    ['beginner', userId]
                );
                console.log(`   ✅ Kullanıcı ${userId}: access_level 'beginner' olarak sıfırlandı`);
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ Başlangıç seviyesi satın alımları başarıyla sıfırlandı!');
        console.log(`   Toplam silinen kayıt: ${deleteResult.rowCount}`);
        console.log(`   Etkilenen kullanıcı: ${affectedUsers.length}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Hata:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

resetAllBeginnerPurchases()
    .then(() => {
        console.log('\n🎉 İşlem tamamlandı!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ İşlem başarısız:', error);
        process.exit(1);
    });
