#!/usr/bin/env python3
"""Modül ders URL'leri için yerel statik sunucuda çalışan ince HTML köprüleri üretir."""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

SECTION_BLOCK_RE = re.compile(
    r'<section\b[^>]*\bclass="[^"]*content-section[^"]*"[^>]*\bid="([^"]+)"[^>]*>(.*?)</section\s*>',
    re.I | re.S,
)
H2_TAG_RE = re.compile(r"<h2\b([^>]*)>(.*?)</h2>", re.I | re.S)
H2_ID_RE = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)
SKIP_H2 = re.compile(
    r"terimler\s+sözlüğü|kendini\s+değerlendir|kapanış|bu\s+modülde\s+kazanılan|bu\s+modülde\s+neler",
    re.I,
)


def slugify_anchor(text: str) -> str:
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = t.lower()
    t = re.sub(r"[^a-z0-9\s-]", "", t)
    t = re.sub(r"\s+", "-", t.strip())
    t = re.sub(r"-+", "-", t)
    return t


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", "", html).strip()


def stub_html(module_file: str, lesson_key: str) -> str:
    if "::" in lesson_key:
        section_id, heading_id = lesson_key.split("::", 1)
        path = f"/modules/{module_file}/ders/{section_id}/{heading_id}.html"
    else:
        path = f"/modules/{module_file}/bolum/{lesson_key}.html"
    return f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url={path}">
  <script>location.replace({path!r});</script>
  <title>Yönlendiriliyor…</title>
</head>
<body>
  <p><a href="{path}">Derse git</a></p>
</body>
</html>
"""


def collect_keys(html: str) -> list[str]:
    keys: list[str] = []
    for m in SECTION_BLOCK_RE.finditer(html):
        section_id = m.group(1)
        block = m.group(2)
        sub_keys: list[str] = []
        for h2m in H2_TAG_RE.finditer(block):
            attrs, inner = h2m.group(1), h2m.group(2)
            title = strip_tags(inner)
            if not title or SKIP_H2.search(title):
                continue
            id_m = H2_ID_RE.search(attrs)
            hid = id_m.group(1) if id_m else ""
            if not hid:
                hid = f"{section_id}-{slugify_anchor(title) or 'sub'}"
            sub_keys.append(f"{section_id}::{hid}")
        if sub_keys:
            keys.extend(sub_keys)
        else:
            keys.append(section_id)
    return keys


def main() -> None:
    total = 0
    for path in sorted(MODULES.glob("*.html")):
        if path.name in ("coming-soon.html", "ag-guvenligi.html"):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if "sebs-premium-module-lessons.js" not in text:
            continue
        slug = path.stem
        keys = collect_keys(text)
        out_dir = MODULES / slug
        for key in keys:
            if "::" in key:
                sec, hid = key.split("::", 1)
                dest = out_dir / "ders" / sec / f"{hid}.html"
            else:
                dest = out_dir / "bolum" / f"{key}.html"
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(stub_html(slug, key), encoding="utf-8")
            total += 1
        print(f"{slug}: {len(keys)} sayfa")
    print(f"\nToplam {total} köprü dosyası yazıldı.")


if __name__ == "__main__":
    main()
