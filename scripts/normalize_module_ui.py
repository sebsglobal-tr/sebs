#!/usr/bin/env python3
"""Normalize premium module HTML: one CSS bundle, dedupe links, fix script paths."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend" / "modules"

SKIP = {
    "ag-guvenligi.html",
    "temel-siber-guvenlik.html",
    "coming-soon.html",
    "web-uygulama-guvenligi.html",
}

STRIP_CSS = (
    "/css/styles.css",
    "/css/modules.css",
    "/css/enhancements.css",
    "/css/saas-landing.css",
    "/css/landing-chrome.css",
    "/css/module-shell-base.css",
    "/css/module-lesson-landing.css",
    "/css/sebs-module-lesson-route.css",
    "/css/module-isletim-standard.css",
    "/css/premium-lesson.css",
)

KEEP_EXTRA_CSS = ("/css/temel-kriptografi-premium.css",)

TAILWIND_BLOCK = """
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
          colors: { ink: '#0c1222', surface: '#f4f6fa' },
        },
      },
    };
  </script>
""".strip()

PREMIUM_CSS_LINE = '    <link rel="stylesheet" href="/css/premium-lesson.css" />'


def strip_stylesheets(text: str) -> str:
    lines = []
    for line in text.splitlines():
        if '<link rel="stylesheet"' in line:
            if any(s in line for s in STRIP_CSS):
                continue
            if any(k in line for k in KEEP_EXTRA_CSS):
                lines.append(line)
                continue
            if "/css/" in line and "font-awesome" not in line and "fonts.googleapis" not in line:
                continue
        lines.append(line)
    return "\n".join(lines)


def ensure_premium_bundle(text: str) -> str:
    if 'href="/css/premium-lesson.css"' in text:
        return text
    fa = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">'
    if fa in text:
        return text.replace(fa, fa + "\n" + PREMIUM_CSS_LINE, 1)
    if "</head>" in text:
        return text.replace("</head>", PREMIUM_CSS_LINE + "\n</head>", 1)
    return PREMIUM_CSS_LINE + "\n" + text


def ensure_tailwind(text: str) -> str:
    if "cdn.tailwindcss.com" in text:
        return text
    if "</head>" in text:
        return text.replace("</head>", TAILWIND_BLOCK + "\n</head>", 1)
    return text


def fix_script_paths(text: str) -> str:
    text = text.replace('src="../utils/', 'src="/utils/')
    text = text.replace('src="../js/navigation.js"', 'src="/js/navigation.js?v=3.6"')
    text = text.replace("src=\"../js/navigation.js\">", 'src="/js/navigation.js?v=3.6">')
    text = text.replace('src="/modules/module-access-check.js"', 'src="/modules/module-access-check.js"')
    return text


def normalize_body_class(text: str) -> str:
    if "landing-site-body" in text:
        return text
    return re.sub(
        r"<body([^>]*)>",
        r'<body\1 class="landing-site-body font-sans text-slate-800 antialiased bg-white">',
        text,
        count=1,
    )


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    text = strip_stylesheets(text)
    text = ensure_premium_bundle(text)
    text = ensure_tailwind(text)
    text = fix_script_paths(text)
    text = normalize_body_class(text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.glob("*.html")):
        if path.name in SKIP:
            continue
        if process_file(path):
            changed.append(path.name)
    print(f"Normalized {len(changed)} module(s):")
    for name in changed:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
