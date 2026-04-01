#!/usr/bin/env node
/**
 * Integrates generated Temel Network content into temel-network-egitimi.html
 */
const fs = require('fs');
const path = require('path');

const MODULE_FILE = path.join(__dirname, '..', 'modules', 'temel-network-egitimi.html');
const GENERATED_FILE = path.join(__dirname, '..', 'modules', 'temel-network-content.generated.html');

let html = fs.readFileSync(MODULE_FILE, 'utf8');
const generated = fs.readFileSync(GENERATED_FILE, 'utf8');

// Extract nav items (between <!-- Sidebar/Nav --> and <!-- Content sections -->)
const navMatch = generated.match(/<!-- Sidebar: Lesson titles[\s\S]*?-->\s*([\s\S]*?)\n\n<!-- Content:/)
  || generated.match(/<!-- Nav items for sidebar -->\s*([\s\S]*?)\n\n<!-- Content sections/m);
const navItems = navMatch ? navMatch[1].trim() : (generated.match(/<!-- (?:Sidebar|Nav)[\s\S]*?-->\s*([\s\S]*?)(?=\n\n<!-- Content)/) || [])[1]?.trim() || '';

// Extract content sections (from <!-- Content sections --> or similar to end)
const contentMatch = generated.match(/<!-- Content:[\s\S]*?-->\s*([\s\S]+)/)
  || generated.match(/<!-- Content sections for main -->\s*([\s\S]+)/);
const contentSections = contentMatch ? contentMatch[1].trim() : '';

// Replace sidebar nav: from <ul class="nav-list nav-section-list"> content to </ul>
html = html.replace(
  /(<ul class="nav-list nav-section-list">)\s*[\s\S]*?(\s*<\/ul>)/,
  `$1\n${navItems}\n$2`
);

// Replace main content: from <main...> to </main>
html = html.replace(
  /(<main[^>]*>)\s*[\s\S]*?(\s*<\/main>)/,
  `$1\n${contentSections}\n$2`
);

// Update script: use sections/navLinks from DOM, remove lessonOrder and sectionGroups, align with guncel-siber
const newScript = `
    <script>
        const MODULE_NAME = 'Temel Network Eğitimi';
        const STORAGE_KEY = 'module_progress_temel_network';
        window.MODULE_TOTAL_LESSONS = 0;

        const sections = document.querySelectorAll('.content-section');
        const navLinks = document.querySelectorAll('.nav-link-section');
        window.MODULE_TOTAL_LESSONS = sections.length;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        async function loadProgress() {
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (!localStorage.getItem('authToken') || !window.getModuleIdFromName) return local.completedLessons || [];
            try {
                const moduleId = await window.getModuleIdFromName(MODULE_NAME);
                if (!moduleId) return local.completedLessons || [];
                const apiBase = (window.location?.origin || '') + '/api';
                const r = await fetch(apiBase + '/progress/' + moduleId, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
                });
                if (r.ok) {
                    const d = await r.json();
                    const step = typeof d.data?.lastStep === 'string' ? JSON.parse(d.data.lastStep || '{}') : (d.data?.lastStep || {});
                    const lessons = step.completedLessons || [];
                    if (lessons.length) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify({
                            completedLessons: lessons,
                            totalLessons: step.totalLessons || sections.length,
                            lastUpdated: new Date().toISOString()
                        }));
                    }
                    return lessons;
                }
            } catch (e) { console.warn('Load progress from API failed:', e); }
            return local.completedLessons || [];
        }

        function saveProgressLocal(completedLessons) {
            const total = sections.length;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                completedLessons,
                totalLessons: total,
                lastUpdated: new Date().toISOString()
            }));
            updateProgressUI(completedLessons.length);
        }

        function updateProgressUI(completedCount) {
            const total = sections.length;
            const pct = total ? Math.round((completedCount / total) * 100) : 0;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '% Tamamlandı';
        }

        function markCompletedInSidebar(completedLessons) {
            navLinks.forEach(link => {
                const id = link.getAttribute('data-section');
                link.classList.toggle('completed', completedLessons.includes(id));
            });
        }

        function goToSectionByIndex(sectionIndex) {
            if (sectionIndex < 0 || sectionIndex >= sections.length) return;
            const target = sections[sectionIndex];
            const link = Array.from(navLinks).find(l => l.getAttribute('data-section') === target.id);
            if (link) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const pid = link.getAttribute('data-scroll') || (target.id + '-giris');
                showPage(target.id, pid);
            }
            if (window.innerWidth <= 1024) {
                const sidebar = document.querySelector('.module-sidebar');
                if (sidebar) sidebar.classList.remove('open');
            }
        }

        async function completeLesson(sectionId) {
            let completed = await loadProgress();
            const currentIdx = Array.from(sections).findIndex(sec => sec.id === sectionId);
            if (completed.includes(sectionId)) {
                if (currentIdx >= 0 && currentIdx + 1 < sections.length) goToSectionByIndex(currentIdx + 1);
                return;
            }
            completed.push(sectionId);
            saveProgressLocal(completed);
            markCompletedInSidebar(completed);
            if (window.ModuleProgressTracker?.saveLessonProgress && localStorage.getItem('authToken')) {
                try { await window.ModuleProgressTracker.saveLessonProgress(MODULE_NAME, sectionId); }
                catch (e) { console.warn('API save failed:', e); }
            }
            if (currentIdx >= 0 && currentIdx + 1 < sections.length) goToSectionByIndex(currentIdx + 1);
        }

        function showPage(sectionId, pageId) {
            const pageEl = pageId ? document.getElementById(pageId) : null;
            const sectionEl = document.getElementById(sectionId);
            if (!sectionEl) return;
            sections.forEach(sec => sec.classList.toggle('active', sec.id === sectionId));
            sectionEl.querySelectorAll('.lesson-subsection').forEach(sub => {
                sub.classList.toggle('current-page', pageEl && sub.id === pageId);
            });
            if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        document.querySelectorAll('.nav-link-section').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                const scrollToId = this.getAttribute('data-scroll') || (sectionId + '-giris');
                document.querySelectorAll('.nav-link-section').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                showPage(sectionId, scrollToId);
                if (window.innerWidth <= 1024) {
                    const sidebar = document.querySelector('.module-sidebar');
                    if (sidebar) sidebar.classList.remove('open');
                }
            });
        });

        if (sections.length) {
            sections.forEach((s,i) => s.classList.toggle('active', i === 0));
            const firstLink = document.querySelector('.nav-link-section');
            if (firstLink) {
                firstLink.classList.add('active');
                const sid = firstLink.getAttribute('data-section');
                const pid = firstLink.getAttribute('data-scroll') || (sid + '-giris');
                showPage(sid, pid);
            }
        }

        (async function initProgress() {
            const completed = await loadProgress();
            updateProgressUI(completed.length);
            markCompletedInSidebar(completed);
        })();

        if (window.ModuleProgressTracker?.initializeModule && localStorage.getItem('authToken')) {
            window.ModuleProgressTracker.initializeModule(MODULE_NAME, sections.length).catch(() => {});
        }
        if (window.TimeTracker && localStorage.getItem('authToken') && window.getModuleIdFromName) {
            (async () => {
                try {
                    const moduleId = await window.getModuleIdFromName(MODULE_NAME);
                    if (moduleId) window.TimeTracker.start(MODULE_NAME, moduleId);
                } catch (e) { console.warn('TimeTracker başlatılamadı:', e); }
            })();
        }

        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const moduleSidebar = document.querySelector('.module-sidebar');
        if (mobileMenuToggle && moduleSidebar) {
            mobileMenuToggle.addEventListener('click', function() {
                moduleSidebar.classList.toggle('open');
                const icon = mobileMenuToggle.querySelector('i');
                if (moduleSidebar.classList.contains('open')) {
                    icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
                }
            });
        }
    </script>
`;

// Replace the old script block (from const MODULE_NAME to the closing </script> before module-access-check)
html = html.replace(
  /<script>\s*const MODULE_NAME = 'Temel Network Eğitimi';[\s\S]*?<\/script>\s*\n\s*<script src="module-access-check.js">/,
  newScript + '\n    <script src="module-access-check.js">'
);

// Add quiz-exam.js if not present
if (!html.includes('quiz-exam.js')) {
  html = html.replace(
    /<script src="\.\.\/utils\/time-tracker\.js"><\/script>/,
    '<script src="../utils/time-tracker.js"></script>\n    <script src="../utils/quiz-exam.js"></script>'
  );
}

fs.writeFileSync(MODULE_FILE, html, 'utf8');
console.log('Integrated Temel Network content into', MODULE_FILE);
