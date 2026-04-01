// Module Progress Tracker
// Saves lesson completion to database and localStorage

// Load API Client
const script = document.createElement('script');
script.src = '../utils/api-client.js';
document.head.appendChild(script);

// Module name to ID cache
let moduleNameCache = null;
let moduleCacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    return null;
}

// Get module ID from module name (exposed globally for other trackers)
window.getModuleIdFromName = async function(moduleName) {
    // Check cache first
    if (moduleNameCache && Date.now() < moduleCacheExpiry) {
        if (moduleNameCache[moduleName]) {
            return moduleNameCache[moduleName];
        }
    }
    
    // Load from localStorage cache
    const cache = JSON.parse(localStorage.getItem('moduleNameCache') || '{}');
    const cacheTime = parseInt(localStorage.getItem('moduleNameCacheTime') || '0');
    
    if (Date.now() - cacheTime < CACHE_DURATION && cache[moduleName]) {
        return cache[moduleName];
    }
    
    // Fetch from backend (prefer Supabase token if available)
    try {
        // Get all courses (canlıda aynı origin)
        const apiBase = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';
        
        let authHeader = null;
        const supabaseToken = await getSupabaseAccessToken();
        if (supabaseToken) {
            authHeader = `Bearer ${supabaseToken}`;
        } else if (localStorage.getItem('authToken')) {
            authHeader = `Bearer ${localStorage.getItem('authToken')}`;
        }
        if (!authHeader) {
            console.warn('⚠️ No auth token for fetching module ID');
            return null;
        }

        const coursesResponse = await fetch(apiBase + '/courses', {
            headers: {
                'Authorization': authHeader
            }
        });
        
        if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            if (coursesData.success && coursesData.data) {
                const cacheMap = {};
                
                // Build module name -> ID mapping
                // Önce kurs adı eşleşmesi (örn. "Siber Güvenliğe Giriş" kursu -> ilk modül)
                for (const course of coursesData.data) {
                    if (course.title === moduleName || course.title.includes(moduleName) || moduleName.includes(course.title)) {
                        if (course.modules && course.modules.length > 0) {
                            cacheMap[moduleName] = course.modules[0].id;
                            break;
                        }
                    }
                }
                // Yoksa modül adı eşleşmesi
                if (!cacheMap[moduleName]) {
                    coursesData.data.forEach(course => {
                        if (course.modules) {
                            course.modules.forEach(module => {
                                if (module.title === moduleName || 
                                    module.title.includes(moduleName) ||
                                    moduleName.includes(module.title)) {
                                    cacheMap[moduleName] = module.id;
                                }
                            });
                        }
                    });
                }
                
                // Update cache
                moduleNameCache = cacheMap;
                moduleCacheExpiry = Date.now() + CACHE_DURATION;
                
                // Save to localStorage
                const existingCache = JSON.parse(localStorage.getItem('moduleNameCache') || '{}');
                Object.assign(existingCache, cacheMap);
                localStorage.setItem('moduleNameCache', JSON.stringify(existingCache));
                localStorage.setItem('moduleNameCacheTime', Date.now().toString());
                
                return cacheMap[moduleName] || null;
            }
        }
    } catch (error) {
        console.error('Failed to fetch module ID:', error);
    }
    
    return null;
}

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
                const apiBase = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';
                const progressResponse = await fetch(`${apiBase}/progress/${moduleId}`, {
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
            const apiBase = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';
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
                const apiBase = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';
                const progressResponse = await fetch(`${apiBase}/progress/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData.success && progressData.data) {
                        currentProgress = progressData.data;
                    }
                }
            } catch (err) {
                console.log('No existing progress found');
            }

            // Save to database (direct fetch)
            const apiBase = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';
            const lastStep = {
                completedLessons: currentProgress?.completedLessons || [],
                totalLessons: currentProgress?.totalLessons || 0,
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
                const apiBase = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';
                const progressResponse = await fetch(`${apiBase}/progress/${moduleId}`, {
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
