#!/usr/bin/env node
/**
 * Production build doğrulama — sunucu modülü yüklenebilmeli (listen başlamaz).
 */
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { app } = require('../server.js');

if (!app || typeof app.use !== 'function') {
    console.error('verify-build: Express app yüklenemedi');
    process.exit(1);
}

console.log('verify-build: OK');
process.exit(0);
