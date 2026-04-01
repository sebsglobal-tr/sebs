-- ============================================
-- SONUÇLARI KONTROL ET
-- Bu query'yi çalıştırarak index'lerin silindiğini doğrulayın
-- ============================================

-- 1. Foreign key index'in eklendiğini kontrol et
SELECT 
    'Foreign Key Index' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'job_applications' 
            AND indexname = 'idx_job_applications_job_posting_id'
        ) THEN '✅ Eklendi'
        ELSE '❌ Eklenmedi (tablo veya FK yok olabilir)'
    END as status;

-- 2. Kalan kullanılmayan index'lerin sayısını göster
SELECT 
    'Kalan Kullanılmayan Index Sayısı' as check_type,
    COUNT(*)::text as status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'
AND indexrelname NOT LIKE '%_key'
AND indexrelname != 'idx_job_applications_job_posting_id';

-- 3. Kalan kullanılmayan index'leri listele (ilk 20)
SELECT 
    tablename,
    indexrelname as indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan as usage_count
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'
AND indexrelname NOT LIKE '%_key'
AND indexrelname != 'idx_job_applications_job_posting_id'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
