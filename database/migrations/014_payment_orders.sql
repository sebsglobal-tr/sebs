-- Iyzico checkout orders (pending until callback confirms payment)
CREATE TABLE IF NOT EXISTS payment_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    level VARCHAR(32) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    conversation_id VARCHAR(128) NOT NULL UNIQUE,
    token VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    iyzico_payment_id VARCHAR(128),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
