"""Konu metnine göre anlama odaklı çoktan seçmeli soru üretimi."""
from __future__ import annotations

import hashlib
import random
import re
from typing import Callable

Question = dict


def _q(
    question: str,
    opts: list[str],
    correct: str,
    rationale: str,
) -> Question:
    return {"q": question, "opts": opts, "correct": correct, "rationale": rationale}


def _pick_variant(seed: str, n: int) -> int:
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    return h % max(n, 1)


def shuffle_question_options(q: Question, seed: str) -> Question:
    rng = random.Random(seed)
    order = [0, 1, 2, 3]
    rng.shuffle(order)
    old_opts = q["opts"]
    new_opts = [old_opts[i] for i in order]
    correct_idx = ord(q["correct"].upper()) - ord("A")
    new_correct = chr(ord("A") + order.index(correct_idx))
    return {**q, "opts": new_opts, "correct": new_correct}


# (topic içinde aranacak alt dizgi, soru üretici)
_HANDLERS: list[tuple[str, Callable[[str, str, int], Question]]] = []


def _register(*keywords: str):
    def deco(fn: Callable[[str, str, int], Question]):
        for kw in keywords:
            _HANDLERS.append((kw.lower(), fn))
        return fn

    return deco


@_register("cia", "gizlilik", "bütünlük", "erişilebilirlik")
def _cia(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "Bir e-ticaret sitesi saldırı altında; kullanıcılar ödeme yapamıyor ancak veriler sızdırılmamış görünüyor. En doğrudan etkilenen CIA bileşeni hangisidir?",
            [
                "Gizlilik",
                "Bütünlük",
                "Erişilebilirlik",
                "İnkâr edememe",
            ],
            "C",
            "Hizmetin kullanılamaması erişilebilirlik kaybıdır; gizlilik ayrı bir hedeftir.",
        ),
        _q(
            "İndirilen yazılım paketinin hash değeri resmi sitedekiyle uyuşmuyor. Bu bulgu öncelikle hangi güvenlik hedefini ihlal eder?",
            [
                "Gizlilik",
                "Bütünlük",
                "Erişilebilirlik",
                "Anonimlik",
            ],
            "B",
            "İçeriğin yetkisiz değiştirilmesi bütünlük sorunudur.",
        ),
    ]
    return bank[v % len(bank)]


@_register("kimlik doğrulama", "yetkilendirme", "authentication", "authorization", "mfa", "parola")
def _auth(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "Kullanıcı parolasını girdikten sonra «Yönetici paneline erişim reddedildi» mesajı alıyor. Parola doğru. Hangi aşama başarısız olmuş olabilir?",
            [
                "Kimlik bildirimi (identification)",
                "Kimlik doğrulama",
                "Yetkilendirme",
                "Şifreleme",
            ],
            "C",
            "Kimlik doğrulandıktan sonra erişim hakkı yetkilendirme ile belirlenir.",
        ),
        _q(
            "Kurumsal politikada parola + mobil uygulama onayı zorunlu. Bu birleşim en çok neyi güçlendirir?",
            [
                "Yalnızca gizlilik",
                "Kimlik doğrulama (MFA ile)",
                "Yalnızca log saklama süresi",
                "Subnet maskesi doğruluğu",
            ],
            "B",
            "MFA, kimlik doğrulamayı çok faktörlü hale getirir.",
        ),
    ]
    return bank[v % len(bank)]


@_register("yama", "patch", "güncelleme", "firmware", "exploit window")
def _patch(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Kritik bir CVE yayınlandı; exploit kodu kamuya düştü. Yama test ortamında doğrulandı. Üretimde gecikmenin ana riski nedir?",
        [
            "Log formatı bozulur",
            "Bilinen açık penceresinde sistem exploit edilebilir",
            "DNS TTL artar",
            "MAC adresi değişir",
        ],
        "B",
        "Yama gecikmesi, exploit window süresini uzatır.",
    )


@_register("edr", "antivirüs", "zararlı", "malware", "kalıcılık", "false positive")
def _malware(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "EDR bir süreçte «powershell.exe -enc ...» davranışı işaretledi; dosya imzası temiz. Analist ilk adımda ne yapmalı?",
        [
            "Tüm ağı kapatmak",
            "Davranış bağlamını, ebeveyn süreci ve komut satırını inceleyip triyaj",
            "Uyarıyı sessizce silmek",
            "Yalnızca dosya adına bakmak",
        ],
        "B",
        "Davranışsal tespit doğrulama ve bağlam gerektirir.",
    )


@_register("rdp", "ssh", "firewall", "port", "bastion", "jump host", "segmentasyon")
def _network_access(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Sunucuya doğrudan RDP (3389) internete açık; yönetim için önerilen iyileştirme hangisidir?",
        [
            "Parolayı kısaltmak",
            "VPN/bastion + MFA ile erişim; doğrudan internet RDP’sini kapatmak",
            "Antivirüsü kaldırmak",
            "HTTP’ye geçmek",
        ],
        "B",
        "Uzak yönetimde sıkılaştırma ve dolaylı erişim standarttır.",
    )


@_register("log", "siem", "syslog", "event id", "korelasyon", "mttd", "mttr", "triage", "playbook")
def _soc(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "SIEM’de gece 03:00’te 4000 benzer «failed logon» alarmı geldi. İlk triyaj adımı?",
            [
                "Tüm kullanıcıları silmek",
                "Kaynak IP, hedef hesap, zaman penceresi ve playbook ile önceliklendirme",
                "SIEM’i kapatmak",
                "Alarmı kalıcı bastırmak",
            ],
            "B",
            "Alarm selinde bağlam ve playbook triyajı kritiktir.",
        ),
        _q(
            "MTTD uzun, MTTR kısa. Bu neyi gösterir?",
            [
                "Olaylar geç fark ediliyor; müdahale hızlı",
                "Hiç olay yok",
                "Log toplanmıyor",
                "Sadece false positive var",
            ],
            "A",
            "Tespit–müdahale metrikleri farklı aşamaları ölçer.",
        ),
    ]
    return bank[v % len(bank)]


@_register("mitre", "att&ck", "hunting", "lolbin", "ioc", "beacon")
def _hunt(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Av hipotezi: «PowerShell ile uzak indirme». Hangi ATT&CK taktik/teknik ailesine en yakındır?",
        [
            "Initial Access — Phishing yalnızca",
            "Execution ve Command and Control davranışları",
            "Physical destruction",
            "Backup encryption only",
        ],
        "B",
        "Script çalıştırma ve uzak iletişim birden fazla taktikle ilişkilidir.",
    )


@_register("osi", "tcp/ip", "tcp three", "udp", "encapsulation", "katman")
def _osi(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Bir uygulama «connection refused» alıyor; ping hedefe gidiyor. Sorun büyük olasılıkla hangi katmanda?",
        [
            "Fiziksel — kablo kopuk",
            "Uygulama/transport — port kapalı veya servis dinlemiyor",
            "Sadece presentation — JPEG",
            "Yalnızca session — token",
        ],
        "B",
        "Ping çalışıp port reddediliyorsa üst katman/servis odaklıdır.",
    )


@_register("subnet", "cidr", "gateway", "rfc1918", "nat", "vlsm")
def _ip(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "192.168.10.50/24 adresli bir PC internete çıkamıyor; aynı VLAN’daki komşular çıkabiliyor. İlk kontrol?",
        [
            "Varsayılan ağ geçidi ve yerel IP yapılandırması",
            "Monitör çözünürlüğü",
            "CPU fan hızı",
            "TLS sertifika süresi",
        ],
        "A",
        "Yerel IP/gateway hatası klasik izolasyonlu sorundur.",
    )


@_register("arp", "mac adres", "dai", "cam table", "spoofing")
def _arp(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Aynı subnet’te saldırgan sahte ARP yanıtları gönderiyor. Hangi saldırı türü ve etki en olasıdır?",
        [
            "ARP spoofing — trafiğin yanlış MAC’e yönlendirilmesi (MITM riski)",
            "SQL injection",
            "Rainbow table",
            "ECB tekrar deseni",
        ],
        "A",
        "ARP spoofing L2’de MITM’e zemin hazırlar.",
    )


@_register("dns", "dhcp", "ttl", "poisoning", "recursive")
def _dns(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Kullanıcılar banka sitesine giderken tarayıcı başka bir IP’ye gidiyor; DNS yanıtları şüpheli. Olası sorun?",
        [
            "DNS cache poisoning / rogue resolver",
            "MTU 1500",
            "WPA3 kanal genişliği",
            "Argon2 parametresi",
        ],
        "A",
        "Yanlış DNS çözümlemesi trafiği yanlış hedefe yönlendirir.",
    )


@_register("wpa", "802.1x", "rogue ap", "wifi", "kablosuz", "deauth")
def _wifi(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Ofiste «Free_WiFi» adında güçlü sinyalli ağ görünüyor; SSID kurumsal SSID ile benzer. Risk?",
        [
            "Rogue/evil twin erişim noktası — kimlik bilgisi ve trafik dinleme",
            "Daha hızlı internet",
            "Otomatik yama",
            "SHA-256 collision",
        ],
        "A",
        "Sahte AP sosyal mühendislik ve MITM için kullanılır.",
    )


@_register("tls", "https", "sertifika", "x.509", "pki", "handshake", "hsts", "mtls", "cipher")
def _tls(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "Tarayıcı «sertifika güvenilir değil» uyarısı veriyor; kullanıcılar devam etmeye alışık. Asıl risk?",
            [
                "Daha yavaş sayfa",
                "MITM veya yanlış/sahte sertifika ile kimlik doğrulama atlanması",
                "DNS TTL",
                "Subnet broadcast",
            ],
            "B",
            "Sertifika uyarısı kimlik doğrulama başarısızlığına işaret eder.",
        ),
        _q(
            "TLS 1.3 ile ephemeral anahtar değişimi kullanılmasının faydası?",
            [
                "Forward secrecy — uzun vadeli anahtar sızsa bile geçmiş oturumlar korunur",
                "Parolaları düz metin saklar",
                "ECB zorunludur",
                "Base64 gizlilik sağlar",
            ],
            "A",
            "Ephemeral DH geçmiş trafik gizliliğini güçlendirir.",
        ),
    ]
    return bank[v % len(bank)]


@_register("kerckhoffs", "anahtar gizl", "encoding", "şifreleme", "hash", "aead", "jwt")
def _crypto_intro(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "Geliştirici token’ı Base64 ile «şifreledik» diyor. En doğru değerlendirme?",
            [
                "Güçlü gizlilik sağlanmıştır",
                "Encoding gizlilik sağlamaz; gerçek şifreleme ve anahtar yönetimi gerekir",
                "Hash ile aynıdır",
                "TLS gereksizdir",
            ],
            "B",
            "Base64 tersine çevrilebilir format dönüşümüdür.",
        ),
        _q(
            "Modern kriptoda güvenlik varsayımı hangisidir?",
            [
                "Algoritma tamamen gizli kalmalı",
                "Güvenlik anahtarın gizliliğine dayanır (Kerckhoffs)",
                "Uzun parola yeterlidir; algoritma önemsiz",
                "Şifreleme bütünlük sağlar",
            ],
            "B",
            "Kerckhoffs ilkesi standart kabuldür.",
        ),
    ]
    return bank[v % len(bank)]


@_register("aes", "ecb", "gcm", "cbc", "chacha", "simetrik", "3des", "nonce", "iv ")
def _symmetric(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Aynı görüntü dosyası AES-ECB ile şifrelendi; şifreli dosyada hâlâ siluet seçilebiliyor. Neden?",
        [
            "ECB aynı plaintext bloğuna aynı ciphertext üretir; desen sızar",
            "AES zayıf algoritmadır",
            "IV fazladır",
            "Hash kullanılmıştır",
        ],
        "A",
        "ECB tekrar desenlerini gizlemez.",
    )


@_register("rsa", "ecc", "asimetrik", "imza", "forward secrecy", "oaep", "dh ")
def _asymmetric(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "E-posta ekine «imzalıdır» deniyor; imza doğrulaması başarısız. Ne sonuç çıkar?",
        [
            "İçerik kesin güvenilirdir",
            "Kaynak bütünlüğü/kimlik iddiası doğrulanamadı; ek güvenilmez kabul edilmeli",
            "Gizlilik ihlali yoktur",
            "Base64 bozuktur",
        ],
        "B",
        "Geçersiz imza bütünlük ve kaynak kanıtını zayıflatır.",
    )


@_register("hmac", "salt", "argon", "pbkdf", "parola hash", "collision", "sha-256", "mac")
def _hash(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Veritabanında parolalar bcrypt hash + unique salt ile saklanıyor. Bu yaklaşım ne sağlar?",
        [
            "Parolayı geri çözebilir şifreleme",
            "Çalıntı hash’lerde rainbow table ve toplu kırmayı zorlaştırma",
            "TLS otomatik kurulum",
            "ECB modu",
        ],
        "B",
        "Yavaş KDF ve salt parola sızıntısı etkisini sınırlar.",
    )


@_register("caesar", "vigenère", "otp", "one-time", "frekans", "klasik", "substitution")
def _classical(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Tek alfabeli İngilizce metinde Sezar şifresi kullanılmış. En pratik kırma yöntemi?",
        [
            "RSA faktörizasyonu",
            "25 kaydırma denemesi veya frekans analizi",
            "TLS downgrade",
            "Padding oracle",
        ],
        "B",
        "Küçük anahtar uzayı brute force ile kırılır.",
    )


@_register("xor", "entropy", "csprng", "brute force", "hex", "binary", "modular")
def _math(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "OTP’de aynı anahtar iki mesajda kullanıldı. Saldırgan ne elde edebilir?",
            [
                "C1 ⊕ C2 = P1 ⊕ P2 ilişkisi",
                "Anında private key",
                "X.509 zinciri",
                "DNS zone transfer",
            ],
            "A",
            "Anahtar tekrarı OTP güvenliğini yok eder.",
        ),
        _q(
            "IV/nonce üretiminde `random()` kullanıldığı tespit edildi. Risk?",
            [
                "Tahmin edilebilir değerler; şifreleme zayıflar",
                "Daha hızlı CPU",
                "Daha uzun hash",
                "Sertifika yenilenir",
            ],
            "A",
            "Kriptografik işlemlerde CSPRNG şarttır.",
        ),
    ]
    return bank[v % len(bank)]


@_register("roe", "yetkili test", "nda", "kill-switch", "kanıt", "etik", "yasal", "kapsam", "veri koruma", "raporlama", "üçüncü taraf")
def _ethics(topic: str, _mod: str, v: int) -> Question:
    t = topic.lower()
    bank: list[Question] = []
    if "kapsam" in t or "scope" in t:
        bank.append(
            _q(
                "Test sırasında kapsam dışı bir üretim sunucusuna erişim mümkün görünüyor. Ne yapılmalı?",
                [
                    "Hemen exploit edip rapora eklemek",
                    "Durmak, müşteriye bildirmek ve kapsam dışı erişimi yapmamak",
                    "Sunucuyu kapatmak",
                    "Logları silmek",
                ],
                "B",
                "Kapsam dışı sistemlere müdahale yetki ve sözleşme ihlalidir.",
            )
        )
    if "kanıt" in t or "bütünlük" in t and "veri" in t:
        bank.append(
            _q(
                "Olay sonrası disk imajı alınırken hash değeri kaydedilmedi. Bu eksiklik neyi zayıflatır?",
                [
                    "DNS çözümlemesini",
                    "Kanıt zinciri ve bütünlük ispatını",
                    "Wi-Fi kanal planını",
                    "TLS cipher suite seçimini",
                ],
                "B",
                "Adli/kanıt süreçlerinde değişmezlik kaydı (hash) kritiktir.",
            )
        )
    if "kill" in t:
        bank.append(
            _q(
                "Üretimde beklenmedik kesinti riski doğdu; kill-switch tetiklenmeli mi?",
                [
                    "Hayır, test süresiz sürmeli",
                    "RoE’de tanımlı stop/kill koşullarına göre durdurmak ve müşteriyi bilgilendirmek",
                    "Yalnızca logları kapatmak",
                    "Parolaları sıfırlamak",
                ],
                "B",
                "Kill-switch kontrollü durdurma için önceden tanımlanır.",
            )
        )
    if "nda" in t or "üçüncü" in t:
        bank.append(
            _q(
                "Alt yüklenici test ekibine müşteri verisi aktarılacak. Öncelikli kontrol?",
                [
                    "NDA ve veri işleme sözleşmesi / yetki",
                    "Daha hızlı internet",
                    "ECB modu",
                    "SSID gizleme",
                ],
                "A",
                "Üçüncü tarafla çalışmada sözleşme ve veri koruma şarttır.",
            )
        )
    bank.append(
        _q(
            "Penetrasyon testi sırasında müşteri e-postasına yetkisiz erişim mümkün görünüyor. Doğru adım?",
            [
                "Veriyi kopyalayıp analiz ekibine göndermek",
                "Kapsam/RoE’ye göre durmak, müşteriye kontrollü kanıt ve raporlama",
                "Sessizce devam edip satış ekibine anlatmak",
                "Kill-switch’i devre dışı bırakmak",
            ],
            "B",
            "Yetkisiz veri erişimi kapsam dışıdır; disiplin ve sözleşme önceliklidir.",
        )
    )
    return bank[v % len(bank)]


@_register("vpn", "ipsec", "802.1x", "netflow", "span", "tap", "pcap", "wireshark")
def _netsec(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Şifreli trafik artıyor; SOC yalnızca IP/port görüyor. Görünürlük için hangi yaklaşım uygun?",
        [
            "TLS’i tamamen kaldırmak",
            "Endpoint/ proxy logları, JA3, metadata ve yetkili SSL inspection politikası",
            "Tüm switch’leri kapatmak",
            "Parolaları kısaltmak",
        ],
        "B",
        "Şifreleme metadata ve uç nokta telemetrisi ile tamamlanır.",
    )


@_register("secure boot", "hardening", "cis", "selinux", "applocker", "bitlocker", "least privilege", "en az ayrıcalık")
def _hardening(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Sunucuda günlük iş için Domain Admin hesabı kullanılıyor. En doğru öneri?",
        [
            "Parolayı ekrana yapıştırmak",
            "Ayrıcalıklı hesabı yalnızca gerekli yönetim işlerinde kullanmak (JIT/ayrı hesap)",
            "Antivirüsü kaldırmak",
            "RDP’yi internete açmak",
        ],
        "B",
        "En az ayrıcalık ve ayrık yönetim hesabı temel ilkedir.",
    )


@_register("kernel", "süreç", "servis", "ntfs", "linux izin", "suid", "dosya sistemi")
def _os(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "Linux’ta bir binary SUID root ile çalışıyor ve shell spawn edebiliyor. Bu ne anlama gelir?",
        [
            "Dosya salt okunurdur",
            "Çalıştıran kullanıcı geçici olarak root ayrıcalığı kazanabilir — yüksek risk",
            "Otomatik yedekleme yapar",
            "DNS çözer",
        ],
        "B",
        "SUID kötüye kullanımı ayrıcalık yükseltme yoludur.",
    )


@_register("formal", "post-kuantum", "zkp", "zero-knowledge", "yan kanal", "constant time", "hsm", "roll your own")
def _advanced_crypto(topic: str, _mod: str, v: int) -> Question:
    bank = [
        _q(
            "Ekip «kendi protokolümüzü yazdık, AES kullanıyoruz» diyor. En büyük risk?",
            [
                "AES yavaştır",
                "Denenmemiş protokol tasarımı; standart TLS/libsodium tercih edilmeli",
                "Base64 gereklidir",
                "Hash yasaktır",
            ],
            "B",
            "Roll-your-own protokol tarihsel olarak hataya açıktır.",
        ),
        _q(
            "Aynı GCM anahtarıyla nonce tekrar kullanıldı. Sonuç?",
            [
                "Güvenlik ciddi şekilde kırılabilir",
                "Performans artar",
                "Sertifika otomatik yenilenir",
                "ECB güvenli olur",
            ],
            "A",
            "Nonce tekrarı AEAD için kritik hatadır.",
        ),
    ]
    return bank[v % len(bank)]


@_register("shared responsibility", "cloudtrail", "iam anomali", "container", "serverless")
def _cloud(topic: str, _mod: str, v: int) -> Question:
    return _q(
        "IaaS’te müşteri VM içi patch’leri yönetmiyor; «bulut sağlayıcı her şeyi halleder» sanılıyor. Hangi model doğru?",
        [
            "Shared responsibility — müşteri OS/uygulama katmanından sorumlu",
            "Sağlayıcı tüm sorumluluğu üstlenir",
            "Kriptografi gereksizdir",
            "Log tutmak yasaktır",
        ],
        "A",
        "Bulutta sorumluluk paylaşımlıdır.",
    )


def _match_handler(topic: str) -> Callable[[str, str, int], Question] | None:
    t = topic.lower()
    for kw, fn in _HANDLERS:
        if kw in t:
            return fn
    return None


def _fallback(topic: str, module_title: str, variant: int) -> Question:
    """Konuya özel senaryo — jenerik şablondan daha anlamlı."""
    templates = [
        (
            f"«{topic}» uygulanmadığı için bir olayda müdahale gecikti. Ekibin öncelikli düzeltmesi ne olmalıdır?",
            [
                f"{topic} için tanımlı kontrolü devreye almak ve süreci dokümante etmek",
                "Tüm logları silmek",
                "İnterneti kalıcı kapatmak",
                "Yalnızca antivirüs imzasını güncellemek",
            ],
            "A",
            f"Eksik kalan «{topic}» doğrudan hedeflenmeli; diğer seçenekler sorunu çözmez.",
        ),
        (
            f"Bir stajyer «{topic}» hakkında «ezberledim, uygulamaya gerek yok» dedi. En doğru yanıt?",
            [
                "Kavramın pratikte nasıl uygulandığını ve hangi hatayı önlediğini açıklaması gerekir",
                "Sadece sınavda sorulursa öğrenilir",
                "Yalnızca yöneticiler bilir",
                "Araç adı yeterlidir",
            ],
            "A",
            f"«{topic}» uygulama ve risk bağlamı olmadan anlamlı değildir.",
        ),
        (
            f"Denetimde «{topic}» için kanıt isteniyor. Hangi çıktı en uygundur?",
            [
                "Politika, yapılandırma veya test sonucu ile uyum kanıtı",
                "Sözlü «biliyoruz» ifadesi",
                "Ekran görüntüsü olmadan varsayım",
                "Başka modülün raporu",
            ],
            "A",
            f"«{topic}» denetlenebilir kanıt gerektirir.",
        ),
    ]
    q, opts, correct, rationale = templates[variant % len(templates)]
    return _q(q, opts, correct, rationale)


def generate_question(topic: str, module_title: str, seed: str) -> Question:
    variant = _pick_variant(f"{topic}:{seed}", 8)
    handler = _match_handler(topic)
    if handler:
        inner_v = _pick_variant(f"{topic}:{seed}:inner", 12)
        q = handler(topic, module_title, inner_v)
    else:
        q = _fallback(topic, module_title, variant)
    if not q["q"].startswith("["):
        q = {**q, "q": q["q"]}
    return q


def build_comprehension_questions(
    module_title: str,
    topics: list[str],
    seed: str = "",
) -> list[Question]:
    out: list[Question] = []
    for i, topic in enumerate(topics[:10]):
        q = generate_question(topic, module_title, f"{seed}:q{i}")
        out.append(shuffle_question_options(q, f"{seed}:shuffle:{i}"))
    return out
