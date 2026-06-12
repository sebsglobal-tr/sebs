#!/usr/bin/env python3
"""Modül test bölümlerini denetle: quiz-exam.js ve işlenebilir format."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

SPLIT_Q = re.compile(
    r"<ol>\s*<li>[^<]+</li>\s*</ol>\s*"
    r"(?:<p>[A-E]\)[^<]+</p>\s*){4,5}\s*"
    r"<ul>\s*<li>Doğru:\s*[A-E]</li>",
    re.IGNORECASE | re.DOTALL,
)
BR_QUIZ_P = re.compile(
    r"<p><strong>\d+\)[^<]+</strong><br\s*/?>\s*[A-E]\)[^<]+<strong>Doğru",
    re.IGNORECASE | re.DOTALL,
)
H3_QUIZ = re.compile(
    r"<h3[^>]*><strong>\d+\)[^<]+</strong></h3>\s*<p>[A-E]\)",
    re.IGNORECASE | re.DOTALL,
)
OL_BR_QUIZ = re.compile(
    r"<ol[^>]*>\s*<li><p>[^<]+<br\s*/?>\s*A\)[^<]+<strong>Doğru",
    re.IGNORECASE | re.DOTALL,
)


def audit(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    has_quiz_js = "quiz-exam.js" in text
    sections = re.findall(
        r'class="[^"]*eval-quiz-section[^"]*"[^>]*id="([^"]+)"',
        text,
        re.IGNORECASE,
    )
    split_count = len(SPLIT_Q.findall(text))
    br_p = len(BR_QUIZ_P.findall(text))
    h3 = len(H3_QUIZ.findall(text))
    ol_br = len(OL_BR_QUIZ.findall(text))
    visible_answers = len(re.findall(r"<li>Doğru:\s*[A-E]</li>", text, re.I))
    return {
        "file": path.name,
        "quiz_js": has_quiz_js,
        "eval_sections": len(sections),
        "split_blocks": split_count,
        "br_p_questions": br_p,
        "h3_questions": h3,
        "ol_br_questions": ol_br,
        "visible_doğru_li": visible_answers,
    }


def main() -> None:
    rows = []
    for p in sorted(MODULES.glob("*.html")):
        if p.name == "coming-soon.html":
            continue
        r = audit(p)
        if r["eval_sections"] or r["visible_doğru_li"] > 5:
            rows.append(r)
    print(f"{'module':<35} js  sections split br_p h3  ol_br")
    for r in rows:
        print(
            f"{r['file']:<35} "
            f"{'Y' if r['quiz_js'] else 'N':>2}  "
            f"{r['eval_sections']:>8} "
            f"{r['split_blocks']:>5} "
            f"{r['br_p_questions']:>4} "
            f"{r['h3_questions']:>3} "
            f"{r['ol_br_questions']:>6}"
        )


if __name__ == "__main__":
    main()
