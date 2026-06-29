/* ============================================================
 * SEBS Global — API Integration & Retry/Loading System
 * ============================================================
 * - EducationAPI:   fetch tabanlı, retry + timeout + loading
 * - LoadingState:   global loading yöneticisi (UI indicator)
 * - ProgressTracker: ders ilerleme takibi (server + localStorage)
 * - DashboardLoader: panel verilerini yükleme
 * ============================================================ */

(function (global) {
    'use strict';

    /* --------------------------------------------------------
     * API Base URL helper
     * -------------------------------------------------------- */
    function getApiIntegrationBase() {
        if (typeof global.getSebsApiBase === 'function') {
            return global.getSebsApiBase();
        }
        if (global.location && global.location.origin) {
            return global.location.origin + '/api';
        }
        return 'http://localhost:8006/api';
    }

    /* --------------------------------------------------------
     * Loading State Manager (UI indicator + function tracking)
     * -------------------------------------------------------- */
    var LoadingState = {
        _active: {},
        _count: 0,
        _indicatorEl: null,

        /** @returns {boolean} Herhangi bir yükleme var mı? */
        isLoading: function () {
            return this._count > 0;
        },

        /** Belirtilen key için yükleme başlat */
        start: function (key) {
            if (!this._active[key]) {
                this._active[key] = 0;
            }
            this._active[key]++;
            this._count++;
            this._render();
        },

        /** Belirtilen key için yükleme bitir */
        end: function (key) {
            if (this._active[key]) {
                this._active[key]--;
                if (this._active[key] <= 0) {
                    delete this._active[key];
                }
                this._count = Math.max(0, this._count - 1);
            }
            this._render();
        },

        /** Tüm yüklemeleri sıfırla (hata durumunda) */
        reset: function () {
            this._active = {};
            this._count = 0;
            this._render();
        },

        /** Loading indicator DOM element'ini oluştur/göster/gizle */
        _render: function () {
            try {
                if (!this._indicatorEl) {
                    this._indicatorEl = document.getElementById('sebs-global-loader');
                }
                if (!this._indicatorEl) {
                    this._indicatorEl = document.createElement('div');
                    this._indicatorEl.id = 'sebs-global-loader';
                    this._indicatorEl.setAttribute('role', 'status');
                    this._indicatorEl.setAttribute('aria-live', 'polite');
                    this._indicatorEl.style.cssText =
                        'position:fixed;top:0;left:0;width:100%;height:3px;z-index:99999;' +
                        'background:rgba(99,102,241,0.15);pointer-events:none;transition:opacity .3s';
                    this._indicatorEl.innerHTML =
                        '<div style="height:100%;width:0;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);' +
                        'border-radius:0 2px 2px 0;transition:width .4s ease"></div>';
                    document.body.appendChild(this._indicatorEl);
                }
                var bar = this._indicatorEl.firstChild;
                if (this._count > 0) {
                    this._indicatorEl.style.opacity = '1';
                    bar.style.width = Math.min(30 + this._count * 15, 85) + '%';
                } else {
                    bar.style.width = '100%';
                    var self = this;
                    var timerKey = '_hideTimer_' + Date.now();
                    self._lastHideTimer = timerKey;
                    setTimeout(function () {
                        if (self._lastHideTimer !== timerKey) return;
                        if (!self.isLoading()) {
                            self._indicatorEl.style.opacity = '0';
                            bar.style.width = '0';
                        }
                    }, 300);
                }
            } catch (e) {
                /* DOM henüz hazır değil — sessizce geç */
            }
        }
    };

    /* --------------------------------------------------------
     * Retry Fetch — exponential backoff + timeout
     * -------------------------------------------------------- */
    var MAX_RETRIES = 3;
    var BASE_DELAY_MS = 1000;
    var REQUEST_TIMEOUT_MS = 15000;
    var RETRYABLE_STATUSES = [0, 408, 429, 500, 502, 503, 504];

    /**
     * Fetch işlemini belirtilen sayıda dener.
     * @param {string} url
     * @param {object} options - fetch config
     * @param {object} [retryOpts]
     * @param {number} [retryOpts.maxRetries=3]
     * @param {number} [retryOpts.timeout=15000]
     * @param {function} [retryOpts.onRetry] - her yeniden denemede çağrılır (attempt, error, delayMs)
     * @returns {Promise<Response>}
     */
    function retryFetch(url, options, retryOpts) {
        var maxRetries = (retryOpts && retryOpts.maxRetries) || MAX_RETRIES;
        var timeoutMs = (retryOpts && retryOpts.timeout) || REQUEST_TIMEOUT_MS;
        var onRetry = (retryOpts && retryOpts.onRetry) || null;
        var lastError = null;

        function attempt(remaining) {
            return new Promise(function (resolve, reject) {
                // AbortController ile timeout
                var controller = null;
                var timeoutId = null;
                if (typeof AbortController !== 'undefined') {
                    controller = new AbortController();
                    options.signal = controller.signal;
                    timeoutId = setTimeout(function () {
                        controller.abort();
                    }, timeoutMs);
                }

                fetch(url, options)
                    .then(function (response) {
                        if (timeoutId) clearTimeout(timeoutId);
                        // Retry edilebilir status kodları
                        if (
                            remaining > 0 &&
                            RETRYABLE_STATUSES.indexOf(response.status) !== -1
                        ) {
                            var delay = BASE_DELAY_MS * Math.pow(2, maxRetries - remaining);
                            // jitter: ±%25
                            delay = delay * (0.75 + Math.random() * 0.5);
                            if (onRetry) {
                                onRetry(maxRetries - remaining + 1, { status: response.status }, delay);
                            }
                            setTimeout(function () {
                                resolve(attempt(remaining - 1));
                            }, delay);
                            return;
                        }
                        resolve(response);
                    })
                    .catch(function (err) {
                        if (timeoutId) clearTimeout(timeoutId);
                        // Network hatası (fetch gidemedi) veya abort
                        if (remaining > 0) {
                            var delay = BASE_DELAY_MS * Math.pow(2, maxRetries - remaining);
                            delay = delay * (0.75 + Math.random() * 0.5);
                            if (onRetry) {
                                onRetry(maxRetries - remaining + 1, err, delay);
                            }
                            setTimeout(function () {
                                resolve(attempt(remaining - 1));
                            }, delay);
                            return;
                        }
                        reject(err);
                    });
            });
        }

        return attempt(maxRetries);
    }

    /* --------------------------------------------------------
     * Hata kategorizasyonu
     * -------------------------------------------------------- */
    var ErrorCategory = {
        NETWORK: 'network',       // fetch gidemedi, timeout
        AUTH: 'auth',             // 401, 403
        NOT_FOUND: 'not_found',   // 404
        RATE_LIMIT: 'rate_limit', // 429
        SERVER: 'server',         // 5xx
        VALIDATION: 'validation', // 4xx (diğer)
        UNKNOWN: 'unknown'
    };

    function categorizeError(status, errorMessage) {
        if (!status || status === 0) return ErrorCategory.NETWORK;
        if (status === 401 || status === 403) return ErrorCategory.AUTH;
        if (status === 404) return ErrorCategory.NOT_FOUND;
        if (status === 429) return ErrorCategory.RATE_LIMIT;
        if (status >= 500) return ErrorCategory.SERVER;
        if (status >= 400) return ErrorCategory.VALIDATION;
        return ErrorCategory.UNKNOWN;
    }

    function getErrorMessage(category, fallback) {
        var messages = {};
        messages[ErrorCategory.NETWORK] = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
        messages[ErrorCategory.AUTH] = 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.';
        messages[ErrorCategory.NOT_FOUND] = 'İstenen bilgi bulunamadı.';
        messages[ErrorCategory.RATE_LIMIT] = 'Çok fazla istek gönderildi. Lütfen bekleyin.';
        messages[ErrorCategory.SERVER] = 'Sunucu hatası oluştu. Ekibimiz bilgilendirildi.';
        messages[ErrorCategory.VALIDATION] = 'İsteğiniz işlenemedi. Lütfen bilgileri kontrol edin.';
        messages[ErrorCategory.UNKNOWN] = 'Beklenmeyen bir hata oluştu.';
        return messages[category] || fallback || messages[ErrorCategory.UNKNOWN];
    }

    /* --------------------------------------------------------
     * EducationAPI — sınıf
     * -------------------------------------------------------- */
    function EducationAPI() {
        this.token = null;
        this._loading = LoadingState;

        // localStorage'dan token oku
        try {
            var stored = localStorage.getItem('authToken');
            if (stored) this.token = stored;
        } catch (e) { /* localStorage yok */ }
    }

    EducationAPI.prototype.setToken = function (token) {
        this.token = token;
        try { localStorage.setItem('authToken', token); } catch (e) {}
    };

    EducationAPI.prototype.clearToken = function () {
        this.token = null;
        try { localStorage.removeItem('authToken'); } catch (e) {}
    };

    /**
     * Ana request metodu — retry + loading + timeout
     * @param {string} endpoint  - API path, örn: "/auth/login"
     * @param {object} [options]
     * @param {string} [options.method="GET"]
     * @param {object} [options.headers]
     * @param {*}      [options.body]
     * @param {number} [options.retry=3]
     * @param {number} [options.timeout=15000]
     * @param {string} [options.loadingKey] - loading takibi için unique key
     * @returns {Promise<object>} JSON response
     */
    EducationAPI.prototype.request = function (endpoint, options) {
        options = options || {};
        var method = options.method || 'GET';
        var maxRetries = options.retry !== undefined ? options.retry : 2;
        var timeout = options.timeout || REQUEST_TIMEOUT_MS;
        var loadingKey = options.loadingKey || endpoint;
        var body = options.body;
        var headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        var url = getApiIntegrationBase() + endpoint;
        var fetchOpts = {
            method: method,
            headers: headers
        };
        if (body) {
            fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
        }
        if (this.token) {
            fetchOpts.headers.Authorization = 'Bearer ' + this.token;
        }

        // Loading başlat
        this._loading.start(loadingKey);

        var self = this;

        // Retry callback — loading bar canlı kalsın
        function onRetry(attempt, err, delayMs) {
            console.warn('[API] Retry ' + attempt + '/' + maxRetries +
                ' for ' + endpoint +
                ' (delay: ' + Math.round(delayMs) + 'ms):', err && (err.message || err.status));
            // loading indicator halen aktif
        }

        return retryFetch(url, fetchOpts, {
            maxRetries: maxRetries,
            timeout: timeout,
            onRetry: onRetry
        })
        .then(function (response) {
            // JSON parse
            return response.json().then(function (data) {
                if (!response.ok) {
                    var category = categorizeError(response.status);
                    var err = new Error(data.message || data.error || getErrorMessage(category));
                    err.status = response.status;
                    err.category = category;
                    err.data = data;
                    throw err;
                }
                return data;
            });
        })
        .catch(function (err) {
            // Kategorize et (zaten yapılmadıysa)
            if (!err.category) {
                err.category = categorizeError(err.status, err.message);
                if (!err.status) err.status = 0;
            }
            // Auth hatası → token temizleme (sadece auth endpoint'lerinde)
            if (err.category === ErrorCategory.AUTH && self.token) {
                const urlPath = (err.url || '').replace(self._baseUrl || '', '');
                const isAuthEndpoint = /^\/(auth|user|me|users\/me)/i.test(urlPath);
                if (isAuthEndpoint) {
                    self.clearToken();
                    try {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('isVerified');
                        localStorage.removeItem('userData');
                    } catch (e) {}
                    console.warn('[API] Auth failed — token cleared');
                }
            }
            throw err;
        })
        .finally(function () {
            self._loading.end(loadingKey);
        });
    };

    /** Kullanıcı kaydı */
    EducationAPI.prototype.register = function (userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
            retry: 1,
            loadingKey: 'auth-register'
        });
    };

    /** Email doğrulama */
    EducationAPI.prototype.verifyEmail = function (email, verificationCode) {
        return this.request('/auth/verify', {
            method: 'POST',
            body: { email: email, code: verificationCode },
            retry: 1,
            loadingKey: 'auth-verify'
        });
    };

    /** Giriş */
    EducationAPI.prototype.login = function (email, password) {
        var self = this;
        return this.request('/auth/login', {
            method: 'POST',
            body: { email: email, password: password },
            retry: 1,
            loadingKey: 'auth-login'
        }).then(function (response) {
            if (response.success && response.data && response.data.token) {
                self.setToken(response.data.token);
            }
            return response;
        });
    };

    /** Çıkış */
    EducationAPI.prototype.logout = function () {
        this.clearToken();
        try {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isVerified');
            localStorage.removeItem('userData');
            localStorage.removeItem('userProgress');
            localStorage.removeItem('recentActivities');
            localStorage.removeItem('achievements');
        } catch (e) {}
    };

    /** Modül ilerleme durumu */
    EducationAPI.prototype.getModuleProgress = function (moduleId) {
        return this.request('/progress/module/' + moduleId, {
            loadingKey: 'progress-module-' + moduleId
        });
    };

    /** Ders ilerleme güncelleme */
    EducationAPI.prototype.updateLessonProgress = function (lessonId, progressData) {
        return this.request('/progress/lesson/' + lessonId, {
            method: 'POST',
            body: progressData,
            loadingKey: 'progress-lesson-' + lessonId
        });
    };

    /** Genel ilerleme özeti */
    EducationAPI.prototype.getProgressOverview = function () {
        return this.request('/progress/overview', {
            loadingKey: 'progress-overview'
        });
    };

    /** Modül listesi */
    EducationAPI.prototype.getModules = function () {
        return this.request('/modules', {
            loadingKey: 'modules-list'
        });
    };

    /** Modül detayı */
    EducationAPI.prototype.getModuleDetails = function (moduleId) {
        return this.request('/modules/' + moduleId, {
            loadingKey: 'modules-detail-' + moduleId
        });
    };

    /** Health check (düşük timeout, retry yok) */
    EducationAPI.prototype.healthCheck = function () {
        return this.request('/health', {
            retry: 0,
            timeout: 5000,
            loadingKey: 'health-check'
        });
    };

    /** İletişim formu gönderimi */
    EducationAPI.prototype.sendContact = function (formData) {
        return this.request('/contact', {
            method: 'POST',
            body: formData,
            retry: 1,
            timeout: 10000,
            loadingKey: 'contact-send'
        });
    };

    /* --------------------------------------------------------
     * ProgressTracker — ders ilerleme takibi
     * -------------------------------------------------------- */
    function ProgressTracker(api) {
        this.api = api;
        this.currentModule = null;
        this.currentLesson = null;
    }

    ProgressTracker.prototype.setCurrentModule = function (moduleId, moduleName) {
        this.currentModule = { id: moduleId, name: moduleName };
    };

    ProgressTracker.prototype.setCurrentLesson = function (lessonId, lessonName) {
        this.currentLesson = { id: lessonId, name: lessonName };
    };

    ProgressTracker.prototype.getCurrentUserId = function () {
        try {
            var userData = JSON.parse(localStorage.getItem('userData') || '{}');
            return userData.id || userData.email || 'guest';
        } catch (e) {
            return 'guest';
        }
    };

    ProgressTracker.prototype.updateLocalStorage = function (status, progressPercentage) {
        var userId = this.getCurrentUserId();
        var userProgress = {};
        try {
            userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        } catch (e) {}

        if (!userProgress[userId]) {
            userProgress[userId] = {};
        }
        if (!this.currentModule) return;

        var moduleName = this.currentModule.name || this.currentModule.id;
        if (!userProgress[userId][moduleName]) {
            userProgress[userId][moduleName] = {
                percentage: 0,
                completedSections: 0,
                totalSections: 0,
                status: 'not_started',
                completedLessons: [],
                lastUpdated: new Date().toISOString()
            };
        }

        var moduleProgress = userProgress[userId][moduleName];
        if (status === 'completed' && this.currentLesson) {
            var lessonName = this.currentLesson.name || this.currentLesson.id;
            if (moduleProgress.completedLessons.indexOf(lessonName) === -1) {
                moduleProgress.completedLessons.push(lessonName);
            }
        }
        moduleProgress.lastUpdated = new Date().toISOString();
        moduleProgress.status = status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor';

        try {
            localStorage.setItem('userProgress', JSON.stringify(userProgress));
        } catch (e) {}
    };

    ProgressTracker.prototype.updateProgress = function (status, progressPercentage, extraOpts) {
        if (!this.currentLesson) {
            console.error('[ProgressTracker] No current lesson set');
            return Promise.resolve(null);
        }
        var self = this;
        extraOpts = extraOpts || {};

        // Önce localStorage'a yaz (offline-first)
        self.updateLocalStorage(status, progressPercentage || 0);

        // Server'a gönder (hata olursa localStorage yedeği kullanılır)
        return this.api.updateLessonProgress(this.currentLesson.id, {
            status: status,
            progressPercentage: progressPercentage || 0,
            lastPositionSeconds: extraOpts.lastPositionSeconds || 0,
            timeSpentSeconds: extraOpts.timeSpentSeconds || 0
        }).then(function (response) {
            if (response && response.success) {
                return response.data;
            }
            return null;
        }).catch(function (err) {
            console.warn('[ProgressTracker] Server update failed, using local:', err.message);
            return null;
        });
    };

    ProgressTracker.prototype.completeLesson = function () {
        return this.updateProgress('completed', 100);
    };

    ProgressTracker.prototype.startLesson = function () {
        return this.updateProgress('in_progress', 0);
    };

    ProgressTracker.prototype.loadProgress = function (moduleId) {
        var self = this;
        return this.api.getModuleProgress(moduleId).then(function (response) {
            if (response && response.success) {
                return response.data;
            }
            return self._loadProgressFromLocalStorage();
        }).catch(function () {
            return self._loadProgressFromLocalStorage();
        });
    };

    ProgressTracker.prototype._loadProgressFromLocalStorage = function () {
        var userId = this.getCurrentUserId();
        try {
            var userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            return userProgress[userId] || {};
        } catch (e) {
            return {};
        }
    };

    /* --------------------------------------------------------
     * DashboardLoader
     * -------------------------------------------------------- */
    function DashboardLoader(api) {
        this.api = api;
    }

    DashboardLoader.prototype.getCurrentUserId = function () {
        try {
            var userData = JSON.parse(localStorage.getItem('userData') || '{}');
            return userData.id || userData.email || 'guest';
        } catch (e) {
            return 'guest';
        }
    };

    DashboardLoader.prototype.loadDashboardData = function () {
        var self = this;
        return this.api.getProgressOverview().then(function (response) {
            if (response && response.success) {
                return response.data;
            }
            return self._loadFromLocalStorage();
        }).catch(function () {
            return self._loadFromLocalStorage();
        });
    };

    DashboardLoader.prototype._loadFromLocalStorage = function () {
        var userId = this.getCurrentUserId();
        var userProgress = {};
        try {
            userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        } catch (e) {}
        var userSpecificProgress = userProgress[userId] || {};

        var stats = {
            totalModules: Object.keys(userSpecificProgress).length,
            completedModules: Object.values(userSpecificProgress).filter(function (p) { return p.status === 'Tamamlandı'; }).length,
            inProgressModules: Object.values(userSpecificProgress).filter(function (p) { return p.status === 'Devam Ediyor'; }).length,
            totalTimeSpent: Object.values(userSpecificProgress).reduce(function (t, p) { return t + (p.time_spent || 0); }, 0),
            totalLessonsCompleted: Object.values(userSpecificProgress).reduce(function (t, p) { return t + ((p.completedLessons && p.completedLessons.length) || 0); }, 0)
        };

        return {
            stats: stats,
            modules: Object.keys(userSpecificProgress).map(function (name) {
                var progress = userSpecificProgress[name];
                return {
                    title: name,
                    progressPercentage: progress.percentage || 0,
                    status: progress.status || 'not_started',
                    completedLessons: (progress.completedLessons && progress.completedLessons.length) || 0,
                    totalLessons: progress.totalSections || 0,
                    timeSpentMinutes: Math.round((progress.time_spent || 0) / 60),
                    updatedAt: progress.lastUpdated
                };
            }),
            recentActivities: [],
            achievements: []
        };
    };

    /* --------------------------------------------------------
     * Export globals
     * -------------------------------------------------------- */
    var api = new EducationAPI();
    var tracker = new ProgressTracker(api);
    var dashboard = new DashboardLoader(api);

    global.educationAPI = api;
    global.progressTracker = tracker;
    global.dashboardLoader = dashboard;
    global.LoadingState = LoadingState;
    global.ErrorCategory = ErrorCategory;
    global.categorizeError = categorizeError;
    global.getErrorMessage = getErrorMessage;

    /* --------------------------------------------------------
     * Global helper functions (backward compatibility)
     * -------------------------------------------------------- */
    global.initializeModuleProgress = function (moduleId, moduleName) {
        if (tracker) tracker.setCurrentModule(moduleId, moduleName);
    };
    global.initializeLessonProgress = function (lessonId, lessonName) {
        if (tracker) tracker.setCurrentLesson(lessonId, lessonName);
    };
    global.completeLesson = function (lessonId, lessonName) {
        if (tracker) {
            tracker.setCurrentLesson(lessonId, lessonName);
            return tracker.completeLesson();
        }
        return Promise.resolve();
    };
    global.startLesson = function (lessonId, lessonName) {
        if (tracker) {
            tracker.setCurrentLesson(lessonId, lessonName);
            return tracker.startLesson();
        }
        return Promise.resolve();
    };

})(typeof window !== 'undefined' ? window : this);
