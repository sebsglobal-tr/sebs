#!/usr/bin/env node
/**
 * Supabase PostgreSQL yedek (pg_dump).
 * DIRECT_URL: session pooler :5432 (db.PROJECT.supabase.co IPv6/DNS sorunlu olabilir).
 *
 * Kullanım:
 *   npm run db:backup
 *   node scripts/db-backup.js [çıktı-dosyası.sql]
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

function resolveDirectUrl() {
  let url = (process.env.DIRECT_URL || '').trim().replace(/^"|"$/g, '');
  if (url && !url.includes('db.') && url.includes('pooler')) {
    return url;
  }
  const ref = (process.env.SUPABASE_PROJECT_REF || '').trim();
  const pooler = process.env.SUPABASE_POOLER || 'aws-1-eu-central-1.pooler.supabase.com';
  let pass = (process.env.DB_PASSWORD || '').replace(/^"|"$/g, '');
  if (!pass && process.env.DATABASE_URL) {
    const m = process.env.DATABASE_URL.match(/postgresql:\/\/[^:]+:([^@]+)@/);
    if (m) pass = decodeURIComponent(m[1]);
  }
  if (ref && pass) {
    return `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@${pooler}:5432/postgres`;
  }
  return url;
}

function pgDumpVersion(bin) {
  const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
  const line = (r.stdout || r.stderr || '').trim();
  const m = line.match(/(\d+)\./);
  return m ? parseInt(m[1], 10) : 0;
}

function main() {
  const directUrl = resolveDirectUrl();
  if (!directUrl) {
    console.error('❌ DIRECT_URL veya SUPABASE_PROJECT_REF + DB_PASSWORD gerekli.');
    process.exit(1);
  }
  if (directUrl.includes('db.') && directUrl.includes('.supabase.co')) {
    console.warn('⚠️  DIRECT_URL db.* host kullanıyor; DNS/IPv6 sorunlarında yedek başarısız olur.');
    console.warn('   npm run db:setup ile session pooler (:5432) DIRECT_URL ayarlayın.\n');
  }

  const outDir = path.resolve(__dirname, '../backups');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(outDir, `sebs-${stamp}.sql`);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const pgDump = process.env.PG_DUMP || 'pg_dump';
  const ver = pgDumpVersion(pgDump);
  if (ver > 0 && ver < 17) {
    console.error(`❌ pg_dump sürümü ${ver} (sunucu PostgreSQL 17). Yedek alınamaz.`);
    console.error('   macOS: brew install postgresql@17');
    console.error('   veya: PG_DUMP=/opt/homebrew/opt/postgresql@17/bin/pg_dump npm run db:backup');
    console.error('   Alternatif: Supabase Dashboard → Database → Backups\n');
    process.exit(1);
  }

  console.log('📦 Yedek alınıyor...');
  console.log('   Hedef:', outFile);

  const r = spawnSync(pgDump, [
    directUrl,
    '--no-owner',
    '--no-acl',
    '-f', outFile
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  if (r.status !== 0) {
    console.error('❌ pg_dump hatası:', (r.stderr || r.stdout || '').trim());
    process.exit(r.status || 1);
  }

  const stat = fs.statSync(outFile);
  console.log('✅ Yedek tamamlandı');
  console.log('   Boyut:', (stat.size / 1024).toFixed(1), 'KB');
  console.log('   Dosya:', outFile);
}

main();
