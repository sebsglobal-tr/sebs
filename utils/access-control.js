/**
 * Access Control Utility
 * Controls module and simulation access based on user's purchased access level from database
 */

// Prevent multiple script loads
if (typeof window.AccessControlLoaded === 'undefined') {
    window.AccessControlLoaded = true;

// Cache for user purchases
let userPurchasesCache = null;
let purchasesCacheTime = 0;
const PURCHASES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get user purchases from API (with caching)
 * @returns {Promise<Array>} Array of purchases
 */
async function fetchUserPurchases() {
    const now = Date.now();
    if (userPurchasesCache && (now - purchasesCacheTime) < PURCHASES_CACHE_DURATION) {
        return userPurchasesCache;
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return [];
        }

        const response = await fetch('http://localhost:8006/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();
        if (result.success && result.data.purchases) {
            userPurchasesCache = result.data.purchases;
            purchasesCacheTime = now;
            return userPurchasesCache;
        }

        return [];
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        return [];
    }
}

/**
 * Get user access level from database (NO localStorage fallback)
 * @returns {Promise<string>} Access level: 'beginner', 'intermediate', or 'advanced'
 */
async function getUserAccessLevel() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return 'beginner';
    }

    try {
        const response = await fetch('http://localhost:8006/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                return result.data.accessLevel || 'beginner';
            }
        }
    } catch (error) {
        console.error('Error fetching access level:', error);
    }
    
    return 'beginner';
}

/**
 * Check if user has access to a specific level in a category
 * @param {string} requiredLevel - Required level: 'beginner', 'intermediate', or 'advanced'
 * @param {string} category - Category: 'cybersecurity', 'cloud', 'data-science' (optional)
 * @returns {Promise<boolean>} True if user has access
 */
async function hasAccess(requiredLevel, category = null) {
    // If not logged in, no access
    const token = localStorage.getItem('authToken');
    if (!token) {
        return false;
    }

    // Get purchases from database
    const purchases = await fetchUserPurchases();
    
    if (purchases.length === 0) {
        return false;
    }

    // If category is specified, check purchases for that category
    if (category) {
        const categoryPurchase = purchases.find(p => 
            p.category === category && p.level === requiredLevel
        );
        return !!categoryPurchase;
    }

    // If no category specified, check if user has purchased this level in any category
    // For now, we'll check if user has the level in cybersecurity (main category)
    const hasPurchase = purchases.some(p => 
        p.category === 'cybersecurity' && p.level === requiredLevel
    );
    
    if (hasPurchase) {
        return true;
    }

    // Fallback to database access level
    const userLevel = await getUserAccessLevel();
    return userLevel === requiredLevel;
}

/**
 * Get module level from module data or URL
 * @param {string} moduleName - Module name or identifier
 * @returns {string} Module level
 */
function getModuleLevel(moduleName) {
    // Map module names to levels (cybersecurity modules)
    const moduleLevels = {
        // Beginner
        'temel-siber-guvenlik': 'beginner',
        'temel-network': 'beginner',
        'isletim-sistemi-guvenligi-temel': 'beginner',
        'temel-kriptografi': 'beginner',
        'sosyal-muhendislik-giris': 'beginner',
        
        // Intermediate
        'network-guvenligi': 'intermediate',
        'web-uygulama-guvenligi': 'intermediate',
        'malware-analizi': 'intermediate',
        'soc': 'intermediate',
        'isletim-sistemi-guvenligi-ileri': 'intermediate',
        'temel-cloud-security': 'intermediate',
        
        // Advanced
        'ileri-malware-analizi': 'advanced',
        'incident-response': 'advanced',
        'ileri-kriptografi': 'advanced',
        'cloud-security-ileri': 'advanced',
        'penetration-testing': 'advanced',
        'threat-hunting': 'advanced'
    };

    // Try to find in map
    for (const [key, level] of Object.entries(moduleLevels)) {
        if (moduleName.toLowerCase().includes(key)) {
            return level;
        }
    }

    // Default to beginner if not found
    return 'beginner';
}

/**
 * Check if user can access a module
 * @param {string} moduleNameOrLevel - Module name or level ('beginner', 'intermediate', 'advanced')
 * @param {string} category - Category (optional, defaults to 'cybersecurity')
 * @returns {Promise<object>} { hasAccess: boolean, message: string }
 */
async function checkModuleAccess(moduleNameOrLevel, category = 'cybersecurity') {
    // If moduleNameOrLevel is already a level, use it directly
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

/**
 * Check if user can access a simulation
 * @param {string} simulationName - Simulation name or identifier
 * @param {string} category - Category (optional, defaults to 'cybersecurity')
 * @returns {Promise<object>} { hasAccess: boolean, message: string }
 */
async function checkSimulationAccess(simulationName, category = 'cybersecurity') {
    // For now, simulations follow the same level structure as modules
    // Beginner simulations for beginner access, etc.
    const simulationLevel = getModuleLevel(simulationName);
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

/**
 * Show access denied modal
 * @param {string} message - Custom message
 */
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

// Export for use in modules
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

