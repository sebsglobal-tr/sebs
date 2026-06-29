# -*- coding: utf-8 -*-
"""Educator-grade Turkish content blocks for Temel Siber Güvenlik module."""

def P(*paras):
    return ''.join(f'<p>{x}</p>' for x in paras)

def NAR(hid, icon, title, *paras):
    return f'<div class="edu-narrative enhanced-text"><h3 id="{hid}"><i class="fas {icon}"></i> {title}</h3>{P(*paras)}</div>'

def CH(*blocks):
    inner = ''.join(blocks)
    return f'<div class="edu-chapter-body enhanced-text">{inner}</div>'

def H3(hid, icon, title, *paras):
    return f'<h3 id="{hid}"><i class="fas {icon}"></i> {title}</h3>{P(*paras)}'

# --- CIA equal-depth blocks ---
CIA_GIZ = H3('cia-gizlilik', 'fa-lock', 'Gizlilik (Confidentiality)',
    '<strong>Gizlilik</strong>, bilginin yalnızca yetkili kişi, süreç ve sistemler tarafından görülebilmesidir. İhlal: yetkisiz okuma, kopyalama, ifşa veya dinleme.',
    'Teknik kontroller: <strong>şifreleme</strong> (AES-256, TLS 1.3), <strong>erişim kontrolü</strong> (RBAC, ABAC), <strong>maskeleme</strong> (destek ekranında kart numarasının gizlenmesi), güvenli silme ve anahtar yönetimi (KMS, HSM).',
    'Organizasyonel kontroller: veri sınıflandırması (genel / dahili / gizli), minimum veri ilkesi, NDA, tedarikçi sözleşmeleri, fiziksel erişim kartları.',
    'Örnek ihlaller: veritabanı dump’ının dark web’de satılması, çalışanın ekran görüntüsüyle hasta kaydı paylaşması, yanlışlıkla herkese açık S3 bucket. KVKK/GDPR kapsamında bildirim ve idari para cezası gündeme gelebilir.',
    'Gizlilik tek başına yeterli değildir: veri sızmamış ama <em>değiştirilmiş</em> olabilir (bütünlük) veya sistem çalışmıyor olabilir (erişilebilirlik). Olay analizinde üç boyutu ayrı değerlendirin.',
    'Gizlilik ↔ erişilebilirlik: Aşırı kısıtlama işi yavaşlatır. Rol bazlı erişim, MFA ve acil “break-glass” hesap prosedürü denge sağlar.',
)

CIA_BUT = H3('cia-butunluk', 'fa-check-double', 'Bütünlük (Integrity)',
    '<strong>Bütünlük</strong>, verinin ve sistemlerin yetkisiz veya hatalı şekilde değiştirilmediğinin güvencesidir. “Doğru, tam, güvenilir ve değişikliklerin izlenebilir olduğu” veri anlamına gelir.',
    'Teknik kontroller: <strong>hash</strong> (SHA-256), <strong>dijital imza</strong> (PKI), checksum, <strong>audit log</strong> (kim, ne zaman, neyi değiştirdi), veritabanı transaction bütünlüğü, sürüm kontrolü (Git), WORM depolama.',
    'Bütünlük saldırıları gizlilik ihlali kadar görünür olmayabilir: muhasebe satırında küçük tutar oynaması, üretim sensör değerinin manipülasyonu, web sitesine sahte duyuru, yazılım paketine backdoor enjeksiyonu.',
    'Ransomware hem <em>bütünlüğü</em> (dosyalar şifrelenir/değişir) hem <em>erişilebilirliği</em> (sistem kullanılamaz) etkiler; “sadece veri çalındı” varsayımı tehlikelidir.',
    'Bütünlük ↔ erişilebilirlik: Her değişiklik için çok katmanlı onay bütünlüğü artırır, acil müdahaleyi geciktirir. Otomasyon + acil değişiklik penceresi tanımlanmalıdır.',
    'Pratik soru: “Bu rapordaki rakama güvenebilir miyim?” — Evet diyorsanız bütünlük kontrolleri işliyor demektir.',
)

CIA_ERI = H3('cia-erisilebilirlik', 'fa-plug', 'Erişilebilirlik (Availability)',
    '<strong>Erişilebilirlik</strong>, yetkili kullanıcıların ve süreçlerin ihtiyaç duyduğu anda sisteme ve veriye ulaşabilmesidir. Hizmet üretilemiyorsa diğer CIA hedefleri pratikte anlamsızlaşır.',
    'Teknik kontroller: yedekleme ve <strong>restore testi</strong>, felaket kurtarma (DR), yük dengeleme, kapasite planı, DDoS savunması (WAF, scrubbing), yedek güç, coğrafi yedeklilik.',
    'Operasyonel metrikler: <strong>RTO</strong> (Recovery Time Objective — ne kadar sürede ayağa kalkmalı), <strong>RPO</strong> (Recovery Point Objective — ne kadar veri kaybı kabul edilebilir). SLA’lar bu metriklerle yazılır.',
    'Örnek ihlaller: DDoS ile e-ticaret sitesinin çöküşü, ransomware ile şifrelenmiş sunucular, veri merkezi yangını, yanlış zamanlanmış yama sonrası ERP’nin günlerce kapalı kalması.',
    'Hastane randevu sistemi çalışmıyorsa veri sızmamış olsa bile <em>erişilebilirlik</em> ihlalidir; can güvenliği bağlamında kritik öncelik alır.',
    'Erişilebilirlik ↔ gizlilik: Felaket tatbikatları planlı kesinti gerektirir; müşteri ve regülatöre önceden iletişim şarttır.',
)
