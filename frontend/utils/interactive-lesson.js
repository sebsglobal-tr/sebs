/**
 * Interaktif ders öğeleri: Accordion, flip kartlar, reveal, sekmeler
 */
(function() {
  'use strict';

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }

  function run() {
    initFlipCardsFromGlossary();
    initAccordions();
    initRevealCards();
    initTabs();
  }

  /** Terimler tablosunu flip kartlara çevir */
  function initFlipCardsFromGlossary() {
    const blocks = document.querySelectorAll('.terimler-block');
    blocks.forEach(block => {
      const table = block.querySelector('.info-table-compact');
      if (!table) return;
      const rows = table.querySelectorAll('tbody tr');
      if (rows.length < 2) return;

      const grid = document.createElement('div');
      grid.className = 'flip-cards-grid';
      rows.forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length < 2) return;
        const term = cells[0].textContent.trim();
        const def = cells[1].textContent.trim();
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Terim: ' + term + ', tıklayarak açıklamayı göster');
        card.innerHTML = '<div class="flip-card-inner">' +
          '<div class="flip-card-front"><strong>' + escapeHtml(term) + '</strong><br><small style="opacity:0.7;font-size:0.8rem;">Tıkla &rarr; Açıklama</small></div>' +
          '<div class="flip-card-back"><span>' + escapeHtml(def) + '</span><br><small style="opacity:0.7;font-size:0.8rem;">Tekrar tıkla &rarr; Terim</small></div>' +
          '</div>';
        card.addEventListener('click', function() { this.classList.toggle('flipped'); });
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.classList.toggle('flipped'); }
        });
        grid.appendChild(card);
      });
      const header = document.createElement('div');
      header.style.cssText = 'margin:1rem 0 0.75rem;font-size:0.95rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;';
      header.innerHTML = '<span><i class="fas fa-th-large"></i> <strong>Etkileşimli terim kartları</strong> — Tıkla, açıklamayı gör</span>';
      block.insertBefore(header, table);
      block.insertBefore(grid, table);
    });
  }

  /** .accordion-block öğelerini etkinleştir */
  function initAccordions() {
    document.querySelectorAll('.accordion-block').forEach(block => {
      const trigger = block.querySelector('.accordion-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function() {
        block.classList.toggle('expanded');
      });
    });
  }

  /** .reveal-card öğelerini etkinleştir */
  function initRevealCards() {
    document.querySelectorAll('.reveal-card').forEach(card => {
      const btn = card.querySelector('.reveal-trigger');
      if (!btn) return;
      btn.addEventListener('click', function() {
        card.classList.add('revealed');
        btn.style.display = 'none';
      });
    });
  }

  /** .tabs-container sekmelerini etkinleştir */
  function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(container => {
      const nav = container.querySelector('.tabs-nav');
      const panels = container.querySelectorAll('.tab-panel');
      if (!nav || !panels.length) return;
      const buttons = nav.querySelectorAll('button');
      buttons.forEach((btn, idx) => {
        btn.addEventListener('click', function() {
          buttons.forEach(b => b.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          if (panels[idx]) panels[idx].classList.add('active');
        });
      });
      if (buttons[0]) {
        buttons[0].classList.add('active');
        if (panels[0]) panels[0].classList.add('active');
      }
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  init();
})();
