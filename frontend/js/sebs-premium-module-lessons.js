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

    /** Yan menü ve kahraman başlık: MODÜL 2 — … / 2.5 … öneklerini kaldırır */
    function formatTopicTitle(text) {
        var t = String(text || '')
            .replace(/\s+/g, ' ')
            .trim();
        if (!t) return t;
        t = t.replace(/^MODÜL\s*\d+\s*[—\-–:]\s*/iu, '');
        t = t.replace(/^\d+(?:\.\d+)+\s+/u, '');
        return t.trim();
    }

    function setNavLinkLabel(link, labelText, iconClass) {
        if (!link) return;
        var t = formatTopicTitle(labelText);
        link.textContent = '';
        var icon = document.createElement('i');
        icon.className = iconClass || 'fas fa-book';
        link.appendChild(icon);
        link.appendChild(document.createTextNode(' ' + t));
    }

    function applyTopicTitleToHeading(el) {
        if (!el) return;
        if (!el.dataset.sebsRawTopic) {
            el.dataset.sebsRawTopic = String(el.textContent || '').trim();
        }
        el.textContent = formatTopicTitle(el.dataset.sebsRawTopic);
    }

    function getSubheadingIconClass(title) {
        var t = String(title || '').trim();
        if (t === 'Kendini Değerlendir' || /^kendini\s+değerlendir$/i.test(t)) return 'fa-clipboard-list';
        if (/^Terimler\s+Sözlüğü/i.test(t) || /^Terimler\s+sözlüğü/i.test(t)) return 'fa-book';
        if (/^Kapanış/i.test(t)) return 'fa-flag-checkered';
        return 'fa-book-open';
    }

    function cardifyByHeading(inner, headings) {
        headings.forEach(function (head) {
            if (head.parentElement !== inner) return;
            var card = document.createElement('div');
            card.className = 'content-card';
            inner.insertBefore(card, head);
            var node = head;
            while (node) {
                var next = node.nextElementSibling;
                card.appendChild(node);
                var stopTag = headings[0] && headings[0].tagName;
                if (next && next.tagName === stopTag) break;
                node = next;
            }
        });
    }

    function shouldSkipCardify(inner) {
        if (!inner) return true;
        if (inner.querySelector('.glossary-table, table.glossary-table')) return true;
        var sec = inner.closest('.content-section');
        if (!sec) return false;
        if (sec.classList.contains('eval-quiz-section')) return true;
        var id = String(sec.id || '').toLowerCase();
        return /terimler|glossary|sözlük|sozluk|değerlendirme|degerlendirme|test-soruları|test-sorulari/.test(id);
    }

    function applyTemelCardLayout() {
        document.querySelectorAll('.section-inner').forEach(function (inner) {
            if (inner.dataset.cardified === '1') return;
            if (shouldSkipCardify(inner)) return;
            inner.dataset.cardified = '1';
            var h2Blocks = Array.from(inner.children).filter(function (el) {
                return el.tagName === 'H2';
            });
            var h3Blocks = Array.from(inner.children).filter(function (el) {
                return el.tagName === 'H3';
            });
            if (h2Blocks.length === 1 && h3Blocks.length >= 2) {
                cardifyByHeading(inner, h3Blocks);
                return;
            }
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

    function getSectionSubheadings(inner) {
        if (!inner) return [];
        return Array.from(inner.querySelectorAll('h2')).filter(function (h) {
            var t = String(h.textContent || '').trim();
            if (!t) return false;
            if (h.closest('.sg-isletim-intro, .learning-objectives, #lesson-route-hero')) {
                return false;
            }
            if (/^terimler\s+sözlüğü/i.test(t)) {
                return false;
            }
            return true;
        });
    }

    function isFlatLessonSection(sec) {
        if (!sec || !sec.id) return false;
        return !sec.querySelector('.section-inner');
    }

    function isFlatLessonModule() {
        var sections = document.querySelectorAll('.module-layout .content-section');
        if (!sections.length) return false;
        var flat = 0;
        sections.forEach(function (sec) {
            if (isFlatLessonSection(sec)) flat++;
        });
        return flat > 0 && flat >= sections.length * 0.5;
    }

    function flatSectionHeading(sec) {
        if (!sec) return null;
        return (
            sec.querySelector('.section-header h2') ||
            sec.querySelector('.content-card > h2') ||
            sec.querySelector('.content-card > h3')
        );
    }

    function moduleHasSubheadingNav() {
        var list = document.querySelector('.nav-section-list');
        if (!list) return false;
        var links = list.querySelectorAll('.nav-link-section');
        for (var i = 0; i < links.length; i++) {
            var sec = document.getElementById(links[i].getAttribute('data-section'));
            if (!sec) continue;
            var inner = sec.querySelector('.section-inner');
            if (getSectionSubheadings(inner).length > 0) {
                return true;
            }
        }
        return false;
    }

    function resolveSubNavScroll(cfg) {
        if (cfg && cfg.subNavScroll === true) return true;
        if (cfg && cfg.subNavScroll === false) return false;
        return moduleHasSubheadingNav();
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
            var inner = sectionEl.querySelector('.section-inner');
            var subHeadings = getSectionSubheadings(inner);
            if (!subHeadings.length) {
                parentLi.classList.remove('nav-section-item', 'is-open');
                var topIconEl = moduleLink.querySelector('i.fas, i.fab');
                setNavLinkLabel(
                    moduleLink,
                    moduleLink.textContent,
                    topIconEl ? topIconEl.className : 'fas fa-book'
                );
                return;
            }
            parentLi.classList.add('nav-section-item');
            if (!moduleLink.querySelector('.nav-label')) {
                var text = formatTopicTitle(moduleLink.textContent);
                var iconEl = moduleLink.querySelector('i.fas, i.fab');
                var iconClass = iconEl ? iconEl.className : 'fas fa-book';
                moduleLink.innerHTML =
                    '<span class="nav-label"><i class="' +
                    iconClass +
                    '"></i> ' +
                    text +
                    '</span><i class="fas fa-chevron-right nav-expand-indicator"></i>';
            } else {
                var labelEl = moduleLink.querySelector('.nav-label');
                if (labelEl) {
                    var iconInLabel = labelEl.querySelector('i.fas, i.fab');
                    var labelIcon = iconInLabel ? iconInLabel.className : 'fas fa-book';
                    var labelText = formatTopicTitle(labelEl.textContent);
                    labelEl.innerHTML = '<i class="' + labelIcon + '"></i> ' + labelText;
                }
            }
            if (!moduleLink.querySelector('.nav-expand-indicator')) {
                var chevron = document.createElement('i');
                chevron.className = 'fas fa-chevron-right nav-expand-indicator';
                moduleLink.appendChild(chevron);
            }
            var subList = document.createElement('ul');
            subList.className = 'nav-sublist';
            parentLi.appendChild(subList);
            subHeadings.forEach(function (h2, idx) {
                if (!h2.id) {
                    h2.id = sectionId + '-' + (slugifyAnchor(h2.textContent) || 'sub-' + idx);
                }
                var li = document.createElement('li');
                li.className = 'nav-subitem';
                var rawTitle = String(h2.textContent || '').trim();
                var icon = getSubheadingIconClass(rawTitle);
                var subLink = document.createElement('a');
                subLink.href = '#';
                subLink.className = 'nav-link-sub';
                subLink.setAttribute('data-section', sectionId);
                subLink.setAttribute('data-anchor', h2.id);
                setNavLinkLabel(subLink, rawTitle, 'fas ' + icon + ' subtopic-icon');
                li.appendChild(subLink);
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

    function getCardLessonHeading(card) {
        if (!card) return null;
        return (
            card.querySelector(':scope > h2') ||
            card.querySelector(':scope > h3') ||
            card.querySelector(':scope > h4')
        );
    }

    function ensureHeadingId(heading, sectionId, idx) {
        if (!heading) return '';
        if (!heading.id) {
            var slug = slugifyAnchor(heading.textContent) || 'lesson-' + idx;
            if (slug.length > 64) {
                slug = slug.slice(0, 64).replace(/-+$/, '');
            }
            heading.id = sectionId + '-' + slug;
        } else if (heading.id.length > 100) {
            heading.id = sectionId + '-lesson-' + idx;
        }
        return heading.id;
    }

    function makeLessonKey(sectionId, headingId) {
        if (!headingId || headingId === sectionId) {
            return sectionId;
        }
        return sectionId + '::' + headingId;
    }

    function parseLessonKey(lessonKey) {
        var sep = String(lessonKey || '').indexOf('::');
        if (sep === -1) {
            return { sectionId: lessonKey, headingId: lessonKey };
        }
        return {
            sectionId: lessonKey.slice(0, sep),
            headingId: lessonKey.slice(sep + 2)
        };
    }

    function querySuffixFromBasePath(basePath) {
        var s = String(basePath || '');
        var q = s.indexOf('?');
        return q >= 0 ? s.slice(q) : '';
    }

    function moduleSlugFromBasePath(basePath) {
        var path = String(basePath || '').split('?')[0];
        var file = path.split('/').pop() || '';
        return file.replace(/\.html$/i, '') || 'modul';
    }

    /** Her ders / bölüm için ayrı URL: /modules/{slug}/ders/{section}/{heading}.html */
    function hrefForLessonKey(lessonKey, basePath) {
        var slug = moduleSlugFromBasePath(basePath);
        var q = querySuffixFromBasePath(basePath);
        var parsed = parseLessonKey(lessonKey);
        var path;
        if (String(lessonKey || '').indexOf('::') !== -1) {
            path =
                '/modules/' +
                slug +
                '/ders/' +
                encodeURIComponent(parsed.sectionId) +
                '/' +
                encodeURIComponent(parsed.headingId) +
                '.html';
        } else {
            path =
                '/modules/' +
                slug +
                '/bolum/' +
                encodeURIComponent(parsed.sectionId) +
                '.html';
        }
        return path + q;
    }

    function sameLessonUrl(a, b) {
        try {
            var ua = new URL(a, global.location.origin);
            var ub = new URL(b, global.location.origin);
            return ua.pathname === ub.pathname && ua.search === ub.search;
        } catch (e) {
            return String(a).split('#')[0] === String(b).split('#')[0];
        }
    }

    /** Gerçek sayfa geçişi — her ders ayrı URL (Vercel rewrite veya yerel köprü HTML) */
    function goToLessonPage(lessonKey, basePath, opts) {
        opts = opts || {};
        if (!lessonKey) return false;
        var href = hrefForLessonKey(lessonKey, basePath);
        var here = global.location.pathname + global.location.search;
        if (sameLessonUrl(here, href)) {
            return false;
        }
        if (opts.replace) {
            global.location.replace(href);
        } else {
            global.location.href = href;
        }
        return true;
    }

    function isModuleIndexPath(basePath) {
        var slug = moduleSlugFromBasePath(basePath);
        var p = global.location.pathname || '';
        return (
            p === '/modules/' + slug + '.html' ||
            p === '/modules/' + slug ||
            p.endsWith('/modules/' + slug + '.html')
        );
    }

    function parseRouteKeyFromUrl(basePath) {
        var pathname = global.location.pathname || '';
        var slug = moduleSlugFromBasePath(basePath);
        var prefix = '/modules/' + slug + '/';
        if (pathname.indexOf(prefix) === 0) {
            var rest = pathname.slice(prefix.length).replace(/\.html$/i, '');
            var parts = rest.split('/').filter(Boolean);
            if (parts[0] === 'ders' && parts.length >= 3) {
                return (
                    decodeURIComponent(parts[1]) +
                    '::' +
                    decodeURIComponent(parts.slice(2).join('/'))
                );
            }
            if (parts[0] === 'ders' && parts.length === 2) {
                return decodeURIComponent(parts[1]);
            }
            if (parts[0] === 'bolum' && parts.length >= 2) {
                return decodeURIComponent(parts[1]);
            }
        }
        try {
            var sp = new URLSearchParams(global.location.search || '');
            return sp.get('ders') || sp.get('bolum');
        } catch (e) {
            return null;
        }
    }

    function appendLessonFooter(container, onComplete) {
        if (!container || container.querySelector('.lesson-complete-footer')) return;
        var footer = document.createElement('div');
        footer.className = 'lesson-complete-footer';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lesson-complete-btn';
        btn.innerHTML = '<i class="fas fa-check"></i> Dersi Tamamla';
        btn.addEventListener('click', onComplete);
        footer.appendChild(btn);
        container.appendChild(footer);
    }

    function refreshCompleteButtons(completedList) {
        var done = new Set(Array.isArray(completedList) ? completedList : []);
        document.querySelectorAll('.lesson-complete-btn, .btn-complete-lesson').forEach(function (btn) {
            var card = btn.closest('.content-card');
            var sec = btn.closest('.content-section');
            var key =
                btn.getAttribute('data-section') ||
                (card && card.getAttribute('data-lesson-key')) ||
                (sec && sec.id) ||
                '';
            var sid = sec ? sec.id : key;
            var isDone =
                done.has(key) ||
                (sid &&
                    (done.has(sid) ||
                        Array.from(done).some(function (k) {
                            return String(k) === sid || String(k).indexOf(sid + '::') === 0;
                        })));
            btn.disabled = !!isDone;
            btn.classList.toggle('is-done', !!isDone);
            if (btn.classList.contains('btn-complete-lesson')) {
                btn.innerHTML = isDone
                    ? '<i class="fas fa-check-circle"></i> Tamamlandı'
                    : '<i class="fas fa-check-circle"></i> Dersi Tamamla';
            } else {
                btn.innerHTML = isDone
                    ? '<i class="fas fa-check"></i> Tamamlandı'
                    : '<i class="fas fa-check"></i> Dersi Tamamla';
            }
        });
    }

    function collectLessonKeysFromDomWalk() {
        var keys = [];
        document.querySelectorAll('.content-section').forEach(function (sec) {
            var inner = sec.querySelector('.section-inner');
            if (!inner) {
                var flatHead = flatSectionHeading(sec);
                if (flatHead) {
                    keys.push(makeLessonKey(sec.id, ensureHeadingId(flatHead, sec.id, 0)));
                } else if (sec.id) {
                    keys.push(sec.id);
                }
                return;
            }
            var cards = inner.querySelectorAll(':scope > .content-card');
            if (cards.length) {
                cards.forEach(function (card, idx) {
                    var head = getCardLessonHeading(card);
                    if (!head) return;
                    var hid = ensureHeadingId(head, sec.id, idx);
                    keys.push(makeLessonKey(sec.id, hid));
                });
                return;
            }
            var subHeadings = getSectionSubheadings(inner);
            if (subHeadings.length) {
                subHeadings.forEach(function (head, idx) {
                    var hid = ensureHeadingId(head, sec.id, idx);
                    keys.push(makeLessonKey(sec.id, hid));
                });
                return;
            }
            var head = inner.querySelector(':scope > h2, :scope > h3');
            if (head) {
                keys.push(makeLessonKey(sec.id, ensureHeadingId(head, sec.id, 0)));
            } else if (sec.id) {
                keys.push(sec.id);
            }
        });
        return keys;
    }

    function collectLessonKeysOrdered() {
        var fromNav = [];
        var navRoot = document.querySelector('.nav-section-list');
        var subLinks = navRoot
            ? navRoot.querySelectorAll('.nav-link-sub')
            : document.querySelectorAll('.nav-link-sub');
        subLinks.forEach(function (a) {
            var secId = a.getAttribute('data-section');
            var anchorId = a.getAttribute('data-anchor');
            if (secId && anchorId) {
                fromNav.push(makeLessonKey(secId, anchorId));
            }
        });
        var sectionLinks = navRoot
            ? navRoot.querySelectorAll('.nav-link-section')
            : document.querySelectorAll('.nav-link-section');
        sectionLinks.forEach(function (link) {
            var sid = link.getAttribute('data-section');
            if (!sid) return;
            var hasSub = fromNav.some(function (k) {
                return k.indexOf(sid + '::') === 0;
            });
            if (hasSub) return;
            var key = lessonKeyForSection(sid);
            if (fromNav.indexOf(key) === -1) fromNav.push(key);
        });

        var fromDom = collectLessonKeysFromDomWalk();
        var navHasSub = fromNav.some(function (k) {
            return k.indexOf('::') !== -1;
        });
        var domHasSub = fromDom.some(function (k) {
            return k.indexOf('::') !== -1;
        });
        if (navHasSub) return fromNav;
        if (domHasSub) return fromDom;
        if (fromNav.length) return fromNav;
        return fromDom;
    }

    function installLessonCompleteControls(routeMode, completeHandler) {
        document.querySelectorAll('.content-section').forEach(function (sec) {
            var inner = sec.querySelector('.section-inner');
            if (!inner) {
                var flatHead = flatSectionHeading(sec);
                var flatKey = flatHead
                    ? makeLessonKey(sec.id, ensureHeadingId(flatHead, sec.id, 0))
                    : sec.id;
                var legacyCard = sec.querySelector('.content-card');
                if (legacyCard) {
                    legacyCard.setAttribute('data-lesson-key', flatKey);
                    if (routeMode && !legacyCard.querySelector('.lesson-complete-footer')) {
                        appendLessonFooter(legacyCard, function () {
                            completeHandler(flatKey);
                        });
                    }
                }
                if (sec.querySelector('.btn-complete-lesson')) return;
                if (legacyCard && !legacyCard.querySelector('.lesson-complete-footer')) {
                    appendLessonFooter(legacyCard, function () {
                        completeHandler(flatKey);
                    });
                }
                return;
            }
            if (inner.querySelector('.btn-complete-lesson')) return;

            var cards = inner.querySelectorAll(':scope > .content-card');
            if (cards.length) {
                cards.forEach(function (card, idx) {
                    var head = getCardLessonHeading(card);
                    if (!head) return;
                    var hid = ensureHeadingId(head, sec.id, idx);
                    var lessonKey = makeLessonKey(sec.id, hid);
                    card.setAttribute('data-lesson-key', lessonKey);
                    appendLessonFooter(card, function () {
                        completeHandler(lessonKey);
                    });
                });
            } else {
                var head = inner.querySelector(':scope > h2, :scope > h3');
                var lessonKey = head
                    ? makeLessonKey(sec.id, ensureHeadingId(head, sec.id, 0))
                    : sec.id;
                appendLessonFooter(inner, function () {
                    completeHandler(lessonKey);
                });
            }
        });

        document.querySelectorAll('.btn-complete-lesson').forEach(function (btn) {
            if (btn.dataset.sebsWired === '1') return;
            btn.dataset.sebsWired = '1';
            var sid = btn.getAttribute('data-section');
            if (!sid) return;
            btn.addEventListener('click', function () {
                if (!routeMode) {
                    completeHandler(sid);
                    return;
                }
                var sec = document.getElementById(sid);
                var inner = sec ? sec.querySelector('.section-inner') : null;
                var key = sid;
                if (!inner && sec) {
                    var flatHead = flatSectionHeading(sec);
                    key = flatHead
                        ? makeLessonKey(sid, ensureHeadingId(flatHead, sid, 0))
                        : sid;
                } else {
                    var firstCard = inner ? inner.querySelector(':scope > .content-card') : null;
                    var head = firstCard
                        ? getCardLessonHeading(firstCard)
                        : inner
                          ? inner.querySelector(':scope > h2, :scope > h3')
                          : null;
                    key = head ? makeLessonKey(sid, ensureHeadingId(head, sid, 0)) : sid;
                }
                completeHandler(key);
            });
        });
    }

    function lessonKeyForSection(sectionId) {
        var sec = document.getElementById(sectionId);
        if (!sec) return sectionId;
        var inner = sec.querySelector('.section-inner');
        if (!inner) {
            var flatHead = flatSectionHeading(sec);
            return flatHead
                ? makeLessonKey(sectionId, ensureHeadingId(flatHead, sectionId, 0))
                : sectionId;
        }
        var card = inner.querySelector(':scope > .content-card');
        var head = card
            ? getCardLessonHeading(card)
            : inner.querySelector(':scope > h2, :scope > h3');
        return head
            ? makeLessonKey(sectionId, ensureHeadingId(head, sectionId, 0))
            : sectionId;
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

    /** Eski modül akışı: tüm bölüm içeriği görünür, ?ders= / tek kart yok */
    function runClassicSections(cfg) {
        if (!cfg || !cfg.moduleName || !cfg.storageKey) {
            console.warn('SebsPremiumModuleLessons.run: moduleName ve storageKey gerekli');
            return;
        }
        var MODULE_NAME = cfg.moduleName;
        var STORAGE_KEY = cfg.storageKey;
        var basePath = cfg.basePath || (global.location && global.location.pathname) || '/';
        global.MODULE_NAME = MODULE_NAME;
        document.body.classList.add('sebs-module-progress-section', 'module-section-pages');

        var sections = document.querySelectorAll('.content-section');
        var navLinks = document.querySelectorAll('.nav-link-section');
        var navSectionList = document.querySelector('.nav-section-list');
        var progressFill = document.getElementById('progressFill');
        var progressText = document.getElementById('progressText');

        enhanceNotes();
        enhanceMiniHeadings();
        enhanceRunbookHeadings();
        tableizeGlossaries();
        applyTemelCardLayout();
        try {
            global.dispatchEvent(new Event('sebs-lesson-cards-ready'));
        } catch (e) {
            var ev = document.createEvent('Event');
            ev.initEvent('sebs-lesson-cards-ready', true, true);
            global.dispatchEvent(ev);
        }

        var subNavScroll = resolveSubNavScroll(cfg) || moduleHasSubheadingNav();
        if (subNavScroll && navSectionList) {
            buildSubheadingNav(navSectionList);
        }

        global.MODULE_TOTAL_LESSONS = navLinks.length;

        async function loadProgress() {
            var local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            var token =
                (global.getProgressAuthToken && (await global.getProgressAuthToken())) ||
                (typeof localStorage !== 'undefined' && localStorage.getItem('authToken'));
            if (!token || !global.getModuleIdFromName) return local.completedLessons || [];
            try {
                var moduleId = await global.getModuleIdFromName(MODULE_NAME);
                if (!moduleId) return local.completedLessons || [];
                var apiBase =
                    typeof global.getSebsApiBase === 'function'
                        ? global.getSebsApiBase()
                        : (global.location && global.location.origin ? global.location.origin : '') + '/api';
                var r = await fetch(apiBase + '/progress/module/' + moduleId, {
                    headers: { Authorization: 'Bearer ' + token }
                });
                if (r.ok) {
                    var d = await r.json();
                    var step =
                        d.data && typeof d.data.lastStep === 'string'
                            ? JSON.parse(d.data.lastStep || '{}')
                            : (d.data && d.data.lastStep) || {};
                    var lessons = step.completedLessons || [];
                    if (lessons.length) {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({
                                completedLessons: lessons,
                                totalLessons: step.totalLessons || navLinks.length,
                                lastUpdated: new Date().toISOString()
                            })
                        );
                    }
                    return lessons;
                }
            } catch (e) {
                console.warn('Load progress from API failed:', e);
            }
            return local.completedLessons || [];
        }

        function saveProgressLocal(completedLessons) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    completedLessons: completedLessons,
                    totalLessons: navLinks.length,
                    lastUpdated: new Date().toISOString()
                })
            );
            updateProgressUI(completedLessons.length);
        }

        function updateProgressUI(completedCount) {
            var total = navLinks.length;
            var pct = total ? Math.round((completedCount / total) * 100) : 0;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '% Tamamlandı';
        }

        function markCompletedInSidebar(completedLessons) {
            var done = new Set(completedLessons);
            navLinks.forEach(function (link) {
                var id = link.getAttribute('data-section');
                var sectionDone =
                    done.has(id) ||
                    Array.from(done).some(function (k) {
                        return String(k).indexOf(id + '::') === 0;
                    });
                link.classList.toggle('completed', sectionDone);
            });
        }

        function applySectionPageView(sectionId) {
            if (!sectionId) return false;
            var target = document.getElementById(sectionId);
            if (!target) return false;
            document.body.classList.add('lesson-route-mode');
            sections.forEach(function (sec) {
                var on = sec.id === sectionId;
                sec.classList.toggle('active', on);
                sec.classList.toggle('lesson-route-current-section', on);
                sec.classList.toggle('lesson-route-whole-section', on);
            });
            navLinks.forEach(function (l) {
                l.classList.toggle('active', l.getAttribute('data-section') === sectionId);
            });
            document.querySelectorAll('.nav-section-item').forEach(function (li) {
                li.classList.remove('is-open');
            });
            var activeNav = Array.from(navLinks).find(function (l) {
                return l.getAttribute('data-section') === sectionId;
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
            try {
                var h1 = target.querySelector('.section-inner > h1');
                document.title = h1
                    ? formatTopicTitle(h1.textContent) + ' — ' + MODULE_NAME
                    : MODULE_NAME + ' | SEBS';
            } catch (eTitle) { /* ignore */ }
            return true;
        }

        var sectionIdsOrdered = Array.from(navLinks)
            .map(function (l) {
                return l.getAttribute('data-section');
            })
            .filter(Boolean);

        function navigateToSection(sectionId, opts) {
            opts = opts || {};
            if (!sectionId) return;
            if (!opts.inPlace && goToLessonPage(sectionId, basePath, opts)) {
                return;
            }
            applySectionPageView(sectionId);
        }

        function goToNextSectionAfter(sectionId) {
            var idx = sectionIdsOrdered.indexOf(sectionId);
            if (idx >= 0 && idx + 1 < sectionIdsOrdered.length) {
                goToLessonPage(sectionIdsOrdered[idx + 1], basePath);
            }
        }

        async function completeLesson(sectionId) {
            var completed = await loadProgress();
            if (completed.includes(sectionId)) {
                goToNextSectionAfter(sectionId);
                return;
            }
            completed.push(sectionId);
            saveProgressLocal(completed);
            markCompletedInSidebar(completed);
            refreshCompleteButtons(completed);
            try {
                if (global.syncModuleProgressBulk) {
                    await global.syncModuleProgressBulk(MODULE_NAME, completed, navLinks.length);
                } else if (global.ModuleProgressTracker && global.ModuleProgressTracker.saveLessonProgress) {
                    await global.ModuleProgressTracker.saveLessonProgress(MODULE_NAME, sectionId);
                }
            } catch (e) {
                console.warn('Sunucuya ilerleme yazılamadı:', e);
            }
            goToNextSectionAfter(sectionId);
        }

        navLinks.forEach(function (link) {
            var sectionId = link.getAttribute('data-section');
            if (sectionId) {
                link.setAttribute('href', hrefForLessonKey(sectionId, basePath));
            }
        });

        if (subNavScroll) {
            document.querySelectorAll('.nav-link-sub').forEach(function (link) {
                var sectionId = link.getAttribute('data-section');
                var anchorId = link.getAttribute('data-anchor');
                if (sectionId && anchorId) {
                    var lk = makeLessonKey(sectionId, anchorId);
                    link.setAttribute('href', hrefForLessonKey(lk, basePath));
                }
            });
        }

        (function initSectionRouteFromUrl() {
            var fromUrl = parseRouteKeyFromUrl(basePath);
            if (fromUrl && fromUrl.indexOf('::') !== -1) {
                goToLessonPage(fromUrl, basePath, { replace: true });
                return;
            }
            if (isModuleIndexPath(basePath) && sectionIdsOrdered.length) {
                goToLessonPage(sectionIdsOrdered[0], basePath, { replace: true });
                return;
            }
            if (fromUrl && fromUrl.indexOf('::') === -1 && document.getElementById(fromUrl)) {
                navigateToSection(fromUrl, { replace: true, inPlace: true });
                return;
            }
            if (sections.length) {
                navigateToSection(sections[0].id, { replace: true, inPlace: true });
            }
        })();

        installLessonCompleteControls(false, function (key) {
            completeLesson(parseLessonKey(key).sectionId);
        });

        (async function initProgress() {
            var completed = await loadProgress();
            updateProgressUI(completed.length);
            markCompletedInSidebar(completed);
            refreshCompleteButtons(completed);
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
                global.ModuleProgressTracker.initializeModule(MODULE_NAME, navLinks.length).catch(function () {});
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

    function run(cfg) {
        if (!cfg || !cfg.moduleName || !cfg.storageKey) {
            console.warn('SebsPremiumModuleLessons.run: moduleName ve storageKey gerekli');
            return;
        }
        if (!cfg.progressMode) {
            if (isFlatLessonModule()) {
                cfg = Object.assign({}, cfg, { progressMode: 'lesson' });
            } else {
                var navCount = document.querySelectorAll('.nav-link-section').length;
                if (navCount > 12 && !moduleHasSubheadingNav()) {
                    cfg.progressMode = 'section';
                }
            }
        }
        if (cfg.progressMode === 'section' && isFlatLessonModule()) {
            cfg = Object.assign({}, cfg);
            delete cfg.progressMode;
        }
        if (cfg.progressMode === 'section') {
            var routeProbe = parseRouteKeyFromUrl(cfg.basePath || global.location.pathname);
            if (routeProbe && routeProbe.indexOf('::') !== -1 && moduleHasSubheadingNav()) {
                cfg = Object.assign({}, cfg);
                delete cfg.progressMode;
            } else {
                runClassicSections(cfg);
                return;
            }
        }
        var MODULE_NAME = cfg.moduleName;
        var STORAGE_KEY = cfg.storageKey;
        global.MODULE_NAME = MODULE_NAME;
        var basePath = cfg.basePath || (global.location && global.location.pathname) || '/';

        var sections = document.querySelectorAll('.content-section');
        var navLinks = document.querySelectorAll('.nav-link-section');
        var navSectionList = document.querySelector('.nav-section-list');
        var lessonKeysOrdered = [];
        var progressFill = document.getElementById('progressFill');
        var progressText = document.getElementById('progressText');

        enhanceNotes();
        enhanceMiniHeadings();
        enhanceRunbookHeadings();
        tableizeGlossaries();
        applyTemelCardLayout();
        try {
            global.dispatchEvent(new Event('sebs-lesson-cards-ready'));
        } catch (e) {
            var ev = document.createEvent('Event');
            ev.initEvent('sebs-lesson-cards-ready', true, true);
            global.dispatchEvent(ev);
        }

        var subNavScroll = resolveSubNavScroll(cfg) || moduleHasSubheadingNav();
        if (subNavScroll && navSectionList) {
            buildSubheadingNav(navSectionList);
        }

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
                    return k === sid || k.indexOf(sid + '::') === 0;
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
            if (!inner && section) {
                h2 = h2 || flatSectionHeading(section);
            }
            var elMod = host.querySelector('.lesson-route-hero-module');
            var elLes = host.querySelector('.lesson-route-hero-lesson');
            var heroImg = host.querySelector('.lesson-route-hero-img');
            var heroImgWrap = host.querySelector('.lesson-route-hero-img-wrap');
            if (elMod) {
                if (!inner && section) {
                    var modLine = section.querySelector('.section-intro');
                    elMod.textContent = modLine ? String(modLine.textContent || '').trim() : '';
                    elMod.hidden = !elMod.textContent;
                } else {
                    elMod.textContent = '';
                    elMod.hidden = true;
                }
            }
            if (elLes) {
                elLes.textContent = h2
                    ? formatTopicTitle(h2.dataset.sebsRawTopic || h2.textContent)
                    : '';
            }
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
            return parseRouteKeyFromUrl(basePath);
        }

        function applyLessonView(lessonKey) {
            if (!lessonKey || lessonKeysOrdered.indexOf(lessonKey) === -1) return false;
            document.body.classList.add('lesson-route-mode');
            document.querySelectorAll('.content-section').forEach(function (sec) {
                sec.classList.remove(
                    'lesson-route-current-section',
                    'lesson-route-whole-section',
                    'active'
                );
            });
            document.querySelectorAll('.content-card').forEach(function (c) {
                c.classList.remove('lesson-route-current-card');
            });
            var parsed = parseLessonKey(lessonKey);
            var sid = parsed.sectionId;
            var h2id = parsed.headingId;
            var section = document.getElementById(sid);
            var head = document.getElementById(h2id);
            if (head && head.classList && head.classList.contains('content-section')) {
                head = null;
            }
            if (!head && section) {
                head = flatSectionHeading(section);
            }
            var card = head ? head.closest('.content-card') : null;
            if (!card && section) {
                card = section.querySelector('.content-card');
            }
            if (section) {
                section.classList.add('lesson-route-current-section', 'active');
                if (!card || card.closest('.content-section') === section) {
                    section.classList.add('lesson-route-whole-section');
                }
            }
            if (card) {
                card.classList.add('lesson-route-current-card');
                card.setAttribute('data-lesson-key', lessonKey);
            }
            if (head) {
                applyTopicTitleToHeading(head);
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
            updateLessonRouteHero(lessonKey, section, card, head);
            return true;
        }

        function navigateToLesson(lessonKey, opts) {
            opts = opts || {};
            if (!lessonKey || lessonKeysOrdered.indexOf(lessonKey) === -1) return;
            if (!opts.inPlace && goToLessonPage(lessonKey, basePath, opts)) {
                return;
            }
            applyLessonView(lessonKey);
            try {
                var parsedTitle = parseLessonKey(lessonKey);
                var hEl = document.getElementById(parsedTitle.headingId);
                if (hEl && hEl.classList && hEl.classList.contains('content-section')) {
                    hEl = flatSectionHeading(document.getElementById(parsedTitle.sectionId));
                }
                var t = hEl
                    ? formatTopicTitle(hEl.dataset.sebsRawTopic || hEl.textContent)
                    : '';
                document.title = t ? t + ' — ' + MODULE_NAME : MODULE_NAME + ' | SEBS';
            } catch (e2) { /* ignore */ }
        }

        function hrefWithDersParam(lessonKey) {
            return hrefForLessonKey(lessonKey, basePath);
        }

        function wireLessonNavigation() {
            document.querySelectorAll('.nav-link-sub').forEach(function (a) {
                var secId = a.getAttribute('data-section');
                var anchorId = a.getAttribute('data-anchor');
                if (!secId || !anchorId) return;
                var lk = secId + '::' + anchorId;
                a.setAttribute('href', hrefWithDersParam(lk));
            });
            document.querySelectorAll('.nav-link-section').forEach(function (link) {
                var sid = link.getAttribute('data-section');
                var firstKey = lessonKeysOrdered.find(function (k) {
                    return k === sid || k.indexOf(sid + '::') === 0;
                });
                if (!firstKey && sid) {
                    firstKey = lessonKeyForSection(sid);
                }
                if (firstKey) {
                    link.setAttribute('href', hrefWithDersParam(firstKey));
                }
            });
        }

        function goToNextLessonAfter(lessonKey) {
            var idx = lessonKeysOrdered.indexOf(lessonKey);
            if (idx >= 0 && idx + 1 < lessonKeysOrdered.length) {
                goToLessonPage(lessonKeysOrdered[idx + 1], basePath);
            }
        }

        async function completeLesson(lessonKey) {
            var completed = await loadProgress();
            if (completed.includes(lessonKey)) {
                goToNextLessonAfter(lessonKey);
                return;
            }
            completed.push(lessonKey);
            saveProgressLocal(completed);
            markCompletedInSidebar(completed);
            refreshCompleteButtons(completed);
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
            goToNextLessonAfter(lessonKey);
        }

        lessonKeysOrdered = collectLessonKeysOrdered();
        global.MODULE_TOTAL_LESSONS = lessonKeysOrdered.length;

        installLessonCompleteControls(true, function (key) {
            completeLesson(key);
        });

        wireLessonNavigation();

        (function initLessonRouteFromUrl() {
            var fromUrl = parseRouteKeyFromUrl(basePath);
            try {
                var legacy = new URLSearchParams(global.location.search).get('ders');
                if (legacy && lessonKeysOrdered.indexOf(legacy) !== -1 && legacy !== fromUrl) {
                    fromUrl = legacy;
                }
            } catch (eLegacy) { /* ignore */ }
            if (fromUrl && lessonKeysOrdered.indexOf(fromUrl) === -1) {
                fromUrl = null;
            }
            if (isModuleIndexPath(basePath) && lessonKeysOrdered.length) {
                goToLessonPage(lessonKeysOrdered[0], basePath, { replace: true });
                return;
            }
            var initial =
                fromUrl && lessonKeysOrdered.indexOf(fromUrl) !== -1 ? fromUrl : lessonKeysOrdered[0];
            if (initial) {
                navigateToLesson(initial, { replace: true, inPlace: true });
            }
        })();

        (async function initProgress() {
            var completed = await loadProgress();
            updateProgressUI(completed.length);
            markCompletedInSidebar(completed);
            refreshCompleteButtons(completed);
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

    global.SebsPremiumModuleLessons = {
        run: run,
        refreshSubheadingNav: function () {
            var list = document.querySelector('.nav-section-list');
            if (!list || !moduleHasSubheadingNav()) return;
            buildSubheadingNav(list);
        }
    };
})(typeof window !== 'undefined' ? window : this);
