#!/usr/bin/env python3
"""Bozuk quiz HTML sarmalayıcılarını düzelt (ör. eval-quiz <p> içinde)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

KENDINI_OPEN = re.compile(
    r"<p>\s*\n(<h2><i class=\"fas fa-clipboard-list\"></i> Kendini Değerlendir[^<]+</h2>)",
    re.MULTILINE,
)
QUIZ_END = re.compile(
    r"</div>Bu Modülde Neler Öğrendik\?</p>",
    re.IGNORECASE,
)


def fix_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text
    text = KENDINI_OPEN.sub(r"\n\1", text)
    text = QUIZ_END.sub("</div>\n<h2>Bu Modülde Neler Öğrendik?</h2>", text)
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    targets = [MODULES / "ileri-kriptografi.html"]
    if len(sys.argv) > 1:
        targets = [Path(p) for p in sys.argv[1:]]
    changed = 0
    for p in targets:
        if p.exists() and fix_file(p):
            print(f"fixed: {p.name}")
            changed += 1
    print(f"done ({changed} file(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
