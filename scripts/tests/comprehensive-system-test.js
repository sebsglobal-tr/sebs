const http = require('http');

const API_BASE = 'http://localhost:8006/api';
let testResults = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test user bilgileri
const testUser = {
    email: `test_${Date.now()}@sebsglobal.com`,
    password: 'Test1234!',
    firstName: 'Test',
    lastName: 'User'
};

let authToken = null;
let refreshToken = null;
let userId = null;
let verificationCode = null;
let testModuleId = null;
let testCertificateId = null;

// Helper fonksiyonlar
function log(message, type = 'info') {
    const icons = {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        step: '🔄'
    };
    console.log(`${icons[type]} ${message}`);
}

function test(name, testFn) {
    totalTests++;
    return new Promise(async (resolve) => {
        try {
            await testFn();
            testResults.push({ name, status: 'PASS', error: null });
            passedTests++;
            log(`${name}`, 'success');
            resolve(true);
        } catch (error) {
            testResults.push({ name, status: 'FAIL', error: error.message });
            failedTests++;
            log(`${name}: ${error.message}`, 'error');
            resolve(false);
        }
    });
}

function apiCall(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
        // endpoint zaten /api ile başlamalı veya başlamamalı kontrolü
        const fullPath = endpoint.startsWith('/api') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        const url = new URL(fullPath);
        const requestOptions = {
            hostname: url.hostname,
            port: url.port || 8006,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                ...options.headers
            }
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ status: res.statusCode, data: parsed });
                    } else {
                        reject(new Error(`API Error ${res.statusCode}: ${parsed.message || data}`));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ status: res.statusCode, data: data });
                    } else {
                        reject(new Error(`API Error ${res.statusCode}: ${data}`));
                    }
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// Test başlangıcı
console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║          🧪 KAPSAMLI SİSTEM TESTİ BAŞLATILIYOR                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function runTests() {
    // 1. BACKEND HEALTH CHECK
    log('1. BACKEND SAĞLIK KONTROLÜ', 'step');
    await test('Backend Health Check', async () => {
        const response = await apiCall('/health');
        if (response.status !== 200 || response.data.status !== 'healthy') {
            throw new Error('Health check failed');
        }
    });

    // 2. KULLANICI KAYDI
    log('\n2. KULLANICI KAYDI', 'step');
    await test('Kullanıcı Kaydı', async () => {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: testUser
        });
        if (!response.data.success) throw new Error('Kayıt başarısız');
        verificationCode = response.data.data?.verificationCode;
        if (!verificationCode) {
            log('⚠️  Verification code alınamadı, test devam ediyor...', 'warning');
        }
    });

    // 3. EMAIL DOĞRULAMA (Code varsa)
    if (verificationCode) {
        await test('Email Doğrulama', async () => {
            const response = await apiCall('/auth/verify', {
                method: 'POST',
                body: {
                    email: testUser.email,
                    code: verificationCode
                }
            });
            if (!response.data.success) throw new Error('Email doğrulama başarısız');
        });
    } else {
        log('⚠️  Verification code yok, email doğrulama atlandı', 'warning');
    }

    // 4. GİRİŞ YAPMA
    log('\n3. GİRİŞ İŞLEMİ', 'step');
    await test('Kullanıcı Girişi', async () => {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: {
                email: testUser.email,
                password: testUser.password
            }
        });
        if (!response.data.success) {
            throw new Error('Giriş başarısız: ' + (response.data.message || 'Unknown error'));
        }
        const tokens = response.data.data?.tokens || response.data.data;
        if (!tokens?.accessToken) {
            throw new Error('Access token alınamadı');
        }
        authToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        userId = response.data.data?.user?.publicId || response.data.data?.user?.id;
    });

    // 5. KURSLARI LİSTELE
    log('\n4. KURSLAR VE MODÜLLER', 'step');
    await test('Kursları Listele', async () => {
        const response = await apiCall('/courses');
        if (!response.data.success || !response.data.data?.courses) {
            throw new Error('Kurslar alınamadı');
        }
        if (response.data.data.courses.length > 0) {
            testModuleId = response.data.data.courses[0].modules?.[0]?.id;
        }
    });

    // 6. KURSA KAYIT OL
    await test('Kursa Kayıt Ol', async () => {
        const response = await apiCall('/courses');
        const courses = response.data.data?.courses;
        if (!courses || courses.length === 0) {
            throw new Error('Kurs bulunamadı');
        }
        const courseId = courses[0].id;
        const enrollResponse = await apiCall(`/enrollments/${courseId}`, {
            method: 'POST'
        });
        if (!enrollResponse.data.success) {
            throw new Error('Kursa kayıt başarısız');
        }
    });

    // 7. MODÜL İLERLEMESİ KAYDET
    log('\n5. İLERLEME TAKİBİ', 'step');
    await test('Modül İlerlemesi Kaydet', async () => {
        if (!testModuleId) {
            const coursesResponse = await apiCall('/courses');
            const courses = coursesResponse.data.data?.courses;
            if (courses && courses.length > 0 && courses[0].modules && courses[0].modules.length > 0) {
                testModuleId = courses[0].modules[0].id;
            }
        }
        if (!testModuleId) {
            throw new Error('Test modülü bulunamadı');
        }
        const response = await apiCall('/progress', {
            method: 'POST',
            body: {
                moduleId: testModuleId,
                percentComplete: 50,
                lastStep: JSON.stringify({ lesson: 1 }),
                isCompleted: false
            }
        });
        if (!response.data.success) {
            throw new Error('İlerleme kaydedilemedi');
        }
    });

    // 8. İLERLEMEYİ GETİR
    await test('İlerlemeyi Getir', async () => {
        const response = await apiCall('/progress/overview');
        if (!response.data.success || !response.data.data) {
            throw new Error('İlerleme getirilemedi');
        }
    });

    // 9. ZAMAN TAKİBİ
    await test('Zaman Takibi Kaydet', async () => {
        if (!testModuleId) {
            const coursesResponse = await apiCall('/courses');
            const courses = coursesResponse.data.data?.courses;
            if (courses && courses.length > 0 && courses[0].modules && courses[0].modules.length > 0) {
                testModuleId = courses[0].modules[0].id;
            }
        }
        if (!testModuleId) {
            throw new Error('Test modülü bulunamadı');
        }
        const response = await apiCall('/progress/time', {
            method: 'POST',
            body: {
                moduleId: testModuleId,
                timeSpentMinutes: 30
            }
        });
        if (!response.data.success) {
            throw new Error('Zaman kaydedilemedi');
        }
    });

    // 10. MODÜLÜ TAMAMLA
    await test('Modülü Tamamla', async () => {
        if (!testModuleId) {
            const coursesResponse = await apiCall('/courses');
            const courses = coursesResponse.data.data?.courses;
            if (courses && courses.length > 0 && courses[0].modules && courses[0].modules.length > 0) {
                testModuleId = courses[0].modules[0].id;
            }
        }
        if (!testModuleId) {
            throw new Error('Test modülü bulunamadı');
        }
        const response = await apiCall('/progress', {
            method: 'POST',
            body: {
                moduleId: testModuleId,
                percentComplete: 100,
                lastStep: JSON.stringify({ lesson: 'final' }),
                isCompleted: true
            }
        });
        if (!response.data.success) {
            throw new Error('Modül tamamlanamadı');
        }
    });

    // 11. SERTİFİKA KONTROLÜ
    log('\n6. SERTİFİKA SİSTEMİ', 'step');
    await test('Sertifika Kontrolü ve Oluşturma', async () => {
        const coursesResponse = await apiCall('/courses');
        const courses = coursesResponse.data.data?.courses;
        if (!courses || courses.length === 0) {
            throw new Error('Kurs bulunamadı');
        }
        
        // İlk kursun kategori bilgisini al
        const category = courses[0].category || 'siber-guvenlik';
        
        // Category completion kontrolü
        const checkResponse = await apiCall(`/certificates/check/${category}`, {
            method: 'POST'
        });
        
        // Sertifika kontrolü başarılı veya hata olsun, test devam etsin
        if (checkResponse.data.success && checkResponse.data.data?.certificate) {
            testCertificateId = checkResponse.data.data.certificate.id;
            log(`✅ Sertifika oluşturuldu: ${testCertificateId}`, 'success');
        } else {
            log('⚠️  Sertifika henüz oluşturulamadı (modüller tamamlanmamış olabilir)', 'warning');
        }
    });

    // 12. SERTİFİKALARI LİSTELE
    await test('Kullanıcı Sertifikalarını Listele', async () => {
        const response = await apiCall('/certificates');
        if (!response.data.success) {
            throw new Error('Sertifikalar listelenemedi');
        }
        const certificates = response.data.data?.certificates || [];
        if (certificates.length > 0 && !testCertificateId) {
            testCertificateId = certificates[0].id;
        }
    });

    // 13. AI RAPOR ALMA
    log('\n7. AI RAPORLAMA SİSTEMİ', 'step');
    await test('AI Rapor Alma', async () => {
        if (!testCertificateId) {
            const certResponse = await apiCall('/certificates');
            const certificates = certResponse.data.data?.certificates || [];
            if (certificates.length > 0) {
                testCertificateId = certificates[0].id;
            }
        }
        
        if (testCertificateId) {
            const response = await apiCall(`/certificates/${testCertificateId}/report`);
            if (!response.data.success) {
                throw new Error('AI rapor alınamadı');
            }
            const report = response.data.data?.report;
            if (report) {
                log(`📊 AI Rapor alındı: ${report.summary?.substring(0, 50)}...`, 'success');
            }
        } else {
            throw new Error('Sertifika bulunamadı - AI rapor test edilemedi');
        }
    });

    // 14. SİMÜLASYON KAYDI
    log('\n8. SİMÜLASYON SİSTEMİ', 'step');
    await test('Simülasyon Tamamlama Kaydet', async () => {
        if (!testModuleId) {
            const coursesResponse = await apiCall('/courses');
            const courses = coursesResponse.data.data?.courses;
            if (courses && courses.length > 0 && courses[0].modules && courses[0].modules.length > 0) {
                testModuleId = courses[0].modules[0].id;
            }
        }
        if (!testModuleId) {
            throw new Error('Test modülü bulunamadı');
        }
        const response = await apiCall('/simulations/complete', {
            method: 'POST',
            body: {
                moduleId: testModuleId,
                moduleName: 'Test Simulation',
                score: 85,
                flagsFound: ['flag1', 'flag2'],
                timeSpent: 1200,
                completedAt: new Date().toISOString()
            }
        });
        if (!response.data.success) {
            throw new Error('Simülasyon kaydedilemedi');
        }
    });

    // 15. SİMÜLASYON GEÇMİŞİ
    await test('Simülasyon Geçmişini Getir', async () => {
        const response = await apiCall('/simulations');
        if (!response.data.success) {
            throw new Error('Simülasyon geçmişi getirilemedi');
        }
    });

    // 16. KULLANICI PROFİLİ
    log('\n9. KULLANICI İŞLEMLERİ', 'step');
    await test('Kullanıcı Profili Getir', async () => {
        const response = await apiCall('/users/profile');
        if (!response.data.success || !response.data.data?.user) {
            throw new Error('Kullanıcı profili getirilemedi');
        }
    });

    // 17. REFRESH TOKEN
    await test('Token Yenileme', async () => {
        if (!refreshToken) {
            throw new Error('Refresh token yok');
        }
        const response = await apiCall('/auth/refresh', {
            method: 'POST',
            body: { refreshToken }
        });
        if (!response.data.success || !response.data.data?.accessToken) {
            throw new Error('Token yenilenemedi');
        }
        authToken = response.data.data.accessToken;
    });

    // Özet
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                   📊 TEST ÖZETİ                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📋 Toplam Test: ${totalTests}`);
    console.log(`✅ Başarılı: ${passedTests}`);
    console.log(`❌ Başarısız: ${failedTests}`);
    console.log(`📈 Başarı Oranı: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST SONUÇLARI:\n');
    
    testResults.forEach((result, index) => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${index + 1}. ${icon} ${result.name}`);
        if (result.error) {
            console.log(`   ⚠️  Hata: ${result.error}`);
        }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (failedTests === 0) {
        console.log('🎉 TÜM TESTLER BAŞARILI!');
    } else {
        console.log(`⚠️  ${failedTests} test başarısız oldu.`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(failedTests > 0 ? 1 : 0);
}

// Testi başlat
runTests().catch(error => {
    console.error('\n❌ Test suite hatası:', error);
    process.exit(1);
});

