-- ============================================
-- 🚀 VERİTABANI PERFORMANS OPTİMİZASYONU
-- Bu script performans sorunlarını otomatik çözer:
-- 1. Eksik index'leri ekler
-- 2. Kullanılmayan index'leri kaldırır
-- 3. Tabloları VACUUM eder
-- 4. İstatistikleri günceller
-- ============================================

-- ============================================
-- 1. EKSİK FOREIGN KEY İNDEX'LERİNİ EKLE
-- ============================================
DO $$
DECLARE
    r RECORD;
    index_count INTEGER := 0;
    index_name TEXT;
BEGIN
    RAISE NOTICE '1️⃣ Eksik foreign key index''leri ekleniyor...';
    
    FOR r IN
        SELECT 
            tc.table_schema,
            tc.table_name,
            kcu.column_name,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = tc.table_schema 
            AND tablename = tc.table_name 
            AND indexname = 'idx_' || tc.table_name || '_' || kcu.column_name
        )
        ORDER BY tc.table_name, kcu.column_name
    LOOP
        index_name := 'idx_' || r.table_name || '_' || r.column_name;
        
        BEGIN
            EXECUTE format(
                'CREATE INDEX %I ON %I.%I (%I)',
                index_name,
                r.table_schema,
                r.table_name,
                r.column_name
            );
            index_count := index_count + 1;
            RAISE NOTICE '   ✅ Added: %', index_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '   ❌ Failed: % - %', index_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '   Toplam: % index eklendi', index_count;
END $$;

-- ============================================
-- 2. KULLANILMAYAN BÜYÜK İNDEX'LERİ KALDIR
-- ============================================
DO $$
DECLARE
    r RECORD;
    drop_count INTEGER := 0;
    freed_space BIGINT := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2️⃣ Kullanılmayan büyük index''ler kaldırılıyor...';
    
    FOR r IN 
        SELECT 
            schemaname,
            tablename,
            indexrelname as indexname,
            pg_relation_size(indexrelid) as size_bytes
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
        AND indexrelname NOT LIKE '%_key'
        AND pg_relation_size(indexrelid) > 1024 * 1024  -- 1MB'dan büyük olanlar
        ORDER BY pg_relation_size(indexrelid) DESC
    LOOP
        -- Foreign key index'i mi kontrol et
        DECLARE
            is_fk_index BOOLEAN := false;
        BEGIN
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND tc.table_name = r.tablename
                AND EXISTS (
                    SELECT 1 FROM pg_indexes
                    WHERE schemaname = 'public'
                    AND tablename = r.tablename
                    AND indexname = r.indexname
                )
            ) INTO is_fk_index;
            
            IF NOT is_fk_index THEN
                BEGIN
                    EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
                    drop_count := drop_count + 1;
                    freed_space := freed_space + r.size_bytes;
                    RAISE NOTICE '   ✅ Dropped: % (%.%%)', 
                        r.indexname, 
                        pg_size_pretty(r.size_bytes);
                EXCEPTION WHEN OTHERS THEN
                    NULL;
                END;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '   Toplam: % index kaldırıldı, % alan kazanıldı', 
        drop_count, 
        pg_size_pretty(freed_space);
END $$;

-- ============================================
-- 3. ÖLÜ SATIRLARI TEMİZLE (VACUUM)
-- ============================================
DO $$
DECLARE
    r RECORD;
    vacuum_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3️⃣ Ölü satırlar temizleniyor (VACUUM)...';
    
    -- Ölü satır oranı yüksek olan tabloları VACUUM et
    FOR r IN
        SELECT 
            schemaname,
            relname as table_name,
            n_live_tup,
            n_dead_tup,
            CASE 
                WHEN n_live_tup > 0 
                THEN (n_dead_tup::numeric / n_live_tup * 100)
                ELSE 0
            END as dead_pct
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        AND n_dead_tup > 1000  -- 1000'den fazla ölü satır
        AND (
            n_live_tup = 0 OR 
            (n_dead_tup::numeric / n_live_tup) > 0.05  -- %5'ten fazla ölü satır
        )
        ORDER BY n_dead_tup DESC
        LIMIT 20
    LOOP
        BEGIN
            EXECUTE format('VACUUM ANALYZE %I.%I', r.schemaname, r.table_name);
            vacuum_count := vacuum_count + 1;
            RAISE NOTICE '   ✅ VACUUMed: % (%.%% ölü satır)', 
                r.table_name, 
                ROUND(r.dead_pct::numeric, 2);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '   ❌ Failed: % - %', r.table_name, SQLERRM;
        END;
    END LOOP;
    
    IF vacuum_count = 0 THEN
        RAISE NOTICE '   ✅ VACUUM gerekmiyor - tüm tablolar temiz';
    ELSE
        RAISE NOTICE '   Toplam: % tablo VACUUM edildi', vacuum_count;
    END IF;
END $$;

-- ============================================
-- 4. İSTATİSTİKLERİ GÜNCELLE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4️⃣ İstatistikler güncelleniyor (ANALYZE)...';
    ANALYZE;
    RAISE NOTICE '   ✅ ANALYZE tamamlandı';
END $$;

-- ============================================
-- 5. PERFORMANS ÖZETİ
-- ============================================
DO $$
DECLARE
    total_size_before BIGINT;
    total_size_after BIGINT;
    table_count INTEGER;
    index_count INTEGER;
    unused_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 OPTİMİZASYON ÖZETİ';
    RAISE NOTICE '========================================';
    
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO unused_count
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
    AND indexrelname NOT LIKE '%_key';
    
    RAISE NOTICE 'Tablo Sayısı: %', table_count;
    RAISE NOTICE 'Toplam Index: %', index_count;
    RAISE NOTICE 'Kullanılmayan Index: %', unused_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Optimizasyon tamamlandı!';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Sonraki Adımlar:';
    RAISE NOTICE '   1. PERFORMANS_ANALIZI.sql ile durumu kontrol edin';
    RAISE NOTICE '   2. Uygulamanızı test edin - performans iyileşti mi?';
    RAISE NOTICE '   3. pg_stat_statements extension kurun - detaylı analiz için';
    RAISE NOTICE '   4. Connection pooling kullanın (PgBouncer, Supabase Pooler)';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
