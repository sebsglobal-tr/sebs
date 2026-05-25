(function () {
    'use strict';

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function statusBadgeClass(status) {
        var map = {
            weak: 'bg-rose-100 text-rose-800 border-rose-200',
            strong: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
            not_started: 'bg-slate-100 text-slate-600 border-slate-200',
        };
        return map[status] || map.not_started;
    }

    function renderMlSection(report) {
        var ml = report.ml || {};
        var i = report.interpretation || {};
        if (!ml.available && !ml.profile) return '';
        var html = '<section class="report-card report-card--hero">';
        html += '<h2><i class="fas fa-robot text-blue-600"></i> Yapay zeka öğrenme profili</h2>';
        if (ml.profile) {
            html += '<p class="report-hero-profile">' + escapeHtml(ml.profile);
            if (ml.confidencePercent != null) {
                html += ' <span class="report-muted">(güven %' + escapeHtml(String(ml.confidencePercent)) + ')</span>';
            }
            html += '</p>';
        }
        if (i.mlProfile) html += '<p class="report-lead">' + escapeHtml(i.mlProfile) + '</p>';
        if (ml.probabilities && typeof ml.probabilities === 'object') {
            html += '<div class="report-proba-bars">';
            Object.keys(ml.probabilities)
                .map(function (k) {
                    return { label: k, pct: Math.round(ml.probabilities[k] * 1000) / 10 };
                })
                .sort(function (a, b) {
                    return b.pct - a.pct;
                })
                .forEach(function (p) {
                    html +=
                        '<div class="report-proba-row"><span class="report-proba-label">' +
                        escapeHtml(p.label) +
                        '</span><div class="report-proba-track"><div class="report-proba-fill" style="width:' +
                        p.pct +
                        '%"></div></div><span class="report-proba-pct">%' +
                        p.pct +
                        '</span></div>';
                });
            html += '</div>';
        }
        if (ml.fallback) {
            html +=
                '<p class="report-note"><i class="fas fa-info-circle"></i> Tam XGBoost modeli sunucuda yüklenemedi; skorlarınıza göre yaklaşık profil gösteriliyor.</p>';
        }
        html += '</section>';
        return html;
    }

    function renderTheoryPractice(d) {
        if (!d) return '';
        var tvp = d.theoryVsPractice || {};
        var html = '<section class="report-card">';
        html += '<h2><i class="fas fa-balance-scale text-indigo-600"></i> Teori ve pratik dengesi</h2>';
        html += '<div class="report-tvp-bars">';
        html +=
            '<div class="report-tvp-item"><span>Quiz (teori)</span><div class="report-tvp-track"><div class="report-tvp-fill report-tvp-fill--theory" style="width:' +
            Math.min(100, tvp.theory || 0) +
            '%"></div></div><strong>%' +
            Math.round(tvp.theory || 0) +
            '</strong></div>';
        html +=
            '<div class="report-tvp-item"><span>Simülasyon (pratik)</span><div class="report-tvp-track"><div class="report-tvp-fill report-tvp-fill--practice" style="width:' +
            Math.min(100, tvp.practice || 0) +
            '%"></div></div><strong>%' +
            Math.round(tvp.practice || 0) +
            '</strong></div>';
        html += '</div>';
        if (tvp.explanation) html += '<p class="report-lead">' + escapeHtml(tvp.explanation) + '</p>';
        html += '</section>';
        return html;
    }

    function renderModuleCard(m) {
        var html = '<article class="report-module" data-status="' + escapeHtml(m.status) + '">';
        html += '<header class="report-module__head">';
        html += '<h3>' + escapeHtml(m.title) + '</h3>';
        html +=
            '<span class="report-badge ' +
            statusBadgeClass(m.status) +
            '">' +
            escapeHtml(m.statusLabel) +
            '</span>';
        html += '</header>';
        html += '<ul class="report-module__meta">';
        html += '<li>İlerleme: <strong>%' + escapeHtml(String(m.percentComplete || 0)) + '</strong></li>';
        if (m.timeSpentMinutes) html += '<li>Süre: <strong>' + Math.round(m.timeSpentMinutes) + ' dk</strong></li>';
        if (m.quizAverage != null) html += '<li>Quiz ort.: <strong>%' + m.quizAverage + '</strong></li>';
        if (m.simulationBest != null) html += '<li>En iyi sim.: <strong>%' + m.simulationBest + '</strong></li>';
        html += '</ul>';

        if (m.issues && m.issues.length) {
            html += '<div class="report-block report-block--warn"><h4><i class="fas fa-exclamation-triangle"></i> Tespit edilen eksikler</h4><ul>';
            m.issues.forEach(function (x) {
                html += '<li>' + escapeHtml(x) + '</li>';
            });
            html += '</ul></div>';
        }

        if (m.quizzes && m.quizzes.length) {
            html += '<div class="report-block"><h4><i class="fas fa-clipboard-check"></i> Ders / quiz analizi</h4>';
            m.quizzes.forEach(function (q) {
                html += '<div class="report-subitem">';
                html += '<p class="report-subitem__title">' + escapeHtml(q.quizTitle || q.quizId) + ' — %' + Math.round(q.score || 0) + '</p>';
                if (q.wrongAnswers > 0) {
                    html +=
                        '<p class="report-subitem__detail"><span class="text-rose-700">' +
                        q.wrongAnswers +
                        ' yanlış</span>';
                    if (q.correctAnswers > 0) html += ', ' + q.correctAnswers + ' doğru';
                    html += '</p>';
                }
                html += '<p class="report-subitem__analysis">' + escapeHtml(q.analysis) + '</p>';
                html += '</div>';
            });
            html += '</div>';
        }

        if (m.simulations && m.simulations.length) {
            html += '<div class="report-block"><h4><i class="fas fa-gamepad"></i> Simülasyon analizi</h4>';
            m.simulations.forEach(function (s) {
                html += '<div class="report-subitem">';
                html += '<p class="report-subitem__title">' + escapeHtml(s.title) + ' — %' + Math.round(s.score || 0) + '</p>';
                html += '<p class="report-subitem__analysis">' + escapeHtml(s.analysis) + '</p>';
                html += '</div>';
            });
            html += '</div>';
        }

        if (m.recommendations && m.recommendations.length) {
            html += '<div class="report-block report-block--tip"><h4><i class="fas fa-lightbulb"></i> Bu modül için tavsiyeler</h4><ul>';
            m.recommendations.forEach(function (r) {
                html += '<li>' + escapeHtml(r) + '</li>';
            });
            html += '</ul></div>';
        }

        html += '</article>';
        return html;
    }

    function renderReport(report) {
        var d = report.detailed || {};
        var s = report.scores || {};
        var root = document.getElementById('reportRoot');
        if (!root) return;

        var html = '';

        html += '<header class="report-page-header">';
        html += '<p class="report-page-kicker">SEBS Global · Kişisel öğrenme raporu</p>';
        html += '<h1>' + escapeHtml(d.userName || 'Öğrenci') + '</h1>';
        html +=
            '<p class="report-page-meta">Oluşturulma: ' +
            escapeHtml(new Date(report.generatedAt || Date.now()).toLocaleString('tr-TR')) +
            ' · Genel skor <strong>%' +
            escapeHtml(String(s.overall != null ? s.overall : '-')) +
            '</strong></p>';
        html += '</header>';

        if (d.executiveSummary) {
            html += '<section class="report-card">';
            html += '<h2><i class="fas fa-file-alt text-slate-700"></i> Yönetici özeti</h2>';
            html += '<p class="report-lead">' + escapeHtml(d.executiveSummary) + '</p>';
            html += '</section>';
        }

        html += renderMlSection(report);
        html += renderTheoryPractice(d);

        html += '<section class="report-card">';
        html += '<h2><i class="fas fa-chart-bar text-blue-600"></i> Skor özeti</h2>';
        html += '<div class="report-stats-grid">';
        html += '<div class="report-stat"><span>Quiz ort.</span><strong>%' + (s.quizAverage != null ? s.quizAverage : '-') + '</strong><small>' + (s.quizCount || 0) + ' quiz</small></div>';
        html +=
            '<div class="report-stat"><span>Simülasyon ort.</span><strong>%' +
            (s.simulationAverage != null ? s.simulationAverage : '-') +
            '</strong><small>' +
            (s.simulationCount || 0) +
            ' sim.</small></div>';
        html +=
            '<div class="report-stat"><span>Çalışma süresi</span><strong>' +
            Math.round((s.totalTimeMinutes || 0) / 60) +
            ' sa</strong><small>modül süreleri</small></div>';
        html +=
            '<div class="report-stat"><span>Modül sayısı</span><strong>' +
            (d.stats && d.stats.moduleCount != null ? d.stats.moduleCount : '-') +
            '</strong><small>' +
            (d.stats && d.stats.weakCount ? d.stats.weakCount + ' geliştirilmeli' : '') +
            '</small></div>';
        html += '</div></section>';

        if (d.globalGaps && d.globalGaps.length) {
            html += '<section class="report-card">';
            html += '<h2><i class="fas fa-search text-amber-600"></i> Genel boşluklar ve nedenler</h2>';
            d.globalGaps.forEach(function (g) {
                html += '<div class="report-gap">';
                html += '<h3>' + escapeHtml(g.title) + '</h3>';
                html += '<p>' + escapeHtml(g.description) + '</p>';
                html += '</div>';
            });
            html += '</section>';
        }

        if (d.modules && d.modules.length) {
            html += '<section class="report-card">';
            html += '<h2><i class="fas fa-book-open text-emerald-600"></i> Modül modül ayrıntılı analiz</h2>';
            html += '<p class="report-muted">Hangi derste ne eksik, quiz ve simülasyonlarda nerede zorlandığınız.</p>';
            html += '<div class="report-modules">';
            d.modules.forEach(function (m) {
                html += renderModuleCard(m);
            });
            html += '</div></section>';
        }

        if (d.unstartedModules && d.unstartedModules.length) {
            html += '<section class="report-card">';
            html += '<h2><i class="fas fa-hourglass-start"></i> Henüz başlanmamış modüller</h2><ul class="report-simple-list">';
            d.unstartedModules.forEach(function (u) {
                html += '<li><strong>' + escapeHtml(u.title) + '</strong> — ' + escapeHtml(u.reason) + '</li>';
            });
            html += '</ul></section>';
        }

        if (d.studyPlan && d.studyPlan.length) {
            html += '<section class="report-card">';
            html += '<h2><i class="fas fa-calendar-check text-violet-600"></i> Önerilen çalışma planı</h2>';
            d.studyPlan.forEach(function (w) {
                html += '<div class="report-week">';
                html += '<h3>Hafta ' + w.week + ': ' + escapeHtml(w.focus) + '</h3><ul>';
                (w.actions || []).forEach(function (a) {
                    html += '<li>' + escapeHtml(a) + '</li>';
                });
                html += '</ul></div>';
            });
            html += '</section>';
        }

        if (d.personalizedAdvice && d.personalizedAdvice.length) {
            html += '<section class="report-card report-card--advice">';
            html += '<h2><i class="fas fa-user-graduate text-blue-600"></i> Kişisel tavsiyeler</h2><ol class="report-advice-list">';
            d.personalizedAdvice.forEach(function (a, idx) {
                html += '<li><span class="report-advice-num">' + (idx + 1) + '</span>' + escapeHtml(a) + '</li>';
            });
            html += '</ol></section>';
        }

        var interp = report.interpretation || {};
        if (interp.strengths && interp.strengths.length) {
            html += '<section class="report-card"><h2>Güçlü yönler</h2><ul class="report-simple-list">';
            interp.strengths.forEach(function (x) {
                html += '<li>' + escapeHtml(x) + '</li>';
            });
            html += '</ul></section>';
        }

        root.innerHTML = html;
        document.getElementById('reportLoading').classList.add('hidden');
        root.classList.remove('hidden');
    }

    window.loadDetailedEvaluationReport = async function () {
        var loading = document.getElementById('reportLoading');
        var errBox = document.getElementById('reportError');
        var root = document.getElementById('reportRoot');
        if (loading) loading.classList.remove('hidden');
        if (errBox) errBox.classList.add('hidden');
        if (root) root.classList.add('hidden');

        var token = typeof window.getAuthToken === 'function' ? await window.getAuthToken() : localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login.html?redirect=' + encodeURIComponent('/degerlendirme-raporu.html');
            return;
        }

        var apiBase =
            typeof window.getSebsApiBase === 'function'
                ? window.getSebsApiBase()
                : typeof window.getApiBaseUrl === 'function'
                  ? window.getApiBaseUrl()
                  : (window.location.origin || '').replace(/\/$/, '') + '/api';

        try {
            var response = await fetch(apiBase + '/evaluation/report', {
                headers: { Authorization: 'Bearer ' + token },
            });
            if (response.status === 401) {
                window.location.href = '/login.html?redirect=' + encodeURIComponent('/degerlendirme-raporu.html');
                return;
            }
            var data = await response.json();
            if (!response.ok || !data.success || !data.data) {
                throw new Error(data.message || 'Rapor alınamadı');
            }
            renderReport(data.data);
            try {
                var bf =
                    typeof window.buildBigFiveReportAppendixHtml === 'function'
                        ? window.buildBigFiveReportAppendixHtml()
                        : '';
                if (bf && root) root.innerHTML += bf;
            } catch (e) {
                /* ignore */
            }
        } catch (err) {
            if (loading) loading.classList.add('hidden');
            if (errBox) {
                errBox.classList.remove('hidden');
                errBox.textContent = err.message || 'Rapor yüklenemedi.';
            }
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof window.getAuthToken !== 'function') {
            window.getAuthToken = async function () {
                try {
                    if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                        var sess = await window.supabaseAuthSystem.supabase.auth.getSession();
                        if (sess.data.session && sess.data.session.access_token) {
                            return sess.data.session.access_token;
                        }
                    }
                } catch (e) {
                    /* ignore */
                }
                return localStorage.getItem('authToken');
            };
        }
        window.loadDetailedEvaluationReport();
    });
})();
