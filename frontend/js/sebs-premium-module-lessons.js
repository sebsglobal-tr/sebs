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
        if (!inner || !headings.length) return;
        var stopTag = headings[0].tagName;
        headings.forEach(function (head) {
            if (!head || head.closest('.content-card')) return;
            var parent = head.parentElement;
            if (!parent) return;
            var card = document.createElement('div');
            card.className = 'content-card';
            parent.insertBefore(card, head);
            var node = head;
            while (node) {
                var next = node.nextElementSibling;
                card.appendChild(node);
                if (!next) break;
                if (next.tagName === stopTag) break;
                if (headings.indexOf(next) !== -1 && next !== head) break;
                node = next;
            }
        });
    }

    /** Kartlara alınmamış giriş (h1, kapak, modül özeti) — ilk derse birleştirilir */
    function mergeLeadingOrphansIntoFirstLessonCard(inner) {
        if (!inner) return;
        var orphans = [];
        var child = inner.firstElementChild;
        while (child) {
            if (child.classList && child.classList.contains('content-card')) break;
            orphans.push(child);
            child = child.nextElementSibling;
        }
        if (!orphans.length) return;
        var target = firstNavigableCard(inner) || inner.querySelector(':scope > .content-card');
        if (!target) return;
        var ref = target.firstChild;
        orphans.forEach(function (n) {
            target.insertBefore(n, ref);
        });
    }

    function ensureHeadingLessonCard(head, inner) {
        if (!head || !inner) return head.closest('.content-card');
        var existing = head.closest('.content-card');
        if (existing) return existing;
        var subHeadings = getSectionSubheadings(inner);
        var block = document.createElement('div');
        block.className = 'content-card sebs-lesson-block';
        var parent = head.parentElement || inner;
        parent.insertBefore(block, head);
        var node = head;
        var stopTag = lessonHeadingLevel === 'h3' ? 'H3' : 'H2';
        while (node) {
            var next = node.nextElementSibling;
            block.appendChild(node);
            if (!next) break;
            if (lessonHeadingLevel !== 'h3' && next.tagName === 'H2') break;
            if (next.tagName === stopTag) break;
            if (subHeadings.indexOf(next) !== -1 && next !== head) break;
            node = next;
        }
        return block;
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
            if (lessonHeadingLevel === 'h3') {
                var lessonH3 = sortHeadingsByDocumentOrder(
                    Array.from(inner.querySelectorAll('h3')).filter(isNavigableLessonHeading)
                );
                if (lessonH3.length) {
                    cardifyByHeading(inner, lessonH3);
                    mergeLeadingOrphansIntoFirstLessonCard(inner);
                    return;
                }
            }
            var h2Blocks = Array.from(inner.children).filter(function (el) {
                return el.tagName === 'H2';
            });
            var h3Blocks = Array.from(inner.children).filter(function (el) {
                return el.tagName === 'H3';
            });
            if (h2Blocks.length === 1 && h3Blocks.length >= 2) {
                cardifyByHeading(
                    inner,
                    sortHeadingsByDocumentOrder(
                        Array.from(inner.querySelectorAll('h3')).filter(isNavigableLessonHeading)
                    )
                );
                mergeLeadingOrphansIntoFirstLessonCard(inner);
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
            mergeLeadingOrphansIntoFirstLessonCard(inner);
        });
    }

    function isModuleThemeHeading(el) {
        if (!el) return false;
        var t = String(el.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();
        return /^modül\s+teması$/i.test(t);
    }

    function firstNavigableCard(inner) {
        if (!inner) return null;
        var cards = inner.querySelectorAll(':scope > .content-card');
        for (var i = 0; i < cards.length; i++) {
            var head = getCardLessonHeading(cards[i]);
            if (!head || !isModuleThemeHeading(head)) return cards[i];
        }
        return cards[0] || null;
    }

    function getSectionSubheadings(inner) {
        if (!inner) return [];
        if (lessonHeadingLevel === 'h3') {
            var h3List = Array.from(inner.querySelectorAll('h3')).filter(isNavigableLessonHeading);
            var h2Closing = Array.from(inner.querySelectorAll('h2')).filter(isClosingLessonH2);
            return sortHeadingsByDocumentOrder(h3List.concat(h2Closing));
        }
        return Array.from(inner.querySelectorAll('h2')).filter(isNavigableLessonHeading);
    }

    /** Tüm modül yan menü linkleri (birden fazla .nav-section-list olduğunda hepsi) */
    function getAllNavSectionLinks() {
        var sidebar = document.querySelector('.module-sidebar') || document.querySelector('.sidebar-nav');
        if (sidebar) {
            var fromSidebar = sidebar.querySelectorAll('.nav-link-section');
            if (fromSidebar.length) return fromSidebar;
        }
        return document.querySelectorAll('.nav-section-list .nav-link-section, .nav-link-section');
    }

    function getAllNavSubLinks() {
        var sidebar = document.querySelector('.module-sidebar') || document.querySelector('.sidebar-nav');
        if (sidebar) {
            var fromSidebar = sidebar.querySelectorAll('.nav-link-sub');
            if (fromSidebar.length) return fromSidebar;
        }
        return document.querySelectorAll('.nav-section-list .nav-link-sub, .nav-link-sub');
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

    function isEmbeddedQuizElement(el) {
        return !!(el && el.classList && el.classList.contains('eval-quiz-section') && el.id);
    }

    function isQuizOnlyLessonKey(lessonKey) {
        return !!resolveQuizElementFromLessonKey(lessonKey);
    }

    function resolveQuizElementFromLessonKey(lessonKey) {
        var k = String(lessonKey || '').trim();
        if (!k) return null;
        var direct = document.getElementById(k);
        if (isEmbeddedQuizElement(direct)) return direct;
        var parsed = parseLessonKey(k);
        if (parsed.headingId && parsed.headingId !== parsed.sectionId) {
            var nested = document.getElementById(parsed.headingId);
            if (isEmbeddedQuizElement(nested)) return nested;
        }
        return null;
    }

    function isQuizHeadingText(text) {
        return /kendini\s+değerlendir/i.test(String(text || '').trim());
    }

    function getPrimaryQuizInSection(sec) {
        if (!sec) return null;
        var list = sec.querySelectorAll(
            '.section-inner .eval-quiz-section[id], .content-card .eval-quiz-section[id]'
        );
        return list.length ? list[0] : null;
    }

    /** Yinelenen modül testi bloklarını kaldırır (aynı id iki kez enjekte edilmişse) */
    function dedupeEmbeddedQuizSections() {
        var seen = new Set();
        document.querySelectorAll('.eval-quiz-section[id]').forEach(function (q) {
            var id = q.id;
            if (!id) return;
            if (seen.has(id)) {
                var prev = q.previousElementSibling;
                if (
                    prev &&
                    prev.tagName === 'H2' &&
                    /kendini\s+değerlendir/i.test(String(prev.textContent || ''))
                ) {
                    prev.remove();
                }
                q.remove();
                return;
            }
            seen.add(id);
        });
    }

    function resetQuizVisibilityInSection(section) {
        if (!section) return;
        section.querySelectorAll('.eval-quiz-section').forEach(function (q) {
            q.classList.remove('lesson-route-quiz-visible');
            var prev = q.previousElementSibling;
            if (prev && prev.tagName === 'H2') {
                prev.classList.remove('lesson-route-quiz-visible', 'lesson-route-quiz-intro');
            }
        });
        section.classList.remove('lesson-route-quiz-only');
    }

    function applyFlatSectionQuizVisibility(section, activeQuizId) {
        if (!section) return;
        resetQuizVisibilityInSection(section);
        if (!activeQuizId) return;
        var quiz = document.getElementById(activeQuizId);
        if (!quiz || !section.contains(quiz)) return;
        section.classList.add('lesson-route-quiz-only');
        quiz.classList.add('lesson-route-quiz-visible');
        var prev = quiz.previousElementSibling;
        if (prev && prev.tagName === 'H2') {
            prev.classList.add('lesson-route-quiz-visible', 'lesson-route-quiz-intro');
        }
    }

    function applySectionInnerQuizVisibility(section, activeQuizId) {
        if (!section) return;
        section.querySelectorAll('.eval-quiz-section').forEach(function (q) {
            var show = !!(activeQuizId && q.id === activeQuizId);
            q.classList.toggle('lesson-route-quiz-visible', show);
            var prev = q.previousElementSibling;
            if (prev && prev.tagName === 'H2' && isQuizHeadingText(prev.textContent)) {
                prev.classList.toggle('lesson-route-quiz-visible', show);
                prev.classList.toggle('lesson-route-quiz-intro', show);
            }
        });
        section.classList.toggle('lesson-route-quiz-only', !!activeQuizId);
    }

    /** Her modül/bölümün sonuna tek modül testi anahtarı ekler */
    function augmentLessonKeysWithEmbeddedQuizzes(keys) {
        var input = keys || [];
        if (!input.length) return input;
        var out = [];
        var seen = new Set();
        var i = 0;
        while (i < input.length) {
            var k = input[i];
            var sid = parseLessonKey(k).sectionId;
            var j = i + 1;
            while (j < input.length && parseLessonKey(input[j]).sectionId === sid) {
                j++;
            }
            for (var n = i; n < j; n++) {
                if (!seen.has(input[n])) {
                    out.push(input[n]);
                    seen.add(input[n]);
                }
            }
            var sec = sid ? document.getElementById(sid) : null;
            var quiz = getPrimaryQuizInSection(sec);
            if (quiz && quiz.id) {
                var qk =
                    sec && isFlatLessonSection(sec) && isFlatLessonModule()
                        ? quiz.id
                        : makeLessonKey(sid, quiz.id);
                if (!seen.has(qk)) {
                    out.push(qk);
                    seen.add(qk);
                }
            }
            i = j;
        }
        return out;
    }

    function findQuizForNavLessonGroup(lessonLinks) {
        for (var i = lessonLinks.length - 1; i >= 0; i--) {
            var sid = lessonLinks[i].getAttribute('data-section');
            if (!sid) continue;
            var quiz = getPrimaryQuizInSection(document.getElementById(sid));
            if (quiz && quiz.id) return { sid: sid, quizId: quiz.id };
        }
        return null;
    }

    function insertModuleQuizNavAfterLi(li, sid, quizId) {
        if (!li || !li.parentNode || !sid || !quizId) return;
        var next = li.nextElementSibling;
        if (
            next &&
            next.querySelector &&
            next.querySelector('.nav-link-quiz[data-quiz-id="' + quizId + '"]')
        ) {
            return;
        }
        var quizLi = document.createElement('li');
        var quizLink = document.createElement('a');
        quizLink.href = '#';
        quizLink.className = 'nav-link-section nav-link-quiz';
        quizLink.setAttribute('data-section', sid);
        quizLink.setAttribute('data-quiz-id', quizId);
        quizLink.innerHTML =
            '<i class="fas fa-clipboard-check" aria-hidden="true"></i> Modül testi';
        quizLi.appendChild(quizLink);
        li.parentNode.insertBefore(quizLi, li.nextElementSibling);
    }

    /** Yan menü: modül başına «Modül testi» (section-inner modüllerde her satır; gruplu listede tek) */
    function syncModuleQuizSidebarNav() {
        document.querySelectorAll('.sidebar-nav .nav-section').forEach(function (navSec) {
            var list = navSec.querySelector('.nav-section-list');
            if (!list) return;
            var lessonLinks = list.querySelectorAll('.nav-link-section:not(.nav-link-quiz)');
            if (!lessonLinks.length) return;
            var firstSec = document.getElementById(lessonLinks[0].getAttribute('data-section'));
            var perTopLevelModule =
                firstSec && firstSec.querySelector('.section-inner');
            if (perTopLevelModule) {
                lessonLinks.forEach(function (link) {
                    var sid = link.getAttribute('data-section');
                    if (!sid) return;
                    var quiz = getPrimaryQuizInSection(document.getElementById(sid));
                    if (!quiz || !quiz.id) return;
                    insertModuleQuizNavAfterLi(link.closest('li'), sid, quiz.id);
                });
                return;
            }
            if (list.querySelector('.nav-link-quiz')) return;
            var found = findQuizForNavLessonGroup(lessonLinks);
            if (!found) return;
            var lastLi = lessonLinks[lessonLinks.length - 1].closest('li');
            insertModuleQuizNavAfterLi(lastLi, found.sid, found.quizId);
        });
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

    var lastRunSubNavScroll = null;
    /** 'h2' (varsayılan) veya 'h3' — İleri Kriptografi gibi h3 ağırlıklı modüller */
    var lessonHeadingLevel = 'h2';

    function sortHeadingsByDocumentOrder(headings) {
        return headings.slice().sort(function (a, b) {
            if (a === b) return 0;
            var pos = a.compareDocumentPosition(b);
            if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
        });
    }

    function isNavigableLessonHeading(h) {
        if (!h) return false;
        var t = String(h.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();
        if (!t) return false;
        if (isModuleThemeHeading(h)) return false;
        if (/^modül\s+özeti$/i.test(t)) return false;
        if (h.closest('.sg-isletim-intro, .learning-objectives, #lesson-route-hero')) {
            return false;
        }
        if (/^terimler\s+sözlüğü/i.test(t)) {
            return false;
        }
        if (isQuizHeadingText(t)) {
            return false;
        }
        if (lessonHeadingLevel === 'h3') {
            if (/^modül\s+\d+\s*[—\-–:]/i.test(t)) return false;
            if (/^kazanımlar$/i.test(t)) return false;
            if (/\t/.test(t)) return false;
            if (t.length < 4) return false;
        }
        return true;
    }

    function isClosingLessonH2(h) {
        if (!h || h.tagName !== 'H2') return false;
        var t = String(h.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();
        return (
            /kendini\s+değerlendir/i.test(t) ||
            /^bu modülde neler öğrendik/i.test(t) ||
            /^kapanış:/i.test(t)
        );
    }

    function shouldBuildSubheadingNav(cfg) {
        if (cfg && cfg.subNavScroll === false) return false;
        if (cfg && cfg.subNavScroll === true) return true;
        return moduleHasSubheadingNav();
    }

    function stripSubheadingNav(navSectionList) {
        if (!navSectionList) return;
        navSectionList.querySelectorAll('.nav-sublist').forEach(function (el) {
            el.remove();
        });
        navSectionList.querySelectorAll('.nav-section-item').forEach(function (li) {
            li.classList.remove('nav-section-item', 'is-open');
        });
        navSectionList.querySelectorAll('.nav-link-section .nav-expand-indicator').forEach(function (i) {
            i.remove();
        });
        navSectionList.querySelectorAll('.nav-link-section').forEach(function (link) {
            var label = link.querySelector('.nav-label');
            if (!label) return;
            var icon = label.querySelector('i.fas, i.fab');
            var text = label.textContent.trim();
            link.textContent = '';
            if (icon) link.appendChild(icon);
            link.appendChild(document.createTextNode(' ' + text));
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
                ensureHeadingId(h2, sectionId, idx);
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
        if (heading.id) return heading.id;
        var slug = slugifyAnchor(heading.textContent) || 'lesson-' + idx;
        if (slug.length > 64) {
            slug = slug.slice(0, 64).replace(/-+$/, '');
        }
        heading.id = sectionId + '-' + slug;
        return heading.id;
    }

    function unionLessonKeyLists() {
        var out = [];
        var seen = new Set();
        for (var a = 0; a < arguments.length; a++) {
            var list = arguments[a];
            if (!Array.isArray(list)) continue;
            list.forEach(function (k) {
                k = String(k || '').trim();
                if (!k || seen.has(k)) return;
                seen.add(k);
                out.push(k);
            });
        }
        return out;
    }

    /** Eski sürüm: uzun başlık id’si lesson-N ile değiştirilmiş kayıtları güncel menü anahtarına eşler */
    function remapLegacyLessonIndexKey(entry, keysOrdered) {
        var k = String(entry || '');
        if (k.indexOf('::') === -1) return k;
        var parsed = parseLessonKey(k);
        var legacy = String(parsed.headingId || '').match(/-lesson-(\d+)$/);
        if (!legacy) return k;
        var idx = parseInt(legacy[1], 10);
        if (isNaN(idx)) return k;
        var inSection = (keysOrdered || []).filter(function (key) {
            return parseLessonKey(key).sectionId === parsed.sectionId;
        });
        return inSection[idx] || k;
    }

    function makeLessonKey(sectionId, headingId) {
        if (!headingId || headingId === sectionId) {
            return sectionId;
        }
        return sectionId + '::' + headingId;
    }

    /** Düz modül (network vb.): ilerleme ve URL yalnızca bölüm kimliği (ders-1-2) */
    function canonicalLessonKey(lessonKey) {
        var k = String(lessonKey || '').trim();
        if (!k) return k;
        if (!isFlatLessonModule()) return k;
        var sep = k.indexOf('::');
        return sep === -1 ? k : k.slice(0, sep);
    }

    function resolveLessonKeyFromRoute(raw, keysOrdered) {
        var keys = keysOrdered || [];
        var r = String(raw || '').trim();
        if (!r) return null;
        if (keys.indexOf(r) !== -1) return r;
        var fromSection = lessonKeyForSection(r);
        if (keys.indexOf(fromSection) !== -1) return fromSection;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === r || keys[i].indexOf(r + '::') === 0) {
                return canonicalLessonKey(keys[i]);
            }
        }
        return null;
    }

    function syncLessonUrl(lessonKey, basePath, replace) {
        if (!lessonKey || !global.history || !global.history.replaceState) return;
        try {
            var href = hrefForLessonKey(lessonKey, basePath);
            var method = replace ? 'replaceState' : 'pushState';
            global.history[method]({ sebsLessonKey: lessonKey }, '', href);
        } catch (eUrl) {
            /* ignore */
        }
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
        var parsed = parseLessonKey(canonicalLessonKey(lessonKey));
        if (isFlatLessonModule()) {
            var flatParams = new URLSearchParams(q ? q.replace(/^\?/, '') : '');
            flatParams.set('bolum', parsed.sectionId);
            return '/modules/' + slug + '.html?' + flatParams.toString();
        }
        if (q) {
            var params = new URLSearchParams(q.replace(/^\?/, ''));
            if (String(lessonKey || '').indexOf('::') !== -1) {
                params.set('ders', lessonKey);
                params.delete('bolum');
            } else {
                params.set('bolum', parsed.sectionId);
                params.delete('ders');
            }
            return '/modules/' + slug + '.html?' + params.toString();
        }
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
        lessonKey = canonicalLessonKey(lessonKey);
        var href = hrefForLessonKey(lessonKey, basePath);
        var here = global.location.pathname + global.location.search;
        if (sameLessonUrl(here, href)) {
            return false;
        }
        if (isFlatLessonModule() && !opts.forceReload) {
            if (typeof opts.onNavigateInPlace === 'function') {
                opts.onNavigateInPlace(lessonKey, { replace: !!opts.replace });
            }
            syncLessonUrl(lessonKey, basePath, !!opts.replace);
            return true;
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
        hideLegacyLessonControls(container);
    }

    function hideLegacyLessonControls(scope) {
        var root = scope && scope.querySelectorAll ? scope : document;
        var cards = root.querySelectorAll
            ? root.matches && root.matches('.content-card')
                ? [root]
                : root.querySelectorAll('.content-card')
            : [];
        cards.forEach(function (card) {
            if (!card.querySelector('.lesson-complete-footer')) return;
            card.querySelectorAll('.lesson-controls').forEach(function (el) {
                el.hidden = true;
                el.setAttribute('aria-hidden', 'true');
            });
        });
    }

    function refreshCompleteButtons(completedList) {
        var done = new Set(
            Array.isArray(completedList)
                ? completedList.map(function (k) {
                      return canonicalLessonKey(k);
                  })
                : []
        );
        document.querySelectorAll('.lesson-complete-btn, .btn-complete-lesson').forEach(function (btn) {
            var card = btn.closest('.content-card');
            var sec = btn.closest('.content-section');
            var key =
                (card && card.getAttribute('data-lesson-key')) ||
                btn.getAttribute('data-section') ||
                (sec && sec.id) ||
                '';
            key = canonicalLessonKey(key);
            var isDone = key && done.has(key);
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
                if (sec.id) {
                    if (isFlatLessonModule()) {
                        keys.push(sec.id);
                    } else {
                        var flatHead = flatSectionHeading(sec);
                        keys.push(
                            flatHead
                                ? makeLessonKey(sec.id, ensureHeadingId(flatHead, sec.id, 0))
                                : sec.id
                        );
                    }
                }
                return;
            }
            var subHeadings = getSectionSubheadings(inner);
            if (subHeadings.length) {
                subHeadings.forEach(function (head, idx) {
                    keys.push(makeLessonKey(sec.id, ensureHeadingId(head, sec.id, idx)));
                });
                return;
            }
            var cards = inner.querySelectorAll(':scope > .content-card');
            if (cards.length) {
                cards.forEach(function (card, idx) {
                    var head = getCardLessonHeading(card);
                    if (!head || isModuleThemeHeading(head)) return;
                    keys.push(makeLessonKey(sec.id, ensureHeadingId(head, sec.id, idx)));
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
        var subLinks = getAllNavSubLinks();
        subLinks.forEach(function (a) {
            var secId = a.getAttribute('data-section');
            var anchorId = a.getAttribute('data-anchor');
            if (secId && anchorId) {
                fromNav.push(makeLessonKey(secId, anchorId));
            }
        });
        var sectionLinks = getAllNavSectionLinks();
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
        if (navHasSub) return augmentLessonKeysWithEmbeddedQuizzes(fromNav);
        if (domHasSub) return augmentLessonKeysWithEmbeddedQuizzes(fromDom);
        if (fromNav.length) return augmentLessonKeysWithEmbeddedQuizzes(fromNav);
        return augmentLessonKeysWithEmbeddedQuizzes(fromDom);
    }

    function catalogLessonTotal(fallback) {
        var navCount = getAllNavSectionLinks().length;
        var orderedLen = 0;
        try {
            orderedLen = collectLessonKeysOrdered().length;
        } catch (eCatalog) {
            orderedLen = 0;
        }
        if (orderedLen > navCount) return orderedLen;
        if (navCount > 0) return navCount;
        if (orderedLen > 0) return orderedLen;
        return Math.max(1, parseInt(String(fallback), 10) || 1);
    }

    function buildAllSubheadingNavs() {
        var lists = document.querySelectorAll(
            '.module-sidebar .nav-section-list, .sidebar-nav .nav-section-list'
        );
        if (!lists.length) {
            var fallback = document.querySelector('.nav-section-list');
            if (fallback) buildSubheadingNav(fallback);
            return;
        }
        lists.forEach(function (list) {
            buildSubheadingNav(list);
        });
    }

    function stripAllSubheadingNavs() {
        var lists = document.querySelectorAll(
            '.module-sidebar .nav-section-list, .sidebar-nav .nav-section-list'
        );
        if (!lists.length) {
            var fallback = document.querySelector('.nav-section-list');
            if (fallback) stripSubheadingNav(fallback);
            return;
        }
        lists.forEach(function (list) {
            stripSubheadingNav(list);
        });
    }

    /** Yan menüde tamamlanan modül / alt ders işaretleri */
    function markCompletedInSidebar(navLinks, lessonKeysOrdered, completedLessons) {
        var done = new Set(
            Array.isArray(completedLessons)
                ? completedLessons.map(function (k) {
                      return canonicalLessonKey(k);
                  })
                : []
        );
        var keys = lessonKeysOrdered || [];
        Array.from(navLinks || []).forEach(function (link) {
            var sid = link.getAttribute('data-section');
            if (!sid) return;
            var keysInSection = keys.filter(function (k) {
                return k === sid || k.indexOf(sid + '::') === 0;
            });
            var sectionMarkedDone = done.has(sid) || done.has(canonicalLessonKey(sid));
            var doneInSection = keysInSection.filter(function (k) {
                return done.has(canonicalLessonKey(k));
            });
            var allDone =
                sectionMarkedDone ||
                (keysInSection.length > 0 &&
                    doneInSection.length === keysInSection.length);
            var partial = !allDone && doneInSection.length > 0;
            link.classList.toggle('completed', allDone);
            link.classList.toggle('completed-partial', partial);
            if (keysInSection.length && partial) {
                link.setAttribute(
                    'title',
                    doneInSection.length + ' / ' + keysInSection.length + ' ders tamamlandı'
                );
            } else {
                link.removeAttribute('title');
            }
            var item = link.closest('.nav-section-item');
            if (item && (allDone || partial)) {
                item.classList.add('is-open');
            }
        });
        getAllNavSubLinks().forEach(function (a) {
            var sec = a.getAttribute('data-section');
            var anchor = a.getAttribute('data-anchor');
            if (!sec || !anchor) return;
            var lk = makeLessonKey(sec, anchor);
            var sectionMarkedDone = done.has(sec) || done.has(canonicalLessonKey(sec));
            var isDone =
                sectionMarkedDone || done.has(lk) || done.has(canonicalLessonKey(lk));
            a.classList.toggle('completed', isDone);
            if (isDone) {
                a.setAttribute('title', 'Tamamlandı');
            } else {
                a.removeAttribute('title');
            }
        });
    }

    function installLessonCompleteControls(routeMode, completeHandler) {
        document.querySelectorAll('.content-section').forEach(function (sec) {
            var inner = sec.querySelector('.section-inner');
            if (!inner) {
                var flatKey = isFlatLessonModule()
                    ? sec.id
                    : (function () {
                          var flatHead = flatSectionHeading(sec);
                          return flatHead
                              ? makeLessonKey(sec.id, ensureHeadingId(flatHead, sec.id, 0))
                              : sec.id;
                      })();
                var legacyCard = sec.querySelector('.content-card');
                if (!legacyCard) {
                    var body = sec.querySelector('.content-body, .lesson-content');
                    if (body && body.parentElement === sec) {
                        legacyCard = document.createElement('div');
                        legacyCard.className = 'content-card';
                        sec.insertBefore(legacyCard, body);
                        legacyCard.appendChild(body);
                    }
                }
                if (legacyCard) {
                    legacyCard.setAttribute('data-lesson-key', flatKey);
                    if (routeMode && !legacyCard.querySelector('.lesson-complete-footer')) {
                        appendLessonFooter(legacyCard, function () {
                            completeHandler(flatKey);
                        });
                    }
                }
                return;
            }

            var subHeadings = getSectionSubheadings(inner);
            if (subHeadings.length) {
                    subHeadings.forEach(function (head, idx) {
                        var hid = ensureHeadingId(head, sec.id, idx);
                        var lessonKey = makeLessonKey(sec.id, hid);
                        var block = ensureHeadingLessonCard(head, inner);
                        block.setAttribute('data-lesson-key', lessonKey);
                        if (!block.querySelector('.lesson-complete-footer')) {
                            appendLessonFooter(block, function () {
                                completeHandler(lessonKey);
                            });
                        }
                    });
            } else {
                var cards = inner.querySelectorAll(':scope > .content-card');
                if (cards.length) {
                    cards.forEach(function (card, idx) {
                        var head = getCardLessonHeading(card);
                        if (!head || isModuleThemeHeading(head)) return;
                        var hid = ensureHeadingId(head, sec.id, idx);
                        var lessonKey = makeLessonKey(sec.id, hid);
                        card.setAttribute('data-lesson-key', lessonKey);
                        if (!card.querySelector('.lesson-complete-footer')) {
                            appendLessonFooter(card, function () {
                                completeHandler(lessonKey);
                            });
                        }
                    });
                } else {
                    var head = inner.querySelector(':scope > h2, :scope > h3');
                    if (head && isModuleThemeHeading(head)) {
                        head = inner.querySelector(':scope > h2:not([data-sebs-skip]), :scope > h3');
                    }
                    var lessonKey = head
                        ? makeLessonKey(sec.id, ensureHeadingId(head, sec.id, 0))
                        : sec.id;
                    if (!inner.querySelector('.lesson-complete-footer')) {
                        appendLessonFooter(inner, function () {
                            completeHandler(lessonKey);
                        });
                    }
                }
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
                    key = isFlatLessonModule()
                        ? sid
                        : (function () {
                              var flatHead = flatSectionHeading(sec);
                              return flatHead
                                  ? makeLessonKey(sid, ensureHeadingId(flatHead, sid, 0))
                                  : sid;
                          })();
                } else if (sec) {
                    key = resolveActiveLessonKeyInSection(sec) || sid;
                }
                completeHandler(key);
            });
        });

        if (routeMode) {
            hideLegacyLessonControls(document);
        }
    }

    function resolveActiveLessonKeyInSection(sec) {
        if (!sec || !sec.id) return null;
        var card = sec.querySelector('.lesson-route-current-card');
        if (card) {
            var dk = card.getAttribute('data-lesson-key');
            if (dk) return dk;
            var ch = getCardLessonHeading(card);
            if (ch && !isModuleThemeHeading(ch)) {
                return makeLessonKey(sec.id, ensureHeadingId(ch, sec.id, 0));
            }
        }
        return lessonKeyForSection(sec.id);
    }

    function lessonKeyForSection(sectionId) {
        var sec = document.getElementById(sectionId);
        if (!sec) return sectionId;
        var inner = sec.querySelector('.section-inner');
        if (!inner) {
            if (isFlatLessonModule()) return sectionId;
            var flatHead = flatSectionHeading(sec);
            return flatHead
                ? makeLessonKey(sectionId, ensureHeadingId(flatHead, sectionId, 0))
                : sectionId;
        }
        var card = firstNavigableCard(inner);
        if (!card) {
            card = inner.querySelector(':scope > .content-card');
        }
        var head = card
            ? getCardLessonHeading(card)
            : inner.querySelector(':scope > h2, :scope > h3');
        if (head && isModuleThemeHeading(head)) {
            var subs = getSectionSubheadings(inner);
            head = subs.length ? subs[0] : head;
        }
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
        var navLinks = getAllNavSectionLinks();
        var navSectionList = document.querySelector('.nav-section-list');
        var progressFill = document.getElementById('progressFill');
        var progressText = document.getElementById('progressText');

        enhanceNotes();
        enhanceMiniHeadings();
        enhanceRunbookHeadings();
        tableizeGlossaries();
        applyTemelCardLayout();
        dedupeEmbeddedQuizSections();
        try {
            global.dispatchEvent(new Event('sebs-lesson-cards-ready'));
        } catch (e) {
            var ev = document.createEvent('Event');
            ev.initEvent('sebs-lesson-cards-ready', true, true);
            global.dispatchEvent(ev);
        }

        lastRunSubNavScroll = shouldBuildSubheadingNav(cfg);
        if (lastRunSubNavScroll) {
            buildAllSubheadingNavs();
        } else {
            stripAllSubheadingNavs();
        }

        global.MODULE_TOTAL_LESSONS = catalogLessonTotal(navLinks.length);

        async function loadProgress() {
            var local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            var localDone = Array.isArray(local.completedLessons) ? local.completedLessons.map(String) : [];
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
                if (r.ok) {
                    var d = await r.json();
                    var step =
                        d.data && typeof d.data.lastStep === 'string'
                            ? JSON.parse(d.data.lastStep || '{}')
                            : (d.data && d.data.lastStep) || {};
                    var fromApi = Array.isArray(step.completedLessons)
                        ? step.completedLessons.map(String)
                        : [];
                    var merged = unionLessonKeyLists(localDone, fromApi);
                    if (merged.length) {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({
                                completedLessons: merged,
                                totalLessons: step.totalLessons || navLinks.length,
                                lastUpdated: new Date().toISOString()
                            })
                        );
                    }
                    return merged.length ? merged : localDone;
                }
            } catch (e) {
                console.warn('Load progress from API failed:', e);
            }
            return localDone;
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

        function markSidebarProgress(completedLessons) {
            markCompletedInSidebar(
                getAllNavSectionLinks(),
                sectionIdsOrdered,
                completedLessons
            );
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
            markSidebarProgress(completed);
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

        if (lastRunSubNavScroll) {
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
            markSidebarProgress(completed);
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
        lessonHeadingLevel = cfg.lessonHeadingLevel === 'h3' ? 'h3' : 'h2';
        if (!cfg.progressMode) {
            if (isFlatLessonModule()) {
                cfg = Object.assign({}, cfg, { progressMode: 'lesson' });
            } else {
                var navCount = getAllNavSectionLinks().length;
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
        var navLinks = getAllNavSectionLinks();
        var navSectionList = document.querySelector('.nav-section-list');
        var lessonKeysOrdered = [];
        var progressFill = document.getElementById('progressFill');
        var progressText = document.getElementById('progressText');

        enhanceNotes();
        enhanceMiniHeadings();
        enhanceRunbookHeadings();
        tableizeGlossaries();
        applyTemelCardLayout();
        dedupeEmbeddedQuizSections();
        try {
            global.dispatchEvent(new Event('sebs-lesson-cards-ready'));
        } catch (e) {
            var ev = document.createEvent('Event');
            ev.initEvent('sebs-lesson-cards-ready', true, true);
            global.dispatchEvent(ev);
        }

        lastRunSubNavScroll = shouldBuildSubheadingNav(cfg);
        if (lastRunSubNavScroll) {
            buildAllSubheadingNavs();
        } else {
            stripAllSubheadingNavs();
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
                entry = canonicalLessonKey(entry);
                entry = remapLegacyLessonIndexKey(entry, lessonKeysOrdered);
                if (isFlatLessonModule()) {
                    if (sidSet.has(entry)) {
                        out.add(entry);
                        return;
                    }
                    if (isQuizOnlyLessonKey(entry)) {
                        out.add(entry);
                        return;
                    }
                    var pq = parseLessonKey(entry);
                    if (
                        pq.headingId &&
                        pq.headingId !== pq.sectionId &&
                        isEmbeddedQuizElement(document.getElementById(pq.headingId))
                    ) {
                        out.add(entry);
                    }
                    return;
                }
                if (entry.indexOf('::') !== -1) {
                    var quizPart = parseLessonKey(entry).headingId;
                    if (isEmbeddedQuizElement(document.getElementById(quizPart))) {
                        out.add(entry);
                        return;
                    }
                }
                if (entry.indexOf('::') !== -1) {
                    out.add(entry);
                    return;
                }
                if (sidSet.has(entry)) {
                    out.add(entry);
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
                    var fromApi = step.completedLessons || [];
                    var merged = normalizeCompletedLessons(
                        unionLessonKeyLists(localDone, fromApi)
                    );
                    if (merged.length) {
                        var catalogTotal = catalogLessonTotal(lessonKeysOrdered.length);
                        var apiTotal = parseInt(String(step.totalLessons), 10) || 0;
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({
                                completedLessons: merged,
                                totalLessons: Math.max(catalogTotal, apiTotal < catalogTotal ? 0 : apiTotal),
                                lastUpdated: new Date().toISOString()
                            })
                        );
                    }
                    return merged.length ? merged : localDone;
                }
            } catch (e) {
                console.warn('Load progress from API failed:', e);
            }
            return localDone;
        }

        function saveProgressLocal(completedLessons) {
            var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            var prior = Array.isArray(stored.completedLessons) ? stored.completedLessons : [];
            completedLessons = normalizeCompletedLessons(
                unionLessonKeyLists(prior, completedLessons || [])
            );
            var total = catalogLessonTotal(lessonKeysOrdered.length);
            if (lessonKeysOrdered.length && completedLessons.length) {
                var valid = new Set(lessonKeysOrdered.map(canonicalLessonKey));
                var kept = [];
                var seenSave = new Set();
                completedLessons.forEach(function (k) {
                    var ck = canonicalLessonKey(k);
                    var resolved = resolveLessonKeyFromRoute(k, lessonKeysOrdered);
                    var canonical = resolved ? canonicalLessonKey(resolved) : ck;
                    if (!canonical || !valid.has(canonical) || seenSave.has(canonical)) return;
                    seenSave.add(canonical);
                    kept.push(canonical);
                });
                completedLessons = kept;
            }
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
            var total = catalogLessonTotal(lessonKeysOrdered.length);
            var pct = total ? Math.round((completedCount / total) * 100) : 0;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '% Tamamlandı';
        }

        function markSidebarProgress(completedLessons) {
            markCompletedInSidebar(
                getAllNavSectionLinks(),
                lessonKeysOrdered,
                completedLessons
            );
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
                elMod.textContent = '';
                elMod.hidden = true;
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
                    'lesson-route-show-module-intro',
                    'active'
                );
            });
            document.querySelectorAll('.content-card').forEach(function (c) {
                c.classList.remove('lesson-route-current-card');
            });
            var quizEl = resolveQuizElementFromLessonKey(lessonKey);
            var parsed = parseLessonKey(lessonKey);
            var sid = quizEl
                ? (quizEl.closest('.content-section') || {}).id || parsed.sectionId
                : parsed.sectionId;
            var h2id = quizEl ? quizEl.id : parsed.headingId;
            var section = document.getElementById(sid);
            var head = quizEl
                ? quizEl.previousElementSibling &&
                  quizEl.previousElementSibling.tagName === 'H2'
                    ? quizEl.previousElementSibling
                    : null
                : document.getElementById(h2id);
            if (head && head.classList && head.classList.contains('content-section')) {
                head = null;
            }
            if (!head && section && !quizEl) {
                head = flatSectionHeading(section);
            }
            var card = head ? head.closest('.content-card') : null;
            if (!card && head && section) {
                var innerForCard = section.querySelector('.section-inner');
                if (innerForCard) {
                    card = ensureHeadingLessonCard(head, innerForCard);
                }
            }
            if (!card && section) {
                if (head && head.id) {
                    var byId = document.getElementById(head.id);
                    if (byId) card = byId.closest('.content-card');
                }
                if (!card) {
                    card = section.querySelector('.content-card');
                }
            }
            if (section) {
                section.classList.add('lesson-route-current-section', 'active');
                var inner = section.querySelector('.section-inner');
                if (card && inner) {
                    var introCard = firstNavigableCard(inner);
                    if (introCard && card === introCard) {
                        section.classList.add('lesson-route-show-module-intro');
                    }
                    if (quizEl) {
                        applySectionInnerQuizVisibility(section, quizEl.id);
                    } else {
                        applySectionInnerQuizVisibility(section, null);
                    }
                } else {
                    section.classList.add('lesson-route-whole-section');
                    if (quizEl) {
                        applyFlatSectionQuizVisibility(section, quizEl.id);
                    } else {
                        applyFlatSectionQuizVisibility(section, null);
                    }
                }
            }
            if (card) {
                card.classList.add('lesson-route-current-card');
                card.setAttribute('data-lesson-key', lessonKey);
            }
            if (head) {
                applyTopicTitleToHeading(head);
            }
            getAllNavSectionLinks().forEach(function (l) {
                var linkSid = l.getAttribute('data-section');
                var linkQuizId = l.getAttribute('data-quiz-id');
                var active = false;
                if (linkQuizId && linkSid) {
                    active = lessonKey === makeLessonKey(linkSid, linkQuizId);
                } else if (linkSid === sid) {
                    active = !quizEl && (lessonKey === sid || lessonKey.indexOf(sid + '::') === 0);
                }
                l.classList.toggle('active', active);
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
            getAllNavSubLinks().forEach(function (a) {
                var secId = a.getAttribute('data-section');
                var anchorId = a.getAttribute('data-anchor');
                if (!secId || !anchorId) return;
                var lk = secId + '::' + anchorId;
                a.setAttribute('href', hrefWithDersParam(lk));
                if (a.dataset.sebsNavWired === '1') return;
                a.dataset.sebsNavWired = '1';
                a.addEventListener('click', function (ev) {
                    if (lessonKeysOrdered.indexOf(lk) === -1) return;
                    ev.preventDefault();
                    navigateToLesson(lk, { inPlace: true });
                    syncLessonUrl(lk, basePath, false);
                });
            });
            getAllNavSectionLinks().forEach(function (link) {
                var sid = link.getAttribute('data-section');
                var quizId = link.getAttribute('data-quiz-id');
                var firstKey = null;
                if (quizId && sid) {
                    firstKey = makeLessonKey(sid, quizId);
                } else {
                    firstKey = lessonKeysOrdered.find(function (k) {
                        return k === sid || k.indexOf(sid + '::') === 0;
                    });
                    if (!firstKey && sid) {
                        firstKey = lessonKeyForSection(sid);
                    }
                }
                if (firstKey) {
                    link.setAttribute('href', hrefWithDersParam(firstKey));
                }
                if (link.dataset.sebsNavWired === '1') return;
                link.dataset.sebsNavWired = '1';
                link.addEventListener('click', function (ev) {
                    var key =
                        quizId && sid
                            ? makeLessonKey(sid, quizId)
                            : firstKey || (sid ? lessonKeyForSection(sid) : '');
                    key = canonicalLessonKey(key);
                    if (!key || lessonKeysOrdered.indexOf(key) === -1) return;
                    ev.preventDefault();
                    navigateToLesson(key, { inPlace: true });
                    syncLessonUrl(key, basePath, false);
                });
            });
        }

        function navLinkResolvesToLessonKey(link, lessonKey) {
            var linkSid = link.getAttribute('data-section');
            var linkQuizId = link.getAttribute('data-quiz-id');
            if (linkQuizId && linkSid) {
                return lessonKey === makeLessonKey(linkSid, linkQuizId);
            }
            if (!linkSid) return false;
            return (
                lessonKey === linkSid ||
                (lessonKey.indexOf(linkSid + '::') === 0 && !resolveQuizElementFromLessonKey(lessonKey))
            );
        }

        function goToNextLessonAfter(lessonKey) {
            lessonKey = canonicalLessonKey(lessonKey);
            var idx = lessonKeysOrdered.indexOf(lessonKey);
            if (idx >= 0 && idx + 1 < lessonKeysOrdered.length) {
                var nextKey = lessonKeysOrdered[idx + 1];
                navigateToLesson(nextKey, { inPlace: true });
                syncLessonUrl(nextKey, basePath, false);
            }
        }

        async function completeLesson(lessonKey) {
            lessonKey = canonicalLessonKey(lessonKey);
            var completed = await loadProgress();
            if (completed.includes(lessonKey)) {
                goToNextLessonAfter(lessonKey);
                return;
            }
            completed.push(lessonKey);
            saveProgressLocal(completed);
            markSidebarProgress(completed);
            refreshCompleteButtons(completed);
            var totalLessons = catalogLessonTotal(lessonKeysOrdered.length);
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
        global.MODULE_TOTAL_LESSONS = catalogLessonTotal(lessonKeysOrdered.length);

        syncModuleQuizSidebarNav();

        installLessonCompleteControls(true, function (key) {
            completeLesson(key);
        });

        wireLessonNavigation();

        (function initLessonRouteFromUrl() {
            var fromUrl = parseRouteKeyFromUrl(basePath);
            try {
                var legacy = new URLSearchParams(global.location.search).get('ders');
                if (legacy) {
                    var resolvedLegacy = resolveLessonKeyFromRoute(legacy, lessonKeysOrdered);
                    if (resolvedLegacy) fromUrl = resolvedLegacy;
                }
            } catch (eLegacy) { /* ignore */ }
            fromUrl = resolveLessonKeyFromRoute(fromUrl, lessonKeysOrdered);
            if (isModuleIndexPath(basePath) && lessonKeysOrdered.length && !fromUrl) {
                var first = lessonKeysOrdered[0];
                navigateToLesson(first, { replace: true, inPlace: true });
                syncLessonUrl(first, basePath, true);
                return;
            }
            var initial = fromUrl || lessonKeysOrdered[0];
            if (initial) {
                navigateToLesson(initial, { replace: true, inPlace: true });
                if (fromUrl) syncLessonUrl(initial, basePath, true);
            }
        })();

        global.addEventListener('popstate', function () {
            var key = resolveLessonKeyFromRoute(parseRouteKeyFromUrl(basePath), lessonKeysOrdered);
            if (key) navigateToLesson(key, { inPlace: true });
        });

        (async function initProgress() {
            var completed = normalizeCompletedLessons(await loadProgress());
            saveProgressLocal(completed);
            updateProgressUI(completed.length);
            markSidebarProgress(completed);
            refreshCompleteButtons(completed);
            var catalogTotal = catalogLessonTotal(lessonKeysOrdered.length);
            if (
                catalogTotal > 1 &&
                completed.length > 0 &&
                completed.length < catalogTotal &&
                global.syncModuleProgressBulk
            ) {
                var authTok =
                    (global.getProgressAuthToken && (await global.getProgressAuthToken())) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('authToken'));
                if (authTok) {
                    global
                        .syncModuleProgressBulk(MODULE_NAME, completed, catalogTotal)
                        .catch(function () {});
                }
            }
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
            if (!list) return;
            if (lastRunSubNavScroll === false) {
                stripSubheadingNav(list);
                return;
            }
            if (!moduleHasSubheadingNav()) return;
            buildSubheadingNav(list);
        }
    };
})(typeof window !== 'undefined' ? window : this);
