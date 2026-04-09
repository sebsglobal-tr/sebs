// ============================================
// API YAPILANDIRMASI
// ============================================
function getApiIntegrationBase() {
    if (typeof window !== 'undefined' && typeof window.getSebsApiBase === 'function') {
        return window.getSebsApiBase();
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin + '/api';
    }
    return 'http://localhost:8006/api';
}

// ============================================
// EĞİTİM PLATFORMU API YARDIMCI SINIFI
// ============================================
// Backend API ile iletişim kurmak için yardımcı metodlar sağlar
// Kimlik doğrulama, modül işlemleri, ilerleme takibi vb. işlemleri yönetir
class EducationAPI {
    constructor() {
        // localStorage'dan mevcut auth token'ı al
        this.token = localStorage.getItem('authToken');
    }

    // Kimlik doğrulama token'ını ayarla
    // Token'ı hem hafızada hem de localStorage'da saklar
    // token: JWT kimlik doğrulama token'ı
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Kimlik doğrulama token'ını temizle
    // Kullanıcı çıkış yaptığında veya token geçersiz olduğunda kullanılır
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // API isteği gönder
    // Backend'e HTTP isteği gönderir ve yanıtı döndürür
    // endpoint: API endpoint yolu (örn: '/auth/login')
    // options: Fetch API seçenekleri (method, body, headers vb.)
    async request(endpoint, options = {}) {
        const url = `${getApiIntegrationBase()}${endpoint}`; // Tam URL oluştur
        const config = {
            headers: {
                'Content-Type': 'application/json', // JSON formatında veri gönderileceğini belirt
                ...options.headers // Özel header'lar varsa ekle
            },
            ...options // Diğer fetch seçeneklerini ekle (method, body vb.)
        };

        // Token varsa Authorization header'ını ekle
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            // API isteğini gönder
            const response = await fetch(url, config);
            const data = await response.json(); // Yanıtı JSON formatına çevir

            // İstek başarısızsa hata fırlat
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data; // Başarılı yanıtı döndür
        } catch (error) {
            console.error('API Error:', error);
            throw error; // Hata varsa yukarı fırlat
        }
    }

    // ============================================
    // KİMLİK DOĞRULAMA METODLARI
    // ============================================
    // Kullanıcı kaydı
    // userData: Kayıt için gerekli kullanıcı bilgileri (email, password, firstName, lastName)
    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // E-posta doğrulama
    // email: Doğrulanacak e-posta adresi
    // verificationCode: E-posta ile gönderilen doğrulama kodu
    async verifyEmail(email, verificationCode) {
        return await this.request('/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ email, code: verificationCode })
        });
    }

    // Kullanıcı girişi
    // email: Kullanıcı e-posta adresi
    // password: Kullanıcı şifresi
    // Başarılı girişte token'ı otomatik olarak kaydeder
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Giriş başarılıysa ve token varsa token'ı kaydet
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    // Kullanıcı çıkışı
    // Token'ı ve tüm kullanıcı verilerini temizler
    async logout() {
        this.clearToken();
        // localStorage'daki tüm kullanıcı verilerini temizle
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isVerified');
        localStorage.removeItem('userData');
        localStorage.removeItem('userProgress');
        localStorage.removeItem('recentActivities');
        localStorage.removeItem('achievements');
    }

    // ============================================
    // İLERLEME TAKİP METODLARI
    // ============================================
    // Modül ilerlemesini getir
    // moduleId: İlerlemesi getirilecek modül ID'si
    async getModuleProgress(moduleId) {
        return await this.request(`/progress/module/${moduleId}`);
    }

    // Ders ilerlemesini güncelle
    // lessonId: İlerlemesi güncellenecek ders ID'si
    // progressData: İlerleme verileri (status, progressPercentage, lastPositionSeconds vb.)
    async updateLessonProgress(lessonId, progressData) {
        return await this.request(`/progress/lesson/${lessonId}`, {
            method: 'POST',
            body: JSON.stringify(progressData)
        });
    }

    // Genel ilerleme özetini getir
    // Dashboard için kullanılan genel istatistikleri döndürür
    async getProgressOverview() {
        return await this.request('/progress/overview');
    }

    // ============================================
    // MODÜL METODLARI
    // ============================================
    
    // Tüm modülleri getir
    async getModules() {
        return await this.request('/modules');
    }

    // Modül detaylarını getir
    // moduleId: Detayları getirilecek modül ID'si
    async getModuleDetails(moduleId) {
        return await this.request(`/modules/${moduleId}`);
    }

    // Sistem sağlık kontrolü
    // Backend API'nin çalışıp çalışmadığını kontrol eder
    async healthCheck() {
        return await this.request('/health');
    }
}

// ============================================
// GLOBAL API INSTANCE
// ============================================
// Tüm sayfalarda kullanılmak üzere global API örneği oluştur
window.educationAPI = new EducationAPI();

// ============================================
// İLERLEME TAKİP SINIFI
// ============================================
// Kullanıcının modül ve ders ilerlemesini takip eder
class ProgressTracker {
    constructor(api) {
        this.api = api; // API instance'ı
        this.currentModule = null; // Şu anda açık olan modül bilgisi
        this.currentLesson = null; // Şu anda açık olan ders bilgisi
    }

    // Mevcut modülü ayarla
    // moduleId: Modül ID'si
    // moduleName: Modül adı
    setCurrentModule(moduleId, moduleName) {
        this.currentModule = { id: moduleId, name: moduleName };
    }

    // Mevcut dersi ayarla
    // lessonId: Ders ID'si
    // lessonName: Ders adı
    setCurrentLesson(lessonId, lessonName) {
        this.currentLesson = { id: lessonId, name: lessonName };
    }

    // Ders ilerlemesini güncelle
    // status: İlerleme durumu ('in_progress', 'completed' vb.)
    // progressPercentage: Tamamlanma yüzdesi (0-100)
    // lastPositionSeconds: Video/ses için son izlenen pozisyon (saniye)
    // timeSpentSeconds: Harcanan toplam süre (saniye)
    async updateProgress(status, progressPercentage = 0, lastPositionSeconds = 0, timeSpentSeconds = 0) {
        // Mevcut ders ayarlanmamışsa hata ver
        if (!this.currentLesson) {
            console.error('No current lesson set');
            return;
        }

        try {
            // Backend'e ilerleme güncelleme isteği gönder
            const response = await this.api.updateLessonProgress(this.currentLesson.id, {
                status,
                progressPercentage,
                lastPositionSeconds,
                timeSpentSeconds
            });

            if (response.success) {
                console.log('Progress updated successfully:', response.data);
                
                // Yedek olarak localStorage'ı da güncelle (offline desteği için)
                this.updateLocalStorage(status, progressPercentage);
                
                return response.data;
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
            // Backend'e ulaşılamazsa localStorage'a kaydet (fallback)
            this.updateLocalStorage(status, progressPercentage);
        }
    }

    // localStorage'ı yedek olarak güncelle
    // Backend'e ulaşılamadığında veya offline durumda kullanılır
    // status: İlerleme durumu
    // progressPercentage: Tamamlanma yüzdesi
    updateLocalStorage(status, progressPercentage) {
        const userId = this.getCurrentUserId();
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        
        // Kullanıcı için ilerleme kaydı yoksa oluştur
        if (!userProgress[userId]) {
            userProgress[userId] = {};
        }

        // Modül için ilerleme kaydı yoksa oluştur
        if (!userProgress[userId][this.currentModule.name]) {
            userProgress[userId][this.currentModule.name] = {
                percentage: 0,
                completedSections: 0,
                totalSections: 0,
                status: 'not_started',
                completedLessons: [],
                lastUpdated: new Date().toISOString()
            };
        }

        const moduleProgress = userProgress[userId][this.currentModule.name];
        
        // Ders tamamlandıysa tamamlanan dersler listesine ekle
        if (status === 'completed') {
            if (!moduleProgress.completedLessons.includes(this.currentLesson.name)) {
                moduleProgress.completedLessons.push(this.currentLesson.name);
            }
        }

        // İlerleme bilgilerini güncelle
        moduleProgress.lastUpdated = new Date().toISOString();
        moduleProgress.status = status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor';
        
        // localStorage'a kaydet
        localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }

    // Mevcut kullanıcı ID'sini getir
    // localStorage'dan kullanıcı bilgilerini okuyarak ID döndürür
    getCurrentUserId() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.id || userData.email || 'guest'; // ID yoksa email, o da yoksa 'guest'
    }

    // Sunucudan ilerleme verilerini yükle
    // moduleId: İlerlemesi yüklenecek modül ID'si
    async loadProgress(moduleId) {
        try {
            const response = await this.api.getModuleProgress(moduleId);
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load progress from server:', error);
            // Sunucuya ulaşılamazsa localStorage'dan yükle (fallback)
            return this.loadProgressFromLocalStorage();
        }
    }

    // localStorage'dan ilerleme verilerini yükle (yedek)
    // Backend'e ulaşılamadığında kullanılır
    loadProgressFromLocalStorage() {
        const userId = this.getCurrentUserId();
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        return userProgress[userId] || {};
    }

    // Dersi tamamla
    // Dersin durumunu 'completed' ve yüzdesini 100 yapar
    async completeLesson() {
        return await this.updateProgress('completed', 100);
    }

    // Dersi başlat
    // Dersin durumunu 'in_progress' ve yüzdesini 0 yapar
    async startLesson() {
        return await this.updateProgress('in_progress', 0);
    }

    // Ders pozisyonunu güncelle (video/ses için)
    // positionSeconds: Video/ses içindeki pozisyon (saniye)
    // timeSpentSeconds: Harcanan toplam süre (saniye)
    async updatePosition(positionSeconds, timeSpentSeconds) {
        return await this.updateProgress('in_progress', 0, positionSeconds, timeSpentSeconds);
    }
}

// Global progress tracker örneği oluştur
window.progressTracker = new ProgressTracker(window.educationAPI);

// ============================================
// DASHBOARD VERİ YÜKLEYİCİ SINIFI
// ============================================
// Dashboard sayfası için gerekli verileri yükler
class DashboardLoader {
    constructor(api) {
        this.api = api; // API instance'ı
    }

    // Dashboard verilerini yükle
    // Backend'den genel ilerleme özetini getirir
    async loadDashboardData() {
        try {
            const response = await this.api.getProgressOverview();
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Backend'e ulaşılamazsa localStorage'dan yükle (fallback)
            return this.loadDashboardDataFromLocalStorage();
        }
    }

    // localStorage'dan dashboard verilerini yükle (yedek)
    // Backend'e ulaşılamadığında localStorage'daki verilerden istatistikleri hesaplar
    loadDashboardDataFromLocalStorage() {
        const userId = this.getCurrentUserId();
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        const userSpecificProgress = userProgress[userId] || {};

        // localStorage verilerinden istatistikleri hesapla
        const stats = {
            totalModules: Object.keys(userSpecificProgress).length, // Toplam modül sayısı
            completedModules: Object.values(userSpecificProgress).filter(p => p.status === 'Tamamlandı').length, // Tamamlanan modül sayısı
            inProgressModules: Object.values(userSpecificProgress).filter(p => p.status === 'Devam Ediyor').length, // Devam eden modül sayısı
            totalTimeSpent: Object.values(userSpecificProgress).reduce((total, p) => total + (p.time_spent || 0), 0), // Toplam harcanan süre (saniye)
            totalLessonsCompleted: Object.values(userSpecificProgress).reduce((total, p) => total + (p.completedLessons?.length || 0), 0) // Toplam tamamlanan ders sayısı
        };

        return {
            stats,
            modules: Object.entries(userSpecificProgress).map(([name, progress]) => ({
                title: name,
                progressPercentage: progress.percentage || 0,
                status: progress.status || 'not_started',
                completedLessons: progress.completedLessons?.length || 0,
                totalLessons: progress.totalSections || 0,
                timeSpentMinutes: Math.round((progress.time_spent || 0) / 60),
                updatedAt: progress.lastUpdated
            })),
            recentActivities: JSON.parse(localStorage.getItem('recentActivities') || '[]'),
            achievements: JSON.parse(localStorage.getItem('achievements') || '[]')
        };
    }

    // Mevcut kullanıcı ID'sini getir
    getCurrentUserId() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.id || userData.email || 'guest';
    }
}

// Global dashboard loader örneği oluştur
window.dashboardLoader = new DashboardLoader(window.educationAPI);

// ============================================
// MODÜL SAYFALARI İÇİN YARDIMCI FONKSİYONLAR
// ============================================
// Modül ilerlemesini başlat
// Modül sayfası açıldığında çağrılır
// moduleId: Modül ID'si
// moduleName: Modül adı
function initializeModuleProgress(moduleId, moduleName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentModule(moduleId, moduleName);
    }
}

// Ders ilerlemesini başlat
// Ders sayfası açıldığında çağrılır
// lessonId: Ders ID'si
// lessonName: Ders adı
function initializeLessonProgress(lessonId, lessonName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentLesson(lessonId, lessonName);
    }
}

// Dersi tamamla (geliştirilmiş fonksiyon)
// Ders tamamlandığında çağrılır ve ilerlemeyi günceller
// lessonId: Tamamlanan ders ID'si
// lessonName: Tamamlanan ders adı
async function completeLesson(lessonId, lessonName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentLesson(lessonId, lessonName);
        await window.progressTracker.completeLesson();
    }
}

// Dersi başlat (geliştirilmiş fonksiyon)
// Ders başlatıldığında çağrılır ve ilerlemeyi günceller
// lessonId: Başlatılan ders ID'si
// lessonName: Başlatılan ders adı
async function startLesson(lessonId, lessonName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentLesson(lessonId, lessonName);
        await window.progressTracker.startLesson();
    }
}

// Fonksiyonları global olarak kullanılabilir yap
// Tüm sayfalardan erişilebilmesi için window objesine ekle
window.initializeModuleProgress = initializeModuleProgress;
window.initializeLessonProgress = initializeLessonProgress;
window.completeLesson = completeLesson;
window.startLesson = startLesson;
