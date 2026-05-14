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


def info_box(title: str, paragraphs: list[str]) -> str:
    body = "".join(f"<p>{esc(p)}</p>" for p in paragraphs)
    return f'<div class="info-box"><p><strong>{esc(title)}</strong></p>{body}</div>'


def key_concepts_grid(items: list[tuple[str, str, str]]) -> str:
    """(fa_icon_class_without-fas-prefix, title, text)"""
    parts = ['<div class="key-concepts">']
    for icon, title, text in items:
        parts.append(
            f'<div class="key-concept-card"><h4><i class="fas {esc(icon)}"></i> {esc(title)}</h4><p>{esc(text)}</p></div>'
        )
    parts.append("</div>")
    return "\n".join(parts)


def terminal(title: str, body_inner: str) -> str:
    return f'''<div class="linux-terminal"><div class="term-header"><span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span><span class="term-title">{esc(title)}</span></div><div class="term-body">{body_inner}</div></div>'''


# --- MOD 0 ---
M0 = f"""<h1>MODÜL 0 — Etik, Yetki ve Güvenli Çalışma Çerçevesi</h1>
{img_block("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=90", "Hukuk ve siber güvenlik", "Profesyonel web güvenliği çalışması: yazılı yetki, kapsam ve denetlenebilir kanıt.")}
<p>Bu modül bir “giriş engeli”dir (gating): Burada çerçeve oturmadan teknik başarı sayılmaz. Web uygulaması güvenliği eğitiminde saldırganın <em>hedeflediği değerleri</em> (hesaplar, oturumlar, veri, işlem bütünlüğü, itibar) anlamak; aynı zamanda bu değerlere <strong>yetkisiz veya ölçüsüz</strong> temasın neden kurumsal felaket olduğunu anlamaktır. Savunmacı ve güvenli test uzmanı tehdidi modellemek zorundadır; sahadaki profesyonellik ise yazılı yetki, kapsam ve <strong>denetlenebilir kanıt</strong> ile ölçülür—kapsam dışına çıkmak ve kanıtı manipüle etmek kabul edilemez. Ders metinleri ve örnekler, savunma ve yetkili güvenlik çalışması için gereken teknik düzeyi karşılayacak şekilde sunulur; yasal ve etik kullanım yükümlülüğü tamamen size aittir (aşağıdaki sorumluluk reddi).</p>
<p>Tehdit tarafı perspektifi (eğitim düzeyinde): saldırganın motivasyonu çoğu zaman <strong>erişim</strong>, <strong>kalıcılık</strong>, <strong>veri toplama</strong> veya <strong>hizmet aksatma</strong> üzerinedir. Web uygulaması bu zincirde sıkça ilk temas veya kalıcı erişim noktasıdır. Bu nedenle “sadece teknik kontrol listesi” yetmez; <strong>hangi varlığa dokunduğunuz</strong> ve <strong>hangi veriyi taşıdığınız</strong> her adımda sorulur.</p>
{lo("Modül hedefleri", [
    "Yetkisiz test ile yetkili güvenlik çalışması arasındaki çizgiyi kurumsal dilde açıklayabilirim.",
    "RoE, kapsam, ortam ayrımı ve kill-switch kavramlarını web bağlamında uygulayabilirim.",
    "Kanıt minimizasyonu ve kişisel/hassas veri için maskeleme kararı verebilirim.",
    "Bulgu → Etki → Öneri → Kanıt omurgasında rapor üretebilirim.",
    "Saldırganın hedeflediği değerleri (varlık) savunma kararlarına bağlayabilirim.",
])}
{key_concepts_grid([
    ("fa-scale-balanced", "Yetki ve merak ayrımı", "Profesyonel güvenlik çalışması merakla değil, yazılı yetkiyle başlar. “Şunu denesek ne olur?” sorusu RoE içinde cevaplanmadıysa cevap yoktur: önce sahip ve risk sahibiyle netleştirme."),
    ("fa-users", "Paydaş haritası", "Uygulama ekibi, altyapı, veri sahibi, hukuk ve iletişim hatları aynı tabloda olmalıdır. Kill-switch tetiklenince kimin aranacağı belirsizse operasyon gecikir ve zarar büyür."),
    ("fa-file-contract", "Kanıt disiplini", "Kanıt toplarken aynı anda üç soru: Bu veri gerekli mi? Maskeleme yeterli mi? Zincirleme erişim kimde? Yanıtlar rapora not düşer."),
    ("fa-skull-crossbones", "Tehdit perspektifi (eğitim)", "Saldırganın hedefi çoğu zaman oturum, veri veya işlem yetkisidir; yöntem ise web yüzeyinden başlayabilir. Bu yüzden kapsam dışı bir alt alan “küçük deneme” bile başka kontrolleri tetikleyebilir."),
])}
<p>Kurumsal gerçeklikte bu modülün mesajı şudur: güvenlik ekibi “teknik olarak haklı” olsa bile <strong>hukuk ve iş birimi haklı çıkmaz</strong> çünkü izin kağıdı eksikse operasyon hukuka aykırıdır. Bu yüzden çoğu olgun kurumda pentest veya kırmızı takım çalışması, satın alma veya hukuk müşaviri üzerinden sözleşmeye bağlanır; bulgular ise denetim (ISO 27001, SOC2 vb.) ve düzenleyici taleplerde kanıt zinciri olarak geri döner. Sizin rolünüz yalnızca zafiyet bulmak değil, <em>risk sahibinin anlayacağı dilde</em> neyin müzakere edildiğini ve hangi veriye dokunulduğunu şeffaf yazmaktır.</p>
<p>Bir diğer sık görülen tuzak, “acil durum” retoriğidir: üretimde anlık deneme, gece yarısı değişikliği, müşteri şikayeti bahanesiyle kapsam genişletme. Profesyonel pratikte acil durum <strong>önceden tanımlanmış</strong> olur: kim aranır, hangi kanal, hangi log seviyesi, hangi geri alma adımı. Bu modülün geri kalanı bu disiplinin teknik ayrıntılarını (log, hash, maskeleme, staging ayrımı) doldurur; fakat zihinsel çerçeve her zaman “acele = kapsam ihlali riski” uyarısıyla okunmalıdır.</p>
{info_box("Kapsam kayması (scope creep) uyarısı", [
    "Kapsam belgesi yaşayan bir dokümandır. Yeni bir mikro servis, geçici bir CDN kuralı veya acil açılan bir yönetim ucu kapsamı sessizce genişletir.",
    "Savunmacı yaklaşım: her genişleme için mini risk değerlendirmesi ve yazılı onay kaydı. Aksi halde “tek seferlik kontrol” üretimde kalıcı yan etki bırakır.",
])}
<h2>Kurgusal örnek: kapsam satırları nasıl yazılır?</h2>
<p>Aşağıdaki tablo tamamen kurgusaldır; gerçek kurum adı veya adres içermez. Amaç, kapsam belgesinin “satır satır” okunabilir olması ve saldırganın hangi satırda belirsizlik arayacağını göstermektir.</p>
{table(["Satır", "Kapsam içi mi?", "Not"], [
    ["app.example.com (443) üretim", "Evet", "Salt okuma + belirli test hesapları"],
    ["api.example.com (443) üretim", "Hayır (örnek)", "Açıkça yazılmadıysa varsayım yapılmaz"],
    ["staging.example.com", "Evet", "Veri sentetik; sonuçlar üretime taşınmaz"],
    ["Ortak kimlik sağlayıcı (SSO)", "Koşullu", "Sadece hedef uygulama entegrasyonu; kullanıcı oluşturma yok"],
])}
{terminal("roe-prepare.sh — kendi makinenizde çalışan demo (kopyala-çalıştır)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">mkdir -p demo-scope demo-evidence/INC-DEMO</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">printf 'in-scope: https://lab.local (443)\\nout-of-scope: production\\n' &gt; demo-scope/INC-DEMO.md</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">grep -E 'in-scope|out-of-scope' demo-scope/INC-DEMO.md</span>
<span class="term-output">in-scope: https://lab.local (443)</span>
<span class="term-output">out-of-scope: production</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">TS=$(date +%Y-%m-%dT%H:%M:%S%z) && printf '%s RoE self-check OK\\n' "$TS" &gt;&gt; demo-evidence/INC-DEMO/timeline.txt</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">tail -n 1 demo-evidence/INC-DEMO/timeline.txt</span>
<span class="term-output">2026-05-14T12:00:00+0300 RoE self-check OK</span>
<span class="term-comment"># Üstteki çıktı sizin saatinize göre değişir; amaç: komutların gerçekten çalıştığını görmek.</span>""")}
{terminal("roe-prepare.sh — eski kurgusal satırlar (dosya yoksa ROE_MISSING normaldir)", """<span class="term-prompt">operator@sebs:~$</span> <span class="term-cmd">export CASE_ID=INC-2026-0514-WEB</span>
<span class="term-prompt">operator@sebs:~$</span> <span class="term-cmd">grep -E "in-scope|out-of-scope" ./scope/$CASE_ID.md</span>
<span class="term-output">in-scope: app.example.com (443) — read-only traffic, test users T1–T3</span>
<span class="term-output">out-of-scope: api.*, internal admin VPN, customer PII export</span>
<span class="term-prompt">operator@sebs:~$</span> <span class="term-cmd">test -f ./scope/$CASE_ID-RoE-signed.pdf && echo ROE_OK || echo ROE_MISSING</span>
<span class="term-output">ROE_OK</span>
<span class="term-prompt">operator@sebs:~$</span> <span class="term-cmd">printf "%s %s\\n" "$(date -Iseconds)" "pre-check completed for $CASE_ID" >> ./evidence/$CASE_ID/timeline.txt</span>
<span class="term-comment"># date -Iseconds: GNU date; macOS’ta yoksa: date "+%Y-%m-%dT%H:%M:%S%z"</span>""")}
<h2>Yetkili çalışma: yazılı izin, kapsam ve “saldırganın gördüğü yüzey”</h2>
<p>Yetkili çalışma, “teknik olarak yapılabiliyor” değil, “yazılı olarak yapılmasına izin veriliyor” demektir. Bu ayrımın pratikte kaybolmasının en sık nedeni acele ve “tek satırlık” anlık mesaj onayıdır. Oysa denetim ve hukuk açısından önemli olan, <em>kimin</em> hangi rolde onay verdiği, onayın hangi sürüm belgeye bağlandığı ve hangi tarih aralığında geçerli olduğudur. Kapsam belgesi yalnızca URL listesi değildir: <strong>ortam</strong> (test/staging/üretim), <strong>veri türleri</strong> (anonim, üretim benzeri sentetik, üretim PII), <strong>yöntem sınıfları</strong> (salt okuma, belirli trafik üretimi, kod incelemesi, yapılandırma diff’i), <strong>raporlama kanalı</strong> ve <strong>durma koşulları</strong> açık yazılmalıdır.</p>
<p>Kapsam yazımında sık yapılan hata, yalnızca ana alan adını yazıp <strong>API alt alanlarını</strong>, <strong>CDN kökenlerini</strong> veya <strong>yedek yönetim portallarını</strong> unutmaktır. Saldırgan bu boşlukları “belirsizlik” olarak okur; savunmacı ise aynı boşluğu “yanlışlıkla yetkisiz temas” riski olarak okur. İyi uygulama: her ortam için ayrı satır, her satır için veri sınıfı ve test hesapları, her test hesabı için yaşam süresi ve silme prosedürü.</p>
<p>Raporlama tarafında kapsam ihlali şüphesi çıktığında, savunmacının elinde olması gerekenler: onay e-postası veya imzalı PDF sürümü, kullanılan komut/araç listesi, trafik yoğunluğu grafikleri ve durdurma (kill-switch) kaydıdır. Bu paket yöneticiye “ne oldu?”yu teknik değil <em>operasyonel</em> dilde anlatır.</p>
<p>Saldırganın perspektifiyle düşünün: belirsiz kapsam sizin için “ne yapmama gerektiği” belirsizliği değil, aynı zamanda <strong>yanlışlıkla kritik veriye temas</strong> veya <strong>hizmet kesintisi</strong> riskidir. Örneğin yoğunluk sınırı düşünülmeden tekrarlanan istekler, WAF veya uygulama katmanında yan etki doğurabilir; log hacmi patlayınca SOC tarafında alarm yorgunluğu oluşur ve gerçek olay gözden kaçabilir. Savunmacı dilde bu, “ölçüsüz doğrulama = operasyonel zarar”dır.</p>
<p>İyi bir kapsam metni aynı zamanda <strong>negatif liste</strong> içerir: “kesinlikle yapılmayacaklar” (ör. müşteri verisinin dışa aktarımı, üretimde veri değiştirme, üçüncü taraf sistemlere dokunma, sosyal mühendislik). Negatif liste, ekip içi tartışmada “ama küçük bir denemeydi” refleksini keser ve saldırganın istismar edebileceği gri alanı daraltır.</p>
{table(["Unsur", "Savunmacı soru", "Tehdit perspektifi (eğitim)"], [
    ["DNS kapsamı", "api.example.com kapsamda mı?", "Alt alan genişletme ile yüzey büyütme"],
    ["Kimlik bilgisi", "Hangi hesaplarla test edilecek?", "Ele geçirilmiş hesapla lateral hareket"],
    ["Veri", "Üretim PII loglanacak mı?", "Veri toplama ve sızdırma"],
    ["Yoğunluk", "Dakikada kaç istek üst sınırı?", "DoS yan etkisi veya log taşması"],
])}
{risk_card(img_block("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=90", "Risk kontrolü", "Stop condition ve kill-switch: saldırganın hızından önce kendi operasyonunuzu frenleyin.") + '''
<div class="risk-meter"><span class="risk-meter-label">Operasyonel risk (kavramsal)</span><div class="risk-meter-track"><span class="risk-meter-fill"></span></div></div>''')}
<h2>RoE (Rules of Engagement) ve Do Not Harm</h2>
<p>RoE; <strong>kim</strong>, <strong>ne zaman</strong>, <strong>hangi yöntem</strong>, <strong>hangi veri</strong>, <strong>ne zaman durulacak</strong> ve <strong>kim bilgilendirilecek</strong> sorularının tek sayfada toplanmış halidir. RoE’yi “imza atılan PDF” olarak değil, <em>operasyon sırasında açılan runbook</em> gibi düşünün: her adımda “bu adım RoE ile uyumlu mu?” sorusu sorulur. Web uygulamasında “zararsız” görünen otomasyon bile (ör. sürekli oturum açma denemesi) başka bir güvenlik kontrolünü tetikleyerek zincir başlatabilir.</p>
<p>Do Not Harm yalnızca etik bir slogan değil; ölçülebilir limitlerle bağlanmalıdır: örneğin belirli sürede maksimum istek sayısı, belirli uçlarda yalnızca okuma, belirli veri alanlarının loga hiç düşmemesi gibi. Bu limitler ihlal edildiğinde “devam” varsayımı yoktur; durdurma ve geri alma önceliklidir.</p>
{terminal("limits-and-stop.sh — limit ve durma kaydı (kurgusal)", """<span class="term-prompt">operator@sebs:~$</span> <span class="term-cmd">cat ./scope/limits.txt</span>
<span class="term-output">max_rps=5</span>
<span class="term-output">burst_window_sec=60</span>
<span class="term-output">stop_if: p95_latency&gt;800ms OR error_rate&gt;2% OR support_tickets&gt;0</span>
<span class="term-prompt">operator@sebs:~$</span> <span class="term-cmd">grep STOP ./evidence/timeline.txt | tail -n 3</span>
<span class="term-output">2026-05-14T11:02:10+03:00 STOP reason=p95_latency threshold</span>
<span class="term-output">2026-05-14T11:02:11+03:00 notified=app-owner,secops-channel</span>
<span class="term-comment"># Amaç: “durduk” değil, “neden durduk”un da izi kalsın.</span>""")}
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
<p>Üç katmanlı disiplin: <strong>toplama</strong> (hangi alan asla alınmaz), <strong>depolama</strong> (şifreleme, süre, erişim listesi), <strong>paylaşım</strong> (raporda blur/redact ve “ham dosya yok” kuralı). SOC veya hukuk ekibiyle paylaşımda “içerde güvenli” varsayımı yerine, her kopyanın kimde kaldığını manifeste yazmak profesyonel standarttır.</p>
{info_box("Maskeleme ile hash birlikte kullanılır", [
    "Maskeleme okuyucuya içeriği anlatır; hash ise dosyanın sonradan değiştirilmediğini iddia eder.",
    "Ham kanıt yalnızca kısıtlı kasada tutulur; raporda yalnızca redakte sürüm ve hash listesi paylaşılır.",
])}
{terminal("redact-pipeline.sh — örnek maskeleme akışı (kurgusal)", """<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">grep -Eo 'Bearer [A-Za-z0-9._-]+' access.log | head -n 1</span>
<span class="term-output">Bearer eyJhbGciOiJI... (kesildi)</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">sed 's/Bearer [A-Za-z0-9._-]*/Bearer &lt;REDACTED&gt;/g' access.log &gt; access-redacted.log</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">wc -l access.log access-redacted.log</span>
<span class="term-output">  1204 access.log</span>
<span class="term-output">  1204 access-redacted.log</span>
<span class="term-comment"># Satır sayısı aynı kalır; içerik güvenli hale gelir.</span>""")}
<div class="linux-terminal"><div class="term-header"><span class="term-dot red"></span><span class="term-dot yellow"></span><span class="term-dot green"></span><span class="term-title">evidence-pack.sh — kavramsal kanıt paketi</span></div><div class="term-body"><span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">date -Iseconds</span>
<span class="term-output">2026-05-14T10:15:00+03:00</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">sha256sum access-redacted.log</span>
<span class="term-output">(örnek hash)  access-redacted.log</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">printf "dosya | hash | zaman | maskeleme-notu\\n" &gt;&gt; manifest.txt</span>
<span class="term-comment"># Amaç: zincirleme değil; denetlenebilir paket</span></div></div>
<h2>Kanıt bütünlüğü ve rapor omurgası</h2>
<p>Kanıt ile yorum ayrılmalıdır. Yorum, “bence şu oldu”; kanıt ise “şu log satırı şunu gösteriyor”dur. Saldırganın operasyonunda sık görülen <strong>kanıt silme veya manipülasyon</strong> riski, savunmada <strong>hash + manifest + erişim kaydı</strong> ile azaltılır.</p>
<p>İyi bir kanıt paketi bir hikâye anlatır: <em>ne zaman</em> hangi ortamda hangi araçla hangi gözlem yapıldı, hangi dosyalar üretildi, kim erişti. Dış denetçi veya mahkeme süreci düşünülmeden bile bu disiplin, ekip içi “bir hafta sonra ne yapmıştık?” tartışmasını keser.</p>
{info_box("Manifest satırı örneği (kurgusal)", [
    "Dosya adı | SHA-256 | toplanma zamanı (UTC) | maskeleme notu | saklama konumu",
    "Her satır, kanıt zincirinde bir düğümdür; silinen veya değiştirilen satır tüm paketi zayıflatır.",
])}
{terminal("manifest-append.sh — zincire satır ekleme (kurgusal)", """<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">printf '%s | %s | %s | %s\\n' \\"access-redacted.log\\" \\"$(sha256sum access-redacted.log | awk '{print $1}')\\" \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\" \\"Bearer satırları maske\\" &gt;&gt; MANIFEST.txt</span>
<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">tail -n 2 MANIFEST.txt</span>
<span class="term-output">access-redacted.log | a3f2…c91 | 2026-05-14T08:12:01Z | Bearer satırları maske</span>
<span class="term-comment"># Gerçek ortamda erişim kaydı (kim okudu) ayrı sistemde tutulur.</span>""")}
{process_flow([("fa-search", "Bulgu"), ("fa-exclamation-triangle", "Etki"), ("fa-lightbulb", "Öneri"), ("fa-file-shield", "Kanıt")])}
<p><strong>Bulgu</strong> gözlemi tarif eder. <strong>Etki</strong> iş sürekliliği, düzenleyici yük, müşteri güveni ve teknik blast radius ile ölçülür. <strong>Öneri</strong> uygulanabilir ve doğrulanabilir olmalıdır (kapanış kriteri yazılır). <strong>Kanıt</strong> bağımsız okuyucunun inceleyebileceği ham veya yarı işlenmiş çıktıdır.</p>
<p>Rapor omurgasında “öneri” bölümü en çok tartışılan yerdir: çünkü maliyet burada görünür. Bu yüzden her öneriye <strong>sahip rol</strong>, <strong>öncelik</strong> (P0–P3), <strong>tahmini süre</strong> ve <strong>doğrulama adımı</strong> (ör. “staging’de tekrar test”, “WAF kuralı X devre dışı mı kontrol”) eklemek hem yönetici özeti hem teknik ek için değerlidir.</p>
{key_concepts_grid([
    ("fa-link", "Korelasyon kimliği", "İstek kimliği uçtan uca taşınırsa bulgu ile kanıt aynı hikâyede birleşir."),
    ("fa-user-shield", "Erişim kaydı", "Kanıt dosyasına kim dokundu, ne zaman indirildi; iç sızıntıda bile iz sürülebilir."),
    ("fa-scale-balanced", "Tarafsız dil", "Kesin suçlama yerine gözlem + hipotez + çürütme denemesi profesyonel raporu güçlendirir."),
])}
<h2>Yasal kullanım ve sorumluluk reddi</h2>
<p>Bu eğitimdeki metinler, tablolar, terminal örnekleri ve senaryolar; güvenli sınama, kod incelemesi, mimari/tehdit analizi ve SOC müdahalesi için <strong>mesleki yeterlilik</strong> kazanmanız amacıyla sunulur. Teknik ayrıntı ve örnekler ders ihtiyacına göre verilebilir; tehdit tarafı <strong>amaç–yüzey–sinyal</strong> çizgisinde tutulur ve savunma entegrasyonuyla birlikte okunur.</p>
<p>İçeriği yalnızca <strong>yazılı yetki</strong> kapsamındaki sistemlerde ve <strong>geçerli hukuka</strong> uygun şekilde kullanmak tamamen sizin sorumluluğunuzdadır. Yetkisiz erişim, veriye izinsiz müdahale veya üçüncü taraflara zarar verecek kullanım yasaktır.</p>
<p><strong>SEBS Academy / SEBS Global</strong> ve bu materyalin hazırlayıcıları; içeriğin nasıl kullanıldığından, bundan doğabilecek doğrudan veya dolaylı zararlardan veya üçüncü kişi iddialarından <strong>sorumlu tutulamaz</strong>. Bu eğitimi kullanarak bu koşulları kabul etmiş sayılırsınız.</p>
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
M1 = f"""<h1>MODÜL 1 — Giriş, mimari ve saldırı yüzeyi <small>(müfredat 1 · 5)</small></h1>
{img_block("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=90", "Sunucu odası ve ağ", "İstek yolu: tarayıcı → uç noktalar → iş mantığı → veri ve yan hizmetler.")}
<h2>Web uygulama güvenliğine giriş: kavramları ve katmanları ayırmak</h2>
<p>Günlük dilde “internet”, “web” ve “tarayıcı” sıkça birbirinin yerine kullanılır. Güvenlik analizinde bu ayrım kritiktir; çünkü her biri farklı saldırı yüzeyi ve farklı kontrol beklentisi taşır. <strong>İnternet</strong>, IP tabanlı protokoller üzerinden birbirine bağlı cihaz ve ağların oluşturduğu küresel iletişim altyapısıdır. <strong>Web</strong>, bu altyapının üzerinde çoğunlukla HTTP/HTTPS ile çalışan içerik ve uygulama dağıtım modelidir. <strong>Tarayıcı</strong>, HTML, CSS ve JavaScript’i yürüten; cookie, depolama ve güvenlik politikalarını uygulayan istemci yazılımıdır. <strong>Sunucu</strong>, gelen HTTP isteklerini karşılayan katmandır. <strong>Uygulama</strong> ise iş mantığının çalıştığı, veri tabanı ve servislerle konuşan, kararları üreten bileşendir. Bir zafiyet ağ katmanında değil, tarayıcı yorumlamasında veya uygulama mantığında olabilir; kök nedeni doğru katmanda aramak hem doğru savunmayı hem de geliştirici ekiple net iletişimi sağlar.</p>
<p><strong>Web sitesi</strong> ile <strong>web uygulaması</strong> da aynı kefeye konmamalıdır: klasik site çoğunlukla statik veya az etkileşimli içerik sunar; <strong>web uygulaması</strong> ise oturum, işlem, durum değişimi ve veri tabanıyla konuşan dinamik sistemdir. Risk yalnızca “ölçek” değil <em>tür</em> olarak değişir: statik sitede yüzey çoğunlukla barındırma, içerik bütünlüğü ve üçüncü taraf script’lerle sınırlı kalırken; uygulamada her form alanı, parametre, endpoint, dosya yükleme ve arama kutusu ayrı bir giriş noktasıdır. Kimlik doğrulama, yetkilendirme, sorgu üretimi, dosya işleme ve iş kurallarının her biri ayrı hata kaynağı olabilir. “Sadece bilgi gösteriyoruz” iddiası; iletişim formu, yorum alanı, arama, admin paneli veya üçüncü taraf embed varsa yeniden değerlendirilmelidir.</p>
<p><strong>API</strong>, uygulamaların veya istemcinin sunucuyla yapılandırılmış biçimde konuştuğu arayüzdür; <strong>servis</strong> belirli bir işi yapan ve genelde API üzerinden erişilen bileşendir. Modern mimaride arayüz arka planda REST/GraphQL çağrıları yapar; çağrılar iç servislere veya dış sağlayıcılara yayılır. Bu zincirin her halkası ayrı güven sınırıdır: ekranda görünmeyen bir iç endpoint bazen daha az test edilmiş veya gevşek yetkili kalabilir. Analist yalnızca görünen düğmelere değil, ağ sekmesindeki istek–yanıt akışlarına da bakar.</p>
<p>Bir isteğin yolculuğu günlük bakışta “kullanıcı butona bastı” ile biter; güvenlik bakışında ise en az şu roller birlikte düşünülür: <strong>kullanıcı</strong> (niyet iyi veya kötü olabilir), <strong>istemci</strong> (saldırgan için tamamen kontrol edilebilir alan), <strong>sunucu</strong> (doğrulama ve yetki kararının çoğu burada verilmelidir), <strong>veri tabanı</strong> (kalıcı durum ve çoğu saldırının hedefi), <strong>üçüncü taraf servisler</strong> (ödeme, e-posta, kimlik, analitik) yeni çıkış ve güven sınırı taşır. <strong>Gizlilik, bütünlük ve erişilebilirlik</strong> (CIA) web bağlamında somutlaşır: hangi yanıt hangi veriyi sızdırır, hangi işlem başka bir kullanıcının verisini değiştirir, hangi hata veya yoğunluk hizmeti keser? “<strong>Kullanıcıdan gelen her veri güvenilmezdir</strong>” ilkesi, istemci tarafı doğrulamanın UX için kullanılabileceğini ama <em>güvenlik kararının sunucuda tekrarlanması gerektiğini</em> hatırlatır.</p>
<p>Aynı teknik olaya <strong>saldırgan</strong>, <strong>meşru kullanıcı</strong>, <strong>geliştirici</strong> ve <strong>güvenlik analisti</strong> farklı açılardan bakar: saldırgan zayıf kontrol ve tutarsızlık arar; kullanıcı güvenilirlik ve hız bekler; geliştirici iş teslimi ve regresyon riskini tartar; analist kanıt, kapsam ve öncelik üretir. Bu modül ve devamı, bu bakışları birbirine bağlayarak “neden bu kadar çok yerden temas var?” sorusuna mimari ve insan davranışı zemininde yanıt verir.</p>
{table(["Terim", "Kısa anlam (web güvenliği)"], [
    ["Saldırı yüzeyi", "Saldırganın dokunabildiği uçlar, parametreler ve yan entegrasyonlar"],
    ["Güven sınırı (trust boundary)", "Güvenilen ve güvenilmeyen bileşenler arasındaki çizgi"],
    ["Zafiyet", "Sömürülebilir güvenlik açığı; genelde tasarım/kod veya eksik kontrol"],
    ["Yanlış yapılandırma", "Güvenli varsayılanların gevşetilmesi; kod hatası olmadan risk"],
    ["Tasarım / iş mantığı hatası", "Kod “çalışıyor” olsa bile güvenlik özelliği eksik veya yanlış"],
])}
{info_box("Yanlış bilinen", [
    "“Sitemiz sadece tanıtım, güvenlik yok.” — Form, arama, yorum, script veya admin varsa yüzey genişler; değerlendirme sadeleştirilmez.",
    "“Tek katman savunma yeter.” — WAF, TLS veya CDN tek başına uygulama mantığı veya yetki hatasını çözmez; katmanlar birbirini tamamlar.",
])}
<p><strong>Yetkili güvenlik testi</strong> ile izinsiz müdahale arasındaki çizgi; yazılı kapsam, ortam ayrımı (test/staging/production), veri minimizasyonu ve zarar vermeme ilkesiyle çizilir. Bu çerçeve MODÜL 0’da ayrıntılandırılır; burada zihinsel olarak “her teknik adım önce yetki ve kapsam” sorusuna bağlanır.</p>
<p>Web uygulamasını yalnızca “ön yüz–arka yüz–veritabanı” üçgeni olarak okumak, saldırganın gördüğü gerçek yüzeyi gizler. Saldırgan (eğitim perspektifi) çoğu zaman <strong>uç noktaları</strong> (login, şifre sıfırlama, dosya yükleme, arama, dışa aktarma, webhook), <strong>kimlik/oturum mekanizmasını</strong>, <strong>API sözleşmesini</strong> ve <strong>sunucunun güvendiği yan hizmetleri</strong> (ödeme, e-posta, depolama, mesaj kuyruğu) birlikte değerlendirir. Savunmacı mimari okuma; bu bileşenlerin her birinde “kim doğruluyor, kim yetkilendiriyor, nerede loglanıyor?” sorularını zorunlu kılar.</p>
<p>Dağıtık mimaride aynı “ürün” birden fazla çalışma biriminden oluşur: <strong>mikro servisler</strong>, <strong>BFF (backend for frontend)</strong>, ayrı <strong>kimlik sağlayıcı</strong> katmanı, <strong>mesaj kuyruğu</strong> ve <strong>zamanlanmış işler</strong>. Her parça farklı dil çerçevesi ve farklı log şeması taşıyabilir; bu da SOC için “tek zaman çizelgesi” kurmayı zorlaştırır. Mimari okumanın operasyonel karşılığı, olay anında hangi ekibin hangi panoyu açacağını ve hangi <code>trace_id</code> alanının uçtan uca taşındığını önceden bilmektir.</p>
<p>Dönüşüm (legacy + yeni stack) dönemlerinde saldırgan sıkça ana ürün kadar gözden geçirilmemiş <strong>yedek yönetim arayüzleri</strong>, eski API sürümleri veya “sadece iç ağa” bırakılmış ama DNS’ten erişilebilen uçları hedefler. Bu yüzden envanter yalnızca ana alan adıyla bitmemeli; DNS bölgesindeki tüm kayıtlar, CDN kökenleri ve üçüncü taraf <strong>embed</strong> (ödeme çerçevesi, destek widget’ı, analitik) aynı tehdit modeli dosyasında yer almalıdır.</p>
{lo("Modül hedefleri", [
    "Web, internet, tarayıcı, sunucu ve uygulama kavramlarını saldırı yüzeyi açısından birbirinden ayırabilirim.",
    "Web sitesi ile web uygulamasını risk türü üzerinden ayırt edebilirim.",
    "Web uygulama güvenliğini ağ, yazılım ve veri güvenliği kapsamlarıyla ilişkilendirip doğru çerçevede konumlandırabilirim.",
    "CIA ilkelerini somut uç ve işlem davranışlarıyla eşleştirebilirim.",
    "İstemci, API ağ geçidi, uygulama sunucusu, veri katmanı ve entegrasyonları tek şemada konumlandırabilirim.",
    "Trust boundary noktalarını ve saldırganın güven sınırını aşma stratejilerini (eğitim düzeyinde) tarif edebilirim.",
    "Saldırı yüzeyini işlev + veri + kimlik üçlüsüyle envanterleyebilirim.",
    "Ön uç gizlemenin yetki olmadığını saldırgan davranışıyla gerekçelendirebilirim.",
])}
{key_concepts_grid([
    ("fa-layer-group", "İstek yolu haritası", "Her istek CDN → WAF → LB → uygulama → veri hattında iz bırakır; saldırgan hangi katmanda ‘filtre’ hangi katmanda ‘gerçek’ gördüğünü test eder."),
    ("fa-shield-halved", "Trust boundary", "Güven sınırı her entegrasyon noktasında yeniden çizilir: webhook, ödeme, e-posta ayrı ayrı tehdit yüzeyidir."),
    ("fa-chart-network", "Blast radius", "Bir uçtaki hata veya zafiyet kaç kullanıcıyı, hangi veri sınıfını ve hangi yan sistemi etkiler? Önceliklendirme buna göre yapılır."),
    ("fa-eye", "Görünürlük", "Log yoksa ‘saldırı yok’ değil ‘göremiyoruz’dur; mimari okuma hangi olayın hangi logda doğması gerektiğini listeler."),
])}
{info_box("Saldırganın mimari okuması (eğitim)", [
    "Ön uçta gizli menü veya minify edilmiş JS içindeki uç listesi ‘harita’ olarak kullanılabilir; savunma buna rağmen sunucuda yetki zorlar.",
    "Staging’de açık olan debug veya gevşek rate limit üretimde kapalı olsa bile, kod yolu aynıysa bulgu ‘koşullu risk’ olarak raporlanır.",
])}
<h2>İstek yaşam döngüsü: saldırganın ilk baktığı yer</h2>
<p>Tarayıcı veya mobil istemci HTTP(S) üzerinden kaynak ister; ara katmanlar (CDN, WAF, load balancer, API gateway) trafiği şekillendirir. Uygulama sunucusu iş kurallarını çalıştırır; veritabanı ve önbellek durumu saklar; mesajlaşma ve dosya sistemleri yan etkiler üretir. Saldırgan için her ara katman hem <strong>engel</strong> hem <strong>yeni sinyal kaynağı</strong>dır (ör. önbellekten eski içerik, WAF’tan blok sayfası, yük dengeleyiciden farklı backend sürümü).</p>
{table(["Katman", "Saldırganın ilgisi (eğitim)", "Savunmacı soru"], [
    ["CDN/edge", "Önbellek ihlali, başlık manipülasyonu", "Önbellek anahtarı ve invalidation politikası"],
    ["WAF", "İmza kaçırma, anormal parametre", "Alarmın uygulama loguyla korelasyonu"],
    ["Uygulama", "İş mantığı atlama, yetki hatası", "Her uçta sunucu tarafı yetki"],
    ["Veri", "Aşırı okuma/yazma", "Minimum ayrıcalık DB hesabı"],
])}
<p>İstek yaşam döngüsünü öğrenirken yalnızca “istek gitti geldi” demek yetmez: aynı istek farklı katmanlarda <strong>yeniden yazılabilir</strong> (redirect, path rewrite, header ekleme). Bu yüzden bir bulguyu raporlarken “tarayıcıda gördüğüm” ile “uygulama sunucusunun logladığı” arasında fark varsa, bu farkın kaynağı (CDN kuralı, WAF normalizasyonu, charset dönüşümü) açıklanmalıdır. Aksi halde geliştirici ekibi yanlış katmanda düzeltmeye çalışır ve gerileme (regression) riski artar.</p>
<p>SOC perspektifinden yaşam döngüsü; <strong>zaman damgası</strong>, <strong>istek kimliği</strong> ve <strong>kaynak IP</strong> üçlüsünün her katmanda tutarlı mı olduğu sorusudur. Üçlü kopuk olduğunda olay hikâyesi parçalanır: WAF “blok” derken uygulama “200” loglarsa ya da API geçidinde görünen path uygulama logunda farklı yazılıyorsa korelasyon matrisini güncellemek gerekir. Bu modülün ilerleyen bölümlerinde HTTP başlıkları ve kimlik oturumu bu yüzden detaylandırılır.</p>
{terminal("trace-headers.sh — gerçek çalışan örnek (example.com)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sI https://example.com/ | grep -iE '^(HTTP|server|content-type):'</span>
<span class="term-output">HTTP/2 200</span>
<span class="term-output">content-type: text/html</span>
<span class="term-output">server: cloudflare</span>
<span class="term-comment"># x-request-id burada yok; kendi uygulamanızda varsa aynı komutla yakalayın.</span>""")}
{terminal("trace-headers.sh — kendi uygulamanız (app.example.com örnek)", """<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">curl -sI https://app.example.com/health | grep -iE '^(HTTP|x-request-id|x-cache|server|via):'</span>
<span class="term-output">HTTP/2 200</span>
<span class="term-output">x-request-id: 7c4b9e2a-1f0a-4d2c-9e11-aa11bb22cc33</span>
<span class="term-output">x-cache: Miss from cloudfront</span>
<span class="term-output">server: envoy</span>
<span class="term-comment"># İkinci blok kurgusaldır; birincisi kendi terminalinizde doğrulanabilir.</span>""")}
<p>Mikro ön uç (micro-frontend) ve ağır üçüncü taraf script kullanımında güven sınırı tarayıcıda <strong>parçalanır</strong>: bir alt uygulama güncellenirken diğeri eski bir kütüphanede kalabilir; bu da “sürüm tek mi?” sorusunu üretimde sürekli gündemde tutar. Mimari diyagrama bu script’leri “güvenilmeyen ama zorunlu” kutular olarak eklemek, CSP ve alt kaynak bütünlüğü tartışmalarını erken başlatır.</p>
<h2>Korunacak varlıklar ve tehdit hedefleri</h2>
<p>Aynı ekranda görünen iki alan güvenlik açısından aynı değildir: “profil fotoğrafı” ile “yönetici rol ataması” farklı CIA etkileri taşır. Saldırgan çoğu zaman düşük dirençli bir varlıktan yüksek değerli varlığa <strong>yatay</strong> veya <strong>dikey</strong> hareket etmeye çalışır (ör. sıradan kullanıcı hesabından yönetim işlevine). Bu nedenle varlık envanteri sadece veri tabloları değil; <strong>işlevler</strong> ve <strong>entegrasyon sırlarıdır</strong>.</p>
<p>Veri sınıflandırması (halka açık / iç / gizli / çok gizli gibi kurumsal etiketler) doğrudan <strong>log saklama süresi</strong>, <strong>şifreleme zorunluluğu</strong> ve <strong>olay müdahalesi bildirimi</strong> eşiklerine bağlanır. Aynı HTTP 200 yanıtı, bir uçta anonim sayfa sayılırken diğerinde kişisel sağlık verisi taşıyabilir; mimari okuma bu ayrımı uç bazında yazılı hale getirir.</p>
<p>“Taç mücevher” (crown jewel) ifadesi yalnızca veritabanı sunucusu değildir: yönetici oturumu açabilen servis hesapları, imza anahtarları, ödeme API anahtarları ve müşteri destek araçlarındaki <strong>kimliğe bürünme</strong> yetkileri de aynı kategoridedir. Tehdit modelinde bu varlıklar için ayrı “kayıp olursa” senaryosu yazılmadan risk skoru eksik kalır.</p>
{risk_card(img_block("https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&q=90", "Güvenlik analizi", "Varlık sınıflandırması: veri, kimlik, işlem, yapılandırma ve sırlar ayrı ayrı korunur.") + '<div class="risk-meter"><span class="risk-meter-label">Blast radius (kavramsal)</span><div class="risk-meter-track"><span class="risk-meter-fill" style="width:55%"></span></div></div>')}
<h2>Trust boundary ve “istemci güvenilmezdir”</h2>
<p>Güven sınırı, güvenilen bileşenle güvenilmeyen bileşen arasındaki çizgidir. Tarayıcı ve kullanıcı girdisi güvenilmez taraftadır; sunucu tarafı doğrulama güvenilen tarafa geçişte zorunludur. Saldırgan tarayıcıda JavaScript’i değiştirir, isteği yeniden yazar, gizli API anahtarını arar, yerel depolamayı okur. Bu yüzden “gizli endpoint” veya “minified JS içinde saklı anahtar” uzun vadede <strong>güvenlik kontrolü değildir</strong>.</p>
<p>Mobil istemcilerde güven sınırı bir adım daha karmaşıktır: uygulama paketi reverse edilebilir, jailbreak/root cihazda bellek okunabilir, sertifika sabitleme (pinning) atlanmaya çalışılabilir. Bu nedenle “mobil uygulama kapalı kutudur” varsayımı yerine, sunucunun her istekte <strong>aynı yetki mantığını</strong> web ve mobil için uyguladığı doğrulanır.</p>
<p>Tedarik zinciri tarafında güven sınırı <strong>npm/PyPI/Maven</strong> gibi kaynaklara taşınır: tek bir bağımlılık güncellemesi binlerce istemciye yeni kod taşır. Mimari diyagrama “build pipeline” ve “artifact imzası” eklenmeden yapılan tehdit modeli, dağıtım katmanındaki gerçek riski göremez.</p>
{process_flow([("fa-user-secret", "Saldırgan: istemciyi kontrol eder"), ("fa-network-wired", "İstek üretir"), ("fa-server", "Sunucu: doğrular ve yetkilendirir"), ("fa-database", "Veri: en son sınır")])}
<h2>Saldırı yüzeyi envanteri (örnek çerçeve)</h2>
{table(["Yüzey öğesi", "Örnek uç/işlev", "Tehdit sorusu", "Savunma sorusu"], [
    ["Kimlik", "/login, /oauth/callback", "Oturum ele geçirme?", "MFA, hız sınırı, anomali?"],
    ["Dosya", "/upload, /export", "Kötü içerik?", "İçerik doğrulama, tip ayrımı?"],
    ["Yönetim", "/admin/*", "Yetkisiz işlev?", "Ayrı kimlik + RBAC + denetim logu?"],
    ["Webhook", "/hooks/*", "Sahte olay?", "İmza, zaman damgası, yeniden oynatma?"],
])}
<p>Tabloyu kendi sisteminize uyarlayın: her satır için “bu uç <strong>anonim</strong> mi, yoksa kimlik zorunlu mu?” ve “başarılı yanıtta hangi veri sınıfları dönüyor?” sorularını yan yana yazın. Çoğu olayda kök neden bilinmeyen bir uç değil; <em>katalogda var ama risk skoru düşük tutulmuş</em> veya <em>geçici olarak açılmış</em> bir uçtur.</p>
<h2>Log ve yetki: “saldırgan sessiz kalır mı?”</h2>
<p>Kusursuz saldırı yoktur; fakat log görünürlüğü zayıfsa sessizlik yanlış negatif üretir. Mimari okumada her kritik işlem için en az bir kayıt hedefi seçilir: kimlik sağlayıcı, uygulama, API geçidi, veritabanı denetimi (mümkünse). Saldırganın sık yaptığı “düşük gürültülü” yöntemler (ör. yavaş parola denemesi, küçük adımlarla ID artırımı) yalnızca yüksek çözünürlüklü loglama ve korelasyonla görünür hale gelir.</p>
<p>Log tasarımında sık görülen ikinci hata, yalnızca “başarılı işlem” kaydetmektir. Yetkisiz erişim denemeleri (401/403), MFA reddi, WAF blokları ve <strong>yavaş</strong> yanıtlar aynı hikâyenin parçasıdır; biri düşük örnekleme ile atılırsa zincir kopar. İstek kimliğinin WAF’tan uygulama sunucusuna taşınmaması, üretimde en sık rastlanan korelasyon kırığıdır ve mimari okumada açıkça “TODO” olarak işaretlenmelidir.</p>
<p>Son olarak: log alanları da girdi kabul eder (kullanıcı adı, User-Agent, referer). Bu alanlar uygulama tarafından yeniden işleniyorsa <strong>log enjeksiyonu</strong> ve SIEM’de yanlış korelasyon riski doğar; bu yüzden log pipeline’ında normalizasyon ve uzunluk sınırı mimari karar olarak yazılır.</p>
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

# --- MOD 1B (müfredat 2) ---
M1B = f"""<h1>MODÜL 1B — Web teknolojileri temeli <small>(müfredat 2)</small></h1>
{img_block("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=90", "Küre ve ağ", "DNS, TLS ve istek yolu: analistin ‘haritayı’ çizdiği katmanlar.")}
<p>Bu bölüm, güvenlik analizi yapmadan önce <strong>teknik zemini</strong> aynı dilde konuşmak içindir: alan adı çözümlemesi, TLS oturumu, ters vekil ve uygulama sunucusu, statik varlıklar ve çalışma zamanı (runtime) davranışı. Amaç RFC ezberi değil; bir bulgu raporunda “sorun DNS katmanında mı, edge’de mi, uygulama mantığında mı?” ayrımını savunulabilir yazabilmektir.</p>
<p><strong>DNS</strong> kayıtları (A/AAAA, CNAME, MX, TXT) saldırı yüzeyini genişletir veya daraltır: unutulmuş alt alan adı, yanlış delegasyon veya dışarı açılmış “geçici” kayıt, keşif ve takeover sınıfı riskleri doğurur. <strong>TLS</strong> el sıkışması sertifika zinciri ve sunucu adı (SNI) ile bağlanır; analist sertifika geçerliliği, yenileme süreci ve ara katmanda sonlandırma (termination) noktasını bilir.</p>
<p>Tarayıcı tarafında <strong>document</strong>, <strong>same-origin</strong>, <strong>JavaScript çalışma zamanı</strong> ve <strong>depolama</strong> (cookie, localStorage, IndexedDB) ayrı ayrı güvenlik politikalarına tabidir. Sunucu tarafında ise <strong>reverse proxy</strong>, <strong>uygulama sunucusu</strong> ve <strong>iş süreçleri</strong> (kuyruk, zamanlanmış iş) aynı isteğin farklı aşamalarında farklı log üretir.</p>
{lo("Modül hedefleri", [
    "DNS ve TLS’yi saldırı yüzeyi ve kanıt bağlamında tarif edebilirim.",
    "Edge / origin ayrımını güvenlik analizinde kullanabilirim.",
    "Tarayıcı depolama ve same-origin kavramlarını tehdit modeline bağlayabilirim.",
])}
{key_concepts_grid([
    ("fa-globe", "DNS = yönlendirme", "Kayıtlar yanlış veya unutulmuşsa trafik beklenmeyen uca gider; envanter DNS bölgesiyle başlar."),
    ("fa-lock", "TLS = taşıma", "Gizlilik ve bütünlük sağlar; uygulama yetkisinin yerine geçmez."),
    ("fa-server", "Origin", "Şema + host + port birlikte düşünülür; alt alan ayrı köken olabilir."),
    ("fa-network-wired", "Proxy zinciri", "İstemci → CDN → WAF → LB → uygulama: her atlama farklı başlık ve log üretir."),
])}
{table(["Kavram", "Analist için pratik soru"], [
    ["CNAME/A", "Bu kayıt gerçekten hangi IP’ye ve hangi ekibe ait?"],
    ["SNI / sertifika", "İstemci doğru sanal host ile mi konuşuyor?"],
    ["Cache", "Bu yanıt edge’de mi yoksa origin’de mi üretildi?"],
    ["WebSocket / SSE", "Kalıcı kanalda kimlik ve yetki nasıl taşınıyor?"],
])}
{info_box("Mini örnek (kurgusal)", [
    "app.example.com bir CDN arkasında; api.example.com doğrudan kaynak sunucuya gider. İkinci uç WAF görmeyebilir — aynı kurum içinde bile farklı tehdit modeli yazılır.",
])}
""" + quiz(
    [
        {"q": "Aynı şirkette app.* ve api.* farklı köken sayılır mı?", "choices": ["Hayır, her zaman aynı", "Evet; şema/host/port farkı same-origin’i değiştirir", "Sadece mobilde", "Sadece GET", "Sadece DNS yoksa"], "correct": "B", "reason": "Köken ayrımı tarayıcı güvenlik modelinin temelidir."},
        {"q": "TLS hangi riski tek başına çözmez?", "choices": ["Dinleme", "Uygulama düzeyi yetki hatası", "MITM (doğru kurulumda)", "Sertifika doğrulama ihtiyacı", "Taşıma bütünlüğü"], "correct": "B", "reason": "Kimlik ve yetki uygulama mantığında kalır."},
        {"q": "DNS envanterinin güvenlikteki birincil faydası nedir?", "choices": ["Tema seçmek", "Unutulmuş veya yanlış yönlendirilmiş yüzeyleri görmek", "CPU soğutmak", "JPEG", "Font"], "correct": "B", "reason": "Görünmeyen uçlar sık test edilmez."},
        {"q": "Reverse proxy’nin tipik rolü nedir?", "choices": ["Veritabanı", "TLS sonlandırma, yönlendirme ve rate limit gibi edge politikaları", "Sadece CSS", "Sadece DNS", "Sadece SMTP"], "correct": "B", "reason": "İstemci ile uygulama arasında politika uygular."},
    ]
)

# --- MOD 1C (müfredat 3) ---
M1C = f"""<h1>MODÜL 1C — OWASP, standartlar ve risk dili <small>(müfredat 3)</small></h1>
{img_block("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=90", "Güvenlik dokümantasyonu", "OWASP Top 10 bir harita; ASVS ve CWE ise kontrol listesi ve sınıflandırma dili.")}
<p><strong>OWASP Top 10</strong> en sık görülen risk kategorilerinin özet haritasıdır; “tek başına uyumluluk listesi” değildir. Kurumsal projelerde sıkça <strong>ASVS</strong> (uygulama doğrulama standardı) ile birlikte kullanılır: ASVS seviye 1/2/3, kontrollerin olgunluk ve kapsamını müzakere etmek için dil sağlar.</p>
<p><strong>CVE</strong> belirli bir ürün ve sürümdeki kamuya açık kimliklendirilmiş hatadır; <strong>CWE</strong> ise zafiyet <em>sınıfını</em> tarif eder. <strong>CVSS</strong> şiddet skorudur; önceliklendirme için faydalıdır fakat iş etkisi, veri hassasiyeti ve exposure ile birlikte okunmalıdır. Raporlarda “CVSS yüksek” tek başına yönetici kararı verdirmez.</p>
<p><strong>Bulgu</strong> (finding) tekrar üretilebilir, etkisi anlaşılmış ve kapsam içi kanıta dayanır; <strong>gözlem</strong> (observation) henüz doğrulanmamış ilginç sinyaldir. <strong>Kök neden</strong> (root cause) düzeltmenin nereye yapılacağını belirler. Bu ayrımlar SOC ↔ AppSec ↔ geliştirici arasında yanlış beklentiyi azaltır.</p>
{lo("Modül hedefleri", [
    "OWASP Top 10 ve ASVS’yi birbirinden ayırt edip doğru kullanım alanı söyleyebilirim.",
    "CVE, CWE ve CVSS’yi rapor ve öncelik dilinde konumlandırabilirim.",
    "Bulgu / gözlem / kök neden ayrımını raporda uygulayabilirim.",
])}
{table(["Kimlik", "Ne işe yarar?", "Dikkat"], [
    ["OWASP Top 10", "Sık risk sınıfları haritası", "Ürüne özel tehdit modelinin yerine geçmez"],
    ["ASVS", "Kontrol seviyeleri", "Seviye seçimi risk iştahıyla hizalanmalı"],
    ["CWE-XX", "Zafiyet sınıfı", "Aynı CWE birden çok kök nedene inebilir"],
    ["CVE-YYYY-NNNN", "Ürün/sürüm hatası", "Sürüm envanteri olmadan anlamı eksik kalır"],
    ["CVSS v3.x", "Şiddet skoru", "Bağlam olmadan öncelik tek başına olmamalı"],
])}
{key_concepts_grid([
    ("fa-map", "Tehdit modeli çıktısı", "Varlık, güven sınırı, kontrol önceliği ve varsayılan saldırgan: dokümantasyonun kalbidir."),
    ("fa-bug", "False positive", "Araç veya kural gürültüsü; bağlam ve tekrar üretilebilirlik ile süzülür."),
    ("fa-eye-slash", "False negative", "Gerçek tehdit görünmedi; görünürlük ve test kapsamı sorgulanır."),
    ("fa-scale-balanced", "Risk iletişimi", "Teknik etki + iş etkisi + exposure; CVSS tek başına yetmez."),
])}
{info_box("Bug bounty / açık bildirimi (kısa)", [
    "Program kapsamı (scope) ve güvenli liman (safe harbor) metnini okumadan test yoktur.",
    "Duplicate / informative / valid sonuçları program politikasına göre değişir; duygusal değil yazılı kurala bakın.",
])}
""" + quiz(
    [
        {"q": "ASVS ile OWASP Top 10 arasındaki tipik fark nedir?", "choices": ["Aynı belgedir", "ASVS doğrulanabilir kontrol seviyeleri sunar; Top 10 özet risk haritasıdır", "Top 10 yalnızca mobil içindir", "ASVS yalnızca ağ içindir", "İkisi de CVE üretir"], "correct": "B", "reason": "Biri derin kontrol listesi, diğeri özet sınıflandırma."},
        {"q": "CVE hangi bilgiyi taşır?", "choices": ["Sadece CWE sınıfı", "Belirli ürün/sürümdeki kamuya açık kimlikli zafiyet", "Sadece CVSS", "Sadece log satırı", "Sadece tema"], "correct": "B", "reason": "Sürüm ve ürün bağlantılıdır."},
        {"q": "CVSS yüksek ama exposure düşükse öncelik nasıl tartışılır?", "choices": ["Her zaman P0", "İş etkisi ve exposure ile birlikte müzakere edilir", "Yok sayılır", "Sadece DNS ile", "Sadece favicon ile"], "correct": "B", "reason": "Bağlamsal risk skorlaması gerekir."},
        {"q": "Henüz doğrulanmamış ilginç sinyal raporda ne olarak adlandırılır?", "choices": ["Kapatıldı", "Gözlem (observation)", "CVE", "CWE", "Retest"], "correct": "B", "reason": "Doğrulanınca bulguya dönüşebilir."},
    ]
)

# --- MOD 2 ---
M2 = f"""<h1>MODÜL 2 — HTTP, HTTPS ve tarayıcı güvenlik modeli <small>(müfredat 4)</small></h1>
{img_block("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&q=90", "Ağ ve güvenlik", "HTTP katmanı: saldırganın en çok oynadığı oyun tahtası; savunmacının en çok log ürettiği katman.")}
<p>HTTP’yi “sadece taşıma” sanmak yanılgıdır. Oturum çerezleri, yönlendirmeler, önbellek başlıkları, içerik müzakere satırları ve CORS yanıtları birlikte <strong>güvenlik politikası</strong> oluşturur. Saldırgan (eğitim düzeyinde) çoğu zaman oturumu çalmaya, tarayıcıyı kandırarak işlem yaptırmaya veya sunucuyu yanlış yorumlamaya zorlayan istek dizileri kurar; savunmacı ise bu dizileri logda <strong>özgün imza</strong> olarak arar.</p>
<p>HTTP/2 ve HTTP/3 ile çoklu istek tek bağlantıda birleşir; bu da “hangi yanıt hangi isteğe ait?” sorusunu ara katmanlarda karmaşıklaştırır. Yönlendirme zincirleri (301/302) ve <strong>Host</strong> başlığı tutarsızlıkları bazen önbellek zehirlenmesi veya yanlış sanal host bağlama gibi ikinci derece risklere yol açar. Bu modülde amaç protokol RFC’si ezberletmek değil; her başlığın ve durum kodunun <em>güvenlik kararı</em> veya <em>kanıt</em> olarak nasıl okunacağını oturtmaktır.</p>
<p>Sıkıştırma (gzip, brotli) ve chunked aktarım günlük işlevdir; fakat saldırgan bazen aşırı büyük gövde veya sınırda durum kodlarıyla <strong>parser farklılıkları</strong> arar (HTTP smuggling ailesi). Savunmacı için pratik ders: edge ile origin’in aynı HTTP çerçevesini nasıl yorumladığını sürüm ve yama seviyesiyle birlikte envanterleyin.</p>
{lo("Modül hedefleri", [
    "HTTP yöntem ve durum kodlarını güvenlik açısından yorumlayabilirim.",
    "Çerez bayrakları ve Same-origin/CORS etkileşimini tehdit modeline bağlayabilirim.",
    "TLS’nin sınırlarını (ne korur / ne korumaz) netleştirebilirim.",
    "İstek/yanıt kesitini kanıt olarak maskeleyebilirim.",
])}
{key_concepts_grid([
    ("fa-lock", "Taşıma ≠ uygulama güvenliği", "TLS trafiği şifreler; fakat yetkisiz veri erişimini veya CSRF’yi çözmez. Her katmanın rolü ayrı anlatılır."),
    ("fa-cookie-bite", "Çerez politikası", "HttpOnly, Secure, SameSite birlikte düşünülür; biri eksikse saldırgan diğer yüzeyden devam eder."),
    ("fa-shield-virus", "CSP ve HSTS", "CSP enjeksiyon sonrası etkiyi kısar; HSTS downgrade riskini azaltır. İkisi de ‘yanlış pozitif’ üretmeden sıkılaştırılmalıdır."),
    ("fa-file-export", "Kanıt kesiti", "URL’deki token, Authorization başlığı ve gövde PII’si maske; korelasyon id’si korunur."),
])}
<h2>İstek ve yanıt: saldırganın oynadığı alan</h2>
<p>Method (GET/POST/PUT/PATCH/DELETE) sunucunun beklediği yan etkiyi çerçeveler. GET ile durum değiştirmek hem CSRF yüzeyini büyütür hem de önbellek/proxy katmanlarında beklenmedik sonuçlar doğurur. Durum kodları: 401/403 yetki ve kimlik ayrımı için; 429 hız sınırlama için; 5xx yapılandırma veya dayanıklılık sorunları için sinyal taşır. Saldırgan çoğu zaman <strong>anormallikleri</strong> (çok uzun parametre, beklenmeyen Content-Type, sıra dışı Accept başlığı) keşif veya kaçınma için kullanır.</p>
<p>Pratikte bir olay müdahalesinde analist, önce <strong>istek metodunun iş kuralıyla uyumunu</strong> kontrol eder: “Bu GET gerçekten okuma mı?” sorusu basit ama sık atlanır. Ardından durum kodunun dağılımı: kısa sürede çok sayıda 401 ve ardından 200 kümesi kimlik saldırısı veya oturum düzeltmesi hikayesi olabilir. 429 patlaması ise ya gerçekten kötüye kullanım ya da kötü ayarlanmış rate limit politikasıdır—ikisini ayırmak için baseline şarttır.</p>
<p>Tarayıcı başlıkları (Accept-Language, User-Agent, Client Hints) tek başına güvenlik kontrolü değildir; fakat <strong>anomali</strong> üretirler: aynı oturumda saniyeler içinde onlarca farklı User-Agent görülmüyorsa, otomasyon veya oturum paylaşımı hipotezleri gündeme gelir. Bu bölümün amacı “başlık ezberi” değil, hangi başlığın hangi güvenlik kararına <em>destek kanıtı</em> olabileceğini öğretmektir.</p>
{table(["Başlık sınıfı", "Örnek", "Tehdit okuması (eğitim)", "Savunma notu"], [
    ["Kimlik", "Authorization, Cookie", "Oturum taşıma, token sızıntısı", "Kısa ömür, bağlama, yenileme politikası"],
    ["Önbellek", "Cache-Control", "Önbellek zehirleme / eski içerik", "Hassas yanıtta no-store"],
    ["Güvenlik", "CSP, HSTS", "Enjeksiyon sonrası etki kısıtı", "Politika modları ve raporlama"],
    ["İçerik", "Content-Type", "Tip karmaşası", "Sunucuda tip doğrulama"],
])}
{terminal("http-method-audit.txt — yan etkisiz yöntem disiplini (kurgusal)", """<span class="term-prompt">analist@sebs:~$</span> <span class="term-cmd">grep -E ' (GET|POST|PUT|PATCH|DELETE) ' access.log | awk '{print $6}' | sort | uniq -c | sort -nr | head</span>
<span class="term-output">  84210 GET</span>
<span class="term-output">  12004 POST</span>
<span class="term-output">    118 PUT</span>
<span class="term-output">     12 DELETE</span>
<span class="term-comment"># Durum değiştiren uçlarda GET oranı beklenmedikse CSRF/önbellek riski tartışılır.</span>""")}
<p>Üretimde erişim loglarını yalnızca “web sunucusu dosyası” olarak değil, <strong>davranış sinyali</strong> kaynağı olarak okuyun: aynı oturum çereziyle art arda farklı Content-Type denemeleri, beklenmeyen Accept başlığı veya API kökünde HTML dönmesi gibi tutarsızlıklar bazen yanlış yönlendirme veya versiyon kaymasından, bazen de kötüye kullanımdan kaynaklanır. Bu yüzden log satırına uygulama <code>trace_id</code> veya <code>route</code> adı eklemek mimari karardır.</p>
<h2>Çerez, oturum ve token: çalınan şey genelde budur</h2>
<p>Oturum çerezi veya taşıyıcı token, saldırgan için “şifre bilmeden kullanıcı olmak” değerindedir. HttpOnly, XSS sonrası belirtecin JavaScript ile okunmasını zorlaştırır; Secure taşıma sırasında sızıntı riskini azaltır; SameSite, siteler arası isteklerde çerezin yanlışlıkla taşınmasını kısıtlar. Savunmacı ayrıca <strong>oturum bağlama</strong> (cihaz, IP çeşitliliği, Coğrafya tutarlılığı) ve <strong>yenileme belirteci</strong> rotasyonunu değerlendirir.</p>
<p>Bearer token’ı URL sorgu parametresinde taşımak, tarayıcı geçmişi, referrer başlığı ve sunucu erişim loglarında <strong>kalıcı sızıntı</strong> üretir; bu anti-pattern hâlâ eski entegrasyonlarda görülür. Refresh token çalındığında etki alanı geniştir; bu yüzden refresh token’ın ömrü, bağlama (cihaz kaydı) ve iptal listesi (revocation) ayrı tasarlanır. “Çıkış yap” düğmesi yalnızca istemci depolamasını temizlememeli; sunucu tarafında oturum ve yenileme belirteçlerinin geçersiz kılınması gerekir.</p>
{risk_card('<p class="section-mini-heading">Saldırgan hedefleri (eğitim)</p><ul><li>Oturum belirteci ele geçirme</li><li>Kullanıcıyı durum değiştiren isteğe zorlama (CSRF bağlamı)</li><li>Başlık enjeksiyonu ile ara katmanı şaşırtma</li></ul>')}
<h2>HTTPS / TLS: koruduğu ve koruymadığı</h2>
<p>TLS taşıma sırasında gizlilik ve bütünlük sağlar; fakat uygulama düzeyinde “kullanıcı A’nın verisini kullanıcı B görüyor” hatasını çözmez. Saldırgan TLS içindeki trafiği kendi cihazında üretebilir; bu nedenle uçtan uca güven, uygulama mantığında kurulur.</p>
<p>Kurumsal ortamlarda TLS sonlandırma (termination) sıklıkla yük dengeleyicide yapılır; bu noktada “iç ağ TLS’siz” kabulü varsa iç yanalın <strong>segmentasyonu ve bütünlük</strong> (mTLS, IP allowlist, imzalı iç token) ayrı tartışılır. Sertifika süresi ve otomatik yenileme (ACME) süreçleri unutulduğunda kesinti ve aceleci geçici self-signed çözümler üretim riski doğurur.</p>
<h2>Same-origin ve CORS: yanlış yapılandırmanın maliyeti</h2>
<p>Tarayıcı, farklı kökenler arasında veri okumayı varsayılan olarak kısıtlar. CORS gevşetildiğinde (ör. geniş joker veya yansıtılan köken), tarayıcı saldırganın sayfasından hedef siteye “izinli” okuma/yazma kanalı açılmış olabilir. Savunmacı, preflight ve izin verilen köken listesini <strong>uç bazında</strong> inceler.</p>
<p><code>Access-Control-Allow-Credentials: true</code> kullanıldığında joker köken (<code>*</code>) ile birlikte kullanılamaz; fakat açıkça listelenen çok sayıda köken yine de geniş yüzey demektir. Mobil WebView ve masaüstü “yerel dosya” kökenleri gibi uç durumlar test planına dahil edilmelidir; çünkü üretimde görülen hataların çoğu “mutlu yol” tarayıcısından değil, gömülü istemciden gelir.</p>
{process_flow([("fa-globe", "Köken politikası"), ("fa-random", "Preflight (OPTIONS)"), ("fa-check", "Sunucu izin başlıkları"), ("fa-eye", "Tarayıcı uygular")])}
<h2>Kanıt olarak istek/yanıt kesiti</h2>
<p>Geliştirici araçları veya ters vekil (kurum içi yetkili) ile alınan kesitlerde: URL parametreleri, çerez adları, hata gövdeleri ve PII maskelenir. Kanıtın değeri, yalnızca ekran görüntüsü değil; <strong>zaman damgası + korelasyon kimliği + maskeleme politikası</strong> notudur.</p>
<p>Kanıt zinciri için dosya hash’i (SHA-256), toplayan kişi ve toplama zamanı notu; paylaşım kanalı (şifreli ticket, VDR) ve erişim süresi; mümkünse <strong>salt okunur</strong> log kopyası—hepsi olay raporunun parçasıdır. Slack’e ham Authorization başlığı yapıştırmak, çoğu kurumda hem uyum hem de iç tehdit açısından ihlal sayılır.</p>
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
M3 = f"""<h1>MODÜL 3 — Kimlik doğrulama; oturum ve CSRF <small>(müfredat 6 · 7)</small></h1>
{img_block("https://images.unsplash.com/photo-1633265486064-086b219458ec?w=900&q=90", "Kimlik doğrulama", "Oturum ve kimlik: saldırganın en çok parola denediği; savunmacının en çok log topladığı alan.")}
<p><strong>Kimlik doğrulama</strong> “kimsin?” sorusudur; <strong>yetkilendirme</strong> “ne yapabilirsin?” sorusudur. Oturum güvenliği zayıfsa kimlik doğrulama gücü (uzun parola bile) boşa gider çünkü saldırgan artık sizin yerinize oturumu taşır. Bu modülde saldırganın tipik <strong>hedefleri</strong> ve savunmacının <strong>gözlediği sinyaller</strong> ayrıntılı anlatılır: kimlik bilgisi doldurma (credential stuffing), parola püskürtme (password spraying), oturum çalma, MFA yorgunluğu ve kurtarma akışı suistimali gibi başlıklar; savunma karşılıkları ve kanıt üretimiyle birlikte ele alınır. İçeriği yalnızca yetkili ve yasal çerçevede kullanın; kötüye kullanımdan içerik sağlayıcıları sorumlu tutulamaz.</p>
<p>Parola tabanlı oturumlar giderek <strong>passkey / WebAuthn</strong> ve kurumsal SSO ile desteklenmektedir; fakat geçiş dönemlerinde aynı hesap için birden fazla kimlik kanalı (eski parola + yeni cihaz anahtarı) birlikte yaşar. Bu “hibrit” dönemde saldırgan zayıf kanalı seçer: örneğin passkey aktifken bile açık bırakılmış “yedek OTP SMS” veya eski API anahtarı ile giriş. Savunma tarafında her kanal için ayrı risk skoru ve kapatma prosedürü yazılır.</p>
<p>Destek masası ve “hesabım çalındı” süreçleri teknik olarak kimlik sisteminin parçasıdır: müşteri temsilcisi yanlışlıkla MFA’yı kaldırırsa veya yeni cihaz eklerse saldırgan <strong>insan üzerinden</strong> aynı sonuca ulaşır. Bu yüzden kimlik güvenliği yalnızca geliştirici kodu değil; prosedür, eğitim ve denetim loglarıyla birlikte okunur.</p>
{lo("Modül hedefleri", [
    "Parola, MFA ve oturum yaşam döngüsü risklerini tehdit–savunma çifti olarak açıklayabilirim.",
    "Kimlik loglarını (başarılı/başarısız, MFA, cihaz) yorumlayabilirim.",
    "Şüpheli oturum analizini adım adım ve kanıt bağlı yazabilirim.",
    "Yanlış pozitif/negatif riskini hesap kritikliğiyle tartabilirim.",
])}
{key_concepts_grid([
    ("fa-key", "Oturum = varlık", "Parola güçlü olsa bile oturum çalınırsa saldırgan kullanıcı olur; bu yüzden rotasyon, cihaz sinyali ve step-up birlikte düşünülür."),
    ("fa-user-clock", "Zaman penceresi", "Spraying geniş IP havuzuyla düşük frekansta gelir; kısa pencerede ‘az deneme’ görünür, uzun pencerede desen ortaya çıkar."),
    ("fa-mask", "MFA yorgunluğu", "Çok faktörlü doğrulama kullanıcıyı yorar; saldırgan da aynı yorgunluğu hedefleyebilir. Oran sınırı ve kanal çeşitliliği savunmanın parçasıdır."),
    ("fa-clipboard-list", "Kurtarma akışı", "Şifre sıfırlama ve hesap kurtarma çoğu zaman zayıf halkadır; ayrı threat model ve log izleme ister."),
])}
{info_box("Credential stuffing sinyali (eğitim)", [
    "Çok sayıda hesapta az sayıda başarısız deneme, ardından birkaç hesapta başarılı oturum: sızdırılmış parola listesi hipotezini destekler.",
    "Tek başına IP bloklamak yetersiz kalabilir; botnet veya bulut çıkışları sinyali seyreltilmiş gösterir.",
])}
<h2>Saldırganın kimlik oyunu (eğitim düzeyinde)</h2>
<p>Saldırganın amacı çoğu zaman geçerli oturum elde etmektir. Bunun için (a) sızdırılmış parola listeleriyle toplu deneme, (b) aynı parolayı çok hesapta deneme (spraying), (c) zayıf kurtarma akışları, (d) oturum belirteci çalma, (e) MFA yorgunluğu veya sosyal mühendislikle ikinci faktörü aşma girişimleri gibi stratejiler görülür. Savunma tarafında karşılık: <strong>hız sınırlama + gecikme + kilit politikası dengesi</strong>, <strong>şüpheli oturum risk skoru</strong>, <strong>cihaz kaydı ve yeniden kimlik doğrulama</strong>, <strong>oturum rotasyonu</strong> ve <strong>anomali tabanlı MFA zorlama</strong>.</p>
<p>Oran sınırlama (rate limit) tek başına “her IP’yi blokla” şeklinde kurgulanırsa meşru kullanıcıyı da keser; saldırgan ise bulut çıkışları veya dağıtık botnet ile IP çeşitliliği sağlar. Bu yüzün savunması <strong>hesap bazlı</strong>, <strong>cihaz parmak izi</strong> ve <strong>risk tabanlı gecikme</strong> kombinasyonudur: aynı ASN’den çok hesaba az deneme (spraying) gibi desenler IP bloklamadan önce alarm üretir.</p>
{table(["Sinyal", "Olası tehdit hipotezi (eğitim)", "Savunmacı doğrulama"], [
    ["Kısa sürede çok 401/403", "Kaba kuvvet / spraying", "IP ve hesap korelasyonu, CAPTCHA etkisi"],
    ["Başarısız→başarılı küme", "Doğru parola bulundu", "Coğrafya/cihaz tutarlılığı, MFA sonucu"],
    ["Aynı hesap çok IP", "Paylaşım veya ele geçirme", "Risk tabanlı step-up"],
    ["MFA başarısızlık artışı", "MFA yorgunluğu saldırısı", "Kanal değişimi, rate limit"],
])}
{terminal("auth-timeline.sh — oturum öncesi/sonrası (kurgusal)", """<span class="term-prompt">soc@sebs:~$</span> <span class="term-cmd">grep 'user=ayse' auth.log | tail -n 8</span>
<span class="term-output">fail mfa totp ip=203.0.113.10 ua=MobileSafari</span>
<span class="term-output">fail mfa totp ip=203.0.113.10 ua=MobileSafari</span>
<span class="term-output">success password ip=198.51.100.44 ua=ChromeWin</span>
<span class="term-output">success mfa totp ip=198.51.100.44 ua=ChromeWin</span>
<span class="term-comment"># Aynı hesapta farklı UA/cografi: risk skoru ve step-up tetik gerekçesi.</span>""")}
<h2>Parola, hash ve saldırganın “offline” düşüncesi</h2>
<p>Veritabanı sızdığında saldırgan offline olarak hash kırma oyununa geçer. Savunma: güçlü parola politikası + uygun password hashing + tuz + GPU maliyetini artıran parametreler. Burada kritik nokta: kullanıcı davranışı (tekrarlayan parolalar) saldırganın işini kolaylaştırır; bu yüzden MFA ve sızdırılmış parola taraması (kurum içi) önemlidir.</p>
<p>“Pepper” (uygulama sırrı ile ek karıştırma) ve donanım güvenli modül (HSM) entegrasyonu hash’i çalınırsa bile işi zorlaştırır; fakat yanlış uygulamada pepper’ın kod deposunda düz metin durması ikinci bir sızıntıdır. Parola sıfırlama e-postasındaki tek kullanımlık bağlantıların çok uzun ömürlü olması veya aynı bağlantının birden fazla kullanılabilmesi kurtarma akışında sık görülen zafiyetlerdir.</p>
{risk_card('<p><strong>Oturum belirteci</strong> çalındığında parola bilinmese bile hesap ele geçirilmiş sayılır. Bu nedenle XSS/veri sızıntısı ile oturum güvenliği tek çözüm değildir; derinlemesine savunma gerekir.</p>')}
<h2>Oturum yaşam döngüsü: fixation ve yenileme</h2>
<p>Oturum fixation fikri: saldırganın oturum kimliğini kullanıcıya bağlatma riski (modern çerçevelerde azaltılmış olsa da yapılandırma hatalarıyla geri gelir). Oturum yenileme (rotation): ayrıcalık yükseltme sonrası veya şüphede yeni oturum kimliği üretmek. “Beni hatırla” uzun ömürlü ve riskli bir yüzeydir; cihaz güvenilirliği ve çalıntı senaryosu birlikte düşünülür.</p>
<p>Eşzamanlı oturum politikası (tek cihaz mı, çok cihaz mı) işletme kararıdır; fakat SOC açısından aynı hesaptan iki farklı kıtada eşzamanlı aktif oturum <strong>varsayılan olarak şüpheli</strong> kabul edilip risk skoruna yansıtılmalıdır. Oturum sonlandırma (“logout everywhere”) özelliği yalnızca kullanıcı self-servisi değil, güvenlik olayı müdahalesinde de çalışabilmelidir.</p>
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

# --- MOD 3B (müfredat 8) ---
M3B = f"""<h1>MODÜL 3B — OAuth 2.0, OpenID Connect ve JWT <small>(müfredat 8)</small></h1>
{img_block("https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=90", "Kimlik ve anahtar", "Yetkilendirme sunucusu, istemci ve kaynak sunucu: token’ların yaşam döngüsü.")}
<p><strong>OAuth 2.0</strong> bir <em>yetkilendirme çerçevesi</em>dir: kullanıcı adına üçüncü taraf uygulamanın kaynağa sınırlı erişim almasını modellemek için tasarlanmıştır. <strong>OpenID Connect</strong> ise kimlik katmanını OAuth üzerine ekler; <code>id_token</code> genelde kullanıcı iddiasını taşır, <code>access_token</code> ise kaynak sunucuya gider. Bu ayrım rapor ve log okumada sürekli karıştırılır; analist her tokenın <strong>hedef kitlesini</strong> (audience) ve <strong>doğrulama noktasını</strong> yazar.</p>
<p><strong>Authorization code</strong> akışında PKCE (code verifier/challenge), public istemcilerde yetkilendirme kodunun çalınmasına karşı standart savunmadır. <strong>Implicit</strong> akış modern rehberlerde yeni uygulama için önerilmez; mevcut sistemlerde görülürse risk değerlendirmesi ayrı yapılır.</p>
<p><strong>JWT</strong> üç parçalı ve genelde imzalır; fakat “JWT kullanıyoruz” cümlesi tek başına güvenlik değildir. İmza algoritması (ör. <code>none</code> veya zayıf HMAC sırları), anahtar rotasyonu, <code>exp</code>/<code>nbf</code>, <code>iss</code>/<code>aud</code> doğrulaması ve içeriğin <strong>şifrelenmemiş</strong> olması (yalnızca imzalı/base64) raporlarda açıkça yazılır. Refresh token çalınması yüksek etkilidir; rotasyon ve cihaz bağlama sık kullanılan azaltımlardır.</p>
{lo("Modül hedefleri", [
    "OAuth2 rollerini ve authorization code + PKCE akışını özetleyebilirim.",
    "OIDC’de id_token ile access_token ayrımını savunma kararına bağlayabilirim.",
    "JWT doğrulama checklist’ini (alg, iss, aud, exp, anahtar) listeleyebilirim.",
])}
{key_concepts_grid([
    ("fa-key", "Audience (aud)", "Token kimin API’sine gidecek? Yanlış aud kabulü BOLA ile birleşebilir."),
    ("fa-user-shield", "Consent", "Kullanıcı hangi scope’ları verdi; logda anlaşılır mı?"),
    ("fa-rotate", "Rotasyon", "Refresh ve imza anahtarı rotasyonu olay müdahalesinin parçasıdır."),
    ("fa-link-slash", "Redirect URI", "Open redirect ile birleşince yetkilendirme kodu sızabilir; allowlist şart."),
])}
{table(["Bileşen", "Sık risk (eğitim)", "Savunma notu"], [
    ["redirect_uri", "Wildcard veya gevşek eşleşme", "Tam string allowlist"],
    ["state/nonce", "Eksik veya sabit", "CSRF ve yeniden oynatma için bağlama"],
    ["JWT alg", "none / anahtar karışıklığı", "Allowlist algoritma + jwks uri"],
    ["Refresh", "Uzun ömür, çalınabilirlik", "Rotasyon, cihaz bağlama, iptal"],
])}
{info_box("Rapor dilinde", [
    "“JWT kullanılıyor” yerine “RS256, jwks rotasyonu, aud=…, exp zorunlu, refresh rotasyonlu” gibi doğrulanabilir cümleler yazın.",
])}
""" + quiz(
    [
        {"q": "PKCE öncelikle hangi senaryo için şart görülür?", "choices": ["Sunucudan sunucuya gizli istemci", "Public istemci (mobil/SPA) + authorization code", "Sadece SMTP", "Sadece DNS", "Sadece FTP"], "correct": "B", "reason": "Yetkilendirme kodu çalınmasına karşı koruma sağlar."},
        {"q": "id_token ile access_token OIDC’de tipik fark nedir?", "choices": ["Aynıdır", "id_token kimlik iddiası; access_token kaynak erişimi", "Sadece biri JWT olabilir", "İkisi de yalnızca cookie", "DNS ile ilgilidir"], "correct": "B", "reason": "Farklı hedef ve doğrulama noktaları vardır."},
        {"q": "JWT imza doğrulamasında hangi alanlar sık atlanır?", "choices": ["Font", "iss, aud, exp ve uygun alg/anahtar", "JPEG", "Tema", "Favicon"], "correct": "B", "reason": "Bağlam ve ömür şarttır."},
        {"q": "Refresh token çalınırsa etki genelde neden geniştir?", "choices": ["Çünkü kısadır", "Uzun süreli yeniden erişim sağlayabilir", "Sadece CSS etkiler", "DNS siler", "WAF kapatır"], "correct": "B", "reason": "Rotasyon ve iptal kritik olur."},
    ]
)

# --- MOD 4 ---
M4 = f"""<h1>MODÜL 4 — Yetkilendirme ve erişim kontrolü <small>(müfredat 9)</small></h1>
{img_block("https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&q=90", "Erişim kontrolü", "Yetki: saldırganın ‘başkasının kaydına’ dokunmaya çalıştığı yer; savunmacının her uçta tekrarladığı kontrol.")}
<p>Kimlik doğrulandıktan sonra asıl oyun <strong>yetkilendirme</strong>dedir. Saldırgan (eğitim düzeyinde) sıkça “aynı uç, farklı kimlik” veya “tahmin edilebilir kaynak kimliği” ile yetkisiz nesneye erişmeyi dener. Modern literatürde BOLA/BFLA (Broken Object / Function Level Authorization) bu sınıfın parçasıdır. Savunma: her istek için <strong>kaynak sahipliği</strong> ve <strong>işlev izni</strong> sunucuda yeniden hesaplanır; ön yüzde gizli düğme güvenlik değildir.</p>
<p>Çok kiracılı (multi-tenant) SaaS’ta yatay ayrıcalık yükseltme riski özellikle yüksektir: <code>tenant_id</code> veya organizasyon kimliği tek bir sütunda tutuluyorsa ve sorgu katmanında unutulabiliyorsa, aynı API sözleşmesiyle komşu kiracının verisine geçiş mümkün olabilir. Kod incelemesinde “tenant filtresi her repository metodunda mı?” sorusu tekrarlanır.</p>
<p>Yetki kararları bazen uygulama dışına taşınır: OPA/Rego, IAM politikası veya API geçidi üzerindeki policy. Bu durumda saldırgan iki yüzey görür: uygulama içi kontrol <em>ve</em> politika motoru. İkisi çelişirse genelde daha gevşek olan kazanır; bu yüzden “tek doğru kaynak” hangisi olduğu dokümante edilmelidir.</p>
{lo("Modül hedefleri", [
    "RBAC ile nesne düzeyi yetkiyi ayırabilirim.",
    "IDOR riskini ‘erişim kararı nerede veriliyor?’ sorusuyla okuyabilirim.",
    "Admin ve ayrıcalıklı uçlar için güçlendirilmiş kontrol listesi yazabilirim.",
    "Yetki reddi loglarını SOC senaryolarına bağlayabilirim.",
])}
{key_concepts_grid([
    ("fa-id-card", "Nesne düzeyi", "Her kayıt için ‘bu kullanıcıya ait mi?’ sorusu sunucuda tekrarlanır; UUID yalnızca keşfi zorlaştırır, yetkiyi ikame etmez."),
    ("fa-user-gear", "İşlev düzeyi", "Admin işlevi ayrı rol, ayrı oturum politikası ve ayrı log ile sınırlandırılır."),
    ("fa-ban", "403 deseni", "Art arda 403, ardından başka kaynakta 200: keşif + başarı hikâyesi olarak okunabilir."),
    ("fa-code", "Ön uç şeffaflığı", "SPA ve mobil istemci uçları sızdırır; savunma sunucuda her çağrıda yetki doğrular."),
])}
<h2>Saldırganın bakış açısı: nesne ve işlev</h2>
<p>Saldırgan iki soru sorar: (1) Bu API uç noktası başka kimlikle çağrılabiliyor mu? (2) Bu yönetim işlevi normal kullanıcı oturumuyla tetiklenebiliyor mu? Başarılı yanıt genelde sunucunun <strong>nesne düzeyi kontrolü atlattığı</strong> veya <strong>rol kontrolünün eksik olduğu</strong> anlamına gelir.</p>
{table(["Kontrol türü", "Soru", "Tipik hata"], [
    ["RBAC", "Bu rol bu işlemi yapabilir mi?", "Rol geniş; ayrıntı yok"],
    ["Object-level", "Bu kayıt bu kullanıcıya mı ait?", "ID ile doğrudan erişim"],
    ["Function-level", "Bu admin işlevi kimlerde?", "Arayüz gizli, sunucu açık"],
])}
{terminal("authz-matrix.csv — kaynak × rol (kurgusal)", """<span class="term-prompt">appsec@sebs:~$</span> <span class="term-cmd">column -t -s, authz-matrix.csv | head -n 6</span>
<span class="term-output">resource      role_user  GET  PATCH  DELETE</span>
<span class="term-output">/api/v1/orders  user       yes  own    no</span>
<span class="term-output">/api/v1/orders  admin      yes  any    yes</span>
<span class="term-output">/api/v1/users   user       self no     no</span>
<span class="term-comment"># Tablo kodla uyumsuzsa BOLA/BFLA bulgusu güçlenir; kod incelemesi kanıttır.</span>""")}
<h2>IDOR / nesne düzeyi: neden “sadece bir sayı” tehlikelidir</h2>
<p>Kaynaklar URL veya API gövdesinde sayısal/sıralı kimliklerle temsil edildiğinde, saldırgan başka kimlikleri denemek isteyebilir. Savunma yalnızca “UUID kullan” değildir; asıl mesele <strong>sunucunun her istekte sahiplik doğrulaması</strong> yapmasıdır. UUID, keşfi zorlaştırır ama yetkisiz erişimi imkânsız kılmaz.</p>
<p>İndirekt referans (opaque token) veya sunucu tarafı eşleme tablosu, URL’de iç kimliği hiç göstermeden kaynağı adresler; bu özellikle mobil derin bağlantı ve paylaşılabilir linklerde kullanıcı gizliliğini de artırır. Ticari maliyet: her istekte ek çözümleme veya önbellek karmaşıklığı; güvenlik ile performansın müzakere edilmesi gerekir.</p>
{risk_card('<p><strong>Yönetici paneli</strong> ayrı kimlik doğrulama, ayrı log ve ayrı hız politikası gerektirir. Saldırgan yönetim uçlarını otomasyonla tarar; “/admin” gibi yollar tek başına koruma değildir.</p>')}
<h2>Ön uç gizleme ve “API’nin açık sözlülüğü”</h2>
<p>Modern SPA’lar tarayıcıda çok şey taşır; geliştirici araçları veya JS paketleri içinde uç listeleri görülebilir. Saldırgan bunu “harita” olarak kullanır. Savunma: uçların keşfedilmesi kaçınılmaz kabul edilir; kritik olan sunucunun her uçta yetkiyi zorlamasıdır.</p>
<p>Mobil istemci genelde aynı backend’i daha “ince” bir API yüzeyiyle kullanır; bu yüzden web arayüzünde gizlenmiş bir işlev, mobil pakette açık uç olarak kalabilir. AppSec test planında web + mobil + BFF üçlüsü aynı yetki matrisine bağlanmalıdır.</p>
<h2>Loglama: 403’ün sessiz kahramanlığı</h2>
<p>Yetkisiz erişim denemeleri 403/401 ile döner; bu loglar saldırganın <strong>keşif aşamasını</strong> gösterir. Sadece 200 loglamak, yanlış negatif üretir. Korelasyon: aynı oturumda art arda 403 ve ardından 200 (başka kaynakta) şüpheli bir hikâye olabilir.</p>
<p>SIEM tarafında “403 burst” kuralı tek başına gürültülüdür; fakat <strong>aynı kullanıcı kimliği</strong> ile birleştirildiğinde veya yönetim uçlarına yakın zaman damgalarında görüldüğünde öncelik kazanır. Rapor yazarken 403’leri “başarısız saldırı” diye küçümsemeyin; çoğu zaman bir sonraki başarılı ihlalin provasıdır.</p>
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
M5 = f"""<h1>MODÜL 5 — Input validation, parser güvenliği ve injection <small>(müfredat 10)</small></h1>
{img_block("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=90", "Kod ve veri", "Girdi ve çıktı: saldırganın enjeksiyon ve kaçış oyunu; savunmacının bağlam ve şema disiplini.")}
<p>Saldırganın klasik stratejisi: uygulamanın <strong>veriyi komut olarak yorumlayacağı</strong> bir bağlama veri sokmaktır (SQL, OS komutu, HTML/JS, başlık). Savunma iki bacaktır: <strong>girdi doğrulama</strong> (beklenen şema, uzunluk, tip) ve <strong>çıktı kodlama</strong> (hedef bağlama uygun kaçış). Enjeksiyon ve kaçışın anlaşılması için örnekler ve bağlamlar ders ihtiyacına göre sunulur; saldırganın <em>düşünce modeli</em> (veriyi nerede birleştiriyor, hangi motor yorumluyor) her zaman savunma kararı ve güvenli doğrulama ile birlikte okunur. Yetkisiz sistemlerde deneme yapmak yasaktır; içeriğin kötüye kullanımından SEBS Academy ve materyalin yayıncıları sorumlu tutulamaz.</p>
<p>Unicode normalizasyonu (NFC vs NFD), sağdan-sola karakterler ve “görünüşte aynı” Unicode eş görünümleri (homoglyph) allowlist’leri delmek için kullanılabilir. Bu yüzden “güvenli karakter kümesi” tanımı yalnızca ASCII ile sınırlı değilse, normalizasyon adımının <strong>nerede</strong> uygulandığı (girişte mi, depoda mı, sorguda mı) net yazılmalıdır.</p>
<p>İkinci derece (stored) enjeksiyon senaryolarında veri bir kez kabul edilir, sonra başka bir ekranda veya batch işte tekrar birleştirilir; tek noktada yapılan doğrulama yeterli olmayabilir. Bu nedenle veri yaşam döngüsü boyunca “hangi motor bu string’i tekrar yorumlayacak?” sorusu checklist maddesidir.</p>
{lo("Modül hedefleri", [
    "Allowlist ve denylist yaklaşımlarının sınırlarını tartışabilirim.",
    "HTML/JS/URL/SQL/JSON bağlamlarında kaçış ihtiyacını açıklayabilirim.",
    "Hata mesajı ve log sızıntısı risklerini tespit edebilirim.",
    "Güvenli doğrulama için test verisi ve ortam disiplinini uygulayabilirim.",
])}
{key_concepts_grid([
    ("fa-filter", "Allowlist şema", "JSON Schema veya eşdeğeri: alan adı, tip, uzunluk ve izin verilen değer kümesi açık yazılır."),
    ("fa-code-branch", "Bağlam başına kaçış", "HTML, URL, JS ve SQL farklı kaçış kuralları; tek ‘html_escape’ her yere yetmez."),
    ("fa-bug", "Hata gövdesi", "Üretimde iç yapı sızdırmayan genel mesaj; ayrıntı sadece yetkili log kanalında."),
    ("fa-vial", "Güvenli test verisi", "Gerçek müşteri verisi yerine sentetik ve deterministik örneklerle doğrulama."),
])}
{info_box("Parser ve kodlama çatışması", [
    "Çift kodlama, Unicode normalizasyonu ve farklı charset’ler saldırganın varyasyon üretmesine yardım eder; savunma tek katmanlı denylist yerine motoru ayırır (parametreli sorgu, şablon bağlamı).",
])}
<h2>Enjeksiyon sınıfları: saldırganın “motor” arayışı</h2>
{table(["Sınıf", "Yorumlayan motor (kavramsal)", "Saldırganın amacı (eğitim)", "Savunma omurgası"], [
    ["SQLi", "SQL motoru", "Veri okuma/yazma veya sorgu kontrolü", "Parametreli sorgu + en az yetki"],
    ["XSS", "Tarayıcı HTML/JS", "Oturum/eylem bağlamı", "Bağlam kaçışı + CSP + HttpOnly"],
    ["Header injection", "HTTP katmanı", "Önbellek/ara katman şaşırtma", "Güvenli birleştirme ve doğrulama"],
    ["Deserialization", "Serileştirme kütüphanesi", "RCE yüzeyi", "Güvenli format ve imza"],
])}
<p>Tablodaki her satır için kod incelemesinde “birleştirme noktası” aranır: kullanıcı verisi hangi satırda string birleştirme (<code>+</code>, <code>format</code>, şablon literal) ile SQL/HTML/shell’e gidiyor? Statik analiz ve grep ile tam kapsama zordur; fakat en riskli kalıplar (dinamik SQL, <code>eval</code>, <code>innerHTML</code>, serileştirilmiş blob) önce elenir.</p>
{terminal("validate-request.json — şema ile erken red (kurgusal)", """<span class="term-prompt">dev@sebs:~$</span> <span class="term-cmd">cat validate-request.json</span>
<span class="term-output">{ "orderId": "not-a-uuid", "quantity": -3 }</span>
<span class="term-prompt">dev@sebs:~$</span> <span class="term-cmd">ajv validate -s order.schema.json -d validate-request.json</span>
<span class="term-output">false</span>
<span class="term-output">orderId: must match format \"uuid\"</span>
<span class="term-output">quantity: must be &gt;= 1</span>
<span class="term-comment"># İstemci aynı şemayı UX için kullanır; sunucu yine de tekrar doğrular.</span>""")}
<h2>Input validation: allowlist neden altın standarttır</h2>
<p>Denylist “bilinen kötüleri” engellemeye çalışır; saldırgan varyasyon, kodlama ve parser farklılıklarıyla kaçabilir. Allowlist “beklenen iyi”yi tanımlar: regex yerine çoğu zaman <strong>şema</strong> (JSON Schema gibi) ve <strong>tip</strong> daha güvenilirdir. İstemci doğrulaması yalnızca UX içindir; sunucu aynı kuralları <em>yeniden</em> uygular.</p>
<p>Multipart form ve dosya yükleme ile aynı istekte JSON alanları birleştiğinde, framework’ün “hangi parser önce çalıştı?” sırası kritik hale gelir. İçerik tipi sniffing veya yanlış boundary ayrıştırması bazen <strong>çift gövde</strong> (HTTP request smuggling ile birlikte anlatılan sınıf) risklerini büyütür; bu yüzden dosya meta verisi ile dosya içeriğinin doğrulaması ayrı katmanlarda yapılır.</p>
{risk_card('<p><strong>Hata mesajları</strong> saldırgan için bilgi kaynağıdır: veritabanı sürümü, kolon adı, framework yığını. Üretimde genelleştirilmiş hata ve ayrıntılı log yalnızca yetkili kanallarda tutulmalıdır.</p>')}
<h2>Output encoding ve bağlam kırılması</h2>
<p>Aynı veri HTML içinde güvenli olup JavaScript string içinde güvensiz olabilir. Şablon motorlarında “otomatik kaçış” yanlış bağlamda çalışmayabilir. Savunmacı, şablonların hangi bağlamda üretildiğini kod incelemesinde izler.</p>
<p><code>application/json</code> içinde gömülü HTML, SVG içinde script veya Markdown→HTML dönüşümü gibi <strong>çapraz bağlam</strong> örnekleri tek bir “escape” fonksiyonuyla çözülmez. Rich text editörleri ve e-posta şablonları ayrı threat model başlığıdır çünkü kullanıcı “formatlı metin” sanırken aslında mini DOM üretir.</p>
<h2>Loglara hassas veri yazma</h2>
<p>“Debug için tam gövde” pratiği, saldırgan sızmışsa aynı loglarda kimlik bilgisi bırakır. Log minimizasyonu ve maskeleme alanları (token, Authorization başlığı, parola alanları) standartlaştırılır.</p>
<h2>Güvenli doğrulama (yetkili ortam)</h2>
<p>Doğrulama; üretim verisine dokunmadan, izole ortamda, küçük ve deterministik test verisiyle yapılır. Kanıt: kod değişikliği + test çıktısı + maskelemiş örnek.</p>
<p>Üretimde keşfedilen zafiyet için “hızlı düzeltme” genelde feature flag veya WAF kuralı ile başlar; kalıcı düzeltme ise kod ve şema değişikliğidir. Bu iki adımın raporda ayrı yazılması, yöneticinin “geçici mi kalıcı mı?” sorusuna yanıt verir. Kırmızı takım veya iç pentest bulguları için kapanış doğrulaması bazen <strong>regresyon testi</strong> ve tekrar tarama ile resmileştirilir.</p>
<h2>Tamamlayıcı konular (öğretim envanterı)</h2>
<p>Aşağıdaki başlıklar ders boyunca dağınık geçen veya diğer modüllerde kısaca değinen konuların <strong>tek çatıda</strong> listesidir. Amaç SOC ve AppSec sözlüğünüzü tamamlamak; her biri için derinleşme OWASP ve kurum içi lab rehberinize bağlanır.</p>
{table(["Konu", "Kısa tanım", "Savunma omurgası"], [
    ["XXE", "XML harici varlık ile dosya/SSRF yüzeyi", "XML devre dışı veya sıkı parser; DTD kapalı; dış entity yok"],
    ["LDAP / NoSQL enj.", "Dizin veya belge DB sorgusuna girdi gömülmesi", "Parametreli API, tip şeması, en az yetki"],
    ["OS komut enj.", "Shell’e girdi birleştirme", "Shell çağrısını kaldır; allowlist argv; timeout ve chroot"],
    ["SSTI", "Şablon motoruna kontrolsüz string", "Sandbox’lı motor, ayrı DSL, şablonda kullanıcı verisi yok"],
    ["Prototype pollution", "JS nesne zincirine toplu atama", "Object.freeze, schema validation, freeze third-party"],
    ["Open redirect", "url= parametresi ile kimlik avı", "Sunucu tarafı allowlist; relative URL yasak"],
    ["JWT (alg, anahtar)", "İmza doğrulaması zayıfsa belirteç üretimi", "RS256/EdDSA, jwk rotasyonu, aud/iss/exp zorunlu"],
    ["Cache poisoning", "Başlık ile önbellek anahtarı zehirleme", "Cache key disiplini, Vary, normalizasyon"],
    ["HTTP Smuggling", "İki proxy arasında çerçeve uyumsuzluğu", "Tek tip HTTP parser, WAF-LB hizalaması, güncel patch"],
    ["WebSocket", "Çift yönlü kanalda yetki ve origin", "Origin kontrolü, auth her mesajda veya kısa ömür"],
    ["Race / TOCTOU", "İki istek arasında durum yarışı", "Atomik işlem, idempotency key, veritabanı kilidi"],
])}
{info_box("Lab URL kuralı", [
    "Aşağıdaki tüm komutlarda YOUR-LAB yerine yalnızca size ait veya sınıf ortamında açıkça yetkilendirilmiş adresi yazın.",
    "Üçüncü taraf canlı sitelere kopyala-yapıştır yapmayın; yasal sorumluluk size aittir.",
])}
<h2>Öğretim laboratuvarı — komut paleti</h2>
<p>Bu bölümdeki komutların çoğu, kopyalayıp terminale yapıştırdığınızda <strong>gerçekten çalışacak</strong> şekilde yazılmıştır. İlk blokta herkesin erişebildiği <code>example.com</code> ve herkese açık bir JSON test API’si kullanılır; böylece “komut sahte mi?” sorusunu kendi gözünüzle kapatabilirsiniz. <code>YOUR-LAB</code> yazan satırlar ise yalnızca size atanmış laboratuvar adresiyle anlam kazanır—adresi değiştirmeden çalıştırırsanız bağlantı hatası almanız normaldir ve bu da komutun <em>gerçek ağ isteği</em> yaptığını doğrular.</p>
<p>Uzun anlatımın pratik karşılığı şudur: güvenlik öğrenirken <strong>gözlem → komut → çıktı → yorum</strong> döngüsünü tekrarlamak, sadece paragrafları okumaktan çok daha hızlı kalıcı beceri üretir. Bu yüzden her alt başlıkta hem <em>neden</em> hem <em>nasıl</em> (komut) bir arada tutulur; SOC tarafında ise aynı komutlar log dosyasına uygulanarak alarm taslağına dönüştürülür.</p>
{info_box("Komutların çalışması hakkında", [
    "macOS ve Linux’ta curl, grep, sed, openssl, python3 genelde hazırdır; jq yüklü değilse: brew install jq veya apt install jq.",
    "sqlmap, nuclei, ffuf gibi araçlar ayrı kurulum ister; komut satırı doğrudur ancak araç yoksa ‘command not found’ alırsınız.",
    "Ağa çıkan her istek gerçektir; rate limit ve hedef seçiminde daima yetki ve RoE’ye uyun.",
])}
{terminal("lab-00-dogrulanmis.sh — example.com (anında deneyin)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sI https://example.com/ | sed -n '1,8p'</span>
<span class="term-output">HTTP/2 200</span>
<span class="term-output">content-type: text/html</span>
<span class="term-output">server: cloudflare</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS https://jsonplaceholder.typicode.com/users/1 | jq '{id, name, email}'</span>
<span class="term-output">{{</span>
<span class="term-output">  "id": 1,</span>
<span class="term-output">  "name": "Leanne Graham",</span>
<span class="term-output">  "email": "Sincere@april.biz"</span>
<span class="term-output">}}</span>
<span class="term-comment"># İkinci komut internete çıkar; çıktıdaki isim/e-posta demo veridir (gerçek kişi değildir).</span>""")}
{terminal("lab-01-http.sh — TLS ve başlık (YOUR-LAB veya lab.local)", """<span class="term-prompt">student@lab:~$</span> <span class="term-cmd">curl -sI https://YOUR-LAB/ | sed -n '1,25p'</span>
<span class="term-output">HTTP/2 200</span>
<span class="term-output">strict-transport-security: max-age=31536000</span>
<span class="term-output">content-security-policy: default-src 'self'</span>
<span class="term-prompt">student@lab:~$</span> <span class="term-cmd">echo | openssl s_client -connect YOUR-LAB:443 -servername YOUR-LAB 2&gt;/dev/null | openssl x509 -noout -dates -subject</span>
<span class="term-comment"># openssl s_client: hedef 443 dinlemiyorsa veya DNS çözülmezse hata verir — lab adresini doğrulayın.</span>""")}
{terminal("lab-02-dns.sh — gerçek çözümleme (example.com)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">dig +short A example.com</span>
<span class="term-output">93.184.216.34</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">dig +short AAAA example.com | head -n 3</span>
<span class="term-comment"># Çıktı IP’ler zamanla değişebilir; önemli olan komutun çalışması ve kayıt türlerini görmektir.</span>""")}
{terminal("lab-03-json-api.sh — jq ile alan seçme (çalışan API)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS https://jsonplaceholder.typicode.com/users/1 | jq '{id, name, email}'</span>
<span class="term-output">{{</span>
<span class="term-output">  "id": 1,</span>
<span class="term-output">  "name": "Leanne Graham",</span>
<span class="term-output">  "email": "Sincere@april.biz"</span>
<span class="term-output">}}</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS -o /dev/null -w '%{{http_code}} %{{time_total}}\\n' -X PATCH \\</span>
<span class="term-cmd">  -H 'Content-Type: application/json' -d '{{"name":"hacked"}}' \\</span>
<span class="term-cmd">  https://jsonplaceholder.typicode.com/users/1</span>
<span class="term-output">200 0.12</span>
<span class="term-comment"># Bu API herkese açık demo olduğu için PATCH 200 dönebilir; kendi API’nizde 403 beklenir.</span>""")}
{terminal("lab-04-jwt-decode.sh — header/payload (imza doğrulanmadan)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.x'</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">python3 -c \"import base64,json,sys; p=sys.argv[1].split('.'); pad=lambda s:s+('='*(-len(s)%4)); [print(json.dumps(json.loads(base64.urlsafe_b64decode(pad(p[i]))),indent=2)) for i in range(2)]\" \"$JWT\"</span>
<span class="term-output">{{</span>
<span class="term-output">  "alg": "HS256",</span>
<span class="term-output">  "typ": "JWT"</span>
<span class="term-output">}}</span>
<span class="term-output">{{</span>
<span class="term-output">  "sub": "1234567890"</span>
<span class="term-output">}}</span>
<span class="term-comment"># Üçüncü parça (imza) burada çözülmez; üretimde imza ve aud/iss/exp doğrulaması şarttır.</span>""")}
{terminal("lab-05-log-grep.sh — örnek dosya üret + ara (çalışır)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">printf '%s\\n' '203.0.113.1 - - [14/May/2026:10:00:00 +0000] "GET /search?q=union+select HTTP/1.1" 200 900' \\</span>
<span class="term-cmd">  '203.0.113.2 - - [14/May/2026:10:00:01 +0000] "GET /admin HTTP/1.1" 403 222' &gt; demo-access.log</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">grep -Ei 'union|select|script|\\.\\./' demo-access.log</span>
<span class="term-output">203.0.113.1 - - [14/May/2026:10:00:00 +0000] "GET /search?q=union+select HTTP/1.1" 200 900</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">grep ' 403 ' demo-access.log | wc -l</span>
<span class="term-output">1</span>
<span class="term-comment"># Gerçek Nginx/Apache log formatı farklı olabilir; awk ile $status alanına göre filtre kurun.</span>""")}
<h2>Öğretim: SQL / XSS örüntüleri (yalnızca lab)</h2>
<p>Literatürde ve kalibrasyonlu lab uygulamalarında (DVWA, WebGoat, Juice Shop vb.) aşağıdaki <strong>örüntüler</strong> ayrıştırma ve WAF ayarı öğretmek için kullanılır. Bunları gerçek hedefe uygulamak yetki gerektirir.</p>
{table(["Örüntü (öğretim)", "Ne öğretir?", "Savunmacı karşılık"], [
    ["Tek tırnak ve parantez dengesi", "SQL motoruna yapı sızması", "Parametreli sorgu; hata mesajını kapat"],
    ["OR 1=1 ve türevleri", "Mantık ifadesi ile doğrulama atlama (lab)", "Boolean tabanlı yetki; parametre bağlama"],
    ["UNION … (labde kontrollü kolon sayısı)", "Kolon sayısı keşfi", "Girdi uzunluğu ve tip; view ile minimum kolon"],
    ["<script>alert(1)</script> (lab PoC)", "Reflected XSS doğrulama", "CSP + encode + HttpOnly"],
    ["<img src=x onerror=alert(1)>", "Olay işleyici XSS", "DOM sanitization, DOMPurify politikası"],
    ["javascript: URL (açılış)", "Open redirect zinciri", "Allowlist scheme+host"],
])}
{terminal("lab-06-curl-param.sh — URL parametresi (example.com)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sG 'https://example.com/' --data-urlencode \"q=test'\" | head -c 200 | tr '\\n' ' '</span>
<span class="term-output">... HTML gövdesi (parametre genelde sunucu tarafından yansıtılmaz; lab uygulamanızda yansıma aranır) ...</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS -o /dev/null -w 'http_code=%{{http_code}} redirect=%{{url_effective}}\\n' -L 'https://example.com/'</span>
<span class="term-output">http_code=200 redirect=https://example.com/</span>
<span class="term-comment"># Yansıtma testi için DVWA/Juice Shop gibi bilerek zafiyetli lab şart; example.com eğitim değildir.</span>""")}
{terminal("lab-07-sqlmap.sh — kurulum ve dry-run (YOUR-LAB)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">sqlmap --version</span>
<span class="term-output">1.8.x (örnek)</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">sqlmap -u 'https://YOUR-LAB/vuln.php?id=1' --batch --risk=1 --level=1 --flush-session</span>
<span class="term-output">[INFO] testing connection to the target URL</span>
<span class="term-comment"># sqlmap yüklü değilse önce pip veya paket yöneticisi ile kurun; hedef yalnızca RoE yazılı lab.</span>""")}
{terminal("lab-08-path-probe.sh — curl ile yol denemesi (kurulum gerektirmez)", """<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS -o /dev/null -w 'root %{{http_code}}\\n' https://example.com/</span>
<span class="term-output">root 200</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS -o /dev/null -w 'robots %{{http_code}}\\n' https://example.com/robots.txt</span>
<span class="term-output">robots 404</span>
<span class="term-prompt">you@lab:~$</span> <span class="term-cmd">curl -sS -o /dev/null -w 'missing %{{http_code}}\\n' https://example.com/this-path-should-not-exist-12345</span>
<span class="term-output">missing 404</span>
<span class="term-comment"># ffuf daha hızlıdır; bu üç satır araç yokken aynı fikri öğretir. YOUR-LAB ile değiştirerek labda çalıştırın.</span>""")}
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

# --- MOD 5B (müfredat 16) ---
M5B = f"""<h1>MODÜL 5B — Veri koruma ve hassas veri sızıntısı <small>(müfredat 16)</small></h1>
{img_block("https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&q=90", "Veri güvenliği", "Sınıflandırma, minimizasyon ve taşıma: aynı HTTP 200 farklı hassasiyet taşıyabilir.")}
<p>Bu bölüm MODÜL 5’teki doğrulama ve kodlama disiplinini <strong>veri yaşam döngüsü</strong>ne taşır: toplama, işleme, saklama, aktarma ve silme. Regülasyon isimleri değişse de ortak soru şudur: “Bu veri gerçekten gerekli mi, nerede duruyor, kim görebiliyor, loga düşüyor mu?”</p>
<p><strong>Veri sınıflandırması</strong> (halka açık / iç / gizli / kişisel veri vb.) saklama süresi, şifreleme zorunluluğu, maskeleme ve olay bildirimi eşiklerine bağlanır. Aynı endpoint bir müşteri için anonim sayfa iken başka bir müşteri için sağlık veya finans verisi taşıyabilir; güvenlik kontrolü uç bazında yazılmalıdır.</p>
<p><strong>Maruziyet</strong> sıklıkla “hack” değil <em>fazla alan</em>, önbellek, yedek, hata ayıklama ekranı veya yanlış ACL ile oluşur. API yanıtında gereksiz kolon, GraphQL’de derin ağaç, mobil önbellek ve CDN yanlış yapılandırması aynı kök nedene bağlanabilir: <strong>veri minimizasyonu eksikliği</strong>.</p>
{lo("Modül hedefleri", [
    "Veri sınıflandırmasını kontrol ve saklama politikasına bağlayabilirim.",
    "PII ve sırların log, önbellek ve yedekte sızma yollarını listeleyebilirim.",
    "Şifreleme (at rest / in transit) ve anahtar yönetimini tehdit modelinde konumlandırabilirim.",
])}
{key_concepts_grid([
    ("fa-eye-slash", "Minimizasyon", "Toplanmayan veri sızmaz; alan ve süre azaltımı birincil kontroldür."),
    ("fa-database", "At rest", "Disk/backup şifreleme ve KMS ile anahtar ayrımı; erişim audit’i."),
    ("fa-shield-halved", "In transit", "TLS ve iç segmentasyon; fakat uçta yetki hatasını çözmez."),
    ("fa-eraser", "Silme / unutulma", "Kopyalar (replica, log, analitik) silinmeden talep tamamlanmış sayılmaz."),
])}
{table(["Sızıntı yüzeyi", "Tipik kök neden", "Kanıt"], [
    ["Log / SIEM", "Ham Authorization, gövde", "Maskeleme politikası, örnek satır"],
    ["Önbellek", "Hassas yanıtta no-store eksik", "Başlık diff, CDN kuralı"],
    ["Hata ekranı", "Stack + nesne dökümü", "Ekran görüntüsü + genel mesaj karşılaştırması"],
    ["Yedek", "Şifresiz snapshot", "Yedekleme politikası ve erişim matrisi"],
])}
{info_box("DLP ve iç tehdit (kısa)", [
    "Veri kaybı önleme (DLP) kanalları e-posta, web upload ve çıkış trafiğini izler; yanlış alarm yönetimi olmadan ekip yorgunluğu üretir.",
    "İç tehdit senaryolarında en sık görülen vektör: aşırı yetki + veri dışa aktarma uçları + zayıf denetim.",
])}
""" + quiz(
    [
        {"q": "Veri minimizasyonunun birincil faydası nedir?", "choices": ["Daha çok log", "Maruziyet yüzeyini ve uyum yükünü azaltmak", "Daha zayıf TLS", "Daha fazla favicon", "Daha uzun JWT"], "correct": "B", "reason": "Olmayan veri sızmaz ve taşınmaz."},
        {"q": "Hassas veri için üretim hata mesajında ne tercih edilir?", "choices": ["Tam stack trace", "Genel mesaj + ayrıntı yalnız yetkili logda", "Ham SQL", "Tüm tablo dökümü", "Oturum çerezi"], "correct": "B", "reason": "İç yapı ve PII sızıntısı önlenir."},
        {"q": "API’de gereksiz kolon dönüşü hangi bulgu sınıfına yakındır?", "choices": ["Sadece DNS", "Aşırı veri maruziyeti / minimizasyon ihlali", "Sadece tema", "Sadece CPU", "Sadece font"], "correct": "B", "reason": "DTO ve alan seçme ile giderilir."},
        {"q": "At-rest şifreleme tek başına neyi çözmez?", "choices": ["Disk hırsızlığı riskini azaltmayı", "Uygulama düzeyinde yetkisiz okumayı", "Yedek medya kaybını", "Fiziksel erişim", "Depolama şifreleme ihtiyacını"], "correct": "B", "reason": "Uygulama yetkisi ve sorgu kontrolü ayrıdır."},
    ]
)


def main() -> None:
    html = (
        sec("wag-m0-etik", True, M0)
        + sec("wag-m1-mimari", False, M1)
        + sec("wag-m1b-teknoloji", False, M1B)
        + sec("wag-m1c-owasp", False, M1C)
        + sec("wag-m2-http", False, M2)
        + sec("wag-m3-auth", False, M3)
        + sec("wag-m3b-oauth-jwt", False, M3B)
        + sec("wag-m4-authz", False, M4)
        + sec("wag-m5-veri", False, M5)
        + sec("wag-m5b-veri-koruma", False, M5B)
    )
    OUT0.write_text(html, encoding="utf-8")
    print("Wrote", OUT0, "chars", len(html))


if __name__ == "__main__":
    main()
