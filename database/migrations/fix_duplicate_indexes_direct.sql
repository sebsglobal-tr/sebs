-- ============================================
-- DIRECT FIX: Duplicate Index Cleanup
-- Bu dosyayı Supabase SQL Editor'da direkt çalıştırın
-- ============================================

-- İstatistikleri güncelle
ANALYZE;

-- ============================================
-- DUPLICATE INDEX'LERİ DİREKT TEMİZLE
-- ============================================

-- ai_analysis tablosu: user_id kolonu için duplicate index
-- Keep: idx_ai_analysis_user_id (Prisma standardı)
-- Drop: ai_analysis_user_id_idx
DROP INDEX IF EXISTS public.ai_analysis_user_id_idx;

-- behavior_data tablosu: user_id kolonu için duplicate index
-- Keep: idx_behavior_data_user_id (Prisma standardı)
-- Drop: behavior_data_user_id_idx
DROP INDEX IF EXISTS public.behavior_data_user_id_idx;

-- entitlements tablosu: user_id kolonu için duplicate index
-- Keep: idx_entitlements_user_id (Prisma standardı)
-- Drop: entitlements_user_id_idx
DROP INDEX IF EXISTS public.entitlements_user_id_idx;

-- notifications tablosu: user_id kolonu için duplicate index
-- Keep: idx_notifications_user_id (Prisma standardı)
-- Drop: notifications_user_id_idx
DROP INDEX IF EXISTS public.notifications_user_id_idx;

-- security_logs tablosu: admin_id kolonu için duplicate index
-- Keep: idx_security_logs_admin_id (Prisma standardı)
-- Drop: security_logs_admin_id_idx
DROP INDEX IF EXISTS public.security_logs_admin_id_idx;

-- skill_scores tablosu: user_id kolonu için duplicate index
-- Keep: idx_skill_scores_user_id (Prisma standardı)
-- Drop: skill_scores_user_id_idx
DROP INDEX IF EXISTS public.skill_scores_user_id_idx;

-- subscriptions tablosu: user_id kolonu için duplicate index
-- Keep: idx_subscriptions_user_id (Prisma standardı)
-- Drop: subscriptions_user_id_idx
DROP INDEX IF EXISTS public.subscriptions_user_id_idx;

-- İstatistikleri tekrar güncelle
ANALYZE;

-- ============================================
-- KONTROL: Kalan duplicate index'leri göster
-- ============================================
SELECT 
    schemaname,
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

-- ============================================
-- NOT: Eğer yukarıdaki sorgu sonuç döndürürse,
-- index'ler hala mevcut demektir ve manuel olarak
-- kontrol edilmelidir.
-- ============================================
