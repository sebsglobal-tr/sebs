/**
 * Google Ads / GA4 dönüşüm olayları — SEBS ödeme akışı
 * Google Ads > Hedefler > Dönüşümler panelinden etiketleri alıp aşağıya ekleyin:
 *   AW-18167051322/XXXXXXXX
 */
(function (global) {
    var AW_ID = 'AW-18167051322';
    var CONVERSIONS = {
        beginCheckout: '',
        purchase: '',
        subscribe: ''
    };

    function gtagSafe() {
        return typeof global.gtag === 'function';
    }

    function dedupeKey(name, id) {
        return 'sebs_gads_' + name + '_' + String(id || '');
    }

    function wasTracked(name, id) {
        try {
            return global.sessionStorage.getItem(dedupeKey(name, id)) === '1';
        } catch (e) {
            return false;
        }
    }

    function markTracked(name, id) {
        try {
            global.sessionStorage.setItem(dedupeKey(name, id), '1');
        } catch (e) { /* */ }
    }

    function buildItems(opts) {
        if (!opts) return undefined;
        var value = opts.value != null ? Number(opts.value) : undefined;
        var id = [opts.category, opts.level].filter(Boolean).join('/') || opts.itemId || 'sebs-package';
        return [
            {
                item_id: id,
                item_name: opts.itemName || opts.packageTitle || id,
                price: value,
                quantity: 1
            }
        ];
    }

    function fireAdsConversion(key, value) {
        var sendTo = CONVERSIONS[key];
        if (!sendTo || !gtagSafe()) return;
        var payload = { send_to: sendTo, currency: 'TRY' };
        if (value != null && !isNaN(Number(value))) payload.value = Number(value);
        global.gtag('event', 'conversion', payload);
    }

    function trackBeginCheckout(opts) {
        if (!gtagSafe()) return;
        if (wasTracked('begin', 'checkout')) return;
        opts = opts || {};
        var value = opts.value != null ? Number(opts.value) : undefined;
        var items = buildItems(opts);
        var eventPayload = { currency: 'TRY' };
        if (value != null && !isNaN(value)) eventPayload.value = value;
        if (items) eventPayload.items = items;

        global.gtag('event', 'begin_checkout', eventPayload);
        global.gtag('event', 'click', {
            event_category: 'checkout',
            event_label: opts.itemName || 'payment_confirm',
            value: value
        });
        fireAdsConversion('beginCheckout', value);
        markTracked('begin', 'checkout');
    }

    function trackPurchase(opts) {
        if (!gtagSafe()) return;
        opts = opts || {};
        var txId = opts.transactionId || opts.conversationId;
        if (txId && wasTracked('purchase', txId)) return;

        var value = opts.value != null ? Number(opts.value) : undefined;
        var items = buildItems(opts);
        var eventPayload = {
            transaction_id: txId,
            currency: 'TRY'
        };
        if (value != null && !isNaN(value)) eventPayload.value = value;
        if (items) eventPayload.items = items;

        global.gtag('event', 'purchase', eventPayload);
        fireAdsConversion('purchase', value);
        if (txId) markTracked('purchase', txId);
    }

    function trackSubscribe(opts) {
        if (!gtagSafe()) return;
        opts = opts || {};
        var txId = opts.transactionId || opts.conversationId;
        if (txId && wasTracked('subscribe', txId)) return;

        var value = opts.value != null ? Number(opts.value) : undefined;
        var eventPayload = { currency: 'TRY' };
        if (value != null && !isNaN(value)) eventPayload.value = value;

        global.gtag('event', 'subscribe', eventPayload);
        global.gtag('event', 'purchase', {
            transaction_id: txId,
            value: value,
            currency: 'TRY',
            items: buildItems(opts)
        });
        fireAdsConversion('subscribe', value);
        if (txId) markTracked('subscribe', txId);
    }

    global.sebsAds = {
        AW_ID: AW_ID,
        CONVERSIONS: CONVERSIONS,
        trackBeginCheckout: trackBeginCheckout,
        trackPurchase: trackPurchase,
        trackSubscribe: trackSubscribe
    };

    var path = (global.location.pathname || '').replace(/\/+$/, '');

    if (path === '/odeme/iyzico' || path.endsWith('/odeme/iyzico.html')) {
        try {
            var raw = global.sessionStorage.getItem('sebs_iyzico_checkout');
            if (raw) {
                var data = JSON.parse(raw);
                trackBeginCheckout({
                    value: data.value,
                    category: data.category,
                    level: data.level,
                    packageTitle: data.packageTitle,
                    itemName: data.packageTitle,
                    conversationId: data.conversationId
                });
            }
        } catch (e) { /* */ }
    }
})(window);
