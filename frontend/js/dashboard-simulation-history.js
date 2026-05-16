/**
 * Dashboard — simülasyon geçmişi: son 5 kayıt, alan grupları, tümünü gör.
 */
(function (global) {
  var _allRuns = [];
  var _showAll = false;
  var PREVIEW = 5;

  var REGISTRY = {
    'temel-siber-guvenlik-lab': { title: 'Temel Siber Güvenlik Lab', area: 'Siber Güvenlik Temelleri', icon: 'fa-shield-halved' },
    'linux-forensik-lab': { title: 'Linux Sunucu Forensik Lab', area: 'Forensik & Olay İnceleme', icon: 'fa-terminal' },
    'semptom-etki-zinciri': { title: 'Semptom–Etki Zinciri', area: 'Siber Güvenlik Temelleri', icon: 'fa-link' },
    'kayit-haftasi-krizi': { title: 'Kayıt Haftası Krizi', area: 'Siber Güvenlik Temelleri', icon: 'fa-calendar-week' },
    'bir-seyler-yanlis-ama-ne': { title: 'Bir Şeyler Yanlış Ama Ne?', area: 'Siber Güvenlik Temelleri', icon: 'fa-magnifying-glass' },
    'sosyal-muhendislik-banka-fiziksel': { title: 'Operation Silent Drop', area: 'Sosyal Mühendislik', icon: 'fa-user-secret' },
    'sosyal-muhendislik-insan-faktoru-zincir': { title: 'İnsan Faktörü Zinciri', area: 'Sosyal Mühendislik', icon: 'fa-people-arrows' },
    'guvenli-is-istasyonu-os-guvenligi': { title: 'Güvenli İş İstasyonu', area: 'İşletim Sistemi Güvenliği', icon: 'fa-desktop' },
    'isletim-sistemi-guvenligi-temel-senaryo': { title: 'OS Güvenliği Senaryosu', area: 'İşletim Sistemi Güvenliği', icon: 'fa-laptop-code' },
    'temel-network-sim': { title: 'Temel Network Simülasyonu', area: 'Network & Altyapı', icon: 'fa-network-wired' },
    'penetration-testing-sim': { title: 'Penetrasyon Testi', area: 'Ofansif Güvenlik', icon: 'fa-bug' },
  };

  var AREA_ORDER = [
    'Siber Güvenlik Temelleri',
    'Forensik & Olay İnceleme',
    'Sosyal Mühendislik',
    'İşletim Sistemi Güvenliği',
    'Network & Altyapı',
    'Ofansif Güvenlik',
    'Diğer Simülasyonlar',
  ];

  function sortKey(r) {
    var t = r.completedAt || r.startedAt || r.createdAt || '';
    try {
      return new Date(t).getTime() || 0;
    } catch (e) {
      return 0;
    }
  }

  function sortNewest(runs) {
    return (runs || []).slice().sort(function (a, b) {
      return sortKey(b) - sortKey(a);
    });
  }

  function resolveMeta(run) {
    var sid = run.simulationId || '';
    var reg = REGISTRY[sid];
    var title =
      (run.simulationName && String(run.simulationName).trim()) || (reg && reg.title) || sid || 'Simülasyon';
    var area = 'Diğer Simülasyonlar';
    if (run.moduleName && String(run.moduleName).trim()) {
      area = String(run.moduleName).trim();
    } else if (reg && reg.area) {
      area = reg.area;
    } else if (run.simulationName) {
      var sn = String(run.simulationName).toLowerCase();
      if (sn.indexOf('sosyal') >= 0) area = 'Sosyal Mühendislik';
      else if (sn.indexOf('network') >= 0 || sn.indexOf('ağ') >= 0) area = 'Network & Altyapı';
      else if (sn.indexOf('forensik') >= 0 || sn.indexOf('linux') >= 0) area = 'Forensik & Olay İnceleme';
      else if (sn.indexOf('os') >= 0 || sn.indexOf('işletim') >= 0) area = 'İşletim Sistemi Güvenliği';
    }
    return { title: title, area: area, icon: (reg && reg.icon) || 'fa-flask' };
  }

  function groupByArea(runs) {
    var groups = {};
    runs.forEach(function (r) {
      var meta = resolveMeta(r);
      if (!groups[meta.area]) groups[meta.area] = [];
      groups[meta.area].push({ run: r, meta: meta });
    });
    var ordered = AREA_ORDER.filter(function (a) {
      return groups[a] && groups[a].length;
    });
    Object.keys(groups).forEach(function (a) {
      if (ordered.indexOf(a) < 0) ordered.push(a);
    });
    return ordered.map(function (area) {
      return { area: area, items: groups[area] };
    });
  }

  function buildCard(r, meta, animIndex, escapeHtml, formatDate) {
    var statusBadge;
    if (r.status === 'started' || r.completedAt == null) {
      statusBadge =
        '<span class="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/15">Başlatıldı</span>';
    } else if (r.status === 'success' || r.statusLabel === 'Başarılı') {
      statusBadge =
        '<span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">Başarılı</span>';
    } else {
      statusBadge =
        '<span class="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/15">Başarısız</span>';
    }
    var scoreStr = '—';
    if (r.completedAt != null && r.score != null) {
      scoreStr =
        r.maxScore != null && Number(r.maxScore) > 0 ? r.score + '/' + r.maxScore : r.score + '%';
    }
    var cr = r.correctCount != null ? r.correctCount : 0;
    var wr = r.wrongCount != null ? r.wrongCount : 0;
    var metaParts = [];
    if (r.completedAt != null) metaParts.push('Doğru: ' + cr + ' · Yanlış: ' + wr);
    if (r.finalGradeLabel) metaParts.push('Seviye: ' + escapeHtml(String(r.finalGradeLabel)));
    if (r.successRate != null && r.successRate !== '')
      metaParts.push('Başarı %: ' + Number(r.successRate).toFixed(1));
    if (r.hintUsedCount != null && Number(r.hintUsedCount) > 0) metaParts.push('İpucu: ' + r.hintUsedCount);
    if (r.timeSpentSeconds != null && Number(r.timeSpentSeconds) > 0) {
      var ts = Number(r.timeSpentSeconds);
      metaParts.push('Süre: ' + Math.floor(ts / 60) + ' dk ' + (ts % 60) + ' sn');
    } else if (r.timeSpent != null && Number(r.timeSpent) > 0) {
      var ts2 = Number(r.timeSpent);
      metaParts.push('Süre: ' + Math.floor(ts2 / 60) + ' dk ' + (ts2 % 60) + ' sn');
    }
    var metaLine = metaParts.length
      ? '<div class="mt-1 text-xs text-slate-500">' + metaParts.join(' · ') + '</div>'
      : '';
    var delay = (animIndex * 0.04).toFixed(2);
    return (
      '<article class="contact-channel-card group relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card transition hover:border-slate-300 hover:shadow-card-hover" style="animation:fadeInUp .45s ease ' +
      delay +
      's both">' +
      '<div class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/[0.07] blur-2xl" aria-hidden="true"></div>' +
      '<div class="relative flex flex-wrap items-start justify-between gap-4">' +
      '<div class="min-w-0 flex-1"><div class="flex items-center gap-2">' +
      '<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><i class="fas ' +
      escapeHtml(meta.icon) +
      ' text-sm" aria-hidden="true"></i></span>' +
      '<div class="text-base font-semibold text-slate-900">' +
      escapeHtml(meta.title) +
      '</div></div>' +
      '<div class="mt-2 text-sm text-slate-500">Başlangıç: ' +
      escapeHtml(formatDate(r.startedAt)) +
      '</div>' +
      (r.completedAt
        ? '<div class="text-sm text-slate-500">Tamamlanma: ' + escapeHtml(formatDate(r.completedAt)) + '</div>'
        : '') +
      '</div><div class="shrink-0 text-right">' +
      statusBadge +
      '<div class="mt-2 text-sm font-medium text-slate-800">Skor: ' +
      escapeHtml(String(scoreStr)) +
      '</div>' +
      metaLine +
      '</div></div></article>'
    );
  }

  function render(runs, showAll, escapeHtml, formatDate) {
    var list = document.getElementById('simulationHistoryList');
    var toggleBtn = document.getElementById('simulationHistoryToggleAll');
    var toggleLabel = document.getElementById('simulationHistoryToggleLabel');
    var countHint = document.getElementById('simulationHistoryCountHint');
    if (!list) return;

    if (!runs || !runs.length) {
      if (toggleBtn) toggleBtn.classList.add('hidden');
      if (countHint) countHint.classList.add('hidden');
      list.innerHTML =
        '<div class="no-data w-full rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-12 text-center shadow-sm" id="simulationHistoryEmpty">' +
        '<i class="fas fa-flask text-slate-300"></i>' +
        '<h3 class="text-lg font-semibold text-slate-900">Henüz simülasyon kaydı yok</h3>' +
        '<p class="mt-2 text-sm text-slate-600">Simülasyon başlattığınızda ve tamamladığınızda burada görünecektir.</p>' +
        '<a href="/simulations.html" class="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-ring">Simülasyonlara git</a></div>';
      return;
    }

    var sorted = sortNewest(runs);
    var visible = showAll ? sorted : sorted.slice(0, PREVIEW);
    var groups = groupByArea(visible);
    var anim = 0;
    var html = '';

    groups.forEach(function (g) {
      html +=
        '<section class="rounded-2xl border border-slate-200/80 bg-white/60 p-4 sm:p-5">' +
        '<header class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">' +
        '<h3 class="text-sm font-bold uppercase tracking-wide text-slate-800"><i class="fas fa-folder-open mr-2 text-blue-600" aria-hidden="true"></i>' +
        escapeHtml(g.area) +
        '</h3><span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">' +
        g.items.length +
        ' kayıt</span></header><div class="flex flex-col gap-3">';
      g.items.forEach(function (item) {
        html += buildCard(item.run, item.meta, anim++, escapeHtml, formatDate);
      });
      html += '</div></section>';
    });

    list.innerHTML = html;

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
    if (toggleLabel) toggleLabel.textContent = showAll ? 'Son 5 kaydı göster' : 'Tümünü gör';
    if (countHint) {
      if (sorted.length > PREVIEW) {
        countHint.classList.remove('hidden');
        countHint.textContent = showAll
          ? 'Toplam ' + sorted.length + ' kayıt, ' + groups.length + ' alanda listeleniyor.'
          : 'Son ' +
            visible.length +
            ' kayıt gösteriliyor (toplam ' +
            sorted.length +
            '). Tüm geçmiş için «Tümünü gör»e tıklayın.';
      } else {
        countHint.classList.add('hidden');
      }
    }
  }

  function bindToggle(escapeHtml, formatDate) {
    var btn = document.getElementById('simulationHistoryToggleAll');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      _showAll = !_showAll;
      render(_allRuns, _showAll, escapeHtml, formatDate);
      if (_showAll) {
        var section = document.getElementById('simulationHistorySection');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  global.SebDashboardSimulationHistory = {
    display: function (runs, escapeHtml, formatDate) {
      _allRuns = runs || [];
      _showAll = false;
      render(_allRuns, false, escapeHtml, formatDate);
      bindToggle(escapeHtml, formatDate);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
