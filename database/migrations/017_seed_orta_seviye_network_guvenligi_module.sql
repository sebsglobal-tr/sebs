-- Orta Seviye Network Güvenliği — getModuleIdFromName / API ilerlemesi için başlık
INSERT INTO public.modules (title, description, category, level, sort_order, is_active)
SELECT 'Orta Seviye Network Güvenliği', 'SEBS HTML modül kataloğu — savunma ve kanıt odaklı orta seviye ağ güvenliği', 'cybersecurity', 'intermediate', 24, true
WHERE NOT EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE lower(trim(m.title)) = lower(trim('Orta Seviye Network Güvenliği'))
);
