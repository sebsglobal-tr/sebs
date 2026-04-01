-- ============================================
-- Performance Fixes Based on Test Results
-- Test sonuçlarına göre performans düzeltmeleri
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- ============================================
-- 1. KULLANILMAYAN INDEX'LERİ TEMİZLE
-- ============================================
-- Test sonuçlarına göre kullanılmayan index'ler tespit edildi
-- NOT: Primary key (pkey) ve unique constraint (_key, _unique) index'leri SİLİNMİYOR
-- Bu index'ler veri bütünlüğü için kritiktir

-- Sadece normal index'leri sil (güvenli olanlar)
-- Modules indexes - kullanılmıyor ve güvenli
DROP INDEX IF EXISTS public.idx_modules_course_id;

-- Company recommendations indexes - kullanılmıyor ve güvenli
DROP INDEX IF EXISTS public.idx_company_recommendations_bootcamp_id;

-- NOT: Aşağıdaki index'ler PRIMARY KEY veya UNIQUE CONSTRAINT olduğu için SİLİNMİYOR:
-- - Tüm *_pkey index'leri (Primary keys)
-- - Tüm *_key index'leri (Unique constraints)
-- - Tüm *_unique index'leri (Unique constraints)
-- Bu index'ler veri bütünlüğü için zorunludur ve silinmemelidir

-- NOT: Foreign key index'leri korunuyor:
-- - idx_refresh_tokens_user_id (Authentication için kritik)
-- - idx_entitlements_user_id (Prisma schema'da tanımlı)
-- - idx_user_package_purchases_* (Foreign key performansı için gerekli)

-- İstatistikleri tekrar güncelle
ANALYZE;

-- ============================================
-- 2. DEAD ROWS TEMİZLE (VACUUM)
-- ============================================
-- Test sonuçlarına göre bazı tablolarda dead row'lar var:
-- - users: %11.11 dead rows (5 dead, 4 live)
-- - refresh_tokens: %7.19 dead rows (31 dead, 4 live)  
-- - _prisma_migrations: %16.67 dead rows (8 dead, 4 live)

-- VACUUM çalıştır (dead rows'ları temizler)
VACUUM ANALYZE users;
VACUUM ANALYZE refresh_tokens;
VACUUM ANALYZE _prisma_migrations;

-- Diğer tüm tablolar için de VACUUM
VACUUM ANALYZE;

-- ============================================
-- 3. QUERY PERFORMANS İYİLEŞTİRMELERİ
-- ============================================
-- Test sonuçlarına göre bazı sorgular 100ms üzerinde
-- Bu sorgular için ek index'ler eklenebilir

-- User email lookup için index zaten var (users_email_unique)
-- Ancak query'de email = parametresi kullanıldığından mevcut unique index yeterli

-- User progress query için composite index eklenebilir
CREATE INDEX IF NOT EXISTS idx_module_progress_user_last_accessed 
ON public.module_progress(user_id, last_accessed_at DESC);

-- Enrollments count query için index
CREATE INDEX IF NOT EXISTS idx_enrollments_is_active 
ON public.enrollments(is_active) WHERE is_active = true;

-- Module completion stats için index
CREATE INDEX IF NOT EXISTS idx_module_progress_module_completed 
ON public.module_progress(module_id, is_completed);

-- Recent activity query için index
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_created 
ON public.simulation_runs(user_id, created_at DESC);

-- ============================================
-- 4. STATISTICS GÜNCELLEME
-- ============================================
-- Tüm tablolar için istatistikleri güncelle
ANALYZE users;
ANALYZE modules;
ANALYZE courses;
ANALYZE module_progress;
ANALYZE enrollments;
ANALYZE simulation_runs;
ANALYZE refresh_tokens;
ANALYZE entitlements;
ANALYZE certificates;
ANALYZE behavior_data;
ANALYZE skill_scores;
ANALYZE ai_analysis;
ANALYZE security_logs;

-- ============================================
-- 5. KONTROL SORGULARI
-- ============================================
-- Dead rows kontrolü
SELECT 
    schemaname,
    relname as tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    CASE 
        WHEN n_live_tup + n_dead_tup > 0 
        THEN ROUND((n_dead_tup::numeric / (n_live_tup + n_dead_tup)) * 100, 2)
        ELSE 0 
    END as dead_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND n_dead_tup > 0
ORDER BY dead_ratio DESC;

-- Kullanılmayan index kontrolü
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexrelid IN (
    SELECT oid FROM pg_class WHERE relkind = 'i'
)
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ============================================
-- SONUÇ
-- ============================================
-- Bu migration çalıştırıldıktan sonra:
-- 1. Dead rows temizlendi
-- 2. İstatistikler güncellendi
-- 3. Yeni performans index'leri eklendi
-- 4. Kullanılmayan index'ler kaldırıldı (güvenli olanlar)
--
-- Test'i tekrar çalıştırın:
-- node run-database-performance-security-test.js
