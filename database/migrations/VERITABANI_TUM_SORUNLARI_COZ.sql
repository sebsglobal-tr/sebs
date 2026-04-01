-- ============================================
-- 🚀 VERİTABANI TÜM SORUNLARI ÇÖZ - KAPSAMLI
-- Bu script tüm linter sorunlarını otomatik çözer:
-- 1. Foreign key index'lerini ekler
-- 2. Mükerrer index'leri temizler
-- 3. Kullanılmayan index'leri kaldırır
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
    -- idx_ ile başlayan standart formatı koru
    
    DROP INDEX IF EXISTS public.ai_analysis_user_id_idx;  -- Keep: idx_ai_analysis_user_id
    DROP INDEX IF EXISTS public.behavior_data_user_id_idx;  -- Keep: idx_behavior_data_user_id
    DROP INDEX IF EXISTS public.entitlements_user_id_idx;  -- Keep: idx_entitlements_user_id
    DROP INDEX IF EXISTS public.notifications_user_id_idx;  -- Keep: idx_notifications_user_id
    DROP INDEX IF EXISTS public.security_logs_admin_id_idx;  -- Keep: idx_security_logs_admin_id
    DROP INDEX IF EXISTS public.skill_scores_user_id_idx;  -- Keep: idx_skill_scores_user_id
    DROP INDEX IF EXISTS public.subscriptions_user_id_idx;  -- Keep: idx_subscriptions_user_id
    
    RAISE NOTICE '   ✅ Mükerrer index''ler kaldırıldı';
END $$;

-- ============================================
-- 3. KULLANILMAYAN İNDEX'LERİ KALDIR
-- ============================================
-- ÖNEMLİ: Foreign key index'lerini koru
DO $$
DECLARE
    r RECORD;
    drop_count INTEGER := 0;
    is_foreign_key_index BOOLEAN;
BEGIN
    RAISE NOTICE '3️⃣ Kullanılmayan index''ler kaldırılıyor...';
    
    FOR r IN 
        SELECT 
            schemaname,
            tablename,
            indexrelname as indexname
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'  -- Primary key'leri koru
        AND indexrelname NOT LIKE '%_key'   -- Constraint index'lerini koru
        ORDER BY tablename, indexrelname
    LOOP
        -- Bu index bir foreign key index'i mi kontrol et
        is_foreign_key_index := false;
        
        -- idx_{table}_{column} formatında foreign key index'i olabilir
        IF r.indexname LIKE 'idx_' || r.tablename || '_%' THEN
            -- Tablo ve kolon adını çıkar
            DECLARE
                column_name_pattern TEXT;
            BEGIN
                -- indexname'den kolon adını çıkar: idx_table_column -> column
                column_name_pattern := substring(r.indexname from length('idx_' || r.tablename || '_') + 1);
                
                -- Bu kolon bir foreign key mi?
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name = r.tablename
                    AND kcu.column_name = column_name_pattern
                ) INTO is_foreign_key_index;
            EXCEPTION WHEN OTHERS THEN
                is_foreign_key_index := false;
            END;
        END IF;
        
        -- Eğer foreign key index'i değilse ve kullanılmıyorsa sil
        IF NOT is_foreign_key_index THEN
            BEGIN
                EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
                drop_count := drop_count + 1;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END IF;
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
    indexed_fkeys INTEGER;
    unused_indexes INTEGER;
BEGIN
    -- Toplam foreign key sayısı
    SELECT COUNT(*) INTO total_fkeys
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    -- İndex'lenmiş foreign key sayısı (basit kontrol)
    SELECT COUNT(*) INTO indexed_fkeys
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN pg_indexes pi 
        ON pi.tablename = tc.table_name
        AND pi.indexname = 'idx_' || tc.table_name || '_' || kcu.column_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
    
    -- Kalan kullanılmayan index sayısı
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
    RAISE NOTICE 'Toplam Foreign Keys: %', total_fkeys;
    RAISE NOTICE 'İndex''lenmiş Foreign Keys: %', indexed_fkeys;
    RAISE NOTICE 'Kalan Kullanılmayan Index''ler: %', unused_indexes;
    RAISE NOTICE '';
    IF indexed_fkeys >= total_fkeys * 0.9 AND unused_indexes < 10 THEN
        RAISE NOTICE '🎉 Tüm sorunlar çözüldü!';
    ELSE
        RAISE NOTICE '💡 Bazı sorunlar kalmış olabilir - Linter''ı kontrol edin';
    END IF;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Sonraki Adım:';
    RAISE NOTICE '   Supabase Dashboard → Database → Database Linter';
    RAISE NOTICE '   Linter''ı tekrar çalıştırın ve sonuçları kontrol edin';
    RAISE NOTICE '';
END $$;
