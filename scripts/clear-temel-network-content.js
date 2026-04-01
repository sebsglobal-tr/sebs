/**
 * Clears all lesson content from Temel Network module.
 * Keeps: layout, sidebar, section headers, lesson controls.
 * Replaces content with placeholder.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/temel-network-egitimi.html');
let html = fs.readFileSync(filePath, 'utf8');

const PLACEHOLDER = '\n<p class="content-placeholder">İçerik buraya eklenecek.</p>\n';

function replaceSectionInnerContent(html) {
  const result = [];
  let i = 0;
  const len = html.length;

  while (i < len) {
    const startMark = '<div class="section-inner">';
    const startIdx = html.indexOf(startMark, i);
    if (startIdx === -1) {
      result.push(html.slice(i));
      break;
    }

    result.push(html.slice(i, startIdx + startMark.length));

    let depth = 1;
    let j = startIdx + startMark.length;
    let closePos = -1;
    while (j < len && depth > 0) {
      const nextOpen = html.indexOf('<div', j);
      const nextClose = html.indexOf('</div>', j);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        j = nextOpen + 4;
      } else {
        depth--;
        closePos = nextClose;
        j = nextClose + 6;
      }
    }

    result.push(PLACEHOLDER);
    result.push('</div>'); // section-inner close
    i = closePos !== -1 ? closePos + 6 : j;
  }

  return result.join('');
}

function replaceTerimlerBlock(html) {
  return html.replace(
    /<div class="terimler-block">[\s\S]*?<\/div>(?=\s*<\/div>\s*<\/div>)/g,
    '<div class="terimler-block"><table><thead><tr><th>Terim</th><th>Açıklama</th></tr></thead><tbody></tbody></table></div>'
  );
}

function replaceSorularBlock(html) {
  return html.replace(
    /<div id="[^"]*" class="sorular-block">[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/section>)/g,
    (match) => {
      const idMatch = match.match(/id="([^"]*)"/);
      const id = idMatch ? idMatch[1] : 'quiz';
      return `<div id="${id}" class="sorular-block"><p class="content-placeholder">Değerlendirme soruları buraya eklenecek.</p>`;
    }
  );
}

// First handle terimler-block (glossary) - replace entire block content
html = replaceTerimlerBlock(html);

// Then replace section-inner content
html = replaceSectionInnerContent(html);

// Handle sorular-block (quiz sections)
html = replaceSorularBlock(html);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Temel Network içeriği temizlendi. Dosya kaydedildi.');
