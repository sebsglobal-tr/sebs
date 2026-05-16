const path = require('path');
const fs = require('fs');
const {
    isIyzicoConfigured,
    initializeCheckoutForm,
    retrieveCheckoutForm
} = require('../lib/iyzico-checkout');
const { getExpectedPrice, normalizeLevel } = require('../lib/package-prices');
const { grantPackagePurchase } = require('../lib/grant-purchase');

function frontendBaseUrl(req) {
    const fromEnv = (process.env.FRONTEND_URL || process.env.APP_URL || '').replace(/\/$/, '');
    if (fromEnv) return fromEnv;
    const origin = req.get('origin');
    if (origin) return origin.replace(/\/$/, '');
    return 'http://localhost:3000';
}

async function ensurePaymentOrdersTable(pool) {
    try {
        await pool.query('SELECT 1 FROM payment_orders LIMIT 1');
    } catch (err) {
        if (err.code !== '42P01') throw err;
        const sqlPath = path.join(__dirname, '..', '..', 'database', 'migrations', '014_payment_orders.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('✅ payment_orders table created');
    }
}

function registerIyzicoPaymentRoutes(app, { pool, authenticateToken }) {
    ensurePaymentOrdersTable(pool).catch((e) => {
        console.warn('payment_orders ensure:', e.message);
    });

    app.post('/api/payments/iyzico/initialize', authenticateToken, async (req, res) => {
        try {
            if (!isIyzicoConfigured()) {
                return res.status(503).json({
                    success: false,
                    code: 'PAYMENT_PROVIDER_REQUIRED',
                    message:
                        'Iyzico API anahtarları tanımlı değil. IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin.'
                });
            }

            const userId = req.user.userId;
            const { category, level } = req.body;
            if (!category || !level) {
                return res.status(400).json({
                    success: false,
                    message: 'category ve level gerekli.'
                });
            }

            const backendLevel = normalizeLevel(level);
            const expectedPrice = getExpectedPrice(category, backendLevel);
            if (expectedPrice == null) {
                return res.status(400).json({ success: false, message: 'Geçersiz paket.' });
            }

            const userResult = await pool.query(
                'SELECT id, email, first_name, last_name, access_level FROM users WHERE id = $1',
                [userId]
            );
            if (userResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            }
            const row = userResult.rows[0];
            const user = {
                id: row.id,
                email: row.email,
                full_name: [row.first_name, row.last_name].filter(Boolean).join(' ')
            };

            const existing = await pool.query(
                `SELECT id FROM purchases
                 WHERE user_id = $1 AND category = $2 AND level = $3 AND is_active = TRUE`,
                [userId, category, backendLevel]
            );
            if (existing.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu pakete zaten sahipsiniz.'
                });
            }

            const base = frontendBaseUrl(req);
            const callbackUrl =
                (process.env.IYZICO_CALLBACK_URL || '').trim() ||
                `${(process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/api/payments/iyzico/callback`;

            const init = await initializeCheckoutForm({
                user,
                category,
                level: backendLevel,
                callbackUrl
            });

            await pool.query(
                `INSERT INTO payment_orders (user_id, category, level, price, conversation_id, token, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'pending')
                 ON CONFLICT (conversation_id) DO UPDATE SET
                     token = EXCLUDED.token,
                     status = 'pending',
                     updated_at = CURRENT_TIMESTAMP`,
                [userId, category, backendLevel, init.price, init.conversationId, init.token]
            );

            return res.json({
                success: true,
                data: {
                    token: init.token,
                    paymentPageUrl: init.paymentPageUrl,
                    checkoutFormContent: init.checkoutFormContent,
                    conversationId: init.conversationId,
                    successRedirect: `${base}/odeme/basarili`,
                    failureRedirect: `${base}/odeme/hata`
                }
            });
        } catch (error) {
            console.error('Iyzico initialize:', error);
            const code = error.code || 'IYZICO_INIT_FAILED';
            return res.status(code === 'PAYMENT_PROVIDER_REQUIRED' ? 503 : 500).json({
                success: false,
                code,
                message: error.message || 'Ödeme başlatılamadı.'
            });
        }
    });

    app.post('/api/payments/iyzico/callback', async (req, res) => {
        const base = frontendBaseUrl(req);
        const failUrl = `${base}/odeme/hata`;
        const okUrl = `${base}/odeme/basarili`;

        try {
            const token = req.body && (req.body.token || req.body.checkoutFormToken);
            if (!token) {
                return res.redirect(302, `${failUrl}?reason=missing_token`);
            }

            if (!isIyzicoConfigured()) {
                return res.redirect(302, `${failUrl}?reason=provider`);
            }

            const result = await retrieveCheckoutForm(token);
            const orderResult = await pool.query(
                `SELECT * FROM payment_orders WHERE token = $1 OR conversation_id = $2 LIMIT 1`,
                [token, result.conversationId || '']
            );
            if (orderResult.rows.length === 0) {
                return res.redirect(302, `${failUrl}?reason=order_not_found`);
            }
            const order = orderResult.rows[0];

            if (result.paymentStatus === 'SUCCESS') {
                await grantPackagePurchase(
                    pool,
                    order.user_id,
                    order.category,
                    order.level,
                    Number(order.price)
                );
                await pool.query(
                    `UPDATE payment_orders SET status = 'paid', iyzico_payment_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [result.paymentId || null, order.id]
                );
                return res.redirect(302, `${okUrl}?conversationId=${encodeURIComponent(order.conversation_id)}`);
            }

            await pool.query(
                `UPDATE payment_orders SET status = 'failed', error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [result.errorMessage || result.paymentStatus || 'failed', order.id]
            );
            return res.redirect(302, `${failUrl}?reason=payment_failed`);
        } catch (error) {
            console.error('Iyzico callback:', error);
            return res.redirect(302, `${failUrl}?reason=error`);
        }
    });
}

module.exports = { registerIyzicoPaymentRoutes, ensurePaymentOrdersTable };
