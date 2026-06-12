#!/usr/bin/env python3
"""Prints main fragment (module-layout + aside + main) for ileri-kriptografi.html"""
from html import escape
from pathlib import Path

# Trusted lesson HTML (verbatim course body after Kazanımlar): frontend/modules/ileri-kriptografi-lessons/01.html … 10.html
LESSON_DIR = Path(__file__).resolve().parent.parent / "frontend" / "modules" / "ileri-kriptografi-lessons"

MAIN_STYLE = (
    'margin-left: 320px; width: calc(100% - 320px); max-width: calc(100vw - 320px); '
    'overflow-x: hidden; overflow-y: visible; box-sizing: border-box; position: relative;'
)

NAV = [
    ("ik-m1", "fa-shield-halved", "MODÜL 1 — Formal güvenlik modelleri ve ispat düşüncesi"),
    ("ik-m2", "fa-key", "MODÜL 2 — İleri simetrik kriptografi ve AEAD"),
    ("ik-m3", "fa-fingerprint", "MODÜL 3 — İleri hash, MAC, KDF ve parola güvenliği"),
    ("ik-m4", "fa-lock", "MODÜL 4 — İleri açık anahtar kriptografisi"),
    ("ik-m5", "fa-network-wired", "MODÜL 5 — Güvenli kanal protokolleri ve modern mesajlaşma"),
    ("ik-m6", "fa-eye-slash", "MODÜL 6 — Sıfır bilgi ispatları ve gizlilik koruyucu kriptografi"),
    ("ik-m7", "fa-screwdriver-wrench", "MODÜL 7 — Uygulama güvenliği, yan kanallar ve anahtar yönetimi"),
    ("ik-m8", "fa-users-gear", "MODÜL 8 — Eşik kriptografisi, MPC ve dağıtık güven"),
    ("ik-m9", "fa-atom", "MODÜL 9 — Post-kuantum kriptografi ve geçiş stratejileri"),
    ("ik-m10", "fa-flask", "MODÜL 10 — İleri kriptografik yapılar ve araştırma ufku"),
]


def objectives(title, items):
    lis = "\n".join(f"                                <li>{escape(i)}</li>" for i in items)
    return f"""                    <div class="learning-objectives">
                            <h3><i class="fas fa-bullseye"></i> {escape(title)}</h3>
                            <ul>
{lis}
                            </ul>
                    </div>"""


def breakout(head, hint, cards):
    parts = []
    for icon, t, body in cards:
        parts.append(
            f"""                            <details class="kr-exp-goal"><summary><span class="kr-exp-goal__icon" aria-hidden="true"><i class="fas {icon}"></i></span><span class="kr-exp-goal__title">{escape(t)}</span></summary><div class="kr-exp-goal__body">{escape(body)}</div></details>"""
        )
    grid = "\n".join(parts)
    return f"""                    <div class="kr-inline-breakout kr-mid-cards" role="region" aria-label="{escape(head)}">
                        <div class="kr-inline-breakout__head"><i class="fas fa-lightbulb" aria-hidden="true"></i><span>{escape(head)}</span></div>
                        <p class="kr-inline-breakout__hint">{escape(hint)}</p>
                        <div class="kr-cia-grid">
{grid}
                        </div>
                    </div>"""


def intro_blocks(intro_p: str) -> str:
    """Turn intro text into one or more <p> blocks (use blank lines between paragraphs)."""
    if not (intro_p or "").strip():
        return ""
    paras = [p.strip() for p in intro_p.split("\n\n") if p.strip()]
    return "\n".join(f"                    <p>{escape(p)}</p>" for p in paras)


def load_lesson_html(module_index: int) -> str | None:
    path = LESSON_DIR / f"{module_index:02d}.html"
    try:
        if path.is_file():
            return path.read_text(encoding="utf-8").strip()
    except OSError:
        return None
    return None


def section(
    sid,
    active,
    title,
    img_alt,
    img_url,
    intro_p,
    extra_html,
    goals_title,
    goals,
    module_index: int,
):
    act = " active" if active else ""
    full_lesson = load_lesson_html(module_index)
    generic_close = """                    <h2><i class="fas fa-flag-checkered"></i> Bu modülde neler öğrendik?</h2>
                    <p>Bu bölümün sonunda öğrenme çıktılarını gerçek sistem ve standart okumasıyla ilişkilendirebiliyor olmalısınız; detaylı tekrar için üstteki kazanım listesine dönün.</p>
"""
    if full_lesson:
        post_goals = full_lesson
        extra_out = ""
        goals_out = ""
    else:
        post_goals = generic_close
        extra_out = extra_html
        goals_out = objectives(goals_title, goals)
    return f"""            <section class="content-section docx-content{act}" id="{sid}" data-section="{sid}">
                <div class="section-inner module-2-enhanced">
                    <h1>{escape(title)}</h1>
                    <div class="lesson-image-wrap"><img src="{escape(img_url)}" alt="{escape(img_alt)}" class="lesson-image" loading="lazy" referrerpolicy="no-referrer"></div>
                    <h2>Modül özeti</h2>
{intro_blocks(intro_p)}
{extra_out}
{goals_out}
{post_goals}
                </div>
            </section>"""


def table(headers, rows):
    th = "".join(f"<th>{escape(h)}</th>" for h in headers)
    trs = []
    for r in rows:
        tds = "".join(f"<td>{escape(c)}</td>" for c in r)
        trs.append(f"<tr>{tds}</tr>")
    body = "\n".join(trs)
    return f"""                    <div class="table-wrap" style="overflow-x:auto;margin:1.25rem 0;">
                    <table class="data-table" style="width:100%;border-collapse:collapse;font-size:0.95rem;">
                        <thead><tr>{th}</tr></thead>
                        <tbody>
{body}
                        </tbody>
                    </table>
                    </div>"""


def concept_grid(cards):
    cols = []
    colors = ("red", "amber", "blue", "green")
    for i, (icon, h, p) in enumerate(cards):
        c = colors[i % len(colors)]
        cols.append(
            f"""                        <div class="concept-card {c}">
                            <h4><i class="fas {icon}"></i> {escape(h)}</h4>
                            <p>{escape(p)}</p>
                        </div>"""
        )
    return f"""                    <div class="concept-grid">
{chr(10).join(cols)}
                    </div>"""


def body_p(t):
    return f"<p>{escape(t)}</p>"


def body_h2(t):
    return f"<h2>{escape(t)}</h2>"


def body_h3(t):
    return f"<h3>{escape(t)}</h3>"


def body_ul(items):
    return "<ul>" + "".join(f"<li>{escape(i)}</li>" for i in items) + "</ul>"


# --- Module-specific HTML blocks (genişletilmiş gövde; kazanımlar objectives içinde) ---

M1_EXTRA = (
    concept_grid(
        [
            ("fa-chess", "Güvenlik tanımı önce", "IND-CPA / IND-CCA / EUF-CMA hangi saldırgan yetkisini modelleder?"),
            ("fa-scale-balanced", "İspat sınırı", "Formal ispat uygulama hatasını, nonce yönetimini veya oracle davranışını otomatik düzeltmez."),
            ("fa-book", "Standart okuma", "MUST/SHOULD/MAY ve normative bölümler güvenlik politikasıyla eşlenir."),
        ]
    )
    + body_h2("Modern kriptografide güvenlik tanımı")
    + body_p(
        "Sezgisel güvenlik (“kimse kıramadı”, “milyarlarca deneme gerekir”) ile formal güvenlik arasındaki fark, "
        "modern kriptografinin temelidir. Formal tarafta önce saldırganın ne görebileceği, hangi sorguları "
        "yapabileceği ve hangi kazanma koşulunun tanımlandığı netleştirilir; ardından “şifreleme şeması bu "
        "oyunda ihmal edilebilir avantajla güvenlidir” denir."
    )
    + body_p(
        "Güvenlik oyunu: Challenger gerçek şemayı veya rastgele davranışı simüle eder; distinguisher hangi "
        "dünyada olduğunu ayırt etmeye çalışır. Avantaj, doğru tahmin olasılığının 1/2’den ne kadar uzak "
        "olduğunun ölçüsüdür. İhmal edilebilir (negligible), güvenlik parametresi büyüdükçe üstelden daha "
        "hızlı küçülen bir fonksiyon olarak okunur."
    )
    + body_h2("Saldırgan modeli ve kanıtın sınırı")
    + body_p(
        "İspat, seçilen primitif ve model altında belirli bir özelliği gösterir; yanlış nonce, yanlış API "
        "kullanımı, zayıf rastgelelik veya farklı bir protokolle birleştirme gibi uygulama hataları "
        "çoğu zaman ispat kapsamı dışındadır. Bu yüzden “ispatlı = üretimde güvenli” çıkarımı yapılmaz; "
        "tehdit modeli + uygulama denetimi birlikte değerlendirilir."
    )
    + body_ul(
        [
            "Kim saldırgan? (ağ, host, yan kullanıcı, fiziksel erişim)",
            "Statik / adaptive sorgu: saldırgan her turda yeni kararlara göre mi seçim yapıyor?",
            "Çoklu oturum: aynı anahtar birden çok bağlamda mı kullanılıyor?",
        ]
    )
    + body_h2("Şifreleme: IND-CPA ve IND-CCA")
    + body_p(
        "IND-CPA (seçilmiş düz metin): saldırgan şifreleme oracle’ına istediği düz metinleri sorar; iki "
        "challenge düz metninden hangisinin şifrelendiğini ayırt edememelidir. Bu model, yalnızca "
        "dinleyen bir düşmana karşı gizlilik için gerekli ama yeterli değildir; çoğu gerçek sistemde "
        "çözme/decryption oracle da vardır."
    )
    + body_p(
        "IND-CCA (seçilmiş şifreli metin): saldırgan (kurallara bağlı olarak) çözme sorguları yapabilir. "
        "AEAD, doğru kullanımda bütünlük + gizlilik sağlar; fakat tag doğrulaması atlanırsa, hata mesajları "
        "farklıysa veya doğrulanmamış plaintext işleniyorsa CCA güvencesi fiilen kalkar."
    )
    + body_h2("İmza: EUF-CMA ve protokol bağlamı")
    + body_p(
        "EUF-CMA (existential unforgeability under chosen message attack), saldırganın geçerli yeni bir "
        "(mesaj, imza) çifti üretememesini ister. İmza doğrulama yalnızca “imza baytı doğru” değil; "
        "doğru public key, doğru domain separation ve doğru mesaj kodlaması (transcript) ile yapılmalıdır."
    )
    + body_p(
        "Encrypt-and-sign karışımı, MAC’i şifrelemenin üstüne yanlış sırayla koyma veya bağlam "
        "string’lerinin unutulması gibi hatalar, primitif güçlü olsa bile protokolü kırılır hâle getirir."
    )
    + body_h2("İndirgeme, ROM ve standart model")
    + body_p(
        "Klasik ispat dili: “Şemayı kıran algoritma, bilinen zor bir problemi (ör. belirli bir grupta "
        "CDH/DDH veya lattice varsayımı) çözer.” İndirgeme ne kadar “sıkı” ve dönüşüm ne kadar verimli "
        "ise güvence o kadar anlamlıdır."
    )
    + body_p(
        "Rastgele kahin modeli (ROM), idealize bir hash oracle varsayar; pratikte dikkatli yorumlanır. "
        "Standart modelde ispat daha güçlü sayılır ancak her yapı için mümkün değildir. Hibrit argüman: "
        "“ROM altında X + standart model altında Y” gibi bileşik iddialar yaygındır."
    )
    + body_h2("RFC, FIPS, NIST SP ve BCP 14")
    + body_p(
        "RFC’lerde BCP 14 (MUST / SHOULD / MAY) normatif gereksinimleri ayırır. Güvenlik analizinde "
        "“SHOULD” ifadesi, uyumluluk açısından gevşek olsa bile tehdit modelinizde zorunlu kabul "
        "edilebilir. Informative bölümler yönlendiricidir; normative ile çelişirse normative esastır."
    )
    + body_ul(
        [
            "Hangi bölüm normative? (genelde üst başlık veya ayrı cümle)",
            "Algoritma kimliği: OID, isim, parametre seti",
            "Test vektörü / örnek paket: hangi edge case’ler kapsanıyor?",
        ]
    )
    + body_h2("Test vektörleri ve referans implementasyon")
    + body_p(
        "Test vektörü, implementasyonun algoritma spesifikasyonuyla uyumunu doğrular; fakat yanlış "
        "modda kullanım, zayıf anahtar üretimi veya protokol hatasını yakalamaz. Referans kod, okuma "
        "için değerlidir; üretimde tedarik zinciri ve bakım politikası ayrıca değerlendirilir."
    )
    + body_h2("Analitik senaryo: “AES-128 kullanıyoruz” iddiası")
    + body_p(
        "Ürün ekibi: “Veri AES-128 ile korunuyor.” Güvenlik mühendisi: “Hangi mod? IV/nonce kaynağı? "
        "Bütünlük nasıl sağlanıyor; AEAD mı, Encrypt-then-MAC mı? Padding ve hata yanıtları?” "
        "Yanıtlar belirsizse iddia formal anlamda bir güvenlik özelliğine karşılık gelmez."
    )
    + body_p(
        "Öneri çerçevesi: AEAD (ör. AES-GCM doğru nonce ile veya ChaCha20-Poly1305), veya klasik "
        "yığında Encrypt-then-MAC; doğrulama başarısızlığında tek tip hata; doğrulanmamış plaintext’e "
        "iş mantığında erişilmemesi."
    )
)

M1_GOALS = [
    "Sezgisel güvenlik ile formal güvenlik tanımı arasındaki farkı açıklayabilir ve bir sisteme yönelik güvenlik iddiasının hangi varsayımlara dayandığını sorgulayabilir.",
    "Saldırgan modelini belirlenmiş yetenekler ve kısıtlamalar çerçevesinde tanımlar; güvenlik oyunu mantığını adım adım okuyabilir.",
    "IND-CPA ve IND-CCA güvenlik modellerini saldırı gücü farkı açısından karşılaştırır ve hangi senaryoda hangi modelin gerekli olduğunu değerlendirir.",
    "EUF-CMA modelini dijital imza güvenliği bağlamında yorumlar; bağlamdan kopuk imza doğrulamanın güvenlik etkisini açıklar.",
    "İndirgeme mantığını ve hibrit argümanı kavramsal olarak tanır; \"X güvenlidir çünkü Y problemini çözmek kadar zordur\" biçimindeki bir ispat iddiasını okuyabilir.",
    "Rastgele kahin modeli ile standart model arasındaki farkı açıklar ve her ikisinin pratik sınırlarını değerlendirir.",
    "Formal ispatın varlığının yeterli güvenlik güvencesi anlamına gelmediğini, uygulama hatalarının ispat edilen güvenceyi geçersizleştirebileceğini somut örneklerle ifade edebilir.",
    "RFC, FIPS ve NIST SP gibi standart dokümanlarını yapısal olarak okur; MUST, SHOULD, MAY ifadelerinin güvenlik analizi açısından ne anlama geldiğini yorumlar.",
    "Test vektörü ve referans implementasyon kavramlarını tanır; bu kaynakların neden araç çıktısından daha güvenilir bir doğrulama zemini oluşturduğunu açıklar.",
]

M2_EXTRA = (
    concept_grid(
        [
            ("fa-layer-group", "AES iç yapısı", "SubBytes/ShiftRows/MixColumns/AddRoundKey → confusion ve diffusion."),
            ("fa-shield-virus", "AEAD seçimi", "Nonce yönetimi GCM ve ChaCha20-Poly1305 için kritik; GCM-SIV misuse-resistant alternatif."),
            ("fa-bug", "Saldırı sınıfları", "Padding oracle, bit-flipping, meet-in-the-middle — çoğu mod/API hatasından beslenir."),
        ]
    )
    + body_h2("AES: tur yapısı ve tasarım sezgisi")
    + body_p(
        "AES bir SPN (Substitution–Permutation Network) şemasıdır: SubBytes doğrusal olmama (confusion), "
        "ShiftRows ve MixColumns difüzyon (diffusion), AddRoundKey ise anahtar malzemesini her tura yayar. "
        "S-box’lar bilinen diferansiyel/lineer analizlere karşı seçilmiştir; tur sayısı (10/12/14) bu "
        "saldırı sınıflarına karşı marj sağlar."
    )
    + body_p(
        "Key schedule, genişletilmiş anahtardan tur anahtarlarını üretir. Uygulamada AES-NI, hem hız hem de "
        "yazılım tabanlı implementasyona göre daha öngörülebilir zamanlama sağlayabilir; yine de yan kanal "
        "tehdidi tamamen kalkmaz — özellikle paylaşımlı önbellek veya kontrolsüz cihazlarda."
    )
    + body_h3("Modlar ve kullanım sınırları")
    + body_ul(
        [
            "ECB: aynı blok → aynı şifre; yapı sızdırır. Neredeyse hiçbir senaryoda kullanılmamalı.",
            "CBC: IV tahmin edilemez olmalı; padding ve hata yanıtları oracle riski taşır.",
            "CTR / GCM / ChaCha: nonce/IV disiplini kritik; GCM’de nonce reuse felakettir.",
        ]
    )
    + table(
        ["Yapı", "Nonce reuse", "AES-NI", "Kaynak"],
        [
            ["AES-GCM", "Gizlilik + bütünlük ciddi risk", "Çok avantajlı", "RFC 5116, SP 800-38D"],
            ["AES-GCM-SIV", "Sınırlı sızıntı (eşitlik)", "Avantajlı", "RFC 8452"],
            ["ChaCha20-Poly1305", "Gizlilik + Poly1305 OTK riski", "Yok (yazılım)", "RFC 8439"],
        ],
    )
    + body_h2("Saldırı sınıfları: padding oracle, bit-flipping, meet-in-the-middle")
    + body_p(
        "Padding oracle: CBC’de çözülen plaintext’in padding geçerliliği farklı HTTP kodu veya zamanlama ile "
        "sızdırılırsa, saldırgan seçilen şifreli blokları çözebilir. Çözüm: AEAD veya Encrypt-then-MAC; "
        "hata yanıtlarını birleştirmek; doğrulama öncesi plaintext’e iş mantığıyla dokunmamak."
    )
    + body_p(
        "Bit-flipping (bütünlük yoksa): CTR/CBC gibi yapılarda şifreli metin üzerinde oynanabilir; MAC/AEAD "
        "olmadan bu değişiklikler uygulama katmanında anlamlı sonuç doğurur. Meet-in-the-middle çoğunlukla "
        "zayıf çoklu şifreleme tasarımlarında (ör. 2DES benzeri) gündeme gelir; modern protokollerde daha "
        "az yaygındır fakat “kendi kendine icat edilmiş” yığılar için hatırlanmalıdır."
    )
    + body_h2("Pratik: OpenSSL EVP ve libsodium")
    + body_p(
        "openssl enc komutu AEAD akışını güvenli biçimde modellemez; üretimde AEAD için EVP "
        "EncryptInit_ex2 / AEAD API’leri veya libsodium crypto_secretbox_xchacha20poly1305 gibi üst seviye "
        "primitifler tercih edilir. libsodium rastgele nonce üretmez — uygulama benzersiz nonce garantisi "
        "vermelidir."
    )
    + body_ul(
        [
            "openssl list -cipher-algorithms — hangi isimlerin gerçekten AEAD olduğunu RFC ile doğrulayın.",
            "Eski cipher adları (des, rc4, bf) politika dışı bırakılmalıdır.",
        ]
    )
    + body_h2("Eski algoritmalar ve kurumsal borç")
    + body_p(
        "DES/3DES, RC4 ve ECB modu hâlâ eski sistemlerde bulunur. PCI ve çoğu sektör standardı 3DES/TDEA "
        "üzerinde geçiş takvimi tanımlar. Migrasyon: trafikte önce modern suite, depoda re-encryption "
        "planı, anahtar sarmalama (key wrap) zincirinin güncellenmesi."
    )
    + body_h2("Analitik senaryo: API geçidi ve sahte bütünlük")
    + body_p(
        "Bir API geçidi gövdeyi CBC ile şifreliyor; bütünlük için anahtarsız SHA-256(body) başlıkta taşınıyor. "
        "Padding hatalarında 400, padding doğru ama JSON bozuksa 422 dönüyor. Saldırgan padding oracle ile "
        "plaintext’e yaklaşır; anahtarsız hash ise MAC değildir — değer taklit edilebilir."
    )
    + body_p(
        "Öneri: AEAD ile tek primitive; doğrulama başarısızlığında tek genel hata; loglarda farklılaşma "
        "yalnızca iç ağda ve oran sınırlı. Geçişte envelope re-encryption ve istemci uyumluluğu planlanır."
    )
)

M2_GOALS = [
    "AES’in SubBytes, ShiftRows, MixColumns ve AddRoundKey dönüşümlerini güvenlik sezgisi açısından açıklar; confusion veya diffusion hedefine nasıl katkıda bulunduğunu yorumlar.",
    "AES Key Schedule yapısının güvenlik açısından önemini, round key üretiminin amacını ve anahtar genişletme hatalarının kriptografik etkisini değerlendirir.",
    "AES-GCM, AES-GCM-SIV ve ChaCha20-Poly1305 yapılarını güvenlik hedefleri, nonce yönetimi gereksinimleri, kullanım sınırları ve uygulama senaryoları açısından karşılaştırır.",
    "Nonce tekrarının AES-GCM üzerindeki etkisini teknik düzeyde açıklar; AES-GCM-SIV’in bu riski nasıl farklı bir güvenlik modeli ile ele aldığını yorumlar.",
    "ChaCha20-Poly1305’te nonce tekrarının yalnızca gizliliği değil, Poly1305 one-time key tekrarından dolayı bütünlük/otantiklik güvenliğini de tehlikeye attığını açıklar.",
    "Padding oracle, bit-flipping ve meet-in-the-middle saldırılarını savunma odaklı analiz eder; bu saldırı sınıflarının kaynak aldığı uygulama hatalarını tespit eder.",
    "Hata mesajlarının kriptografik sızıntıya nasıl dönüştüğünü açıklar; güvenli API, doğrulanmamış plaintext’i işlememe ve sabit zamanlı karşılaştırma gereksinimini değerlendirir.",
    "NIST AES ve AEAD test vektörlerini okur; ciphertext, authentication tag, nonce/IV ve associated data alanlarını doğru biçimde ayrıştırır ve kütüphane çıktısıyla karşılaştırır.",
    "OpenSSL ve libsodium gibi kütüphanelerin varsayılan parametrelerini sorgular; güvenli API ile düşük seviye tehlikeli API ayrımını tanır.",
    "Eski algoritma desteğinin DES, 3DES/TDEA, RC4 ve ECB gibi yapılarda kurumsal sistemlere nasıl risk oluşturduğunu standart ve protokol çıktısı üzerinden gerekçelendirir ve güvenlik ekibine aktarır.",
]

M3_EXTRA = (
    body_h2("Hash güvenlik özellikleri ve birthday sınırı")
    + body_p(
        "n bit çıktılı ideal bir hash için preimage ve second preimage direnci yaklaşık 2^n deneme; "
        "collision direnci ise birthday nedeniyle yaklaşık 2^(n/2). Bu yüzden SHA-256 ile collision "
        "direnci 128 bit seviyesinde düşünülür; uzun ömürlü imza ve sertifika tasarımlarında bu fark "
        "kritiktir."
    )
    + table(
        ["Özellik", "n-bit ideal hash", "Pratik etki"],
        [
            ["Preimage direnci", "2^n", "Hash’ten girdiyi bulmayı zorlaştırır; parolada entropi + KDF ayrıca belirleyicidir."],
            ["Second preimage", "2^n", "Belirli m₁ için farklı m₂ bulmayı zorlaştırır."],
            ["Collision direnci", "2^(n/2)", "İmza ve PKI bağlamında özellikle kritik; birthday sınırı."],
        ],
    )
    + body_h2("Length extension, HMAC ve SHA-3 farkı")
    + body_p(
        "Merkle-Damgård tabanlı SHA-224/256/384/512’de naif H(key||message) MAC olarak kullanıldığında "
        "length extension riski doğar. HMAC, iç ve dış anahtarlı çift hash ile bu sınıfı pratikte kapatır. "
        "SHA-3 (Keccak) sponge yapısı farklıdır; yine de “hash’e güvenip MAC türetmek” için HMAC veya "
        "KMAC gibi amaca özel yapılar tercih edilir."
    )
    + body_h2("HKDF: extract, expand, salt ve info")
    + body_p(
        "HKDF (RFC 5869) iki aşamalıdır: extract (IKM + salt → PRK), expand (PRK + info → OKM). Salt, "
        "IKM’ye bağlı çıktıların çeşitliliğini artırır; info ise protokol ve bağlam alanlarını ayırmak "
        "için zorunlu sayılır — aynı PRK ile farklı info değerleri farklı anahtar malzemesi üretir."
    )
    + body_p(
        "Çıktı uzunluğu üst sınırı 255 × HashLen’dir; daha uzun anahtar gerekiyorsa farklı bir KDF veya "
        "HKDF çağrıları bilinçli şekilde ayrıştırılmalıdır."
    )
    + body_h2("Parola hashing: Argon2id ve parametreler")
    + body_p(
        "Parola için tek yönlü hash yeterli değildir; yavaş, bellek sert KDF (Argon2id, scrypt) ve "
        "benzersiz salt şarttır. OWASP örnekleri ile RFC 9106 profilleri farklı donanım varsayımlarına "
        "göre yazılmıştır; aynı rakamları körü körüne kopyalamak yerine tehdit modeli ve kullanıcı "
        "deneyimi ile dengeleyin."
    )
    + body_ul(
        [
            "PHC string: algoritma, versiyon, parametreler ve salt’ı birlikte kodlar — doğrulama tarafında doğru parser kullanın.",
            "Timing attack: secrets.compare_digest (Python) veya sabit zamanlı karşılaştırma kullanın.",
        ]
    )
    + body_h2("XOF ve SHAKE")
    + body_p(
        "SHAKE128/SHAKE256 uzatılabilir çıktı (XOF) üretir; sabit uzunluklu hash yerine KDF benzeri "
        "kullanımlarda dikkatle kullanılır. Hangi bağlamda hangi uzunluğun güvenli olduğu protokolle "
        "birlikte tanımlanmalıdır."
    )
    + body_h2("Analitik senaryo: zayıf parola ve sahte MAC")
    + body_p(
        "Sistem bcrypt cost=8 kullanıyor; GPU kırma maliyeti düşük. Bazı uçlarda “HMAC” denilen değer "
        "aslında SHA256(secret||userId) — anahtarlı MAC değil. Bir diğer uçta gövde bütünlüğü anahtarsız "
        "SHA256(body) ile sağlanıyor."
    )
    + body_p(
        "Eylem planı: Argon2id parametrelerini yükseltme + migration; tüm MAC’leri gerçek HMAC-SHA256 "
        "veya AEAD ile değiştirme; karşılaştırmayı sabit zamanlı yapma; gövde bütünlüğünü AEAD veya "
        "Encrypt-then-HMAC ile birleştirme."
    )
)

M3_GOALS = [
    "Birthday paradox ve birthday attack’ın hash güvenlik seviyesiyle matematiksel ilişkisini açıklayabilir; n-bit hash fonksiyonu için collision ve preimage güvenlik düzeylerini doğru ifade edebilir.",
    "Collision direnci, preimage direnci ve second preimage direncini birbirinden ayırabilir; bu özelliklerin dijital imza, belge bütünlüğü, parola doğrulama ve sertifika senaryolarındaki etkisini değerlendirebilir.",
    "Length extension saldırısının Merkle-Damgård yapısından nasıl kaynaklandığını ve SHA-2 ile SHA-3’ün bu konuda nasıl farklılaştığını güvenlik modeli bağlamında karşılaştırabilir.",
    "HMAC, CMAC, Poly1305 ve KMAC yapılarını güvenlik varsayımları, bağımlı oldukları ilkel, anahtar yönetimi ve timing-safe doğrulama gereksinimleri açısından değerlendirebilir.",
    "HKDF’nin extract ve expand aşamalarının hangi amaçla ayrıldığını, salt ve info parametrelerinin hangi güvenlik rollerini üstlendiğini ve domain separation için neden kritik olduklarını analiz edebilir.",
    "PBKDF2, bcrypt, scrypt ve Argon2id yapılarını saldırgan modeli, özellikle GPU/ASIC destekli çevrimdışı parola tahmini açısından karşılaştırabilir.",
    "Argon2id parametre üçlüsünü — zaman maliyeti, bellek maliyeti ve paralellik — hem güvenlik hem de performans açısından yorumlayabilir; yetersiz parametre seçiminin doğurduğu riski ifade edebilir.",
    "Hash ve parola hashing araçlarının ürettiği çıktıda salt, cost, memory, iteration, hash ve format alanlarını ayırt edebilir; bu çıktıyı standart belgeler ve güncel rehberlerle ilişkilendirebilir.",
    "XOF kavramını ve SHAKE fonksiyonlarının geleneksel sabit uzunluklu hash fonksiyonlarından hangi senaryolarda ayrıldığını açıklayabilir.",
    "MAC doğrulama başarısızlıklarının nasıl ele alınması gerektiğini ve hata mesajlarının kriptografik sızıntı riskini tartışabilir.",
    "Bir sistemde hash, MAC, KDF veya parola hashing seçimi yapılırken güvenlik modeli, performans, standart uyumu, migration planı ve uzun vadeli agility gereksinimlerini birlikte değerlendiren teknik bir öneri hazırlayabilir.",
]

M4_EXTRA = (
    body_h2("Sert problemler ve güvenlik varsayımları")
    + body_p(
        "RSA ailesi genellikle büyük tamsayıların çarpanlarına ayrılmasının zorluğuna; Diffie–Hellman ve ECC "
        "ise sonlu alan veya eğri grubunda ayrık logaritmanın zorluğuna dayanır. CDH (computational DH) ve "
        "DDH (decisional DH) farklı oyunlar tanımlar — bir şemanın ispatı hangi varsayıma bağlı olduğunu "
        "okumak gerekir."
    )
    + body_h2("RSA: OAEP, PKCS#1 v1.5 ve Bleichenbacher sınıfı")
    + body_p(
        "RSA şifrelemede textbook RSA (düz modüler üs alma) seçilmiş şifreli metin saldırılarına açıktır. "
        "OAEP, rastgelelik ve Feistel benzeri dönüşümle IND-CCA2 hedeflerine yaklaşır. PKCS#1 v1.5 "
        "padding’li RSA şifreleme, oracle’lar üzerinden Bleichenbacher tarzı seçilmiş şifreli metin "
        "saldırılarına tarihsel olarak açıktır; TLS’te legacy uyumluluk yüzünden hatırlanmalıdır."
    )
    + body_p(
        "İmzada RSA-PSS, salt ve hash tabanlı tasarımıyla RSASSA-PKCS1-v1.5’e göre daha güçlü formal "
        "gerekçe sunar. FIPS 186-5 her iki şemayı da koşullu onaylar; yeni sistemlerde PSS tercih edilir."
    )
    + body_h2("ECC: ECDH, ECDSA, Ed25519 ve X25519")
    + body_p(
        "ECDSA, rastgele nonce k ve imza denklemi s = k^{-1}(H(m)+r·d) nedeniyle nonce tekrarı veya "
        "kısmi nonce sızıntısında özel anahtar d’nin kurtarılmasına yol açabilir. RFC 6979 deterministik "
        "k üretimi bu riski azaltır. Ed25519 (EdDSA), Curve25519 üzerinde farklı bir imza tasarımıdır."
    )
    + body_p(
        "X25519 (Curve25519 Diffie–Hellman) anahtar anlaşması içindir; Ed25519 imza içindir. Aynı byte "
        "dizisini her iki amaçla kullanmak veya kütüphane varsayılanlarına güvenmeden “aynı anahtar” "
        "üretmek yüksek risktir — ayrı anahtar çiftleri ve açık politika şarttır."
    )
    + body_h2("Invalid curve ve küçük alt grup")
    + body_p(
        "Bazı Weierstrass implementasyonlarında, doğrulanmamış noktalar küçük alt gruba düşürülerek "
        "logaritmanın kolay olduğu bir alt yapıya indirgeme saldırıları mümkün olabilir. Kütüphane "
        "dokümantasyonunda nokta doğrulama ve cofactor clearing gereksinimlerini kontrol edin."
    )
    + body_h2("PEM, DER ve pratik okuma")
    + body_ul(
        [
            "BEGIN RSA PRIVATE KEY (PKCS#1) vs PKCS#8 BEGIN PRIVATE KEY — farklı ASN.1 ağaçları.",
            "openssl pkey -in key.pem -text — modulus, public exponent veya eğri parametrelerini inceleyin.",
            "Sertifikada Subject Public Key Info altında algoritma OID ve eğri adı tutarlı mı?",
        ]
    )
    + body_h2("Pairing ve BLS (konumlandırma)")
    + body_p(
        "Bilinear pairing, kimlik tabanlı şifreleme ve kısa BLS imzaları gibi yapılara zemin hazırlar; "
        "kurulum, parametre seçimi ve ispat dili klasik RSA/ECC’den daha ağırdır. Üretim kararı öncesi "
        "standart gövdesi ve kütüphane olgunluğu ayrı değerlendirme gerektirir."
    )
)

M4_GOALS = [
    "Factoring, discrete logarithm, CDH ve DDH varsayımlarının birbirleriyle ilişkisini açıklayabilir; bir algoritmanın güvenliğinin hangi varsayıma ve hangi güvenlik modeline dayandığını ifade edebilir.",
    "RSA’da küçük açık üs sorununu, Bleichenbacher saldırısının yapısal kaynağını ve timing sızıntısını güvenlik modeli bağlamında analiz edebilir.",
    "RSA-OAEP ve RSA-PSS’in hangi amaçlarla kullanıldığını açıklar; şifreleme padding’i ile imzalama padding’inin karıştırılmaması gerektiğini bilir.",
    "FIPS 186-5’in RSASSA-PKCS1-v1.5 ve RSASSA-PSS imza şemalarını belirli koşullarla onaylı kabul ettiğini; buna rağmen yeni tasarımlarda RSA-PSS’in formal güvenlik gerekçesi nedeniyle güçlü bir tercih olduğunu yorumlayabilir.",
    "Eliptik eğri gruplarının sonlu alan üzerindeki işleyişini, scalar multiplication’ın güvenlik sezgisini ve ECDH/ECDSA/EdDSA arasındaki tasarım farklarını teknik düzeyde açıklayabilir.",
    "X25519, Ed25519, P-256 ve P-384 gibi seçenekleri güvenlik profili, performans, yan kanal direnci, standart ekosistemi ve kullanım amacı açısından karşılaştırabilir.",
    "ECDSA nonce tekrarının özel anahtarı nasıl açığa çıkardığını ve deterministik ECDSA/RFC 6979 ile EdDSA’nın bu risk sınıfını nasıl azalttığını değerlendirebilir.",
    "Invalid curve saldırısının kavramsal mantığını, klasik Weierstrass eğrilerinde nokta doğrulamasının neden kritik olduğunu ve X25519 gibi yapılarda doğrulama modelinin farklılaştığını açıklayabilir.",
    "Bilinear pairing fikrinin BLS imzalarına ve kimlik tabanlı şifrelemeye nasıl zemin hazırladığını kısaca konumlandırabilir; bu alanın standart açık anahtar kriptografisine göre neden ek uzmanlık gerektirdiğini ifade edebilir.",
    "OpenSSL çıktısında RSA/ECC anahtar parametrelerini, eğri adını, anahtar boyutunu ve imza algoritmasını okuyabilir; PEM, DER ve ASN.1 formatları arasındaki ilişkiyi ayırt edebilir.",
    "Şifreleme, imza ve key establishment için aynı anahtar çiftinin kullanılmasının neden riskli olduğunu, anahtar kullanım ayrımının standartlar ve protokol politikalarıyla nasıl desteklendiğini açıklayabilir.",
    "Açık anahtar kriptografisindeki yapılandırma ve parametre sorunlarını güvenlik ekibine ve mimari ekibe teknik olarak aktarabilecek bir öneri dili geliştirebilir.",
]

M5_EXTRA = (
    body_h2("AKE hedefleri ve tehdit modeli")
    + body_p(
        "Authenticated Key Exchange (AKE), hem gizlilik hem de kimlik bağlar. Karşılıklı kimlik doğrulama, "
        "forward secrecy (geçmiş oturum anahtarlarının sonradan sızan uzun dönem sırlardan türetilememesi), "
        "identity protection (kimlik bilgisinin ağ üzerinde ifşası), KCI direnci (uzun dönem sırrın "
        "çalınması durumunda karşı tarafı taklit edememe) birlikte değerlendirilir."
    )
    + body_p(
        "Transcript binding: imzalanan veya MAC’lenen mesajlar, versiyonlar, sunucu isimleri ve "
        "algoritma teklifleri aynı bağlama dahil edilmezse unknown-key-share veya downgrade hataları "
        "mümkün olabilir."
    )
    + body_h2("TLS 1.3: anahtar programı ve 0-RTT")
    + body_p(
        "TLS 1.3’te el sıkışma daha kısadır; çoğu sertifika mesajı şifrelenir. Key schedule, HKDF ile "
        "Early Secret → Handshake Secret → Master Secret zincirini kurar; her aşamadan traffic key’ler "
        "türetilir. Cipher suite kavramı sadeleştirilmiştir; anahtar değişimi ve simetrik AEAD ayrı "
        "mekanizmalar olarak düşünülür."
    )
    + body_p(
        "0-RTT (early data), önceki oturumdan türetilen PSK ile gecikmeyi azaltır; fakat replay koruması "
        "uygulama semantiğiyle sınırlıdır. Ödeme, komut veya idempotent olmayan işlemler 0-RTT ile "
        "taşınmamalıdır."
    )
    + body_ul(
        [
            "Downgrade koruması: ServerHello içinde seçilen sürüm ve algoritmalar önceki mesajlarla tutarlı mı?",
            "Certificate Transparency: yayınlanmamış veya log dışı sertifika uyarıları olay incelemesinde sinyaldir.",
        ]
    )
    + body_h2("HPKE — RFC 9180")
    + body_p(
        "Hybrid Public Key Encryption, KEM (anahtar kapsülleme) + KDF + AEAD üçlüsüdür. base, psk, auth ve "
        "auth_psk modları farklı kimlik ve PSK varsayımları taşır. Gönderici kimliği ve bağlam string’leri "
        "AEAD associated data’ya doğru şekilde bağlanmalıdır."
    )
    + body_h2("Signal: X3DH ve Double Ratchet")
    + body_p(
        "X3DH, çevrimdışı başlangıç için birden fazla DH sonucunu birleştirir; one-time prekey tükendiyse "
        "dördüncü DH eksik kalabilir ve forward secrecy modeli zayıflar — istemci ve sunucu politikası "
        "bunu yönetmelidir."
    )
    + body_p(
        "Double Ratchet: symmetric-key ratchet her mesajda zincir anahtarını ilerletir; DH ratchet yeni "
        "paylaşımlar geldiğinde zinciri yeniler. Post-compromise security (PCS), uzun süreli sızdıktan "
        "sonra yeni mesajların güvenliğini kademeli olarak toparlar."
    )
    + body_h2("Komut ve araç okuryazarlığı")
    + body_ul(
        [
            "openssl s_client -connect host:443 -tls1_3 — el sıkışma ve zincir hızlı kontrol.",
            "testssl.sh veya SSL Labs: politika ve uyumluluk taraması (çıktıyı bağlamla yorumlayın).",
            "Wireshark: ClientHello/ServerHello ve şifreli record ayrımını kavramsal olarak takip edin.",
        ]
    )
)

M5_GOALS = [
    "Authenticated Key Exchange yapılarının temel güvenlik hedeflerini — karşılıklı kimlik doğrulama, forward secrecy, identity protection ve key compromise impersonation direnci — formal modelle ilişkilendirerek açıklayabilir.",
    "TLS 1.3 handshake akışını key schedule ve HKDF bağlamında adım adım yorumlayabilir; Early Secret, Handshake Secret, Master Secret ve bunlardan türetilen traffic secret değerlerinin rolünü tarif edebilir.",
    "0-RTT veri gönderiminin ne anlama geldiğini, hangi güvenlik garantilerini zayıflattığını ve replay’e hassas işlemlerde neden dikkatli kullanılmaması gerektiğini açıklayabilir.",
    "HPKE’nin KEM, KDF ve AEAD üçlüsünden nasıl kurulduğunu; base, psk, auth ve auth_psk modlarının güvenlik hedefleri açısından nasıl ayrıldığını değerlendirebilir.",
    "X3DH anahtar anlaşmasını ve Double Ratchet mekanizmasını forward secrecy ile post-compromise security açısından karşılaştırmalı biçimde analiz edebilir.",
    "Replay, downgrade, MITM, unknown key-share ve protokol bileşimi hatalarını güvenlik modeli perspektifiyle açıklayabilir; her saldırı sınıfına karşı hangi protokol mekanizmasının koruma sağladığını söyleyebilir.",
    "Wireshark’ta TLS 1.3 handshake paketlerini kavramsal düzeyde okuyabilir; hangi mesajların açık, hangilerinin şifreli taşındığını ve bunun güvenlik açısından ne anlama geldiğini tarif edebilir.",
    "OpenSSL s_client, testssl.sh ve SSL Labs raporlarını güvenlik açısından yorumlayabilir; zayıf cipher suite, eski TLS sürümü, forward secrecy eksikliği veya sertifika zinciri sorunları gibi bulguları teknik olarak açıklayabilir.",
    "Certificate Transparency’nin neden var olduğunu, hangi sertifika türleri için kritik olduğunu, SCT’nin ne anlama geldiğini ve CT kaydı eksikliğinin hangi bağlamlarda risk göstergesi sayılabileceğini açıklayabilir.",
    "Protokol analiz araçlarının yalnızca izinli sistemlerde kullanılabileceğini ve araç çıktısının kesin hüküm değil, güvenlik bağlamıyla yorumlanması gereken bir sinyal olduğunu ifade edebilir.",
]

M6_EXTRA = (
    body_h2("ZKP üçlüsü: completeness, soundness, zero-knowledge")
    + body_p(
        "Completeness: dürüst prover ve verifier protokolü takip ettiğinde, doğru iddia için verifier kabul "
        "eder. Soundness: yanlış iddia için hileli proverin kabul ettirme olasılığı ihmal edilebilir olmalıdır "
        "(computational veya statistical modele göre). Zero-knowledge: verifier, iddianın doğruluğu dışında "
        "hesaplanabilir şekilde ek bilgi öğrenmez."
    )
    + body_p(
        "Perfect ZK, simülatör dağılımı gerçek transcript ile aynıdır; statistical ve computational modellerde "
        "fark, “ayırt edilemezlik” tanımının gücündedir. Üretimde çoğu yapı computational soundness ile çalışır."
    )
    + body_h2("Sigma protokolleri ve Fiat–Shamir")
    + body_p(
        "Sigma protokol commit → challenge → response akışıdır. Fiat–Shamir ile challenge, hash ile "
        "türetildiğinde, hash girdisine yalnızca commitment değil; statement, public parametreler, "
        "domain separator ve (gerekiyorsa) önceki mesajlar da girmelidir — aksi halde malleability ve "
        "cross-protocol saldırıları görülür."
    )
    + body_ul(
        [
            "Caffeinate-style hatalar: farklı protokollerde aynı challenge türetim alanı.",
            "Partially blind / blind imza tasarımlarında transcript bileşenlerinin eksik bağlanması.",
        ]
    )
    + table(
        ["Özellik", "zk-SNARKs", "zk-STARKs", "Bulletproofs"],
        [
            ["Trusted setup", "Çoğu yapıda; universal seçenekler", "Gerekmez", "Gerekmez"],
            ["Proof boyutu", "Genelde çok küçük", "Genelde daha büyük", "Logaritmik; SNARK’tan büyük olabilir"],
            ["Post-kuantum (sezgi)", "Pairing SNARK’lar zayıf", "Hash tabanlı daha güçlü", "DL varsayımı; kuantumda zayıf"],
        ],
    )
    + body_h2("Trusted setup ve toxic waste")
    + body_p(
        "Çok katılımcılı powers-of-tau benzeri törenler, tek noktada sızan “toxic waste” riskini azaltır fakat "
        "operasyonel güven ve tören doğrulama süreçleri kritiktir. Universal SRS ile devre özgü kısım ayrılabilir."
    )
    + body_h2("Araçlar: Circom, snarkjs, Noir")
    + body_p(
        "snarkjs VERIFIED çıktısı, witness’ın constraint sistemine uyduğunu gösterir; fakat devrenin "
        "doğru iş kuralını modellediğini, aritmetizasyon hatası olmadığını veya setup’un güvenilir "
        "yürütüldüğünü tek başına garanti etmez. Formal doğrulama ve kod incelemesi ayrı kanaldır."
    )
    + body_p(
        "Noir, ZoKrates ve benzeri DSL’ler geliştirme hızını artırır; yine de derleyici sürümü, kütüphane "
        "fonksiyonları ve constraint sayısı üretim riskini belirler."
    )
)

M6_GOALS = [
    "Sıfır bilgi ispatlarının completeness, soundness ve zero-knowledge özelliklerini güvenlik modeli çerçevesinde açıklayabilir; bu özelliklerin perfect, statistical veya computational modellerde sağlanabileceğini ayırt edebilir.",
    "Completeness garantisinin bazı sistemlerde hatasız, bazı sistemlerde ise ihmal edilebilir hata olasılığıyla sağlandığını ifade edebilir.",
    "Soundness garantisinin computational, statistical veya perfect olmasının sistemin güvenlik varsayımını nasıl değiştirdiğini yorumlayabilir.",
    "Zero-knowledge özelliğinin simülatör argümanıyla nasıl tanımlandığını ve verifier’ın öğrendiği bilginin hangi model altında sınırlandırıldığını açıklayabilir.",
    "Sigma protokollerinin commit → challenge → response üç adımlı yapısını ve bu yapının Schnorr gibi klasik protokollerde nasıl kullanıldığını açıklayabilir.",
    "Fiat–Shamir dönüşümünün etkileşimli ispatları etkileşimsiz yapıya nasıl taşıdığını, challenge değerinin transcript ve domain separation bilgisine bağlanmamasının replay, malleability ve cross-protocol risklerine nasıl yol açabileceğini değerlendirebilir.",
    "AND ve OR ispatlarını doğru biçimde ayırabilir; AND ispatlarının konjunktif, OR ispatlarının ise disjunktif önermeleri temsil ettiğini ifade edebilir.",
    "zk-SNARKs, zk-STARKs ve Bulletproofs arasındaki farkları proof boyutu, trusted setup gerekliliği, prover/verifier maliyeti ve post-kuantum güvenlik beklentileri açısından karşılaştırabilir.",
    "Trusted setup meselesini, toxic waste kavramını, çok katılımcılı MPC törenlerinin güven modelini ve başarısız ya da belirsiz setup sürecinin sistem güvenliğine etkisini açıklayabilir.",
    "Range proof, üyelik ispatı, kimlik doğrulama ve blockchain geçerlilik kanıtı gibi kullanım alanlarını gerçek sistem gereksinimleriyle ilişkilendirebilir.",
    "Circom, Noir ve ZoKrates gibi araçların ne amaçla kullanıldığını, circuit/devre mantığını, prover-verifier ayrımını ve bu ekosistemi üretim olgunluğu açısından değerlendirebilir.",
    "ZKP araçlarının denetlenebilirlik, standartlaşma, bakım maliyeti, trusted setup, verification key yönetimi ve devre doğruluğu açısından taşıdığı riskleri ifade edebilir.",
    "Bir ZKP sistemini değerlendirirken hangi güvenlik varsayımlarına dayandığını, hangi güven modelini kullandığını ve hangi uygulama risklerini taşıdığını belirleyerek geliştiriciye veya mimari ekibe aktarabilir.",
]

M7_EXTRA = (
    body_h2("Uygulama hataları: nonce, RNG, API ve hata yüzeyi")
    + body_p(
        "Aynı anahtar + nonce tekrarı AEAD’de felakettir. CBC’de IV tekrarı ilk blokta yapı sızdırır. "
        "Zayıf RNG veya fork sonrası kopyalanan VM imajı, anahtar çakışmalarına yol açar. Yüksek seviye "
        "dillerde “kolay” API’ler, MAC doğrulamasını atlama veya plaintext’i erken sızdırma riski taşır."
    )
    + body_p(
        "Environment variable veya yapılandırma dosyasında düz metin master key, sızıntı halinde tüm "
        "şifreli veriyi tek hamlede açar. Çözüm: KMS/HSM ile sarmalama, kısa ömürlü oturum anahtarları, "
        "least privilege erişim."
    )
    + body_h2("Yan kanallar: zamanlama, önbellek, güç, fault injection")
    + body_p(
        "Constant-time karşılaştırma ve sabit akışlı şifreleme rutinleri, gizli verinin dallanma veya "
        "bellek erişim düzeninden sızmaması için gereklidir. RSA CRT implementasyonlarında Bellcore "
        "sınıfı fault injection, hatalı imza üretiminden asal çarpanlara giden yolu açabilir."
    )
    + body_p(
        "Güvenli zeroization: anahtar materyalini bellekten silme, GC’ye güvenmekten farklıdır; "
        "hassas dil modları veya donanım destekli silme politikaları değerlendirilir."
    )
    + body_h2("KEK, DEK, key wrapping ve rotasyon")
    + body_p(
        "KEK (Key Encryption Key) rotasyonu çoğu zaman mevcut DEK’leri yeni KEK ile yeniden sarmalamayı "
        "(rewrap) içerir. DEK rotasyonu ise veriyi yeniden şifrelemeyi gerektirir — büyük veri "
        "hacimlerinde arka plan işleri ve tutarlılık planı şarttır. AES Key Wrap RFC 3394 ve KWP RFC 5649 "
        "standart seçeneklerdir."
    )
    + body_h2("FIPS 140-3 / CMVP ve üretim gerçeği")
    + body_p(
        "FIPS 140-3 doğrulanmış kriptografik modül, belirli sınırlarda test edilmiş bir bileşendir. "
        "Uygulamanızın yanlış çağrı sırası, zayıf parametre veya protokol hatası modül validasyonundan "
        "muaf tutulmaz."
    )
    + table(
        ["Özellik", "HSM", "Cloud KMS", "Vault"],
        [
            ["Anahtar izolasyonu", "Donanım sınırı güçlü", "Model bağlı (SW/HSM/BYOK)", "Yazılım; HSM ile güçlendirilir"],
            ["Secret yönetimi", "Sınırlı", "Servise bağlı", "Güçlü"],
            ["Audit", "Ürüne bağlı", "Cloud logging", "Audit device"],
        ],
    )
    + body_h2("Crypto agility")
    + body_p(
        "Algoritma değişimi yalnızca kütüphane sürümü değildir: sertifika politikaları, yedekleme formatları, "
        "istemci uyumluluğu, donanım firmware ve uyumluluk onayları birlikte güncellenmelidir."
    )
)

M7_GOALS = [
    "Kriptografik uygulama hatalarını sınıflandırabilir; yanlış parametre, yanlış API, zayıf RNG, nonce/IV tekrar kullanımı ve hata mesajı sızıntısı gibi hata türlerini birbirinden ayırt edebilir.",
    "AES-GCM, CBC, CTR, ChaCha20-Poly1305 gibi yapılarda IV/nonce gereksinimlerinin aynı olmadığını açıklayabilir; CBC için tahmin edilemez IV, GCM/CTR/ChaCha20-Poly1305 için aynı anahtar altında nonce benzersizliği ayrımını doğru kurabilir.",
    "Timing, cache, power analysis ve fault injection gibi yan kanal saldırılarının algoritma güvenliğinden bağımsız bir tehdit katmanı oluşturduğunu açıklayabilir ve constant-time programlama ihtiyacını bu bağlamda yorumlayabilir.",
    "Anahtar yaşam döngüsünü üretim, dağıtım, saklama, kullanım, rotasyon/yenileme, arşivleme ve imha aşamalarıyla kurumsal ölçekte değerlendirebilir.",
    "KEK/DEK ayrımını, key wrapping mantığını ve KEK rotasyonu ile DEK rotasyonu arasındaki farkı doğru yorumlayabilir.",
    "Kriptografik çevikliği bir mimari tasarım ilkesi olarak tanımlayabilir; algoritma değişiminin kod, protokol, sertifika, depolama ve operasyon katmanlarına etkisini analiz edebilir.",
    "FIPS 140-3 ve CMVP mantığını açıklayabilir; standart uyumunun modül seviyesinde bir validasyon olduğunu, uygulama entegrasyonunun güvenliğini otomatik olarak garanti etmediğini ifade edebilir.",
    "HashiCorp Vault, Cloud KMS ve HSM gibi araçların anahtar yönetimi mimarisindeki rollerini karşılaştırabilir; audit log, key rotation ve erişim yetkilendirme çıktılarını yorumlayabilir.",
    "Kriptografik uygulama güvenliği bulgularını geliştirici, güvenlik mühendisi ve mimari ekibe aktarabilecek teknik dilde ifade edebilir.",
    "Güvenli varsayılanların, secret handling pratiklerinin ve bellek temizlemenin neden yalnızca “iyi alışkanlık” değil, kriptografik güvenlik gereksinimi olduğunu açıklayabilir.",
]

M8_EXTRA = (
    body_h2("Shamir (t, n) gizli paylaşım")
    + body_p(
        "Sırrı s polinomunun sabit terimi olarak kodlarsınız; derece t−1 rastgele katsayılar seçilir. n "
        "farklı x noktasında değerlendirilen paylar dağıtılır. Herhangi t pay birleştirildiğinde s "
        "tekil olarak çıkar; t−1 veya daha az pay bilgi-teorik olarak sırrı sızdırmaz (rastgele "
        "polinom modelinde)."
    )
    + body_p(
        "Dealer güveni: payları üreten taraf tüm sırrı bilir. Dağıtık anahtar üretimi (DKG) ve VSS "
        "bu güveni azaltmak için kullanılır. Reconstruction tek noktada yapılıyorsa, o ana bilgi "
        "sızıntısı riski taşır."
    )
    + body_h2("VSS: Feldman ve Pedersen")
    + body_p(
        "Feldman VSS, her payın doğrusal ilişkili bir commitment ile tutarlı olduğunu doğrular; paylar "
        "ağ üzerinden dağıtılırken hile tespiti mümkün olur. Pedersen taahhütleri bilgi-teorik gizlilik "
        "sağlar; bağlayıcılık (binding) hesaplamalı varsayımlara dayanır — hangi modelin kullanıldığını "
        "dokümantasyondan doğrulayın."
    )
    + body_h2("Eşik imza: ECDSA, FROST, BLS")
    + body_p(
        "Threshold ECDSA, imza denkleminin dağıtık hesabı nedeniyle karmaşık protokoller gerektirir. "
        "FROST (RFC 9591), Schnorr tarafında nonce commitment ve binding factor ile paralel oturumlarda "
        "nonce tekrarı ve rogue-key saldırılarını hedefler."
    )
    + body_p(
        "BLS threshold imza, aynı paylaşılmış gizli anahtardan imza payları üretir ve birleştirir; "
        "BLS aggregate imza ise farklı public key’lere ait imzaları tek kısa imzada birleştirir — "
        "güvenlik modeli ve operasyonel anlam farklıdır."
    )
    + body_h2("MPC modelleri ve garbled circuits")
    + body_p(
        "Semi-honest (honest-but-curious) modelde taraflar protokolü izler fakat mesajları değiştirmez; "
        "malicious modelde aktif sapma mümkündür. Honest majority, dishonest majority ve adaptive "
        "corruption eksenleri maliyeti ve round sayısını belirler."
    )
    + body_p(
        "Garbled circuits ve oblivious transfer, iki tarafın bir fonksiyonu ortak girdilerle "
        "hesaplamasını, girdiler dışında fazladan bilgi sızdırmadan modellemeye yarar; pratikte "
        "iletişim ve CPU maliyeti yüksektir."
    )
    + body_h2("Share refresh ve katılımcı değişimi")
    + body_p(
        "Share refresh, sırrı değiştirmeden yeni pay seti üretir; uzun süreli compromise birikimini "
        "azaltır. Participant replacement ise operasyonel olarak ayrı prosedürler ve kimlik "
        "doğrulama gerektirir."
    )
)

M8_GOALS = [
    "Shamir’in Gizli Paylaşım Şeması’nın matematiksel yapısını ve (t,n) eşik mantığını güvenlik modeli bağlamında açıklayabilir; t pay ile reconstruction yapılabildiğini, t−1 veya daha az payın bilgi-teorik gizlilik sağladığını ve polinom derecesinin t−1 olduğunu doğru ifade edebilir.",
    "Feldman ve Pedersen VSS yapılarının neden gerekli olduğunu, pay doğrulamanın dağıtık güven modeline ne kattığını ve gizlilik-doğrulanabilirlik dengesini değerlendirebilir.",
    "Feldman VSS’nin esas katkısının public commitment tabanlı pay doğrulama olduğunu; Pedersen VSS’de taahhütlerin bilgi-teorik gizlilik sağladığını, bağlayıcılığın ise ayrık logaritma ilişkisine dayalı hesaplamalı varsayıma bağlı olduğunu açıklayabilir.",
    "Threshold ECDSA, threshold EdDSA/Schnorr ve threshold BLS imza şemalarının çalışma mantığını; özel anahtarın yeniden birleştirilmemesi gerektiği fikrinin protokole nasıl yansıdığını ve custody sistemlerinde bu yapıların kullanım gerekçesini analiz edebilir.",
    "Threshold ECDSA’da k^{-1}(H(m)+r·d) yapısının dağıtık biçimde hesaplanmasının neden karmaşık olduğunu; threshold Schnorr/EdDSA tarafında FROST gibi protokollerin nonce commitment ve binding factor mantığıyla güvenliği nasıl güçlendirdiğini açıklayabilir.",
    "BLS threshold signature ile BLS aggregate signature arasındaki farkı ayırt edebilir; threshold BLS’de aynı shared secret key’in paylarından signature share üretildiğini, aggregate BLS’de ise farklı public key’lere ait imzaların birleştirildiğini ifade edebilir.",
    "Güvenli çok taraflı hesaplamayı honest-but-curious ve malicious model çerçevesinde konumlandırabilir; ayrıca dürüst çoğunluk, dishonest majority, static/adaptive corruption, abort/fairness ve ağ senkronluğu gibi ek güvenlik modeli eksenlerinin önemini kavrayabilir.",
    "Garbled circuit ve oblivious transfer kavramlarını saldırı yüzeyiyle birlikte yorumlayabilir; bu yapıların hangi güvenlik modeli altında tarafların kendi girdileri ve çıktı dışında ek bilgi öğrenmesini engellemeyi hedeflediğini açıklayabilir.",
    "Dağıtık kripto sistemlerinin performans, iletişim ve operasyonel risklerini akademik modelden ayırarak üretim gerçekliğiyle karşılaştırabilir.",
    "Share refresh, resharing, participant replacement ve backup/recovery gibi kavramları birbirinden ayırabilir; share refresh’in temel amacının sırrı değiştirmeden payları yenileyerek zaman içinde biriken compromise riskini azaltmak olduğunu açıklayabilir.",
    "MPC ve eşik kriptografi araç ekosistemini üretim olgunluğu, denetlenebilirlik ve bakım maliyeti açısından değerlendirebilir; demo araçla üretim sistemi arasındaki farkı somutlaştırabilir.",
    "Eşik kriptografisine geçiş kararı içeren bir mimari öneride riskleri, güven varsayımlarını ve operasyonel gereksinimleri doğru biçimde ifade edebilir.",
]

M9_EXTRA = (
    body_h2("Shor ve Grover: neyi değiştirir?")
    + body_p(
        "Shor algoritması, büyük tamsayıların çarpanlarına ayrılması ve ayrık logaritma problemlerini "
        "polinom zamanda çözebilecek kuantum kaynakları öngörür; bu nedenle RSA, klasik DH ve ECC "
        "uzun vadede tehdit altındadır. Grover araması simetrik anahtar uzayını yaklaşık yarıya indirir "
        "— AES-128 için 2^64 düzeyi sezgisel hedef; bu yüzden uzun ömürlü sistemlerde 256 bit anahtar "
        "düşünülebilir."
    )
    + body_p(
        "Hash için preimage direnci Grover ile yaklaşık yarıya iner; collision direnci ise birthday "
        "sınırı nedeniyle farklı analiz edilir — “hash boyutunu iki katına çıkar” genellemesi her "
        "özellik için doğru değildir."
    )
    + body_h2("NIST PQC standartları ve yol haritası")
    + body_p(
        "FIPS 203 (ML-KEM, eski adıyla Kyber) anahtar kapsülleme içindir. FIPS 204 (ML-DSA / Dilithium) ve "
        "FIPS 205 (SLH-DSA / SPHINCS+) dijital imzadır — KEM ile imza karıştırılmaz. NIST ek KEM ve imza "
        "adayları (ör. kod tabanlı KEM, FN-DSA süreci) takip edilmelidir; standart seti zamanla genişler."
    )
    + body_h2("Hibrit KEM ve domain separation")
    + body_p(
        "Hibrit tasarımda klasik ve PQC paylaşılan sırlar KDF ile birleştirilir; HKDF veya protokolün "
        "tanımladığı etiketlerle domain separation şarttır. Güvenlik hedefi genelde: bileşenlerden en "
        "az biri güçlü kaldığı sürece birleşik sır güvende kalır (kombinasyon şemasına bağlıdır)."
    )
    + body_h2("Harvest-now-decrypt-later (HNDL)")
    + body_p(
        "Bugün TLS ile korunan trafik kaydedilir; yarın RSA veya ECC kırılırsa geçmiş gizlilik risk "
        "altına girer. Uzun gizlilik ömrü olan arşivler, yedekler ve anahtar sarmalama için PQC "
        "geçişi önceliklendirilir. Forward secrecy, oturum anahtarlarını korur; arşivlenmiş tek "
        "şifreli blob için tek başına yeterli olmayabilir."
    )
    + body_h2("Kurumsal geçiş: envanter ve öncelik")
    + body_ul(
        [
            "Kriptografik envanter: hangi ürün hangi algoritma ve anahtar uzunluğu?",
            "Veri gizlilik ömrü: 5 yıl mı 30 yıl mı — HNDL duyarlılığı buna göre değişir.",
            "Tedarikçi yol haritası: TLS kütüphanesi, HSM firmware, VPN ve PKI.",
        ]
    )
    + body_h2("OQS / liboqs uyarısı")
    + body_p(
        "Open Quantum Safe projesindeki liboqs ve provider’lar araştırma, eğitim ve prototipleme için "
        "değerlidir; API stabilitesi, yan kanal incelemesi ve uzun süreli bakım üretim garantisi sunmaz. "
        "Üretimde satıcı destekli ve doğrulanmış yığınları tercih edin."
    )
    + body_h2("Analitik senaryo: uzun ömürlü anahtar sarmalama")
    + body_p(
        "FinanceOrg, 15–20 yıl saklanacak müşteri kayıtlarını RSA-2048 ile sarmalanmış DEK’lerle "
        "tutuyor. Geçiş: hibrit KEM ile yeni sarmalama, eski kayıtlar için planlı rewrap veya "
        "yeniden şifreleme, test ortamında boyut ve gecikme ölçümü."
    )
)

M9_GOALS = [
    "Shor algoritmasının RSA, klasik Diffie-Hellman ve ECC üzerindeki etkisini; Grover algoritmasının ise simetrik şifreleme ve hash fonksiyonlarına olan daha sınırlı etkisini güvenlik modeli düzeyinde açıklayabilir.",
    "Preimage direnci ile collision direncini ayırt ederek hash fonksiyonlarının kuantum saldırgan modelindeki durumunu daha doğru yorumlayabilir.",
    "Kafes tabanlı, kod tabanlı, hash tabanlı, çok değişkenli ve izogeni tabanlı PQC ailelerini anahtar boyutu, imza/ciphertext boyutu, performans ve güvenlik varsayımı açısından karşılaştırabilir.",
    "ML-KEM, ML-DSA ve SLH-DSA standartlarının kapsamını, eski CRYSTALS-Kyber, CRYSTALS-Dilithium ve SPHINCS+ adlarıyla ilişkisini ve hangi kullanım senaryolarına karşılık geldiğini açıklayabilir.",
    "HQC’nin kod tabanlı bir KEM olarak NIST tarafından 2025’te standartlaştırma sürecine seçildiğini ve FN-DSA/FIPS 206 sürecinin FALCON tabanlı ek imza standardı olarak devam ettiğini güncel standartlaşma bağlamında konumlandırabilir.",
    "KEM ile dijital imza işlevini birbirinden ayırabilir; ML-KEM’in anahtar kapsülleme, ML-DSA ve SLH-DSA’nın ise dijital imza için kullanıldığını ifade edebilir.",
    "Hibrit anahtar anlaşmasının güvenlik mantığını, klasik ve post-kuantum bileşenlerin KDF ile nasıl birleştirildiğini ve bileşenlerden en az biri güvenli kaldığında birleşik sır için güvenlik hedeflendiğini açıklayabilir.",
    "Harvest-now-decrypt-later tehdidini uzun ömürlü veri sahipleri için geçiş önceliğiyle ilişkilendirebilir.",
    "Kurumsal bir PQC geçiş planının kriptografik envanter, risk sınıflandırması, veri gizlilik ömrü, algoritma çevikliği, uyumluluk takibi, performans testi ve tedarikçi desteği gibi bileşenlerden oluştuğunu açıklayabilir.",
    "OQS/liboqs ve OQS OpenSSL Provider araçlarının araştırma, eğitim, prototipleme ve geçiş testi için kullanılabileceğini; ancak üretim güvenliği kanıtı olarak yorumlanmaması gerektiğini değerlendirebilir.",
    "PQC algoritmalarının test vektörü çıktıları, benchmark sonuçları, anahtar/ciphertext/imza boyutları ve standart belgelerindeki gereksinimleri ileri seviyede okuyabilir.",
    "Bir kurumun TLS altyapısı, VPN sistemleri, PKI yapısı, yazılım imzalama zinciri, veri arşivleri ve anahtar sarmalama mekanizmalarını PQC geçişi açısından farklı risk profilleriyle sınıflandırabilir.",
    "Crypto agility kavramını PQC geçişiyle ilişkilendirerek algoritma değişiminin mimari, protokol, depolama, sertifika, tedarik zinciri ve operasyon tarafındaki etkilerini teknik ekibe aktarabilir.",
]

M10_EXTRA = (
    body_h2("Tam ve kısmi homomorfik şifreleme (FHE aileleri)")
    + body_p(
        "BFV ve BGV, modüler tamsayı üzerinde kesin işlemler için uygundur; CKKS yaklaşık gerçek veya "
        "karmaşık sayılar için çalışır ve hata bütçesi (noise budget) ile derinlik sınırlıdır. "
        "Bootstrapping, şifreli devreyi yenileyerek derinliği uzatır; maliyet şema ve donanıma göre "
        "katlanarak artar."
    )
    + body_p(
        "FHE ile güvenlik hedefi değişir: hesaplama yapan taraf plaintext görmeyebilir; yine de yan "
        "kanal, yanlış devre derinliği ve anahtar yönetimi riskleri kalır."
    )
    + body_h2("Fonksiyonel şifreleme (FE) ve öznitelik tabanlı şifreleme (ABE)")
    + body_p(
        "FE, yalnızca belirli bir fonksiyon çıktısının öğrenilmesine izin verecek şekilde şifre çözümü "
        "modeller; ince çıktı (function hiding) ve politika ifadesi karmaşıktır. CP-ABE’de şifreleme "
        "politikaya bağlıdır; KP-ABE’de anahtar politika taşır — hangi modelin operasyonel olarak "
        "revoke edilebilir olduğunu sorgulayın."
    )
    + body_p(
        "Kimlik tabanlı şifrelemede (IBE) PKG merkezi escrow riski taşır; kurumsal kullanımda HSM ve "
        "çok taraflı kontroller gündeme gelir."
    )
    + body_h2("Anonim imzalar ve hesap verebilirlik dengesi")
    + table(
        ["Yapı", "Anonimlik", "Hesap verebilirlik"],
        [
            ["Kör imza", "İmzacı içeriği görmez", "Çift harcama vb. ayrı mekanizma"],
            ["Grup imzası", "Üye gizli", "Yönetici açabilir (ISO/IEC 20008 çizgisi)"],
            ["Ring imza", "Halkada kimlik gizli", "Merkezi açma yok; Monero RingCT ilişkisi"],
        ],
    )
    + body_h2("Olgunluk spektrumu ve üretim soruları")
    + body_p(
        "ZKP ve PQC, seçilmiş senaryolarda üretim yolundadır. FHE ve birçok ABE çözümü pilot veya "
        "niş kullanımdadır. Akademik prototip, denetlenmiş kütüphane, standart gövdesi ve operasyonel "
        "runbook aynı şey değildir."
    )
    + body_ul(
        [
            "Kimin yazdığı, ne sıklıkla güncelleniyor, CVE geçmişi var mı?",
            "Performans: latency ve throughput ölçümü kendi veri dağılımınızda mı?",
            "Hukuk ve uyum: anonim imza veya gizli ödeme ürünleri için ek gereksinimler.",
        ]
    )
)

M10_GOALS = [
    "Homomorfik şifrelemenin kısmen ve tam homomorfik ayrımını, CKKS/BFV/BGV şemalarının hangi veri tiplerine uygun olduğunu ve performans sınırlarının neden birçok üretim kullanımını kısıtladığını açıklayabilir.",
    "Fonksiyonel şifreleme ile öznitelik tabanlı şifrelemenin klasik şifreleme modellerinden farkını, erişim politikası kavramını ve bu yapıların gerçek kullanım senaryolarındaki operasyonel zorluklarını ilişkilendirebilir.",
    "Kör imza, grup imzası ve ring imzasının hangi gizlilik ve hesap verebilirlik dengelerini sağladığını, hangi sistemlerde karşımıza çıkabileceğini ve birbirlerinden hangi yönlerle ayrıldıklarını açıklayabilir.",
    "Bu modüldeki yapıların olgunluk spektrumunu değerlendirebilir; hangi yapıların sınırlı üretim kullanımında, hangilerinin ağırlıklı olarak araştırma veya prototipleme alanında olduğunu daha güvenilir biçimde sınıflandırabilir.",
    "FHE, ZKP ve anonim kriptografi araç ekosistemini üretim olgunluğu, denetim geçmişi, performans beklentisi, bakım sağlığı ve standartlaşma durumu açısından değerlendirebilir.",
    "Araştırma araçlarını ve prototipleme kütüphanelerini doğrudan üretim sistemlerine taşımanın neden ciddi risk oluşturduğunu somut gerekçelerle ifade edebilir.",
    "Benchmark çıktılarını yorumlayarak bir yapının kendi altyapısında uygulanabilirliğini ön değerlendirme düzeyinde analiz edebilir.",
    "Bu ileri yapılarla ilgili teknik iletişim kurabilir; bir araştırma önerisini veya sistem mimarisi tartışmasını gerçekçi güvenlik, performans ve olgunluk argümanlarıyla değerlendirebilir.",
]

SECTIONS = [
    (
        "ik-m1",
        True,
        "MODÜL 1 — Formal güvenlik modelleri ve ispat düşüncesi",
        "Formal güvenlik modelleri, IND-CPA, IND-CCA, EUF-CMA ve standart okuma",
        "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&q=85",
        "Bu modül “güvenli” kelimesini sezgisel bir his olmaktan çıkarıp; saldırgan modeli, güvenlik oyunu, avantaj ve koşullu ispat çerçevesinde okunabilir hâle getirir.",
        M1_EXTRA + breakout("Üç okuma refleksi", "Standart veya makaleye girmeden önce bunları sorun.", [("fa-crosshairs", "Hedef iddia", "Hangi güvenlik özelliği iddia ediliyor; hangi model?"), ("fa-user-secret", "Saldırgan", "Hangi sorgular ve gözlemler mümkün?"), ("fa-link", "Köprü", "İddia ile kullanılan mod/nonce/hata davranışı tutarlı mı?")]),
        "Kazanımlar",
        M1_GOALS,
        1,
    ),
    (
        "ik-m2",
        False,
        "MODÜL 2 — İleri simetrik kriptografi ve AEAD",
        "AES yapı taşları ve AEAD: GCM, GCM-SIV, ChaCha20-Poly1305",
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=85",
        "AES’i kara kutu olmaktan çıkarıp AEAD seçimini nonce yönetimi, tag ve saldırı sınıfları üzerinden okumayı hedefler.",
        M2_EXTRA + breakout("Nonce disiplini", "Aynı anahtar altında tekrar etmeyen nonce üretimi tasarım gereğidir.", [("fa-random", "Üretim", "CSPRNG, sayaç veya protokol garantisi; dağıtık sistemde çakışma riski."), ("fa-tag", "Tag", "Doğrulama önce; plaintext sızdırma yok."), ("fa-gauge-high", "Limitler", "SP 800-38D ve protokol mesaj boyutu sınırları.")]),
        "Kazanımlar",
        M2_GOALS,
        2,
    ),
    (
        "ik-m3",
        False,
        "MODÜL 3 — İleri hash, MAC, KDF ve parola güvenliği",
        "Collision vs preimage, HMAC, HKDF, Argon2id ve araç çıktısı okuma",
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&q=85",
        "Hash ve MAC seçimini güvenlik özelliği ve kullanım bağlamıyla birlikte; parola tarafında ise offline saldırgan modeli ve maliyet parametreleriyle değerlendirmeyi öğretir.",
        M3_EXTRA,
        "Kazanımlar",
        M3_GOALS,
        3,
    ),
    (
        "ik-m4",
        False,
        "MODÜL 4 — İleri açık anahtar kriptografisi",
        "RSA/ECC, padding, Bleichenbacher, ECDSA nonce, Ed25519 vs X25519",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=85",
        "Asimetrik kriptografiyi yalnızca “büyük sayılar” değil; padding, protokol, imzalama ve anahtar formatı okuryazarlığı ile birlikte ele alır.",
        M4_EXTRA,
        "Kazanımlar",
        M4_GOALS,
        4,
    ),
    (
        "ik-m5",
        False,
        "MODÜL 5 — Güvenli kanal protokolleri ve modern mesajlaşma kriptografisi",
        "TLS 1.3, HPKE, Signal X3DH/Double Ratchet, CT ve araçlar",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=85",
        "Algoritma yığınını protokol hedefleriyle birleştirir: AKE, 0-RTT sınırları, HPKE modları ve Signal ailesinin forward secrecy / PCS dilini doğru kurmak.",
        M5_EXTRA,
        "Kazanımlar",
        M5_GOALS,
        5,
    ),
    (
        "ik-m6",
        False,
        "MODÜL 6 — Sıfır bilgi ispatları ve gizlilik koruyucu kriptografi",
        "Completeness/soundness/ZK, Fiat–Shamir, SNARK/STARK, trusted setup, devre denetimi",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18b5?w=1200&q=85",
        "ZKP’yi yalnızca “kanıt var” değil; hangi relation, hangi setup, hangi transcript bağlama ve hangi uygulama entegrasyonu sorularıyla okumayı sağlar.",
        M6_EXTRA,
        "Kazanımlar",
        M6_GOALS,
        6,
    ),
    (
        "ik-m7",
        False,
        "MODÜL 7 — Kriptografik uygulama güvenliği, yan kanallar ve anahtar yönetimi",
        "Nonce/RNG/oracle, yan kanallar, KEK/DEK, FIPS/CMVP, HSM/KMS/Vault",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=85",
        "Doğru primitif seçiminin uygulama, operasyon ve donanım katmanlarında nasıl bozulabileceğini ve anahtar yaşam döngüsünün kurumsal güvenliğin omurgası olduğunu bağlar.",
        M7_EXTRA,
        "Kazanımlar",
        M7_GOALS,
        7,
    ),
    (
        "ik-m8",
        False,
        "MODÜL 8 — Eşik kriptografisi, MPC ve dağıtık güven",
        "Shamir, VSS, threshold imzalar, FROST, MPC modelleri, share refresh",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=85",
        "Tekil private key riskini matematiksel olarak dağıtır; fakat tarafların gerçek bağımsızlığı ve protokol mesajlarının güvenli taşınması operasyonel olarak en az kripto kadar kritiktir.",
        M8_EXTRA,
        "Kazanımlar",
        M8_GOALS,
        8,
    ),
    (
        "ik-m9",
        False,
        "MODÜL 9 — Post-kuantum kriptografi ve geçiş stratejileri",
        "Shor/Grover, ML-KEM/ML-DSA/SLH-DSA, hibrit KEM, HNDL, OQS",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=85",
        "Kuantum tehdidini problem türlerine ayırır; NIST PQC ilk standartlarını, hibrit tasarım dilini ve kurumsal envanter + geçiş önceliklendirmesini bir arada okutur.",
        M9_EXTRA,
        "Kazanımlar",
        M9_GOALS,
        9,
    ),
    (
        "ik-m10",
        False,
        "MODÜL 10 — İleri kriptografik yapılar ve araştırma ufku",
        "FHE, FE/ABE, anonim imzalar, olgunluk değerlendirmesi",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=85",
        "Araştırma hattındaki yapıları “heyecan” yerine olgunluk, denetim, performans ve standart ekseninde konumlandırır; üretim kararı için sorulacak soruları netleştirir.",
        M10_EXTRA,
        "Kazanımlar",
        M10_GOALS,
        10,
    ),
]


def sidebar():
    lis = []
    for i, (sid, icon, label) in enumerate(NAV):
        active = " active" if i == 0 else ""
        lis.append(
            f'                        <li><a href="#" class="nav-link-section{active}" data-section="{sid}"><i class="fas {icon}"></i> {escape(label)}</a></li>'
        )
    return "\n".join(lis)


def main():
    parts = [
        '    <div class="module-layout">',
        '        <aside class="module-sidebar">',
        '            <div class="sidebar-header">',
        "                <h1>İLERİ KRİPTOGRAFİ</h1>",
        "                <p>İleri Seviye — 10 Modüllük Tam Müfredat</p>",
        '                <div class="progress-container">',
        '                    <div class="progress-bar">',
        '                        <div class="progress-fill" id="progressFill"></div>',
        "                    </div>",
        '                    <div class="progress-text" id="progressText">0% Tamamlandı</div>',
        "                </div>",
        "            </div>",
        '            <nav class="sidebar-nav">',
        '                <div class="nav-section">',
        "                    <h4>İçindekiler</h4>",
        '                    <ul class="nav-list nav-section-list">',
        sidebar(),
        "                    </ul>",
        "                </div>",
        "            </nav>",
        "        </aside>",
        "",
        f'        <main style="{MAIN_STYLE}">',
        '            <div id="lesson-route-hero" class="lesson-route-hero" aria-live="polite" hidden>',
        '                <p class="lesson-route-hero-module"></p>',
        '                <p class="lesson-route-hero-lesson"></p>',
        '                <div class="lesson-route-hero-img-wrap">',
        '                    <img class="lesson-route-hero-img" src="" alt="" loading="lazy" decoding="async" />',
        "                </div>",
        "            </div>",
    ]
    for args in SECTIONS:
        parts.append(section(*args))
    parts.append("        </main>")
    parts.append("    </div>")
    print("\n".join(parts))


if __name__ == "__main__":
    main()
