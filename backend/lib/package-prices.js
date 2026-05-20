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
    if (flag === '0' || flag === 'false') return false;
    if (flag === '1' || flag === 'true') return true;
    const base = (process.env.IYZICO_BASE_URL || '').toLowerCase();
    return base.includes('sandbox');
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
    isTestPaymentMode,
    getRoadPackageLabel
};
