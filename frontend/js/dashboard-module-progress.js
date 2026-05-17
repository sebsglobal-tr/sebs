/**
 * Dashboard — modül ilerlemesi: son 5 kayıt, kompakt satır, tümünü gör.
 */
(function (global) {
  var _allModules = [];
  var _showAll = false;
  var PREVIEW = 5;

  function displayTitle(module) {
    if (
      module.courseTitle === 'Siber Güvenliğe Giriş' &&
      module.title === 'Giriş'
    ) {
      return 'Siber Güvenliğe Giriş';
    }
    return (
      module.moduleTitle ||
      module.title ||
      (module.module && module.module.title) ||
      'Modül'
    );
  }

  function parseTime(v) {
    if (!v) return 0;
    try {
      return new Date(v).getTime() || 0;
    } catch (e) {
      return 0;
    }
  }

  function sortByRecent(modules) {
    return (modules || []).slice().sort(function (a, b) {
      var ta = parseTime(a.updatedAt || a.lastAccessedAt);
      var tb = parseTime(b.updatedAt || b.lastAccessedAt);
      if (tb !== ta) return tb - ta;
      var pa = parseInt(a.percentComplete, 10) || 0;
      var pb = parseInt(b.percentComplete, 10) || 0;
      if (pb !== pa) return pb - pa;
      return String(displayTitle(a)).localeCompare(String(displayTitle(b)), 'tr');
    });
  }

  function statusLabel(module, percent) {
    if (module.isCompleted || percent >= 100) return 'Tamamlandı';
    if (percent > 0) return percent + '% tamamlandı · Devam ediyor';
    var mins = module.timeSpentMinutes || 0;
    if (mins > 0) return mins + ' dk çalışıldı';
    return 'Başlandı';
  }

  function buildRow(module, index, opts) {
    var escapeHtml = opts.escapeHtml;
    var resolveHref = opts.resolveHref;
    var percent = Math.max(0, Math.min(100, parseInt(module.percentComplete, 10) || 0));
    var title = displayTitle(module);
    var href = resolveHref(title, module);
    var done = module.isCompleted || percent >= 100;
    var status = statusLabel(module, percent);
    var delay = (index * 0.04).toFixed(2);
    var barColor = done
      ? 'bg-emerald-500'
      : percent > 0
        ? 'bg-blue-600'
        : 'bg-slate-300';

    var actionHtml = done
      ? '<span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/15"><i class="fas fa-check-circle" aria-hidden="true"></i>Tamam</span>'
      : '<a href="' +
        escapeHtml(href) +
        '" class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-ring"><i class="fas fa-play text-[10px]" aria-hidden="true"></i>Devam et</a>';

    return (
      '<article class="module-progress-row group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md" style="animation:fadeInUp .4s ease ' +
      delay +
      's both" data-percent="' +
      percent +
      '">' +
      '<div class="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/[0.06] blur-xl" aria-hidden="true"></div>' +
      '<div class="relative flex flex-wrap items-center gap-3 sm:gap-4">' +
      '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">' +
      '<i class="fas fa-book-open text-sm" aria-hidden="true"></i></div>' +
      '<div class="min-w-0 flex-1 basis-[12rem]">' +
      '<div class="flex flex-wrap items-baseline justify-between gap-2">' +
      '<h3 class="text-sm font-semibold leading-snug text-slate-900 sm:text-base">' +
      escapeHtml(title) +
      '</h3>' +
      '<span class="text-sm font-bold tabular-nums text-slate-700">' +
      percent +
      '%</span></div>' +
      '<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">' +
      '<div class="module-progress-row__bar h-full rounded-full ' +
      barColor +
      ' transition-all duration-700 ease-out" style="width:0%"></div></div>' +
      '<p class="mt-1.5 text-xs text-slate-500">' +
      escapeHtml(status) +
      '</p></div>' +
      actionHtml +
      '</div></article>'
    );
  }

  function animateBars(container) {
    if (!container) return;
    requestAnimationFrame(function () {
      container.querySelectorAll('.module-progress-row').forEach(function (row, i) {
        var bar = row.querySelector('.module-progress-row__bar');
        var pct = parseInt(row.getAttribute('data-percent'), 10) || 0;
        if (!bar) return;
        setTimeout(function () {
          bar.style.width = pct + '%';
        }, 80 + i * 60);
      });
    });
  }

  function render(modules, showAll, opts) {
    var list = document.getElementById('progressList');
    var toggleBtn = document.getElementById('moduleProgressToggleAll');
    var toggleLabel = document.getElementById('moduleProgressToggleLabel');
    var countHint = document.getElementById('moduleProgressCountHint');
    if (!list) return;

    if (!modules || !modules.length) {
      if (toggleBtn) toggleBtn.classList.add('hidden');
      if (countHint) countHint.classList.add('hidden');
      list.innerHTML =
        '<div class="no-data w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 px-8 py-12 text-center">' +
        '<i class="fas fa-book-open text-3xl text-slate-300"></i>' +
        '<h3 class="mt-3 text-lg font-semibold text-slate-900">Henüz modül başlatmadınız</h3>' +
        '<p class="mt-2 text-sm text-slate-600">Eğitim modüllerine göz atarak başlayın!</p>' +
        (opts.emptyExtraHtml || '') +
        '<a href="/modules.html" class="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-ring">Modüllere git</a></div>';
      return;
    }

    var sorted = sortByRecent(modules);
    var visible = showAll ? sorted : sorted.slice(0, PREVIEW);
    var html = visible
      .map(function (m, i) {
        return buildRow(m, i, opts);
      })
      .join('');
    list.innerHTML =
      '<div class="flex flex-col gap-3" id="moduleProgressRows">' + html + '</div>';

    animateBars(document.getElementById('moduleProgressRows'));

    if (toggleBtn) {
      if (sorted.length > PREVIEW) {
        toggleBtn.classList.remove('hidden');
        toggleBtn.classList.add('inline-flex');
        toggleBtn.setAttribute('aria-expanded', showAll ? 'true' : 'false');
      } else {
        toggleBtn.classList.add('hidden');
        toggleBtn.classList.remove('inline-flex');
      }
    }
    if (toggleLabel) {
      toggleLabel.textContent = showAll ? 'Son 5 modülü göster' : 'Tümünü gör';
    }
    if (countHint) {
      if (sorted.length > PREVIEW) {
        countHint.classList.remove('hidden');
        countHint.textContent = showAll
          ? 'Toplam ' + sorted.length + ' modül ilerlemesi listeleniyor.'
          : 'Son güncellenen ' +
            visible.length +
            ' modül (toplam ' +
            sorted.length +
            '). Diğerleri için «Tümünü gör».';
      } else {
        countHint.classList.add('hidden');
      }
    }
  }

  function bindToggle(opts) {
    var btn = document.getElementById('moduleProgressToggleAll');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      _showAll = !_showAll;
      render(_allModules, _showAll, opts);
      if (_showAll) {
        var section = document.getElementById('moduleProgressSection');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  global.SebDashboardModuleProgress = {
    display: function (modules, opts) {
      _allModules = modules || [];
      _showAll = false;
      opts = opts || {};
      render(_allModules, false, opts);
      bindToggle(opts);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
