-- Admin: site_settings (fiyatlandırma vb.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID
);

INSERT INTO public.site_settings (key, value)
VALUES (
    'package_prices',
    '{
      "cybersecurity": {"beginner": 199, "intermediate": 349, "advanced": 799},
      "cloud": {"beginner": 249, "intermediate": 449, "advanced": 899},
      "data-science": {"beginner": 199, "intermediate": 399, "advanced": 749},
      "single-stop": {"single-stop": 120}
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
