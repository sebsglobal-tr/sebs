-- Extend payment_orders for webhook cross-validation and audit
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS package_slug VARCHAR(32);
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS paid_price DECIMAL(10, 2);
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS iyzico_status VARCHAR(64);
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS webhook_ref VARCHAR(128);
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS verify_source VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_payment_orders_iyzico_payment_id ON payment_orders(iyzico_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_token ON payment_orders(token);
