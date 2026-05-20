const crypto = require('crypto');
const { getExpectedPrice, normalizeLevel, getRoadPackageLabel } = require('./package-prices');

let Iyzipay = null;
try {
    // eslint-disable-next-line global-require
    Iyzipay = require('iyzipay');
} catch {
    Iyzipay = null;
}

function isIyzicoConfigured() {
    return Boolean(
        Iyzipay &&
            process.env.IYZICO_API_KEY &&
            process.env.IYZICO_SECRET_KEY
    );
}

function getIyzipayClient() {
    if (!isIyzicoConfigured()) return null;
    return new Iyzipay({
        apiKey: process.env.IYZICO_API_KEY,
        secretKey: process.env.IYZICO_SECRET_KEY,
        uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });
}

function conversationId(userId, category, level) {
    const slug = `${userId}-${category}-${level}`.replace(/[^a-zA-Z0-9_-]/g, '-');
    return `sebs-${slug}-${Date.now()}`.slice(0, 64);
}

function splitName(fullName, email) {
    const parts = String(fullName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length >= 2) {
        return { name: parts[0], surname: parts.slice(1).join(' ') };
    }
    const local = (email || 'kullanici').split('@')[0];
    return { name: local.slice(0, 30) || 'SEBS', surname: 'Kullanici' };
}

function buildBuyer(user) {
    const email = user.email || 'noreply@sebs.global';
    const { name, surname } = splitName(user.full_name || user.name, email);
    const gsm = (process.env.IYZICO_DEFAULT_GSM || '5555555555').replace(/\D/g, '').slice(-11);
    return {
        id: String(user.id),
        name,
        surname,
        gsmNumber: gsm.startsWith('+') ? gsm : `+90${gsm}`,
        email,
        identityNumber: process.env.IYZICO_DEFAULT_IDENTITY || '11111111111',
        lastLoginDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        registrationDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        registrationAddress: process.env.IYZICO_DEFAULT_ADDRESS || 'Istanbul Turkiye',
        ip: process.env.IYZICO_DEFAULT_IP || '85.34.78.112',
        city: process.env.IYZICO_DEFAULT_CITY || 'Istanbul',
        country: 'Turkey',
        zipCode: process.env.IYZICO_DEFAULT_ZIP || '34000'
    };
}

function buildAddress(user) {
    return {
        contactName: splitName(user.full_name || user.name, user.email).name,
        city: process.env.IYZICO_DEFAULT_CITY || 'Istanbul',
        country: 'Turkey',
        address: process.env.IYZICO_DEFAULT_ADDRESS || 'Istanbul Turkiye',
        zipCode: process.env.IYZICO_DEFAULT_ZIP || '34000'
    };
}

function levelLabel(level) {
    const map = { beginner: 'Temel', intermediate: 'Orta', advanced: 'İleri' };
    return map[level] || level;
}

function categoryLabel(category) {
    const map = {
        cybersecurity: 'Siber Güvenlik',
        cloud: 'Bulut Bilişim',
        'data-science': 'Veri Bilimleri'
    };
    return map[category] || category;
}

function initializeCheckoutForm({ user, category, level, callbackUrl, packageSlug }) {
    const iyzipay = getIyzipayClient();
    if (!iyzipay) {
        const err = new Error('Iyzico yapılandırılmamış');
        err.code = 'PAYMENT_PROVIDER_REQUIRED';
        throw err;
    }

    const backendLevel = normalizeLevel(level);
    const price = getExpectedPrice(category, backendLevel);
    if (price == null) {
        const err = new Error('Geçersiz paket');
        err.code = 'INVALID_PACKAGE';
        throw err;
    }

    const convId = conversationId(user.id, category, backendLevel);
    const priceStr = price.toFixed(2);
    const roadSlug = packageSlug || level;
    const itemName =
        packageSlug === 'test-odeme'
            ? 'SEBS — Sandbox Test Ödemesi'
            : packageSlug && getRoadPackageLabel(packageSlug)
              ? `SEBS Yolu — ${getRoadPackageLabel(packageSlug)} Planı`
              : `${categoryLabel(category)} — ${levelLabel(backendLevel)} Paket`;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: convId,
        price: priceStr,
        paidPrice: priceStr,
        currency: Iyzipay.CURRENCY.TRY,
        basketId: `BASKET-${convId}`,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl,
        enabledInstallments: [1],
        buyer: buildBuyer(user),
        shippingAddress: buildAddress(user),
        billingAddress: buildAddress(user),
        basketItems: [
            {
                id: `PKG-${category}-${backendLevel}`,
                name: itemName,
                category1: 'Education',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: priceStr
            }
        ]
    };

    return new Promise((resolve, reject) => {
        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) return reject(err);
            if (result.status !== 'success') {
                const e = new Error(result.errorMessage || 'Iyzico initialize başarısız');
                e.iyzico = result;
                return reject(e);
            }
            resolve({
                conversationId: convId,
                token: result.token,
                paymentPageUrl: result.paymentPageUrl,
                checkoutFormContent: result.checkoutFormContent,
                price
            });
        });
    });
}

function retrieveCheckoutForm(token) {
    const iyzipay = getIyzipayClient();
    if (!iyzipay) {
        const err = new Error('Iyzico yapılandırılmamış');
        err.code = 'PAYMENT_PROVIDER_REQUIRED';
        throw err;
    }
    return new Promise((resolve, reject) => {
        iyzipay.checkoutForm.retrieve(
            { locale: Iyzipay.LOCALE.TR, token },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
}

module.exports = {
    isIyzicoConfigured,
    initializeCheckoutForm,
    retrieveCheckoutForm,
    conversationId,
    crypto
};
