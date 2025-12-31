/**
 * Module Access Check
 * Checks if user has access to the current module and redirects if not
 */

(async function() {
    // Wait for AccessControl to be available
    if (!window.AccessControl) {
        // Load access-control.js if not already loaded
        const script = document.createElement('script');
        script.src = '../utils/access-control.js';
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve) => {
            script.onload = resolve;
            setTimeout(resolve, 1000); // Timeout after 1 second
        });
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        if (confirm('Bu modüle erişim için giriş yapmanız gerekiyor. Giriş sayfasına yönlendirileceksiniz.')) {
            window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.pathname);
        } else {
            window.location.href = '../index.html';
        }
        return;
    }

    // Get module name from URL
    const moduleFile = window.location.pathname.split('/').pop();
    const moduleName = moduleFile.replace('.html', '');
    
    // Determine module level and category from module name
    let moduleLevel = 'beginner';
    let category = 'cybersecurity';
    
    // Map module names to levels
    const beginnerModules = [
        'temel-siber-guvenlik',
        'temel-network',
        'isletim-sistemi-guvenligi-temel',
        'temel-kriptografi',
        'sosyal-muhendislik-giris'
    ];
    
    const intermediateModules = [
        'network-guvenligi',
        'web-uygulama-guvenligi',
        'malware-analizi',
        'soc',
        'isletim-sistemi-guvenligi-ileri',
        'temel-cloud-security'
    ];
    
    const advancedModules = [
        'ileri-malware-analizi',
        'incident-response',
        'ileri-kriptografi',
        'cloud-security-ileri',
        'penetration-testing',
        'threat-hunting'
    ];
    
    if (beginnerModules.some(m => moduleName.includes(m))) {
        moduleLevel = 'beginner';
    } else if (intermediateModules.some(m => moduleName.includes(m))) {
        moduleLevel = 'intermediate';
    } else if (advancedModules.some(m => moduleName.includes(m))) {
        moduleLevel = 'advanced';
    }
    
    // Check access
    if (window.AccessControl) {
        const accessCheck = await window.AccessControl.checkModuleAccess(moduleLevel, category);
        
        if (!accessCheck.hasAccess) {
            const levelNames = {
                beginner: 'Temel',
                intermediate: 'Orta',
                advanced: 'İleri'
            };
            
            // Show blocking overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            `;
            overlay.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 24px;
                    padding: 3rem;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                ">
                    <div style="
                        width: 100px;
                        height: 100px;
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 2rem;
                        color: white;
                        font-size: 3rem;
                    ">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2 style="
                        font-family: 'Space Grotesk', sans-serif;
                        font-size: 2rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 1rem;
                    ">Erişim Engellendi</h2>
                    <p style="
                        color: #64748b;
                        line-height: 1.6;
                        margin-bottom: 2rem;
                        font-size: 1.1rem;
                    ">
                        ${accessCheck.message}
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="../pricing.html?category=${category}&level=${moduleLevel}" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 12px;
                            padding: 1rem 2rem;
                            font-size: 1rem;
                            font-weight: 600;
                            text-decoration: none;
                            transition: all 0.3s ease;
                            display: inline-block;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(102, 126, 234, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <i class="fas fa-shopping-cart"></i> Paketleri Görüntüle
                        </a>
                        <button onclick="window.location.href='../modules.html'" style="
                            background: #e2e8f0;
                            color: #475569;
                            border: none;
                            border-radius: 12px;
                            padding: 1rem 2rem;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='#cbd5e0'" onmouseout="this.style.background='#e2e8f0'">
                            Modüllere Dön
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            // Redirect after 5 seconds if user doesn't click
            setTimeout(() => {
                window.location.href = `../pricing.html?category=${category}&level=${moduleLevel}`;
            }, 5000);
            
            return;
        }
    } else {
        console.error('AccessControl not available');
    }
})();

