// Simulation Completion Tracker
// Başlatma + tamamlama kaydı (simulation_runs), dashboard ile uyumlu

(function () {
    const RUN_PREFIX = 'sebs_sim_run_';

    /**
     * Dashboard /api-base.js ile aynı mantık: statik sitede (sebsglobal.com vb.)
     * location.origin + '/api' yanlış olur; uzak Node API kökü kullanılır.
     * @see frontend/js/api-base.js
     */
    function resolveSimulationApiBase() {
        if (typeof window.getSebsApiBase === 'function') {
            try {
                const b = window.getSebsApiBase();
                if (b && typeof b === 'string') return b.replace(/\/$/, '');
            } catch (e) {
                /* fall through */
            }
        }
        const fromWindow =
            (typeof window !== 'undefined' &&
                typeof window.SEBS_API_BASE_URL === 'string' &&
                window.SEBS_API_BASE_URL.trim()) ||
            (typeof window !== 'undefined' &&
                typeof window.VITE_API_BASE_URL === 'string' &&
                window.VITE_API_BASE_URL.trim()) ||
            '';
        const normalize = (raw) => {
            if (!raw || typeof raw !== 'string') return '';
            const u = raw.trim().replace(/\/$/, '');
            if (!u) return '';
            if (u.endsWith('/api')) return u;
            return u + '/api';
        };
        const n = normalize(fromWindow);
        if (n) return n;

        const loc = typeof window !== 'undefined' ? window.location : null;
        if (!loc || !loc.hostname) {
            return 'http://localhost:8006/api';
        }
        const sameOrigin = (loc.origin || '').replace(/\/$/, '') + '/api';
        if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
            return sameOrigin;
        }
        if (String(loc.hostname).toLowerCase() === 'sebs-z9tr.onrender.com') {
            return sameOrigin;
        }
        const h = String(loc.hostname).toLowerCase();
        const needsRemote =
            h === 'sebsglobal.com' ||
            h === 'www.sebsglobal.com' ||
            h.endsWith('.vercel.app') ||
            h.endsWith('.pages.dev') ||
            h.endsWith('.netlify.app') ||
            h.endsWith('.cloudflarepages.com');
        if (needsRemote) {
            return normalize('https://sebs-z9tr.onrender.com');
        }
        return sameOrigin;
    }

    function getRunStorageKey(simulationId) {
        return RUN_PREFIX + simulationId;
    }

    /** Simülasyon sayfalarında supabase-auth.js yok; Supabase session sb-*-auth-token içinde */
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

    async function getAuthBearer() {
        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
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
        const legacy = localStorage.getItem('authToken');
        if (legacy) return legacy;
        return getSupabaseAccessTokenFromStorage();
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
        /** Skor / maksimum puana göre seviye etiketi (Türkçe, küçük harf) */
        finalGradeFromScore(score, maxScore) {
            const max = maxScore != null && Number(maxScore) > 0 ? Number(maxScore) : 100;
            const s = Math.max(0, Number(score) || 0);
            const pct = max > 0 ? (s / max) * 100 : s;
            if (pct >= 90) return 'çok iyi';
            if (pct >= 75) return 'iyi';
            if (pct >= 50) return 'orta';
            return 'zayıf';
        },

        /**
         * Simülasyon başladığında sunucuya kaydet; dönen runId oturumda saklanır.
         */
        async recordStart(simulationId, simulationName, data = {}) {
            const token = await getAuthBearer();
            if (!token || !simulationId) {
                return null;
            }
            let moduleId = data.moduleId || null;
            if (!moduleId && data.moduleName) {
                moduleId = await resolveModuleId(data.moduleName);
            }
            const apiBase = resolveSimulationApiBase();
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
                const result = await response.json().catch(() => ({}));
                if (result && result.success && result.data && result.data.runId) {
                    sessionStorage.setItem(getRunStorageKey(simulationId), result.data.runId);
                    return result.data.runId;
                }
                if (!response.ok || !result.success) {
                    console.warn(
                        'Simulation start API:',
                        response.status,
                        result.message || result.error || ''
                    );
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
            const token = await getAuthBearer();

            if (!token) {
                console.log('No auth token for simulation tracking (giriş yapın veya Supabase oturumu gerekli)');
                return;
            }

            const score = data.score != null ? Number(data.score) : 0;
            const timeSpent =
                data.timeSpentSeconds != null
                    ? Number(data.timeSpentSeconds)
                    : data.time_spent_seconds != null
                      ? Number(data.time_spent_seconds)
                      : data.timeSpent || 0;
            const attempts = (data.attemptsCount ?? data.attempts_count ?? data.attempts) || 1;
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

            const maxScoreRaw = data.maxScore ?? data.max_score;
            const maxScoreForGrade =
                maxScoreRaw != null && maxScoreRaw !== '' && !Number.isNaN(Number(maxScoreRaw))
                    ? Number(maxScoreRaw)
                    : 100;
            const finalGrade =
                data.finalGradeLabel ??
                data.final_grade_label ??
                (window.SimulationTracker.finalGradeFromScore
                    ? window.SimulationTracker.finalGradeFromScore(score, maxScoreForGrade)
                    : null);

            const payload = {
                simulationId: simulationId,
                simulationName: simulationName,
                score,
                flagsFound: data.flagsFound || [],
                timeSpent,
                timeSpentSeconds: timeSpent,
                moduleName: data.moduleName || null,
                moduleId,
                attempts,
                attemptsCount: attempts,
                correctCount,
                wrongCount,
                successRate: data.successRate ?? data.success_rate,
                wrongActionsCount: data.wrongActionsCount ?? data.wrong_actions_count ?? wrongCount,
                hintUsedCount: data.hintUsedCount ?? data.hint_used_count ?? 0,
                resetCount: data.resetCount ?? data.reset_count ?? 0,
                stepCompletionTimes: data.stepCompletionTimes ?? data.step_completion_times,
                finalGradeLabel: finalGrade,
                passed,
                runId
            };
            if (maxScoreRaw != null && maxScoreRaw !== '' && !Number.isNaN(Number(maxScoreRaw))) {
                payload.maxScore = Number(maxScoreRaw);
            }

            try {
                let result;
                const apiBase = resolveSimulationApiBase();
                let response = await fetch(apiBase + '/simulations/complete', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                result = await response.json().catch(() => ({}));
                if (!response.ok && response.status === 404 && payload.runId) {
                    sessionStorage.removeItem(getRunStorageKey(simulationId));
                    const retryPayload = Object.assign({}, payload);
                    delete retryPayload.runId;
                    response = await fetch(apiBase + '/simulations/complete', {
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(retryPayload)
                    });
                    result = await response.json().catch(() => ({}));
                }
                if (!result.success || !response.ok) {
                    console.warn(
                        'Simülasyon kaydı:',
                        response.status,
                        result.message || result.error || JSON.stringify(result).slice(0, 200)
                    );
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

                    if (data.redirectToDashboard !== false) {
                        window.location.replace('/dashboard.html');
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
