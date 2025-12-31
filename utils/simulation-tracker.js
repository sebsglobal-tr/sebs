// Simulation Completion Tracker
// Tracks simulation completion and saves to backend

window.SimulationTracker = {
    // Save simulation completion
    async saveCompletion(simulationId, simulationName, data = {}) {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!token) {
            console.log('No auth token for simulation tracking');
            return;
        }
        
        const payload = {
            simulationId: simulationId,
            simulationName: simulationName,
            score: data.score || null,
            flagsFound: data.flagsFound || [],
            timeSpent: data.timeSpent || 0,
            moduleName: data.moduleName || null
        };
        
        try {
            // Use APIClient if available
            let result;
            
            // Get moduleId from moduleName if needed
            let moduleId = null;
            if (data.moduleName) {
                // Try to get moduleId from cache or fetch
                if (window.getModuleIdFromName) {
                    moduleId = await window.getModuleIdFromName(data.moduleName);
                }
            }
            
            if (window.APIClient && moduleId) {
                result = await window.APIClient.saveSimulationCompletion(
                    moduleId,
                    simulationId,
                    data.score || 0,
                    data.flagsFound || [],
                    data.timeSpent || 0,
                    data.attempts || 1
                );
            } else {
                // Fallback: Direct API call
                const response = await fetch('http://localhost:8006/api/simulations/complete', {
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
                console.log('✅ Simulation completion saved:', result.data);
                
                // Check category completion for certificate
                if (data.moduleName) {
                    // Extract category from module name
                    const category = getCategoryFromModuleName(data.moduleName);
                    if (category && window.APIClient) {
                        // Check if category is complete
                        setTimeout(async () => {
                            const certResult = await window.APIClient.checkCategoryCompletion(category);
                            if (certResult && certResult.success && certResult.data.certificate) {
                                console.log('🎓 Certificate generated!', certResult.data.certificate);
                                if (window.showNotification) {
                                    window.showNotification('🎓 Tebrikler! Simülasyonlar tamamlandı, sertifika kazandınız!', 'success');
                                }
                            }
                        }, 1000);
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('❌ Failed to save simulation completion:', error);
            return { success: false, error: error.message };
        }
    }
};

// Helper function
function getCategoryFromModuleName(moduleName) {
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

// Check category completion
async function checkCategoryCompletionForCertificate(category) {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
        const response = await fetch(`http://localhost:8006/api/certificates/check/${category}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data.certificate) {
            console.log('🎓 Certificate generated!', data.data.certificate);
            if (window.showNotification) {
                window.showNotification('🎓 Tebrikler! Simülasyonlar tamamlandı, sertifika kazandınız!', 'success');
            }
        }
    } catch (error) {
        console.error('Failed to check category completion:', error);
    }
}

