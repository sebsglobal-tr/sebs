/**
 * Dashboard: değerlendirme raporundan kişisel çalışma programı özeti.
 */
(function () {
    'use strict';

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function apiBase() {
        if (typeof window.getSebsApiBase === 'function') return window.getSebsApiBase();
        if (typeof window.getApiBaseUrl === 'function') return window.getApiBaseUrl();
        return '/api';
    }

    async function authToken() {
        if (typeof window.getAuthToken === 'function') return window.getAuthToken();
        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                var r = await window.supabaseAuthSystem.supabase.auth.getSession();
                return r.data.session && r.data.session.access_token ? r.data.session.access_token : null;
            }
        } catch (e) {
            /* ignore */
        }
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    function setMount(html, state) {
        var mount = document.getElementById('dashboardStudyPlanMount');
        if (!mount) return;
        mount.dataset.state = state || '';
        mount.innerHTML = html;
    }

    function renderLoading() {
        setMount(
            '<div class="dsp-loading">' +
            '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>' +
            '<p>Çalışma programınız raporunuza göre hazırlanıyor…</p></div>',
            'loading'
        );
    }

    function renderError(message) {
        setMount(
            '<div class="dsp-empty dsp-empty--error">' +
            '<i class="fas fa-exclamation-circle" aria-hidden="true"></i>' +
            '<p>' +
            escapeHtml(message) +
            '</p>' +
            '<button type="button" class="dsp-btn" id="dashboardStudyPlanRetry">Tekrar dene</button></div>',
            'error'
        );
        var retry = document.getElementById('dashboardStudyPlanRetry');
        if (retry) retry.addEventListener('click', function () { window.loadDashboardStudyPlan(); });
    }

    function renderEmpty(detailed) {
        var hint =
            'Henüz yeterli modül, quiz veya simülasyon verisi yok. Program oluşturmak için bir modüle başlayın veya değerlendirme testi gönderin.';
        if (detailed && detailed.executiveSummary) {
            hint = 'Rapor özetiniz hazır; haftalık plan için en az bir modülde ilerleme veya test kaydı gerekir.';
        }
        setMount(
            '<div class="dsp-empty">' +
            '<i class="fas fa-calendar-plus" aria-hidden="true"></i>' +
            '<p>' +
            escapeHtml(hint) +
            '</p>' +
            '<div class="dsp-empty__actions">' +
            '<a href="/modules.html" class="dsp-btn dsp-btn--primary">Modüllere git</a>' +
            '<a href="/degerlendirme-raporu.html" class="dsp-btn dsp-btn--ghost">Detaylı rapor</a>' +
            '</div></div>',
            'empty'
        );
    }

    function renderDaySnippet(dailyPlan, maxDays) {
        if (!dailyPlan || !dailyPlan.length) return '';
        var html = '<ul class="dsp-day-snips">';
        dailyPlan.slice(0, maxDays || 2).forEach(function (day) {
            html += '<li><span class="dsp-day-snips__label">' + escapeHtml(day.day) + '</span> ';
            html += '<strong>' + escapeHtml(day.title) + '</strong>';
            if (day.tasks && day.tasks[0]) {
                html += '<span class="dsp-day-snips__task">' + escapeHtml(day.tasks[0]) + '</span>';
            }
            html += '</li>';
        });
        html += '</ul>';
        return html;
    }

    function renderWeek(w, index) {
        var open = index === 0 ? ' open' : '';
        var html = '<details class="dsp-week"' + open + '>';
        html += '<summary class="dsp-week__summary">';
        html += '<span class="dsp-week__badge">H' + escapeHtml(String(w.week)) + '</span>';
        html += '<span class="dsp-week__focus">' + escapeHtml(w.focus) + '</span>';
        if (w.weeklyHours) {
            html += '<span class="dsp-week__hours"><i class="fas fa-clock"></i> ' + escapeHtml(w.weeklyHours) + '</span>';
        }
        html += '</summary>';
        html += '<div class="dsp-week__body">';
        if (w.goal) {
            html += '<p class="dsp-week__goal"><i class="fas fa-bullseye"></i> ' + escapeHtml(w.goal) + '</p>';
        }
        if (w.howToStudy) {
            html +=
                '<div class="dsp-block"><h4>Nasıl çalışmalısınız?</h4><p>' + escapeHtml(w.howToStudy) + '</p></div>';
        }
        if (w.rhythm) {
            html += '<p class="dsp-rhythm"><i class="fas fa-repeat"></i> ' + escapeHtml(w.rhythm) + '</p>';
        }
        html += renderDaySnippet(w.dailyPlan, 3);
        if (w.steps && w.steps.length) {
            html += '<ol class="dsp-steps">';
            w.steps.slice(0, 4).forEach(function (step) {
                html += '<li><strong>' + escapeHtml(step.title) + '</strong> ' + escapeHtml(step.detail) + '</li>';
            });
            html += '</ol>';
        }
        if (w.successCriteria && w.successCriteria.length) {
            html += '<ul class="dsp-criteria">';
            w.successCriteria.forEach(function (c) {
                html += '<li>' + escapeHtml(c) + '</li>';
            });
            html += '</ul>';
        }
        html += '</div></details>';
        return html;
    }

    function renderPlan(report) {
        var detailed = report.detailed || {};
        var plan = detailed.studyPlan || [];
        var scores = report.scores || {};

        if (!plan.length) {
            renderEmpty(detailed);
            return;
        }

        var focusWeek = plan[0];
        var html = '<div class="dsp-panel">';
        html += '<div class="dsp-hero">';
        html += '<p class="dsp-hero__kicker">Raporunuza göre · ' + plan.length + ' haftalık öneri</p>';
        html += '<p class="dsp-hero__focus">Bu hafta odak: <strong>' + escapeHtml(focusWeek.focus) + '</strong></p>';
        if (scores.overall != null) {
            html +=
                '<p class="dsp-hero__meta">Genel skor %' +
                escapeHtml(String(scores.overall)) +
                ' · Program rapor verilerinizden otomatik üretilir.</p>';
        }
        html += '</div>';
        html += '<div class="dsp-weeks">';
        plan.forEach(function (w, i) {
            html += renderWeek(w, i);
        });
        html += '</div>';
        html +=
            '<div class="dsp-footer">' +
            '<a href="/degerlendirme-raporu.html#report-plan" class="dsp-btn dsp-btn--primary">' +
            '<i class="fas fa-file-alt"></i> Tam plan ve modül analizi</a>' +
            '<button type="button" class="dsp-btn dsp-btn--ghost" id="dashboardStudyPlanRefresh">' +
            '<i class="fas fa-sync-alt"></i> Yenile</button></div>';
        html += '</div>';

        setMount(html, 'ready');

        var refresh = document.getElementById('dashboardStudyPlanRefresh');
        if (refresh) {
            refresh.addEventListener('click', function () {
                window.loadDashboardStudyPlan(true);
            });
        }
    }

    async function loadDashboardStudyPlan(force) {
        var mount = document.getElementById('dashboardStudyPlanMount');
        if (!mount) return;

        if (mount.dataset.state === 'ready' && !force) return;

        renderLoading();

        var token = await authToken();
        if (!token) {
            renderError('Çalışma programı için giriş yapmanız gerekiyor.');
            return;
        }

        try {
            var response = await fetch(apiBase() + '/evaluation/report', {
                headers: { Authorization: 'Bearer ' + token },
            });
            if (typeof window.handle401Response === 'function' && window.handle401Response(response)) {
                return;
            }
            var data = await response.json();
            if (!response.ok || !data.success || !data.data) {
                throw new Error((data && data.message) || 'Rapor alınamadı');
            }
            renderPlan(data.data);
        } catch (err) {
            renderError(err.message || 'Program yüklenemedi.');
        }
    }

    window.loadDashboardStudyPlan = loadDashboardStudyPlan;
})();
