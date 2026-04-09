#!/usr/bin/env python3
"""Replace legacy landing chrome header with auth-aware header (partial content)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARTIAL = ROOT / "frontend" / "partials" / "landing-header.html"
FRONTEND = ROOT / "frontend"

SKIP = frozenset({"index.html", "landing-saas.html"})


def build_replacement() -> str:
    raw = PARTIAL.read_text(encoding="utf-8")
    lines = []
    for line in raw.splitlines():
        if line.startswith("  "):
            lines.append(line[2:])
        else:
            lines.append(line)
    return "\n".join(lines).rstrip() + "\n"


HEADER_RE = re.compile(
    r"<!--\s*Landing chrome header[^>]*-->.*?</header>\s*",
    re.DOTALL | re.IGNORECASE,
)


def main() -> int:
    if not PARTIAL.is_file():
        print("Missing", PARTIAL, file=sys.stderr)
        return 1
    new_block = build_replacement()
    n = 0
    for path in FRONTEND.rglob("*.html"):
        if any(p in SKIP for p in path.parts):
            continue
        if "node_modules" in path.parts or "partials" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        if "Landing chrome header" not in text:
            continue
        new_text, count = HEADER_RE.subn(new_block, text, count=1)
        if count:
            path.write_text(new_text, encoding="utf-8")
            n += 1
            print("updated", path.relative_to(ROOT))
    print("files updated:", n)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
