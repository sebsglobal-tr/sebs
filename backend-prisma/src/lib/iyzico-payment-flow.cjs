const { getExpectedPrice, normalizeLevel, ROAD_STAGE_TO_LEVEL } = require('./package-prices.cjs');
const { initializeCheckoutForm, retrieveCheckoutForm } = require('./iyzico-checkout.cjs');
const { grantPackagePurchase } = require('./grant-purchase.cjs');
const { verifyHppWebhookSignature } = require('./iyzico-webhook.cjs');
const { subscriptionPeriodDays, resolveBillingModeFromRequest } = require('./iyzico-subscription-plans.cjs');

const ROAD_PACKAGE_SLUGS = new Set(['ilk-adim', 'yukselis', 'zirve']);

function addDays(date, days) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

function isRoadMonthlyCheckoutOrder(order) {
    return Boolean(order && order.order_type === 'monthly_checkout');
}

function backendBaseUrl(req) {
    const fromEnv = (process.env.BACKEND_URL || process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    if (fromEnv) return fromEnv;
    return `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
}

function frontendBaseUrl(req) {
    const fromEnv = (process.env.FRONTEND_URL || process.env.APP_URL || '').replace(/\/$/, '');
    if (fromEnv) return fromEnv;
    const origin = req.get('origin');
    if (origin) return origin.replace(/\/$/, '');
    return 'http://localhost:3000';
}

function callbackUrl(req) {
    const explicit = (process.env.IYZICO_CALLBACK_URL || '').trim();
    if (explicit) return explicit;
    return `${backendBaseUrl(req)}/api/payments/iyzico/callback`;
}

/**
 * Accept { package: 'ilk-adim'|'yukselis'|'zirve' } or { category, level }.
 */
function resolvePackageInput(body) {
    const pkg = body && body.package;
    if (pkg && ROAD_PACKAGE_SLUGS.has(pkg)) {
        return {
            category: 'cybersecurity',
            level: ROAD_STAGE_TO_LEVEL[pkg] || normalizeLevel(pkg),
            packageSlug: pkg
        };
    }

    const category = body && body.category;
    const level = body && body.level;
    if (!category || !level) {
        return null;
    }

    const backendLevel = normalizeLevel(level);
    let packageSlug = level;
    if (ROAD_STAGE_TO_LEVEL[level]) packageSlug = level;

    return { category, level: backendLevel, packageSlug };
}

function pricesMatch(expected, paid) {
    const a = Number(expected);
    const b = Number(paid);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    return Math.abs(a - b) < 0.02;
}

function validateRetrieveAgainstOrder(result, order) {
    const errors = [];

    if (result.paymentStatus !== 'SUCCESS') {
        errors.push('payment_not_success');
        return { ok: false, errors };
    }

    if (!result.paymentId) {
        errors.push('missing_payment_id');
    }

    if (!pricesMatch(order.price, result.paidPrice)) {
        errors.push('price_mismatch');
    }

    if (result.buyer && result.buyer.id != null) {
        if (String(result.buyer.id) !== String(order.user_id)) {
            errors.push('buyer_mismatch');
        }
    }

    const conv =
        result.conversationId ||
        result.paymentConversationId ||
        '';
    if (conv && order.conversation_id && conv !== order.conversation_id) {
        errors.push('conversation_mismatch');
    }

    return { ok: errors.length === 0, errors };
}

function crossValidateWebhookAndRetrieve(webhook, retrieve, order) {
    const errors = [];

    if (webhook.status && webhook.status !== 'SUCCESS') {
        errors.push('webhook_not_success');
    }

    const whPaymentId = String(webhook.iyziPaymentId || webhook.paymentId || '');
    const retPaymentId = String(retrieve.paymentId || '');
    if (whPaymentId && retPaymentId && whPaymentId !== retPaymentId) {
        errors.push('payment_id_cross_mismatch');
    }

    if (order.token && webhook.token && webhook.token !== order.token) {
        errors.push('token_mismatch');
    }

    const whConv = String(webhook.paymentConversationId || '');
    if (whConv && order.conversation_id && whConv !== order.conversation_id) {
        errors.push('webhook_conversation_mismatch');
    }

    if (retrieve.paidPrice != null && !pricesMatch(order.price, retrieve.paidPrice)) {
        errors.push('retrieve_price_mismatch');
    }

    return { ok: errors.length === 0, errors };
}

async function findOrderByTokenOrConversation(pool, token, conversationId) {
    const r = await pool.query(
        `SELECT * FROM payment_orders
         WHERE token = $1
            OR conversation_id = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [token || '', conversationId || '']
    );
    return r.rows[0] || null;
}

async function fulfillSuccessfulPayment(pool, order, { paymentId, paidPrice, source, webhookRef }) {
    if (order.status === 'paid') {
        return { alreadyPaid: true, order };
    }

    const priceNum = Number(order.price);
    const grantOpts = {};
    if (isRoadMonthlyCheckoutOrder(order)) {
        grantOpts.expiresAt = addDays(new Date(), subscriptionPeriodDays());
    }
    await grantPackagePurchase(pool, order.user_id, order.category, order.level, priceNum, grantOpts);

    await pool.query(
        `UPDATE payment_orders SET
            status = 'paid',
            order_type = CASE WHEN $6 THEN 'monthly_checkout' ELSE COALESCE(order_type, 'checkout') END,
            iyzico_payment_id = COALESCE($1, iyzico_payment_id),
            paid_price = COALESCE($2, paid_price),
            iyzico_status = 'SUCCESS',
            verify_source = COALESCE($3, verify_source),
            webhook_ref = COALESCE($4, webhook_ref),
            error_message = NULL,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [
            paymentId || null,
            paidPrice != null ? Number(paidPrice) : priceNum,
            source,
            webhookRef || null,
            order.id,
            isRoadMonthlyCheckoutOrder(order)
        ]
    );

    return { alreadyPaid: false, order };
}

async function markPaymentFailed(pool, order, message, iyzicoStatus) {
    await pool.query(
        `UPDATE payment_orders SET
            status = 'failed',
            error_message = $1,
            iyzico_status = COALESCE($2, iyzico_status),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [message || 'failed', iyzicoStatus || 'FAILURE', order.id]
    );
}

async function processCheckoutToken(pool, token, { source, webhookPayload, signatureHeader }) {
    const retrieve = await retrieveCheckoutForm(token);
    const order = await findOrderByTokenOrConversation(
        pool,
        token,
        retrieve.conversationId || retrieve.paymentConversationId
    );

    if (!order) {
        const err = new Error('Sipariş bulunamadı');
        err.code = 'ORDER_NOT_FOUND';
        throw err;
    }

    if (order.status === 'paid') {
        return { order, retrieve, alreadyPaid: true };
    }

    if (webhookPayload) {
        if (!signatureHeader) {
            const err = new Error('Webhook imzası eksik');
            err.code = 'WEBHOOK_SIGNATURE_MISSING';
            throw err;
        }
        const sigOk = verifyHppWebhookSignature(webhookPayload, signatureHeader);
        if (!sigOk) {
            const err = new Error('Webhook imzası geçersiz');
            err.code = 'WEBHOOK_SIGNATURE_INVALID';
            throw err;
        }
        const cross = crossValidateWebhookAndRetrieve(webhookPayload, retrieve, order);
        if (!cross.ok) {
            const err = new Error('Webhook ve ödeme sorgusu uyuşmuyor: ' + cross.errors.join(','));
            err.code = 'CROSS_VALIDATION_FAILED';
            throw err;
        }
    }

    const validation = validateRetrieveAgainstOrder(retrieve, order);
    if (!validation.ok) {
        await markPaymentFailed(
            pool,
            order,
            validation.errors.join(','),
            retrieve.paymentStatus
        );
        const err = new Error('Ödeme doğrulanamadı');
        err.code = 'PAYMENT_VALIDATION_FAILED';
        err.details = validation.errors;
        throw err;
    }

    await fulfillSuccessfulPayment(pool, order, {
        paymentId: retrieve.paymentId,
        paidPrice: retrieve.paidPrice,
        source: webhookPayload ? `${source}+webhook` : source,
        webhookRef: webhookPayload && webhookPayload.iyziReferenceCode
    });

    return { order, retrieve, alreadyPaid: false };
}

async function createCheckoutSession(pool, req, userId, packageInput) {
    const resolved = resolvePackageInput(packageInput);
    if (!resolved) {
        const err = new Error('package veya category+level gerekli');
        err.code = 'INVALID_REQUEST';
        throw err;
    }

    const { category, level, packageSlug } = resolved;
    const expectedPrice = getExpectedPrice(category, level);
    if (expectedPrice == null) {
        const err = new Error('Geçersiz paket');
        err.code = 'INVALID_PACKAGE';
        throw err;
    }

    const userResult = await pool.query(
        'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
        [userId]
    );
    if (userResult.rows.length === 0) {
        const err = new Error('Kullanıcı bulunamadı');
        err.code = 'USER_NOT_FOUND';
        throw err;
    }

    const existing = await pool.query(
        `SELECT id FROM purchases
         WHERE user_id = $1 AND category = $2 AND level = $3 AND is_active = TRUE
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
        [userId, category, level]
    );
    if (existing.rows.length > 0) {
        const err = new Error('Bu pakete zaten sahipsiniz');
        err.code = 'ALREADY_OWNED';
        throw err;
    }

    const row = userResult.rows[0];
    const user = {
        id: row.id,
        email: row.email,
        full_name: [row.first_name, row.last_name].filter(Boolean).join(' ')
    };

    const clientIp =
        (req.headers && req.headers['x-forwarded-for'] && String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
        (req.headers && req.headers['x-real-ip']) ||
        req.ip ||
        '';

    const init = await initializeCheckoutForm({
        user,
        category,
        level,
        packageSlug,
        callbackUrl: callbackUrl(req),
        clientIp
    });

    const orderType =
        resolveBillingModeFromRequest(packageInput, packageSlug || level) === 'monthly_checkout'
            ? 'monthly_checkout'
            : 'checkout';

    await pool.query(
        `INSERT INTO payment_orders (
            user_id, category, level, price, conversation_id, token, status, package_slug, order_type,
            payment_page_url, checkout_form_content
         ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10)
         ON CONFLICT (conversation_id) DO UPDATE SET
            token = EXCLUDED.token,
            status = 'pending',
            package_slug = EXCLUDED.package_slug,
            price = EXCLUDED.price,
            order_type = EXCLUDED.order_type,
            payment_page_url = EXCLUDED.payment_page_url,
            checkout_form_content = EXCLUDED.checkout_form_content,
            updated_at = CURRENT_TIMESTAMP`,
        [
            userId,
            category,
            level,
            init.price,
            init.conversationId,
            init.token,
            packageSlug || level,
            orderType,
            init.paymentPageUrl || null,
            init.checkoutFormContent || null
        ]
    );

    const base = frontendBaseUrl(req);
    const checkoutPage = `${base}/odeme/iyzico?t=${encodeURIComponent(init.token || '')}`;
    return {
        paymentPageUrl: init.paymentPageUrl,
        checkoutFormContent: init.checkoutFormContent,
        checkoutToken: init.token,
        conversationId: init.conversationId,
        price: init.price,
        packageSlug: packageSlug || level,
        orderType,
        billingMode: orderType === 'monthly_checkout' ? 'monthly_checkout' : 'checkout',
        checkoutPage,
        successRedirect: `${base}/odeme/basarili`,
        failureRedirect: `${base}/odeme/hata`
    };
}

module.exports = {
    ROAD_PACKAGE_SLUGS,
    backendBaseUrl,
    frontendBaseUrl,
    callbackUrl,
    resolvePackageInput,
    validateRetrieveAgainstOrder,
    crossValidateWebhookAndRetrieve,
    findOrderByTokenOrConversation,
    fulfillSuccessfulPayment,
    markPaymentFailed,
    processCheckoutToken,
    createCheckoutSession,
    pricesMatch
};
