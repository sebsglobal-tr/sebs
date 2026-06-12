-- ============================================
-- 🔍 VERİTABANI PERFORMANS ANALİZİ
-- Bu script performans sorunlarını tespit eder
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- ============================================
-- 1. YAVAŞ SORGULARI TESPİT ET
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '1️⃣ YAVAŞ SORGULAR';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    query,
    calls,
    total_exec_time::numeric(10,2) as total_time_ms,
    mean_exec_time::numeric(10,2) as avg_time_ms,
    max_exec_time::numeric(10,2) as max_time_ms,
    ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) as pct_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
AND query NOT LIKE '%pg_catalog%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ============================================
-- 2. TABLO BOYUTLARI VE BLOAT ANALİZİ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '2️⃣ TABLO BOYUTLARI';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================
-- 3. İNDEX KULLANIM ANALİZİ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '3️⃣ İNDEX KULLANIMI';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    schemaname,
    tablename,
    indexrelname as index_name,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    CASE 
        WHEN idx_scan = 0 THEN '❌ KULLANILMIYOR'
        WHEN idx_scan < 10 THEN '⚠️  AZ KULLANILIYOR'
        ELSE '✅ KULLANILIYOR'
    END as status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC
LIMIT 30;

-- ============================================
-- 4. KULLANILMAYAN İNDEX'LER (BÜYÜK BOYUTLULAR)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '4️⃣ KULLANILMAYAN BÜYÜK İNDEX''LER';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    schemaname,
    tablename,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    pg_relation_size(indexrelid) as size_bytes,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'
AND indexrelname NOT LIKE '%_key'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ============================================
-- 5. TABLO İSTATİSTİKLERİ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '5️⃣ TABLO İSTATİSTİKLERİ';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as row_count,
    n_dead_tup as dead_rows,
    CASE 
        WHEN n_live_tup > 0 
        THEN ROUND((n_dead_tup::numeric / n_live_tup * 100)::numeric, 2)
        ELSE 0
    END as dead_row_pct,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 20;

-- ============================================
-- 6. FULL TABLE SCAN TESPİTİ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '6️⃣ FULL TABLE SCAN (Seq Scan)';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    schemaname,
    relname as table_name,
    seq_scan as sequential_scans,
    seq_tup_read as tuples_read,
    idx_scan as index_scans,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN ROUND((seq_scan::numeric / (seq_scan + idx_scan) * 100)::numeric, 2)
        ELSE 0
    END as seq_scan_pct,
    CASE 
        WHEN seq_scan > idx_scan * 10 THEN '⚠️  ÇOK FAZLA SEQ SCAN'
        WHEN seq_scan > 0 THEN '💡 SEQ SCAN VAR'
        ELSE '✅ İYİ'
    END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 20;

-- ============================================
-- 7. FOREIGN KEY İNDEX KONTROLÜ
-- ============================================
DO $$
DECLARE
    fkey_count INTEGER;
    indexed_count INTEGER;
    missing_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '7️⃣ FOREIGN KEY İNDEX DURUMU';
    RAISE NOTICE '========================================';
    
    -- Toplam foreign key sayısı
    SELECT COUNT(*) INTO fkey_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    -- İndex'lenmiş foreign key sayısı
    SELECT COUNT(*) INTO indexed_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename = tc.table_name
        AND indexname = 'idx_' || tc.table_name || '_' || kcu.column_name
    );
    
    missing_count := fkey_count - indexed_count;
    
    RAISE NOTICE 'Toplam Foreign Keys: %', fkey_count;
    RAISE NOTICE 'İndex''lenmiş: %', indexed_count;
    RAISE NOTICE 'İndex''lenmemiş: %', missing_count;
    
    IF missing_count > 0 THEN
        RAISE NOTICE '⚠️  % foreign key için index eksik!', missing_count;
    ELSE
        RAISE NOTICE '✅ Tüm foreign key''ler index''lenmiş';
    END IF;
END $$;

-- ============================================
-- 8. ÖNERİLER
-- ============================================
DO $$
DECLARE
    large_tables INTEGER;
    missing_indexes INTEGER;
    unused_indexes INTEGER;
    dead_rows_pct NUMERIC;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '8️⃣ PERFORMANS ÖNERİLERİ';
    RAISE NOTICE '========================================';
    
    -- Büyük tablolar
    SELECT COUNT(*) INTO large_tables
    FROM pg_tables pt
    JOIN pg_total_relation_size('public.' || pt.tablename) ts ON true
    WHERE schemaname = 'public'
    AND ts > 100 * 1024 * 1024;  -- 100MB'dan büyük
    
    -- İndex'lenmemiş foreign key'ler
    SELECT COUNT(*) INTO missing_indexes
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename = tc.table_name
        AND indexname = 'idx_' || tc.table_name || '_' || kcu.column_name
    );
    
    -- Kullanılmayan index'ler
    SELECT COUNT(*) INTO unused_indexes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
    AND indexrelname NOT LIKE '%_key';
    
    -- Ölü satır oranı
    SELECT COALESCE(ROUND(AVG(
        CASE WHEN n_live_tup > 0 
        THEN (n_dead_tup::numeric / n_live_tup * 100)
        ELSE 0 END
    )::numeric, 2), 0) INTO dead_rows_pct
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    AND n_live_tup > 0;
    
    RAISE NOTICE '';
    IF large_tables > 0 THEN
        RAISE NOTICE '📊 % tablo 100MB+ boyutunda - Partition düşünün', large_tables;
    END IF;
    
    IF missing_indexes > 0 THEN
        RAISE NOTICE '🔍 % foreign key index''i eksik - VERITABANI_TUM_SORUNLARI_COZ.sql çalıştırın', missing_indexes;
    END IF;
    
    IF unused_indexes > 10 THEN
        RAISE NOTICE '🗑️  % kullanılmayan index var - Depolama tasarrufu için kaldırın', unused_indexes;
    END IF;
    
    IF dead_rows_pct > 10 THEN
        RAISE NOTICE '🧹 Ölü satır oranı %% - VACUUM ANALYZE çalıştırın', dead_rows_pct;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '💡 Önerilen İşlemler:';
    RAISE NOTICE '   1. VERITABANI_TUM_SORUNLARI_COZ.sql - Index sorunlarını çöz';
    RAISE NOTICE '   2. VACUUM ANALYZE; - Ölü satırları temizle';
    RAISE NOTICE '   3. pg_stat_statements extension - Detaylı sorgu analizi';
    RAISE NOTICE '   4. Connection pooling - Bağlantı havuzu kullanın';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
