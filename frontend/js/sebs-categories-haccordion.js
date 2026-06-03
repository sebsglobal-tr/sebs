/**
 * Eğitim alanları keşif bölümü — dikey accordion → yatay accordion dönüşümü
 */
(function () {
  'use strict';

  function getItemTitle(item) {
    var el = item.querySelector('.sebs-acc-btn .font-semibold');
    return el ? el.textContent.trim() : 'Alan';
  }

  function transformExploreSection(exploreRoot, activateFn) {
    if (!exploreRoot || exploreRoot.dataset.sebsHaccReady === '1') return;
    exploreRoot.dataset.sebsHaccReady = '1';

    var stack = exploreRoot.querySelector('.modules-category-tabs');
    if (!stack) return;

    stack.classList.add('sebs-cat-haccordion');
    stack.classList.remove('sebs-accordion-stack');

    var previewRoot = exploreRoot.querySelector('#modules-explore-preview');
    if (previewRoot) previewRoot.classList.add('sebs-cat-hacc-preview-source');

    var items = stack.querySelectorAll('.sebs-accordion-item');
    items.forEach(function (item, index) {
      if (item.dataset.sebsHaccItem === '1') return;
      item.dataset.sebsHaccItem = '1';
      item.classList.add('sebs-cat-hacc-item');

      var num = document.createElement('span');
      num.className = 'sebs-cat-hacc-num';
      num.textContent = String(index + 1).padStart(2, '0');
      item.insertBefore(num, item.firstChild);

      var badge = document.createElement('span');
      badge.className = 'sebs-cat-hacc-badge';
      badge.textContent = 'ALAN';
      item.insertBefore(badge, item.firstChild.nextSibling);

      var collapsed = document.createElement('div');
      collapsed.className = 'sebs-cat-hacc-collapsed';
      collapsed.textContent = getItemTitle(item);
      item.appendChild(collapsed);

      var foot = document.createElement('div');
      foot.className = 'sebs-cat-hacc-foot';
      foot.textContent = getItemTitle(item);
      item.appendChild(foot);

      var block = item.querySelector('.sebs-acc-block');
      if (block) {
        var body = document.createElement('div');
        body.className = 'sebs-cat-hacc-body';
        while (block.firstChild) body.appendChild(block.firstChild);
        block.replaceWith(body);

        var panelId = item.getAttribute('data-sebs-panel');
        if (previewRoot && panelId !== null) {
          var slide = previewRoot.querySelector('[data-sebs-visual="' + panelId + '"]');
          if (slide) {
            var previewWrap = document.createElement('div');
            previewWrap.className = 'sebs-cat-hacc-preview';
            previewWrap.appendChild(slide);
            body.appendChild(previewWrap);
          }
        }
      }
    });

    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        var btn = item.querySelector('[data-sebs-acc]');
        if (btn && e.target !== btn && !btn.contains(e.target)) {
          btn.click();
        }
      });

      if (canHover) {
        item.addEventListener('mouseenter', function () {
          if (typeof activateFn === 'function') activateFn(item);
        });
      }
    });
  }

  window.sebsEnhanceCategoryAccordion = function (exploreRoot, activateFn) {
    transformExploreSection(exploreRoot, activateFn);
  };
})();
