// Time Tracker Utility
// Tracks time spent on modules and simulations

window.TimeTracker = {
    trackers: {}, // Active trackers
    
    // Start tracking time for a module
    start: function(moduleName, moduleId = null) {
        const trackerId = moduleId || moduleName;
        
        if (!this.trackers[trackerId]) {
            this.trackers[trackerId] = {
                moduleName: moduleName,
                moduleId: moduleId,
                startTime: Date.now(),
                intervalId: null
            };
            
            // Update every minute
            this.trackers[trackerId].intervalId = setInterval(() => {
                this.saveTime(trackerId);
            }, 60000); // Every minute
            
            console.log(`⏱️ Started tracking: ${moduleName}`);
        }
    },
    
    // Stop tracking time
    stop: function(moduleName, moduleId = null) {
        const trackerId = moduleId || moduleName;
        
        if (this.trackers[trackerId]) {
            const tracker = this.trackers[trackerId];
            
            // Clear interval
            if (tracker.intervalId) {
                clearInterval(tracker.intervalId);
            }
            
            // Final save
            this.saveTime(trackerId, true);
            
            // Remove tracker
            delete this.trackers[trackerId];
            
            console.log(`⏱️ Stopped tracking: ${moduleName}`);
        }
    },
    
    // Save time to backend and localStorage
    saveTime: async function(trackerId, isFinal = false) {
        const tracker = this.trackers[trackerId];
        if (!tracker) return;
        
        const elapsedMinutes = Math.floor((Date.now() - tracker.startTime) / 1000 / 60);
        
        // Save to localStorage
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const isVerified = localStorage.getItem('isVerified');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (isLoggedIn === 'true' && isVerified === 'true') {
            const userId = userData.email || userData.id || 'guest';
            const storageKey = 'userProgress_' + userId;
            const savedProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
            
            if (!savedProgress.modules) savedProgress.modules = {};
            if (!savedProgress.modules[tracker.moduleName]) {
                savedProgress.modules[tracker.moduleName] = {};
            }
            
            const previousTime = savedProgress.modules[tracker.moduleName].timeSpentMinutes || 0;
            savedProgress.modules[tracker.moduleName].timeSpentMinutes = previousTime + elapsedMinutes;
            savedProgress.modules[tracker.moduleName].lastUpdated = new Date().toISOString();
            
            localStorage.setItem(storageKey, JSON.stringify(savedProgress));
            
            // Save to backend
            try {
                // Get moduleId from moduleName if not available
                let moduleId = tracker.moduleId;
                
                if (!moduleId && window.getModuleIdFromName) {
                    moduleId = await window.getModuleIdFromName(tracker.moduleName);
                }
                
                if (moduleId && window.APIClient) {
                    const result = await window.APIClient.updateTimeSpent(moduleId, elapsedMinutes);
                    if (result && result.success) {
                        console.log('✅ Time saved to backend:', elapsedMinutes, 'minutes');
                    }
                } else if (moduleId) {
                    // Fallback: Direct API call
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        const response = await fetch('http://localhost:8006/api/progress/time', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                moduleId: moduleId,
                                minutes: elapsedMinutes // Backend expects 'minutes', not 'timeSpentMinutes'
                            })
                        });
                        
                        if (response.ok) {
                            console.log('✅ Time saved to backend:', elapsedMinutes, 'minutes');
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Failed to save time to backend:', error);
            }
            
            // Reset start time for next interval
            if (!isFinal) {
                tracker.startTime = Date.now();
            }
        }
    },
    
    // Get total time for a module
    getTotalTime: function(moduleName) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const isVerified = localStorage.getItem('isVerified');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (isLoggedIn === 'true' && isVerified === 'true') {
            const userId = userData.email || userData.id || 'guest';
            const storageKey = 'userProgress_' + userId;
            const savedProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
            
            if (savedProgress.modules && savedProgress.modules[moduleName]) {
                return savedProgress.modules[moduleName].timeSpentMinutes || 0;
            }
        }
        
        return 0;
    }
};

// Auto-start tracking when page loads (if module detected)
window.addEventListener('load', function() {
    // Check if we're on a module page
    const moduleTitle = document.querySelector('h1')?.textContent || 
                        document.querySelector('.module-title')?.textContent;
    
    if (moduleTitle && moduleTitle !== 'Ana Sayfa') {
        // Try to extract module name
        const moduleName = moduleTitle.trim();
        
        // Start tracking
        if (window.TimeTracker) {
            window.TimeTracker.start(moduleName);
        }
    }
});

// Auto-stop tracking when page unloads
window.addEventListener('beforeunload', function() {
    // Stop all active trackers
    if (window.TimeTracker) {
        Object.keys(window.TimeTracker.trackers).forEach(trackerId => {
            const tracker = window.TimeTracker.trackers[trackerId];
            window.TimeTracker.stop(tracker.moduleName, tracker.moduleId);
        });
    }
});

