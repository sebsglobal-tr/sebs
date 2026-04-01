// API Client for SEBS Global Backend
// Handles all backend API calls with proper authentication
// Canlı ortam: aynı origin kullanılır (dashboard, modül sayfaları vb.)
const API_BASE_URL = (typeof window !== 'undefined' && window.location && window.location.origin) ? (window.location.origin + '/api') : 'http://localhost:8006/api';

// Supabase oturumu veya eski authToken
async function getAuthToken() {
    try {
        if (typeof window !== 'undefined' && window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
            const {
                data: { session }
            } = await window.supabaseAuthSystem.supabase.auth.getSession();
            if (session && session.access_token) {
                return session.access_token;
            }
        }
    } catch (e) {
        /* ignore */
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('⚠️ No auth token found. Some API calls may fail.');
    }
    return token;
}

// Get auth headers
async function getAuthHeaders(includeContentType = true) {
    const headers = {};
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    const token = await getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Generic API call helper
async function apiCall(endpoint, options = {}) {
    const token = await getAuthToken();
    
    if (!token && options.requireAuth !== false) {
        console.error('❌ API call requires authentication but no token found');
        return {
            success: false,
            message: 'Authentication required',
            data: null
        };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(await getAuthHeaders(options.method !== 'GET')),
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error(`❌ API Error (${response.status}):`, data.message || 'Unknown error');
            return {
                success: false,
                message: data.message || `HTTP ${response.status}`,
                data: null
            };
        }
        
        return data;
    } catch (error) {
        console.error('❌ API Network Error:', error);
        return {
            success: false,
            message: error.message || 'Network error',
            data: null
        };
    }
}

window.APIClient = {
    // ============================================
    // PROGRESS TRACKING
    // ============================================
    
    /**
     * Save module progress
     * @param {string} moduleId - Module ID from database
     * @param {number} percentComplete - Completion percentage (0-100)
     * @param {object} lastStep - Last step information (optional)
     * @param {boolean} isCompleted - Whether module is completed
     */
    saveModuleProgress: async function(moduleId, percentComplete, lastStep = null, isCompleted = false) {
        // If lastStep is a string, parse it; if it's an object, use it directly
        let lastStepValue = lastStep;
        if (typeof lastStep === 'object' && lastStep !== null) {
            lastStepValue = JSON.stringify(lastStep);
        }
        
        return await apiCall('/progress', {
            method: 'POST',
            body: JSON.stringify({
                moduleId,
                percentComplete,
                lastStep: lastStepValue,
                isCompleted
            })
        });
    },
    
    /**
     * Sync progress from localStorage to database
     * @param {array} progressData - Array of progress objects
     */
    syncProgress: async function(progressData) {
        return await apiCall('/progress/sync', {
            method: 'POST',
            body: JSON.stringify({
                progressData: progressData
            })
        });
    },
    
    /**
     * Get progress overview for dashboard
     */
    getProgressOverview: async function() {
        return await apiCall('/progress/overview', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    /**
     * Get all user progress
     */
    getUserProgress: async function() {
        return await apiCall('/progress', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    /**
     * Get specific module progress
     * @param {string} moduleId - Module ID
     */
    getModuleProgress: async function(moduleId) {
        return await apiCall(`/progress/module/${moduleId}`, {
            method: 'GET',
            requireAuth: true
        });
    },
    
    /**
     * Update time spent on module
     * @param {string} moduleId - Module ID
     * @param {number} minutes - Minutes spent
     */
    updateTimeSpent: async function(moduleId, minutes) {
        return await apiCall('/progress/time', {
            method: 'POST',
            body: JSON.stringify({
                moduleId,
                timeSpentMinutes: minutes,
                minutes
            })
        });
    },
    
    /**
     * Save quiz result
     * @param {string} moduleId - Module ID
     * @param {string} quizId - Quiz section ID (e.g. "değerlendirme-testi-10-soru")
     * @param {number} score - Score percentage (0-100)
     * @param {number} correctAnswers - Number of correct answers
     * @param {number} wrongAnswers - Number of wrong answers
     * @param {array} answers - Array of answers
     * @param {number} timeSpent - Time spent in seconds
     */
    saveQuizResult: async function(moduleId, quizId, score, correctAnswers, wrongAnswers, answers = [], timeSpent = 0) {
        return await apiCall('/progress/quiz', {
            method: 'POST',
            body: JSON.stringify({
                moduleId,
                quizId,
                score,
                correctAnswers,
                wrongAnswers,
                answers,
                timeSpent
            })
        });
    },

    /**
     * Log user login (günlük giriş takibi)
     */
    logLogin: async function() {
        return await apiCall('/progress/activity/login', {
            method: 'POST',
            body: JSON.stringify({})
        });
    },
    
    // ============================================
    // CERTIFICATES
    // ============================================
    
    /**
     * Get user certificates
     */
    getUserCertificates: async function() {
        return await apiCall('/certificates', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    /**
     * Get AI report for certificate
     * @param {string} certificateId - Certificate ID
     */
    getCertificateReport: async function(certificateId) {
        return await apiCall(`/certificates/${certificateId}/report`, {
            method: 'GET',
            requireAuth: true
        });
    },
    
    /**
     * Check category completion and generate certificate
     * @param {string} category - Category name (e.g., 'siber-guvenlik')
     */
    checkCategoryCompletion: async function(category) {
        return await apiCall(`/certificates/check/${category}`, {
            method: 'GET',
            requireAuth: true
        });
    },
    
    // ============================================
    // SIMULATIONS
    // ============================================
    
    /**
     * Save simulation completion
     * @param {string} moduleId - Module ID
     * @param {string} simulationId - Simulation ID
     * @param {number} score - Score percentage (0-100)
     * @param {array} flagsFound - Array of flags found
     * @param {number} timeSpent - Time spent in seconds
     * @param {number} attempts - Number of attempts
     */
    saveSimulationCompletion: async function(
        moduleId,
        simulationId,
        score,
        flagsFound = [],
        timeSpent = 0,
        attempts = 1,
        extra = {}
    ) {
        const body = {
            moduleId,
            simulationId,
            score,
            flagsFound,
            timeSpent,
            attempts
        };
        if (extra && typeof extra === 'object') {
            if (extra.correctCount != null) body.correctCount = extra.correctCount;
            if (extra.wrongCount != null) body.wrongCount = extra.wrongCount;
            if (typeof extra.passed === 'boolean') body.passed = extra.passed;
            if (extra.runId) body.runId = extra.runId;
        }
        return await apiCall('/simulations/complete', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    /**
     * Get user simulations
     */
    getUserSimulations: async function() {
        return await apiCall('/simulations', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    // ============================================
    // AUTHENTICATION (Legacy support - may not be needed)
    // ============================================
    
    /**
     * Health check (no auth required)
     */
    checkHealth: async function() {
        return await apiCall('/health', {
            method: 'GET',
            requireAuth: false
        });
    },
    
    // ============================================
    // LEGACY METHODS (for backward compatibility)
    // ============================================
    
    /**
     * Legacy: Save activity (may not be implemented in backend)
     */
    saveActivity: async function(userId, activityType, activityDetails) {
        console.warn('⚠️ saveActivity is deprecated. Use specific tracking methods instead.');
        // Try legacy endpoint if exists
        return await apiCall('/activity', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                activity_type: activityType,
                activity_details: activityDetails
            }),
            requireAuth: false // May not require auth
        });
    },
    
    /**
     * Legacy: Get user stats (may not be implemented in backend)
     */
    getUserStats: async function(userId) {
        console.warn('⚠️ getUserStats is deprecated. Use getProgressOverview instead.');
        return await apiCall(`/stats?user_id=${userId}`, {
            method: 'GET',
            requireAuth: false
        });
    }
};

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.APIClient;
}
