#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract full WAG curriculum text from agent transcript → HTML fragment for build."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPT = (
    Path.home()
    / ".cursor"
    / "projects"
    / "Users-apple-Desktop-sebs"
    / "agent-transcripts"
    / "1fd8fb5d-8cd3-4a37-8e26-e6f8fdc4b8ec"
    / "1fd8fb5d-8cd3-4a37-8e26-e6f8fdc4b8ec.jsonl"
)
OUT = ROOT / "frontend" / "modules" / "parts" / "web-uygulama-guvenligi-mufredat-tam.html"
NAV_JSON = ROOT / "frontend" / "modules" / "parts" / "wag-nav-titles.json"

# Müfredat modül numarası → derste kullanılan bölüm id (birden fazla modül aynı derse bağlanabilir)
SECTION_BY_MOD: dict[int, str] = {
    1: "wag-m1-mimari",
    2: "wag-m1b-teknoloji",
    3: "wag-m1c-owasp",
    4: "wag-m2-http",
    5: "wag-m1-mimari",
    6: "wag-m3-auth",
    7: "wag-m3-auth",
    8: "wag-m3b-oauth-jwt",
    9: "wag-m4-authz",
    10: "wag-m5-veri",
    11: "wag-m6-zafiyet",
    12: "wag-m6-zafiyet",
    13: "wag-m6-zafiyet",
    14: "wag-m6b-is-mantigi",
    15: "wag-m7-api",
    16: "wag-m5b-veri-koruma",
    17: "wag-m8-headers",
    18: "wag-m10-sdlc",
    19: "wag-m9-log",
    20: "wag-m11-rapor",
}


def load_curriculum_text() -> str:
    for line in TRANSCRIPT.read_text(encoding="utf-8").splitlines():
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            continue
        if o.get("role") != "user":
            continue
        for x in o.get("message", {}).get("content", []):
            if isinstance(x, dict) and x.get("type") == "text":
                t = x.get("text", "")
                if "Modül 1 — Web Uygulama" not in t:
                    continue
                t = re.sub(r"^<user_query>\s*", "", t, flags=re.I)
                t = re.sub(r"\s*</user_query>\s*$", "", t, flags=re.I)
                t = re.sub(
                    r"\n*eksik olan metinleri uzatmak için bunu kullan\s*$",
                    "",
                    t,
                    flags=re.I,
                ).strip()
                return t
    raise SystemExit("Curriculum message not found in transcript")


def split_modules(body: str) -> list[tuple[int, str]]:
    """Return [(1, chunk), ...] for Modül N — headers."""
    pat = re.compile(r"(?=^Modül\s+(\d+)\s+—\s*)", re.M)
    matches = list(pat.finditer(body))
    if not matches:
        raise SystemExit("No Modül headings found")
    out: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        chunk = body[start:end].strip()
        num = int(m.group(1))
        out.append((num, chunk))
    return out


def chunk_to_html(chunk: str) -> str:
    esc = html.escape(chunk)
    return f'<div class="mufredat-preline" style="white-space:pre-wrap">{esc}</div>'


def main() -> None:
    body = load_curriculum_text()
    parts = split_modules(body)
    nums = [n for n, _ in parts]
    if sorted(nums) != list(range(1, 21)):
        raise SystemExit(f"Expected modules 1..20, got {nums}")

    blocks: list[str] = []
    for n, chunk in parts:
        first_line = chunk.split("\n", 1)[0].strip()
        rest = chunk.split("\n", 1)[1] if "\n" in chunk else ""
        h = html.escape(first_line)
        inner = chunk_to_html(rest.strip()) if rest.strip() else ""
        blocks.append(
            f'<section class="mufredat-module-block" id="mufredat-modul-{n}" '
            f'data-mufredat-mod="{n}" aria-label="Modül {n} tam metin">'
            f"<h2>{h}</h2>{inner}</section>"
        )

    inner = "\n".join(blocks)
    section = f'''<section class="content-section docx-content" id="wag-m13-mufredat-tam" data-section="wag-m13-mufredat-tam">
<div class="section-inner module-2-enhanced">
<h1>Resmî müfredat — tam metin (Modül 1–20)</h1>
<p>Bu bölüm, eğitim tasarımına kaynak teşkil eden müfredat metninin <strong>eksiksiz</strong> kopyasıdır. Uygulamalı alıştırmalar, laboratuvar komutları ve genişletilmiş anlatım üstteki ders bölümlerindedir; burada metin bütünlüğü korunmuştur.</p>
<div class="info-box"><p><strong>Okuma ipucu</strong></p><p>İçindekiler menüsünden ilgili modüle atlayabilir veya aşağıda sırayla tüm metni inceleyebilirsiniz.</p></div>
<div class="mufredat-toc" style="margin:1.25rem 0;padding:1rem;border:1px solid var(--border-color);border-radius:10px;">
<p style="margin:0 0 0.5rem 0;font-weight:600">Hızlı bağlantılar</p>
<nav aria-label="Müfredat modül bağlantıları"><ul style="margin:0;padding-left:1.1rem;line-height:1.7">
{"".join(f'<li><a href="#mufredat-modul-{n}">Modül {n}</a></li>' for n in range(1, 21))}
</ul></nav>
</div>
{inner}
</div>
</section>
'''
    OUT.write_text(section + "\n", encoding="utf-8")
    print("Wrote", OUT, "bytes", OUT.stat().st_size)

    nav_rows: list[dict] = [
        {"mod": 0, "label": "Önkoşul — Etik, yetki ve güvenli çalışma", "section": "wag-m0-etik"},
    ]
    for n, chunk in parts:
        title_line = chunk.split("\n", 1)[0].strip()
        nav_rows.append({"mod": n, "label": title_line, "section": SECTION_BY_MOD[n]})
    nav_rows.append(
        {
            "mod": None,
            "label": "Sözlük ve eğitim kapanışı",
            "section": "wag-m12-sozluk",
        }
    )
    nav_rows.append(
        {
            "mod": None,
            "label": "Ek — Resmî müfredat tam metni (Modül 1–20)",
            "section": "wag-m13-mufredat-tam",
        }
    )
    NAV_JSON.write_text(json.dumps(nav_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", NAV_JSON)


if __name__ == "__main__":
    main()
