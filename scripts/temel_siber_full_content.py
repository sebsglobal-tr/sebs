# -*- coding: utf-8 -*-
"""Kıdemli eğitimci düzeyinde — Temel Siber Güvenlik modül gövdesi (HTML parçaları)."""

def P(*paras):
    return "".join(f"<p>{x}</p>" for x in paras)


def H3(hid, icon, title, *paras):
    return f'<h3 id="{hid}"><i class="fas {icon}"></i> {title}</h3>{P(*paras)}'


def EX(title, *paras):
    inner = "".join(f"<p>{p}</p>" for p in paras)
    return f'<div class="example-box"><p><strong>{title}</strong></p>{inner}</div>'


def TBL(headers, rows):
    th = "".join(f"<th>{h}</th>" for h in headers)
    trs = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<table class="comparison-table glossary-table"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>'


def CALLOUT(kind, title, body):
    icon = {"info": "fa-info-circle", "warning": "fa-exclamation-triangle", "tip": "fa-lightbulb"}.get(
        kind, "fa-info-circle"
    )
    return f'<div class="callout-box {kind}"><div class="callout-icon"><i class="fas {icon}"></i></div><div class="callout-body"><h5>{title}</h5><p>{body}</p></div></div>'


# ---------- INTRO ----------
INTRO_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Modül kazanımları</h3><ul>
<li>Siber güvenliğin tanımını, kapsamını ve bilgi güvenliği ile ilişkisini açıklamak</li>
<li>Varlık, tehdit, zafiyet, risk, exploit ve payload kavramlarını ayırt etmek</li>
<li>CIA üçlüsünün üç bileşenini eşit derinlikte örneklemek</li>
<li>Tehdit aktörleri, savunma prensipleri, risk yönetimi ve olay müdahalesine giriş yapmak</li>
<li>Güvenlik politikalarının teknik kontrollerle nasıl bağlandığını anlatmak</li>
</ul></div>
<div class="edu-narrative enhanced-text">
<h3 id="modul-vizyon"><i class="fas fa-rocket"></i> Neden bu modül farklı?</h3>
""" + P(
    "SEBS Temel Siber Güvenlik modülü, “okudum geçtim” listeleri için değil; <strong>ilk kez siber güvenliğe giren</strong> veya bilgisini sistemleştirmek isteyen profesyoneller için yazıldı. Her ders; tanım, gerçek dünya örneği, hangi CIA boyutunun etkilendiği, hangi kontrolün devreye girdiği ve bölüm sonu özeti içerir.",
    "Siber güvenlik yalnızca antivirüs veya “güçlü parola” değildir. Dijital varlıklarınızı (veri, sistem, hizmet), tehdit ortamını, zafiyetleri ve risk önceliğini aynı dilde konuşabilmek — SOC’ta, mimari toplantıda veya KVKK hazırlığında — bu modülün hedefidir.",
    "Modülü <strong>7 ders + kapanış</strong> olarak planlayın. Oturum başına 45–90 dakika, 1–2 ders. Acele etmeyin: CIA üçlüsünde gizlilik, bütünlük ve erişilebilirlik <strong>aynı uzunlukta</strong> işlenir; biri özet geçilmez.",
    "Okurken not defterinize şu şablonu yazın: <em>Tanım → Örnek olay → Etkilenen CIA → Uygulanan kontrol → Açık kalan risk.</em>",
) + """
</div>
<div class="kr-inline-breakout kr-mid-cards" role="region" aria-label="Modül haritası">
<div class="kr-inline-breakout__head"><i class="fas fa-map"></i><span>Yol haritası</span></div>
<p class="kr-inline-breakout__hint">Sol menü ile aynı sıradır. Ders 2 yalnızca CIA üçlüsüne ayrılmıştır.</p>
<div class="kr-cia-grid">
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-book"></i></span><span>1–2 Temel kavramlar</span></summary><div class="kr-exp-goal__body">Tanım, varlık–tehdit–risk, CIA (gizlilik, bütünlük, erişilebilirlik eşit derinlik).</div></details>
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-bug"></i></span><span>3 Tehditler</span></summary><div class="kr-exp-goal__body">Malware, phishing, aktörler, saldırı zinciri, vaka analizi.</div></details>
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-shield-alt"></i></span><span>4–5 Savunma</span></summary><div class="kr-exp-goal__body">Katmanlı savunma, sıfır güven, risk matrisi.</div></details>
<details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon"><i class="fas fa-landmark"></i></span><span>6–8 Yönetim</span></summary><div class="kr-exp-goal__body">Politika, uyumluluk, olay müdahalesi, modül sentezi.</div></details>
</div></div>
""" + H3(
    "nasil-calisilir",
    "fa-route",
    "Nasıl çalışılır?",
    "Dersler <strong>rota modunda</strong> açılır; sayfadaki her <code>h3</code> alt başlık menüde görünür. İlerleme <strong>Dersi tamamla</strong> ile kaydedilir.",
    "Teknik terimler İngilizce bırakıldığında (ör. ransomware, MFA) bilinçli tercihtir — sertifikasyon ve iş ilanlarında aynı kelimeler geçer.",
    "Modül sonunda kendinizi sınama sorularını yanıtlamadan sonraki eğitime geçmeyin.",
) + """
<div class="edu-lesson-recap"><h3 id="intro-ozet"><i class="fas fa-check-double"></i> Giriş özeti</h3>
<p>Modül haritası, çalışma disiplini ve beklentiler netleşti. Ders 1 ile ortak güvenlik dili kurulmaya başlanır.</p>
<ul><li>Yedi derslik yapı</li><li>Not şablonu</li><li>CIA eşit derinlik taahhüdü</li></ul></div>
"""

# ---------- LESSON 1 ----------
L1_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>Siber güvenlik ve bilgi güvenliği (InfoSec) ayrımını gerekçelendirmek</li>
<li>Veri, sistem ve hizmet varlıklarını somut örneklerle sınıflandırmak</li>
<li>Tehdit, zafiyet, risk, exploit ve payload ilişkisini olay cümleleriyle kurmak</li>
<li>Teknoloji, süreç ve insan boyutunun savunmadaki rolünü açıklamak</li>
</ul></div>
<div class="edu-narrative enhanced-text">
<h3 id="ders1-buyuk-resim"><i class="fas fa-compass"></i> Ders 1 — Büyük resim</h3>
""" + P(
    "Bu ders, modülün omurgasıdır. Siber güvenliğin ne olduğunu, neyi koruduğunuzu ve olayları nasıl cümle kuracağınızı öğretir. CIA üçlüsü bir sonraki derste ayrı ve <strong>eşit derinlikte</strong> işlenir; burada önce <strong>ortak sözlük</strong> kurulur.",
    "Profesyonel ortamda “hacklendik” yerine şu dil kullanılır: Hangi <strong>varlık</strong> etkilendi? Hangi <strong>tehdit</strong> ve <strong>zafiyet</strong> devredeydi? <strong>Risk</strong> neden önceden yüksekti? Hangi <strong>CIA</strong> boyutu zarar gördü?",
    "Dijitalleşme her sektörü veri işleyen organizasyona dönüştürdü. Koruma; firewall satın almak değil, kimlik yönetimi, yedekleme disiplini, tedarikçi sözleşmeleri, çalışan farkındalığı ve hukuki uyumun bir arada tasarlanmasıdır.",
) + "</div><div class=\"edu-chapter-body enhanced-text\">"

L1_BODY += H3(
    "sg-tanim",
    "fa-shield-alt",
    "Siber güvenlik nedir?",
    "<strong>Siber güvenlik (Cybersecurity)</strong>, bilgisayar sistemlerini, ağları, uygulamaları ve verileri yetkisiz erişim, değiştirme veya hizmet kesintisine karşı korumak için uygulanan <strong>teknik, süreç ve insan</strong> önlemlerinin bütünüdür.",
    "Akademik ve endüstriyel tanımlar bazen “sanat ve bilim” diye özetlenir: <em>Bilim</em>, şifreleme, ağ protokolleri, zafiyet mekanizmaları bilgisidir. <em>Sanat</em>, iş önceliği, bütçe kısıtı ve insan faktörüyle denge kurmaktır — aynı teknik kontrol her kuruma uymaz.",
    "<strong>Bilgi güvenliği (Information Security)</strong> daha geniş çatıdır: kağıt arşiv, sözlü bilgi, fiziksel kilitli dolap da kapsama girer. Siber güvenlik, bilgi güvenliğinin dijital ve ağ bağlantılı alt kümesidir.",
    "Kurumsal ölçekte siber güvenlik; CISO öncülüğünde yürütülür ancak İK (ayrılış süreçleri), hukuk (sözleşmeler), satın alma (tedarikçi güvenliği) ve üst yönetim (risk kabulü) paydaştır. Tek ürün “tam koruma” vaadi gerçekçi değildir.",
)

L1_BODY += H3(
    "sg-infosec-fark",
    "fa-book",
    "Bilgi güvenliği ile fark",
    "Örnek: Hastane hasta dosyası fiziksel dolapta kilitli → bilgi güvenliği kontrolü. Aynı dosyanın taranmış PDF’i herkese açık bulutta → <strong>siber güvenlik + KVKK</strong> konusu.",
    "Her iki disiplinde de hedefler CIA ile ifade edilir; fark, koruma alanının genişliğindedir.",
)

L1_BODY += H3(
    "sg-uc-boyut",
    "fa-layer-group",
    "Teknoloji, süreç ve insan",
    "<strong>Teknoloji:</strong> Şifreleme, firewall, EDR, SIEM, IAM, yama yönetimi, DLP. En pahalı firewall, yanlış yapılandırılmış bulut bucket’ını korumaz.",
    "<strong>Süreç:</strong> Erişim onay workflow’u, yedekleme ve <em>restore testi</em>, olay bildirim prosedürü, ayrıcalıklı hesap (PAM) kaydı, işten ayrılışta hesap kapatma SLA’sı.",
    "<strong>İnsan:</strong> Farkındalık eğitimi, phishing simülasyonu, sosyal mühendislik direnci. İstatistikler hâlâ birçok olayda insan veya içeriden kaynaklı zayıflık gösterir.",
    "Üçü birlikte olmadan “güvenli” sayılmaz: MFA (teknik) varken çalışan parolayı Slack’te paylaşıyorsa (insan) yine olay çıkar.",
) + TBL(
    ["Boyut", "Örnek kontrol", "Başarısızlık belirtisi"],
    [
        ["Teknoloji", "TLS, disk şifreleme, EDR", "Açık RDP, eski TLS"],
        ["Süreç", "Access review, yedek testi", "Ayrılan çalışan AD hesabı açık"],
        ["İnsan", "Phishing tatbikatı", "Sahte fatura tıklanması"],
    ],
)

L1_BODY += H3(
    "varlik",
    "fa-gem",
    "Varlık (Asset) — neyi koruyoruz?",
    "<strong>Varlık</strong>, korunması gereken her değerdir. Envanter olmadan güvenlik bütçesi ve öncelik belirsiz kalır; “her yere firewall” yerine “kritik varlıklara odaklan” stratejisi gerekir.",
    "<strong>Veri:</strong> Müşteri PII, finans kaydı, kaynak kodu, sözleşme, sağlık dosyası. Sızıntı → gizlilik; yetkisiz değişiklik → bütünlük; kayıp (yedek yok) → erişilebilirlik.",
    "<strong>Sistem:</strong> Sunucu, laptop, veritabanı, firewall, OT cihazı. Sistem çökünce üzerindeki veri ve ürettiği hizmet birlikte etkilenir.",
    "<strong>Hizmet:</strong> Web sitesi, e-posta, ödeme, randevu, API. Kullanıcı “sisteme giremiyorum” dediğinde çoğu zaman hizmet varlığı konuşulur.",
    "Gözden kaçan varlıklar: <strong>itibar</strong>, <strong>iş sürekliliği</strong>, <strong>insan bilgisi</strong> (tek kişinin bildiği admin parolası), <strong>tedarikçi erişimi</strong>.",
) + EX(
    "Kuzey Lojistik (kurgusal vaka)",
    "Araç takip uygulaması = <strong>hizmet</strong>. Sunucu ve veritabanı = <strong>sistem</strong>. Konum ve rota kayıtları = <strong>veri</strong>.",
    "Güvenlik hedefleri: konum sızmaması (gizlilik), kayıt değiştirilmemesi (bütünlük), sürücünün panele erişmesi (erişilebilirlik). Tek satır “uygulama” envanteri yeterli değildir.",
)

L1_BODY += H3(
    "tehdit",
    "fa-user-ninja",
    "Tehdit (Threat)",
    "<strong>Tehdit</strong>, bir varlığa zarar verme <em>potansiyeli</em> taşıyan kişi, grup veya koşuldur. Saldırı gerçekleşmemiş olsa bile tehdit ortamı vardır (ör. günde binlerce başarısız giriş denemesi).",
    "Sınıflandırma eksenleri: kapasite (amatör / organize / devlet destekli), motivasyon (para, ideoloji, casusluk), yöntem (phishing, exploit, içeriden).",
    "Doğal tehditler (yangın, deprem, kesinti) siber değil ama <strong>erişilebilirlik</strong> hedefini etkiler — felaket kurtarma siber programının parçasıdır.",
    "<strong>Tehdit ≠ risk.</strong> Tehdit “dışarıda biri var”; risk “bizim için ne kadar kötü olur” sorusudur.",
)

L1_BODY += H3(
    "zafiyet",
    "fa-door-open",
    "Zafiyet (Vulnerability)",
    "<strong>Zafiyet</strong>, istismar edilebilir zayıflıktır. Yalnızca yazılım hatası (CVE) değildir.",
    "<strong>Teknik:</strong> Bilinen açık, zayıf parola politikası, açık port, SQL injection’a açık kod.",
    "<strong>Yapılandırma:</strong> Herkese açık S3 bucket, varsayılan admin şifresi, gereksiz domain admin yetkisi.",
    "<strong>Süreç/insan:</strong> Parola paylaşımı, patch penceresi yok, phishing’e tıklama, yedek testi yapılmaması.",
) + CALLOUT(
    "warning",
    "Yaygın yanılgı",
    "“Tüm sistemlerimiz güncel” demek, IAM hatalarını, süreç boşluklarını ve sosyal mühendisliği kapatmaz.",
)

L1_BODY += H3(
    "risk",
    "fa-balance-scale",
    "Risk — önceliklendirme dili",
    "<strong>Risk</strong>, tehdidin belirli zafiyet ve varlık bağlamında gerçekleşme olasılığı ile etkinin büyüklüğünün birlikte düşünülmesidir. <strong>Risk ≈ olasılık × etki</strong> (iş etkisi, regülasyon, itibar dahil).",
    "Aynı SQL injection açığı geliştirme ortamında düşük risk, canlı müşteri veritabanında kritik risk olabilir.",
    "Tedavi: <strong>azalt</strong> (kontrol ekle), <strong>transfer</strong> (sigorta), <strong>kabul et</strong> (yazılı, onaylı kalan risk), <strong>kaçın</strong> (faaliyeti durdur).",
) + H3(
    "exploit-payload",
    "fa-code",
    "Exploit, payload ve saldırı zinciri",
    "<strong>Exploit</strong>, zafiyeti tetikleyen teknik veya araçtır (özel HTTP isteği, phishing linki, kimlik avı sayfası).",
    "<strong>Payload</strong>, sızma sonrası asıl etkidir: veri şifreleme (ransomware), hesap açma, veri sızdırma, web sitesine sahte içerik.",
    "Olay raporunda ayrım netlik kazandırır: “Exploit başarılı, Cobalt Strike payload yüklendi.”",
    "<strong>Saldırı zinciri:</strong> Keşif → hazırlık → iletim → sızma → yerleşme → eylem. Her halkada savunma fırsatı vardır.",
    "<strong>Zero-day:</strong> Yaması bilinmeyen açık; imza tabanlı savunma yetmeyebilir — segmentasyon, davranış izleme, en az ayrıcalık şart.",
) + EX(
    "Ev benzetmesi",
    "Açık kapı = <strong>zafiyet</strong>. Hırsız = <strong>tehdit</strong>. Evdeki değer + girme ihtimali = <strong>risk</strong>. Alarm = <strong>kontrol</strong> (riski düşürür, sıfırlamaz).",
) + H3(
    "l1-sektor",
    "fa-building",
    "Sektörden sektöre öncelik",
    "Bankacılık: gizlilik, dolandırıcılık önleme, regülasyon. Hastane: hasta verisi gizliliği + sistem erişilebilirliği (hayati). Üretim: OT ağ segmentasyonu, sensör bütünlüğü. E-ticaret: ödeme ve müşteri verisi, Black Friday erişilebilirliği.",
    "Aynı CIA üçlüsü; ağırlıklar değişir — mimari karar sektöre göre yazılmalıdır.",
) + H3(
    "l1-kariyer",
    "fa-briefcase",
    "Kariyer yollarına bağlantı",
    "<strong>SOC analisti</strong> olay triyajı ve log korelasyonu. <strong>Güvenlik mimarı</strong> kontrol tasarımı. <strong>GRC</strong> uyumluluk ve politika. <strong>Pentester</strong> zafiyet bulma. Hepsi varlık–tehdit–risk–CIA dilini kullanır.",
) + TBL(
    ["Terim", "Türkçe karşılık / not"],
    [
        ["Asset", "Varlık"],
        ["Threat", "Tehdit"],
        ["Vulnerability", "Zafiyet"],
        ["Risk", "Risk (olasılık × etki)"],
        ["Exploit", "Zafiyeti tetikleyen yöntem"],
        ["Payload", "Sızma sonrası eylem"],
        ["Zero-day", "Bilinmeyen/yamasız açık"],
    ],
) + "</div><div class=\"edu-lesson-recap\"><h3 id=\"ders1-ozet\"><i class=\"fas fa-check-double\"></i> Bu bölümde neler öğrendik?</h3><p>Ders 1 ortak güvenlik dilini kurdu. Ders 2’de CIA’nın üç boyutu aynı derinlikte işlenecek.</p><ul><li>Tanım ve InfoSec farkı</li><li>Varlık sınıfları ve envanter</li><li>Tehdit, zafiyet, risk, exploit, payload</li><li>Üç savunma boyutu</li></ul></div>"

CIA_VISUAL = """
<div class="cia-triad-visual" role="img" aria-label="CIA üçlüsü">
<div class="cia-pillar confidentiality"><i class="fas fa-lock"></i><span>Gizlilik</span></div>
<div class="cia-pillar integrity"><i class="fas fa-check-double"></i><span>Bütünlük</span></div>
<div class="cia-pillar availability"><i class="fas fa-plug"></i><span>Erişilebilirlik</span></div>
</div>
"""

def _cia_pillar(hid, icon, title, *paras):
    return H3(hid, icon, title, *paras)

L_CIA_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>Gizlilik, bütünlük ve erişilebilirliği ayrı ayrı tanımlamak ve örneklemek</li>
<li>Her CIA boyutu için teknik ve organizasyonel kontrolleri listelemek</li>
<li>Çoklu boyut etkilenen olayları (ransomware, DDoS, veri sızıntısı) analiz etmek</li>
<li>CIA dengesi ve mimari önceliklendirme çelişkilerini tartışmak</li>
</ul></div>
<div class="edu-narrative enhanced-text">
<h3 id="ders2-cia-buyuk-resim"><i class="fas fa-compass"></i> Ders 2 — CIA üçlüsü</h3>
""" + P(
    "CIA (Confidentiality, Integrity, Availability) onlarca yıldır bilgi güvenliğinin <strong>denge çerçevesidir</strong>. Her kontrol tasarımında en az bir boyuta hizmet eder; çoğu kontrol ikisine birden dokunur.",
    "Bu derste <strong>gizlilik, bütünlük ve erişilebilirlik aynı uzunlukta</strong> işlenir. Kısa eğitimlerde sık görülen hata: gizliliği uzun anlatıp bütünlük ve erişilebilirliği bir paragrafa sıkıştırmak. Burada üçü de eşit ağırlıktadır.",
    "Olay analizinde standart soru: Hangi CIA boyutu zarar gördü? Bazen üçü birden (ör. ransomware). “Sadece veri çalındı” varsayımı tehlikelidir.",
) + "</div>" + CIA_VISUAL + '<div class="edu-chapter-body enhanced-text">'

L_CIA_BODY += H3(
    "cia-genel",
    "fa-triangle",
    "CIA üçlüsüne giriş",
    "Üçlü birbirini tamamlar; biri eksikse güvenlik iddiası zayıflar.",
    "Şifreleme ve erişim kontrolü → <strong>gizlilik</strong>. Hash, dijital imza, audit log → <strong>bütünlük</strong>. Yedek, yük dengeleme, DR → <strong>erişilebilirlik</strong>.",
    "Kontrol eşlemesi örneği: TLS hem gizlilik (dinleme) hem bütünlük (aktif müdahale) sağlar. MFA gizliliği artırır; yanlış yapılandırılmışsa erişilebilirliği düşürür (kilitlenme).",
)

L_CIA_BODY += _cia_pillar(
    "cia-gizlilik",
    "fa-lock",
    "Gizlilik (Confidentiality)",
    "<strong>Gizlilik</strong>, bilginin yalnızca yetkili kişi, süreç ve sistemler tarafından görülebilmesidir. İhlal: yetkisiz okuma, kopyalama, ifşa, dinleme veya çıkarım (metadata’dan bile).",
    "<strong>Durağan veri şifreleme:</strong> Disk (BitLocker, LUKS), veritabanı TDE, bulut bucket şifreleme. Anahtar yönetimi (KMS, HSM) gizliliğin omurgasıdır — şifreli veri + anahtar aynı yerdeyse fayda sınırlıdır.",
    "<strong>İletimde şifreleme:</strong> TLS 1.2+ (tercihen 1.3), VPN tünelleri, API HTTPS zorunluluğu. MitM saldırılarında paket içeriği okunamaz.",
    "<strong>Erişim kontrolü:</strong> RBAC (role), ABAC (attribute — departman, lokasyon). Minimum veri ilkesi: ekranda yalnızca iş için gereken alanlar. Maskeleme: destek ekranında kartın son 4 hanesi.",
    "<strong>Organizasyonel:</strong> Veri sınıflandırması (genel / dahili / gizli / çok gizli), NDA, tedarikçi DPA, fiziksel erişim kartı, temiz masa.",
    "Örnek ihlaller: Veritabanı dump’ının dark web’de satılması; çalışanın hasta kaydı ekran görüntüsü; herkese açık S3 bucket; yanlış paylaşılan SharePoint linki. KVKK/GDPR kapsamında bildirim ve idari para cezası gündeme gelir.",
    "Gizlilik tek başına yeterli değildir: Veri sızmamış ama <em>değiştirilmiş</em> (bütünlük) veya sistem kapalı (erişilebilirlik) olabilir.",
    "Gizlilik ↔ erişilebilirlik çelişkisi: Aşırı kısıtlama işi yavaşlatır. Çözüm: rol bazlı erişim, MFA, acil <strong>break-glass</strong> hesap prosedürü (kullanım sonrası denetim).",
    "İçeriden tehdit: Meşru hesapla veri indirme — DLP, davranış analizi, erişim logu şart.",
) + TBL(
    ["Kontrol", "Gizlilik katkısı", "Tipik hata"],
    [
        ["TLS", "İletimde dinleme engeli", "Eski TLS, sertifika süresi"],
        ["Disk şifreleme", "Çalıntı cihaz", "Anahtar recovery zayıf"],
        ["MFA", "Çalıntı parola", "SMS OTP SIM swap"],
        ["DLP", "Exfil tespiti", "Politika tanımsız"],
    ],
) + EX(
    "Gizlilik — Anadolu Sağlık (kurgu)",
    "Gece vardiyasında hemşire, 200 hasta kaydını USB’ye kopyaladı — teknik zafiyet yok, <strong>yetkili hesap kötüye kullanımı</strong>.",
    "Etki: <em>Gizlilik</em> ihlali; kayıtlar değiştirilmediyse bütünlük ayrı; sistem çalışıyorsa erişilebilirlik ayrı.",
    "Kontroller: DLP uyarısı, USB politikası, erişim logu incelemesi, işten çıkarma sürecinde hesap kapatma.",
)

L_CIA_BODY += _cia_pillar(
    "cia-butunluk",
    "fa-check-double",
    "Bütünlük (Integrity)",
    "<strong>Bütünlük</strong>, verinin ve sistemlerin yetkisiz veya hatalı şekilde değiştirilmediğinin güvencesidir: doğru, tam, güvenilir ve değişikliklerin izlenebilir olduğu veri.",
    "<strong>Hash ve checksum:</strong> SHA-256 ile dosya bütünlüğü; indirilen yazılım paketinin hash’i yayıncı sitesiyle karşılaştırılır.",
    "<strong>Dijital imza ve PKI:</strong> Kod imzalama, e-posta S/MIME, firmware imzası — sahte paket tespiti.",
    "<strong>Audit log:</strong> Kim, ne zaman, hangi kaydı değiştirdi? WORM / immutable log hedef saldırganın iz silmesini zorlaştırır.",
    "<strong>Uygulama ve veritabanı:</strong> Transaction ACID, foreign key, optimistic locking. Sürüm kontrolü (Git) kaynak kod bütünlüğü.",
    "Bütünlük saldırıları gizlilik kadar görünür olmayabilir: Muhasebe satırında küçük tutar oynaması; üretim sensör değeri manipülasyonu; web sitesine sahte duyuru; yazılım güncellemesine backdoor.",
    "<strong>Ransomware:</strong> Hem bütünlük (dosyalar şifrelenir/değişir) hem erişilebilirlik (kullanılamaz). “Sadece sızdı” varsayımı yanlış triyajdır.",
    "Bütünlük ↔ erişilebilirlik: Her değişiklik için çok katmanlı onay bütünlüğü artırır, acil yamayı geciktirir. Acil değişiklik penceresi + otomasyon tanımlanmalı.",
    "Pratik soru: “Bu rapordaki rakama güvenebilir miyim?” — Evet ise bütünlük kontrolleri işliyor demektir.",
) + TBL(
    ["Kontrol", "Bütünlük katkısı", "Tipik hata"],
    [
        ["Hash / imza", "Paket sahteciliği", "İmza doğrulama kapalı"],
        ["Audit log", "Kim değiştirdi", "Log silinebilir depo"],
        ["WORM", "Değişmez arşiv", "Maliyet göz ardı"],
        ["Code signing", "Supply chain", "Geliştirici anahtarı sızıntısı"],
    ],
) + EX(
    "Bütünlük — muhasebe manipülasyonu",
    "Saldırgan müşteri listesini çalmadı; gece toplam satırını %0,3 düşürdü — aylarca fark edilmedi.",
    "Etki: <em>Bütünlük</em>; gizlilik ayrı değerlendirilir.",
    "Kontroller: SoD (tek kişi hem giriş hem onay yapamaz), anomali raporu, immutable log.",
)

L_CIA_BODY += _cia_pillar(
    "cia-erisilebilirlik",
    "fa-plug",
    "Erişilebilirlik (Availability)",
    "<strong>Erişilebilirlik</strong>, yetkili kullanıcıların ve süreçlerin ihtiyaç duyduğu anda sisteme ve veriye ulaşabilmesidir. Hizmet üretilemiyorsa diğer CIA hedefleri pratikte anlamsızlaşır.",
    "<strong>Yedekleme ve restore testi:</strong> Yedek almak yetmez; çeyreklik restore tatbikatı şart. Ransomware yedekleri de hedefler — offline/immutable yedek.",
    "<strong>Felaket kurtarma (DR):</strong> Coğrafi yedeklilik, runbook, iletişim planı. <strong>RTO</strong> (ne kadar sürede ayağa kalkmalı), <strong>RPO</strong> (ne kadar veri kaybı kabul edilir) — SLA’lar bu metriklerle yazılır.",
    "<strong>Kapasite ve yük:</strong> Load balancer, otomatik ölçekleme, Black Friday kapasite planı. Tek sunucu = tek arıza noktası.",
    "<strong>DDoS:</strong> Hacim saldırısı erişilebilirliği hedefler. WAF, CDN, scrubbing, ISP iş birliği.",
    "<strong>Fiziksel ve enerji:</strong> UPS, jeneratör, yangın. Veri merkezi yangını — erişilebilirlik olayı, siber değil ama programınızda DR ile birlikte düşünülür.",
    "Örnek ihlaller: DDoS ile e-ticaret çöküşü; ransomware ile şifreli sunucular; yanlış yama sonrası ERP’nin günlerce kapalı kalması.",
    "Hastane randevu sistemi çalışmıyorsa veri sızmamış olsa bile <em>erişilebilirlik</em> ihlalidir; can güvenliği önceliği kritik.",
    "Erişilebilirlik ↔ gizlilik: Felaket tatbikatı planlı kesinti; müşteri ve regülatöre önceden iletişim.",
) + TBL(
    ["Kontrol", "Erişilebilirlik katkısı", "Metrik"],
    [
        ["Yedek + restore test", "DR", "RPO / RTO"],
        ["Load balancer", "Tek nokta arızası", "Uptime %"],
        ["Anti-DDoS", "Hacim saldırısı", "Mitigation süresi"],
        ["Kapasite planı", "Pik trafik", "Latency SLA"],
    ],
) + EX(
    "Erişilebilirlik — Black Friday",
    "Ödeme API’si 6 saat yanıt vermedi — gelir kaybı, itibar zararı.",
    "Önlem: kapasite testi, WAF, rate limit, runbook. Etki: <em>erişilebilirlik</em>; müşteri kartı sızmamış olsa gizlilik ayrı.",
)

L_CIA_BODY += H3(
    "cia-denge",
    "fa-balance-scale",
    "CIA dengesi ve mimari öncelik",
    "Ek şifreleme felaket kurtarmayı zorlaştırabilir (anahtar yönetimi). Sıkı onay bütünlüğü artırır, acil müdahaleyi geciktirir.",
    "Mimari karar belgesinde yazılı olmalı: Bu sistem için öncelik sırası (ör. hastane: erişilebilirlik &gt; gizlilik &gt; bütünlük tartışması yönetimle).",
    "Bulutta paylaşılan sorumluluk: IaaS’ta ağ ve OS sizde; SaaS’ta uygulama sağlayıcıda — CIA hedeflerini sözleşmede netleştirin.",
) + CALLOUT(
    "tip",
    "Pratik kural",
    "Her yeni kontrol için üç soru: Gizliliği artırıyor mu? Bütünlüğü? Erişilebilirliği? Hepsi hayırsa kontrolü sorgulayın.",
) + "</div><div class=\"edu-lesson-recap\"><h3 id=\"ders2-cia-ozet\"><i class=\"fas fa-check-double\"></i> Bu bölümde neler öğrendik?</h3><p>CIA’nın üç bileşeni eşit derinlikte işlendi.</p><ul><li>Gizlilik: şifreleme, erişim, DLP, içeriden</li><li>Bütünlük: hash, imza, log, ransomware çift etki</li><li>Erişilebilirlik: yedek, DR, DDoS, RTO/RPO</li><li>Denge ve önceliklendirme</li></ul></div>"

L2_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>Malware türlerini davranış ve etkiye göre ayırt etmek</li>
<li>Phishing ve sosyal mühendislik vektörlerini tanımak</li>
<li>Tehdit aktörlerini motivasyon ve kapasiteye göre sınıflandırmak</li>
<li>Saldırı zinciri / Kill Chain üzerinden savunma noktalarını göstermek</li>
</ul></div>
<div class="edu-narrative enhanced-text"><h3 id="ders3-buyuk-resim"><i class="fas fa-compass"></i> Ders 3 — Tehdit ortamı</h3>
""" + P(
    "“Virüs var” demek olay analizi değildir. Profesyonel dil: hangi malware ailesi, hangi vektör, hangi aktör, hangi varlık, hangi CIA boyutu.",
    "Aynı teknik (ör. phishing) script kiddie ile fidye grubu tarafından farklı amaçla kullanılır. Sınıflandırma panik değil <strong>önceliklendirme</strong> içindir.",
    "Savunma katmanlıdır: e-posta filtre → macro engeli → EDR → segmentasyon → yedek → farkındalık. Tek ürün yeterli değildir.",
) + '</div><div class="edu-chapter-body enhanced-text">'

L2_BODY += H3(
    "malware",
    "fa-virus",
    "Malware ailesi — detaylı sınıflandırma",
    "<strong>Virüs:</strong> Başka dosyaya bulaşır, kullanıcı dosyayı çalıştırınca yayılır. Günümüzde oran düştü; hâlâ USB/autorun senaryolarında görülür.",
    "<strong>Solucan (Worm):</strong> Ağ protokolü veya zafiyet ile kendi kendine yayılır (WannaCry, EternalBlue). Segmentasyon ve yama kritik.",
    "<strong>Trojan:</strong> Masum yazılım gibi (crack, sahte PDF). Kullanıcı bilinçli çalıştırır — sosyal mühendislik.",
    "<strong>Ransomware:</strong> Şifreleme + fidye. Çift etki: bütünlük + erişilebilirlik. Yaşam döngüsü: ilk erişim → yatay hareket → yedek silme → toplu şifreleme → fidye notu.",
    "<strong>Spyware / infostealer:</strong> Tarayıcı çerezi, parola, kripto cüzdan. Gizlilik hedefi.",
    "<strong>Rootkit / bootkit:</strong> Derin gizlenme; tespit zor. EDR + güvenilir önyükleme.",
    "<strong>Botnet:</strong> Cihazları C2 sunucusuna bağlar; DDoS, spam, kripto madenciliği.",
    "<strong>Fileless:</strong> Disk izi minimum; PowerShell, WMI, bellekte payload. İmza AV yetmez; davranış + EDR.",
)

L2_BODY += H3(
    "phishing-detay",
    "fa-fish",
    "Phishing ve sosyal mühendislik",
    "<strong>Phishing:</strong> Toplu e-posta, sahte giriş sayfası. <strong>Spear phishing:</strong> Hedefli (isim, proje referansı). <strong>Whaling:</strong> Üst yönetim. <strong>CEO fraud:</strong> Acil havale.",
    "<strong>Vishing:</strong> Sesli arama (“IT destek, parolanızı söyleyin”). <strong>Smishing:</strong> SMS link. <strong>Pretexting:</strong> Uydurma senaryo (kargo, vergi).",
    "Kırmızı bayraklar: aciliyet, garip gönderen domain, beklenmeyen ek, URL hover farkı, ödül vaadi.",
    "Kurumsal savunma: DMARC/SPF/DKIM, e-posta sandbox, macro engeli, “Phishing raporla” butonu, yıllık simülasyon + metrik.",
) + H3(
    "vektorler",
    "fa-envelope",
    "Saldırı vektörleri",
    "<strong>İnsan odaklı:</strong> Phishing, USB drop, tailgating.",
    "<strong>Uygulama:</strong> SQL injection, XSS, CSRF, API zafiyeti — OWASP Top 10 çerçevesi.",
    "<strong>Ağ:</strong> MitM (kafe Wi‑Fi), açık RDP, SNMP default community.",
    "<strong>Kimlik:</strong> Brute force, credential stuffing (sızdırılmış parola listesi) — MFA şart.",
    "<strong>Tedarik zinciri:</strong> Güncelleme sunucusu, SaaS, HVAC (Target 2013). Üçüncü taraf = sizin saldırı yüzeyiniz.",
    "Vektör ≠ payload: Tıklama vektör; asıl eylem bulut veya Active Directory üzerinde.",
)

L2_BODY += H3(
    "aktorler",
    "fa-user-secret",
    "Tehdit aktörleri",
    "<strong>Script kiddie:</strong> Hazır araç, düşük olgunluk, gürültülü.",
    "<strong>Hacktivist:</strong> Defacement, DDoS — itibar ve erişilebilirlik.",
    "<strong>Organize suç / ransomware-as-a-service:</strong> Finans motivasyonu, çift fidye (şifreleme + sızdırma).",
    "<strong>APT (Advanced Persistent Threat):</strong> Uzun süre gizli, hedefli, casusluk / IP hırsızlığı.",
    "<strong>İçeriden (insider):</strong> Meşru hesap; DLP ve davranış analizi zorunlu.",
    "MICE çerçevesi: Money, Ideology, Coercion, Ego — motivasyon savunma önceliğini şekillendirir.",
) + H3(
    "saldiri-zinciri-tehdit",
    "fa-link",
    "Saldırı zinciri ve Kill Chain",
    "Lockheed Martin Kill Chain: Keşif → silahlandırma → teslimat → sızma → kurulum → komuta-kontrol (C2) → eylem.",
    "MITRE ATT&CK: Taktik ve teknik kütüphanesi; SOC ve kırmızı takım ortak dil.",
    "Her aşamada tespit fırsatı: anormal DNS, yeni servis, lateral movement, veri dışarı akışı.",
) + EX(
    "NotPetya (2017) — ders",
    "Başlangıç tedarikçi yazılımı; global yayıldı. Yedek ve segmentasyon “liste maddesi” değil — iş durdu.",
    "CIA: erişilebilirlik ve bütünlük ağır; gizlilik ikincil. Teknik + süreç + DR birlikte.",
) + TBL(
    ["Aktör", "Motivasyon", "Tipik hedef", "Savunma odağı"],
    [
        ["APT", "Casusluk", "IP, devlet", "Segmentasyon, EDR, intel"],
        ["Ransomware", "Fidye", "KOBİ, sağlık", "Yedek, MFA, e-posta"],
        ["İçeriden", "Para/intikam", "Veri", "DLP, access review"],
        ["Hacktivist", "İdeoloji", "Web, PR", "WAF, izleme"],
    ],
) + '</div><div class="edu-lesson-recap"><h3 id="ders3-ozet"><i class="fas fa-check-double"></i> Özet</h3><p>Tehdit sınıflandırması ve katmanlı savunma netleşti.</p><ul><li>Malware ailesi</li><li>Phishing ve vektörler</li><li>Aktörler ve zincir</li></ul></div>'

L3_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>Katmanlı savunmayı somut kontrollerle ilişkilendirmek</li>
<li>En az ayrıcalık ve sıfır güveni karşılaştırmak</li>
<li>Görev ayrımı ve güvenli varsayılanı örneklemek</li>
</ul></div>
<div class="edu-narrative enhanced-text"><h3 id="ders4-buyuk-resim"><i class="fas fa-compass"></i> Ders 4 — Savunma prensipleri</h3>
""" + P(
    "Prensipler ürün değil <strong>mimari karardır</strong>. “Tek firewall yeter” miti burada çökertilir.",
    "Katmanlı savunma + en az ayrıcalık + sıfır güven modern kurumsal mimarinin üç ayağıdır; SoD ve fail secure tamamlar.",
) + '</div><div class="edu-chapter-body enhanced-text">'

L3_BODY += H3(
    "did",
    "fa-layer-group",
    "Katmanlı savunma (Defense in Depth)",
    "Tek duvar yeterli değil. Katmanlar: fiziksel, ağ, uç nokta, uygulama, veri, kimlik, insan.",
    "Örnek zincir: Phishing e-postası → filtre (1) → kullanıcı raporu (2) → macro engel (3) → EDR (4) → segmentasyon (5) → yedek (6). Bir katman düşerse diğeri sınırlar veya tespit eder.",
    "Her katman farklı CIA boyutuna hizmet eder; tasarımda eşleme yapın.",
) + TBL(
    ["Katman", "Örnek", "CIA"],
    [
        ["Ağ", "Firewall, IDS/IPS", "Sınırlandırma"],
        ["Kimlik", "IAM, MFA", "Gizlilik"],
        ["Uç nokta", "EDR, disk şifre", "Gizlilik + bütünlük"],
        ["Uygulama", "WAF, SAST/DAST", "Bütünlük"],
        ["Veri", "DLP, şifreleme", "Gizlilik"],
    ],
)

L3_BODY += H3(
    "lp",
    "fa-user-lock",
    "En az ayrıcalık (Least Privilege)",
    "Varsayılan minimum yetki. RBAC rolleri; düzenli access review (çeyreklik).",
    "Ayrılış SLA: 24 saat içinde hesap kapatma. PAM: admin oturumu kayıtlı, süreli, onaylı.",
    "Domain Admin herkese verilmez. Servis hesapları için güçlü parola + rotation.",
)

L3_BODY += H3(
    "zt",
    "fa-shield-halved",
    "Sıfır güven (Zero Trust)",
    "Never trust, always verify. Konum (ofis/VPN) güven sinyali değil; kimlik + cihap durumu + bağlam.",
    "MFA, mikro segmentasyon, sürekli doğrulama, cihaz uyumluluğu (MDM). Geçiş aşamalı — legacy uygulamalar planlanır.",
    "VPN “içerideyim güvenliyim” modelini kırar; lateral movement zorlaşır.",
)

L3_BODY += H3(
    "diger-prensipler",
    "fa-list",
    "Diğer temel prensipler",
    "<strong>Görev ayrımı (SoD):</strong> Tek kişi hem ödeme oluşturup hem onaylayamaz.",
    "<strong>Fail secure / fail safe:</strong> Arıza güvenli kilit modunda.",
    "<strong>Güvenli varsayılan:</strong> Yeni kaynak kapalı; açık port yok.",
    "<strong>Need to know:</strong> Rol değil görev bazlı veri erişimi.",
    "<strong>Economy of mechanism:</strong> Basit tasarım daha az hata.",
) + EX("Target (2013)", "HVAC tedarikçisi yolu — segmentasyon ve tedarikçi riski prensip ihlalinin bedeli.") + '</div><div class="edu-lesson-recap"><h3 id="ders4-ozet"><i class="fas fa-check-double"></i> Özet</h3><p>Prensipler operasyonel dile çevrildi.</p><ul><li>DiD</li><li>Least privilege</li><li>Zero trust</li><li>SoD</li></ul></div>'

L4_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>Risk değerlendirme sürecini adım adım uygulamak</li>
<li>Risk matrisi ile önceliklendirme yapmak</li>
<li>Azalt, transfer, kabul, kaçın seçeneklerini gerekçelendirmek</li>
</ul></div>
<div class="edu-narrative enhanced-text"><h3 id="ders5-buyuk-resim"><i class="fas fa-compass"></i> Ders 5 — Risk yönetimi</h3>
""" + P(
    "Güvenlik ekibi “her şeyi kapat” diyemez. Risk dili yönetime “bu çeyrekte şu 3 yatırım” der.",
    "CVSS teknik önem verir; iş riski müşteri, regülasyon, itibar ve süreklilik içerir — ikisi birlikte okunur.",
) + '</div><div class="edu-chapter-body enhanced-text">'

L4_BODY += H3(
    "risk-surec",
    "fa-list-ol",
    "Risk değerlendirme süreci",
    "1) Varlık envanteri ve sahiplik. 2) Tehdit ve zafiyet eşleştirme. 3) Mevcut kontroller. 4) Etki (1–5). 5) Olasılık (1–5). 6) Risk skoru. 7) Tedavi planı. 8) Kalan risk izleme.",
    "ISO 27005 ve NIST RMF bu döngüyü standartlaştırır. Yıllık veya olay sonrası yenileme.",
)

L4_BODY += H3(
    "risk-matris",
    "fa-table",
    "Risk matrisi",
    "5×5 matris: yüksek olasılık + yüksek etki = acil (P1). Düşük/düşük = izle veya kabul (dokümante).",
    "Renk kodları yönetim kurulunda anlaşılır dil sağlar.",
)

L4_BODY += H3(
    "risk-ornek",
    "fa-store",
    "Vaka: e-ticaret müşteri veritabanı",
    "Varlık: Canlı PostgreSQL, 500K PII. Tehdit: SQLi, credential stuffing. Zafiyet: eski ORM, parola reuse.",
    "Etki: 5 (KVKK, itibar, gelir). Olasılık: 3. Skor: yüksek.",
    "Tedavi bu çeyrek: WAF, kod inceleme, MFA, şifreleme, yedek testi. Kalan risk: sıfır değil — yönetim kurulu yazılı kabul.",
)

L4_BODY += H3(
    "kalan-risk",
    "fa-chart-pie",
    "Kalan risk",
    "Kontrol sonrası risk sıfır olmaz. Tehdit ortamı değişince (yeni APT kampanyası) skor yenilenir.",
)

L4_BODY += H3(
    "tedavi",
    "fa-hand-holding-medical",
    "Tedavi seçenekleri",
    "<strong>Azalt:</strong> Kontrol ekle. <strong>Transfer:</strong> Sigorta, outsource (risk paylaşımı). <strong>Kabul:</strong> Yazılı, onaylı, süreli. <strong>Kaçın:</strong> Faaliyeti durdur.",
) + CALLOUT("warning", "Yaygın hata", "CVSS 9.8 = otomatik P1 değil; iş etkisi düşükse öncelik düşebilir.") + '</div><div class="edu-lesson-recap"><h3 id="ders5-ozet"><i class="fas fa-check-double"></i> Özet</h3><p>Risk köprüsü kuruldu.</p><ul><li>Süreç</li><li>Matris</li><li>Tedavi</li></ul></div>'

L5_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>Politika, standart, prosedür, kılavuz ayrımını yapmak</li><li>KVKK ve ISO 27001 ile politika ilişkisini kurmak</li><li>Tedarikçi güvenliğini değerlendirmek</li>
</ul></div>
<div class="edu-narrative enhanced-text"><h3 id="ders6-buyuk-resim"><i class="fas fa-compass"></i> Ders 6 — Yönetişim</h3>
""" + P(
    "Teknik kontrol politika olmadan sürdürülmez. MFA “isteğe bağlı” kalırsa olay kaçınılmazdır.",
    "Politika “ne”, standart “minimum nasıl”, prosedür “adım adım”, kılavuz “öneri” der.",
) + '</div><div class="edu-chapter-body enhanced-text">'

L5_BODY += H3(
    "politika-tur",
    "fa-file-contract",
    "Belge hiyerarşisi",
    "<strong>Politika:</strong> Üst yönetim onaylı (“Tüm uzaktan erişim MFA”). <strong>Standart:</strong> TLS 1.2+, parola uzunluğu. <strong>Prosedür:</strong> Olay bildirimi 1-2-3. <strong>Kılavuz:</strong> Parola yöneticisi önerisi.",
)

L5_BODY += H3(
    "au",
    "fa-user-check",
    "Kabul edilebilir kullanım (AUP)",
    "Kişisel cihaz (BYOD), sosyal medya, USB, bulut depolama kuralları. İhlal disiplin sürecine bağlanır.",
)

L5_BODY += H3(
    "uyumluluk",
    "fa-balance-scale",
    "Uyumluluk çerçeveleri",
    "ISO 27001 ISMS, SOC 2 güven, PCI-DSS ödeme, KVKK kişisel veri. Ortak soru: politika var mı, kanıtlanıyor mu?",
    "KVKK: aydınlatma, açık rıza, minimizasyon, ihlal bildirimi (72 saat). Politika metni hukuk + IT ortak.",
)

L5_BODY += H3(
    "gizlilik-politikasi",
    "fa-user-shield",
    "Veri saklama ve silme",
    "Ne kadar süre, kim erişir, nasıl silinir — prosedürde net. Unutulma hakkı iş akışı.",
)

L5_BODY += H3(
    "tedarikci",
    "fa-handshake",
    "Tedarikçi riski",
    "SOC 2 raporu, güvenlik anketi, erişim sınırı, veri işleme sözleşmesi, düzenli gözden geçirme.",
) + '</div><div class="edu-lesson-recap"><h3 id="ders6-ozet"><i class="fas fa-check-double"></i> Özet</h3><p>Yönetişim tamamlandı.</p><ul><li>Hiyerarşi</li><li>KVKK</li><li>Tedarikçi</li></ul></div>'

L6_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Bu derste hedeflenen kazanımlar</h3><ul>
<li>IR aşamalarını sıralamak ve playbook mantığını açıklamak</li><li>IR ekibi rollerini tanımlamak</li><li>SIEM, EDR ve forensics rolünü ilişkilendirmek</li>
</ul></div>
<div class="edu-narrative enhanced-text"><h3 id="ders7-buyuk-resim"><i class="fas fa-compass"></i> Ders 7 — Olay müdahalesi</h3>
""" + P(
    "Panik yerine playbook. İlk 24 saat: sınırla, kanıt topla, iletişim, kök neden, iyileştir.",
    "Olay = güvenlik ihlali veya politika ihlali; olay değil “alarm” — triyaj şart.",
) + '</div><div class="edu-chapter-body enhanced-text">'

L6_BODY += H3(
    "ir-asamalar",
    "fa-list-check",
    "NIST tarzı aşamalar",
    "<strong>1. Hazırlık:</strong> Plan, playbook, iletişim listesi, tatbikat. <strong>2. Tespit:</strong> SIEM, EDR, kullanıcı. <strong>3. Analiz:</strong> Kapsam, IOC, zaman çizelgesi. <strong>4. Sınırlandırma:</strong> İzolasyon, hesap kilidi. <strong>5. Ortadan kaldırma:</strong> Malware, kalıcı erişim. <strong>6. Kurtarma:</strong> Restore, doğrulama. <strong>7. Ders:</strong> Post-mortem, KPI.",
)

L6_BODY += H3(
    "ir-ekip",
    "fa-users",
    "Ekip ve roller",
    "Olay yöneticisi, analist, forensics, hukuk, iletişim, üst yönetim. Chain of custody delil bütünlüğü.",
)

L6_BODY += H3(
    "ir-araclar",
    "fa-tools",
    "Araçlar",
    "SIEM korelasyon, EDR uç nokta, forensics disk imajı, ticketing izlenebilirlik.",
)

L6_BODY += H3(
    "ir-iletisim",
    "fa-bullhorn",
    "İletişim",
    "Regülatör, müşteri, medya planı önceden. Tek sözcü kuralı. KVKK bildirimi.",
)

L6_BODY += H3(
    "ir-tatbikat",
    "fa-dumbbell",
    "Tatbikat",
    "Tabletop: “Saat 03:00 ransomware.” Playbook: kim izole eder, yedek RTO. Tatbikat olmadan plan kağıt.",
) + EX("Maersk / NotPetya", "Yedek ve DR — erişilebilirlik ve bütünlük kurtarmasının değeri.") + '</div><div class="edu-lesson-recap"><h3 id="ders7-ozet"><i class="fas fa-check-double"></i> Özet</h3><p>IR döngüsü tamam.</p><ul><li>Aşamalar</li><li>Ekip</li><li>Tatbikat</li></ul></div>'

OZET_BODY = """
<div class="learning-objectives"><h3><i class="fas fa-bullseye"></i> Modül sentezi</h3><ul>
<li>Tüm kazanımları tek olay hikâyesinde birleştirmek</li><li>Sonraki SEBS modüllerine hazırlık</li>
</ul></div>
<div class="edu-narrative enhanced-text"><h3 id="modul-ozet-sentez"><i class="fas fa-layer-group"></i> Tek hikâye</h3>
""" + P(
    "<strong>Varlık</strong> envanteri → <strong>tehdit</strong> + <strong>zafiyet</strong> → <strong>risk</strong> skoru → kontroller (CIA eşit, prensipler, politika) → olay olursa <strong>IR</strong>.",
    "Her yeni modülde sorun: Hangi CIA? Tehdit mi zafiyet mi risk mi?",
) + '</div><div class="edu-chapter-body enhanced-text">'

OZET_BODY += H3(
    "kendinizi-sinayin",
    "fa-clipboard-check",
    "Kendinizi sınayın",
    "Aşağıdaki soruları kendi cümlelerinizle yanıtlayın; kopyala-yapıştır değil.",
) + TBL(
    ["Soru", "Beklenen derinlik"],
    [
        ["CIA üçlüsünü örnekle", "G, B, E ayrı ayrı, eşit"],
        ["Tehdit vs risk", "Potansiyel vs olasılık×etki"],
        ["DiD vs zero trust", "Katman vs sürekli doğrulama"],
        ["IR en az 6 adım", "Hazırlık → ders"],
        ["Ransomware hangi CIA", "B + E, sıklıkla G"],
        ["İçeriden tehdit", "DLP, access review"],
    ],
) + CALLOUT("tip", "Sonraki adım", "Güncel Siber Güvenliğe Giriş, Temel Network veya simülasyonlarla pekiştirin.") + '</div><div class="edu-lesson-recap"><h3 id="modul-ozet-final"><i class="fas fa-check-double"></i> Modül tamamlandı</h3><p>Temel Siber Güvenlik modülünü eksiksiz tamamladınız.</p><ul><li>Sentez</li><li>Öz değerlendirme</li><li>Yol haritası</li></ul></div>'
