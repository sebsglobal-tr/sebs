#!/usr/bin/env node
/**
 * Parses Temel Network DOCX into Lesson 1..N.
 * LESSON RULE: New lesson only on MODÜL (main topic).
 * SECTION RULE: Subtopics (1.1, 1.2, Mini Senaryo, Terimler, Kendini Değerlendir) stay inside the lesson.
 * SIDEBAR: Lesson Title with subtopics as anchor links.
 */
const fs = require('fs');
const path = require('path');

const INPUT = process.argv[2] || '/tmp/temel-network-full.txt';
const OUT_JSON = path.join(__dirname, '..', 'data', 'temel-network-lessons.json');
const OUT_HTML = path.join(__dirname, '..', 'modules', 'temel-network-content.generated.html');

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toAnchorId(s) {
  return String(s || '')
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .toLowerCase();
}

const raw = fs.readFileSync(INPUT, 'utf8');
const lines = raw.split(/\r?\n/);

// Find MODÜL boundaries only (main topics)
const MODUL_MATCH = /^[\u200f]?MODÜL\s+\d+[\s–-]/;
const moduleStarts = [];
for (let i = 0; i < lines.length; i++) {
  if (MODUL_MATCH.test(lines[i].trim())) {
    moduleStarts.push({ i, line: lines[i].trim() });
  }
}

// Each MODÜL = one Lesson
const lessons = [];
for (let k = 0; k < moduleStarts.length; k++) {
  const start = moduleStarts[k];
  const endLine = moduleStarts[k + 1] ? moduleStarts[k + 1].i : lines.length;
  const contentLines = lines.slice(start.i, endLine);

  const lessonNum = k + 1;
  const fullTitle = start.line.replace(/^[\u200f]?MODÜL\s+\d+\s*[—–:\-]\s*/, '').trim();
  const shortTitle = fullTitle.split(':')[0].split('—')[0].trim();

  lessons.push({
    num: lessonNum,
    id: `lesson-${lessonNum}`,
    title: shortTitle,
    fullTitle: fullTitle,
    content: contentLines.join('\n'),
  });
}

// Detect subsections within content for sidebar (in document order, no duplicates)
function detectSubsections(content) {
  const lns = content.split('\n');
  const subs = [];
  const seen = new Set();
  for (let i = 0; i < lns.length; i++) {
    const t = lns[i].trim().replace(/^\u200f/, '');
    if (/^\d+\.\d+(\.\d+)?\s+[A-Za-z\u00C0-\u024F]/.test(t) && t.length < 100) {
      const slug = toAnchorId(t.slice(0, 50));
      if (!seen.has(slug)) {
        seen.add(slug);
        subs.push({ type: 'section', label: t.slice(0, 55), slug, icon: 'fa-file-alt' });
      }
    } else if (/^Terimler Sözlüğü/i.test(t) && t.length < 50 && !seen.has('terimler')) {
      seen.add('terimler');
      subs.push({ type: 'glossary', label: 'Terimler Sözlüğü', slug: 'terimler', icon: 'fa-book-open' });
    } else if (/^Kendini Değerlendir/i.test(t) && t.length < 50 && !seen.has('quiz')) {
      seen.add('quiz');
      subs.push({ type: 'quiz', label: 'Kendini Değerlendir', slug: 'quiz', icon: 'fa-clipboard-check' });
    } else if (/^Troubleshooting mini senaryosu/i.test(t) && !seen.has('mini-senaryo')) {
      seen.add('mini-senaryo');
      subs.push({ type: 'scenario', label: 'Mini Senaryo', slug: 'mini-senaryo', icon: 'fa-wrench' });
    } else if (/^Bu modülde neler/i.test(t) && t.length < 50 && !seen.has('ozet')) {
      seen.add('ozet');
      subs.push({ type: 'summary', label: 'Özet', slug: 'ozet', icon: 'fa-check-double' });
    }
  }
  return subs;
}

// Convert content to HTML with subsection anchors
function convertContentToHtml(text, lessonId) {
  const lns = text.split('\n');
  let out = [];
  let i = 0;
  let inTable = false;
  let tableRows = [];
  let listItems = [];
  let currentAnchor = null;
  let inAccordion = false;
  let girisOpen = true;

  function flushList() {
    if (listItems.length) {
      out.push('<ul>');
      listItems.forEach(li => out.push('<li>' + esc(li) + '</li>'));
      out.push('</ul>');
      listItems = [];
    }
  }
  function flushTable() {
    if (tableRows.length >= 2) {
      out.push('<table class="info-table-compact"><thead><tr><th>Terim</th><th>Açıklama</th></tr></thead><tbody>');
      for (let r = 0; r + 1 < tableRows.length; r += 2) {
        const term = tableRows[r].trim().replace(/^\u200f/, '');
        const trans = tableRows[r + 1].trim().replace(/^\u200f/, '');
        if (term && trans && !/^(Terimler|Kendini|MODÜL)$/i.test(term)) {
          out.push('<tr><td>' + esc(term) + '</td><td>' + esc(trans) + '</td></tr>');
        }
      }
      out.push('</tbody></table>');
    }
    tableRows = [];
    inTable = false;
  }

  function openAnchor(id, tag, title) {
    if (currentAnchor) out.push('</div>');
    else if (girisOpen) { out.push('</div>'); girisOpen = false; }
    currentAnchor = id;
    out.push(`<div id="${lessonId}-${id}" class="lesson-subsection">`);
    out.push(`<${tag}>` + esc(title) + `</${tag}>`);
  }

  function topologyDiagram(type) {
    const wrap = (svg) => '<div class="topology-diagram"><div class="topology-svg">' + svg + '</div></div>';
    const node = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#3b82f6" stroke="#d4a853" stroke-width="2"/>';
    const line = (x1, y1, x2, y2) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#60a5fa" stroke-width="2" stroke-opacity="0.8"/>';
    const backbone = (x1, y1, x2, y2) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#d4a853" stroke-width="3"/>';
    if (type === 'bus') {
      const svg = '<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="280" height="100" fill="url(#bg1)" rx="8"/>' + backbone(30, 50, 250, 50) + node(40, 50) + node(100, 50) + node(160, 50) + node(220, 50) + '<text x="140" y="88" fill="#94a3b8" font-size="10" text-anchor="middle">Bus (Doğrusal)</text></svg>';
      return wrap(svg);
    }
    if (type === 'ring') {
      const cx = 140; const cy = 50; const r = 35;
      const svg = '<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="280" height="100" fill="url(#bg2)" rx="8"/>' + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#d4a853" stroke-width="2"/>' + [0, 90, 180, 270].map(a => { const rad = a * Math.PI / 180; const x = cx + r * Math.cos(rad); const y = cy + r * Math.sin(rad); return node(x, y); }).join('') + line(cx + r, cy, cx + r * 0.7, cy - r * 0.7) + line(cx + r * 0.7, cy - r * 0.7, cx - r * 0.7, cy - r * 0.7) + line(cx - r * 0.7, cy - r * 0.7, cx - r, cy) + line(cx - r, cy, cx - r * 0.7, cy + r * 0.7) + '<text x="140" y="88" fill="#94a3b8" font-size="10" text-anchor="middle">Ring (Halka)</text></svg>';
      return wrap(svg);
    }
    if (type === 'star') {
      const cx = 140; const cy = 45; const r = 30;
      const svg = '<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="280" height="100" fill="url(#bg3)" rx="8"/>' + node(cx, cy) + [0, 72, 144, 216, 288].map(a => { const rad = (a - 90) * Math.PI / 180; const x = cx + r * Math.cos(rad); const y = cy + r * Math.sin(rad); return line(cx, cy, x, y) + node(x, y); }).join('') + '<text x="140" y="88" fill="#94a3b8" font-size="10" text-anchor="middle">Star (Yıldız)</text></svg>';
      return wrap(svg);
    }
    if (type === 'mesh') {
      const pts = [[70, 30], [210, 30], [70, 70], [210, 70]];
      let lines = ''; pts.forEach((p, i) => { pts.slice(i + 1).forEach(q => { lines += line(p[0], p[1], q[0], q[1]); }); });
      const nodes = pts.map(p => node(p[0], p[1])).join('');
      const svg = '<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="280" height="100" fill="url(#bg4)" rx="8"/>' + lines + nodes + '<text x="140" y="88" fill="#94a3b8" font-size="10" text-anchor="middle">Mesh (Örgü)</text></svg>';
      return wrap(svg);
    }
    if (type === 'hybrid') {
      const svg = '<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="280" height="100" fill="url(#bg5)" rx="8"/>' + backbone(20, 50, 260, 50) + node(50, 50) + node(140, 50) + node(230, 50) + line(50, 50, 50, 25) + node(50, 25) + line(140, 50, 140, 25) + node(140, 25) + line(230, 50, 230, 25) + node(230, 25) + '<text x="140" y="88" fill="#94a3b8" font-size="10" text-anchor="middle">Hybrid (Melez)</text></svg>';
      return wrap(svg);
    }
    return '';
  }

  out.push('<div id="' + lessonId + '-giris" class="lesson-subsection">');
  while (i < lns.length) {
    const line = lns[i];
    const t = line.trim();
    const tNorm = t.replace(/^\u200f/, '');
    const next = lns[i + 1] ? lns[i + 1].trim() : '';

    if (/^İpucu:/.test(t) || /^İpucu\s*:/.test(t)) {
      flushList(); flushTable();
      const body = t.replace(/^İpucu\s*:?\s*/, '');
      out.push('<div class="callout-box tip"><div class="callout-icon"><i class="fas fa-lightbulb"></i></div><div class="callout-body"><h5>İpucu</h5><p>' + esc(body) + '</p></div></div>');
      i++; continue;
    }
    if (/^Dikkat:/.test(t) || /^Dikkat\s*:/.test(t)) {
      flushList(); flushTable();
      const body = t.replace(/^Dikkat\s*:?\s*/, '');
      out.push('<div class="callout-box warning"><div class="callout-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="callout-body"><h5>Dikkat</h5><p>' + esc(body) + '</p></div></div>');
      i++; continue;
    }
    if (/^Bilgi:/.test(t) || /^Bilgi\s*:/.test(t)) {
      flushList(); flushTable();
      const body = t.replace(/^Bilgi\s*:?\s*/, '');
      out.push('<div class="callout-box info"><div class="callout-icon"><i class="fas fa-info-circle"></i></div><div class="callout-body"><h5>Bilgi</h5><p>' + esc(body) + '</p></div></div>');
      i++; continue;
    }
    if (/^Tanım:/.test(t) || /^Tanım\s*:/.test(t)) {
      flushList(); flushTable();
      const body = t.replace(/^Tanım\s*:?\s*/, '');
      out.push('<div class="concept-card"><div class="concept-card-icon"><i class="fas fa-book"></i></div><h5>Tanım</h5><p>' + esc(body) + '</p></div>');
      i++; continue;
    }
    if (/^Örnek:/.test(t) || /^Örnek\s*:/.test(t)) {
      flushList(); flushTable();
      const title = t.replace(/^Örnek\s*:?\s*/, '').trim();
      const exampleLines = [];
      let j = i + 1;
      while (j < lns.length) {
        const nl = lns[j].trim().replace(/^\u200f/, '');
        if (!nl) break;
        if (/^(Dikkat|İpucu|Bilgi|Terimler|Kendini|MODÜL|\d+\.\d+)/.test(nl)) break;
        exampleLines.push(nl);
        j++;
      }
      const isComparisonTable = exampleLines.length >= 6 &&
        /Senaryo/i.test(exampleLines[0]) &&
        (/Ağ olmasaydı|Standalone/i.test(exampleLines[1]) || /Ağ ortamında|Connected/i.test(exampleLines[2]));
      let inner = '';
      if (isComparisonTable && exampleLines.length >= 7) {
        const headers = [exampleLines[0], exampleLines[1], exampleLines[2]];
        const rows = [];
        for (let r = 3; r + 2 < exampleLines.length; r += 3) {
          rows.push([exampleLines[r], exampleLines[r + 1], exampleLines[r + 2]]);
        }
        inner = '<table class="info-table-compact"><thead><tr>' + headers.map(h => '<th>' + esc(h) + '</th>').join('') + '</thead><tbody>';
        rows.forEach(row => { inner += '<tr>' + row.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>'; });
        inner += '</tbody></table>';
      } else {
        inner = exampleLines.length ? exampleLines.map(l => '<p>' + esc(l) + '</p>').join('') : '';
      }
      out.push('<div class="visual-card"><h5><i class="fas fa-chart-line" style="margin-right:0.4rem;"></i>Gerçek dünya örneği</h5>' + (title ? '<p><strong>' + esc(title) + '</strong></p>' : '') + inner + '</div>');
      i = j; continue;
    }
    if (t === 'Terim' && next.toLowerCase().includes('türkçe')) {
      flushList();
      inTable = true;
      tableRows = [line, lns[i + 1]];
      i += 2;
      continue;
    }
    if (inTable) {
      if (!t || /^(Terimler|Kendini|MODÜL)/i.test(tNorm)) { flushTable(); i++; continue; }
      tableRows.push(line);
      i++; continue;
    }
    if (/^\t•\t/.test(line) || (line.startsWith('\t') && line.includes('•'))) {
      const bullet = line.replace(/^\t•\t/, '').replace(/^\t/, '').replace(/^•\s*/, '').trim();
      if (bullet) listItems.push(bullet);
      i++; continue;
    }
    if (listItems.length && t) flushList();
    if (!t) { i++; continue; }

    if (MODUL_MATCH.test(t)) {
      if (currentAnchor) { out.push('</div>'); currentAnchor = null; }
      out.push('<h2>' + esc(t) + '</h2>');
      i++; continue;
    }
    if (/^(Hedefler|Modül Amaçları|Ana içerik)$/i.test(t) && t.length < 30) {
      out.push('<h3>' + esc(t) + '</h3>');
      i++; continue;
    }
    if (/^Terimler Sözlüğü/i.test(tNorm) && t.length < 50) {
      if (currentAnchor) { out.push('</div>'); currentAnchor = null; }
      openAnchor('terimler', 'h3', t);
      i++; continue;
    }
    if (/^Kendini Değerlendir/i.test(tNorm) && t.length < 50) {
      if (currentAnchor) { out.push('</div>'); currentAnchor = null; }
      openAnchor('quiz', 'h3', t);
      i++; continue;
    }
    if (/^Bu modülde neler/i.test(tNorm) && t.length < 50) {
      if (currentAnchor) { out.push('</div>'); currentAnchor = null; }
      openAnchor('ozet', 'h3', t);
      i++; continue;
    }
    if (/^Troubleshooting mini senaryosu/i.test(t) || /^Mini [Ss]enaryo/i.test(t)) {
      if (currentAnchor) { out.push('</div>'); currentAnchor = null; }
      openAnchor('mini-senaryo', 'h4', t);
      out.push('<div class="scenario-block"><div class="scenario-title"><i class="fas fa-wrench"></i> ' + esc(t) + '</div><div class="scenario-body">');
      i++;
      while (i < lns.length && lns[i].trim() && !/^\d+\.\d+/.test(lns[i].trim()) && !/^Terimler|^Kendini|^MODÜL/i.test(lns[i].trim())) {
        out.push('<p>' + esc(lns[i].trim()) + '</p>');
        i++;
      }
      out.push('</div></div>');
      continue;
    }
    if (/^Ne anlama gelir\??\s*$/i.test(t) && !inAccordion) {
      flushList(); flushTable();
      out.push('<div class="accordion-block"><button type="button" class="accordion-trigger">Ne anlama gelir? <i class="fas fa-chevron-down"></i></button><div class="accordion-content"><div class="accordion-content-inner">');
      inAccordion = true;
      i++; continue;
    }
    if (inAccordion && (/^Gerçek hayatta|^Nasıl doğrularım|^Analoji|^\d+\.\d+\s+[A-Z]|^Dikkat:|^İpucu:|^Terimler|^Kendini|^MODÜL|^Troubleshooting/i.test(t) || (t === '' && lns[i + 1] && /^[A-Z\u00C0-\u024F]/.test(lns[i + 1].trim().slice(0, 1))))) {
      out.push('</div></div></div>');
      inAccordion = false;
      continue;
    }
    if (/^\d+\.\d+(\.\d+)?\s+[A-Za-z]/.test(t) && t.length < 120) {
      if (inAccordion) { out.push('</div></div></div>'); inAccordion = false; }
      if (currentAnchor) { out.push('</div>'); currentAnchor = null; }
      const slug = toAnchorId(t.slice(0, 40));
      openAnchor(slug, 'h4', t);
      if (/2\.1\.1.*Bus|Bus.*Topoloji/i.test(t)) out.push(topologyDiagram('bus'));
      else if (/2\.1\.2.*Ring|Ring.*Topoloji/i.test(t)) out.push(topologyDiagram('ring'));
      else if (/2\.1\.3.*Star|Star.*Topoloji/i.test(t)) out.push(topologyDiagram('star'));
      else if (/2\.1\.4.*Mesh|Mesh.*Topoloji/i.test(t)) out.push(topologyDiagram('mesh'));
      else if (/2\.1\.5.*Hybrid|Hybrid.*Topoloji/i.test(t)) out.push(topologyDiagram('hybrid'));
      i++; continue;
    }
    if ((/^\d+\)\s/.test(t) || /^‏?\d+\)\s/.test(t)) && !/Terimler/i.test(t)) {
      const q = t.replace(/^[\u200f]?\d+\)\s*/, '');
      out.push('<p class="quiz-question"><strong>' + esc(q) + '</strong></p>');
      i++; continue;
    }
    if (/^Doğru şık:\s*[A-E]/i.test(t) || /^Doğru:\s*[A-E]/i.test(t)) {
      out.push('<p class="quiz-answer">' + esc(t) + '</p>');
      i++; continue;
    }
    if (/^Gerekçe:/.test(t)) {
      out.push('<p class="quiz-reason">' + esc(t) + '</p>');
      i++; continue;
    }
    if (/karşılaştırma tablosu/i.test(t) && t.length < 100) {
      flushList(); flushTable();
      const title = t;
      const tableLines = [];
      let j = i + 1;
      while (j < lns.length) {
        const nl = (lns[j] || '').trim().replace(/^\u200f/, '');
        if (!nl) break;
        if (/^(Dikkat|İpucu|Bilgi|Terimler|Kendini|MODÜL)\s*:/.test(nl)) break;
        if (/^\d+\.\d+\s+[A-Z\u00C0-\u024F]/.test(nl)) break;
        tableLines.push(nl);
        j++;
      }
      const colCount = 6;
      const headerStr = tableLines.slice(0, colCount).join(' ');
      if (tableLines.length >= colCount + 1 && (/Özellik|Bus|Star|Mesh|Ring|Hybrid/.test(headerStr) || /Özellik/.test(headerStr))) {
        const headers = tableLines.slice(0, colCount);
        const rows = [];
        for (let r = colCount; r + colCount <= tableLines.length; r += colCount) {
          rows.push(tableLines.slice(r, r + colCount));
        }
        if (rows.length > 0) {
          let tbl = '<div class="visual-card"><h5><i class="fas fa-table" style="margin-right:0.4rem;"></i>' + esc(title) + '</h5><table class="info-table-compact"><thead><tr>';
          headers.forEach(h => tbl += '<th>' + esc(h) + '</th>');
          tbl += '</tr></thead><tbody>';
          rows.forEach(row => {
            tbl += '<tr>';
            row.forEach(c => tbl += '<td>' + esc(c) + '</td>');
            tbl += '</tr>';
          });
          tbl += '</tbody></table></div>';
          out.push(tbl);
          i = j;
          continue;
        }
      }
      out.push('<h4>' + esc(title) + '</h4>');
      tableLines.forEach(l => out.push('<p>' + esc(l) + '</p>'));
      i = j;
      continue;
    }
    out.push('<p>' + esc(t) + '</p>');
    i++;
  }
  flushList();
  flushTable();
  if (inAccordion) out.push('</div></div></div>');
  if (currentAnchor) out.push('</div>');
  else if (girisOpen) out.push('</div>');
  return out.join('\n');
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify({ lessons: lessons.map(l => ({ ...l, subsections: detectSubsections(l.content) })) }, null, 2), 'utf8');
console.log('Wrote', OUT_JSON, '-', lessons.length, 'lessons');

// Build HTML and sidebar
let htmlSections = '';
let navItems = '';

lessons.forEach((les, idx) => {
  const subsections = detectSubsections(les.content);
  const isActive = idx === 0 ? ' active' : '';
  const hasGlossary = les.content.includes('Terim') && les.content.toLowerCase().includes('türkçe');
  const hasQuiz = /Kendini Değerlendir|Doğru şık:/i.test(les.content);
  const wrapper = hasGlossary ? 'terimler-block' : hasQuiz ? 'sorular-block' : '';
  const body = convertContentToHtml(les.content, les.id);

  navItems += `                        <li class="nav-module-header">Lesson ${les.num} — ${esc(les.title)}</li>\n`;
  navItems += `                        <li><a href="#" class="nav-link-section" data-section="${les.id}" data-scroll="${les.id}-giris"><i class="fas fa-play-circle"></i> Giriş</a></li>\n`;
  subsections.forEach(sub => {
    navItems += `                        <li><a href="#" class="nav-link-section" data-section="${les.id}" data-scroll="${les.id}-${sub.slug}"><i class="fas ${sub.icon}"></i> ${esc(sub.label)}</a></li>\n`;
  });

  htmlSections += `
            <section class="content-section${isActive} docx-content" id="${les.id}" data-section="${les.id}">
                <div class="section-header">
                    <h2><i class="fas fa-book"></i> Lesson ${les.num} — ${esc(les.title)}</h2>
                    <div class="lesson-controls">
                        <button class="btn-complete-lesson" onclick="completeLesson('${les.id}')">
                            <i class="fas fa-check"></i> Dersi Tamamla
                        </button>
                    </div>
                </div>
                <div class="content-body lesson-content">
                    <div class="section-inner ${wrapper}">
${body}
                    </div>
                </div>
            </section>
`;
});

const fullHtml = `<!-- GENERATED by scripts/build-temel-network-from-docx.js - DO NOT EDIT BY HAND -->
<!-- Sidebar: Lesson titles + subtopic anchor links -->
${navItems}

<!-- Content: One section per lesson, subsections with ids for anchors -->
${htmlSections}
`;

fs.writeFileSync(OUT_HTML, fullHtml, 'utf8');
console.log('Wrote', OUT_HTML);
