-- Network Güvenliği HTML modülü — getModuleIdFromName / API ilerlemesi için başlık
INSERT INTO public.modules (title, description, category, level, sort_order, is_active)
SELECT 'Network Güvenliği', 'SEBS HTML modül kataloğu', 'cybersecurity', 'intermediate', 25, true
WHERE NOT EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE lower(trim(m.title)) = lower(trim('Network Güvenliği'))
);
