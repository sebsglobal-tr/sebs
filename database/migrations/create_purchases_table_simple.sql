-- Create purchases table for SEBS Global
-- This table stores user package purchases

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS purchases CASCADE;

-- Create purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- TEXT to match users.id in Supabase
    category VARCHAR(50) NOT NULL, -- 'cybersecurity', 'cloud', 'data-science'
    level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', etc.
    transaction_id VARCHAR(255), -- External payment transaction ID
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- NULL means lifetime access
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure user can only have one active purchase per category and level
    CONSTRAINT unique_user_category_level UNIQUE (user_id, category, level)
);

-- Create indexes for faster queries
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_category ON purchases(category);
CREATE INDEX idx_purchases_level ON purchases(level);
CREATE INDEX idx_purchases_active ON purchases(is_active, expires_at);
CREATE INDEX idx_purchases_purchased_at ON purchases(purchased_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_purchases_updated_at();

-- Add comments
COMMENT ON TABLE purchases IS 'Kullanıcı paket satın alımlarını tutar';
COMMENT ON COLUMN purchases.category IS 'Kategori: cybersecurity, cloud, data-science';
COMMENT ON COLUMN purchases.level IS 'Seviye: beginner, intermediate, advanced';
COMMENT ON COLUMN purchases.expires_at IS 'NULL ise ömür boyu erişim';
COMMENT ON COLUMN purchases.is_active IS 'Aktif satın alım mı?';

