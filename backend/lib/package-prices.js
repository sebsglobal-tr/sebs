/** Canonical package prices (TRY) — must match pricing.html */
const PACKAGE_PRICES = {
    cybersecurity: { beginner: 199, intermediate: 349, advanced: 799 },
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

function getExpectedPrice(category, level) {
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
    const price = cat[lvl];
    return price != null ? Number(price) : null;
}

module.exports = {
    PACKAGE_PRICES,
    ROAD_STAGE_TO_LEVEL,
    normalizeLevel,
    getExpectedPrice
};
