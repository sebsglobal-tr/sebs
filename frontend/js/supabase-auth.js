// Supabase Auth Integration
// Mevcut auth.js'in yerine Supabase Auth kullanır

class SupabaseAuthSystem {
  constructor() {
    this.isLoggedIn = false;
    this.user = null;
    this.supabase = null;
    this.init();
  }

  async init() {
    // Supabase client'ı yükle
    try {
      if (typeof window.initSupabase === 'undefined') {
        console.warn('⚠️ initSupabase fonksiyonu henüz yüklenmedi, bekleniyor...');
        // Fonksiyon yüklenene kadar bekle (maksimum 10 saniye)
        let attempts = 0;
        const maxAttempts = 100; // 10 saniye
        while (typeof window.initSupabase === 'undefined' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
          
          // Her 2 saniyede bir durum yazdır
          if (attempts % 20 === 0) {
            console.log(`⏳ Supabase client yüklenmesi bekleniyor... (${attempts * 100 / 1000}s)`);
          }
        }
        if (typeof window.initSupabase === 'undefined') {
          throw new Error('Supabase client script yüklenemedi. Lütfen sayfayı yenileyin (F5 veya Ctrl+Shift+R).');
        }
      }
      
      // Supabase client'ı başlat
      this.supabase = await window.initSupabase();
      
      if (!this.supabase) {
        throw new Error('Supabase client oluşturulamadı');
      }
      
      console.log('✅ Supabase Auth System initialized');
    } catch (error) {
      console.error('Supabase init hatası:', error);
      // Hata durumunda tekrar dene (maksimum 3 kez)
      if (!this.initAttempts) {
        this.initAttempts = 0;
      }
      this.initAttempts++;
      
      if (this.initAttempts < 3) {
        console.log(`🔄 Supabase init tekrar deneniyor... (${this.initAttempts}/3)`);
        setTimeout(() => this.init(), 2000);
      } else {
        console.error('❌ Supabase init başarısız oldu. Lütfen sayfayı yenileyin.');
      }
      return;
    }

    // Mevcut session'ı kontrol et
    await this.checkSession();

    // Auth state değişikliklerini dinle
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        try {
          if (typeof window.invalidateModuleIdCache === 'function') {
            window.invalidateModuleIdCache();
          } else {
            localStorage.removeItem('moduleNameCache');
            localStorage.removeItem('moduleNameCacheTime');
          }
        } catch (e) { /* ignore */ }
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.isLoggedIn = true;
        this.user = session?.user || null;
        await this.updateNavigation();
      } else if (event === 'SIGNED_OUT') {
        this.isLoggedIn = false;
        this.user = null;
        await this.updateNavigation();
      } else if (event === 'USER_UPDATED') {
        // Kullanıcı bilgileri güncellendi
        if (session?.user) {
          this.user = session.user;
          await this.updateNavigation();
        }
      }
    });

    // Modül sayfalarında erişim kontrolü
    if (this.isModulePage()) {
      this.protectModuleAccess();
    }

    // Navigation güncelle (async olduğu için await kullanmıyoruz, background'da çalışsın)
    this.updateNavigation().catch(err => console.warn('updateNavigation error:', err));
  }

  async checkSession() {
    try {
      if (!this.supabase) {
        await this.init();
        if (!this.supabase) {
          console.warn('Supabase client not available for session check');
          return;
        }
      }

      // getSession() otomatik olarak localStorage'dan session'ı yükler
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.warn('Session check error:', error);
        this.isLoggedIn = false;
        this.user = null;
        try { localStorage.removeItem('isLoggedIn'); } catch (e) {}
        return;
      }

      if (session && session.user) {
        this.isLoggedIn = true;
        this.user = session.user;
        try { localStorage.setItem('isLoggedIn', 'true'); } catch (e) {}
        if (session.access_token) {
          try { localStorage.setItem('authToken', session.access_token); } catch (e) {}
        }
        console.log('✅ Session found:', {
          email: session.user.email,
          confirmed: !!session.user.email_confirmed_at,
          expiresAt: session.expires_at
        });
        
        // public.profiles bu şemada yok; rol backend /api/users/me + public.users
      } else {
        // Session yok
        this.isLoggedIn = false;
        this.user = null;
        try { localStorage.removeItem('isLoggedIn'); } catch (e) {}
        console.log('ℹ️ No active session');
      }
    } catch (error) {
      console.error('Session check error:', error);
      this.isLoggedIn = false;
      this.user = null;
      try { localStorage.removeItem('isLoggedIn'); } catch (e) {}
    }
  }

  isModulePage() {
    const currentPath = window.location.pathname;
    return currentPath.includes('modules/') && currentPath.endsWith('.html');
  }

  async protectModuleAccess() {
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

  async updateNavigation() {
    // Nav-buttons içindeki butonları güncelle (HTML'de zaten var)
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    // Session'ı tekrar kontrol et (sayfa değişikliklerinde önemli)
    try {
      if (this.supabase) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session && session.user) {
          this.isLoggedIn = true;
          this.user = session.user;
        } else {
          this.isLoggedIn = false;
          this.user = null;
        }
      }
    } catch (error) {
      console.warn('Session check in updateNavigation:', error);
    }

    const mobileGuestLinks = document.getElementById('mobileGuestLinks');
    const mobileUserLinks = document.getElementById('mobileUserLinks');

    if (this.isLoggedIn && this.user) {
      // Kullanıcı giriş yapmışsa
      const mdNav = this.user.user_metadata || {};
      const isAdmin =
        mdNav.role === 'admin' || localStorage.getItem('userRole') === 'admin';

      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) {
        signupBtn.setAttribute('href', isAdmin ? '/admin.html' : '/dashboard.html');
        signupBtn.textContent = isAdmin ? 'Yönetim' : 'Panel';
        signupBtn.setAttribute(
          'aria-label',
          isAdmin ? 'Yönetim paneline git' : 'Kullanıcı paneline git'
        );
        signupBtn.style.display = 'inline-flex';
      }
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (dashboardBtn) dashboardBtn.style.display = 'block';
      if (userProfile) {
        userProfile.classList.remove('hidden');
        userProfile.style.display = 'flex';
      }
      if (mobileGuestLinks) mobileGuestLinks.style.display = 'none';
      if (mobileUserLinks) mobileUserLinks.style.display = 'block';
      
      try {
        const md = mdNav;
        const displayName =
          (md.full_name || md.name || [md.first_name, md.last_name].filter(Boolean).join(' ') || '').trim() ||
          (this.user.email ? this.user.email.split('@')[0] : '') ||
          'Kullanıcı';
        const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'K';
        if (userName) userName.textContent = displayName;
        if (userAvatar) userAvatar.textContent = firstLetter;
      } catch (e) {
        if (userName) userName.textContent = 'Kullanıcı';
        if (userAvatar) userAvatar.textContent = 'K';
      }
    } else {
      // Kullanıcı giriş yapmamışsa
      if (loginBtn) loginBtn.style.removeProperty('display');
      if (signupBtn) {
        signupBtn.setAttribute('href', '/signup.html');
        signupBtn.textContent = 'Ücretsiz başla';
        signupBtn.removeAttribute('aria-label');
        signupBtn.style.removeProperty('display');
      }
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (dashboardBtn) dashboardBtn.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'none';
        userProfile.classList.add('hidden');
      }
      if (mobileGuestLinks) mobileGuestLinks.style.display = 'block';
      if (mobileUserLinks) mobileUserLinks.style.display = 'none';
    }
  }

  async logout() {
    try {
      if (this.supabase) {
        const { error } = await this.supabase.auth.signOut({ scope: 'global' });
        if (error) throw error;
      }

      this.isLoggedIn = false;
      this.user = null;

      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sb-')) localStorage.removeItem(k);
        }
      } catch (e) {}
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
      } catch (e) {}

      window.location.href = '/index.html';
    } catch (error) {
      console.error('Logout error:', error);
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sb-')) localStorage.removeItem(k);
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
      } catch (e) {}
      window.location.href = '/index.html';
    }
  }

  async signUp(email, password, fullName) {
    try {
      // Email formatını kontrol et
      if (!this.validateEmail(email)) {
        return {
          success: false,
          message: 'Geçerli bir e-posta adresi girin'
        };
      }

      // Şifre gücünü kontrol et
      if (password.length < 8) {
        return {
          success: false,
          message: 'Şifre en az 8 karakter olmalıdır'
        };
      }

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback.html`
        }
      });

      if (error) {
        // Supabase hata mesajlarını Türkçeleştir
        let errorMessage = error.message;
        
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          errorMessage = 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Geçerli bir e-posta adresi girin';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Şifre gereksinimlerini karşılamıyor';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.';
        }
        
        throw new Error(errorMessage);
      }

      // Kullanıcı oluşturuldu ama email doğrulanmadıysa
      if (data.user && !data.session) {
        return {
          success: true,
          user: data.user,
          message: 'Kayıt başarılı! E-posta adresinize gönderilen doğrulama linkine tıklayın.',
          requiresEmailVerification: true
        };
      }

      // Email doğrulama gerekmiyorsa (development modunda olabilir)
      if (data.user && data.session) {
        this.isLoggedIn = true;
        this.user = data.user;
        return {
          success: true,
          user: data.user,
          session: data.session,
          message: 'Kayıt başarılı! Giriş yaptınız.'
        };
      }

      return {
        success: true,
        user: data.user,
        message: 'Kayıt başarılı! E-posta adresinize gönderilen doğrulama linkine tıklayın.'
      };
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        success: false,
        message: error.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      };
    }
  }

  async signIn(email, password) {
    try {
      // Email formatını kontrol et
      if (!this.validateEmail(email)) {
        return {
          success: false,
          message: 'Geçerli bir e-posta adresi girin'
        };
      }

      // Şifre kontrolü
      if (!password || password.length === 0) {
        return {
          success: false,
          message: 'Şifre gereklidir'
        };
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Supabase hata mesajlarını Türkçeleştir
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid credentials') ||
            error.message.includes('Email not confirmed')) {
          errorMessage = 'E-posta adresi veya şifre hatalı. Lütfen kontrol edin.';
        } else if (error.message.includes('Email not confirmed') || 
                   error.message.includes('email not confirmed')) {
          errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor. E-posta kutunuzu kontrol edin.';
        } else if (error.message.includes('rate limit') || 
                   error.message.includes('Too many requests')) {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
        }
        
        throw new Error(errorMessage);
      }

      // Session kontrolü
      if (!data.session) {
        return {
          success: false,
          message: 'Giriş yapılamadı. Lütfen e-posta adresinizi doğrulayın.'
        };
      }

      // Oturum Supabase tarafında verildiyse giriş kabul edilir (email_confirmed_at bazı yapılandırmalarda boş kalabilir).

      this.isLoggedIn = true;
      this.user = data.user;
      try { localStorage.setItem('isLoggedIn', 'true'); } catch (e) {}
      if (data.session && data.session.access_token) {
        try { localStorage.setItem('authToken', data.session.access_token); } catch (e) {}
      }

      // Giriş kaydı (veritabanına - günlük takip)
      try {
        if (window.APIClient?.logLogin) {
          await window.APIClient.logLogin();
        } else {
          const apiBase =
            typeof window.getSebsApiBase === 'function'
              ? window.getSebsApiBase()
              : (window.location?.origin || '') + '/api';
          await fetch(apiBase + '/progress/activity/login', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + (data.session?.access_token || ''),
              'Content-Type': 'application/json'
            },
            body: '{}'
          });
        }
      } catch (e) { /* sessizce devam */ }

      return {
        success: true,
        session: data.session,
        user: data.user
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        success: false,
        message: error.message || 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      };
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  checkPasswordStrength(password) {
    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

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
}

// Global instance
let supabaseAuthSystem = null;

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Supabase client'ı önce başlat
    if (typeof window.initSupabase !== 'undefined') {
      await window.initSupabase();
    }
    
    // SupabaseAuthSystem oluştur
    supabaseAuthSystem = new SupabaseAuthSystem();
    window.supabaseAuthSystem = supabaseAuthSystem;
    
    // Session'ı kontrol et ve navigation'ı güncelle
    await supabaseAuthSystem.checkSession();
    await supabaseAuthSystem.updateNavigation();
    
    console.log('✅ SEBS Global Supabase Auth System initialized');
    console.log('   Session status:', supabaseAuthSystem.isLoggedIn ? 'Logged in' : 'Not logged in');
    if (supabaseAuthSystem.isLoggedIn && supabaseAuthSystem.user) {
      console.log('   User:', supabaseAuthSystem.user.email);
    }
    
    // Sayfa değişikliklerinde session'ı kontrol et
    window.addEventListener('focus', async () => {
      if (supabaseAuthSystem && supabaseAuthSystem.supabase) {
        await supabaseAuthSystem.checkSession();
        await supabaseAuthSystem.updateNavigation();
      }
    });
  } catch (error) {
    console.error('❌ Supabase Auth System initialization error:', error);
  }
});
