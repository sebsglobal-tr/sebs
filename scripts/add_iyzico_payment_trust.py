#!/usr/bin/env python3
"""Add iyzico payment trust band and legal footer links."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend"

PAYMENT_TRUST_BLOCK = """      <div class="sebs-payment-trust" aria-label="Ödeme yöntemleri">
        <p class="sebs-payment-trust__label">Güvenli ödeme</p>
        <img
          src="/images/payments/iyzico/logo-band-footer.svg"
          alt="iyzico ile Öde — Visa, Mastercard ve diğer kartlar"
          width="429"
          height="32"
          loading="lazy"
          class="sebs-payment-trust__band"
        />
      </div>
"""

COPYRIGHT_MARKERS = [
    '      <div class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">',
    '                <div class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">',
]

LEGAL_LINK_FOCUS = """              <li><a href="/kullanim-sartlari" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Kullanım şartları</a></li>"""
LEGAL_LINK_EXTRA_FOCUS = """              <li><a href="/kullanim-sartlari" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Kullanım şartları</a></li>
              <li><a href="/teslimat-iade" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Teslimat ve iade</a></li>
              <li><a href="/mesafeli-satis" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Mesafeli satış</a></li>"""

LEGAL_LINK_PLAIN = """        <a href="/kullanim-sartlari" class="text-slate-600 hover:text-slate-900">Kullanım şartları</a>"""
LEGAL_LINK_EXTRA_PLAIN = """        <a href="/kullanim-sartlari" class="text-slate-600 hover:text-slate-900">Kullanım şartları</a>
        <a href="/teslimat-iade" class="text-slate-600 hover:text-slate-900">Teslimat ve iade</a>
        <a href="/mesafeli-satis" class="text-slate-600 hover:text-slate-900">Mesafeli satış</a>"""

GIZLILIK_FIX = (
    ("gizlilik-politikasi.html", "gizlilik"),
    ("kullanim-sartlari.html", "kullanim-sartlari"),
    ("kvkk-aydinlatma.html", "kvkk"),
)


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    if "sebs-payment-trust" not in text and "landing-footer-year" in text:
        for marker in COPYRIGHT_MARKERS:
            if marker in text:
                text = text.replace(marker, PAYMENT_TRUST_BLOCK + marker, 1)
                break
    if "/teslimat-iade" not in text:
        if LEGAL_LINK_FOCUS in text:
            text = text.replace(LEGAL_LINK_FOCUS, LEGAL_LINK_EXTRA_FOCUS)
        elif LEGAL_LINK_PLAIN in text:
            text = text.replace(LEGAL_LINK_PLAIN, LEGAL_LINK_EXTRA_PLAIN)
    for old, new in [
        ('href="/gizlilik-politikasi.html"', 'href="/gizlilik"'),
        ('href="/kullanim-sartlari.html"', 'href="/kullanim-sartlari"'),
        ('href="/kvkk-aydinlatma.html"', 'href="/kvkk"'),
    ]:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if patch_file(path):
            changed.append(str(path.relative_to(ROOT)))
    print(f"Updated {len(changed)} file(s)")
    for name in changed:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
