#!/usr/bin/env python3
"""Expand Temel Siber Güvenlik module — editorial pass for all lessons."""
from pathlib import Path
import re

path = Path(__file__).resolve().parents[1] / 'frontend/modules/temel-siber-guvenlik.html'
text = path.read_text(encoding='utf-8')

# --- Fix broken <p> + enhanced-text + trailing fragment ---
def fix_split_paragraph(text, start_fragment, expand_id, merged_paragraphs):
    """Remove broken pattern: <p>fragment<div expand>...</div> trailing</p>"""
    pat = (
        rf'<p>{re.escape(start_fragment)}'
        rf'\s*<div class="enhanced-text" data-sebs-expand="{expand_id}">'
        rf'(.*?)</div>\s*'
        rf'[^<]*</p>'
    )
    replacement = (
        f'<div class="enhanced-text" data-sebs-expand="{expand_id}">\n'
        + merged_paragraphs
        + '\n                        </div>'
    )
    new, n = re.subn(pat, replacement, text, count=1, flags=re.DOTALL)
    return new, n

FIXES = [
    ('Siber tehditler, sistemlere', 'l2-giris', '''<p><strong>Siber tehdit</strong>, varlığınıza zarar verme kapasitesi ve niyeti olan her kaynaktır: otomatik botlar, fidye yazılımı dağıtan örgütler, içeriden bilgi sızdıran çalışan veya yanlışlıkla firewall kuralını silen yönetici. Tehdit, henüz başarılı saldırı olmayabilir — binlerce başarısız giriş denemesi de tehdit ortamıdır.</p>
                            <p>Sınıflandırma amacı sınırsız korku listesi üretmek değil; <strong>doğru kontrole yatırım</strong> yapmaktır. E-ticaret için phishing önceliklidir; OT ortamında segmentasyon ve yama öne çıkar. Her başlık için sorun: <em>Bu tehdit benim senaryomda nasıl gerçekleşir, ilk belirti ne olur?</em></p>
                            <p>Aşağıdaki malware, vektör ve aktör bölümleri listeyi bağlama oturtur; vaka çalışmaları (NotPetya vb.) soyut maddeleri olay diline çevirir.</p>'''),
    ('Siber tehditler, saldırganların motivasyonlarına', 'l2-detay-block', '''<p>Siber tehditler motivasyon, teknik ve hedefe göre sınıflandırılır. <strong>Tehdit modelleme</strong> (threat modeling) tasarım aşamasında “kim, hangi yoldan, ne yapabilir?” sorusunu sorar; STRIDE gibi çerçeveler eksik kontrolleri erken gösterir.</p>
                            <p>Operasyonel ortamda <strong>tehdit istihbaratı</strong> (CTI), kampanya IOC/TTP bilgisini firewall, e-posta filtresi ve EDR kurallarına taşır. Savunma yalnızca geçmiş loglara değil, güncel saldırgan davranışına yanıt vermelidir.</p>'''),
    ('Etkili siber güvenlik için', 'l3-giris', '''<p><strong>Savunma prensipleri</strong>, ürün kataloğundan önce gelen tasarım kurallarıdır. Katmanlı savunma (defense in depth) tek duvarın yeterli olduğu varsayımını reddeder; en az ayrıcalık (least privilege) ele geçirilen hesabın etkisini sınırlar; sıfır güven (zero trust) “iç ağ güvenlidir” kör noktasını kaldırır.</p>
                            <p>Her prensip için kurumunuzda somut karşılık arayın: Segmentasyon var mı? MFA zorunlu mu? Yedekleme test edildi mi? Prensipler slogan değil, denetlenebilir kontrollerdir.</p>'''),
    ('Güvenlik prensipleri, siber güvenlik uygulamalarının', 'l3-detay-block', '''<p>Prensipler teknik ve operasyonel güvenliğin ortak dilidir. <strong>Görev ayrımı</strong> (separation of duties) tek kişinin hem ödeme hem onay yapmasını engeller. <strong>Fail secure</strong>, arıza anında sistemin güvensiz açık moda değil kilitli moda geçmesini ister.</p>
                            <p>“Sıfır güven satın alıyoruz” demek, kimlik sağlayıcı, cihaz envanteri ve log korelasyonu olmadan yalnızca slogandır. Geçiş aşamalı planlanır: önce kritik sistemler, sonra genişletilmiş izleme.</p>'''),
    ('Risk değerlendirmesi, organizasyonların', 'l4-giris', '''<p><strong>Risk değerlendirmesi</strong>, kurumun karşılaştığı tehditleri tanımlayıp sınırlı kaynağı doğru yere yönlendirmesidir. Varlık envanteri olmadan risk skoru anlamsızdır. Tehdit ve zafiyet listesi, olasılık ve iş etkisiyle birleşince öncelik ortaya çıkar.</p>
                            <p>“Her şeyi kilitle” hem maliyetli hem sürdürülemez. Risk dili, yönetim kuruluna “neden bu yatırım?” sorusunun cevabını verir. Kalan risk (residual risk) dokümante edilip kabul edilebilir seviyeye indirilir.</p>'''),
    ('Risk değerlendirmesi', 'l4-detay', '''<p>Nicel risk (sayısal puan) net öncelik verir; nitel risk (düşük/orta/yüksek) hızlı atölyeler için uygundur. Her iki yöntemde de envanter ve tehdit modeli güncel kalmalıdır — yeni bulut servisi veya birleşme tabloyu değiştirir.</p>
                            <p>Örnek: SQL injection ile müşteri verisi sızıntısı — yüksek etki (KVKK, itibar), orta olasılık; kod inceleme, WAF ve yedek testi azaltıcı kontrol olarak kaydedilir.</p>'''),
    ('Güvenlik politikaları, organizasyonların', 'l5-giris', '''<p><strong>Güvenlik politikaları</strong>, teknik kontrollerin neden ve nasıl uygulanacağını kuruma özgü hale getirir. Politika olmadan MFA zorunluluğu tartışılamaz; log saklama süresi belirsiz kalır.</p>
                            <p>Politikalar yaşayan belgedir: yılda bir veya büyük olay sonrası güncellenir. Kabul edilebilir kullanım (acceptable use), veri sınıflandırması ve tedarikçi güvenliği asgari standartları tanımlar.</p>'''),
    ('Güvenlik politikaları', 'l5-detay', '''<p><strong>Standart</strong> politikadan daha teknik detay içerir; <strong>kılavuz</strong> öneri niteliğindedir. Uyumluluk (ISO 27001, sektör düzenlemeleri) politikanın varlığını ve uygulanışını ölçer.</p>
                            <p>Tedarikçi güvenliği, zincir saldırıları nedeniyle kritik: üçüncü tarafın verinize erişimi sözleşme ve teknik kontrollerle sınırlanmalıdır.</p>'''),
    ('Incident Response, güvenlik olaylarına', 'l6-giris', '''<p><strong>Olay müdahalesi</strong> (incident response), panik yerine önceden prova edilmiş planla hareket etmektir. İlk saatlerdeki kararlar (izole et, kapat, bildir) delil bütünlüğünü ve müşteri güvenini belirler.</p>
                            <p>Ekip yalnızca analistlerden oluşmaz: IT log sağlar, hukuk bildirim yükümlülüğünü değerlendirir, iletişim mesajları yönetir. Olay sonrası kök neden analizi aynı saldırının tekrarını önler.</p>'''),
]

for start, eid, body in FIXES:
    text, n = fix_split_paragraph(text, start, eid, body)
    if n:
        print(f'fixed split p: {eid}')
    else:
        print(f'WARN fix: {eid}')

# Fix h5+expand broken (l3-did, l3-lp, l3-zt, l6-asama)
for eid, h5_prefix, body in [
    ('l3-did', 'Katmanlı savunma stratejisi', '''<p><strong>Defense in depth</strong>, fiziksel erişimden kullanıcı eğitimine kadar bağımsız katmanlar ister. Gerçek saldırılar “kalın duvarı” atlar: phishing, tedarikçi VPN’i, açık bulut bucket’ı. Bir katman düşse bile diğerleri tespit ve sınırlama şansı verir.</p>'''),
    ('l3-lp', 'Minimum yetki prensibi', '''<p><strong>Least privilege</strong>, hesapların yalnızca görev için gereken yetkiye sahip olmasını sağlar. Admin hesabının günlük işte kullanılması, paylaşılan parola ve ayrılan çalışanın açık hesabı klasik ihlallerdir. RBAC ve düzenli access review gereksiz yetkiyi temizler.</p>'''),
    ('l3-zt', 'Hiçbir şeye güvenmeme yaklaşımı', '''<p><strong>Zero trust</strong>, “her erişimi doğrula” demektir; kimseyi konumuna göre kör güvenme. Uzaktan çalışma ve SaaS ile veri sınır dışına çıktı. MFA, cihaz sağlığı ve mikro segmentasyon geçişin araçlarıdır.</p>'''),
    ('l6-asama', 'Incident Response süreci altı temel aşamadan oluşur:', '''<p><strong>Hazırlık:</strong> Playbook, iletişim listesi, yedek testi. <strong>Tespit:</strong> SIEM, kullanıcı şikayeti, CTI. <strong>Sınırlandırma:</strong> VLAN izolasyonu, hesap kilidi. <strong>Temizleme:</strong> Kötü amaçlı kod ve kalıcı erişimin kaldırılması. <strong>Kurtarma:</strong> Kontrollü ayağa kaldırma. <strong>Ders çıkarma:</strong> Rapor ve politika güncellemesi.</p>'''),
]:
    pat = (
        rf'<h5>[^<]*</h5>\s*<p>{re.escape(h5_prefix)}'
        rf'\s*<p class="enhanced-text" data-sebs-expand="{eid}">(.*?)</p>\s*'
        rf'[^<]*</p>'
    )
    rep = f'<p class="enhanced-text" data-sebs-expand="{eid}">{body}</p>'
    text, n = re.subn(pat, rep, text, count=1, flags=re.DOTALL)
    if n:
        print(f'fixed h5: {eid}')

# --- Replace nar/recap blocks ---
def replace_edu_block(text, marker, new_inner):
    """Replace content inside div with data-sebs-edu=marker (non-greedy to first closing div at column)"""
    pat = rf'(<div class="edu-narrative enhanced-text" data-sebs-edu="{marker}">)(.*?)(</div>)'
    m = re.search(pat, text, re.DOTALL)
    if not m:
        # recap uses edu-lesson-recap
        pat = rf'(<div class="edu-lesson-recap enhanced-text" data-sebs-edu="{marker}">)(.*?)(</div>)'
        m = re.search(pat, text, re.DOTALL)
    if not m:
        print(f'MISS {marker}')
        return text
    return text[:m.start(2)] + '\n' + new_inner + '\n' + text[m.end(2):]

NAR = {
    'nar-lesson1': '''<h3 id="ders1-buyuk-resim"><i class="fas fa-compass"></i> Ders 1 — Büyük resim</h3>
<p>Bu ders, modülün omurgasıdır: Siber güvenliğin ne olduğunu, hangi varlıkları koruduğunuzu ve tehdit–zafiyet–risk dilini kurarsınız. CIA üçlüsü bir sonraki derste ayrıntılandırılır; burada önce <strong>ortak sözlük</strong> ve sektörden bağımsız düşünme biçimi hedeflenir.</p>
<p>Dijitalleşme her işletmeyi veri işleyen organizasyona dönüştürdü. Müşteri listesi, bordro, tedarikçi sözleşmesi ve sosyal medya hesabı <strong>varlık</strong>tır. Koruma yalnızca antivirüs değildir; kimlik yönetimi, yedekleme, hukuk ve insan faktörü aynı denklemde yer alır.</p>
<p>Üç savunma boyutu — teknoloji, süreç, insan — aşağıda kartlarla özetlenir; metnin devamında sektör örnekleri ve kavram kutuları derinleşir. Okurken not: “Bu paragraf hangi varlığı, hangi CIA boyutunu etkiliyor?”</p>
<p>Kariyer perspektifi: SOC, mimari, GRC veya pentest rollerinde aynı sorular döner — hangi veri kritik, kim erişir, olayda kime haber verilir?</p>''',
    'nar-lesson1-cia': '''<h3 id="ders2-cia-buyuk-resim"><i class="fas fa-compass"></i> Ders 2 — CIA üçlüsü</h3>
<p>CIA (Confidentiality, Integrity, Availability), onlarca yıldır kullanılan <strong>denge çerçevesidir</strong>. Her kontrol bu üç hedeften en az birine hizmet eder; bazen biri güçlenirken diğeri zayıflar — aşırı şifreleme felaket anında kurtarmayı geciktirebilir.</p>
<p>Bu derste her boyut teknik örnekler, tablolar ve ihlal senaryolarıyla işlenir. Okurken her önlem için işaretleyin: gizlilik mi, bütünlük mü, erişilebilirlik mi?</p>
<p>Modülün geri kalanında (tehdit, risk, olay) her olayın etkisi CIA ile özetlenir; bu ders o alışkanlığın temelidir.</p>''',
    'nar-lesson2': '''<h3 id="ders3-tehdit-buyuk-resim"><i class="fas fa-compass"></i> Ders 3 — Tehdit ortamı</h3>
<p>Tehdit ortamı statik değildir: İmza tabanlı antivirüs, şifreli komuta-kontrol (C2) trafiğine yetmeyebilir. Bu derste amaç encyclopedia değil — <strong>sınıflandırma mantığı</strong>: Aynı ransomware tekniği amatör veya organize suç tarafından farklı amaçla kullanılır.</p>
<p>Malware ailesi, saldırı vektörleri ve aktör profilleri ayrı başlıklardır. Vaka bölümleri (NotPetya vb.) listeleri olay bağlamına oturtur. Savunma önceliği sektörünüze göre değişir — her madde için “benim ortamımda ilk belirti ne?” sorusunu sorun.</p>''',
    'nar-lesson3': '''<h3 id="ders4-prensipler-buyuk-resim"><i class="fas fa-compass"></i> Ders 4 — Savunma prensipleri</h3>
<p>Prensipler ürün seçiminden önce gelir. Kalın duvar metaforu yanıltıcıdır; saldırılar phishing, tedarikçi veya yanlış bulut yapılandırması ile içeri girer. Katmanlı savunma, en az ayrıcalık ve sıfır güven birlikte anlamlıdır.</p>
<p>Target (2013) örneği: HVAC tedarikçisi yoluyla giriş, segmentasyon eksikliği — prensip ihlalinin ölçeği. Aşağıdaki mimari ve vaka bölümleri prensipleri somutlaştırır.</p>''',
    'nar-lesson4': '''<h3 id="ders5-risk-buyuk-resim"><i class="fas fa-compass"></i> Ders 5 — Risk yönetimi</h3>
<p>Risk, sınırsız tehdit listesini <strong>iş kararına</strong> çevirir. Olasılık × etki düşüncesi, yatırımı tartışılabilir kılar. Aynı teknik açık test ortamında düşük, canlı müşteri veritabanında kritik risktir.</p>
<p>Bu derste süreç adımları, matris mantığı ve azaltma seçenekleri (kabul, transfer, azalt, kaçın) işlenir. Denetçi ve yönetim kurulu dokümante risk kaydı ister.</p>''',
    'nar-lesson5': '''<h3 id="ders6-politika-buyuk-resim"><i class="fas fa-compass"></i> Ders 6 — Politika ve yönetişim</h3>
<p>Teknik kontrol politika olmadan tutarsız kalır: Bir ekip MFA zorunlu tutarken diğeri gevşetemez. Politika “ne istiyoruz”, prosedür “nasıl yapıyoruz” adımlarını yazar.</p>
<p>ISO 27001, KVKK ve sektör düzenlemeleri çoğu kurumda politika seti gerektirir. Asıl değer, çalışanların günlük kararında rehber olmasıdır — imzalanmış ama okunmayan politika raflarda kalır.</p>''',
    'nar-lesson6': '''<h3 id="ders7-olay-buyuk-resim"><i class="fas fa-compass"></i> Ders 7 — Olay müdahalesi</h3>
<p>Olay çıktığında panik delil kaybına yol açar. Hazırlık aşamasında playbook ve masa başı tatbikatı yapılmış kurumlar ilk saatlerde daha kontrollüdür. “Hemen kapat” her zaman doğru değildir — bazen izole et ve log topla önce gelir.</p>
<p>NIST/SANS aşamaları (hazırlık, tespit, sınırlandırma, temizleme, kurtarma, ders) ortak dildir. Maersk–NotPetya, yedekleme ve DR planının iş sürekliliği için önemini hatırlatır.</p>''',
    'nar-intro': '''<h3 id="modul-amaci"><i class="fas fa-bullseye"></i> Modül amacı ve ilk izlenim</h3>
<p>Siber güvenlik; sistem, ağ, uygulama ve veriyi yetkisiz erişim, değişiklik ve kesintiye karşı korumak için <strong>teknik, süreç ve insan</strong> önlemlerinin bütünüdür. E-ticaret müşteri kartını, hastane hasta kaydını, fabrika üretim hattını farklı önceliklerle korur — bu modül o farkı “ortak dil”e çevirir.</p>
<p>SEBS Global’de çoğu öğrencinin <strong>ilk modülü</strong> burasıdır. Sonraki eğitimlerdeki terimler (MFA, segmentasyon, SIEM, exploit) burada tanımlanır veya buraya bağlanır. Acele etmeyin: 2–3 oturumda, ders başına kazanımları kendi cümlelerinizle yazarak ilerleyin.</p>
<p>Metinler ders notu yoğunluğundadır; kısa listeler tek başına yeterli değildir. Her ders sonunda “Bu derste neler öğrendik?” bölümünü kullanın.</p>''',
    'nar-intro-nasil': '''<h3 id="nasil-calisilir"><i class="fas fa-route"></i> Nasıl çalışılır?</h3>
<p>Dersler <strong>rota modunda</strong> açılır; sol menü ve alt başlıklar sayfadaki <code>h3</code> ile eşleşir. <strong>Dersi tamamla</strong> ilerlemeyi kaydeder.</p>
<p>Öneri: Oturum başına 1–2 ders. Not şablonu: tanım → örnek → hangi savunma kontrolü? Modül sonunda <strong>Modül özeti</strong> ve kendinizi sınama soruları.</p>''',
    'nar-modul-ozet': '''<h3 id="modul-ozet-sentez"><i class="fas fa-layer-group"></i> Sentez: tek hikâye</h3>
<p>Artık şu zinciri kurabilirsiniz: <strong>Varlık</strong> → <strong>tehdit</strong> + <strong>zafiyet</strong> → <strong>risk</strong> → kontroller (CIA, prensipler, politika) → olay olursa <strong>müdahale</strong>. Bu modül, diğer SEBS eğitimlerinin referans çerçevesidir.</p>
<p>Her yeni modülde iki soru: Hangi CIA boyutu? Tehdit mi zafiyet mi risk mi?</p>
<h3 id="modul-sonraki-adim"><i class="fas fa-arrow-right"></i> Sonraki adımlar</h3>
<p>(1) Terimleri tekrar. (2) <strong>Güncel Siber Güvenliğe Giriş</strong> veya <strong>Temel Network</strong>. (3) Simülasyonlar. Kendinizi sınama listesini aşağıda işaretleyin.</p>''',
}

RECAP = {
    'recap-lesson1': '''<h3 id="ders1-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>Siber güvenliğin tanımı, teknoloji–süreç–insan üçlüsü ve varlık–tehdit–zafiyet–risk modeli kuruldu. CIA ayrıntısı ders 2’de.</p>
<ul><li>Varlık envanteri ve sektörel öncelikler</li><li>Tehdit ≠ risk; zafiyet istismarı</li><li>Exploit / payload / saldırı zinciri girişi</li><li>Kariyerde ortak soru seti</li></ul>''',
    'recap-lesson1-cia': '''<h3 id="ders2-cia-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>CIA üçlüsü: gizlilik, bütünlük, erişilebilirlik — teknik örnekler, tablolar, denge ve çelişkiler.</p>
<ul><li>Her kontrolün hangi CIA boyutuna hizmet ettiği</li><li>İhlal türleri ve kurumsal sonuçlar</li><li>Üçlü arasında öncelik tartışması</li></ul>''',
    'recap-lesson2': '''<h3 id="ders3-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>Malware türleri, saldırı vektörleri, aktör profilleri; tehdit analizi, yaşam döngüsü ve istihbarata giriş.</p>
<ul><li>Phishing ve ransomware bağlamı</li><li>Script kiddie → APT spektrumu</li><li>Vaka çalışmalarından dersler</li></ul>''',
    'recap-lesson3': '''<h3 id="ders4-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>Defense in depth, least privilege, zero trust; mimari katmanlar ve izleme kavramları.</p>
<ul><li>Prensipler ↔ somut kontrol eşlemesi</li><li>Segmentasyon ve MFA</li><li>Gerçek olaylarda prensip ihlali</li></ul>''',
    'recap-lesson4': '''<h3 id="ders5-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>Risk değerlendirme adımları, olasılık×etki, azaltma ve kalan risk.</p>
<ul><li>Varlık–tehdit–zafiyet–risk zinciri</li><li>Yatırım önceliklendirme dili</li></ul>''',
    'recap-lesson5': '''<h3 id="ders6-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>Politika, prosedür, standart; uyumluluk ve tedarikçi güvenliği.</p>
<ul><li>Politikanın operasyonel değeri</li><li>Periyodik gözden geçirme</li></ul>''',
    'recap-lesson6': '''<h3 id="ders7-ozet"><i class="fas fa-check-double"></i> Bu derste neler öğrendik?</h3>
<p>Olay müdahale aşamaları, ekip rolleri, SIEM/forensics araçları.</p>
<ul><li>Hazırlık → ders çıkarma döngüsü</li><li>Playbook ve iletişim disiplini</li></ul>''',
}

for k, v in NAR.items():
    text = replace_edu_block(text, k, v)
for k, v in RECAP.items():
    text = replace_edu_block(text, k, v)

# --- Insert deep editorial chapters after nar blocks ---
CHAPTERS = {
    'lesson2': ('nar-lesson2', '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson2">
<h3 id="l2-malware-ailesi"><i class="fas fa-virus"></i> Malware ailesini okumak</h3>
<p><strong>Malware</strong> (kötü amaçlı yazılım), kullanıcının bilgisi veya rızası dışında çalışan kod ve süreçlerin genel adıdır. <strong>Virüs</strong> başka dosyalara bulaşarak yayılır; <strong>solucan (worm)</strong> ağ üzerinden kendi kendine çoğalır ve bant genişliğini tüketebilir. <strong>Trojan</strong> meşru yazılım gibi görünür (sahte PDF okuyucu, kırık oyun) ancak arka planda uzaktan erişim veya veri çalma yapar.</p>
<p><strong>Ransomware</strong> günümüzde en çok gündeme gelen türdür: dosyaları şifreler, yedekleri hedefler, fidye ve “müzakere” süreci iş modeli haline gelmiştir. <strong>Spyware</strong> tuş vuruşu ve ekran kaydı ile gizlilik ihlali üretir. Savunma: yedekleme + segmentasyon + EDR + kullanıcı eğitimi birlikte düşünülmelidir.</p>
<h3 id="l2-phishing-vektor"><i class="fas fa-envelope"></i> Phishing ve sosyal mühendislik</h3>
<p><strong>Phishing</strong>, teknik zafiyet gerektirmeden çoğu saldırının başladığı vektördür. Sahte banka e-postası, Teams/Slack mesajı veya “fatura” eki — hepsi kimlik bilgisi veya malware teslimatı içindir. <strong>Vishing</strong> (sesli arama), <strong>smishing</strong> (SMS) aynı psikolojik baskıyı farklı kanallarda kullanır.</p>
<p>Kurumsal savunma: e-posta filtreleme, link sandbox, MFA (parola çalınsa bile ikinci faktör), düzenli farkındalık tatbikatı. Kullanıcı “şüpheli”yi raporlayabilmeli — süreç zafiyeti kapatılır.</p>
<h3 id="l2-web-zafiyet"><i class="fas fa-code"></i> Web ve uygulama vektörleri</h3>
<p><strong>SQL injection</strong>, uygulamanın veritabanına yetkisiz sorgu enjekte etmesidir; müşteri listesi sızıntısının klasik yoludur. <strong>XSS</strong>, tarayıcıda başka kullanıcının oturumunda script çalıştırır. <strong>MitM</strong> (man-in-the-middle), zayıf Wi‑Fi veya sertifika hatasında trafiği okur/değiştirir. Azaltma: güvenli kodlama, WAF, TLS doğru yapılandırma, HSTS.</p>
<h3 id="l2-aktör-spektrumu"><i class="fas fa-user-secret"></i> Tehdit aktörü spektrumu</h3>
<p><strong>Script kiddie:</strong> Hazır araç dener, düşük olgunluk. <strong>Hacktivist:</strong> Ideolojik hedef, web sitesi defacement. <strong>Organize suç:</strong> Fidye, kart verisi, ölçekli operasyon. <strong>APT / devlet destekli:</strong> Uzun süre gizli kalma, istihbarat. <strong>İçeriden:</strong> Meşru hesap — tespit en zor. Motivasyonu bilmek, hangi TTP’leri bekleyeceğinizi daraltır.</p>
</div>'''),
    'lesson3': ('nar-lesson3', '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson3">
<h3 id="l3-did-detay"><i class="fas fa-layer-group"></i> Katmanlı savunma (Defense in Depth)</h3>
<p>Fiziksel güvenlik (kartlı geçiş, kamera), ağ (firewall, IDS/IPS), sunucu (hardening, yama), uygulama (WAF, kod inceleme), veri (şifreleme, DLP), insan (eğitim) — biri düşse diğeri devreye girer. Tek ürün “tam koruma” vaadi gerçekçi değildir.</p>
<h3 id="l3-least-privilege-detay"><i class="fas fa-user-lock"></i> En az ayrıcalık ve görev ayrımı</h3>
<p>Varsayılan “herkes admin” kültürü felakettir. <strong>RBAC</strong> rol tanımına göre yetki verir; <strong>need-to-know</strong> projeye göre daraltır. İşten ayrılışta hesap kapatma SLA’si (ör. 24 saat) süreç zafiyetini kapatır. Ayrıcalıklı erişim yönetimi (PAM) admin oturumlarını kayıt altına alır.</p>
<h3 id="l3-zero-trust-detay"><i class="fas fa-shield-halved"></i> Sıfır güven mimarisi</h3>
<p>“İçerideyim, güvendeyim” yok. Her erişim: kimlik + cihaz durumu + bağlam (konum, saat). Mikro segmentasyon, east-west trafik kontrolü, sürekli doğrulama. Geçiş: kimlik sağlayıcı, cihaz envanteri, log korelasyonu — sonra politika otomasyonu.</p>
</div>'''),
    'lesson4': ('nar-lesson4', '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson4">
<h3 id="l4-surec-adimlari"><i class="fas fa-list-ol"></i> Risk değerlendirme süreci</h3>
<p><strong>1. Varlık envanteri</strong> — ne koruyoruz? <strong>2. Tehdit ve zafiyet</strong> — ne istismar edilebilir? <strong>3. Etki analizi</strong> — iş kesintisi, yasal, itibar. <strong>4. Olasılık</strong> — ne sıklıkla? <strong>5. Risk skoru</strong> ve öncelik. <strong>6. Tedavi</strong> — azalt, transfer, kabul, kaçın. <strong>7. İzleme</strong> — kalan risk ve göstergeler.</p>
<h3 id="l4-ornek-matris"><i class="fas fa-table"></i> Örnek: e-ticaret müşteri veritabanı</h3>
<p>Varlık: canlı DB. Tehdit: SQLi / sızmış kimlik bilgisi. Zafiyet: parametreli sorgu eksikliği, zayıf admin parolası. Etki: KVKK bildirimi, müşteri kaybı — yüksek. Olasılık: orta (internet yüzeyi). Kontroller: kod inceleme, WAF, MFA admin, şifreleme, yedek. Kalan risk dokümante edilir.</p>
</div>'''),
    'lesson5': ('nar-lesson5', '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson5">
<h3 id="l5-politika-turleri"><i class="fas fa-file-contract"></i> Politika türleri</h3>
<p><strong>Üst düzey politika:</strong> Yönetim kurulu onaylı bilgi güvenliği politikası — hedef ve sorumluluk. <strong>Standart:</strong> Teknik minimum (ör. TLS 1.2+, parola uzunluğu). <strong>Prosedür:</strong> Adım adım (olay bildirimi nasıl yapılır). <strong>Kılavuz:</strong> Öneri (uzaktan çalışma en iyi uygulamalar).</p>
<h3 id="l5-uyumluluk"><i class="fas fa-balance-scale"></i> Uyumluluk ve denetim</h3>
<p>ISO 27001, SOC 2, PCI-DSS, KVKK farklı sorular sorar; hepsi “politika var mı, uygulanıyor mu?” izler. Denetimde log saklama süresi, erişim review kayıtları, eğitim katılım listesi kanıt olur.</p>
</div>'''),
    'lesson6': ('nar-lesson6', '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson6">
<h3 id="l6-asamalar-detay"><i class="fas fa-list-check"></i> Olay müdahale aşamaları (detay)</h3>
<p><strong>Hazırlık:</strong> IR planı, iletişim ağacı, hukuk/denetim temasları, yedek restore tatbikatı. <strong>Tespit:</strong> SIEM kuralı, EDR alarmı, kullanıcı şikayeti — yanlış pozitif ayıklama. <strong>Sınırlandırma:</strong> Etkilenen VLAN izolasyonu, hesap disable — yayılımı durdur. <strong>Temizleme:</strong> Malware kaldırma, kalıcı mekanizma (scheduled task, backdoor) avı. <strong>Kurtarma:</strong> Temiz yedekten restore, şifre rotasyonu. <strong>Ders:</strong> Zaman çizelgesi, kök neden, politika/yama güncellemesi.</p>
<h3 id="l6-ekip-rolleri"><i class="fas fa-users"></i> Ekip ve iletişim</h3>
<p>Olay yöneticisi koordinasyon; analist teknik derinlik; forensics delil; hukuk bildirim; PR iç/dış mesaj; üst yönetim iş sürekliliği kararı. “Sessizce düzelt” ile “şeffaf bildir” arasında hukuk ve itibar dengesi kurulur.</p>
</div>'''),
    'lesson1-cia': ('nar-lesson1-cia', '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson1-cia">
<h3 id="cia-denge-ornek"><i class="fas fa-balance-scale"></i> CIA dengesi: pratik kararlar</h3>
<p>Müşteri destekte ekran paylaşımı erişilebilirliği artırır, gizliliği düşürür — maskeleme veya onaylı erişim politikası gerekir. Agresif yedekleme erişilebilirlik ve bütünlüğü destekler; yedeklerin da şifrelenmemiş olması gizlilik riski yaratır.</p>
<p>Her mimari kararda üç soru: Hangi CIA boyutu kazanıyor? Hangisi kaybediyor? Kabul edilebilir mi?</p>
</div>'''),
}

for lesson_id, (nar_marker, chapter_html) in CHAPTERS.items():
    if f'data-sebs-edu-chapter="{lesson_id}"' in text:
        print(f'skip chapter {lesson_id}')
        continue
    # insert after closing div of nar block
    pat = rf'(<div class="edu-narrative enhanced-text" data-sebs-edu="{nar_marker}">.*?</div>)(\s*\n\s*<h3)'
    m = re.search(pat, text, re.DOTALL)
    if m:
        text = text[:m.end(1)] + '\n' + chapter_html + m.group(2) + text[m.end(2):]
        print(f'inserted chapter {lesson_id}')
    else:
        print(f'WARN chapter insert {lesson_id}')

# Expand short expand blocks for CIA
CIA_EXPAND = {
    'cia-giris': '''<p>CIA üçlüsü her güvenlik kontrolünün hedef göstergesidir. Şifreleme → gizlilik; hash/imza → bütünlük; yedekleme/yük dengeleme → erişilebilirlik. Üçlü statik değil: denge iş gereksinimine göre kurulur.</p>
                            <p>ISO 27001 ve NIST çerçeveleri bu dili dolaylı kullanır. Proje toplantısında “bu özellik hangi C/I/A’yı güçlendiriyor?” sorusu gereksiz karmaşıklığı eler.</p>''',
    'cia-gizlilik-p': '''<p>Gizlilik ihlali: müşteri listesi, sağlık kaydı, ödeme verisinin yetkisiz üçüncü taraflara ulaşması. Teknik: AES şifreleme (depo/iletim), erişim kontrol listesi, maskeleme, güvenli silme. Organizasyonel: veri sınıflandırması, NDA, erişim onay süreci.</p>
                            <p>KVKK/GDPR kapsamında bildirim süreleri ve veri sahibi hakları devreye girer. Olay müdahalesi ile doğrudan bağlantılıdır.</p>''',
    'cia-butunluk-p': '''<p>Bütünlük: verinin yetkisiz ve fark edilmeden değişmemesi. Finans kaydında sent kuruş oynama, üretim sensörü manipülasyonu, web sitesine sahte haber — hepsi bütünlük saldırısı. Hash (SHA-256), dijital imza, audit log, sürüm kontrolü araçlardır.</p>
                            <p>Veri sızmamış ama yanlış veriyle karar alınmış olabilir — gizlilik ile karıştırılmamalı.</p>''',
    'cia-eris-p': '''<p>Erişilebilirlik: yetkili kullanıcının ihtiyaç anında hizmete ulaşması. DDoS, ransomware şifrelemesi, veri merkezi yangını, yanlış yama zamanlaması hedefler. Yedekleme, DR sitesi, yük dengeleme, kapasite planı, RTO/RPO hedefleri iş dilidir.</p>
                            <p>Güvenlik ekibi “daha fazla kontrol”, operasyon “daha az kesinti” ister — yönetim dengesi kurar.</p>''',
    'cia-nedir-expand': '''<p>1970’lerden bu yana eğitim ve denetimde referans. Güvenlik mimarı projede gereksiz kontrolleri eler. Müşteri panelinde ekran kaydı vs hızlı teşhis tartışması tipik CIA dengesi örneğidir.</p>''',
}
for eid, body in CIA_EXPAND.items():
    pat = rf'(<div class="enhanced-text" data-sebs-expand="{eid}">)(.*?)(</div>)'
    if f'data-sebs-expand="{eid}"' in text:
        text, n = re.subn(pat, rf'\1\n                                {body}\n                            \3', text, count=1, flags=re.DOTALL)
        if n:
            print(f'expanded {eid}')

# lesson1 chapter after nar-lesson1
if 'data-sebs-edu-chapter="lesson1"' not in text:
    ch1 = '''<div class="edu-chapter-body enhanced-text" data-sebs-edu-chapter="lesson1">
<h3 id="l1-sektor-ornekleri"><i class="fas fa-building"></i> Sektörden sektöre koruma önceliği</h3>
<p>Bankacılıkta gizlilik ve dolandırıcılık önleme; hastanede hasta verisi gizliliği ve sistem erişilebilirliği (hayati sistem); üretimde OT ağ segmentasyonu ve bütünlük; e-ticarette ödeme ve müşteri verisi. Aynı CIA üçlüsü, farklı ağırlık.</p>
<h3 id="l1-saldiri-zinciri-giris"><i class="fas fa-link"></i> Saldırı zincirine giriş</h3>
<p>Keşif → hazırlık → iletim → sızma → eylem. Exploit zafiyeti tetikler; payload asıl etkiyi üretir. Ders 3’te tehdit türleri, ders 7’de müdahale bu zinciri kesmeyi hedefler.</p>
</div>'''
    pat = r'(<div class="edu-narrative enhanced-text" data-sebs-edu="nar-lesson1">.*?</div>)(\s*\n\s*<h3 id="varlik-tehdit)'
    m = re.search(pat, text, re.DOTALL)
    if m:
        text = text[:m.end(1)] + '\n' + ch1 + m.group(2) + text[m.end(2):]
        print('inserted chapter lesson1')

text = text.replace('sebs-premium-module-lessons.js?v=20260521a', 'sebs-premium-module-lessons.js?v=20260521b')
path.write_text(text, encoding='utf-8')
print('DONE')
