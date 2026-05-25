const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { isIyzicoConfigured } = require('../lib/iyzico-checkout');
const { parseWebhookBody } = require('../lib/iyzico-webhook');
const { shouldUseSubscription, resolveBillingModeFromRequest } = require('../lib/iyzico-subscription-plans');
const {
    frontendBaseUrl,
    createCheckoutSession,
    processCheckoutToken,
    markPaymentFailed,
    findOrderByTokenOrConversation
} = require('../lib/iyzico-payment-flow');
const {
    ensureSubscriptionTables,
    createSubscriptionSession,
    processSubscriptionToken,
    handleSubscriptionWebhook,
    isSubscriptionWebhookEvent
} = require('../lib/iyzico-subscription-flow');

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
    for (const name of ['016_payment_orders_webhook.sql', '017_payment_orders_uuid_fix.sql', '018_user_subscriptions.sql', '019_payment_orders_checkout_payload.sql']) {
        try {
            const extPath = path.join(__dirname, '..', '..', 'database', 'migrations', name);
            if (fs.existsSync(extPath)) {
                await pool.query(fs.readFileSync(extPath, 'utf8'));
            }
        } catch (extErr) {
            console.warn('payment_orders migration', name, extErr.message);
        }
    }
}

function registerIyzicoPaymentRoutes(app, { pool, authenticateToken }) {
    const iyzicoCallbackLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_IYZICO_CALLBACK_MAX, 10) || 40,
        standardHeaders: true,
        legacyHeaders: false
    });

    const iyzicoWebhookLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_IYZICO_WEBHOOK_MAX, 10) || 120,
        standardHeaders: true,
        legacyHeaders: false
    });

    ensurePaymentOrdersTable(pool).catch((e) => {
        console.warn('payment_orders ensure:', e.message);
    });
    ensureSubscriptionTables(pool).catch((e) => {
        console.warn('user_subscriptions ensure:', e.message);
    });

    async function handleCheckoutCreate(req, res) {
        try {
            if (!isIyzicoConfigured()) {
                return res.status(503).json({
                    success: false,
                    code: 'PAYMENT_PROVIDER_REQUIRED',
                    message:
                        'Iyzico API anahtarları tanımlı değil. IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin.'
                });
            }

            const pkg = req.body && req.body.package;
            const billingMode = req.body && req.body.billingMode;
            const useSubscription = pkg && shouldUseSubscription(pkg, billingMode);

            const data = useSubscription
                ? await createSubscriptionSession(pool, req, req.user.userId, req.body)
                : await createCheckoutSession(pool, req, req.user.userId, req.body);

            if (data && !data.billingMode) {
                data.billingMode = resolveBillingModeFromRequest(req.body, pkg);
            }

            return res.json({ success: true, data });
        } catch (error) {
            console.error('Iyzico checkout create:', error);
            const code = error.code || 'IYZICO_INIT_FAILED';
            const status =
                code === 'PAYMENT_PROVIDER_REQUIRED' || code === 'IYZICO_KEY_ENV_MISMATCH'
                    ? 503
                    : code === 'ALREADY_OWNED' ||
                        code === 'INVALID_REQUEST' ||
                        code === 'INVALID_PACKAGE' ||
                        code === 'NOT_SUBSCRIPTION_PACKAGE' ||
                        code === 'SUBSCRIPTION_PLAN_NOT_CONFIGURED'
                      ? 400
                      : code === 'USER_NOT_FOUND'
                        ? 404
                        : 500;
            return res.status(status).json({
                success: false,
                code,
                message: error.message || 'Ödeme başlatılamadı.'
            });
        }
    }

    app.post('/api/payments/iyzico/checkout/create', authenticateToken, handleCheckoutCreate);
    /** @deprecated use checkout/create */
    app.post('/api/payments/iyzico/initialize', authenticateToken, handleCheckoutCreate);

    app.get('/api/payments/iyzico/checkout/launch', iyzicoCallbackLimiter, async (req, res) => {
        try {
            const token = String(req.query.t || req.query.token || '').trim();
            if (!token || token.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz ödeme oturumu.'
                });
            }

            const r = await pool.query(
                `SELECT token, status, payment_page_url, checkout_form_content, conversation_id, created_at
                 FROM payment_orders
                 WHERE token = $1
                   AND status = 'pending'
                   AND created_at > NOW() - INTERVAL '20 minutes'
                 LIMIT 1`,
                [token]
            );

            if (!r.rows.length) {
                return res.status(404).json({
                    success: false,
                    code: 'CHECKOUT_SESSION_NOT_FOUND',
                    message: 'Ödeme oturumu bulunamadı veya süresi doldu. Lütfen satın almayı tekrar başlatın.'
                });
            }

            const row = r.rows[0];
            res.json({
                success: true,
                data: {
                    paymentPageUrl: row.payment_page_url || '',
                    checkoutFormContent: row.checkout_form_content || '',
                    conversationId: row.conversation_id || ''
                }
            });
        } catch (error) {
            console.error('checkout launch:', error);
            res.status(500).json({
                success: false,
                message: 'Ödeme oturumu yüklenemedi.'
            });
        }
    });

    app.post(
        '/api/payments/iyzico/subscription/create',
        authenticateToken,
        handleCheckoutCreate
    );

    app.post('/api/payments/iyzico/callback', iyzicoCallbackLimiter, async (req, res) => {
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

            const { order } = await processCheckoutToken(pool, token, {
                source: 'callback'
            });

            return res.redirect(
                302,
                `${okUrl}?conversationId=${encodeURIComponent(order.conversation_id)}`
            );
        } catch (error) {
            console.error('Iyzico callback:', error);
            const token = req.body && (req.body.token || req.body.checkoutFormToken);
            if (token) {
                try {
                    const order = await findOrderByTokenOrConversation(pool, token, '');
                    if (order) {
                        await markPaymentFailed(
                            pool,
                            order,
                            error.message || 'callback_failed',
                            'FAILURE'
                        );
                    }
                } catch (markErr) {
                    console.warn('callback mark failed:', markErr.message);
                }
            }
            return res.redirect(302, `${failUrl}?reason=payment_failed`);
        }
    });

    app.post('/api/payments/iyzico/subscription/callback', iyzicoCallbackLimiter, async (req, res) => {
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

            const { order } = await processSubscriptionToken(pool, token, {
                source: 'subscription_callback'
            });

            return res.redirect(
                302,
                `${okUrl}?conversationId=${encodeURIComponent(order.conversation_id)}&type=subscription`
            );
        } catch (error) {
            console.error('Iyzico subscription callback:', error);
            const token = req.body && (req.body.token || req.body.checkoutFormToken);
            if (token) {
                try {
                    const order = await findOrderByTokenOrConversation(pool, token, '');
                    if (order) {
                        await markPaymentFailed(
                            pool,
                            order,
                            error.message || 'subscription_callback_failed',
                            'FAILURE'
                        );
                    }
                } catch (markErr) {
                    console.warn('subscription callback mark failed:', markErr.message);
                }
            }
            return res.redirect(302, `${failUrl}?reason=subscription_failed`);
        }
    });

    app.post('/api/payments/iyzico/webhook', iyzicoWebhookLimiter, async (req, res) => {
        try {
            const payload = parseWebhookBody(req);

            if (isSubscriptionWebhookEvent(payload)) {
                const result = await handleSubscriptionWebhook(pool, payload);
                return res.status(200).json({ success: true, ...result });
            }

            const token = payload.token;
            if (!token) {
                return res.status(400).json({ success: false, message: 'token gerekli' });
            }

            if (!isIyzicoConfigured()) {
                return res.status(503).json({ success: false, message: 'provider_not_configured' });
            }

            const signature =
                req.get('x-iyz-signature-v3') || req.get('X-IYZ-SIGNATURE-V3') || '';

            if (payload.status === 'FAILURE') {
                const order = await findOrderByTokenOrConversation(
                    pool,
                    token,
                    payload.paymentConversationId
                );
                if (order && order.status !== 'paid') {
                    await markPaymentFailed(
                        pool,
                        order,
                        'webhook_failure',
                        payload.status
                    );
                }
                return res.status(200).json({ success: true, processed: 'failed' });
            }

            if (payload.status !== 'SUCCESS') {
                return res.status(200).json({ success: true, processed: 'ignored', status: payload.status });
            }

            const order = await findOrderByTokenOrConversation(
                pool,
                token,
                payload.paymentConversationId
            );
            if (order && order.order_type === 'subscription') {
                await processSubscriptionToken(pool, token, {
                    source: 'webhook',
                    webhookPayload: payload
                });
            } else {
                await processCheckoutToken(pool, token, {
                    source: 'webhook',
                    webhookPayload: payload,
                    signatureHeader: signature
                });
            }

            return res.status(200).json({ success: true, processed: 'paid' });
        } catch (error) {
            console.error('Iyzico webhook:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'webhook_error'
            });
        }
    });

    app.get('/api/payments/iyzico/status/:conversationId', authenticateToken, async (req, res) => {
        try {
            const conv = req.params.conversationId;
            const r = await pool.query(
                `SELECT id, status, category, level, price, package_slug, iyzico_payment_id,
                        paid_price, order_type, subscription_ref
                 FROM payment_orders
                 WHERE conversation_id = $1 AND user_id = $2
                 LIMIT 1`,
                [conv, req.user.userId]
            );
            if (!r.rows.length) {
                return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
            }
            const row = r.rows[0];

            let subscription = null;
            if (row.subscription_ref) {
                const subR = await pool.query(
                    `SELECT status, current_period_end, package_slug, level
                     FROM user_subscriptions
                     WHERE iyzico_subscription_ref = $1 AND user_id = $2
                     LIMIT 1`,
                    [row.subscription_ref, req.user.userId]
                );
                if (subR.rows.length) subscription = subR.rows[0];
            }

            return res.json({
                success: true,
                data: {
                    status: row.status,
                    paid: row.status === 'paid',
                    category: row.category,
                    level: row.level,
                    packageSlug: row.package_slug,
                    price: Number(row.price),
                    paidPrice: row.paid_price != null ? Number(row.paid_price) : null,
                    paymentId: row.iyzico_payment_id,
                    orderType: row.order_type || 'checkout',
                    subscriptionRef: row.subscription_ref,
                    subscription
                }
            });
        } catch (error) {
            console.error('payment status:', error);
            return res.status(500).json({ success: false, message: 'Durum alınamadı' });
        }
    });

    app.get('/api/payments/subscription/me', authenticateToken, async (req, res) => {
        try {
            const r = await pool.query(
                `SELECT package_slug, level, status, current_period_end, iyzico_subscription_ref,
                        created_at, updated_at
                 FROM user_subscriptions
                 WHERE user_id = $1
                 ORDER BY updated_at DESC
                 LIMIT 5`,
                [req.user.userId]
            );
            return res.json({ success: true, data: { subscriptions: r.rows } });
        } catch (error) {
            console.error('subscription/me:', error);
            return res.status(500).json({ success: false, message: 'Abonelik bilgisi alınamadı' });
        }
    });
}

module.exports = { registerIyzicoPaymentRoutes, ensurePaymentOrdersTable };
