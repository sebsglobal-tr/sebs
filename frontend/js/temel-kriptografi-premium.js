/**
 * Temel Kriptografi modül sayfası: terim sözlükleri, senaryo ve kazanımlar için
 * premium DOM sarmalayıcıları. interactive-lesson.js bundan sonra yüklendiği için
 * DOMContentLoaded sırası: önce bu dosya, sonra flip kart / accordion bağları.
 */
(function () {
  'use strict';

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function wrapGlossaryTables() {
    document.querySelectorAll('.content-section .docx-content').forEach(function (card) {
      card.querySelectorAll('h3').forEach(function (h3) {
        if (h3.textContent.replace(/\s+/g, ' ').trim() !== 'Terimler Sözlüğü') return;
        if (h3.closest('.terimler-block')) return;
        var table = h3.nextElementSibling;
        if (!table || table.tagName !== 'TABLE' || !table.classList.contains('comparison-table')) return;
        var wrap = document.createElement('div');
        wrap.className = 'terimler-block';
        h3.parentNode.insertBefore(wrap, h3);
        wrap.appendChild(h3);
        wrap.appendChild(table);
      });
    });
  }

  function wrapScenarios() {
    document.querySelectorAll('.content-section .docx-content h3').forEach(function (h3) {
      var t = h3.textContent.replace(/\s+/g, ' ').trim();
      if (!/^Analitik Senaryo/i.test(t)) return;
      if (h3.closest('.scenario-block')) return;
      var block = document.createElement('div');
      block.className = 'scenario-block';
      var titleRow = document.createElement('div');
      titleRow.className = 'scenario-title';
      titleRow.innerHTML =
        '<i class="fas fa-diagram-project" aria-hidden="true"></i><span>' + escapeHtml(t) + '</span>';
      var body = document.createElement('div');
      body.className = 'scenario-body';
      var n = h3.nextSibling;
      while (n) {
        var next = n.nextSibling;
        if (n.nodeType === 1 && n.tagName === 'H3') break;
        body.appendChild(n);
        n = next;
      }
      block.appendChild(titleRow);
      block.appendChild(body);
      h3.parentNode.insertBefore(block, h3);
      h3.remove();
    });
  }

  function getModuleNumFromSectionId(id) {
    var m = /^kr-m(\d+)/.exec(id || '');
    return m ? parseInt(m[1], 10) : 0;
  }

  /** Modüle göre üst şerit SVG (statik, sunum amaçlı). */
  function svgRibbonForModule(mod) {
    var palettes = [
      { a: '#1e40af', b: '#3b82f6', c: '#d4a853' },
      { a: '#0f172a', b: '#334155', c: '#d4a853' },
      { a: '#7f1d1d', b: '#b91c1c', c: '#fcd34d' },
      { a: '#0369a1', b: '#0ea5e9', c: '#fef08a' },
      { a: '#0f766e', b: '#14b8a6', c: '#fde68a' },
      { a: '#5b21b6', b: '#7c3aed', c: '#fcd34d' },
      { a: '#9f1239', b: '#e11d48', c: '#a7f3d0' },
      { a: '#166534', b: '#22c55e', c: '#fef9c3' }
    ];
    var p = palettes[(mod - 1) % 8] || palettes[0];
    var common =
      '<svg class="kr-crypto-visual__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 96" fill="none" aria-hidden="true" focusable="false">';
    var end = '</svg>';
    if (mod === 1) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#f8fafc"/>' +
        '<text x="20" y="28" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Güvenlik hedefleri</text>' +
        '<rect x="20" y="40" width="108" height="44" rx="8" fill="' +
        p.a +
        '" fill-opacity="0.12" stroke="' +
        p.a +
        '"/>' +
        '<text x="44" y="68" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="12" font-weight="700">Gizlilik</text>' +
        '<rect x="146" y="40" width="108" height="44" rx="8" fill="' +
        p.b +
        '" fill-opacity="0.12" stroke="' +
        p.b +
        '"/>' +
        '<text x="168" y="68" fill="' +
        p.b +
        '" font-family="system-ui,sans-serif" font-size="12" font-weight="700">Bütünlük</text>' +
        '<rect x="272" y="40" width="108" height="44" rx="8" fill="' +
        p.c +
        '" fill-opacity="0.18" stroke="#b45309"/>' +
        '<text x="280" y="68" fill="#92400e" font-family="system-ui,sans-serif" font-size="12" font-weight="700">Kimlik doğrulama</text>' +
        end
      );
    }
    if (mod === 2) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#f8fafc"/>' +
        '<text x="20" y="30" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">İkili temsil</text>' +
        '<g font-family="ui-monospace,monospace" font-size="15" font-weight="700" fill="' +
        p.b +
        '">' +
        '<text x="24" y="72">0</text><text x="52" y="72">1</text><text x="80" y="72">0</text><text x="108" y="72">1</text>' +
        '<text x="136" y="72">1</text><text x="164" y="72">1</text><text x="192" y="72">0</text><text x="220" y="72">0</text>' +
        '</g>' +
        '<rect x="300" y="44" width="76" height="36" rx="8" fill="' +
        p.c +
        '" fill-opacity="0.35" stroke="' +
        p.a +
        '"/>' +
        '<text x="312" y="67" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Byte / XOR</text>' +
        end
      );
    }
    if (mod === 3) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#fffbeb"/>' +
        '<text x="20" y="30" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Klasik şifreler</text>' +
        '<text x="40" y="70" fill="' +
        p.b +
        '" font-size="20" font-weight="800" font-family="Georgia,serif">A</text>' +
        '<path d="M62 64h28" stroke="' +
        p.a +
        '" stroke-width="2"/>' +
        '<polygon points="92,64 84,59 84,69" fill="' +
        p.a +
        '"/>' +
        '<text x="108" y="70" fill="' +
        p.b +
        '" font-size="20" font-weight="800" font-family="Georgia,serif">D</text>' +
        '<text x="200" y="68" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="12">Yerine koyma · Transpozisyon</text>' +
        end
      );
    }
    if (mod === 4) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#f0f9ff"/>' +
        '<text x="20" y="30" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Simetrik şifreleme</text>' +
        '<rect x="24" y="44" width="88" height="40" rx="8" fill="#fff" stroke="' +
        p.b +
        '"/>' +
        '<text x="38" y="70" fill="' +
        p.a +
        '" font-size="11" font-weight="600">Alice</text>' +
        '<rect x="288" y="44" width="88" height="40" rx="8" fill="#fff" stroke="' +
        p.b +
        '"/>' +
        '<text x="302" y="70" fill="' +
        p.a +
        '" font-size="11" font-weight="600">Bob</text>' +
        '<rect x="168" y="48" width="64" height="32" rx="6" fill="' +
        p.c +
        '" stroke="' +
        p.a +
        '"/>' +
        '<text x="180" y="69" fill="#0f172a" font-size="10" font-weight="700" font-family="system-ui,sans-serif">K</text>' +
        '<path d="M112 64h48M240 64h48" stroke="' +
        p.b +
        '" stroke-width="2" stroke-dasharray="4 3"/>' +
        end
      );
    }
    if (mod === 5) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#f0fdfa"/>' +
        '<text x="20" y="30" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Hash · MAC · KDF</text>' +
        '<rect x="24" y="48" width="72" height="32" rx="6" fill="#fff" stroke="' +
        p.b +
        '"/>' +
        '<text x="36" y="69" fill="' +
        p.a +
        '" font-size="10" font-weight="600">Veri</text>' +
        '<path d="M100 64h40" stroke="' +
        p.b +
        '" stroke-width="2"/>' +
        '<polygon points="138,64 128,58 128,70" fill="' +
        p.b +
        '"/>' +
        '<rect x="144" y="46" width="120" height="36" rx="8" fill="' +
        p.c +
        '" fill-opacity="0.4" stroke="' +
        p.a +
        '"/>' +
        '<text x="158" y="70" fill="#134e4a" font-family="ui-monospace,monospace" font-size="11" font-weight="600">digest…</text>' +
        '<text x="280" y="68" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11">Sabit uzunluk özet</text>' +
        end
      );
    }
    if (mod === 6) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#faf5ff"/>' +
        '<text x="20" y="30" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Asimetrik kripto</text>' +
        '<rect x="28" y="46" width="120" height="38" rx="8" fill="#fff" stroke="#7c3aed"/>' +
        '<text x="58" y="70" fill="#5b21b6" font-size="11" font-weight="700">pub</text>' +
        '<rect x="252" y="46" width="120" height="38" rx="8" fill="#ede9fe" stroke="#5b21b6"/>' +
        '<text x="290" y="70" fill="#4c1d95" font-size="11" font-weight="700">priv</text>' +
        '<path d="M200 64c0-18 28-28 52-28" stroke="' +
        p.b +
        '" stroke-width="2" fill="none"/>' +
        end
      );
    }
    if (mod === 7) {
      return (
        common +
        '<rect width="400" height="96" rx="14" fill="#fff1f2"/>' +
        '<text x="20" y="30" fill="' +
        p.a +
        '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">PKI · TLS · Sertifika</text>' +
        '<rect x="32" y="50" width="100" height="28" rx="6" fill="#fff" stroke="#e11d48"/>' +
        '<text x="52" y="69" fill="#9f1239" font-size="10" font-weight="600">Kök CA</text>' +
        '<rect x="150" y="50" width="100" height="28" rx="6" fill="#fff" stroke="#fb7185"/>' +
        '<text x="168" y="69" fill="#be123c" font-size="10" font-weight="600">Ara CA</text>' +
        '<rect x="268" y="50" width="100" height="28" rx="6" fill="#ffe4e6" stroke="#e11d48"/>' +
        '<text x="285" y="69" fill="#881337" font-size="10" font-weight="600">Sunucu</text>' +
        end
      );
    }
    return (
      common +
      '<rect width="400" height="96" rx="14" fill="#f0fdf4"/>' +
      '<text x="20" y="30" fill="' +
      p.a +
      '" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Güvenli kullanım</text>' +
      '<path d="M48 72 L62 56 L76 72 L108 40 L140 72 L172 48 L196 72" stroke="' +
      p.b +
      '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="320" cy="58" r="22" fill="' +
      p.c +
      '" fill-opacity="0.5" stroke="' +
      p.a +
      '"/>' +
      '<path d="M310 58l7 7 16-16" stroke="' +
      p.a +
      '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="250" y="68" fill="' +
      p.a +
      '" font-family="system-ui,sans-serif" font-size="12" font-weight="600">Tehdit modeli</text>' +
      end
    );
  }

  function injectSectionVisuals() {
    document.querySelectorAll('.content-section').forEach(function (sec) {
      if (sec.dataset.krVisual === '1') return;
      var card = sec.querySelector('.content-card.docx-content');
      if (!card) return;
      var mod = getModuleNumFromSectionId(sec.id);
      if (!mod) return;
      sec.dataset.krVisual = '1';
      var fig = document.createElement('figure');
      fig.className = 'kr-crypto-visual';
      fig.setAttribute('role', 'presentation');
      fig.setAttribute('aria-hidden', 'true');
      fig.innerHTML = svgRibbonForModule(mod);
      card.insertBefore(fig, card.firstChild);
    });
  }

  function buildCardsFromTable(table) {
    var headers = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
      return th.textContent.replace(/\s+/g, ' ').trim();
    });
    var rows = table.querySelectorAll('tbody tr');
    var root = document.createElement('div');
    root.className = 'kr-table-cards';
    Array.prototype.forEach.call(rows, function (tr) {
      var cells = tr.querySelectorAll('td');
      if (!cells.length) return;
      var art = document.createElement('article');
      art.className = 'kr-data-card';
      if (cells.length === 1) {
        art.innerHTML =
          '<div class="kr-data-card__mono">' + escapeHtml(cells[0].textContent.trim()) + '</div>';
      } else if (cells.length === 2) {
        art.innerHTML =
          '<header class="kr-data-card__head">' +
          escapeHtml(cells[0].textContent.trim()) +
          '</header><div class="kr-data-card__body">' +
          escapeHtml(cells[1].textContent.trim()) +
          '</div>';
      } else {
        var inner = '';
        for (var i = 0; i < cells.length; i++) {
          var label = headers[i] || 'Alan ' + (i + 1);
          inner +=
            '<div class="kr-data-card__row"><span class="kr-data-card__k">' +
            escapeHtml(label) +
            '</span><span class="kr-data-card__v">' +
            escapeHtml(cells[i].textContent.trim()) +
            '</span></div>';
        }
        art.innerHTML = inner;
      }
      root.appendChild(art);
    });
    return root;
  }

  /** Terim sözlüğü dışındaki karşılaştırma tablolarına kart ızgarası + klasik tablo details içinde. */
  function enhanceComparisonTables() {
    document.querySelectorAll('.docx-content table.comparison-table').forEach(function (table) {
      if (table.closest('.terimler-block')) return;
      if (table.dataset.krCardified === '1') return;
      var bodyRows = table.querySelectorAll('tbody tr');
      if (!table.querySelector('thead') || !bodyRows.length) return;

      var cards = buildCardsFromTable(table);
      if (!cards.children.length) return;
      table.dataset.krCardified = '1';

      var wrap = document.createElement('div');
      wrap.className = 'kr-table-premium';
      var ribbon = document.createElement('div');
      ribbon.className = 'kr-table-cards-ribbon';
      ribbon.innerHTML =
        '<i class="fas fa-id-card" aria-hidden="true"></i><span>Kart görünümü</span>';
      var details = document.createElement('details');
      details.className = 'kr-table-source';
      var sum = document.createElement('summary');
      sum.textContent = 'Klasik tablo görünümü';
      var innerScroll = document.createElement('div');
      innerScroll.className = 'kr-table-scroll';

      var parent = table.parentNode;
      parent.insertBefore(wrap, table);
      wrap.appendChild(ribbon);
      wrap.appendChild(cards);
      wrap.appendChild(details);
      details.appendChild(sum);
      details.appendChild(innerScroll);
      innerScroll.appendChild(table);
    });
  }

  function wrapLearningObjectives() {
    document.querySelectorAll('.docx-content > .learning-objectives').forEach(function (lo) {
      if (lo.dataset.krPremiumAccordion === '1') return;
      lo.dataset.krPremiumAccordion = '1';
      if (lo.closest('.accordion-block')) return;
      var innerHeading = lo.querySelector('h3');
      var btnLabel = innerHeading ? innerHeading.textContent.replace(/\s+/g, ' ').trim() : 'Kazanımlar';
      var parent = lo.parentNode;
      var acc = document.createElement('div');
      acc.className = 'accordion-block expanded';
      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'accordion-trigger';
      trigger.setAttribute('aria-expanded', 'true');
      trigger.innerHTML =
        '<span><i class="fas fa-bullseye" aria-hidden="true"></i> ' +
        escapeHtml(btnLabel) +
        '</span><i class="fas fa-chevron-down" aria-hidden="true"></i>';
      var content = document.createElement('div');
      content.className = 'accordion-content';
      var inner = document.createElement('div');
      inner.className = 'accordion-content-inner';
      parent.insertBefore(acc, lo);
      acc.appendChild(trigger);
      acc.appendChild(content);
      content.appendChild(inner);
      inner.appendChild(lo);
      if (innerHeading) innerHeading.style.display = 'none';
    });
  }

  function decorate() {
    wrapGlossaryTables();
    wrapScenarios();
    wrapLearningObjectives();
    enhanceComparisonTables();
    injectSectionVisuals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorate);
  } else {
    decorate();
  }
})();
