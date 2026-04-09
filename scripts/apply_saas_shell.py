#!/usr/bin/env python3
"""Inject SaaS nav/footer partials and saas-shell.css across frontend HTML (one-time batch)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
PARTIALS = FRONTEND / "partials"

SKIP_NAMES = {
    "index.html",  # Tailwind marketing home — no legacy navbar
    "landing-saas.html",
}
SKIP_PREFIXES = ("presentations/",)


def read_partial(name: str) -> str:
    return (PARTIALS / name).read_text(encoding="utf-8")


def inject_css_link(html: str) -> str:
    if "saas-shell.css" in html:
        return html
    needle = '<link rel="stylesheet" href="/css/remote-inspired.css">'
    insert = needle + "\n    <link rel=\"stylesheet\" href=\"/css/saas-shell.css\">"
    if needle in html:
        return html.replace(needle, insert, 1)
    needle2 = '<link rel="stylesheet" href="/css/styles.css">'
    if needle2 in html:
        return html.replace(
            needle2,
            needle2 + "\n    <link rel=\"stylesheet\" href=\"/css/saas-shell.css\">",
            1,
        )
    return html


def replace_nav(html: str, nav: str) -> tuple[str, bool]:
    pat = re.compile(r"<nav\s+class=\"navbar\"[^>]*>.*?</nav>", re.DOTALL | re.IGNORECASE)
    m = pat.search(html)
    if not m:
        return html, False
    return pat.sub(nav.strip(), html, count=1), True


def replace_footer(html: str, footer: str) -> tuple[str, bool]:
    pat = re.compile(r"<footer\s+class=\"footer\"[^>]*>.*?</footer>", re.DOTALL | re.IGNORECASE)
    m = pat.search(html)
    if not m:
        return html, False
    return pat.sub(footer.strip(), html, count=1), True


def pricing_nav_container(html: str, nav: str) -> tuple[str, bool]:
    needle = '<div id="navigation-container"></div>'
    if needle not in html:
        return html, False
    return html.replace(needle, nav.strip(), 1), True


def append_footer_if_missing(html: str, footer: str) -> tuple[str, bool]:
    if re.search(r"<footer\b", html, re.IGNORECASE):
        return html, False
    # Insert before last closing body — prefer before Supabase block
    anchor = "<!-- 1. Supabase UMD SDK"
    if anchor in html:
        return html.replace(anchor, footer.strip() + "\n\n    " + anchor, 1), True
    # Fallback: before </body>
    if "</body>" in html:
        return html.replace("</body>", footer.strip() + "\n</body>", 1), True
    return html, False


def main() -> int:
    nav = read_partial("saas-nav.html")
    footer = read_partial("saas-footer.html")
    updated = 0
    for path in sorted(FRONTEND.rglob("*.html")):
        rel = path.relative_to(FRONTEND).as_posix()
        if rel in SKIP_NAMES or rel.startswith(SKIP_PREFIXES):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue

        orig = text
        text = inject_css_link(text)

        did = False
        text, n1 = replace_nav(text, nav)
        did = did or n1
        text, n2 = replace_footer(text, footer)
        did = did or n2
        text, n3 = pricing_nav_container(text, nav)
        did = did or n3
        text, n4 = append_footer_if_missing(text, footer)
        did = did or n4

        if text != orig:
            path.write_text(text, encoding="utf-8")
            updated += 1
            print("OK", rel)

    print("Updated files:", updated)
    return 0


if __name__ == "__main__":
    sys.exit(main())
