-- Fix Remaining Performance Issues
-- Kalan performans sorunlarını düzelt

-- ============================================
-- 1. EKSİK INDEX'LER
-- ============================================

-- purchases.is_active için index (composite index'te var ama tek başına da ekleyelim)
CREATE INDEX IF NOT EXISTS idx_purchases_is_active ON purchases(is_active) WHERE is_active = TRUE;

-- company_recommendations tablosu için indexler (eğer tablo varsa)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'company_recommendations'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_company_recommendations_bootcamp_id 
        ON company_recommendations(bootcamp_id);
        
        CREATE INDEX IF NOT EXISTS idx_company_recommendations_intern_pool_id 
        ON company_recommendations(intern_pool_id);
        
        RAISE NOTICE 'company_recommendations indexleri eklendi';
    END IF;
END $$;

-- ============================================
-- 2. EK PERFORMANS İYİLEŞTİRMELERİ
-- ============================================

-- Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_purchases_active_user ON purchases(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_module_progress_active_user ON module_progress(user_id) WHERE is_completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_enrollments_active_user ON enrollments(user_id) WHERE is_active = TRUE;

-- purchases.is_active için standalone index (composite'te var ama tek başına da ekleyelim)
CREATE INDEX IF NOT EXISTS idx_purchases_is_active_standalone ON purchases(is_active);

-- ============================================
-- 3. QUERY OPTIMIZATION
-- ============================================

-- Update table statistics (ANALYZE only, VACUUM must run outside transaction)
-- Note: Run VACUUM ANALYZE manually or via cron job
-- ANALYZE purchases;
-- ANALYZE module_progress;
-- ANALYZE users;
-- ANALYZE enrollments;
-- ANALYZE certificates;

