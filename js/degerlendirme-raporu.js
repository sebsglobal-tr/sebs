(function () {
    'use strict';

    var REPORT_NAV = [
        { id: 'report-ozet', label: 'Özet', icon: 'fa-file-alt' },
        { id: 'report-ai', label: 'AI profili', icon: 'fa-robot', optional: true },
        { id: 'report-teori', label: 'Teori / pratik', icon: 'fa-balance-scale' },
        { id: 'report-skor', label: 'Skorlar', icon: 'fa-chart-bar' },
        { id: 'report-bosluklar', label: 'Boşluklar', icon: 'fa-search', optional: true },
        { id: 'report-tavsiyeler', label: 'Kişisel tavsiyeler', icon: 'fa-user-graduate' },
        { id: 'report-moduller', label: 'Modül analizi', icon: 'fa-book-open', optional: true },
        { id: 'report-baslanmamis', label: 'Başlanmamış', icon: 'fa-hourglass-start', optional: true },
        { id: 'report-plan', label: 'Çalışma planı', icon: 'fa-calendar-check', optional: true },
        { id: 'report-guclu', label: 'Güçlü yönler', icon: 'fa-thumbs-up', optional: true },
    ];

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function sectionOpen(id, extraClass) {
        return (
            '<section id="' +
            escapeHtml(id) +
            '" class="report-section report-card scroll-mt-28 ' +
            (extraClass || '') +
            '" tabindex="-1">'
        );
    }

    function sectionHead(iconClass, icon, title, subtitle) {
        var html = '<div class="report-section-head">';
        html += '<div class="report-section-head__icon ' + iconClass + '"><i class="fas ' + icon + '"></i></div>';
        html += '<div><h2>' + escapeHtml(title) + '</h2>';
        if (subtitle) html += '<p class="report-muted">' + escapeHtml(subtitle) + '</p>';
        html += '</div></div>';
        return html;
    }

    function statusBadgeClass(status) {
        var map = {
            weak: 'bg-rose-100 text-rose-800 border-rose-200',
        strong: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
        not_started: 'bg-slate-100 text-slate-600 border-slate-200',
        };
        return map[status] || map.not_started;
    }

    function priorityLabel(p) {
        var map = { high: 'Yüksek öncelik', medium: 'Orta öncelik', low: 'Rutin' };
        return map[p] || 'Öneri';
    }

    function priorityClass(p) {
        var map = { high: 'report-priority--high', medium: 'report-priority--medium', low: 'report-priority--low' };
        return map[p] || 'report-priority--medium';
    }

    function categoryLabel(c) {
        var map = {
            theory: 'Teori',
            practice: 'Pratik',
            habit: 'Alışkanlık',
            module: 'Modül',
            profile: 'AI profili',
        };
        return map[c] || 'Genel';
    }

    function renderReportNav(presentIds) {
        var present = presentIds || {};
        var links = REPORT_NAV.filter(function (item) {
            if (!item.optional) return true;
            return present[item.id];
        });
        if (!links.length) return '';

        var html = '<nav class="report-nav print:hidden" aria-label="Rapor bölümleri">';
        html += '<p class="report-nav__title"><i class="fas fa-list-ul"></i> Rapor içeriği</p>';
        html += '<div class="report-nav__links">';
        links.forEach(function (item) {
            html +=
                '<a href="#' +
                escapeHtml(item.id) +
                '" class="report-nav__link" data-report-nav="' +
                escapeHtml(item.id) +
                '"><i class="fas ' +
                escapeHtml(item.icon) +
                '"></i><span>' +
                escapeHtml(item.label) +
                '</span></a>';
        });
        html += '</div></nav>';
        return html;
    }

    function renderDetailedAdvice(d) {
        var list = d.detailedAdvice || [];
        if (!list.length && d.personalizedAdvice && d.personalizedAdvice.length) {
            list = d.personalizedAdvice.map(function (text, idx) {
                return {
                    id: 'advice-fallback-' + idx,
                    priority: 'medium',
                    category: 'habit',
                    title: text,
                    why: '',
                    actions: [],
                    timeframe: '',
                };
            });
        }
        if (!list.length) return { html: '', hasSection: false };

        var html = sectionOpen('report-tavsiyeler', 'report-card--advice');
        html += '<h2><i class="fas fa-user-graduate text-blue-600"></i> Kişisel tavsiyeler</h2>';
        html +=
            '<p class="report-muted">Verilerinize göre hazırlanmış öncelikli öneriler. Her kartta neden ve adım adım ne yapmanız gerektiği açıklanır.</p>';
        html += '<div class="report-advice-cards">';

        list.forEach(function (a, idx) {
            html += '<article class="report-advice-card ' + priorityClass(a.priority) + '">';
            html += '<header class="report-advice-card__head">';
            html += '<span class="report-advice-card__num">' + (idx + 1) + '</span>';
            html += '<div class="report-advice-card__titles">';
            html += '<h3>' + escapeHtml(a.title) + '</h3>';
            html += '<div class="report-advice-card__tags">';
            html += '<span class="report-advice-tag ' + priorityClass(a.priority) + '">' + escapeHtml(priorityLabel(a.priority)) + '</span>';
            if (a.category) {
                html += '<span class="report-advice-tag report-advice-tag--cat">' + escapeHtml(categoryLabel(a.category)) + '</span>';
            }
            if (a.timeframe) {
                html += '<span class="report-advice-tag report-advice-tag--time"><i class="fas fa-clock"></i> ' + escapeHtml(a.timeframe) + '</span>';
            }
            html += '</div></div></header>';

            if (a.why) {
                html += '<div class="report-advice-card__why">';
                html += '<h4><i class="fas fa-question-circle"></i> Neden?</h4>';
                html += '<p>' + escapeHtml(a.why) + '</p>';
                html += '</div>';
            }

            if (a.actions && a.actions.length) {
                html += '<div class="report-advice-card__actions">';
                html += '<h4><i class="fas fa-tasks"></i> Yapılacaklar</h4><ol>';
                a.actions.forEach(function (act) {
                    html += '<li>' + escapeHtml(act) + '</li>';
                });
                html += '</ol></div>';
            }

            if (a.relatedSection) {
                var linkLabel = a.relatedModuleTitle
                    ? 'Modül analizine git: ' + a.relatedModuleTitle
                    : 'İlgili bölüme git';
                html +=
                    '<a href="#' +
                    escapeHtml(a.relatedSection) +
                    '" class="report-advice-card__jump"><i class="fas fa-arrow-down"></i> ' +
                    escapeHtml(linkLabel) +
                    '</a>';
            }

            html += '</article>';
        });

        html += '</div></section>';
        return { html: html, hasSection: true };
    }

    function renderMlSection(report) {
        var ml = report.ml || {};
        var i = report.interpretation || {};
        if (!ml.available && !ml.profile) return { html: '', hasSection: false };

        var html = sectionOpen('report-ai', 'report-card--hero');
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
        return { html: html, hasSection: true };
    }

    function renderTheoryPractice(d) {
        if (!d || !d.theoryVsPractice) return { html: '', hasSection: false };
        var tvp = d.theoryVsPractice;
        var html = sectionOpen('report-teori');
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
        return { html: html, hasSection: true };
    }

    function moduleAnchorId(m) {
        return 'report-modul-' + String(m.moduleId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    }

    function moduleProgressTone(status) {
        if (status === 'weak') return 'report-progress--weak';
        if (status === 'completed' || status === 'strong') return 'report-progress--strong';
        return 'report-progress--active';
    }

    function renderModuleCard(m) {
        var pct = Math.min(100, Math.max(0, Number(m.percentComplete) || 0));
        var html =
            '<article id="' +
            escapeHtml(moduleAnchorId(m)) +
            '" class="report-module scroll-mt-28" data-status="' +
            escapeHtml(m.status) +
            '">';
        html += '<div class="report-module__accent" aria-hidden="true"></div>';
        html += '<div class="report-module__inner">';
        html += '<header class="report-module__head">';
        html += '<div class="report-module__title-wrap">';
        html += '<span class="report-module__icon"><i class="fas fa-layer-group" aria-hidden="true"></i></span>';
        html += '<h3>' + escapeHtml(m.title) + '</h3>';
        html += '</div>';
        html +=
            '<span class="report-badge ' +
            statusBadgeClass(m.status) +
            '">' +
            escapeHtml(m.statusLabel) +
            '</span>';
        html += '</header>';
        html += '<div class="report-module__progress">';
        html += '<div class="report-module__progress-label"><span>İlerleme</span><strong>%' + pct + '</strong></div>';
        html +=
            '<div class="report-progress-track"><div class="report-progress-fill ' +
            moduleProgressTone(m.status) +
            '" style="width:' +
            pct +
            '%"></div></div>';
        html += '</div>';
        html += '<div class="report-chip-row">';
        if (m.timeSpentMinutes) {
            html += '<span class="report-chip"><i class="fas fa-clock"></i> ' + Math.round(m.timeSpentMinutes) + ' dk</span>';
        }
        if (m.quizAverage != null) {
            html += '<span class="report-chip"><i class="fas fa-clipboard-check"></i> Quiz %' + m.quizAverage + '</span>';
        }
        if (m.simulationBest != null) {
            html += '<span class="report-chip"><i class="fas fa-gamepad"></i> Sim. %' + m.simulationBest + '</span>';
        }
        html += '</div>';

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

        html += '</div></article>';
        return html;
    }

    function renderUnstartedSection(d) {
        var list = d.unstartedModules || [];
        if (!list.length) return '';
        var total = d.unstartedTotal != null ? d.unstartedTotal : list.length;
        var html = sectionOpen('report-baslanmamis', 'report-card report-card--muted');
        html += '<div class="report-section-head">';
        html += '<div class="report-section-head__icon report-section-head__icon--slate"><i class="fas fa-compass"></i></div>';
        html += '<div><h2>Henüz başlanmamış modüller</h2>';
        html += '<p class="report-muted">' + escapeHtml(d.unstartedSummary || '') + '</p></div>';
        html += '<span class="report-count-pill">' + total + ' modül</span>';
        html += '</div>';
        html += '<div class="report-unstarted-grid">';
        list.forEach(function (u) {
            html += '<a href="/modules.html" class="report-unstarted-card">';
            html += '<span class="report-unstarted-card__icon"><i class="fas fa-book-open"></i></span>';
            html += '<span class="report-unstarted-card__title">' + escapeHtml(u.title) + '</span>';
            html += '<span class="report-unstarted-card__cta">Modüllere git <i class="fas fa-arrow-right"></i></span>';
            html += '</a>';
        });
        html += '</div>';
        if (total > list.length) {
            html +=
                '<p class="report-more-note">+ ' +
                (total - list.length) +
                ' modül daha — tam listeyi <a href="/modules.html">eğitim modülleri</a> sayfasında görebilirsiniz.</p>';
        }
        html += '</section>';
        return html;
    }

    function renderStudyPlanWeek(w) {
        var html = '<div class="report-week">';
        html += '<div class="report-week__badge">H' + escapeHtml(String(w.week)) + '</div>';
        html += '<div class="report-week__body">';
        html += '<h3>' + escapeHtml(w.focus) + '</h3>';
        if (w.goal) {
            html += '<p class="report-week__goal"><i class="fas fa-bullseye"></i> ' + escapeHtml(w.goal) + '</p>';
        }
        if (w.weeklyHours || w.rhythm) {
            html += '<div class="report-week__meta">';
            if (w.weeklyHours) {
                html += '<span class="report-week__meta-item"><i class="fas fa-clock"></i> ' + escapeHtml(w.weeklyHours) + '</span>';
            }
            if (w.rhythm) {
                html += '<span class="report-week__meta-item"><i class="fas fa-calendar-day"></i> ' + escapeHtml(w.rhythm) + '</span>';
            }
            html += '</div>';
        }
        if (w.howToStudy) {
            html +=
                '<div class="report-week__method"><h4><i class="fas fa-graduation-cap"></i> Nasıl çalışmalısınız?</h4><p>' +
                escapeHtml(w.howToStudy) +
                '</p></div>';
        }
        if (w.dailyPlan && w.dailyPlan.length) {
            html += '<div class="report-week__days"><h4><i class="fas fa-list-check"></i> Günlük plan</h4>';
            w.dailyPlan.forEach(function (day) {
                html += '<div class="report-day-plan">';
                html += '<div class="report-day-plan__head"><span class="report-day-plan__day">' + escapeHtml(day.day) + '</span>';
                html += '<span class="report-day-plan__title">' + escapeHtml(day.title) + '</span></div>';
                if (day.tasks && day.tasks.length) {
                    html += '<ul>';
                    day.tasks.forEach(function (t) {
                        html += '<li>' + escapeHtml(t) + '</li>';
                    });
                    html += '</ul>';
                }
                html += '</div>';
            });
            html += '</div>';
        }
        if (w.steps && w.steps.length) {
            html += '<div class="report-week__steps"><h4><i class="fas fa-shoe-prints"></i> Adım adım ne yapmalısınız?</h4>';
            w.steps.forEach(function (step, idx) {
                html += '<div class="report-step-card">';
                html += '<span class="report-step-card__num">' + (idx + 1) + '</span>';
                html += '<div><strong>' + escapeHtml(step.title) + '</strong>';
                html += '<p>' + escapeHtml(step.detail) + '</p></div></div>';
            });
            html += '</div>';
        }
        if (w.successCriteria && w.successCriteria.length) {
            html += '<div class="report-week__success"><h4><i class="fas fa-flag-checkered"></i> Hafta sonu başarı kriterleri</h4><ul class="report-success-list">';
            w.successCriteria.forEach(function (c) {
                html += '<li>' + escapeHtml(c) + '</li>';
            });
            html += '</ul></div>';
        }
        if ((!w.steps || !w.steps.length) && w.actions && w.actions.length) {
            html += '<ul class="report-week__legacy">';
            w.actions.forEach(function (a) {
                html += '<li>' + escapeHtml(a) + '</li>';
            });
            html += '</ul>';
        }
        html += '</div></div>';
        return html;
    }

    function renderGapCards(gaps) {
        var html = '';
        gaps.forEach(function (g) {
            var sev = g.severity === 'high' ? 'report-gap-card--high' : 'report-gap-card--medium';
            html += '<div class="report-gap-card ' + sev + '">';
            html += '<div class="report-gap-card__icon"><i class="fas fa-info-circle"></i></div>';
            html += '<div><h3>' + escapeHtml(g.title) + '</h3><p>' + escapeHtml(g.description) + '</p></div>';
            html += '</div>';
        });
        return html;
    }

    function initReportNav() {
        var navLinks = document.querySelectorAll('[data-report-nav]');
        var sections = [];
        navLinks.forEach(function (link) {
            var id = link.getAttribute('data-report-nav');
            var el = document.getElementById(id);
            if (el) sections.push({ id: id, el: el, link: link });
        });

        function setActive(id) {
            navLinks.forEach(function (l) {
                l.classList.toggle('report-nav__link--active', l.getAttribute('data-report-nav') === id);
            });
        }

        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var id = link.getAttribute('data-report-nav');
                var target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActive(id);
                    if (history.replaceState) {
                        history.replaceState(null, '', '#' + id);
                    }
                }
            });
        });

        if ('IntersectionObserver' in window && sections.length) {
            var observer = new IntersectionObserver(
                function (entries) {
                    var visible = entries
                        .filter(function (en) {
                            return en.isIntersecting;
                        })
                        .sort(function (a, b) {
                            return b.intersectionRatio - a.intersectionRatio;
                        });
                    if (visible[0]) setActive(visible[0].target.id);
                },
                { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] }
            );
            sections.forEach(function (s) {
                observer.observe(s.el);
            });
        }
    }

    function renderReport(report) {
        var d = report.detailed || {};
        var s = report.scores || {};
        var root = document.getElementById('reportRoot');
        if (!root) return;

        var mlBlock = renderMlSection(report);
        var tvpBlock = renderTheoryPractice(d);
        var hasAdvice =
            (d.detailedAdvice && d.detailedAdvice.length) || (d.personalizedAdvice && d.personalizedAdvice.length);

        var present = {
            'report-ozet': !!d.executiveSummary,
            'report-ai': mlBlock.hasSection,
            'report-teori': tvpBlock.hasSection,
            'report-skor': true,
            'report-bosluklar': !!(d.globalGaps && d.globalGaps.length),
            'report-tavsiyeler': hasAdvice,
            'report-moduller': !!(d.modules && d.modules.length),
            'report-baslanmamis': !!(d.unstartedModules && d.unstartedModules.length),
            'report-plan': !!(d.studyPlan && d.studyPlan.length),
            'report-guclu': !!(report.interpretation && report.interpretation.strengths && report.interpretation.strengths.length),
        };

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

        html += renderReportNav(present);

        if (d.executiveSummary) {
            html += sectionOpen('report-ozet');
            html += sectionHead('report-section-head__icon--slate', 'fa-file-alt', 'Yönetici özeti', '');
            html += '<p class="report-lead">' + escapeHtml(d.executiveSummary) + '</p>';
            html += '</section>';
        }

        html += mlBlock.html;
        html += tvpBlock.html;

        html += sectionOpen('report-skor', 'report-card--stats');
        html += sectionHead('report-section-head__icon--blue', 'fa-chart-bar', 'Skor özeti', 'Platform genelinde ölçülen performans göstergeleri');
        html += '<div class="report-stats-grid">';
        html +=
            '<div class="report-stat report-stat--premium"><div class="report-stat__icon"><i class="fas fa-clipboard-check"></i></div><span>Quiz ort.</span><strong>%' +
            (s.quizAverage != null ? s.quizAverage : '-') +
            '</strong><small>' +
            (s.quizCount || 0) +
            ' quiz</small></div>';
        html +=
            '<div class="report-stat report-stat--premium"><div class="report-stat__icon"><i class="fas fa-gamepad"></i></div><span>Simülasyon ort.</span><strong>%' +
            (s.simulationAverage != null ? s.simulationAverage : '-') +
            '</strong><small>' +
            (s.simulationCount || 0) +
            ' sim.</small></div>';
        html +=
            '<div class="report-stat report-stat--premium"><div class="report-stat__icon"><i class="fas fa-hourglass-half"></i></div><span>Çalışma süresi</span><strong>' +
            Math.round((s.totalTimeMinutes || 0) / 60) +
            ' sa</strong><small>modül süreleri</small></div>';
        html +=
            '<div class="report-stat report-stat--premium"><div class="report-stat__icon"><i class="fas fa-book-open"></i></div><span>Aktif modül</span><strong>' +
            (d.stats && d.stats.moduleCount != null ? d.stats.moduleCount : '-') +
            '</strong><small>' +
            (d.stats && d.stats.weakCount ? d.stats.weakCount + ' geliştirilmeli' : 'analiz edildi') +
            '</small></div>';
        html += '</div></section>';

        if (d.globalGaps && d.globalGaps.length) {
            html += sectionOpen('report-bosluklar');
            html += sectionHead('report-section-head__icon--amber', 'fa-search', 'Genel boşluklar ve nedenler', '');
            html += renderGapCards(d.globalGaps);
            html += '</section>';
        }

        html += renderDetailedAdvice(d).html;

        if (d.modules && d.modules.length) {
            html += sectionOpen('report-moduller');
            html += sectionHead(
                'report-section-head__icon--emerald',
                'fa-book-open',
                'Modül modül ayrıntılı analiz',
                'Yalnızca başladığınız veya tamamladığınız modüller'
            );
            html += '<div class="report-modules">';
            d.modules.forEach(function (m) {
                html += renderModuleCard(m);
            });
            html += '</div></section>';
        }

        html += renderUnstartedSection(d);

        if (d.studyPlan && d.studyPlan.length) {
            html += sectionOpen('report-plan', 'report-card--plan');
            html += sectionHead(
                'report-section-head__icon--violet',
                'fa-calendar-check',
                'Önerilen çalışma planı',
                'Ne yapacağınız, nasıl çalışacağınız ve hafta sonu nasıl ölçeceğiniz'
            );
            html += '<div class="report-timeline">';
            d.studyPlan.forEach(function (w) {
                html += renderStudyPlanWeek(w);
            });
            html += '</div></section>';
        }

        var interp = report.interpretation || {};
        if (interp.strengths && interp.strengths.length) {
            html += sectionOpen('report-guclu');
            html += '<h2><i class="fas fa-thumbs-up text-emerald-600"></i> Güçlü yönler</h2><ul class="report-simple-list">';
            interp.strengths.forEach(function (x) {
                html += '<li>' + escapeHtml(x) + '</li>';
            });
            html += '</ul></section>';
        }

        root.innerHTML = html;
        document.getElementById('reportLoading').classList.add('hidden');
        root.classList.remove('hidden');
        initReportNav();

        var hash = (window.location.hash || '').replace('#', '');
        if (hash && document.getElementById(hash)) {
            setTimeout(function () {
                document.getElementById(hash).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
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
