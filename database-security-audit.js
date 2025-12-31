/**
 * Comprehensive Database Security & Structure Audit
 * Veritabanı güvenlik ve yapı denetimi
 */

require('dotenv').config();
const { Pool } = require('pg');

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

const issues = {
    security: [],
    structure: [],
    performance: [],
    integrity: [],
    missing: []
};

async function auditDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔍 VERİTABANI KAPSAMLI DENETİM BAŞLATILIYOR...\n');
        console.log('='.repeat(70));
        
        // 1. TABLO YAPISI KONTROLÜ
        console.log('\n📊 1. TABLO YAPISI KONTROLÜ\n');
        await checkTableStructures(client);
        
        // 2. GÜVENLİK KONTROLÜ
        console.log('\n🔒 2. GÜVENLİK KONTROLÜ\n');
        await checkSecurityIssues(client);
        
        // 3. FOREIGN KEY KONTROLÜ
        console.log('\n🔗 3. FOREIGN KEY İLİŞKİLERİ\n');
        await checkForeignKeys(client);
        
        // 4. INDEX KONTROLÜ
        console.log('\n📇 4. INDEX KONTROLÜ\n');
        await checkIndexes(client);
        
        // 5. VERİ BÜTÜNLÜĞÜ
        console.log('\n✅ 5. VERİ BÜTÜNLÜĞÜ KONTROLÜ\n');
        await checkDataIntegrity(client);
        
        // 6. PERFORMANS KONTROLÜ
        console.log('\n⚡ 6. PERFORMANS KONTROLÜ\n');
        await checkPerformance(client);
        
        // 7. RAPOR
        console.log('\n📋 DENETİM RAPORU\n');
        generateReport();
        
    } catch (error) {
        console.error('\n❌ Denetim sırasında hata:', error.message);
    } finally {
        client.release();
    }
}

async function checkTableStructures(client) {
    // Check critical tables
    const criticalTables = ['users', 'purchases', 'module_progress', 'enrollments', 'certificates', 'courses', 'modules'];
    
    for (const table of criticalTables) {
        const exists = await client.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = $1
            )`,
            [table]
        );
        
        if (exists.rows[0].exists) {
            console.log(`   ✅ ${table} tablosu mevcut`);
            
            // Check columns
            const columns = await client.query(
                `SELECT column_name, data_type, is_nullable, column_default
                 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = $1
                 ORDER BY ordinal_position`,
                [table]
            );
            
            // Check for missing critical columns
            if (table === 'users') {
                const hasAccessLevel = columns.rows.some(c => c.column_name === 'access_level');
                if (!hasAccessLevel) {
                    issues.structure.push(`${table}: access_level kolonu eksik`);
                    console.log(`   ⚠️  ${table}: access_level kolonu eksik`);
                }
            }
            
            if (table === 'module_progress') {
                const hasTimeSpent = columns.rows.some(c => c.column_name === 'time_spent_minutes');
                if (!hasTimeSpent) {
                    issues.structure.push(`${table}: time_spent_minutes kolonu eksik`);
                    console.log(`   ⚠️  ${table}: time_spent_minutes kolonu eksik`);
                }
            }
        } else {
            issues.missing.push(`${table} tablosu eksik!`);
            console.log(`   ❌ ${table} tablosu EKSİK!`);
        }
    }
}

async function checkSecurityIssues(client) {
    // 1. Password hashing check
    const passwordCheck = await client.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = 'users' 
         AND column_name LIKE '%password%'`
    );
    
    if (passwordCheck.rows.length > 0) {
        const col = passwordCheck.rows[0];
        if (col.column_name === 'password' && col.data_type !== 'text') {
            issues.security.push('users.password kolonu TEXT değil - hash saklanamaz');
            console.log('   ⚠️  Password kolonu tipi kontrol edilmeli');
        }
        console.log(`   ✅ Password kolonu: ${col.column_name} (${col.data_type})`);
    }
    
    // 2. Check for plain text sensitive data
    const sensitiveColumns = await client.query(
        `SELECT table_name, column_name, data_type
         FROM information_schema.columns
         WHERE table_schema = 'public'
         AND (
             column_name LIKE '%token%' 
             OR column_name LIKE '%secret%'
             OR column_name LIKE '%key%'
             OR column_name LIKE '%password%'
         )
         AND table_name NOT IN ('_prisma_migrations')`
    );
    
    console.log(`   📋 Hassas veri kolonları: ${sensitiveColumns.rows.length} adet`);
    sensitiveColumns.rows.forEach(col => {
        console.log(`      - ${col.table_name}.${col.column_name}`);
    });
    
    // 3. Check for missing constraints on sensitive tables
    const usersConstraints = await client.query(
        `SELECT constraint_name, constraint_type
         FROM information_schema.table_constraints
         WHERE table_schema = 'public' AND table_name = 'users'
         AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')`
    );
    
    const hasEmailUnique = usersConstraints.rows.some(c => 
        c.constraint_name.includes('email') || c.constraint_name.includes('unique')
    );
    
    if (!hasEmailUnique) {
        issues.security.push('users.email için UNIQUE constraint eksik');
        console.log('   ⚠️  users.email için UNIQUE constraint kontrol edilmeli');
    } else {
        console.log('   ✅ users.email UNIQUE constraint mevcut');
    }
}

async function checkForeignKeys(client) {
    const fks = await client.query(
        `SELECT 
            tc.table_name, 
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
         FROM information_schema.table_constraints AS tc
         JOIN information_schema.key_column_usage AS kcu
           ON tc.constraint_name = kcu.constraint_name
         JOIN information_schema.constraint_column_usage AS ccu
           ON ccu.constraint_name = tc.constraint_name
         JOIN information_schema.referential_constraints AS rc
           ON rc.constraint_name = tc.constraint_name
         WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = 'public'
         ORDER BY tc.table_name`
    );
    
    console.log(`   📋 Toplam ${fks.rows.length} foreign key constraint`);
    
    // Check for missing FKs on critical relationships
    const criticalFKs = [
        { table: 'purchases', column: 'user_id', refTable: 'users' },
        { table: 'module_progress', column: 'user_id', refTable: 'users' },
        { table: 'module_progress', column: 'module_id', refTable: 'modules' },
        { table: 'enrollments', column: 'user_id', refTable: 'users' },
        { table: 'enrollments', column: 'course_id', refTable: 'courses' }
    ];
    
    for (const fk of criticalFKs) {
        const exists = fks.rows.some(row => 
            row.table_name === fk.table && 
            row.column_name === fk.column &&
            row.foreign_table_name === fk.refTable
        );
        
        if (!exists) {
            issues.integrity.push(`${fk.table}.${fk.column} → ${fk.refTable} foreign key eksik`);
            console.log(`   ❌ ${fk.table}.${fk.column} → ${fk.refTable} foreign key EKSİK`);
        } else {
            console.log(`   ✅ ${fk.table}.${fk.column} → ${fk.refTable}`);
        }
    }
    
    // Check CASCADE rules
    const cascadeIssues = fks.rows.filter(row => row.delete_rule !== 'CASCADE' && row.delete_rule !== 'NO ACTION');
    if (cascadeIssues.length > 0) {
        console.log(`   ⚠️  ${cascadeIssues.length} foreign key'de CASCADE kuralı kontrol edilmeli`);
    }
}

async function checkIndexes(client) {
    const indexes = await client.query(
        `SELECT tablename, indexname, indexdef
         FROM pg_indexes
         WHERE schemaname = 'public'
         ORDER BY tablename, indexname`
    );
    
    console.log(`   📋 Toplam ${indexes.rows.length} index`);
    
    // Check for missing indexes on foreign keys
    const fkColumns = await client.query(
        `SELECT DISTINCT kcu.table_name, kcu.column_name
         FROM information_schema.table_constraints AS tc
         JOIN information_schema.key_column_usage AS kcu
           ON tc.constraint_name = kcu.constraint_name
         WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = 'public'`
    );
    
    for (const fk of fkColumns.rows) {
        const hasIndex = indexes.rows.some(idx => 
            idx.tablename === fk.table_name &&
            (idx.indexdef.includes(fk.column_name) || idx.indexname.includes(fk.column_name))
        );
        
        if (!hasIndex) {
            issues.performance.push(`${fk.table_name}.${fk.column_name} için index eksik`);
            console.log(`   ⚠️  ${fk.table_name}.${fk.column_name} için index eksik`);
        }
    }
    
    // Check for indexes on frequently queried columns
    const criticalIndexes = [
        { table: 'purchases', columns: ['user_id', 'category', 'level', 'is_active'] },
        { table: 'module_progress', columns: ['user_id', 'module_id', 'is_completed'] },
        { table: 'users', columns: ['email', 'access_level'] },
        { table: 'modules', columns: ['course_id'] }
    ];
    
    for (const crit of criticalIndexes) {
        for (const col of crit.columns) {
            const hasIndex = indexes.rows.some(idx => 
                idx.tablename === crit.table &&
                (idx.indexdef.includes(`"${col}"`) || idx.indexdef.includes(`(${col})`) || idx.indexname.includes(col))
            );
            
            if (!hasIndex) {
                issues.performance.push(`${crit.table}.${col} için index eksik`);
                console.log(`   ⚠️  ${crit.table}.${col} için index eksik`);
            }
        }
    }
}

async function checkDataIntegrity(client) {
    // Check for orphaned records
    const orphanedProgress = await client.query(
        `SELECT COUNT(*) as count
         FROM module_progress mp
         LEFT JOIN users u ON mp.user_id = u.id
         WHERE u.id IS NULL`
    );
    
    if (parseInt(orphanedProgress.rows[0].count) > 0) {
        issues.integrity.push(`${orphanedProgress.rows[0].count} orphaned module_progress kaydı var`);
        console.log(`   ⚠️  ${orphanedProgress.rows[0].count} orphaned module_progress kaydı`);
    } else {
        console.log('   ✅ Orphaned module_progress kaydı yok');
    }
    
    // Check for duplicate purchases
    const duplicatePurchases = await client.query(
        `SELECT user_id, category, level, COUNT(*) as count
         FROM purchases
         WHERE is_active = TRUE
         GROUP BY user_id, category, level
         HAVING COUNT(*) > 1`
    );
    
    if (duplicatePurchases.rows.length > 0) {
        issues.integrity.push(`${duplicatePurchases.rows.length} duplicate purchase kaydı var`);
        console.log(`   ⚠️  ${duplicatePurchases.rows.length} duplicate purchase kaydı`);
    } else {
        console.log('   ✅ Duplicate purchase kaydı yok');
    }
}

async function checkPerformance(client) {
    // Check table sizes
    const tableSizes = await client.query(
        `SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
         FROM pg_tables
         WHERE schemaname = 'public'
         ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
         LIMIT 10`
    );
    
    console.log('   📊 En büyük tablolar:');
    tableSizes.rows.forEach(row => {
        console.log(`      - ${row.tablename}: ${row.size}`);
    });
    
    // Check for missing statistics
    try {
        const statsCheck = await client.query(
            `SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, last_vacuum, last_analyze
             FROM pg_stat_user_tables
             WHERE schemaname = 'public'
             ORDER BY (COALESCE(n_tup_ins, 0)::bigint + COALESCE(n_tup_upd, 0)::bigint + COALESCE(n_tup_del, 0)::bigint) DESC
             LIMIT 5`
        );
        
        console.log('   📈 En aktif tablolar:');
        statsCheck.rows.forEach(row => {
            const totalOps = (parseInt(row.n_tup_ins) || 0) + (parseInt(row.n_tup_upd) || 0) + (parseInt(row.n_tup_del) || 0);
            console.log(`      - ${row.tablename}: ${totalOps} işlem`);
            if (!row.last_analyze) {
                issues.performance.push(`${row.tablename} tablosu için ANALYZE çalıştırılmamış`);
            }
        });
    } catch (err) {
        console.log('   ⚠️  İstatistik bilgisi alınamadı:', err.message);
    }
}

function generateReport() {
    console.log('='.repeat(70));
    console.log('\n📊 DENETİM SONUÇLARI\n');
    
    const totalIssues = issues.security.length + issues.structure.length + 
                       issues.performance.length + issues.integrity.length + issues.missing.length;
    
    if (totalIssues === 0) {
        console.log('✅ TÜM KONTROLLER BAŞARILI! Veritabanı mükemmel durumda.\n');
        return;
    }
    
    if (issues.missing.length > 0) {
        console.log('❌ EKSİK TABLOLAR:');
        issues.missing.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
    }
    
    if (issues.security.length > 0) {
        console.log('🔒 GÜVENLİK SORUNLARI:');
        issues.security.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
    }
    
    if (issues.structure.length > 0) {
        console.log('🏗️  YAPISAL SORUNLAR:');
        issues.structure.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
    }
    
    if (issues.integrity.length > 0) {
        console.log('✅ VERİ BÜTÜNLÜĞÜ SORUNLARI:');
        issues.integrity.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
    }
    
    if (issues.performance.length > 0) {
        console.log('⚡ PERFORMANS SORUNLARI:');
        issues.performance.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
    }
    
    console.log(`\n📊 TOPLAM: ${totalIssues} sorun tespit edildi\n`);
}

// Run audit
if (require.main === module) {
    auditDatabase()
        .then(() => pool.end())
        .catch(err => {
            console.error('Fatal error:', err);
            pool.end();
            process.exit(1);
        });
}

module.exports = { auditDatabase };

