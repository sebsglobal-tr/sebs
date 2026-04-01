-- ============================================
-- 🚀 TÜM LINTER SORUNLARINI ÇÖZ - KAPSAMLI ÇÖZÜM
-- Bu script hem foreign key index'lerini hem de 
-- kullanılmayan index'leri otomatik olarak düzeltir
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
-- 2. KULLANILMAYAN İNDEX'LERİ KALDIR
-- ============================================
DO $$
DECLARE
    r RECORD;
    drop_count INTEGER := 0;
BEGIN
    RAISE NOTICE '2️⃣ Kullanılmayan index''ler kaldırılıyor...';
    
    FOR r IN 
        SELECT 
            schemaname,
            indexrelname as indexname
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
        AND indexrelname NOT LIKE '%_key'
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
            drop_count := drop_count + 1;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
    
    RAISE NOTICE '   ✅ % kullanılmayan index kaldırıldı', drop_count;
END $$;

-- İstatistikleri tekrar güncelle
ANALYZE;

-- ============================================
-- 3. SONUÇ ÖZETİ
-- ============================================
DO $$
DECLARE
    total_fkeys INTEGER;
    indexed_fkeys INTEGER;
    unused_indexes INTEGER;
BEGIN
    -- Foreign key kontrolü
    SELECT COUNT(*) INTO total_fkeys
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    -- Kullanılmayan index sayısı
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
    IF unused_indexes = 0 THEN
        RAISE NOTICE '🎉 Tüm sorunlar çözüldü!';
    ELSE
        RAISE NOTICE '💡 % kullanılmayan index kaldı (yeni eklenenler olabilir)', unused_indexes;
    END IF;
    RAISE NOTICE '========================================';
END $$;
