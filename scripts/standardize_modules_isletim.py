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
}

TARGETS = [
    "guncel-siber-guvenlige-giris.html",
    "temel-network-egitimi.html",
    "temel-kriptografi.html",
    "network-guvenligi.html",
    "soc.html",
    "malware-analizi.html",
    "ileri-malware-analizi.html",
    "isletim-sistemi-guvenligi.html",
    "sosyal-muhendislik.html",
    "incident-response.html",
    "penetration-testing.html",
    "threat-hunting.html",
    "ileri-kriptografi.html",
    "temel-siber-guvenlik.html",
]

CSS_LINK = '<link rel="stylesheet" href="/css/module-isletim-standard.css" />'
JS_SCRIPT = '<script src="/js/module-isletim-standard.js"></script>'


def ensure_link(html: str, link: str) -> str:
    if link in html:
        return html
    if "</head>" in html:
        return html.replace("</head>", f"    {link}\n</head>", 1)
    return html


def ensure_script(html: str, src: str) -> str:
    tag = f'<script src="{src}"></script>'
    if tag in html:
        return html
    anchor = '<script src="/js/module-visual-enrichment.js"></script>'
    if anchor in html:
        return html.replace(anchor, anchor + "\n    " + tag, 1)
    if "</body>" in html:
        return html.replace("</body>", f"    {tag}\n</body>", 1)
    return html


def remove_section_mode(html: str) -> str:
    html = re.sub(r",\s*\n\s*progressMode:\s*['\"]section['\"]", "", html)
    return html


def remove_siber_enhance(html: str) -> str:
    return html.replace(
        '    <script src="/js/siber-giris-module-enhance.js"></script>\n', ""
    )


def ensure_landing_body(html: str) -> str:
    if "landing-site-body" in html:
        return html
    html = re.sub(
        r"<body([^>]*)>",
        r'<body class="landing-site-body font-sans text-slate-800 antialiased bg-white"\1>',
        html,
        count=1,
    )
    return html


def ensure_lesson_landing_css(html: str) -> str:
    link = '<link rel="stylesheet" href="/css/module-lesson-landing.css" />'
    if link in html:
        return html
    return ensure_link(html, link)


def process(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    orig = html
    if "module-layout" not in html and path.name != "temel-siber-guvenlik.html":
        return False
    html = ensure_landing_body(html)
    html = ensure_lesson_landing_css(html)
    html = ensure_link(html, CSS_LINK)
    html = remove_section_mode(html)
    html = remove_siber_enhance(html)
    html = ensure_script(html, "/js/module-isletim-standard.js")
    if html != orig:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for name in TARGETS:
        if name in SKIP:
            continue
        p = MODULES / name
        if not p.exists():
            continue
        if process(p):
            changed.append(name)
    print("Updated:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()
