/**
 * Finalize Performance Fixes
 * Son performans düzeltmelerini uygula
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import pg from 'pg';
const { Client } = pg;

dotenv.config();

const client = new Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function finalizeFixes() {
  try {
    await client.connect();
    console.log('✅ Veritabanı bağlantısı kuruldu\n');
    console.log('='.repeat(70));
    console.log('🎯 SON PERFORMANS DÜZELTMELERİ');
    console.log('='.repeat(70));
    console.log('');

    // 1. Gerçekten kullanılmayan ve güvenli index'leri temizle
    console.log('📇 1. KULLANILMAYAN NORMAL INDEX\'LERİ TEMİZLE\n');
    
    // PRIMARY KEY ve UNIQUE constraint olmayan kullanılmayan index'leri bul
    const unusedSafeIndexes = await client.query(`
      SELECT 
        relname as tablename,
        indexrelname as indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelid IN (SELECT oid FROM pg_class WHERE relkind = 'i')
      AND indexrelname NOT LIKE '%_pkey'
      AND indexrelname NOT LIKE '%_key'
      AND indexrelname NOT LIKE '%_unique'
      AND indexrelname NOT LIKE 'idx_%'  -- Prisma index'lerini koru (schema'da tanımlı)
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10
    `);

    if (unusedSafeIndexes.rows.length > 0) {
      console.log(`   Tespit edilen güvenli kullanılmayan index: ${unusedSafeIndexes.rows.length} adet\n`);
      for (const idx of unusedSafeIndexes.rows) {
        try {
          await client.query(`DROP INDEX IF EXISTS public.${idx.indexname}`);
          console.log(`   ✅ Kaldırıldı: ${idx.tablename}.${idx.indexname} (${idx.index_size})`);
        } catch (error) {
          console.log(`   ⚠️  ${idx.tablename}.${idx.indexname}: ${error.message}`);
        }
      }
    } else {
      console.log('   ✅ Kaldırılacak güvenli kullanılmayan index bulunamadı');
    }

    // 2. Query performansı için composite index'ler ekle (zaten eklendi ama kontrol et)
    console.log('\n📊 2. PERFORMANS İNDEX\'LERİNİ DOĞRULA\n');
    
    const perfIndexes = [
      'idx_module_progress_user_last_accessed',
      'idx_enrollments_is_active',
      'idx_module_progress_module_completed',
      'idx_simulation_runs_user_created'
    ];

    for (const idxName of perfIndexes) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        ) as exists
      `, [idxName]);

      if (exists.rows[0].exists) {
        console.log(`   ✅ Mevcut: ${idxName}`);
      } else {
        console.log(`   ⚠️  Eksik: ${idxName}`);
      }
    }

    // 3. VACUUM ve ANALYZE
    console.log('\n🧹 3. VACUUM ANALYZE\n');
    try {
      await client.query('VACUUM ANALYZE');
      console.log('   ✅ VACUUM ANALYZE tamamlandı (tüm tablolar)');
    } catch (error) {
      console.log(`   ⚠️  VACUUM ANALYZE hatası: ${error.message}`);
    }

    // 4. Son durum kontrolü
    console.log('\n🔍 4. SON DURUM KONTROLÜ\n');
    console.log('-'.repeat(70));

    // Dead rows kontrolü
    const deadRows = await client.query(`
      SELECT 
        relname as tablename,
        n_dead_tup as dead_rows,
        CASE 
          WHEN n_live_tup + n_dead_tup > 0 
          THEN ROUND((n_dead_tup::numeric / (n_live_tup + n_dead_tup)) * 100, 2)
          ELSE 0 
        END as dead_ratio
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      AND n_dead_tup > 0
      ORDER BY dead_ratio DESC
      LIMIT 5
    `);

    if (deadRows.rows.length === 0) {
      console.log('   ✅ Dead row bulunamadı - tablolar temiz!');
    } else {
      console.log('   Dead rows durumu:');
      deadRows.rows.forEach(row => {
        console.log(`   ${parseFloat(row.dead_ratio) < 5 ? '✅' : '⚠️'} ${row.tablename}: ${row.dead_rows} dead (${row.dead_ratio}%)`);
      });
    }

    // Kullanılmayan index kontrolü (sadece normal index'ler)
    const unusedCount = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelid IN (SELECT oid FROM pg_class WHERE relkind = 'i')
      AND indexrelname NOT LIKE '%_pkey'
      AND indexrelname NOT LIKE '%_key'
      AND indexrelname NOT LIKE '%_unique'
    `);

    const unusedNormalIndexes = parseInt(unusedCount.rows[0].count);
    console.log(`\n   Kullanılmayan normal index: ${unusedNormalIndexes} adet`);
    
    if (unusedNormalIndexes === 0) {
      console.log('   ✅ Tüm normal index\'ler kullanılıyor veya PRIMARY KEY/UNIQUE constraint!');
    } else {
      console.log(`   ℹ️  ${unusedNormalIndexes} normal index kullanılmıyor ama gerekli olabilir`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ TÜM DÜZELTMELER TAMAMLANDI!');
    console.log('='.repeat(70));
    console.log('\n💡 Test\'i tekrar çalıştırın:');
    console.log('   node run-database-performance-security-test.js\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

finalizeFixes();
