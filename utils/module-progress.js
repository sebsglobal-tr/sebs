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
    
    // Fetch from backend
    try {
        if (!window.APIClient) {
            console.warn('APIClient not loaded yet');
            return null;
        }
        
        // Get all courses
        const coursesResponse = await fetch('http://localhost:8006/api/courses', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            if (coursesData.success && coursesData.data) {
                const cacheMap = {};
                
                // Build module name -> ID mapping
                coursesData.data.forEach(course => {
                    if (course.modules) {
                        course.modules.forEach(module => {
                            // Try to match by title (exact or partial)
                            if (module.title === moduleName || 
                                module.title.includes(moduleName) ||
                                moduleName.includes(module.title)) {
                                cacheMap[moduleName] = module.id;
                            }
                        });
                    }
                });
                
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
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ Not logged in, cannot save progress');
            return;
        }

        try {
            // Get module ID from name
            const moduleId = await getModuleIdFromName(moduleName);
            
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

            // Get current progress from database
            let currentProgress = null;
            try {
                const progressResponse = await fetch(`http://localhost:8006/api/progress/${moduleId}`, {
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
                console.log('No existing progress found, creating new');
            }

            // Calculate new progress
            const completedLessons = currentProgress?.completedLessons || [];
            if (!completedLessons.includes(lessonName)) {
                completedLessons.push(lessonName);
            }
            
            const totalLessons = currentProgress?.totalLessons || 0;
            const percentage = totalLessons > 0 
                ? Math.round((completedLessons.length / totalLessons) * 100) 
                : 0;
            const isCompleted = percentage === 100;

            // Save to database
            if (window.APIClient) {
                const lastStep = {
                    completedLessons: completedLessons,
                    totalLessons: totalLessons,
                    lastLesson: lessonName,
                    lastUpdated: new Date().toISOString()
                };
                
                const result = await window.APIClient.saveModuleProgress(
                    moduleId,
                    percentage,
                    lastStep,
                    isCompleted
                );
                
                if (result && result.success) {
                    console.log('✅ Progress saved to database:', result);
                } else {
                    console.error('❌ Failed to save progress to database:', result?.message);
                    throw new Error(result?.message || 'Failed to save progress');
                }
            } else {
                throw new Error('APIClient not available');
            }
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
            throw error;
        }
    },

    // Mark module as complete - DIRECTLY TO DATABASE ONLY
    completeModule: async function(moduleName) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ Not logged in, cannot complete module');
            return;
        }

        try {
            const moduleId = await getModuleIdFromName(moduleName);
            
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

            // Get current progress from database
            let currentProgress = null;
            try {
                const progressResponse = await fetch(`http://localhost:8006/api/progress/${moduleId}`, {
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

            // Save to database
            if (window.APIClient) {
                const lastStep = {
                    completedLessons: currentProgress?.completedLessons || [],
                    totalLessons: currentProgress?.totalLessons || 0,
                    status: 'Tamamlandı',
                    completedAt: new Date().toISOString()
                };
                
                const result = await window.APIClient.saveModuleProgress(
                    moduleId,
                    100,
                    lastStep,
                    true // isCompleted
                );
                
                if (result && result.success) {
                    console.log('✅ Module completed in database:', result);
                    // Check category completion and generate certificate if needed
                    checkCategoryCompletion(moduleName);
                } else {
                    throw new Error(result?.message || 'Failed to complete module');
                }
            } else {
                throw new Error('APIClient not available');
            }
        } catch (error) {
            console.error('❌ Failed to complete module:', error);
            throw error;
        }
    },

    // Initialize module with total lessons count - DATABASE ONLY
    initializeModule: async function(moduleName, totalLessons) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ Not logged in, cannot initialize module');
            return;
        }

        try {
            const moduleId = await getModuleIdFromName(moduleName);
            if (!moduleId) {
                console.warn(`⚠️ Module ID not found for: ${moduleName}`);
                return;
            }

            // Check if progress exists, if not create it
            try {
                const progressResponse = await fetch(`http://localhost:8006/api/progress/${moduleId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!progressResponse.ok || progressResponse.status === 404) {
                    // Create new progress entry
                    if (window.APIClient) {
                        await window.APIClient.saveModuleProgress(
                            moduleId,
                            0,
                            { totalLessons: totalLessons },
                            false
                        );
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
