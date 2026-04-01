-- Simülasyon başlangıcı, doğru/yanlış sayısı ve geçti/kaldı bilgisi
-- Uygulama: psql veya Supabase SQL editor

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS wrong_count INTEGER DEFAULT 0;

ALTER TABLE public.simulation_runs
  ADD COLUMN IF NOT EXISTS passed BOOLEAN;

COMMENT ON COLUMN public.simulation_runs.started_at IS 'Simülasyon başlatıldığında (POST /api/simulations/start)';
COMMENT ON COLUMN public.simulation_runs.passed IS 'Tamamlanınca: true=başarılı, false=başarısız (skor eşiği veya istemci)';
