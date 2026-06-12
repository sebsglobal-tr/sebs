-- payment_orders: create if missing, or fix legacy INTEGER user_id → UUID
-- Run in Supabase SQL Editor (safe to run more than once)

CREATE TABLE IF NOT EXISTS public.payment_orders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    level VARCHAR(32) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    conversation_id VARCHAR(128) NOT NULL UNIQUE,
    token VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    iyzico_payment_id VARCHAR(128),
    error_message TEXT,
    package_slug VARCHAR(32),
    paid_price DECIMAL(10, 2),
    iyzico_status VARCHAR(64),
    webhook_ref VARCHAR(128),
    verify_source VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_orders'
          AND column_name = 'user_id'
          AND data_type IN ('integer', 'bigint', 'smallint')
    ) THEN
        ALTER TABLE public.payment_orders DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;
        ALTER TABLE public.payment_orders
            ALTER COLUMN user_id TYPE UUID USING NULLIF(user_id::text, '')::uuid;
        ALTER TABLE public.payment_orders
            ADD CONSTRAINT payment_orders_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'payment_orders UUID alter skipped: %', SQLERRM;
END $$;

ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS package_slug VARCHAR(32);
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS paid_price DECIMAL(10, 2);
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS iyzico_status VARCHAR(64);
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS webhook_ref VARCHAR(128);
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS verify_source VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_iyzico_payment_id ON public.payment_orders(iyzico_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_token ON public.payment_orders(token);
