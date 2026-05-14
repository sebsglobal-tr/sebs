#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble frontend/modules/web-uygulama-guvenligi.html from network template + HTML fragments.

İçerik parçalarını yeniden üretmek için (önce parçalar, sonra birleştirme):
  python3 scripts/export_wag_mufredat_html.py   # transcript → tam müfredat + wag-nav-titles.json
  python3 scripts/wag_expanded_generator.py
  python3 scripts/wag_expanded_generator_b.py
  python3 scripts/build_web_uygulama_guvenligi_module.py
"""
from __future__ import annotations

import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
MOD_DIR = ROOT / "frontend" / "modules"
NET = MOD_DIR / "network-guvenligi.html"
OUT = MOD_DIR / "web-uygulama-guvenligi.html"
NAV_JSON = MOD_DIR / "parts" / "wag-nav-titles.json"
PARTS = [
    MOD_DIR / "parts" / "web-uygulama-guvenligi-0-5.html",
    MOD_DIR / "parts" / "web-uygulama-guvenligi-6-12.html",
    MOD_DIR / "parts" / "web-uygulama-guvenligi-mufredat-tam.html",
]


def render_sidebar_nav() -> str:
    if not NAV_JSON.exists():
        raise SystemExit(f"Missing {NAV_JSON}; run scripts/export_wag_mufredat_html.py")
    rows = json.loads(NAV_JSON.read_text(encoding="utf-8"))
    lis: list[str] = []
    for i, row in enumerate(rows):
        label = html.escape(row["label"])
        sid = html.escape(row["section"])
        active = " active" if i == 0 else ""
        lis.append(
            f'                        <li><a href="#" class="nav-link-section{active}" data-section="{sid}">'
            f'<i class="fas fa-book"></i> {label}</a></li>'
        )
    return "\n".join(lis)


def main() -> None:
    net_lines = NET.read_text(encoding="utf-8").splitlines(keepends=True)
    head = "".join(net_lines[:3861])
    head = head.replace(
        "<title>Network Güvenliği | SEBS Academy</title>",
        "<title>Web Uygulama Güvenliği | SEBS Academy</title>",
    )
    head = re.sub(
        r'<meta name="description" content="[^"]*"',
        '<meta name="description" content="Web uygulamasını savunma ve güvenli geliştirme bakış açısıyla okuma; kimlik, oturum, yetkilendirme, veri işleme, API, log analizi ve kanıt temelli raporlama."',
        head,
        count=1,
    )
    if 'rel="canonical"' not in head:
        head = head.replace(
            '<meta name="theme-color"',
            '<link rel="canonical" href="https://sebsglobal.com/egitimler/web-uygulama-guvenligi" />\n    <meta name="theme-color"',
            1,
        )
    head = head.replace(
        '"name":"Network Guvenligi Egitimi"',
        '"name":"Web Uygulama Guvenligi Egitimi"',
    )
    head = head.replace(
        "Network güvenliği prensipleri, segmentasyon, izleme ve savunma yaklaşımları.",
        "Web uygulaması güvenliği: mimari okuma, HTTP/oturum modeli, yetkilendirme, güvenli veri işleme, API ve raporlama.",
    )
    head = re.sub(
        r'"description":"Ag guvenligi prensipleri[^"]*"',
        '"description":"Web uygulamasi guvenligi: mimari, kimlik ve oturum, yetkilendirme, API, guvenli konfigurasyon, log analizi ve kanit temelli raporlama."',
        head,
        count=1,
    )
    head = head.replace(
        '"name":"Network Guvenligi","item":"https://sebsglobal.com/modules/network-guvenligi.html"',
        '"name":"Web Uygulama Guvenligi","item":"https://sebsglobal.com/egitimler/web-uygulama-guvenligi"',
    )

    # </head> sonrası: </script> + linkler + header + mobil menü toggle'a kadar (kapanmamış <details> bırakma)
    # Önceki [3861:3910] dilimi "Bize ulaşın" satırında kesildiği için module-layout header içine kaçıyordu.
    body_prefix = "".join(net_lines[3861:3918])

    sidebar = f"""    <div class="module-layout">
        <aside class="module-sidebar">
            <div class="sidebar-header">
                <h1>WEB UYGULAMA GÜVENLİĞİ</h1>
                <p>Orta seviye · Savunma ve kanıt temelli analiz</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">0% Tamamlandı</div>
                </div>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <h4 class="nav-module-header">İçindekiler</h4>
                    <ul class="nav-list nav-section-list">
{render_sidebar_nav()}
                    </ul>
                </div>
            </nav>
        </aside>

        <main style="margin-left: 320px; width: calc(100% - 320px); max-width: calc(100vw - 320px); overflow-x: hidden; overflow-y: visible; box-sizing: border-box; position: relative;">
"""

    main_parts: list[str] = []
    for p in PARTS:
        if not p.exists():
            raise SystemExit(f"Missing fragment: {p}")
        main_parts.append(p.read_text(encoding="utf-8"))

    main_close = """
        </main>
    </div>
"""

    tail_start = None
    for i, line in enumerate(net_lines):
        if line.strip() == "<script>" and i + 1 < len(net_lines):
            if "const MODULE_NAME" in net_lines[i + 1]:
                tail_start = i
                break
    if tail_start is None:
        raise SystemExit("Could not find script block in network-guvenligi.html")

    tail = "".join(net_lines[tail_start:])
    tail = tail.replace("const MODULE_NAME = 'Network Güvenliği';", "const MODULE_NAME = 'Web Uygulama Güvenliği';")
    tail = tail.replace(
        "const STORAGE_KEY = 'module_progress_network_guvenligi';",
        "const STORAGE_KEY = 'module_progress_web_uygulama_guvenligi';",
    )
    # Network-only DOM enhancements (safe no-ops if sections missing)
    tail = tail.replace(
        "const section = document.getElementById('modul-1-guvenlik-temelleri-risk-saldr-yuzeyi-mimari');",
        "const section = document.getElementById('wag-l01');",
    )
    tail = tail.replace(
        "if (!section || section.id !== 'modul-0-etik-ve-yasal-cerceve') return;",
        "if (!section || section.id !== 'wag-l00') return;",
    )

    OUT.write_text(
        head + body_prefix + sidebar + "".join(main_parts) + main_close + tail,
        encoding="utf-8",
    )
    print("Wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
