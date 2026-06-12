(function () {
'use strict';

function bootError(msg) {
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      var p = document.getElementById('bootErr');
      if (p) {
        p.textContent = msg;
        p.classList.remove('hidden');
      }
    }
  }

  if (!window.GK_VAKA || !window.GK_VAKA.stages) {
    bootError('Vaka verisi yüklenemedi. Sayfayı yenileyin veya destek ile iletişime geçin.');
    return;
  }

  var CFG = window.GK_VAKA;
  var SIM_ID = CFG.simId;
  var SIM_NAME = CFG.title || 'Gece Açılan Kapı — RDP Maruziyeti';
  var MODULE_NAME = 'İşletim Sistemi Güvenliği';

  var state = {
    stage: 0,
    score: 0,
    evidence: [],
    flags: {},
    stageDone: {},
    stageWrong: {},
    activeTab: 'ticket',
    selectedPort: null,
    selectedPid: null,
    selectedLogs: {},
    orderPick: [],
    orderDisplay: [],
    decisionLocked: false,
    selectedDecision: null,
    decisionConfig: null,
    reportOpen: false,
    startedAt: 0,
    timerId: null,
    windows: {},
    focusedApp: null,
    nextZ: 20
  };


  function $(id) { return document.getElementById(id); }
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }


var MAC_APPS = [
  { id: 'ticket', label: 'Ticket', title: 'SEBS Service Desk — NET-417', icon: 'fa-ticket', color: '#f97316', pos: [32, 28] },
  { id: 'overview', label: 'Overview', title: 'Uzak Sistem Bilgisi — OFFICE-PC-17', icon: 'fa-display', color: '#3b82f6', pos: [56, 44] },
  { id: 'fw-profiles', label: 'FW Profiles', title: 'Windows Defender Firewall', icon: 'fa-shield', color: '#6366f1', pos: [80, 32] },
  { id: 'ports', label: 'Open Ports', title: 'cmd.exe — netstat -ano', icon: 'fa-network-wired', color: '#ef4444', pos: [104, 48] },
  { id: 'services', label: 'Services', title: 'services.msc', icon: 'fa-gears', color: '#8b5cf6', pos: [48, 72] },
  { id: 'fw-rules', label: 'FW Rules', title: 'Gelişmiş Güvenlik — Gelen Kurallar', icon: 'fa-list-check', color: '#0ea5e9', pos: [72, 88] },
  { id: 'logs', label: 'Login Logs', title: 'Event Viewer — Security', icon: 'fa-clock-rotate-left', color: '#14b8a6', pos: [96, 64] },
  { id: 'edge-nat', label: 'Edge NAT', title: 'Edge Gateway — NAT Policies', icon: 'fa-globe', color: '#f59e0b', pos: [120, 40] },
  { id: 'report', label: 'Report', title: 'Final Report', icon: 'fa-file-lines', color: '#64748b', pos: [64, 56] }
];

function initWindows() {
  state.windows = {};
  MAC_APPS.forEach(function (a) {
    state.windows[a.id] = { open: a.id === 'ticket', minimized: false, maximized: false, restorePos: null };
  });
  state.focusedApp = 'ticket';
  state.nextZ = 20;
  state.activeTab = 'ticket';
}

function isReportLocked() {
  return state.stage < 7 && !state.stageDone[7];
}

function openApp(id) {
  if (id === 'report' && isReportLocked()) return;
  var w = state.windows[id];
  if (!w) return;
  w.open = true;
  w.minimized = false;
  w.maximized = false;
  focusApp(id);
  if (id === 'overview') state.flags.overviewSeen = true;
  if (id === 'fw-profiles') state.flags.fwProfilesSeen = true;
  if (id === 'fw-rules') state.flags.fwRulesSeen = true;
  state.activeTab = id;
  renderMacDesktop();
}

function closeApp(id) {
  var w = state.windows[id];
  if (!w) return;
  w.open = false;
  w.minimized = false;
  w.maximized = false;
  if (state.focusedApp === id) {
    var next = null;
    MAC_APPS.forEach(function (a) {
      var x = state.windows[a.id];
      if (x && x.open && !x.minimized) next = a.id;
    });
    state.focusedApp = next;
  }
  renderMacDesktop();
}

function minimizeApp(id) {
  var w = state.windows[id];
  if (!w || !w.open) return;
  var host = $('macWindows');
  var winEl = host && host.querySelector('.mac-win[data-app="' + id + '"]');
  if (winEl) {
    winEl.classList.add('mac-win--minimizing');
    setTimeout(function () {
      w.minimized = true;
      w.maximized = false;
      renderMacDesktop();
    }, 260);
    return;
  }
  w.minimized = true;
  w.maximized = false;
  renderMacDesktop();
}

function toggleMaximizeApp(id) {
  var w = state.windows[id];
  if (!w || !w.open) return;
  w.minimized = false;
  var app = MAC_APPS.filter(function (a) { return a.id === id; })[0];
  if (!w.maximized) {
    var host = $('macWindows');
    var winEl = host && host.querySelector('.mac-win[data-app="' + id + '"]');
    if (winEl) {
      w.restorePos = {
        left: parseFloat(winEl.style.left) || (app ? app.pos[0] : 32),
        top: parseFloat(winEl.style.top) || (app ? app.pos[1] : 28)
      };
    } else if (app) {
      w.restorePos = { left: app.pos[0], top: app.pos[1] };
    }
    w.maximized = true;
  } else {
    w.maximized = false;
  }
  focusApp(id);
}

function focusApp(id) {
  state.focusedApp = id;
  state.activeTab = id;
  state.nextZ += 1;
  renderMacDesktop();
}

function dockClick(id) {
  if (id === 'report' && isReportLocked()) return;
  var w = state.windows[id];
  if (!w) return;
  if (!w.open) { openApp(id); return; }
  if (w.minimized) { w.minimized = false; focusApp(id); return; }
  if (state.focusedApp === id) minimizeApp(id);
  else focusApp(id);
}

function updateMacMenu() {
  var app = MAC_APPS.filter(function (a) { return a.id === state.focusedApp; })[0];
  var el = $('macMenuApp');
  if (el) el.textContent = app ? app.title : 'SEBS Lab';
  var clk = $('macMenuClock');
  if (clk) {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    clk.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
}

function renderDock() {
  var dock = $('macDock');
  if (!dock) return;
  dock.innerHTML = MAC_APPS.map(function (a) {
    var w = state.windows[a.id];
    var locked = a.id === 'report' && isReportLocked();
    var cls = 'mac-dock-item';
    if (locked) cls += ' mac-dock-item--locked';
    else if (w && w.open && !w.minimized && state.focusedApp === a.id) cls += ' mac-dock-item--active';
    if (w && w.open && w.minimized) cls += ' mac-dock-item--minimized';
    if (w && w.open) cls += ' mac-dock-item--running';
    return '<button type="button" class="' + cls + '" data-dock="' + a.id + '"' + (locked ? ' disabled title="Aşama 8 sonrası"' : '') + '>' +
      '<span class="mac-dock-icon" style="background:' + a.color + '"><i class="fa-solid ' + a.icon + '"></i></span>' +
      '<span class="mac-dock-label">' + esc(a.label) + '</span><span class="mac-dock-dot"></span></button>';
  }).join('');
  dock.querySelectorAll('[data-dock]').forEach(function (btn) {
    btn.onclick = function () { dockClick(btn.getAttribute('data-dock')); };
  });
}

function buildMacWindow(app, bodyHtml, z, w) {
  var cls = 'mac-win mac-win--' + app.id;
  if (state.focusedApp === app.id) cls += ' mac-win--focused';
  if (w && w.maximized) cls += ' mac-win--maximized';
  var pos = (w && w.restorePos) ? w.restorePos : { left: app.pos[0], top: app.pos[1] };
  var style = w && w.maximized
    ? 'z-index:' + z
    : 'left:' + pos.left + 'px;top:' + pos.top + 'px;z-index:' + z;
  var maxTitle = w && w.maximized ? 'Küçült' : 'Tam ekran';
  var maxLabel = w && w.maximized ? 'Pencereyi küçült' : 'Tam ekran yap';
  return '<div class="' + cls + '" data-app="' + app.id + '" style="' + style + '">' +
    '<div class="mac-win-titlebar" data-dragbar="' + app.id + '">' +
    '<span class="mac-traffic">' +
    '<button type="button" class="mac-close" data-action="close" data-app="' + app.id + '" title="Kapat" aria-label="Pencereyi kapat"></button>' +
    '<button type="button" class="mac-min" data-action="minimize" data-app="' + app.id + '" title="Aşağı indir" aria-label="Pencereyi küçült"></button>' +
    '<button type="button" class="mac-max" data-action="maximize" data-app="' + app.id + '" title="' + maxTitle + '" aria-label="' + maxLabel + '"></button>' +
    '</span><span class="mac-win-title">' + esc(app.title) + '</span></div>' +
    '<div class="mac-win-body">' + bodyHtml + '</div></div>';
}

function renderAppContent(appId) {
  switch (appId) {
    case 'ticket': return renderTicketPanel();
    case 'overview': state.flags.overviewSeen = true; return renderOverview();
    case 'fw-profiles': state.flags.fwProfilesSeen = true; return renderFwProfiles();
    case 'ports': return renderPorts();
    case 'services': return renderServices();
    case 'fw-rules': state.flags.fwRulesSeen = true; return renderFwRules();
    case 'logs': return renderLogs();
    case 'edge-nat': return renderEdgeNat();
    case 'report': return renderReportPanel();
    default: return '';
  }
}

function bindMacWindowChrome() {
  var host = $('macWindows');
  if (!host) return;
  host.querySelectorAll('.mac-win').forEach(function (win) {
    win.addEventListener('mousedown', function (e) {
      if (e.target.closest('.mac-traffic')) return;
      if (!e.target.closest('.mac-win-titlebar')) return;
      focusApp(win.getAttribute('data-app'));
    });
  });
  host.querySelectorAll('[data-action="close"]').forEach(function (btn) {
    btn.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      e.preventDefault();
      closeApp(btn.getAttribute('data-app'));
    });
  });
  host.querySelectorAll('[data-action="minimize"]').forEach(function (btn) {
    btn.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      e.preventDefault();
      minimizeApp(btn.getAttribute('data-app'));
    });
  });
  host.querySelectorAll('[data-action="maximize"]').forEach(function (btn) {
    btn.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleMaximizeApp(btn.getAttribute('data-app'));
    });
  });
  host.querySelectorAll('[data-dragbar]').forEach(function (bar) {
    var appId = bar.getAttribute('data-dragbar');
    var win = host.querySelector('.mac-win[data-app="' + appId + '"]');
    if (!win) return;
    bar.onmousedown = function (e) {
      if (e.target.closest('.mac-traffic')) return;
      var wState = state.windows[appId];
      if (wState && wState.maximized) return;
      e.preventDefault();
      focusApp(appId);
      var sx = e.clientX;
      var sy = e.clientY;
      var rect = win.getBoundingClientRect();
      var parent = $('macDesktop').getBoundingClientRect();
      var ox = rect.left - parent.left;
      var oy = rect.top - parent.top;
      function move(ev) {
        win.style.left = Math.max(0, ox + ev.clientX - sx) + 'px';
        win.style.top = Math.max(0, oy + ev.clientY - sy) + 'px';
      }
      function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        var wUp = state.windows[appId];
        if (wUp && !wUp.maximized) {
          wUp.restorePos = {
            left: parseFloat(win.style.left) || 0,
            top: parseFloat(win.style.top) || 0
          };
        }
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    };
  });
}

function renderMacDesktop() {
  renderDock();
  updateMacMenu();
  var host = $('macWindows');
  if (!host) return;
  var html = '';
  var baseZ = 10;
  MAC_APPS.forEach(function (app, i) {
    var w = state.windows[app.id];
    if (!w || !w.open || w.minimized) return;
    var z = state.focusedApp === app.id ? state.nextZ : baseZ + i;
    html += buildMacWindow(app, renderAppContent(app.id), z, w);
  });
  host.innerHTML = html;
  bindMacWindowChrome();
  bindWorkspaceEvents();
  var st = CFG.stages[state.stage];
  if (st && st.guide && st.guide.tabHint && $('tabActionHint')) {
    var h = st.guide.tabHint.replace(/sekme/gi, 'uygulama');
    if (h.indexOf('Dock') < 0) h = "Dock'tan ilgili uygulamayı açın.";
    $('tabActionHint').textContent = h;
  }
}


  function save() {
    /* İlerleme kaydedilmez — her girişte simülasyon baştan başlar. */
  }

  function resetAll() {
    cancelSupervisorTyping();
    state.stage = 0;
    state.score = 0;
    state.evidence = [];
    state.flags = {};
    state.stageDone = {};
    state.stageWrong = {};
    state.activeTab = 'ticket';
    state.selectedPort = null;
    state.selectedPid = null;
    state.selectedLogs = {};
    state.orderPick = [];
    state.orderDisplay = [];
    state.decisionLocked = false;
    state.selectedDecision = null;
    state.reportOpen = false;
    initWindows();
    renderAll();
  }

  function addEvidence(label, detail) {
    var exists = state.evidence.some(function (e) {
      return e.label === label && e.detail === detail;
    });
    if (exists) return false;
    state.evidence.push({ label: label, detail: detail });
    renderEvidence();
    save();
    return true;
  }

  function hasEvidenceMatch(sub) {
    return state.evidence.some(function (e) {
      return (e.label + ' ' + e.detail).indexOf(sub) >= 0;
    });
  }

  function countFailedLogEvidence() {
    return state.evidence.filter(function (e) {
      return e.label.indexOf('Log') === 0 && e.detail.indexOf('Failed') >= 0;
    }).length;
  }

  function hasSystemLogEvidence() {
    return state.evidence.some(function (e) {
      return e.detail.indexOf('RDP allow rule active') >= 0;
    });
  }

  function checkLogGate() {
    return countFailedLogEvidence() >= 3 && hasSystemLogEvidence();
  }

  function gateOk(gate) {
    if (!gate) return true;
    if (gate === 'overviewSeen') return !!state.flags.overviewSeen;
    if (gate === 'port3389Evidence') return hasEvidenceMatch('3389');
    if (gate === 'serviceEvidence') return hasEvidenceMatch('TermService');
    if (gate === 'fwRuleEvidence') return hasEvidenceMatch('Remote Desktop');
    if (gate === 'logEvidence') return checkLogGate();
    if (gate === 'natEvidence') return hasEvidenceMatch('TEMP_RDP');
    return true;
  }

  function gateMsg(gate) {
    var m = {
      overviewSeen: 'Dock\'tan System Overview uygulamasını açıp inceleyin.',
      port3389Evidence: 'Dock\'tan Open Ports uygulamasını açıp tabloyu inceleyin. Olayla ilişkili dinleyen portu kanıta ekleyin.',
      serviceEvidence: 'Dock\'tan Service Mapper\'da PID 1148 seçip kanıtı sepete ekleyin.',
      fwRuleEvidence: 'Dock\'tan Firewall Rules\'da kritik RDP kuralını kanıta ekleyin.',
      logEvidence: 'Dock\'tan Login Logs\'ta en az 3 başarısız giriş + RDP allow rule satırını kanıta ekleyin.',
      natEvidence: 'Dock\'tan Edge NAT uygulamasında kuralı kanıta ekleyin.'
    };
    return m[gate] || 'Önce gerekli inceleme adımlarını tamamlayın.';
  }

  var AUTO_ADVANCE_MS = 1400;

  function updateScore(pts) {
    state.score = Math.min(100, state.score + pts);
    $('scoreLbl').textContent = String(state.score);
  }

  function deductScore(pts) {
    state.score = Math.max(0, state.score - (pts || 0));
    $('scoreLbl').textContent = String(state.score);
  }

  function scheduleAutoNextStage() {
    setTimeout(function () {
      if (state.stage >= 8) return;
      nextStage();
    }, AUTO_ADVANCE_MS);
  }

  function setFeedback(kind, msg) {
    var el = $('stageFeedback');
    if (!el) return;
    el.className = 'gk-feedback show gk-feedback--' + (kind || 'info');
    el.textContent = msg;
  }

  function scrollToNext() {
    var btn = $('btnNextStage');
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function elapsedStr() {
    if (!state.startedAt) return '0:00';
    var s = Math.floor((Date.now() - state.startedAt) / 1000);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function startTimer() {
    state.startedAt = Date.now();
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(function () {
      var el = $('timerLbl');
      if (el) el.textContent = elapsedStr();
    }, 1000);
  }

  function isCorrectOrder(pick) {
    var n = CFG.intervention.length;
    return pick.length === n && pick.every(function (v, i) { return v === i; });
  }

  function shuffleOrderDisplay() {
    var n = CFG.intervention.length;
    var arr = [];
    var i;
    for (i = 0; i < n; i++) arr.push(i);
    for (i = n - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function initOrderDisplay() {
    state.orderDisplay = shuffleOrderDisplay();
  }

  function getOrderBadge(interventionIdx) {
    var i;
    for (i = 0; i < state.orderPick.length; i++) {
      if (state.orderPick[i] === interventionIdx) return i + 1;
    }
    return 0;
  }

  function renderEvidence() {
    var host = $('evidenceBasket');
    if (!host) return;
    if (!state.evidence.length) {
      host.innerHTML = '<p class="gk-empty">Henüz kanıt eklenmedi.</p>';
      return;
    }
    host.innerHTML = state.evidence.map(function (e, i) {
      return '<div class="gk-ev-item"><strong>' + esc(e.label) + '</strong><span>' + esc(e.detail) + '</span></div>';
    }).join('');
  }

  function renderTaskList() {
    $('taskList').innerHTML = CFG.stages.filter(function (s) { return s.type !== 'report'; }).map(function (s, i) {
      var cls = 'gk-task-item';
      if (i === state.stage) cls += ' gk-task-item--active';
      else if (state.stageDone[s.id]) cls += ' gk-task-item--done';
      return '<div class="' + cls + '">Aşama ' + (i + 1) + ' · ' + esc(s.title) + '</div>';
    }).join('');
  }

  function renderStepGuide() {
    var st = CFG.stages[state.stage];
    if (!st || !st.guide) {
      $('stepGuide').innerHTML = '';
      return;
    }
    $('stepGuide').innerHTML =
      '<p class="gk-guide-title">' + esc(st.guide.steps[0] ? 'Adımlar' : '') + '</p>' +
      '<ol class="gk-guide-list">' +
      st.guide.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ol>';
    /* tab hint in renderMacDesktop */
  }

  function updateHintPopover() {
    var st = CFG.stages[state.stage];
    if (!st || !st.guide) return;
    $('hintPopover').innerHTML =
      '<strong>İpucu — Aşama ' + (state.stage + 1) + '</strong><br><br>' + esc(st.guide.hint);
  }

  function updateProgress() {
    var total = CFG.stages.length - 1;
    var done = Object.keys(state.stageDone).length;
    var pct = Math.round((done / total) * 100);
    $('progressFill').style.width = Math.max(8, pct) + '%';
    $('stagePill').textContent = 'Aşama ' + Math.min(state.stage + 1, 8) + '/8';
  }

  function renderTabsOld() {
    var html = CFG.tabs.map(function (t) {
      if (t.id === 'report' && state.stage < 7 && !state.stageDone[7]) {
        return '<button type="button" class="gk-tab gk-tab--locked" disabled title="Aşama 8\'den sonra"><i class="fa-solid ' + t.icon + '"></i> ' + esc(t.label) + '</button>';
      }
      var active = state.activeTab === t.id ? ' gk-tab--active' : '';
      return '<button type="button" class="gk-tab' + active + '" data-tab="' + t.id + '"><i class="fa-solid ' + t.icon + '"></i> ' + esc(t.label) + '</button>';
    }).join('');
    $('tabBar').innerHTML = html;
    $('tabBar').querySelectorAll('.gk-tab[data-tab]').forEach(function (btn) {
      btn.onclick = function () {
        state.activeTab = btn.dataset.tab;
        if (state.activeTab === 'overview') state.flags.overviewSeen = true;
        if (state.activeTab === 'fw-profiles') state.flags.fwProfilesSeen = true;
        if (state.activeTab === 'fw-rules') state.flags.fwRulesSeen = true;
        renderTabs();
        renderMacDesktop();
        save();
      };
    });
  }

  function renderTicketPanel() {
    var t = CFG.ticket;
    return (
      '<div class="tool-app tool-ticket">' +
      '<div class="tool-vendor-bar"><i class="fa-solid fa-ticket"></i> SEBS Service Desk — Güvenlik Olayları</div>' +
      '<div class="tool-ticket-head">' +
      '<div style="font-size:0.6rem;color:#64748b">INCIDENT / Güvenlik</div>' +
      '<div class="tool-ticket-id">' + esc(t.id) + '</div>' +
      '<div class="tool-pills">' +
      '<span class="tool-pill tool-pill--p2">P2 — Yüksek</span>' +
      '<span class="tool-pill tool-pill--open">Açık</span>' +
      '<span class="tool-pill" style="background:#f1f5f9;color:#475569;border:1px solid #e2e8f0">Atanan: SOC L1</span>' +
      '</div></div>' +
      '<dl class="tool-fields">' +
      '<dt>Cihaz</dt><dd>' + esc(t.device) + '</dd>' +
      '<dt>Kullanıcı</dt><dd>' + esc(t.user) + '</dd>' +
      '<dt>Hedef OS</dt><dd>' + esc(t.os) + '</dd>' +
      '<dt>İnceleme konsolu</dt><dd>' + esc(t.labOs || 'macOS Sonoma 14.4') + '</dd>' +
      '<dt>Özet</dt><dd>' + esc(t.summary) + '</dd>' +
      '<dt>Zaman penceresi</dt><dd>' + esc(t.window) + '</dd>' +
      '<dt>Durum</dt><dd>' + esc(t.status) + '</dd>' +
      '</dl>' +
      '<div class="tool-desc">' + esc(t.body) + '</div>' +
      '<div class="tool-footer"><button type="button" class="tool-btn tool-btn--primary" id="btnAddTicket"><i class="fa-solid fa-basket-shopping"></i> Ticket\'ı kanıt sepetine ekle</button></div>' +
      '</div>'
    );
  }

  function renderOverview() {
    var o = CFG.overview;
    return (
      '<div class="tool-app tool-overview">' +
      '<div class="tool-win-chrome"><i class="fa-brands fa-windows"></i> Uzak Sistem Bilgisi — ' + esc(o.hostname) + '</div>' +
      '<div class="tool-host-banner">' +
      '<div class="tool-host-icon"><i class="fa-solid fa-desktop"></i></div>' +
      '<div><div class="tool-host-name">' + esc(o.hostname) + '</div>' +
      '<div class="tool-host-sub">' + esc(o.os) + ' · Son oturum: ' + esc(o.user) + '</div></div>' +
      '</div>' +
      '<div class="tool-alert"><i class="fa-solid fa-triangle-exclamation"></i><span><strong>Remote Desktop:</strong> ' + esc(o.rdp) + ' — Uzak oturum servisi etkin.</span></div>' +
      '<div class="tool-tiles">' +
      '<div class="tool-tile"><div class="tool-tile-label">Yerel IP</div><div class="tool-tile-val font-jb">' + esc(o.localIp) + '</div></div>' +
      '<div class="tool-tile"><div class="tool-tile-label">Ağ profili</div><div class="tool-tile-val" style="color:#c2410c">' + esc(o.networkProfile) + '</div></div>' +
      '<div class="tool-tile"><div class="tool-tile-label">VPN</div><div class="tool-tile-val">' + esc(o.vpn) + '</div></div>' +
      '<div class="tool-tile"><div class="tool-tile-label">Güvenlik Duvarı</div><div class="tool-tile-val" style="color:#15803d">' + esc(o.firewallStatus) + '</div></div>' +
      '<div class="tool-tile"><div class="tool-tile-label">Son güncelleme</div><div class="tool-tile-val">' + esc(o.lastUpdate) + '</div></div>' +
      '<div class="tool-tile"><div class="tool-tile-label">Son yeniden başlatma</div><div class="tool-tile-val">' + esc(o.lastReboot) + '</div></div>' +
      '</div>' +
      '<div class="tool-note">' + esc(o.eduMsg) + '</div>' +
      '</div>'
    );
  }

  function renderFwProfiles() {
    var rows = CFG.fwProfiles.map(function (p) {
      return '<tr><td><i class="fa-solid fa-shield" style="color:#0078d4;margin-right:4px"></i>' + esc(p.profile) + '</td><td>' + esc(p.status) + '</td><td>' + esc(p.inbound) + '</td><td>' + esc(p.note) + '</td></tr>';
    }).join('');
    return (
      '<div class="tool-app tool-mmc">' +
      '<div class="tool-mmc-bar"><i class="fa-solid fa-window-maximize"></i> Windows Defender Firewall with Advanced Security</div>' +
      '<div class="tool-mmc-body">' +
      '<div class="tool-mmc-tree">' +
      '<div class="tool-mmc-tree-item">Windows Defender Firewall</div>' +
      '<div class="tool-mmc-tree-item tool-mmc-tree-item--sel">Overview</div>' +
      '<div class="tool-mmc-tree-item">Inbound Rules</div>' +
      '<div class="tool-mmc-tree-item">Outbound Rules</div>' +
      '</div>' +
      '<div class="tool-mmc-main"><table class="tool-mmc-table"><thead><tr><th>Profil</th><th>Durum</th><th>Inbound (varsayılan)</th><th>Not</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>' +
      '<div class="tool-mmc-hint">Profiller normal görünebilir — asıl risk genelde Allow kurallarında ortaya çıkar.</div>' +
      '</div>'
    );
  }

  function renderPorts() {
    var rows = CFG.ports.map(function (p, i) {
      var sel = state.selectedPort === i ? ' tool-term-row--sel' : '';
      var crit = p.critical ? ' tool-term-row--crit' : '';
      var local = p.local + ':' + p.port;
      return '<tr class="tool-term-row' + sel + crit + '" data-port="' + i + '"><td>' + esc(p.proto) + '</td><td class="font-jb">' + esc(local) + '</td><td></td><td>' + esc(p.state) + '</td><td>' + p.pid + '</td></tr>';
    }).join('');
    var detail = '';
    if (state.selectedPort != null && CFG.ports[state.selectedPort]) {
      var p = CFG.ports[state.selectedPort];
      var d = p.port === 3389 ? CFG.portDetail3389 : null;
      detail = '<div class="tool-term-detail"><h4>// Seçili bağlantı — port ' + p.port + '</h4><dl>' +
        '<dt>proto</dt><dd>' + esc(p.proto) + '</dd>' +
        '<dt>state</dt><dd>' + esc(d ? d.state : p.state) + '</dd>' +
        '<dt>local</dt><dd>' + esc(d ? d.listen + ':' + d.port : p.local + ':' + p.port) + '</dd>' +
        '<dt>pid</dt><dd>' + p.pid + '</dd>' +
        '<dt>note</dt><dd>' + esc(d ? d.note : p.comment) + '</dd></dl>';
      detail += '<div style="margin-top:0.4rem"><button type="button" class="tool-btn tool-btn--primary" id="btnAddPort">Port ' +
        p.port + ' kanıta ekle</button></div>';
      detail += '</div>';
    }
    return (
      '<div class="tool-app tool-term">' +
      '<div class="tool-term-title">Administrator: C:\\Windows\\System32\\cmd.exe — netstat -ano</div>' +
      '<div class="tool-term-prompt">C:\\Users\\destek.ofis&gt; netstat -ano | findstr LISTENING</div>' +
      '<div class="tool-term-out"><table class="tool-term-table"><thead><tr><td>Proto</td><td>Local Address</td><td>Foreign</td><td>State</td><td>PID</td></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      detail + '</div>'
    );
  }

  function renderServices() {
    var svcRows = [
      { pid: 1148, name: 'TermService', display: 'Remote Desktop Services', status: 'Running', start: 'Automatic' },
      { pid: 912, name: 'RpcEptMapper', display: 'RPC Endpoint Mapper', status: 'Running', start: 'Automatic' },
      { pid: 4, name: 'System', display: 'Windows System', status: 'Running', start: 'Boot' }
    ];
    var listRows = svcRows.map(function (r) {
      var cls = state.selectedPid === r.pid ? 'tool-svc--sel' : '';
      return '<tr class="' + cls + '" data-pid="' + r.pid + '"><td>' + esc(r.display) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.start) + '</td><td>' + r.pid + '</td></tr>';
    }).join('');
    var detail = '<p style="color:#666;margin:0">Tablodan bir servis satırı seçin.</p>';
    if (state.selectedPid && CFG.services[state.selectedPid]) {
      var s = CFG.services[state.selectedPid];
      detail = '<h4>' + esc(s.displayName) + ' (' + esc(s.service) + ')</h4>' +
        '<dl class="tool-svc-grid">' +
        '<dt>PID</dt><dd>' + s.pid + '</dd>' +
        '<dt>Süreç</dt><dd>' + esc(s.process) + '</dd>' +
        '<dt>Hesap</dt><dd>' + esc(s.account) + '</dd>' +
        '<dt>Başlangıç</dt><dd>' + esc(s.startType) + '</dd>' +
        '<dt>Yol</dt><dd class="font-jb" style="font-size:0.6rem">' + esc(s.path) + '</dd>' +
        '<dt>İmza</dt><dd>' + esc(s.signed) + '</dd>' +
        '</dl>' +
        '<p style="margin:0.35rem 0;font-size:0.62rem;color:#92400e;background:#fffbeb;padding:0.35rem;border-radius:4px">' + esc(s.riskNote) + '</p>' +
        '<button type="button" class="tool-btn tool-btn--primary" id="btnAddService">PID ' + s.pid + ' / ' + esc(s.service) + ' kanıta ekle</button>';
    }
    return (
      '<div class="tool-app tool-svc">' +
      '<div class="tool-mmc-bar"><i class="fa-solid fa-gears"></i> services.msc — Yerel Bilgisayar</div>' +
      '<div class="tool-svc-list"><table class="tool-svc-table"><thead><tr><th>Görünen Ad</th><th>Servis</th><th>Durum</th><th>Başlangıç</th><th>PID</th></tr></thead><tbody>' + listRows + '</tbody></table></div>' +
      '<div class="tool-svc-detail">' + detail + '</div>' +
      '</div>'
    );
  }

  function renderFwRules() {
    var rows = CFG.fwRules.map(function (r, i) {
      var crit = r.critical ? ' tool-fw--crit' : '';
      var sel = state.flags.selectedRule === i ? ' tool-fw--sel' : '';
      var actCls = r.action === 'Allow' ? 'tool-fw-action-allow' : 'tool-fw-action-block';
      return '<tr class="' + crit.trim() + sel.trim() + '" data-rule="' + i + '">' +
        '<td>' + (r.critical ? '<i class="fa-solid fa-circle-exclamation" style="color:#dc2626"></i> ' : '') + esc(r.name) + '</td>' +
        '<td>' + esc(r.profile) + '</td><td>' + esc(r.port) + '</td><td>' + esc(r.source) + '</td>' +
        '<td class="' + actCls + '">' + esc(r.action) + '</td><td>' + esc(r.status) + '</td></tr>';
    }).join('');
    var det = '';
    if (state.flags.selectedRule != null && CFG.fwRules[state.flags.selectedRule]) {
      var ri = state.flags.selectedRule;
      var r = CFG.fwRules[ri];
      var extra = '';
      if (ri === 0) {
        var c = CFG.criticalRuleDetail;
        extra = '<br><span style="font-size:0.62rem;color:#64748b">' + esc(c.protocol) + ' · Local ' + c.localPort + ' · Remote: ' + esc(c.remote) + '</span>';
      }
      det = '<div class="tool-fw-detail"><strong>' + esc(r.name) + '</strong>' + extra +
        '<br><span style="font-size:0.62rem">' + esc(r.profile) + ' · Port ' + esc(r.port) + ' · ' + esc(r.source) + ' · ' + esc(r.action) + '</span>' +
        '<div style="margin-top:0.4rem"><button type="button" class="tool-btn tool-btn--primary" id="btnAddFwRule">Firewall kuralını kanıta ekle</button></div></div>';
    }
    return (
      '<div class="tool-app tool-fw">' +
      '<div class="tool-mmc-bar"><i class="fa-solid fa-shield-halved"></i> Gelişmiş Güvenlik — Gelen Kurallar</div>' +
      '<div class="tool-fw-group">Windows Remote Desktop</div>' +
      '<table class="tool-fw-table"><thead><tr><th>Kural</th><th>Profil</th><th>Port</th><th>Kaynak</th><th>Eylem</th><th>Durum</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      det + '</div>'
    );
  }

  function renderLogs() {
    var rows = CFG.loginLogs.map(function (l, i) {
      var sel = state.selectedLogs[i] ? ' tool-ev--sel' : '';
      var icon = l.fail ? 'fa-circle-xmark tool-ev-icon--err' : (l.system ? 'fa-circle-info tool-ev-icon--warn' : 'fa-circle-check tool-ev-icon--ok');
      var evId = l.fail ? '4625' : (l.system ? '4954' : '4624');
      return '<tr class="' + sel.trim() + '" data-log="' + i + '">' +
        '<td class="tool-ev-icon"><i class="fa-solid ' + icon + '"></i></td>' +
        '<td class="font-jb">2026-05-15 ' + esc(l.t) + '</td>' +
        '<td>' + esc(l.ev) + '</td>' +
        '<td>Microsoft-Windows-Security-Auditing</td>' +
        '<td class="font-jb">' + evId + '</td>' +
        '<td>' + esc(l.user) + ' · ' + esc(l.src) + ' · ' + esc(l.result) + '</td></tr>';
    }).join('');
    return (
      '<div class="tool-app tool-ev">' +
      '<div class="tool-ev-head">Event Viewer &gt; <span class="tool-ev-path">Custom Views\\Remote Access Attempts</span></div>' +
      '<div class="tool-ev-filter">Kaynak: Security · Olay: 4624, 4625, 4954 · Zaman: Son 24 saat</div>' +
      '<div class="tool-ev-banner">' + esc(CFG.logsEduMsg) + '</div>' +
      '<div class="tool-ev-scroll"><table class="tool-ev-table"><thead><tr><th></th><th>Tarih ve Saat</th><th>Olay</th><th>Kaynak</th><th>Olay Kimliği</th><th>Ayrıntı</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="tool-footer tool-footer--row">' +
      '<button type="button" class="tool-btn" id="btnSelectAllLogs"><i class="fa-solid fa-check-double"></i> Tüm logları seç</button>' +
      '<button type="button" class="tool-btn tool-btn--primary" id="btnAddLogs"><i class="fa-solid fa-basket-shopping"></i> Seçili logları kanıta ekle</button>' +
      '</div>' +
      '<p style="font-size:0.6rem;color:#64748b;margin:0.35rem 0.5rem 0.5rem">En az 3 başarısız deneme + RDP allow rule active kaydı gerekir.</p>' +
      '</div>'
    );
  }

  function renderEdgeNat() {
    var n = CFG.edgeNat;
    return (
      '<div class="tool-app tool-nat">' +
      '<div class="tool-nat-header"><h3>Edge Gateway — NAT Policies</h3><p>OFFICE-PC-17 · Geçici uzak destek kuralları</p></div>' +
      '<div class="tool-nat-nav"><span class="tool-nat-nav--on">NAT</span><span>Firewall</span><span>VPN</span><span>Logs</span></div>' +
      '<div class="tool-nat-card tool-nat-card--alert">' +
      '<div class="tool-nat-card-head"><span>' + esc(n.name) + '</span><span style="font-size:0.58rem;background:#dc2626;color:#fff;padding:0.1rem 0.35rem;border-radius:3px">' + esc(n.status) + '</span></div>' +
      '<dl class="tool-nat-grid">' +
      '<dt>Public Port</dt><dd>' + n.publicPort + '</dd>' +
      '<dt>Internal Host</dt><dd class="font-jb">' + esc(n.internalHost) + '</dd>' +
      '<dt>Internal Port</dt><dd>' + n.internalPort + '</dd>' +
      '<dt>Created</dt><dd>' + esc(n.created) + '</dd>' +
      '<dt>Purpose</dt><dd>' + esc(n.purpose) + '</dd>' +
      '<dt>Owner</dt><dd>' + esc(n.owner) + '</dd>' +
      '<dt>Expected Expiry</dt><dd>' + esc(n.expectedExpiry) + '</dd>' +
      '<dt>Actual</dt><dd style="color:#c2410c;font-weight:700">' + esc(n.actual) + '</dd>' +
      '</dl></div>' +
      '<div class="tool-nat-note"><strong>Sistem sahibi notu:</strong> ' + esc(n.ownerNote) + '</div>' +
      '<div class="tool-footer"><button type="button" class="tool-btn tool-btn--primary" id="btnAddNat"><i class="fa-solid fa-basket-shopping"></i> NAT kuralını kanıta ekle</button></div>' +
      '</div>'
    );
  }

  function renderReportPanel() {
    var missing = getReportMissing();
    var tk = CFG.ticket;
    var statusHtml = missing.length
      ? '<div class="tool-report-status tool-report-status--warn"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>Eksik kanıt var</strong> — raporu tamamlamak için önce aşağıdakileri sepete ekleyin.<ul>' +
        missing.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div></div>'
      : '<div class="tool-report-status tool-report-status--ok"><i class="fa-solid fa-circle-check"></i><div><strong>Zorunlu kanıtlar tamam.</strong> Metinleri gözden geçirip düzenleyebilir, ardından raporu kaydedebilirsiniz.</div></div>';
    var s = buildReportSections();
    function section(iconCls, icon, title, hint, id, rows, extraCls, val) {
      return (
        '<section class="tool-report-section">' +
        '<div class="tool-report-section-head">' +
        '<span class="tool-report-section-icon tool-report-section-icon--' + iconCls + '"><i class="fa-solid ' + icon + '"></i></span>' +
        '<h4>' + esc(title) + '</h4>' +
        '<span class="tool-report-section-hint">' + esc(hint) + '</span></div>' +
        '<textarea id="' + id + '" class="tool-report-area' + (extraCls || '') + '" rows="' + rows + '">' + esc(val) + '</textarea>' +
        '</section>'
      );
    }
    return (
      '<div class="tool-app tool-report">' +
      '<header class="tool-report-header">' +
      '<div class="tool-report-header-icon"><i class="fa-solid fa-file-shield"></i></div>' +
      '<div class="tool-report-header-text">' +
      '<h2>Ön İnceleme Raporu</h2>' +
      '<p>Gece Açılan Kapı — RDP Maruziyeti ve Güvenlik Duvarı Krizi</p>' +
      '<div class="tool-report-meta">' +
      '<span><i class="fa-solid fa-ticket"></i> ' + esc(tk.id) + '</span>' +
      '<span><i class="fa-solid fa-desktop"></i> ' + esc(tk.device) + '</span>' +
      '<span><i class="fa-solid fa-user"></i> ' + esc(tk.user) + '</span>' +
      '</div></div></header>' +
      '<div class="tool-report-body">' + statusHtml +
      section('bulgu', 'fa-magnifying-glass', 'Bulgu', 'Tespitler', 'reportBulgu', 5, '', s.bulgu) +
      section('etki', 'fa-chart-line', 'Etki', 'Risk değerlendirmesi', 'reportEtki', 4, '', s.etki) +
      section('oneri', 'fa-clipboard-list', 'Öneri', 'Müdahale planı', 'reportOneri', 4, '', s.oneri) +
      section('kanit', 'fa-paperclip', 'Kanıt', 'Sepet özeti', 'reportKanit', 7, ' tool-report-area--kanit', s.kanit) +
      '</div>' +
      '<footer class="tool-report-footer">' +
      '<button type="button" class="tool-btn tool-btn--primary" id="btnSaveReport"><i class="fa-solid fa-file-circle-check"></i> Raporu tamamla ve simülasyonu bitir</button>' +
      '</footer></div>'
    );
  }

  function getReportMissing() {
    var miss = [];
    if (!hasEvidenceMatch('NET-417')) miss.push('Ticket kanıtı eksik.');
    if (!hasEvidenceMatch('3389')) miss.push('3389 port kanıtı eksik.');
    if (!hasEvidenceMatch('TermService')) miss.push('PID/servis eşleştirme kanıtı eksik.');
    if (!hasEvidenceMatch('Remote Desktop')) miss.push('Firewall Allow kuralı kanıtı eksik.');
    if (!checkLogGate()) miss.push('Log kanıtı eksik (3 başarısız + RDP allow rule active).');
    if (!hasEvidenceMatch('TEMP_RDP')) miss.push('NAT kuralı kanıtı eksik.');
    return miss;
  }

  function buildReportSections() {
    var t = CFG.reportTemplate;
    var kanit =
      t.kanitHeader + '\n' +
      state.evidence.map(function (e) { return '- ' + e.label + ': ' + e.detail; }).join('\n');
    return { bulgu: t.bulgu, etki: t.etki, oneri: t.oneri, kanit: kanit };
  }

  function renderWorkspaceOld() {
    var html = '';
    switch (state.activeTab) {
      case 'ticket': html = renderTicketPanel(); break;
      case 'overview': html = renderOverview(); state.flags.overviewSeen = true; break;
      case 'fw-profiles': html = renderFwProfiles(); state.flags.fwProfilesSeen = true; break;
      case 'ports': html = renderPorts(); break;
      case 'services': html = renderServices(); break;
      case 'fw-rules': html = renderFwRules(); state.flags.fwRulesSeen = true; break;
      case 'logs': html = renderLogs(); break;
      case 'edge-nat': html = renderEdgeNat(); break;
      case 'report': html = renderReportPanel(); break;
      default: html = renderTicketPanel();
    }
    $('workspace').innerHTML = html;
    bindWorkspaceEvents();
    save();
  }

  function bindWorkspaceEvents() {
    var tbtn = $('btnAddTicket');
    if (tbtn) tbtn.onclick = function () {
      if (addEvidence('Ticket', CFG.ticket.id + ' · ' + CFG.ticket.device)) setFeedback('ok', 'Ticket kanıta eklendi.');
      else setFeedback('info', 'Bu kanıt zaten sepette.');
    };
    document.querySelectorAll('tr[data-port]').forEach(function (row) {
      row.onclick = function (e) {
        e.stopPropagation();
        state.selectedPort = +row.getAttribute('data-port');
        renderMacDesktop();
      };
    });
    var pbtn = $('btnAddPort');
    if (pbtn) pbtn.onclick = function () {
      var idx = state.selectedPort;
      if (idx == null || !CFG.ports[idx]) return;
      var p = CFG.ports[idx];
      if (p.port === 3389) {
        var d = CFG.portDetail3389;
        if (addEvidence('Açık port', 'TCP ' + d.listen + ':' + d.port + ' LISTENING PID ' + d.pid)) {
          setFeedback('ok', 'Port kanıtı eklendi.');
          if (state.stage === 2 && !state.decisionLocked) renderStagePanel();
        } else setFeedback('info', 'Bu kanıt zaten sepette.');
      } else {
        setFeedback('info', 'Bu port bu olay için yeterli kanıt değil.');
        showBeratPortWarning(getWrongPortEvidenceMsg(p));
      }
    };
    document.querySelectorAll('[data-pid]').forEach(function (chip) {
      chip.onclick = function () {
        state.selectedPid = +chip.getAttribute('data-pid');
        renderMacDesktop();
      };
    });
    var sbtn = $('btnAddService');
    if (sbtn) sbtn.onclick = function () {
      var pid = state.selectedPid;
      if (pid == null || !CFG.services[pid]) return;
      var s = CFG.services[pid];
      if (pid === 1148) {
        if (addEvidence('Servis', 'PID ' + s.pid + ' · ' + s.service + ' / ' + s.displayName)) {
          setFeedback('ok', 'Servis kanıtı eklendi.');
        } else setFeedback('info', 'Bu kanıt zaten sepette.');
      } else {
        setFeedback('info', 'Bu servis bu olay için yeterli kanıt değil.');
        showBeratEvidenceWarning(
          getWrongServiceEvidenceMsg(pid),
          ' Tekrar düşün — port ile eşleşen doğru servisi bulup kanıta eklemeni istiyorum.'
        );
      }
    };
    document.querySelectorAll('[data-rule]').forEach(function (row) {
      row.onclick = function () {
        state.flags.selectedRule = +row.getAttribute('data-rule');
        renderMacDesktop();
      };
    });
    var fbtn = $('btnAddFwRule');
    if (fbtn) fbtn.onclick = function () {
      var ri = state.flags.selectedRule;
      if (ri == null || !CFG.fwRules[ri]) return;
      if (ri === 0) {
        var c = CFG.criticalRuleDetail;
        if (addEvidence('Firewall kuralı', c.name + ' · Profil: ' + c.profiles + ' · Kaynak: ' + c.remote)) {
          setFeedback('ok', 'Firewall kuralı kanıta eklendi.');
        } else setFeedback('info', 'Bu kanıt zaten sepette.');
      } else {
        setFeedback('info', 'Bu kural bu olay için yeterli kanıt değil.');
        showBeratEvidenceWarning(
          getWrongFwRuleEvidenceMsg(ri),
          ' Tekrar düşün — RDP maruziyetiyle ilgili kritik Allow kuralını bulup kanıta eklemeni istiyorum.'
        );
      }
    };
    document.querySelectorAll('[data-log]').forEach(function (row) {
      row.onclick = function () {
        var i = +row.getAttribute('data-log');
        state.selectedLogs[i] = !state.selectedLogs[i];
        renderMacDesktop();
      };
    });
    var sallBtn = $('btnSelectAllLogs');
    if (sallBtn) sallBtn.onclick = function () {
      CFG.loginLogs.forEach(function (l, i) { state.selectedLogs[i] = true; });
      renderMacDesktop();
      setFeedback('info', 'Tüm log satırları seçildi.');
    };
    var lbtn = $('btnAddLogs');
    if (lbtn) lbtn.onclick = function () {
      var added = 0;
      CFG.loginLogs.forEach(function (l, i) {
        if (state.selectedLogs[i]) {
          if (addEvidence('Log ' + l.t, l.ev + ' · ' + l.user + ' · ' + l.src + ' · ' + l.result)) added++;
        }
      });
      state.selectedLogs = {};
      renderMacDesktop();
      if (added) setFeedback('ok', added + ' log satırı kanıta eklendi.');
      else setFeedback('info', 'Önce log satırlarını seçin.');
    };
    var nbtn = $('btnAddNat');
    if (nbtn) nbtn.onclick = function () {
      var n = CFG.edgeNat;
      if (addEvidence('Edge NAT', n.name + ' · ' + n.publicPort + ' → ' + n.internalHost)) {
        setFeedback('ok', 'NAT kuralı kanıta eklendi.');
      }
    };
    var rbtn = $('btnSaveReport');
    if (rbtn) rbtn.onclick = function () {
      var miss = getReportMissing();
      if (miss.length) {
        setFeedback('bad', 'Rapor eksik: ' + miss.join(' '));
        return;
      }
      showFinal();
    };
  }

  var SUPERVISOR = { name: 'Berat', title: 'SOC Süpervizör', initial: 'B' };
  var supervisorTypeTimer = null;

  function cancelSupervisorTyping() {
    if (supervisorTypeTimer) {
      clearInterval(supervisorTypeTimer);
      supervisorTypeTimer = null;
    }
  }

  function buildSupervisorHtml(mode) {
    var cls = 'gk-supervisor';
    if (mode === 'wrong') cls += ' gk-supervisor--wrong';
    if (mode === 'ok') cls += ' gk-supervisor--ok';
    return '<div class="' + cls + '" id="supervisorBlock">' +
      '<div class="gk-supervisor-avatar">' + esc(SUPERVISOR.initial) + '</div>' +
      '<div class="gk-supervisor-body">' +
      '<div class="gk-supervisor-name">' + esc(SUPERVISOR.name) + ' · ' + esc(SUPERVISOR.title) + '</div>' +
      '<div class="gk-supervisor-bubble"><p class="gk-supervisor-text" id="supervisorText"></p></div>' +
      '</div></div>';
  }

  function startSupervisorSpeech(text, onComplete) {
    cancelSupervisorTyping();
    var el = $('supervisorText');
    if (!el) {
      if (onComplete) onComplete();
      return;
    }
    var full = text || '';
    var i = 0;
    el.textContent = '';
    el.classList.add('gk-supervisor-text--typing');
    supervisorTypeTimer = setInterval(function () {
      if (i >= full.length) {
        cancelSupervisorTyping();
        el.classList.remove('gk-supervisor-text--typing');
        if (onComplete) onComplete();
        return;
      }
      el.textContent += full.charAt(i);
      i++;
    }, 24);
  }

  function setSupervisorMode(mode) {
    var block = $('supervisorBlock');
    if (!block) return;
    block.className = 'gk-supervisor';
    if (mode === 'wrong') block.classList.add('gk-supervisor--wrong');
    if (mode === 'ok') block.classList.add('gk-supervisor--ok');
  }

  function hideDecisionArea() {
    var da = $('decisionArea');
    if (da) da.classList.remove('gk-decision-area--visible');
  }

  function showDecisionArea() {
    var da = $('decisionArea');
    if (da) da.classList.add('gk-decision-area--visible');
  }

  function getSupervisorPrompt(st) {
    if (st.id === 2 && st.gate === 'port3389Evidence' && gateOk(st.gate) && st.supervisorPromptAfterEvidence) {
      return st.supervisorPromptAfterEvidence;
    }
    return st.supervisorPrompt || st.question || '';
  }

  function clearStageFeedback() {
    var el = $('stageFeedback');
    if (!el) return;
    el.className = 'gk-feedback';
    el.textContent = '';
  }

  function getWrongPortEvidenceMsg(p) {
    var onPortsStage = state.stage === 2;
    if (onPortsStage) {
      var vague = {
        49664:
          'Bu satır yalnızca localhost\'ta dinliyor; gece ticket\'ındaki dış uzak oturum şüphesiyle örtüşmüyor. Tabloyu baştan tara — dinleme adresine ve olayın doğasına dikkat et.',
        5353:
          'Bu port yerel ağ servisi gibi görünüyor; uzak oturum maruziyeti için ana kanıt değil. Hangi satırın geniş kapsamda dinlediğine sen karar ver.',
        445:
          'SMB ayrı bir konu; bu ticket uzaktan oturum odaklı. Tabloda olayla doğrudan ilişkili portu kendin bulmalısın.',
        9229:
          'Localhost\'ta dinleyen bir araç; dış erişim sinyali değil. Ticket özetini ve tabloyu birlikte değerlendir.'
      };
      return (
        vague[p.port] ||
        'Bu port bu olay için yeterli kanıt gibi durmuyor. Tabloyu ve ticket\'ı yeniden incele — doğru satırı sen bulmalısın.'
      );
    }
    var msgs = {
      49664:
        '49664 yalnızca 127.0.0.1 üzerinde dinliyor; dış uzak oturum denemeleriyle doğrudan örtüşmüyor. Daha dikkatli incele.',
      5353:
        '5353 yerel ağ servisi; bu vakadaki uzak oturum bulgusu değil. Tabloda hangi portun 0.0.0.0\'da dinlediğine tekrar bak.',
      445:
        '445 (SMB) ayrıca incelenebilir; fakat bu olayda uzak oturum portuna odaklan. Yanlış kanıt analizi kaydırır.',
      9229:
        '9229 localhost geliştirme aracı; dış erişim sinyali değil. Olayla ilişkili portu bulup onu kanıta eklemelisin.'
    };
    return msgs[p.port] || 'Bu port bu olay için ana kanıt değil. Tabloyu yeniden incele.';
  }

  function showBeratEvidenceWarning(text, suffix) {
    var sc = $('stageContent');
    if (!sc) {
      setFeedback('bad', text);
      return;
    }
    cancelSupervisorTyping();
    var lbl = $('decisionSectionLabel');
    if (lbl) lbl.textContent = 'Berat ile görüşme';
    sc.innerHTML = buildSupervisorHtml('wrong');
    setSupervisorMode('wrong');
    clearStageFeedback();
    startSupervisorSpeech(text + suffix, function () {});
  }

  function showBeratPortWarning(text) {
    var suffix = state.stage === 2
      ? ' Tekrar düşün — tabloyu ve ticket\'ı birlikte inceleyip doğru kanıtı kendin bulmalısın.'
      : ' Tekrar düşün — doğru portu bulup kanıta eklemeni istiyorum.';
    showBeratEvidenceWarning(text, suffix);
  }

  function getWrongServiceEvidenceMsg(pid) {
    var msgs = {
      912: 'RPC Endpoint Mapper çekirdek bir servistir; 3389 portunu kullanan TermService kanıtı değildir. Port–PID eşleştirmesinde doğru satırı seç.',
      4: 'PID 4 System sürecidir; Remote Desktop Services (TermService) değildir. Açık port analiziyle ilişkili servisi bulmalısın.'
    };
    return msgs[pid] || 'Bu servis bu olay için ana kanıt değil. Port 3389 ile eşleşen servisi seçip kanıta ekle.';
  }

  function getWrongFwRuleEvidenceMsg(ruleIdx) {
    var msgs = {
      1: 'SMB (445) Private profilde ayrıca incelenebilir; fakat bu vakada en kritik bulgu Public profilde Any→3389 RDP Allow kuralıdır.',
      2: 'DNS (53) çekirdek ağ trafiği için normal bir kuraldır; uzak oturum maruziyeti kanıtı değildir.',
      3: 'Telnet\'in engellenmesi olumlu bir durumdur; gece ticket\'ındaki RDP Allow kuralı değildir.'
    };
    return msgs[ruleIdx] || 'Bu firewall kuralı bu olay için ana kanıt değil. RDP ile ilgili kritik Allow kuralını seç.';
  }

  function showSupervisorOptions(st) {
    $('decisionArea').innerHTML =
      '<p class="gk-options-label">Yanıtınız</p>' +
      renderDecisionCards(st.options, false);
    bindDecision(st);
    showDecisionArea();
  }

  function renderDecisionCards(options, multi) {
    return options.map(function (o, i) {
      var txt = typeof o === 'string' ? o : o.text;
      return '<button type="button" class="gk-decision-card" data-idx="' + i + '">' + esc(txt) + '</button>';
    }).join('') +
      (multi
        ? '<button type="button" class="gk-btn gk-btn--sm" id="btnConfirmMulti" style="width:100%;margin-top:0.4rem">Seçimi onayla</button>'
        : '<button type="button" class="gk-btn gk-btn--sm gk-btn--ghost" id="btnConfirmSingle" style="width:100%;margin-top:0.4rem">Seçimi onayla</button>');
  }

  function bindDecision(stageCfg) {
    state.decisionConfig = stageCfg;
    state.selectedDecision = null;
    document.querySelectorAll('.gk-decision-card').forEach(function (btn) {
      btn.onclick = function () {
        if (state.decisionLocked) return;
        document.querySelectorAll('.gk-decision-card').forEach(function (b) { b.classList.remove('gk-decision-card--pick'); });
        btn.classList.add('gk-decision-card--pick');
        state.selectedDecision = +btn.getAttribute('data-idx');
      };
    });
    var cbtn = $('btnConfirmSingle');
    if (cbtn) cbtn.onclick = confirmDecision;
  }

  function confirmDecision() {
    var cfg = state.decisionConfig;
    if (!cfg || state.decisionLocked) return;
    if (state.selectedDecision == null) {
      setFeedback('info', 'Önce bir seçenek işaretleyin.');
      return;
    }
    if (cfg.gate && !gateOk(cfg.gate)) {
      clearStageFeedback();
      setSupervisorMode('');
      var gateText = 'Henüz yeterli kanıt toplamadık. ' + gateMsg(cfg.gate);
      startSupervisorSpeech(gateText, function () {});
      if (cfg.tab) { openApp(cfg.tab); }
      if (cfg.alsoVisit) cfg.alsoVisit.forEach(function (t) { openApp(t); });
      return;
    }
    var i = state.selectedDecision;
    var cards = document.querySelectorAll('.gk-decision-card');
    var cb = $('btnConfirmSingle');
    if (i === cfg.correct) {
      state.decisionLocked = true;
      state.stageDone[cfg.id] = true;
      updateScore(cfg.pts);
      clearStageFeedback();
      setSupervisorMode('ok');
      cards.forEach(function (b, j) {
        b.disabled = true;
        if (j === cfg.correct) b.classList.add('gk-decision-card--ok');
      });
      if (cb) cb.disabled = true;
      startSupervisorSpeech(cfg.ok, function () {
        $('btnNextStage').classList.remove('hidden');
        scrollToNext();
      });
      save();
    } else {
      state.decisionLocked = true;
      state.stageDone[cfg.id] = true;
      state.stageWrong[cfg.id] = true;
      deductScore(cfg.pts || 10);
      clearStageFeedback();
      cards.forEach(function (b, j) {
        b.disabled = true;
        if (j === i) b.classList.add('gk-decision-card--bad');
        if (j === cfg.correct) b.classList.add('gk-decision-card--ok');
      });
      if (cb) cb.disabled = true;
      setSupervisorMode('wrong');
      var wrongText = cfg.wrong[i] || 'Bu seçenek uygun değil.';
      startSupervisorSpeech(wrongText, function () {
        scheduleAutoNextStage();
      });
      save();
    }
  }

  function renderOrderList() {
    var host = $('orderList');
    if (!host) return;
    if (!state.orderDisplay.length) initOrderDisplay();
    var locked = state.decisionLocked && state.stageDone[7];
    host.innerHTML = state.orderDisplay.map(function (idx) {
      var badge = getOrderBadge(idx);
      var cls = 'gk-order-item';
      if (badge) cls += ' gk-order-item--picked';
      if (locked) cls += ' gk-order-item--locked';
      var badgeHtml = badge ? '<span class="gk-order-badge">' + badge + '</span>' : '';
      return '<li class="' + cls + '" data-idx="' + idx + '">' + badgeHtml +
        '<span class="gk-order-text">' + esc(CFG.intervention[idx]) + '</span></li>';
    }).join('');
    bindOrder();
  }

  function bindOrder() {
    var locked = state.decisionLocked && state.stageDone[7];
    document.querySelectorAll('.gk-order-item').forEach(function (item) {
      item.onclick = function () {
        if (locked) return;
        var idx = +item.getAttribute('data-idx');
        var pos = state.orderPick.indexOf(idx);
        if (pos >= 0) {
          state.orderPick.splice(pos, 1);
        } else {
          state.orderPick.push(idx);
        }
        renderOrderList();
      };
    });
    var confirmBtn = $('btnConfirmOrder');
    var clearBtn = $('btnClearOrder');
    if (confirmBtn) {
      confirmBtn.disabled = locked;
      confirmBtn.onclick = confirmOrder;
    }
    if (clearBtn) {
      clearBtn.disabled = locked;
      clearBtn.onclick = function () {
        if (locked) return;
        state.orderPick = [];
        renderOrderList();
      };
    }
  }

  function confirmOrder() {
    if (state.decisionLocked) return;
    var st = CFG.stages[7];
    var n = CFG.intervention.length;
    clearStageFeedback();
    if (state.orderPick.length < n) {
      setSupervisorMode('');
      startSupervisorSpeech(
        'Henüz tüm adımları numaralandırmadın (' + state.orderPick.length + '/' + n + '). Doğru sırayla tıklamaya devam et, sonra Onayla.',
        function () {}
      );
      return;
    }
    if (isCorrectOrder(state.orderPick)) {
      state.stageDone[7] = true;
      state.decisionLocked = true;
      updateScore(st.pts || 10);
      setSupervisorMode('ok');
      startSupervisorSpeech(st.ok || 'Doğru müdahale sırası.', function () {
        $('btnNextStage').classList.remove('hidden');
        renderOrderList();
        scrollToNext();
        save();
      });
    } else {
      state.stageDone[7] = true;
      state.decisionLocked = true;
      state.stageWrong[7] = true;
      deductScore(st.pts || 10);
      setSupervisorMode('wrong');
      startSupervisorSpeech(st.orderWrong || 'Bu sıra doğru değil.', function () {
        renderOrderList();
        scheduleAutoNextStage();
      });
      save();
    }
  }

  function renderStagePanel() {
    var st = CFG.stages[state.stage];
    if (!st) return;
    cancelSupervisorTyping();
    clearStageFeedback();

    if (st.type === 'report') {
      $('decisionSectionLabel').textContent = 'Final rapor';
      $('stageContent').innerHTML = '<p class="gk-muted">Dock\'tan Final Report uygulamasını açıp raporu tamamlayın.</p>';
      $('decisionArea').innerHTML = '';
      hideDecisionArea();
      openApp('report');
      return;
    }

    if (st.type === 'order') {
      $('decisionSectionLabel').textContent = 'Berat ile görüşme';
      hideDecisionArea();
      $('stageContent').innerHTML = buildSupervisorHtml('');
      $('decisionArea').innerHTML =
        '<p class="gk-muted" style="margin:0 0 0.45rem;font-size:0.68rem">Adımlara doğru sırayla tıklayın; sağ üstte numara görünür.</p>' +
        '<ul class="gk-order-list" id="orderList"></ul>' +
        '<div class="gk-order-actions">' +
        '<button type="button" class="gk-btn gk-btn--sm" id="btnConfirmOrder">Onayla</button>' +
        '<button type="button" class="gk-btn gk-btn--sm gk-btn--ghost" id="btnClearOrder">Temizle</button>' +
        '</div>';
      state.decisionConfig = null;
      if (!(state.decisionLocked && state.stageDone[st.id]) && !state.orderDisplay.length) {
        initOrderDisplay();
      }
      if (state.decisionLocked && state.stageDone[st.id]) {
        var elDone = $('supervisorText');
        if (elDone) {
          elDone.textContent = state.stageWrong[st.id]
            ? (st.orderWrong || 'Bu sıra doğru değil.')
            : (st.ok || getSupervisorPrompt(st));
        }
        setSupervisorMode(state.stageWrong[st.id] ? 'wrong' : 'ok');
        showDecisionArea();
        renderOrderList();
        return;
      }
      startSupervisorSpeech(getSupervisorPrompt(st), function () {
        showDecisionArea();
        renderOrderList();
      });
      return;
    }

    $('decisionSectionLabel').textContent = 'Berat ile görüşme';
    hideDecisionArea();
    $('stageContent').innerHTML = buildSupervisorHtml('');
    $('decisionArea').innerHTML = '';
    if (st.tab) state.activeTab = st.tab;

    if (state.decisionLocked && state.stageDone[st.id]) {
      var elOk = $('supervisorText');
      if (elOk) {
        elOk.textContent = state.stageWrong[st.id]
          ? (st.wrong && state.selectedDecision != null && st.wrong[state.selectedDecision]) || 'Yanlış seçim.'
          : (st.ok || getSupervisorPrompt(st));
        setSupervisorMode(state.stageWrong[st.id] ? 'wrong' : 'ok');
      }
      showSupervisorOptions(st);
      document.querySelectorAll('.gk-decision-card').forEach(function (b, j) {
        b.disabled = true;
        if (j === st.correct) b.classList.add('gk-decision-card--ok');
      });
      var cbDone = $('btnConfirmSingle');
      if (cbDone) cbDone.disabled = true;
      return;
    }

    if (st.id === 2 && st.gate === 'port3389Evidence' && !gateOk(st.gate)) {
      setSupervisorMode('');
      startSupervisorSpeech(getSupervisorPrompt(st), function () {
        hideDecisionArea();
      });
      return;
    }

    if (st.id === 2 && st.gate === 'port3389Evidence' && gateOk(st.gate)) {
      setSupervisorMode('');
      var afterMsg = st.supervisorPromptAfterEvidence || getSupervisorPrompt(st);
      startSupervisorSpeech(afterMsg, function () {
        showSupervisorOptions(st);
      });
      return;
    }

    setSupervisorMode('');
    startSupervisorSpeech(getSupervisorPrompt(st), function () {
      showSupervisorOptions(st);
    });
  }

  function nextStage() {
    cancelSupervisorTyping();
    if (state.stage >= 7) {
      state.stage = 8;
      state.activeTab = 'report';
      state.decisionLocked = false;
    } else {
      state.stage++;
      state.decisionLocked = false;
      state.selectedDecision = null;
      var st = CFG.stages[state.stage];
      if (st && st.tab) state.activeTab = st.tab;
      if (st && st.type === 'order') {
        state.orderPick = [];
        state.orderDisplay = [];
      }
    }
    $('btnNextStage').classList.add('hidden');
    renderAll();
    save();
  }

  function showFinal() {
    var reportSt = CFG.stages[8];
    if (reportSt && reportSt.pts && !state.stageDone[8]) {
      state.stageDone[8] = true;
      updateScore(reportSt.pts);
    }
    $('app').classList.add('hidden');
    $('finalScreen').classList.remove('hidden');
    $('finalScore').textContent = state.score + ' / 100';
    $('finalMsg').textContent = state.score >= 75 ? 'Güçlü analist performansı.' : 'Temel adımları tamamladınız; RDP maruziyeti konusunu tekrar edebilirsiniz.';
    var bulgu = ($('reportBulgu') && $('reportBulgu').value) || CFG.reportTemplate.bulgu;
    var etki = ($('reportEtki') && $('reportEtki').value) || CFG.reportTemplate.etki;
    var oneri = ($('reportOneri') && $('reportOneri').value) || CFG.reportTemplate.oneri;
    var kanit = ($('reportKanit') && $('reportKanit').value) || buildReportSections().kanit;
    $('reportBox').value = 'Bulgu:\n' + bulgu + '\n\nEtki:\n' + etki + '\n\nÖneri:\n' + oneri + '\n\nKanıt:\n' + kanit;
    $('gainsList').innerHTML = CFG.gains.map(function (g) {
      return '<li>' + esc(g) + '</li>';
    }).join('');
    if (window.SimulationTracker && window.SimulationTracker.saveCompletion) {
      window.SimulationTracker.saveCompletion(SIM_ID, SIM_NAME, {
        score: state.score,
        maxScore: 100,
        timeSpentSeconds: state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : 0,
        passed: state.score >= 70,
        moduleName: MODULE_NAME,
        redirectToDashboard: false
      });
    }
    if (state.timerId) clearInterval(state.timerId);
    try { localStorage.removeItem(SIM_ID); } catch (e) {}
  }

  function renderAll() {
    renderTaskList();
    renderStepGuide();
    updateHintPopover();
    updateProgress();
    $('scoreLbl').textContent = String(state.score);
    renderMacDesktop();
    renderEvidence();
    renderStagePanel();
    var st = CFG.stages[state.stage];
    if (state.stageDone[st && st.id] || (st && st.type === 'report')) {
      if (state.stage < 8) $('btnNextStage').classList.remove('hidden');
    }
    if (state.stage >= 8) $('btnNextStage').classList.add('hidden');
  }

  function startSim() {
    $('introOverlay').classList.add('hidden');
    $('finalScreen').classList.add('hidden');
    $('app').classList.remove('hidden');
    if (state.timerId) clearInterval(state.timerId);
    state.startedAt = 0;
    resetAll();
    startTimer();
    if (window.SimulationTracker && window.SimulationTracker.recordStart) {
      window.SimulationTracker.recordStart(SIM_ID, SIM_NAME, { moduleName: MODULE_NAME });
    }
  }

  try { localStorage.removeItem(SIM_ID); } catch (e) {}

  $('btnStart').onclick = startSim;
  $('btnNextStage').onclick = nextStage;
  $('btnRestart').onclick = function () {
    $('finalScreen').classList.add('hidden');
    $('app').classList.remove('hidden');
    resetAll();
    startTimer();
  };
  $('btnCopyReport').onclick = function () {
    if (navigator.clipboard) navigator.clipboard.writeText($('reportBox').value);
  };

  $('hintBtn').onclick = function () {
    $('hintPopover').classList.toggle('show');
    $('hintBtn').setAttribute('aria-expanded', $('hintPopover').classList.contains('show'));
  };
  document.addEventListener('click', function (e) {
    var wrap = $('hintBtn') && $('hintBtn').parentElement;
    if (wrap && !wrap.contains(e.target)) $('hintPopover').classList.remove('show');
  });
})();
