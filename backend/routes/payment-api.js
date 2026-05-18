const { isIyzicoConfigured } = require('../lib/iyzico-checkout');
const { DEFAULT_PRICES, getPackagePrices } = require('../lib/pricing-store');

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

        res.json({
            success: true,
            data: {
                provider: 'iyzico',
                iyzicoConfigured: iyzico,
                paymentsRequireIyzico: disableDirect || (isProd && process.env.ALLOW_DEV_PURCHASE !== '1'),
                directPurchaseAllowed:
                    !disableDirect &&
                    (process.env.ALLOW_DEV_PURCHASE === '1' || !isProd),
                packages,
                currency: 'TRY'
            }
        });
    });
}

module.exports = { registerPaymentApiRoutes };
