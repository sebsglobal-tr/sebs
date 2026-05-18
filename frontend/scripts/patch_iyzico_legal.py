#!/usr/bin/env python3
"""Add iyzico/legal footer requirements across the site."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAYMENT_BLOCK = """
      <div class="legal-footer-payment sebs-payment-trust mt-8" aria-label="Ödeme yöntemleri">
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

EXTRA_YASAL_LIS = """
              <li><a href="/teslimat-iade" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Teslimat ve iade</a></li>
              <li><a href="/mesafeli-satis" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Mesafeli satış</a></li>"""

MARKER_BEFORE_COPY = '      <p class="mt-8 text-xs text-slate-400">© <span class="landing-footer-year"></span> SEBS Global</p>'


def patch_legal_payment(text: str) -> str:
    if "legal-footer-payment" in text or "legal-footer-links" not in text:
        return text
    if MARKER_BEFORE_COPY in text and PAYMENT_BLOCK.strip() not in text:
        return text.replace(MARKER_BEFORE_COPY, PAYMENT_BLOCK + MARKER_BEFORE_COPY, 1)
    return text


def patch_grid_yasal(text: str) -> str:
    if "teslimat-iade" in text and "Yasal</p>" in text:
        # may still need patch on pages that have teslimat elsewhere but not in yasal ul
        pass
    text = text.replace(
        '<li><a href="#" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Gizlilik</a></li>',
        '<li><a href="/gizlilik" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Gizlilik</a></li>',
    )
    text = text.replace(
        '<li><a href="#" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Kullanım şartları</a></li>',
        '<li><a href="/kullanim-sartlari" class="text-slate-600 transition hover:text-slate-900 focus-ring rounded">Kullanım şartları</a></li>',
    )
    # Insert teslimat/mesafeli after kullanim-sartlari in Yasal grid when missing in that ul block
    needle = (
        '<p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Yasal</p>\n'
        "            <ul class=\"mt-4 space-y-2 text-sm\">\n"
        '              <li><a href="/gizlilik"'
    )
    if needle not in text:
        return text

    import re

    def fix_yasal_ul(m):
        block = m.group(0)
        if "teslimat-iade" in block:
            return block
        insert_after = re.search(
            r'(<li><a href="/kullanim-sartlari"[^>]*>Kullanım şartları</a></li>)',
            block,
        )
        if not insert_after:
            return block
        pos = insert_after.end()
        return block[:pos] + EXTRA_YASAL_LIS + block[pos:]

    pattern = (
        r'<p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Yasal</p>\s*'
        r'<ul class="mt-4 space-y-2 text-sm">.*?</ul>'
    )
    return re.sub(pattern, fix_yasal_ul, text, flags=re.DOTALL)


def patch_saas_footer(text: str) -> str:
    if "saas-shell-footer" not in text:
        return text
    text = text.replace('<li><a href="#">Gizlilik</a></li>', '<li><a href="/gizlilik">Gizlilik</a></li>')
    text = text.replace(
        '<li><a href="#">Kullanım Şartları</a></li>',
        '<li><a href="/kullanim-sartlari">Kullanım şartları</a></li>',
    )
    if "teslimat-iade" not in text:
        text = text.replace(
            '<li><a href="/kullanim-sartlari">Kullanım şartları</a></li>',
            '<li><a href="/kullanim-sartlari">Kullanım şartları</a></li>\n'
            '                        <li><a href="/teslimat-iade">Teslimat ve iade</a></li>\n'
            '                        <li><a href="/mesafeli-satis">Mesafeli satış</a></li>',
            1,
        )
    return text


def main():
    targets = list(ROOT.rglob("*.html"))
    changed = []
    for path in targets:
        if "node_modules" in path.parts:
            continue
        original = path.read_text(encoding="utf-8")
        text = original
        text = patch_legal_payment(text)
        text = patch_grid_yasal(text)
        text = patch_saas_footer(text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} files:")
    for p in sorted(changed):
        print(f"  - {p}")


if __name__ == "__main__":
    main()
