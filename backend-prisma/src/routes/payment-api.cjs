const { isIyzicoConfigured } = require('../lib/iyzico-checkout.cjs');
const { DEFAULT_PRICES, getPackagePrices } = require('../lib/pricing-store.cjs');
const { getRoadPackageDisplayPrice, applyTestPriceOverrides } = require('../lib/package-prices.cjs');
const { isSubscriptionEnabled, getRoadBillingMode } = require('../lib/iyzico-subscription-plans.cjs');

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
        packages = applyTestPriceOverrides(packages);

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
                roadBillingMode: getRoadBillingMode(),
                debitFriendlyCheckout: getRoadBillingMode() === 'monthly_checkout',
                billingOptions: {
                    subscription: {
                        id: 'subscription',
                        label: 'Kredi kartı ile otomatik abonelik',
                        description: 'Her ay otomatik yenilenir. Yalnızca kredi kartı.',
                        creditCardOnly: true
                    },
                    monthlyCheckout: {
                        id: 'monthly_checkout',
                        label: 'Banka kartı ile manuel aylık ödeme',
                        description: 'Tek çekim, 30 gün erişim. Süre bitince tekrar ödersiniz.',
                        debitFriendly: true
                    }
                },
                cardNotice:
                    'Abonelik ödemeleri yalnızca kredi kartı ile yapılabilir. Banka kartı ile ödeme yapmak istiyorsanız tek seferlik / manuel aylık ödeme seçeneğini kullanabilirsiniz.',
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
