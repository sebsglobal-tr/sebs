#!/usr/bin/env python3
"""Apply premium sidebar header markup to landing training modules."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "frontend" / "modules"

CONFIG: dict[str, dict[str, str]] = {
    "guncel-siber-guvenlige-giris.html": {
        "title": "Siber Güvenliğe Giriş",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "CIA üçlüsü, varlık-tehdit-risk ve saldırı zinciri mantığı.",
    },
    "temel-network-egitimi.html": {
        "title": "Temel Network Eğitimi",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "Etik çerçeve, TCP/IP, OSI ve ağ güvenliği temelleri.",
        "cover": "/assets/modules/network/cover.svg",
        "badge": "7 modül",
    },
    "isletim-sistemi-guvenligi.html": {
        "title": "İşletim Sistemi Güvenliği",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "Windows ve Linux temel hardening ve güvenlik yapılandırması.",
    },
    "temel-kriptografi.html": {
        "title": "Temel Kriptografi",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "Şifreleme, hash, anahtar yönetimi ve TLS — dijital güvenliğin temel yapı taşları.",
    },
    "sosyal-muhendislik.html": {
        "title": "Sosyal Mühendisliğe Giriş",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "Phishing, pretexting ve insan odaklı saldırılara karşı korunma.",
    },
    "network-guvenligi.html": {
        "title": "Network Güvenliği",
        "eyebrow": "SEBS — Orta seviye",
        "tagline": "Ağ segmentasyonu, saldırı simülasyonu ve paket analizi.",
    },
    "ileri-kriptografi.html": {
        "title": "İleri Kriptografi",
        "eyebrow": "SEBS — İleri seviye",
        "tagline": "10 modüllük tam müfredat: protokoller ve ileri kriptografik yapılar.",
    },
    "incident-response.html": {
        "title": "Olay Müdahalesi & DFIR",
        "eyebrow": "SEBS — İleri seviye",
        "tagline": "Olay müdahalesi, dijital adli bilişim ve kanıt toplama süreçleri.",
    },
    "ileri-malware-analizi.html": {
        "title": "İleri Malware Analizi",
        "eyebrow": "SEBS — İleri seviye",
        "tagline": "Tersine mühendislik, statik ve dinamik analiz disiplini.",
    },
    "threat-hunting.html": {
        "title": "Threat Intelligence",
        "eyebrow": "SEBS — İleri seviye",
        "tagline": "Tehdit istihbaratı, IOC ve tehdit avcılığı metodolojisi.",
    },
    "penetration-testing.html": {
        "title": "Red Team & Pentest",
        "eyebrow": "SEBS — İleri seviye",
        "tagline": "Yetkili sızma testi, saldırı simülasyonu ve raporlama.",
    },
    "malware-analizi.html": {
        "title": "Malware Analizi",
        "eyebrow": "SEBS — Orta seviye",
        "tagline": "Güvenli çalışma disiplini ve analiz metodolojisi.",
    },
    "soc.html": {
        "title": "SOC Eğitimi",
        "eyebrow": "SEBS — Orta seviye",
        "tagline": "SOC analisti programı: izleme, triyaj ve olay yönetimi.",
    },
    "parts/web-uygulama-guvenligi-placeholder.html": {
        "title": "Web Uygulama Güvenliği",
        "eyebrow": "SEBS — Orta seviye",
        "tagline": "OWASP odaklı web güvenliği eğitim modülü.",
    },
    "temel-siber-guvenlik.html": {
        "title": "Temel Siber Güvenlik",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "Siber güvenlik temelleri ve uygulamalı öğrenme modülü.",
    },
    "parts/temel-kripto-chunk00.html": {
        "title": "Temel Kriptografi",
        "eyebrow": "SEBS — Başlangıç seviye",
        "tagline": "Şifreleme, hash, anahtar yönetimi ve TLS — dijital güvenliğin temel yapı taşları.",
    },
}

BLOCK_RE = re.compile(
    r'<div class="sidebar-header sebs-sidebar-header">.*?</div>\s*(?=<nav class="sidebar-nav")',
    re.DOTALL,
)


def build_sidebar(cfg: dict[str, str]) -> str:
    lines = ['            <div class="sidebar-header sebs-sidebar-header">']
    if cfg.get("cover"):
        lines.append('                <div class="sebs-sidebar-hero">')
        lines.append(
            f'                    <img src="{cfg["cover"]}" alt="" '
            'class="module-hero-image sebs-sidebar-hero__img" loading="lazy" '
            'width="280" height="105" aria-hidden="true">'
        )
        if cfg.get("badge"):
            lines.append(
                '                    <span class="sebs-sidebar-hero__badge">'
                f'<i class="fas fa-layer-group" aria-hidden="true"></i> {cfg["badge"]}</span>'
            )
        lines.append("                </div>")
    lines.extend(
        [
            f'                <p class="sebs-sidebar-eyebrow">{cfg["eyebrow"]}</p>',
            f'                <h1>{cfg["title"]}</h1>',
            f'                <p class="sebs-sidebar-tagline">{cfg["tagline"]}</p>',
            '                <div class="progress-container sebs-sidebar-progress">',
            '                    <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="progressBar">',
            '                        <div class="progress-fill" id="progressFill"></div>',
            "                    </div>",
            '                    <div class="progress-text" id="progressText">0% Tamamlandı</div>',
            "                </div>",
            "            </div>",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    for rel, cfg in CONFIG.items():
        path = MODULES / rel
        if not path.exists():
            print(f"skip missing {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        new_block = build_sidebar(cfg)
        new_text, n = BLOCK_RE.subn(new_block, text, count=1)
        if n == 0:
            print(f"no match: {rel}")
            continue
        path.write_text(new_text, encoding="utf-8")
        print(f"updated {rel}")


if __name__ == "__main__":
    main()
