#!/usr/bin/env python3
"""module-lesson-landing kullanan modüllerdeki eski inline <style> bloklarını kaldırır."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

FILES = [
    "guncel-siber-guvenlige-giris.html",
    "temel-network-egitimi.html",
    "temel-kriptografi.html",
    "network-guvenligi.html",
    "sosyal-muhendislik.html",
]


def strip_inline_style(html: str) -> str:
    if "module-lesson-landing.css" not in html:
        return html
    # İlk büyük legacy style bloğu (tailwind öncesi)
    pattern = re.compile(
        r"\n\s*<style>\s*\n\s*:root\s*\{.*?</style>\s*",
        re.DOTALL,
    )
    new_html, n = pattern.subn("\n", html, count=1)
    return new_html if n else html


def main() -> None:
    for name in FILES:
        path = MODULES / name
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        updated = strip_inline_style(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            print("stripped:", name)
        else:
            print("skip:", name)


if __name__ == "__main__":
    main()
