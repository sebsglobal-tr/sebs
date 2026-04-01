/**
 * Duplicate Index Düzeltmeleri
 * Supabase Linter Uyarılarını Düzelt
 * 
 * Bu script duplicate index'leri tespit eder ve temizler:
 * 1. users tablosundaki duplicate email index'lerini düzeltir
 * 2. Gereksiz index'leri siler
 * 3. Performans iyileştirmeleri yapar
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
        require: true
    }
});

const fixes = [];

async function fixDuplicateIndexes() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔍 DUPLICATE INDEX DÜZELTMELERİ BAŞLATILIYOR...\n');
        console.log('='.repeat(70));
        
        // 1. DUPLICATE INDEX'LERI TESPIT ET
        console.log('\n📋 1. DUPLICATE INDEX\'LERI TESPIT ETME\n');
        await detectDuplicateIndexes(client);
        
        // 2. USERS TABLOSUNDAKI DUPLICATE INDEX'LERI DÜZELT
        console.log('\n📋 2. USERS TABLOSUNDAKI DUPLICATE INDEX\'LERI DÜZELTME\n');
        await fixUsersEmailIndexes(client);
        
        // 3. RAPOR
        console.log('\n📊 DUPLICATE INDEX DÜZELTME RAPORU\n');
        generateReport();
        
    } catch (error) {
        console.error('\n❌ Duplicate index düzeltmeleri sırasında hata:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

async function detectDuplicateIndexes(client) {
    try {
        // Email kolonu üzerindeki tüm index'leri bul
        const indexes = await client.query(`
            SELECT 
                indexname,
                indexdef,
                CASE 
                    WHEN indexdef LIKE '%UNIQUE%' THEN 'UNIQUE'
                    ELSE 'NORMAL'
                END as index_type
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'users'
            AND (
                indexname LIKE '%email%' 
                OR indexdef LIKE '%(email)%'
            )
            ORDER BY indexname
        `);
        
        console.log(`   📊 ${indexes.rows.length} email index bulundu:`);
        indexes.rows.forEach((row, idx) => {
            console.log(`   ${idx + 1}. ${row.indexname} (${row.index_type})`);
            console.log(`      ${row.indexdef.substring(0, 80)}...`);
        });
        
        // Duplicate'leri tespit et
        const uniqueIndexes = indexes.rows.filter(r => r.index_type === 'UNIQUE');
        if (uniqueIndexes.length > 1) {
            console.log(`\n   ⚠️  ${uniqueIndexes.length} UNIQUE index bulundu - duplicate!`);
        }
        
    } catch (error) {
        console.error(`   ❌ Duplicate index tespiti hatası: ${error.message}`);
    }
}

async function fixUsersEmailIndexes(client) {
    try {
        // Önce constraint'leri kontrol et
        const constraints = await client.query(`
            SELECT 
                conname,
                contype,
                pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conrelid = 'public.users'::regclass
            AND conname LIKE '%email%'
        `);
        
        console.log(`   📋 Email constraint'leri:`);
        constraints.rows.forEach(row => {
            const typeName = row.contype === 'u' ? 'UNIQUE' : row.contype === 'p' ? 'PRIMARY KEY' : 'OTHER';
            console.log(`      - ${row.conname} (${typeName})`);
            console.log(`        ${row.definition}`);
        });
        
        // UNIQUE constraint zaten var: users_email_unique
        // users_email_key index'i duplicate ve silinebilir
        
        // users_email_key index'inin var olup olmadigini kontrol et
        const emailKeyIndex = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'users'
            AND indexname = 'users_email_key'
        `);
        
        if (emailKeyIndex.rows.length > 0) {
            console.log(`\n   🔍 users_email_key index bulundu:`);
            console.log(`      ${emailKeyIndex.rows[0].indexdef}`);
            
            // Index constraint tarafindan kullanilmiyorsa sil
            // Önce constraint var mı kontrol et
            const keyConstraint = await client.query(`
                SELECT conname, contype
                FROM pg_constraint
                WHERE conrelid = 'public.users'::regclass
                AND conname = 'users_email_key'
            `);
            
            if (keyConstraint.rows.length === 0) {
                // Constraint yoksa index'i güvenle silebiliriz
                await client.query(`
                    DROP INDEX IF EXISTS public.users_email_key;
                `);
                
                console.log(`   ✅ users_email_key index silindi (duplicate)`);
                fixes.push('users_email_key: Duplicate index removed');
            } else {
                console.log(`   ⚠️  users_email_key index bir constraint tarafindan kullaniliyor`);
                console.log(`      Index silinemedi - önce constraint kaldirilmalı`);
            }
        } else {
            console.log(`\n   ℹ️  users_email_key index zaten yok`);
        }
        
        // idx_users_email normal index'ini kontrol et
        // UNIQUE index zaten oldugu için bu gereksiz olabilir
        const idxUsersEmail = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'users'
            AND indexname = 'idx_users_email'
        `);
        
        if (idxUsersEmail.rows.length > 0) {
            console.log(`\n   🔍 idx_users_email normal index bulundu:`);
            console.log(`      ${idxUsersEmail.rows[0].indexdef}`);
            
            // UNIQUE index zaten oldugu için normal index gereksiz
            // Ancak bazı durumlarda normal index'ler UNIQUE index'lerden daha hizli olabilir
            // Bu yüzden bu index'i silmeyelim, sadece bilgilendirelim
            console.log(`   ℹ️  idx_users_email index UNIQUE index ile çakisiyor`);
            console.log(`      Ancak normal index'ler bazi sorgularda daha hizli olabilir`);
            console.log(`      Bu index korunacak - sadece duplicate UNIQUE index'ler silindi`);
        }
        
        // users_email_unique constraint'inin index'ini kontrol et
        const emailUniqueIndex = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'users'
            AND indexname = 'users_email_unique'
        `);
        
        if (emailUniqueIndex.rows.length > 0) {
            console.log(`\n   ✅ users_email_unique constraint index korunacak:`);
            console.log(`      ${emailUniqueIndex.rows[0].indexdef}`);
            console.log(`      Bu index UNIQUE constraint tarafindan olusturuldu ve gerekli`);
        } else {
            console.log(`\n   ⚠️  users_email_unique index bulunamadi - constraint kontrol edilmeli`);
        }
        
    } catch (error) {
        if (error.code === '42P01') {
            console.log(`   ⚠️  users tablosu bulunamadı`);
        } else if (error.code === '42804') {
            console.log(`   ⚠️  Index zaten başka bir constraint tarafından kullanılıyor`);
            console.log(`      Index silinemiyor - constraint önce kaldırılmalı`);
        } else {
            console.error(`   ❌ users email index düzeltme hatası: ${error.message}`);
        }
    }
}

function generateReport() {
    console.log('='.repeat(70));
    console.log('\n📊 DUPLICATE INDEX DÜZELTME SONUÇLARI\n');
    
    if (fixes.length === 0) {
        console.log('ℹ️  Hiçbir değişiklik yapılmadı. Duplicate index\'ler zaten temizlenmiş olabilir.\n');
        console.log('💡 NOTLAR:');
        console.log('   - users_email_unique: UNIQUE constraint index (KORUNACAK)');
        console.log('   - users_email_key: Duplicate UNIQUE index (SILINEBILIR)');
        console.log('   - idx_users_email: Normal index (KORUNACAK - performans için)\n');
        return;
    }
    
    console.log(`✅ TOPLAM ${fixes.length} DUPLICATE INDEX DÜZELTMESİ YAPILDI:\n`);
    fixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
    });
    
    console.log('\n✅ Duplicate index düzeltmeleri tamamlandı!\n');
    console.log('📝 NOT: Bu düzeltmeler performans iyileştirmeleri içindir.');
    console.log('   Gereksiz duplicate index\'ler silindi, gerekli index\'ler korundu.\n');
}

// Run fixes
if (require.main === module) {
    fixDuplicateIndexes()
        .then(() => {
            console.log('✅ Duplicate index düzeltmeleri başarıyla tamamlandı!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Duplicate index düzeltmeleri başarısız:', err);
            process.exit(1);
        });
}

module.exports = { fixDuplicateIndexes };
