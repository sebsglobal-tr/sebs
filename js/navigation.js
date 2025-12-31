// ============================================
// STANDART NAVİGASYON BİLEŞENİ
// ============================================
// Tüm sayfalarda tutarlı navigasyon sağlar
// Aktif sayfa tespiti, giriş durumuna göre menü güncelleme ve hamburger menü yönetimi

(function() {
    'use strict';

    // ============================================
    // YARDIMCI FONKSİYONLAR
    // ============================================
    
    // URL'den mevcut sayfa adını al
    // Hangi sayfada olduğumuzu tespit eder
    function getCurrentPage() {
        const path = window.location.pathname;
        let page = path.split('/').pop().replace('.html', '') || 'index'; // URL'den sayfa adını çıkar
        
        // Modül sayfalarını işle - modules/ alt klasöründe bulunurlar
        if (path.includes('/modules/')) {
            // Modül sayfaları için navigasyonda 'modules' olarak gösterilmesi gerekir
            // Ancak gerçek sayfa adı başka amaçlar için saklanır
            const isModuleContentPage = path.includes('/modules/') && 
                                       !path.endsWith('modules.html') &&
                                       !path.endsWith('modules/');
            if (isModuleContentPage) {
                // Bu bir modül içerik sayfası, navigasyonda 'modules' aktif gösterilmeli
                return 'modules';
            }
        }
        
        return page;
    }

    // Kullanıcının giriş yapıp yapmadığını kontrol et
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // Kullanıcı verilerini getir
    function getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null; // JSON parse et, yoksa null döndür
    }

    // ============================================
    // NAVİGASYON GÜNCELLEME FONKSİYONU
    // ============================================
    // Mevcut sayfa ve giriş durumuna göre navigasyonu günceller
    // Aktif link, giriş/çıkış butonları, kullanıcı profil bilgilerini günceller
    function updateNavigation() {
        const currentPage = getCurrentPage();
        const loggedIn = isLoggedIn();
        const userData = getUserData();
        
        // Aktif link'i güncelle (mevcut sayfaya göre)
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('data-page') || 
                           link.getAttribute('href')?.replace('.html', '').replace('../', '').replace('/', '') || '';
            // Link mevcut sayfa ile eşleşiyorsa 'active' class'ı ekle
            if (linkPage === currentPage || 
                (currentPage === 'index' && linkPage === '') ||
                (currentPage === 'index' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Giriş/çıkış butonlarını güncelle
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (loggedIn && userData) {
            // Kullanıcı giriş yapmışsa
            const userRole = userData.role || localStorage.getItem('userRole') || 'user';
            const isAdmin = userRole === 'admin'; // Admin kontrolü
            
            // Giriş yapılmışsa giriş/üye ol butonlarını gizle, çıkış butonunu göster
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (dashboardBtn) {
                dashboardBtn.style.display = 'block';
                // Admin kullanıcılar için dashboard butonunu güncelle
                if (isAdmin) {
                    dashboardBtn.href = 'admin.html';
                    dashboardBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin Panel';
                } else {
                    dashboardBtn.href = 'dashboard.html';
                    dashboardBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Panel';
                }
            }
            if (userProfile) userProfile.style.display = 'flex'; // Kullanıcı profilini göster
            
            // Kullanıcı bilgilerini güncelle
            if (userName && userData.firstName) {
                userName.textContent = userData.firstName || userData.email || 'Kullanıcı';
            }
            if (userAvatar && userData.firstName) {
                // Avatar için kullanıcı adının ilk harfini kullan
                userAvatar.textContent = (userData.firstName || 'U')[0].toUpperCase();
            }
        } else {
            // Kullanıcı giriş yapmamışsa
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
        }

        // Modül sayfaları için navigasyon linklerini güncelle (../ öneki kullanırlar)
        // Modül sayfaları alt klasörde olduğu için üst klasöre çıkmak için ../ gerekir
        const isModulePage = window.location.pathname.includes('/modules/') || 
                            window.location.pathname.includes('modules/');
        
        if (isModulePage) {
            // Tüm navigasyon linklerine ../ öneki ekle (yoksa)
            document.querySelectorAll('.nav-link[data-page]').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('../') && !href.startsWith('http')) {
                    link.setAttribute('href', '../' + href);
                }
            });
            
            // Buton linklerini güncelle
            const loginBtn = document.getElementById('loginBtn');
            const signupBtn = document.getElementById('signupBtn');
            const dashboardBtn = document.getElementById('dashboardBtn');
            
            if (loginBtn && !loginBtn.getAttribute('href').startsWith('../')) {
                loginBtn.setAttribute('href', '../' + loginBtn.getAttribute('href'));
            }
            if (signupBtn && !signupBtn.getAttribute('href').startsWith('../')) {
                signupBtn.setAttribute('href', '../' + signupBtn.getAttribute('href'));
            }
            if (dashboardBtn && !dashboardBtn.getAttribute('href').startsWith('../')) {
                dashboardBtn.setAttribute('href', '../' + dashboardBtn.getAttribute('href'));
            }
        }
    }

    // ============================================
    // HAMBURGER MENÜ YÖNETİMİ
    // ============================================
    // Mobil cihazlar için hamburger menü açma/kapatma işlevselliği
    function initHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            // Hamburger butonuna tıklama event'i ekle
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active'); // Hamburger animasyonu için
                navMenu.classList.toggle('active'); // Menüyü aç/kapa
                const isExpanded = hamburger.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded); // Erişilebilirlik için
            });

            // Menü dışına tıklandığında menüyü kapat
            document.addEventListener('click', function(e) {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // ============================================
    // ÇIKIŞ FONKSİYONU
    // ============================================
    // Kullanıcı çıkış işlemi - localStorage'ı temizler ve ana sayfaya yönlendirir
    window.logout = function() {
        // Kullanıcıdan onay al
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            // Tüm kullanıcı verilerini localStorage'dan temizle
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isVerified');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            
            // Mevcut sayfaya göre yönlendirme yap
            const currentPath = window.location.pathname;
            if (currentPath.includes('admin.html')) {
                window.location.href = 'index.html'; // Admin sayfasındaysa ana sayfaya yönlendir
            } else {
                window.location.href = 'index.html'; // Diğer sayfalardan ana sayfaya yönlendir
            }
        }
    };

    // Modüller sayfasına yönlendirme fonksiyonu
    window.redirectToModules = function(event) {
        if (event) event.preventDefault(); // Varsayılan link davranışını engelle
        window.location.href = 'modules.html';
    };

    // ============================================
    // BAŞLATMA
    // ============================================
    // DOM hazır olduğunda navigasyonu başlat
    // DOM yüklenme durumunu kontrol et
    if (document.readyState === 'loading') {
        // DOM henüz yükleniyorsa, yüklendiğinde başlat
        document.addEventListener('DOMContentLoaded', function() {
            updateNavigation();
            initHamburgerMenu();
        });
    } else {
        // DOM zaten yüklenmişse hemen başlat
        updateNavigation();
        initHamburgerMenu();
    }

    // Giriş durumu değiştiğinde navigasyonu güncelle
    // Başka bir sekmede giriş/çıkış yapıldığında bu sekmede de güncelleme yapılır
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'userData') {
            updateNavigation();
        }
    });

})();

