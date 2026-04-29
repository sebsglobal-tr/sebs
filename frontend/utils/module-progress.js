// Module Progress Tracker
// Saves lesson completion to database and localStorage

// Tarayıcıdaki eski modül ilerlemesi (v3) — SEBS_PROGRESS_STORAGE_VER: legacy-progress-storage-migrate.js ile aynı tutun
(function runSebsLegacyProgressStorageMigrationOnceModules() {
    var SEBS_PROGRESS_STORAGE_VER = '3';
    var KEY = 'sebs_progress_storage_version';
    try {
        if (typeof localStorage === 'undefined') return;
        if (localStorage.getItem(KEY) === SEBS_PROGRESS_STORAGE_VER) return;
        [
            'module_progress_temel_network',
            'module_progress_siber_guvenlik_giris',
            'moduleNameCache',
            'moduleNameCacheTime',
            'userProgress'
        ].forEach(function (k) {
            localStorage.removeItem(k);
        });
        var i;
        var k;
        for (i = localStorage.length - 1; i >= 0; i--) {
            k = localStorage.key(i);
            if (k && k.indexOf('userProgress_') === 0) localStorage.removeItem(k);
        }
        localStorage.setItem(KEY, SEBS_PROGRESS_STORAGE_VER);
        setTimeout(function () {
            if (typeof window.invalidateModuleIdCache === 'function') {
                window.invalidateModuleIdCache();
            }
        }, 0);
    } catch (e) {
        /* ignore */
    }
})();

function getProgressApiBase() {
    if (typeof window.getSebsApiBase === 'function') {
        return window.getSebsApiBase();
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin + '/api';
    }
    return 'http://localhost:8006/api';
}

// Load API Client
const script = document.createElement('script');
script.src = '../utils/api-client.js';
document.head.appendChild(script);

// Module name to ID cache
let moduleNameCache = null;
let moduleCacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
/** Aynı modül adı için eşzamanlı tek ağ isteği (429 önleme) */
const moduleIdInflight = new Map();

function normModuleTitleStr(s) {
    return String(s || '')
        .trim()
        .replace(/[\s,;]+$/g, '')
        .toLowerCase();
}

/** Eski/yanlış önbelleği temizler; oturum değişince çağrılmalı */
window.invalidateModuleIdCache = function () {
    moduleNameCache = null;
    moduleCacheExpiry = 0;
    try {
        localStorage.removeItem('moduleNameCache');
        localStorage.removeItem('moduleNameCacheTime');
    } catch (e) {
        /* ignore */
    }
};

function getSupabaseAccessTokenFromStorage() {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const data = JSON.parse(raw);
            const at =
                data?.access_token ||
                data?.session?.access_token ||
                data?.currentSession?.access_token;
            if (at && typeof at === 'string' && at.length > 40) {
                return at;
            }
        }
    } catch (e) {
        /* ignore */
    }
    return null;
}

// Helper: get Supabase access token if available (Supabase Auth)
async function getSupabaseAccessToken() {
    try {
        if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
            const { data: { session }, error } = await window.supabaseAuthSystem.supabase.auth.getSession();
            if (!error && session && session.access_token) {
                return session.access_token;
            }
        }
    } catch (e) {
        console.warn('Supabase access token alınamadı:', e);
    }
    const legacy = localStorage.getItem('authToken');
    if (legacy) return legacy;
    return getSupabaseAccessTokenFromStorage();
}

// Get module ID from module name (exposed globally for other trackers)
window.getModuleIdFromName = async function (rawName) {
    const moduleName = String(rawName || '')
        .trim()
        .replace(/[\s,;]+$/g, '');

    if (moduleNameCache && Date.now() < moduleCacheExpiry) {
        if (moduleNameCache[moduleName]) {
            return moduleNameCache[moduleName];
        }
    }

    if (moduleIdInflight.has(moduleName)) {
        return moduleIdInflight.get(moduleName);
    }

    let settle;
    const done = new Promise((resolve) => {
        settle = resolve;
    });
    moduleIdInflight.set(moduleName, done);

    (async () => {
        try {
            const apiBase = getProgressApiBase();

            let authHeader = null;
            const supabaseToken = await getSupabaseAccessToken();
            if (supabaseToken) {
                authHeader = `Bearer ${supabaseToken}`;
            } else if (localStorage.getItem('authToken')) {
                authHeader = `Bearer ${localStorage.getItem('authToken')}`;
            }
            if (!authHeader) {
                console.warn('⚠️ No auth token for fetching module ID');
                settle(null);
                return;
            }

            function matchModuleTitleLoose(a, b) {
                if (!a || !b) return false;
                const na = normModuleTitleStr(a);
                const nb = normModuleTitleStr(b);
                if (na === nb) return true;
                return na.includes(nb) || nb.includes(na);
            }

            /** Önce tam başlık eşleşmesi; yoksa tek anlamlı “içerir” eşleşmesi (cihazlar arası aynı modül id) */
            function pickModuleIdFromFlatList(list) {
                if (!list || !list.length) return null;
                const want = normModuleTitleStr(moduleName);
                for (const m of list) {
                    const t = normModuleTitleStr(m.title || m.name);
                    if (t && t === want) return m.id;
                }
                const loose = [];
                for (const m of list) {
                    const t = normModuleTitleStr(m.title || m.name);
                    if (t && matchModuleTitleLoose(t, want)) loose.push(m);
                }
                if (loose.length === 1) return loose[0].id;
                if (loose.length > 1) {
                    loose.sort(
                        (a, b) =>
                            normModuleTitleStr(b.title || b.name).length -
                            normModuleTitleStr(a.title || a.name).length
                    );
                    return loose[0].id;
                }
                return null;
            }

            function pickIdFromCoursesPayload(coursesData) {
                if (!coursesData.success || !coursesData.data) return null;
                const flat = [];
                for (const course of coursesData.data) {
                    if (!course.modules) continue;
                    for (const mod of course.modules) {
                        if (mod && mod.id) flat.push(mod);
                    }
                }
                return pickModuleIdFromFlatList(flat);
            }

            async function fetchModulesList() {
                const modulesResponse = await fetch(apiBase + '/modules', {
                    headers: { Authorization: authHeader }
                });
                if (!modulesResponse.ok) return null;
                const modulesData = await modulesResponse.json();
                if (!modulesData.success || !Array.isArray(modulesData.data)) return null;
                return pickModuleIdFromFlatList(modulesData.data);
            }

            let resolvedId = await fetchModulesList();

            if (!resolvedId) {
                const coursesResponse = await fetch(apiBase + '/courses', {
                    headers: { Authorization: authHeader }
                });
                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    resolvedId = pickIdFromCoursesPayload(coursesData);
                }
            }

            if (resolvedId) {
                const cacheMap = { [moduleName]: resolvedId };
                moduleNameCache = Object.assign({}, moduleNameCache, cacheMap);
                moduleCacheExpiry = Date.now() + CACHE_DURATION;
                settle(resolvedId);
            } else {
                settle(null);
            }
        } catch (error) {
            console.error('Failed to fetch module ID:', error);
            settle(null);
        } finally {
            moduleIdInflight.delete(moduleName);
        }
    })();

    return done;
};

window.ModuleProgressTracker = {
    // Save lesson completion - DIRECTLY TO DATABASE ONLY
    saveLessonProgress: async function(moduleName, lessonName) {
        try {
            // Prefer Supabase session token, fallback to legacy authToken
            let token = await getSupabaseAccessToken();
            if (!token) {
                token = localStorage.getItem('authToken');
            }
            if (!token) {
                console.warn('⚠️ Not logged in, cannot save progress');
                return;
            }

            // Get module ID from name
            const moduleId = await getModuleIdFromName(moduleName);
            
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

            // Get current progress from database
            let currentProgress = null;
            try {
                const apiBase = getProgressApiBase();
                const progressResponse = await fetch(`${apiBase}/progress/module/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData.success && progressData.data) {
                        const raw = progressData.data;
                        const lastStep = typeof raw.lastStep === 'string' ? JSON.parse(raw.lastStep || '{}') : (raw.lastStep || {});
                        currentProgress = { ...lastStep, percentComplete: raw.percentComplete };
                    }
                }
            } catch (err) {
                console.log('No existing progress found, creating new');
            }

            // Calculate new progress (lastStep may have completedLessons, totalLessons)
            const completedLessons = currentProgress?.completedLessons || [];
            if (!completedLessons.includes(lessonName)) {
                completedLessons.push(lessonName);
            }
            
            const totalLessons = currentProgress?.totalLessons || window.MODULE_TOTAL_LESSONS || 0;
            const percentage = totalLessons > 0 
                ? Math.round((completedLessons.length / totalLessons) * 100) 
                : 0;
            const isCompleted = percentage === 100;

            // Save to database (direct fetch to /api/progress with Supabase/legacy token)
            const apiBase = getProgressApiBase();
            const lastStep = {
                completedLessons: completedLessons,
                totalLessons: totalLessons || window.MODULE_TOTAL_LESSONS || 0,
                lastLesson: lessonName,
                lastUpdated: new Date().toISOString()
            };

            const response = await fetch(apiBase + '/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    moduleId,
                    percentComplete: percentage,
                    lastStep: JSON.stringify(lastStep),
                    isCompleted
                })
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) {
                console.error('❌ Failed to save progress to database:', result?.message);
                throw new Error(result?.message || `Failed to save progress (HTTP ${response.status})`);
            }

            console.log('✅ Progress saved to database:', result);
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
            throw error;
        }
    },

    // Mark module as complete - DIRECTLY TO DATABASE ONLY
    completeModule: async function(moduleName) {
        try {
            // Prefer Supabase session token, fallback to legacy authToken
            let token = await getSupabaseAccessToken();
            if (!token) {
                token = localStorage.getItem('authToken');
            }
            if (!token) {
                console.warn('⚠️ Not logged in, cannot complete module');
                return;
            }

            const moduleId = await getModuleIdFromName(moduleName);
            
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

            // Get current progress from database
            let currentProgress = null;
            try {
                const apiBase = getProgressApiBase();
                const progressResponse = await fetch(`${apiBase}/progress/module/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData.success && progressData.data) {
                        const raw = progressData.data;
                        const ls =
                            typeof raw.lastStep === 'string'
                                ? JSON.parse(raw.lastStep || '{}')
                                : raw.lastStep || {};
                        currentProgress = {
                            completedLessons: Array.isArray(ls.completedLessons) ? ls.completedLessons : [],
                            totalLessons: ls.totalLessons || window.MODULE_TOTAL_LESSONS || 0
                        };
                    }
                }
            } catch (err) {
                console.log('No existing progress found');
            }

            // Save to database (direct fetch)
            const apiBase = getProgressApiBase();
            const doneLessons = currentProgress?.completedLessons || [];
            const totalL =
                currentProgress?.totalLessons ||
                window.MODULE_TOTAL_LESSONS ||
                (doneLessons.length > 0 ? doneLessons.length : 1);
            const lastStep = {
                completedLessons: doneLessons,
                totalLessons: totalL,
                status: 'Tamamlandı',
                completedAt: new Date().toISOString()
            };

            const response = await fetch(apiBase + '/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    moduleId,
                    percentComplete: 100,
                    lastStep: JSON.stringify(lastStep),
                    isCompleted: true
                })
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) {
                throw new Error(result?.message || `Failed to complete module (HTTP ${response.status})`);
            }

            console.log('✅ Module completed in database:', result);
            // Check category completion and generate certificate if needed
            checkCategoryCompletion(moduleName);
        } catch (error) {
            console.error('❌ Failed to complete module:', error);
            throw error;
        }
    },

    // Initialize module with total lessons count - DATABASE ONLY
    initializeModule: async function(moduleName, totalLessons) {
        try {
            // Prefer Supabase session token, fallback to legacy authToken
            let token = await getSupabaseAccessToken();
            if (!token) {
                token = localStorage.getItem('authToken');
            }
            if (!token) {
                console.warn('⚠️ Not logged in, cannot initialize module');
                return;
            }

            const moduleId = await getModuleIdFromName(moduleName);
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

            // Check if progress exists, if not create it
            try {
                const apiBase = getProgressApiBase();
                const progressResponse = await fetch(`${apiBase}/progress/module/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!progressResponse.ok || progressResponse.status === 404) {
                    // Create new progress entry directly
                    const response = await fetch(apiBase + '/progress', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            moduleId,
                            percentComplete: 0,
                            lastStep: JSON.stringify({ totalLessons: totalLessons }),
                            isCompleted: false
                        })
                    });

                    const result = await response.json().catch(() => ({}));
                    if (!response.ok || !result.success) {
                        console.warn('Modül başlangıç kaydı oluşturulamadı:', result?.message || response.status);
                    }
                }
            } catch (err) {
                console.log('Initializing new module progress');
            }
        } catch (error) {
            console.error('❌ Failed to initialize module:', error);
        }
    }
};

// Helper function to get category from module name
function getCategoryFromModule(moduleName) {
    const siberGuvenlikModules = [
        'Temel Siber Güvenlik',
        'Temel Network Eğitimi',
        'Network Güvenliği',
        'Malware Analizi',
        'Threat Hunting',
        'Penetration Testing'
    ];
    
    const bulutBilisimModules = [
        'AWS Temelleri',
        'Azure Temelleri',
        'Google Cloud Platform'
    ];
    
    const veriBilimiModules = [
        'Python Veri Analizi',
        'Makine Öğrenmesi',
        'Derin Öğrenme'
    ];
    
    if (siberGuvenlikModules.includes(moduleName)) {
        return 'siber-guvenlik';
    } else if (bulutBilisimModules.includes(moduleName)) {
        return 'bulut-bilisim';
    } else if (veriBilimiModules.includes(moduleName)) {
        return 'veri-bilimi';
    }
    
    return null;
}

// Check category completion and generate certificate
async function checkCategoryCompletion(moduleName) {
    const category = getCategoryFromModule(moduleName);
    
    if (!category) {
        console.log('Category not found for module:', moduleName);
        return;
    }
    
    try {
        if (window.APIClient) {
            const result = await window.APIClient.checkCategoryCompletion(category);
            
            if (result && result.success) {
                if (result.data.certificate) {
                    console.log('✅ Certificate generated!', result.data.certificate);
                    // Show notification
                    if (window.showNotification) {
                        window.showNotification('🎓 Tebrikler! Sertifika kazandınız!', 'success');
                    }
                } else {
                    console.log('Category progress:', result.data.completion);
                }
            }
        }
    } catch (error) {
        console.error('❌ Failed to check category completion:', error);
    }
}

/** Supabase veya legacy JWT — modül sayfaları ve panel ortak kullanır */
window.getProgressAuthToken = getSupabaseAccessToken;

const PENDING_PROGRESS_QUEUE_KEY = 'sebs_pending_progress_queue_v1';

function readPendingProgressQueue() {
    try {
        const raw = localStorage.getItem(PENDING_PROGRESS_QUEUE_KEY);
        const data = JSON.parse(raw || '[]');
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function writePendingProgressQueue(queue) {
    try {
        localStorage.setItem(PENDING_PROGRESS_QUEUE_KEY, JSON.stringify(Array.isArray(queue) ? queue : []));
    } catch (e) {
        /* ignore */
    }
}

function enqueuePendingProgress(moduleTitle, completedLessons, totalLessons, reason) {
    const title = String(moduleTitle || '').trim();
    if (!title) return;
    const done = Array.isArray(completedLessons) ? [...new Set(completedLessons.map(String))] : [];
    const total = Math.max(1, parseInt(String(totalLessons), 10) || done.length || 1);
    const queue = readPendingProgressQueue();
    const key = normModuleTitleStr(title);
    const now = new Date().toISOString();
    const idx = queue.findIndex((x) => normModuleTitleStr(x && x.moduleTitle) === key);
    const item = {
        moduleTitle: title,
        completedLessons: done,
        totalLessons: total,
        updatedAt: now,
        retryCount: idx >= 0 ? (queue[idx].retryCount || 0) + 1 : 0,
        lastReason: String(reason || '')
    };
    if (idx >= 0) queue[idx] = item;
    else queue.push(item);
    writePendingProgressQueue(queue);
}

function dequeuePendingProgress(moduleTitle) {
    const key = normModuleTitleStr(moduleTitle);
    const queue = readPendingProgressQueue().filter((x) => normModuleTitleStr(x && x.moduleTitle) !== key);
    writePendingProgressQueue(queue);
}

window.flushPendingProgressQueue = async function () {
    const queue = readPendingProgressQueue();
    if (!queue.length) return { ok: true, flushed: 0 };
    let flushed = 0;
    for (const item of queue) {
        const rs = await window.syncModuleProgressBulk(
            item.moduleTitle,
            item.completedLessons || [],
            item.totalLessons || 1,
            { fromQueue: true }
        );
        if (rs && rs.ok) {
            dequeuePendingProgress(item.moduleTitle);
            flushed += 1;
        }
    }
    return { ok: true, flushed };
};

/**
 * Tamamlanan ders listesini sunucu ile birleştirip POST /api/progress yazar (cihazlar arası tek kaynak).
 * @param {string} moduleTitle - Veritabanındaki modül başlığına yakın isim
 * @param {string[]} clientCompletedLessons - Bu oturumdaki tamamlanan ders kimlikleri/metinleri
 * @param {number} totalLessons - Toplam ders sayısı
 */
window.syncModuleProgressBulk = async function (moduleTitle, clientCompletedLessons, totalLessons, options) {
    try {
        const opts = options || {};
        const clientList = Array.isArray(clientCompletedLessons)
            ? clientCompletedLessons.map((x) => String(x))
            : [];
        const normalizedTotal = Math.max(
            1,
            parseInt(String(totalLessons), 10) || 0,
            clientList.length
        );
        const token = await getSupabaseAccessToken();
        if (!token) {
            enqueuePendingProgress(moduleTitle, clientList, normalizedTotal, 'no_token');
            return { ok: false, reason: 'no_token' };
        }
        const moduleId = await getModuleIdFromName(moduleTitle);
        if (!moduleId) {
            enqueuePendingProgress(moduleTitle, clientList, normalizedTotal, 'no_module');
            return { ok: false, reason: 'no_module' };
        }

        const apiBase = getProgressApiBase();

        let serverList = [];
        let serverTotal = 0;
        try {
            const gr = await fetch(`${apiBase}/progress/module/${moduleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (gr.ok) {
                const jd = await gr.json();
                if (jd.success && jd.data) {
                    const raw = jd.data.lastStep;
                    const lastStep =
                        typeof raw === 'string' ? JSON.parse(raw || '{}') : raw || {};
                    if (Array.isArray(lastStep.completedLessons)) {
                        serverList = lastStep.completedLessons;
                    }
                    serverTotal = parseInt(String(lastStep.totalLessons), 10) || 0;
                }
            }
        } catch (e) {
            /* yok say */
        }

        const merged = [...new Set([...serverList.map(String), ...clientList])];
        const total = Math.max(
            1,
            normalizedTotal,
            serverTotal,
            merged.length
        );
        const pct = Math.min(100, Math.round((merged.length / total) * 100));
        const lastStepPayload = {
            completedLessons: merged,
            totalLessons: total,
            lastUpdated: new Date().toISOString()
        };

        const response = await fetch(apiBase + '/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                moduleId,
                percentComplete: pct,
                lastStep: JSON.stringify(lastStepPayload),
                isCompleted: pct >= 100
            })
        });
        const result = await response.json().catch(() => ({}));
        const ok = response.ok && result.success !== false;
        if (ok) {
            dequeuePendingProgress(moduleTitle);
            if (!opts.fromQueue) {
                try {
                    await window.flushPendingProgressQueue();
                } catch (e) {
                    /* ignore */
                }
            }
        } else {
            enqueuePendingProgress(moduleTitle, merged, total, result && result.message ? result.message : 'http_error');
        }
        return { ok, ...result };
    } catch (error) {
        console.warn('syncModuleProgressBulk:', error);
        try {
            const safeList = Array.isArray(clientCompletedLessons) ? clientCompletedLessons : [];
            const safeTotal = Math.max(1, parseInt(String(totalLessons), 10) || safeList.length || 1);
            enqueuePendingProgress(moduleTitle, safeList, safeTotal, String(error && error.message));
        } catch (e) {
            /* ignore */
        }
        return { ok: false, reason: String(error && error.message) };
    }
};

window.addEventListener('online', function () {
    if (typeof window.flushPendingProgressQueue === 'function') {
        window.flushPendingProgressQueue().catch(function () {});
    }
});
window.addEventListener('focus', function () {
    if (typeof window.flushPendingProgressQueue === 'function') {
        window.flushPendingProgressQueue().catch(function () {});
    }
});
setTimeout(function () {
    if (typeof window.flushPendingProgressQueue === 'function') {
        window.flushPendingProgressQueue().catch(function () {});
    }
}, 1200);
