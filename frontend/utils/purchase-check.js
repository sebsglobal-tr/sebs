/**
 * ============================================
 * SATIN ALMA KONTROL YARDIMCI FONKSİYONU
 * ============================================
 * Kullanıcının satın alımlarını veritabanından API üzerinden kontrol eder
 */

/**
 * API'den kullanıcının satın alımlarını getir
 * @returns {Promise<Array>} Kullanıcı satın alımları dizisi
 */
async function getUserPurchases() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return [];
        }

        const apiBase =
            typeof window.getSebsApiBase === 'function'
                ? window.getSebsApiBase()
                : (typeof window !== 'undefined' && window.location && window.location.origin
                      ? window.location.origin + '/api'
                      : 'http://localhost:8006/api');
        const response = await fetch(apiBase + '/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();
        if (result.success && result.data.purchases) {
            return result.data.purchases;
        }

        return [];
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        return [];
    }
}

/**
 * Check if user has purchased a specific package
 * @param {string} category - Category: 'cybersecurity', 'cloud', 'data-science'
 * @param {string} level - Level: 'beginner', 'intermediate', 'advanced'
 * @returns {Promise<boolean>} True if user has purchased
 */
async function hasPurchased(category, level) {
    const purchases = await getUserPurchases();
    return purchases.some(p => p.category === category && p.level === level);
}

/**
 * Check if user can access a specific level in a category
 * @param {string} category - Category
 * @param {string} requiredLevel - Required level
 * @returns {Promise<boolean>} True if user can access
 */
async function canAccessLevel(category, requiredLevel) {
    const purchases = await getUserPurchases();
    // User can access if they have purchased the exact level in this category
    return purchases.some(p => p.category === category && p.level === requiredLevel);
}

/**
 * Get user's access level for a specific category
 * @param {string} category - Category
 * @returns {Promise<string|null>} User's access level or null
 */
async function getUserCategoryLevel(category) {
    const purchases = await getUserPurchases();
    const categoryPurchases = purchases.filter(p => p.category === category);
    
    if (categoryPurchases.length === 0) {
        return null;
    }
    
    // Return the highest level purchased
    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    let highestLevel = 'beginner';
    let highestValue = 0;
    
    categoryPurchases.forEach(p => {
        const value = levelHierarchy[p.level] || 0;
        if (value > highestValue) {
            highestValue = value;
            highestLevel = p.level;
        }
    });
    
    return highestLevel;
}

// Export for use in modules
window.PurchaseCheck = {
    getUserPurchases,
    hasPurchased,
    canAccessLevel,
    getUserCategoryLevel
};

