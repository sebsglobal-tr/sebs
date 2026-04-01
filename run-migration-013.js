/**
 * Migration 013: quiz_attempts, user_login_logs, user_module_sessions tabloları
 * node run-migration-013.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const url = (process.env.DATABASE_URL || process.env.DB_URL || '').trim();
const pool = new Pool({
  connectionString: url || undefined,
  host: url ? undefined : (process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'sebs_education',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: (url && (url.includes('supabase') || url.includes('pooler'))) ? { rejectUnauthorized: false } : false
});

async function run() {
  const client = await pool.connect();
  try {
    const sqlPath = path.join(__dirname, 'backend/migrations/013_quiz_login_module_session.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('✅ Migration 013 başarıyla çalıştırıldı: quiz_attempts, user_login_logs, user_module_sessions');
  } catch (err) {
    console.error('❌ Migration hatası:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
