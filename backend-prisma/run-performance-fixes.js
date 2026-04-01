/**
 * Run Performance Fixes Migration
 * 
 * This script runs the performance fixes migration to:
 * 1. Add missing index for foreign key
 * 2. Optionally remove unused indexes (review remove_unused_indexes.sql first)
 * 
 * Usage:
 *   node backend/run-performance-fixes.js
 * 
 * Environment variables required:
 *   - DATABASE_URL or DIRECT_URL (connection string)
 * 
 * Note: This script requires the 'pg' package. Install it with:
 *   npm install pg
 * 
 * Alternatively, you can run the SQL files directly in Supabase SQL Editor
 * or using psql command line tool.
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: process.env.DIRECT_URL || process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting performance fixes migration...\n');
    
    // Read the comprehensive migration file
    const migrationPath = path.join(__dirname, 'migrations', 'fix_all_performance_issues.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Running fix_all_performance_issues.sql...');
    console.log('   This will:');
    console.log('   1. Add missing index for foreign key');
    console.log('   2. Remove all unused indexes identified by the linter\n');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify the index was created
    console.log('🔍 Verifying index creation...');
    const indexCheck = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'job_applications' 
      AND indexname = 'idx_job_applications_job_posting_id'
    `);
    
    if (indexCheck.rows.length > 0) {
      console.log('✅ Index idx_job_applications_job_posting_id exists');
      console.log(`   Definition: ${indexCheck.rows[0].indexdef}\n`);
    } else {
      console.log('⚠️  Index idx_job_applications_job_posting_id not found');
      console.log('   This might mean the table or foreign key doesn\'t exist yet.\n');
    }
    
    // Get statistics on unused indexes
    console.log('📊 Checking for unused indexes...');
    const unusedIndexes = await client.query(`
      SELECT 
          schemaname, 
          tablename, 
          indexname, 
          idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND idx_scan = 0
      AND indexrelid IS NOT NULL
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10
    `);
    
    if (unusedIndexes.rows.length > 0) {
      console.log(`\n⚠️  Found ${unusedIndexes.rows.length} unused indexes (showing top 10):\n`);
      unusedIndexes.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.tablename}.${row.indexname} (${row.index_size})`);
      });
      console.log('\n💡 Review remove_unused_indexes.sql to safely remove unused indexes');
    } else {
      console.log('✅ No unused indexes found (or statistics need updating - run ANALYZE)');
    }
    
    // Update statistics
    console.log('\n📊 Updating PostgreSQL statistics...');
    await client.query('ANALYZE;');
    console.log('✅ Statistics updated\n');
    
    console.log('✨ Performance fixes migration complete!');
    console.log('\n✅ Fixed issues:');
    console.log('   ✓ Added index for job_applications.job_posting_id foreign key');
    console.log('   ✓ Removed unused indexes to free up storage');
    console.log('   ✓ Updated PostgreSQL statistics');
    console.log('\n📚 Next steps:');
    console.log('   1. Monitor query performance to ensure everything works correctly');
    console.log('   2. Check your Supabase dashboard to verify linter issues are resolved');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
