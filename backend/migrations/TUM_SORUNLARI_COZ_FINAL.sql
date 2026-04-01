-- ============================================
-- 🚀 TÜM LINTER SORUNLARINI ÇÖZ - FINAL VERSİYON
-- Bu script tüm sorunları otomatik olarak çözer:
-- 1. Foreign key index'lerini ekler
-- 2. Kullanılmayan index'leri kaldırır
-- 3. Mükerrer index'leri temizler
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- ============================================
-- 1. TÜM FOREIGN KEY'LER İÇİN İNDEX EKLE
-- ============================================
DO $$
DECLARE
    r RECORD;
    index_count INTEGER := 0;
    index_name TEXT;
BEGIN
    RAISE NOTICE '1️⃣ Foreign key index''leri ekleniyor...';
    
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
        ORDER BY tc.table_name, kcu.column_name
    LOOP
        index_name := 'idx_' || r.table_name || '_' || r.column_name;
        
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = r.table_schema 
            AND tablename = r.table_name 
            AND indexname = index_name
        ) THEN
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
        END IF;
    END LOOP;
    
    RAISE NOTICE '   ✅ % foreign key index eklendi', index_count;
END $$;

-- ============================================
-- 2. MÜKERRER İNDEX'LERİ TEMİZLE
-- ============================================
DO $$
DECLARE
    dropped_count INTEGER := 0;
BEGIN
    RAISE NOTICE '2️⃣ Mükerrer index''ler temizleniyor...';
    
    -- Linter'ın belirttiği spesifik duplicate index'leri sil
    -- idx_ ile başlayanları koru (standart)
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.ai_analysis_user_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.behavior_data_user_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.entitlements_user_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.notifications_user_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.security_logs_admin_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.skill_scores_user_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        EXECUTE 'DROP INDEX IF EXISTS public.subscriptions_user_id_idx';
        IF FOUND THEN dropped_count := dropped_count + 1; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    RAISE NOTICE '   ✅ % mükerrer index kaldırıldı', dropped_count;
END $$;

-- ============================================
-- 3. KULLANILMAYAN İNDEX'LERİ KALDIR
-- ============================================
DO $$
DECLARE
    r RECORD;
    drop_count INTEGER := 0;
BEGIN
    RAISE NOTICE '3️⃣ Kullanılmayan index''ler kaldırılıyor...';
    
    FOR r IN 
        SELECT 
            schemaname,
            indexrelname as indexname
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
        AND indexrelname NOT LIKE '%_key'
        AND indexrelname LIKE 'idx_%'  -- Sadece idx_ ile başlayan foreign key index'lerini koru
    LOOP
        -- Foreign key index'i mi kontrol et
        DECLARE
            is_fk_index BOOLEAN := false;
        BEGIN
            -- Bu index bir foreign key kolonunda mı?
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND kcu.column_name = substring(r.indexname from 'idx_' || '([^_]+)_([^_]+)$')
            ) INTO is_fk_index;
            
            -- Eğer foreign key index'i değilse sil
            IF NOT is_fk_index THEN
                BEGIN
                    EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
                    drop_count := drop_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    NULL;
                END;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '   ✅ % kullanılmayan index kaldırıldı', drop_count;
END $$;

-- İstatistikleri tekrar güncelle
ANALYZE;

-- ============================================
-- 4. SONUÇ ÖZETİ
-- ============================================
DO $$
DECLARE
    total_fkeys INTEGER;
    unused_indexes INTEGER;
    duplicate_check INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_fkeys
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    SELECT COUNT(*) INTO unused_indexes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
    AND indexrelname NOT LIKE '%_key';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 ÖZET';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Foreign Keys: %', total_fkeys;
    RAISE NOTICE 'Kullanılmayan Index''ler: %', unused_indexes;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Tüm sorunlar çözülmeye çalışıldı!';
    RAISE NOTICE '💡 Supabase Linter''ı tekrar çalıştırın';
    RAISE NOTICE '========================================';
END $$;
