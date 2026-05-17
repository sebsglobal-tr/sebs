
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

const script = document.createElement('script');
script.src = '../utils/api-client.js';
document.head.appendChild(script);

let moduleNameCache = null;
let moduleCacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const moduleIdInflight = new Map();

function normModuleTitleStr(s) {
    return String(s || '')
        .trim()
        .replace(/[\s,;]+$/g, '')
        .toLowerCase();
}

window.invalidateModuleIdCache = function () {
    moduleNameCache = null;
    moduleCacheExpiry = 0;
    try {
        localStorage.removeItem('moduleNameCache');
        localStorage.removeItem('moduleNameCacheTime');
    } catch (e) {
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
    }
    return null;
}

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

/**
 * Yerel depolama anahtarı → veritabanı / modules.html başlığı.
 * Dashboard ve syncModuleProgressBulk bu listeyi kullanır.
 */
window.SEBS_MODULE_PROGRESS_REGISTRY = [
    { storageKey: 'module_progress_siber_guvenlik_giris', moduleTitle: 'Siber Güvenliğe Giriş' },
    { storageKey: 'module_progress_temel_network', moduleTitle: 'Temel Network Eğitimi' },
    { storageKey: 'module_progress_temel_kriptografi', moduleTitle: 'Temel Kriptografi' },
    {
        storageKey: 'module_progress_isletim_sistemleri_guvenligi_temel',
        moduleTitle: 'İşletim Sistemleri Güvenliği (Temel)'
    },
    {
        storageKey: 'module_progress_isletim_sistemi_guvenligi_ileri_temel',
        moduleTitle: 'İşletim Sistemi Güvenliği (İleri Temel)'
    },
    { storageKey: 'module_progress_network_guvenligi', moduleTitle: 'Network Güvenliği' },
    { storageKey: 'module_progress_sosyal_muhendislik_giris', moduleTitle: 'Sosyal Mühendisliğe Giriş' },
    { storageKey: 'module_progress_sosyal_muhendislik', moduleTitle: 'Sosyal Mühendisliğe Giriş' },
    { storageKey: 'module_progress_malware_analizi_orta', moduleTitle: 'Malware Analizi (Orta Seviye)' },
    { storageKey: 'module_progress_malware_analizi', moduleTitle: 'Malware Analizi (Orta Seviye)' },
    {
        storageKey: 'module_progress_soc_egitimi_guncel',
        moduleTitle: 'SOC (Security Operations Center) Eğitimi'
    },
    { storageKey: 'module_progress_soc', moduleTitle: 'SOC (Security Operations Center) Eğitimi' },
    {
        storageKey: 'module_progress_ileri_malware_analizi',
        moduleTitle: 'İleri Malware Analizi & Reverse Engineering'
    },
    { storageKey: 'module_progress_incident_response', moduleTitle: 'Olay Müdahalesi & Digital Forensics' },
    { storageKey: 'module_progress_ileri_kriptografi', moduleTitle: 'İleri Kriptografi' },
    { storageKey: 'module_progress_red_team_pentest', moduleTitle: 'Red Team & Pentest (İleri)' },
    { storageKey: 'module_progress_penetration_testing', moduleTitle: 'Red Team & Pentest (İleri)' },
    { storageKey: 'module_progress_threat_intelligence', moduleTitle: 'Threat Intelligence' },
    { storageKey: 'module_progress_threat_hunting', moduleTitle: 'Threat Intelligence' }
];

/** API modül başlığı eşlemesi (sayfa MODULE_NAME → veritabanı title) */
const MODULE_NAME_LOOKUP_ALIASES = {
    'İşletim Sistemleri Güvenliği (Temel)': [
        'İşletim Sistemi Güvenliği',
        'İşletim Sistemi Güvenliği (Temel)',
        'İşletim Sistemleri Güvenliği'
    ],
    'İşletim Sistemi Güvenliği (İleri Temel)': [
        'İşletim Sistemi Güvenliği (İleri)',
        'İşletim Sistemleri Güvenliği (İleri Temel)'
    ],
    'SOC Eğitimi (Güncel)': [
        'SOC (Security Operations Center) Eğitimi',
        'SOC Eğitimi',
        'SOC'
    ],
    'Sosyal Mühendisliğe Giriş (Güncel)': ['Sosyal Mühendisliğe Giriş'],
    'Malware Analizi (Orta Seviye)': ['Malware Analizi'],
    'Red Team & Pentest (İleri)': [
        'Red Team ve Pentest (İleri)',
        'Red Team & Pentest',
        'Penetration Testing'
    ],
    'Threat Intelligence': ['Threat Hunting'],
    'Olay Müdahalesi & Digital Forensics': [
        'Olay Müdahalesi ve Dijital Adli Bilişim (İleri)',
        'Olay Müdahalesi & DFIR'
    ],
    'İleri Malware Analizi & Reverse Engineering': ['İleri Malware Analizi'],
    'Temel Kriptografi': ['Kriptografi Temelleri'],
    'Network Güvenliği': ['Orta Seviye Network Güvenliği'],
    'Siber Güvenliğe Giriş': ['Güncel Siber Güvenliğe Giriş', 'Temel Siber Güvenlik']
};

function readLocalModuleProgressRaw(storageKey) {
    try {
        var raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function snapshotFromLocalProgress(storageKey, moduleTitle) {
    var local = readLocalModuleProgressRaw(storageKey);
    if (!local || typeof local !== 'object') return null;
    var completed = Array.isArray(local.completedLessons)
        ? local.completedLessons.map(String)
        : [];
    var total = Math.max(
        1,
        parseInt(String(local.totalLessons), 10) || completed.length || 0
    );
    if (!completed.length && !(parseInt(String(local.progress), 10) > 0)) return null;
    var pct = Math.min(100, Math.round((completed.length / total) * 100));
    if (!completed.length && local.progress != null) {
        pct = Math.min(100, Math.max(0, parseInt(String(local.progress), 10) || 0));
    }
    return {
        storageKey: storageKey,
        moduleTitle: moduleTitle,
        completedLessons: completed,
        totalLessons: total,
        percentComplete: pct,
        isCompleted: pct >= 100
    };
}

/** Tüm kayıtlı modüllerin yerel ilerleme anlık görüntüleri (başlık başına en yüksek yüzde) */
window.getLocalModuleProgressSnapshots = function () {
    var byTitle = {};
    var registry = window.SEBS_MODULE_PROGRESS_REGISTRY || [];
    var seenKeys = {};

    registry.forEach(function (entry) {
        if (!entry || !entry.storageKey || !entry.moduleTitle) return;
        if (seenKeys[entry.storageKey]) return;
        seenKeys[entry.storageKey] = true;
        var snap = snapshotFromLocalProgress(entry.storageKey, entry.moduleTitle);
        if (!snap) return;
        var norm = normModuleTitleStr(entry.moduleTitle);
        var prev = byTitle[norm];
        if (!prev || snap.percentComplete > prev.percentComplete) {
            if (prev && prev.completedLessons && prev.completedLessons.length) {
                snap.completedLessons = [
                    ...new Set(
                        prev.completedLessons.concat(snap.completedLessons).map(String)
                    )
                ];
                snap.totalLessons = Math.max(prev.totalLessons, snap.totalLessons);
                snap.percentComplete = Math.min(
                    100,
                    Math.round((snap.completedLessons.length / snap.totalLessons) * 100)
                );
                snap.isCompleted = snap.percentComplete >= 100;
            }
            byTitle[norm] = snap;
        }
    });

    try {
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (!k || k.indexOf('module_progress_') !== 0 || seenKeys[k]) continue;
            var guessed = k
                .replace(/^module_progress_/, '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, function (c) {
                    return c.toUpperCase();
                });
            var snapExtra = snapshotFromLocalProgress(k, guessed);
            if (!snapExtra) continue;
            var normExtra = normModuleTitleStr(snapExtra.moduleTitle);
            if (!byTitle[normExtra]) byTitle[normExtra] = snapExtra;
        }
    } catch (eScan) {
        /* ignore */
    }

    return Object.keys(byTitle).map(function (n) {
        return byTitle[n];
    });
};

/** localStorage → POST /api/progress (tüm premium modüller) */
window.syncAllLocalModuleProgressToApi = async function () {
    var snapshots = window.getLocalModuleProgressSnapshots();
    if (!snapshots.length) return { ok: true, synced: 0, total: 0 };
    var synced = 0;
    for (var i = 0; i < snapshots.length; i++) {
        var snap = snapshots[i];
        if (!snap.completedLessons || !snap.completedLessons.length) continue;
        var rs = await window.syncModuleProgressBulk(
            snap.moduleTitle,
            snap.completedLessons,
            snap.totalLessons
        );
        if (rs && rs.ok) synced += 1;
    }
    return { ok: true, synced: synced, total: snapshots.length };
};

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

            function pickModuleIdFromFlatList(list) {
                if (!list || !list.length) return null;
                const want = normModuleTitleStr(moduleName);
                const aliases = MODULE_NAME_LOOKUP_ALIASES[moduleName] || [];
                const wantSet = new Set(
                    [want]
                        .concat(
                            aliases.map((a) => normModuleTitleStr(a))
                        )
                        .filter(Boolean)
                );
                for (const m of list) {
                    const t = normModuleTitleStr(m.title || m.name);
                    if (t && wantSet.has(t)) return m.id;
                }
                for (const m of list) {
                    const t = normModuleTitleStr(m.title || m.name);
                    if (t && t === want) return m.id;
                }
                const loose = [];
                for (const m of list) {
                    const t = normModuleTitleStr(m.title || m.name);
                    if (!t) continue;
                    let matched = matchModuleTitleLoose(t, want);
                    if (!matched) {
                        for (const alias of aliases) {
                            if (matchModuleTitleLoose(t, normModuleTitleStr(alias))) {
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (matched) loose.push(m);
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
    saveLessonProgress: async function(moduleName, lessonName) {
        try {
            let token = await getSupabaseAccessToken();
            if (!token) {
                token = localStorage.getItem('authToken');
            }
            if (!token) {
                console.warn('⚠️ Not logged in, cannot save progress');
                return;
            }

            const moduleId = await getModuleIdFromName(moduleName);
            
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

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

            const completedLessons = currentProgress?.completedLessons || [];
            if (!completedLessons.includes(lessonName)) {
                completedLessons.push(lessonName);
            }
            
            const totalLessons = Math.max(
                1,
                parseInt(String(window.MODULE_TOTAL_LESSONS), 10) || 0,
                parseInt(String(currentProgress?.totalLessons), 10) || 0
            );
            const percentage = totalLessons > 0 
                ? Math.round((completedLessons.length / totalLessons) * 100) 
                : 0;
            const isCompleted = percentage === 100;

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

    completeModule: async function(moduleName) {
        try {
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
            checkCategoryCompletion(moduleName);
        } catch (error) {
            console.error('❌ Failed to complete module:', error);
            throw error;
        }
    },

    initializeModule: async function(moduleName, totalLessons) {
        try {
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

            try {
                const apiBase = getProgressApiBase();
                const progressResponse = await fetch(`${apiBase}/progress/module/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!progressResponse.ok || progressResponse.status === 404) {
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

function getCategoryFromModule(moduleName) {
    const siberGuvenlikModules = [
        'Temel Siber Güvenlik',
        'Temel Network Eğitimi',
        'Orta Seviye Network Güvenliği',
        'SOC Analistliği ve Olay İzleme',
        'SOC (Security Operations Center) Eğitimi',
        'Network Güvenliği',
        'Malware Analizi',
        'Malware Analizi (Orta Seviye)',
        'İleri Malware Analizi & Reverse Engineering',
        'Threat Hunting',
        'Threat Intelligence',
        'Penetration Testing',
        'Red Team & Pentest (İleri)',
        'Olay Müdahalesi & Digital Forensics',
        'İşletim Sistemleri Güvenliği (Temel)',
        'İşletim Sistemi Güvenliği (İleri Temel)'
    ];
    
    const bulutBilisimModules = [
        'AWS Temelleri',
        'Azure Temelleri',
        'Microsoft Azure',
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

window.syncModuleProgressBulk = async function (moduleTitle, clientCompletedLessons, totalLessons, options) {
    try {
        const opts = options || {};
        const clientList = Array.isArray(clientCompletedLessons)
            ? clientCompletedLessons.map((x) => String(x))
            : [];
        const catalogHint = Math.max(
            0,
            parseInt(String(window.MODULE_TOTAL_LESSONS), 10) || 0
        );
        const normalizedTotal = Math.max(
            1,
            parseInt(String(totalLessons), 10) || 0,
            catalogHint
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
        }

        const merged = [...new Set([...serverList.map(String), ...clientList])];
        const total = Math.max(1, normalizedTotal, serverTotal > normalizedTotal ? serverTotal : 0);
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
