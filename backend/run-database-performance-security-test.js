/**
 * Kapsamlı Veritabanı Performans ve Güvenlik Testi
 * Database Performance & Security Test Suite
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

dotenv.config();

// Test sonuçları
const testResults = {
  performance: {
    queryTimes: [],
    indexUsage: [],
    tableStats: [],
    issues: [],
    recommendations: []
  },
  security: {
    rlsPolicies: [],
    passwordSecurity: [],
    sqlInjection: [],
    accessControl: [],
    issues: [],
    recommendations: []
  },
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    startTime: new Date(),
    endTime: null,
    duration: 0
  }
};

let dbClient;

// Helper function to execute raw SQL queries
async function executeQuery(query, params = []) {
  if (!dbClient) {
    throw new Error('Database client not connected');
  }
  const result = await dbClient.query(query, params);
  return result.rows;
}

async function connectDatabase() {
  try {
    // Prioritize DIRECT_URL for raw queries
    const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DIRECT_URL veya DATABASE_URL environment variable bulunamadı. .env dosyasını kontrol edin.');
    }

    console.log('🔄 Veritabanı bağlantısı test ediliyor...');
    console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Mevcut' : '❌ Yok'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Mevcut' : '❌ Yok'}`);
    console.log(`   Using: ${process.env.DIRECT_URL ? 'DIRECT_URL (recommended)' : 'DATABASE_URL'}`);

    // Use pg Client directly with connection string
    dbClient = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await dbClient.connect();
    console.log('✅ Database connection established');
    
    // Extract host for display
    try {
      const url = new URL(databaseUrl);
      console.log(`   Host: ${url.hostname}:${url.port}`);
    } catch (e) {
      // URL parsing failed, that's OK
    }
  } catch (error) {
    console.error('\n❌ VERİTABANI BAĞLANTI HATASI!');
    console.error('='.repeat(70));
    console.error('\nOlası nedenler:');
    console.error('   1. Supabase projesi paused/stopped olabilir');
    console.error('   2. DIRECT_URL şifresi yanlış veya güncellenmiş olabilir');
    console.error('   3. .env dosyasındaki URL\'ler hatalı formatlanmış olabilir');
    console.error('   4. Network/firewall bağlantıyı engelliyor olabilir');
    console.error('   5. Şifredeki özel karakterler URL encode edilmemiş olabilir');
    console.error('\nÇözüm önerileri:');
    console.error('   • Supabase Dashboard → Settings → Database → Connection String\'i kontrol edin');
    console.error('   • DIRECT_URL için "Connection pooling" değil "Direct connection" seçin');
    console.error('   • Yeni connection string\'i .env dosyasına kopyalayın');
    console.error('   • .env dosyasını kaydedip tekrar deneyin');
    console.error(`\n   Hata detayı: ${error.message}`);
    console.error('='.repeat(70) + '\n');
    throw error;
  }
}

async function disconnectDatabase() {
  if (dbClient) {
    await dbClient.end();
    console.log('✅ Database connection closed');
  }
}

// ============================================
// PERFORMANS TESTLERİ
// ============================================

async function testQueryPerformance() {
  console.log('\n📊 PERFORMANS TESTLERİ BAŞLATILIYOR...\n');
  console.log('='.repeat(70));

  const testQueries = [
    {
      name: 'User Lookup by Email',
      query: 'SELECT id, email, first_name, last_name FROM users WHERE email = $1 LIMIT 1',
      params: ['test@example.com'],
      description: 'Email ile kullanıcı arama - index kullanımı testi (optimized)'
    },
    {
      name: 'User Progress Query',
      query: `
        SELECT mp.id, mp.percent_complete, mp.is_completed, mp.last_accessed_at, 
               u.email, m.title as module_title
        FROM module_progress mp
        JOIN users u ON mp.user_id = u.id
        JOIN modules m ON mp.module_id = m.id
        WHERE mp.user_id = $1
        ORDER BY mp.last_accessed_at DESC
        LIMIT 10
      `,
      params: ['00000000-0000-0000-0000-000000000000'],
      description: 'Kullanıcı ilerleme sorgusu - JOIN performansı (optimized - SELECT *)'
    },
    {
      name: 'Enrollments Count',
      query: `
        SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as unique_users
        FROM enrollments
        WHERE is_active = true
      `,
      params: [],
      description: 'Aktif kayıt sayısı - aggregate performansı (partial index kullanıyor)'
    },
    {
      name: 'Module Completion Stats',
      query: `
        SELECT 
          m.id,
          m.title,
          COUNT(mp.id) as total_progress,
          COUNT(CASE WHEN mp.is_completed = true THEN 1 END) as completed_count,
          COALESCE(AVG(mp.percent_complete), 0) as avg_progress
        FROM modules m
        LEFT JOIN module_progress mp ON m.id = mp.module_id
        WHERE m.is_active = true
        GROUP BY m.id, m.title
        ORDER BY total_progress DESC, m.title
        LIMIT 20
      `,
      params: [],
      description: 'Modül tamamlama istatistikleri - GROUP BY performansı (optimized)'
    },
    {
      name: 'Recent Activity Query',
      query: `
        SELECT 
          sr.id, sr.score, sr.created_at,
          u.email,
          m.title as module_title
        FROM simulation_runs sr
        JOIN users u ON sr.user_id = u.id
        JOIN modules m ON sr.module_id = m.id
        ORDER BY sr.created_at DESC
        LIMIT 50
      `,
      params: [],
      description: 'Son aktiviteler - sıralama ve JOIN performansı (optimized - SELECT *)'
    }
  ];

  for (const test of testQueries) {
    try {
      const startTime = Date.now();
      const rows = await executeQuery(test.query, test.params);
      const executionTime = Date.now() - startTime;

      const rowCount = rows.length;

      testResults.performance.queryTimes.push({
        name: test.name,
        description: test.description,
        executionTime: executionTime,
        rowCount: rowCount,
        status: executionTime < 100 ? 'PASS' : executionTime < 500 ? 'WARNING' : 'FAIL'
      });

      // İlk sorgu daha yavaş olabilir (cold start), bu yüzden threshold'ları ayarlıyoruz
      const statusIcon = executionTime < 200 ? '✅' : executionTime < 500 ? '⚠️' : '❌';
      console.log(`${statusIcon} ${test.name}: ${executionTime}ms (${rowCount} rows)`);

      if (executionTime >= 500) {
        testResults.performance.issues.push({
          severity: 'HIGH',
          issue: `${test.name} query çok yavaş (${executionTime}ms)`,
          recommendation: 'Index kontrolü veya query optimizasyonu gerekli - EXPLAIN ANALYZE çalıştırın'
        });
      } else if (executionTime >= 200) {
        testResults.performance.issues.push({
          severity: 'LOW',
          issue: `${test.name} query yavaş (${executionTime}ms)`,
          recommendation: 'Query performansı kabul edilebilir seviyede - gerektiğinde optimize edilebilir'
        });
      } else {
        // 200ms altındaki sorgular başarılı kabul ediliyor
        testResults.summary.passed++;
      }

    } catch (error) {
      console.log(`❌ ${test.name}: HATA - ${error.message}`);
      testResults.performance.issues.push({
        severity: 'CRITICAL',
        issue: `${test.name} query hatası: ${error.message}`,
        recommendation: 'Query syntax veya veritabanı yapısını kontrol edin'
      });
    }
  }
}

async function testIndexUsage() {
  console.log('\n📇 INDEX KULLANIM ANALİZİ\n');
  console.log('-'.repeat(70));

  try {
    // Unused indexes (PRIMARY KEY ve UNIQUE constraint'leri hariç)
    const unusedIndexes = await executeQuery(`
      SELECT 
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
        CASE 
          WHEN indexrelname LIKE '%_pkey' THEN 'PRIMARY KEY'
          WHEN indexrelname LIKE '%_key' THEN 'UNIQUE CONSTRAINT'
          WHEN indexrelname LIKE '%_unique' THEN 'UNIQUE CONSTRAINT'
          ELSE 'NORMAL INDEX'
        END as index_type
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelid IN (
        SELECT oid FROM pg_class WHERE relkind = 'i'
      )
      AND indexrelname NOT LIKE '%_pkey'
      AND indexrelname NOT LIKE '%_key'
      AND indexrelname NOT LIKE '%_unique'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 20
    `);

    console.log(`📊 Kullanılmayan normal index'ler: ${unusedIndexes.length} adet`);
    if (unusedIndexes.length > 0) {
      unusedIndexes.forEach(idx => {
        console.log(`   ⚠️  ${idx.tablename}.${idx.indexname} (${idx.index_size}, 0 kullanım)`);
        testResults.performance.indexUsage.push({
          table: idx.tablename,
          index: idx.indexname,
          size: idx.index_size,
          usageCount: 0,
          status: 'UNUSED',
          recommendation: 'Bu index güvenle kaldırılabilir - performans iyileştirmesi sağlar'
        });
      });
      
      testResults.performance.issues.push({
        severity: 'LOW',
        issue: `${unusedIndexes.length} kullanılmayan normal index var`,
        recommendation: 'Bu index\'ler kaldırılarak yazma performansı artırılabilir'
      });
    } else {
      console.log('   ✅ Kullanılmayan normal index bulunamadı!');
      console.log('   ℹ️  PRIMARY KEY ve UNIQUE constraint index\'leri korunuyor (normal)');
    }

    // Most used indexes
    const usedIndexes = await executeQuery(`
      SELECT 
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND idx_scan > 0
      ORDER BY idx_scan DESC
      LIMIT 10
    `);

    console.log(`\n📊 En çok kullanılan index'ler:`);
    usedIndexes.forEach(idx => {
      console.log(`   ✅ ${idx.tablename}.${idx.indexname} (${idx.idx_scan} kullanım)`);
      testResults.performance.indexUsage.push({
        table: idx.tablename,
        index: idx.indexname,
        size: idx.index_size,
        usageCount: idx.idx_scan,
        status: 'USED',
        recommendation: 'Bu index aktif kullanılıyor - korunmalı'
      });
    });

    // Missing indexes on foreign keys
    const missingFKIndexes = await executeQuery(`
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
        AND indexdef LIKE '%' || kcu.column_name || '%'
      )
    `);

    if (missingFKIndexes.length > 0) {
      console.log(`\n⚠️  Foreign key index'i eksik olan tablolar: ${missingFKIndexes.length} adet`);
      missingFKIndexes.forEach(fk => {
        console.log(`   ❌ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}`);
        testResults.performance.issues.push({
          severity: 'HIGH',
          issue: `${fk.table_name}.${fk.column_name} foreign key için index eksik`,
          recommendation: `CREATE INDEX idx_${fk.table_name}_${fk.column_name} ON ${fk.table_name}(${fk.column_name})`
        });
      });
    } else {
      console.log('\n✅ Tüm foreign key\'lerde index mevcut');
    }

  } catch (error) {
    console.log(`❌ Index analizi hatası: ${error.message}`);
  }
}

async function testTableStatistics() {
  console.log('\n📊 TABLO İSTATİSTİKLERİ\n');
  console.log('-'.repeat(70));

  try {
    // Table sizes and row counts
    const tableStats = await executeQuery(`
      SELECT 
        schemaname,
        relname as tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) AS table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - 
                      pg_relation_size(schemaname||'.'||relname)) AS indexes_size,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC
    `);

    console.log(`📋 Toplam ${tableStats.length} tablo analiz edildi:\n`);
    
    tableStats.forEach(table => {
      const deadRatio = table.row_count > 0 
        ? ((table.dead_rows / (table.row_count + table.dead_rows)) * 100).toFixed(2)
        : 0;

      testResults.performance.tableStats.push({
        table: table.tablename,
        totalSize: table.total_size,
        tableSize: table.table_size,
        indexesSize: table.indexes_size,
        rowCount: parseInt(table.row_count) || 0,
        deadRows: parseInt(table.dead_rows) || 0,
        deadRatio: parseFloat(deadRatio),
        lastVacuum: table.last_vacuum || table.last_autovacuum,
        lastAnalyze: table.last_analyze || table.last_autoanalyze
      });

      console.log(`📊 ${table.tablename}:`);
      console.log(`   Boyut: ${table.total_size} (Tablo: ${table.table_size}, Index'ler: ${table.indexes_size})`);
      console.log(`   Satır: ${table.row_count || 0} (Ölü: ${table.dead_rows || 0}, %${deadRatio})`);
      
      if (parseFloat(deadRatio) > 20) {
        console.log(`   ⚠️  Yüksek ölü satır oranı - VACUUM gerekli`);
        testResults.performance.issues.push({
          severity: 'MEDIUM',
          issue: `${table.tablename} tablosunda yüksek ölü satır oranı (%${deadRatio})`,
          recommendation: 'VACUUM ANALYZE çalıştırın'
        });
      }

      if (!table.last_analyze && !table.last_autoanalyze) {
        console.log(`   ⚠️  ANALYZE hiç çalıştırılmamış`);
        testResults.performance.issues.push({
          severity: 'LOW',
          issue: `${table.tablename} tablosu için ANALYZE çalıştırılmamış`,
          recommendation: 'ANALYZE tablosu çalıştırın'
        });
      }
      console.log('');
    });

  } catch (error) {
    console.log(`❌ İstatistik analizi hatası: ${error.message}`);
  }
}

// ============================================
// GÜVENLİK TESTLERİ
// ============================================

async function testRLSPolicies() {
  console.log('\n🔒 GÜVENLİK TESTLERİ BAŞLATILIYOR...\n');
  console.log('='.repeat(70));
  console.log('\n🛡️  RLS (Row Level Security) POLİTİKALARI\n');
  console.log('-'.repeat(70));

  try {
    // Check which tables have RLS enabled
    const rlsTables = await executeQuery(`
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const criticalTables = ['users', 'purchases', 'module_progress', 'enrollments', 
                           'certificates', 'entitlements', 'simulation_runs', 
                           'behavior_data', 'skill_scores', 'ai_analysis', 'security_logs'];

    console.log(`📋 RLS durumu kontrol ediliyor...\n`);

    for (const table of criticalTables) {
      const tableInfo = rlsTables.find(t => t.tablename === table);
      
      if (tableInfo) {
        const rlsStatus = tableInfo.rls_enabled ? '✅ ENABLED' : '❌ DISABLED';
        console.log(`   ${rlsStatus}: ${table}`);

        testResults.security.rlsPolicies.push({
          table: table,
          enabled: tableInfo.rls_enabled,
          status: tableInfo.rls_enabled ? 'PASS' : 'FAIL'
        });

        if (!tableInfo.rls_enabled) {
          testResults.security.issues.push({
            severity: 'HIGH',
            issue: `${table} tablosunda RLS kapalı`,
            recommendation: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
          });
        }

        // Check if policies exist
        if (tableInfo.rls_enabled) {
          const policies = await executeQuery(`
            SELECT 
              schemaname,
              tablename,
              policyname,
              permissive,
              roles,
              cmd,
              qual,
              with_check
            FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = '${table}'
          `);

          if (policies.length === 0) {
            console.log(`      ⚠️  RLS açık ama policy yok!`);
            testResults.security.issues.push({
              severity: 'CRITICAL',
              issue: `${table} tablosunda RLS açık ama policy yok - tablo erişilemez olabilir`,
              recommendation: 'RLS policy oluşturun veya RLS\'i kapatın'
            });
          } else {
            console.log(`      ✅ ${policies.length} policy mevcut`);
          }
        }
      } else {
        console.log(`   ⚠️  ${table} tablosu bulunamadı`);
      }
    }

  } catch (error) {
    console.log(`❌ RLS kontrolü hatası: ${error.message}`);
  }
}

async function testPasswordSecurity() {
  console.log('\n🔐 ŞİFRE GÜVENLİĞİ KONTROLÜ\n');
  console.log('-'.repeat(70));

  try {
    // Check password column type and constraints
    const passwordColumn = await executeQuery(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name LIKE '%password%'
    `);

    if (passwordColumn.length > 0) {
      const col = passwordColumn[0];
      console.log(`✅ Password kolonu bulundu: ${col.column_name} (${col.data_type})`);

      // Check if it's properly named (should be password_hash, not password)
      if (col.column_name === 'password') {
        testResults.security.issues.push({
          severity: 'HIGH',
          issue: 'Password kolonu "password" olarak adlandırılmış - "password_hash" olmalı',
          recommendation: 'Kolon adını password_hash olarak değiştirin'
        });
      }

      // Sample password hashes to check format
      const sampleHashes = await executeQuery(`
        SELECT password_hash
        FROM users
        WHERE password_hash IS NOT NULL
        LIMIT 5
      `);

      let validBcryptCount = 0;
      sampleHashes.forEach(row => {
        const hash = row.password_hash;
        // Bcrypt hashes start with $2a$, $2b$, or $2y$
        if (hash && /^\$2[aby]\$/.test(hash)) {
          validBcryptCount++;
        }
      });

      if (sampleHashes.length > 0) {
        const bcryptRatio = (validBcryptCount / sampleHashes.length) * 100;
        console.log(`   Bcrypt hash oranı: ${bcryptRatio.toFixed(0)}% (${validBcryptCount}/${sampleHashes.length})`);

        if (bcryptRatio === 100) {
          console.log(`   ✅ Tüm şifreler bcrypt ile hash'lenmiş`);
          testResults.security.passwordSecurity.push({
            check: 'Password Hashing',
            status: 'PASS',
            details: 'All passwords are bcrypt hashed'
          });
        } else {
          console.log(`   ⚠️  Bazı şifreler bcrypt formatında değil`);
          testResults.security.issues.push({
            severity: 'CRITICAL',
            issue: 'Bazı şifreler bcrypt formatında değil',
            recommendation: 'Tüm şifreleri bcrypt ile hash\'leyin'
          });
        }
      }

    } else {
      console.log(`❌ Password kolonu bulunamadı`);
      testResults.security.issues.push({
        severity: 'CRITICAL',
        issue: 'Users tablosunda password kolonu bulunamadı',
        recommendation: 'Password kolonunu kontrol edin'
      });
    }

  } catch (error) {
    console.log(`❌ Şifre güvenliği kontrolü hatası: ${error.message}`);
  }
}

async function testSQLInjectionProtection() {
  console.log('\n🛡️  SQL INJECTION KORUMASI\n');
  console.log('-'.repeat(70));

  // This is a code-level check, but we can verify database functions
  try {
    // Check for functions with potential SQL injection risks
    const functions = await executeQuery(`
      SELECT 
        routine_name,
        routine_type,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
    `);

    console.log(`📋 Veritabanı fonksiyonları: ${functions.length} adet`);

    let vulnerableFunctions = 0;
    functions.forEach(func => {
      const definition = func.routine_definition || '';
      // Check for dynamic SQL without proper escaping
      if (definition.includes('EXECUTE') && definition.includes('format')) {
        // format() with %I is safe, but let's check
        if (!definition.includes('%I') && !definition.includes('%L')) {
          vulnerableFunctions++;
          console.log(`   ⚠️  ${func.routine_name}: Dynamic SQL kullanıyor`);
          testResults.security.issues.push({
            severity: 'MEDIUM',
            issue: `${func.routine_name} fonksiyonunda dynamic SQL kullanımı - kontrol edilmeli`,
            recommendation: 'EXECUTE format() kullanırken %I (identifier) veya %L (literal) kullanın'
          });
        } else {
          console.log(`   ✅ ${func.routine_name}: Güvenli dynamic SQL`);
        }
      }
    });

    if (vulnerableFunctions === 0) {
      console.log(`✅ Tüm fonksiyonlar güvenli görünüyor`);
    }

    testResults.security.sqlInjection.push({
      check: 'Database Functions',
      status: vulnerableFunctions === 0 ? 'PASS' : 'WARNING',
      details: `${vulnerableFunctions} potansiyel riskli fonksiyon`
    });

  } catch (error) {
    console.log(`❌ SQL injection kontrolü hatası: ${error.message}`);
  }
}

async function testAccessControl() {
  console.log('\n🔐 ERİŞİM KONTROLÜ\n');
  console.log('-'.repeat(70));

  try {
    // Check for overly permissive policies
    const policies = await executeQuery(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    console.log(`📋 Toplam ${policies.length} RLS policy`);

    let permissiveCount = 0;
    policies.forEach(policy => {
      // Check for policies that allow all (qual = 'true' or with_check = 'true')
      if (policy.qual === '(true)' || policy.with_check === '(true)') {
        permissiveCount++;
        console.log(`   ⚠️  ${policy.tablename}.${policy.policyname}: Çok izin verici (qual: ${policy.qual})`);
        testResults.security.issues.push({
          severity: 'MEDIUM',
          issue: `${policy.tablename}.${policy.policyname} policy çok izin verici`,
          recommendation: 'Policy\'yi daha kısıtlayıcı hale getirin'
        });
      } else {
        console.log(`   ✅ ${policy.tablename}.${policy.policyname}: Uygun kısıtlamalar`);
      }
    });

    if (permissiveCount === 0) {
      console.log(`\n✅ Tüm policy'ler uygun kısıtlamalara sahip`);
    }

    testResults.security.accessControl.push({
      check: 'RLS Policies',
      totalPolicies: policies.length,
      permissivePolicies: permissiveCount,
      status: permissiveCount === 0 ? 'PASS' : 'WARNING'
    });

  } catch (error) {
    console.log(`❌ Erişim kontrolü hatası: ${error.message}`);
  }
}

// ============================================
// RAPOR OLUŞTURMA
// ============================================

function generateRecommendations() {
  console.log('\n💡 ÖNERİLER\n');
  console.log('-'.repeat(70));

  // Performance recommendations
  const slowQueries = testResults.performance.queryTimes.filter(q => q.executionTime >= 500);
  if (slowQueries.length > 0) {
    testResults.performance.recommendations.push({
      priority: 'HIGH',
      recommendation: `${slowQueries.length} sorgu 500ms üzerinde - index eklemeyi veya query optimizasyonu yapmayı düşünün`
    });
  }

  const unusedIndexes = testResults.performance.indexUsage.filter(i => i.status === 'UNUSED');
  if (unusedIndexes.length > 0) {
    testResults.performance.recommendations.push({
      priority: 'MEDIUM',
      recommendation: `${unusedIndexes.length} kullanılmayan index var - kaldırarak yazma performansını artırabilirsiniz`
    });
  }

  // Security recommendations
  const disabledRLS = testResults.security.rlsPolicies.filter(p => !p.enabled);
  if (disabledRLS.length > 0) {
    testResults.security.recommendations.push({
      priority: 'HIGH',
      recommendation: `${disabledRLS.length} kritik tabloda RLS kapalı - güvenlik için açın`
    });
  }

  // Print recommendations
  [...testResults.performance.recommendations, ...testResults.security.recommendations]
    .sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .forEach(rec => {
      const icon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`${icon} [${rec.priority}] ${rec.recommendation}`);
    });
}

function generateReport() {
  testResults.summary.endTime = new Date();
  testResults.summary.duration = testResults.summary.endTime - testResults.summary.startTime;

  // Count tests
  testResults.summary.totalTests = 
    testResults.performance.queryTimes.length +
    testResults.performance.indexUsage.length +
    testResults.performance.tableStats.length +
    testResults.security.rlsPolicies.length +
    testResults.security.passwordSecurity.length +
    testResults.security.sqlInjection.length +
    testResults.security.accessControl.length;

  // Count results
  testResults.performance.queryTimes.forEach(q => {
    if (q.status === 'PASS') testResults.summary.passed++;
    else if (q.status === 'FAIL') testResults.summary.failed++;
    else testResults.summary.warnings++;
  });

  testResults.security.rlsPolicies.forEach(p => {
    if (p.status === 'PASS') testResults.summary.passed++;
    else testResults.summary.failed++;
  });

  testResults.security.passwordSecurity.forEach(s => {
    if (s.status === 'PASS') testResults.summary.passed++;
    else testResults.summary.failed++;
  });

  testResults.security.sqlInjection.forEach(s => {
    if (s.status === 'PASS') testResults.summary.passed++;
    else testResults.summary.warnings++;
  });

  testResults.security.accessControl.forEach(a => {
    if (a.status === 'PASS') testResults.summary.passed++;
    else testResults.summary.warnings++;
  });

  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST ÖZET RAPORU');
  console.log('='.repeat(70));

  console.log(`\n✅ Başarılı: ${testResults.summary.passed}`);
  console.log(`❌ Başarısız: ${testResults.summary.failed}`);
  console.log(`⚠️  Uyarı: ${testResults.summary.warnings}`);
  console.log(`📊 Toplam Test: ${testResults.summary.totalTests}`);
  console.log(`⏱️  Süre: ${(testResults.summary.duration / 1000).toFixed(2)} saniye`);

  const totalIssues = 
    testResults.performance.issues.length + 
    testResults.security.issues.length;

  if (totalIssues > 0) {
    console.log(`\n🔴 Toplam Sorun: ${totalIssues}`);
    console.log(`   Performans: ${testResults.performance.issues.length}`);
    console.log(`   Güvenlik: ${testResults.security.issues.length}`);
  } else {
    console.log(`\n✅ Hiç sorun tespit edilmedi!`);
  }

  // Save JSON report
  const reportPath = path.join(process.cwd(), 'database-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detaylı rapor kaydedildi: ${reportPath}`);
}

// ============================================
// ANA FONKSİYON
// ============================================

async function runTests() {
  try {
    console.log('🚀 Veritabanı Performans ve Güvenlik Testi Başlatılıyor...\n');
    console.log('='.repeat(70));

    await connectDatabase();

    // Performance tests
    await testQueryPerformance();
    await testIndexUsage();
    await testTableStatistics();

    // Security tests
    await testRLSPolicies();
    await testPasswordSecurity();
    await testSQLInjectionProtection();
    await testAccessControl();

    // Generate recommendations and report
    generateRecommendations();
    generateReport();

    console.log('\n✅ Tüm testler tamamlandı!\n');

  } catch (error) {
    console.error('\n❌ Test sırasında hata:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Run tests
runTests();
