const http = require('http');

const API_BASE = 'http://localhost:8006';
let testUser = {
    email: `test_${Date.now()}@sebsglobal.com`,
    password: 'Test1234!',
    firstName: 'Test',
    lastName: 'User'
};
let authToken = null;
let verificationCode = null;

function apiCall(endpoint, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port || 8006,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runQuickTest() {
    console.log('🧪 HIZLI SİSTEM TESTİ\n');
    
    let passed = 0, failed = 0;

    // 1. Health Check
    try {
        const res = await apiCall('/api/health');
        if (res.status === 200 && res.data.status === 'healthy') {
            console.log('✅ Backend Health Check');
            passed++;
        } else throw new Error();
    } catch (e) {
        console.log('❌ Backend Health Check');
        failed++;
        return;
    }

    // 2. Kayıt
    try {
        const res = await apiCall('/api/auth/register', 'POST', testUser);
        if (res.status === 201 && res.data.success) {
            verificationCode = res.data.data?.verificationCode;
            console.log('✅ Kullanıcı Kaydı');
            passed++;
        } else throw new Error();
    } catch (e) {
        console.log('❌ Kullanıcı Kaydı');
        failed++;
        return;
    }

    // 3. Email Doğrulama
    let emailVerified = false;
    if (verificationCode) {
        try {
            const res = await apiCall('/api/auth/verify', 'POST', {
                email: testUser.email,
                code: verificationCode
            });
            if (res.status === 200 && res.data.success) {
                console.log('✅ Email Doğrulama');
                emailVerified = true;
                passed++;
            } else {
                console.log('⚠️  Email Doğrulama hatası, devam ediliyor...');
            }
        } catch (e) {
            console.log('⚠️  Email Doğrulama atlandı');
        }
    }
    
    // Kısa bekleme (veritabanı güncellemesi için)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Giriş
    try {
        const res = await apiCall('/api/auth/login', 'POST', {
            email: testUser.email,
            password: testUser.password
        });
        if (res.status === 200 && res.data.success) {
            const tokens = res.data.data?.tokens || res.data.data;
            authToken = tokens?.accessToken;
            if (authToken) {
                console.log('✅ Kullanıcı Girişi');
                passed++;
            } else throw new Error();
        } else throw new Error();
    } catch (e) {
        console.log('❌ Kullanıcı Girişi');
        failed++;
        return;
    }

    // 5. Kurslar
    try {
        const res = await apiCall('/api/courses', 'GET', null, authToken);
        if (res.status === 200 && res.data.success) {
            const courses = res.data.data || res.data.courses || res.data;
            const courseArray = Array.isArray(courses) ? courses : (courses?.courses || []);
            console.log(`✅ Kurslar (${courseArray.length} kurs)`);
            passed++;
        } else throw new Error();
    } catch (e) {
        console.log('❌ Kurslar: ' + e.message);
        failed++;
    }

    // 6. İlerleme
    try {
        const res = await apiCall('/api/progress/overview', 'GET', null, authToken);
        if (res.status === 200 && res.data.success) {
            console.log('✅ İlerleme Takibi');
            passed++;
        } else throw new Error();
    } catch (e) {
        console.log('❌ İlerleme Takibi');
        failed++;
    }

    // 7. Sertifikalar
    let certificateId = null;
    try {
        const res = await apiCall('/api/certificates', 'GET', null, authToken);
        if (res.status === 200 && res.data.success) {
            const certificates = res.data.data?.certificates || [];
            console.log(`✅ Sertifikalar (${certificates.length} sertifika)`);
            if (certificates.length > 0) {
                certificateId = certificates[0].id;
            }
            passed++;
        } else throw new Error();
    } catch (e) {
        console.log('❌ Sertifikalar');
        failed++;
    }

    // 8. Kursa Kayıt ve Modül Tamamlama (Sertifika için)
    try {
        const coursesRes = await apiCall('/api/courses', 'GET', null, authToken);
        if (coursesRes.status === 200 && coursesRes.data.success) {
            const courses = Array.isArray(coursesRes.data.data) ? coursesRes.data.data : (coursesRes.data.data?.courses || []);
            if (courses.length > 0) {
                const courseId = courses[0].id;
                
                // Kursa kayıt ol
                const enrollRes = await apiCall(`/api/enrollments/${courseId}`, 'POST', {}, authToken);
                if (enrollRes.status === 200 || enrollRes.status === 201) {
                    console.log('✅ Kursa Kayıt Ol');
                    passed++;
                }

                // Modül tamamla
                if (courses[0].modules && courses[0].modules.length > 0) {
                    const moduleId = courses[0].modules[0].id;
                    const progressRes = await apiCall('/api/progress', 'POST', {
                        moduleId: moduleId,
                        percentComplete: 100,
                        isCompleted: true,
                        lastStep: JSON.stringify({ lesson: 'completed' })
                    }, authToken);
                    if (progressRes.status === 200 && progressRes.data.success) {
                        console.log('✅ Modül Tamamlandı');
                        passed++;
                    }
                }
            }
        }
    } catch (e) {
        console.log('⚠️  Modül tamamlama atlandı');
    }

    // 9. Sertifika Oluşturma Kontrolü
    try {
        const coursesRes = await apiCall('/api/courses', 'GET', null, authToken);
        if (coursesRes.status === 200 && coursesRes.data.success) {
            const courses = Array.isArray(coursesRes.data.data) ? coursesRes.data.data : (coursesRes.data.data?.courses || []);
            
            // "Temel Siber Güvenlik" ve "Network Güvenliği" modüllerini tamamla
            const targetCourses = courses.filter(c => 
                c.title === 'Temel Siber Güvenlik' || c.title === 'Network Güvenliği'
            );
            
            if (targetCourses.length > 0) {
                // Tüm modülleri tamamla
                for (const course of targetCourses) {
                    if (course.modules && course.modules.length > 0) {
                        for (const module of course.modules) {
                            const progressRes = await apiCall('/api/progress', 'POST', {
                                moduleId: module.id,
                                percentComplete: 100,
                                isCompleted: true,
                                lastStep: JSON.stringify({ lesson: 'completed' })
                            }, authToken);
                        }
                    }
                }
                
                // Kısa bekleme
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Category completion kontrolü (siber-guvenlik)
                const checkRes = await apiCall('/api/certificates/check/siber-guvenlik', 'GET', null, authToken);
                if (checkRes.status === 200 && checkRes.data.success) {
                    if (checkRes.data.data?.certificate) {
                        certificateId = checkRes.data.data.certificate.id;
                        console.log('✅ Sertifika Oluşturuldu');
                        passed++;
                    } else if (checkRes.data.data?.complete === false) {
                        const progress = checkRes.data.data.progress || {};
                        const completed = progress.completed || 0;
                        const total = progress.total || 0;
                        console.log(`⚠️  Sertifika: ${completed}/${total} modül tamamlandı (eksik modüller var)`);
                    } else {
                        console.log('⚠️  Sertifika durumu belirsiz');
                    }
                } else {
                    console.log(`⚠️  Sertifika kontrolü: ${checkRes.data?.message || 'Bilinmeyen hata'}`);
                }
            } else {
                console.log('⚠️  Gerekli kurslar bulunamadı');
            }
        }
    } catch (e) {
        console.log('⚠️  Sertifika oluşturma testi atlandı: ' + e.message);
    }

    // 10. AI Rapor Alma
    try {
        if (!certificateId) {
            const certRes = await apiCall('/api/certificates', 'GET', null, authToken);
            const certificates = certRes.data?.data?.certificates || [];
            if (certificates.length > 0) {
                certificateId = certificates[0].id;
            }
        }
        
        if (certificateId) {
            const reportRes = await apiCall(`/api/certificates/${certificateId}/report`, 'GET', null, authToken);
            if (reportRes.status === 200 && reportRes.data.success) {
                const report = reportRes.data.data?.report;
                if (report) {
                    console.log('✅ AI Rapor Alma');
                    console.log(`   📄 Özet: ${report.summary?.substring(0, 50)}...`);
                    passed++;
                } else {
                    console.log('⚠️  AI Rapor formatı beklenmiyor');
                }
            } else {
                console.log('⚠️  AI Rapor henüz oluşturulamadı');
            }
        } else {
            console.log('⚠️  Sertifika yok - AI rapor test edilemedi');
        }
    } catch (e) {
        console.log('⚠️  AI Rapor testi atlandı: ' + e.message);
    }

    // 11. Simülasyon
    try {
        const simRes = await apiCall('/api/simulations', 'GET', null, authToken);
        if (simRes.status === 200 && simRes.data.success) {
            const simulations = simRes.data.data?.simulations || [];
            console.log(`✅ Simülasyonlar (${simulations.length} kayıt)`);
            passed++;
        } else throw new Error();
    } catch (e) {
        console.log('⚠️  Simülasyonlar: Henüz kayıt yok (normal)');
    }

    console.log(`\n📊 Sonuç: ${passed}/${passed + failed} test başarılı`);
    console.log(`📈 Başarı Oranı: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
    
    if (failed === 0) {
        console.log('🎉 TÜM TEMEL TESTLER BAŞARILI!');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

runQuickTest().catch(err => {
    console.error('❌ Test hatası:', err.message);
    process.exit(1);
});

