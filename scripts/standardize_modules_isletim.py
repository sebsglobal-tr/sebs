#!/usr/bin/env python3
"""Tüm module-layout eğitim modüllerini İşletim Sistemi Güvenliği şablonuna yaklaştırır."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

SKIP = {
    "coming-soon.html",
    "web-uygulama-guvenligi.html",
    "ag-guvenligi.html",
}

LESSON_HERO_BLOCK = """            <div id="lesson-route-hero" class="lesson-route-hero" aria-live="polite" hidden>
                <p class="lesson-route-hero-module"></p>
                <p class="lesson-route-hero-lesson"></p>
                <div class="lesson-route-hero-img-wrap">
                    <img class="lesson-route-hero-img" src="" alt="" loading="lazy" decoding="async" />
                </div>
            </div>
"""

MOBILE_TOGGLE = (
    '    <button class="mobile-menu-toggle" id="mobileMenuToggle" '
    'aria-label="Menüyü Aç/Kapat">\n        <i class="fas fa-bars"></i>\n    </button>\n'
)

REQUIRED_CSS = [
    '<link rel="stylesheet" href="/css/sebs-module-lesson-route.css" />',
    '<link rel="stylesheet" href="/css/module-lesson-landing.css" />',
    '<link rel="stylesheet" href="/css/module-isletim-standard.css" />',
]

MODULE_LESSON_CONFIG: dict[str, dict[str, str]] = {
    "guncel-siber-guvenlige-giris.html": {
        "moduleName": "Siber Güvenliğe Giriş",
        "storageKey": "module_progress_siber_guvenlik_giris",
        "basePath": "/modules/guncel-siber-guvenlige-giris.html",
    },
    "temel-network-egitimi.html": {
        "moduleName": "Temel Network Eğitimi",
        "storageKey": "module_progress_temel_network",
        "basePath": "/modules/temel-network-egitimi.html",
    },
    "temel-kriptografi.html": {
        "moduleName": "Temel Kriptografi",
        "storageKey": "module_progress_temel_kriptografi",
        "basePath": "/modules/temel-kriptografi.html",
    },
    "network-guvenligi.html": {
        "moduleName": "Network Güvenliği",
        "storageKey": "module_progress_network_guvenligi",
        "basePath": "/modules/network-guvenligi.html",
        "extra": 'progressMode: "lesson",',
    },
    "soc.html": {
        "moduleName": "SOC Eğitimi",
        "storageKey": "module_progress_soc",
        "basePath": "/modules/soc.html",
    },
    "malware-analizi.html": {
        "moduleName": "Malware Analizi",
        "storageKey": "module_progress_malware_analizi",
        "basePath": "/modules/malware-analizi.html",
    },
    "ileri-malware-analizi.html": {
        "moduleName": "İleri Malware Analizi",
        "storageKey": "module_progress_ileri_malware",
        "basePath": "/modules/ileri-malware-analizi.html",
    },
    "sosyal-muhendislik.html": {
        "moduleName": "Sosyal Mühendisliğe Giriş",
        "storageKey": "module_progress_sosyal_muhendislik",
        "basePath": "/modules/sosyal-muhendislik.html",
    },
    "incident-response.html": {
        "moduleName": "Olay Müdahalesi & DFIR",
        "storageKey": "module_progress_incident_response",
        "basePath": "/modules/incident-response.html",
    },
    "penetration-testing.html": {
        "moduleName": "Red Team & Pentest",
        "storageKey": "module_progress_penetration_testing",
        "basePath": "/modules/penetration-testing.html",
    },
    "threat-hunting.html": {
        "moduleName": "Threat Intelligence",
        "storageKey": "module_progress_threat_hunting",
        "basePath": "/modules/threat-hunting.html",
    },
    "ileri-kriptografi.html": {
        "moduleName": "İleri Kriptografi",
        "storageKey": "module_progress_ileri_kriptografi",
        "basePath": "/modules/ileri-kriptografi.html",
    },
}


def strip_comments(html: str) -> str:
    return re.sub(r"<!--.*?-->", "", html, flags=re.S)


def has_real(html: str, needle: str) -> bool:
    return needle in strip_comments(html)


def ensure_before_head_close(html: str, snippet: str) -> str:
    m = re.search(r'href="([^"]+)"', snippet)
    key = m.group(1) if m else snippet
    if has_real(html, key):
        return html
    idx = html.rfind("</head>")
    if idx == -1:
        return html
    return html[:idx] + f"    {snippet}\n" + html[idx:]


def ensure_script(html: str, src: str) -> str:
    tag = f'<script src="{src}"></script>'
    if has_real(html, src):
        return html
    for anchor in (
        '<script src="/js/module-visual-enrichment.js"></script>',
        '<script src="/js/module-inline-cards.js"></script>',
        '<script src="module-access-check.js"></script>',
    ):
        if anchor in html:
            return html.replace(anchor, anchor + f"\n    {tag}", 1)
    if "</footer>" in html:
        return html.replace("</footer>", f"    {tag}\n  </footer>", 1)
    return html.replace("</body>", f"    {tag}\n</body>", 1)


def ensure_landing_body(html: str) -> str:
    if has_real(html, "landing-site-body"):
        return html
    return re.sub(
        r"<body([^>]*)>",
        r'<body class="landing-site-body font-sans text-slate-800 antialiased bg-white"\1>',
        html,
        count=1,
    )


def ensure_mobile_toggle(html: str) -> str:
    if has_real(html, "mobile-menu-toggle"):
        return html
    if "</header>" in html:
        return html.replace("</header>", f"</header>\n{MOBILE_TOGGLE}", 1)
    return html


def ensure_lesson_hero(html: str) -> str:
    if has_real(html, "lesson-route-hero"):
        return html
    m = re.search(r"<main\b[^>]*>", html, re.I)
    if m:
        return html[: m.end()] + "\n" + LESSON_HERO_BLOCK + html[m.end() :]
    return html


def ensure_premium_lessons(html: str, filename: str) -> str:
    if has_real(html, "sebs-premium-module-lessons.js"):
        return html
    if filename == "temel-siber-guvenlik.html":
        return html
    if "nav-link-section" not in html and filename not in MODULE_LESSON_CONFIG:
        return html
    cfg = MODULE_LESSON_CONFIG.get(filename)
    if not cfg and "nav-link-section" in html:
        stem = filename.replace(".html", "").replace("-", " ").title()
        cfg = {
            "moduleName": stem,
            "storageKey": f"module_progress_{filename.replace('.html', '').replace('-', '_')}",
            "basePath": f"/modules/{filename}",
        }
    if not cfg:
        return html
    extra = cfg.get("extra")
    extra_line = f"\n            {extra}" if extra else ""
    block = f"""        <script src="/js/sebs-premium-module-lessons.js"></script>
    <script>
        window.SebsPremiumModuleLessons.run({{
            moduleName: '{cfg["moduleName"]}',
            storageKey: '{cfg["storageKey"]}',
            basePath: '{cfg["basePath"]}',{extra_line}
        }});
    </script>"""
    if "<footer" in html:
        return html.replace("<footer", block + "\n  <footer", 1)
    return html.replace("</body>", block + "\n</body>", 1)


def ensure_quiz_exam(html: str) -> str:
    if has_real(html, "quiz-exam.js"):
        return html
    if "eval-quiz-section" not in html and "Kendini Değerlendir" not in html:
        return html
    anchor = '<script src="../utils/time-tracker.js"></script>'
    if anchor in html:
        return html.replace(
            anchor,
            anchor + '\n    <script src="../utils/quiz-exam.js"></script>',
            1,
        )
    return ensure_before_head_close(html, '<script src="../utils/quiz-exam.js"></script>')


def ensure_tailwind_stack(html: str) -> str:
    if has_real(html, "saas-landing.css"):
        return html
    block = """  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/css/saas-landing.css" />
  <link rel="stylesheet" href="/css/landing-chrome.css?v=5" />"""
    return ensure_before_head_close(html, block)


def process_file(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    if "module-layout" not in html:
        return False
    orig = html
    html = ensure_landing_body(html)
    html = ensure_tailwind_stack(html)
    for link in REQUIRED_CSS:
        html = ensure_before_head_close(html, link)
    html = ensure_quiz_exam(html)
    html = ensure_mobile_toggle(html)
    html = ensure_lesson_hero(html)
    html = ensure_premium_lessons(html, path.name)
    html = ensure_script(html, "/js/module-isletim-standard.js")
    html = ensure_script(html, "/js/module-visual-enrichment.js")
    html = ensure_script(html, "/js/saas-shell.js")
    html = ensure_script(html, "module-access-check.js")
    if html != orig:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(MODULES.glob("*.html")):
        if path.name in SKIP:
            continue
        if process_file(path):
            changed.append(path.name)
    print("Güncellenen modüller:", ", ".join(changed) if changed else "(yok)")


if __name__ == "__main__":
    main()
