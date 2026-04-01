-- ============================================
-- MÜKERRER (DUPLICATE) İNDEX'LERİ TEMİZLE
-- Aynı kolon üzerinde birden fazla index varsa 
-- birini siler (idx_ ile başlayan standardı korur)
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- ============================================
-- MÜKERRER İNDEX'LERİ BUL VE TEMİZLE
-- ============================================
DO $$
DECLARE
    duplicate_rec RECORD;
    index_to_drop TEXT;
    dropped_count INTEGER := 0;
    index_def1 TEXT;
    index_def2 TEXT;
    tablename_var TEXT;
    column_name_var TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Mükerrer index''ler temizleniyor...';
    RAISE NOTICE '========================================';
    
    -- Her tablo için mükerrer index'leri bul
    FOR duplicate_rec IN
        SELECT 
            tablename,
            array_agg(indexname ORDER BY indexname) as index_names,
            count(*) as index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
        GROUP BY tablename
        HAVING count(*) > 1
    LOOP
        tablename_var := duplicate_rec.tablename;
        
        -- Bu tabloda aynı kolon üzerinde birden fazla index var mı kontrol et
        FOR column_name_var IN
            SELECT DISTINCT a.attname
            FROM pg_index i
            JOIN pg_class c ON c.oid = i.indrelid
            JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
            WHERE c.relname = tablename_var
            AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            AND i.indisprimary = false
            AND array_length(i.indkey, 1) = 1  -- Sadece tek kolonlu index'ler
            GROUP BY a.attname
            HAVING count(*) > 1  -- Aynı kolonda birden fazla index var
        LOOP
            -- Bu kolon için tüm index'leri bul
            DECLARE
                idx_rec RECORD;
                indexes_list TEXT[] := ARRAY[]::TEXT[];
            BEGIN
                FOR idx_rec IN
                    SELECT 
                        pi.indexname,
                        pg_get_indexdef(pi.indexname::regclass) as indexdef
                    FROM pg_indexes pi
                    JOIN pg_index i ON i.indexrelid = (SELECT oid FROM pg_class WHERE relname = pi.indexname)
                    JOIN pg_class c ON c.oid = i.indrelid
                    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = i.indkey[1]
                    WHERE pi.schemaname = 'public'
                    AND pi.tablename = tablename_var
                    AND a.attname = column_name_var
                    AND i.indisprimary = false
                    AND array_length(i.indkey, 1) = 1
                    ORDER BY pi.indexname
                LOOP
                    indexes_list := indexes_list || idx_rec.indexname;
                END LOOP;
                
                -- Eğer aynı index definition'ına sahip birden fazla index varsa
                IF array_length(indexes_list, 1) > 1 THEN
                    -- İkinci ve sonrası index'leri sil (ilkini koru - idx_ ile başlayan tercih edilir)
                    -- Önce idx_ ile başlayanları bul
                    DECLARE
                        keep_index TEXT;
                        drop_indexes TEXT[];
                        idx_name TEXT;
                    BEGIN
                        -- idx_ ile başlayan index'i bul (varsa)
                        SELECT indexname INTO keep_index
                        FROM pg_indexes
                        WHERE schemaname = 'public'
                        AND tablename = tablename_var
                        AND indexname = ANY(indexes_list)
                        AND indexname LIKE 'idx_%'
                        LIMIT 1;
                        
                        -- Eğer idx_ ile başlayan yoksa, ilk index'i koru
                        IF keep_index IS NULL THEN
                            keep_index := indexes_list[1];
                        END IF;
                        
                        -- Kalan index'leri sil
                        FOREACH idx_name IN ARRAY indexes_list
                        LOOP
                            IF idx_name != keep_index THEN
                                BEGIN
                                    EXECUTE format('DROP INDEX IF EXISTS public.%I', idx_name);
                                    dropped_count := dropped_count + 1;
                                    RAISE NOTICE '✅ Dropped duplicate: %.% (kept: %)', tablename_var, idx_name, keep_index;
                                EXCEPTION WHEN OTHERS THEN
                                    RAISE NOTICE '❌ Failed to drop: %.% - %', tablename_var, idx_name, SQLERRM;
                                END;
                            END IF;
                        END LOOP;
                    END;
                END IF;
            END;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  ✅ Dropped duplicate indexes: %', dropped_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- ÖZEL DURUMLAR: Linter'ın belirttiği spesifik duplicate index'ler
-- Bu index'ler aynı kolon üzerinde farklı isimlerle oluşturulmuş
-- idx_ prefix'li standardı koruyarak diğerlerini siliyoruz
-- ============================================

-- ai_analysis tablosu: user_id kolonu için duplicate index
-- Keep: idx_ai_analysis_user_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.ai_analysis_user_id_idx;

-- behavior_data tablosu: user_id kolonu için duplicate index
-- Keep: idx_behavior_data_user_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.behavior_data_user_id_idx;

-- entitlements tablosu: user_id kolonu için duplicate index
-- Keep: idx_entitlements_user_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.entitlements_user_id_idx;

-- notifications tablosu: user_id kolonu için duplicate index
-- Keep: idx_notifications_user_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.notifications_user_id_idx;

-- security_logs tablosu: admin_id kolonu için duplicate index
-- Keep: idx_security_logs_admin_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.security_logs_admin_id_idx;

-- skill_scores tablosu: user_id kolonu için duplicate index
-- Keep: idx_skill_scores_user_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.skill_scores_user_id_idx;

-- subscriptions tablosu: user_id kolonu için duplicate index
-- Keep: idx_subscriptions_user_id (standard idx_ prefix)
DROP INDEX IF EXISTS public.subscriptions_user_id_idx;

-- İstatistikleri tekrar güncelle
ANALYZE;

-- ============================================
-- SONUÇ KONTROLÜ
-- ============================================
DO $$
DECLARE
    remaining_duplicates INTEGER;
BEGIN
    -- Mükerrer index sayısını kontrol et (basit kontrol)
    SELECT COUNT(*) INTO remaining_duplicates
    FROM (
        SELECT 
            tablename,
            a.attname as column_name,
            count(*) as index_count
        FROM pg_indexes pi
        JOIN pg_index i ON i.indexrelid = (SELECT oid FROM pg_class WHERE relname = pi.indexname)
        JOIN pg_class c ON c.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = i.indkey[1]
        WHERE pi.schemaname = 'public'
        AND i.indisprimary = false
        AND array_length(i.indkey, 1) = 1
        GROUP BY tablename, a.attname
        HAVING count(*) > 1
    ) duplicates;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Remaining duplicates: %', remaining_duplicates;
    IF remaining_duplicates = 0 THEN
        RAISE NOTICE '🎉 All duplicate indexes removed!';
    ELSE
        RAISE NOTICE '💡 Some duplicates may remain (check manually)';
    END IF;
    RAISE NOTICE '========================================';
END $$;
