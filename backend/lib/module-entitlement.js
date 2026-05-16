/**
 * Sunucu tarafı modül / paket erişim doğrulaması (progress, quiz, simülasyon).
 */
const FULL_ACCESS_EMAIL = 'asasferfer4566@gmail.com';

const MODULES_NOT_LIVE = new Set([
    'coming-soon',
    'web-uygulama-guvenligi',
    'web-app-security',
    'aws-temelleri',
    'azure-cloud',
    'gcp',
    'ag-guvenligi',
    'temel-siber-guvenlik'
]);

const SLUG_LEVEL = {
    'guncel-siber-guvenlige-giris': 'beginner',
    'temel-siber-guvenlik': 'beginner',
    'temel-network-egitimi': 'beginner',
    'temel-network': 'beginner',
    'isletim-sistemi-guvenligi': 'beginner',
    'temel-kriptografi': 'beginner',
    'sosyal-muhendislik': 'beginner',
    'sosyal-muhendislik-giris': 'beginner',
    'network-guvenligi': 'intermediate',
    'web-uygulama-guvenligi': 'intermediate',
    'malware-analizi': 'intermediate',
    soc: 'intermediate',
    'isletim-sistemi-guvenligi-ileri': 'intermediate',
    'ileri-malware-analizi': 'advanced',
    'incident-response': 'advanced',
    'ileri-kriptografi': 'advanced',
    'penetration-testing': 'advanced',
    'threat-hunting': 'advanced',
    'aws-temelleri': 'beginner',
    'azure-cloud': 'intermediate',
    gcp: 'intermediate'
};

const NAME_HINTS = [
    ['siber güvenliğe giriş', 'guncel-siber-guvenlige-giris'],
    ['siber guvenlige giris', 'guncel-siber-guvenlige-giris'],
    ['temel network', 'temel-network-egitimi'],
    ['işletim sistem', 'isletim-sistemi-guvenligi'],
    ['isletim sistem', 'isletim-sistemi-guvenligi'],
    ['temel kripto', 'temel-kriptografi'],
    ['sosyal mühendis', 'sosyal-muhendislik'],
    ['network güven', 'network-guvenligi'],
    ['malware', 'malware-analizi'],
    ['olay müdahale', 'incident-response'],
    ['incident', 'incident-response'],
    ['ileri kripto', 'ileri-kriptografi'],
    ['pentest', 'penetration-testing'],
    ['penetration', 'penetration-testing'],
    ['threat', 'threat-hunting'],
    ['aws', 'aws-temelleri'],
    ['azure', 'azure-cloud'],
    ['google cloud', 'gcp']
];

function levelRank(level) {
    const order = { beginner: 0, intermediate: 1, advanced: 2 };
    const k = String(level || 'beginner').toLowerCase();
    return order[k] != null ? order[k] : 0;
}

function normalizeSlug(raw) {
    return String(raw || '')
        .toLowerCase()
        .replace(/\.html$/, '')
        .replace(/^\/modules\//, '')
        .trim();
}

function slugFromModuleName(name) {
    const n = String(name || '').toLowerCase();
    for (const [hint, slug] of NAME_HINTS) {
        if (n.includes(hint)) return slug;
    }
    return '';
}

function categoryForSlug(slug) {
    if (['aws-temelleri', 'azure-cloud', 'gcp'].includes(slug)) return 'cloud';
    return 'cybersecurity';
}

function isStrictPurchaseMode() {
    if (process.env.REQUIRE_PURCHASE_FOR_ACCESS === '1') return true;
    if (process.env.ALLOW_LEGACY_ACCESS_LEVEL === '1') return false;
    return process.env.NODE_ENV === 'production';
}

async function getUserContext(pool, userId) {
    const r = await pool.query(
        'SELECT id, email, role, access_level FROM users WHERE id = $1',
        [userId]
    );
    return r.rows[0] || null;
}

async function getActivePurchases(pool, userId) {
    try {
        const r = await pool.query(
            `SELECT category, level FROM purchases
             WHERE user_id = $1 AND is_active = TRUE
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
            [userId]
        );
        return r.rows;
    } catch (err) {
        return [];
    }
}

async function resolveModuleMeta(pool, { moduleId, moduleName, moduleSlug }) {
    let slug = normalizeSlug(moduleSlug);
    let category = 'cybersecurity';
    let level = 'beginner';
    let title = moduleName || '';

    if (moduleId) {
        try {
            const r = await pool.query(
                `SELECT id, title, slug, category, level FROM modules WHERE id = $1 LIMIT 1`,
                [moduleId]
            );
            if (r.rows[0]) {
                const row = r.rows[0];
                title = row.title || title;
                slug = normalizeSlug(row.slug) || slugFromModuleName(title) || slug;
                category = row.category || categoryForSlug(slug);
                level = row.level || SLUG_LEVEL[slug] || 'beginner';
                return { slug, category, level, title, moduleId: row.id };
            }
        } catch (err) {
            /* modules tablosu yoksa isim/slug ile devam */
        }
    }

    if (!slug && moduleName) slug = slugFromModuleName(moduleName);
    if (!slug && moduleName) {
        slug = normalizeSlug(moduleName.replace(/\s+/g, '-'));
    }
    level = SLUG_LEVEL[slug] || 'beginner';
    category = categoryForSlug(slug);
    return { slug, category, level, title: title || moduleName, moduleId: moduleId || null };
}

function purchaseGrantsAccess(purchases, category, requiredLevel) {
    return purchases.some(
        (p) => p.category === category && levelRank(p.level) >= levelRank(requiredLevel)
    );
}

async function assertModuleEntitlement(pool, userId, opts = {}) {
    const user = await getUserContext(pool, userId);
    if (!user) {
        const err = new Error('Kullanıcı bulunamadı.');
        err.status = 401;
        err.code = 'USER_NOT_FOUND';
        throw err;
    }

    if (user.role === 'admin' || (user.email && user.email.toLowerCase().trim() === FULL_ACCESS_EMAIL)) {
        return { allowed: true, reason: 'admin' };
    }

    const meta = await resolveModuleMeta(pool, opts);

    if (meta.slug && MODULES_NOT_LIVE.has(meta.slug)) {
        const err = new Error('Bu modül henüz yayında değil.');
        err.status = 403;
        err.code = 'MODULE_NOT_LIVE';
        throw err;
    }

    const purchases = await getActivePurchases(pool, userId);

    if (purchaseGrantsAccess(purchases, meta.category, meta.level)) {
        return { allowed: true, reason: 'purchase', meta };
    }

    if (!isStrictPurchaseMode()) {
        const userLevel = user.access_level || 'beginner';
        if (levelRank(userLevel) >= levelRank(meta.level)) {
            return { allowed: true, reason: 'legacy_access_level', meta };
        }
    }

    const err = new Error(
        `${meta.category === 'cloud' ? 'Bulut' : 'Siber güvenlik'} paketinde ${meta.level} seviye erişimi gerekli.`
    );
    err.status = 403;
    err.code = 'PACKAGE_REQUIRED';
    err.meta = meta;
    throw err;
}

function sendEntitlementError(res, err) {
    return res.status(err.status || 403).json({
        success: false,
        code: err.code || 'PACKAGE_REQUIRED',
        message: err.message || 'Erişim reddedildi.'
    });
}

async function requireModuleEntitlement(pool, res, userId, opts = {}) {
    try {
        await assertModuleEntitlement(pool, userId, opts);
        return true;
    } catch (err) {
        sendEntitlementError(res, err);
        return false;
    }
}

module.exports = {
    assertModuleEntitlement,
    requireModuleEntitlement,
    sendEntitlementError,
    resolveModuleMeta,
    MODULES_NOT_LIVE,
    isStrictPurchaseMode
};
