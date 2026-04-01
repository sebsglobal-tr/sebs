#!/usr/bin/env node
/**
 * SEBS Veritabanı Bağlantı Kurulum ve Test Scripti
 * Kullanım: DB_PASSWORD="sifreniz" node scripts/db-setup.js
 *   veya: node scripts/db-setup.js "postgresql://postgres.xxx:sifre@host:6543/postgres"
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PROJECT_REF = (process.env.SUPABASE_PROJECT_REF || '').trim();
const POOLER_HOST = process.env.SUPABASE_POOLER || 'aws-1-eu-central-1.pooler.supabase.com';
const DIRECT_HOST = `db.${PROJECT_REF}.supabase.co`;
const DB_USER_POOLER = `postgres.${PROJECT_REF}`;
const DB_NAME = 'postgres';

function buildConnectionString(host, port, user, password, addPgbouncer = false) {
  const enc = encodeURIComponent(String(password));
  let url = `postgresql://${user}:${enc}@${host}:${port}/${DB_NAME}`;
  if (addPgbouncer && port === 6543) url += '?pgbouncer=true';
  return url;
}

function createPool(connectionString) {
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
}

async function testConnection(connectionString) {
  const pool = createPool(connectionString);
  try {
    const r = await pool.query('SELECT NOW(), current_database()');
    await pool.end();
    return { ok: true, time: r.rows[0].now, db: r.rows[0].current_database };
  } catch (err) {
    try { await pool.end(); } catch (_) {}
    return { ok: false, error: err.message };
  }
}

function updateEnvFiles(root, poolerUrl, password) {
  const directUrl = buildConnectionString(DIRECT_HOST, 5432, DB_USER_POOLER, password, false);
  const rootEnv = path.join(root, '.env');
  const backendEnv = path.join(root, 'backend', '.env');
  const esc = (s) => JSON.stringify(String(s));
  const lines = [
    `DATABASE_URL=${esc(poolerUrl)}`,
    `DIRECT_URL=${esc(directUrl)}`,
    `DB_PASSWORD=${esc(password)}`
  ];

  for (const envPath of [rootEnv, backendEnv]) {
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }
    for (const line of lines) {
      const key = line.split('=')[0];
      const regex = new RegExp(`${key}=.*`, 'm');
      if (content.match(regex)) {
        content = content.replace(regex, line);
      } else {
        content = (content.trimEnd() ? content + '\n' : '') + line + '\n';
      }
    }
    fs.writeFileSync(envPath, content);
    console.log(`✅ ${path.relative(root, envPath)} güncellendi`);
  }
}

function extractPasswordFromUrl(url) {
  try {
    const m = url.match(/postgresql:\/\/[^:]+:([^@]+)@/);
    return m ? decodeURIComponent(m[1]) : '';
  } catch { return ''; }
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const argUrl = process.argv[2];

  let urlToTest = null;
  let password = '';

  if (argUrl && argUrl.startsWith('postgresql://')) {
    urlToTest = argUrl;
    password = extractPasswordFromUrl(argUrl);
    console.log('📋 Argümandan connection string alındı\n');
  } else {
    if (!PROJECT_REF) {
      console.error('❌ SUPABASE_PROJECT_REF .env içinde tanımlı olmalı (Supabase proje referansı).\n');
      process.exit(1);
    }
    password = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD;
    if (!password && process.env.DATABASE_URL) {
      password = extractPasswordFromUrl(process.env.DATABASE_URL);
    }

    if (!password || String(password).includes('YOUR-PASSWORD')) {
      console.error('❌ Supabase veritabanı şifresi gerekli.\n');
      console.error('Kullanım:');
      console.error('  DB_PASSWORD="supabase-sifreniz" node scripts/db-setup.js');
      console.error('  node scripts/db-setup.js "postgresql://postgres.xxx:sifre@host:6543/postgres"\n');
      console.error('Şifre: Supabase Dashboard → Project → Settings → Database → Database password');
      process.exit(1);
    }

    urlToTest = buildConnectionString(POOLER_HOST, 6543, DB_USER_POOLER, password, true);
  }

  console.log('🔌 Bağlantı test ediliyor...\n');

  const r = await testConnection(urlToTest);
  if (!r.ok) {
    console.error('❌ Bağlantı hatası:', r.error);
    console.error('\nSupabase Dashboard → Settings → Database → Database password doğru mu?');
    console.error('Şifreyi sıfırladıysanız yeni şifreyi kullanın.');
    process.exit(1);
  }

  console.log('✅ Veritabanı bağlantısı başarılı');
  console.log('   Zaman:', r.time, '| DB:', r.db);

  updateEnvFiles(root, urlToTest, password);

  console.log('\n✅ Kurulum tamamlandı. Sunucuyu başlatın:');
  console.log('   npm start');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
