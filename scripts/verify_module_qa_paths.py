#!/usr/bin/env python3
"""Smoke-check premium module HTML paths (beginner / intermediate / advanced)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

PATHS = {
    "beginner": "guncel-siber-guvenlige-giris.html",
    "intermediate": "network-guvenligi.html",
    "advanced": "penetration-testing.html",
}

REQUIRED_SNIPPETS = [
    "premium-lesson.css",
    "module-access-check.js",
    "sebs-premium-module-lessons.js",
    "quiz-exam.js",
]

FA_ICON_OK = re.compile(
    r'cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[^"\']+all\.min\.css',
    re.I,
)


def check_file(label: str, rel: str) -> list[str]:
    path = MODULES / rel
    issues: list[str] = []
    if not path.is_file():
        return [f"{label}: dosya yok — {rel}"]
    text = path.read_text(encoding="utf-8", errors="replace")
    if "premium-lesson.css" in text and "font-awesome" in text:
        if not FA_ICON_OK.search(text):
            issues.append(f"{label}: Font Awesome link bozuk olabilir")
    for snippet in REQUIRED_SNIPPETS:
        if snippet not in text:
            issues.append(f"{label}: eksik — {snippet}")
    if "module-access-gate" in text and "module-access-check" not in text:
        issues.append(f"{label}: gate yüklenmemiş")
    return issues


def main() -> int:
    all_issues: list[str] = []
    for level, rel in PATHS.items():
        all_issues.extend(check_file(level, rel))

    cloud = ["aws-temelleri.html", "azure-cloud.html", "gcp.html"]
    for name in cloud:
        p = MODULES / name
        if not p.is_file():
            all_issues.append(f"cloud: {name} yok")
            continue
        t = p.read_text(encoding="utf-8", errors="replace")
        if "sebs-module-lite.css" not in t:
            all_issues.append(f"cloud: {name} lite CSS eksik")
        if "Yakında" not in t and "yakında" not in t.lower():
            all_issues.append(f"cloud: {name} yakında metni eksik")

    if all_issues:
        print("MODUL QA: BASARISIZ")
        for i in all_issues:
            print(" ", i)
        return 1
    print("MODUL QA: OK (giriş / orta / ileri + bulut coming-soon)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
