-- Node / frontend ile uyum: simülasyon başlangıcı, doğru–yanlış, geçti/kaldı + performans alanları
-- Sıra: 001_initial_schema sonrası. İçerik: database/migrations/014 + 015 ile aynı.

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS wrong_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS passed BOOLEAN;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS max_score INTEGER;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5, 2);

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS wrong_actions_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS hint_used_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS reset_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS step_completion_times JSONB;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS final_grade_label TEXT;

COMMENT ON COLUMN public.simulation_runs.started_at IS 'Simülasyon başlatıldığında (POST /api/simulations/start)';
COMMENT ON COLUMN public.simulation_runs.passed IS 'Tamamlanınca: true=başarılı, false=başarısız (skor eşiği veya istemci)';
COMMENT ON COLUMN public.simulation_runs.max_score IS 'Alınabilecek maksimum puan';
COMMENT ON COLUMN public.simulation_runs.success_rate IS 'Başarı yüzdesi (0–100)';
COMMENT ON COLUMN public.simulation_runs.wrong_actions_count IS 'Yanlış işlem / hatalı eylem sayısı';
COMMENT ON COLUMN public.simulation_runs.hint_used_count IS 'Kullanılan ipucu sayısı';
COMMENT ON COLUMN public.simulation_runs.reset_count IS 'Ortam / senaryo sıfırlama sayısı';
COMMENT ON COLUMN public.simulation_runs.step_completion_times IS 'Adım bazlı süreler (JSON dizi veya nesne)';
COMMENT ON COLUMN public.simulation_runs.final_grade_label IS 'Örn. zayıf, orta, iyi, çok iyi';
