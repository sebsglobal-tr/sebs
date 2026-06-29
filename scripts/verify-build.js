#!/usr/bin/env node
/**
 * Vercel yalnızca statik frontend dağıtır; kök install backend bağımlılıklarını kurmaz.
 * Build komutu `npm run build` kalırsa backend require burada kırılır. Vercel build'a VERCEL=1 verir.
 */
if (process.env.VERCEL === '1') {
  console.log('verify-build: Vercel — backend doğrulaması atlandı (statik dağıtım).');
  process.exit(0);
}

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { app } = require('../backend/server.js');

if (!app || typeof app.use !== 'function') {
    console.error('verify-build: Express app yüklenemedi');
    process.exit(1);
}

console.log('verify-build: OK');
process.exit(0);
