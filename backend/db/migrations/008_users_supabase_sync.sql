-- ============================================
-- SEBS - Supabase kullanıcıları ile users tablosu senkronu
-- Supabase ile giriş yapan kullanıcıların server.users'da kaydı olması için
-- ============================================

-- password_hash: Supabase-only kullanıcılar için placeholder kabul et (NOT NULL kalır)
-- Mevcut constraint aynı kalır; Supabase sync'te '[SUPABASE]' yazılacak

-- Opsiyonel: id ile eşleşen Supabase auth.users.id (UUID) kullanılıyorsa
-- users.id zaten UUID; ek kolon gerekmez.

-- Sadece bilgi: Supabase'den gelen kullanıcılar INSERT ... ON CONFLICT (id) DO UPDATE
-- ile users tablosuna eklenecek/güncellenecek (kod tarafında).
-- Bu migration sadece gerekirse password_hash'ı NULL kabul edecek şekilde değiştirir.

-- Eğer password_hash NOT NULL ise ve placeholder kullanacaksak migration'da değişiklik yok.
-- Placeholder: password_hash = '[SUPABASE]' (şifre ile girişte reddedilecek)

SELECT 1;
