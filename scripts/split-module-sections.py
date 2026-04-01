#!/usr/bin/env python3
"""Split module content into separate sections by subheadings (content-section-title h4).
Alt başlıkları Sözlük ve Test gibi ayrı sayfalara taşır."""

import re
import sys

def main():
    path = 'modules/temel-network-egitimi.html'
    if len(sys.argv) > 1:
        path = sys.argv[1]

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Module config: main section id -> list of (subsection_id, h4_text, h4_id or None)
    # Subsections are content-section-title h4 with pattern X.Y or X.Y.Z
    subsection_pattern = re.compile(
        r'<h4 class="content-section-title"(?:\s+id="([^"]+)")?>([^<]+)</h4>',
        re.DOTALL
    )

    # Skip titles: Hedefler, Modül Amaçları, Ana içerik (generic headers)
    SKIP_TITLES = {'Hedefler', 'Modül Amaçları', 'Ana içerik'}

    # Map main section ids to their base id for subsection naming
    MODULE_SECTIONS = [
        'ders-0-etik', 'ders-1-network-mantigi', 'ders-2-topolojiler', 'ders-3-soho',
        'ders-4-fiziksel-katman', 'ders-5-kablosuz', 'ders-6-osi-tcpip', 'ders-7-mac-arp',
        'ders-8-ip-subnetting', 'ders-9-tcp-udp', 'ders-10-dns-dhcp-nat', 'ders-11-yonlendirme',
        'ders-12-troubleshooting', 'ders-13-kesif', 'ders-14-zafiyet', 'ders-15-simulasyon'
    ]

    # Extract subsections for each module by parsing HTML
    # Find each section, get content-body, split by content-section-header blocks with numbered h4
    new_sections_html = []
    sidebar_updates = {}  # section_id -> list of (data-section, link_text, icon_class)

    for mod_id in MODULE_SECTIONS:
        # Find section: <section ... id="mod_id" ...> ... </section>
        # Stop at next <section
        sect_start = content.find(f'id="{mod_id}"')
        if sect_start == -1:
            continue
        # Find the start of this section tag
        section_tag_start = content.rfind('<section', 0, sect_start)
        # Find the next section (or sozluk/test) - end of this section
        next_section = content.find('<section', section_tag_start + 10)
        if next_section == -1:
            next_section = content.find('</main>')
        # Find the closing </section> for our section
        depth = 0
        pos = section_tag_start
        section_end = section_tag_start
        while pos < len(content):
            open_sec = content.find('<section', pos)
            close_sec = content.find('</section>', pos)
            if close_sec == -1:
                break
            if open_sec != -1 and open_sec < close_sec:
                depth += 1
                pos = open_sec + 8
            else:
                depth -= 1
                pos = close_sec + 10
                if depth == 0:
                    section_end = close_sec + 10
                    break

        section_html = content[section_tag_start:section_end]

        # Check if this is sozluk or test - skip
        if '-sozluk' in mod_id or '-test' in mod_id:
            continue

        # Find content-body div
        body_match = re.search(r'<div class="content-body[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</section>',
                              section_html, re.DOTALL)
        if not body_match:
            # Alternative: section-inner inside content-body
            body_match = re.search(r'<div class="content-body[^"]*"[^>]*>.*?<div class="section-inner">(.*?)</div>\s*</div>\s*</div>\s*</section>',
                                  section_html, re.DOTALL)
        if not body_match:
            continue

        inner_content = body_match.group(1)
        # Find section-header (title, lesson controls)
        header_match = re.search(r'<div class="section-header">(.*?)</div>\s*<div class="content-body',
                                section_html, re.DOTALL)
        section_header = header_match.group(1) if header_match else ''

        # Find all content-section-header blocks with h4
        # Pattern: <div class="content-section-header">...<h4 class="content-section-title" id="...">TEXT</h4></div>
        # or <h4 class="content-section-title">TEXT</h4>
        blocks = []
        pos = 0
        current_block_start = 0
        subsection_headers = []

        for m in subsection_pattern.finditer(inner_content):
            h4_id = m.group(1)  # may be None
            h4_text = m.group(2).strip()
            if h4_text in SKIP_TITLES:
                continue
            # Check if it's a numbered subsection (0.1, 1.1, 2.1.1, etc.)
            if re.match(r'^[\d.]+\s+', h4_text) or (h4_id and '-' in h4_id):
                subsection_headers.append((m.start(), m.end(), h4_id, h4_text))

        # Build subsection sections
        # Part 0: from start to first subsection (Giriş)
        # Part 1..n: each subsection
        if not subsection_headers:
            continue

        # Split inner_content
        intro_end = subsection_headers[0][0]
        intro_html = inner_content[:intro_end].strip()

        # Create section id from h4 id: 0-1-yetkili-calisma -> ders-0-etik-0-1
        def make_section_id(mod_id, h4_id, h4_text):
            if h4_id:
                return f"{mod_id}-{h4_id}"
            # Generate from text: "1.1 Network nedir" -> 1-1-network-nedir
            num_part = re.match(r'^([\d.]+)\s+', h4_text)
            if num_part:
                nums = num_part.group(1).replace('.', '-').strip('-')
                slug = re.sub(r'[^\w\s-]', '', h4_text[num_part.end():])[:30].strip().lower()
                slug = re.sub(r'\s+', '-', slug)
                return f"{mod_id}-{nums}-{slug}" if slug else f"{mod_id}-{nums}"
            return None

        new_lesson_order = []
        sidebar_items = []

        # 1. Giriş section (trimmed - only intro)
        giriş_section_id = mod_id
        # Keep existing section, but trim content to intro only
        # We'll replace the inner content

        # 2. Create new sections for each subsection
        for i, (start, end, h4_id, h4_text) in enumerate(subsection_headers):
            next_start = subsection_headers[i + 1][0] if i + 1 < len(subsection_headers) else len(inner_content)
            block_html = inner_content[start:next_start].strip()
            sect_id = make_section_id(mod_id, h4_id, h4_text)
            if not sect_id:
                continue
            new_lesson_order.append(sect_id)
            # Extract short title for sidebar (e.g. "0.1 Yetkili çalışma ilkeleri")
            short = h4_text[:50] + ('...' if len(h4_text) > 50 else '')
            sidebar_items.append((sect_id, short, 'fas fa-file-alt'))

        # Store for later replacement
        sidebar_updates[mod_id] = {
            'intro_id': mod_id,
            'subsections': sidebar_items,
            'intro_html': intro_html,
            'subsection_blocks': [(subsection_headers[i][0], subsection_headers[i + 1][0] if i + 1 < len(subsection_headers) else len(inner_content),
                                   subsection_headers[i][2], subsection_headers[i][3],
                                   make_section_id(mod_id, subsection_headers[i][2], subsection_headers[i][3]))
                                  for i in range(len(subsection_headers))]
        }

    # Now perform the actual HTML transformation
    # Strategy: for each module section, replace the single section with multiple sections
    for mod_id in MODULE_SECTIONS:
        if mod_id not in sidebar_updates:
            continue
        info = sidebar_updates[mod_id]
        # Find and replace the section
        sect_start = content.find(f'id="{mod_id}"')
        if sect_start == -1:
            continue
        section_tag_start = content.rfind('<section', 0, sect_start)
        # Find section end
        depth = 0
        pos = section_tag_start
        section_end = section_tag_start
        while pos < len(content):
            open_sec = content.find('<section', pos)
            close_sec = content.find('</section>', pos)
            if close_sec == -1:
                break
            if open_sec != -1 and open_sec < close_sec:
                depth += 1
                pos = open_sec + 8
            else:
                depth -= 1
                pos = close_sec + 10
                if depth == 0:
                    section_end = close_sec + 10
                    break

        old_section = content[section_tag_start:section_end]

        # Parse to get section header and extract content-body
        header_match = re.search(r'(<section[^>]*>)\s*(<div class="section-header">.*?</div>)\s*(<div class="content-body[^"]*"[^>]*>)',
                                old_section, re.DOTALL)
        if not header_match:
            continue
        section_open = header_match.group(1)
        section_header_div = header_match.group(2)
        content_body_open = header_match.group(3)

        # Get intro (before first subsection)
        body_match = re.search(r'<div class="content-body[^"]*"[^>]*>.*?(?:<div class="section-inner">|)(.*?)(?:</div>\s*</div>|</div>)\s*</section>',
                              old_section, re.DOTALL)
        if not body_match:
            continue
        full_inner = body_match.group(1)

        # Split by first subsection
        first_sub = info['subsection_blocks'][0]
        first_sub_start = full_inner.find(f'id="{first_sub[2]}"') if first_sub[2] else full_inner.find(first_sub[3][:30])
        if first_sub_start == -1:
            # Find by content-section-header containing the title
            first_sub_start = full_inner.find(first_sub[3][:20])
        if first_sub_start == -1:
            continue
        intro_inner = full_inner[:first_sub_start].strip()

        # Build new sections
        new_sections = []

        # 1. Giriş section
        giriş_section = f'''            {section_open}
                {section_header_div}
                {content_body_open}
<div class="section-inner">
{intro_inner}
</div>
</div>
</div>
            </section>'''

        new_sections.append(giriş_section)

        # 2. Subsection sections
        for i, (start, end, h4_id, h4_text, sect_id) in enumerate(info['subsection_blocks']):
            block_html = full_inner[start:end].strip()
            # Simpler header for subsections
            sub_header = f'<div class="section-header"><h2><i class="fas fa-file-alt"></i> {h4_text}</h2><div class="lesson-controls"><button class="btn-complete-lesson" onclick="completeLesson(\'{sect_id}\')"><i class="fas fa-check"></i> Dersi Tamamla</button></div></div>'
            sub_section = f'''            <section class="content-section docx-content" id="{sect_id}" data-section="{sect_id}">
                {sub_header}
                {content_body_open}
<div class="section-inner">
{block_html}
</div>
</div>
</div>
            </section>'''
            new_sections.append(sub_section)

        new_full_section = '\n'.join(new_sections)
        content = content[:section_tag_start] + new_full_section + content[section_end:]

        print(f"Split {mod_id} into {len(new_sections)} sections")

    # Update sidebar - add subsection links for each module
    for mod_id in MODULE_SECTIONS:
        if mod_id not in sidebar_updates:
            continue
        info = sidebar_updates[mod_id]
        # Find sidebar block for this module
        # Pattern: <li class="nav-module-header">Modül X — ...</li>
        # ... <li><a ... data-section="mod_id">Giriş</a></li>
        # ... <li><a ... data-section="mod_id" data-scroll="...">...</a></li> (replace with data-section for subsection)
        # ... <li><a ... data-section="mod_id-sozluk">Sözlük</a></li>
        # We need to add subsection links between Giriş and Sözlük
        # Find the Giriş link
        giriş_li = re.search(
            rf'(<li><a href="#" class="nav-link-section[^"]*" data-section="{re.escape(mod_id)}"[^>]*><i class="[^"]+"></i> Giriş</a></li>)',
            content
        )
        if not giriş_li:
            continue
        giriş_marker = giriş_li.group(1)
        # Find sozluk link (next nav-link-section for this module group)
        sozluk_pattern = rf'(<li><a href="#" class="nav-link-section"[^>]*data-section="{re.escape(mod_id)}-sozluk"[^>]*>.*?</a></li>)'
        sozluk_li = re.search(sozluk_pattern, content)
        if not sozluk_li:
            sozluk_pattern = rf'data-section="[^"]*sozluk"[^>]*>'
        # Insert subsection links after Giriş
        new_links = []
        for sect_id, short, icon in info['subsections']:
            new_links.append(f'                        <li><a href="#" class="nav-link-section" data-section="{sect_id}"><i class="{icon}"></i> {short}</a></li>')
        insert_html = '\n' + '\n'.join(new_links)

        # Replace: Giriş</a></li> followed by optional data-scroll links, then sozluk
        # Remove existing data-scroll links for this module
        # Pattern: <li><a ... data-section="mod_id" data-scroll="...">...</a></li>
        scroll_links_pattern = rf'<li><a href="#" class="nav-link-section"[^>]*data-section="{re.escape(mod_id)}"[^>]*data-scroll="[^"]*"[^>]*>.*?</a></li>\n*'
        content = re.sub(scroll_links_pattern, '', content)
        # Insert subsection links after Giriş
        content = content.replace(giriş_marker, giriş_marker + insert_html)

    # Update lessonOrder in script
    # Build full order: for each module: giriş, subsections, sozluk, test
    full_order = []
    for mod_id in MODULE_SECTIONS:
        full_order.append(mod_id)
        if mod_id in sidebar_updates:
            for s in sidebar_updates[mod_id]['subsections']:
                full_order.append(s[0])
        # Add sozluk and test
        base = mod_id.replace('-sozluk', '').replace('-test', '')
        if base == mod_id:  # main section
            full_order.append(mod_id + '-sozluk')
            full_order.append(mod_id + '-test')
        # But sozluk/test ids vary: ders-0-etik-sozluk, ders-1-sozluk, etc.
    # The existing lessonOrder - we need to insert subsection ids
    old_order = ['ders-0-etik','ders-1-network-mantigi','ders-2-topolojiler','ders-3-soho','ders-4-fiziksel-katman','ders-5-kablosuz','ders-6-osi-tcpip','ders-7-mac-arp','ders-8-ip-subnetting','ders-9-tcp-udp','ders-10-dns-dhcp-nat','ders-11-yonlendirme','ders-12-troubleshooting','ders-13-kesif','ders-14-zafiyet','ders-15-simulasyon']
    new_order = []
    for mid in old_order:
        new_order.append(mid)
        if mid in sidebar_updates:
            for s in sidebar_updates[mid]['subsections']:
                new_order.append(s[0])
        # sozluk and test - get correct ids
        if mid == 'ders-0-etik':
            new_order.extend(['ders-0-etik-sozluk', 'ders-0-etik-test'])
        else:
            num = mid.replace('ders-', '').split('-')[0]
            if num.isdigit():
                new_order.extend([f'ders-{num}-sozluk', f'ders-{num}-test'])
    # Remove duplicates and preserve order
    seen = set()
    final_order = []
    for x in new_order:
        if x not in seen and x in content:
            seen.add(x)
            final_order.append(x)
    # Fix: ders-1-sozluk format for mod 1-15
    correct_order = []
    for mid in old_order:
        correct_order.append(mid)
        if mid in sidebar_updates:
            for s in sidebar_updates[mid]['subsections']:
                correct_order.append(s[0])
        if 'ders-0-etik' in mid:
            correct_order.extend(['ders-0-etik-sozluk', 'ders-0-etik-test'])
        else:
            m = re.match(r'ders-(\d+)-', mid)
            if m:
                n = m.group(1)
                correct_order.extend([f'ders-{n}-sozluk', f'ders-{n}-test'])
    seen = set()
    lesson_order = []
    for x in correct_order:
        if x not in seen:
            seen.add(x)
            lesson_order.append(x)

    # Replace lessonOrder in script
    old_lo = r"const lessonOrder = \['ders-0-etik','ders-1-network-mantigi','ders-2-topolojiler',[^\]]+\];"
    new_lo = "const lessonOrder = ['" + "','".join(lesson_order) + "'];"
    content = re.sub(old_lo, new_lo, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Done. Check the file.")

if __name__ == '__main__':
    main()
