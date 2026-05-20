
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

function getMaxPurchaseRank(purchases, category) {
    const cat = category || 'cybersecurity';
    let max = -1;
    for (const p of purchases || []) {
        const matchCat =
            p.category === cat ||
            (cat === 'cybersecurity' &&
                (p.category === 'cybersecurity' || p.category === 'sebs-road'));
        if (!matchCat) continue;
        max = Math.max(max, levelRank(p.level));
    }
    return max;
}

function userMeetsTierForLevel(purchases, requiredLevel, category) {
    const maxRank = getMaxPurchaseRank(purchases, category);
    if (maxRank < 0) return false;
    return levelRank(requiredLevel) <= maxRank;
}

async function hasAccess(requiredLevel, category = 'cybersecurity') {
    const token = getBearerTokenFromStorage();
    if (!token) {
        return false;
    }

    const user = await fetchUserMe();
    if (user && (user.role === 'admin' || (user.email && user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL))) {
        return true;
    }

    const purchases = await fetchUserPurchases();

    if (purchases.length > 0) {
        return userMeetsTierForLevel(purchases, requiredLevel, category);
    }

    if (!isLocalDevAccess()) {
        return false;
    }

    const userLevel = await getUserAccessLevel();
    return userMeetsRequiredLevel(userLevel, requiredLevel);
}

const SIMULATION_PATH_LEVELS = [
    ['sessiz-tekrar-lasfin', 'advanced'],
    ['ileri-kriptografi-simulasyonlari', 'advanced'],
    ['penetration-testing', 'advanced'],
    ['threat-hunting', 'advanced'],
    ['incident-response', 'advanced'],
    ['isletim-sistemi-guvenligi-ileri', 'intermediate'],
    ['gece-acilan-kapi', 'intermediate'],
    ['sessiz-birakilan-dosya', 'intermediate'],
    ['malware-analizi', 'intermediate'],
    ['network-guvenligi', 'intermediate'],
    ['misafir-agini', 'intermediate'],
    ['terminalden-trafik', 'intermediate'],
    ['lunabox-teslimat', 'beginner'],
    ['orion-gece-alarmi', 'beginner'],
    ['temel-kriptografi-simulasyonlari', 'beginner'],
    ['temel-network-simulasyonlari', 'beginner'],
    ['temel-network-misafir', 'beginner'],
    ['sosyal-muhendislik', 'beginner'],
    ['isletim-sistemi-guvenligi-simulasyonlari', 'beginner'],
    ['guvenli-is-istasyonu', 'beginner'],
    ['linux-forensik-lab', 'beginner'],
    ['kayit-haftasi-krizi', 'beginner'],
    ['bir-seyler-yanlis', 'beginner'],
    ['semptom-etki-zinciri', 'beginner'],
    ['temel-siber-guvenlik', 'beginner'],
    ['siber-guvenlige-giris', 'beginner'],
    ['web-app-security', 'intermediate']
];

function getSimulationLevelFromPath(pathOrSlug) {
    const s = String(pathOrSlug || '').toLowerCase();
    for (const [fragment, level] of SIMULATION_PATH_LEVELS) {
        if (s.includes(fragment)) return level;
    }
    return getModuleLevel(s);
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

async function checkAssessmentAccess() {
    const token = getBearerTokenFromStorage();
    if (!token) {
        return {
            hasAccess: false,
            message: 'Big Five ve kariyer testleri için giriş yapıp İlk Adım veya üst bir plan satın almanız gerekir.'
        };
    }
    const user = await fetchUserMe();
    if (user && (user.role === 'admin' || (user.email && user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL))) {
        return { hasAccess: true, message: '' };
    }
    const purchases = await fetchUserPurchases();
    const maxRank = getMaxPurchaseRank(purchases, 'cybersecurity');
    if (maxRank < 0) {
        return {
            hasAccess: false,
            message:
                'Big Five ve kariyer değerlendirme testleri İlk Adım planı veya üst paketlerle açılır. Fiyatlandırma sayfasından plan seçebilirsiniz.'
        };
    }
    return { hasAccess: true, message: '' };
}

async function checkSimulationAccess(simulationNameOrLevel, category = 'cybersecurity') {
    let simulationLevel;
    const raw = String(simulationNameOrLevel || '').toLowerCase();
    if (['beginner', 'intermediate', 'advanced'].includes(raw)) {
        simulationLevel = raw;
    } else {
        simulationLevel = getSimulationLevelFromPath(simulationNameOrLevel);
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

function showAccessDeniedModal(message = '') {
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
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                    ${message || 'Bu içeriğe erişim için uygun paketi satın almanız gerekiyor.'}
                </p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <a href="pricing.html" style="
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
                        <i class="fas fa-shopping-cart"></i> Paketleri Görüntüle
                    </a>
                    <button onclick="document.getElementById('accessDeniedModal').remove()" style="
                        background: #e2e8f0;
                        color: #475569;
                        border: none;
                        border-radius: 12px;
                        padding: 12px 24px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#cbd5e0'" onmouseout="this.style.background='#e2e8f0'">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function clearPurchasesCache() {
    userPurchasesCache = null;
    purchasesCacheTime = 0;
    userMeCache = null;
    userMeCacheTime = 0;
    userMePromise = null;
}

window.AccessControl = {
    getUserAccessLevel,
    hasAccess,
    getModuleLevel,
    getSimulationLevelFromPath,
    checkModuleAccess,
    checkSimulationAccess,
    checkAssessmentAccess,
    showAccessDeniedModal,
    fetchUserPurchases,
    clearPurchasesCache
};

} // End of AccessControlLoaded check

