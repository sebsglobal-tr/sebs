// ============================================
// SEBS Global - Kimlik Doğrulama Sistemi
// ============================================
// Modül erişim kontrolü ve kullanıcı yönetimi
// Kullanıcı giriş/çıkış işlemlerini, modül erişim kontrolünü ve navigasyon güncellemelerini yönetir

class AuthSystem {
    constructor() {
        this.isLoggedIn = false; // Kullanıcının giriş yapıp yapmadığını tutar
        this.userEmail = null; // Giriş yapan kullanıcının e-posta adresini tutar
        this.init(); // Sistem başlatıldığında init metodunu çalıştır
    }

    // Sistem başlatma metodu
    // Sayfa yüklendiğinde gerekli kontrolleri yapar
    init() {
        // Sayfa yüklendiğinde giriş durumunu kontrol et (localStorage'dan)
        this.checkLoginStatus();
        
        // Modül sayfalarında erişim kontrolü yap (giriş yapmamış kullanıcıları engelle)
        if (this.isModulePage()) {
            this.protectModuleAccess();
        }
        
        // Navigation menüsünü giriş durumuna göre güncelle
        this.updateNavigation();
    }

    // Giriş durumunu kontrol et
    // localStorage'dan kullanıcı giriş bilgilerini okur ve sisteme yükler
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        if (isLoggedIn && userEmail) {
            this.isLoggedIn = true;
            this.userEmail = userEmail;
        }
    }

    // Mevcut sayfanın modül sayfası olup olmadığını kontrol et
    // URL path'i kontrol ederek modül sayfasını tespit eder
    isModulePage() {
        const currentPath = window.location.pathname;
        return currentPath.includes('modules/') && currentPath.endsWith('.html');
    }

    // Modül erişim koruması
    // Giriş yapmamış kullanıcılar için erişim engellenmiş modal gösterir
    protectModuleAccess() {
        if (!this.isLoggedIn) {
            this.showAccessDeniedModal();
        }
    }

    // Erişim engellendi modal'ını göster
    // Giriş yapmamış kullanıcılara gösterilen modal penceresi
    showAccessDeniedModal() {
        // Modal HTML içeriğini oluştur
        const modalHTML = `
            <div id="accessDeniedModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        color: white;
                        font-size: 2rem;
                    ">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2 style="
                        font-family: 'Space Grotesk', sans-serif;
                        font-size: 1.8rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 16px;
                    ">Erişim Engellendi</h2>
                    <p style="
                        color: #64748b;
                        line-height: 1.6;
                        margin-bottom: 24px;
                    ">
                        Bu modüle erişim için üye olmanız gerekmektedir.
                        <br><br>
                        Ücretsiz üye olarak tüm eğitim modüllerimize erişim sağlayabilirsiniz.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <a href="signup.html" style="
                            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                            color: white;
                            border: none;
                            border-radius: 12px;
                            padding: 12px 24px;
                            font-size: 1rem;
                            font-weight: 600;
                            text-decoration: none;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-user-plus"></i> Üye Ol
                        </a>
                        <a href="login.html" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 12px;
                            padding: 12px 24px;
                            font-size: 1rem;
                            font-weight: 600;
                            text-decoration: none;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-sign-in-alt"></i> Giriş Yap
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Modal'ı sayfaya ekle (body'nin sonuna)
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Sayfa içeriğini gizle (modal gösterilirken içerik görünmemeli)
        const mainContent = document.querySelector('.main-content') || document.querySelector('.module-container') || document.body;
        if (mainContent) {
            mainContent.style.display = 'none';
        }
    }

    // Navigasyon menüsünü güncelle
    // Giriş durumuna göre menü öğelerini (giriş/çıkış butonları) günceller
    updateNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return; // Navigation menüsü yoksa işlemi sonlandır

        // Mevcut giriş/üye ol linklerini kaldır (tekrar eklememek için)
        const existingAuthLinks = navMenu.querySelectorAll('.nav-link[href="login.html"], .nav-link[href="signup.html"]');
        existingAuthLinks.forEach(link => link.remove());

        if (this.isLoggedIn) {
            // Kullanıcı giriş yapmışsa - Kullanıcı menüsü ve çıkış butonu göster
            const userMenuHTML = `
                <li class="nav-item" role="none">
                    <a href="#" class="nav-link user-menu" role="menuitem">
                        <i class="fas fa-user"></i>
                        ${this.userEmail}
                    </a>
                </li>
                <li class="nav-item" role="none">
                    <a href="#" class="nav-link logout-btn" role="menuitem" onclick="authSystem.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Çıkış Yap
                    </a>
                </li>
            `;
            navMenu.insertAdjacentHTML('beforeend', userMenuHTML);
        } else {
            // Kullanıcı giriş yapmamışsa - Giriş yap ve üye ol butonlarını göster
            const authLinksHTML = `
                <li class="nav-item" role="none">
                    <a href="login.html" class="nav-link" role="menuitem">
                        <i class="fas fa-sign-in-alt"></i>
                        Giriş Yap
                    </a>
                </li>
                <li class="nav-item" role="none">
                    <a href="signup.html" class="nav-link signup-btn" role="menuitem">
                        <i class="fas fa-user-plus"></i>
                        Üye Ol
                    </a>
                </li>
            `;
            navMenu.insertAdjacentHTML('beforeend', authLinksHTML);
        }
    }

    // Kullanıcı çıkış işlemi
    // Tüm kullanıcı bilgilerini temizler ve ana sayfaya yönlendirir
    logout() {
        // Kullanıcı bilgilerini localStorage'dan temizle
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        
        // Sınıf içindeki değişkenleri sıfırla
        this.isLoggedIn = false;
        this.userEmail = null;
        
        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    }

    // E-posta formatı doğrulama
    // Geçerli bir e-posta formatı olup olmadığını kontrol eder
    // email: Doğrulanacak e-posta adresi
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Temel e-posta regex deseni
        return emailRegex.test(email);
    }

    // Geçici e-posta (temp mail) kontrolü
    // Sahte veya geçici e-posta servislerini tespit eder
    // email: Kontrol edilecek e-posta adresi
    isTempMail(email) {
        const tempMailDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
            'temp-mail.org', 'throwaway.email', 'getnada.com', 'maildrop.cc',
            'tempail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
            'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com',
            'mailcatch.com', 'mailmetrash.com', 'trashmail.net', 'trashmail.com',
            'spamgourmet.com', 'spam.la', 'binkmail.com', 'bobmail.info', 'chammy.info',
            'devnullmail.com', 'letthemeatspam.com', 'mailin8r.com', 'mailinator2.com',
            'notmailinator.com', 'reallymymail.com', 'reconmail.com', 'safetymail.info',
            'sogetthis.com', 'spamhereplease.com', 'superrito.com', 'thisisnotmyemail.com',
            'tradermail.info', 'veryrealemail.com', 'wegwerfmail.de', 'wegwerfmail.net',
            'wegwerfmail.org', 'wegwerfemail.de', 'wegwerfemail.net', 'wegwerfemail.org',
            'wegwerpmail.de', 'wegwerpmail.net', 'wegwerpmail.org', 'wegwerpmailadresse.de',
            'wegwerpmailadresse.net', 'wegwerpmailadresse.org', 'wegwerpmailadresse.com',
            'wegwerpmailadresse.eu', 'wegwerpmailadresse.co.uk', 'wegwerpmailadresse.co',
            'wegwerpmailadresse.info', 'wegwerpmailadresse.biz', 'wegwerpmailadresse.us',
            'wegwerpmailadresse.mobi', 'wegwerpmailadresse.name', 'wegwerpmailadresse.tk',
            'wegwerpmailadresse.cc', 'wegwerpmailadresse.tv', 'wegwerpmailadresse.ws',
            'wegwerpmailadresse.me', 'wegwerpmailadresse.be', 'wegwerpmailadresse.fr',
            'wegwerpmailadresse.it', 'wegwerpmailadresse.es', 'wegwerpmailadresse.pl',
            'wegwerpmailadresse.ru', 'wegwerpmailadresse.jp', 'wegwerpmailadresse.cn',
            'wegwerpmailadresse.in', 'wegwerpmailadresse.br', 'wegwerpmailadresse.mx',
            'wegwerpmailadresse.ca', 'wegwerpmailadresse.au', 'wegwerpmailadresse.nz',
            'wegwerpmailadresse.za', 'wegwerpmailadresse.tr', 'wegwerpmailadresse.gr',
            'wegwerpmailadresse.nl', 'wegwerpmailadresse.se', 'wegwerpmailadresse.no',
            'wegwerpmailadresse.dk', 'wegwerpmailadresse.fi', 'wegwerpmailadresse.is',
            'wegwerpmailadresse.ie', 'wegwerpmailadresse.ch', 'wegwerpmailadresse.at',
            'wegwerpmailadresse.li', 'wegwerpmailadresse.lu', 'wegwerpmailadresse.mc',
            'wegwerpmailadresse.sm', 'wegwerpmailadresse.va', 'wegwerpmailadresse.ad',
            'wegwerpmailadresse.and', 'wegwerpmailadresse.al', 'wegwerpmailadresse.ba',
            'wegwerpmailadresse.bg', 'wegwerpmailadresse.hr', 'wegwerpmailadresse.cz',
            'wegwerpmailadresse.ee', 'wegwerpmailadresse.hu', 'wegwerpmailadresse.lt',
            'wegwerpmailadresse.lv', 'wegwerpmailadresse.md', 'wegwerpmailadresse.me',
            'wegwerpmailadresse.mk', 'wegwerpmailadresse.ro', 'wegwerpmailadresse.rs',
            'wegwerpmailadresse.si', 'wegwerpmailadresse.sk', 'wegwerpmailadresse.ua',
            'wegwerpmailadresse.by', 'wegwerpmailadresse.kz', 'wegwerpmailadresse.kg',
            'wegwerpmailadresse.tj', 'wegwerpmailadresse.tm', 'wegwerpmailadresse.uz',
            'wegwerpmailadresse.az', 'wegwerpmailadresse.am', 'wegwerpmailadresse.ge',
            'wegwerpmailadresse.cy', 'wegwerpmailadresse.mt', 'wegwerpmailadresse.mk'
        ];
        
        // E-posta adresinden domain kısmını al (@ işaretinden sonrası)
        const domain = email.split('@')[1];
        // Domain'in geçici e-posta servisleri listesinde olup olmadığını kontrol et
        return tempMailDomains.includes(domain.toLowerCase());
    }

    // Şifre güçlülük kontrolü
    // Şifrenin ne kadar güçlü olduğunu değerlendirir
    // password: Kontrol edilecek şifre
    // Döndürür: { strength: sayı (0-5), feedback: 'Çok zayıf' | 'Zayıf' | 'İyi' | 'Güçlü' }
    checkPasswordStrength(password) {
        let strength = 0; // Güçlülük puanı (0-5 arası)
        let feedback = ''; // Kullanıcıya gösterilecek geri bildirim mesajı

        // Her kriter için puan ekle
        if (password.length >= 8) strength++; // En az 8 karakter
        if (password.match(/[a-z]/)) strength++; // Küçük harf içeriyor mu
        if (password.match(/[A-Z]/)) strength++; // Büyük harf içeriyor mu
        if (password.match(/[0-9]/)) strength++; // Rakam içeriyor mu
        if (password.match(/[^a-zA-Z0-9]/)) strength++; // Özel karakter içeriyor mu

        switch (strength) {
            case 0:
            case 1:
                feedback = 'Çok zayıf';
                break;
            case 2:
                feedback = 'Zayıf';
                break;
            case 3:
                feedback = 'İyi';
                break;
            case 4:
            case 5:
                feedback = 'Güçlü';
                break;
        }

        return { strength, feedback };
    }

    // E-posta doğrulama simülasyonu (geliştirme/test için)
    // Gerçek uygulamada bu fonksiyon yerine backend'den e-posta gönderimi yapılır
    // email: Doğrulama e-postası gönderilecek e-posta adresi
    simulateEmailVerification(email) {
        return new Promise((resolve) => {
            // Gerçek uygulamada burada backend'e e-posta gönderimi isteği yapılır
            setTimeout(() => {
                console.log(`Doğrulama e-postası ${email} adresine gönderildi`);
                resolve(true);
            }, 1000); // 1 saniye gecikme simülasyonu
        });
    }
}

// ============================================
// GLOBAL AUTH SYSTEM INSTANCE
// ============================================
// Tüm sayfalarda kullanılmak üzere global auth sistemi örneği
const authSystem = new AuthSystem();

// Sayfa yüklendiğinde auth system'i başlat
// (Auth system zaten constructor'da otomatik olarak başlatılıyor)
document.addEventListener('DOMContentLoaded', function() {
    // Auth system zaten constructor'da başlatılıyor, burada sadece log mesajı veriyoruz
    console.log('SEBS Global Authentication System initialized');
});

// Modül sistemi için export (Node.js/CommonJS desteği)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}
