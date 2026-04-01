-- ============================================
-- TÜM FOREIGN KEY İNDEX'LERİNİ EKLE
-- Bu script tüm foreign key'ler için index ekler
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- ============================================
-- TÜM FOREIGN KEY'LER İÇİN İNDEX EKLE (Dinamik)
-- ============================================
DO $$
DECLARE
    r RECORD;
    index_count INTEGER := 0;
    skipped_count INTEGER := 0;
    index_name TEXT;
    column_name TEXT;
    table_schema TEXT := 'public';
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Foreign key index''leri ekleniyor...';
    RAISE NOTICE '========================================';
    
    -- Her foreign key constraint için index ekle
    FOR r IN
        SELECT 
            tc.table_schema,
            tc.table_name,
            kcu.column_name,
            tc.constraint_name,
            ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    LOOP
        -- Index adını oluştur: idx_{table_name}_{column_name}
        index_name := 'idx_' || r.table_name || '_' || r.column_name;
        
        -- Index zaten var mı kontrol et
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = r.table_schema 
            AND tablename = r.table_name 
            AND indexname = index_name
        ) THEN
            -- Index oluştur
            BEGIN
                EXECUTE format(
                    'CREATE INDEX %I ON %I.%I (%I)',
                    index_name,
                    r.table_schema,
                    r.table_name,
                    r.column_name
                );
                index_count := index_count + 1;
                RAISE NOTICE '✅ Added: %.% on %', index_name, r.table_name, r.column_name;
            EXCEPTION WHEN OTHERS THEN
                skipped_count := skipped_count + 1;
                RAISE NOTICE '❌ Failed: %.% - %', index_name, r.table_name, SQLERRM;
            END;
        ELSE
            skipped_count := skipped_count + 1;
            RAISE NOTICE '⏭️  Exists: %.% (already exists)', index_name, r.table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  ✅ Indexes created: %', index_count;
    RAISE NOTICE '  ⏭️  Indexes skipped: %', skipped_count;
    RAISE NOTICE '========================================';
END $$;

-- İstatistikleri tekrar güncelle
ANALYZE;

-- ============================================
-- SONUÇLARI KONTROL ET
-- ============================================
DO $$
DECLARE
    total_fkeys INTEGER;
    indexed_fkeys INTEGER;
BEGIN
    -- Toplam foreign key sayısı
    SELECT COUNT(*) INTO total_fkeys
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
    -- Index'lenmiş foreign key sayısı
    SELECT COUNT(DISTINCT tc.table_name || '.' || kcu.column_name) INTO indexed_fkeys
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN pg_indexes pi ON pi.tablename = tc.table_name
        AND pi.schemaname = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND pi.indexname LIKE 'idx_' || tc.table_name || '_' || kcu.column_name;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  Total Foreign Keys: %', total_fkeys;
    RAISE NOTICE '  Indexed Foreign Keys: %', indexed_fkeys;
    IF indexed_fkeys >= total_fkeys THEN
        RAISE NOTICE '  Status: ✅ All foreign keys indexed!';
    ELSE
        RAISE NOTICE '  Status: ⚠️  Some foreign keys may need manual indexing';
    END IF;
    RAISE NOTICE '========================================';
END $$;
