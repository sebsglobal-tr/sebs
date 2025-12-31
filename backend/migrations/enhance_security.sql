-- Advanced Security Enhancements
-- Gelişmiş güvenlik iyileştirmeleri

-- ============================================
-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on sensitive tables (if supported)
-- Note: Supabase may have its own RLS policies

-- ============================================
-- 2. PASSWORD POLICY ENFORCEMENT
-- ============================================

-- Create function to validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if password hash looks like bcrypt (starts with $2a$, $2b$, or $2y$)
    IF password_hash ~ '^\$2[aby]\$' THEN
        RETURN TRUE;
    END IF;
    
    -- If not bcrypt format, it's insecure
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add trigger to validate password on insert/update
CREATE OR REPLACE FUNCTION check_password_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password_hash IS NOT NULL THEN
        IF NOT validate_password_strength(NEW.password_hash) THEN
            RAISE EXCEPTION 'Password hash must be bcrypt format';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_password_hash_trigger ON users;
CREATE TRIGGER check_password_hash_trigger
    BEFORE INSERT OR UPDATE OF password_hash ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_password_hash();

-- ============================================
-- 3. RATE LIMITING SUPPORT
-- ============================================

-- Create table for rate limiting (if not exists)
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP address or user_id
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_identifier_endpoint UNIQUE (identifier, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits
    WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. AUDIT LOGGING ENHANCEMENTS
-- ============================================

-- Enhance security_logs table if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'security_logs'
    ) THEN
        -- Add IP address column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'security_logs' 
            AND column_name = 'ip_address'
        ) THEN
            ALTER TABLE security_logs ADD COLUMN ip_address INET;
            RAISE NOTICE 'security_logs.ip_address added';
        END IF;
        
        -- Add user_agent column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'security_logs' 
            AND column_name = 'user_agent'
        ) THEN
            ALTER TABLE security_logs ADD COLUMN user_agent TEXT;
            RAISE NOTICE 'security_logs.user_agent added';
        END IF;
    END IF;
END $$;

-- ============================================
-- 5. DATA ENCRYPTION SUPPORT
-- ============================================

-- Create function to encrypt sensitive data (placeholder - use pgcrypto in production)
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    -- In production, use pgcrypto extension
    -- For now, return as-is (should be encrypted at application level)
    RETURN data;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 6. BACKUP AND RECOVERY SUPPORT
-- ============================================

-- Create backup metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'schema_only'
    backup_file_path TEXT,
    backup_size_bytes BIGINT,
    tables_backed_up TEXT[], -- Array of table names
    backup_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_metadata_status ON backup_metadata(status, backup_started_at);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_type ON backup_metadata(backup_type);

-- ============================================
-- 7. CONNECTION MONITORING
-- ============================================

-- Create connection monitoring table
CREATE TABLE IF NOT EXISTS connection_monitor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id TEXT,
    user_id TEXT,
    ip_address INET,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP,
    duration_seconds INTEGER,
    queries_executed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_connection_monitor_user ON connection_monitor(user_id, connected_at);
CREATE INDEX IF NOT EXISTS idx_connection_monitor_ip ON connection_monitor(ip_address, connected_at);

-- ============================================
-- 8. QUERY PERFORMANCE MONITORING
-- ============================================

-- Create slow query log table
CREATE TABLE IF NOT EXISTS slow_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    execution_time_ms NUMERIC(10, 2),
    rows_returned INTEGER,
    user_id TEXT,
    endpoint TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slow_queries_time ON slow_queries(execution_time_ms DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slow_queries_user ON slow_queries(user_id, created_at DESC);

-- ============================================
-- 9. DATA VALIDATION FUNCTIONS
-- ============================================

-- Email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add email validation trigger
CREATE OR REPLACE FUNCTION validate_user_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS NOT NULL AND NOT is_valid_email(NEW.email) THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_email_trigger ON users;
CREATE TRIGGER validate_user_email_trigger
    BEFORE INSERT OR UPDATE OF email ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_email();

-- ============================================
-- 10. AUTOMATED MAINTENANCE
-- ============================================

-- Create maintenance log table
CREATE TABLE IF NOT EXISTS maintenance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_type VARCHAR(50) NOT NULL, -- 'vacuum', 'analyze', 'reindex', 'backup'
    table_name TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_log_status ON maintenance_log(status, started_at);

-- ============================================
-- 11. COMMENTS
-- ============================================

COMMENT ON TABLE rate_limits IS 'API rate limiting için kullanıcı/IP bazlı istek sayısı takibi';
COMMENT ON TABLE backup_metadata IS 'Veritabanı yedekleme işlemlerinin metadata kayıtları';
COMMENT ON TABLE connection_monitor IS 'Veritabanı bağlantı izleme ve performans takibi';
COMMENT ON TABLE slow_queries IS 'Yavaş sorgu logları - performans optimizasyonu için';
COMMENT ON TABLE maintenance_log IS 'Otomatik bakım işlemlerinin log kayıtları';

COMMENT ON FUNCTION validate_password_strength IS 'Password hash formatını doğrular (bcrypt)';
COMMENT ON FUNCTION is_valid_email IS 'E-posta formatını doğrular';
COMMENT ON FUNCTION cleanup_rate_limits IS 'Eski rate limit kayıtlarını temizler';

