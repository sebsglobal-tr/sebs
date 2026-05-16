#!/usr/bin/env python3
"""Align module CSS accents with SEBS navy brand (replace stray red/maroon theme)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend" / "css"

REPLACEMENTS = [
    ("#5c2a2a", "#1e3a8a"),
    ("#6b3030", "#1e40af"),
    ("#450a0a", "#0f172a"),
    ("#7f1d1d", "#1e40af"),
    ("#991b1b", "#1d4ed8"),
    ("#b91c1c", "#2563eb"),
    ("#fff1f2", "#eff6ff"),
    ("#ffe4e6", "#dbeafe"),
    ("#fecdd3", "#bfdbfe"),
    ("#1f1410", "#0f172a"),
    ("#2a1815", "#1e293b"),
    ("#3f1d1d", "#334155"),
]

FILES = [
    "module-content-theme.css",
    "module-lesson-landing.css",
    "module-isletim-standard.css",
]


def main() -> None:
    for name in FILES:
        path = ROOT / name
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != original:
            path.write_text(text, encoding="utf-8")
            print(f"Updated {name}")
        else:
            print(f"No changes {name}")


if __name__ == "__main__":
    main()
