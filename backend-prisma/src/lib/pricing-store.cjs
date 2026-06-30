const { PACKAGE_PRICES: DEFAULT_PRICES } = require('./package-prices.cjs');

/** @type {Record<string, Record<string, number>>|null} */
let cachedPrices = null;
let cacheTime = 0;
const CACHE_MS = 30_000;

function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_PRICES));
}

function getPricesSync() {
    return cachedPrices || cloneDefaults();
}

/**
 * @param {import('pg').Pool} pool
 */
async function ensureSiteSettingsTable(pool) {
    if (!pool) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.site_settings (
                key VARCHAR(64) PRIMARY KEY,
                value JSONB NOT NULL DEFAULT '{}',
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_by UUID
            )
        `);
        await pool.query(
            `INSERT INTO public.site_settings (key, value)
             VALUES ('package_prices', $1::jsonb)
             ON CONFLICT (key) DO NOTHING`,
            [JSON.stringify(cloneDefaults())]
        );
    } catch (err) {
        console.warn('ensureSiteSettingsTable:', err.message);
    }
}

/**
 * @param {import('pg').Pool} pool
 */
async function loadPackagePrices(pool) {
    if (!pool) {
        cachedPrices = cloneDefaults();
        return cachedPrices;
    }
    await ensureSiteSettingsTable(pool);
    try {
        const r = await pool.query(
            `SELECT value FROM site_settings WHERE key = 'package_prices' LIMIT 1`
        );
        if (r.rows[0] && r.rows[0].value && typeof r.rows[0].value === 'object') {
            cachedPrices = { ...cloneDefaults(), ...r.rows[0].value };
            cacheTime = Date.now();
            return cachedPrices;
        }
    } catch (err) {
        if (err.code !== '42P01') {
            console.warn('pricing-store load:', err.message);
        }
    }
    cachedPrices = cloneDefaults();
    cacheTime = Date.now();
    return cachedPrices;
}

/**
 * @param {import('pg').Pool} pool
 */
async function getPackagePrices(pool) {
    if (cachedPrices && Date.now() - cacheTime < CACHE_MS) {
        return cachedPrices;
    }
    return loadPackagePrices(pool);
}

/**
 * @param {import('pg').Pool} pool
 * @param {Record<string, Record<string, number>>} prices
 * @param {string} [adminUserId]
 */
async function savePackagePrices(pool, prices, adminUserId) {
    await pool.query(
        `INSERT INTO site_settings (key, value, updated_at, updated_by)
         VALUES ('package_prices', $1::jsonb, NOW(), $2::uuid)
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           updated_at = NOW(),
           updated_by = EXCLUDED.updated_by`,
        [JSON.stringify(prices), adminUserId || null]
    );
    cachedPrices = { ...cloneDefaults(), ...prices };
    cacheTime = Date.now();
    return cachedPrices;
}

function invalidatePriceCache() {
    cachedPrices = null;
    cacheTime = 0;
}

module.exports = {
    DEFAULT_PRICES,
    getPricesSync,
    loadPackagePrices,
    getPackagePrices,
    savePackagePrices,
    invalidatePriceCache
};
