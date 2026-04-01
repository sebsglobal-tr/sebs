-- Fix Remaining RLS Issues
-- Kalan RLS sorunlarını düzelt

-- ============================================
-- 1. ENABLE RLS ON REMAINING TABLES
-- ============================================

-- Enable RLS on remaining tables
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE slow_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. CREATE RLS POLICIES FOR REMAINING TABLES
-- ============================================

-- _prisma_migrations: Only service role should access (migration history)
CREATE POLICY "Service role full access" ON _prisma_migrations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- rate_limits: Service role can manage rate limits
CREATE POLICY "Service role full access" ON rate_limits
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- backup_metadata: Service role can manage backup metadata
CREATE POLICY "Service role full access" ON backup_metadata
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- connection_monitor: Service role can monitor connections
CREATE POLICY "Service role full access" ON connection_monitor
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- slow_queries: Service role can log slow queries
CREATE POLICY "Service role full access" ON slow_queries
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- maintenance_log: Service role can log maintenance activities
CREATE POLICY "Service role full access" ON maintenance_log
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 3. COMMENTS
-- ============================================

COMMENT ON TABLE _prisma_migrations IS 'Prisma migration history - RLS enabled, service role only';
COMMENT ON TABLE rate_limits IS 'Rate limiting table - RLS enabled, service role only';
COMMENT ON TABLE backup_metadata IS 'Backup metadata - RLS enabled, service role only';
COMMENT ON TABLE connection_monitor IS 'Connection monitoring - RLS enabled, service role only';
COMMENT ON TABLE slow_queries IS 'Slow query logs - RLS enabled, service role only';
COMMENT ON TABLE maintenance_log IS 'Maintenance logs - RLS enabled, service role only';

