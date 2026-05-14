#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate expanded premium HTML fragments for Web Uygulama Güvenligi module."""
from __future__ import annotations

import html as h
from pathlib import Path

OUT0 = Path(__file__).resolve().parents[1] / "frontend" / "modules" / "parts" / "web-uygulama-guvenligi-0-5.html"


def esc(s: str) -> str:
    return h.escape(s)


def quiz(items: list[dict]) -> str:
    lines = [
        "<h2>Kendini Değerlendir</h2>",
        '<div class="eval-quiz-section">',
        "<p>Aşağıdaki sorular savunma, saldırı yüzeyi okuması, risk ve kanıt yorumunu ölçer.</p>",
    ]
    for it in items:
        lines.append("<ol><li>" + esc(it["q"]) + "</li></ol>")
        for i, ch in enumerate(it["choices"]):
            lines.append("<p>" + chr(ord("A") + i) + ") " + esc(ch) + "</p>")
        lines.append(
            "<ul><li>Doğru: "
            + it["correct"]
            + "</li><li>Gerekçe: "
            + esc(it["reason"])
            + "</li></ul>"
        )
    lines.append("</div>")
    return "\n".join(lines)


def lo(title: str, items: list[str]) -> str:
    ul = "".join(f"<li>{esc(x)}</li>" for x in items)
    return f'<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> {esc(title)}</h3><ul>{ul}</ul></div>'


def sec(sid: str, active: bool, inner: str) -> str:
    cls = "content-section docx-content active" if active else "content-section docx-content"
    return f'<section class="{cls}" id="{sid}" data-section="{sid}">\n<div class="section-inner module-2-enhanced">\n{inner}\n</div>\n</section>\n'


def img_block(src: str, alt: str, caption: str) -> str:
    return f'''<div class="lesson-image-wrap"><img src="{esc(src)}" alt="{esc(alt)}" class="lesson-image" loading="lazy" referrerpolicy="no-referrer"><p class="lesson-image-caption">{esc(caption)}</p></div>'''


def risk_card(inner_html: str) -> str:
    return f'<div class="risk-visual-card">{inner_html}</div>'


def process_flow(steps: list[tuple[str, str]]) -> str:
    parts = ['<div class="process-flow" aria-label="İş akışı">']
    for icon, label in steps:
        parts.append(f'<div class="process-step"><i class="fas {icon}"></i> {esc(label)}</div>')
    parts.append("</div>")
    return "\n".join(parts)


def table(headers: list[str], rows: list[list[str]]) -> str:
    th = "".join(f"<th>{esc(c)}</th>" for c in headers)
    body = ""
    for r in rows:
        body += "<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>"
    return f'<table class="comparison-table"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>'


def term(title: str, body: str) -> str:
    return f"<h3>{esc(title)}</h3>\n<p>{body}</p>"


# --- MOD 0 ---
M0 = f"""<h1>MODÜL 0 — Etik, Yetki ve Güvenli Çalışma Çerçevesi</h1>
{img_block("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=90", "Hukuk ve siber güvenlik", "Profesyonel web güvenliği çalışması: yazılı yetki, kapsam ve denetlenebilir kanıt.")}
<p>Bu modül bir “giriş engeli”dir (gating): Burada çerçeve oturmadan teknik başarı sayılmaz. Web uygulaması güvenliği eğitiminde saldırganın <em>hedeflediği değerleri</em> (hesaplar, oturumlar, veri, işlem bütünlüğü, itibar) anlamak; aynı zamanda bu değerlere <strong>yetkisiz veya ölçüsüz</strong> temasın neden kurumsal felaket olduğunu anlamaktır. Savunmacı ve güvenli test uzmanı, tehdidi modellemek zorundadır; fakat gerçek sistemlere yönelik exploit reçetesi üretmez, kapsam dışına taşmaz ve kanıtı manipüle etmez.</p>
<p>Tehdit tarafı perspektifi (eğitim düzeyinde): saldırganın motivasyonu çoğu zaman <strong>erişim</strong>, <strong>kalıcılık</strong>, <strong>veri toplama</strong> veya <strong>hizmet aksatma</strong> üzerinedir. Web uygulaması bu zincirde sıkça ilk temas veya kalıcı erişim noktasıdır. Bu nedenle “sadece teknik kontrol listesi” yetmez; <strong>hangi varlığa dokunduğunuz</strong> ve <strong>hangi veriyi taşıdığınız</strong> her adımda sorulur.</p>
{lo("Modül hedefleri", [
    "Yetkisiz test ile yetkili güvenlik çalışması arasındaki çizgiyi kurumsal dilde açıklayabilirim.",
    "RoE, kapsam, ortam ayrımı ve kill-switch kavramlarını web bağlamında uygulayabilirim.",
    "Kanıt minimizasyonu ve kişisel/hassas veri için maskeleme kararı verebilirim.",
    "Bulgu → Etki → Öneri → Kanıt omurgasında rapor üretebilirim.",
    "Saldırganın hedeflediği değerleri (varlık) savunma kararlarına bağlayabilirim.",
])}
<h2>Yetkili çalışma: yazılı izin, kapsam ve “saldırganın gördüğü yüzey”</h2>
<p>Yetkili çalışma, “teknik olarak yapılabiliyor” değil, “yazılı olarak yapılmasına izin veriliyor” demektir. Kapsam belgesi yalnızca URL listesi değildir: <strong>ortam</strong> (test/staging/üretim), <strong>veri türleri</strong> (anonim/üretim benzeri/üretim), <strong>yöntem sınıfları</strong> (salt okuma, belirli trafik üretimi, kod incelemesi vb.), <strong>raporlama</strong> ve <strong>durma koşulları</strong> açık yazılmalıdır.</p>
<p>Saldırganın perspektifiyle düşünün: belirsiz kapsam sizin için “ne yapmama gerektiği” belirsizliği değil, aynı zamanda <strong>yanlışlıkla kritik veriye temas</strong> veya <strong>hizmet kesintisi</strong> riskidir. Savunmacı dilde bu, “ölçüsüz doğrulama = operasyonel zarar”dır.</p>
{table(["Unsur", "Savunmacı soru", "Tehdit perspektifi (eğitim)"], [
    ["DNS kapsamı", "api.example.com kapsamda mı?", "Alt alan genişletme ile yüzey büyütme"],
    ["Kimlik bilgisi", "Hangi hesaplarla test edilecek?", "Ele geçirilmiş hesapla lateral hareket"],
    ["Veri", "Üretim PII loglanacak mı?", "Veri toplama ve sızdırma"],
    ["Yoğunluk", "Dakikada kaç istek üst sınırı?", "DoS yan etkisi veya log taşması"],
])}
{risk_card(img_block("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=90", "Risk kontrolü", "Stop condition ve kill-switch: saldırganın hızından önce kendi operasyonunuzu frenleyin.") + '''
<div class="risk-meter"><span class="risk-meter-label">Operasyonel risk (kavramsal)</span><div class="risk-meter-track"><span class="risk-meter-fill"></span></div></div>''')}
<h2>RoE (Rules of Engagement) ve Do Not Harm</h2>
<p>RoE; <strong>kim</strong>, <strong>ne zaman</strong>, <strong>hangi yöntem</strong>, <strong>hangi veri</strong>, <strong>ne zaman durulacak</strong> ve <strong>kim bilgilendirilecek</strong> sorularının tek sayfada toplanmış halidir. Web uygulamasında “zararsız” görünen otomasyon bile (ör. sürekli oturum açma denemesi) başka bir güvenlik kontrolünü tetikleyerek zincir başlatabilir.</p>
{process_flow([("fa-clipboard-list", "Hazırlık"), ("fa-play-circle", "Kontrollü uygulama"), ("fa-check-circle", "Doğrulama"), ("fa-folder-open", "Kanıt paketi"), ("fa-undo", "Geri dönüş")])}
<h2>Test, staging ve üretim: saldırganın da ayırt ettiği fark</h2>
<p>Saldırgan için ortam farkı her zaman anlamlı değildir; çünkü amaç veriye ulaşmaktır. Sizin için fark hayati: <strong>staging’de yakalanan bir hata üretimde aynı şekilde tetiklenmeyebilir</strong>; tersine, staging’de olmayan bir WAF kuralı üretimde vardır. Bu yüzden bulguları “hangi ortamda, hangi sürümde, hangi yapılandırmada” gördüğünüzü raporda ayrı ayrı yazarsınız.</p>
{table(["Ortam", "Savunma amacı", "Yaygın tuzak"], [
    ["Geliştirici makinesi", "Hızlı birim testi", "Üretim benzeri olmayan yapılandırma"],
    ["Staging", "Gerçekçi entegrasyon", "Veri seti üretimden farklı; sonuçları genellemeyin"],
    ["Üretim", "Gerçek risk ölçümü", "Her temas değişiklik ve izin gerektirir"],
])}
<h2>Veri minimizasyonu ve kişisel/hassas veri</h2>
<div class="data-protect-visual"><div class="integrity-pulse"><span class="integrity-pulse-icon"><i class="fas fa-shield-check"></i></span><span class="integrity-pulse-text">Minimum veri + maskeleme + erişim kaydı = savunılabilir kanıt</span></div></div>
<p>Tehdit modeli: saldırganın hedefi çoğu zaman <strong>kimlik bilgisi</strong>, <strong>oturum belirteci</strong>, <strong>işlem yetkisi</strong> veya <strong>doğrudan veri</strong>dir. Kanıt toplarken aynı hassasiyetleri taşımamak, sizin de “veri sızıntısı üreten güvenlik çalışması” yapmanıza yol açar. Bu nedenle ekran görüntülerinde token/TC/e-posta maskeleme; log kesitlerinde alan düşürme; paylaşım kanallarında şifreleme ve erişim listesi standardı uygulanır.</p>
<div class="linux-terminal"><div class="term-header"><span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span><span class="term-title">evidence-pack.sh — kavramsal kanıt paketi</span></div><div class="term-body"><span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">date -Iseconds</span>
<span class="term-output">2026-05-14T10:15:00+03:00</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">sha256sum access-redacted.log</span>
<span class="term-output">(örnek hash)  access-redacted.log</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">printf "dosya | hash | zaman | maskeleme-notu\\n" &gt;&gt; manifest.txt</span>
<span class="term-comment"># Amaç: zincirleme değil; denetlenebilir paket</span></div></div>
<h2>Kanıt bütünlüğü ve rapor omurgası</h2>
<p>Kanıt ile yorum ayrılmalıdır. Yorum, “bence şu oldu”; kanıt ise “şu log satırı şunu gösteriyor”dur. Saldırganın operasyonunda sık görülen <strong>kanıt silme veya manipülasyon</strong> riski, savunmada <strong>hash + manifest + erişim kaydı</strong> ile azaltılır.</p>
{process_flow([("fa-search", "Bulgu"), ("fa-exclamation-triangle", "Etki"), ("fa-lightbulb", "Öneri"), ("fa-file-shield", "Kanıt")])}
<p><strong>Bulgu</strong> gözlemi tarif eder. <strong>Etki</strong> iş sürekliliği, düzenleyici yük, müşteri güveni ve teknik blast radius ile ölçülür. <strong>Öneri</strong> uygulanabilir ve doğrulanabilir olmalıdır (kapanış kriteri yazılır). <strong>Kanıt</strong> bağımsız okuyucunun inceleyebileceği ham veya yarı işlenmiş çıktıdır.</p>
<h2>Bu modülde bilerek verilmeyenler</h2>
<p>Gerçek hedeflere yönelik adım adım saldırı reçetesi, payload kütüphanesi veya yetkisiz erişim yöntemi bu eğitim kapsamında yer almaz. Tehdit tarafı; <strong>amaç–yüzey–sinyal</strong> düzeyinde anlatılır ki savunma ve SOC entegrasyonunu doğru kurabilesiniz.</p>
""" + quiz(
    [
        {
            "q": "Yetkisiz üretim ortamında “kısa süreli” trafik üretmek profesyonel midir?",
            "choices": [
                "Evet, süre kısaysa her zaman uygundur",
                "Hayır; yazılı izin ve kapsam olmadan uygun değildir",
                "Sadece GET serbesttir",
                "Sadece iç ağda serbesttir",
                "Yönetici mesaj attıysa yeterlidir",
            ],
            "correct": "B",
            "reason": "Süre ve yöntem tek başına yetki yerine geçmez.",
        },
        {
            "q": "Kapsam belgesinde “api.example.com” açıkça yazılmadıysa en doğru yaklaşım hangisidir?",
            "choices": [
                "Varsayılan olarak kapsamdadır",
                "Kapsam dışı kabul edilip sahipten yazılı netleştirme istenir",
                "DNS otomatik kapsamdadır",
                "Sadece 443 ise kapsamdadır",
                "CDN üzerinden geçiyorsa serbesttir",
            ],
            "correct": "B",
            "reason": "Belirsiz alt alanlar scope creep ve yetkisiz temas riskidir.",
        },
        {
            "q": "Bulgu → Etki → Öneri → Kanıt akışında kanıtsız güçlü iddia neden zayıftır?",
            "choices": [
                "Daha hızlı okunur",
                "Denetlenemez ve itirazda çöker",
                "Daha kısa rapor üretir",
                "Otomatik doğrudur",
                "Yöneticiyi memnun eder",
            ],
            "correct": "B",
            "reason": "Profesyonellik kanıt ve yorum ayrımında ölçülür.",
        },
        {
            "q": "Staging bulgusunu üretim riski gibi sunmak için ne yapılmalıdır?",
            "choices": [
                "Başlığı “kritik” yapmak",
                "Ortam, sürüm ve yapılandırma farkını açıkça belirtmek",
                "Log silmek",
                "WAF kapatmak",
                "Kullanıcıyı suçlamak",
            ],
            "correct": "B",
            "reason": "Genelleme hatası yanlış önceliklendirmeye yol açar.",
        },
        {
            "q": "Kill-switch’in temel amacı nedir?",
            "choices": [
                "Log silmek",
                "Operasyonu kontrollü durdurarak zararı sınırlamak",
                "TLS kapatmak",
                "Parolayı sıfırlamak",
                "Raporu uzatmak",
            ],
            "correct": "B",
            "reason": "Acil durumda ölçüsüz devam riskini keser.",
        },
        {
            "q": "Tehdit perspektifinde “ilk temas” çoğu zaman nerede aranır?",
            "choices": [
                "Sadece fiziksel sunucu odası",
                "Herkese açık web/API yüzeyi ve kimlik uçları",
                "Sadece yazıcı",
                "Sadece yedek bant",
                "Sadece masaüstü duvar kağıdı",
            ],
            "correct": "B",
            "reason": "Web yüzeyi geniş ve sürekli erişilebilirdir.",
        },
        {
            "q": "Kanıt paketinde hash kullanımı neyi destekler?",
            "choices": [
                "Şifreleme",
                "Dosyanın sonradan değiştirilmediğini doğrulamayı",
                "DNS hızını",
                "CPU modelini",
                "Tema rengini",
            ],
            "correct": "B",
            "reason": "Bütünlük doğrulamasıdır.",
        },
        {
            "q": "Veri minimizasyonu hangi riski özellikle azaltır?",
            "choices": [
                "CPU sıcaklığı",
                "Gereksiz kişisel/hassas veri maruziyeti ve uyum yükü",
                "JPEG boyutu",
                "Font lisansı",
                "CDN fiyatı",
            ],
            "correct": "B",
            "reason": "Toplanan her veri saklama ve erişim yükü doğurur.",
        },
    ]
)

# --- MOD 1 ---
M1 = f"""<h1>MODÜL 1 — Web Uygulama Mimarisi ve Güvenlik Bakış Açısı</h1>
{img_block("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=90", "Sunucu odası ve ağ", "İstek yolu: tarayıcı → uç noktalar → iş mantığı → veri ve yan hizmetler.")}
<p>Web uygulamasını yalnızca “ön yüz–arka yüz–veritabanı” üçgeni olarak okumak, saldırganın gördüğü gerçek yüzeyi gizler. Saldırgan (eğitim perspektifi) çoğu zaman <strong>uç noktaları</strong> (login, şifre sıfırlama, dosya yükleme, arama, dışa aktarma, webhook), <strong>kimlik/oturum mekanizmasını</strong>, <strong>API sözleşmesini</strong> ve <strong>sunucunun güvendiği yan hizmetleri</strong> (ödeme, e-posta, depolama, mesaj kuyruğu) birlikte değerlendirir. Savunmacı mimari okuma; bu bileşenlerin her birinde “kim doğruluyor, kim yetkilendiriyor, nerede loglanıyor?” sorularını zorunlu kılar.</p>
{lo("Modül hedefleri", [
    "İstemci, API ağ geçidi, uygulama sunucusu, veri katmanı ve entegrasyonları tek şemada konumlandırabilirim.",
    "Trust boundary noktalarını ve saldırganın güven sınırını aşma stratejilerini (eğitim düzeyinde) tarif edebilirim.",
    "Saldırı yüzeyini işlev + veri + kimlik üçlüsüyle envanterleyebilirim.",
    "Ön uç gizlemenin yetki olmadığını saldırgan davranışıyla gerekçelendirebilirim.",
])}
<h2>İstek yaşam döngüsü: saldırganın ilk baktığı yer</h2>
<p>Tarayıcı veya mobil istemci HTTP(S) üzerinden kaynak ister; ara katmanlar (CDN, WAF, load balancer, API gateway) trafiği şekillendirir. Uygulama sunucusu iş kurallarını çalıştırır; veritabanı ve önbellek durumu saklar; mesajlaşma ve dosya sistemleri yan etkiler üretir. Saldırgan için her ara katman hem <strong>engel</strong> hem <strong>yeni sinyal kaynağı</strong>dır (ör. önbellekten eski içerik, WAF’tan blok sayfası, yük dengeleyiciden farklı backend sürümü).</p>
{table(["Katman", "Saldırganın ilgisi (eğitim)", "Savunmacı soru"], [
    ["CDN/edge", "Önbellek ihlali, başlık manipülasyonu", "Önbellek anahtarı ve invalidation politikası"],
    ["WAF", "İmza kaçırma, anormal parametre", "Alarmın uygulama loguyla korelasyonu"],
    ["Uygulama", "İş mantığı atlama, yetki hatası", "Her uçta sunucu tarafı yetki"],
    ["Veri", "Aşırı okuma/yazma", "Minimum ayrıcalık DB hesabı"],
])}
<h2>Korunacak varlıklar ve tehdit hedefleri</h2>
<p>Aynı ekranda görünen iki alan güvenlik açısından aynı değildir: “profil fotoğrafı” ile “yönetici rol ataması” farklı CIA etkileri taşır. Saldırgan çoğu zaman düşük dirençli bir varlıktan yüksek değerli varlığa <strong>yatay</strong> veya <strong>dikey</strong> hareket etmeye çalışır (ör. sıradan kullanıcı hesabından yönetim işlevine). Bu nedenle varlık envanteri sadece veri tabloları değil; <strong>işlevler</strong> ve <strong>entegrasyon sırlarıdır</strong>.</p>
{risk_card(img_block("https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&q=90", "Güvenlik analizi", "Varlık sınıflandırması: veri, kimlik, işlem, yapılandırma ve sırlar ayrı ayrı korunur.") + '<div class="risk-meter"><span class="risk-meter-label">Blast radius (kavramsal)</span><div class="risk-meter-track"><span class="risk-meter-fill" style="width:55%"></span></div></div>')}
<h2>Trust boundary ve “istemci güvenilmezdir”</h2>
<p>Güven sınırı, güvenilen bileşenle güvenilmeyen bileşen arasındaki çizgidir. Tarayıcı ve kullanıcı girdisi güvenilmez taraftadır; sunucu tarafı doğrulama güvenilen tarafa geçişte zorunludur. Saldırgan tarayıcıda JavaScript’i değiştirir, isteği yeniden yazar, gizli API anahtarını arar, yerel depolamayı okur. Bu yüzden “gizli endpoint” veya “minified JS içinde saklı anahtar” uzun vadede <strong>güvenlik kontrolü değildir</strong>.</p>
{process_flow([("fa-user-secret", "Saldırgan: istemciyi kontrol eder"), ("fa-network-wired", "İstek üretir"), ("fa-server", "Sunucu: doğrular ve yetkilendirir"), ("fa-database", "Veri: en son sınır")])}
<h2>Saldırı yüzeyi envanteri (örnek çerçeve)</h2>
{table(["Yüzey öğesi", "Örnek uç/işlev", "Tehdit sorusu", "Savunma sorusu"], [
    ["Kimlik", "/login, /oauth/callback", "Oturum ele geçirme?", "MFA, hız sınırı, anomali?"],
    ["Dosya", "/upload, /export", "Kötü içerik?", "İçerik doğrulama, tip ayrımı?"],
    ["Yönetim", "/admin/*", "Yetkisiz işlev?", "Ayrı kimlik + RBAC + denetim logu?"],
    ["Webhook", "/hooks/*", "Sahte olay?", "İmza, zaman damgası, yeniden oynatma?"],
])}
<h2>Log ve yetki: “saldırgan sessiz kalır mı?”</h2>
<p>Kusursuz saldırı yoktur; fakat log görünürlüğü zayıfsa sessizlik yanlış negatif üretir. Mimari okumada her kritik işlem için en az bir kayıt hedefi seçilir: kimlik sağlayıcı, uygulama, API geçidi, veritabanı denetimi (mümkünse). Saldırganın sık yaptığı “düşük gürültülü” yöntemler (ör. yavaş parola denemesi, küçük adımlarla ID artırımı) yalnızca yüksek çözünürlüklü loglama ve korelasyonla görünür hale gelir.</p>
<h2>Okuma alıştırması (checklist)</h2>
<p>Veri nereden geliyor ve hangi doğrulamadan geçti? Kim hangi kaynağa hangi rolle erişiyor? Hangi işlem sunucuda yeniden hesaplanıyor? Hangi hata mesajı iç yapı sızdırıyor? Hangi entegrasyon dışarıya çıkış yapıyor? Bu sorular hem tehdit modelini hem de SOC alarm tasarımını besler.</p>
""" + quiz(
    [
        {"q": "Arayüzde gizli admin URL’si güvenlik sağlar mı?", "choices": ["Evet", "Hayır; yetki sunucuda zorunludur", "Sadece HTTPS ise evet", "Sadece VPN ise evet", "Sadece mobilde hayır"], "correct": "B", "reason": "Gizlilik yerine güvenlik için sunucu tarafı yetkilendirme şarttır."},
        {"q": "Trust boundary en doğru tanımı hangisidir?", "choices": ["TLS sertifikası", "Güvenilen ve güvenilmeyen bileşenler arası sınır", "Veritabanı portu", "CDN", "CSS"], "correct": "B", "reason": "Doğrulama ve güven değerlendirmesi bu çizgide yapılır."},
        {"q": "Saldırı yüzeyi için en kapsayıcı ifade hangisidir?", "choices": ["Sadece açık portlar", "Erişilebilen uçlar + zayıf kontroller + yan entegrasyonlar", "Sadece parola politikası", "Sadece WAF", "Sadece CPU"], "correct": "B", "reason": "Yüzey yalnızca port değil; işlev ve veri yollarıdır."},
        {"q": "İstemci tarafı doğrulama tek başına neden yetersizdir?", "choices": ["Çünkü yavaştır", "Çünkü istemci saldırgan tarafından kontrol edilebilir", "Çünkü TLS kapatır", "Çünkü log üretmez", "Çünkü CDN yoktur"], "correct": "B", "reason": "Güvenilir karar sunucuda tekrarlanmalıdır."},
        {"q": "Blast radius ifadesi neyi ölçer?", "choices": ["Font boyutu", "Bir hata sonrası etkilenen varlık/işlev genişliği", "DNS TTL", "JPEG kalitesi", "Tema"], "correct": "B", "reason": "Kontrol boşluğunun iş etkisini tarif eder."},
        {"q": "API geçidi loglarının mimari değeri nedir?", "choices": ["Yok", "Uç bazlı merkezi görünürlük ve korelasyon", "Tema", "Favicon", "CPU"], "correct": "B", "reason": "Dağılmış uygulamalarda iz sürme kolaylaşır."},
        {"q": "Yan entegrasyon (e-posta, ödeme) neden yüzeydir?", "choices": ["Çünkü hızlıdır", "Çünkü uygulama sırları ve çıkış trafiği taşır", "Çünkü CSS üretir", "Çünkü TLS kapatır", "Çünkü WAF kaldırır"], "correct": "B", "reason": "Dış sistemler yeni güven sınırı ve sızdırma noktasıdır."},
        {"q": "Staging bulgusunu üretimle ilişkilendirirken hangi ek bilgi şarttır?", "choices": ["Logo", "Sürüm ve yapılandırma farkı", "Font", "Favicon", "Tema"], "correct": "B", "reason": "Aynı kod farklı ortamda farklı davranabilir."},
    ]
)

# --- MOD 2 ---
M2 = f"""<h1>MODÜL 2 — HTTP, Cookie, Session ve Tarayıcı Güvenlik Modeli</h1>
{img_block("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&q=90", "Ağ ve güvenlik", "HTTP katmanı: saldırganın en çok oynadığı oyun tahtası; savunmacının en çok log ürettiği katman.")}
<p>HTTP’yi “sadece taşıma” sanmak yanılgıdır. Oturum çerezleri, yönlendirmeler, önbellek başlıkları, içerik müzakere satırları ve CORS yanıtları birlikte <strong>güvenlik politikası</strong> oluşturur. Saldırgan (eğitim düzeyinde) çoğu zaman oturumu çalmaya, tarayıcıyı kandırarak işlem yaptırmaya veya sunucuyu yanlış yorumlamaya zorlayan istek dizileri kurar; savunmacı ise bu dizileri logda <strong>özgün imza</strong> olarak arar.</p>
{lo("Modül hedefleri", [
    "HTTP yöntem ve durum kodlarını güvenlik açısından yorumlayabilirim.",
    "Çerez bayrakları ve Same-origin/CORS etkileşimini tehdit modeline bağlayabilirim.",
    "TLS’nin sınırlarını (ne korur / ne korumaz) netleştirebilirim.",
    "İstek/yanıt kesitini kanıt olarak maskeleyebilirim.",
])}
<h2>İstek ve yanıt: saldırganın oynadığı alan</h2>
<p>Method (GET/POST/PUT/PATCH/DELETE) sunucunun beklediği yan etkiyi çerçeveler. GET ile durum değiştirmek hem CSRF yüzeyini büyütür hem de önbellek/proxy katmanlarında beklenmedik sonuçlar doğurur. Durum kodları: 401/403 yetki ve kimlik ayrımı için; 429 hız sınırlama için; 5xx yapılandırma veya dayanıklılık sorunları için sinyal taşır. Saldırgan çoğu zaman <strong>anormallikleri</strong> (çok uzun parametre, beklenmeyen Content-Type, sıra dışı Accept başlığı) keşif veya kaçınma için kullanır.</p>
{table(["Başlık sınıfı", "Örnek", "Tehdit okuması (eğitim)", "Savunma notu"], [
    ["Kimlik", "Authorization, Cookie", "Oturum taşıma, token sızıntısı", "Kısa ömür, bağlama, yenileme politikası"],
    ["Önbellek", "Cache-Control", "Önbellek zehirleme / eski içerik", "Hassas yanıtta no-store"],
    ["Güvenlik", "CSP, HSTS", "Enjeksiyon sonrası etki kısıtı", "Politika modları ve raporlama"],
    ["İçerik", "Content-Type", "Tip karmaşası", "Sunucuda tip doğrulama"],
])}
<h2>Çerez, oturum ve token: çalınan şey genelde budur</h2>
<p>Oturum çerezi veya taşıyıcı token, saldırgan için “şifre bilmeden kullanıcı olmak” değerindedir. HttpOnly, XSS sonrası belirtecin JavaScript ile okunmasını zorlaştırır; Secure taşıma sırasında sızıntı riskini azaltır; SameSite, siteler arası isteklerde çerezin yanlışlıkla taşınmasını kısıtlar. Savunmacı ayrıca <strong>oturum bağlama</strong> (cihaz, IP çeşitliliği, Coğrafya tutarlılığı) ve <strong>yenileme belirteci</strong> rotasyonunu değerlendirir.</p>
{risk_card('<p class="section-mini-heading">Saldırgan hedefleri (eğitim)</p><ul><li>Oturum belirteci ele geçirme</li><li>Kullanıcıyı durum değiştiren isteğe zorlama (CSRF bağlamı)</li><li>Başlık enjeksiyonu ile ara katmanı şaşırtma</li></ul>')}
<h2>HTTPS / TLS: koruduğu ve koruymadığı</h2>
<p>TLS taşıma sırasında gizlilik ve bütünlük sağlar; fakat uygulama düzeyinde “kullanıcı A’nın verisini kullanıcı B görüyor” hatasını çözmez. Saldırgan TLS içindeki trafiği kendi cihazında üretebilir; bu nedenle uçtan uca güven, uygulama mantığında kurulur.</p>
<h2>Same-origin ve CORS: yanlış yapılandırmanın maliyeti</h2>
<p>Tarayıcı, farklı kökenler arasında veri okumayı varsayılan olarak kısıtlar. CORS gevşetildiğinde (ör. geniş joker veya yansıtılan köken), tarayıcı saldırganın sayfasından hedef siteye “izinli” okuma/yazma kanalı açılmış olabilir. Savunmacı, preflight ve izin verilen köken listesini <strong>uç bazında</strong> inceler.</p>
{process_flow([("fa-globe", "Köken politikası"), ("fa-random", "Preflight (OPTIONS)"), ("fa-check", "Sunucu izin başlıkları"), ("fa-eye", "Tarayıcı uygular")])}
<h2>Kanıt olarak istek/yanıt kesiti</h2>
<p>Geliştirici araçları veya ters vekil (kurum içi yetkili) ile alınan kesitlerde: URL parametreleri, çerez adları, hata gövdeleri ve PII maskelenir. Kanıtın değeri, yalnızca ekran görüntüsü değil; <strong>zaman damgası + korelasyon kimliği + maskeleme politikası</strong> notudur.</p>
""" + quiz(
    [
        {"q": "HttpOnly çerez bayrağının birincil amacı nedir?", "choices": ["Şifrelemek", "JavaScript ile çerez okumasını kısıtlamak", "CSRF’i tek başına bitirmek", "GET yasaklamak", "CDN kapatmak"], "correct": "B", "reason": "XSS sonrası belirteç okuma riskini azaltır."},
        {"q": "SameSite stratejisi hangi tehdit bağlamıyla ilişkilidir?", "choices": ["SQL", "Siteler arası isteklerde çerez taşınması", "DNSSEC", "Path traversal", "JPEG"], "correct": "B", "reason": "Çapraz site bağlamında çerez sınırlanır."},
        {"q": "TLS hangi sınıfı tek başına çözmez?", "choices": ["MITM (doğru kurulumla)", "Uygulama düzeyi yetki hatası", "Taşıma bütünlüğü", "Dinleme riskini azaltma", "Sertifika doğrulama ihtiyacı"], "correct": "B", "reason": "Yetkilendirme uygulama mantığında kalır."},
        {"q": "GET ile durum değiştirmek neden risklidir?", "choices": ["Hızlıdır", "CSRF ve önbellek/proxy yan etkileri doğurabilir", "TLS gerektirir", "Log üretmez", "WAF kapatır"], "correct": "B", "reason": "Yan etkisiz yöntemler tercih edilmelidir."},
        {"q": "429 yanıtı analist için neyi düşündürmelidir?", "choices": ["DNS", "Hız sınırlama veya kötüye kullanım", "JPEG", "Font", "Tema"], "correct": "B", "reason": "Oran kontrolü veya saldırı sinyali olabilir."},
        {"q": "CORS’ta geniş köken izni riski nedir?", "choices": ["Yok", "İstenmeyen kökenlerden veri erişimi", "Sadece mobil", "Sadece GET", "Sadece CDN"], "correct": "B", "reason": "Köken kontrolü gevşer."},
        {"q": "İstemci tarafı depolamada token tutmanın tipik riski nedir?", "choices": ["Daha hızlı", "XSS ile okunabilirlik artışı", "TLS kapanır", "WAF", "DNS"], "correct": "B", "reason": "HttpOnly çerez veya güvenli depolama tercihleri değerlendirilir."},
        {"q": "Kanıt kesitinde maskeleme neden zorunlu?", "choices": ["Estetik", "PII ve sırların ikinci kez sızmasını önlemek", "SEO", "CPU", "Tema"], "correct": "B", "reason": "Kanıt üretimi de veri minimizasyonuna tabidir."},
    ]
)

# --- MOD 3 ---
M3 = f"""<h1>MODÜL 3 — Kimlik Doğrulama ve Oturum Güvenliği</h1>
{img_block("https://images.unsplash.com/photo-1633265486064-086b219458ec?w=900&q=90", "Kimlik doğrulama", "Oturum ve kimlik: saldırganın en çok parola denediği; savunmacının en çok log topladığı alan.")}
<p><strong>Kimlik doğrulama</strong> “kimsin?” sorusudur; <strong>yetkilendirme</strong> “ne yapabilirsin?” sorusudur. Oturum güvenliği zayıfsa kimlik doğrulama gücü (uzun parola bile) boşa gider çünkü saldırgan artık sizin yerinize oturumu taşır. Bu modülde saldırı <em>reçetesi</em> verilmez; fakat saldırganın tipik <strong>hedefleri</strong> ve savunmacının <strong>gözlediği sinyaller</strong> ayrıntılı anlatılır: kimlik bilgisi doldurma (credential stuffing), parola püskürtme (password spraying), oturum çalma, MFA yorgunluğu ve kurtarma akışı suistimali gibi <em>kavramlar</em> düzeyinde.</p>
{lo("Modül hedefleri", [
    "Parola, MFA ve oturum yaşam döngüsü risklerini tehdit–savunma çifti olarak açıklayabilirim.",
    "Kimlik loglarını (başarılı/başarısız, MFA, cihaz) yorumlayabilirim.",
    "Şüpheli oturum analizini adım adım ve kanıt bağlı yazabilirim.",
    "Yanlış pozitif/negatif riskini hesap kritikliğiyle tartabilirim.",
])}
<h2>Saldırganın kimlik oyunu (eğitim düzeyinde)</h2>
<p>Saldırganın amacı çoğu zaman geçerli oturum elde etmektir. Bunun için (a) sızdırılmış parola listeleriyle toplu deneme, (b) aynı parolayı çok hesapta deneme (spraying), (c) zayıf kurtarma akışları, (d) oturum belirteci çalma, (e) MFA yorgunluğu veya sosyal mühendislikle ikinci faktörü aşma girişimleri gibi stratejiler görülür. Savunma tarafında karşılık: <strong>hız sınırlama + gecikme + kilit politikası dengesi</strong>, <strong>şüpheli oturum risk skoru</strong>, <strong>cihaz kaydı ve yeniden kimlik doğrulama</strong>, <strong>oturum rotasyonu</strong> ve <strong>anomali tabanlı MFA zorlama</strong>.</p>
{table(["Sinyal", "Olası tehdit hipotezi (eğitim)", "Savunmacı doğrulama"], [
    ["Kısa sürede çok 401/403", "Kaba kuvvet / spraying", "IP ve hesap korelasyonu, CAPTCHA etkisi"],
    ["Başarısız→başarılı küme", "Doğru parola bulundu", "Coğrafya/cihaz tutarlılığı, MFA sonucu"],
    ["Aynı hesap çok IP", "Paylaşım veya ele geçirme", "Risk tabanlı step-up"],
    ["MFA başarısızlık artışı", "MFA yorgunluğu saldırısı", "Kanal değişimi, rate limit"],
])}
<h2>Parola, hash ve saldırganın “offline” düşüncesi</h2>
<p>Veritabanı sızdığında saldırgan offline olarak hash kırma oyununa geçer. Savunma: güçlü parola politikası + uygun password hashing + tuz + GPU maliyetini artıran parametreler. Burada kritik nokta: kullanıcı davranışı (tekrarlayan parolalar) saldırganın işini kolaylaştırır; bu yüzden MFA ve sızdırılmış parola taraması (kurum içi) önemlidir.</p>
{risk_card('<p><strong>Oturum belirteci</strong> çalındığında parola bilinmese bile hesap ele geçirilmiş sayılır. Bu nedenle XSS/veri sızıntısı ile oturum güvenliği tek çözüm değildir; derinlemesine savunma gerekir.</p>')}
<h2>Oturum yaşam döngüsü: fixation ve yenileme</h2>
<p>Oturum fixation fikri: saldırganın oturum kimliğini kullanıcıya bağlatma riski (modern çerçevelerde azaltılmış olsa da yapılandırma hatalarıyla geri gelir). Oturum yenileme (rotation): ayrıcalık yükseltme sonrası veya şüphede yeni oturum kimliği üretmek. “Beni hatırla” uzun ömürlü ve riskli bir yüzeydir; cihaz güvenilirliği ve çalıntı senaryosu birlikte düşünülür.</p>
<h2>HOW-TO: Şüpheli giriş aktivitesini savunma odaklı analiz etmek</h2>
{process_flow([("fa-clock", "Zaman penceresi"), ("fa-user", "Hesap"), ("fa-network-wired", "IP/UA/cihaz"), ("fa-balance-scale", "Başarılı/başarısız"), ("fa-shield-alt", "MFA"), ("fa-file-alt", "Rapor")])}
<ol>
<li>Zaman aralığını daralt: olay öncesi/sonrası 24–72 saat gibi makul pencere.</li>
<li>Hesabın rolünü ve eriştiği veri sınıflarını yaz: blast radius.</li>
<li>IP coğrafyası, user-agent ailesi, cihaz parmak izi (varsa) üçlüsünü birlikte oku; tek başına IP “suç” değildir.</li>
<li>Başarısız denemelerin ardından gelen başarıyı özellikle incele.</li>
<li>MFA sonuç kodlarını ve step-up tetiklerini doğrula.</li>
<li>Hipotezleri “destekleyen kanıt / çürüten kanıt” olarak listele; kesin hükümden kaçın.</li>
<li>Raporu Bulgu → Etki → Öneri → Kanıt ile bağla; öneride kapanış kriteri (ör. parola sıfırlama + oturum sonlandırma sonrası log beklentisi) yaz.</li>
</ol>
""" + quiz(
    [
        {"q": "Kimlik doğrulama ile yetkilendirme ayrımı neden kritiktir?", "choices": ["Aynı şeydir", "Giriş yapmak her işlemi izinli yapmaz", "Sadece mobilde önemlidir", "Sadece GET için önemlidir", "Log gerektirmez"], "correct": "B", "reason": "Her işlem ayrı yetki gerektirir."},
        {"q": "Credential stuffing hipotezi için en güçlü kanıt çifti hangisidir?", "choices": ["Sadece CPU", "Başarısız deneme kümesi + başarılı oturum ve tutarsız cihaz", "Sadece tema", "Sadece favicon", "Sadece TLS"], "correct": "B", "reason": "Davranış ve bağlam birlikte değerlendirilir."},
        {"q": "Hesap kilitleme politikasının riski nedir?", "choices": ["Yok", "Kullanılabilirlik ve kötüye kullanılabilir kilitlenme", "TLS kapanır", "WAF", "DNS"], "correct": "B", "reason": "Denge ve kurtarma süreci gerekir."},
        {"q": "MFA’nın savunma değeri hangi senaryoda en görünür?", "choices": ["Statik dosya", "Parola sızdıysa ikinci faktör", "JPEG", "CSS", "Font"], "correct": "B", "reason": "İkinci kanıt katmanı ekler."},
        {"q": "Oturum rotasyonu ne zaman düşünülmelidir?", "choices": ["Her istekte zorunlu", "Ayrıcalık yükseltme veya şüpheli aktivite sonrası", "Asla", "Sadece CDN için", "Sadece DNS için"], "correct": "B", "reason": "Ele geçirilmiş oturumu geçersiz kılar."},
        {"q": "Şüpheli analizde neden tek başına IP yeterli değildir?", "choices": ["IP her zaman suçtur", "VPN, mobil taşıyıcı, paylaşımlı NAT yanlış suçlamayı artırır", "IP logda yoktur", "IP TLS kapatır", "IP tema seçer"], "correct": "B", "reason": "Bağlam ve ek sinyaller gerekir."},
        {"q": "MFA logunda tekrarlayan başarısız doğrulama neyi düşündürmeli?", "choices": ["DNS", "MFA yorgunluğu veya bot/otomasyon", "JPEG", "Font", "Tema"], "correct": "B", "reason": "Kullanıcıyı yıpratma veya saldırı sınıfı olabilir."},
        {"q": "“Beni hatırla” riskini azaltmada hangi yaklaşım uygundur?", "choices": ["Süresiz token", "Kısa ömür, cihaz bağlama ve iptal mekanizması", "Token’ı URL’de taşımak", "Token’ı ekranda göstermek", "Token’ı e-postada göndermek"], "correct": "B", "reason": "Ömür ve iptal kontrolü şarttır."},
    ]
)

# --- MOD 4 ---
M4 = f"""<h1>MODÜL 4 — Yetkilendirme ve Erişim Kontrolü</h1>
{img_block("https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&q=90", "Erişim kontrolü", "Yetki: saldırganın ‘başkasının kaydına’ dokunmaya çalıştığı yer; savunmacının her uçta tekrarladığı kontrol.")}
<p>Kimlik doğrulandıktan sonra asıl oyun <strong>yetkilendirme</strong>dedir. Saldırgan (eğitim düzeyinde) sıkça “aynı uç, farklı kimlik” veya “tahmin edilebilir kaynak kimliği” ile yetkisiz nesneye erişmeyi dener. Modern literatürde BOLA/BFLA (Broken Object / Function Level Authorization) bu sınıfın parçasıdır. Savunma: her istek için <strong>kaynak sahipliği</strong> ve <strong>işlev izni</strong> sunucuda yeniden hesaplanır; ön yüzde gizli düğme güvenlik değildir.</p>
{lo("Modül hedefleri", [
    "RBAC ile nesne düzeyi yetkiyi ayırabilirim.",
    "IDOR riskini ‘erişim kararı nerede veriliyor?’ sorusuyla okuyabilirim.",
    "Admin ve ayrıcalıklı uçlar için güçlendirilmiş kontrol listesi yazabilirim.",
    "Yetki reddi loglarını SOC senaryolarına bağlayabilirim.",
])}
<h2>Saldırganın bakış açısı: nesne ve işlev</h2>
<p>Saldırgan iki soru sorar: (1) Bu API uç noktası başka kimlikle çağrılabiliyor mu? (2) Bu yönetim işlevi normal kullanıcı oturumuyla tetiklenebiliyor mu? Başarılı yanıt genelde sunucunun <strong>nesne düzeyi kontrolü atlattığı</strong> veya <strong>rol kontrolünün eksik olduğu</strong> anlamına gelir.</p>
{table(["Kontrol türü", "Soru", "Tipik hata"], [
    ["RBAC", "Bu rol bu işlemi yapabilir mi?", "Rol geniş; ayrıntı yok"],
    ["Object-level", "Bu kayıt bu kullanıcıya mı ait?", "ID ile doğrudan erişim"],
    ["Function-level", "Bu admin işlevi kimlerde?", "Arayüz gizli, sunucu açık"],
])}
<h2>IDOR / nesne düzeyi: neden “sadece bir sayı” tehlikelidir</h2>
<p>Kaynaklar URL veya API gövdesinde sayısal/sıralı kimliklerle temsil edildiğinde, saldırgan başka kimlikleri denemek isteyebilir. Savunma yalnızca “UUID kullan” değildir; asıl mesele <strong>sunucunun her istekte sahiplik doğrulaması</strong> yapmasıdır. UUID, keşfi zorlaştırır ama yetkisiz erişimi imkânsız kılmaz.</p>
{risk_card('<p><strong>Yönetici paneli</strong> ayrı kimlik doğrulama, ayrı log ve ayrı hız politikası gerektirir. Saldırgan yönetim uçlarını otomasyonla tarar; “/admin” gibi yollar tek başına koruma değildir.</p>')}
<h2>Ön uç gizleme ve “API’nin açık sözlülüğü”</h2>
<p>Modern SPA’lar tarayıcıda çok şey taşır; geliştirici araçları veya JS paketleri içinde uç listeleri görülebilir. Saldırgan bunu “harita” olarak kullanır. Savunma: uçların keşfedilmesi kaçınılmaz kabul edilir; kritik olan sunucunun her uçta yetkiyi zorlamasıdır.</p>
<h2>Loglama: 403’ün sessiz kahramanlığı</h2>
<p>Yetkisiz erişim denemeleri 403/401 ile döner; bu loglar saldırganın <strong>keşif aşamasını</strong> gösterir. Sadece 200 loglamak, yanlış negatif üretir. Korelasyon: aynı oturumda art arda 403 ve ardından 200 (başka kaynakta) şüpheli bir hikâye olabilir.</p>
""" + quiz(
    [
        {"q": "Ön uçta gizli menü yetki sağlar mı?", "choices": ["Evet", "Hayır", "Sadece HTTPS ise evet", "Sadece mobilde evet", "Sadece admin rolünde hayır"], "correct": "B", "reason": "Yetki sunucuda zorlanmalıdır."},
        {"q": "Nesne düzeyi yetki hangi soruyu yanıtlar?", "choices": ["Parola uzunluğu", "Bu kullanıcı bu kaynağa erişebilir mi?", "TLS sürümü", "CDN", "CPU"], "correct": "B", "reason": "Sahiplik ve ilişki doğrulanır."},
        {"q": "RBAC tek başına neden yetersiz kalabilir?", "choices": ["Çünkü kötüdür", "Aynı rol içinde başka kullanıcının verisine erişimi engellemez", "TLS kapatır", "WAF kapatır", "DNS siler"], "correct": "B", "reason": "Nesne düzeyi ayrıca gerekir."},
        {"q": "403 loglarının değeri nedir?", "choices": ["Yoktur", "Keşif ve politika ihlali sinyali", "JPEG", "Font", "Tema"], "correct": "B", "reason": "Reddedilen erişimler izlenmelidir."},
        {"q": "Yönetim uçları için en iyi ayrıştırma hangisidir?", "choices": ["Aynı oturum çerezi", "Ayrı kimlik, sıkı MFA ve denetim logu", "Aynı parola", "Aynı JWT süresi", "Aynı CDN"], "correct": "B", "reason": "Blast radius küçültülür."},
        {"q": "IDOR bulgusunu doğrularken hangi kanıt uygundur?", "choices": ["Tahmin", "İki farklı kimlikle aynı uçta sunucu kararının tutarsızlığı (yetkili test ortamında)", "Tema", "Favicon", "CPU"], "correct": "B", "reason": "Yetkili ortamda tekrarlanabilir gözlem gerekir."},
        {"q": "Function-level authorization eksikliği neyi artırır?", "choices": ["SEO", "Normal kullanıcıdan admin işlevi çağırma olasılığı", "DNS", "JPEG", "Font"], "correct": "B", "reason": "İşlev düzeyi ayrı kontrol ister."},
        {"q": "Saldırganın ‘uç haritası çıkarma’ adımı savunmacıya ne öğretir?", "choices": ["Gizlemek yeter", "Uçların keşfi kaçınılmaz; sunucu yetkisi asıl kontrol", "CDN yeter", "WAF yeter", "TLS yeter"], "correct": "B", "reason": "Güvenlik sunucu tarafında yoğunlaşır."},
    ]
)

# --- MOD 5 ---
M5 = f"""<h1>MODÜL 5 — Input Validation, Output Encoding ve Güvenli Veri İşleme</h1>
{img_block("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=90", "Kod ve veri", "Girdi ve çıktı: saldırganın enjeksiyon ve kaçış oyunu; savunmacının bağlam ve şema disiplini.")}
<p>Saldırganın klasik stratejisi: uygulamanın <strong>veriyi komut olarak yorumlayacağı</strong> bir bağlama veri sokmaktır (SQL, OS komutu, HTML/JS, başlık). Savunma iki bacaktır: <strong>girdi doğrulama</strong> (beklenen şema, uzunluk, tip) ve <strong>çıktı kodlama</strong> (hedef bağlama uygun kaçış). Bu modülde “çalışan payload örnekleri” verilmez; fakat saldırganın <em>düşünce modeli</em> (veriyi nerede birleştiriyor, hangi motor yorumluyor) ayrıntılı işlenir.</p>
{lo("Modül hedefleri", [
    "Allowlist ve denylist yaklaşımlarının sınırlarını tartışabilirim.",
    "HTML/JS/URL/SQL/JSON bağlamlarında kaçış ihtiyacını açıklayabilirim.",
    "Hata mesajı ve log sızıntısı risklerini tespit edebilirim.",
    "Güvenli doğrulama için test verisi ve ortam disiplinini uygulayabilirim.",
])}
<h2>Enjeksiyon sınıfları: saldırganın “motor” arayışı</h2>
{table(["Sınıf", "Yorumlayan motor (kavramsal)", "Saldırganın amacı (eğitim)", "Savunma omurgası"], [
    ["SQLi", "SQL motoru", "Veri okuma/yazma veya sorgu kontrolü", "Parametreli sorgu + en az yetki"],
    ["XSS", "Tarayıcı HTML/JS", "Oturum/eylem bağlamı", "Bağlam kaçışı + CSP + HttpOnly"],
    ["Header injection", "HTTP katmanı", "Önbellek/ara katman şaşırtma", "Güvenli birleştirme ve doğrulama"],
    ["Deserialization", "Serileştirme kütüphanesi", "RCE yüzeyi", "Güvenli format ve imza"],
])}
<h2>Input validation: allowlist neden altın standarttır</h2>
<p>Denylist “bilinen kötüleri” engellemeye çalışır; saldırgan varyasyon, kodlama ve parser farklılıklarıyla kaçabilir. Allowlist “beklenen iyi”yi tanımlar: regex yerine çoğu zaman <strong>şema</strong> (JSON Schema gibi) ve <strong>tip</strong> daha güvenilirdir. İstemci doğrulaması yalnızca UX içindir; sunucu aynı kuralları <em>yeniden</em> uygular.</p>
{risk_card('<p><strong>Hata mesajları</strong> saldırgan için bilgi kaynağıdır: veritabanı sürümü, kolon adı, framework yığını. Üretimde genelleştirilmiş hata ve ayrıntılı log yalnızca yetkili kanallarda tutulmalıdır.</p>')}
<h2>Output encoding ve bağlam kırılması</h2>
<p>Aynı veri HTML içinde güvenli olup JavaScript string içinde güvensiz olabilir. Şablon motorlarında “otomatik kaçış” yanlış bağlamda çalışmayabilir. Savunmacı, şablonların hangi bağlamda üretildiğini kod incelemesinde izler.</p>
<h2>Loglara hassas veri yazma</h2>
<p>“Debug için tam gövde” pratiği, saldırgan sızmışsa aynı loglarda kimlik bilgisi bırakır. Log minimizasyonu ve maskeleme alanları (token, Authorization başlığı, parola alanları) standartlaştırılır.</p>
<h2>Güvenli doğrulama (yetkili ortam)</h2>
<p>Doğrulama; üretim verisine dokunmadan, izole ortamda, küçük ve deterministik test verisiyle yapılır. Kanıt: kod değişikliği + test çıktısı + maskelemiş örnek.</p>
""" + quiz(
    [
        {"q": "Sunucu tarafı doğrulama neden zorunlu?", "choices": ["İstemci her zaman doğru", "İstemci manipüle edilebilir", "Sadece mobil", "Sadece GET", "Performans"], "correct": "B", "reason": "Güvenilir karar sunucudadır."},
        {"q": "Denylist yaklaşımının temel zayıflığı nedir?", "choices": ["Çok hızlı", "Kötü varyasyonları tam öngönmek zorunda olması", "Log üretmemesi", "TLS", "DNS"], "correct": "B", "reason": "Kaçırılan örüntü kontrolü deler."},
        {"q": "XSS savunmasında bağlam neden kritiktir?", "choices": ["Hepsi aynı kaçış", "HTML/JS/URL farklı kurallar", "Sadece DB", "Sadece mobil", "Kaçış gerekmez"], "correct": "B", "reason": "Bağlama uygun kodlama şarttır."},
        {"q": "SQL enjeksiyonuna karşı temel mühendislik yaklaşımı nedir?", "choices": ["Daha uzun parola", "Parametreli sorgu ve ayrı veri", "Sadece HTTPS", "Sadece CDN", "robots.txt"], "correct": "B", "reason": "Yapı ile veri ayrılır."},
        {"q": "Hata mesajında yığın izi görünmesi neyi artırır?", "choices": ["SEO", "Bilgi sızıntısı ve keşif", "JPEG", "Font", "Tema"], "correct": "B", "reason": "İç yapı ifşasıdır."},
        {"q": "Loglarda Authorization başlığını ham yazmak neden risklidir?", "choices": ["Hızlıdır", "Sızıntıda kimlik bilgisi taşır", "TLS kapatır", "WAF", "DNS"], "correct": "B", "reason": "Taşıyıcı kimlik bilgisi içerir."},
        {"q": "Güvenli doğrulama için hangi ortam tercih edilir?", "choices": ["Üretim canlı trafik", "İzole test + minimizasyon", "Kullanıcı makinesi", "Herhangi bir CDN", "Herhangi bir log"], "correct": "B", "reason": "Yetki ve veri minimizasyonu şarttır."},
        {"q": "Şema tabanlı doğrulamanın avantajı nedir?", "choices": ["Daha yavaş", "Alan ve tip kurallarını açıkça tanımlar", "Log siler", "TLS kapatır", "Tema seçer"], "correct": "B", "reason": "Allowlist yaklaşımını destekler."},
    ]
)


def main() -> None:
    html = (
        sec("wag-m0-etik", True, M0)
        + sec("wag-m1-mimari", False, M1)
        + sec("wag-m2-http", False, M2)
        + sec("wag-m3-auth", False, M3)
        + sec("wag-m4-authz", False, M4)
        + sec("wag-m5-veri", False, M5)
    )
    OUT0.write_text(html, encoding="utf-8")
    print("Wrote", OUT0, "chars", len(html))


if __name__ == "__main__":
    main()
