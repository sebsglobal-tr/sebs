-- HTML modül sayfaları getModuleIdFromName ile /api/modules listesinden id arar.
-- Bu başlıklar tabloda yoksa ilerleme kaydı oluşturulamaz.
-- Idempotent: aynı başlık varsa eklemez.

INSERT INTO public.modules (title, description, category, level, sort_order, is_active)
SELECT v.title, v.description, v.category, v.level::varchar, v.sort_order, true
FROM (
    VALUES
        ('Temel Network Eğitimi', 'SEBS HTML modül kataloğu', 'cybersecurity', 'beginner', 20),
        ('Temel Siber Güvenlik', 'SEBS HTML modül kataloğu', 'cybersecurity', 'beginner', 10),
        ('Siber Güvenliğe Giriş', 'SEBS HTML modül kataloğu', 'cybersecurity', 'beginner', 5),
        ('Sosyal Mühendisliğe Giriş (Güncel)', 'SEBS HTML modül kataloğu', 'cybersecurity', 'beginner', 30),
        ('Malware Analizi (Orta Seviye)', 'SEBS HTML modül kataloğu', 'cybersecurity', 'intermediate', 40),
        ('Red Team ve Pentest (İleri)', 'SEBS HTML modül kataloğu', 'cybersecurity', 'advanced', 50),
        ('Olay Müdahalesi ve Dijital Adli Bilişim (İleri)', 'SEBS HTML modül kataloğu', 'cybersecurity', 'advanced', 60),
        ('AWS Temelleri', 'SEBS HTML modül kataloğu', 'cloud', 'beginner', 10),
        ('Azure Temelleri', 'SEBS HTML modül kataloğu', 'cloud', 'beginner', 20),
        ('Google Cloud Platform', 'SEBS HTML modül kataloğu', 'cloud', 'beginner', 30)
) AS v(title, description, category, level, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE lower(trim(m.title)) = lower(trim(v.title))
);
