/**
 * Apply Performance Fixes Based on Test Results
 * Test sonuçlarına göre performans düzeltmelerini uygula
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';

dotenv.config();

const client = new Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyFixes() {
  try {
    await client.connect();
    console.log('✅ Veritabanı bağlantısı kuruldu\n');
    console.log('='.repeat(70));
    console.log('🚀 PERFORMANS DÜZELTMELERİ UYGULANIYOR');
    console.log('='.repeat(70));
    console.log('');

    // 1. Kullanılmayan index'leri temizle (sadece güvenli olanlar)
    console.log('📇 1. KULLANILMAYAN INDEX\'LERİ TEMİZLE\n');
    const unusedIndexesToDrop = [
      'idx_modules_course_id',
      'idx_company_recommendations_bootcamp_id'
    ];

    for (const indexName of unusedIndexesToDrop) {
      try {
        await client.query(`DROP INDEX IF EXISTS public.${indexName}`);
        console.log(`   ✅ Kaldırıldı: ${indexName}`);
      } catch (error) {
        console.log(`   ⚠️  ${indexName}: ${error.message}`);
      }
    }

    // 2. Eksik foreign key index'lerini ekle
    console.log('\n🔗 2. EKSİK FOREIGN KEY İNDEX\'LERİNİ EKLE\n');
    const fkIndexes = [
      {
        name: 'idx_modules_course_id',
        sql: `CREATE INDEX IF NOT EXISTS idx_modules_course_id 
              ON public.modules(course_id)`,
        description: 'modules.course_id foreign key için - JOIN performansı'
      },
      {
        name: 'idx_company_recommendations_bootcamp_id',
        sql: `CREATE INDEX IF NOT EXISTS idx_company_recommendations_bootcamp_id 
              ON public.company_recommendations(bootcamp_id)`,
        description: 'company_recommendations.bootcamp_id foreign key için'
      }
    ];

    for (const idx of fkIndexes) {
      try {
        await client.query(idx.sql);
        console.log(`   ✅ Oluşturuldu: ${idx.name}`);
        console.log(`      ${idx.description}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Zaten mevcut: ${idx.name}`);
        } else {
          console.log(`   ⚠️  Hata (${idx.name}): ${error.message}`);
        }
      }
    }

    // 3. Query performansı için yeni index'ler ekle
    console.log('\n📊 3. PERFORMANS İNDEX\'LERİ EKLE\n');
    const performanceIndexes = [
      {
        name: 'idx_module_progress_user_last_accessed',
        sql: `CREATE INDEX IF NOT EXISTS idx_module_progress_user_last_accessed 
              ON public.module_progress(user_id, last_accessed_at DESC)`,
        description: 'User progress query performansı için'
      },
      {
        name: 'idx_enrollments_is_active',
        sql: `CREATE INDEX IF NOT EXISTS idx_enrollments_is_active 
              ON public.enrollments(is_active) WHERE is_active = true`,
        description: 'Enrollments count query performansı için'
      },
      {
        name: 'idx_module_progress_module_completed',
        sql: `CREATE INDEX IF NOT EXISTS idx_module_progress_module_completed 
              ON public.module_progress(module_id, is_completed)`,
        description: 'Module completion stats query performansı için'
      },
      {
        name: 'idx_simulation_runs_user_created',
        sql: `CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_created 
              ON public.simulation_runs(user_id, created_at DESC)`,
        description: 'Recent activity query performansı için'
      }
    ];

    for (const idx of performanceIndexes) {
      try {
        await client.query(idx.sql);
        console.log(`   ✅ Oluşturuldu: ${idx.name}`);
        console.log(`      ${idx.description}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Zaten mevcut: ${idx.name}`);
        } else {
          console.log(`   ❌ Hata (${idx.name}): ${error.message}`);
        }
      }
    }

    // 4. Dead rows temizle (VACUUM)
    console.log('\n🧹 4. DEAD ROWS TEMİZLE (VACUUM)\n');
    const tablesWithDeadRows = ['users', 'refresh_tokens', '_prisma_migrations', 'modules', 'courses'];
    
    for (const table of tablesWithDeadRows) {
      try {
        await client.query(`VACUUM ANALYZE ${table}`);
        console.log(`   ✅ VACUUM ANALYZE: ${table}`);
      } catch (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    }

    // 5. Tüm tablolar için ANALYZE
    console.log('\n📈 5. İSTATİSTİKLERİ GÜNCELLE (ANALYZE)\n');
    try {
      await client.query('ANALYZE');
      console.log('   ✅ ANALYZE tamamlandı (tüm tablolar)');
    } catch (error) {
      console.log(`   ❌ ANALYZE hatası: ${error.message}`);
    }

    // 6. Sonuç kontrolü
    console.log('\n🔍 6. SONUÇ KONTROLÜ\n');
    console.log('-'.repeat(70));

    // Dead rows kontrolü
    const deadRowsCheck = await client.query(`
      SELECT 
        relname as tablename,
        n_live_tup as live_rows,
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
      LIMIT 10
    `);

    if (deadRowsCheck.rows.length > 0) {
      console.log('   Dead rows durumu:');
      deadRowsCheck.rows.forEach(row => {
        const icon = parseFloat(row.dead_ratio) > 10 ? '⚠️' : '✅';
        console.log(`   ${icon} ${row.tablename}: ${row.dead_rows} dead (${row.dead_ratio}%)`);
      });
    } else {
      console.log('   ✅ Dead row bulunamadı!');
    }

    // Kullanılmayan index kontrolü
    const unusedIndexCheck = await client.query(`
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
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10
    `);

    console.log(`\n   Kullanılmayan index sayısı: ${unusedIndexCheck.rows.length}`);
    if (unusedIndexCheck.rows.length > 0) {
      unusedIndexCheck.rows.slice(0, 5).forEach(idx => {
        console.log(`   ⚠️  ${idx.tablename}.${idx.indexname} (${idx.index_size})`);
      });
    } else {
      console.log('   ✅ Kritik olmayan kullanılmayan index bulunamadı!');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Tüm performans düzeltmeleri tamamlandı!');
    console.log('='.repeat(70));
    console.log('\n💡 Sonraki adım: Test\'i tekrar çalıştırın');
    console.log('   node run-database-performance-security-test.js\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyFixes();
