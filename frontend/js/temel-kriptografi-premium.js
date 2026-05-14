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

  function injectSectionVisuals() {
    document.querySelectorAll('.content-section').forEach(function (sec) {
      if (sec.dataset.krVisual === '1') return;
      var card = sec.querySelector('.content-card.docx-content');
      if (!card) return;
      var mod = getModuleNumFromSectionId(sec.id);
      if (!mod) return;
      var build = window.krBuildLessonVisualSvg;
      if (typeof build !== 'function') {
        return;
      }
      var h2 = sec.querySelector('.section-header h2');
      var title = h2 ? h2.textContent.replace(/\s+/g, ' ').trim() : '';
      sec.dataset.krVisual = '1';
      var fig = document.createElement('figure');
      fig.className = 'kr-crypto-visual';
      if (typeof window.krResolveLessonVisualKind === 'function') {
        fig.setAttribute('data-kr-visual-kind', window.krResolveLessonVisualKind(title, sec.id, mod));
      }
      fig.setAttribute('role', 'presentation');
      fig.setAttribute('aria-hidden', 'true');
      fig.innerHTML = build(title, sec.id, mod);
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
