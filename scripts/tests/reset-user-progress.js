/**
 * Reset User Progress Script
 * Kullanıcının tüm ilerlemesini veritabanından sıfırlar
 * 
 * Kullanım:
 * node reset-user-progress.js <user_email>
 * 
 * Örnek:
 * node reset-user-progress.js user@example.com
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: (process.env.DATABASE_URL && (
        process.env.DATABASE_URL.includes('sslmode=require') || 
        process.env.DATABASE_URL.includes('supabase')
    )) || (process.env.DB_HOST && process.env.DB_HOST.includes('supabase'))
        ? { 
            rejectUnauthorized: false,
            require: true
        } 
        : false
});

async function resetUserProgress(userEmail) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log(`\n🔄 Kullanıcı ilerlemesi sıfırlanıyor: ${userEmail}\n`);
        
        // 1. Kullanıcıyı bul
        const userResult = await client.query(
            'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
            [userEmail]
        );
        
        if (userResult.rows.length === 0) {
            throw new Error(`Kullanıcı bulunamadı: ${userEmail}`);
        }
        
        const user = userResult.rows[0];
        console.log(`✅ Kullanıcı bulundu: ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`   User ID: ${user.id}\n`);
        
        // 2. Sıfırlanacak tablolar ve işlemler
        const resetOperations = [
            {
                name: 'Modül İlerlemesi',
                query: 'DELETE FROM module_progress WHERE user_id = $1',
                table: 'module_progress'
            },
            {
                name: 'Kurs Kayıtları',
                query: 'DELETE FROM enrollments WHERE user_id = $1',
                table: 'enrollments'
            },
            {
                name: 'Simülasyon Sonuçları',
                query: 'DELETE FROM simulation_runs WHERE user_id = $1',
                table: 'simulation_runs'
            },
            {
                name: 'Sertifikalar',
                query: 'DELETE FROM certificates WHERE user_id = $1',
                table: 'certificates'
            },
            {
                name: 'Satın Alımlar (purchases)',
                query: 'DELETE FROM purchases WHERE user_id = $1',
                table: 'purchases'
            },
            {
                name: 'Satın Alımlar (user_package_purchases)',
                query: 'DELETE FROM user_package_purchases WHERE user_id = $1',
                table: 'user_package_purchases'
            },
            {
                name: 'Eski Modül İlerlemesi (user_module_progress)',
                query: 'DELETE FROM user_module_progress WHERE user_id = $1',
                table: 'user_module_progress'
            }
        ];
        
        // 3. Her tabloyu sıfırla
        let totalDeleted = 0;
        for (const operation of resetOperations) {
            try {
                const result = await client.query(operation.query, [user.id]);
                const deletedCount = result.rowCount || 0;
                totalDeleted += deletedCount;
                
                if (deletedCount > 0) {
                    console.log(`   ✅ ${operation.name}: ${deletedCount} kayıt silindi`);
                } else {
                    console.log(`   ℹ️  ${operation.name}: Silinecek kayıt yok`);
                }
            } catch (err) {
                // Tablo yoksa veya hata varsa devam et - transaction'ı abort etme
                if (err.code === '42P01') {
                    console.log(`   ⚠️  ${operation.name}: Tablo bulunamadı (${operation.table})`);
                    // Transaction'ı sıfırla
                    await client.query('ROLLBACK');
                    await client.query('BEGIN');
                } else {
                    console.log(`   ⚠️  ${operation.name}: Hata - ${err.message}`);
                    // Transaction'ı sıfırla
                    await client.query('ROLLBACK');
                    await client.query('BEGIN');
                }
            }
        }
        
        // 4. Kullanıcının access_level'ını beginner'a sıfırla (satın alımlar silindiği için)
        try {
            await client.query(
                'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['beginner', user.id]
            );
            console.log(`   ✅ Erişim seviyesi 'beginner' olarak sıfırlandı (satın alımlar silindiği için)`);
        } catch (err) {
            console.log(`   ⚠️  Erişim seviyesi güncellenemedi: ${err.message}`);
            // Transaction'ı sıfırla
            await client.query('ROLLBACK');
            await client.query('BEGIN');
        }
        
        // 5. Commit
        await client.query('COMMIT');
        
        console.log(`\n✅ İşlem tamamlandı!`);
        console.log(`   Toplam ${totalDeleted} kayıt silindi`);
        console.log(`   Kullanıcı ilerlemesi başarıyla sıfırlandı.\n`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Hata oluştu:', error.message);
        console.error('   İşlem geri alındı.\n');
        process.exit(1);
    } finally {
        client.release();
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const userEmail = args.find(arg => !arg.startsWith('--'));
    const autoConfirm = args.includes('--yes') || args.includes('-y') || args.includes('--force');
    
    if (!userEmail) {
        console.error('\n❌ Hata: E-posta adresi gereklidir!\n');
        console.log('Kullanım:');
        console.log('  node reset-user-progress.js <user_email> [--yes]\n');
        console.log('Örnek:');
        console.log('  node reset-user-progress.js user@example.com');
        console.log('  node reset-user-progress.js user@example.com --yes\n');
        process.exit(1);
    }
    
    // Onay iste (eğer --yes parametresi yoksa)
    if (!autoConfirm) {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`⚠️  ${userEmail} kullanıcısının TÜM ilerlemesi silinecek. Devam etmek istiyor musunuz? (evet/hayır): `, async (answer) => {
            if (answer.toLowerCase() === 'evet' || answer.toLowerCase() === 'e' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                try {
                    await resetUserProgress(userEmail);
                } catch (error) {
                    console.error('Hata:', error.message);
                    process.exit(1);
                }
            } else {
                console.log('\n❌ İşlem iptal edildi.\n');
            }
            rl.close();
            await pool.end();
        });
    } else {
        // Otomatik onay
        try {
            await resetUserProgress(userEmail);
            await pool.end();
        } catch (error) {
            console.error('Hata:', error.message);
            await pool.end();
            process.exit(1);
        }
    }
}

// Run script
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { resetUserProgress };

