#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate parts/web-uygulama-guvenligi-6-12.html (expanded modules 6-12)."""
from __future__ import annotations

import html as h
from pathlib import Path

OUT1 = Path(__file__).resolve().parents[1] / "frontend" / "modules" / "parts" / "web-uygulama-guvenligi-6-12.html"


def esc(s: str) -> str:
    return h.escape(s)


def quiz(items: list[dict]) -> str:
    lines = [
        "<h2>Kendini Değerlendir</h2>",
        '<div class="eval-quiz-section">',
        "<p>Aşağıdaki sorular saldırı mekaniği okuması, savunma ve kanıt yorumunu ölçer.</p>",
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


def info_box(title: str, paragraphs: list[str]) -> str:
    body = "".join(f"<p>{esc(p)}</p>" for p in paragraphs)
    return f'<div class="info-box"><p><strong>{esc(title)}</strong></p>{body}</div>'


def key_concepts_grid(items: list[tuple[str, str, str]]) -> str:
    parts = ['<div class="key-concepts">']
    for icon, title, text in items:
        parts.append(
            f'<div class="key-concept-card"><h4><i class="fas {esc(icon)}"></i> {esc(title)}</h4><p>{esc(text)}</p></div>'
        )
    parts.append("</div>")
    return "\n".join(parts)


def terminal(title: str, body_inner: str) -> str:
    return f'''<div class="linux-terminal"><div class="term-header"><span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span><span class="term-title">{esc(title)}</span></div><div class="term-body">{body_inner}</div></div>'''


M6 = f"""<h1>MODÜL 6 — XSS, clickjacking, injection, SSRF ve ilişkili sınıflar <small>(müfredat 11 · 12 · 13)</small></h1>
{img_block("https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=900&q=90", "Siber güvenlik ekranı", "Zafiyet sınıfları: saldırganın motoru ve savunmacının kontrol + görünürlük katmanları.")}
<p>Bu modül OWASP tarzı sınıfları <strong>ezberletmek</strong> için değil; her birinde saldırganın <em>neyi hedeflediğini</em>, uygulamanın <em>hangi hatayı yaptığını</em>, olayın <em>hangi logda nasıl görünebileceğini</em> ve <em>hangi kontrolün blast radius’u nasıl küçülttüğünü</em> birlikte okumak içindir. Mekanizma, savunma dili ve gerektiğinde teknik örnekler birlikte verilir; bunları yalnızca yazılı yetki ve geçerli hukuk çerçevesinde kullanmak kullanıcının yükümlülüğüdür. İçeriğin kötüye kullanımından SEBS Academy ve materyalin yayıncıları sorumlu tutulamaz.</p>
<p>Zafiyet sınıfları üretimde nadiren tek başına görünür: aynı olayda <strong>zayıf yetkilendirme + aşırı veri dönüşü + yetersiz log</strong> bir arada bulunur. Bu yüzden modülü okurken her bulguyu “hangi kontrol eksik?” yerine “hangi <em>zincir</em> eksik?” diye sorun: WAF bir şeyi kesmiş olsa bile uygulama mantığı aynı hatayı başka parametreyle tekrar ediyor olabilir.</p>
<p>SOC için pratik çıktı: her sınıf için en az bir <strong>ölçülebilir sinyal</strong> (ör. belirli SQL süresi dağılımı, belirli path’te 403 artışı, belirli user-agent ile POST patlaması) ve bir <strong>yanlış pozitif</strong> senaryosu (ör. bakım, yeni sürüm, meşru batch job) yazın. Böylece playbook gerçek operasyon diline yaklaşır.</p>
{lo("Modül hedefleri", [
    "SQLi/XSS/CSRF/SSRF sınıflarında saldırganın düşünce zincirini (eğitim) açıklayabilirim.",
    "Her sınıf için sinyal, savunma ve güvenli doğrulama kanıtını eşleştirebilirim.",
    "Dosya yükleme, path traversal ve iş mantığı hatalarında kök nedeni tartışabilirim.",
    "Yanlış yapılandırma ve hassas veri maruziyetini SOC ve AppSec bağlamında okuyabilirim.",
])}
{key_concepts_grid([
    ("fa-database", "SQL motoru", "Girdi ile sorgu yapısı birleşirse motor ikinci bir dil gibi yorumlar; savunma yapı–veri ayrımı ve en az yetki ile başlar."),
    ("fa-window-maximize", "Tarayıcı bağlamı", "XSS sonrası etki çerez politikası ve CSP ile sınırlanır; tek başına filtre yetmez."),
    ("fa-paper-plane", "Siteler arası", "CSRF’de suç ortağı tarayıcıdır; niyet kanıtı sunucuda aranır."),
    ("fa-cloud-arrow-up", "Sunucu çıkışı", "SSRF’de suç ortağı uygulamanın kendisidir; egress ve allowlist mimari karardır."),
])}
{info_box("Derinlemesine savunma (defense in depth)", [
    "WAF veya imza tabanlı filtre bir katmandır; uygulama düzeyinde doğrulama ve güvenli kod olmadan ‘yeşil tarama’ yanıltıcı olabilir.",
    "SOC için değer: aynı olayda WAF kural id + uygulama trace + DB slow query birlikte okunabildiğinde kök neden tartışması hızlanır.",
])}
<h2>SQL Injection: sorgu motorunun “ikinci dili”</h2>
<p>Uygulama kullanıcı girdisini SQL ifadesinin <strong>yapısal parçası</strong> gibi birleştirirse, veritabanı motoru beklenmeyen komutları ayırt etmekte zorlanabilir. Saldırganın hedefi tipik olarak veri okumak, yetki yükseltmek veya bütünlüğü bozmaktır. “Kör” (blind) senaryolarda yanıt gövdesi yerine <strong>zamanlama veya doğru/yanlış dallanması</strong> üzerinden bilgi çıkarımı fikri yürütülür; savunmacı burada anormallik için <strong>istatistiksel baseline</strong> ve <strong>yavaş sorgu izleme</strong> arar.</p>
<p>Uygulama ekibi için pratik okuma: ORM kullanımı bile <strong>ham SQL</strong> veya dinamik ORDER BY gibi kaçış noktalarında risk taşıyabilir. Kod incelemesinde “kullanıcı string’i SQL parçası olmadan tek parametre olarak mı gidiyor?” sorusu her PR’da tekrarlanır.</p>
<p>Veritabanı motoru tarafında <strong>en az yetki</strong> yalnızca tablo izinleri değildir: stored procedure, linked server, dosya okuma ve dış ağa çıkış gibi yan özellikler de kapatılır. Saldırgan bazen doğrudan veri yerine yürütme yüzeylerini hedefler; bu yüzün savunması işletim sistemi ve DB sertleştirme checklist’idir.</p>
{table(["Savunma katmanı", "Ne azaltır?", "Kanıt/izleme"], [
    ["Parametreli sorgu", "Yapı ile veriyi ayırır", "Kod incelemesi, ORM kullanımı"],
    ["Least privilege DB user", "Yazma/RCE yüzeyini daraltır", "DB yetki matrisi, audit log"],
    ["Girdi şeması", "Beklenmeyen tip/uzunluğu erken keser", "Uygulama logu, validation hataları"],
    ["WAF imzası", "Bilinen desenleri düşürür", "WAF istek kimliği ile uygulama trace id eşlemesi"],
])}
{terminal("db-slowlog-tail.txt — kör enjeksiyon hipotezi (kurgusal)", """<span class="term-prompt">dba@sebs:~$</span> <span class="term-cmd">grep 'duration_ms&gt;800' /var/log/db/slow.log | tail -n 5</span>
<span class="term-output">SELECT * FROM items WHERE name LIKE '%'||?||'%' ... duration_ms=1240</span>
<span class="term-output">bind: ? = 'searchterm'</span>
<span class="term-comment"># Uzun süre + LIKE birleşimi tek başına suç değil; baseline ile anomali tartışılır.</span>""")}
<h2>XSS: tarayıcıyı ikna etme sanatı</h2>
<p>XSS’de saldırganın amacı, kurban tarayıcısında <strong>kendi JavaScript bağlamını</strong> çalıştırmaktır; böylece oturum çerezine erişim (HttpOnly yoksa), DOM üzerinden eylem tetikleme veya keylogger benzeri yan etkiler hedeflenir. Türler (yansıtılmış, depolanmış, DOM tabanlı) farklı <strong>giriş noktaları</strong> ve <strong>kalıcılık</strong> profili taşır. Savunma: bağlama uygun çıktı kodlama, CSP, HttpOnly/Secure çerez politikası ve şablon disiplini.</p>
<p>Depolanmış XSS’de saldırgan bir kez yazar, çok kullanıcı okur; bu nedenle <strong>içerik moderasyonu</strong> ve <strong>HTML sanitizasyonu</strong> politikası da devreye girer. DOM XSS’de ise suç genelde istemci tarafı yönlendirme veya güvensiz innerHTML kullanımıdır; statik analiz ve güvenli DOM API’leri kanıt üretir.</p>
<p>Content Security Policy (CSP) “her XSS’i sıfırlar” değildir; fakat enjeksiyon sonrası <strong>etki</strong>ni kısıtlar ve saldırganın dış domain’den script çekmesini zorlaştırır. Politika sıkılaştırılırken üretimde kırılan işlevler (inline script, eski analitik) için istisna yönetimi ve report-only aşaması planlanmazsa ekip CSP’yi gevşeterek riski geri getirir.</p>
{risk_card('<p><strong>Sinyal örnekleri:</strong> WAF’te “script” kalıpları, kullanıcı profilinde beklenmeyen iframe, anormal uzunluklu input alanları, tarayıcı konsolunda tekrarlayan eval benzeri hatalar (üretimde detay sızdırmadan).</p>')}
{terminal("csp-report-sample.json — politika ihlali (kurgusal)", """<span class="term-prompt">soc@sebs:~$</span> <span class="term-cmd">jq '.blocked-uri, .violated-directive' csp-report-sample.json</span>
<span class="term-output">inline</span>
<span class="term-output">script-src-elem</span>
<span class="term-comment"># CSP raporları gürültülüdür; üretimde örnekleme ve filtre şart.</span>""")}
<h2>CSRF: tarayıcının “otomatik kimlik taşıyıcı” doğası</h2>
<p>Tarayıcı, oturum çerezini uygun isteklerde otomatik ekler. Saldırgan, kurbanı kendi sitesinde bir forma veya otomatik gönderilen isteğe yönlendirerek <strong>kullanıcı niyeti olmadan</strong> durum değiştiren işlem tetikletmek ister. Savunma: anti-CSRF belirteci, SameSite stratejisi, kritik işlemlerde ek doğrulama, durum değiştiren işlemlerde POST+özel başlık.</p>
<p>Çift gönderim ve “geri/ileri” tuşu ile tekrarlanan POST gibi UX kenarları da CSRF test planına dahil edilir. Savunmacı raporda “hangi uç durum değiştiriyor?” tablosu, saldırganın otomasyon haritasıyla aynı formatta yazılır.</p>
<p>Çift çerez (double submit) veya özel başlık (<code>X-Requested-With</code> vb.) kalıpları tek başına gümüş kurşun değildir: tarayıcı ve istemci çeşitliliği, CORS ve önbellek etkileşimi yüzünden sunucuda <strong>origin kontrolü + niyet belirteci</strong> birlikte değerlendirilir. Kritik işlemlerde (şifre değişikliği, MFA ekleme/çıkarma) ek adım olarak yeniden kimlik doğrulama en güçlü dengeleyicidir.</p>
{info_box("SameSite=Lax vs Strict (kavram)", [
    "Strict: kullanıcı doğrudan sitedeyken çerez taşınır; bazı derin link senaryolarında UX maliyeti doğurabilir.",
    "Lax: güvenli HTTP metodlarında siteler arası top-level navigasyonda sınırlı taşınır; uygulama davranışına göre seçilir.",
])}
<h2>SSRF: sunucuyu “proxy silahına” çevirme</h2>
<p>Uygulama kullanıcıdan URL alıp sunucu tarafında fetch yapıyorsa, saldırgan iç ağ uçlarını (metadata servisleri, yönetim arayüzleri, iç API’ler) hedeflemek isteyebilir. Savunma: hedef allowlist, özel ağların bloklanması, çıkış trafiği izleme, “ham IP” yerine DNS politikası ve ayrı egress güvenliği.</p>
<p>DNS rebinding ve açık yönlendirme zincirleri (eğitim düzeyinde) “allowlist var ama yine de yanlış hedefe gidildi” hikâyelerini üretir; bu yüzden çözüm yalnızca string kontrolü değil, <strong>çözümlenmiş IP’nin özel ağ aralığında olmaması</strong> gibi katmanlar içerir.</p>
<p>SSRF olaylarında SOC’un gördüğü sinyal çoğu zaman “tek uygulama sunucusundan” çok <strong>egress proxy</strong> veya güvenlik duvarı loglarında belirir: iç RFC1918 hedefine giden TLS SNI, metadata IP’si veya beklenmeyen DNS çözümlemesi. Bu yüzün playbook’u yalnızca uygulama ekibine değil ağ ekibine de yazılır.</p>
{process_flow([("fa-link", "Kullanıcı URL’si"), ("fa-server", "Sunucu fetch"), ("fa-network-wired", "Dış iç ağ"), ("fa-eye", "Egress log")])}
{terminal("egrep-egress.log — iç hedef denemesi (kurgusal)", """<span class="term-prompt">soc@sebs:~$</span> <span class="term-cmd">grep 'egress-fetch' app.log | tail -n 4</span>
<span class="term-output">url=http://169.254.169.254/latest/meta-data blocked=1</span>
<span class="term-output">url=https://hooks.slack.com/... status=200 bytes=42</span>
<span class="term-comment"># İkinci satır meşru entegrasyon da olabilir; allowlist ve iş gerekçesi ile eşleştirilir.</span>""")}
<h2>Dosya yükleme ve path traversal</h2>
<p>Yükleme uçlarında saldırgan çift uzantı, MIME sahteciliği veya polyglot dosya fikirleriyle (eğitim düzeyinde) uygulamayı yanıltmeye çalışır. Path traversal ise dosya yolu birleştirme ve normalizasyon hatalarında ortaya çıkar. Savunma: içerik imzası/allowlist, web kökünden ayrı depolama, rastgele dosya adı, yürütme engeli, güvenli path join.</p>
<p>Depolama bucket’ı ile CDN arasındaki <strong>imza URL’si</strong> süresi ve “liste dizin” kapalı olduğunun doğrulanması rapora yapılandırma kanıtı olarak girer.</p>
<h2>Yanlış yapılandırma: saldırganın hızlı kazanım alanı</h2>
<p>Örnek hesaplar, açık dizin listelemeleri, gereksiz HTTP verb’leri, aşırı ayrıntılı hata sayfaları ve “geçici olarak açılmış” debug bayrakları saldırganın <strong>keşif maliyetini düşürür</strong>. Savunma tarafında bu başlık, yapılandırma drift’ini (zamanla gevşeme) ve dağıtım boru hattındaki <strong>ortam karışıklığını</strong> hedefler. Üretim doğrulamasında “staging ile diff” en güçlü kanıt yaklaşımlarından biridir.</p>
{terminal("config-diff-snippet.txt — staging vs prod (kurgusal)", """<span class="term-prompt">devops@sebs:~$</span> <span class="term-cmd">diff -u staging.env prod.env | head -n 20</span>
<span class="term-output">-DEBUG=true</span>
<span class="term-output">+DEBUG=false</span>
<span class="term-output">-SHOW_STACKTRACE=true</span>
<span class="term-output">+SHOW_STACKTRACE=false</span>
<span class="term-comment"># Diff’te görünmeyen ama CDN’de kalan eski header: ayrı kontrol listesi.</span>""")}
<h2>Hassas veri maruziyeti: “fazla alan” ve önbellek</h2>
<p>API yanıtlarında gereğinden fazla alan dönmek, istemci önbelleğinde veya loglarda <strong>PII yayılımı</strong> yaratır. Saldırgan için değer: tek uçtan çok tabloya ait veriyi toplayabilmek. Savunma: sunum katmanı (DTO), alan seçme, veri sınıflandırması ve yanıt boyutu izleme.</p>
{table(["Alan sızıntısı", "Nerede birikir?", "Savunma"], [
    ["Gereksiz kolonlar", "Mobil cache, tarayıcı önbelleği", "DTO ve alan seçme"],
    ["Hata gövdesi", "Log taşıyıcıları", "Genel mesaj + ayrıntılı iç log"],
    ["GraphQL derin sorgu", "Tek istekte geniş ağaç", "Maliyet limiti ve persisted query"],
])}
<h2>İş mantığı zafiyetleri: saldırganın “kuralları atlama” oyunu</h2>
<p>Burada exploit genelde klasik enjeksiyon değildir; fiyat, limit, kupon, onay sırası, iade ve stok gibi kuralların <strong>sunucuda zorlanmaması</strong>dır. Sinyaller: belirli kullanıcıda olağandışı işlem hacmi, kısa sürede çok adım, aynı ödeme akışında tutarsız durumlar.</p>
<p>İş mantığı testleri için “mutlu yol” yeterli değildir; <strong>sıra atlama</strong>, <strong>yeniden oynatma</strong>, <strong>yarış durumu</strong> ve <strong>negatif miktar</strong> gibi kontroller (yetkili ortamda) güvenli doğrulama planına yazılır.</p>
{key_concepts_grid([
    ("fa-cart-shopping", "Sepet ve ödeme", "Kupon ve indirim kuralları sunucuda atomik işlenmeli; istemci fiyatı tavsiye kabul edilir."),
    ("fa-rotate", "Durum makinesi", "İade sonrası tekrar gönderim gibi geçişler logda iz sürülebilir olmalıdır."),
    ("fa-chart-line", "Anomali", "Aynı kullanıcıda kısa sürede olağandışı işlem hacmi risk skorunu yükseltir."),
])}
""" + quiz(
    [
        {"q": "SQLi savunmasında en temel mühendislik ilkesi nedir?", "choices": ["Daha uzun parola", "Sorgu yapısı ile verinin ayrılması", "Sadece HTTPS", "Sadece CDN", "Sadece robots.txt"], "correct": "B", "reason": "Parametreli/hazırlıklı sorgu bu ilkeyi uygular."},
        {"q": "Blind SQLi hipotezinde savunmacı hangi sinyali arayabilir?", "choices": ["Sadece favicon", "Sorgu süresi veya boolean yanıt farkı (baseline ile)", "Sadece CSS", "Sadece tema", "Sadece DNS"], "correct": "B", "reason": "Gövde sızmadan da anomali üretebilir."},
        {"q": "XSS sonrası HttpOnly çerez neyi azaltır?", "choices": ["SQLi", "JS ile çerez okunabilirliği", "CSRF", "SSRF", "Path traversal"], "correct": "B", "reason": "Belirteç okuma yüzeyini daraltır."},
        {"q": "CSRF savunması için hangi kontrol sınıfı uygundur?", "choices": ["Sadece GET", "Durum değiştirme belirteci / SameSite + ek doğrulama", "Sadece gzip", "Sadece DNS", "Sadece resim optimizasyonu"], "correct": "B", "reason": "Kullanıcı niyeti kanıtı gerekir."},
        {"q": "SSRF’de öncelikli mimari savunma hangisidir?", "choices": ["Daha uzun JWT", "Hedef allowlist ve egress kontrolü", "Daha büyük disk", "Daha çok font", "Daha fazla favicon"], "correct": "B", "reason": "Sunucunun nereye gidebileceği kısıtlanır."},
        {"q": "Dosya yüklemede web köküne yazmak neden risklidir?", "choices": ["SEO", "Yürütülebilir içerik veya doğrudan erişim riski", "TLS", "DNS", "JPEG"], "correct": "B", "reason": "Yalıtılmış depolama tercih edilir."},
        {"q": "İş mantığı zafiyetinde en iyi erken sinyal hangisidir?", "choices": ["CPU modeli", "Kural ihlali ve anormal işlem örüntüsü", "Tema", "Font", "Favicon"], "correct": "B", "reason": "İş olayları ve süreç tutarlılığı izlenir."},
        {"q": "WAF tek başına yeterli midir?", "choices": ["Her zaman", "Hayır; uygulama düzeyi kontrol ve güvenli kod şart", "Sadece mobilde evet", "Sadece GET için hayır", "Sadece CDN ile evet"], "correct": "B", "reason": "Derinlemesine savunma gerekir."},
    ]
)

M6B = f"""<h1>MODÜL 6B — İş mantığı, yarış durumu ve kötüye kullanım <small>(müfredat 14)</small></h1>
{img_block("https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=900&q=90", "Kod inceleme", "Aynı anda iki istek: veritabanı tutarlılığı ve iş kuralları.")}
<p>Bu bölüm klasik enjeksiyon dışında kalan <strong>iş kuralları</strong> hatalarına odaklanır: fiyat, stok, kupon, iade, onay adımları ve çift harcama (double spend) benzeri senaryolar. Saldırgan çoğu zaman “tek istekle görünmeyen” ama <strong>iki istek arasında açılan pencerede</strong> yarışan durumları hedefler (TOCTOU).</p>
<p><strong>Idempotency key</strong> ve <strong>atomik işlem</strong> (transaction + doğru izolasyon) aynı işlemin iki kez uygulanmasını engeller. Ödeme ve stok gibi kritik zincirlerde <strong>optimistic concurrency</strong> (sürüm alanı) veya veritabanı kısıtları sık kullanılır.</p>
<p><strong>Kötüye kullanım (abuse)</strong> önleme; hız sınırının ötesinde iş kuralı düzeyinde “bu kullanıcı bu kadar kuponu bu sürede kullanabilir” gibi kurallar ister. SOC sinyali: kısa sürede olağandışı işlem hacmi, aynı hesapta çoklu oturumdan gelen çakışan işlemler, iade sonrası tekrar gönderim denemeleri.</p>
{lo("Modül hedefleri", [
    "İş mantığı zafiyeti ile enjeksiyonu ayırt edebilirim.",
    "Race / TOCTOU için atomiklik ve idempotency stratejilerini açıklayabilirim.",
    "Abuse senaryolarında oran ve iş kuralı kontrollerini birlikte tasarlayabilirim.",
])}
{table(["Örüntü", "Risk", "Savunma ipucu"], [
    ["Kupon + iade yarışı", "Aynı indirim iki kez", "Durum makinesi ve tekilleştirilmiş işlem kimliği"],
    ["Stok düşürme", "Eksi stok veya oversell", "Transaction + satır kilidi / sürüm alanı"],
    ["Transfer onayı", "TOCTOU", "Tek atomik blokta doğrula ve düş"],
    ["API otomasyonu", "Scraping / spam", "Bot yönetimi + iş kuralı limiti"],
])}
{info_box("Test (yetkili ortam)", [
    "Yarış testleri için eşzamanlı istekler üretilir; üretimde rastgele yüklemek yerine load test ortamı ve RoE şarttır.",
])}
""" + quiz(
    [
        {"q": "Idempotency key ne işe yarar?", "choices": ["DNS çözer", "Aynı işlemin yanlışlıkla iki kez uygulanmasını engeller", "TLS kapatır", "WAF kaldırır", "Sadece mobil"], "correct": "B", "reason": "Tekrarlı gönderimlerde tutarlılık sağlar."},
        {"q": "TOCTOU sınıfı hangi fikri içerir?", "choices": ["Sadece XSS", "Kontrol zamanı ile kullanım zamanı arasındaki yarış", "Sadece SQL", "Sadece DNS", "Sadece favicon"], "correct": "B", "reason": "Durum iki istek arasında değişebilir."},
        {"q": "İş mantığı bulgusunda SOC için güçlü sinyal hangisidir?", "choices": ["Tek 404", "Kural ihlali + anormal hacim + kısa süreli tekrar", "JPEG boyutu", "Font", "Tema"], "correct": "B", "reason": "Davranış ve iş olayı birlikte okunur."},
        {"q": "Stok tutarlılığı için hangi yaklaşım sık kullanılır?", "choices": ["Sadece log", "Transaction / kilitleme / sürüm alanı ile atomik güncelleme", "Sadece CDN", "Sadece robots.txt", "Sadece tema"], "correct": "B", "reason": "Eşzamanlı güncellemelerde yarış azaltılır."},
    ]
)

M7 = f"""<h1>MODÜL 7 — API güvenliği <small>(müfredat 15)</small></h1>
{img_block("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=90", "Sunucu ve API", "REST/GraphQL: otomasyonla taranan uçlar; nesne düzeyi yetki ve veri sözleşmesi kritik.")}
<p>API’ler makineye yönelik olduğu için saldırgan otomasyonla <strong>uç keşfi</strong> ve <strong>parametre fuzzing</strong> yapabilir. Kimlik doğrulama (Bearer, API key, mTLS) olsa bile <strong>yetkilendirme</strong> atlantı kalabilir. Ayrıca “yanlışlıkla fazla alan dönen” yanıtlar, istemciye sızdırılmış iş alanlarını geri taşır.</p>
<p>Bu modülde “API güvenliği” yalnızca OAuth akışı veya JWT imzası değildir; asıl mesele <strong>kaynak sahipliği</strong> ve <strong>işlem bütünlüğüdür</strong>. Aynı token ile başka bir kullanıcının kaydına erişmek (BOLA), aynı token ile yönetici işlevini çağırmak veya aşırı geniş GraphQL ağacıyla tek istekte veri madenciliği yapmak farklı saldırı sınıflarıdır; hepsinde ortak nokta, sunucunun “kim olduğunu bildiği” ama “bu işlemi yapmaya <em>haklı mı</em>?” sorusunu her satırda tekrarlamamasıdır.</p>
<p>SOC ve AppSec birlikte çalıştığında API olaylarında sık görülen tablo şudur: API geçidi 401/403 üretirken uygulama 200 döner (veya tersi), ya da oran sınırlayıcı sadece edge’de varken iç serviste yoktur. Bu tutarsızlıklar olay müdahalesinde zaman kaybettirir; bu yüzden modül boyunca log korelasyonu ve “tek doğru kaynak” (policy enforcement point) fikri tekrarlanır.</p>
{lo("Modül hedefleri", [
    "REST matrisinde (kaynak × method) yetki okuyabilirim.",
    "BOLA ve mass assignment risklerini örnek senaryolarla tartışabilirim.",
    "Oran sınırlama ve hata gövdesi sızdırmasını değerlendirebilirim.",
    "API geçidi loglarıyla uygulama logunu korele edebilirim.",
])}
{key_concepts_grid([
    ("fa-robot", "Otomasyon", "Makine istemcileri insan hızından emin değildir; oran sınırı ve anomali eşikleri API’de daha sert olmalıdır."),
    ("fa-diagram-project", "Sözleşme", "OpenAPI/GraphQL şeması ne vaat ediyorsa log ve test de o çizgide yoğunlaşır."),
    ("fa-user-lock", "Nesne yetkisi", "Bearer token var diye kayıt sahipliği doğrulanmış sayılmaz."),
    ("fa-file-lines", "DTO", "İstemciye giden her alan bilinçli seçilir; ‘fazla alan’ bulgusu şema diff ile kanıtlanır."),
])}
<h2>Saldırganın API keşfi (eğitim)</h2>
<p>Saldırgan; OpenAPI/Swagger sızıntısı, JS paketleri, hata mesajları veya tahmin edilebilir kaynak adlarıyla uç listesi çıkarır. Ardından kimlik doğrulaması olan uçlarda <strong>nesne kimliği değiştirme</strong>, yetkisiz method (DELETE) veya fazla veri dönüşü dener.</p>
<p>REST’te kaynak adları çoğu zaman işlevin kendisini ele verir (<code>/users/{{id}}/orders</code> gibi); bu da saldırganın “hangi ID aralığı canlı?” sorusunu hızlıca test etmesine yardım eder. Bu nedenle API tasarımında hem isimlendirme hem de <strong>hata gövdesinin sıkılığı</strong> (404 mü 403 mü, tutarlı mı) keşif hızını etkiler.</p>
{table(["Risk", "Saldırgan görüşü (eğitim)", "Savunma kontrolü"], [
    ["BOLA/IDOR", "Başkasının kaydına erişim", "Her kaynak için sahiplik kontrolü"],
    ["Mass assignment", "Ek alanlarla yetki yükseltme", "Allowlist alan bağlama"],
    ["Excessive data", "Tüm ilişkileri çekme", "DTO ve alan seçme katmanı"],
    ["Broken function", "Admin işlevini normal token ile", "Ayrı scope ve policy"],
])}
<h2>Oran sınırlama ve brute force</h2>
<p>API anahtarı veya login uçları otomasyonla yıpratılabilir. Oran sınırlama; kullanıcı, IP, API key veya kombinasyon bazında katmanlanır. Yan etki: meşru trafik kesintisi; bu yüzden geri bırakma ve allowlist’ler planlanır.</p>
<p>Dağıtık mimaride “tek sayaç” tutmak zordur; bu yüzden oran sınırlama genelde Redis gibi paylaşımlı durum katmanında veya API geçidinde merkezileştirilir. Yanlış yapılandırma: her uygulama pod’unda ayrı bellek içi sayaç—saldırgan yükü pod’lar arasında böldüğünde limit fiilen delinir.</p>
<h2>GraphQL yüzeyi (kısa)</h2>
<p>Derin sorgular ve introspection (açıksa) keşfi kolaylaştırır. Savunma: sorgu derinliği/karmaşıklığı limiti, persisted query, yetki middleware ve maliyetli alanlar için ayrı izin.</p>
<p>GraphQL’de “alan adı” gizlense bile <strong>resolver</strong> katmanında yetki atlama yaşanabilir; çünkü asıl veri çekme orada yapılır. Bu yüzden AppSec incelemesi şema dosyasından çok resolver koduna odaklanır. Batch ve alias özellikleri (N+1 veya paralel sızıntı) rate limit ile birlikte test edilmelidir.</p>
{risk_card('<p><strong>Hata mesajları</strong> stack trace veya SQL parçası döndürürse saldırgan şema çıkarır. Üretimde genelleştirilmiş hata ve korelasyon kimliği (trace id) kullanıcıya, detay ise güvenli log kanalına gider.</p>')}
<h2>API geçidi ve SOC</h2>
<p>Geçit; kimlik, oran sınırlama, şema doğrulama ve merkezi log üretir. SOC için değer: tek yerden <strong>istek kimliği</strong> ile uygulama içi trace’e köprü.</p>
<p>Geçit politikası ile uygulama politikası çeliştiğinde olay müdahalesi takılır: örneğin geçit “JWT geçerli” derken uygulama “tenant uyuşmuyor” diyebilir. Bu yüzden alarm tasarımında <code>policy_outcome</code> benzeri ayrı alanlar ve tutarlı hata kodları şarttır.</p>
{terminal("correlate.sh — gateway ↔ app (kurgusal)", """<span class="term-prompt">soc@sebs:~$</span> <span class="term-cmd">grep 'req=7c4b9e2a' gateway.jsonl app.jsonl</span>
<span class="term-output">gateway: status=200 route=/api/v1/orders/4412</span>
<span class="term-output">app: authz=deny reason=not_owner user=alice resource=4412</span>
<span class="term-comment"># Aynı id ile çelişki: gateway policy mi app policy mi? ikisi de incelenir.</span>""")}
""" + quiz(
    [
        {"q": "API’de kimlik var ama yetki yoksa sonuç nedir?", "choices": ["Güvenli", "BOLA/IDOR riski devam eder", "TLS kapanır", "WAF kapanır", "DNS silinir"], "correct": "B", "reason": "Yetki her uçta ayrı doğrulanmalıdır."},
        {"q": "Mass assignment hangi hatayı işaret eder?", "choices": ["CDN", "İstemci alanlarının filtresiz uygulanması", "JPEG", "Font", "Tema"], "correct": "B", "reason": "Allowlist binding gerekir."},
        {"q": "Oran sınırlamanın birincil amacı nedir?", "choices": ["Log silmek", "Otomasyon ve kötüye kullanımı yönetmek", "TLS kapatmak", "Tema", "Favicon"], "correct": "B", "reason": "Brute force ve DoS yan etkisini azaltır."},
        {"q": "Aşırı veri dönüşü bulgusu nasıl kanıtlanır?", "choices": ["Tahmin", "Maskelemiş yanıt şeması ve gereksinim karşılaştırması", "CPU", "Font", "Tema"], "correct": "B", "reason": "Veri minimizasyonu ihlali gösterilir."},
        {"q": "API geçidi logunun SOC değeri nedir?", "choices": ["Yok", "Merkezi korelasyon ve politika uygulaması", "JPEG", "DNS", "Font"], "correct": "B", "reason": "Dağıtık sistemde iz sürme kolaylaşır."},
        {"q": "GraphQL’de derin/nested sorgu riski neyi artırır?", "choices": ["SEO", "CPU/IO maliyeti ve veri sızıntısı", "TLS", "Tema", "Favicon"], "correct": "B", "reason": "Limit ve maliyet kontrolleri gerekir."},
        {"q": "Bearer token sızıntısı hangi kanallarda görülür?", "choices": ["Sadece DB", "URL, referrer, istemci depoları, loglar", "Sadece CPU", "Sadece DNS", "Sadece JPEG"], "correct": "B", "reason": "Taşıma ve saklama yüzeyleri geniştir."},
        {"q": "Admin API’yi ayırmanın temel nedeni blast radius mu?", "choices": ["Hayır", "Evet; ayrı kimlik ve politika ile küçültülür", "Sadece mobil", "Sadece GET", "Sadece CDN"], "correct": "B", "reason": "Ayrıcalıklı işlevler ayrı korunur."},
    ]
)

M8 = f"""<h1>MODÜL 8 — Güvenli yapılandırma, güvenlik başlıkları, önbellek ve WAF <small>(müfredat 17)</small></h1>
{img_block("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=90", "Analiz ve güvenlik", "Header ve CORS: tarayıcıya verilen güvenlik sözleşmesi; yanlışsa saldırgan tarayıcıyı ikna eder.")}
<p>Üretimde açık hata ayıklama, gevşek CORS ve eksik CSP; saldırganın <strong>keşif maliyetini düşürür</strong> ve XSS sonrası <strong>etki yüzeyini büyütür</strong>. Bu modülde başlıkların anlamı, yanlış yapılandırma örüntüleri ve güvenli doğrulama yöntemi bir arada verilir.</p>
<p>Güvenlik başlıkları “bir kez ayarla unut” değildir: CDN’de override, yeni mikro site, A/B test sayfası veya PDF indirme uçları farklı başlık seti taşıyabilir. Bu yüzden kontrol <strong>köken (origin) bazlı</strong> envanter + periyodik otomasyon ile yapılır.</p>
{lo("Modül hedefleri", [
    "CSP, HSTS, frame kısıtları ve Referrer-Policy’yi tehdit modeline bağlayabilirim.",
    "CORS yanlış yapılandırmasını köken politikası üzerinden okuyabilirim.",
    "Gizli anahtar ve ortam değişkeni yönetiminde yaygın hataları listeleyebilirim.",
    "Üretim doğrulama checklist’i ile güvenli denetim yapabilirim.",
])}
{info_box("Header + CORS birlikte okunur", [
    "Zayıf CORS, XSS veya veri sızıntısı sonrası tarayıcıda etkiyi büyütür; CSP ise script yüzeyini daraltır. Tek başına ‘CSP var’ demek yetmez; report-only aşaması ve istisna yönetimi planlanmalıdır.",
])}
<h2>CSP: enjeksiyon sonrası “yangın söndürme” katmanı</h2>
{table(["Direktif sınıfı", "Amaç (kısa)", "Yanlış yapılandırma riski"], [
    ["default-src", "Varsayılan kaynak kümesi", "Çok geniş unsafe-inline"],
    ["script-src", "JS kaynağı", "İmzalı script olmadan geniş izin"],
    ["frame-ancestors", "Gömme (clickjacking)", "Boş bırakılınca risk"],
    ["report-uri / report-to", "İhlal raporu", "Üretimde gürültü yönetimi"],
])}
<h2>HSTS, X-Frame-Options / frame-ancestors</h2>
<p>HSTS downgrade saldırılarına karşı taşıma tarafında zorunluluk oluşturur; ancak uygulama hâlâ HTTP link üretiyorsa kırılganlık devam eder. Frame kısıtları, siteler arası UI hilelerine karşı ek sınır sağlar.</p>
<p><code>includeSubDomains</code> ve <code>preload</code> bayrakları geri alınması zor kararlar içerir; yanlışlıkla eski alt alan adları HTTPS’e geçirilemezse kesinti yaşanır. Bu yüzden HSTS genişletmesi önce envanter, sonra pilot alt alan, en son üretim genişlemesi sırasıyla yapılır.</p>
{risk_card('<p><strong>Saldırgan bakışı:</strong> zayıf CORS + XSS birleşince tarayıcı üzerinden veri okuma/yazma kanalı genişler. Bu nedenle CORS “sadece geliştirici kolaylığı” değil güvenlik kararıdır.</p>')}
<h2>Gizli anahtar ve ortam değişkenleri</h2>
<p>Sırlar kod deposunda, önbelleğe alınmış build artefaktında veya aşırı ayrıntılı hata sayfasında görünebilir. Çözüm: gizli yönetim, kısa ömürlü kimlik bilgisi, ayrıcalıklı erişim ve rotasyon.</p>
<h2>HOW-TO: Güvenli konfigürasyon kontrolü</h2>
{process_flow([("fa-list", "Envanter"), ("fa-cogs", "Ortam karşılaştır"), ("fa-heading", "Başlık tarama"), ("fa-globe", "CORS politikası"), ("fa-key", "Sırlar"), ("fa-file-alt", "Rapor")])}
<ol>
<li>Konfigürasyon envanteri: web sunucusu, uygulama çatısı, CDN, API geçidi.</li>
<li>Staging vs üretim diff: debug, verbose error, demo hesapları.</li>
<li>Güvenlik başlıkları: otomasyonla toplanan çıktı + manuel istisna notu.</li>
<li>CORS: izin verilen kökenlerin iş gerekçesi ve wildcard kontrolü.</li>
<li>Secret scan ve dependency bilgisi (bir sonraki modülle örtüşür).</li>
<li>Bulguları yapılandırma çıktısı veya güvenli özetle kanıtla.</li>
</ol>
<p>Checklist’i otomasyona dökerken dikkat: bazı başlıklar CDN’de, bazıları origin’de üretilir; aynı isimli başlığın iki kez ve çelişkili değerle gelmesi “hangisi geçerli?” sorusunu doğurur. Raporlarda hangi katmanın “kazandığını” not edin.</p>
{terminal("curl-headers.sh — üretim başlık kesiti (kurgusal)", """<span class="term-prompt">appsec@sebs:~$</span> <span class="term-cmd">curl -sI https://app.example.com/ | grep -iE '^(strict-transport|content-security|x-frame|permissions|referrer-policy):'</span>
<span class="term-output">strict-transport-security: max-age=31536000; includeSubDomains</span>
<span class="term-output">content-security-policy: default-src 'self'; frame-ancestors 'none'</span>
<span class="term-output">referrer-policy: strict-origin-when-cross-origin</span>
<span class="term-comment"># Eksik başlık ‘bulgu’ değil önce envanter; sonra tehdit modeli ile öncelenir.</span>""")}
""" + quiz(
    [
        {"q": "CSP’nin birincil rolü nedir?", "choices": ["DNS hızı", "Kaynak yükleme ve script yüzeyini kısıtlamak", "DB şifreleme", "CPU governor", "JPEG"], "correct": "B", "reason": "XSS sonrası etkiyi sınırlar."},
        {"q": "HSTS yanlış yuvarlanırsa risk nedir?", "choices": ["SEO", "Erişim kesintisi / yanlış güven varsayımı", "DNS", "Font", "Tema"], "correct": "B", "reason": "Planlı geçiş gerekir."},
        {"q": "Geniş Access-Control-Allow-Origin neyi artırır?", "choices": ["Güvenlik", "İstenmeyen kökenlerden okuma riski", "TLS", "WAF", "CPU"], "correct": "B", "reason": "Köken politikası gevşer."},
        {"q": "Üretimde debug açık kalması ne sızdırır?", "choices": ["Tema", "Yığın izi ve iç yapı", "DNS", "Favicon", "JPEG"], "correct": "B", "reason": "Keşif kolaylaşır."},
        {"q": "Gizli anahtarın repoda olması neden kritik hata?", "choices": ["Hız", "Geniş erişim ve sızıntı yüzeyi", "Tema", "Font", "CPU"], "correct": "B", "reason": "Sürüm kontrolü genişler."},
        {"q": "Referrer-Policy hangi sızıntıyı azaltır?", "choices": ["SQL", "URL’deki parametrelerin referrer ile sızması", "CPU", "DNS", "JPEG"], "correct": "B", "reason": "Çapraz site sızıntısını düşürür."},
        {"q": "Permissions-Policy neyi sınırlar?", "choices": ["DB indeks", "Tarayıcı özellikleri (kamera vb.)", "TLS", "DNS", "CPU"], "correct": "B", "reason": "Özellik yüzeyini daraltır."},
        {"q": "Konfigürasyon doğrulamasında “diff” neden önemlidir?", "choices": ["Tema", "Staging’de açık kalan debug’ın üretime sızmasını yakalar", "DNS", "Font", "Favicon"], "correct": "B", "reason": "Ortam kayması sık kök nedendir."},
    ]
)

M9 = f"""<h1>MODÜL 9 — Loglama, izleme ve hata yönetimi <small>(müfredat 19)</small></h1>
{img_block("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=90", "İzleme panosu", "Çoklu log kaynağı: saldırganın zinciri; savunmacının hikâyesi.")}
<p>Web olayları tek logda çözülmez. Kimlik sağlayıcı, uygulama, API geçidi, WAF, web sunucusu ve veritabanı denetimi birlikte <strong>zaman çizelgesi</strong> üretir. Saldırganın otomasyonu düşük gürültülü olabilir; bu yüzden baseline ve eşikler önemlidir.</p>
<p>Log hacmi büyüdükçe ekipler “daha az log” ister; fakat güvenlik olayında eksik satır bazen <strong>kanıt zincirinin kopması</strong> demektir. Çözüm yalnızca kesmek değil: örnekleme politikasında güvenlik sınıflarını dışarıda bırakmama, kritik uçlarda tam kayıt, diğerlerinde özet metrik.</p>
{lo("Modül hedefleri", [
    "Log türlerini ve korelasyon ihtiyacını açıklayabilirim.",
    "False positive/negative ayrımını yönetebilirim.",
    "NTP/zaman senkronizasyonunun analizdeki rolünü savunabilirim.",
    "Şüpheli oturum + API senaryosunu rapora dökebilirim.",
])}
{key_concepts_grid([
    ("fa-clock", "Zaman", "NTP ve tek kaynaklı saat; aksi halde saldırgan ‘önce/sonra’ hikâyesi kuramaz."),
    ("fa-link", "Korelasyon", "request_id / trace_id tüm katmanda yoksa olay parçalanır."),
    ("fa-filter", "Örnekleme", "Log maliyeti için sampling varsa kritik güvenlik olayları dışarıda bırakılmamalıdır."),
    ("fa-user-secret", "PII", "Logda maskeleme; analist ekranında tam metin ayrı yetki."),
])}
<h2>Log katmanları ve saldırganın izleri</h2>
{table(["Kaynak", "Ne görür?", "Tipik saldırgan sinyali (eğitim)"], [
    ["Web access", "URL, status, byte", "Çok 404/403, anormal parametre uzunluğu"],
    ["App", "İşlem/trace id", "Yetki hatası patlaması"],
    ["Auth", "login/MFA", "Coğrafya sıçraması, spraying"],
    ["WAF", "kural id", "aynı istemciden çok imza"],
])}
<h2>Korelasyon ve zaman</h2>
<p>Zaman kayması analizi öldürür. İstek kimliği (X-Request-Id) uçtan uca taşınırsa olay birleştirilir.</p>
<p>Korelasyon kimliği yoksa analist “hikâye anlatımına” düşer; bu da raporda kanıtsız iddia riskini artırır. Pratik minimum set: edge request id, uygulama trace id, kullanıcı/oturum id (maskeli), hedef kaynak id ve işlem adı (ör. <code>ORDER_REFUND</code>).</p>
{terminal("join-logs.sh — tek satırda birleştirme (kurgusal)", """<span class="term-prompt">soc@sebs:~$</span> <span class="term-cmd">jq -c 'select(.request_id==\"7c4b9e2a\")' waf.jsonl app.jsonl db.jsonl</span>
<span class="term-output">{"request_id":"7c4b9e2a","waf_action":"allow","rule":"-"}</span>
<span class="term-output">{"request_id":"7c4b9e2a","path":"/api/v1/orders","status":200}</span>
<span class="term-output">{"request_id":"7c4b9e2a","db":"select ...","duration_ms":940}</span>
<span class="term-comment"># Üç kaynak aynı id: hikâye tamamlanır; biri eksikse kör nokta.</span>""")}
{risk_card('<p><strong>Yanlış pozitif:</strong> bakım penceresi, yeni özellik trafiği, kötü kural. <strong>Yanlış negatif:</strong> log yok, örnekleme, aşırı filtre.</p>')}
<h2>Operasyonel senaryo: şüpheli oturum + API</h2>
<p><strong>Belirti:</strong> Aynı hesaptan kısa sürede farklı ülkeler; ardından yönetim API uçlarına artan 200’ler.</p>
<p><strong>Hipotezler:</strong> hesap ele geçirimi; paylaşımlı VPN; otomasyon hatası; compromise edilmiş entegrasyon.</p>
<p><strong>Kanıt:</strong> auth log, API gateway, cihaz kaydı, değişiklik kaydı, başarılı MFA mı?</p>
<p><strong>Analiz:</strong> zaman çizelgesi; her hipotez için destek/çürütme; blast radius.</p>
<p><strong>Karar:</strong> risk temelli kontainment (kurum politikası).</p>
<p><strong>Rapor:</strong> Bulgu → Etki → Öneri → Kanıt.</p>
""" + quiz(
    [
        {"q": "Olay analizinde NTP sapması neyi bozar?", "choices": ["SEO", "Korelasyon", "JPEG", "Font", "Tema"], "correct": "B", "reason": "Zaman tutarlılığı şarttır."},
        {"q": "WAF alarmı tek başına kesin teşhis midir?", "choices": ["Evet", "Hayır; bağlam ve çoklu kanıt gerekir", "Sadece mobil", "Sadece GET", "Sadece CDN"], "correct": "B", "reason": "False positive riski yüksektir."},
        {"q": "False negative ne demektir?", "choices": ["Çok alarm", "Tehdit sinyal üretmedi", "Bakım", "403", "Tema"], "correct": "B", "reason": "Görünürlük boşluğu olabilir."},
        {"q": "API geçidi + uygulama logu birlikte ne sağlar?", "choices": ["Tema", "Uçtan uca trace", "DNS", "Font", "Favicon"], "correct": "B", "reason": "İstek kimliği köprüsü."},
        {"q": "Gözlem ile yorum ayrımı neden önemlidir?", "choices": ["Rapor uzar", "Denetlenebilirlik", "Log silinir", "TLS kapanır", "WAF"], "correct": "B", "reason": "Kanıt disiplini."},
        {"q": "403 artışı neyi düşündürmeli?", "choices": ["SEO", "Keşif veya yanlış politika", "JPEG", "Font", "Tema"], "correct": "B", "reason": "Yetki keşfi olabilir."},
        {"q": "Örnekleme (sampling) riski nedir?", "choices": ["Hız", "Olay kaçırma (false negative)", "TLS", "DNS", "CPU"], "correct": "B", "reason": "Kritik satırlar düşebilir."},
        {"q": "PII maskeleme logda neden önemlidir?", "choices": ["Tema", "İkinci sızıntı ve uyum", "DNS", "Font", "Favicon"], "correct": "B", "reason": "Log geniş erişimdedir."},
    ]
)

M10 = f"""<h1>MODÜL 10 — Güvenli SDLC, bağımlılık güvenliği ve AppSec otomasyonu <small>(müfredat 18)</small></h1>
{img_block("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=90", "Geliştirme", "Güvenlik: sprint sonunda değil; tehdit modelinden dağıtıma kadar süreç içi.")}
<p>Saldırganın avantajı sıklıkla <strong>hız</strong> ve <strong>tekdüze otomasyon</strong>dır. Savunmanın karşılığı, hızı düşürmeden riski düşüren <strong>otomatik kontroller</strong> ve <strong>erken tehdit modellemesidir</strong>. Bu modül AppSec, DevSecOps ve SOC ilişkisini netleştirir.</p>
<p>Güvenlik kapıları (merge blokları) çok gürültülü olunca geliştirici “acil bypass” ister; bu da tedarik zinciri riskini geri getirir. Sürdürülebilir model: kural sahipliği, gürültü bütçesi ve false positive SLA’sı yazılı olur.</p>
{lo("Modül hedefleri", [
    "Tehdit modellemeye giriş yapabilirim.",
    "Güvenli kabul kriterleri ve CI kontrollerini listeleyebilirim.",
    "Secret scanning ve bağımlılık riskini sürece bağlayabilirim.",
    "Değişiklik sonrası doğrulama ve rollback disiplinini açıklayabilirim.",
])}
{key_concepts_grid([
    ("fa-shield-virus", "Erken tehdit", "STRIDE soruları PR açıklamasına ‘hangi varlık?’ diye eklenir."),
    ("fa-gears", "CI kapısı", "Kırmızı build = merge yok; ama kural gürültüsü yönetilmezse ekip kapıyı bypass eder."),
    ("fa-boxes-stacked", "Tedarik zinciri", "İmzalı commit, imzalı artefakt, bağımlılık SBOM birbirini tamamlar."),
    ("fa-headset", "SOC köprüsü", "Kritik uç listesi ve entegrasyon riski alarm önceliğini besler."),
])}
{process_flow([("fa-lightbulb", "Tehdit modeli"), ("fa-code", "Güvenli kod"), ("fa-vial", "Test"), ("fa-rocket", "Dağıtım"), ("fa-eye", "İzleme")])}
<h2>Threat modeling (STRIDE kısa)</h2>
{table(["STRIDE", "Soru", "Örnek web kontrolü"], [
    ["Spoofing", "Kimlik sahteciliği?", "MFA, oturum bağlama"],
    ["Tampering", "Veri bütünlüğü?", "İmza, CSRF token"],
    ["Repudiation", "İnkâr edilemezlik?", "Denetim logu"],
    ["Information disclosure", "Sızıntı?", "Hata mesajı, API alanları"],
    ["DoS", "Erişilebilirlik?", "Oran sınırlama, autoscale"],
    ["Elevation", "Yetki yükseltme?", "RBAC + object checks"],
])}
<h2>CI/CD güvenlik kontrolleri</h2>
<p>SAST/DAST, bağımlılık taraması, IaC taraması, secret scan ve imzalı artefakt; her biri farklı hata sınıfını erken keser. “Yeşil build” güvenli demek değildir; kural kalitesi ve false positive yönetimi gerekir.</p>
<p>Özellikle DAST/aktif tarama adımları yanlışlıkla staging yerine canlıyı vurabilir; bu yüzden pipeline değişkenleri ve hedef URL’ler ayrı onaylı olmalıdır. SOC ile anlaşma: build sırasında üretilen anormal trafik “saldırı” değil test olarak etiketlenir.</p>
<h2>SOC ile köprü</h2>
<p>SDLC çıktıları (hangi uç kritik, hangi entegrasyon riskli) SOC’un alarm önceliklendirmesini besler.</p>
<p>Tehdit modelinden çıkan “kritik işlem listesi” doğrudan SIEM use case’lerine yazılır: örneğin “yönetici rol ataması + yeni cihaz + kısa sürede API aşırı veri” gibi bileşik korelasyonlar. Böylece güvenlik testi ile operasyon birbirini besler.</p>
""" + quiz(
    [
        {"q": "Tehdit modellemenin doğrudan çıktısı nedir?", "choices": ["Logo", "Öncelikli kontroller ve test soruları", "DNS", "Font", "Tema"], "correct": "B", "reason": "Erken risk tartışması."},
        {"q": "Secret scanning ne arar?", "choices": ["Font", "Repoda sızmış sırlar", "JPEG", "CPU", "DNS"], "correct": "B", "reason": "Erken uyarı."},
        {"q": "Değişiklik sonrası doğrulama neden şart?", "choices": ["Log silmek", "Regresyon ve kapanış kriteri", "TLS kapatmak", "Tema", "WAF"], "correct": "B", "reason": "Düzeltme doğrulanmalıdır."},
        {"q": "STRIDE’de “Information disclosure” webde neye örnek?", "choices": ["CPU", "Hassas alanların API’de dönmesi", "DNS", "Font", "Tema"], "correct": "B", "reason": "Veri minimizasyonu ihlali."},
        {"q": "İmzalı artefakt neyi azaltır?", "choices": ["Tema", "Supply chain manipülasyonu", "DNS", "Font", "JPEG"], "correct": "B", "reason": "Bütünlük ve kaynak güveni."},
        {"q": "SOC’un SDLC’den beklediği fayda?", "choices": ["Tema", "Daha iyi öncelik ve bağlam", "DNS", "Font", "Favicon"], "correct": "B", "reason": "Kritik uç bilgisi."},
        {"q": "Güvenli kabul kriteri ne işe yarar?", "choices": ["Geciktirmek", "Ölçülebilir “tamam” tanımı", "Log silmek", "TLS kapatmak", "WAF"], "correct": "B", "reason": "Çıkış koşulu."},
        {"q": "Bağımlılık riski neden “sürekli”dir?", "choices": ["Bir kez taranır", "CVE’ler zamanla ortaya çıkar", "DNS", "Font", "Tema"], "correct": "B", "reason": "Zincir güncellenir."},
    ]
)

SCEN = f"""
<h2>Operasyonel senaryolar (genişletilmiş özet)</h2>
<p>Her senaryo aynı omurga ile yazılır: belirti → hipotezler → kanıt → analiz → karar → rapor (Bulgu → Etki → Öneri → Kanıt). Aşağıdaki özetler <strong>kurgusal</strong> isimler içerir; gerçek olay incelemesinde veri sınıflandırması ve yetki çerçevesi her zaman önce gelir.</p>
<p>Bu özetler “tek doğru hikâye” sunmaz; amaç, triage sırasında zihninizde açılacak <strong>şube ağacını</strong> önceden doldurmaktır. Her dal için bir cümle “çürütme denemesi” (hangi log bu hipotezi öldürür?) yazmayı alışkanlık edinin.</p>
{key_concepts_grid([
    ("fa-stethoscope", "Belirti", "Ölçülebilir gözlem: status dağılımı, coğrafya, yanıt süresi, hata kodu patlaması."),
    ("fa-flask", "Hipotez", "Birden fazla tutulur; favori hipotez kanıt olmadan seçilmez."),
    ("fa-folder-open", "Kanıt paketi", "Log kesiti, yapılandırma diff, maskelemiş ekran görüntüsü, hash manifesti."),
    ("fa-gavel", "Karar", "Kontainment ve iletişim kurum politikasına bağlıdır; teknik ekip tek başına ‘hesap kapat’ kararı vermez."),
])}
<h3>1) Şüpheli giriş</h3>
<p>Spraying/brute force veya sızdırılmış parola sonrası oturum. Kanıt: auth log + risk skoru + coğrafya. Ek olarak: aynı ASN’den çok hesap denemesi, başarıdan hemen sonra şifre değişikliği veya MFA kaldırma girişimi gibi <strong>zincir</strong> adımları zaman çizelgesine işlenir.</p>
<h3>2) Yetkisiz admin şüphesi</h3>
<p>403→200 deseni veya yeni rol ataması. Kanıt: IAM değişiklik kaydı + admin API. Yorum: otomasyon (CI) mi insan mı ayırt etmek için pipeline kullanıcısı ve IP allowlist’i kontrol edilir.</p>
<h3>3) API aşırı veri</h3>
<p>İstemci modelinde görülen hassas alanlar. Kanıt: sözleşme diff + maskelemiş örnek yanıt. İş etkisi: KVKK/GDPR süreleri, müşteri bildirimi ihtiyacı.</p>
<h3>4) Debug açık</h3>
<p>Yığın izi kullanıcıya. Kanıt: yanıt gövdesi + config diff. Yan etki: saldırgan keşfi hızlanır; aynı zamanda loglara iç yapı düşebilir.</p>
<h3>5) Hatalı CORS</h3>
<p>Beklenmeyen kökenle başarılı okuma. Kanıt: başlık yakalama + tarayıcı politikası. Düzeltme sonrası regression: preflight ve mobil WebView ayrı test edilir.</p>
<h3>6) Dosya yükleme riski</h3>
<p>Çalıştırılabilir içerik veya path birleştirme. Kanıt: kod yolu + depolama kökü + CDN imza URL politikası.</p>
<h3>7) Hata mesajında hassas bilgi</h3>
<p>SQL/şema ipucu. Kanıt: ekran görüntüsü (maskeli) + log policy. Öneri: genel kullanıcı mesajı + iç trace id.</p>
{info_box("Rapor dilinde kaçınılacaklar", [
    "Kesin saldırgan kimliği iddiası (kanıtsız),",
    "Üretimde tekrarlanmamış ‘staging’ bulgusunu aynen taşımak,",
    "Ham PII içeren ekran görüntüsü paylaşımı.",
])}
"""

M11 = f"""<h1>MODÜL 11 — Güvenlik testi, araç okuryazarlığı ve raporlama <small>(müfredat 20)</small></h1>
{img_block("https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=90", "Profesyonel rapor", "Rapor: teknik doğruluk + iş dili + kanıt zinciri.")}
<p>Bulgularınız ne kadar doğru olursa olsun, karar verici “ne olur, ne kadar sürer, ne maliyet” sorularına yanıt bulamazsa eylem gecikir. Bu modülde teknik ek ile yönetici özetini ayırma, belirsizlik dili, karşı kanıt ve risk skoru bağlamı uzatılır.</p>
<p>İyi raporlar “suçlu bulma” değil <strong>ölçülebilir risk</strong> anlatır: etki senaryoları (en kötü / olası / en iyi), her senaryo için önkoşullar ve mevcut kontroller. Bu yapı denetim ve sigorta sorularında da tekrar kullanılır.</p>
{lo("Modül hedefleri", [
    "Bulgu → Etki → Öneri → Kanıt formatında uzun form rapor yazabilirim.",
    "Karşı kanıt ve false positive ayrımını rapora gömebilirim.",
    "Kapanış kriteri ve doğrulama adımlarını tanımlayabilirim.",
])}
<h2>Risk skoru ve önceliklendirme</h2>
{table(["Öğe", "Açıklama"], [
    ["Etki", "Veri/iş kesintisi şiddeti"],
    ["Olasılık", "Kullanım ve maruziyet"],
    ["Kontrol", "Mevcut savunma ve görünürlük"],
    ["Kapanış", "Düzeltme + doğrulama tanımı"],
])}
{SCEN}
<h2>Lessons learned</h2>
<p>Olay sonrası: hangi sinyal geç geldi, hangi kontrol işe yaradı, hangi runbook eksikti? Bu çıktı bir sonraki tehdit modelini besler.</p>
""" + quiz(
    [
        {"q": "Kanıtsız kesin saldırı iddiası neden zayıftır?", "choices": ["Hızlıdır", "Denetlenemez", "Kısadır", "Güzeldir", "Modadır"], "correct": "B", "reason": "Kanıt şarttır."},
        {"q": "Yönetici özeti ne içermelidir?", "choices": ["Ham log", "Etki, öncelik, maliyet ve eylem", "Stack trace", "SQL", "JPEG"], "correct": "B", "reason": "Karar dili."},
        {"q": "Karşı kanıt aramak neden profesyoneldir?", "choices": ["Yavaşlatır", "False positive düşürür", "Log siler", "TLS kapatır", "WAF"], "correct": "B", "reason": "Eleştirel düşünce."},
        {"q": "Kapanış kriteri neyi tanımlar?", "choices": ["Tema", "Düzeltmenin doğrulanmış olması", "DNS", "Font", "Favicon"], "correct": "B", "reason": "Ölçülebilir bitiş."},
        {"q": "Teknik ek ne için vardır?", "choices": ["Yönetici", "İncelenebilir kanıt ve tekrar üretim", "SEO", "Tema", "CPU"], "correct": "B", "reason": "Şeffaflık."},
        {"q": "Belirsizlik dili ne zaman kullanılır?", "choices": ["Her zaman kesin", "Kanıt yetersizken", "Log silmek için", "WAF için", "DNS için"], "correct": "B", "reason": "Dürüstlük."},
        {"q": "Etki bölümünde ne olmaz?", "choices": ["İş sonucu", "Sadece jargon yığını", "Maliyet", "Süre", "Öncelik"], "correct": "B", "reason": "İş bağlamı gerekir."},
        {"q": "Lessons learned kime fayda sağlar?", "choices": ["Sadece yazara", "Gelecek olaylara ve SDLC’ye", "DNS", "Font", "Tema"], "correct": "B", "reason": "Sürekli iyileştirme."},
    ]
)

M12 = f"""<h1>MODÜL 12 — Terimler, özet ve kapanış <small>(tüm müfredat)</small></h1>
{img_block("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=90", "Kitap ve notlar", "Ortak dil: ekip içi iletişim ve raporların denetlenebilirliği.")}
<p>Bu sözlük modüllerde geçen kavramları tek yerde toplar. Tablo görünümü, sayfadaki otomatik biçimlendirme ile zenginleşebilir.</p>
<p>Sözlük amacı ezber değil, ekipler arası <strong>çeviri hatasını</strong> azaltmaktır: aynı kelimenin geliştirmede “özellik”, hukuk’ta “veri işleme”, SOC’ta “olay” olarak anlaşılması gibi sapmalar bulgu önceliğini kaydırır.</p>
<h2>Terimler Sözlüğü</h2>
{table(["Terim (EN)", "Türkçe / açıklama"], [
    ["Authentication", "Kimlik doğrulama: kullanıcı iddiasını kanıtlama"],
    ["Authorization", "Yetkilendirme: izin verilen işlem ve kaynaklar"],
    ["Session", "Oturum: sunucunun tanıdığı etkileşim durumu"],
    ["Cookie", "Çerez: tarayıcıda taşınan küçük veri; oturum taşıyabilir"],
    ["Token", "Belirteç: kimlik veya yetki iddiasını taşıyan değer"],
    ["CSRF", "Siteler arası istek sahteciliği: çerezin otomatik taşınmasıyla durum değiştirme riski"],
    ["XSS", "Siteler arası komut dosyası: güvensiz verinin tarayıcıda komut gibi yorumlanması riski"],
    ["SQL Injection", "SQL enjeksiyonu: sorgu yapısına güvensiz veri gömülmesi"],
    ["SSRF", "Sunucu tarafı istek sahteciliği: sunucunun istenmeyen hedeflere köprü olması"],
    ["CORS", "Kökenler arası paylaşım politikası"],
    ["CSP", "İçerik güvenlik politikası"],
    ["HSTS", "HTTP sıkı taşıma güvenliği"],
    ["API", "Uygulama programlama arayüzü"],
    ["Rate limit", "Oran sınırlama"],
    ["WAF", "Web uygulama güvenlik duvarı"],
    ["Secure SDLC", "Güvenli yazılım yaşam döngüsü"],
    ["Threat modeling", "Tehdit modelleme"],
    ["Input validation", "Girdi doğrulama"],
    ["Output encoding", "Çıktı kodlama"],
    ["Sensitive data exposure", "Hassas veri maruziyeti"],
    ["Business logic flaw", "İş mantığı hatası"],
    ["Evidence", "Kanıt"],
    ["False positive", "Yanlış pozitif"],
    ["False negative", "Yanlış negatif"],
    ["Risk", "Olasılık ve etkinin birleşimi (kurumsal tanıma göre)"],
    ["Impact", "Etki: iş, veri veya itibar sonucu"],
    ["Mitigation", "Azaltma: kontrol veya süreçle risk düşürme"],
    ["Verification", "Doğrulama: düzeltmenin kanıtla teyidi"],
])}
{key_concepts_grid([
    ("fa-book", "Ortak dil", "Aynı terimi farklı ekipler farklı anlarsa öncelik ve bütçe yanlış dağılır."),
    ("fa-language", "İngilizce kök", "Rapor ve CVE ile uyum için EN terim + TR açıklama birlikte tutulur."),
    ("fa-graduation-cap", "Öğrenme çıktısı", "Sözlük ezber değil; bulgu raporunda doğru kelimeyi seçmek içindir."),
])}
<h2>Öğretim tamamlayıcı: araçlar ve komutlar (B)</h2>
<p>Modül 5’teki <strong>lab komut paleti</strong> ile birlikte okunmalıdır. Burada keşif ve otomatik tarama araçları yer alır; yalnızca yazılı yetki ve RoE kapsamındaki adreslerde çalıştırın.</p>
{table(["Araç / komut", "Öğretimde rolü", "Güvenli kullanım notu"], [
    ["Burp Suite / OWASP ZAP", "HTTP proxy ile istek düzenleme, tekrar, aktif tarama", "Tarayıcıyı proxy’ye kilitle; kapsam dışı domain’e trafik gönderme"],
    ["nmap", "Açık port ve servis sürümü (banner)", "-T polite veya -T2; üretimde agresif tarama yasak olabilir"],
    ["nikto", "Web sunucusu bilinen zayıflık imzaları", "Yalnız lab; çıktı gürültülü, manuel doğrulama şart"],
    ["nuclei", "Şablon tabanlı CVE / misconfig taraması", "-rate-limit ve küçük şablon seti; false positive yüksek"],
    ["mitmproxy", "TLS trafiğini (kendi cihazınızda) inceleme", "Kurumsal cihazda kök sertifika yüklemek politika ister"],
    ["openssl s_client / x509", "TLS zinciri ve sertifika alanları", "Sunucu doğrulama ve süre kontrolü"],
    ["git / trufflehog (ör.)", "Repoda sızmış sırlar", "Önce .gitignore ve secret policy; sonra tarama"],
    ["docker / compose", "Zafiyetli lab ortamını izole ayağa kaldırma", "Host ağına bridge dikkat"],
])}
{terminal("lab-09-nmap.sh — servis keşfi (YOUR-LAB)", """<span class="term-prompt">student@lab:~$</span> <span class="term-cmd">nmap -sV -Pn --top-ports 200 -T2 YOUR-LAB</span>
<span class="term-output">PORT    STATE SERVICE  VERSION</span>
<span class="term-output">22/tcp  open  ssh      OpenSSH 8.x</span>
<span class="term-output">443/tcp open  ssl/http nginx</span>
<span class="term-comment"># -sC (script) agresif olabilir; labda bile RoE’ye yazılı değilse açmayın.</span>""")}
{terminal("lab-10-nuclei.sh — şablon taraması (örnek)", """<span class="term-prompt">student@lab:~$</span> <span class="term-cmd">nuclei -u https://YOUR-LAB -tags exposure,misconfig -rate-limit 15 -c 10</span>
<span class="term-output">[inf] found 3 results</span>
<span class="term-comment"># Her bulguyu manuel tekrarlayın; nuclei ‘bilgi’ seviyesini bulgu sanmayın.</span>""")}
{terminal("lab-11-mitmproxy.sh — yerel tarayıcı trafiği", """<span class="term-prompt">student@lab:~$</span> <span class="term-cmd">mitmproxy --listen-port 8080</span>
<span class="term-comment"># Tarayıcı proxy: 127.0.0.1:8080; mitm.it ile CA kurulumu (yalnız kendi test hesabınız).</span>
<span class="term-comment"># Başkasının trafiğini izlemek yasal değildir.</span>""")}
{terminal("lab-12-zap-headless.sh — baseline (örnek)", """<span class="term-prompt">student@lab:~$</span> <span class="term-cmd">docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t https://YOUR-LAB -r zap-report.html</span>
<span class="term-output">PASS: 0 WARN: 12 FAIL: 1</span>
<span class="term-comment"># FAIL her zaman kritik değildir; raporu uygulama sahibiyle birlikte okuyun.</span>""")}
{info_box("Parola / kimlik denemesi araçları (hydra, medusa vb.)", [
    "Bu eğitim metninde örnek komut satırı verilmez: yanlışlıkla canlı hesaba kilit veya hukuki ihlal riski çok yüksektir.",
    "Kurum içi labda bile kullanıcı listesi ve deneme politikası ayrı onay ister; SOC ile önceden haberleşin.",
])}
<h2>Eğitimin Kapanışı</h2>
<p>Bu uzun eğitimde web uygulamasını hem <strong>savunmacı</strong> hem <strong>tehdit perspektifiyle (eğitim düzeyinde)</strong> okudunuz: HTTP ve oturum modeli, kimlik ve yetki, enjeksiyon ve mantık hataları, API ve header/CORS, log analizi, SDLC ve raporlama. Bir sonraki adım API Security ve Secure Code Review modüllerinde derinleşebilir; burada kurduğunuz dil ve kanıt disiplinini taşıyın.</p>
<p>Kapanış ödevi olarak kendi ortamınız için tek sayfalık bir <strong>“kritik uç ve log köprüsü”</strong> taslağı yazın: hangi işlem hangi üç log satırında görünmeli? Eksik köprüyü bulduğunuzda bu eğitimin en değerli çıktısını üretmiş olursunuz.</p>
""" + quiz(
    [
        {"q": "Evidence ile Impact farkı?", "choices": ["Aynı", "Gözlem vs sonuç", "DNS", "Font", "Tema"], "correct": "B", "reason": "Kanıt ve etki ayrıdır."},
        {"q": "Mitigation?", "choices": ["CVE adı", "Risk azaltma", "Tema", "DNS", "Font"], "correct": "B", "reason": "Kontrol veya süreç."},
        {"q": "Verification?", "choices": ["Tahmin", "Kanıtla doğrulama", "Log silmek", "WAF", "TLS kapatmak"], "correct": "B", "reason": "Kapanış için gerekli."},
        {"q": "Threat modeling çıktısı?", "choices": ["Favicon", "Kontrol önceliği", "JPEG", "CPU", "DNS"], "correct": "B", "reason": "Erken risk."},
        {"q": "False negative?", "choices": ["Çok alarm", "Tehdit görünmedi", "403", "Tema", "Font"], "correct": "B", "reason": "Görünürlük boşluğu."},
        {"q": "Secure SDLC özü?", "choices": ["Son gün tarama", "Sürece yayılma", "WAF", "TLS", "CDN"], "correct": "B", "reason": "Sürekli güvenlik."},
        {"q": "CORS neyi yönetir?", "choices": ["SQL", "Kökenler arası erişim", "CPU", "DNS", "JPEG"], "correct": "B", "reason": "Tarayıcı politikası."},
        {"q": "WAF rolü?", "choices": ["Tek çözüm", "İmza ve hızlı filtre katmanı", "DB", "DNS", "Font"], "correct": "B", "reason": "Derinlemesine savunma tamamlayıcıdır."},
    ]
)


def main() -> None:
    html = (
        sec("wag-m6-zafiyet", False, M6)
        + sec("wag-m6b-is-mantigi", False, M6B)
        + sec("wag-m7-api", False, M7)
        + sec("wag-m8-headers", False, M8)
        + sec("wag-m9-log", False, M9)
        + sec("wag-m10-sdlc", False, M10)
        + sec("wag-m11-rapor", False, M11)
        + sec("wag-m12-sozluk", False, M12)
    )
    OUT1.write_text(html, encoding="utf-8")
    print("Wrote", OUT1, "chars", len(html))


if __name__ == "__main__":
    main()
