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

/** Sandbox test fiyatları (TRY) */
const TEST_ODEME_PRICE = 2;
const TEST_PACKAGE_PRICES = {
    cybersecurity: { beginner: 1, intermediate: 3, advanced: 5 },
    'sebs-road': {
        'ilk-adim': 1,
        beginner: 1,
        yukselis: 3,
        intermediate: 3,
        zirve: 5,
        advanced: 5
    },
    'test-odeme': { 'test-odeme': TEST_ODEME_PRICE }
};

function isTestPaymentMode() {
    const flag = String(process.env.IYZICO_TEST_MODE || '').toLowerCase();
    return flag === '1' || flag === 'true';
}

/** Canlıda tek paket testi: Render → IYZICO_ZIRVE_TEST_PRICE=5 (test bitince silin) */
function getZirveTestPriceOverride() {
    const raw = String(process.env.IYZICO_ZIRVE_TEST_PRICE || '').trim();
    if (!raw) return null;
    const n = Number(raw);
    if (Number.isNaN(n) || n <= 0 || n > 999999.99) return null;
    return n;
}

function isZirveLevel(level) {
    const lvl = normalizeLevel(level);
    return lvl === 'advanced' || level === 'zirve';
}

const ROAD_STAGE_TO_LEVEL = {
    'ilk-adim': 'beginner',
    yukselis: 'intermediate',
    zirve: 'advanced'
};

function normalizeLevel(level) {
    if (ROAD_STAGE_TO_LEVEL[level]) return ROAD_STAGE_TO_LEVEL[level];
    return level;
}

function getExpectedPrice(category, level) {
    const zirveOverride = getZirveTestPriceOverride();
    if (zirveOverride != null && isZirveLevel(level)) {
        return zirveOverride;
    }

    if (isTestPaymentMode()) {
        if (category === 'test-odeme' || level === 'test-odeme') {
            return TEST_ODEME_PRICE;
        }
        const testCat = TEST_PACKAGE_PRICES[category] || TEST_PACKAGE_PRICES.cybersecurity;
        const testLvl = normalizeLevel(level);
        const testPrice = testCat[level] != null ? testCat[level] : testCat[testLvl];
        if (testPrice != null) return Number(testPrice);
    }

    let prices = PACKAGE_PRICES;
    try {
        const { getPricesSync } = require('./pricing-store');
        prices = getPricesSync();
    } catch {
        /* defaults */
    }
    const cat = prices[category];
    if (!cat) return null;
    const lvl = normalizeLevel(level);
    const price = cat[level] != null ? cat[level] : cat[lvl];
    return price != null ? Number(price) : null;
}

function getRoadPackageDisplayPrice(slug, packages) {
    const zirveOverride = getZirveTestPriceOverride();
    if (slug === 'zirve' && zirveOverride != null) return zirveOverride;

    if (isTestPaymentMode()) {
        const test = TEST_PACKAGE_PRICES['sebs-road'] || TEST_PACKAGE_PRICES.cybersecurity;
        if (slug === 'ilk-adim') return test['ilk-adim'] || test.beginner;
        if (slug === 'yukselis') return test.yukselis || test.intermediate;
        if (slug === 'zirve') return test.zirve || test.advanced;
    }

    const p = packages || PACKAGE_PRICES;
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
    TEST_PACKAGE_PRICES,
    TEST_ODEME_PRICE,
    ROAD_STAGE_TO_LEVEL,
    normalizeLevel,
    getExpectedPrice,
    getZirveTestPriceOverride,
    getRoadPackageDisplayPrice,
    isTestPaymentMode,
    getRoadPackageLabel
};
