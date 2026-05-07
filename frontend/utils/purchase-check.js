
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

async function hasPurchased(category, level) {
    const purchases = await getUserPurchases();
    return purchases.some(p => p.category === category && p.level === level);
}

async function canAccessLevel(category, requiredLevel) {
    const purchases = await getUserPurchases();
    return purchases.some(p => p.category === category && p.level === requiredLevel);
}

async function getUserCategoryLevel(category) {
    const purchases = await getUserPurchases();
    const categoryPurchases = purchases.filter(p => p.category === category);
    
    if (categoryPurchases.length === 0) {
        return null;
    }
    
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

window.PurchaseCheck = {
    getUserPurchases,
    hasPurchased,
    canAccessLevel,
    getUserCategoryLevel
};

