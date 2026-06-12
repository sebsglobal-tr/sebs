#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Split WAG HTML fragments into one content-section per lesson (wag-l00..wag-l22).

Tek seferlik dönüşüm: parçalar zaten wag-l* ise yeniden çalıştırmayın (regex eşleşmez).

Run from repo root:
  python3 scripts/reflow_wag_lesson_sections.py
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P05 = ROOT / "frontend/modules/parts/web-uygulama-guvenligi-0-5.html"
P612 = ROOT / "frontend/modules/parts/web-uygulama-guvenligi-6-12.html"
PMUF = ROOT / "frontend/modules/parts/web-uygulama-guvenligi-mufredat-tam.html"


def split_mimari(html: str) -> str:
    pat = re.compile(
        r'<section class="content-section docx-content" id="wag-m1-mimari" data-section="wag-m1-mimari">\s*'
        r'(<div class="section-inner module-2-enhanced">)'
        r"(.*?)"
        r"<h2>Modül 5 — Web Mimarisi, Saldırı Yüzeyi ve Güvenli Tasarım</h2>"
        r"(.*?)"
        r"</div>\s*</section>",
        re.DOTALL,
    )
    m = pat.search(html)
    if not m:
        raise SystemExit("split_mimari: pattern not found")
    div_open, before_h2, after_h2 = m.group(1), m.group(2).strip(), m.group(3).strip()
    sec1 = (
        '<section class="content-section docx-content" id="wag-l01" data-section="wag-l01">\n'
        f"{div_open}\n{before_h2}\n</div>\n</section>"
    )
    sec2 = (
        '<section class="content-section docx-content" id="wag-l05" data-section="wag-l05">\n'
        f"{div_open}\n"
        "<h1>Modül 5 — Web Mimarisi, Saldırı Yüzeyi ve Güvenli Tasarım</h1>\n"
        f"{after_h2}\n</div>\n</section>"
    )
    return html[: m.start()] + sec1 + "\n" + sec2 + html[m.end() :]


def split_auth(html: str) -> str:
    pat = re.compile(
        r'<section class="content-section docx-content" id="wag-m3-auth" data-section="wag-m3-auth">\s*'
        r'(<div class="section-inner module-2-enhanced">)'
        r"(.*?)"
        r"<h2>Oturum yaşam döngüsü: fixation ve yenileme</h2>"
        r"(.*?)"
        r"</div>\s*</section>",
        re.DOTALL,
    )
    m = pat.search(html)
    if not m:
        raise SystemExit("split_auth: pattern not found")
    div_open, before_h2, after_h2 = m.group(1), m.group(2).strip(), m.group(3).strip()
    sec1 = (
        '<section class="content-section docx-content" id="wag-l06" data-section="wag-l06">\n'
        f"{div_open}\n{before_h2}\n</div>\n</section>"
    )
    sec2 = (
        '<section class="content-section docx-content" id="wag-l07" data-section="wag-l07">\n'
        f"{div_open}\n"
        "<h1>Modül 7 — Oturum Yönetimi ve CSRF Güvenliği</h1>\n"
        "<h2>Oturum yaşam döngüsü: fixation ve yenileme</h2>\n"
        f"{after_h2}\n</div>\n</section>"
    )
    return html[: m.start()] + sec1 + "\n" + sec2 + html[m.end() :]


def split_m6(html: str) -> str:
    pat = re.compile(
        r'<section class="content-section docx-content" id="wag-m6-zafiyet" data-section="wag-m6-zafiyet">\s*'
        r'(<div class="section-inner module-2-enhanced">)'
        r"(.*?)"
        r'<h2>SSRF: sunucuyu.{1,4}proxy silahına.{1,4}çevirme</h2>'
        r"(.*?)"
        r"<h2>Yanlış yapılandırma: saldırganın hızlı kazanım alanı</h2>"
        r"(.*?)"
        r"</div>\s*</section>",
        re.DOTALL,
    )
    m = pat.search(html)
    if not m:
        raise SystemExit("split_m6: pattern not found")
    div_open, a, b, c = m.group(1), m.group(2).strip(), m.group(3).strip(), m.group(4).strip()
    s1 = (
        '<section class="content-section docx-content" id="wag-l11" data-section="wag-l11">\n'
        f"{div_open}\n{a}\n</div>\n</section>"
    )
    s2 = (
        '<section class="content-section docx-content" id="wag-l12" data-section="wag-l12">\n'
        f"{div_open}\n"
        "<h1>Modül 12 — Open Redirect, Dosya İşleme, Path Traversal ve İçerik Güvenliği</h1>\n"
        '<h2>SSRF: sunucuyu “proxy silahına” çevirme</h2>\n'
        f"{b}\n</div>\n</section>"
    )
    s3 = (
        '<section class="content-section docx-content" id="wag-l13" data-section="wag-l13">\n'
        f"{div_open}\n"
        "<h1>Modül 13 — SSRF, Deserialization ve HTTP Request Smuggling</h1>\n"
        "<h2>Yanlış yapılandırma: saldırganın hızlı kazanım alanı</h2>\n"
        f"{c}\n</div>\n</section>"
    )
    return html[: m.start()] + s1 + "\n" + s2 + "\n" + s3 + html[m.end() :]


def swap_sdlc_before_log(html: str) -> str:
    """Place wag-m10-sdlc block immediately before wag-m9-log (curriculum 18 then 19)."""
    pat_log = re.compile(
        r'<section class="content-section docx-content" id="wag-m9-log"[^>]*>.*?</section>\s*',
        re.DOTALL,
    )
    pat_sdlc = re.compile(
        r'<section class="content-section docx-content" id="wag-m10-sdlc"[^>]*>.*?</section>\s*',
        re.DOTALL,
    )
    m_log = pat_log.search(html)
    m_sdlc = pat_sdlc.search(html)
    if not m_log or not m_sdlc:
        raise SystemExit("swap_sdlc_before_log: blocks not found")
    if m_sdlc.start() < m_log.start():
        return html
    log_block = m_log.group(0)
    sdlc_block = m_sdlc.group(0)
    lo, hi = sorted([m_log.span(), m_sdlc.span()])
    return html[: lo[0]] + sdlc_block + log_block + html[hi[1] :]


def main() -> None:
    t05 = P05.read_text(encoding="utf-8")

    m5b_pat = re.compile(
        r'<section class="content-section docx-content" id="wag-m5b-veri-koruma"[^>]*>.*?</section>\s*',
        re.DOTALL,
    )
    m5b_m = m5b_pat.search(t05)
    if not m5b_m:
        raise SystemExit("m5b not found")
    m5b_block = m5b_m.group(0)
    m5b_block = m5b_block.replace("wag-m5b-veri-koruma", "wag-l16", 2)
    t05 = t05[: m5b_m.start()] + t05[m5b_m.end() :]

    t05 = t05.replace(
        '<section class="content-section docx-content active" id="wag-m0-etik" data-section="wag-m0-etik">',
        '<section class="content-section docx-content active" id="wag-l00" data-section="wag-l00">',
        1,
    )
    t05 = split_mimari(t05)
    t05 = (
        t05.replace('id="wag-m1b-teknoloji" data-section="wag-m1b-teknoloji"', 'id="wag-l02" data-section="wag-l02"', 1)
        .replace('id="wag-m1c-owasp" data-section="wag-m1c-owasp"', 'id="wag-l03" data-section="wag-l03"', 1)
        .replace('id="wag-m2-http" data-section="wag-m2-http"', 'id="wag-l04" data-section="wag-l04"', 1)
    )
    t05 = split_auth(t05)
    t05 = (
        t05.replace('id="wag-m3b-oauth-jwt" data-section="wag-m3b-oauth-jwt"', 'id="wag-l08" data-section="wag-l08"', 1)
        .replace('id="wag-m4-authz" data-section="wag-m4-authz"', 'id="wag-l09" data-section="wag-l09"', 1)
        .replace('id="wag-m5-veri" data-section="wag-m5-veri"', 'id="wag-l10" data-section="wag-l10"', 1)
    )

    P05.write_text(t05, encoding="utf-8")

    t612 = P612.read_text(encoding="utf-8")
    t612 = split_m6(t612)
    t612 = (
        t612.replace('id="wag-m6b-is-mantigi" data-section="wag-m6b-is-mantigi"', 'id="wag-l14" data-section="wag-l14"', 1)
        .replace('id="wag-m7-api" data-section="wag-m7-api"', 'id="wag-l15" data-section="wag-l15"', 1)
    )

    m15 = re.search(
        r'<section class="content-section docx-content" id="wag-l15"[^>]*>.*?</section>\s*',
        t612,
        re.DOTALL,
    )
    if not m15:
        raise SystemExit("wag-l15 not found for m5b insert")
    t612 = t612[: m15.end()] + m5b_block + t612[m15.end() :]

    t612 = t612.replace(
        'id="wag-m8-headers" data-section="wag-m8-headers"',
        'id="wag-l17" data-section="wag-l17"',
        1,
    )
    t612 = swap_sdlc_before_log(t612)
    t612 = (
        t612.replace('id="wag-m10-sdlc" data-section="wag-m10-sdlc"', 'id="wag-l18" data-section="wag-l18"', 1)
        .replace('id="wag-m9-log" data-section="wag-m9-log"', 'id="wag-l19" data-section="wag-l19"', 1)
        .replace('id="wag-m11-rapor" data-section="wag-m11-rapor"', 'id="wag-l20" data-section="wag-l20"', 1)
        .replace('id="wag-m12-sozluk" data-section="wag-m12-sozluk"', 'id="wag-l21" data-section="wag-l21"', 1)
    )

    P612.write_text(t612, encoding="utf-8")

    tm = PMUF.read_text(encoding="utf-8")
    tm = tm.replace(
        '<section class="content-section docx-content" id="wag-m13-mufredat-tam" data-section="wag-m13-mufredat-tam">',
        '<section class="content-section docx-content" id="wag-l22" data-section="wag-l22">',
        1,
    )
    PMUF.write_text(tm, encoding="utf-8")

    print("Updated", P05, P612, PMUF)


if __name__ == "__main__":
    main()
