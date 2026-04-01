// Webhook Routes for Payment Providers
// Handles payment callbacks from iyzico, Stripe, etc.

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service role key for webhooks');
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Iyzico Payment Webhook
 * POST /api/webhook/iyzico
 */
router.post('/iyzico', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature (implement based on iyzico docs)
    const signature = req.headers['x-iyzico-signature'];
    const webhookSecret = process.env.IYZICO_WEBHOOK_SECRET;

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }
    }

    const { event, data } = req.body;

    // Handle payment events
    if (event === 'payment.success') {
      const { transactionId, userId, packageId, amount } = data;

      // Update purchase status
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('transaction_id', transactionId);

      if (purchaseError) {
        console.error('Purchase update error:', purchaseError);
        return res.status(500).json({ success: false, message: 'Failed to update purchase' });
      }

      // Get package details
      const { data: packageData } = await supabase
        .from('packages')
        .select('category, level, duration_days')
        .eq('id', packageId)
        .single();

      if (packageData) {
        // Calculate expiry date
        const expiresAt = packageData.duration_days
          ? new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000)
          : null;

        // Create or update entitlement
        const { error: entitlementError } = await supabase
          .from('entitlements')
          .upsert({
            user_id: userId,
            category: packageData.category,
            level: packageData.level,
            purchased_at: new Date().toISOString(),
            expires_at: expiresAt ? expiresAt.toISOString() : null,
            is_active: true,
            purchase_id: transactionId
          }, {
            onConflict: 'user_id,category,level'
          });

        if (entitlementError) {
          console.error('Entitlement creation error:', entitlementError);
        }
      }
    } else if (event === 'payment.failed') {
      // Update purchase status to failed
      const { transactionId } = data;
      await supabase
        .from('purchases')
        .update({ status: 'failed' })
        .eq('transaction_id', transactionId);
    } else if (event === 'payment.refunded') {
      // Deactivate entitlement
      const { transactionId } = data;
      await supabase
        .from('entitlements')
        .update({ is_active: false })
        .eq('purchase_id', transactionId);

      await supabase
        .from('purchases')
        .update({ status: 'refunded' })
        .eq('transaction_id', transactionId);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

/**
 * Stripe Payment Webhook
 * POST /api/webhook/stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify Stripe webhook signature
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).json({ success: false, message: `Webhook signature verification failed: ${err.message}` });
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { transactionId, userId, packageId } = paymentIntent.metadata;

      // Similar logic as iyzico webhook
      // Update purchase and create entitlement
      // ... (implement based on your needs)
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

export default router;
