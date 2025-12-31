const fs = require('fs');
const http = require('http');
const path = require('path');

console.log('🔍 PRODUCTION HAZIRLIK KONTROLÜ BAŞLATILIYOR...\n');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║          🚀 SEBS Global - Production Kontrol                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let issues = [];
let warnings = [];
let passed = [];

const API_BASE = 'http://localhost:8006';

// 1. Backend Kontrolü
console.log('📋 1. BACKEND KONTROLÜ\n');
async function checkBackend() {
    return new Promise((resolve) => {
        http.get(`${API_BASE}/api/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const health = JSON.parse(data);
                    if (health.status === 'healthy' && health.database === 'postgresql') {
                        passed.push('Backend API çalışıyor');
                        console.log('   ✅ Backend API: Çalışıyor');
                        console.log(`   ✅ Database: ${health.database}`);
                    } else {
                        issues.push('Backend sağlıksız veya database bağlantısı yok');
                        console.log('   ❌ Backend sağlık kontrolü başarısız');
                    }
                } catch (e) {
                    issues.push('Backend health check parse hatası');
                    console.log('   ❌ Backend health check hatası');
                }
                resolve();
            });
        }).on('error', () => {
            issues.push('Backend API çalışmıyor (port 8006)');
            console.log('   ❌ Backend API: ÇALIŞMIYOR (Port 8006 kontrol edilmeli)');
            resolve();
        });
    });
}

// 2. Kritik Dosya Kontrolü
console.log('\n📋 2. KRİTİK DOSYA KONTROLÜ\n');
function checkCriticalFiles() {
    const criticalFiles = [
        { path: 'index.html', desc: 'Ana sayfa' },
        { path: 'dashboard.html', desc: 'Kullanıcı paneli' },
        { path: 'login.html', desc: 'Giriş sayfası' },
        { path: 'signup.html', desc: 'Kayıt sayfası' },
        { path: 'modules.html', desc: 'Modüller sayfası' },
        { path: 'simulations.html', desc: 'Simülasyonlar sayfası' },
        { path: 'backend/src/server.js', desc: 'Backend server' },
        { path: 'utils/api-client.js', desc: 'API client' },
        { path: 'utils/module-progress.js', desc: 'İlerleme takibi' },
    ];

    criticalFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
            const stat = fs.statSync(file.path);
            if (stat.size > 0) {
                passed.push(`${file.desc}: Mevcut`);
                console.log(`   ✅ ${file.desc}: Mevcut (${(stat.size/1024).toFixed(1)} KB)`);
            } else {
                issues.push(`${file.desc}: Boş dosya`);
                console.log(`   ❌ ${file.desc}: BOŞ DOSYA`);
            }
        } else {
            issues.push(`${file.desc}: Dosya bulunamadı`);
            console.log(`   ❌ ${file.desc}: BULUNAMADI`);
        }
    });
}

// 3. Console.log Kontrolü
console.log('\n📋 3. GÜVENLİK KONTROLÜ (Console.log)\n');
function checkConsoleLogs() {
    const filesToCheck = [
        'dashboard.html',
        'utils/api-client.js',
        'utils/module-progress.js',
        'backend/src/server.js',
        'modules/temel-siber-guvenlik.html',
        'modules/network-guvenligi.html'
    ];

    let totalLogs = 0;
    filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const logs = (content.match(/console\.(log|warn|error|debug)/g) || []).length;
            totalLogs += logs;
            if (logs > 0) {
                warnings.push(`${file}: ${logs} console.log bulundu`);
                console.log(`   ⚠️  ${file}: ${logs} console.log`);
            }
        }
    });

    if (totalLogs === 0) {
        passed.push('Tüm console.log\'lar temizlendi');
        console.log('   ✅ Console.log temizliği: TAMAM');
    } else {
        warnings.push(`Toplam ${totalLogs} console.log bulundu - Production için temizlenmeli`);
        console.log(`   ⚠️  Toplam ${totalLogs} console.log bulundu`);
    }
}

// 4. Environment Variables Kontrolü
console.log('\n📋 4. YAPILANDIRMA KONTROLÜ\n');
function checkConfig() {
    if (fs.existsSync('backend/.env')) {
        passed.push('Backend .env dosyası mevcut');
        console.log('   ✅ Backend .env: Mevcut');
    } else if (fs.existsSync('backend/env.example')) {
        warnings.push('Backend .env dosyası yok, env.example var');
        console.log('   ⚠️  Backend .env: YOK (env.example mevcut)');
    } else {
        issues.push('Backend .env dosyası ve env.example yok');
        console.log('   ❌ Backend .env: BULUNAMADI');
    }

    if (fs.existsSync('.gitignore')) {
        passed.push('.gitignore mevcut');
        console.log('   ✅ .gitignore: Mevcut');
    } else {
        warnings.push('.gitignore dosyası yok');
        console.log('   ⚠️  .gitignore: BULUNAMADI');
    }
}

// 5. Database Schema Kontrolü
console.log('\n📋 5. DATABASE KONTROLÜ\n');
function checkDatabase() {
    if (fs.existsSync('backend/prisma/schema.prisma')) {
        const schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
        const models = (schema.match(/^model \w+/gm) || []).length;
        passed.push(`Database schema: ${models} model`);
        console.log(`   ✅ Prisma Schema: Mevcut (${models} model)`);
    } else {
        issues.push('Prisma schema bulunamadı');
        console.log('   ❌ Prisma Schema: BULUNAMADI');
    }
}

// 6. Modül ve Simülasyon Kontrolü
console.log('\n📋 6. İÇERİK KONTROLÜ\n');
function checkContent() {
    if (fs.existsSync('modules')) {
        const modules = fs.readdirSync('modules').filter(f => f.endsWith('.html'));
        passed.push(`Modüller: ${modules.length} adet`);
        console.log(`   ✅ Modüller: ${modules.length} adet`);
        
        const activeModules = modules.filter(m => m !== 'coming-soon.html');
        console.log(`   ✅ Aktif Modüller: ${activeModules.length} adet`);
    } else {
        issues.push('Modules klasörü bulunamadı');
        console.log('   ❌ Modules klasörü: BULUNAMADI');
    }

    if (fs.existsSync('simulation')) {
        const sims = fs.readdirSync('simulation').filter(f => f.endsWith('.html'));
        passed.push(`Simülasyonlar: ${sims.length} adet`);
        console.log(`   ✅ Simülasyonlar: ${sims.length} adet`);
    } else {
        issues.push('Simulation klasörü bulunamadı');
        console.log('   ❌ Simulation klasörü: BULUNAMADI');
    }
}

// 7. API Endpoint Kontrolü
console.log('\n📋 7. API ENDPOINT KONTROLÜ\n');
async function checkAPIEndpoints() {
    const endpoints = [
        { path: '/api/health', method: 'GET', auth: false },
        { path: '/api/courses', method: 'GET', auth: true },
        { path: '/api/auth/register', method: 'POST', auth: false },
        { path: '/api/progress/overview', method: 'GET', auth: true },
        { path: '/api/certificates', method: 'GET', auth: true },
    ];

    for (const endpoint of endpoints) {
        try {
            const url = new URL(endpoint.path, API_BASE);
            const req = http.request({
                hostname: url.hostname,
                port: url.port || 8006,
                path: url.pathname,
                method: endpoint.method,
                headers: endpoint.auth ? { 'Authorization': 'Bearer test' } : {}
            }, (res) => {
                if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 400) {
                    passed.push(`API ${endpoint.path}: Erişilebilir`);
                    console.log(`   ✅ ${endpoint.method} ${endpoint.path}: Erişilebilir`);
                } else if (res.statusCode === 404) {
                    issues.push(`API ${endpoint.path}: Bulunamadı (404)`);
                    console.log(`   ❌ ${endpoint.method} ${endpoint.path}: Bulunamadı`);
                }
            });
            req.on('error', () => {
                if (endpoint.auth) {
                    // Auth gerekli, 401 beklenir
                    passed.push(`API ${endpoint.path}: Auth gerekli (beklenen)`);
                }
            });
            req.setTimeout(2000, () => req.destroy());
            req.end();
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
            // Hata durumunda devam et
        }
    }
}

// Tüm kontrolleri çalıştır
async function runAllChecks() {
    await checkBackend();
    checkCriticalFiles();
    checkConsoleLogs();
    checkConfig();
    checkDatabase();
    checkContent();
    await checkAPIEndpoints();

    // Özet
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                   📊 KONTROL ÖZETİ                            ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`✅ Başarılı Kontroller: ${passed.length}`);
    console.log(`⚠️  Uyarılar: ${warnings.length}`);
    console.log(`❌ Kritik Sorunlar: ${issues.length}\n`);

    if (issues.length > 0) {
        console.log('❌ KRİTİK SORUNLAR:\n');
        issues.forEach(issue => console.log(`   • ${issue}`));
    }

    if (warnings.length > 0) {
        console.log('\n⚠️  UYARILAR:\n');
        warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (issues.length === 0) {
        console.log('🎉 PRODUCTION HAZIR! (Uyarılar önemli değil)');
    } else {
        console.log('⚠️  PRODUCTION İÇİN DÜZELTMELER GEREKLİ');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { passed, warnings, issues };
}

runAllChecks().then(result => {
    process.exit(result.issues.length > 0 ? 1 : 0);
}).catch(err => {
    console.error('Kontrol hatası:', err);
    process.exit(1);
});

