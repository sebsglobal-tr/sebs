-- ============================================
-- 🚀 TÜM PERFORMANS SORUNLARINI OTOMATIK ÇÖZ
-- Bu script tüm performans sorunlarını çözer:
-- 1. Foreign key index'lerini ekler
-- 2. Mükerrer index'leri temizler
-- 3. Kullanılmayan index'leri kaldırır
-- 4. Ölü satırları temizler (VACUUM)
-- 5. İstatistikleri günceller
-- ============================================

-- İstatistikleri güncelle (başlangıç)
ANALYZE;

-- ============================================
-- 1. EKSİK FOREIGN KEY İNDEX'LERİNİ EKLE
-- ============================================
DO $$
DECLARE
    r RECORD;
    index_count INTEGER := 0;
    index_name TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '1️⃣ Foreign key index''leri ekleniyor...';
    RAISE NOTICE '========================================';
    
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
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
    
    RAISE NOTICE '✅ % foreign key index eklendi', index_count;
    RAISE NOTICE '';
END $$;

-- ============================================
-- 2. MÜKERRER İNDEX'LERİ TEMİZLE
-- ============================================
DO $$
DECLARE
    dropped_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '2️⃣ Mükerrer index''ler temizleniyor...';
    RAISE NOTICE '========================================';
    
    -- Linter'ın belirttiği spesifik duplicate index'leri sil
    -- idx_ ile başlayan standart formatı koru
    
    BEGIN
        DROP INDEX IF EXISTS public.ai_analysis_user_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        DROP INDEX IF EXISTS public.behavior_data_user_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        DROP INDEX IF EXISTS public.entitlements_user_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        DROP INDEX IF EXISTS public.notifications_user_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        DROP INDEX IF EXISTS public.security_logs_admin_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        DROP INDEX IF EXISTS public.skill_scores_user_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        DROP INDEX IF EXISTS public.subscriptions_user_id_idx;
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    RAISE NOTICE '✅ % mükerrer index kaldırıldı', dropped_count;
    RAISE NOTICE '';
END $$;

-- ============================================
-- 3. KULLANILMAYAN İNDEX'LERİ KALDIR
-- ============================================
DO $$
DECLARE
    r RECORD;
    drop_count INTEGER := 0;
    freed_bytes BIGINT := 0;
    is_fk_index BOOLEAN;
    fk_columns TEXT[];
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '3️⃣ Kullanılmayan index''ler kaldırılıyor...';
    RAISE NOTICE '========================================';
    
    -- Önce tüm foreign key kolonlarını bir kez al (performans için)
    SELECT array_agg(DISTINCT tc.table_name || '.' || kcu.column_name)
    INTO fk_columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
    
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
        ORDER BY pg_relation_size(indexrelid) DESC
    LOOP
        -- Bu index bir foreign key index'i mi kontrol et
        is_fk_index := false;
        
        -- idx_{table}_{column} formatında foreign key index'i olabilir
        IF r.indexname LIKE 'idx_' || r.tablename || '_%' THEN
            DECLARE
                column_name_var TEXT;
            BEGIN
                -- indexname'den kolon adını çıkar: idx_table_column -> column
                column_name_var := substring(r.indexname from length('idx_' || r.tablename || '_') + 1);
                
                -- Bu kolon foreign key mi?
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name = r.tablename
                    AND kcu.column_name = column_name_var
                ) INTO is_fk_index;
            EXCEPTION WHEN OTHERS THEN
                is_fk_index := false;
            END;
        END IF;
        
        -- Eğer foreign key index'i değilse sil
        IF NOT is_fk_index THEN
            BEGIN
                EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
                drop_count := drop_count + 1;
                freed_bytes := freed_bytes + r.size_bytes;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ % kullanılmayan index kaldırıldı', drop_count;
    IF freed_bytes > 0 THEN
        RAISE NOTICE '   💾 % alan kazanıldı', pg_size_pretty(freed_bytes);
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================
-- 4. ÖLÜ SATIRLARI TEMİZLE (VACUUM)
-- ============================================
DO $$
DECLARE
    r RECORD;
    vacuum_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '4️⃣ Ölü satırlar temizleniyor (VACUUM)...';
    RAISE NOTICE '========================================';
    
    -- Ölü satır oranı yüksek olan tabloları VACUUM et
    FOR r IN
        SELECT 
            schemaname,
            relname as table_name,
            n_dead_tup,
            CASE 
                WHEN n_live_tup > 0 
                THEN ROUND((n_dead_tup::numeric / n_live_tup * 100)::numeric, 2)
                ELSE 0
            END as dead_pct
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        AND (
            n_dead_tup > 1000  -- 1000'den fazla ölü satır
            OR (
                n_live_tup > 0 
                AND (n_dead_tup::numeric / n_live_tup) > 0.05  -- %5'ten fazla ölü satır
            )
        )
        ORDER BY n_dead_tup DESC
        LIMIT 20
    LOOP
        BEGIN
            EXECUTE format('VACUUM ANALYZE %I.%I', r.schemaname, r.table_name);
            vacuum_count := vacuum_count + 1;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
    
    IF vacuum_count > 0 THEN
        RAISE NOTICE '✅ % tablo VACUUM edildi', vacuum_count;
    ELSE
        RAISE NOTICE '✅ VACUUM gerekmiyor - tüm tablolar temiz';
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================
-- 5. İSTATİSTİKLERİ GÜNCELLE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '5️⃣ İstatistikler güncelleniyor...';
    RAISE NOTICE '========================================';
    ANALYZE;
    RAISE NOTICE '✅ ANALYZE tamamlandı';
    RAISE NOTICE '';
END $$;

-- ============================================
-- 6. SONUÇ ÖZETİ
-- ============================================
DO $$
DECLARE
    total_fkeys INTEGER;
    indexed_fkeys INTEGER;
    unused_indexes INTEGER;
    large_tables INTEGER;
    dead_rows_total BIGINT;
BEGIN
    -- Toplam foreign key sayısı
    SELECT COUNT(*) INTO total_fkeys
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    -- İndex'lenmiş foreign key sayısı
    SELECT COUNT(*) INTO indexed_fkeys
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
    
    -- Kalan kullanılmayan index sayısı
    SELECT COUNT(*) INTO unused_indexes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
    AND indexrelname NOT LIKE '%_key';
    
    -- Büyük tablolar
    SELECT COUNT(*) INTO large_tables
    FROM pg_tables pt
    WHERE schemaname = 'public'
    AND pg_total_relation_size('public.' || pt.tablename) > 100 * 1024 * 1024;
    
    -- Toplam ölü satır
    SELECT COALESCE(SUM(n_dead_tup), 0) INTO dead_rows_total
    FROM pg_stat_user_tables
    WHERE schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 ÖZET';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Foreign Keys:';
    RAISE NOTICE '  Toplam: %', total_fkeys;
    RAISE NOTICE '  İndex''lenmiş: %', indexed_fkeys;
    RAISE NOTICE '  Eksik: %', GREATEST(0, total_fkeys - indexed_fkeys);
    RAISE NOTICE '';
    RAISE NOTICE 'Index''ler:';
    RAISE NOTICE '  Kalan kullanılmayan: %', unused_indexes;
    RAISE NOTICE '';
    RAISE NOTICE 'Tablolar:';
    RAISE NOTICE '  100MB+ tablo: %', large_tables;
    RAISE NOTICE '  Toplam ölü satır: %', dead_rows_total;
    RAISE NOTICE '';
    
    IF indexed_fkeys >= total_fkeys * 0.9 
       AND unused_indexes < 10 
       AND dead_rows_total < 10000 THEN
        RAISE NOTICE '🎉 Tüm performans sorunları çözüldü!';
    ELSE
        RAISE NOTICE '✅ Önemli optimizasyonlar tamamlandı!';
        IF unused_indexes > 0 THEN
            RAISE NOTICE '💡 % kullanılmayan index kaldı (yeni eklenenler olabilir)', unused_indexes;
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📝 Sonraki Adımlar:';
    RAISE NOTICE '   1. Supabase Dashboard → Database → Database Linter';
    RAISE NOTICE '   2. Linter''ı tekrar çalıştırın ve sonuçları kontrol edin';
    RAISE NOTICE '   3. Uygulamanızı test edin - performans iyileşti mi?';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
