#!/usr/bin/env python3
"""
Replace legacy saas-shell navbar/footer with index.html–style landing header/footer
and inject Tailwind + saas-landing.css + landing-chrome.css across frontend HTML.
Skips: index.html, landing-saas.html, partials/, node_modules/, *.generated.html
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
PARTIALS = FRONTEND / "partials"

SKIP_NAMES = frozenset(
    {
        "index.html",
        "landing-saas.html",
        "temel-network-content.generated.html",
    }
)
SKIP_DIR_NAMES = frozenset({"partials", "node_modules"})

TAILWIND_BLOCK = """  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
          colors: {
            ink: '#0c1222',
            surface: '#f4f6fa',
          },
          boxShadow: {
            'card': '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
            'card-hover': '0 20px 40px -12px rgb(15 23 42 / 0.12), 0 8px 16px -8px rgb(15 23 42 / 0.08)',
            'glow': '0 0 0 1px rgb(15 23 42 / 0.06)',
          },
        },
      },
    };
  </script>
  <link rel="stylesheet" href="/css/saas-landing.css" />
  <link rel="stylesheet" href="/css/landing-chrome.css" />
"""

LANDING_FOOTER_SCRIPT = """
  <script>
    (function () {
      document.querySelectorAll('.landing-footer-year').forEach(function (el) {
        el.textContent = String(new Date().getFullYear());
      });
    })();
  </script>
"""

NAV_RE = re.compile(
    r"(?:<!--\s*Navigation[^>]*-->\s*)?<nav\s+class=\"navbar[^\"]*\"[^>]*>.*?</nav>",
    re.DOTALL | re.IGNORECASE,
)

FOOTER_RE = re.compile(
    r"(?:<!--\s*Footer[^>]*-->\s*)?<footer\s+class=\"footer saas-shell-footer\"[^>]*>.*?</footer>",
    re.DOTALL | re.IGNORECASE,
)

REMOTE_RE = re.compile(
    r"\s*<link[^>]+href=[\"']/css/remote-inspired\\.css[\"'][^>]*>\s*",
    re.IGNORECASE,
)
SAAS_SHELL_RE = re.compile(
    r"\s*<link[^>]+href=[\"']/css/saas-shell\\.css[\"'][^>]*>\s*",
    re.IGNORECASE,
)
SAAS_SHELL_JS_RE = re.compile(
    r"\s*<script[^>]+src=[\"'][^\"']*saas-shell\\.js[\"'][^>]*>\s*</script>\s*",
    re.IGNORECASE,
)


def read_partial(name: str) -> str:
    return (PARTIALS / name).read_text(encoding="utf-8")


def ensure_tailwind_head(html: str) -> str:
    if "cdn.tailwindcss.com" in html:
        if "/css/landing-chrome.css" not in html and "/css/saas-landing.css" in html:
            html = html.replace(
                '<link rel="stylesheet" href="/css/saas-landing.css" />',
                '<link rel="stylesheet" href="/css/saas-landing.css" />\n  <link rel="stylesheet" href="/css/landing-chrome.css" />',
                1,
            )
        return html
    if "</head>" not in html:
        return html
    return html.replace("</head>", TAILWIND_BLOCK + "\n</head>", 1)


def patch_html_tag(html: str) -> str:
    m = re.search(r"<html\s[^>]*>", html, flags=re.IGNORECASE)
    if not m:
        return html
    tag = m.group(0)
    if "scroll-smooth" in tag:
        return html
    if tag.rstrip().endswith(">"):
        new_tag = tag[:-1] + ' class="scroll-smooth">'
        return html.replace(tag, new_tag, 1)
    return html


def patch_body_tag(html: str) -> str:
    m = re.search(r"<body([^>]*)>", html)
    if not m:
        return html
    inner = m.group(1) or ""
    if "landing-site-body" in inner:
        return html
    extra = "landing-site-body font-sans text-slate-800 antialiased bg-white"
    if re.search(r"class\s*=", inner):

        def add_class(mm: re.Match) -> str:
            return f'class="{mm.group(1).strip()} {extra}"'

        new_inner = re.sub(r'class="([^"]*)"', add_class, inner, count=1)
    else:
        new_inner = f' class="{extra}"{inner}'
    return html.replace(f"<body{inner}>", f"<body{new_inner}>", 1)


def insert_header_after_body(html: str, header: str) -> str:
    if "fixed inset-x-0 top-0 z-50 border-b border-slate-200/80" in html:
        return html
    return re.sub(
        r"(<body[^>]*>)",
        r"\1\n" + header.strip() + "\n",
        html,
        count=1,
        flags=re.IGNORECASE,
    )


def process_file(path: Path, header: str, footer_html: str) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text

    had_saas_footer = bool(FOOTER_RE.search(text))

    text = NAV_RE.sub("", text)
    footer_block = footer_html.strip() + "\n" + LANDING_FOOTER_SCRIPT.strip()
    text = FOOTER_RE.sub(footer_block, text)

    if not had_saas_footer and "landing-footer-year" not in text:
        # Fallback: no old footer (already migrated?) — append before </body>
        if "</body>" in text and "border-t border-slate-200 bg-white py-14" not in text:
            text = text.replace("</body>", footer_block + "\n</body>", 1)

    text = REMOTE_RE.sub("\n", text)
    text = SAAS_SHELL_RE.sub("\n", text)
    text = SAAS_SHELL_JS_RE.sub("\n", text)
    # Plain fallbacks (regex can miss whitespace variants)
    for line in (
        '<link rel="stylesheet" href="/css/remote-inspired.css">',
        '<link rel="stylesheet" href="/css/saas-shell.css">',
    ):
        text = text.replace(line, "")

    text = ensure_tailwind_head(text)
    text = patch_html_tag(text)
    text = patch_body_tag(text)
    text = insert_header_after_body(text, header)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    header = read_partial("landing-header.html")
    footer = read_partial("landing-footer.html")
    updated = 0
    for path in sorted(FRONTEND.rglob("*.html")):
        rel = path.relative_to(FRONTEND)
        if rel.name in SKIP_NAMES:
            continue
        if any(p in SKIP_DIR_NAMES for p in rel.parts):
            continue
        try:
            if process_file(path, header, footer):
                updated += 1
                print("OK", rel.as_posix())
        except OSError as e:
            print("ERR", rel, e, file=sys.stderr)
    print("Updated:", updated)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
