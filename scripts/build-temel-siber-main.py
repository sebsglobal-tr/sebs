#!/usr/bin/env python3
"""Replace <main> in temel-siber-guvenlik.html with clean educator-grade content."""
from pathlib import Path
import re
from temel_siber_education_content import CIA_GIZ, CIA_BUT, CIA_ERI, P, NAR, CH, H3

def lo(items):
    return '<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu bölümde hedeflenen kazanımlar</h3><ul>' + ''.join(f'<li>{i}</li>' for i in items) + '</ul></div>'

def recap(sid, summary, bullets):
    return f'<div class="edu-lesson-recap"><h3 id="{sid}"><i class="fas fa-check-double"></i> Bu bölümde neler öğrendik?</h3><p>{summary}</p><ul>' + ''.join(f'<li>{b}</li>' for b in bullets) + '</ul></div>'

def callout(kind, title, body):
    icon = {'info': 'fa-info-circle', 'warning': 'fa-exclamation-triangle', 'tip': 'fa-lightbulb'}.get(kind, 'fa-info-circle')
    return f'<div class="callout-box {kind}"><div class="callout-icon"><i class="fas {icon}"></i></div><div class="callout-body"><h5>{title}</h5><p>{body}</p></div></div>'

def ex(title, html):
    return f'<div class="example-box"><p><strong>{title}</strong></p>{html}</div>'

def tbl(headers, rows):
    th = ''.join(f'<th>{h}</th>' for h in headers)
    trs = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table class="comparison-table glossary-table"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>'

def hdr(icon, title, sub, intro):
    return f'''<div class="section-header">
                    <h2><i class="fas {icon}"></i> {title}</h2>
                    <p>{sub}</p>
                    <p class="section-intro">{intro}</p>
                </div>'''

def sec(sid, active, header, body):
    act = ' active' if active else ''
    return f'''<section class="content-section{act}" id="{sid}">
                {header}
                <div class="content-card"><div class="content-body"><div class="lesson-content">
{body}
                </div></div></div>
            </section>'''

HERO = '''            <div id="lesson-route-hero" class="lesson-route-hero" aria-live="polite" hidden>
                <p class="lesson-route-hero-module"></p>
                <p class="lesson-route-hero-lesson"></p>
                <div class="lesson-route-hero-img-wrap">
                    <img class="lesson-route-hero-img" src="" alt="" loading="lazy" decoding="async" />
                </div>
            </div>

'''

INTRO = sec('intro', True, hdr('fa-info-circle', 'Giriş ve modül haritası',
    'SEBS Global’de siber güvenliğe ilk adımınız',
    'Bu modül, dijital dünyada “neyi, neden ve kime karşı koruyoruz?” sorusuna tutarlı cevap vermenizi sağlar. Kısa listeler değil; bağlam, örnek, savunma ve özet içeren eksiksiz bir başlangıç eğitimidir.'),
    lo([
        'Siber güvenliğin tanımını ve bilgi güvenliği ile ilişkisini açıklamak',
        'Varlık, tehdit, zafiyet, risk, exploit ve payload kavramlarını ayırt etmek',
        'CIA üçlüsünün üç bileşenini eşit derinlikte açıklamak',
        'Tehdit aktörleri, savunma prensipleri, risk, politika ve olay müdahalesine giriş yapmak',
    ]) + NAR('modul-vizyon', 'fa-rocket', 'Bu modül size ne kazandırır?',
        'SEBS’e ilk kez gelen kullanıcılar için bu modül <strong>referans çerçeve</strong>dir. Sonraki eğitimlerde (ağ, penetrasyon testi, uyumluluk) duyacağınız terimler burada tanımlanır.',
        'Profesyonel ekipler olay konuşurken şu dili kullanır: hangi <strong>varlık</strong> etkilendi, hangi <strong>tehdit</strong> ve <strong>zafiyet</strong> devredeydi, <strong>risk</strong> neden yüksekti, hangi <strong>CIA</strong> boyutu zarar gördü. Bu modül o dili kurar.',
        'Okuma önerisi: Modülü 3–4 oturuma bölün. Her bölüm sonunda <strong>Dersi tamamla</strong> ile ilerleyin; modül özetindeki soruları kapatmadan sonraki modüle geçmeyin.',
    ) + '''
<div class="kr-inline-breakout kr-mid-cards" role="region" aria-label="Modül haritası">
<div class="kr-inline-breakout__head"><i class="fas fa-map"></i><span>Yedi ders + kapanış</span></div>
<p class="kr-inline-breakout__hint">Sol menü ile aynı sıra. CIA üçlüsü ayrı derstir; gizlilik, bütünlük ve erişilebilirlik eşit işlenir.</p>
<div class="kr-cia-grid">
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-book"></i></span><span>1–2 Kavramlar</span></summary><div class="kr-exp-goal__body">Temeller, varlık–tehdit–risk, CIA.</div></details>
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-bug"></i></span><span>3 Tehditler</span></summary><div class="kr-exp-goal__body">Malware, vektörler, aktörler.</div></details>
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-shield-alt"></i></span><span>4–5 Savunma</span></summary><div class="kr-exp-goal__body">Prensipler ve risk.</div></details>
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-landmark"></i></span><span>6–8 Yönetim</span></summary><div class="kr-exp-goal__body">Politika, olay müdahalesi, özet.</div></details>
</div></div>
''' + H3('nasil-calisilir', 'fa-route', 'Nasıl çalışılır?',
    'Dersler <strong>rota modunda</strong> açılır; alt başlıklar sayfadaki <code>h3</code> ile eşleşir. Oturum başına 1–2 ders önerilir.',
    'Not şablonu: tanım → gerçek örnek → hangi CIA boyutu? → hangi kontrol?',
) + recap('intro-ozet', 'Giriş yol haritasını ve çalışma disiplinini netleştirdi; ders 1’e geçmeye hazırsınız.', [
    'Modül haritası ve kazanımlar', 'Çalışma disiplini', 'Sonraki adımlar',
]))

L1 = sec('lesson1', False, hdr('fa-book', '1. Siber güvenlik temelleri',
    'Tanım, kapsam ve güvenliğin ortak dili',
    'Siber güvenlik yalnızca antivirüs değildir. Bu derste disiplinin tanımı, üç savunma boyutu ve varlık–tehdit–zafiyet–risk modeli işlenir; CIA ayrı derstir.'),
    lo([
        'Siber güvenlik ve bilgi güvenliği ilişkisini açıklamak',
        'Dijital varlıkları sınıflandırmak',
        'Tehdit, zafiyet, risk, exploit, payload ve saldırı zincirini tanımlamak',
    ]) + NAR('ders1-buyuk-resim', 'fa-compass', 'Ders 1 — Büyük resim',
        'Bu ders modülün omurgasıdır. CIA üçlüsü ders 2’de eşit derinlikte gelir; burada <strong>ortak sözlük</strong> kurulur.',
        'Dijitalleşme her işletmeyi veri işleyen organizasyona dönüştürdü. Koruma; kimlik yönetimi, yedekleme, hukuk ve insan faktörünü birlikte düşünür.',
    ) + CH(
        H3('sg-tanim', 'fa-shield-alt', 'Siber güvenlik nedir?',
            '<strong>Siber güvenlik</strong>, bilgisayar sistemlerini, ağları, uygulamaları ve verileri yetkisiz erişim, değiştirme veya hizmet kesintisine karşı korumak için uygulanan teknik, süreç ve insan önlemlerinin bütünüdür.',
            '<strong>Bilgi güvenliği</strong> daha geniştir: kağıt arşivden buluta kadar bilginin gizliliği, bütünlüğü ve erişilebilirliği. Siber güvenlik dijital ortama odaklanır.',
            'Kritik altyapı (enerji, sağlık, finans) kesintisiz çalışması siber olgunluğa bağlıdır. KVKK/GDPR ihlalleri yaptırıma tabidir.',
        ),
        H3('sg-uc-boyut', 'fa-layer-group', 'Teknoloji, süreç ve insan',
            '<strong>Teknoloji:</strong> Şifreleme, firewall, EDR, SIEM, yama. Yanlış yapılandırılmış bulut bucket’ı pahalı firewall’ı baypas eder.',
            '<strong>Süreç:</strong> Erişim onayı, yedek testi, olay bildirimi, ayrıcalıklı hesap disiplini.',
            '<strong>İnsan:</strong> Farkındalık, phishing direnci. Birçok olayda zayıf halka kullanıcı veya yöneticidir.',
        ),
        tbl(['Boyut', 'Örnek kontrol', 'Başarısızlık'], [
            ['Teknoloji', 'MFA, şifreleme', 'Açık RDP'],
            ['Süreç', 'Access review', 'Ayrılan çalışan hesabı açık'],
            ['İnsan', 'Phishing tatbikatı', 'Sahte fatura tıklanması'],
        ]),
        H3('varlik', 'fa-gem', 'Varlık (Asset)',
            'Korunması gereken her değer <strong>varlıktır</strong>: müşteri verisi, kaynak kodu, ERP, e-posta hizmeti, marka itibarı.',
            'Envanter olmadan bütçe yanlış yere gider. “Tek kişinin bildiği admin parolası” ayrı satır olmalıdır.',
        ),
        ex('Kuzey Lojistik', '<p>Araç takip uygulaması <strong>hizmet</strong>; sunucu <strong>sistem</strong>; konum kayıtları <strong>veri</strong>. Hedef: konum sızmaması (gizlilik), kayıt değişmemesi (bütünlük), panele erişim (erişilebilirlik).</p>'),
        H3('tehdit', 'fa-user-ninja', 'Tehdit (Threat)',
            'Zarar verme <em>potansiyeli</em>. Başarısız giriş denemeleri de tehdit ortamıdır.',
            'Doğal tehditler (yangın) erişilebilirliği etkiler — DR planı bütünleşik güvenliğin parçasıdır.',
            'Tehdit ≠ risk. Risk = tehdit + zafiyet + varlık değeri.',
        ),
        H3('zafiyet', 'fa-door-open', 'Zafiyet (Vulnerability)',
            'Teknik (CVE), yapılandırma (açık bucket), süreç/insan (parola paylaşımı).',
            '“Sistemler güncel” demek IAM ve süreç zafiyetlerini kapatmaz.',
        ),
        H3('risk', 'fa-balance-scale', 'Risk',
            '<strong>Risk ≈ olasılık × etki</strong>. Aynı SQLi test ortamında düşük, canlı müşteri DB’de kritik.',
            'Tedavi: azalt, transfer, kabul et (dokümante), kaçın.',
        ),
        H3('exploit-payload', 'fa-code', 'Exploit, payload ve saldırı zinciri',
            '<strong>Exploit</strong> zafiyeti tetikler. <strong>Payload</strong> sızma sonrası eylem (şifreleme, exfil).',
            'Zincir: keşif → hazırlık → iletim → sızma → eylem. <strong>Zero-day</strong> imza tabanlı savunmayı aşabilir.',
        ),
        ex('Ev benzetmesi', '<p>Açık kapı <strong>zafiyet</strong>; hırsız <strong>tehdit</strong>; değer + ihtimal <strong>risk</strong>; alarm <strong>kontrol</strong>.</p>'),
        H3('l1-sektor', 'fa-building', 'Sektörden sektöre öncelik',
            'Bankacılık: gizlilik ve dolandırıcılık. Hastane: hasta verisi gizliliği + sistem erişilebilirliği. Üretim: OT segmentasyonu ve bütünlük. E-ticaret: ödeme ve müşteri verisi.',
            'Aynı CIA üçlüsü, farklı ağırlık — mimari karar sektöre göre değişir.',
        ),
        H3('l1-kariyer', 'fa-briefcase', 'Kariyer perspektifi',
            'SOC analisti olay triyajı, mimar kontrol tasarımı, GRC uyumluluk, pentester zafiyet bulur. Hepsi aynı dili konuşur: varlık, tehdit, risk, CIA.',
        ),
        tbl(['Terim', 'Açıklama'], [
            ['Asset', 'Korunan değer'], ['Threat', 'Zarar potansiyeli'],
            ['Vulnerability', 'İstismar edilebilir zayıflık'], ['Risk', 'Olasılık × etki'],
            ['Exploit', 'Zafiyeti tetikleyen yöntem'], ['Payload', 'Sızma sonrası eylem'],
        ]),
    ) + recap('ders1-ozet', 'Ders 1 ortak dili kurdu; ders 2’de CIA’nın üç boyutu eşit derinlikte işlenecek.', [
        'Siber güvenlik tanımı ve üç boyut', 'Varlık–tehdit–zafiyet–risk', 'Exploit, payload, zincir',
    ]),
)

L_CIA = sec('lesson1-cia', False, hdr('fa-lock', '2. CIA üçlüsü',
    'Gizlilik, bütünlük ve erişilebilirlik — eşit derinlikte',
    'Bu ders yalnızca CIA’ya ayrılmıştır. Üç bileşen aynı önemde; her biri için tanım, kontroller, ihlal örnekleri ve denge işlenir.'),
    lo([
        'Gizlilik, bütünlük ve erişilebilirliği örneklemek',
        'Her boyut için teknik ve süreç kontrolleri saymak',
        'Üçlü arasındaki denge ve çelişkileri tartışmak',
    ]) + NAR('ders2-cia-buyuk-resim', 'fa-compass', 'Ders 2 — CIA üçlüsü',
        'CIA onlarca yıldır kullanılan <strong>denge çerçevesidir</strong>. Her kontrol en az bir boyuta hizmet eder.',
        'Bu derste gizlilik, bütünlük ve erişilebilirlik <strong>aynı uzunlukta</strong> anlatılır — biri özet geçilmez.',
        'Olay analizinde her zaman sorun: hangi C/I/A zarar gördü?',
    ) + '''
<div class="cia-triad-visual" role="img" aria-label="CIA üçlüsü">
<div class="cia-pillar confidentiality"><i class="fas fa-lock"></i><span>Gizlilik</span></div>
<div class="cia-pillar integrity"><i class="fas fa-check-double"></i><span>Bütünlük</span></div>
<div class="cia-pillar availability"><i class="fas fa-plug"></i><span>Erişilebilirlik</span></div>
</div>
''' + CH(
        H3('cia-genel', 'fa-triangle', 'CIA üçlüsüne giriş',
            'Şifreleme → gizlilik. Hash/imza → bütünlük. Yedek/yük dengeleme → erişilebilirlik. Çoğu kontrol birden fazla boyuta hizmet eder.',
        ),
        CIA_GIZ,
        tbl(['Kontrol', 'Gizlilik'], [['TLS', 'İletimde dinleme'], ['Disk şifreleme', 'Çalıntı cihaz'], ['MFA', 'Çalıntı parola']]),
        ex('Gizlilik senaryosu', '<p>Hasta kaydı yetkisiz indirildi — <em>gizlilik</em> ihlali; bütünlük/erişilebilirlik ayrı değerlendirilir.</p>'),
        CIA_BUT,
        tbl(['Kontrol', 'Bütünlük'], [['Hash', 'Dosya bozulmadı mı'], ['Dijital imza', 'Paket sahte mi'], ['Audit log', 'Kim değiştirdi']]),
        ex('Bütünlük senaryosu', '<p>Muhasebe toplam satırı gece değiştirildi — <em>bütünlük</em>; liste çalınmadıysa gizlilik ayrı.</p>'),
        CIA_ERI,
        tbl(['Kontrol', 'Erişilebilirlik'], [['Yedek + test', 'DR'], ['Load balancer', 'Tek sunucu arızası'], ['Anti-DDoS', 'Hacim saldırısı']]),
        ex('Erişilebilirlik senaryosu', '<p>Black Friday’de site 4 saat kapalı — gelir kaybı; WAF ve kapasite <em>erişilebilirlik</em> riskini önceden azaltmalıydı.</p>'),
        H3('cia-denge', 'fa-balance-scale', 'CIA dengesi',
            'Ek şifreleme felaket kurtarmayı zorlaştırabilir. Sıkı onay bütünlüğü artırır, acil müdahaleyi geciktirir.',
            'Mimari kararda “hangi boyut öncelikli?” yazılı olmalıdır.',
        ),
        callout('tip', 'Pratik kural', 'Tasarımda üç soru: Gizliliği artırıyor mu? Bütünlüğü? Erişilebilirliği?'),
    ) + recap('ders2-cia-ozet', 'CIA’nın üç bileşeni eşit derinlikte işlendi.', [
        'Gizlilik: şifreleme, erişim, maskeleme', 'Bütünlük: hash, imza, log',
        'Erişilebilirlik: yedek, DR, DDoS', 'Üçlü denge',
    ]),
)

L2 = sec('lesson2', False, hdr('fa-bug', '3. Tehdit türleri ve aktörler',
    'Malware, vektörler ve saldırgan profilleri',
    'Tehditleri “virüs” diye geçiştirmeyin. Malware ailesi, saldırı vektörleri, aktör motivasyonları ve olay dili bu derste kurulur.'),
    lo([
        'Malware türlerini ayırt etmek', 'Saldırı vektörlerini tanımlamak', 'Tehdit aktörlerini sınıflandırmak',
    ]) + NAR('ders3-buyuk-resim', 'fa-compass', 'Ders 3 — Tehditler',
        'Aynı teknik farklı aktörlerce farklı amaçla kullanılır. Sınıflandırma panik değil önceliklendirme içindir.',
        'Savunma katmanlıdır: e-posta filtre, macro engeli, EDR, yedek, segmentasyon, eğitim.',
    ) + CH(
        H3('malware', 'fa-virus', 'Malware ailesi',
            '<strong>Virüs</strong> dosyaya bulaşır; <strong>solucan</strong> ağda yayılır; <strong>trojan</strong> masum görünür; <strong>ransomware</strong> şifreler ve fidye ister; <strong>spyware</strong> izler; <strong>rootkit</strong> gizlenir; <strong>botnet</strong> uzaktan kontrol eder.',
            'Fileless malware disk izi bırakmadan bellekte çalışabilir — EDR ve davranış analizi önem kazanır.',
            '<strong>Ransomware yaşam döngüsü:</strong> İlk erişim (phishing/RDP) → yatay hareket → yedekleri silme → toplu şifreleme → fidye notu. Savunma: yedek testi, segmentasyon, EDR, MFA, e-posta filtre.',
        ),
        H3('phishing-detay', 'fa-fish', 'Phishing ve sosyal mühendislik',
            'Spear phishing hedefli, CEO fraud acil transfer ister, smishing SMS ile link gönderir. Teknik zafiyet yokken bile olay çıkar — bu yüzden farkındalık eğitimi ve raporlama kanalı şart.',
            'Kırmızı bayraklar: aciliyet, garip gönderen, beklenmeyen ek, URL hover farkı. Kurumsal: DMARC/SPF, sandbox, “Raporla” butonu.',
        ),
        H3('vektorler', 'fa-envelope', 'Saldırı vektörleri',
            '<strong>Phishing / vishing / smishing</strong> insan hedefler. <strong>SQLi, XSS</strong> uygulama katmanı. <strong>MitM</strong> ağ. <strong>Supply chain</strong> tedarikçi üzerinden (SolarWinds dersi).',
            'Kullanıcı tıklaması vektör; asıl payload bulut veya AD üzerinde ilerler. Brute force ve credential stuffing kimlik katmanını hedefler — MFA kritik.',
        ),
        H3('aktorler', 'fa-user-secret', 'Tehdit aktörleri',
            '<strong>Script kiddie</strong> — düşük olgunluk. <strong>Hacktivist</strong> — ideoloji. <strong>Organize suç</strong> — finans/ransomware. <strong>APT</strong> — uzun süre gizli, hedefli. <strong>İçeriden</strong> — meşru hesap, zor tespit.',
            'Motivasyon (MICE: Money, Ideology, Coercion, Ego) savunma önceliğini şekillendirir.',
        ),
        H3('saldiri-zinciri-tehdit', 'fa-link', 'Saldırı zinciri ve Kill Chain',
            'Keşif → silahlandırma → teslimat → sızma → kurulum → C2 → eylem. Her aşamada tespit fırsatı vardır.',
        ),
        ex('NotPetya', '<p>Yedekleme ve segmentasyon “liste maddesi” değil; global olayda iş durdu. Teknik + süreç birlikte.</p>'),
        tbl(['Aktör', 'Motivasyon', 'Tipik hedef'], [
            ['APT', 'Casusluk', 'IP, devlet'], ['Ransomware grubu', 'Fidye', 'KOBİ, hastane'],
            ['İçeriden', 'İntikam/para', 'Veri sızdırma'],
        ]),
    ) + recap('ders3-ozet', 'Tehdit sınıflandırması ve savunma önceliği netleşti.', ['Malware', 'Vektörler', 'Aktörler', 'Zincir']),
)

L3 = sec('lesson3', False, hdr('fa-shield-alt', '4. Güvenlik prensipleri',
    'Katmanlı savunma, en az ayrıcalık, sıfır güven',
    'Prensipler ürün değil mimari karardır. Her prensibin tanımı, uygulaması ve ihlal sonuçları işlenir.'),
    lo([
        'Defense in depth uygulamasını açıklamak', 'Least privilege ilişkisini kurmak', 'Zero trust ile sınır modelini karşılaştırmak',
    ]) + NAR('ders4-buyuk-resim', 'fa-compass', 'Ders 4 — Savunma prensipleri',
        '“Tek firewall yeter” miti burada çökertilir. Katmanlı savunma + en az ayrıcalık + sıfır güven modern mimarinin üç ayağıdır.',
    ) + CH(
        H3('did', 'fa-layer-group', 'Katmanlı savunma (Defense in Depth)',
            'Tek duvar yeterli değil. Fiziksel, ağ, uç nokta, uygulama, veri, insan katmanları. Bir katman düşerse diğeri tespit veya sınırlama sağlar.',
            'Örnek: Phishing → e-posta filtre (1) → macro engel (2) → EDR (3) → segmentasyon (4) → yedek (5).',
            'Her katman farklı CIA boyutuna hizmet eder: şifreleme gizlilik, log bütünlük, yedek erişilebilirlik.',
        ),
        tbl(['Katman', 'Örnek araç', 'Hedef'], [
            ['Ağ', 'Firewall, IDS', 'Sınırlandırma'],
            ['Uç nokta', 'EDR, disk şifre', 'Cihaz güvenliği'],
            ['Uygulama', 'WAF, SAST', 'Kod zafiyeti'],
            ['Veri', 'DLP, şifreleme', 'Gizlilik'],
        ]),
        H3('lp', 'fa-user-lock', 'En az ayrıcalık (Least Privilege)',
            'Varsayılan minimum yetki; RBAC; düzenli access review; ayrılışta hesap kapatma SLA; PAM ile admin oturumu kaydı.',
            'Domain Admin herkese verilmez; “geçici yetki” süreli ve onaylı olmalıdır.',
        ),
        H3('zt', 'fa-shield-halved', 'Sıfır güven (Zero Trust)',
            'Never trust, always verify. Konum değil kimlik+cihaz+bağlam. MFA, mikro segmentasyon, sürekli doğrulama. Geçiş aşamalı planlanır.',
            'VPN “içerideyim güvenliyim” modelini kırar; her istek doğrulanır.',
        ),
        H3('diger-prensipler', 'fa-list', 'Diğer temel prensipler',
            '<strong>Görev ayrımı (SoD):</strong> Tek kişi hem ödeme hem onay yapamaz. <strong>Fail secure:</strong> Arıza güvenli modda kilitler. <strong>Güvenli varsayılan:</strong> Yeni kaynak kapalı başlar. <strong>Need to know:</strong> Rol değil görev bazlı erişim.',
        ),
        ex('Target 2013', '<p>HVAC tedarikçisi yolu — segmentasyon ve tedarikçi riski prensip ihlalinin bedeli.</p>'),
        tbl(['Prensip', 'Özet'], [
            ['DiD', 'Çok katman'], ['Least privilege', 'Minimum yetki'],
            ['Zero trust', 'Sürekli doğrulama'], ['SoD', 'Görev ayrımı'],
        ]),
    ) + recap('ders4-ozet', 'Savunma prensipleri operasyonel dile çevrildi.', ['DiD', 'Least privilege', 'Zero trust', 'SoD']),
)

L4 = sec('lesson4', False, hdr('fa-chart-line', '5. Risk değerlendirmesi',
    'Önceliklendirme ve yatırım dili',
    'Risk, sınırsız alarm listesini iş kararına çevirir. Süreç, matris ve tedavi seçenekleri bu derste.'),
    lo([
        'Risk = olasılık × etki mantığını uygulamak', 'VTR zincirini dokümante etmek', 'Azalt, transfer, kabul, kaçın ayırt etmek',
    ]) + NAR('ders5-buyuk-resim', 'fa-compass', 'Ders 5 — Risk',
        'Güvenlik ekibi “her şeyi kapat” diyemez; risk dili yönetime “şu 3 madde bu çeyrekte” der.',
    ) + CH(
        H3('risk-surec', 'fa-list-ol', 'Risk değerlendirme süreci',
            '1) Varlık envanteri 2) Tehdit/zafiyet eşleştirme 3) Etki (1–5) 4) Olasılık (1–5) 5) Skor 6) Tedavi 7) Kalan risk izleme.',
            'ISO 27005 ve NIST RMF bu döngüyü standartlaştırır.',
        ),
        H3('risk-matris', 'fa-table', 'Risk matrisi örneği',
            '5×5 matris: yüksek olasılık + yüksek etki = acil. Düşük/düşük = kabul veya izleme.',
        ),
        H3('risk-ornek', 'fa-store', 'Örnek: e-ticaret müşteri veritabanı',
            'Varlık: canlı DB (500K kayıt PII). Tehdit: SQLi / credential stuffing. Zafiyet: zayıf kod / parola reuse. Etki: 5 (regülasyon + itibar). Olasılık: 3 (yılda bir deneme). Skor: yüksek → WAF + kod inceleme + MFA bu çeyrek.',
            'Kontroller: WAF, kod inceleme, MFA, şifreleme, yedek. Kalan risk: sıfır değil — yönetim kurulu yazılı kabul.',
        ),
        H3('kalan-risk', 'fa-chart-pie', 'Kalan risk ve izleme',
            'Kontrol sonrası risk sıfır olmaz. Kalan risk periyodik gözden geçirilir; tehdit ortamı değişince skor yenilenir.',
        ),
        H3('tedavi', 'fa-hand-holding-medical', 'Risk tedavi seçenekleri',
            '<strong>Azalt:</strong> Kontrol ekle. <strong>Transfer:</strong> Sigorta, outsource. <strong>Kabul:</strong> Yazılı onay. <strong>Kaçın:</strong> Faaliyeti durdur.',
        ),
        callout('warning', 'Yaygın hata', 'CVSS skorunu iş riski sanmak. İş etkisi (müşteri, regülasyon, itibar) ayrı tartılır.'),
    ) + recap('ders5-ozet', 'Risk dili yönetim ve teknik arasında köprü kurdu.', ['Süreç', 'Matris', 'Tedavi', 'Örnek']),
)

L5 = sec('lesson5', False, hdr('fa-file-shield', '6. Güvenlik politikaları',
    'Tekniği işe ve mevzuata bağlama',
    'Politika olmadan MFA “isteğe bağlı” kalır. Belge hiyerarşisi, uyumluluk ve tedarikçi güvenliği işlenir.'),
    lo([
        'Politika, standart, prosedür, kılavuz ayrımını yapmak', 'KVKK ve ISO 27001 ile ilişkiyi kurmak', 'Tedarikçi riskini açıklamak',
    ]) + NAR('ders6-buyuk-resim', 'fa-compass', 'Ders 6 — Yönetişim',
        'Teknik kontrol politika olmadan sürdürülmez. Politika “ne”, standart “minimum nasıl”, prosedür “adım adım” der.',
    ) + CH(
        H3('politika-tur', 'fa-file-contract', 'Belge hiyerarşisi',
            '<strong>Politika:</strong> Üst düzey kural (ör. “Tüm uzaktan erişim MFA ile”). <strong>Standart:</strong> Teknik minimum (TLS 1.2+). <strong>Prosedür:</strong> Olay bildirimi adımları. <strong>Kılavuz:</strong> Öneri (parola yöneticisi kullanımı).',
        ),
        H3('au', 'fa-user-check', 'Kabul edilebilir kullanım (AUP)',
            'Kişisel cihaz, sosyal medya, USB politikası. İhlal disiplin sürecine bağlanır.',
        ),
        H3('uyumluluk', 'fa-balance-scale', 'Uyumluluk',
            'ISO 27001 (ISMS), SOC 2 (güven), PCI-DSS (kart), KVKK (kişisel veri). Ortak soru: politika var ve uygulanıyor mu?',
            'KVKK: aydınlatma, açık rıza, veri minimizasyonu, ihlal bildirimi. Politika metni hukuk + IT ortak yazar.',
        ),
        H3('gizlilik-politikasi', 'fa-user-shield', 'Gizlilik ve veri saklama',
            'Ne kadar süre saklanır, kim erişir, nasıl silinir — prosedürde net olmalı. Müşteri talebi (unutulma hakkı) için iş akışı tanımlanır.',
        ),
        H3('tedarikci', 'fa-handshake', 'Tedarikçi ve üçüncü taraf riski',
            'SOC 2 raporu, güvenlik eki, erişim sınırı, veri işleme sözleşmesi. Target dersi: HVAC = tedarikçi saldırı yüzeyi.',
        ),
    ) + recap('ders6-ozet', 'Yönetişim boyutu tamamlandı.', ['Hiyerarşi', 'AUP', 'Uyumluluk', 'Tedarikçi']),
)

L6 = sec('lesson6', False, hdr('fa-ambulance', '7. Olay müdahalesi',
    'Hazırlıktan ders çıkarmaya',
    'Olay anında disiplin şart. NIST tarzı aşamalar, roller ve araçlar eksiksiz anlatılır.'),
    lo([
        'IR aşamalarını sıralamak', 'IR ekibi rollerini tanımlamak', 'SIEM ve forensics rolünü açıklamak',
    ]) + NAR('ders7-buyuk-resim', 'fa-compass', 'Ders 7 — Olay müdahalesi',
        'Panik yerine playbook. İlk 24 saat: sınırla, kanıt topla, iletişim, kök neden, iyileştir.',
    ) + CH(
        H3('ir-asamalar', 'fa-list-check', 'Olay müdahale aşamaları',
            '<strong>1. Hazırlık:</strong> Plan, playbook, iletişim listesi, tatbikat. <strong>2. Tespit:</strong> SIEM alarmı, EDR, kullanıcı şikayeti. <strong>3. Analiz:</strong> Kapsam, IOC. <strong>4. Sınırlandırma:</strong> İzolasyon, hesap kilidi. <strong>5. Ortadan kaldırma:</strong> Malware, kalıcı erişim. <strong>6. Kurtarma:</strong> Restore, doğrulama. <strong>7. Ders:</strong> Post-mortem, KPI.',
        ),
        H3('ir-ekip', 'fa-users', 'Ekip ve roller',
            'Olay yöneticisi, analist, forensics, hukuk, iletişim, üst yönetim. Delil zinciri (chain of custody) bozulmadan hareket.',
        ),
        H3('ir-araclar', 'fa-tools', 'Araçlar',
            '<strong>SIEM:</strong> Korelasyon. <strong>EDR:</strong> Uç nokta. <strong>Forensics:</strong> Disk/bellek imajı. <strong>Ticketing:</strong> İzlenebilirlik.',
        ),
        H3('ir-iletisim', 'fa-bullhorn', 'İletişim ve bildirim',
            'Regülatör, müşteri, medya planı önceden yazılır. KVKK 72 saat bildirimi gündeme gelebilir.',
            'Panik e-postası yerine onaylı şablon; tek sözcü (spokesperson) kuralı.',
        ),
        H3('ir-tatbikat', 'fa-dumbbell', 'Tatbikat ve playbook',
            'Masa başı (tabletop) senaryosu: “Ransomware saat 03:00’te.” Playbook: kim izole eder, kim hukuku arar, yedekten dönüş süresi. Tatbikat olmadan plan kağıt üzerinde kalır.',
        ),
        ex('Maersk / NotPetya', '<p>Yedek ve DR — erişilebilirlik ve bütünlük kurtarmasının değeri.</p>'),
    ) + recap('ders7-ozet', 'Olay müdahalesi döngüsü tamam.', ['Aşamalar', 'Ekip', 'Araçlar', 'İletişim']),
)

LOZET = sec('modul-ozet', False, hdr('fa-check-double', 'Modül özeti',
    'Tüm modülün sentezi',
    'Yedi dersi tamamladıysanız aşağıdaki hikâyeyi kendi cümlelerinizle anlatabilmelisiniz.'),
    lo([
        'Modül kazanımlarını tek olay senaryosunda birleştirmek', 'Sonraki SEBS eğitimlerine hazırlık planı yapmak',
    ]) + NAR('modul-ozet-sentez', 'fa-layer-group', 'Sentez: tek hikâye',
        '<strong>Varlık</strong> → <strong>tehdit</strong> + <strong>zafiyet</strong> → <strong>risk</strong> → kontroller (CIA eşit, prensipler, politika) → olay olursa <strong>IR</strong>.',
        'Her yeni modülde: Hangi CIA boyutu? Tehdit mi zafiyet mi risk mi?',
    ) + CH(
        H3('kendinizi-sinayin', 'fa-clipboard-check', 'Kendinizi sınayın',
            'Aşağıdaki soruları kapatmadan sonraki modüle geçmeyin.',
        ),
        tbl(['Soru', 'Beklenen'], [
            ['CIA üçlüsünü örnekle açıkla', 'G + B + E ayrı ayrı, eşit derinlik'],
            ['Tehdit vs risk', 'Potansiyel vs olasılık×etki'],
            ['DiD vs zero trust', 'Katman vs sürekli doğrulama'],
            ['IR aşamaları', 'Hazırlık → ders en az 6 adım'],
            ['Bütünlük ihlali örneği', 'Veri değişikliği, sızmama şart değil'],
        ]),
        callout('tip', 'Sonraki adım', 'Güncel Siber Güvenliğe Giriş, Temel Network veya simülasyonlarla pekiştirin.'),
    ) + recap('modul-ozet-final', 'Temel Siber Güvenlik modülünü eksiksiz tamamladınız. İlk izlenim için sağlam bir temel oluşturdunuz.', [
        'Tam modül sentezi', 'Öz değerlendirme', 'Yol haritası',
    ]),
)

BODY = '\n\n'.join([INTRO, L1, L_CIA, L2, L3, L4, L5, L6, LOZET])
MAIN = f'        <main class="module-content">\n{HERO}{BODY}\n        </main>'

CIA_CSS = '''
        .cia-triad-visual {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1.5rem 0 2rem;
        }
        .cia-pillar {
            text-align: center;
            padding: 1.25rem 1rem;
            border-radius: 12px;
            border: 1px solid var(--border-color, rgba(0,0,0,0.08));
            background: var(--bg-secondary, #f7fafc);
        }
        .cia-pillar i { font-size: 1.75rem; display: block; margin-bottom: 0.5rem; }
        .cia-pillar.confidentiality i { color: #3182ce; }
        .cia-pillar.integrity i { color: #38a169; }
        .cia-pillar.availability i { color: #d69e2e; }
        @media (max-width: 640px) {
            .cia-triad-visual { grid-template-columns: 1fr; }
        }
'''

def main():
    path = Path(__file__).resolve().parents[1] / 'frontend/modules/temel-siber-guvenlik.html'
    text = path.read_text(encoding='utf-8')
    i = text.find('<main class="module-content">')
    j = text.find('</main>') + len('</main>')
    if i < 0:
        raise SystemExit('main not found')
    new_text = text[:i] + MAIN + text[j:]
    # Remove stray </div> after </main>
    new_text = re.sub(r'</main>\s*</div>\s*\n\s*<script>', '</main>\n\n    <script>', new_text, count=1)
    new_text = new_text.replace(
        'Başlangıç seviyesi — uzun anlatımlı, örnek odaklı temel eğitim modülü.',
        'Eksiksiz başlangıç modülü — kavramlar, CIA (eşit derinlik), tehdit, savunma, risk, politika ve olay müdahalesi.',
    )
    new_text = new_text.replace('sebs-premium-module-lessons.js?v=20260521b', 'sebs-premium-module-lessons.js?v=20260522')
    if '.cia-triad-visual' not in new_text:
        new_text = new_text.replace('[data-theme="dark"] .edu-lesson-recap {', CIA_CSS + '\n        [data-theme="dark"] .edu-lesson-recap {', 1)
    path.write_text(new_text, encoding='utf-8')
    print('OK', path, 'chars', len(new_text))

if __name__ == '__main__':
    main()
