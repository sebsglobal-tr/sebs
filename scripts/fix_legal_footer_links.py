#!/usr/bin/env python3
"""Replace placeholder # legal footer links across frontend HTML files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend"

REPLACEMENTS: list[tuple[str, str]] = [
    (
        r'<a href="#" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Gizlilik</a>',
        '<a href="/gizlilik" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Gizlilik</a>',
    ),
    (
        r'<a href="#" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Kullanım şartları</a>',
        '<a href="/kullanim-sartlari" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Kullanım şartları</a>',
    ),
    (
        r'<a href="#" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">KVKK</a>',
        '<a href="/kvkk" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">KVKK</a>',
    ),
    (
        r"<a href=\"#\">Gizlilik Politikası</a>",
        '<a href="/gizlilik">Gizlilik Politikası</a>',
    ),
    (
        r'<a href="/gizlilik-politikasi.html">Gizlilik</a>',
        '<a href="/gizlilik">Gizlilik</a>',
    ),
    (
        r'<a href="/kullanim-sartlari.html">Kullanım Şartları</a>',
        '<a href="/kullanim-sartlari">Kullanım Şartları</a>',
    ),
    (
        r'<a href="/kvkk-aydinlatma.html">KVKK</a>',
        '<a href="/kvkk">KVKK</a>',
    ),
    ('href="/gizlilik-politikasi.html"', 'href="/gizlilik"'),
    ('href="/kvkk-aydinlatma.html"', 'href="/kvkk"'),
    ('href="/kullanim-sartlari.html"', 'href="/kullanim-sartlari"'),
]


def main() -> None:
    changed: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        text = path.read_text(encoding="utf-8")
        original = text
        for pattern, repl in REPLACEMENTS:
            text = text.replace(pattern, repl)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))
    print(f"Updated {len(changed)} file(s)")
    for name in changed:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
