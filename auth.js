
class AuthSystem {
    constructor() {
        this.isLoggedIn = false; // Kullanıcının giriş yapıp yapmadığını tutar
        this.userEmail = null; // Giriş yapan kullanıcının e-posta adresini tutar
        this.init(); // Sistem başlatıldığında init metodunu çalıştır
    }

    init() {
        this.checkLoginStatus();
        
        if (this.isModulePage()) {
            this.protectModuleAccess();
        }
        
        this.updateNavigation();
    }

    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        if (isLoggedIn && userEmail) {
            this.isLoggedIn = true;
            this.userEmail = userEmail;
        }
    }

    isModulePage() {
        const currentPath = window.location.pathname;
        return currentPath.includes('modules/') && currentPath.endsWith('.html');
    }

    protectModuleAccess() {
        if (!this.isLoggedIn) {
            this.showAccessDeniedModal();
        }
    }

    showAccessDeniedModal() {
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
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const mainContent = document.querySelector('.main-content') || document.querySelector('.module-container') || document.body;
        if (mainContent) {
            mainContent.style.display = 'none';
        }
    }

    updateNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return; // Navigation menüsü yoksa işlemi sonlandır

        const existingAuthLinks = navMenu.querySelectorAll('.nav-link[href="login.html"], .nav-link[href="signup.html"]');
        existingAuthLinks.forEach(link => link.remove());

        if (this.isLoggedIn) {
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

    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        
        this.isLoggedIn = false;
        this.userEmail = null;
        
        window.location.href = 'index.html';
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Temel e-posta regex deseni
        return emailRegex.test(email);
    }

    /**
     * @deprecated Bu AuthSystem sınıfı localStorage tabanlı olup yalnızca
     * geriye dönük uyumluluk içindir. Yeni geliştirme için js/supabase-auth.js
     * (SupabaseAuthSystem) kullanın.
     */
    isTempMail(email) {
        const tempMailDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
            'temp-mail.org', 'sharklasers.com', 'trashmail.net', 'wegwerfmail.de'
        ];

        const domain = email.split('@')[1];
        return tempMailDomains.includes(domain.toLowerCase());
    }

    checkPasswordStrength(password) {
        let strength = 0; // Güçlülük puanı (0-5 arası)
        let feedback = ''; // Kullanıcıya gösterilecek geri bildirim mesajı

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

    simulateEmailVerification(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Doğrulama e-postası ${email} adresine gönderildi`);
                resolve(true);
            }, 1000); // 1 saniye gecikme simülasyonu
        });
    }
}

const authSystem = new AuthSystem();

document.addEventListener('DOMContentLoaded', function() {
    console.log('SEBS Global Authentication System initialized');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}
