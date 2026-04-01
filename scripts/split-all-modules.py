#!/usr/bin/env python3
"""Modül 2-15 için alt başlıkları tespit edip ayrı section'lara böl."""

import re

def slug(text):
    """H4 metninden section id üret: 2.1 Network Topolojileri -> 2-1-topolojileri"""
    m = re.match(r'^([\d.]+)\s+(.+)$', text.strip())
    if m:
        nums = m.group(1).replace('.', '-').strip('-')
        rest = re.sub(r'[^\w\s-]', '', m.group(2))[:40].strip()
        rest = re.sub(r'\s+', '-', rest).lower()
        return f"{nums}-{rest}" if rest else nums
    return None

def main():
    path = '/Users/apple/Desktop/sebs/modules/temel-network-egitimi.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    SKIP = {'Hedefler', 'Modül Amaçları', 'Ana içerik'}

    # Modül config: section_id -> [(h4_text, slug), ...]
    modules = {
        'ders-2-topolojiler': [('2.1 Network Topolojileri', '2-1-topolojileri')],
        'ders-3-soho': [
            ('3.1 Ev tipi ağ mimarisi', '3-1-mimari'),
            ('3.2 Sık görülen hatalar ve belirtiler', '3-2-hatalar'),
            ('3.3 Komut & araç okuryazarlığı (temel hedef)', '3-3-komut'),
        ],
        'ders-4-fiziksel-katman': [
            ('4.1 Ağ cihazları ve rolleri', '4-1-cihazlar'),
            ('4.2 Kablolar ve bağlantılar', '4-2-kablolar'),
            ('4.3 RJ45 ve sonlandırma standartları', '4-3-rj45'),
            ('4.4 Ethernet pratikleri (kavramsal)', '4-4-ethernet'),
            ('4.5 PoE — saha mantığı', '4-5-poe'),
            ('4.6 Platform/GUI araç okuryazarlığı', '4-6-platform'),
            ('4.7 Temel ağ teşhis araçları (hızlı kontrol)', '4-7-teshis'),
        ],
        'ders-5-kablosuz': [
            ('5.1 802.11 evrimi', '5-1-80211'),
            ('5.2 Wi-Fi 7 ve ufuk notu', '5-2-wifi7'),
            ('5.3 PAN yaklaşımı', '5-3-pan'),
            ('5.4 Kablosuz teşhis araçları', '5-4-teshis'),
            ('2.4 GHz kanal okuryazarlığı (giriş seviyesi pratik)', '5-5-kanal'),
        ],
        'ders-6-osi-tcpip': [
            ('6.1 Katmanlı mimari neden var?', '6-1-mimari'),
            ('6.2 OSI 7 katman', '6-2-osi'),
            ('6.3 TCP/IP modeli ve OSI eşlemesi', '6-3-tcpip'),
            ('6.4 Encapsulation / Decapsulation', '6-4-encapsulation'),
            ("6.5 VLAN tag'e giriş", '6-5-vlan'),
            ('6.6 Araç: Wireshark giriş', '6-6-wireshark'),
        ],
        'ders-7-mac-arp': [
            ('7.1 MAC adresi ve yerel iletişim', '7-1-mac'),
            ('7.2 ARP mantığı (temel)', '7-2-arp'),
        ],
        'ders-8-ip-subnetting': [
            ('8.1 IPv4 temelleri', '8-1-ipv4'),
            ('8.2 Subnetting (ezbersiz giriş)', '8-2-subnetting'),
            ('8.3 IPv6 temelleri (minimum okuryazarlık)', '8-3-ipv6'),
            ('8.4 Komutlar (okuma/denetim)', '8-4-komutlar'),
        ],
        'ders-9-tcp-udp': [
            ('9.1 TCP vs UDP', '9-1-tcp-udp'),
            ('9.2 Portlar ve servisler', '9-2-portlar'),
            ('9.3 Servis erişimini "güvenli test etme" mantığı', '9-3-servis'),
            ('9.4 Komutlar ve araçlar', '9-4-komutlar'),
        ],
        'ders-10-dns-dhcp-nat': [
            ('10.1 DNS çalışma akışı', '10-1-dns'),
            ('10.2 DHCP çalışma akışı', '10-2-dhcp'),
            ("10.3 NAT ve ev router'ı", '10-3-nat'),
            ('10.4 Komutlar (yerel/izinli doğrulama)', '10-4-komutlar'),
        ],
        'ders-11-yonlendirme': [
            ('11.1 Paket ağlar arası nasıl gider?', '11-1-paket'),
            ('11.2 Traceroute mantığı: Yol haritasını çıkarmak', '11-2-traceroute'),
            ('11.3 Performans kavramları: "Hız" her şey değildir', '11-3-performans'),
            ("11.4 Statik vs dinamik routing'e giriş: Manuel harita mı, GPS mi?", '11-4-routing'),
            ('11.5 Komutlar ve araçlar: Çıktı okuma odaklı (yerel/izinli)', '11-5-komutlar'),
        ],
        'ders-12-troubleshooting': [
            ('12.1 Katmanlı problem çözme', '12-1-katmanli'),
            ('12.2 Temel teşhis komutları (çıktı yorumlama)', '12-2-komutlar'),
            ('12.3 Baseline kavramına giriş', '12-3-baseline'),
            ('12.4 Wireshark (kademeli)', '12-4-wireshark'),
            ('12.5 STP/loop kaynaklı kesinti okuryazarlığı (Wireshark ile gözlem odaklı)', '12-5-stp'),
            ('12.6 tcpdump + CLI analiz ekosistemi', '12-6-tcpdump'),
        ],
        'ders-13-kesif': [
            ('13.1 Keşif metodolojisi (yetkili)', '13-1-metodoloji'),
            ('13.2 Tespit sinyalleri (okuryazarlık)', '13-2-tsespit'),
            ('13.3 Hardening önerisi (kavramsal)', '13-3-hardening'),
            ('13.4 Uygulama çerçevesi (izinli platformlar)', '13-4-uygulama'),
        ],
        'ders-14-zafiyet': [
            ('14.1 Zafiyet doğrulama metodolojisi (okuryazarlık)', '14-1-metodoloji'),
            ('14.2 Risk matrisi ve düzeltme teyidi (kavramsal)', '14-2-risk'),
            ('14.3 Segmentasyon doğrulama okuryazarlığı (kavramsal)', '14-3-segmentasyon'),
        ],
        'ders-15-simulasyon': [
            ('15.1 Simülasyon metodolojisi (yetkili)', '15-1-metodoloji'),
            ('15.2 PCAP vs Flow okuryazarlığı', '15-2-pcap'),
            ('15.3 Raporlama (Bulgu → Etki → Öneri → Kanıt)', '15-3-raporlama'),
        ],
    }

    new_lesson_order = []
    sidebar_items = {}

    for mod_id, subsections in modules.items():
        base = mod_id.replace('ders-', '').split('-')[0]
        base_num = re.match(r'\d+', base)
        base_num = base_num.group(0) if base_num else base

        # Find section content - from section start to sozluk
        sect_start = content.find(f'id="{mod_id}"')
        if sect_start == -1:
            continue
        section_tag_start = content.rfind('<section', 0, sect_start)
        sect_end = content.find('</section>', section_tag_start)
        depth = 0
        pos = section_tag_start
        while pos < len(content):
            close = content.find('</section>', pos)
            if close == -1:
                break
            open_sec = content.find('<section', pos, close)
            if open_sec == -1:
                depth -= 1
                pos = close + 10
                if depth == 0:
                    sect_end = close + 10
                    break
            else:
                depth += 1
                pos = open_sec + 8

        section_html = content[section_tag_start:sect_end]
        content_body_start = section_html.find('<div class="content-body')
        content_body_open = section_html[content_body_start:section_html.find('>', content_body_start)+1]
        inner_start = section_html.find('<div class="section-inner">')
        if inner_start == -1:
            inner_start = section_html.find('>', content_body_start) + 1
        inner_content = section_html[inner_start:]

        # Find first subsection position
        first_title, first_slug = subsections[0]
        first_search = first_title.replace('&', '&amp;')[:50]
        first_pos = inner_content.find(first_title)
        if first_pos == -1:
            first_pos = inner_content.find(first_search)
        if first_pos == -1:
            # Try h4 content
            first_pos = inner_content.find(f'>{first_title[:30]}')
        if first_pos == -1:
            print(f"Skip {mod_id}: first subsection not found")
            continue

        # Giriş: content before first subsection
        # Find the content-section-header that contains first_title
        header_pattern = re.compile(
            r'<div class="content-section-header">.*?<h4 class="content-section-title"[^>]*>([^<]+)</h4>',
            re.DOTALL
        )
        intro_end = 0
        for m in header_pattern.finditer(inner_content):
            if first_title[:20] in m.group(1) or first_title[:20].replace('&', '&amp;') in m.group(1):
                intro_end = m.start()
                break
        if intro_end == 0:
            intro_end = inner_content.find(f'<h4 class="content-section-title">')
            if intro_end == -1:
                intro_end = inner_content.find(first_title)

        intro_html = inner_content[:intro_end].strip()

        # Build new sections
        new_sections = []
        # 1. Trim original section to intro only
        header_div = re.search(r'<div class="section-header">.*?</div>\s*<div class="content-body', section_html, re.DOTALL)
        header_div = header_div.group(0).replace('<div class="content-body', '').strip() if header_div else ''

        section_open = section_html[:section_html.find('<div class="section-header">')]
        new_sections.append(f'''            {section_open}
                <div class="section-header">
                    <h2><i class="fas fa-project-diagram"></i> {mod_id}</h2>
                    <div class="lesson-controls"><button class="btn-complete-lesson" onclick="completeLesson('{mod_id}')"><i class="fas fa-check"></i> Dersi Tamamla</button></div>
                </div>
                {content_body_open}
<div class="section-inner">
{intro_html}
</div>
</div>
</div>
            </section>''')

        # 2. Add subsection sections
        for i, (title, sslug) in enumerate(subsections):
            next_title = subsections[i+1][0] if i+1 < len(subsections) else None
            # Find content from this subsection to next
            start_marker = title.replace('&', '&amp;')
            end_marker = next_title.replace('&', '&amp;') if next_title else None

            block_start = inner_content.find(start_marker)
            if block_start == -1:
                block_start = inner_content.find(f'>{title[:30]}')
            if block_start == -1:
                block_start = inner_content.find(sslug)
            if block_start == -1:
                continue

            if end_marker:
                block_end = inner_content.find(end_marker, block_start + 10)
                if block_end == -1:
                    block_end = inner_content.find(f'>{next_title[:30]}', block_start + 10)
            else:
                block_end = len(inner_content)
            if block_end == -1:
                block_end = len(inner_content)

            block_html = inner_content[block_start:block_end].strip()
            sect_id = f"{mod_id}-{sslug}"

            new_sections.append(f'''            <section class="content-section docx-content" id="{sect_id}" data-section="{sect_id}">
                <div class="section-header"><h2><i class="fas fa-file-alt"></i> {title[:60]}</h2>
                    <div class="lesson-controls"><button class="btn-complete-lesson" onclick="completeLesson('{sect_id}')"><i class="fas fa-check"></i> Dersi Tamamla</button></div>
                </div>
                {content_body_open}
<div class="section-inner">
{block_html}
</div>
</div>
</div>
            </section>''')

            sidebar_items[mod_id] = sidebar_items.get(mod_id, []) + [(sect_id, title[:45])]

        # Replace section
        new_full = '\n'.join(new_sections)
        content = content[:section_tag_start] + new_full + content[sect_end:]
        print(f"Split {mod_id}: {len(subsections)} subsections")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Content updated. Run sidebar/lessonOrder update separately.")

if __name__ == '__main__':
    main()
