#!/usr/bin/env node
/**
 * Converts Temel Network docx-extracted text to HTML
 * Reads from stdin or file, outputs HTML body content
 */
const fs = require('fs');
const path = process.argv[2] || '/tmp/temel-network-extracted.txt';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const raw = fs.readFileSync(path, 'utf8');
const lines = raw.split(/\r?\n/);

let out = [];
let inTable = false;
let tableRows = [];
let inList = false;
let listItems = [];
let i = 0;

function flushList() {
  if (listItems.length) {
    out.push('<ul>');
    listItems.forEach(li => out.push('<li>' + esc(li) + '</li>'));
    out.push('</ul>');
    listItems = [];
  }
  inList = false;
}

function flushTable() {
  if (tableRows.length >= 2) {
    out.push('<table><thead><tr><th>Terim</th><th>Türkçe karşılığı / açıklama</th></tr></thead><tbody>');
    const dataRows = tableRows.slice(2); // skip "Terim" and "Türkçe karşılığı" header lines
    for (let r = 0; r + 1 < dataRows.length; r += 2) {
      const term = dataRows[r].trim().replace(/^\u200f/, '');
      const trans = dataRows[r + 1].trim().replace(/^\u200f/, '');
      if (term && trans && !/^(Terimler|Kendini|MODÜL|\d+\))/.test(term)) {
        out.push('<tr><td>' + esc(term) + '</td><td>' + esc(trans) + '</td></tr>');
      }
    }
    out.push('</tbody></table>');
  }
  tableRows = [];
  inTable = false;
}

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();
  const nextTrimmed = lines[i + 1] ? lines[i + 1].trim() : '';

  if (/^MODÜL\s+\d+[\s–-]/.test(trimmed)) {
    flushList();
    flushTable();
    out.push('<h1>' + esc(trimmed) + '</h1>');
    i++;
    continue;
  }

  if (/^(Hedefler|Terimler Sözlüğü|Terimler sözlüğü|Kendini Değerlendir|Ana içerik|Modül Amaçları|Bu modülde neler)/i.test(trimmed) && trimmed.length < 80) {
    flushList();
    flushTable();
    out.push('<h2>' + esc(trimmed) + '</h2>');
    i++;
    continue;
  }

  if (/^\d+\.\d+(\s|$)/.test(trimmed) && trimmed.length < 100) {
    flushList();
    flushTable();
    out.push('<h3>' + esc(trimmed) + '</h3>');
    i++;
    continue;
  }

  const normTrim = trimmed.replace(/^\u200f/, '');
  const normNext = nextTrimmed.replace(/^\u200f/, '');
  if (normTrim === 'Terim' && normNext.toLowerCase().includes('türkçe')) {
    flushList();
    inTable = true;
    tableRows = [line, lines[i + 1]];
    i += 2;
    continue;
  }

  if (inTable) {
    const rowNorm = trimmed.replace(/^\u200f/, '');
    if (trimmed === '' || /^(Terimler|Kendini|MODÜL)$/i.test(rowNorm) || /^\d+\)\s*Terimler/i.test(rowNorm)) {
      flushTable();
      i++;
      continue;
    }
    tableRows.push(line);
    i++;
    continue;
  }

  if (/^\t•\t/.test(line) || (line.startsWith('\t') && line.includes('•'))) {
    const bullet = line.replace(/^\t•\t/, '').replace(/^\t/, '').replace(/^•\s*/, '').trim();
    if (bullet) {
      listItems.push(bullet);
      inList = true;
    }
    i++;
    continue;
  }

  if (inList && trimmed) {
    flushList();
  }

  if (trimmed === '') {
    flushList();
    i++;
    continue;
  }

  if (/^\d+\)\s*Terimler\s+Sözlüğü/i.test(normTrim)) {
    flushList();
    flushTable();
    out.push('<h2>' + esc(trimmed.replace(/^\d+\)\s*/, '')) + '</h2>');
    i++;
    continue;
  }

  if ((/^\d+\)\s/.test(trimmed) || /^\u200f?\d+\)/.test(trimmed)) && !/Terimler\s+Sözlüğü/i.test(trimmed)) {
    flushList();
    const q = trimmed.replace(/^[\u200f]?\d+\)\s*/, '');
    out.push('<p class="quiz-question"><strong>' + esc(q) + '</strong></p>');
    i++;
    continue;
  }

  if (/^Doğru şık:\s*[A-E]/.test(trimmed) || /^Doğru:\s*[A-E]/.test(trimmed)) {
    out.push('<p class="quiz-answer">' + esc(trimmed) + '</p>');
    i++;
    continue;
  }

  if (/^Gerekçe:/.test(trimmed)) {
    out.push('<p class="quiz-reason">' + esc(trimmed) + '</p>');
    i++;
    continue;
  }

  out.push('<p>' + esc(trimmed) + '</p>');
  i++;
}

flushList();
flushTable();

console.log(out.join('\n'));
