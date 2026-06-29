const crypto = require('crypto');

/**
 * HPP (Checkout Form) webhook — X-IYZ-SIGNATURE-V3
 * key = secretKey + iyziEventType + iyziPaymentId + token + paymentConversationId + status
 */
function verifyHppWebhookSignature(payload, signatureHeader) {
    const secretKey = process.env.IYZICO_SECRET_KEY;
    if (!secretKey || !signatureHeader) return false;

    const iyziEventType = String(payload.iyziEventType || '');
    const iyziPaymentId = String(payload.iyziPaymentId || payload.paymentId || '');
    const token = String(payload.token || '');
    const paymentConversationId = String(payload.paymentConversationId || '');
    const status = String(payload.status || '');

    const message = secretKey + iyziEventType + iyziPaymentId + token + paymentConversationId + status;
    const expected = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
    const received = String(signatureHeader).trim().toLowerCase();
    return expected === received;
}

function parseWebhookBody(req) {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
        return req.body;
    }
    return {};
}

module.exports = {
    verifyHppWebhookSignature,
    parseWebhookBody
};
