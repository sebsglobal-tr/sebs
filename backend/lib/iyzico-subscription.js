const {
    getIyzipayClient,
    validateCredentialEnvironment,
    isIyzicoConfigured,
    conversationId,
    splitName,
    buildAddress
} = require('./iyzico-checkout');
const { getPricingPlanRef } = require('./iyzico-subscription-plans');

let Iyzipay = null;
try {
    // eslint-disable-next-line global-require
    Iyzipay = require('iyzipay');
} catch {
    Iyzipay = null;
}

function buildSubscriptionCustomer(user) {
    const email = user.email || 'noreply@sebs.global';
    const { name, surname } = splitName(user.full_name || user.name, email);
    let gsm = (process.env.IYZICO_DEFAULT_GSM || '5555555555').replace(/\D/g, '');
    if (gsm.startsWith('90')) gsm = gsm.slice(2);
    gsm = gsm.slice(-10);
    if (gsm.length < 10) gsm = '5555555555';
    const addr = buildAddress(user);
    return {
        name,
        surname,
        email,
        gsmNumber: `+90${gsm}`,
        identityNumber: process.env.IYZICO_DEFAULT_IDENTITY || '11111111111',
        billingAddress: {
            contactName: addr.contactName || name,
            city: addr.city,
            country: addr.country,
            address: addr.address,
            zipCode: addr.zipCode
        },
        shippingAddress: {
            contactName: addr.contactName || name,
            city: addr.city,
            country: addr.country,
            address: addr.address,
            zipCode: addr.zipCode
        }
    };
}

function initializeSubscriptionCheckoutForm({
    user,
    category,
    level,
    packageSlug,
    callbackUrl
}) {
    const envCheck = validateCredentialEnvironment();
    if (!envCheck.ok) {
        const err = new Error(envCheck.message);
        err.code = envCheck.code;
        throw err;
    }

    const iyzipay = getIyzipayClient();
    if (!iyzipay || !Iyzipay) {
        const err = new Error('Iyzico yapılandırılmamış');
        err.code = 'PAYMENT_PROVIDER_REQUIRED';
        throw err;
    }

    const pricingPlanReferenceCode = getPricingPlanRef(packageSlug);
    if (!pricingPlanReferenceCode) {
        const err = new Error('Abonelik planı yapılandırılmamış');
        err.code = 'SUBSCRIPTION_PLAN_NOT_CONFIGURED';
        throw err;
    }

    const convId = conversationId(user.id, category, level);

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: convId,
        callbackUrl,
        pricingPlanReferenceCode,
        subscriptionInitialStatus: Iyzipay.SUBSCRIPTION_INITIAL_STATUS.ACTIVE,
        customer: buildSubscriptionCustomer(user)
    };

    return new Promise((resolve, reject) => {
        iyzipay.subscriptionCheckoutForm.initialize(request, (err, result) => {
            if (err) return reject(err);
            if (result.status !== 'success') {
                const e = new Error(result.errorMessage || 'Abonelik checkout başlatılamadı');
                e.iyzico = result;
                e.code = 'SUBSCRIPTION_INIT_FAILED';
                return reject(e);
            }
            if (!result.token && !result.checkoutFormContent) {
                const e = new Error('Abonelik ödeme formu dönmedi');
                e.iyzico = result;
                e.code = 'SUBSCRIPTION_INIT_FAILED';
                return reject(e);
            }
            resolve({
                conversationId: convId,
                token: result.token,
                checkoutFormContent: result.checkoutFormContent,
                pricingPlanReferenceCode
            });
        });
    });
}

function retrieveSubscriptionCheckoutForm(token) {
    const iyzipay = getIyzipayClient();
    if (!iyzipay) {
        const err = new Error('Iyzico yapılandırılmamış');
        err.code = 'PAYMENT_PROVIDER_REQUIRED';
        throw err;
    }
    return new Promise((resolve, reject) => {
        iyzipay.subscriptionCheckoutForm.retrieve({ token }, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function retrieveSubscriptionDetail(subscriptionReferenceCode) {
    const iyzipay = getIyzipayClient();
    if (!iyzipay) {
        const err = new Error('Iyzico yapılandırılmamış');
        err.code = 'PAYMENT_PROVIDER_REQUIRED';
        throw err;
    }
    return new Promise((resolve, reject) => {
        iyzipay.subscription.retrieve(
            { subscriptionReferenceCode },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
}

function upgradeSubscription(subscriptionReferenceCode, newPricingPlanReferenceCode) {
    const iyzipay = getIyzipayClient();
    if (!iyzipay || !Iyzipay) {
        const err = new Error('Iyzico yapılandırılmamış');
        err.code = 'PAYMENT_PROVIDER_REQUIRED';
        throw err;
    }
    return new Promise((resolve, reject) => {
        iyzipay.subscription.upgrade(
            {
                subscriptionReferenceCode,
                upgradePeriod: Iyzipay.SUBSCRIPTION_UPGRADE_PERIOD.NOW,
                newPricingPlanReferenceCode,
                useTrial: false,
                resetRecurrenceCount: false
            },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
}

module.exports = {
    isIyzicoConfigured,
    initializeSubscriptionCheckoutForm,
    retrieveSubscriptionCheckoutForm,
    retrieveSubscriptionDetail,
    upgradeSubscription,
    buildSubscriptionCustomer
};
