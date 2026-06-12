#!/usr/bin/env python3
"""
Transcript'teki kullanıcı müfredatından Temel Kriptografi HTML parçalarını üretir.
Her h3 (ve varsa giriş metni) ayrı bir .content-section = Temel Network ile aynı tam sayfa ders akışı.
Çıktılar:
- frontend/modules/parts/temel-kripto-chunk01.html (Modül 1 tüm ders bölümleri)
- frontend/modules/parts/temel-kripto-chunk02-08.html (Modül 2–8)
- frontend/modules/parts/temel-kripto-nav-ul.html (modül başlıklı yan menü; her ders nav-link-section)
Ayrıca frontend/modules/temel-kriptografi.html içinde <nav class="sidebar-nav"> ve <main> içeriği güncellenir.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
TRANSCRIPT_CANDIDATES = [
    REPO_ROOT
    / ".cursor/projects/Users-apple-Desktop-sebs/agent-transcripts/"
    / "c91f4e8e-75b8-4aa8-a44f-01b48b5d355d/c91f4e8e-75b8-4aa8-a44f-01b48b5d355d.jsonl",
    Path(
        "/Users/apple/.cursor/projects/Users-apple-Desktop-sebs/agent-transcripts/"
        "c91f4e8e-75b8-4aa8-a44f-01b48b5d355d/c91f4e8e-75b8-4aa8-a44f-01b48b5d355d.jsonl"
    ),
]

OUT_M1 = REPO_ROOT / "frontend/modules/parts/temel-kripto-chunk01.html"
OUT_M2_8 = REPO_ROOT / "frontend/modules/parts/temel-kripto-chunk02-08.html"
OUT_NAV = REPO_ROOT / "frontend/modules/parts/temel-kripto-nav-ul.html"
OUT_TAG = REPO_ROOT / "frontend/modules/parts/temel-kripto-sidebar-tagline.html"
MAIN_HTML = REPO_ROOT / "frontend/modules/temel-kriptografi.html"

ICON = {
    1: "fa-shield-alt",
    2: "fa-microchip",
    3: "fa-scroll",
    4: "fa-lock",
    5: "fa-fingerprint",
    6: "fa-key",
    7: "fa-certificate",
    8: "fa-check-double",
}


def resolve_transcript() -> Path:
    for p in TRANSCRIPT_CANDIDATES:
        if p.is_file():
            return p
    raise SystemExit("Curriculum transcript JSONL not found; set TRANSCRIPT_CANDIDATES in build script.")


def load_curriculum_text() -> str:
    with resolve_transcript().open(encoding="utf-8") as f:
        for line in f:
            if "Kriptografiye Giriş" in line and '"role":"user"' in line:
                obj = json.loads(line)
                break
        else:
            raise SystemExit("Curriculum user message not found in transcript")
    t = obj["message"]["content"][0]["text"]
    if "<user_query>" in t:
        t = t.split("<user_query>", 1)[1].split("</user_query>", 1)[0].strip()
    return strip_curriculum_noise(t)


def strip_curriculum_noise(text: str) -> str:
    """Transcript'e karışmış talimat satırlarını çıkarır."""
    out: list[str] = []
    for line in text.split("\n"):
        low = line.lower()
        if "temel kriptografi kartının içine bu modülü yaz" in low:
            continue
        out.append(line)
    return "\n".join(out)


def slice_module(full: str, n: int) -> str:
    start = full.find(f"Modül {n} —")
    if start == -1:
        raise SystemExit(f"Modül {n} başlığı bulunamadı")
    end = len(full)
    for m in range(n + 1, 12):
        pos = full.find(f"Modül {m} —")
        if pos != -1:
            end = pos
            break
    return full[start:end].strip()


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def is_learning_outcome(line: str) -> bool:
    s = line.strip().replace("\uf0b7", "").strip()
    if not s:
        return False
    keys = (
        "bilecek",
        "ebilecek",
        "kavrayacak",
        "içselleştir",
        "değerlendirebilecek",
        "ifade edebilecek",
        "ayırt edebilecek",
        "açıklayabilecek",
        "tanımlayabilecek",
        "kullanabilecek",
        "yorumlayabilecek",
        "ilişkilendirebilecek",
        "oluşturabilecek",
        "oluşturacak",
        "görebilecek",
        "okuyabilecek",
        "yazabilecek",
        "seçebilecek",
        "seçecek",
        "ifade edecek",
        "açıklayacak",
        "tanımlayacak",
        "yorumlayacak",
        "değerlendirecek",
        "ayırt edecek",
        "ilişkilendirecek",
        "içselleştirecek",
        "anlayacak",
        "kullanacak",
        "tanıyacak",
        "açıklayabilir",
        "ifade edebilir",
        "tanıyabilir",
        "yorumlayabilir",
        "sıralayabilir",
        "anlatabilir",
        "söyleyebilir",
        "değerlendirebilir",
        "fark edebilir",
        "kullanılabilir",
    )
    return any(k in s for k in keys)


def looks_like_h3_title(line: str) -> bool:
    """Bölüm başlığı (tek satır); cümle veya hizalı örnek satırı değildir."""
    s = line.strip()
    if not s or len(s) > 120:
        return False
    if re.fullmatch(r"[0-9a-fA-F]{32}", s.strip()):
        return False
    if "\t" in s:
        return False
    if s.startswith("\uf0b7"):
        return False
    if is_learning_outcome(s):
        return False
    if s in ("Kazanımlar", "Öğrenci bu modül sonunda:"):
        return False
    if re.search(r"\s{2,}:", s) or re.search(r":\s*\d+\s*$", s):
        return False
    if ":" in s and not s.endswith(":"):
        return False
    if "=" in s and len(s) < 55:
        return False
    if s.endswith("…"):
        return False
    inner = s[:-1] if s.endswith(".") else s
    if "." in inner and len(s) > 55:
        return False
    if s.endswith(":") and len(s) <= 48:
        low = s.lower()
        if any(
            k in low
            for k in (
                "örnek",
                "düşünelim",
                "gözlemlemek",
                "karşılaştırma",
                "aktarılacak",
                "olmalıdır:",
            )
        ):
            return False
    if s.endswith(":"):
        if len(s) > 90:
            return False
        if len(s) > 52:
            if not any(
                s.startswith(p)
                for p in (
                    "Bu modülde",
                    "Bu modülün",
                    "OTP",
                )
            ):
                return False
        return 8 <= len(s) <= 90
    if "." not in s and 4 <= len(s) <= 95:
        return True
    return False


def looks_like_h4_subheading(line: str) -> bool:
    s = line.strip()
    if not s or "\t" in s:
        return False
    if not s.endswith(":"):
        return False
    if len(s) > 52:
        return False
    low = s.lower()
    if "örnek" in low or "düşünelim" in low:
        return True
    if s.startswith("İki ") or s.startswith("Bu iki"):
        return True
    if s.startswith("OTP"):
        return True
    return False


def is_mono_line(line: str) -> bool:
    """Formül / hizalı XOR / kısa denklem satırları."""
    s = line.strip()
    if not s or "\t" in s:
        return False
    if s.startswith("C1") or s.startswith("C2"):
        return True
    if re.search(r"\s{2,}:", s):
        return True
    if re.search(r":\s*\d+\s*$", s):
        return True
    if "=" in s and len(s) <= 55 and not s.endswith("."):
        return True
    if " XOR " in s and len(s) <= 55:
        return True
    return False


def flush_para(buf: list[str], parts: list[str]) -> None:
    if not buf:
        return
    text = " ".join(x.strip() for x in buf if x.strip())
    if text:
        parts.append(f"<p>{esc(text)}</p>")
    buf.clear()


def flush_mono(buf: list[str], parts: list[str]) -> None:
    if not buf:
        return
    body = esc("\n".join(buf).rstrip())
    parts.append(f'<pre class="curriculum-mono">{body}</pre>')
    buf.clear()


def convert_body(lines: list[str], start_i: int) -> tuple[str, int]:
    """Kazanımlar bölümünden sonraki gövde metnini HTML'e çevirir."""
    parts: list[str] = []
    i = start_i
    buf: list[str] = []
    mono: list[str] = []
    bullet_buf: list[str] = []
    in_table = False
    table_rows: list[list[str]] = []

    def flush_table() -> None:
        nonlocal in_table, table_rows
        if not in_table or not table_rows:
            in_table = False
            table_rows = []
            return
        hdr = table_rows[0]
        parts.append('<table class="comparison-table"><thead>')
        parts.append("<tr>" + "".join(f"<th>{esc(c)}</th>" for c in hdr) + "</tr></thead><tbody>")
        for row in table_rows[1:]:
            parts.append("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in row) + "</tr>")
        parts.append("</tbody></table>")
        in_table = False
        table_rows = []

    def flush_bullets() -> None:
        nonlocal bullet_buf
        if not bullet_buf:
            return
        parts.append('<ul class="curriculum-bullets">')
        for b in bullet_buf:
            parts.append(f"<li>{esc(b)}</li>")
        parts.append("</ul>")
        bullet_buf = []

    while i < len(lines):
        raw = lines[i]
        stripped = raw.strip()
        i += 1

        if not stripped:
            if in_table:
                flush_table()
            flush_mono(mono, parts)
            flush_bullets()
            flush_para(buf, parts)
            continue

        if "\t" in stripped and not stripped.startswith("\uf0b7"):
            cells = [c.strip() for c in stripped.split("\t")]
            if len(cells) >= 2:
                flush_mono(mono, parts)
                flush_bullets()
                flush_para(buf, parts)
                if not in_table:
                    in_table = True
                    table_rows = []
                table_rows.append(cells)
                continue

        if in_table:
            flush_table()

        if stripped.startswith("\uf0b7"):
            flush_mono(mono, parts)
            flush_para(buf, parts)
            bullet_buf.append(stripped.lstrip("\uf0b7").strip())
            continue
        flush_bullets()

        if is_mono_line(stripped):
            flush_para(buf, parts)
            mono.append(stripped)
            continue

        if mono and not is_mono_line(stripped):
            flush_mono(mono, parts)

        if looks_like_h3_title(stripped):
            flush_para(buf, parts)
            flush_mono(mono, parts)
            parts.append(f"<h3>{esc(stripped)}</h3>")
            continue

        if looks_like_h4_subheading(stripped):
            flush_para(buf, parts)
            flush_mono(mono, parts)
            parts.append(f"<h4>{esc(stripped)}</h4>")
            continue

        flush_para(buf, parts)
        flush_mono(mono, parts)
        parts.append(f"<p>{esc(stripped)}</p>")

    flush_mono(mono, parts)
    flush_bullets()
    flush_para(buf, parts)
    flush_table()
    return "".join(parts), i


def enumerate_h3_lessons(body_html: str, section_id: str) -> list[dict[str, str]]:
    """Her ders: id, status (yan menü + lesson-status), html gövdesi."""
    body_html = body_html.strip()
    out: list[dict[str, str]] = []
    if not body_html:
        return out
    chunks = re.split(r"(?=<h3>)", body_html, flags=re.IGNORECASE)
    idx = 0
    first = chunks[0]
    if first.strip():
        lid = f"{section_id}-l{idx:02d}"
        out.append({"id": lid, "status": "Giriş ve kazanımlar", "html": first})
        idx += 1
    for ch in chunks[1:]:
        ch = ch.strip()
        if not ch:
            continue
        lid = f"{section_id}-l{idx:02d}"
        m = re.match(r"<h3>([\s\S]*?)</h3>", ch, re.IGNORECASE)
        raw_plain = ""
        if m:
            raw_plain = re.sub(r"<[^>]+>", "", m.group(1)).strip()
            raw_plain = html.unescape(raw_plain)
        if not raw_plain:
            raw_plain = f"Ders {idx + 1}"
        out.append({"id": lid, "status": raw_plain, "html": ch})
        idx += 1
    return out


def has_preamble_before_first_h3(first_inner: str) -> bool:
    s = first_inner.lstrip()
    return bool(s) and not s.lower().startswith("<h3")


def canonical_module_heading(n: int, title_line: str) -> str:
    """Müfredat satırı zaten 'Modül N …' ile başlıyorsa tekrar önek ekleme."""
    t = title_line.strip()
    if t.startswith(f"Modül {n}"):
        return t
    return f"Modül {n} — {t}"


def compact_section_header(n: int, lesson_title: str, title_line: str) -> str:
    intro = canonical_module_heading(n, title_line)
    return (
        f"""                <div class="section-header">
                    <h2><i class="fas {ICON[n]}"></i> {esc(lesson_title)}</h2>
                    <p class="section-intro">{esc(intro)}</p>
                </div>"""
    )


def parse_module(n: int, chunk: str, *, active_first_lesson: bool = False) -> tuple[str, str]:
    lines = chunk.split("\n")
    if not lines:
        return "", ""
    title_line = lines[0].strip()
    i = 1
    while i < len(lines) and not lines[i].strip():
        i += 1

    header_ps: list[str] = []
    while i < len(lines):
        s = lines[i].strip()
        if s == "Kazanımlar":
            break
        if s:
            header_ps.append(s)
        i += 1

    if len(header_ps) >= 2:
        hp1, hp2 = header_ps[0], header_ps[1]
        header_rest = header_ps[2:]
    elif len(header_ps) == 1:
        hp1, hp2, header_rest = header_ps[0], None, []
    else:
        hp1, hp2, header_rest = "", None, []

    header_html = f"""                <div class="section-header">
                    <h2><i class="fas {ICON[n]}"></i> {esc(title_line)}</h2>"""
    if hp1:
        header_html += f"\n                    <p>{esc(hp1)}</p>"
    if hp2:
        header_html += f'\n                    <p class="section-intro">{esc(hp2)}</p>'
    header_html += "\n                </div>"

    extra_intro = ""
    for p in header_rest:
        extra_intro += f"                    <p>{esc(p)}</p>\n"

    objectives_html = ""
    if i < len(lines) and lines[i].strip() == "Kazanımlar":
        i += 1
        objectives_html += """                    <div class="learning-objectives">
                        <h3><i class="fas fa-bullseye"></i> Kazanımlar</h3>
                        <ul>
"""
        if i < len(lines) and "Öğrenci" in lines[i]:
            i += 1
        while i < len(lines):
            s = lines[i].strip()
            if not s:
                i += 1
                continue
            if is_learning_outcome(s):
                objectives_html += f"                            <li>{esc(s)}</li>\n"
                i += 1
            else:
                break
        objectives_html += """                        </ul>
                    </div>
"""

    body_html, _ = convert_body(lines, i)
    lessons = enumerate_h3_lessons(body_html, f"kr-m{n}")
    if not lessons:
        return "", ""

    sections: list[str] = []
    nav_lis: list[str] = []
    preamble0 = has_preamble_before_first_h3(lessons[0]["html"])

    for j, les in enumerate(lessons):
        lid = les["id"]
        stat = les["status"]
        inner = les["html"].strip()
        active = bool(active_first_lesson and j == 0)
        sec_cls = "content-section active" if active else "content-section"

        if j == 0 and preamble0:
            hdr = header_html
        else:
            hdr = compact_section_header(n, stat, title_line)

        if j == 0:
            card_inner = f"{extra_intro}{objectives_html}{inner}"
        else:
            card_inner = inner

        lc = f"""                    <div class="lesson-controls">
                        <span class="lesson-status"><i class="fas fa-book-open"></i> {esc(stat)}</span>
                        <button type="button" class="btn-complete-lesson" data-section="{lid}" aria-label="Dersi tamamla"><i class="fas fa-check-circle"></i> Dersi Tamamla</button>
                    </div>
"""
        sec = f"""            <section class="{sec_cls}" id="{lid}">
{hdr}
                <div class="content-card docx-content">
{card_inner}
{lc}
                </div>
            </section>

"""
        sections.append(sec)
        na = " active" if active else ""
        nav_lis.append(
            f'                        <li><a href="#" class="nav-link-section{na}" data-section="{lid}">'
            f'<i class="fas {ICON[n]}"></i> {esc(stat)}</a></li>'
        )

    nav_heading = esc(canonical_module_heading(n, title_line))
    nav_block = (
        f'                <div class="nav-section">\n'
        f'                    <h4 class="nav-module-header">{nav_heading}</h4>\n'
        f'                    <ul class="nav-list nav-section-list">\n'
        + "\n".join(nav_lis)
        + "\n                    </ul>\n                </div>\n"
    )
    return "".join(sections), nav_block


def sidebar_tagline_paragraph(full: str) -> str:
    ch = slice_module(full, 1).split("\n")
    i = 1
    while i < len(ch) and not ch[i].strip():
        i += 1
    return ch[i].strip() if i < len(ch) else ""


def splice_temel_kriptografi_page(nav_inner: str, main_inner: str) -> None:
    """Yan menü: module-sidebar içindeki sidebar-nav. Ana içerik: <main>…</main> tam değişir."""
    raw = MAIN_HTML.read_text(encoding="utf-8")

    def nav_sub(m: re.Match[str]) -> str:
        return m.group(1) + "\n" + nav_inner + "\n            " + m.group(2)

    raw = re.sub(
        r'(<nav class="sidebar-nav">)\s*[\s\S]*?(\s*</nav>\s*</aside>)',
        nav_sub,
        raw,
        count=1,
    )

    raw = re.sub(
        r"(<main[^>]*>)\s*[\s\S]*?(</main>)",
        lambda m: m.group(1) + "\n" + main_inner + "\n        " + m.group(2),
        raw,
        count=1,
    )
    MAIN_HTML.write_text(raw, encoding="utf-8")


def main() -> None:
    full = load_curriculum_text()
    m1, nav1 = parse_module(1, slice_module(full, 1), active_first_lesson=True)
    nav_parts = [
        '                <div class="nav-section">\n'
        '                    <h4 class="nav-module-header">SEBS — Temel Kriptografi</h4>\n'
        "                </div>\n",
        nav1,
    ]
    sec_parts = [m1]
    for n in range(2, 9):
        h, nv = parse_module(n, slice_module(full, n), active_first_lesson=False)
        sec_parts.append(h)
        nav_parts.append(nv)

    nav_full = "".join(nav_parts)
    sec_full = "".join(sec_parts)

    OUT_M1.write_text(m1, encoding="utf-8")
    OUT_M2_8.write_text("".join(sec_parts[1:]), encoding="utf-8")
    OUT_NAV.write_text(nav_full, encoding="utf-8")
    OUT_TAG.write_text("                <p>" + esc(sidebar_tagline_paragraph(full)) + "</p>\n", encoding="utf-8")

    splice_temel_kriptografi_page(nav_full, sec_full)

    print("Wrote", OUT_M1, OUT_M1.stat().st_size)
    print("Wrote", OUT_M2_8, OUT_M2_8.stat().st_size)
    print("Wrote", OUT_NAV, OUT_NAV.stat().st_size)
    print("Spliced", MAIN_HTML)


if __name__ == "__main__":
    main()
