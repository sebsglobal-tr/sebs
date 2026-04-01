-- Complete Database Schema for SEBS Global
-- This migration creates all necessary tables for the system

-- ============================================
-- 1. PURCHASES TABLE
-- ============================================
-- Create purchases table if not exists
-- Note: user_id is TEXT to match users.id column type in Supabase
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
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

-- Add foreign key constraint if it doesn't exist and users table exists
DO $$
BEGIN
    -- Check if users table exists in public schema
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        -- Check if foreign key already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'purchases_user_id_fkey'
        ) THEN
            -- Try to add foreign key
            BEGIN
                ALTER TABLE purchases 
                ADD CONSTRAINT purchases_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                RAISE NOTICE 'Foreign key constraint added successfully';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
            END;
        END IF;
    ELSE
        RAISE NOTICE 'Users table not found in public schema, skipping foreign key';
    END IF;
END $$;

-- Indexes for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_category ON purchases(category);
CREATE INDEX IF NOT EXISTS idx_purchases_level ON purchases(level);
CREATE INDEX IF NOT EXISTS idx_purchases_active ON purchases(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_purchases_updated_at();

-- ============================================
-- 2. USERS TABLE (if not exists, add missing columns)
-- ============================================
-- Check and add access_level column if missing
DO $$
BEGIN
    -- Check if users table exists in public schema
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'access_level'
        ) THEN
            ALTER TABLE users ADD COLUMN access_level VARCHAR(20) DEFAULT 'beginner';
            CREATE INDEX IF NOT EXISTS idx_users_access_level ON users(access_level);
        END IF;
    END IF;
END $$;

-- ============================================
-- 3. MODULE_PROGRESS TABLE (ensure structure is correct)
-- ============================================
-- Verify module_progress table has all required columns
DO $$
BEGIN
    -- Check if table exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'module_progress'
    ) THEN
        -- Add time_spent_minutes if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'time_spent_minutes'
        ) THEN
            ALTER TABLE module_progress ADD COLUMN time_spent_minutes INTEGER DEFAULT 0;
        END IF;
        
        -- Add last_accessed_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'last_accessed_at'
        ) THEN
            ALTER TABLE module_progress ADD COLUMN last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        -- Add completed_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'completed_at'
        ) THEN
            ALTER TABLE module_progress ADD COLUMN completed_at TIMESTAMP;
        END IF;
    END IF;
END $$;

-- Indexes for module_progress
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_is_completed ON module_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_module ON module_progress(user_id, module_id);

-- ============================================
-- 4. ENROLLMENTS TABLE (ensure structure is correct)
-- ============================================
-- Indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON enrollments(is_active);

-- ============================================
-- 5. CERTIFICATES TABLE (ensure structure is correct)
-- ============================================
-- Verify certificates table structure
DO $$
BEGIN
    -- Check if table exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'certificates'
    ) THEN
        -- Add certificate_url if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'certificate_url'
        ) THEN
            ALTER TABLE certificates ADD COLUMN certificate_url TEXT;
        END IF;
        
        -- Add metadata if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'metadata'
        ) THEN
            ALTER TABLE certificates ADD COLUMN metadata TEXT;
        END IF;
    END IF;
END $$;

-- Indexes for certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON certificates(category);
CREATE INDEX IF NOT EXISTS idx_certificates_earned_at ON certificates(earned_at DESC);

-- ============================================
-- 6. SIMULATION_RUNS TABLE (ensure structure is correct)
-- ============================================
-- Indexes for simulation_runs
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_module_id ON simulation_runs(module_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_simulation_id ON simulation_runs(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_completed_at ON simulation_runs(completed_at DESC);

-- ============================================
-- 7. USER_PACKAGE_PURCHASES TABLE (ensure structure matches purchases)
-- ============================================
-- Verify user_package_purchases table structure
DO $$
BEGIN
    -- Check if table exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_package_purchases'
    ) THEN
        -- Add payment_status if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'user_package_purchases' AND column_name = 'payment_status'
        ) THEN
            ALTER TABLE user_package_purchases ADD COLUMN payment_status VARCHAR(20) DEFAULT 'completed';
        END IF;
        
        -- Add payment_method if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'user_package_purchases' AND column_name = 'payment_method'
        ) THEN
            ALTER TABLE user_package_purchases ADD COLUMN payment_method VARCHAR(50);
        END IF;
        
        -- Add transaction_id if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'user_package_purchases' AND column_name = 'transaction_id'
        ) THEN
            ALTER TABLE user_package_purchases ADD COLUMN transaction_id VARCHAR(255);
        END IF;
        
        -- Add expires_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'user_package_purchases' AND column_name = 'expires_at'
        ) THEN
            ALTER TABLE user_package_purchases ADD COLUMN expires_at TIMESTAMP;
        END IF;
    END IF;
END $$;

-- Indexes for user_package_purchases
CREATE INDEX IF NOT EXISTS idx_user_package_purchases_user_id ON user_package_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_package_purchases_category ON user_package_purchases(category);
CREATE INDEX IF NOT EXISTS idx_user_package_purchases_level ON user_package_purchases(level);
CREATE INDEX IF NOT EXISTS idx_user_package_purchases_active ON user_package_purchases(is_active, expires_at);

-- ============================================
-- 8. REFRESH_TOKENS TABLE (ensure structure is correct)
-- ============================================
-- Indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- 9. COMMENTS
-- ============================================
COMMENT ON TABLE purchases IS 'Kullanıcı paket satın alımlarını tutar';
COMMENT ON COLUMN purchases.category IS 'Kategori: cybersecurity, cloud, data-science';
COMMENT ON COLUMN purchases.level IS 'Seviye: beginner, intermediate, advanced';
COMMENT ON COLUMN purchases.expires_at IS 'NULL ise ömür boyu erişim';
COMMENT ON COLUMN purchases.is_active IS 'Aktif satın alım mı?';

COMMENT ON COLUMN users.access_level IS 'Kullanıcının erişim seviyesi: beginner, intermediate, advanced';
COMMENT ON COLUMN module_progress.percent_complete IS 'Modül tamamlanma yüzdesi (0-100)';
COMMENT ON COLUMN module_progress.time_spent_minutes IS 'Modülde harcanan toplam süre (dakika)';

