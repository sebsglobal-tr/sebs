/**
 * Tüm premium-lesson modülleri: comparison-table → kart ızgarası + klasik tablo (details).
 * Temel Kriptografi sayfasında temel-kriptografi-premium.js önce çalışır (terimler sözlüğü sarması vb.);
 * Bu dosya sonra yüklenmeli.
 */
(function () {
  'use strict';

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
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

  function getLessonScope() {
    var m = document.querySelector('main');
    if (m) return m;
    var s = document.querySelector('section.module-content');
    if (s) return s;
    var c = document.querySelector('.main-content');
    if (c) return c;
    return document.body;
  }

  function enhanceComparisonTables() {
    var scope = getLessonScope();
    scope.querySelectorAll('table.comparison-table').forEach(function (table) {
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

  function run() {
    enhanceComparisonTables();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
