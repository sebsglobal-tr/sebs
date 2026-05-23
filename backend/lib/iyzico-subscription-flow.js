const { getExpectedPrice, normalizeLevel, ROAD_STAGE_TO_LEVEL } = require('./package-prices');
const {
    subscriptionPeriodDays,
    shouldUseSubscription,
    getPricingPlanRef,
    planRefToLevel,
    planRefToPackageSlug
} = require('./iyzico-subscription-plans');
const {
    initializeSubscriptionCheckoutForm,
    retrieveSubscriptionCheckoutForm,
    retrieveSubscriptionDetail,
    upgradeSubscription
} = require('./iyzico-subscription');
const { grantPackagePurchase } = require('./grant-purchase');
const {
    backendBaseUrl,
    frontendBaseUrl,
    resolvePackageInput,
    findOrderByTokenOrConversation,
    markPaymentFailed
} = require('./iyzico-payment-flow');

function subscriptionCallbackUrl(req) {
    const explicit = (process.env.IYZICO_SUBSCRIPTION_CALLBACK_URL || '').trim();
    if (explicit) return explicit;
    return `${backendBaseUrl(req)}/api/payments/iyzico/subscription/callback`;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

function epochMsToDate(ms) {
    if (ms == null || ms === '') return null;
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return null;
    return new Date(n);
}

function computePeriodEndFromDetail(detailResult) {
    const item = detailResult?.data?.items?.[0] || detailResult?.data || null;
    const orders = item?.orders || [];
    const successOrders = orders
        .filter((o) => o.orderStatus === 'SUCCESS' && o.endPeriod)
        .sort((a, b) => Number(b.endPeriod) - Number(a.endPeriod));
    if (successOrders.length > 0) {
        return epochMsToDate(successOrders[0].endPeriod);
    }
  if (item?.endDate) {
        return epochMsToDate(item.endDate);
    }
    return addDays(new Date(), subscriptionPeriodDays());
}

function mapSubscriptionStatus(iyzicoStatus) {
    const s = String(iyzicoStatus || '').toUpperCase();
    if (['ACTIVE', 'PENDING', 'UNPAID', 'UPGRADED', 'CANCELED', 'EXPIRED'].includes(s)) {
        return s;
    }
    return 'ACTIVE';
}

function subscriptionGrantsAccess(status) {
    const s = mapSubscriptionStatus(status);
    return s === 'ACTIVE' || s === 'UPGRADED';
}

async function ensureSubscriptionTables(pool) {
    try {
        await pool.query('SELECT 1 FROM user_subscriptions LIMIT 1');
    } catch (err) {
        if (err.code !== '42P01') throw err;
        const fs = require('fs');
        const path = require('path');
        const sqlPath = path.join(__dirname, '..', '..', 'database', 'migrations', '018_user_subscriptions.sql');
        await pool.query(fs.readFileSync(sqlPath, 'utf8'));
    }
}

async function findActiveSubscriptionPurchase(pool, userId, category, level) {
    const r = await pool.query(
        `SELECT id FROM purchases
         WHERE user_id = $1 AND category = $2 AND level = $3 AND is_active = TRUE
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
        [userId, category, level]
    );
    return r.rows.length > 0;
}

async function findActiveUserSubscription(pool, userId, category) {
    const r = await pool.query(
        `SELECT * FROM user_subscriptions
         WHERE user_id = $1 AND category = $2
         AND status IN ('ACTIVE', 'UPGRADED')
         AND (current_period_end IS NULL OR current_period_end > CURRENT_TIMESTAMP)
         ORDER BY updated_at DESC
         LIMIT 1`,
        [userId, category]
    );
    return r.rows[0] || null;
}

async function upsertUserSubscription(pool, row) {
    await pool.query(
        `INSERT INTO user_subscriptions (
            user_id, category, level, package_slug,
            iyzico_subscription_ref, iyzico_pricing_plan_ref, iyzico_customer_ref,
            status, current_period_end, conversation_id, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT (iyzico_subscription_ref) DO UPDATE SET
            level = EXCLUDED.level,
            package_slug = EXCLUDED.package_slug,
            iyzico_pricing_plan_ref = EXCLUDED.iyzico_pricing_plan_ref,
            iyzico_customer_ref = COALESCE(EXCLUDED.iyzico_customer_ref, user_subscriptions.iyzico_customer_ref),
            status = EXCLUDED.status,
            current_period_end = EXCLUDED.current_period_end,
            conversation_id = COALESCE(EXCLUDED.conversation_id, user_subscriptions.conversation_id),
            updated_at = CURRENT_TIMESTAMP`,
        [
            row.userId,
            row.category,
            row.level,
            row.packageSlug,
            row.subscriptionRef,
            row.pricingPlanRef,
            row.customerRef || null,
            row.status,
            row.periodEnd,
            row.conversationId || null
        ]
    );
}

async function syncSubscriptionAccess(pool, userId, category, level, packageSlug, subData, periodEnd) {
    const status = mapSubscriptionStatus(subData.subscriptionStatus);
    const price = getExpectedPrice(category, level) || 0;
    const active = subscriptionGrantsAccess(status);

    if (active) {
        await grantPackagePurchase(pool, userId, category, level, price, {
            expiresAt: periodEnd,
            subscriptionRef: subData.referenceCode
        });
    } else {
        await pool.query(
            `UPDATE purchases SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND category = $2 AND level = $3`,
            [userId, category, level]
        );
        try {
            await pool.query(
                `UPDATE user_package_purchases SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $1 AND category = $2 AND level = $3`,
                [userId, category, level]
            );
        } catch {
            /* table may not exist */
        }
    }

    await upsertUserSubscription(pool, {
        userId,
        category,
        level,
        packageSlug,
        subscriptionRef: subData.referenceCode,
        pricingPlanRef: subData.pricingPlanReferenceCode,
        customerRef: subData.customerReferenceCode,
        status,
        periodEnd,
        conversationId: null
    });
}

async function fulfillSubscriptionFromRetrieve(pool, order, subData) {
    let periodEnd = computePeriodEndFromDetail({ data: subData });
    try {
        const detail = await retrieveSubscriptionDetail(subData.referenceCode);
        if (detail.status === 'success') {
            periodEnd = computePeriodEndFromDetail(detail);
            const item = detail.data?.items?.[0] || detail.data;
            if (item) {
                subData = { ...subData, ...item };
            }
        }
    } catch (e) {
        console.warn('subscription detail retrieve:', e.message);
    }

    const packageSlug = order.package_slug || planRefToPackageSlug(subData.pricingPlanReferenceCode);
    await syncSubscriptionAccess(
        pool,
        order.user_id,
        order.category,
        order.level,
        packageSlug,
        subData,
        periodEnd
    );

    await pool.query(
        `UPDATE payment_orders SET
            status = 'paid',
            order_type = 'subscription',
            subscription_ref = $1,
            pricing_plan_ref = $2,
            iyzico_status = $3,
            verify_source = 'subscription_callback',
            error_message = NULL,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [
            subData.referenceCode,
            subData.pricingPlanReferenceCode,
            subData.subscriptionStatus || 'ACTIVE',
            order.id
        ]
    );

    return { periodEnd, subscriptionRef: subData.referenceCode };
}

async function processSubscriptionToken(pool, token, { source } = {}) {
    const retrieve = await retrieveSubscriptionCheckoutForm(token);
    const order = await findOrderByTokenOrConversation(
        pool,
        token,
        retrieve.conversationId
    );

    if (!order) {
        const err = new Error('Abonelik siparişi bulunamadı');
        err.code = 'ORDER_NOT_FOUND';
        throw err;
    }

    if (order.status === 'paid') {
        return { order, retrieve, alreadyPaid: true };
    }

    if (retrieve.status !== 'success' || !retrieve.data) {
        await markPaymentFailed(pool, order, retrieve.errorMessage || 'subscription_failed', 'FAILURE');
        const err = new Error(retrieve.errorMessage || 'Abonelik doğrulanamadı');
        err.code = 'SUBSCRIPTION_VALIDATION_FAILED';
        throw err;
    }

    const subData = retrieve.data;
    if (!subscriptionGrantsAccess(subData.subscriptionStatus)) {
        await markPaymentFailed(
            pool,
            order,
            'subscription_not_active:' + (subData.subscriptionStatus || ''),
            subData.subscriptionStatus
        );
        const err = new Error('Abonelik aktif değil');
        err.code = 'SUBSCRIPTION_NOT_ACTIVE';
        throw err;
    }

    await fulfillSubscriptionFromRetrieve(pool, order, subData);
    return { order, retrieve, alreadyPaid: false, source };
}

async function refreshSubscriptionByRef(pool, subscriptionRef) {
    const local = await pool.query(
        'SELECT * FROM user_subscriptions WHERE iyzico_subscription_ref = $1 LIMIT 1',
        [subscriptionRef]
    );
    if (!local.rows.length) return null;

    const row = local.rows[0];
    const detail = await retrieveSubscriptionDetail(subscriptionRef);
    if (detail.status !== 'success') return null;

    const item = detail.data?.items?.[0] || detail.data;
    if (!item) return null;

    const periodEnd = computePeriodEndFromDetail(detail);
    const level =
        planRefToLevel(item.pricingPlanReferenceCode) || row.level;
    const packageSlug =
        planRefToPackageSlug(item.pricingPlanReferenceCode) || row.package_slug;

    await syncSubscriptionAccess(
        pool,
        row.user_id,
        row.category,
        level,
        packageSlug,
        {
            referenceCode: subscriptionRef,
            pricingPlanReferenceCode: item.pricingPlanReferenceCode,
            customerReferenceCode: item.customerReferenceCode,
            subscriptionStatus: item.subscriptionStatus
        },
        periodEnd
    );

    return { userId: row.user_id, periodEnd, status: item.subscriptionStatus };
}

async function createSubscriptionSession(pool, req, userId, packageInput) {
    await ensureSubscriptionTables(pool);

    const resolved = resolvePackageInput(packageInput);
    if (!resolved) {
        const err = new Error('package veya category+level gerekli');
        err.code = 'INVALID_REQUEST';
        throw err;
    }

    const { category, level, packageSlug } = resolved;
    if (!shouldUseSubscription(packageSlug)) {
        const err = new Error('Bu paket abonelik ile satılmıyor');
        err.code = 'NOT_SUBSCRIPTION_PACKAGE';
        throw err;
    }

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

    const alreadyOwned = await findActiveSubscriptionPurchase(pool, userId, category, level);
    if (alreadyOwned) {
        const err = new Error('Bu plana zaten aktif aboneliğiniz var');
        err.code = 'ALREADY_OWNED';
        throw err;
    }

    const existingSub = await findActiveUserSubscription(pool, userId, category);
    const pricingPlanRef = getPricingPlanRef(packageSlug);

    const row = userResult.rows[0];
    const user = {
        id: row.id,
        email: row.email,
        full_name: [row.first_name, row.last_name].filter(Boolean).join(' ')
    };

    if (existingSub && existingSub.iyzico_subscription_ref) {
        const currentRank = { beginner: 1, intermediate: 2, advanced: 3 }[existingSub.level] || 0;
        const newRank = { beginner: 1, intermediate: 2, advanced: 3 }[level] || 0;
        if (newRank > currentRank) {
            const upgrade = await upgradeSubscription(
                existingSub.iyzico_subscription_ref,
                pricingPlanRef
            );
            if (upgrade.status === 'success' && upgrade.data) {
                const periodEnd = computePeriodEndFromDetail({ data: upgrade.data });
                await syncSubscriptionAccess(
                    pool,
                    userId,
                    category,
                    level,
                    packageSlug,
                    upgrade.data,
                    periodEnd
                );
                const base = frontendBaseUrl(req);
                return {
                    upgraded: true,
                    subscriptionRef: upgrade.data.referenceCode,
                    price: expectedPrice,
                    packageSlug,
                    successRedirect: `${base}/odeme/basarili?upgraded=1`,
                    failureRedirect: `${base}/odeme/hata`
                };
            }
        }
    }

    const init = await initializeSubscriptionCheckoutForm({
        user,
        category,
        level,
        packageSlug,
        callbackUrl: subscriptionCallbackUrl(req)
    });

    await pool.query(
        `INSERT INTO payment_orders (
            user_id, category, level, price, conversation_id, token, status,
            package_slug, order_type, pricing_plan_ref
         ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, 'subscription', $8)
         ON CONFLICT (conversation_id) DO UPDATE SET
            token = EXCLUDED.token,
            status = 'pending',
            package_slug = EXCLUDED.package_slug,
            price = EXCLUDED.price,
            order_type = 'subscription',
            pricing_plan_ref = EXCLUDED.pricing_plan_ref,
            updated_at = CURRENT_TIMESTAMP`,
        [
            userId,
            category,
            level,
            expectedPrice,
            init.conversationId,
            init.token,
            packageSlug || level,
            init.pricingPlanReferenceCode
        ]
    );

    const base = frontendBaseUrl(req);
    return {
        paymentPageUrl: '',
        checkoutFormContent: init.checkoutFormContent,
        conversationId: init.conversationId,
        price: expectedPrice,
        packageSlug: packageSlug || level,
        orderType: 'subscription',
        checkoutPage: `${base}/odeme/iyzico`,
        successRedirect: `${base}/odeme/basarili`,
        failureRedirect: `${base}/odeme/hata`
    };
}

function isSubscriptionWebhookEvent(payload) {
    const eventType = String(payload.iyziEventType || payload.eventType || '').toLowerCase();
    if (eventType.includes('subscription')) return true;
    return Boolean(payload.subscriptionReferenceCode);
}

async function handleSubscriptionWebhook(pool, payload) {
    await ensureSubscriptionTables(pool);

    const subscriptionRef =
        payload.subscriptionReferenceCode ||
        payload.referenceCode ||
        (payload.data && payload.data.referenceCode);

    if (!subscriptionRef) {
        return { processed: 'ignored', reason: 'no_subscription_ref' };
    }

    const eventType = String(payload.iyziEventType || payload.eventType || '').toUpperCase();

    if (eventType.includes('FAILURE') || eventType.includes('CANCEL') || eventType.includes('EXPIRED')) {
        const local = await pool.query(
            'SELECT user_id, category, level FROM user_subscriptions WHERE iyzico_subscription_ref = $1',
            [subscriptionRef]
        );
        if (local.rows.length) {
            const r = local.rows[0];
            await pool.query(
                `UPDATE user_subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE iyzico_subscription_ref = $2`,
                [
                    eventType.includes('CANCEL') ? 'CANCELED' : eventType.includes('EXPIRED') ? 'EXPIRED' : 'UNPAID',
                    subscriptionRef
                ]
            );
            await pool.query(
                `UPDATE purchases SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $1 AND category = $2 AND level = $3`,
                [r.user_id, r.category, r.level]
            );
        }
        return { processed: 'subscription_inactive', subscriptionRef };
    }

    const refreshed = await refreshSubscriptionByRef(pool, subscriptionRef);
    return {
        processed: refreshed ? 'subscription_refreshed' : 'subscription_unknown',
        subscriptionRef,
        refreshed
    };
}

module.exports = {
    subscriptionCallbackUrl,
    ensureSubscriptionTables,
    createSubscriptionSession,
    processSubscriptionToken,
    refreshSubscriptionByRef,
    handleSubscriptionWebhook,
    isSubscriptionWebhookEvent,
    computePeriodEndFromDetail,
    subscriptionGrantsAccess
};
