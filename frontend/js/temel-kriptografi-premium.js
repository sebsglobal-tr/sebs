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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorate);
  } else {
    decorate();
  }
})();
