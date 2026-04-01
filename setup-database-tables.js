/**
 * Database Tables Setup Script
 * Veritabanında eksik tabloları oluşturur ve mevcut tabloları günceller
 * 
 * Kullanım:
 * node setup-database-tables.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection (server.js ile uyumlu: DATABASE_URL veya DB_*)
const createPool = () => {
    const url = (process.env.DATABASE_URL || '').trim();
    if (url && !url.includes('YOUR-PASSWORD')) {
        return new Pool({
            connectionString: url,
            ssl: (url.includes('supabase') || url.includes('pooler')) ? { rejectUnauthorized: false } : false
        });
    }
    return new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME || 'sebs_education',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: false
    });
};
const pool = createPool();

async function setupDatabaseTables() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('\n🔄 Veritabanı tabloları kontrol ediliyor ve oluşturuluyor...\n');
        
        // 1) Ana migration: Eksiksiz şema (010) - tablolar, indexler, güvenlik
        const mainMigrationPath = path.join(__dirname, 'backend/migrations/010_complete_schema_secure.sql');
        if (fs.existsSync(mainMigrationPath)) {
            const mainSQL = fs.readFileSync(mainMigrationPath, 'utf8');
            await client.query(mainSQL);
            console.log('✅ 010_complete_schema_secure.sql çalıştırıldı');
        } else {
            const fallbackPath = path.join(__dirname, 'backend/migrations/007_server_required_tables_all.sql');
            if (fs.existsSync(fallbackPath)) {
                await client.query(fs.readFileSync(fallbackPath, 'utf8'));
                console.log('✅ 007_server_required_tables_all.sql (fallback) çalıştırıldı');
            }
        }

        // 2) Eksik kolonlar (009 - last_step vb.)
        const lastStepPath = path.join(__dirname, 'backend/migrations/009_module_progress_last_step.sql');
        if (fs.existsSync(lastStepPath)) {
            await client.query(fs.readFileSync(lastStepPath, 'utf8'));
            console.log('✅ 009_module_progress_last_step.sql çalıştırıldı');
        }

        // 3) RLS (Row Level Security) - Supabase güvenlik
        const rlsPath = path.join(__dirname, 'backend/migrations/011_enable_rls_all_tables.sql');
        if (fs.existsSync(rlsPath)) {
            await client.query(fs.readFileSync(rlsPath, 'utf8'));
            console.log('✅ 011_enable_rls_all_tables.sql çalıştırıldı');
        }
        
        // Doğrulama: server.js tarafından kullanılan tablolar
        const requiredTables = [
            'users',
            'modules',
            'lessons',
            'enrollments',
            'user_lesson_progress',
            'user_module_progress',
            'module_progress',
            'purchases',
            'user_package_purchases',
            'simulation_runs',
            'certificates',
            'user_activities',
            'user_achievements',
            'refresh_tokens'
        ];
        
        const result = await client.query(
            `SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
        );
        
        const existingTables = result.rows.map(r => r.table_name);
        
        console.log('\n📋 Tablo Durumu:\n');
        let allTablesExist = true;
        
        for (const table of requiredTables) {
            const exists = existingTables.includes(table);
            if (exists) {
                console.log(`   ✅ ${table}`);
            } else {
                console.log(`   ❌ ${table} - EKSİK!`);
                allTablesExist = false;
            }
        }
        
        // Check columns for critical tables
        console.log('\n📊 Kritik Tabloların Kolon Kontrolü:\n');
        
        // Check users table (Supabase kullanıyorsanız sadece profiles olabilir)
        if (existingTables.includes('users')) {
            const usersColumns = await client.query(
                `SELECT column_name FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'users'`
            );
            const usersColNames = usersColumns.rows.map(r => r.column_name);
            console.log(`   users: ${usersColNames.includes('access_level') ? '✅' : '❌'} access_level`);
        } else {
            console.log('   users: (yok – Supabase kullanıyorsanız profiles tablosu kullanılıyor olabilir)');
        }
        
        // Check purchases table
        if (existingTables.includes('purchases')) {
            const purchasesColumns = await client.query(
                `SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'purchases'`
            );
            const purchasesColNames = purchasesColumns.rows.map(r => r.column_name);
            console.log(`   purchases: ${purchasesColNames.length} kolon`);
        }
        
        // Check module_progress table
        if (existingTables.includes('module_progress')) {
            const progressColumns = await client.query(
                `SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'module_progress'`
            );
            const progressColNames = progressColumns.rows.map(r => r.column_name);
            const hasTime = progressColNames.includes('time_spent_minutes');
            const hasLastStep = progressColNames.includes('last_step');
            console.log(`   module_progress: ${hasTime ? '✅' : '❌'} time_spent_minutes, ${hasLastStep ? '✅' : '❌'} last_step`);
        }
        
        await client.query('COMMIT');
        
        if (allTablesExist) {
            console.log('\n✅ Tüm tablolar mevcut ve güncel!\n');
        } else {
            console.log('\n⚠️  Bazı tablolar eksik. Lütfen migration dosyasını kontrol edin.\n');
        }
        
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
    try {
        await setupDatabaseTables();
        await pool.end();
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

module.exports = { setupDatabaseTables };

