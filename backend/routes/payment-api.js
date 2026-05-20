const { isIyzicoConfigured } = require('../lib/iyzico-checkout');
const { DEFAULT_PRICES, getPackagePrices } = require('../lib/pricing-store');
const { isTestPaymentMode } = require('../lib/package-prices');

function registerPaymentApiRoutes(app, { pool } = {}) {
    app.get('/api/payments/config', async (req, res) => {
        const iyzico = isIyzicoConfigured();
        const disableDirect = process.env.DISABLE_DIRECT_PURCHASE === '1';
        const isProd = process.env.NODE_ENV === 'production';
        let packages = DEFAULT_PRICES;
        if (pool) {
            try {
                packages = await getPackagePrices(pool);
            } catch {
                /* */
            }
        }

        const testMode = isTestPaymentMode();
        const roadPackages = {
            'ilk-adim': {
                slug: 'ilk-adim',
                title: 'İlk Adım',
                price: testMode ? 1 : (packages.cybersecurity && packages.cybersecurity.beginner) || 199
            },
            yukselis: {
                slug: 'yukselis',
                title: 'Yükseliş',
                price: testMode ? 3 : (packages.cybersecurity && packages.cybersecurity.intermediate) || 349
            },
            zirve: {
                slug: 'zirve',
                title: 'Zirve',
                price: testMode ? 5 : (packages.cybersecurity && packages.cybersecurity.advanced) || 799
            }
        };

        res.json({
            success: true,
            data: {
                provider: 'iyzico',
                iyzicoConfigured: iyzico,
                testMode,
                checkoutCreatePath: '/api/payments/iyzico/checkout/create',
                paymentsRequireIyzico: disableDirect || (isProd && process.env.ALLOW_DEV_PURCHASE !== '1'),
                directPurchaseAllowed:
                    !disableDirect &&
                    (process.env.ALLOW_DEV_PURCHASE === '1' || !isProd),
                packages,
                roadPackages,
                currency: 'TRY'
            }
        });
    });
}

module.exports = { registerPaymentApiRoutes };
