
if (typeof window.AccessControlLoaded === 'undefined') {
    window.AccessControlLoaded = true;

let userPurchasesCache = null;
let purchasesCacheTime = 0;
let userMeCache = null;
let userMeCacheTime = 0;
let userMePromise = null;
const PURCHASES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getBearerTokenFromStorage() {
    let token = localStorage.getItem('authToken');
    if (token) return token;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const data = JSON.parse(raw);
            const at =
                data?.access_token ||
                data?.session?.access_token ||
                data?.currentSession?.access_token;
            if (at && typeof at === 'string' && at.length > 20) {
                return at;
            }
        }
    } catch (e) {
    }
    return null;
}

function levelRank(level) {
    const order = { beginner: 0, intermediate: 1, advanced: 2 };
    const k = String(level || 'beginner').toLowerCase();
    return order[k] != null ? order[k] : 0;
}

function userMeetsRequiredLevel(userLevel, requiredLevel) {
    return levelRank(userLevel) >= levelRank(requiredLevel);
}

async function fetchUserPurchases() {
    const now = Date.now();
    if (userPurchasesCache && (now - purchasesCacheTime) < PURCHASES_CACHE_DURATION) {
        return userPurchasesCache;
    }

    try {
        const user = await fetchUserMe();
        if (user && Array.isArray(user.purchases)) {
            userPurchasesCache = user.purchases;
            purchasesCacheTime = now;
            return userPurchasesCache;
        }

        return [];
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        return [];
    }
}

async function fetchUserMe() {
    const now = Date.now();
    if (userMeCache && (now - userMeCacheTime) < PURCHASES_CACHE_DURATION) {
        return userMeCache;
    }
    if (userMePromise) {
        return userMePromise;
    }

    const token = getBearerTokenFromStorage();
    if (!token) {
        return null;
    }

    const apiBase =
        typeof window.getSebsApiBase === 'function'
            ? window.getSebsApiBase()
            : (window.location && window.location.origin ? window.location.origin + '/api' : 'http://localhost:8006/api');
    userMePromise = fetch(apiBase + '/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(result => {
            if (result && result.success && result.data) {
                userMeCache = result.data;
                userMeCacheTime = now;
                return userMeCache;
            }
            return null;
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            return null;
        })
        .finally(() => {
            userMePromise = null;
        });

    return userMePromise;
}

async function getUserAccessLevel() {
    try {
        const user = await fetchUserMe();
        if (user) {
            return user.accessLevel || 'beginner';
        }
    } catch (error) {
        console.error('Error fetching access level:', error);
    }
    
    return 'beginner';
}

const FULL_ACCESS_EMAIL = 'asasferfer4566@gmail.com';

/** Modüller satışta vaat edilir ama henüz içerik yayında değil */
const MODULES_NOT_LIVE = ['web-uygulama-guvenligi', 'web-app-security'];

function isLocalDevAccess() {
    try {
        const h = window.location.hostname;
        return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
    } catch (e) {
        return false;
    }
}

async function hasAccess(requiredLevel, category = null) {
    const token = getBearerTokenFromStorage();
    if (!token) {
        return false;
    }

    const user = await fetchUserMe();
    if (user && (user.role === 'admin' || (user.email && user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL))) {
        return true;
    }

    const purchases = await fetchUserPurchases();

    if (purchases.length === 0) {
        if (!isLocalDevAccess()) {
            return false;
        }
        const userLevel = await getUserAccessLevel();
        return userMeetsRequiredLevel(userLevel, requiredLevel);
    }

    if (category) {
        const categoryPurchase = purchases.find(p => 
            p.category === category && p.level === requiredLevel
        );
        if (categoryPurchase) {
            return true;
        }
        const userLevel = await getUserAccessLevel();
        return userMeetsRequiredLevel(userLevel, requiredLevel);
    }

    const hasPurchase = purchases.some(p => 
        p.category === 'cybersecurity' && p.level === requiredLevel
    );
    
    if (hasPurchase) {
        return true;
    }

    const userLevel = await getUserAccessLevel();
    return userMeetsRequiredLevel(userLevel, requiredLevel);
}

function getModuleLevel(moduleName) {
    const moduleLevels = {
        'guncel-siber-guvenlige-giris': 'beginner',
        'temel-siber-guvenlik': 'beginner',
        'temel-network-egitimi': 'beginner',
        'temel-network': 'beginner',
        'isletim-sistemi-guvenligi-temel': 'beginner',
        'temel-kriptografi': 'beginner',
        'sosyal-muhendislik-giris': 'beginner',
        
        'network-guvenligi': 'intermediate',
        'web-uygulama-guvenligi': 'intermediate',
        'malware-analizi': 'intermediate',
        'soc': 'intermediate',
        'isletim-sistemi-guvenligi-ileri': 'intermediate',
        'temel-cloud-security': 'intermediate',
        
        'ileri-malware-analizi': 'advanced',
        'incident-response': 'advanced',
        'ileri-kriptografi': 'advanced',
        'cloud-security-ileri': 'advanced',
        'penetration-testing': 'advanced',
        'threat-hunting': 'advanced'
    };

    for (const [key, level] of Object.entries(moduleLevels)) {
        if (moduleName.toLowerCase().includes(key)) {
            return level;
        }
    }

    return 'beginner';
}

async function checkModuleAccess(moduleNameOrLevel, category = 'cybersecurity') {
    const rawSlug = String(moduleNameOrLevel || '').toLowerCase();
    if (MODULES_NOT_LIVE.some((key) => rawSlug.includes(key))) {
        return {
            hasAccess: false,
            message:
                'Web Uygulama Güvenliği modülü erken erişim kapsamında yakında yayına alınacaktır. Şimdilik diğer modüllere devam edebilirsiniz.'
        };
    }

    let moduleLevel = moduleNameOrLevel;
    if (!['beginner', 'intermediate', 'advanced'].includes(moduleNameOrLevel)) {
        moduleLevel = getModuleLevel(moduleNameOrLevel);
    }
    
    const userHasAccess = await hasAccess(moduleLevel, category);
    
    if (!userHasAccess) {
        const levelNames = {
            beginner: 'Temel',
            intermediate: 'Orta',
            advanced: 'İleri'
        };
        
        const categoryNames = {
            cybersecurity: 'Siber Güvenlik',
            cloud: 'Bulut Bilişim',
            'data-science': 'Veri Bilimleri'
        };
        
        return {
            hasAccess: false,
            message: `${categoryNames[category] || category} alanında ${levelNames[moduleLevel]} Paketi satın almanız gerekiyor.`
        };
    }
    
    return {
        hasAccess: true,
        message: ''
    };
}

async function checkSimulationAccess(simulationNameOrLevel, category = 'cybersecurity') {
    let simulationLevel;
    const raw = String(simulationNameOrLevel || '').toLowerCase();
    if (['beginner', 'intermediate', 'advanced'].includes(raw)) {
        simulationLevel = raw;
    } else {
        simulationLevel = getModuleLevel(simulationNameOrLevel);
    }
    const userHasAccess = await hasAccess(simulationLevel, category);
    
    if (!userHasAccess) {
        const levelNames = {
            beginner: 'Temel',
            intermediate: 'Orta',
            advanced: 'İleri'
        };
        
        return {
            hasAccess: false,
            message: `Bu simülasyona erişim için ${levelNames[simulationLevel]} Paketi satın almanız gerekiyor.`
        };
    }
    
    return {
        hasAccess: true,
        message: ''
    };
}

function ensureAccessModalStyles() {
    if (document.querySelector('link[data-sebs-access-modal="1"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/access-modal.css';
    link.setAttribute('data-sebs-access-modal', '1');
    document.head.appendChild(link);
}

function showAccessDeniedModal(message = '') {
    ensureAccessModalStyles();
    const existing = document.getElementById('accessDeniedModal');
    if (existing) existing.remove();

    const safeMessage = String(message || 'Bu içeriğe erişim için uygun paketi satın almanız gerekiyor.')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const modalHTML = `
        <div id="accessDeniedModal" class="sebs-access-overlay" role="dialog" aria-modal="true" aria-labelledby="accessDeniedTitle">
            <div class="sebs-access-dialog">
                <div class="sebs-access-dialog__icon" aria-hidden="true">
                    <i class="fas fa-lock"></i>
                </div>
                <h2 id="accessDeniedTitle" class="sebs-access-dialog__title">Erişim engellendi</h2>
                <p class="sebs-access-dialog__message">${safeMessage}</p>
                <div class="sebs-access-dialog__actions">
                    <a href="/fiyatlandirma" class="sebs-access-dialog__btn sebs-access-dialog__btn--primary">
                        <i class="fas fa-shopping-cart" aria-hidden="true"></i> Paketleri görüntüle
                    </a>
                    <button type="button" class="sebs-access-dialog__btn sebs-access-dialog__btn--ghost" data-access-modal-close>
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const overlay = document.getElementById('accessDeniedModal');
    if (!overlay) return;

    overlay.querySelector('[data-access-modal-close]')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}


window.AccessControl = {
    getUserAccessLevel,
    hasAccess,
    getModuleLevel,
    checkModuleAccess,
    checkSimulationAccess,
    showAccessDeniedModal,
    fetchUserPurchases
};

} // End of AccessControlLoaded check

