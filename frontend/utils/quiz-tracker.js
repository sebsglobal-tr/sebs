
window.QuizTracker = {
    async saveResult(moduleId, quizId, resultData) {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            console.log('No auth token for quiz tracking');
            this.saveToLocalStorage(quizId, resultData);
            return;
        }
        
        const payload = {
            moduleId: moduleId || 'unknown',
            quizId: quizId,
            score: resultData.score || 0,
            correctAnswers: resultData.correct || 0,
            wrongAnswers: resultData.wrong || 0,
            answers: resultData.answers || [],
            timeSpent: resultData.timeSpent || 0
        };
        
        try {
            let result;
            
            if (window.APIClient && moduleId) {
                result = await window.APIClient.saveQuizResult(
                    moduleId,
                    quizId,
                    payload.score,
                    payload.correctAnswers,
                    payload.wrongAnswers,
                    payload.answers,
                    payload.timeSpent
                );
            } else {
                const apiBase =
                    typeof window.getSebsApiBase === 'function'
                        ? window.getSebsApiBase()
                        : (typeof window !== 'undefined' && window.location && window.location.origin
                              ? window.location.origin + '/api'
                              : 'http://localhost:8006/api');
                const response = await fetch(apiBase + '/progress/quiz', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                result = await response.json();
            }
            
            if (result && result.success) {
                console.log('✅ Quiz result saved:', result.data);
                
                this.saveToLocalStorage(quizId, resultData);
            } else {
                console.warn('⚠️ Quiz result not saved:', result?.message);
                this.saveToLocalStorage(quizId, resultData);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Failed to save quiz result:', error);
            this.saveToLocalStorage(quizId, resultData);
            return { success: false, error: error.message };
        }
    },
    
    saveToLocalStorage(quizId, resultData) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const isVerified = localStorage.getItem('isVerified');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (isLoggedIn === 'true' && isVerified === 'true') {
            const userId = userData.email || userData.id || 'guest';
            const storageKey = 'quizResults_' + userId;
            
            const quizResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
            quizResults.push({
                quizId,
                ...resultData,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem(storageKey, JSON.stringify(quizResults));
        }
    },
    
    calculateScore(correctAnswers, totalQuestions) {
        return Math.round((correctAnswers / totalQuestions) * 100);
    }
};

