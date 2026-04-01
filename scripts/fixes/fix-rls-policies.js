/**
 * RLS Policy Düzeltmeleri
 * Supabase Linter Uyarılarını Düzelt
 * 
 * Bu script "Service role full access" policy'lerini güvenli hale getirir:
 * 1. Service role policy'lerinin sadece service_role için geçerli olduğundan emin olur
 * 2. Public/authenticated rollere erişim engellenir
 * 3. Kritik tablolar için daha güvenli policy'ler oluşturur
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

// Kritik tablolar (kullanıcı verilerini içeren)
const CRITICAL_TABLES = [
    'users',
    'module_progress',
    'purchases',
    'refresh_tokens',
    'certificates',
    'user_package_purchases',
    'enrollments',
    'simulation_runs',
    'security_logs'
];

// Sistem tabloları (service_role için tam erişim gerekli)
const SYSTEM_TABLES = [
    '_prisma_migrations',
    'ai_analysis',
    'ai_cache',
    'analytics',
    'backup_metadata',
    'behavior_data',
    'bootcamp_applications',
    'bootcamps',
    'companies',
    'company_recommendations',
    'connection_monitor',
    'courses',
    'entitlements',
    'intern_pool',
    'job_applications',
    'job_postings',
    'maintenance_log',
    'modules',
    'notifications',
    'packages',
    'payments',
    'rate_limits',
    'skill_scores',
    'slow_queries',
    'subscriptions'
];

const securityFixes = [];

async function fixRLSPolicies() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔒 RLS POLICY DÜZELTMELERİ BAŞLATILIYOR...\n');
        console.log('='.repeat(70));
        
        // 1. KRİTİK TABLOLAR İÇİN GÜVENLİ POLICY'LER
        console.log('\n📋 1. KRİTİK TABLOLAR İÇİN GÜVENLİ POLICY\'LER\n');
        await fixCriticalTablePolicies(client);
        
        // 2. SİSTEM TABLOLARI İÇİN SERVICE ROLE POLICY'LERİ
        console.log('\n📋 2. SİSTEM TABLOLARI İÇİN SERVICE ROLE POLICY\'LERİ\n');
        await fixSystemTablePolicies(client);
        
        // 3. ANON VE AUTHENTICATED ERİŞİMİ ENGELLE
        console.log('\n📋 3. ANON VE AUTHENTICATED ERİŞİMİ ENGELLE\n');
        await blockPublicAccess(client);
        
        // 4. RAPOR
        console.log('\n📊 RLS POLICY DÜZELTME RAPORU\n');
        generateReport();
        
    } catch (error) {
        console.error('\n❌ RLS policy düzeltmeleri sırasında hata:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

async function fixCriticalTablePolicies(client) {
    for (const table of CRITICAL_TABLES) {
        try {
            // Mevcut policy'yi kontrol et
            const existingPolicy = await client.query(`
                SELECT policyname, roles, cmd, qual, with_check
                FROM pg_policies
                WHERE schemaname = 'public'
                AND tablename = $1
                AND policyname = 'Service role full access'
            `, [table]);
            
            if (existingPolicy.rows.length > 0) {
                const policy = existingPolicy.rows[0];
                const roles = policy.roles || [];
                
                // Eğer policy public, anon veya authenticated rolüne uygulanıyorsa düzelt
                if (roles.includes('public') || roles.includes('anon') || roles.includes('authenticated') || roles.length === 0) {
                    // Mevcut policy'yi sil
                    await client.query(`
                        DROP POLICY IF EXISTS "Service role full access" ON ${table};
                    `);
                    
                    // Sadece service_role için yeni policy oluştur
                    await client.query(`
                        CREATE POLICY "Service role full access"
                        ON ${table}
                        FOR ALL
                        TO service_role
                        USING (true)
                        WITH CHECK (true);
                    `);
                    
                    console.log(`   ✅ ${table}: Policy public rolünden service_role'e değiştirildi (KRİTİK DÜZELTME)`);
                    securityFixes.push(`${table}: Service role policy secured from public`);
                } else if (roles.includes('service_role')) {
                    console.log(`   ✅ ${table}: Policy zaten service_role için yapılandırılmış`);
                }
            } else {
                // Policy yoksa oluştur
                await client.query(`
                    CREATE POLICY "Service role full access"
                    ON ${table}
                    FOR ALL
                    TO service_role
                    USING (true)
                    WITH CHECK (true);
                `);
                console.log(`   ✅ ${table}: Service role policy oluşturuldu`);
                securityFixes.push(`${table}: Service role policy created`);
            }
            
        } catch (error) {
            if (error.code === '42P01') {
                console.log(`   ⚠️  ${table}: Tablo bulunamadı`);
            } else {
                console.error(`   ❌ ${table}: Hata - ${error.message}`);
            }
        }
    }
}

async function fixSystemTablePolicies(client) {
    for (const table of SYSTEM_TABLES) {
        try {
            // Sistem tabloları için service_role'a tam erişim ver (bu normal)
            // Ancak public, anon ve authenticated erişimini engelle
            
            // Mevcut policy'yi kontrol et
            const existingPolicy = await client.query(`
                SELECT policyname, roles, cmd, qual, with_check
                FROM pg_policies
                WHERE schemaname = 'public'
                AND tablename = $1
                AND policyname = 'Service role full access'
            `, [table]);
            
            if (existingPolicy.rows.length > 0) {
                const policy = existingPolicy.rows[0];
                const roles = policy.roles || [];
                
                // Eğer policy public, anon veya authenticated rolüne uygulanıyorsa düzelt
                if (roles.includes('public') || roles.includes('anon') || roles.includes('authenticated') || roles.length === 0) {
                    // Mevcut policy'yi sil
                    await client.query(`
                        DROP POLICY IF EXISTS "Service role full access" ON ${table};
                    `);
                    
                    // Sadece service_role için yeni policy oluştur
                    await client.query(`
                        CREATE POLICY "Service role full access"
                        ON ${table}
                        FOR ALL
                        TO service_role
                        USING (true)
                        WITH CHECK (true);
                    `);
                    
                    console.log(`   ✅ ${table}: Policy public rolünden service_role'e değiştirildi`);
                    securityFixes.push(`${table}: Service role policy secured from public`);
                } else if (roles.includes('service_role')) {
                    console.log(`   ✅ ${table}: Sistem tablosu - service_role erişimi normal`);
                }
            } else {
                // Policy yoksa oluştur (sadece service_role için)
                await client.query(`
                    CREATE POLICY "Service role full access"
                    ON ${table}
                    FOR ALL
                    TO service_role
                    USING (true)
                    WITH CHECK (true);
                `);
                
                console.log(`   ✅ ${table}: Service role policy oluşturuldu`);
                securityFixes.push(`${table}: Service role policy created`);
            }
            
        } catch (error) {
            if (error.code === '42P01') {
                console.log(`   ⚠️  ${table}: Tablo bulunamadı`);
            } else {
                console.error(`   ❌ ${table}: Hata - ${error.message}`);
            }
        }
    }
}

async function blockPublicAccess(client) {
    // Kritik tablolar için anon ve authenticated erişimini engelle
    const allTables = [...CRITICAL_TABLES, ...SYSTEM_TABLES];
    
    for (const table of allTables) {
        try {
            // Tablonun var olup olmadığını kontrol et
            const tableExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )
            `, [table]);
            
            if (!tableExists.rows[0].exists) {
                continue;
            }
            
            // RLS'i aktif et (eğer değilse)
            await client.query(`
                ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
            `);
            
            // anon rolüne tüm izinleri kaldır (eğer varsa)
            try {
                await client.query(`
                    REVOKE ALL ON TABLE ${table} FROM anon;
                `);
            } catch (e) {
                // anon rolü yoksa sorun değil
                if (e.code !== '42704') throw e;
            }
            
            // authenticated rolüne kritik tablolarda izin verme
            if (CRITICAL_TABLES.includes(table)) {
                try {
                    await client.query(`
                        REVOKE ALL ON TABLE ${table} FROM authenticated;
                    `);
                    console.log(`   ✅ ${table}: authenticated rolü erişimi engellendi`);
                } catch (e) {
                    if (e.code !== '42704') throw e;
                }
            }
            
        } catch (error) {
            if (error.code === '42P01') {
                // Tablo yoksa devam et
                continue;
            } else {
                console.error(`   ❌ ${table}: Public access engelleme hatası - ${error.message}`);
            }
        }
    }
}

function generateReport() {
    console.log('='.repeat(70));
    console.log('\n📊 RLS POLICY DÜZELTME SONUÇLARI\n');
    
    if (securityFixes.length === 0) {
        console.log('⚠️  Hiçbir değişiklik yapılmadı. Mevcut yapılandırma zaten güvenli olabilir.\n');
        console.log('💡 ÖNERİLER:');
        console.log('   1. Supabase Dashboard\'da policy\'leri manuel olarak kontrol edin');
        console.log('   2. Service role policy\'lerinin sadece service_role için geçerli olduğundan emin olun');
        console.log('   3. Kritik tablolar için anon ve authenticated erişimini engelleyin\n');
        return;
    }
    
    console.log(`✅ TOPLAM ${securityFixes.length} RLS POLICY DÜZELTMESİ YAPILDI:\n`);
    securityFixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
    });
    
    console.log('\n✅ RLS policy düzeltmeleri tamamlandı!\n');
    console.log('📝 NOT: Bu düzeltmeler Supabase Linter uyarılarını çözmek içindir.');
    console.log('   Service role policy\'leri artık sadece service_role için geçerlidir.\n');
}

// Run fixes
if (require.main === module) {
    fixRLSPolicies()
        .then(() => {
            console.log('✅ RLS policy düzeltmeleri başarıyla tamamlandı!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ RLS policy düzeltmeleri başarısız:', err);
            process.exit(1);
        });
}

module.exports = { fixRLSPolicies };
