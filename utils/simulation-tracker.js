// Simulation Completion Tracker
// Başlatma + tamamlama kaydı (simulation_runs), dashboard ile uyumlu

(function () {
    const RUN_PREFIX = 'sebs_sim_run_';

    function getRunStorageKey(simulationId) {
        return RUN_PREFIX + simulationId;
    }

    async function resolveModuleId(moduleName) {
        if (!moduleName) return null;
        if (window.getModuleIdFromName) {
            try {
                return await window.getModuleIdFromName(moduleName);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    window.SimulationTracker = {
        /**
         * Simülasyon başladığında sunucuya kaydet; dönen runId oturumda saklanır.
         */
        async recordStart(simulationId, simulationName, data = {}) {
            const token = localStorage.getItem('authToken');
            if (!token || !simulationId) {
                return null;
            }
            let moduleId = data.moduleId || null;
            if (!moduleId && data.moduleName) {
                moduleId = await resolveModuleId(data.moduleName);
            }
            const apiBase =
                typeof window !== 'undefined' && window.location && window.location.origin
                    ? window.location.origin + '/api'
                    : 'http://localhost:8006/api';
            try {
                const response = await fetch(apiBase + '/simulations/start', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        simulationId,
                        moduleId,
                        simulationName
                    })
                });
                const result = await response.json();
                if (result && result.success && result.data && result.data.runId) {
                    sessionStorage.setItem(getRunStorageKey(simulationId), result.data.runId);
                    return result.data.runId;
                }
            } catch (e) {
                console.warn('Simulation start not saved:', e);
            }
            return null;
        },

        clearRunId(simulationId) {
            sessionStorage.removeItem(getRunStorageKey(simulationId));
        },

        async saveCompletion(simulationId, simulationName, data = {}) {
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.log('No auth token for simulation tracking');
                return;
            }

            const score = data.score != null ? Number(data.score) : 0;
            const timeSpent = data.timeSpent || 0;
            const attempts = data.attempts || 1;
            const correctCount =
                data.correctCount != null ? Math.max(0, parseInt(String(data.correctCount), 10) || 0) : 0;
            const wrongCount =
                data.wrongCount != null ? Math.max(0, parseInt(String(data.wrongCount), 10) || 0) : 0;
            let passed = data.passed;
            if (typeof passed !== 'boolean') {
                passed = score >= 70;
            }

            const runId = sessionStorage.getItem(getRunStorageKey(simulationId)) || null;

            let moduleId = data.moduleId || null;
            if (!moduleId && data.moduleName) {
                moduleId = await resolveModuleId(data.moduleName);
            }

            const payload = {
                simulationId: simulationId,
                simulationName: simulationName,
                score,
                flagsFound: data.flagsFound || [],
                timeSpent,
                moduleName: data.moduleName || null,
                moduleId,
                attempts,
                correctCount,
                wrongCount,
                passed,
                runId
            };

            try {
                let result;

                if (window.APIClient && moduleId) {
                    result = await window.APIClient.saveSimulationCompletion(
                        moduleId,
                        simulationId,
                        score,
                        data.flagsFound || [],
                        timeSpent,
                        attempts,
                        { correctCount, wrongCount, passed, runId }
                    );
                } else {
                    const apiBase =
                        typeof window !== 'undefined' && window.location && window.location.origin
                            ? window.location.origin + '/api'
                            : 'http://localhost:8006/api';
                    const response = await fetch(apiBase + '/simulations/complete', {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    result = await response.json();
                }

                if (result && result.success) {
                    sessionStorage.removeItem(getRunStorageKey(simulationId));
                    console.log('Simulation completion saved:', result.data);

                    if (data.moduleName) {
                        const category = getCategoryFromModuleName(data.moduleName);
                        if (category && window.APIClient) {
                            setTimeout(async () => {
                                const certResult = await window.APIClient.checkCategoryCompletion(category);
                                if (certResult && certResult.success && certResult.data.certificate) {
                                    console.log('Certificate generated!', certResult.data.certificate);
                                    if (window.showNotification) {
                                        window.showNotification(
                                            'Tebrikler! Simülasyonlar tamamlandı, sertifika kazandınız!',
                                            'success'
                                        );
                                    }
                                }
                            }, 1000);
                        }
                    }
                }

                return result;
            } catch (error) {
                console.error('Failed to save simulation completion:', error);
                return { success: false, error: error.message };
            }
        }
    };

    function getCategoryFromModuleName(moduleName) {
        const siberGuvenlikModules = [
            'Temel Siber Güvenlik',
            'Siber Güvenliğe Giriş',
            'Network Güvenliği',
            'Malware Analizi',
            'Threat Hunting',
            'Penetration Testing'
        ];

        const bulutBilisimModules = ['AWS Temelleri', 'Azure Temelleri', 'Google Cloud Platform'];

        const veriBilimiModules = ['Python Veri Analizi', 'Makine Öğrenmesi', 'Derin Öğrenme'];

        if (siberGuvenlikModules.includes(moduleName)) {
            return 'siber-guvenlik';
        }
        if (bulutBilisimModules.includes(moduleName)) {
            return 'bulut-bilisim';
        }
        if (veriBilimiModules.includes(moduleName)) {
            return 'veri-bilimi';
        }

        return null;
    }
})();
