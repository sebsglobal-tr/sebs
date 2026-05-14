        const MODULE_NAME = 'Temel Kriptografi';
        const STORAGE_KEY = 'module_progress_temel_kriptografi';

        const sections = document.querySelectorAll('.content-section');
        const navModuleLinks = document.querySelectorAll('.nav-link-section');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        function allLessonElements() {
            return Array.from(document.querySelectorAll('.content-section .module-lesson'));
        }

        function totalLessonCount() {
            return allLessonElements().length;
        }

        function lessonIdsForSection(sectionId) {
            const sec = document.getElementById(sectionId);
            if (!sec) return [];
            return Array.from(sec.querySelectorAll('.module-lesson')).map((el) => el.id);
        }

        function buildLessonNav() {
            document.querySelectorAll('.nav-lesson-list').forEach((u) => u.remove());
            navModuleLinks.forEach((moduleLink) => {
                const sid = moduleLink.getAttribute('data-section');
                const sec = document.getElementById(sid);
                if (!sec) return;
                const lessons = sec.querySelectorAll('.module-lessons .module-lesson');
                if (!lessons.length) return;
                const parentLi = moduleLink.closest('li');
                if (!parentLi) return;
                parentLi.classList.add('nav-section-with-lessons');
                const ul = document.createElement('ul');
                ul.className = 'nav-lesson-list';
                lessons.forEach((les) => {
                    const tit = les.getAttribute('data-lesson-title') || les.id;
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#';
                    a.className = 'nav-link-lesson';
                    a.setAttribute('data-lesson-id', les.id);
                    a.setAttribute('data-section', sid);
                    a.textContent = tit;
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                parentLi.appendChild(ul);
            });
        }

        function activateLesson(lessonEl) {
            if (!lessonEl) return;
            const section = lessonEl.closest('.content-section');
            if (!section) return;
            const sid = section.id;
            sections.forEach((s) => s.classList.toggle('active', s.id === sid));
            section.querySelectorAll('.module-lesson').forEach((l) => {
                l.classList.toggle('is-active', l === lessonEl);
            });
            navModuleLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('data-section') === sid));
            document.querySelectorAll('.nav-link-lesson').forEach((a) => {
                a.classList.toggle('active', a.getAttribute('data-lesson-id') === lessonEl.id);
            });
            lessonEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        async function loadProgress() {
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const token =
                (window.getProgressAuthToken && (await window.getProgressAuthToken())) ||
                localStorage.getItem('authToken');
            const total = totalLessonCount() || navModuleLinks.length;
            if (!token || !window.getModuleIdFromName) return local.completedLessons || [];
            try {
                const moduleId = await window.getModuleIdFromName(MODULE_NAME);
                if (!moduleId) return local.completedLessons || [];
                const apiBase =
                    typeof window.getSebsApiBase === 'function'
                        ? window.getSebsApiBase()
                        : (window.location?.origin || '') + '/api';
                const r = await fetch(apiBase + '/progress/module/' + moduleId, {
                    headers: { Authorization: 'Bearer ' + token }
                });
                if (r.ok) {
                    const d = await r.json();
                    const step = typeof d.data?.lastStep === 'string' ? JSON.parse(d.data.lastStep || '{}') : (d.data?.lastStep || {});
                    const lessons = step.completedLessons || [];
                    if (lessons.length) {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({
                                completedLessons: lessons,
                                totalLessons: step.totalLessons || total,
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
            const total = totalLessonCount() || navModuleLinks.length;
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    completedLessons,
                    totalLessons: total,
                    lastUpdated: new Date().toISOString()
                })
            );
            updateProgressUI(completedLessons.length, total);
        }

        function updateProgressUI(completedCount, totalOverride) {
            const total = totalOverride || totalLessonCount() || navModuleLinks.length;
            window.MODULE_TOTAL_LESSONS = total;
            const pct = total ? Math.round((completedCount / total) * 100) : 0;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '% Tamamlandı';
        }

        function markSidebarProgress(completedLessons) {
            document.querySelectorAll('.nav-link-lesson').forEach((a) => {
                const lid = a.getAttribute('data-lesson-id');
                a.classList.toggle('completed', completedLessons.includes(lid));
            });
            navModuleLinks.forEach((link) => {
                const sid = link.getAttribute('data-section');
                const ids = lessonIdsForSection(sid);
                const done = ids.length > 0 && ids.every((id) => completedLessons.includes(id));
                link.classList.toggle('completed', done);
            });
        }

        async function completeCurrentLesson(lessonEl) {
            const lessonId = lessonEl.id;
            let completed = await loadProgress();
            if (!completed.includes(lessonId)) {
                completed.push(lessonId);
                saveProgressLocal(completed);
                markSidebarProgress(completed);
                if (window.ModuleProgressTracker?.saveLessonProgress) {
                    try {
                        await window.ModuleProgressTracker.saveLessonProgress(MODULE_NAME, lessonId);
                    } catch (e) {
                        console.warn('API save failed:', e);
                    }
                }
            } else {
                markSidebarProgress(completed);
            }

            const all = allLessonElements();
            const ix = all.indexOf(lessonEl);
            const next = all[ix + 1] || null;
            if (next) {
                activateLesson(next);
                const nsid = next.closest('.content-section').id;
                navModuleLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('data-section') === nsid));
            }
        }

        document.querySelector('.nav-list.nav-section-list')?.addEventListener('click', function (e) {
            const sub = e.target.closest('.nav-link-lesson');
            if (!sub) return;
            e.preventDefault();
            const lid = sub.getAttribute('data-lesson-id');
            const el = document.getElementById(lid);
            if (el) activateLesson(el);
            if (window.innerWidth <= 1024) {
                document.querySelector('.module-sidebar')?.classList.remove('open');
            }
        });

        navModuleLinks.forEach((link) => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const sid = this.getAttribute('data-section');
                const sec = document.getElementById(sid);
                const first = sec?.querySelector('.module-lessons .module-lesson');
                navModuleLinks.forEach((l) => l.classList.remove('active'));
                this.classList.add('active');
                if (first) activateLesson(first);
                else if (sec) {
                    sections.forEach((s) => s.classList.toggle('active', s.id === sid));
                }
                if (window.innerWidth <= 1024) {
                    document.querySelector('.module-sidebar')?.classList.remove('open');
                }
            });
        });

        document.querySelector('.module-layout')?.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-lesson-complete');
            if (!btn) return;
            const lid = btn.getAttribute('data-lesson-id');
            const le = document.getElementById(lid);
            if (le) completeCurrentLesson(le);
        });

        buildLessonNav();
        window.MODULE_TOTAL_LESSONS = totalLessonCount() || navModuleLinks.length;

        const firstLesson = document.querySelector('.content-section .module-lesson');
        if (firstLesson) {
            sections.forEach((s, i) => s.classList.toggle('active', s === firstLesson.closest('.content-section')));
            activateLesson(firstLesson);
        } else if (sections.length) {
            sections.forEach((s, i) => s.classList.toggle('active', i === 0));
        }

        (async function initProgress() {
            const completed = await loadProgress();
            const total = totalLessonCount() || navModuleLinks.length;
            updateProgressUI(completed.length, total);
            markSidebarProgress(completed);
        })();

        (async function initTrackerIfLoggedIn() {
            const t =
                (window.getProgressAuthToken && (await window.getProgressAuthToken())) ||
                localStorage.getItem('authToken');
            if (!t) return;
            const nLessons = totalLessonCount() || navModuleLinks.length;
            if (window.ModuleProgressTracker?.initializeModule) {
                window.ModuleProgressTracker.initializeModule(MODULE_NAME, nLessons).catch(() => {});
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
