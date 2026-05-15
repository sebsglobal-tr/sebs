#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Siber güvenlik modüllerinde ilerlemeyi SebsPremiumModuleLessons.run() ile birleştir."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOD = ROOT / "frontend" / "modules"

ROUTE_CSS = '  <link rel="stylesheet" href="/css/sebs-module-lesson-route.css" />\n'
HERO = """            <div id="lesson-route-hero" class="lesson-route-hero" aria-live="polite" hidden>
                <p class="lesson-route-hero-module"></p>
                <p class="lesson-route-hero-lesson"></p>
                <div class="lesson-route-hero-img-wrap">
                    <img class="lesson-route-hero-img" src="" alt="" loading="lazy" decoding="async" />
                </div>
            </div>
"""

MIGRATIONS: list[tuple[str, str, str, str]] = [
    ("guncel-siber-guvenlige-giris.html", "Siber Güvenliğe Giriş", "module_progress_siber_guvenlik_giris", "/modules/guncel-siber-guvenlige-giris.html"),
    ("temel-network-egitimi.html", "Temel Network Eğitimi", "module_progress_temel_network", "/modules/temel-network-egitimi.html"),
    ("temel-kriptografi.html", "Temel Kriptografi", "module_progress_temel_kriptografi", "/modules/temel-kriptografi.html"),
    ("sosyal-muhendislik.html", "Sosyal Mühendisliğe Giriş (Güncel)", "module_progress_sosyal_muhendislik_giris", "/modules/sosyal-muhendislik.html"),
    ("network-guvenligi.html", "Network Güvenliği", "module_progress_network_guvenligi", "/modules/network-guvenligi.html"),
    ("soc.html", "SOC Eğitimi (Güncel)", "module_progress_soc_egitimi_guncel", "/modules/soc.html"),
]

INIT_TMPL = """    <script src="/js/sebs-premium-module-lessons.js"></script>
    <script>
        window.SebsPremiumModuleLessons.run({{
            moduleName: {module_name!r},
            storageKey: {storage_key!r},
            basePath: {base_path!r}
        }});
    </script>
"""

PROGRESS_SCRIPT = re.compile(
    r"<script>\s*const MODULE_NAME\s*=[\s\S]*?</script>\s*",
    re.MULTILINE,
)

SOSYAL_ROUTE_STYLE = re.compile(
    r"\s*body\.lesson-route-mode \.content-section \{[\s\S]*?\.lesson-route-hero-img \{[\s\S]*?\}\s*",
    re.MULTILINE,
)


def dedupe_route_css(text: str) -> str:
    link = ROUTE_CSS.strip()
    while text.count(link) > 1:
        text = text.replace(link + "\n", "", 1)
    return text


def ensure_route_css(text: str) -> str:
    text = dedupe_route_css(text)
    if "sebs-module-lesson-route.css" in text:
        return text
    needle = '<link rel="stylesheet" href="/css/module-lesson-landing.css" />'
    if needle in text:
        return text.replace(needle, ROUTE_CSS + needle, 1)
    return text


def insert_hero(text: str) -> str:
    if "lesson-route-hero" in text:
        return text
    m = re.search(r"<main[^>]*>", text, re.IGNORECASE)
    if not m:
        return text
    return text[: m.end()] + "\n" + HERO + text[m.end() :]


def replace_progress_script(text: str, module_name: str, storage_key: str, base_path: str) -> tuple[str, bool]:
    if "SebsPremiumModuleLessons.run" in text:
        return text, False
    m = PROGRESS_SCRIPT.search(text)
    if not m:
        return text, False
    init = INIT_TMPL.format(
        module_name=module_name,
        storage_key=storage_key,
        base_path=base_path,
    )
    return text[: m.start()] + init + text[m.end() :], True


def process_file(filename: str, module_name: str, storage_key: str, base_path: str) -> list[str]:
    path = MOD / filename
    text = path.read_text(encoding="utf-8")
    changes: list[str] = []

    if filename == "sosyal-muhendislik.html":
        stripped = SOSYAL_ROUTE_STYLE.sub("\n", text, count=1)
        if stripped != text:
            text = stripped
            changes.append("removed-inline-route-css")

    for step, fn in [
        ("route-css", lambda t: ensure_route_css(t)),
        ("hero", insert_hero),
    ]:
        new = fn(text)
        if new != text:
            text = new
            changes.append(step)

    new, ok = replace_progress_script(text, module_name, storage_key, base_path)
    if ok:
        text = new
        changes.append("progress-script")

    if changes:
        path.write_text(text, encoding="utf-8")
    return changes or ["unchanged"]


def main() -> None:
    for filename, module_name, storage_key, base_path in MIGRATIONS:
        ch = process_file(filename, module_name, storage_key, base_path)
        print(f"{filename}: {', '.join(ch)}")


if __name__ == "__main__":
    main()
