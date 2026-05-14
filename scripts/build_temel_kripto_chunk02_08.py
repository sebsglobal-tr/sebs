#!/usr/bin/env python3
"""
Transcript'teki kullanıcı müfredatından Temel Kriptografi HTML parçalarını üretir:
- frontend/modules/parts/temel-kripto-chunk01.html (Modül 1, active)
- frontend/modules/parts/temel-kripto-chunk02-08.html (Modül 2–8)
- frontend/modules/parts/temel-kripto-nav-ul.html (tam modül başlıklı yan menü <ul>)
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

TRANSCRIPT = Path(
    "/Users/apple/.cursor/projects/Users-apple-Desktop-sebs/agent-transcripts/"
    "c91f4e8e-75b8-4aa8-a44f-01b48b5d355d/c91f4e8e-75b8-4aa8-a44f-01b48b5d355d.jsonl"
)
OUT_M1 = Path("/Users/apple/Desktop/sebs/frontend/modules/parts/temel-kripto-chunk01.html")
OUT_M2_8 = Path("/Users/apple/Desktop/sebs/frontend/modules/parts/temel-kripto-chunk02-08.html")
OUT_NAV = Path("/Users/apple/Desktop/sebs/frontend/modules/parts/temel-kripto-nav-ul.html")

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


def load_curriculum_text() -> str:
    with TRANSCRIPT.open(encoding="utf-8") as f:
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
    # "Düz metin biti   : 1" gibi hizalı etiket satırları
    if re.search(r"\s{2,}:", s) or re.search(r":\s*\d+\s*$", s):
        return False
    # Ortada iki nokta üst üste (cümle içi)
    if ":" in s and not s.endswith(":"):
        return False
    if "=" in s and len(s) < 55:
        return False
    if s.endswith("…"):
        return False
    # Uzun cümle: içeride nokta var ve sonda nokta ile bitmiyor
    inner = s[:-1] if s.endswith(".") else s
    if "." in inner and len(s) > 55:
        return False
    # "Mini örnek:", "Örnek:" gibi alt başlıklar h3 değil
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
            # Uzun iki noktalı satırlar çoğunlukla ara açıklama; bölüm başlığı değil
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
    # Ana bölüm başlığı: nokta yok, makul uzunluk
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


def wrap_h3_lessons(body_html: str, section_id: str) -> tuple[str, int]:
    """Her <h3> bölümünü ayrı ders kartına sarar; ders tamamlama düğmesi ekler."""
    body_html = body_html.strip()
    if not body_html:
        return "", 0
    chunks = re.split(r"(?=<h3>)", body_html, flags=re.IGNORECASE)
    parts: list[str] = []
    idx = 0
    first = chunks[0]
    if first.strip():
        lid = f"{section_id}-l{idx:02d}"
        parts.append(
            f'                    <div class="module-lesson" id="{lid}" data-lesson-title="Giriş">'
        )
        parts.append(first)
        parts.append(
            "                    <div class=\"lesson-step-controls\">\n"
            f'                        <button type="button" class="btn-lesson-complete" '
            f'data-lesson-id="{lid}" data-module-section="{section_id}">\n'
            "                            <i class=\"fas fa-check\"></i> Dersi tamamla\n"
            "                        </button>\n                    </div>\n"
            "                    </div>"
        )
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
        tattr = esc(raw_plain)
        parts.append(
            f'                    <div class="module-lesson" id="{lid}" data-lesson-title="{tattr}">'
        )
        parts.append(ch)
        parts.append(
            "                    <div class=\"lesson-step-controls\">\n"
            f'                        <button type="button" class="btn-lesson-complete" '
            f'data-lesson-id="{lid}" data-module-section="{section_id}">\n'
            "                            <i class=\"fas fa-check\"></i> Dersi tamamla\n"
            "                        </button>\n                    </div>\n"
            "                    </div>"
        )
        idx += 1
    if idx == 0:
        return "", 0
    inner = "\n".join(parts)
    return (
        f'                    <div class="module-lessons">\n{inner}\n                    </div>',
        idx,
    )


def parse_module(n: int, chunk: str, *, active: bool = False) -> str:
    lines = chunk.split("\n")
    if not lines:
        return ""
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

    # section-header: ilk iki paragraf (varsa) + kalan kısa ise hepsi
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

    card_open = '                <div class="content-card docx-content">\n'
    extra_intro = ""
    for p in header_rest:
        extra_intro += f"                    <p>{esc(p)}</p>\n"

    # Kazanımlar
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
    body_wrapped, _ = wrap_h3_lessons(body_html, f"kr-m{n}")

    section_cls = "content-section active" if active else "content-section"
    return f"""            <section class="{section_cls}" id="kr-m{n}">
{header_html}
{card_open}{extra_intro}{objectives_html}{body_wrapped}
                </div>
            </section>

"""


def build_nav_ul(full: str) -> str:
    """Tam modül başlıklarıyla yan menü <ul> içeriği."""
    lis: list[str] = []
    for n in range(1, 9):
        title = slice_module(full, n).split("\n", 1)[0].strip()
        ic = ICON[n]
        active = " active" if n == 1 else ""
        lis.append(
            f'                        <li><a href="#" class="nav-link-section{active}" '
            f'data-section="kr-m{n}"><i class="fas {ic}"></i> {esc(title)}</a></li>'
        )
    return (
        '                    <ul class="nav-list nav-section-list">\n'
        + "\n".join(lis)
        + "\n                    </ul>"
    )


def sidebar_tagline_paragraph(full: str) -> str:
    """Modül 1 girişinin ilk paragrafı — özet slogan yerine müfredat metni."""
    ch = slice_module(full, 1).split("\n")
    i = 1
    while i < len(ch) and not ch[i].strip():
        i += 1
    para = ch[i].strip() if i < len(ch) else ""
    return para


def main() -> None:
    full = load_curriculum_text()
    m1 = parse_module(1, slice_module(full, 1), active=True)
    OUT_M1.write_text(m1, encoding="utf-8")
    chunks = [parse_module(n, slice_module(full, n)) for n in range(2, 9)]
    out28 = "".join(chunks)
    OUT_M2_8.write_text(out28, encoding="utf-8")
    OUT_NAV.write_text(build_nav_ul(full) + "\n", encoding="utf-8")
    OUT_TAG = Path("/Users/apple/Desktop/sebs/frontend/modules/parts/temel-kripto-sidebar-tagline.html")
    OUT_TAG.write_text(
        "                <p>" + esc(sidebar_tagline_paragraph(full)) + "</p>\n",
        encoding="utf-8",
    )
    print("Wrote", OUT_M1, "bytes", OUT_M1.stat().st_size)
    print("Wrote", OUT_M2_8, "bytes", OUT_M2_8.stat().st_size)
    print("Wrote", OUT_NAV, "bytes", OUT_NAV.stat().st_size)
    print("Wrote", OUT_TAG, "bytes", OUT_TAG.stat().st_size)


if __name__ == "__main__":
    main()
