# Veritabanı (database/)

Bu klasör **şema ve migrasyon** içindir; Postgres instance’ı ayrıdır (ör. Supabase).

- **`migrations/`** — Sıralı SQL dosyaları (`010_complete_schema_secure.sql`, `014_simulation_runs_extended.sql`, `015_simulation_runs_performance_metrics.sql`, …). Yeni ortamda `psql` veya Supabase SQL Editor ile uygulayın.
- **`supabase/`** — Supabase proje migrasyonları (CLI: `supabase db push` / proje kökünden bağlantıya göre).

Üretimde değişiklikleri önce staging’de deneyin; RLS politikaları `011_enable_rls_all_tables.sql` ile ilişkilidir.

## Simülasyon kaydı (`simulation_runs`)

Node API (`backend/server.js`): `POST /api/simulations/start` ve `POST /api/simulations/complete` bu tabloyu doldurur. Tam performans alanları için Postgres’te sırayla:

1. `014_simulation_runs_extended.sql` — `started_at`, `correct_count`, `wrong_count`, `passed`
2. `015_simulation_runs_performance_metrics.sql` — `max_score`, `success_rate`, `wrong_actions_count`, `hint_used_count`, `reset_count`, `step_completion_times`, `final_grade_label`

Supabase CLI ile giden projelerde `supabase/migrations/007_simulation_runs_tracking.sql` bu iki adımı tek dosyada toplar (001 şemasından sonra uygulanır).
