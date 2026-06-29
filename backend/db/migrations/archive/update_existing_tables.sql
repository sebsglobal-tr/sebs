-- Update existing tables with missing columns
-- This migration only adds missing columns, does not modify existing structure

-- ============================================
-- 1. USERS TABLE - Add access_level if missing
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'access_level'
        ) THEN
            ALTER TABLE users ADD COLUMN access_level VARCHAR(20) DEFAULT 'beginner';
            CREATE INDEX IF NOT EXISTS idx_users_access_level ON users(access_level);
        END IF;
    END IF;
END $$;

-- ============================================
-- 2. MODULE_PROGRESS TABLE - Add missing columns
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'module_progress'
    ) THEN
        -- Add time_spent_minutes if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'module_progress' 
            AND column_name = 'time_spent_minutes'
        ) THEN
            ALTER TABLE module_progress ADD COLUMN time_spent_minutes INTEGER DEFAULT 0;
        END IF;
        
        -- Add last_accessed_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'module_progress' 
            AND column_name = 'last_accessed_at'
        ) THEN
            ALTER TABLE module_progress ADD COLUMN last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        -- Add completed_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'module_progress' 
            AND column_name = 'completed_at'
        ) THEN
            ALTER TABLE module_progress ADD COLUMN completed_at TIMESTAMP;
        END IF;
    END IF;
END $$;

-- Create indexes for module_progress if they don't exist
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_is_completed ON module_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_module ON module_progress(user_id, module_id);

-- ============================================
-- 3. CERTIFICATES TABLE - Add missing columns
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'certificates'
    ) THEN
        -- Add certificate_url if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'certificates' 
            AND column_name = 'certificate_url'
        ) THEN
            ALTER TABLE certificates ADD COLUMN certificate_url TEXT;
        END IF;
        
        -- Add metadata if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'certificates' 
            AND column_name = 'metadata'
        ) THEN
            ALTER TABLE certificates ADD COLUMN metadata TEXT;
        END IF;
    END IF;
END $$;

-- Create indexes for certificates if they don't exist
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON certificates(category);
CREATE INDEX IF NOT EXISTS idx_certificates_earned_at ON certificates(earned_at DESC);

-- ============================================
-- 4. ENROLLMENTS TABLE - Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON enrollments(is_active);

-- ============================================
-- 5. SIMULATION_RUNS TABLE - Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_module_id ON simulation_runs(module_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_simulation_id ON simulation_runs(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_completed_at ON simulation_runs(completed_at DESC);

-- ============================================
-- 6. REFRESH_TOKENS TABLE - Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

