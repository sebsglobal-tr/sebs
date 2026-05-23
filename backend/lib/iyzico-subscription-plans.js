const { ROAD_STAGE_TO_LEVEL } = require('./package-prices');

/** iyzico panelindeki ödeme planı referans kodları (env ile override edilebilir). */
const DEFAULT_PLAN_REFS = {
    'ilk-adim': 'dc2edf07-5cba-40ea-97c3-ba82c8a6c20c',
    yukselis: '1e9caf79-c742-4d10-a142-83cdf9f8d163',
    zirve: '47530f5e-0bbf-418a-990a-97f2cfe1eb7e'
};

const DEFAULT_PRODUCT_REF = '216d9563-f6a4-4300-972d-34af5162fc30';

const ROAD_SLUGS = new Set(['ilk-adim', 'yukselis', 'zirve']);

function subscriptionPeriodDays() {
    const n = parseInt(process.env.SUBSCRIPTION_PERIOD_DAYS, 10);
    return Number.isFinite(n) && n > 0 ? n : 30;
}

function isSubscriptionEnabled() {
    if (process.env.IYZICO_SUBSCRIPTION_ENABLED === '0') return false;
    return Boolean(getPricingPlanRef('ilk-adim'));
}

function getPricingPlanRef(packageSlug) {
    const envKey = {
        'ilk-adim': 'IYZICO_PLAN_ILK_ADIM',
        yukselis: 'IYZICO_PLAN_YUKSELIS',
        zirve: 'IYZICO_PLAN_ZIRVE'
    }[packageSlug];
    if (envKey && process.env[envKey]) {
        return String(process.env[envKey]).trim();
    }
    return DEFAULT_PLAN_REFS[packageSlug] || null;
}

function getProductReferenceCode() {
    return (
        (process.env.IYZICO_SUBSCRIPTION_PRODUCT_REF || '').trim() || DEFAULT_PRODUCT_REF
    );
}

function planRefToPackageSlug(planRef) {
    if (!planRef) return null;
    for (const slug of ROAD_SLUGS) {
        if (getPricingPlanRef(slug) === planRef) return slug;
    }
    return null;
}

function planRefToLevel(planRef) {
    const slug = planRefToPackageSlug(planRef);
    return slug ? ROAD_STAGE_TO_LEVEL[slug] : null;
}

function isRoadSubscriptionSlug(slug) {
    return ROAD_SLUGS.has(slug);
}

function shouldUseSubscription(packageSlug) {
    return isRoadSubscriptionSlug(packageSlug) && isSubscriptionEnabled();
}

module.exports = {
    ROAD_SLUGS,
    subscriptionPeriodDays,
    isSubscriptionEnabled,
    getPricingPlanRef,
    getProductReferenceCode,
    planRefToPackageSlug,
    planRefToLevel,
    isRoadSubscriptionSlug,
    shouldUseSubscription
};
