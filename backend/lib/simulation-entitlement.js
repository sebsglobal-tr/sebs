const { getSimulationLevelFromPath, userMeetsTierForLevel, isFreeSimulation } = require('./sebs-road-catalog');
const { fetchActivePurchases } = require('./module-entitlement');

async function userCanAccessSimulation(pool, user, pathOrSlug, fullAccessEmail) {
    if (isFreeSimulation(pathOrSlug)) {
        return { allowed: true, reason: 'free' };
    }

    if (!user || !user.userId) {
        return { allowed: false, reason: 'login' };
    }

    const email = (user.email || '').toLowerCase().trim();
    const superEmail = (fullAccessEmail || '').toLowerCase().trim();
    if (user.role === 'admin' || (superEmail && email === superEmail)) {
        return { allowed: true };
    }

    const requiredLevel = getSimulationLevelFromPath(pathOrSlug);
    const purchases = await fetchActivePurchases(pool, user.userId);

    if (userMeetsTierForLevel(purchases, requiredLevel, 'cybersecurity')) {
        return { allowed: true, level: requiredLevel };
    }

    return { allowed: false, reason: 'purchase', level: requiredLevel };
}

module.exports = { userCanAccessSimulation };
