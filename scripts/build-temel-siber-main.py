#!/usr/bin/env python3
"""Replace <main> in temel-siber-guvenlik.html with educator-grade content."""
from pathlib import Path
import re

from temel_siber_full_content import (
    INTRO_BODY,
    L1_BODY,
    L_CIA_BODY,
    L2_BODY,
    L3_BODY,
    L4_BODY,
    L5_BODY,
    L6_BODY,
    OZET_BODY,
)

HERO = """            <div id="lesson-route-hero" class="lesson-route-hero" aria-live="polite" hidden>
                <p class="lesson-route-hero-module"></p>
                <p class="lesson-route-hero-lesson"></p>
                <div class="lesson-route-hero-img-wrap">
                    <img class="lesson-route-hero-img" src="" alt="" loading="lazy" decoding="async" />
                </div>
            </div>

"""


def hdr(icon, title, sub, intro):
    return f"""<div class="section-header">
                    <h2><i class="fas {icon}"></i> {title}</h2>
                    <p>{sub}</p>
                    <p class="section-intro">{intro}</p>
                </div>"""


def sec(sid, active, header, body):
    act = " active" if active else ""
    return f"""<section class="content-section{act}" id="{sid}">
                {header}
                <div class="content-card"><div class="content-body"><div class="lesson-content">
{body}
                </div></div></div>
            </section>"""


SECTIONS = [
    (
        "intro",
        True,
        hdr(
            "fa-info-circle",
            "Giriş ve modül haritası",
            "SEBS Global’de siber güvenliğe ilk adımınız",
            "Kısa listeler değil: bağlam, örnek, savunma ve özet içeren, kıdemli eğitim standardında uzun anlatımlı başlangıç modülü. CIA üçlüsünde gizlilik, bütünlük ve erişilebilirlik eşit derinlikte işlenir.",
        ),
        INTRO_BODY,
    ),
    (
        "lesson1",
        False,
        hdr(
            "fa-book",
            "1. Siber güvenlik temelleri",
            "Tanım, kapsam ve güvenliğin ortak dili",
            "Disiplinin tanımı, bilgi güvenliği farkı, üç savunma boyutu ve varlık–tehdit–zafiyet–risk modeli. CIA ayrı derstir.",
        ),
        L1_BODY,
    ),
    (
        "lesson1-cia",
        False,
        hdr(
            "fa-lock",
            "2. CIA üçlüsü",
            "Gizlilik, bütünlük ve erişilebilirlik — eşit derinlikte",
            "Bu ders yalnızca CIA’ya ayrılmıştır. Üç bileşen aynı önemde; kontroller, ihlaller, tablolar ve vakalar her biri için işlenir.",
        ),
        L_CIA_BODY,
    ),
    (
        "lesson2",
        False,
        hdr(
            "fa-bug",
            "3. Tehdit türleri ve aktörler",
            "Malware, vektörler ve saldırgan profilleri",
            "Malware ailesi, phishing, saldırı vektörleri, aktör sınıflandırması ve saldırı zinciri.",
        ),
        L2_BODY,
    ),
    (
        "lesson3",
        False,
        hdr(
            "fa-shield-alt",
            "4. Güvenlik prensipleri",
            "Katmanlı savunma, en az ayrıcalık, sıfır güven",
            "Prensiplerin tanımı, uygulaması ve ihlal sonuçları; mimari karar dili.",
        ),
        L3_BODY,
    ),
    (
        "lesson4",
        False,
        hdr(
            "fa-chart-line",
            "5. Risk değerlendirmesi",
            "Önceliklendirme ve yatırım dili",
            "Risk süreci, matris, tedavi seçenekleri ve iş etkisi odaklı vaka.",
        ),
        L4_BODY,
    ),
    (
        "lesson5",
        False,
        hdr(
            "fa-file-shield",
            "6. Güvenlik politikaları",
            "Tekniği işe ve mevzuata bağlama",
            "Belge hiyerarşisi, AUP, KVKK/ISO ve tedarikçi güvenliği.",
        ),
        L5_BODY,
    ),
    (
        "lesson6",
        False,
        hdr(
            "fa-ambulance",
            "7. Olay müdahalesi",
            "Hazırlıktan ders çıkarmaya",
            "IR aşamaları, ekip, araçlar, iletişim ve tatbikat.",
        ),
        L6_BODY,
    ),
    (
        "modul-ozet",
        False,
        hdr(
            "fa-check-double",
            "Modül özeti",
            "Tüm modülün sentezi",
            "Yedi dersi tamamladıysanız aşağıdaki hikâyeyi kendi cümlelerinizle anlatabilmelisiniz.",
        ),
        OZET_BODY,
    ),
]

CIA_CSS = """
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
"""

VERSION = "20260527"


def main():
    path = Path(__file__).resolve().parents[1] / "frontend/modules/temel-siber-guvenlik.html"
    text = path.read_text(encoding="utf-8")
    i = text.find('<main class="module-content">')
    j = text.find("</main>") + len("</main>")
    if i < 0:
        raise SystemExit("main not found")

    body = "\n\n".join(sec(sid, act, h, b) for sid, act, h, b in SECTIONS)
    main = f"        <main class=\"module-content\">\n{HERO}{body}\n        </main>"
    new_text = text[:i] + main + text[j:]
    new_text = re.sub(
        r"</main>\s*</div>\s*\n\s*<script>",
        "</main>\n\n    <script>",
        new_text,
        count=1,
    )

    replacements = [
        (
            "Başlangıç seviyesi — uzun anlatımlı, örnek odaklı temel eğitim modülü.",
            "Kıdemli eğitim standardı — uzun anlatım, eşit CIA derinliği, vaka ve tablolar.",
        ),
        (
            "Eksiksiz başlangıç modülü — kavramlar, CIA (eşit derinlik), tehdit, savunma, risk, politika ve olay müdahalesi.",
            "Kıdemli eğitim standardı — uzun anlatım, eşit CIA derinliği, vaka ve tablolar.",
        ),
        ("sebs-premium-module-lessons.js?v=20260522", f"sebs-premium-module-lessons.js?v={VERSION}"),
        ("sebs-premium-module-lessons.js?v=20260523", f"sebs-premium-module-lessons.js?v={VERSION}"),
        ("sebs-premium-module-lessons.js?v=20260521b", f"sebs-premium-module-lessons.js?v={VERSION}"),
        ("sebs-module-lesson-route.css?v=20260522", f"sebs-module-lesson-route.css?v={VERSION}"),
        ("sebs-module-lesson-route.css?v=20260523", f"sebs-module-lesson-route.css?v={VERSION}"),
        ("2026-05-24", "2026-05-26"),
        ("2026-05-23", "2026-05-26"),
        ("20260522", VERSION),
        ("20260523", VERSION),
    ]
    for old, new in replacements:
        new_text = new_text.replace(old, new)

    if ".cia-triad-visual" not in new_text:
        new_text = new_text.replace(
            '[data-theme="dark"] .edu-lesson-recap {',
            CIA_CSS + '\n        [data-theme="dark"] .edu-lesson-recap {',
            1,
        )

    path.write_text(new_text, encoding="utf-8")
    print("OK", path, "chars", len(new_text))


if __name__ == "__main__":
    main()
