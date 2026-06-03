#!/usr/bin/env python3
"""Apply dark home shell to modules, simulations, about pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend"

FOOTER = """  <footer class="sh-footer">
    <div class="sh-container">
      <div class="sh-footer__grid">
        <div class="sh-footer__brand">
          <a href="/" class="sh-brand">
            <img src="/images/SEBS.png" alt="SEBS" width="32" height="32" />
            <span class="sh-brand__text">
              <span class="sh-brand__name">SEBS Global</span>
            </span>
          </a>
          <p>Simülasyonlar ve ölçülebilir performans profiliyle öğrencilerin kariyer yönünü keşfetmesini sağlayan eğitim platformu.</p>
        </div>
        <div class="sh-footer__col">
          <h4>Ürün</h4>
          <ul>
            <li><a href="/modules.html">Eğitim modülleri</a></li>
            <li><a href="/simulations.html">Simülasyonlar</a></li>
            <li><a href="/pricing.html">Paketler</a></li>
            <li><a href="/tests/big-five">Big Five testi</a></li>
          </ul>
        </div>
        <div class="sh-footer__col">
          <h4>Kurumsal</h4>
          <ul>
            <li><a href="/isverenler.html">Kurumsal çözümler</a></li>
            <li><a href="/hakkimizda">Hakkımızda</a></li>
            <li><a href="/contact.html">İletişim</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>
        <div class="sh-footer__col">
          <h4>Yasal</h4>
          <ul>
            <li><a href="/gizlilik">Gizlilik</a></li>
            <li><a href="/kullanim-sartlari">Kullanım şartları</a></li>
            <li><a href="/teslimat-iade">Teslimat ve iade</a></li>
            <li><a href="/mesafeli-satis">Mesafeli satış</a></li>
          </ul>
        </div>
      </div>
      <div class="sh-footer__pay" aria-label="Ödeme yöntemleri">
        <p>Güvenli ödeme</p>
        <img src="/images/payments/iyzico/logo-band-footer.svg" alt="iyzico ile Öde — Visa, Mastercard ve diğer kartlar" width="429" height="32" loading="lazy" decoding="async" />
      </div>
      <div class="sh-footer__bottom">
        <p>© <span class="landing-footer-year"></span> SEBS Global. Tüm hakları saklıdır.</p>
        <p>Sivas · Türkiye</p>
      </div>
    </div>
  </footer>
  <script>
    document.querySelectorAll('.landing-footer-year').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  </script>"""


def nav(active: str) -> str:
    def link(href: str, label: str, key: str) -> str:
        cur = ' aria-current="page"' if active == key else ""
        return f'        <a href="{href}" class="sh-nav__link"{cur}>{label}</a>'

    return f"""  <a href="#top" class="sh-skip">İçeriğe atla</a>

  <header class="sh-nav" id="shNav">
    <div class="sh-container sh-nav__inner">
      <a href="/" class="sh-brand" aria-label="SEBS Global ana sayfa">
        <img src="/images/sebs-navbar-mark.png?v=1" alt="" width="36" height="36" />
        <span class="sh-brand__text">
          <span class="sh-brand__name">SEBS</span>
          <span class="sh-brand__sub">Global</span>
        </span>
      </a>

      <nav class="sh-nav__links" aria-label="Ana menü">
{link("/modules.html", "Eğitimler", "modules")}
{link("/simulations.html", "Simülasyonlar", "simulations")}
        <a href="/#experience" class="sh-nav__link">Kariyer Yolları</a>
{link("/isverenler.html", "Kurumsal", "corporate")}
{link("/hakkimizda", "Hakkımızda", "about")}
      </nav>

      <div class="sh-nav__actions">
        <a href="/login.html" id="loginBtn" class="sh-nav__login">Giriş</a>
        <a href="/signup.html" id="signupBtn" class="sh-btn sh-btn--primary sh-nav__cta">Yolunu keşfet</a>
        <div id="userProfile" class="relative hidden" style="display: none;">
          <button type="button" id="userProfileTrigger" aria-expanded="false" aria-haspopup="menu" aria-controls="userAccountPanel" aria-label="Hesap menüsü">
            <span id="userAvatar" aria-hidden="true">K</span>
            <span id="userName">Kullanıcı</span>
          </button>
          <div id="userAccountPanel" class="hidden" role="menu" hidden>
            <a href="/dashboard.html" class="user-dashboard-link" role="menuitem">Profilim</a>
            <div class="sh-account-theme" role="none">
              <span>Gece modu</span>
              <div id="userMenuThemeMount"></div>
            </div>
            <button type="button" id="logoutBtn" style="display: none;" role="menuitem">Çıkış yap</button>
          </div>
        </div>
        <button type="button" class="sh-nav__burger" id="shNavBurger" aria-expanded="false" aria-controls="shMobileMenu" aria-label="Menüyü aç">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div class="sh-mobile-menu" id="shMobileMenu" aria-hidden="true">
    <a href="/modules.html"{" aria-current=\"page\"" if active == "modules" else ""}>Eğitimler</a>
    <a href="/simulations.html"{" aria-current=\"page\"" if active == "simulations" else ""}>Simülasyonlar</a>
    <a href="/#experience">Kariyer Yolları</a>
    <a href="/isverenler.html">Kurumsal</a>
    <a href="/hakkimizda"{" aria-current=\"page\"" if active == "about" else ""}>Hakkımızda</a>
    <div class="sh-btn-row" id="mobileGuestLinks">
      <a href="/login.html" class="sh-btn sh-btn--ghost">Giriş</a>
      <a href="/signup.html" class="sh-btn sh-btn--primary">Ücretsiz başla</a>
    </div>
    <div id="mobileUserLinks" style="display: none;">
      <a href="/dashboard.html" class="sh-btn sh-btn--ghost user-dashboard-link">Profilim</a>
      <button type="button" class="sh-btn sh-btn--ghost btn-logout">Çıkış</button>
    </div>
  </div>"""


HEAD_APP = """    <meta name="theme-color" content="#050510" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    <link rel="stylesheet" href="/css/styles.css" />
    <link rel="stylesheet" href="/css/modules.css" />
    <link rel="stylesheet" href="/css/enhancements.css" />
    <link rel="stylesheet" href="/css/sebs-home-tokens.css?v=1" />
    <link rel="stylesheet" href="/css/sebs-home.css?v=1" />
    <link rel="stylesheet" href="/css/sebs-app-pages.css?v=1" />"""

HEAD_SIM_EXTRA = '\n    <link rel="stylesheet" href="/css/simulations-page.css?v=1" />'

HEAD_ABOUT = """  <meta name="theme-color" content="#050510" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="/css/sebs-home-tokens.css?v=1" />
  <link rel="stylesheet" href="/css/sebs-home.css?v=1" />
  <link rel="stylesheet" href="/css/sebs-app-pages.css?v=1" />
  <link rel="stylesheet" href="/css/legal-document.css?v=5" />"""

SCRIPTS_END = """
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js" crossorigin="anonymous"></script>
  <script src="/js/supabase-env.js?v=2"></script>
  <script src="/js/supabase-client.js"></script>
  <script src="/js/supabase-auth.js?v=2.2"></script>
  <script src="/js/navigation.js?v=3.7" defer></script>
  <script src="/js/sebs-home.js?v=1" defer></script>"""


def replace_between(text: str, start_marker: str, end_marker: str, replacement: str) -> str:
    i = text.find(start_marker)
    j = text.find(end_marker, i)
    if i == -1 or j == -1:
        raise ValueError(f"Markers not found: {start_marker!r} .. {end_marker!r}")
    return text[:i] + replacement + text[j:]


def patch_modules_sim(path: Path, active: str, extra_head: str = ""):
    text = path.read_text(encoding="utf-8")

    # Remove theme flash script
    text = text.replace(
        """    <script>
      (function(){try{var t=localStorage.getItem('sebs-theme')||localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();
    </script>
""",
        "",
    )

    # Replace fonts + old premium CSS block
    old_font = '    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />\n    \n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">\n    \n    <link rel="stylesheet" href="/css/styles.css">\n    <link rel="stylesheet" href="/css/modules.css">\n    <link rel="stylesheet" href="/css/enhancements.css">'
    text = text.replace(old_font, HEAD_APP + extra_head)

    for link in [
        '  <link rel="stylesheet" href="/css/saas-landing.css?v=3" />\n',
        '  <link rel="stylesheet" href="/css/landing-chrome.css?v=9" />\n',
        '  <link rel="stylesheet" href="/css/sebs-premium-theme.css?v=3" />\n',
        '  <link rel="stylesheet" href="/css/sebs-yolu-premium.css" data-sebs-premium="css" />\n\n',
    ]:
        text = text.replace(link, "")

    if "simulations-page.css" in str(path) and "simulations-page.css" not in text:
        text = text.replace(HEAD_APP, HEAD_APP + HEAD_SIM_EXTRA)

    # Body
    text = text.replace(
        '<body class="sebs-premium-site sebs-premium-page modules-page landing-site-body font-sans text-slate-800 antialiased">',
        '<body id="top" class="sebs-app-page landing-site-body modules-page" data-theme="dark">',
    )
    text = text.replace(
        '<body class="sebs-premium-site sebs-premium-page landing-site-body font-sans text-slate-800 antialiased">',
        '<body id="top" class="sebs-app-page landing-site-body" data-theme="dark">',
    )

    # Header -> shell nav
    text = replace_between(
        text,
        "<body",
        '    <div class="loading',
        f"<body id=\"top\" class=\"sebs-app-page landing-site-body{' modules-page' if 'modules' in path.name else ''}\" data-theme=\"dark\">\n{nav(active)}\n\n    <div class=\"loading",
    )
    # Fix double body tag from replace_between - we included body in replacement wrongly

    # Actually the replace included body tag twice. Let me fix the function.
    pass


# Simpler: use regex for header replacement from <header class="fixed to </header>

import re

HEADER_RE = re.compile(
    r"<header class=\"fixed inset-x-0 top-0.*?</header>\s*",
    re.DOTALL,
)

FOOTER_RE = re.compile(
    r"\s*<footer class=\"border-t border-slate-200.*?</footer>\s*<script>\s*\(function \(\) \{\s*document\.querySelectorAll\('\.landing-footer-year'\).*?</script>\s*",
    re.DOTALL,
)

ABOUT_FOOTER_RE = re.compile(
    r"\s*<footer class=\"border-t border-slate-200 bg-white py-12\">.*?</footer>\s*<script>\s*document\.querySelectorAll\('\.landing-footer-year'\).*?</script>\s*",
    re.DOTALL,
)


def patch_file(path: Path, active: str, body_extra: str = "", extra_head: str = ""):
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        """    <script>
      (function(){try{var t=localStorage.getItem('sebs-theme')||localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();
    </script>
""",
        "",
    )

    if path.name == "about.html":
        text = re.sub(
            r"  <link href=\"https://fonts\.googleapis\.com/css2\?family=Plus.*?</script>\n  <link rel=\"stylesheet\" href=\"/css/saas-landing\.css.*?</head>",
            HEAD_ABOUT + "\n</head>",
            text,
            count=1,
            flags=re.DOTALL,
        )
        text = text.replace(
            '<body class="sebs-premium-site landing-site-body about-page font-sans text-slate-800 antialiased bg-white">',
            f'<body id="top" class="sebs-app-page landing-site-body about-page" data-theme="dark">',
        )
        text = HEADER_RE.sub(nav(active) + "\n", text, count=1)
        text = ABOUT_FOOTER_RE.sub("\n" + FOOTER + "\n", text, count=1)
        text = text.replace("<main>", '<main class="sebs-app-main">')
        if "sebs-home.js" not in text:
            text = text.replace("</body>", SCRIPTS_END + "\n</body>")
        path.write_text(text, encoding="utf-8")
        return

    # modules / simulations
    text = re.sub(
        r"    <link href=\"https://fonts\.googleapis\.com/css2\?family=Plus.*?<link rel=\"stylesheet\" href=\"/css/enhancements\.css\">",
        HEAD_APP + extra_head,
        text,
        count=1,
        flags=re.DOTALL,
    )
    for link in [
        '  <link rel="stylesheet" href="/css/saas-landing.css?v=3" />\n',
        '  <link rel="stylesheet" href="/css/landing-chrome.css?v=9" />\n',
        '  <link rel="stylesheet" href="/css/sebs-premium-theme.css?v=3" />\n',
        '  <link rel="stylesheet" href="/css/sebs-yolu-premium.css" data-sebs-premium="css" />\n\n',
    ]:
        text = text.replace(link, "")

    text = text.replace(
        '<body class="sebs-premium-site sebs-premium-page modules-page landing-site-body font-sans text-slate-800 antialiased">',
        f'<body id="top" class="sebs-app-page landing-site-body modules-page" data-theme="dark">',
    )
    text = text.replace(
        '<body class="sebs-premium-site sebs-premium-page landing-site-body font-sans text-slate-800 antialiased">',
        f'<body id="top" class="sebs-app-page landing-site-body" data-theme="dark">',
    )

    text = HEADER_RE.sub(nav(active) + "\n", text, count=1)
    text = FOOTER_RE.sub("\n" + FOOTER + "\n", text, count=1)
    text = text.replace(
        '<main class="main-content bg-white">',
        '<main class="main-content sebs-app-main">',
    )
    if "sebs-home.js" not in text:
        text = text.replace("</body>", SCRIPTS_END + "\n</body>")

    path.write_text(text, encoding="utf-8")
    print(f"Patched {path.name}")


if __name__ == "__main__":
    patch_file(ROOT / "modules.html", "modules")
    patch_file(ROOT / "simulations.html", "simulations", extra_head=HEAD_SIM_EXTRA)
    patch_file(ROOT / "about.html", "about")
    print("Done.")
