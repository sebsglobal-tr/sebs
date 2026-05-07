
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

    async function updateNavigation() {
        const currentPage = getCurrentPage();
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
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            if (dashboardBtn) dashboardBtn.style.display = 'none';

            if (userProfile) {
                userProfile.classList.remove('hidden');
                userProfile.style.display = 'flex';
                userProfile.style.cursor = 'pointer';
                userProfile.setAttribute('role', 'link');
                userProfile.setAttribute('title', 'Panele git');
                if (!userProfile.hasAttribute('data-dashboard-listener')) {
                    userProfile.addEventListener('click', function() {
                        window.location.href = isAdmin ? '/admin.html' : '/dashboard.html';
                    });
                    userProfile.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            window.location.href = isAdmin ? '/admin.html' : '/dashboard.html';
                        }
                    });
                    userProfile.setAttribute('data-dashboard-listener', 'true');
                }
            }

            if (userName) userName.textContent = displayName;
            if (userAvatar) userAvatar.textContent = (String(displayName).trim() || 'U')[0].toUpperCase();

            if (mobileGuestLinks) mobileGuestLinks.style.display = 'none';
            if (mobileUserLinks) mobileUserLinks.style.display = 'block';
        } else {
            if (loginBtn) loginBtn.style.removeProperty('display');
            if (logoutBtn) logoutBtn.style.display = 'none';
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

    async function initNavigation() {
        ensurePremiumExperienceAssets();
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
        document.querySelectorAll('.saas-footer-year').forEach(function(el) {
            el.textContent = String(new Date().getFullYear());
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

