#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Normalize education module HTML: shared CSS, single landing chrome stack, canonical header."""
from __future__ import annotations

import difflib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOD_DIR = ROOT / "frontend" / "modules"
SHELL_CSS = ROOT / "frontend" / "css" / "module-shell-base.css"
CANONICAL_HEADER = (MOD_DIR / "parts" / "module-chrome-header.html").read_text(encoding="utf-8").strip()

HEAD_LANDING = """
  <script src="https://cdn.tailwindcss.com"></script>
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
  <link rel="stylesheet" href="/css/landing-chrome.css?v=5" />
"""

ROUTE_CSS = '  <link rel="stylesheet" href="/css/sebs-module-lesson-route.css" />\n'
SHELL_LINK = '    <link rel="stylesheet" href="/css/module-shell-base.css" />\n'

SKIP = {
    "temel-network-content.generated.html",
}

SHELL_REFERENCE = SHELL_CSS.read_text(encoding="utf-8") if SHELL_CSS.exists() else ""


def uses_lesson_route(text: str) -> bool:
    return "lesson-route-mode" in text or "lessonRoute" in text or "lesson-route-hero" in text


def extract_first_style(text: str) -> tuple[int, int, str] | None:
    m = re.search(r"<style(?![^>]*crimson)[^>]*>", text)
    if not m:
        return None
    start = m.start()
    end = text.find("</style>", m.end())
    if end < 0:
        return None
    return start, end + len("</style>"), text[m.end() : end]


def should_externalize_style(inner: str) -> bool:
    if len(inner) < 40_000:
        return False
    if not SHELL_REFERENCE:
        return False
    ref = SHELL_REFERENCE.split("\n", 1)[-1].strip()
    ratio = difflib.SequenceMatcher(None, inner.strip(), ref).ratio()
    return ratio >= 0.95


def remove_duplicate_landing_stacks(text: str) -> str:
    """Remove extra tailwind+landing stacks; keep the last occurrence before </head>."""
    tailwind_pat = re.compile(
        r"<script src=\"https://cdn\.tailwindcss\.com\"></script>\s*"
        r"<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\};\s*</script>\s*"
        r"<link rel=\"stylesheet\" href=\"/css/saas-landing\.css\"[^>]*/>\s*"
        r"<link rel=\"stylesheet\" href=\"/css/landing-chrome\.css[^>]*/>\s*"
        r"(?:<link rel=\"stylesheet\" href=\"/css/sebs-module-lesson-route\.css\"[^>]*/>\s*)?"
        r"<link rel=\"stylesheet\" href=\"/css/module-lesson-landing\.css\"[^>]*/>\s*",
        re.MULTILINE,
    )
    head_end = text.lower().find("</head>")
    if head_end < 0:
        return text
    head = text[:head_end]
    body = text[head_end:]
    matches = list(tailwind_pat.finditer(head))
    if len(matches) <= 1:
        return text
    # Drop all but the last stack in <head> only (never touch HTML comments body)
    last = matches[-1]
    new_head = head
    for m in reversed(matches[:-1]):
        new_head = new_head[: m.start()] + new_head[m.end() :]
    return new_head + body


def ensure_premium_lesson(text: str) -> str:
    if "premium-lesson.css" in text:
        return text
    anchor = 'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">'
    if anchor not in text:
        return text
    insert = anchor + '\n    <link rel="stylesheet" href="/css/premium-lesson.css">'
    return text.replace(anchor, insert, 1)


def ensure_shell_link(text: str) -> str:
    if "module-shell-base.css" in text:
        return text
    if "premium-lesson.css" in text:
        return text.replace(
            '<link rel="stylesheet" href="/css/premium-lesson.css">',
            '<link rel="stylesheet" href="/css/premium-lesson.css">\n' + SHELL_LINK.strip(),
            1,
        )
    return text


def inject_landing_before_head_close(text: str) -> str:
    route = ROUTE_CSS if uses_lesson_route(text) else ""
    block = (
        HEAD_LANDING
        + route
        + '  <link rel="stylesheet" href="/css/module-lesson-landing.css" />\n'
    )
    if "module-lesson-landing.css" in text and "landing-chrome.css?v=5" in text:
        # already has canonical stack somewhere; ensure route css only
        if route and "sebs-module-lesson-route.css" not in text:
            text = text.replace(
                '<link rel="stylesheet" href="/css/module-lesson-landing.css" />',
                route + '  <link rel="stylesheet" href="/css/module-lesson-landing.css" />',
                1,
            )
        return text
    return text.replace("</head>", block + "\n</head>", 1)


def normalize_header(text: str) -> str:
    if "module-layout" not in text:
        return text
    m = re.search(r"<header class=\"fixed inset-x-0.*?</header>", text, re.DOTALL)
    if not m:
        return text
    chunk = m.group(0)
    if "sebs-navbar-mark.png" in chunk and "landing-brand-wordmark" in chunk:
        return text
    return text[: m.start()] + CANONICAL_HEADER + text[m.end() :]


def strip_redundant_inline_after_shell(text: str) -> str:
    if "module-shell-base.css" not in text:
        return text
    info = extract_first_style(text)
    if not info:
        return text
    start, end, inner = info
    if len(inner) < 40_000 or not should_externalize_style(inner):
        return text
    return text[:start] + text[end:]


def normalize_body_class(text: str) -> str:
    text = text.replace(" module-page--temel-kriptografi", "")
    text = re.sub(
        r'(<body class="landing-site-body[^"]*)"',
        lambda m: m.group(1) + '"',
        text,
        count=1,
    )
    return text


def process_file(path: Path) -> list[str]:
    changes: list[str] = []
    text = path.read_text(encoding="utf-8")
    original = text

    text = re.sub(
        r"\s*<style id=\"crimson-theme-override\">[\s\S]*?</style>\s*",
        "\n",
        text,
    )

    style_info = extract_first_style(text)
    if style_info:
        start, end, inner = style_info
        if should_externalize_style(inner):
            replacement = (
                '    <link rel="stylesheet" href="/css/premium-lesson.css">\n'
                if "premium-lesson.css" not in text[:start]
                else ""
            )
            if "module-shell-base.css" not in text:
                replacement = (
                    '    <link rel="stylesheet" href="/css/module-shell-base.css" />\n'
                )
            text = text[:start] + replacement + text[end:]
            changes.append("externalize-style")

    text = remove_duplicate_landing_stacks(text)
    text = ensure_premium_lesson(text)
    text = ensure_shell_link(text)
    text = inject_landing_before_head_close(text)
    text = normalize_header(text)
    text = normalize_body_class(text)
    text = strip_redundant_inline_after_shell(text)

    if text != original:
        path.write_text(text, encoding="utf-8")
    return changes


def main() -> None:
    if not CANONICAL_HEADER:
        raise SystemExit("Missing parts/module-chrome-header.html — run extract first")

    touched = []
    for path in sorted(MOD_DIR.glob("*.html")):
        if path.name in SKIP:
            continue
        changes = process_file(path)
        if changes:
            touched.append(f"{path.name}: {', '.join(changes)}")

    print(f"Updated {len(touched)} files")
    for line in touched:
        print(" ", line)


if __name__ == "__main__":
    main()
