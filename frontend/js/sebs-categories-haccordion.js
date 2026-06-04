/**
 * Eğitim alanları keşif bölümü — yatay accordion (premium açık panel)
 */
(function () {
  'use strict';

  function getItemTitle(item) {
    var el = item.querySelector('.sebs-acc-btn .font-semibold');
    return el ? el.textContent.trim() : 'Alan';
  }

  function buildPremiumBody(item, body) {
    if (body.querySelector('.sebs-cat-hacc-premium')) return;

    var btn = body.querySelector('.sebs-acc-btn');
    var panel = body.querySelector('.sebs-acc-panel');
    if (!btn) return;

    var title = getItemTitle(item);
    var summaryEl = btn.querySelector('[data-sebs-summary]');
    var summary = summaryEl ? summaryEl.textContent.trim() : '';
    var descEl = panel ? panel.querySelector('p') : null;
    var desc = descEl ? descEl.textContent.trim() : '';
    var cta = panel ? panel.querySelector('.sebs-acc-cta') : null;
    var icon = btn.querySelector('.sebs-acc-icon');

    btn.classList.add('sebs-cat-hacc-sr-btn');

    var inner = document.createElement('div');
    inner.className = 'sebs-cat-hacc-inner';

    var premium = document.createElement('div');
    premium.className = 'sebs-cat-hacc-premium';

    var headline = document.createElement('div');
    headline.className = 'sebs-cat-hacc-headline';

    if (icon) {
      var iconWrap = document.createElement('div');
      iconWrap.className = 'sebs-cat-hacc-headline-icon';
      iconWrap.appendChild(icon.cloneNode(true));
      headline.appendChild(iconWrap);
    }

    var textWrap = document.createElement('div');
    textWrap.className = 'sebs-cat-hacc-headline-text';
    var h3 = document.createElement('h3');
    h3.textContent = title;
    textWrap.appendChild(h3);
    if (summary) {
      var sum = document.createElement('p');
      sum.className = 'sebs-cat-hacc-summary';
      sum.textContent = summary;
      textWrap.appendChild(sum);
    }
    headline.appendChild(textWrap);
    premium.appendChild(headline);

    if (desc) {
      var descP = document.createElement('p');
      descP.className = 'sebs-cat-hacc-desc';
      descP.textContent = desc;
      premium.appendChild(descP);
    }

    var actions = document.createElement('div');
    actions.className = 'sebs-cat-hacc-actions';
    if (cta) {
      var link = document.createElement('a');
      link.className = 'sebs-cat-hacc-link';
      link.href = cta.getAttribute('href') || '#';
      link.setAttribute('aria-label', cta.getAttribute('aria-label') || title + ' modüllerine git');
      link.innerHTML = 'Modülleri keşfet <span class="sebs-cat-hacc-link-arrow" aria-hidden="true">→</span>';
      actions.appendChild(link);
    }
    premium.appendChild(actions);

    var footline = document.createElement('div');
    footline.className = 'sebs-cat-hacc-footline';
    footline.innerHTML = '<span class="sebs-cat-hacc-footline-rule" aria-hidden="true"></span><em>' + title + '</em>';
    premium.appendChild(footline);

    inner.appendChild(premium);

    body.textContent = '';
    body.appendChild(btn);
    body.appendChild(inner);
  }

  function transformExploreSection(exploreRoot, activateFn) {
    if (!exploreRoot || exploreRoot.dataset.sebsHaccReady === '1') return;
    exploreRoot.dataset.sebsHaccReady = '1';

    var stack = exploreRoot.querySelector('.modules-category-tabs');
    if (!stack) return;

    stack.classList.add('sebs-cat-haccordion');
    stack.classList.remove('sebs-accordion-stack');

    var previewRoot = exploreRoot.querySelector('#modules-explore-preview');
    if (previewRoot) previewRoot.remove();

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
      item.insertBefore(badge, num.nextSibling);

      var collapsed = document.createElement('div');
      collapsed.className = 'sebs-cat-hacc-collapsed';
      var iconSrc = item.querySelector('.sebs-acc-icon');
      if (iconSrc) {
        var iconClone = iconSrc.cloneNode(true);
        iconClone.className = 'sebs-cat-hacc-collapsed-icon';
        iconClone.setAttribute('aria-hidden', 'true');
        collapsed.appendChild(iconClone);
      }
      var titleSpan = document.createElement('span');
      titleSpan.className = 'sebs-cat-hacc-collapsed-label';
      titleSpan.textContent = getItemTitle(item);
      collapsed.appendChild(titleSpan);
      item.appendChild(collapsed);

      var block = item.querySelector('.sebs-acc-block');
      if (block) {
        var body = document.createElement('div');
        body.className = 'sebs-cat-hacc-body';
        while (block.firstChild) body.appendChild(block.firstChild);
        block.replaceWith(body);
        buildPremiumBody(item, body);
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
