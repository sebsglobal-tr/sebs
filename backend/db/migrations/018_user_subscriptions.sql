-- iyzico abonelik kayıtları ve payment_orders genişletmesi

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'cybersecurity',
    level VARCHAR(32) NOT NULL,
    package_slug VARCHAR(32),
    iyzico_subscription_ref VARCHAR(128) NOT NULL,
    iyzico_pricing_plan_ref VARCHAR(128),
    iyzico_customer_ref VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    current_period_end TIMESTAMPTZ,
    conversation_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_subscriptions_iyzico_ref_unique UNIQUE (iyzico_subscription_ref)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_conversation ON public.user_subscriptions(conversation_id);

ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(32) DEFAULT 'checkout';
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS subscription_ref VARCHAR(128);
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS pricing_plan_ref VARCHAR(128);
