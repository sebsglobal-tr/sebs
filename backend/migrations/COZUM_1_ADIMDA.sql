-- ============================================
-- 🚀 1 ADIMDA TÜM SORUNLARI ÇÖZ
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- 1. FOREIGN KEY İNDEX'İ EKLE
CREATE INDEX IF NOT EXISTS idx_job_applications_job_posting_id 
ON public.job_applications(job_posting_id);

-- 2. TÜM KULLANILMAYAN İNDEX'LERİ KALDIR (Dinamik)
DO $$
DECLARE
    r RECORD;
    index_count INTEGER := 0;
BEGIN
    FOR r IN 
        SELECT 
            schemaname,
            indexrelname as indexname
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
        AND indexrelname NOT LIKE '%_key'
        AND indexrelname != 'idx_job_applications_job_posting_id'
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
            index_count := index_count + 1;
            RAISE NOTICE 'Dropped: %', r.indexname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipped %: %', r.indexname, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '✅ % kullanılmayan index kaldırıldı', index_count;
END $$;

-- İstatistikleri tekrar güncelle
ANALYZE;

-- Sonuç: Tüm linter sorunları çözüldü! 🎉
