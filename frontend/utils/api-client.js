function getApiClientBase() {
    if (typeof window !== 'undefined' && typeof window.getSebsApiBase === 'function') {
        return window.getSebsApiBase();
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin + '/api';
    }
    return 'http://localhost:8006/api';
}

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
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('⚠️ No auth token found. Some API calls may fail.');
    }
    return token;
}

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
        const response = await fetch(`${getApiClientBase()}${endpoint}`, {
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
    
    saveModuleProgress: async function(moduleId, percentComplete, lastStep = null, isCompleted = false) {
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
    
    syncProgress: async function(progressData) {
        return await apiCall('/progress/sync', {
            method: 'POST',
            body: JSON.stringify({
                progressData: progressData
            })
        });
    },
    
    getProgressOverview: async function() {
        return await apiCall('/progress/overview', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    getUserProgress: async function() {
        return await apiCall('/progress', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    getModuleProgress: async function(moduleId) {
        return await apiCall(`/progress/module/${moduleId}`, {
            method: 'GET',
            requireAuth: true
        });
    },
    
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

    logLogin: async function() {
        return await apiCall('/progress/activity/login', {
            method: 'POST',
            body: JSON.stringify({})
        });
    },
    
    
    getUserCertificates: async function() {
        return await apiCall('/certificates', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    getCertificateReport: async function(certificateId) {
        return await apiCall(`/certificates/${certificateId}/report`, {
            method: 'GET',
            requireAuth: true
        });
    },
    
    checkCategoryCompletion: async function(category) {
        return await apiCall(`/certificates/check/${category}`, {
            method: 'GET',
            requireAuth: true
        });
    },
    
    
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
    
    getUserSimulations: async function() {
        return await apiCall('/simulations', {
            method: 'GET',
            requireAuth: true
        });
    },
    
    
    checkHealth: async function() {
        return await apiCall('/health', {
            method: 'GET',
            requireAuth: false
        });
    },
    
    
    saveActivity: async function(userId, activityType, activityDetails) {
        console.warn('⚠️ saveActivity is deprecated. Use specific tracking methods instead.');
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
    
    getUserStats: async function(userId) {
        console.warn('⚠️ getUserStats is deprecated. Use getProgressOverview instead.');
        return await apiCall(`/stats?user_id=${userId}`, {
            method: 'GET',
            requireAuth: false
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.APIClient;
}
