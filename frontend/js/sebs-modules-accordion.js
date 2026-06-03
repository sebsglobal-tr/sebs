/**
 * Eğitim modülleri — yatay accordion (hover/click ile genişleyen paneller)
 */
(function () {
  'use strict';

  var initialized = false;

  function levelLabel(card) {
    var badge = card.querySelector('.level-badge');
    if (!badge) return 'MODÜL';
    return (badge.textContent || 'Modül').trim().toUpperCase();
  }

  function buildPanelChrome(card, index) {
    if (card.dataset.sebsAccReady === '1') return;
    card.dataset.sebsAccReady = '1';
    card.classList.add('sebs-mod-acc-panel');

    var titleEl = card.querySelector('.simulation-info h3');
    var title = titleEl ? titleEl.textContent.trim() : 'Modül';
    var num = String(index + 1).padStart(2, '0');

    var head = document.createElement('div');
    head.className = 'sebs-mod-acc-head';
    head.innerHTML =
      '<span class="sebs-mod-acc-num">' + num + '</span>' +
      '<span class="sebs-mod-acc-badge">' + levelLabel(card) + '</span>';

    var collapsed = document.createElement('div');
    collapsed.className = 'sebs-mod-acc-collapsed-title';
    collapsed.textContent = title;
    collapsed.setAttribute('aria-hidden', 'true');

    var expanded = document.createElement('div');
    expanded.className = 'sebs-mod-acc-expanded';

    var imageTop = card.querySelector('.card-image-top');
    if (imageTop) imageTop.setAttribute('aria-hidden', 'true');

    ['simulation-header', 'simulation-content', 'simulation-footer'].forEach(function (sel) {
      var block = card.querySelector('.' + sel);
      if (block) expanded.appendChild(block);
    });

    var foot = document.createElement('div');
    foot.className = 'sebs-mod-acc-foot';
    foot.textContent = levelLabel(card);

    card.insertBefore(head, card.firstChild);
    card.appendChild(collapsed);
    card.appendChild(expanded);
    card.appendChild(foot);

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', title);
  }

  function addCtaPanel(grid) {
    if (grid.querySelector('.sebs-mod-acc-panel--cta')) return;

    var cta = document.createElement('article');
    cta.className = 'sebs-mod-acc-panel sebs-mod-acc-panel--cta';
    cta.setAttribute('data-sebs-acc-cta', '1');
    cta.setAttribute('role', 'link');
    cta.setAttribute('tabindex', '0');
    cta.setAttribute('aria-label', 'Paketleri keşfet');

    var count = grid.querySelectorAll('.sebs-mod-acc-panel:not(.sebs-mod-acc-panel--cta)').length;
    var num = String(count + 1).padStart(2, '0');

    cta.innerHTML =
      '<div class="sebs-mod-acc-head">' +
        '<span class="sebs-mod-acc-num">' + num + '</span>' +
      '</div>' +
      '<div class="sebs-mod-acc-collapsed-title">Paketleri Keşfet</div>' +
      '<div class="sebs-mod-acc-cta-body">' +
        '<p>İlk Adım, Yükseliş ve Zirve paketleriyle modüllere erişin.</p>' +
        '<a class="sebs-mod-acc-cta-link" href="/pricing.html">Planları Gör</a>' +
      '</div>';

    cta.addEventListener('click', function (e) {
      if (e.target.closest('.sebs-mod-acc-cta-link')) return;
      window.location.href = '/pricing.html';
    });

    cta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = '/pricing.html';
      }
    });

    grid.appendChild(cta);
  }

  function setActivePanel(grid, panel) {
    if (!grid || !panel) return;
    grid.querySelectorAll('.sebs-mod-acc-panel').forEach(function (p) {
      var active = p === panel;
      p.classList.toggle('is-active', active);
      p.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
  }

  function initGrid(grid) {
    if (grid.dataset.sebsAccGrid === '1') return;
    grid.dataset.sebsAccGrid = '1';
    grid.classList.add('sebs-modules-accordion');

    var cards = Array.prototype.slice.call(
      grid.querySelectorAll(':scope > .simulation-card-detailed')
    );

    cards.forEach(function (card, i) {
      buildPanelChrome(card, i);
    });

    addCtaPanel(grid);

    var panels = grid.querySelectorAll('.sebs-mod-acc-panel:not(.sebs-mod-acc-panel--cta)');
    if (panels.length) setActivePanel(grid, panels[0]);

    grid.addEventListener('click', function (e) {
      var panel = e.target.closest('.sebs-mod-acc-panel:not(.sebs-mod-acc-panel--cta)');
      if (!panel || !grid.contains(panel)) return;
      if (e.target.closest('a, button')) return;
      setActivePanel(grid, panel);
    });

    grid.addEventListener('keydown', function (e) {
      var panel = e.target.closest('.sebs-mod-acc-panel:not(.sebs-mod-acc-panel--cta)');
      if (!panel || !grid.contains(panel)) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActivePanel(grid, panel);
      }
    });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      panels.forEach(function (panel) {
        panel.addEventListener('mouseenter', function () {
          setActivePanel(grid, panel);
        });
      });

      grid.querySelectorAll('.sebs-mod-acc-panel--cta').forEach(function (cta) {
        cta.addEventListener('mouseenter', function () {
          grid.querySelectorAll('.sebs-mod-acc-panel:not(.sebs-mod-acc-panel--cta)').forEach(function (p) {
            p.classList.remove('is-active');
            p.setAttribute('aria-expanded', 'false');
          });
          cta.classList.add('is-active');
        });

        cta.addEventListener('mouseleave', function () {
          cta.classList.remove('is-active');
          if (panels.length) setActivePanel(grid, panels[0]);
        });
      });
    }
  }

  function initModulesAccordion() {
    if (initialized) return;
    if (!document.body.classList.contains('modules-page')) return;

    initialized = true;

    document.querySelectorAll('.module-category-section .simulations-grid').forEach(initGrid);

    if (window.RoadAccessUI && typeof window.RoadAccessUI.applyModuleCardLocks === 'function') {
      window.RoadAccessUI.applyModuleCardLocks();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModulesAccordion);
  } else {
    initModulesAccordion();
  }

  window.sebsInitModulesAccordion = initModulesAccordion;
})();
