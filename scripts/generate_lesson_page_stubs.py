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
H3_TAG_RE = re.compile(r"<h3\b([^>]*)>(.*?)</h3>", re.I | re.S)
H2_ID_RE = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)
SKIP_H3 = re.compile(
    r"kazanım|bullseye|bu bölümde neler|check-double|fa-bullseye",
    re.I,
)
NAV_SUB_RE = re.compile(
    r'class="[^"]*nav-link-sub[^"]*"[^>]*data-section="([^"]+)"[^>]*data-anchor="([^"]+)"',
    re.I,
)
NAV_SUB_RE_ALT = re.compile(
    r'data-section="([^"]+)"[^>]*data-anchor="([^"]+)"[^>]*class="[^"]*nav-link-sub',
    re.I,
)
NAV_SEC_RE = re.compile(
    r'class="[^"]*nav-link-section[^"]*"[^>]*data-section="([^"]+)"',
    re.I,
)
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


def ensure_heading_id(section_id: str, title: str, idx: int, attr_id: str = "") -> str:
    if attr_id and len(attr_id) <= 100:
        return attr_id
    slug = slugify_anchor(title) or f"lesson-{idx}"
    if len(slug) > 64:
        slug = slug[:64].rstrip("-")
    return f"{section_id}-{slug}"


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


def collect_keys_from_nav(html: str) -> list[str]:
    keys: list[str] = []
    seen: set[str] = set()
    for pattern in (NAV_SUB_RE, NAV_SUB_RE_ALT):
        for m in pattern.finditer(html):
            key = f"{m.group(1)}::{m.group(2)}"
            if key not in seen:
                seen.add(key)
                keys.append(key)
    section_ids_with_sub = {k.split("::", 1)[0] for k in keys if "::" in k}
    for m in NAV_SEC_RE.finditer(html):
        sid = m.group(1)
        if sid in section_ids_with_sub:
            continue
        if sid not in seen:
            seen.add(sid)
            keys.append(sid)
    return keys


def collect_keys_from_dom(html: str) -> list[str]:
    keys: list[str] = []
    for m in SECTION_BLOCK_RE.finditer(html):
        section_id = m.group(1)
        block = m.group(2)
        inner_m = re.search(r'<div[^>]*class="[^"]*section-inner[^"]*"[^>]*>(.*)', block, re.I | re.S)
        search_in = inner_m.group(1) if inner_m else block
        h3_keys: list[str] = []
        h3_idx = 0
        for h3m in H3_TAG_RE.finditer(search_in):
            attrs, inner = h3m.group(1), h3m.group(2)
            title = strip_tags(inner)
            if not title or len(title) > 160 or SKIP_H3.search(title):
                continue
            pre = search_in[max(0, h3m.start() - 1200) : h3m.start()]
            if re.search(r"<div[^>]*class=\"[^\"]*learning-objectives", pre, re.I) and not re.search(
                r"edu-narrative|edu-chapter-body", pre, re.I
            ):
                continue
            if re.search(r"<div[^>]*class=\"[^\"]*edu-lesson-recap", pre, re.I):
                continue
            id_m = H2_ID_RE.search(attrs)
            hid = id_m.group(1) if id_m else ""
            hid = ensure_heading_id(section_id, title, h3_idx, hid)
            h3_keys.append(f"{section_id}::{hid}")
            h3_idx += 1
        if len(h3_keys) >= 2:
            keys.extend(h3_keys)
            continue
        sub_keys: list[str] = []
        idx = 0
        for h2m in H2_TAG_RE.finditer(search_in):
            attrs, inner = h2m.group(1), h2m.group(2)
            title = strip_tags(inner)
            if not title or len(title) > 160 or SKIP_H2.search(title):
                continue
            if re.search(
                r"learning-objectives|concept-grid|lesson-image-wrap|sg-isletim-intro",
                search_in[max(0, h2m.start() - 400) : h2m.start()],
                re.I,
            ):
                continue
            id_m = H2_ID_RE.search(attrs)
            hid = id_m.group(1) if id_m else ""
            hid = ensure_heading_id(section_id, title, idx, hid)
            sub_keys.append(f"{section_id}::{hid}")
            idx += 1
        if sub_keys:
            keys.extend(sub_keys)
        elif h3_keys:
            keys.extend(h3_keys)
        else:
            keys.append(section_id)
    return keys


def collect_keys(html: str) -> list[str]:
    nav_keys = collect_keys_from_nav(html)
    dom_keys = collect_keys_from_dom(html)
    if not nav_keys:
        return dom_keys
    if any("::" in k for k in nav_keys):
        return nav_keys
    if any("::" in k for k in dom_keys):
        return dom_keys
    return nav_keys if len(nav_keys) >= len(dom_keys) else dom_keys


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
