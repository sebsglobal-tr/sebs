#!/usr/bin/env python3
"""AWS / Azure / GCP modül sayfalarını web coming-soon şablonu ile hizalar."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = (ROOT / "frontend" / "modules" / "web-uygulama-guvenligi.html").read_text(encoding="utf-8")

PAGES = [
    {
        "file": "aws-temelleri.html",
        "title": "AWS Temelleri",
        "icon": "fab fa-aws",
        "subtitle": (
            "Amazon Web Services modülü erken erişim yol haritasında. "
            "EC2, S3 ve IAM içerikleri premium formatta yayınlanacak."
        ),
        "badge": "Yakında — bulut modülü",
        "canonical": "https://sebsglobal.com/modules/aws-temelleri.html",
    },
    {
        "file": "azure-cloud.html",
        "title": "Microsoft Azure",
        "icon": "fab fa-microsoft",
        "subtitle": (
            "Azure modülü yakında premium ders akışı ile açılacak. "
            "Şimdilik siber güvenlik paket modüllerine devam edebilirsiniz."
        ),
        "badge": "Yakında — bulut modülü",
        "canonical": "https://sebsglobal.com/modules/azure-cloud.html",
    },
    {
        "file": "gcp.html",
        "title": "Google Cloud Platform",
        "icon": "fab fa-google",
        "subtitle": (
            "GCP modülü hazırlanıyor. Bulut paketi satın alımlarında erken erişim kapsamında duyurulacaktır."
        ),
        "badge": "Yakında — bulut modülü",
        "canonical": "https://sebsglobal.com/modules/gcp.html",
    },
]


def build_page(cfg: dict) -> str:
    html = TEMPLATE
    html = html.replace("Web Uygulama Güvenliği", cfg["title"], 2)
    html = html.replace(
        "Bu eğitim modülünün içeriği şu an boş; ders metinleri ve etkileşimli bölümler "
        "<strong>yakında yüklenecek</strong>. Sayfayı yer imlerine ekleyebilir veya modül listesinden "
        "diğer eğitimlere geçebilirsiniz.",
        cfg["subtitle"],
    )
    html = html.replace("Yakında yüklenecek", cfg["badge"])
    html = html.replace("fas fa-hourglass-half", cfg["icon"])
    html = html.replace(
        'href="https://sebsglobal.com/egitimler/web-uygulama-guvenligi"',
        f'href="{cfg["canonical"]}"',
    )
    html = html.replace(
        "<title>Web Uygulama Güvenliği | SEBS Academy</title>",
        f"<title>{cfg['title']} | SEBS Global</title>",
    )
    html = html.replace(
        'content="Web Uygulama Güvenliği eğitim modülü yakında yüklenecek."',
        f'content="{cfg["title"]} modülü yakında premium formatta yayınlanacak."',
    )
    if "module-access-check" not in html:
        html = html.replace(
            '<script src="/js/saas-shell.js"></script>',
            '<script src="/js/saas-shell.js"></script>\n<script src="/modules/module-access-check.js"></script>',
        )
    return html


def main() -> None:
    out_dir = ROOT / "frontend" / "modules"
    for cfg in PAGES:
        path = out_dir / cfg["file"]
        path.write_text(build_page(cfg), encoding="utf-8")
        print("wrote", path.name)


if __name__ == "__main__":
    main()
