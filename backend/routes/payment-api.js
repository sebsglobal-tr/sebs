const { isIyzicoConfigured } = require('../lib/iyzico-checkout');
const { DEFAULT_PRICES, getPackagePrices } = require('../lib/pricing-store');
const { getRoadPackageDisplayPrice } = require('../lib/package-prices');
const { isSubscriptionEnabled } = require('../lib/iyzico-subscription-plans');

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

        const roadPackages = {
            'ilk-adim': {
                slug: 'ilk-adim',
                title: 'İlk Adım',
                price: getRoadPackageDisplayPrice('ilk-adim', packages) ?? 199
            },
            yukselis: {
                slug: 'yukselis',
                title: 'Yükseliş',
                price: getRoadPackageDisplayPrice('yukselis', packages) ?? 349
            },
            zirve: {
                slug: 'zirve',
                title: 'Zirve',
                price: getRoadPackageDisplayPrice('zirve', packages) ?? 799
            }
        };

        res.json({
            success: true,
            data: {
                provider: 'iyzico',
                iyzicoConfigured: iyzico,
                subscriptionEnabled: iyzico && isSubscriptionEnabled(),
                checkoutCreatePath: '/api/payments/iyzico/checkout/create',
                subscriptionCreatePath: '/api/payments/iyzico/subscription/create',
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
