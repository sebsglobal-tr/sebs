const {
    getModuleLevel,
    getCategoryFromSlug,
    isFreeModule,
    meetsRequiredLevel
} = require('./module-catalog');

async function fetchActivePurchases(pool, userId) {
    let purchases = [];
    try {
        const r = await pool.query(
            `SELECT category, level FROM purchases
             WHERE user_id = $1 AND is_active = TRUE
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
            [userId]
        );
        purchases = r.rows.map((p) => ({ category: p.category, level: p.level }));
    } catch (e) {
        /* table may not exist */
    }
    try {
        const r2 = await pool.query(
            `SELECT category, level FROM user_package_purchases
             WHERE user_id = $1 AND is_active = TRUE
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
            [userId]
        );
        for (const p of r2.rows) {
            if (!purchases.some((x) => x.category === p.category && x.level === p.level)) {
                purchases.push({ category: p.category, level: p.level });
            }
        }
    } catch (e) {
        /* ignore */
    }
    return purchases;
}

/**
 * @param {{ userId: string, email?: string, role?: string, accessLevel?: string } | null} user
 */
async function userCanAccessModule(pool, user, slug, fullAccessEmail) {
    if (isFreeModule(slug)) {
        return { allowed: true };
    }

    if (!user || !user.userId) {
        return { allowed: false, reason: 'login' };
    }

    const email = (user.email || '').toLowerCase().trim();
    const superEmail = (fullAccessEmail || '').toLowerCase().trim();
    if (user.role === 'admin' || (superEmail && email === superEmail)) {
        return { allowed: true };
    }

    const requiredLevel = getModuleLevel(slug);
    const category = getCategoryFromSlug(slug);
    const purchases = await fetchActivePurchases(pool, user.userId);

    const direct = purchases.find((p) => p.category === category && p.level === requiredLevel);
    if (direct) return { allowed: true };

    const accessLevel = user.accessLevel || 'beginner';
    if (meetsRequiredLevel(accessLevel, requiredLevel)) {
        return { allowed: true };
    }

    return { allowed: false, reason: 'purchase', category, level: requiredLevel };
}

module.exports = { fetchActivePurchases, userCanAccessModule };
