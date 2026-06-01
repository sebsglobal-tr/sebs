
(function ensureSignupNavCta() {
    if (typeof window === 'undefined' || window.sebsApplySignupNavCta) return;
    window.sebsApplySignupNavCta = function (loggedIn, user) {
        var md = user && user.user_metadata ? user.user_metadata : {};
        var isAdmin =
            md.role === 'admin' || localStorage.getItem('userRole') === 'admin';
        var panelHref = isAdmin ? '/admin.html' : '/dashboard.html';

        var signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            if (loggedIn) {
                signupBtn.style.display = 'none';
                signupBtn.classList.add('hidden');
            } else {
                signupBtn.setAttribute('href', '/signup.html');
                signupBtn.textContent = 'Ücretsiz Başla';
                signupBtn.removeAttribute('aria-label');
                signupBtn.classList.remove('hidden');
                signupBtn.style.removeProperty('display');
            }
        }

        var loginBtnNav = document.getElementById('loginBtn');
        if (loginBtnNav) {
            if (loggedIn) {
                loginBtnNav.style.display = 'none';
                loginBtnNav.classList.add('hidden');
            } else {
                loginBtnNav.classList.remove('hidden');
                loginBtnNav.style.removeProperty('display');
            }
        }

        document.querySelectorAll('[data-sebs-primary-cta]').forEach(function (el) {
            if (loggedIn) {
                el.style.display = 'none';
                el.setAttribute('hidden', '');
                el.setAttribute('aria-hidden', 'true');
            } else {
                el.style.removeProperty('display');
                el.removeAttribute('hidden');
                el.removeAttribute('aria-hidden');
                el.setAttribute('href', '/signup.html');
            }
        });
    };
})();

(function() {
    'use strict';

    function ensureStripeThemeAssets() {
        if (document.querySelector('link[data-sebs-stripe="design"]')) return;
        var files = [
            { href: '/css/sebs-stripe-tokens.css?v=1', mark: 'tokens' },
            { href: '/css/sebs-stripe-design.css?v=1', mark: 'design' },
            { href: '/css/sebs-stripe-lesson.css?v=1', mark: 'lesson' },
        ];
        files.forEach(function (file) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = file.href;
            link.setAttribute('data-sebs-stripe', file.mark);
            document.head.appendChild(link);
        });
    }

    function ensureStripeSiteClass() {
        var body = document.body;
        if (!body) return;
        var path = (window.location.pathname || '').toLowerCase();
        var skip =
            /\/(dashboard|admin|report-output|degerlendirme-raporu)(\.html)?$/i.test(path) ||
            body.classList.contains('dashboard-page') ||
            body.id === 'admin-app';
        if (skip) return;
        var eligible =
            body.classList.contains('landing-site-body') ||
            body.classList.contains('modules-page') ||
            body.classList.contains('legal-page') ||
            body.classList.contains('sebs-premium-site') ||
            document.querySelector('link[href*="sebs-stripe-design"]');
        if (!eligible) return;
        if (!body.classList.contains('sebs-stripe-site')) {
            body.classList.add('sebs-stripe-site');
        }
        if (!document.querySelector('link[data-sebs-stripe="design"]')) {
            ensureStripeThemeAssets();
        }
    }

    if (document.body) {
        ensureStripeSiteClass();
    } else {
        document.addEventListener('DOMContentLoaded', ensureStripeSiteClass, { once: true });
    }

    function ensurePremiumExperienceAssets() {
        try {
            if (!document.querySelector('link[data-sebs-premium="css"]')) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/css/sebs-yolu-premium.css';
                link.setAttribute('data-sebs-premium', 'css');
                document.head.appendChild(link);
            }
            if (!document.querySelector('script[data-sebs-premium="js"]')) {
                var script = document.createElement('script');
                script.src = '/js/sebs-yolu-experience.js';
                script.defer = true;
                script.setAttribute('data-sebs-premium', 'js');
                document.head.appendChild(script);
            }
        } catch (e) {
            console.warn('Premium assets load skipped:', e);
        }
    }

    
    function getCurrentPage() {
        const path = window.location.pathname;
        let page = path.split('/').pop().replace('.html', '') || 'index'; // URL'den sayfa adını çıkar
        
        if (path.includes('/modules/')) {
            const isModuleContentPage = path.includes('/modules/') && 
                                       !path.endsWith('modules.html') &&
                                       !path.endsWith('modules/');
            if (isModuleContentPage) {
                return 'modules';
            }
        }

        if (path.includes('/simulation/')) {
            return 'simulations';
        }
        if (path === '/blog' || path.startsWith('/blog/')) {
            return 'blog';
        }
        if (path === '/hakkimizda' || path === '/about.html' || page === 'about') {
            return 'about';
        }

        return page;
    }

    async function isLoggedIn() {
        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                const { data: { session } } = await window.supabaseAuthSystem.supabase.auth.getSession();
                if (session && session.user && session.access_token) {
                    return true;
                }
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userData');
                return false;
            }
            return false;
        } catch (error) {
            console.warn('isLoggedIn check error:', error);
            return false;
        }
    }

    function setGuestNavChrome() {
        var loginBtn = document.getElementById('loginBtn');
        var userProfile = document.getElementById('userProfile');
        var logoutBtn = document.getElementById('logoutBtn');
        if (loginBtn) {
            loginBtn.classList.remove('hidden');
            loginBtn.style.removeProperty('display');
        }
        if (userProfile) {
            userProfile.style.display = 'none';
            userProfile.classList.add('hidden');
            userProfile.setAttribute('hidden', '');
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
            logoutBtn.classList.add('hidden');
        }
        var mobileGuest = document.getElementById('mobileGuestLinks');
        var mobileUser = document.getElementById('mobileUserLinks');
        if (mobileGuest) mobileGuest.style.display = 'block';
        if (mobileUser) mobileUser.style.display = 'none';
    }

    async function getUserData() {
        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                const { data: { session } } = await window.supabaseAuthSystem.supabase.auth.getSession();
                
                if (session && session.user) {
                    const md = session.user.user_metadata || {};
                    const fullName =
                        md.full_name ||
                        md.name ||
                        [md.first_name, md.last_name].filter(Boolean).join(' ') ||
                        null;
                    return {
                        email: session.user.email,
                        firstName: fullName ? fullName.split(' ')[0] : null,
                        lastName: fullName ? fullName.split(' ').slice(1).join(' ') : '',
                        fullName: fullName,
                        role: 'user',
                        accessLevel: 'beginner',
                        isVerified: !!session.user.email_confirmed_at
                    };
                }
            }
            
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.warn('getUserData error:', error);
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        }
    }

    /** Eski DOM (details/div + şerit çıkış) → düğme + panel: Profilim, Gece modu, Çıkış yap */
    function upgradeUserAccountMenu() {
        if (!document.body || !document.body.classList.contains('landing-site-body')) return;
        if (document.getElementById('userProfileTrigger') && document.getElementById('userAccountPanel')) {
            return;
        }

        var profile = document.getElementById('userProfile');
        if (!profile) return;

        var existingLogout = document.getElementById('logoutBtn');
        var parent = profile.parentNode;
        var avatar = document.getElementById('userAvatar');
        var nameEl = document.getElementById('userName');

        var wrap = document.createElement('div');
        wrap.id = 'userProfile';
        wrap.className = 'relative hidden max-w-[10rem] sm:max-w-[12rem]';
        wrap.style.cssText = profile.style.cssText;

        var trig = document.createElement('button');
        trig.type = 'button';
        trig.id = 'userProfileTrigger';
        trig.className =
            'flex w-full max-w-full cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2.5 text-left transition hover:border-slate-300 hover:bg-slate-100 focus-ring outline-none sm:max-w-[12rem]';
        trig.setAttribute('aria-expanded', 'false');
        trig.setAttribute('aria-haspopup', 'menu');
        trig.setAttribute('aria-controls', 'userAccountPanel');
        trig.setAttribute('aria-label', 'Hesap menüsü');

        if (avatar) {
            trig.appendChild(avatar);
        }
        if (nameEl) {
            trig.appendChild(nameEl);
        }

        var panel = document.createElement('div');
        panel.id = 'userAccountPanel';
        panel.className =
            'user-account-dropdown absolute right-0 top-full z-[60] mt-2 hidden w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg';
        panel.setAttribute('role', 'menu');
        panel.hidden = true;

        var dash = document.createElement('a');
        dash.href = '/dashboard.html';
        dash.className =
            'user-dashboard-link block px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-ring';
        dash.setAttribute('role', 'menuitem');
        dash.textContent = 'Dashboard';

        function makeMenuLink(href, label) {
            var a = document.createElement('a');
            a.href = href;
            a.className =
                'block px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-ring';
            a.setAttribute('role', 'menuitem');
            a.textContent = label;
            return a;
        }

        var themeRow = document.createElement('div');
        themeRow.className =
            'flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5';
        themeRow.setAttribute('role', 'none');
        var themeLab = document.createElement('span');
        themeLab.className = 'text-sm text-slate-600';
        themeLab.textContent = 'Gece modu';
        var themeMount = document.createElement('div');
        themeMount.id = 'userMenuThemeMount';
        themeMount.className = 'flex shrink-0 items-center justify-end';
        themeRow.appendChild(themeLab);
        themeRow.appendChild(themeMount);

        var lb = existingLogout || document.createElement('button');
        lb.type = 'button';
        lb.id = 'logoutBtn';
        lb.textContent = 'Çıkış yap';
        lb.className =
            'hidden w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-ring';
        lb.setAttribute('role', 'menuitem');
        lb.style.display = 'none';

        panel.appendChild(dash);
        panel.appendChild(makeMenuLink('/modules.html', 'Eğitimlerim'));
        panel.appendChild(makeMenuLink('/simulations.html', 'Simülasyonlarım'));
        panel.appendChild(makeMenuLink('/dashboard.html', 'Profilim'));
        panel.appendChild(themeRow);
        panel.appendChild(lb);

        wrap.appendChild(trig);
        wrap.appendChild(panel);

        parent.replaceChild(wrap, profile);
    }

    function wireUserAccountDropdown() {
        var root = document.getElementById('userProfile');
        var trig = document.getElementById('userProfileTrigger');
        var panel = document.getElementById('userAccountPanel');
        if (!root || !trig || !panel || root.hasAttribute('data-dropdown-wired')) return;
        root.setAttribute('data-dropdown-wired', 'true');

        function setOpen(open) {
            panel.classList.toggle('hidden', !open);
            panel.hidden = !open;
            trig.setAttribute('aria-expanded', open ? 'true' : 'false');
            /* Başka kurallardaki display:flex !important ile çakışmayı kır */
            if (open) {
                panel.style.removeProperty('display');
            } else {
                panel.style.setProperty('display', 'none', 'important');
            }
        }

        function isOpen() {
            return trig.getAttribute('aria-expanded') === 'true';
        }

        /* Yalnızca hap düğmesi — panel bazen tetikleyicinin üstüne taşınca hedef yanlış olmasın diye */
        trig.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var next = !isOpen();
            if (next) {
                closePlatformNavDropdownIfOpen();
            }
            setOpen(next);
        });

        document.addEventListener('click', function (e) {
            if (!isOpen()) return;
            var t = e.target;
            if (root.contains(t)) return;
            setOpen(false);
        });

        if (!document.documentElement.hasAttribute('data-sebs-account-esc')) {
            document.documentElement.setAttribute('data-sebs-account-esc', 'true');
            document.addEventListener('keydown', function (e) {
                if (e.key !== 'Escape') return;
                var tr = document.getElementById('userProfileTrigger');
                if (!tr || tr.getAttribute('aria-expanded') !== 'true') return;
                setOpen(false);
            });
        }
    }

    function closeUserAccountPanelIfOpen() {
        var trig = document.getElementById('userProfileTrigger');
        var panel = document.getElementById('userAccountPanel');
        if (!trig || !panel || trig.getAttribute('aria-expanded') !== 'true') return;
        panel.classList.add('hidden');
        panel.hidden = true;
        trig.setAttribute('aria-expanded', 'false');
        panel.style.setProperty('display', 'none', 'important');
    }

    function closePlatformNavDropdownIfOpen() {
        var trig = document.getElementById('navPlatformTrigger');
        var panel = document.getElementById('navPlatformPanel');
        if (!trig || !panel || trig.getAttribute('aria-expanded') !== 'true') return;
        panel.classList.add('hidden');
        panel.hidden = true;
        trig.setAttribute('aria-expanded', 'false');
        panel.style.setProperty('display', 'none', 'important');
    }

    function wirePlatformNavDropdown() {
        var wrap = document.getElementById('navPlatformWrap');
        var trig = document.getElementById('navPlatformTrigger');
        var panel = document.getElementById('navPlatformPanel');
        if (!wrap || !trig || !panel || wrap.hasAttribute('data-platform-nav-wired')) return;
        wrap.setAttribute('data-platform-nav-wired', 'true');

        function setOpen(open) {
            panel.classList.toggle('hidden', !open);
            panel.hidden = !open;
            trig.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                panel.style.removeProperty('display');
            } else {
                panel.style.setProperty('display', 'none', 'important');
            }
        }

        function isOpen() {
            return trig.getAttribute('aria-expanded') === 'true';
        }

        trig.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var willOpen = !isOpen();
            if (willOpen) {
                closeUserAccountPanelIfOpen();
            }
            setOpen(willOpen);
        });

        panel.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('a[href]')) {
                setOpen(false);
            }
        });

        document.addEventListener('click', function (e) {
            if (!isOpen()) return;
            if (wrap.contains(e.target)) return;
            setOpen(false);
        });

        if (!document.documentElement.hasAttribute('data-sebs-platform-esc')) {
            document.documentElement.setAttribute('data-sebs-platform-esc', 'true');
            document.addEventListener('keydown', function (e) {
                if (e.key !== 'Escape') return;
                var tr = document.getElementById('navPlatformTrigger');
                if (!tr || tr.getAttribute('aria-expanded') !== 'true') return;
                closePlatformNavDropdownIfOpen();
            });
        }
    }

    function relocateThemeToggleToUserMenu() {
        var mount = document.getElementById('userMenuThemeMount');
        var btn = document.getElementById('themeToggleBtn');
        if (mount && btn && btn.parentNode !== mount) {
            mount.appendChild(btn);
        }
    }

    async function updateNavigation() {
        const currentPage = getCurrentPage();
        const currentPath = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
        const loggedIn = await isLoggedIn();
        const userData = await getUserData();
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            const linkPage = link.getAttribute('data-page') || 
                           href.replace(/\.html$/, '').replace(/^\.\.\//, '').replace(/^\//, '') || '';
            if (linkPage === currentPage || 
                (currentPage === 'index' && linkPage === '') ||
                (currentPage === 'index' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Landing chrome header (index/modules/simulations vb.) aktif menü vurgusu
        function landingNavHrefIsActive(rawHref) {
            try {
                const href = (rawHref || '').trim();
                const url = new URL(href, window.location.origin);
                const linkPath = (url.pathname || '/').replace(/\/+$/, '') || '/';
                const linkHash = url.hash || '';
                if (linkHash) {
                    var cp = currentPath === '/index.html' ? '/' : currentPath;
                    var lp = linkPath === '/index.html' ? '/' : linkPath;
                    return lp === cp && (window.location.hash || '') === linkHash;
                }
                if (linkPath === '/blog') {
                    return currentPath === '/blog' || currentPath.indexOf('/blog/') === 0;
                }
                if (linkPath === '/modules.html') {
                    return (
                        currentPath === '/modules.html' ||
                        currentPath === '/egitimler' ||
                        currentPath.indexOf('/modules/') === 0
                    );
                }
                if (linkPath === '/simulations.html') {
                    return (
                        currentPath === '/simulations.html' ||
                        currentPath === '/simulasyonlar' ||
                        currentPath.indexOf('/simulation/') === 0 ||
                        currentPath.indexOf('/simulasyonlar/') === 0
                    );
                }
                if (linkPath === '/pricing.html') {
                    return currentPath === '/pricing.html';
                }
                if (linkPath === '/contact.html') {
                    return currentPath === '/contact.html' || currentPath === '/iletisim';
                }
                if (linkPath === '/hakkimizda' || linkPath === '/about.html') {
                    return (
                        currentPath === '/hakkimizda' ||
                        currentPath === '/about.html'
                    );
                }
                if (linkPath === '/') {
                    return currentPath === '/' || currentPath === '/index.html';
                }
                return currentPath === linkPath;
            } catch (e) {
                return false;
            }
        }

        const landingNavLinks = document.querySelectorAll(
            'header.sebs-ertay-header nav[aria-label="Ana menü"] a[href], header.fixed nav[aria-label="Ana menü"] a[href]'
        );
        landingNavLinks.forEach(link => {
            const isActive = landingNavHrefIsActive(link.getAttribute('href'));
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        var navPlatformTrigger = document.getElementById('navPlatformTrigger');
        if (navPlatformTrigger) {
            var platformSectionActive =
                landingNavHrefIsActive('/modules.html') ||
                landingNavHrefIsActive('/simulations.html');
            navPlatformTrigger.classList.toggle('is-active', platformSectionActive);
        }

        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        const mobileGuestLinks = document.getElementById('mobileGuestLinks');
        const mobileUserLinks = document.getElementById('mobileUserLinks');

        let navCtaUser = null;
        if (loggedIn && window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
            try {
                const { data: { session } } = await window.supabaseAuthSystem.supabase.auth.getSession();
                navCtaUser = session && session.user ? session.user : null;
            } catch (e) { /* ignore */ }
        }

        if (loggedIn) {
            const userRole = (userData && userData.role) || localStorage.getItem('userRole') || 'user';
            const isAdmin = userRole === 'admin';

            let displayName = 'Kullanıcı';
            if (userData) {
                displayName =
                    userData.fullName ||
                    userData.firstName ||
                    (userData.email ? userData.email.split('@')[0] : '') ||
                    'Kullanıcı';
            } else if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                try {
                    const { data: { session } } = await window.supabaseAuthSystem.supabase.auth.getSession();
                    const u = session && session.user;
                    if (u) {
                        const md = u.user_metadata || {};
                        const fn =
                            (md.full_name || md.name || [md.first_name, md.last_name].filter(Boolean).join(' ') || '').trim();
                        displayName = fn || (u.email ? u.email.split('@')[0] : '') || 'Kullanıcı';
                    }
                } catch (e) { /* yoksay */ }
            }

            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.classList.remove('hidden');
            }
            if (dashboardBtn) dashboardBtn.style.display = 'none';

            if (userProfile) {
                userProfile.removeAttribute('hidden');
                userProfile.classList.remove('hidden');
                userProfile.style.display = 'block';
                var dashLink = userProfile.querySelector('.user-dashboard-link');
                if (dashLink) {
                    dashLink.setAttribute('href', isAdmin ? '/admin.html' : '/dashboard.html');
                }
            }

            if (userName) userName.textContent = displayName;
            if (userAvatar) userAvatar.textContent = (String(displayName).trim() || 'U')[0].toUpperCase();

            if (mobileGuestLinks) mobileGuestLinks.style.display = 'none';
            if (mobileUserLinks) mobileUserLinks.style.display = 'block';
        } else {
            if (loginBtn) {
                loginBtn.classList.remove('hidden');
                loginBtn.style.removeProperty('display');
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
                logoutBtn.classList.add('hidden');
            }
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'none';
                userProfile.classList.add('hidden');
                userProfile.setAttribute('hidden', '');
            }

            if (mobileGuestLinks) mobileGuestLinks.style.display = 'block';
            if (mobileUserLinks) mobileUserLinks.style.display = 'none';
        }

        if (typeof window.sebsApplySignupNavCta === 'function') {
            window.sebsApplySignupNavCta(loggedIn, navCtaUser);
        }

        document.querySelectorAll('.js-auth-only').forEach(function(el) {
            el.style.display = loggedIn ? '' : 'none';
        });

        document.body.classList.toggle('sebs-user-logged-in', !!loggedIn);
    }

    /** Landing üst menü: Ana sayfa | Platform | Paketler | İşverenler | Blog | Hakkımızda | İletişim (landing-chrome.css). */
    function normalizeLandingNavOrder() {
        if (!document.body || !document.body.classList.contains('landing-site-body')) {
            return;
        }
        if (document.querySelector('[data-sebs-nav="standard"]')) {
            return;
        }

        var NAV_ACCENT = 'landing-nav-pill-link landing-nav-pill-link--accent focus-ring';
        var NAV_MUTED = 'landing-nav-pill-link landing-nav-pill-link--muted focus-ring';
        var NAV_PLATFORM_TRIG =
            'landing-nav-pill-link landing-nav-pill-link--platform nav-platform-trigger inline-flex items-center gap-0.5 border-0 bg-transparent focus-ring';

        function makeBlogLink() {
            var a = document.createElement('a');
            a.href = '/blog';
            a.textContent = 'Blog';
            a.className = NAV_ACCENT;
            return a;
        }

        function makeHomeLink() {
            var a = document.createElement('a');
            a.href = '/';
            a.textContent = 'Ana sayfa';
            a.className = NAV_ACCENT;
            return a;
        }

        function makeDesktopPlatformBlock() {
            var wrap = document.createElement('div');
            wrap.className = 'relative z-[55]';
            wrap.id = 'navPlatformWrap';

            var trig = document.createElement('button');
            trig.type = 'button';
            trig.id = 'navPlatformTrigger';
            trig.className = NAV_PLATFORM_TRIG;
            trig.setAttribute('aria-expanded', 'false');
            trig.setAttribute('aria-haspopup', 'menu');
            trig.setAttribute('aria-controls', 'navPlatformPanel');
            trig.setAttribute('aria-label', 'Platform menüsü');
            var chev = document.createElement('span');
            chev.className = 'nav-platform-chevron text-[0.7rem] leading-none opacity-75';
            chev.setAttribute('aria-hidden', 'true');
            chev.textContent = '▾';
            trig.appendChild(document.createTextNode('Platform'));
            trig.appendChild(chev);

            var panel = document.createElement('div');
            panel.id = 'navPlatformPanel';
            panel.className =
                'nav-platform-dropdown absolute left-1/2 top-full z-[60] mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white py-1 shadow-lg';
            panel.setAttribute('role', 'menu');
            panel.hidden = true;

            var aMod = document.createElement('a');
            aMod.href = '/modules.html';
            aMod.textContent = 'Eğitim modülleri';
            aMod.className =
                'block px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-ring';
            aMod.setAttribute('role', 'menuitem');

            var aSim = document.createElement('a');
            aSim.href = '/simulations.html';
            aSim.textContent = 'Simülasyonlar';
            aSim.className =
                'block px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-ring';
            aSim.setAttribute('role', 'menuitem');

            panel.appendChild(aMod);
            panel.appendChild(aSim);
            wrap.appendChild(trig);
            wrap.appendChild(panel);
            return wrap;
        }

        function makeCareerPathsLink() {
            var a = document.createElement('a');
            a.href = '/pricing.html';
            a.textContent = 'Paketler';
            a.className = NAV_ACCENT;
            return a;
        }

        function makeEmployersLink() {
            var a = document.createElement('a');
            a.href = '/isverenler.html';
            a.textContent = 'İşverenler İçin';
            a.className = NAV_MUTED;
            return a;
        }

        function makeAboutLink() {
            var a = document.createElement('a');
            a.href = '/hakkimizda';
            a.textContent = 'Hakkımızda';
            a.className = NAV_MUTED;
            return a;
        }

        function makeContactNavLink() {
            var a = document.createElement('a');
            a.href = '/contact.html';
            a.textContent = 'İletişim';
            a.className = NAV_MUTED;
            return a;
        }

        var desktopNav = document.querySelector('header.fixed nav[aria-label="Ana menü"]');
        if (desktopNav) {
            desktopNav.className =
                'hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex';
            desktopNav.setAttribute('aria-label', 'Ana menü');
            desktopNav.innerHTML = '';
            desktopNav.appendChild(makeHomeLink());
            desktopNav.appendChild(makeDesktopPlatformBlock());
            desktopNav.appendChild(makeCareerPathsLink());
            desktopNav.appendChild(makeEmployersLink());
            desktopNav.appendChild(makeBlogLink());
            desktopNav.appendChild(makeAboutLink());
            desktopNav.appendChild(makeContactNavLink());
        }

        document.querySelectorAll('header.fixed a.landing-nav-contact').forEach(function (el) {
            el.style.display = 'none';
            el.setAttribute('aria-hidden', 'true');
        });

        var headerRow = document.querySelector('header.fixed .mx-auto.flex.h-16');
        if (headerRow) {
            var first = headerRow.firstElementChild;
            if (first && first.tagName === 'A' && !first.classList.contains('shrink-0')) {
                first.classList.add('shrink-0');
            }
            var right = headerRow.querySelector(':scope > div.flex.items-center');
            if (right && !right.classList.contains('shrink-0')) {
                right.classList.add('shrink-0');
            }
        }

        var mobilePanel = document.querySelector('header.fixed details > div');
        var guest = document.getElementById('mobileGuestLinks');
        if (mobilePanel && guest) {
            while (mobilePanel.firstChild && mobilePanel.firstChild !== guest) {
                mobilePanel.removeChild(mobilePanel.firstChild);
            }
            var frag = document.createDocumentFragment();

            var drawerAccent = 'landing-nav-drawer-link block px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-slate-50';
            var drawerMuted =
                'landing-nav-drawer-link block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50';

            var homeA = document.createElement('a');
            homeA.href = '/';
            homeA.textContent = 'Ana sayfa';
            homeA.className = drawerAccent;

            var platHead = document.createElement('div');
            platHead.className =
                'landing-nav-drawer-heading px-4 pb-1 pt-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500';
            platHead.textContent = 'Platform';

            var modA = document.createElement('a');
            modA.href = '/modules.html';
            modA.textContent = 'Eğitim modülleri';
            modA.className = drawerAccent;

            var simA = document.createElement('a');
            simA.href = '/simulations.html';
            simA.textContent = 'Simülasyonlar';
            simA.className = drawerAccent;

            var hrMid = document.createElement('hr');
            hrMid.className = 'my-1 border-slate-100';

            var careerA = document.createElement('a');
            careerA.href = '/pricing.html';
            careerA.textContent = 'Paketler';
            careerA.className = drawerAccent;

            var empA = document.createElement('a');
            empA.href = '/isverenler.html';
            empA.textContent = 'İşverenler İçin';
            empA.className = drawerMuted;

            var blogA = document.createElement('a');
            blogA.href = '/blog';
            blogA.textContent = 'Blog';
            blogA.className = drawerAccent;

            var aboutA = document.createElement('a');
            aboutA.href = '/hakkimizda';
            aboutA.textContent = 'Hakkımızda';
            aboutA.className = drawerMuted;

            var contactA = document.createElement('a');
            contactA.href = '/contact.html';
            contactA.textContent = 'İletişim';
            contactA.className = drawerMuted;

            var hrBeforeAuth = document.createElement('hr');
            hrBeforeAuth.className = 'my-1 border-slate-100';

            frag.appendChild(homeA);
            frag.appendChild(platHead);
            frag.appendChild(modA);
            frag.appendChild(simA);
            frag.appendChild(hrMid);
            frag.appendChild(careerA);
            frag.appendChild(empA);
            frag.appendChild(blogA);
            frag.appendChild(aboutA);
            frag.appendChild(contactA);
            frag.appendChild(hrBeforeAuth);
            mobilePanel.insertBefore(frag, guest);

            var mu = document.getElementById('mobileUserLinks');
            if (mu && mu.nextElementSibling && mu.nextElementSibling.tagName === 'A' &&
                mu.nextElementSibling.getAttribute('href') === '/contact.html') {
                mu.nextElementSibling.remove();
            }
        }
    }

    function initHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navPanel = document.querySelector('#navPanel') || document.querySelector('.nav-panel');
        const navMenu = document.querySelector('.nav-menu');

        function closeMobileNav() {
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            if (navPanel) {
                navPanel.classList.remove('active');
            } else if (navMenu) {
                navMenu.classList.remove('active');
            }
            document.body.classList.remove('nav-menu-open');
            document.documentElement.classList.remove('nav-menu-open');
        }

        function openState(isOpen) {
            document.body.classList.toggle('nav-menu-open', isOpen);
            document.documentElement.classList.toggle('nav-menu-open', isOpen);
        }

        if (hamburger && navPanel) {
            if (!navPanel.querySelector('.nav-drawer-header')) {
                var drawerHeader = document.createElement('div');
                drawerHeader.className = 'nav-drawer-header';
                drawerHeader.setAttribute('role', 'presentation');
                drawerHeader.innerHTML =
                    '<div class="nav-drawer-brand">' +
                    '<span class="nav-drawer-title">SEBS Global</span>' +
                    '<span class="nav-drawer-sub">Keşfet · Öğren · Geliş</span>' +
                    '</div>' +
                    '<button type="button" class="nav-drawer-close" aria-label="Menüyü kapat">' +
                    '<i class="fas fa-times" aria-hidden="true"></i></button>';
                navPanel.insertBefore(drawerHeader, navPanel.firstChild);
                var closeBtn = drawerHeader.querySelector('.nav-drawer-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        closeMobileNav();
                    });
                }
            }

            hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                const willOpen = !navPanel.classList.contains('active');
                navPanel.classList.toggle('active', willOpen);
                hamburger.classList.toggle('active', willOpen);
                hamburger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                openState(willOpen);
            });

            document.addEventListener('click', function(e) {
                if (!navPanel.classList.contains('active')) return;
                if (!hamburger.contains(e.target) && !navPanel.contains(e.target)) {
                    closeMobileNav();
                }
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', closeMobileNav);
            });

            document.querySelectorAll('.nav-panel .btn-login, .nav-panel .btn-signup, .nav-panel .btn-logout, .nav-panel .btn-dashboard').forEach(el => {
                el.addEventListener('click', closeMobileNav);
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navPanel.classList.contains('active')) {
                    closeMobileNav();
                }
            });
        } else if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                const isExpanded = hamburger.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
            });

            document.addEventListener('click', function(e) {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    if (navMenu.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    window.logout = async function() {
        function scheduleReload() {
            setTimeout(function () {
                try {
                    window.location.reload();
                } catch (e) {
                    window.location.href = window.location.href;
                }
            }, 0);
        }

        try {
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.logout) {
                await window.supabaseAuthSystem.logout();
                return;
            }
            if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                await Promise.race([
                    window.supabaseAuthSystem.supabase.auth.signOut({ scope: 'global' }),
                    new Promise(function (resolve) {
                        setTimeout(resolve, 220);
                    }),
                ]);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (k && k.startsWith('sb-')) localStorage.removeItem(k);
            }
        } catch (e) {}

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isVerified');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');

        scheduleReload();
    };

    window.redirectToModules = function(event) {
        if (event) event.preventDefault(); // Varsayılan link davranışını engelle
        window.location.href = '/modules.html';
    };

    function initDarkModeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');
        const html = document.documentElement;
        
        if (!darkModeToggle) return;
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            if (darkModeIcon) darkModeIcon.className = 'fas fa-sun';
        }
        
        darkModeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (darkModeIcon) darkModeIcon.className = 'fas fa-moon';
            } else {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (darkModeIcon) darkModeIcon.className = 'fas fa-sun';
            }
        });
    }

    function maybeLoadSaasShellForLanding() {
        try {
            if (!document.body || !document.body.classList.contains('landing-site-body')) return;
            var p = window.location.pathname || '';
            if (p.indexOf('/simulation/') === 0) return;
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].getAttribute('src') || '';
                if (src.indexOf('saas-shell.js') !== -1) return;
            }
            var s = document.createElement('script');
            s.src = '/js/saas-shell.js?v=2.2';
            s.async = false;
            (document.head || document.documentElement).appendChild(s);
        } catch (e) {
            /* noop */
        }
    }

    async function initNavigation() {
        setGuestNavChrome();
        upgradeUserAccountMenu();
        wireUserAccountDropdown();
        maybeLoadSaasShellForLanding();
        relocateThemeToggleToUserMenu();
        ensurePremiumExperienceAssets();
        normalizeLandingNavOrder();
        wirePlatformNavDropdown();
        if (typeof window.initSupabase !== 'undefined') {
            try {
                await window.initSupabase();
                let attempts = 0;
                while ((!window.supabaseAuthSystem || typeof SupabaseAuthSystem === 'undefined') && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                setupAuthStateListener();
            } catch (error) {
                console.warn('Supabase init error in navigation:', error);
            }
        }
        
        await updateNavigation();
        relocateThemeToggleToUserMenu();
        document.querySelectorAll('.saas-footer-year').forEach(function(el) {
            el.textContent = '2025';
        });
        initHamburgerMenu();
        initDarkModeToggle();
        
        setupLogoutButtons();
    }
    
    function setupLogoutButtons() {
        const logoutButtons = document.querySelectorAll('.btn-logout, #logoutBtn');
        logoutButtons.forEach(btn => {
            if (!btn.hasAttribute('data-logout-listener')) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.logout) {
                        window.logout();
                    }
                });
                btn.setAttribute('data-logout-listener', 'true');
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setGuestNavChrome();
            initNavigation();
        });
    } else {
        setGuestNavChrome();
        initNavigation();
    }

    window.addEventListener('storage', async function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'userData' || e.key === 'authToken') {
            await updateNavigation();
        }
    });
    
    window.addEventListener('focus', async function() {
        if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
            try {
                await window.supabaseAuthSystem.checkSession();
                await updateNavigation();
            } catch (error) {
                console.warn('Focus session check error:', error);
            }
        }
    });
    
    document.addEventListener('visibilitychange', async function() {
        if (!document.hidden && window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
            try {
                await window.supabaseAuthSystem.checkSession();
                await updateNavigation();
            } catch (error) {
                console.warn('Visibility change session check error:', error);
            }
        }
    });
    
    function setupAuthStateListener() {
        if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
            if (!window.supabaseAuthSystem._navListenerAdded) {
                window.supabaseAuthSystem.supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log('🔔 Navigation: Auth state changed:', event);
                    await updateNavigation();
                });
                window.supabaseAuthSystem._navListenerAdded = true;
            }
        } else {
            const checkSupabase = setInterval(() => {
                if (window.supabaseAuthSystem && window.supabaseAuthSystem.supabase) {
                    clearInterval(checkSupabase);
                    if (!window.supabaseAuthSystem._navListenerAdded) {
                        window.supabaseAuthSystem.supabase.auth.onAuthStateChange(async (event, session) => {
                            console.log('🔔 Navigation: Auth state changed:', event);
                            await updateNavigation();
                        });
                        window.supabaseAuthSystem._navListenerAdded = true;
                    }
                }
            }, 500);
            
            setTimeout(() => clearInterval(checkSupabase), 10000);
        }
    }
    
    setupAuthStateListener();
    
    let scrollTicking = false;
    let lastScrollY = window.pageYOffset || window.scrollY;
    
    function updateNavbarOnScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        const scrollY = window.pageYOffset || window.scrollY;
        
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        scrollTicking = false;
    }
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.pageYOffset || window.scrollY;
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateNavbarOnScroll);
        }
    }, { passive: true });
    
    updateNavbarOnScroll();

})();

