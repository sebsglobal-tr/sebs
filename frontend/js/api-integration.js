function getApiIntegrationBase() {
    if (typeof window !== 'undefined' && typeof window.getSebsApiBase === 'function') {
        return window.getSebsApiBase();
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin + '/api';
    }
    return 'http://localhost:8006/api';
}

class EducationAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${getApiIntegrationBase()}${endpoint}`; // Tam URL oluştur
        const config = {
            headers: {
                'Content-Type': 'application/json', // JSON formatında veri gönderileceğini belirt
                ...options.headers // Özel header'lar varsa ekle
            },
            ...options // Diğer fetch seçeneklerini ekle (method, body vb.)
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json(); // Yanıtı JSON formatına çevir

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data; // Başarılı yanıtı döndür
        } catch (error) {
            console.error('API Error:', error);
            throw error; // Hata varsa yukarı fırlat
        }
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyEmail(email, verificationCode) {
        return await this.request('/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ email, code: verificationCode })
        });
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async logout() {
        this.clearToken();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isVerified');
        localStorage.removeItem('userData');
        localStorage.removeItem('userProgress');
        localStorage.removeItem('recentActivities');
        localStorage.removeItem('achievements');
    }

    async getModuleProgress(moduleId) {
        return await this.request(`/progress/module/${moduleId}`);
    }

    async updateLessonProgress(lessonId, progressData) {
        return await this.request(`/progress/lesson/${lessonId}`, {
            method: 'POST',
            body: JSON.stringify(progressData)
        });
    }

    async getProgressOverview() {
        return await this.request('/progress/overview');
    }

    
    async getModules() {
        return await this.request('/modules');
    }

    async getModuleDetails(moduleId) {
        return await this.request(`/modules/${moduleId}`);
    }

    async healthCheck() {
        return await this.request('/health');
    }
}

window.educationAPI = new EducationAPI();

class ProgressTracker {
    constructor(api) {
        this.api = api; // API instance'ı
        this.currentModule = null; // Şu anda açık olan modül bilgisi
        this.currentLesson = null; // Şu anda açık olan ders bilgisi
    }

    setCurrentModule(moduleId, moduleName) {
        this.currentModule = { id: moduleId, name: moduleName };
    }

    setCurrentLesson(lessonId, lessonName) {
        this.currentLesson = { id: lessonId, name: lessonName };
    }

    async updateProgress(status, progressPercentage = 0, lastPositionSeconds = 0, timeSpentSeconds = 0) {
        if (!this.currentLesson) {
            console.error('No current lesson set');
            return;
        }

        try {
            const response = await this.api.updateLessonProgress(this.currentLesson.id, {
                status,
                progressPercentage,
                lastPositionSeconds,
                timeSpentSeconds
            });

            if (response.success) {
                console.log('Progress updated successfully:', response.data);
                
                this.updateLocalStorage(status, progressPercentage);
                
                return response.data;
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
            this.updateLocalStorage(status, progressPercentage);
        }
    }

    updateLocalStorage(status, progressPercentage) {
        const userId = this.getCurrentUserId();
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        
        if (!userProgress[userId]) {
            userProgress[userId] = {};
        }

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
        
        if (status === 'completed') {
            if (!moduleProgress.completedLessons.includes(this.currentLesson.name)) {
                moduleProgress.completedLessons.push(this.currentLesson.name);
            }
        }

        moduleProgress.lastUpdated = new Date().toISOString();
        moduleProgress.status = status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor';
        
        localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }

    getCurrentUserId() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.id || userData.email || 'guest'; // ID yoksa email, o da yoksa 'guest'
    }

    async loadProgress(moduleId) {
        try {
            const response = await this.api.getModuleProgress(moduleId);
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load progress from server:', error);
            return this.loadProgressFromLocalStorage();
        }
    }

    loadProgressFromLocalStorage() {
        const userId = this.getCurrentUserId();
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        return userProgress[userId] || {};
    }

    async completeLesson() {
        return await this.updateProgress('completed', 100);
    }

    async startLesson() {
        return await this.updateProgress('in_progress', 0);
    }

    async updatePosition(positionSeconds, timeSpentSeconds) {
        return await this.updateProgress('in_progress', 0, positionSeconds, timeSpentSeconds);
    }
}

window.progressTracker = new ProgressTracker(window.educationAPI);

class DashboardLoader {
    constructor(api) {
        this.api = api; // API instance'ı
    }

    async loadDashboardData() {
        try {
            const response = await this.api.getProgressOverview();
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            return this.loadDashboardDataFromLocalStorage();
        }
    }

    loadDashboardDataFromLocalStorage() {
        const userId = this.getCurrentUserId();
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        const userSpecificProgress = userProgress[userId] || {};

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

    getCurrentUserId() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.id || userData.email || 'guest';
    }
}

window.dashboardLoader = new DashboardLoader(window.educationAPI);

function initializeModuleProgress(moduleId, moduleName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentModule(moduleId, moduleName);
    }
}

function initializeLessonProgress(lessonId, lessonName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentLesson(lessonId, lessonName);
    }
}

async function completeLesson(lessonId, lessonName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentLesson(lessonId, lessonName);
        await window.progressTracker.completeLesson();
    }
}

async function startLesson(lessonId, lessonName) {
    if (window.progressTracker) {
        window.progressTracker.setCurrentLesson(lessonId, lessonName);
        await window.progressTracker.startLesson();
    }
}

window.initializeModuleProgress = initializeModuleProgress;
window.initializeLessonProgress = initializeLessonProgress;
window.completeLesson = completeLesson;
window.startLesson = startLesson;
