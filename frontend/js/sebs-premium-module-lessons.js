/**
 * Sosyal mühendislik modülü ile aynı ilerleme modeli:
 * - content-card başına ders anahtarı (sectionId::h2Id)
 * - syncModuleProgressBulk + yerel STORAGE_KEY
 * - ?ders= URL, TimeTracker, initializeModule(lesson sayısı)
 */
(function (global) {
    'use strict';

    function slugifyAnchor(text) {
        return String(text || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function getSubheadingIconClass(title) {
        var t = String(title || '').trim();
        if (t === 'Kendini Değerlendir' || /^kendini\s+değerlendir$/i.test(t)) return 'fa-clipboard-list';
        if (/^Terimler\s+Sözlüğü/i.test(t) || /^Terimler\s+sözlüğü/i.test(t)) return 'fa-book';
        if (/^Kapanış/i.test(t)) return 'fa-flag-checkered';
        return 'fa-book-open';
    }

    function applyTemelCardLayout() {
        document.querySelectorAll('.section-inner').forEach(function (inner) {
            if (inner.dataset.cardified === '1') return;
            inner.dataset.cardified = '1';
            var h2Blocks = Array.from(inner.children).filter(function (el) {
                return el.tagName === 'H2';
            });
            h2Blocks.forEach(function (h2) {
                if (h2.parentElement !== inner) return;
                var card = document.createElement('div');
                card.className = 'content-card';
                inner.insertBefore(card, h2);
                var node = h2;
                while (node) {
                    var next = node.nextElementSibling;
                    card.appendChild(node);
                    if (next && next.tagName === 'H2') break;
                    node = next;
                }
            });
        });
    }

    function buildSubheadingNav(navSectionList) {
        if (!navSectionList) return;
        navSectionList.querySelectorAll('.nav-sublist').forEach(function (el) {
            el.remove();
        });
        var moduleLinks = Array.from(navSectionList.querySelectorAll('.nav-link-section'));
        moduleLinks.forEach(function (moduleLink) {
            var sectionId = moduleLink.getAttribute('data-section');
            var sectionEl = document.getElementById(sectionId);
            if (!sectionEl) return;
            var parentLi = moduleLink.closest('li');
            if (!parentLi) return;
            parentLi.classList.add('nav-section-item');
            if (!moduleLink.querySelector('.nav-label')) {
                var text = moduleLink.textContent.trim();
                moduleLink.innerHTML =
                    '<span class="nav-label"><i class="fas fa-book"></i> ' +
                    text +
                    '</span><i class="fas fa-chevron-right nav-expand-indicator"></i>';
            }
            var inner = sectionEl.querySelector('.section-inner');
            if (!inner) return;
            var subHeadings = Array.from(inner.querySelectorAll('h2')).filter(function (h) {
                return String(h.textContent || '').trim().length > 0;
            });
            if (!subHeadings.length) return;
            var subList = document.createElement('ul');
            subList.className = 'nav-sublist';
            parentLi.appendChild(subList);
            subHeadings.forEach(function (h2, idx) {
                if (!h2.id) {
                    h2.id = sectionId + '-' + (slugifyAnchor(h2.textContent) || 'sub-' + idx);
                }
                var li = document.createElement('li');
                li.className = 'nav-subitem';
                var icon = getSubheadingIconClass(h2.textContent.trim());
                li.innerHTML =
                    '<a href="#" class="nav-link-sub" data-section="' +
                    sectionId +
                    '" data-anchor="' +
                    h2.id +
                    '"><i class="fas ' +
                    icon +
                    ' subtopic-icon"></i> ' +
                    h2.textContent.trim() +
                    '</a>';
                subList.appendChild(li);
            });
        });
    }

    function enhanceNotes() {
        document.querySelectorAll('.section-inner p').forEach(function (p) {
            var raw = (p.textContent || '').trim();
            if (/^Dikkat\s*:/i.test(raw)) {
                p.classList.add('module-note', 'module-note-warning');
                p.innerHTML = p.innerHTML.replace(/^Dikkat\s*:/i, '<strong>Dikkat:</strong>');
            } else if (/^İpucu\s*:/i.test(raw) || /^Ipucu\s*:/i.test(raw)) {
                p.classList.add('module-note', 'module-note-tip');
                p.innerHTML = p.innerHTML.replace(/^(İpucu|Ipucu)\s*:/i, '<strong>İpucu:</strong>');
            } else if (/^Unutma\s*:/i.test(raw)) {
                p.classList.add('module-note', 'module-note-reminder');
                p.innerHTML = p.innerHTML.replace(/^Unutma\s*:/i, '<strong>Unutma:</strong>');
            } else if (/^(Örnek|Ornek)\s*:/i.test(raw)) {
                p.classList.add('module-note', 'module-note-example');
                p.innerHTML = p.innerHTML.replace(/^(Örnek|Ornek)\s*:/i, '<strong>Örnek:</strong>');
            }
        });
    }

    function enhanceMiniHeadings() {
        var patterns = [
            /^Etki\s*\/\s*risk$/i,
            /^Tespit sinyali\s*\/\s*kanıt$/i,
            /^Savunma kontrolü\s*\/\s*düzeltme yaklaşımı$/i
        ];
        document.querySelectorAll('.section-inner p').forEach(function (p) {
            var raw = (p.textContent || '').trim();
            if (patterns.some(function (re) {
                return re.test(raw);
            })) {
                p.classList.add('section-mini-heading');
            }
        });
    }

    function enhanceRunbookHeadings() {
        var phaseLabels = [
            /^Hazırlık$/i,
            /^Uygulama$/i,
            /^Doğrulama$/i,
            /^Kanıt paketleme$/i,
            /^Geri dönüş\s*\/\s*rollback$/i
        ];
        var platformLabels = [
            /^Windows\s*\(PowerShell\s*\/\s*CLI\)$/i,
            /^Linux$/i,
            /^macOS$/i
        ];
        var stepLabel = /^\d+\./;
        document.querySelectorAll('.section-inner').forEach(function (inner) {
            var section = inner.closest('.content-section');
            if (!section || section.id !== 'modul-0-etik-ve-yasal-cerceve') return;
            Array.from(inner.querySelectorAll('p')).forEach(function (p) {
                var raw = (p.textContent || '').trim();
                if (phaseLabels.some(function (re) {
                    return re.test(raw);
                })) {
                    p.classList.add('runbook-phase-heading');
                } else if (platformLabels.some(function (re) {
                    return re.test(raw);
                })) {
                    p.classList.add('runbook-phase-heading');
                } else if (stepLabel.test(raw)) {
                    p.classList.add('runbook-step-line');
                }
            });
            var targetHeadings = Array.from(inner.querySelectorAll('h2')).filter(function (h) {
                return /^0\.(5|6)\s+/i.test((h.textContent || '').trim());
            });
            targetHeadings.forEach(function (h2) {
                var node = h2.nextElementSibling;
                while (node && node.tagName !== 'H2') {
                    if (node.tagName === 'UL') node.classList.add('runbook-dot-list');
                    node = node.nextElementSibling;
                }
            });
        });
    }

    function tableizeGlossaries() {
        document.querySelectorAll('.section-inner').forEach(function (inner) {
            var glossaryHeadings = Array.from(inner.querySelectorAll('h2')).filter(function (h2) {
                return /^Terimler Sözlüğü$/i.test((h2.textContent || '').trim());
            });
            glossaryHeadings.forEach(function (h2) {
                if (h2.dataset.tableized === '1') return;
                h2.dataset.tableized = '1';
                var rowLines = [];
                var node = h2.nextElementSibling;
                while (node && node.tagName !== 'H2') {
                    var next = node.nextElementSibling;
                    if (node.tagName === 'P') {
                        var text = (node.textContent || '').trim();
                        if (text) rowLines.push(text);
                        node.remove();
                    }
                    node = next;
                }
                if (!rowLines.length) return;
                var rows = rowLines
                    .map(function (line) {
                        return line.split(/\t+/).map(function (part) {
                            return part.trim();
                        }).filter(Boolean);
                    })
                    .map(function (parts) {
                        if (parts.length >= 2) return [parts[0], parts.slice(1).join(' ')];
                        return null;
                    })
                    .filter(Boolean);
                if (!rows.length) return;
                var table = document.createElement('table');
                table.className = 'comparison-table';
                var thead = document.createElement('thead');
                var tbody = document.createElement('tbody');
                table.appendChild(thead);
                table.appendChild(tbody);
                var firstCol = rows[0][0];
                var secondCol = rows[0][1];
                var hasHeader = /terim/i.test(firstCol) && /açıklama|karşılığı|aciklama|karsiligi/i.test(secondCol);
                if (hasHeader) {
                    var trh = document.createElement('tr');
                    trh.innerHTML = '<th>' + firstCol + '</th><th>' + secondCol + '</th>';
                    thead.appendChild(trh);
                    rows.slice(1).forEach(function (row) {
                        var tr = document.createElement('tr');
                        tr.innerHTML = '<td><strong>' + row[0] + '</strong></td><td>' + row[1] + '</td>';
                        tbody.appendChild(tr);
                    });
                } else {
                    var tr0 = document.createElement('tr');
                    tr0.innerHTML = '<th>Terim</th><th>Türkçe karşılığı / açıklama</th>';
                    thead.appendChild(tr0);
                    rows.forEach(function (row) {
                        var tr = document.createElement('tr');
                        tr.innerHTML = '<td><strong>' + row[0] + '</strong></td><td>' + row[1] + '</td>';
                        tbody.appendChild(tr);
                    });
                }
                h2.insertAdjacentElement('afterend', table);
            });
        });
    }

    function collectLessonKeysOrdered() {
        var keys = [];
        document.querySelectorAll('.content-section').forEach(function (sec) {
            var inner = sec.querySelector('.section-inner');
            if (!inner) return;
            inner.querySelectorAll(':scope > .content-card').forEach(function (card, idx) {
                var h2 = card.querySelector(':scope > h2');
                if (!h2) return;
                if (!h2.id) {
                    h2.id = sec.id + '-' + (slugifyAnchor(h2.textContent) || 'lesson-' + idx);
                }
                keys.push(sec.id + '::' + h2.id);
            });
        });
        return keys;
    }

    function wireMobileMenu() {
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        var moduleSidebar = document.querySelector('.module-sidebar');
        if (!mobileMenuToggle || !moduleSidebar) return;
        mobileMenuToggle.addEventListener('click', function () {
            moduleSidebar.classList.toggle('open');
            var icon = mobileMenuToggle.querySelector('i');
            if (moduleSidebar.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        document.addEventListener('click', function (event) {
            if (global.innerWidth <= 1024) {
                if (
                    !moduleSidebar.contains(event.target) &&
                    !mobileMenuToggle.contains(event.target) &&
                    moduleSidebar.classList.contains('open')
                ) {
                    moduleSidebar.classList.remove('open');
                    var ic = mobileMenuToggle.querySelector('i');
                    ic.classList.remove('fa-times');
                    ic.classList.add('fa-bars');
                }
            }
        });
        document.querySelectorAll('.nav-link-section, .nav-link-sub').forEach(function (item) {
            item.addEventListener('click', function () {
                if (global.innerWidth <= 1024) {
                    moduleSidebar.classList.remove('open');
                    var ic2 = mobileMenuToggle.querySelector('i');
                    ic2.classList.remove('fa-times');
                    ic2.classList.add('fa-bars');
                }
            });
        });
    }

    function run(cfg) {
        if (!cfg || !cfg.moduleName || !cfg.storageKey) {
            console.warn('SebsPremiumModuleLessons.run: moduleName ve storageKey gerekli');
            return;
        }
        var MODULE_NAME = cfg.moduleName;
        var STORAGE_KEY = cfg.storageKey;
        var basePath = cfg.basePath || (global.location && global.location.pathname) || '/';

        var sections = document.querySelectorAll('.content-section');
        var navLinks = document.querySelectorAll('.nav-link-section');
        var navSectionList = document.querySelector('.nav-section-list');
        var lessonKeysOrdered = [];
        var progressFill = document.getElementById('progressFill');
        var progressText = document.getElementById('progressText');

        buildSubheadingNav(navSectionList);
        enhanceNotes();
        enhanceMiniHeadings();
        enhanceRunbookHeadings();
        tableizeGlossaries();
        applyTemelCardLayout();

        function getSectionIdsSet() {
            return new Set(Array.from(sections).map(function (s) {
                return s.id;
            }));
        }

        function normalizeCompletedLessons(rawList) {
            var raw = Array.isArray(rawList) ? rawList.map(String) : [];
            var sidSet = getSectionIdsSet();
            var out = new Set();
            raw.forEach(function (entry) {
                if (!entry) return;
                if (entry.indexOf('::') !== -1) {
                    out.add(entry);
                    return;
                }
                if (sidSet.has(entry)) {
                    var expanded = lessonKeysOrdered.filter(function (k) {
                        return k.indexOf(entry + '::') === 0;
                    });
                    if (expanded.length) {
                        expanded.forEach(function (k) {
                            out.add(k);
                        });
                    } else {
                        out.add(entry);
                    }
                } else {
                    out.add(entry);
                }
            });
            return Array.from(out);
        }

        async function loadProgress() {
            var local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            var localDone = normalizeCompletedLessons(local.completedLessons || []);
            var token =
                (global.getProgressAuthToken && (await global.getProgressAuthToken())) ||
                (typeof localStorage !== 'undefined' && localStorage.getItem('authToken'));
            if (!token || !global.getModuleIdFromName) return localDone;
            try {
                var moduleId = await global.getModuleIdFromName(MODULE_NAME);
                if (!moduleId) return localDone;
                var apiBase =
                    typeof global.getSebsApiBase === 'function'
                        ? global.getSebsApiBase()
                        : (global.location && global.location.origin ? global.location.origin : '') + '/api';
                var r = await fetch(apiBase + '/progress/module/' + moduleId, {
                    headers: { Authorization: 'Bearer ' + token }
                });
                if (r.status === 404) return localDone;
                if (r.ok) {
                    var d = await r.json();
                    var step =
                        d.data && typeof d.data.lastStep === 'string'
                            ? JSON.parse(d.data.lastStep || '{}')
                            : (d.data && d.data.lastStep) || {};
                    var lessons = step.completedLessons || [];
                    var merged = normalizeCompletedLessons(lessons);
                    if (merged.length) {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({
                                completedLessons: merged,
                                totalLessons: step.totalLessons || lessonKeysOrdered.length || merged.length,
                                lastUpdated: new Date().toISOString()
                            })
                        );
                    }
                    return merged;
                }
            } catch (e) {
                console.warn('Load progress from API failed:', e);
            }
            return localDone;
        }

        function saveProgressLocal(completedLessons) {
            var total = lessonKeysOrdered.length || 1;
            var pct = total ? Math.round((completedLessons.length / total) * 100) : 0;
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    completedLessons: completedLessons,
                    totalLessons: total,
                    lastUpdated: new Date().toISOString()
                })
            );
            updateProgressUI(completedLessons.length);
        }

        function updateProgressUI(completedCount) {
            var total = lessonKeysOrdered.length || 1;
            var pct = total ? Math.round((completedCount / total) * 100) : 0;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '% Tamamlandı';
        }

        function markCompletedInSidebar(completedLessons) {
            var done = new Set(completedLessons);
            navLinks.forEach(function (link) {
                var sid = link.getAttribute('data-section');
                var keysInSection = lessonKeysOrdered.filter(function (k) {
                    return k.indexOf(sid + '::') === 0;
                });
                var allDone =
                    keysInSection.length > 0 &&
                    keysInSection.every(function (k) {
                        return done.has(k);
                    });
                link.classList.toggle('completed', allDone);
            });
        }

        function updateLessonRouteHero(lessonKey, section, card, h2) {
            var host = document.getElementById('lesson-route-hero');
            if (!host) return;
            host.removeAttribute('hidden');
            var modTitleEl = section ? section.querySelector('.section-inner > h1') : null;
            var modBannerImg = section
                ? section.querySelector('.section-inner > .lesson-image-wrap img.lesson-image')
                : null;
            var inner = section ? section.querySelector('.section-inner') : null;
            var firstCard = inner ? inner.querySelector(':scope > .content-card') : null;
            var isFirstLessonInModule = !!(card && firstCard && card === firstCard);
            var elMod = host.querySelector('.lesson-route-hero-module');
            var elLes = host.querySelector('.lesson-route-hero-lesson');
            var heroImg = host.querySelector('.lesson-route-hero-img');
            var heroImgWrap = host.querySelector('.lesson-route-hero-img-wrap');
            if (elMod) elMod.textContent = modTitleEl ? String(modTitleEl.textContent || '').trim() : '';
            if (elLes) elLes.textContent = h2 ? String(h2.textContent || '').trim() : '';
            var src = '';
            var alt = '';
            if (isFirstLessonInModule && modBannerImg) {
                src = modBannerImg.currentSrc || modBannerImg.src || '';
                alt = modBannerImg.alt || '';
            }
            if (heroImgWrap) heroImgWrap.style.display = src ? 'block' : 'none';
            if (heroImg) {
                if (src && heroImg.src !== src) heroImg.src = src;
                heroImg.alt = src ? (alt || (elLes ? elLes.textContent : '') || '') : '';
            }
        }

        function parseLessonKeyFromUrl() {
            return new URLSearchParams(global.location.search).get('ders');
        }

        function applyLessonView(lessonKey) {
            if (!lessonKey || lessonKeysOrdered.indexOf(lessonKey) === -1) return false;
            document.body.classList.add('lesson-route-mode');
            document.querySelectorAll('.content-section').forEach(function (sec) {
                sec.classList.remove('lesson-route-current-section', 'active');
            });
            document.querySelectorAll('.content-card').forEach(function (c) {
                c.classList.remove('lesson-route-current-card');
            });
            var sep = lessonKey.indexOf('::');
            var sid = lessonKey.slice(0, sep);
            var h2id = lessonKey.slice(sep + 2);
            var section = document.getElementById(sid);
            var h2 = document.getElementById(h2id);
            var card = h2 ? h2.closest('.content-card') : null;
            if (section) section.classList.add('lesson-route-current-section', 'active');
            if (card) {
                card.classList.add('lesson-route-current-card');
                card.setAttribute('data-lesson-key', lessonKey);
            }
            navLinks.forEach(function (l) {
                l.classList.toggle('active', l.getAttribute('data-section') === sid);
            });
            document.querySelectorAll('.nav-link-sub').forEach(function (a) {
                var aid = a.getAttribute('data-anchor');
                var asec = a.getAttribute('data-section');
                var lk = asec + '::' + aid;
                a.classList.toggle('active', lk === lessonKey);
            });
            document.querySelectorAll('.nav-section-item').forEach(function (li) {
                li.classList.remove('is-open');
            });
            var activeNav = Array.from(navLinks).find(function (l) {
                return l.getAttribute('data-section') === sid;
            });
            if (activeNav) {
                var item = activeNav.closest('.nav-section-item');
                if (item) item.classList.add('is-open');
            }
            global.scrollTo(0, 0);
            var mainScroll = document.querySelector('main');
            if (mainScroll) mainScroll.scrollTop = 0;
            if (global.innerWidth <= 1024) {
                var sidebar = document.querySelector('.module-sidebar');
                if (sidebar) sidebar.classList.remove('open');
            }
            updateLessonRouteHero(lessonKey, section, card, h2);
            return true;
        }

        function navigateToLesson(lessonKey, opts) {
            opts = opts || {};
            if (!lessonKey || lessonKeysOrdered.indexOf(lessonKey) === -1) return;
            applyLessonView(lessonKey);
            if (!opts.skipHistory) {
                var url = new URL(global.location.href);
                url.searchParams.set('ders', lessonKey);
                if (opts.replace) {
                    global.history.replaceState({ lessonKey: lessonKey }, '', url.toString());
                } else {
                    global.history.pushState({ lessonKey: lessonKey }, '', url.toString());
                }
            }
            try {
                var s = lessonKey.indexOf('::');
                var hid = lessonKey.slice(s + 2);
                var hEl = document.getElementById(hid);
                var t = hEl ? String(hEl.textContent || '').trim() : '';
                document.title = t ? t + ' — ' + MODULE_NAME : MODULE_NAME + ' | SEBS';
            } catch (e2) { /* ignore */ }
        }

        function wireLessonNavigation() {
            document.querySelectorAll('.nav-link-sub').forEach(function (a) {
                var secId = a.getAttribute('data-section');
                var anchorId = a.getAttribute('data-anchor');
                if (!secId || !anchorId) return;
                var lk = secId + '::' + anchorId;
                a.setAttribute('href', basePath + '?ders=' + encodeURIComponent(lk));
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    navigateToLesson(lk);
                });
            });
            document.querySelectorAll('.nav-link-section').forEach(function (link) {
                var sid = link.getAttribute('data-section');
                var firstKey = lessonKeysOrdered.find(function (k) {
                    return k.indexOf(sid + '::') === 0;
                });
                if (firstKey) {
                    link.setAttribute('href', basePath + '?ders=' + encodeURIComponent(firstKey));
                }
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (firstKey) navigateToLesson(firstKey);
                });
            });
        }

        async function completeLesson(lessonKey) {
            var completed = await loadProgress();
            if (completed.includes(lessonKey)) {
                var nextIdxDone = lessonKeysOrdered.indexOf(lessonKey) + 1;
                if (nextIdxDone < lessonKeysOrdered.length) {
                    navigateToLesson(lessonKeysOrdered[nextIdxDone]);
                }
                return;
            }
            completed.push(lessonKey);
            saveProgressLocal(completed);
            markCompletedInSidebar(completed);
            var totalLessons = lessonKeysOrdered.length || 1;
            try {
                if (global.syncModuleProgressBulk) {
                    await global.syncModuleProgressBulk(MODULE_NAME, completed, totalLessons);
                } else if (global.ModuleProgressTracker && global.ModuleProgressTracker.saveLessonProgress) {
                    await global.ModuleProgressTracker.saveLessonProgress(MODULE_NAME, lessonKey);
                }
            } catch (e) {
                console.warn('Sunucuya ilerleme yazılamadı (yerel kayıt korunur):', e);
                if (global.ModuleProgressTracker && global.ModuleProgressTracker.saveLessonProgress) {
                    try {
                        await global.ModuleProgressTracker.saveLessonProgress(MODULE_NAME, lessonKey);
                    } catch (e2) {
                        console.warn('Yedek kayıt da başarısız:', e2);
                    }
                }
            }
            var idx = lessonKeysOrdered.indexOf(lessonKey);
            if (idx >= 0 && idx + 1 < lessonKeysOrdered.length) {
                navigateToLesson(lessonKeysOrdered[idx + 1]);
            }
        }

        lessonKeysOrdered = collectLessonKeysOrdered();
        global.MODULE_TOTAL_LESSONS = lessonKeysOrdered.length;

        document.querySelectorAll('.content-section').forEach(function (sec) {
            var inner = sec.querySelector('.section-inner');
            if (!inner) return;
            inner.querySelectorAll(':scope > .content-card').forEach(function (card, idx) {
                var h2 = card.querySelector(':scope > h2');
                if (!h2) return;
                if (!h2.id) {
                    h2.id = sec.id + '-' + (slugifyAnchor(h2.textContent) || 'lesson-' + idx);
                }
                var lessonKey = sec.id + '::' + h2.id;
                card.setAttribute('data-lesson-key', lessonKey);
                var footer = document.createElement('div');
                footer.className = 'lesson-complete-footer';
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'lesson-complete-btn';
                btn.innerHTML = '<i class="fas fa-check"></i> Dersi Tamamla';
                btn.onclick = function () {
                    completeLesson(lessonKey);
                };
                footer.appendChild(btn);
                card.appendChild(footer);
            });
        });

        wireLessonNavigation();

        global.addEventListener('popstate', function () {
            var lk = parseLessonKeyFromUrl();
            if (lk && lessonKeysOrdered.indexOf(lk) !== -1) {
                applyLessonView(lk);
            }
        });

        (function initLessonRouteFromUrl() {
            var fromUrl = parseLessonKeyFromUrl();
            var initial =
                fromUrl && lessonKeysOrdered.indexOf(fromUrl) !== -1 ? fromUrl : lessonKeysOrdered[0];
            if (initial) {
                navigateToLesson(initial, { replace: true });
            }
        })();

        (async function initProgress() {
            var completed = await loadProgress();
            updateProgressUI(completed.length);
            markCompletedInSidebar(completed);
        })();

        (async function initTrackerIfLoggedIn() {
            var t =
                (global.getProgressAuthToken && (await global.getProgressAuthToken())) ||
                (typeof localStorage !== 'undefined' && localStorage.getItem('authToken'));
            if (!t) return;
            if (typeof global.flushPendingProgressQueue === 'function') {
                global.flushPendingProgressQueue().catch(function () {});
            }
            if (global.ModuleProgressTracker && global.ModuleProgressTracker.initializeModule) {
                global.ModuleProgressTracker.initializeModule(
                    MODULE_NAME,
                    lessonKeysOrdered.length || global.MODULE_TOTAL_LESSONS || 1
                ).catch(function () {});
            }
            if (global.TimeTracker && global.getModuleIdFromName) {
                try {
                    var mid = await global.getModuleIdFromName(MODULE_NAME);
                    if (mid) global.TimeTracker.start(MODULE_NAME, mid);
                } catch (e) {
                    console.warn('TimeTracker başlatılamadı:', e);
                }
            }
        })();

        wireMobileMenu();
    }

    global.SebsPremiumModuleLessons = { run: run };
})(typeof window !== 'undefined' ? window : this);
