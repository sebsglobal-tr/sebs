-- ============================================
-- DUPLICATE INDEX'LERİ HEMEN TEMİZLE
-- Bu dosyayı Supabase SQL Editor'da direkt çalıştırın
-- ============================================

-- Önce mevcut duplicate index'leri kontrol et
SELECT 
    'Mevcut duplicate indexler:' as info,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (
    indexname = 'ai_analysis_user_id_idx' OR
    indexname = 'behavior_data_user_id_idx' OR
    indexname = 'entitlements_user_id_idx' OR
    indexname = 'notifications_user_id_idx' OR
    indexname = 'security_logs_admin_id_idx' OR
    indexname = 'skill_scores_user_id_idx' OR
    indexname = 'subscriptions_user_id_idx'
)
ORDER BY tablename, indexname;

-- Şimdi duplicate index'leri sil
-- ai_analysis tablosu
DROP INDEX IF EXISTS public.ai_analysis_user_id_idx;

-- behavior_data tablosu
DROP INDEX IF EXISTS public.behavior_data_user_id_idx;

-- entitlements tablosu
DROP INDEX IF EXISTS public.entitlements_user_id_idx;

-- notifications tablosu
DROP INDEX IF EXISTS public.notifications_user_id_idx;

-- security_logs tablosu
DROP INDEX IF EXISTS public.security_logs_admin_id_idx;

-- skill_scores tablosu
DROP INDEX IF EXISTS public.skill_scores_user_id_idx;

-- subscriptions tablosu
DROP INDEX IF EXISTS public.subscriptions_user_id_idx;

-- İstatistikleri güncelle
ANALYZE;

-- Sonucu kontrol et (eğer hala görünüyorsa, bu sorgu boş döner)
SELECT 
    'Kalan duplicate indexler (boş olmalı):' as info,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (
    indexname = 'ai_analysis_user_id_idx' OR
    indexname = 'behavior_data_user_id_idx' OR
    indexname = 'entitlements_user_id_idx' OR
    indexname = 'notifications_user_id_idx' OR
    indexname = 'security_logs_admin_id_idx' OR
    indexname = 'skill_scores_user_id_idx' OR
    indexname = 'subscriptions_user_id_idx'
)
ORDER BY tablename, indexname;
