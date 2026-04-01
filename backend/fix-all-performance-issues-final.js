/**
 * Final Performance Fixes
 * Tüm performans sorunlarını ve önerileri uygula
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

async function fixAllIssues() {
  try {
    await client.connect();
    console.log('✅ Veritabanı bağlantısı kuruldu\n');
    console.log('='.repeat(70));
    console.log('🔧 TÜM PERFORMANS SORUNLARI DÜZELTİLİYOR');
    console.log('='.repeat(70));
    console.log('');

    let fixedCount = 0;
    let warningCount = 0;

    // 1. Kullanılmayan index'leri temizle (PRIMARY KEY ve UNIQUE constraint'leri hariç)
    console.log('📇 1. KULLANILMAYAN INDEX\'LERİ TEMİZLE\n');
    
    // Önce hangi index'lerin primary key veya unique constraint olduğunu kontrol et
    const constraintIndexes = await client.query(`
      SELECT 
        i.relname as indexname,
        CASE 
          WHEN c.contype = 'p' THEN 'PRIMARY KEY'
          WHEN c.contype = 'u' THEN 'UNIQUE'
          ELSE 'NORMAL'
        END as constraint_type
      FROM pg_index idx
      JOIN pg_class i ON i.oid = idx.indexrelid
      LEFT JOIN pg_constraint c ON c.conindid = idx.indexrelid
      WHERE i.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND i.relkind = 'i'
    `);

    const pkOrUniqueIndexes = new Set();
    constraintIndexes.rows.forEach(row => {
      if (row.constraint_type === 'PRIMARY KEY' || row.constraint_type === 'UNIQUE') {
        pkOrUniqueIndexes.add(row.indexname);
      }
    });

    // Kullanılmayan ve güvenli index'leri bul
    const unusedSafeIndexes = await client.query(`
      SELECT 
        relname as tablename,
        indexrelname as indexname
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelid IN (SELECT oid FROM pg_class WHERE relkind = 'i')
      AND indexrelname NOT LIKE '%_pkey'
      AND indexrelname NOT LIKE '%_key'
      AND indexrelname NOT LIKE '%_unique'
    `);

    console.log(`   Tespit edilen güvenli kullanılmayan index: ${unusedSafeIndexes.rows.length} adet\n`);

    for (const idx of unusedSafeIndexes.rows) {
      // Primary key veya unique constraint değilse sil
      if (!pkOrUniqueIndexes.has(idx.indexname)) {
        try {
          await client.query(`DROP INDEX IF EXISTS public.${idx.indexname}`);
          console.log(`   ✅ Kaldırıldı: ${idx.tablename}.${idx.indexname}`);
          fixedCount++;
        } catch (error) {
          console.log(`   ⚠️  ${idx.tablename}.${idx.indexname}: ${error.message}`);
        }
      } else {
        console.log(`   ⏭️  Atlandı (constraint): ${idx.tablename}.${idx.indexname}`);
      }
    }

    // 2. Eksik foreign key index'lerini ekle
    console.log('\n🔗 2. EKSİK FOREIGN KEY İNDEX\'LERİNİ EKLE\n');
    
    const missingFKIndexes = await client.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = tc.table_name
        AND (indexdef LIKE '%' || kcu.column_name || '%' 
             OR indexname LIKE '%' || kcu.column_name || '%')
      )
    `);

    if (missingFKIndexes.rows.length > 0) {
      for (const fk of missingFKIndexes.rows) {
        try {
          const indexName = `idx_${fk.table_name}_${fk.column_name}`;
          await client.query(`CREATE INDEX IF NOT EXISTS ${indexName} ON public.${fk.table_name}(${fk.column_name})`);
          console.log(`   ✅ Oluşturuldu: ${indexName} (${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name})`);
          fixedCount++;
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.log(`   ❌ Hata (${fk.table_name}.${fk.column_name}): ${error.message}`);
          }
        }
      }
    } else {
      console.log('   ✅ Tüm foreign key\'lerde index mevcut');
    }

    // 3. Query performansı için index'ler
    console.log('\n📊 3. QUERY PERFORMANS İNDEX\'LERİ EKLE\n');
    
    const perfIndexes = [
      {
        name: 'idx_module_progress_user_last_accessed',
        sql: `CREATE INDEX IF NOT EXISTS idx_module_progress_user_last_accessed 
              ON public.module_progress(user_id, last_accessed_at DESC)`,
        description: 'User Progress Query performansı'
      },
      {
        name: 'idx_enrollments_is_active',
        sql: `CREATE INDEX IF NOT EXISTS idx_enrollments_is_active 
              ON public.enrollments(is_active) WHERE is_active = true`,
        description: 'Enrollments Count Query performansı'
      },
      {
        name: 'idx_module_progress_module_completed',
        sql: `CREATE INDEX IF NOT EXISTS idx_module_progress_module_completed 
              ON public.module_progress(module_id, is_completed)`,
        description: 'Module Completion Stats Query performansı'
      },
      {
        name: 'idx_simulation_runs_user_created',
        sql: `CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_created 
              ON public.simulation_runs(user_id, created_at DESC)`,
        description: 'Recent Activity Query performansı'
      }
    ];

    for (const idx of perfIndexes) {
      try {
        await client.query(idx.sql);
        console.log(`   ✅ ${idx.name}: ${idx.description}`);
        fixedCount++;
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  ${idx.name}: ${error.message}`);
        }
      }
    }

    // 4. Dead rows temizle
    console.log('\n🧹 4. DEAD ROWS TEMİZLE (VACUUM)\n');
    
    const tablesWithDeadRows = await client.query(`
      SELECT 
        relname as tablename,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      AND n_dead_tup > 0
      ORDER BY n_dead_tup DESC
    `);

    if (tablesWithDeadRows.rows.length > 0) {
      for (const table of tablesWithDeadRows.rows) {
        try {
          await client.query(`VACUUM ANALYZE ${table.tablename}`);
          console.log(`   ✅ ${table.tablename}: ${table.dead_rows} dead row temizlendi`);
          fixedCount++;
        } catch (error) {
          console.log(`   ⚠️  ${table.tablename}: ${error.message}`);
        }
      }
    } else {
      console.log('   ✅ Dead row bulunamadı - tablolar temiz');
    }

    // 5. İstatistikleri güncelle
    console.log('\n📈 5. İSTATİSTİKLERİ GÜNCELLE (ANALYZE)\n');
    try {
      await client.query('ANALYZE');
      console.log('   ✅ ANALYZE tamamlandı (tüm tablolar)');
      fixedCount++;
    } catch (error) {
      console.log(`   ❌ ANALYZE hatası: ${error.message}`);
    }

    // 6. Özet
    console.log('\n' + '='.repeat(70));
    console.log('📊 DÜZELTME ÖZETİ');
    console.log('='.repeat(70));
    console.log(`✅ Düzeltilen sorun: ${fixedCount}`);
    console.log(`⚠️  Uyarı: ${warningCount}`);
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

fixAllIssues();
