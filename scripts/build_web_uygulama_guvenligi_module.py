#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Yayın: `frontend/modules/web-uygulama-guvenligi.html`.

Şu an yalnızca “yakında yüklenecek” yer tutucu sayfasını kopyalar (`parts/web-uygulama-guvenligi-placeholder.html`).
Tam içerik birleştirmesi (network şablonu + parça HTML) geçmiş sürümlerde ve `parts/web-uygulama-guvenligi-*.html` dosyalarında duruyor.
"""
from __future__ import annotations

import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
MOD_DIR = ROOT / "frontend" / "modules"
OUT = MOD_DIR / "web-uygulama-guvenligi.html"
PLACEHOLDER = MOD_DIR / "parts" / "web-uygulama-guvenligi-placeholder.html"


def main() -> None:
    if not PLACEHOLDER.exists():
        raise SystemExit(f"Missing placeholder: {PLACEHOLDER}")
    text = PLACEHOLDER.read_text(encoding="utf-8")
    OUT.write_text(text, encoding="utf-8")
    print("Wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
