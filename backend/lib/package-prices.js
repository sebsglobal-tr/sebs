/** Canonical package prices (TRY) — must match pricing.html */
const PACKAGE_PRICES = {
    cybersecurity: { beginner: 199, intermediate: 349, advanced: 799 },
    'sebs-road': {
        'ilk-adim': 199,
        beginner: 199,
        yukselis: 349,
        intermediate: 349,
        zirve: 799,
        advanced: 799
    },
    cloud: { beginner: 249, intermediate: 449, advanced: 899 },
    'data-science': { beginner: 199, intermediate: 399, advanced: 749 },
    'single-stop': { 'single-stop': 120 }
};

const ROAD_STAGE_TO_LEVEL = {
    'ilk-adim': 'beginner',
    yukselis: 'intermediate',
    zirve: 'advanced'
};

function normalizeLevel(level) {
    if (ROAD_STAGE_TO_LEVEL[level]) return ROAD_STAGE_TO_LEVEL[level];
    return level;
}

/** Canlı test: Render env TEST_PRICE_YUKSELIS=5 gibi (deploy sonrası kaldırın). */
function getTestPriceOverride(slugOrLevel) {
    const envKey = {
        'ilk-adim': 'TEST_PRICE_ILK_ADIM',
        beginner: 'TEST_PRICE_ILK_ADIM',
        yukselis: 'TEST_PRICE_YUKSELIS',
        intermediate: 'TEST_PRICE_YUKSELIS',
        zirve: 'TEST_PRICE_ZIRVE',
        advanced: 'TEST_PRICE_ZIRVE'
    }[slugOrLevel];
    if (!envKey) return null;
    const raw = process.env[envKey];
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
}

function applyTestPriceOverrides(prices) {
    const out = JSON.parse(JSON.stringify(prices || PACKAGE_PRICES));
    for (const slug of ['ilk-adim', 'yukselis', 'zirve']) {
        const override = getTestPriceOverride(slug);
        if (override == null) continue;
        if (!out['sebs-road']) out['sebs-road'] = {};
        out['sebs-road'][slug] = override;
        const lvl = ROAD_STAGE_TO_LEVEL[slug];
        if (lvl) out['sebs-road'][lvl] = override;
        if (!out.cybersecurity) out.cybersecurity = {};
        out.cybersecurity[lvl] = override;
    }
    return out;
}

function getExpectedPrice(category, level) {
    let prices = PACKAGE_PRICES;
    try {
        const { getPricesSync } = require('./pricing-store');
        prices = getPricesSync();
    } catch {
        /* defaults */
    }
    prices = applyTestPriceOverrides(prices);
    const cat = prices[category];
    if (!cat) return null;
    const lvl = normalizeLevel(level);
    const price = cat[level] != null ? cat[level] : cat[lvl];
    return price != null ? Number(price) : null;
}

function getRoadPackageDisplayPrice(slug, packages) {
    const p = applyTestPriceOverrides(packages || PACKAGE_PRICES);
    const direct = getTestPriceOverride(slug);
    if (direct != null) return direct;
    const cyber = p.cybersecurity || p['sebs-road'] || {};
    if (slug === 'ilk-adim') return cyber.beginner ?? cyber['ilk-adim'] ?? 199;
    if (slug === 'yukselis') return cyber.intermediate ?? cyber.yukselis ?? 349;
    if (slug === 'zirve') return cyber.advanced ?? cyber.zirve ?? 799;
    return null;
}

function getRoadPackageLabel(slug) {
    const labels = {
        'ilk-adim': 'İlk Adım',
        yukselis: 'Yükseliş',
        zirve: 'Zirve'
    };
    return labels[slug] || slug;
}

module.exports = {
    PACKAGE_PRICES,
    ROAD_STAGE_TO_LEVEL,
    normalizeLevel,
    getTestPriceOverride,
    applyTestPriceOverrides,
    getExpectedPrice,
    getRoadPackageDisplayPrice,
    getRoadPackageLabel
};
