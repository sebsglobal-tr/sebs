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

async function setupDatabaseTables() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('\n🔄 Veritabanı tabloları kontrol ediliyor ve oluşturuluyor...\n');
        
        // Read migration SQL files
        const purchasesMigrationPath = path.join(__dirname, 'backend/migrations/create_purchases_table_simple.sql');
        const updateMigrationPath = path.join(__dirname, 'backend/migrations/update_existing_tables.sql');
        
        // Execute purchases table creation
        const purchasesSQL = fs.readFileSync(purchasesMigrationPath, 'utf8');
        await client.query(purchasesSQL);
        console.log('✅ Purchases table migration executed');
        
        // Execute existing tables update
        const updateSQL = fs.readFileSync(updateMigrationPath, 'utf8');
        await client.query(updateSQL);
        console.log('✅ Existing tables update migration executed');
        
        // Verify tables
        const requiredTables = [
            'users',
            'courses',
            'modules',
            'enrollments',
            'module_progress',
            'simulation_runs',
            'refresh_tokens',
            'certificates',
            'entitlements',
            'behavior_data',
            'skill_scores',
            'ai_analysis',
            'security_logs',
            'purchases',
            'user_package_purchases'
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
        
        // Check users table
        const usersColumns = await client.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = 'users'`
        );
        const usersColNames = usersColumns.rows.map(r => r.column_name);
        console.log(`   users: ${usersColNames.includes('access_level') ? '✅' : '❌'} access_level`);
        
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
            console.log(`   module_progress: ${progressColNames.includes('time_spent_minutes') ? '✅' : '❌'} time_spent_minutes`);
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

