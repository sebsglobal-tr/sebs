#!/usr/bin/env python3
"""Modül sonlarına 10 soruluk değerlendirme testi ekler (eval-quiz-section formatı)."""
from __future__ import annotations

import hashlib
import random
import re
import html
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

# section_id -> (modül başlığı, konu listesi — 10+ madde)
QUIZ_TOPICS: dict[str, dict[str, tuple[str, list[str]]]] = {
    "isletim-sistemi-guvenligi.html": {
        "modul-1-isletim-sistemlerine-giris": (
            "İşletim Sistemlerine Giriş",
            [
                "İşletim sisteminin donanım ile uygulamalar arasında aracılık etmesi",
                "Çekirdek (kernel) ile kullanıcı alanı ayrımının güvenlik önemi",
                "Süreç ve servis kavramlarının saldırı yüzeyine etkisi",
                "Zafiyet, tehdit, risk ve exploit ayrımı",
                "CIA üçlüsünün işletim sistemi düzeyindeki karşılığı",
                "En az ayrıcalık ilkesinin günlük kullanımdaki yeri",
                "Savunma katmanları yaklaşımının tek kontrole bel bağlamaması",
                "Güncel olmayan sistemlerin bilinen açıklarla hedeflenmesi",
                "Secure Boot ve fiziksel güvenliğin yazılım güvenliğini tamamlaması",
                "Saldırı yüzeyini gereksiz bileşenleri kapatarak küçültme",
            ],
        ),
        "modul-2-kullanici-hesap-yetki": (
            "Kullanıcı, Hesap ve Yetki Güvenliği",
            [
                "Kimlik doğrulama ile yetkilendirme farkı",
                "Parola politikası ve MFA’nın birlikte kullanımı",
                "Yönetici hesabının günlük işlerde kullanılmaması",
                "RBAC ve en az ayrıcalık ilişkisi",
                "Varsayılan ve paylaşımlı hesapların riski",
                "Hesap kilitleme ve başarısız oturum açma izleme",
                "Ayrıcalık yükseltme saldırılarının hedefi",
                "Yerel vs domain hesap ayrımı",
                "Oturum yönetimi ve zaman aşımı",
                "Hesap yaşam döngüsü (oluşturma, devre dışı, silme)",
            ],
        ),
        "modul-3-dosya-sistemi-izinler": (
            "Dosya Sistemi ve İzinler",
            [
                "NTFS/Linux izin modellerinin temel farkı",
                "Okuma, yazma, çalıştırma izinlerinin anlamı",
                "SUID/SGID bitlerinin riski",
                "Paylaşılan klasör izinlerinin yanlış yapılandırılması",
                "Dosya bütünlüğü izleme (FIM) mantığı",
                "Şifreleme (BitLocker/LUKS) ile erişim kontrolü farkı",
                "Yedekleme izinlerinin ayrı değerlendirilmesi",
                "Gizli ve sistem dosyalarının korunması",
                "İzin devralma (inheritance) hataları",
                "Least privilege dosya erişiminde",
            ],
        ),
        "modul-4-guncelleme-yama-yonetimi": (
            "Güncelleme ve Yama Yönetimi",
            [
                "Yama yönetiminin bilinen açıkları kapatması",
                "Test ortamında yama doğrulama",
                "Kritik yamaların zaman penceresi",
                "Üçüncü taraf uygulama güncellemeleri",
                "Firmware/UEFI güncellemelerinin önemi",
                "Yama geri alma (rollback) planı",
                "Eski işletim sistemi sürümlerinin destek riski",
                "WSUS/patch orchestration kavramı",
                "Exploit window ve yama gecikmesi",
                "Envanter ve uyumluluk raporlama",
            ],
        ),
        "modul-5-zararli-yazilim-korumasi": (
            "Zararlı Yazılım Koruması",
            [
                "Antivirüs/EDR’in davranış ve imza katmanları",
                "Sahte süreç adı taklidi",
                "Kalıcılık mekanizmaları (servis, kayıt, görev)",
                "Kullanıcı farkındalığı ve teknik kontrol dengesi",
                "Uygulama allow-listing fikri",
                "Makro ve script tabanlı kötü amaçlı yazılım",
                "İzolasyon ve karantina süreçleri",
                "IOC paylaşımı sonrası tarama",
                "Supply chain ile gelen zararlı yazılım",
                "False positive yönetimi",
            ],
        ),
        "modul-6-ag-servis-uzak-erisim": (
            "Ağ, Servis ve Uzak Erişim",
            [
                "Gereksiz açık portların riski",
                "RDP/SSH sertleştirme temelleri",
                "Varsayılan servislerin kapatılması",
                "Host firewall rolü",
                "Uzak erişimde MFA zorunluluğu",
                "VPN ile doğrudan port açma farkı",
                "Servis hesabı ayrıcalıkları",
                "Banner ve sürüm sızıntısı",
                "Segmentasyon ile yatay hareket sınırı",
                "Jump host / bastion kavramı",
            ],
        ),
        "modul-7-loglama-izleme-olay": (
            "Loglama, İzleme ve Olay",
            [
                "Merkezi log toplamanın değeri",
                "Olay günlüğü (Windows) / syslog (Linux)",
                "Zaman senkronizasyonu (NTP) önemi",
                "Log bütünlüğü ve değiştirilemez saklama",
                "Korelasyon ve uyarı üretimi",
                "Olay müdahale ilk adımları",
                "Kim, ne zaman, nereden sorusu",
                "Log saklama süresi ve uyum",
                "Şüpheli oturum açma izleme",
                "DFIR için kanıt koruma",
            ],
        ),
        "modul-8-os-hardening": (
            "İşletim Sistemi Sertleştirme",
            [
                "CIS benchmark mantığı",
                "Gereksiz rol/feature kaldırma",
                "Güvenli yapılandırma şablonu (GPO/ansible)",
                "Audit policy etkinleştirme",
                "AppLocker/SELinux fikri",
                "Şifreleme ve TPM entegrasyonu",
                "Local admin sınırlandırma",
                "Otomatik oynatma/USB politikaları",
                "Hardening sonrası işlevsellik testi",
                "Sürekli uyumluluk denetimi",
            ],
        ),
    },
    "soc.html": {
        "modul-1-soc-rolu": (
            "SOC Rolü ve Operasyon",
            [
                "SOC’un proaktif ve reaktif görev dengesi",
                "Alarm triyaj ve önceliklendirme",
                "MTTD/MTTR kavramlarının anlamı",
                "Playbook kullanımı",
                "Tehdit istihbaratı ile zenginleştirme",
                "False positive yönetimi",
                "Vardiya devir teslimi (handover)",
                "Müşteri/iş birimi ile iletişim",
                "Kanıt toplama disiplini",
                "Sürekli iyileştirme döngüsü",
            ],
        ),
        "modul-2-telemetri-log": (
            "Telemetri ve Log",
            [
                "Agent vs agentless toplama",
                "Log kaynağı çeşitliliği",
                "Normalizasyon ve zaman damgası",
                "PII içeren loglarda dikkat",
                "Retention ve maliyet dengesi",
                "Windows Event ID okuryazarlığı",
                "Sysmon’un ek görünürlüğü",
                "Cloud audit logları",
                "Log kaybı tespiti",
                "Korelasyon için zengin alanlar",
            ],
        ),
        "modul-3-siem-detection": (
            "SIEM ve Detection",
            [
                "Kural tabanlı tespit mantığı",
                "Use case önceliklendirme",
                "Threshold vs anomaly",
                "Detection engineering yaşam döngüsü",
                "Sigma/YARA benzeri paylaşım",
                "Tuning ve bastırma (suppression)",
                "MITRE ATT&CK eşlemesi",
                "Alert fatigue etkisi",
                "Purple team geri beslemesi",
                "Detection coverage ölçümü",
            ],
        ),
        "modul-4-edr-network": (
            "EDR ve Ağ Telemetrisi",
            [
                "EDR’in host görünürlüğü",
                "Process tree analizi",
                "Network connection enrichment",
                "C2 beaconing ipuçları",
                "Memory/script blocking",
                "EDR + SIEM birlikte kullanımı",
                "Agent sağlık izleme",
                "Tam disk tarama vs on-access",
                "Ransomware davranış sinyalleri",
                "Response action (izole et)",
            ],
        ),
        "modul-5-mitre-hunting": (
            "MITRE ve Threat Hunting",
            [
                "Taktik-teknik-prosedür hiyerarşisi",
                "Hipotez odaklı av",
                "Data stack yeterliliği",
                "Living-off-the-land göstergeleri",
                "Hunt finding → detection dönüşümü",
                "Baseline davranış bilgisi",
                "LOLBins örnekleri",
                "Time-based korelasyon",
                "Threat intel IOC avı",
                "Hunt raporlama standardı",
            ],
        ),
        "modul-6-vaka-handoff": (
            "Vaka Yönetimi ve Handoff",
            [
                "Ticket yaşam döngüsü",
                "Severity atama kriterleri",
                "IR ekibine eskalasyon",
                "Kanıt zinciri koruma",
                "İletişim şablonları",
                "SLA ihlali yönetimi",
                "Lessons learned",
                "Post-incident review",
                "Stakeholder güncellemesi",
                "Handoff checklist",
            ],
        ),
        "modul-7-cloud-soc": (
            "Cloud SOC",
            [
                "Shared responsibility model",
                "CloudTrail/Azure/GCP audit",
                "IAM anomali tespiti",
                "Container/K8s audit logları",
                "CASB/SSE kavramı",
                "Multi-cloud korelasyon",
                "Geo-impossible travel",
                "API key sızıntısı",
                "Serverless log kaynakları",
                "Cloud IR farkları",
            ],
        ),
        "modul-8-metrik-yonetisim": (
            "Metrik ve Yönetişim",
            [
                "MTTD hesaplama tuzakları",
                "MTTR alt metrikleri",
                "False positive oranı yorumu",
                "Executive dashboard",
                "SOC olgunluk modeli",
                "RACI matrisi",
                "KVKK/GDPR log etkisi",
                "AI destekli SOC sınırları",
                "Detection backlog yönetimi",
                "Roadmap ve gap analysis",
            ],
        ),
    },
    "ileri-kriptografi.html": {
        **{
            f"ik-m{i}": (
                f"İleri Kriptografi Modül {i}",
                [
                    "Formal güvenlik modeli ve ispat düşüncesi",
                    "AEAD kullanımında nonce tekrarı riski",
                    "Anahtar yaşam döngüsü ve HSM",
                    "Post-kuantum geçiş planlaması",
                    "Yan kanal saldırılarına karşı sabit zaman",
                    "Protokol vs primitive ayrımı",
                    "Forward secrecy gereksinimi",
                    "ZKP’nin gizlilik katkısı",
                    "Kütüphane seçiminde güvenli varsayılanlar",
                    "Kriptanaliz ve tasarım gerilimi",
                ],
            )
            for i in range(1, 11)
        }
    },
    "temel-network-egitimi.html": {
        "ders-0-4": ("Etik ve Yasal Çerçeve", ["RoE", "Yetkili test", "Kanıt bütünlüğü", "Veri minimizasyonu", "Raporlama", "Üçüncü taraf onayı", "Kapsam dışı sistem", "Kill-switch", "NDA", "Yasal sınır"]),
        "ders-1-2": ("Network Mantığı", ["OSI/TCP-IP fikri", "LAN/WAN", "Paket vs frame", "Bandwidth/latency", "Protokol katmanı", "Switch/router farkı", "Broadcast domain", "Collision domain", "Encapsulation", "Troubleshooting katmanı"]),
        "ders-2-2": ("Topoloji", ["Yıldız topoloji", "Bus riski", "Mesh maliyeti", "Fiziksel vs mantıksal", "Throughput", "Half/full duplex", "CSMA/CD tarihsel", "Point-to-point", "Redundancy", "Single point of failure"]),
        "ders-3-3": ("SOHO Güvenliği", ["Varsayılan parola", "Firmware güncelleme", "Misafir ağı", "WPS riski", "Port yönlendirme", "UPnP riski", "DNS hijack ev SOHO", "IoT segmentasyonu", "Modem yönetim arayüzü", "Yedekleme"]),
        "ders-4-5": ("Fiziksel Katman", ["RJ45 pinout", "PoE güç bütçesi", "Fiber SM/MM", "Kablolama standardı", "Crosstalk", "Terminasyon", "Fluke test", "MDI/MDI-X", "Kablo etiketleme", "Fiziksel güvenlik"]),
        "ders-5-4": ("Kablosuz", ["WPA3", "SSID gizleme yanılgısı", "Kanal planlama", "Rogue AP", "Deauth farkındalık", "Bluetooth PAN", "Wi-Fi şifreleme", "Enterprise 802.1X", "Signal strength", "Wireless IDS fikri"]),
        "ders-6-6": ("OSI & TCP/IP", ["7 katman", "TCP three-way", "UDP use case", "Port kavramı", "ICMP rolü", "ARP konumu", "TTL", "MTU", "VLAN tag", "Wireshark okuma"]),
        "ders-7-2": ("MAC ve ARP", ["MAC adresi", "ARP spoofing", "Gratuitous ARP", "CAM table", "Switch learning", "ARP cache", "Mitigation DAI", "L2 segment", "Broadcast ARP", "Static ARP risk"]),
        "ders-8-4": ("IP ve Subnet", ["CIDR", "Subnet mask", "Default gateway", "Private RFC1918", "NAT fikri", "VLSM", "Loopback", "ICMP ping", "Traceroute", "IP conflict"]),
        "ders-9-4": ("TCP/UDP", ["Port 443", "Stateful firewall", "SYN flood farkındalık", "Ephemeral port", "Connection tracking", "UDP DNS", "TCP reliability", "Window size", "RST paketi", "netstat/ss"]),
        "ders-10-4": ("DNS DHCP NAT", ["DNS recursive", "DHCP scope", "NAT overload", "DNS poisoning farkındalık", "TTL DNS", "Reserved IP", "Split DNS", "NAT hairpin", "PXE/DHCP", "Dual stack"]),
    },
    "temel-kriptografi.html": {
        "kr-m1-l09": ("Kriptografiye Giriş", ["CIA hedefleri", "Encoding vs şifreleme", "Anahtar gizliliği", "Kerckhoffs", "Hash vs şifreleme", "TLS rolü", "Dijital imza", "Parola hashing", "AEAD", "JWT gizlilik yanılgısı"]),
        "kr-m2-l09": ("Matematiksel Temeller", ["Hex/binary", "XOR", "Modular arithmetic", "Entropy", "CSPRNG", "Key space", "Brute force", "Encoding Base64", "SHA-256", "Asymmetric fikri"]),
        "kr-m3-l09": ("Klasik Şifreler", ["Substitution", "Transposition", "Frequency analysis", "One-time pad", "Kerckhoffs klasik", "Caesar zayıflık", "Vigenère", "Kriptanaliz", "Historical vs modern", "Key length"]),
        "kr-m4-l09": ("Simetrik Şifreleme", ["AES blok", "ECB tehlikesi", "CBC IV", "GCM AEAD", "Key length", "Mode selection", "Padding oracle farkındalık", "Stream vs block", "3DES deprecated", "ChaCha20-Poly1305"]),
        "kr-m5-l09": ("Hash ve MAC", ["SHA-256", "HMAC", "Salt", "PBKDF2/Argon2", "Collision", "Integrity", "Password storage", "MAC vs signature", "Length extension", "Keyed hash"]),
        "kr-m6-l09": ("Asimetrik", ["RSA fikri", "ECC avantaj", "Public/private", "Key exchange", "Digital signature", "Certificate", "PKI", "Forward secrecy", "Padding OAEP", "Key size"]),
        "kr-m7-l09": ("PKI ve TLS", ["X.509", "CA chain", "TLS handshake", "Certificate pinning", "Revocation CRL/OCSP", "HTTPS", "Self-signed risk", "mTLS", "Cipher suite", "HSTS"]),
        "kr-m8-l05": ("Güvenli Kullanım", ["ECB yasak", "Hardcoded key", "Nonce reuse", "Deprecated API", "libsodium", "Key rotation", "HSM", "Roll your own", "Constant time", "Threat model"]),
    },
}

# network-guvenligi eksik modüller
NETWORK_EXTRA = {
    "modul-0-etik-ve-yasal-cerceve": ("Etik ve Yasal", ["Yetki", "Kapsam", "RoE", "NDA", "Kanıt", "Sızma testi sınırı", "Üçüncü taraf", "Raporlama", "Kill-switch", "Veri koruma"]),
    "modul-5-guvenli-protokoller-tls-vpn-8021": ("TLS ve VPN", ["TLS 1.3", "Certificate", "VPN IPsec/SSL", "802.1X", "Perfect forward secrecy", "Cipher", "MITM", "HSTS", "mTLS", "Weak protocol"]),
    "modul-8-izleme-loglama-trafik-analizi-ve": ("İzleme ve Log", ["NetFlow", "SPAN/TAP", "SIEM", "PCAP", "Retention", "Encrypted visibility", "Baseline", "Anomaly", "Wireshark", "Log source"]),
}
QUIZ_TOPICS.setdefault("network-guvenligi.html", {}).update(NETWORK_EXTRA)


def balanced_correct_letters(seed: str, count: int = 10) -> list[str]:
    """Her harften ~2–3 doğru cevap; modül başına deterministik karışık dağılım."""
    rng = random.Random(hashlib.sha256(seed.encode("utf-8")).hexdigest())
    bag = list("ABCD") * 2 + ["A", "B"]
    rng.shuffle(bag)
    return bag[:count]


def build_questions(module_title: str, topics: list[str], seed: str = "") -> list[dict]:
    qs = []
    topic_list = topics[:10]
    answer_key = balanced_correct_letters(seed or module_title, len(topic_list))
    opt_seed = hashlib.sha256(f"{seed or module_title}:opts".encode()).hexdigest()
    opt_rng = random.Random(opt_seed)

    distractor_templates = [
        "Bu ifade modül kapsamının dışındadır veya güvenlik açısından yanıltıcıdır.",
        "Kavramlar karıştırılmıştır; güvenlik hedefi yanlış eşleştirilmiştir.",
        "Uygulama adımı atlanmıştır; yalnızca teorik isim bilgisi yeterli değildir.",
    ]

    for i, topic in enumerate(topic_list):
        correct_letter = answer_key[i]
        correct_text = f"{topic} — modül kazanımlarıyla doğrudan uyumludur."

        wrong_pool = [distractor_templates[(i + j) % 3] for j in range(3)]
        opt_rng.shuffle(wrong_pool)

        opts_by_letter: dict[str, str] = {}
        wrong_i = 0
        for letter in "ABCD":
            if letter == correct_letter:
                opts_by_letter[letter] = correct_text
            else:
                opts_by_letter[letter] = f"{wrong_pool[wrong_i]} ({module_title})"
                wrong_i += 1

        qs.append(
            {
                "q": f"[{module_title}] Aşağıdakilerden hangisi «{topic}» konusunu en doğru yansıtır?",
                "opts": [opts_by_letter[letter] for letter in "ABCD"],
                "correct": correct_letter,
                "rationale": f"Doğru cevap, «{topic}» ifadesinin bu modüldeki tanım ve kullanım bağlamına uygundur.",
            }
        )
    return qs


def render_quiz_html(quiz_id: str, module_title: str, questions: list[dict]) -> str:
    lines = [
        "",
        f'<h2><i class="fas fa-clipboard-list"></i> Kendini Değerlendir — {html.escape(module_title)}</h2>',
        f'<div class="eval-quiz-section" id="{html.escape(quiz_id)}" data-section="{html.escape(quiz_id)}">',
        "<p>Aşağıdaki 10 soru modül kazanımlarını ölçer. Her soru için en iyi cevabı seçin ve <strong>Testi Gönder</strong> düğmesine basın.</p>",
    ]
    for n, q in enumerate(questions, 1):
        lines.append(f"<ol><li>{n}) {html.escape(q['q'])}</li></ol>")
        for j, letter in enumerate("ABCD"):
            lines.append(f"<p>{letter}) {html.escape(q['opts'][j])}</p>")
        lines.append(
            f"<ul><li>Doğru: {q['correct']}</li>"
            f"<li>Gerekçe: {html.escape(q['rationale'])}</li></ul>"
        )
    lines.append("</div>")
    return "\n".join(lines)


def section_has_quiz(section_html: str) -> bool:
    if "eval-quiz-section" not in section_html:
        return False
    return len(re.findall(r"Doğru\s*:\s*[A-D]", section_html, re.I)) >= 8


def find_section(html_text: str, section_id: str) -> tuple[int, int] | None:
    pat = rf'<section\b[^>]*\bid=["\']{re.escape(section_id)}["\'][^>]*>'
    m = re.search(pat, html_text, re.I)
    if not m:
        return None
    start = m.start()
    rest = html_text[m.end() :]
    m2 = re.search(r"<section\b", rest, re.I)
    end = m.end() + (m2.start() if m2 else len(rest))
    return start, end


INJECTED_QUIZ_BLOCK_RE = re.compile(
    r"\n?<h2><i class=\"fas fa-clipboard-list\"></i> Kendini Değerlendir —[^<]*</h2>\s*"
    r'<div class="eval-quiz-section" id="[^"]+-modul-testi"[^>]*>.*?</div>',
    re.DOTALL | re.IGNORECASE,
)


def remove_injected_quiz(section_html: str) -> str:
    return INJECTED_QUIZ_BLOCK_RE.sub("", section_html, count=1)


def insert_marker_index(section_html: str) -> int:
    markers = [
        r'<h2[^>]*>\s*<i[^>]*fa-clipboard-list[^>]*>\s*</i>\s*Kendini Değerlendir',
        r'<h2[^>]*>\s*<i[^>]*fa-book[^>]*>\s*</i>\s*Terimler',
        r"Bu Modülde Kazanılan",
        r"Bu Modülde Neler Öğrendik",
        r'<h2[^>]*>\s*<i[^>]*fa-flag-checkered',
        r'<div class="lesson-controls"',
    ]
    for pat in markers:
        m = re.search(pat, section_html, re.I)
        if m:
            return m.start()
    return len(section_html)


def process_file(
    filename: str,
    mapping: dict[str, tuple[str, list[str]]],
    *,
    force: bool = False,
) -> int:
    path = MODULES / filename
    if not path.exists():
        return 0
    text = path.read_text(encoding="utf-8")
    added = 0
    for section_id, (title, topics) in mapping.items():
        span = find_section(text, section_id)
        if not span:
            continue
        s, e = span
        block = text[s:e]
        if force:
            prev_len = len(block)
            block = remove_injected_quiz(block)
            if len(block) == prev_len and section_has_quiz(block):
                continue
        elif section_has_quiz(block):
            continue
        seed = f"{filename}:{section_id}"
        questions = build_questions(title, topics, seed=seed)
        quiz_id = f"{section_id}-modul-testi"
        snippet = render_quiz_html(quiz_id, title, questions)
        idx = insert_marker_index(block)
        new_block = block[:idx] + snippet + block[idx:]
        text = text[:s] + new_block + text[e:]
        added += 1
        action = "↻" if force else "+"
        letters = "".join(q["correct"] for q in questions)
        print(f"  {action} {filename} :: {section_id} (10 soru, doğru: {letters})")
    if added:
        path.write_text(text, encoding="utf-8")
    return added


def main() -> None:
    force = "--force" in sys.argv or "--reshuffle" in sys.argv
    if force:
        print("Mevcut -modul-testi blokları yeniden üretiliyor (karışık doğru şık dağılımı)…\n")
    total = 0
    for filename, mapping in QUIZ_TOPICS.items():
        print(filename)
        total += process_file(filename, mapping, force=force)
    print(f"\nToplam {total} modül testi {'güncellendi' if force else 'eklendi'}.")


if __name__ == "__main__":
    main()
