/**
 * SEBS Veritabanı Pool Modülü
 * - Supabase ile uyumlu SSL
 * - Şifre URL encoding
 * - Tek merkezden yönetim
 */

const { Pool } = require('pg');
const path = require('path');

// Root .env yükle (server.js ile aynı)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function getConnectionConfig() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('[YOUR-PASSWORD]')) {
    return null;
  }

  const isSupabase = url.includes('supabase') || url.includes('pooler');
  const ssl = isSupabase ? { rejectUnauthorized: false } : false;

  return {
    connectionString: url,
    ssl,
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  };
}

function createPool() {
  const config = getConnectionConfig();
  if (!config) {
    throw new Error('DATABASE_URL .env içinde tanımlı olmalı (Supabase şifresi dahil)');
  }
  return new Pool(config);
}

module.exports = { createPool, getConnectionConfig };
