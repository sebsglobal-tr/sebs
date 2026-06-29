
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
            } else {
                signupBtn.setAttribute('href', '/signup.html');
                signupBtn.textContent = 'Ücretsiz başla';
                signupBtn.removeAttribute('aria-label');
                signupBtn.style.removeProperty('display');
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

    function ensurePremiumExperienceAssets() {
        try {
            /* Yeni ana sayfa (sebs-home) kendi CSS’ini kullanır; eski landing premium kuralları çakışır */
            if (document.body && document.body.classList.contains('sebs-home-page')) {
                return;
            }
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
                if (session && session.user) {
                    return true;
                }
            }
            return localStorage.getItem('isLoggedIn') === 'true';
        } catch (error) {
            console.warn('isLoggedIn check error:', error);
            return localStorage.getItem('isLoggedIn') === 'true';
        }
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
        dash.textContent = 'Profilim';

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

        const landingNavLinks = document.querySelectorAll('header.fixed nav[aria-label="Ana menü"] a[href]');
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
            if (loginBtn) loginBtn.style.removeProperty('display');
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
                logoutBtn.classList.add('hidden');
            }
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'none';
                userProfile.classList.add('hidden');
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

    /** Üst menü: sebs-header__nav içini doldur + mobil drawer */
    function normalizeLandingNavOrder() {
        if (!document.body || !document.body.classList.contains('landing-site-body')) {
            return;
        }

        var NAV_CLS = 'landing-nav-pill-link';
        var NAV_MUTED = 'landing-nav-pill-link landing-nav-pill-link--muted';

        function makeLink(href, text, cls) {
            var a = document.createElement('a');
            a.href = href;
            a.textContent = text;
            a.className = cls;
            return a;
        }

        function makeDesktopPlatformBlock() {
            var wrap = document.createElement('div');
            wrap.className = 'relative';
            wrap.id = 'navPlatformWrap';

            var trig = document.createElement('button');
            trig.type = 'button';
            trig.id = 'navPlatformTrigger';
            trig.className = NAV_CLS;
            trig.setAttribute('aria-expanded', 'false');
            trig.setAttribute('aria-haspopup', 'menu');
            trig.setAttribute('aria-controls', 'navPlatformPanel');
            trig.setAttribute('aria-label', 'Platform menüsü');
            var chev = document.createElement('span');
            chev.className = 'nav-platform-chevron';
            chev.setAttribute('aria-hidden', 'true');
            chev.textContent = '▾';
            trig.appendChild(document.createTextNode('Platform'));
            trig.appendChild(chev);

            var panel = document.createElement('div');
            panel.id = 'navPlatformPanel';
            panel.className = 'nav-platform-dropdown hidden';
            panel.setAttribute('role', 'menu');
            panel.hidden = true;

            var items = [
                { href: '/modules.html', icon: '🖥', title: 'Eğitim Modülleri', desc: 'Simülasyon tabanlı öğrenme' },
                { href: '/simulations.html', icon: '🤖', title: 'Simülasyonlar', desc: 'Gerçek senaryo pratikleri' },
                { href: '/pricing.html', icon: '📊', title: 'Paketler', desc: 'Sana uygun planı seç' },
                { href: '/isverenler.html', icon: '🏢', title: 'Kurumsal', desc: 'İşveren çözümleri' }
            ];

            items.forEach(function (item) {
                var card = document.createElement('a');
                card.href = item.href;
                card.setAttribute('role', 'menuitem');

                var icon = document.createElement('span');
                icon.className = 'platform-icon';
                icon.textContent = item.icon;

                var textWrap = document.createElement('span');
                textWrap.className = 'platform-text';

                var title = document.createElement('span');
                title.style.fontWeight = '600';
                title.style.fontSize = '.875rem';
                title.textContent = item.title;

                var desc = document.createElement('span');
                desc.className = 'platform-label';
                desc.textContent = item.desc;

                textWrap.appendChild(title);
                textWrap.appendChild(desc);
                card.appendChild(icon);
                card.appendChild(textWrap);
                panel.appendChild(card);
            });

            wrap.appendChild(trig);
            wrap.appendChild(panel);
            return wrap;
        }

        var desktopNav = document.getElementById('sebsHeaderNav');
        if (desktopNav) {
            desktopNav.innerHTML = '';
            desktopNav.appendChild(makeLink('/', 'Ana sayfa', NAV_CLS));
            desktopNav.appendChild(makeDesktopPlatformBlock());
            desktopNav.appendChild(makeLink('/pricing.html', 'Paketler', NAV_CLS));
            desktopNav.appendChild(makeLink('/isverenler.html', 'İşverenler İçin', NAV_MUTED));
            desktopNav.appendChild(makeLink('/blog', 'Blog', NAV_CLS));
            desktopNav.appendChild(makeLink('/hakkimizda', 'Hakkımızda', NAV_MUTED));
            desktopNav.appendChild(makeLink('/contact.html', 'İletişim', NAV_MUTED));
        }

        document.querySelectorAll('.sebs-header__nav a.landing-nav-contact').forEach(function (el) {
            el.style.display = 'none';
            el.setAttribute('aria-hidden', 'true');
        });

        var headerRow = document.querySelector('header.fixed > div');
        if (headerRow) {
            var first = headerRow.firstElementChild;
            if (first && first.tagName === 'A' && !first.classList.contains('shrink-0')) {
                first.classList.add('shrink-0');
            }
        }

        /* ── Mobile drawer ───────────────────────────────────── */
        var drawer = document.getElementById('sebsMobileDrawer');
        var drawerNav = document.getElementById('sebsDrawerNav');
        var hamburger = document.getElementById('sebsHamburger');

        function closeMobileDrawer() {
            if (drawer) {
                drawer.classList.remove('active');
                drawer.setAttribute('aria-hidden', 'true');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            document.body.classList.remove('nav-menu-open');
            document.documentElement.classList.remove('nav-menu-open');
        }

        window.closeMobileNav = closeMobileDrawer;

        if (hamburger && drawer) {
            var overlay = drawer.querySelector('.sebs-drawer__overlay');
            var closeBtn = document.getElementById('sebsDrawerClose');

            if (overlay) {
                overlay.addEventListener('click', closeMobileDrawer);
            }
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMobileDrawer);
            }
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && drawer.classList.contains('active')) {
                    closeMobileDrawer();
                }
            });

            hamburger.addEventListener('click', function (e) {
                e.stopPropagation();
                var willOpen = !drawer.classList.contains('active');
                drawer.classList.toggle('active', willOpen);
                drawer.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
                hamburger.classList.toggle('active', willOpen);
                hamburger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                document.body.classList.toggle('nav-menu-open', willOpen);
                document.documentElement.classList.toggle('nav-menu-open', willOpen);
            });
        }

        if (drawerNav) {
            var df = document.createDocumentFragment();

            var drawerItems = [
                { href: '/', text: 'Ana sayfa', isHeading: false },
                { href: null, text: 'Platform', isHeading: true },
                { href: '/modules.html', text: 'Eğitim modülleri', isHeading: false },
                { href: '/simulations.html', text: 'Simülasyonlar', isHeading: false },
                { href: null, text: null, isDivider: true },
                { href: '/pricing.html', text: 'Paketler', isHeading: false },
                { href: '/isverenler.html', text: 'İşverenler İçin', isHeading: false },
                { href: '/blog', text: 'Blog', isHeading: false },
                { href: '/hakkimizda', text: 'Hakkımızda', isHeading: false },
                { href: '/contact.html', text: 'İletişim', isHeading: false },
                { href: null, text: null, isDivider: true },
            ];

            drawerItems.forEach(function (item) {
                if (item.isDivider) {
                    var hr = document.createElement('hr');
                    hr.className = 'drawer-divider';
                    df.appendChild(hr);
                } else if (item.isHeading) {
                    var h = document.createElement('div');
                    h.className = 'drawer-heading';
                    h.textContent = item.text;
                    df.appendChild(h);
                } else {
                    var a = document.createElement('a');
                    a.href = item.href;
                    a.textContent = item.text;
                    df.appendChild(a);
                }
            });

            drawerNav.innerHTML = '';
            drawerNav.appendChild(df);

            /* Guest auth links */
            var guestSection = document.createElement('div');
            guestSection.className = 'drawer-auth';
            guestSection.id = 'mobileGuestLinks';
            var loginA = document.createElement('a');
            loginA.href = '/login.html';
            loginA.textContent = 'Giriş';
            loginA.className = 'drawer-login';
            var signupA = document.createElement('a');
            signupA.href = '/signup.html';
            signupA.textContent = 'Ücretsiz başla';
            signupA.className = 'drawer-signup';
            guestSection.appendChild(loginA);
            guestSection.appendChild(signupA);
            drawerNav.appendChild(guestSection);

            /* User links (hidden by default) */
            var userSection = document.createElement('div');
            userSection.className = 'drawer-auth';
            userSection.id = 'mobileUserLinks';
            userSection.style.display = 'none';
            var logoutBtn = document.createElement('button');
            logoutBtn.type = 'button';
            logoutBtn.className = 'btn-logout drawer-login';
            logoutBtn.textContent = 'Çıkış';
            userSection.appendChild(logoutBtn);
            drawerNav.appendChild(userSection);

            drawerNav.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    closeMobileDrawer();
                });
            });
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
            s.src = '/js/saas-shell.js?v=2.3';
            s.async = false;
            (document.head || document.documentElement).appendChild(s);
        } catch (e) {
            /* noop */
        }
    }

    async function initNavigation() {
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
            initNavigation();
        });
    } else {
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

    function updateHeaderOnScroll() {
        const header = document.querySelector('.sebs-header');
        if (!header) return;

        const scrollY = window.pageYOffset || window.scrollY;
        if (scrollY > 10) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateHeaderOnScroll);
        }
    }, { passive: true });

    updateHeaderOnScroll();

})();

