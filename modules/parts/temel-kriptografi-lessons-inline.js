        const MODULE_NAME = 'Temel Kriptografi';
        const STORAGE_KEY = 'module_progress_temel_kriptografi';
        window.MODULE_TOTAL_LESSONS = 0;

        const sections = document.querySelectorAll('.content-section');
        const navLinks = document.querySelectorAll('.nav-link-section');
        window.MODULE_TOTAL_LESSONS = sections.length;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        async function loadProgress() {
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const token =
                (window.getProgressAuthToken && (await window.getProgressAuthToken())) ||
                localStorage.getItem('authToken');
            if (!token || !window.getModuleIdFromName) {
                return Array.isArray(local.completedLessons) ? local.completedLessons : [];
            }
            try {
                const moduleId = await window.getModuleIdFromName(MODULE_NAME);
                if (!moduleId) return Array.isArray(local.completedLessons) ? local.completedLessons : [];
                const apiBase =
                    typeof window.getSebsApiBase === 'function'
                        ? window.getSebsApiBase()
                        : (window.location?.origin || '') + '/api';
                const r = await fetch(apiBase + '/progress/module/' + moduleId, {
                    headers: { Authorization: 'Bearer ' + token }
                });
                if (r.ok) {
                    const d = await r.json();
                    const step =
                        typeof d.data?.lastStep === 'string'
                            ? JSON.parse(d.data.lastStep || '{}')
                            : d.data?.lastStep || {};
                    const lessons = step.completedLessons || [];
                    if (lessons.length) {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({
                                completedLessons: lessons,
                                totalLessons: step.totalLessons || sections.length,
                                lastUpdated: new Date().toISOString()
                            })
                        );
                    }
                    return lessons;
                }
            } catch (e) {
                console.warn('Load progress from API failed:', e);
            }
            return Array.isArray(local.completedLessons) ? local.completedLessons : [];
        }

        function saveProgressLocal(completedLessons) {
            const total = sections.length;
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    completedLessons,
                    totalLessons: total,
                    lastUpdated: new Date().toISOString()
                })
            );
            updateProgressUI(completedLessons.length);
        }

        function updateProgressUI(completedCount) {
            const total = sections.length;
            const pct = total ? Math.round((completedCount / total) * 100) : 0;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '% Tamamlandı';
        }

        function markCompletedInSidebar(completedLessons) {
            navLinks.forEach((link) => {
                const id = link.getAttribute('data-section');
                link.classList.toggle('completed', completedLessons.includes(id));
            });
        }

        function goToSectionByIndex(sectionIndex) {
            if (sectionIndex < 0 || sectionIndex >= sections.length) return;
            const target = sections[sectionIndex];
            const link = Array.from(navLinks).find((l) => l.getAttribute('data-section') === target.id);
            if (link) {
                navLinks.forEach((l) => l.classList.remove('active'));
                link.classList.add('active');
            }
            sections.forEach((sec) => sec.classList.toggle('active', sec === target));
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (window.innerWidth <= 1024) {
                document.querySelector('.module-sidebar')?.classList.remove('open');
            }
        }

        async function completeLesson(sectionId) {
            let completed = await loadProgress();
            if (!Array.isArray(completed)) completed = [];
            const currentIdx = Array.from(sections).findIndex((sec) => sec.id === sectionId);
            if (completed.includes(sectionId)) {
                if (currentIdx >= 0 && currentIdx + 1 < sections.length) goToSectionByIndex(currentIdx + 1);
                return;
            }
            completed.push(sectionId);
            saveProgressLocal(completed);
            markCompletedInSidebar(completed);
            if (window.ModuleProgressTracker?.saveLessonProgress) {
                try {
                    await window.ModuleProgressTracker.saveLessonProgress(MODULE_NAME, sectionId);
                } catch (e) {
                    console.warn('API save failed:', e);
                }
            }
            if (currentIdx >= 0 && currentIdx + 1 < sections.length) goToSectionByIndex(currentIdx + 1);
        }

        document.querySelectorAll('.nav-link-section').forEach((link) => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                const idx = Array.from(sections).findIndex((sec) => sec.id === sectionId);
                if (idx >= 0) goToSectionByIndex(idx);
                if (window.innerWidth <= 1024) {
                    document.querySelector('.module-sidebar')?.classList.remove('open');
                }
            });
        });

        document.querySelectorAll('.btn-complete-lesson').forEach((btn) => {
            btn.addEventListener('click', function () {
                const sectionId = this.getAttribute('data-section');
                if (sectionId) completeLesson(sectionId);
            });
        });

        if (sections.length) {
            goToSectionByIndex(0);
        }

        (async function initProgress() {
            const completed = await loadProgress();
            updateProgressUI(completed.length);
            markCompletedInSidebar(completed);
        })();

        (async function initTrackerIfLoggedIn() {
            const t =
                (window.getProgressAuthToken && (await window.getProgressAuthToken())) ||
                localStorage.getItem('authToken');
            if (!t) return;
            if (window.ModuleProgressTracker?.initializeModule) {
                window.ModuleProgressTracker.initializeModule(MODULE_NAME, sections.length).catch(() => {});
            }
            if (window.TimeTracker && window.getModuleIdFromName) {
                try {
                    const moduleId = await window.getModuleIdFromName(MODULE_NAME);
                    if (moduleId) window.TimeTracker.start(MODULE_NAME, moduleId);
                } catch (e) {
                    console.warn('TimeTracker başlatılamadı:', e);
                }
            }
        })();

        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const moduleSidebar = document.querySelector('.module-sidebar');
        if (mobileMenuToggle && moduleSidebar) {
            mobileMenuToggle.addEventListener('click', function () {
                moduleSidebar.classList.toggle('open');
                const icon = mobileMenuToggle.querySelector('i');
                if (moduleSidebar.classList.contains('open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }
