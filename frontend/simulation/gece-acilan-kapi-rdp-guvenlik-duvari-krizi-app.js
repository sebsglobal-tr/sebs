/* Gece Açılan Kapı — RDP / Firewall simülasyonu */
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

  var state = {
    stage: 0,
    score: 0,
    evidence: [],
    flags: {},
    stageDone: {},
    activeTab: 'ticket',
    selectedPort: null,
    selectedPid: null,
    selectedLogs: {},
    dragOrder: [],
    decisionLocked: false,
    selectedDecision: null,
    decisionConfig: null,
    reportOpen: false,
    startedAt: 0,
    timerId: null
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function save() {
    /* İlerleme kaydedilmez — her girişte simülasyon baştan başlar. */
  }

  function resetAll() {
    state.stage = 0;
    state.score = 0;
    state.evidence = [];
    state.flags = {};
    state.stageDone = {};
    state.activeTab = 'ticket';
    state.selectedPort = null;
    state.selectedPid = null;
    state.selectedLogs = {};
    state.dragOrder = [];
    state.decisionLocked = false;
    state.selectedDecision = null;
    state.reportOpen = false;
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
      overviewSeen: 'Önce System Overview sekmesini inceleyin.',
      port3389Evidence: 'Önce 3389 port satırını seçip kanıt sepetine ekleyin.',
      serviceEvidence: 'Önce PID 1148 seçip servis kanıtını sepete ekleyin.',
      fwRuleEvidence: 'Önce kritik RDP firewall kuralını kanıt sepetine ekleyin.',
      logEvidence: 'En az 3 başarısız giriş logu ve «RDP allow rule active» kaydını kanıta ekleyin.',
      natEvidence: 'Önce Edge NAT kuralını kanıt sepetine ekleyin.'
    };
    return m[gate] || 'Önce gerekli inceleme adımlarını tamamlayın.';
  }

  function updateScore(pts) {
    state.score = Math.min(100, state.score + pts);
    $('scoreLbl').textContent = String(state.score);
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

  function isCorrectDrag(order) {
    var ref = CFG.intervention;
    return order.length === ref.length && order.every(function (v, i) { return v === i; });
  }

  function shuffleDrag() {
    var n = CFG.intervention.length;
    var arr = [];
    var i;
    for (i = 0; i < n; i++) arr.push(i);
    do {
      for (i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
    } while (isCorrectDrag(arr));
    return arr;
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
    $('tabActionHint').textContent = st.guide.tabHint || 'Orta panelde sekmeler arasında gezinin.';
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

  function renderTabs() {
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
        renderWorkspace();
        save();
      };
    });
  }

  function renderTicketPanel() {
    var t = CFG.ticket;
    return (
      '<div class="gk-card gk-card--ticket">' +
      '<div class="gk-ticket-head"><span class="gk-badge">Ticket</span> <strong>' + esc(t.id) + '</strong></div>' +
      '<dl class="gk-dl">' +
      '<dt>Cihaz</dt><dd>' + esc(t.device) + '</dd>' +
      '<dt>Kullanıcı</dt><dd>' + esc(t.user) + '</dd>' +
      '<dt>OS</dt><dd>' + esc(t.os) + '</dd>' +
      '<dt>Bildirim</dt><dd>' + esc(t.summary) + '</dd>' +
      '<dt>Zaman</dt><dd>' + esc(t.window) + '</dd>' +
      '<dt>Durum</dt><dd>' + esc(t.status) + '</dd>' +
      '</dl>' +
      '<p class="gk-body-text">' + esc(t.body) + '</p>' +
      '<button type="button" class="gk-btn gk-btn--sm" id="btnAddTicket">Ticket\'ı kanıt sepetine ekle</button>' +
      '</div>'
    );
  }

  function renderOverview() {
    var o = CFG.overview;
    return (
      '<div class="gk-card">' +
      '<h3 class="gk-card-title">System Overview</h3>' +
      '<dl class="gk-dl gk-dl--grid">' +
      '<dt>Hostname</dt><dd>' + esc(o.hostname) + '</dd>' +
      '<dt>OS</dt><dd>' + esc(o.os) + '</dd>' +
      '<dt>Kullanıcı</dt><dd>' + esc(o.user) + '</dd>' +
      '<dt>Yerel IP</dt><dd class="font-jb">' + esc(o.localIp) + '</dd>' +
      '<dt>Ağ Profili</dt><dd><span class="gk-badge gk-badge--warn">' + esc(o.networkProfile) + '</span></dd>' +
      '<dt>VPN</dt><dd>' + esc(o.vpn) + '</dd>' +
      '<dt>Remote Desktop</dt><dd><span class="gk-badge gk-badge--danger">' + esc(o.rdp) + '</span></dd>' +
      '<dt>Son güncelleme</dt><dd>' + esc(o.lastUpdate) + '</dd>' +
      '<dt>Firewall</dt><dd><span class="gk-badge gk-badge--ok">' + esc(o.firewallStatus) + '</span></dd>' +
      '<dt>Son yeniden başlatma</dt><dd>' + esc(o.lastReboot) + '</dd>' +
      '</dl>' +
      '<div class="gk-edu-box">' + esc(o.eduMsg) + '</div>' +
      '</div>'
    );
  }

  function renderFwProfiles() {
    var rows = CFG.fwProfiles.map(function (p) {
      return '<tr><td>' + esc(p.profile) + '</td><td><span class="gk-badge gk-badge--ok">' + esc(p.status) + '</span></td><td>' + esc(p.inbound) + '</td><td>' + esc(p.note) + '</td></tr>';
    }).join('');
    return (
      '<div class="gk-card">' +
      '<h3 class="gk-card-title">Firewall Profiles</h3>' +
      '<table class="gk-table"><thead><tr><th>Profil</th><th>Durum</th><th>Inbound varsayılan</th><th>Not</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="gk-muted">İlk bakışta normal görünebilir — Firewall Rules sekmesine geçin.</p>' +
      '</div>'
    );
  }

  function renderPorts() {
    var rows = CFG.ports.map(function (p, i) {
      var crit = p.critical ? ' gk-row--crit' : '';
      var sel = state.selectedPort === i ? ' gk-row--sel' : '';
      var badge = p.critical ? '<span class="gk-badge gk-badge--danger">!</span> ' : '';
      return '<tr class="gk-row-click' + crit + sel + '" data-port="' + i + '">' +
        '<td>' + esc(p.proto) + '</td><td class="font-jb">' + esc(p.local) + '</td><td><strong>' + p.port + '</strong></td>' +
        '<td>' + esc(p.state) + '</td><td>' + p.pid + '</td><td>' + badge + esc(p.comment) + '</td></tr>';
    }).join('');
    var detail = '';
    if (state.selectedPort === 0) {
      var d = CFG.portDetail3389;
      detail =
        '<div class="gk-detail-panel">' +
        '<h4>Port detayı — ' + d.port + '</h4>' +
        '<dl class="gk-dl"><dt>Durum</dt><dd>' + esc(d.state) + '</dd><dt>Dinleme</dt><dd class="font-jb">' + esc(d.listen) + '</dd>' +
        '<dt>PID</dt><dd>' + d.pid + '</dd><dt>Not</dt><dd>' + esc(d.note) + '</dd></dl>' +
        '<button type="button" class="gk-btn gk-btn--sm" id="btnAddPort">3389 portunu kanıta ekle</button>' +
        '</div>';
    }
    return (
      '<div class="gk-card">' +
      '<h3 class="gk-card-title">Open Ports <span class="gk-muted">(netstat -ano benzeri)</span></h3>' +
      '<table class="gk-table"><thead><tr><th>Proto</th><th>Local</th><th>Port</th><th>State</th><th>PID</th><th>Yorum</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      detail +
      '</div>'
    );
  }

  function renderServices() {
    var pids = Object.keys(CFG.services);
    var chips = pids.map(function (pid) {
      var sel = state.selectedPid === +pid ? ' gk-chip--active' : '';
      return '<button type="button" class="gk-chip' + sel + '" data-pid="' + pid + '">PID ' + pid + '</button>';
    }).join('');
    var body = '<p class="gk-muted">PID 1148 seçin (3389 ile eşleşen).</p>';
    if (state.selectedPid && CFG.services[state.selectedPid]) {
      var s = CFG.services[state.selectedPid];
      body =
        '<dl class="gk-dl">' +
        '<dt>PID</dt><dd>' + s.pid + '</dd>' +
        '<dt>Süreç</dt><dd>' + esc(s.process) + '</dd>' +
        '<dt>Servis</dt><dd><strong>' + esc(s.service) + '</strong></dd>' +
        '<dt>Display Name</dt><dd>' + esc(s.displayName) + '</dd>' +
        '<dt>Hesap</dt><dd>' + esc(s.account) + '</dd>' +
        '<dt>Başlangıç</dt><dd>' + esc(s.startType) + '</dd>' +
        '<dt>Yol</dt><dd class="font-jb" style="font-size:0.65rem">' + esc(s.path) + '</dd>' +
        '<dt>İmza</dt><dd>' + esc(s.signed) + '</dd>' +
        '</dl>' +
        '<div class="gk-edu-box">' + esc(s.riskNote) + '</div>' +
        '<button type="button" class="gk-btn gk-btn--sm" id="btnAddService">PID/servis kanıtını ekle</button>';
    }
    return '<div class="gk-card"><h3 class="gk-card-title">Service Mapper</h3><div class="gk-chips">' + chips + '</div>' + body + '</div>';
  }

  function renderFwRules() {
    var rows = CFG.fwRules.map(function (r, i) {
      var crit = r.critical ? ' gk-row--crit' : '';
      var sel = state.flags.selectedRule === i ? ' gk-row--sel' : '';
      return '<tr class="gk-row-click' + crit + sel + '" data-rule="' + i + '">' +
        '<td>' + esc(r.name) + '</td><td>' + esc(r.profile) + '</td><td>' + esc(r.port) + '</td>' +
        '<td>' + esc(r.source) + '</td><td>' + esc(r.action) + '</td><td>' +
        (r.critical ? '<span class="gk-badge gk-badge--danger">' + esc(r.status) + '</span>' : esc(r.status)) +
        '</td></tr>';
    }).join('');
    var det = '';
    if (state.flags.selectedRule === 0) {
      var c = CFG.criticalRuleDetail;
      det =
        '<div class="gk-detail-panel">' +
        '<h4>Kritik kural detayı</h4>' +
        '<dl class="gk-dl"><dt>Ad</dt><dd>' + esc(c.name) + '</dd><dt>Profil</dt><dd>' + esc(c.profiles) + '</dd>' +
        '<dt>Eylem</dt><dd>' + esc(c.action) + '</dd><dt>Protokol</dt><dd>' + esc(c.protocol) + '</dd>' +
        '<dt>Local Port</dt><dd>' + c.localPort + '</dd><dt>Remote</dt><dd>' + esc(c.remote) + '</dd>' +
        '<dt>Durum</dt><dd>Enabled</dd></dl>' +
        '<button type="button" class="gk-btn gk-btn--sm" id="btnAddFwRule">Firewall kuralını kanıta ekle</button>' +
        '</div>';
    }
    return '<div class="gk-card"><h3 class="gk-card-title">Firewall Rules</h3><table class="gk-table"><thead><tr><th>Kural</th><th>Profil</th><th>Port</th><th>Kaynak</th><th>Eylem</th><th>Durum</th></tr></thead><tbody>' + rows + '</tbody></table>' + det + '</div>';
  }

  function renderLogs() {
    var rows = CFG.loginLogs.map(function (l, i) {
      var sel = state.selectedLogs[i] ? ' gk-row--sel' : '';
      var resCls = l.fail ? 'gk-badge--danger' : (l.system ? 'gk-badge--warn' : 'gk-badge--ok');
      return '<tr class="gk-row-click' + sel + '" data-log="' + i + '">' +
        '<td class="font-jb">' + esc(l.t) + '</td><td>' + esc(l.ev) + '</td><td>' + esc(l.user) + '</td>' +
        '<td class="font-jb">' + esc(l.src) + '</td><td><span class="gk-badge ' + resCls + '">' + esc(l.result) + '</span></td></tr>';
    }).join('');
    return (
      '<div class="gk-card">' +
      '<h3 class="gk-card-title">Login Logs — zaman çizelgesi</h3>' +
      '<div class="gk-edu-box">' + esc(CFG.logsEduMsg) + '</div>' +
      '<table class="gk-table"><thead><tr><th>Saat</th><th>Olay</th><th>Kullanıcı</th><th>Kaynak IP</th><th>Sonuç</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<button type="button" class="gk-btn gk-btn--sm" id="btnAddLogs" style="margin-top:0.5rem">Seçili logları kanıta ekle</button>' +
      '<p class="gk-muted">En az 3 başarısız deneme + RDP allow rule active kaydı gerekir.</p>' +
      '</div>'
    );
  }

  function renderEdgeNat() {
    var n = CFG.edgeNat;
    return (
      '<div class="gk-card">' +
      '<h3 class="gk-card-title">Edge Firewall / NAT</h3>' +
      '<dl class="gk-dl">' +
      '<dt>Rule Name</dt><dd class="font-jb">' + esc(n.name) + '</dd>' +
      '<dt>Public Port</dt><dd>' + n.publicPort + '</dd>' +
      '<dt>Internal Host</dt><dd class="font-jb">' + esc(n.internalHost) + '</dd>' +
      '<dt>Internal Port</dt><dd>' + n.internalPort + '</dd>' +
      '<dt>Status</dt><dd><span class="gk-badge gk-badge--danger">' + esc(n.status) + '</span></dd>' +
      '<dt>Created</dt><dd>' + esc(n.created) + '</dd>' +
      '<dt>Purpose</dt><dd>' + esc(n.purpose) + '</dd>' +
      '<dt>Owner</dt><dd>' + esc(n.owner) + '</dd>' +
      '<dt>Expected Expiry</dt><dd>' + esc(n.expectedExpiry) + '</dd>' +
      '<dt>Actual</dt><dd><span class="gk-badge gk-badge--warn">' + esc(n.actual) + '</span></dd>' +
      '</dl>' +
      '<div class="gk-edu-box"><strong>Sistem sahibi notu:</strong> ' + esc(n.ownerNote) + '</div>' +
      '<button type="button" class="gk-btn gk-btn--sm" id="btnAddNat">NAT kuralını kanıta ekle</button>' +
      '</div>'
    );
  }

  function renderReportPanel() {
    var missing = getReportMissing();
    var warn = missing.length
      ? '<div class="gk-edu-box gk-edu-box--warn"><strong>Eksik kanıt:</strong><ul>' + missing.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>'
      : '<div class="gk-edu-box gk-edu-box--ok">Zorunlu kanıtlar tamam. Raporu düzenleyip kaydedebilirsiniz.</div>';
    var s = buildReportSections();
    return (
      '<div class="gk-card">' +
      '<h3 class="gk-card-title">Final Report</h3>' + warn +
      '<div class="gk-report-field"><label>Bulgu</label><textarea id="reportBulgu" rows="4">' + esc(s.bulgu) + '</textarea></div>' +
      '<div class="gk-report-field"><label>Etki</label><textarea id="reportEtki" rows="4">' + esc(s.etki) + '</textarea></div>' +
      '<div class="gk-report-field"><label>Öneri</label><textarea id="reportOneri" rows="4">' + esc(s.oneri) + '</textarea></div>' +
      '<div class="gk-report-field"><label>Kanıt</label><textarea id="reportKanit" rows="6">' + esc(s.kanit) + '</textarea></div>' +
      '<button type="button" class="gk-btn" id="btnSaveReport" style="width:100%;margin-top:0.5rem">Raporu tamamla</button>' +
      '</div>'
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

  function renderWorkspace() {
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
    };
    document.querySelectorAll('[data-port]').forEach(function (row) {
      row.onclick = function () {
        state.selectedPort = +row.getAttribute('data-port');
        renderWorkspace();
      };
    });
    var pbtn = $('btnAddPort');
    if (pbtn) pbtn.onclick = function () {
      var d = CFG.portDetail3389;
      if (addEvidence('Açık port', 'TCP ' + d.listen + ':' + d.port + ' LISTENING PID ' + d.pid)) {
        setFeedback('ok', '3389 port kanıtı eklendi.');
      }
    };
    document.querySelectorAll('[data-pid]').forEach(function (chip) {
      chip.onclick = function () {
        state.selectedPid = +chip.getAttribute('data-pid');
        renderWorkspace();
      };
    });
    var sbtn = $('btnAddService');
    if (sbtn) sbtn.onclick = function () {
      var s = CFG.services[state.selectedPid];
      if (!s) return;
      if (addEvidence('Servis', 'PID ' + s.pid + ' · ' + s.service + ' / ' + s.displayName)) {
        setFeedback('ok', 'Servis kanıtı eklendi.');
      }
    };
    document.querySelectorAll('[data-rule]').forEach(function (row) {
      row.onclick = function () {
        state.flags.selectedRule = +row.getAttribute('data-rule');
        renderWorkspace();
      };
    });
    var fbtn = $('btnAddFwRule');
    if (fbtn) fbtn.onclick = function () {
      var c = CFG.criticalRuleDetail;
      if (addEvidence('Firewall kuralı', c.name + ' · Profil: ' + c.profiles + ' · Kaynak: ' + c.remote)) {
        setFeedback('ok', 'Firewall kuralı kanıta eklendi.');
      }
    };
    document.querySelectorAll('[data-log]').forEach(function (row) {
      row.onclick = function () {
        var i = +row.getAttribute('data-log');
        state.selectedLogs[i] = !state.selectedLogs[i];
        renderWorkspace();
      };
    });
    var lbtn = $('btnAddLogs');
    if (lbtn) lbtn.onclick = function () {
      var added = 0;
      CFG.loginLogs.forEach(function (l, i) {
        if (state.selectedLogs[i]) {
          if (addEvidence('Log ' + l.t, l.ev + ' · ' + l.user + ' · ' + l.src + ' · ' + l.result)) added++;
        }
      });
      state.selectedLogs = {};
      renderWorkspace();
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
      setFeedback('info', gateMsg(cfg.gate));
      if (cfg.tab) {
        state.activeTab = cfg.tab;
        if (cfg.tab === 'overview') state.flags.overviewSeen = true;
        if (cfg.tab === 'fw-rules') state.flags.fwRulesSeen = true;
      }
      if (cfg.alsoVisit) cfg.alsoVisit.forEach(function (t) { state.flags['visit_' + t] = true; });
      renderTabs();
      renderWorkspace();
      return;
    }
    var i = state.selectedDecision;
    var cards = document.querySelectorAll('.gk-decision-card');
    if (i === cfg.correct) {
      state.decisionLocked = true;
      state.stageDone[cfg.id] = true;
      updateScore(cfg.pts);
      setFeedback('ok', cfg.ok);
      cards.forEach(function (b, j) {
        b.disabled = true;
        if (j === cfg.correct) b.classList.add('gk-decision-card--ok');
      });
      var cb = $('btnConfirmSingle');
      if (cb) cb.disabled = true;
      $('btnNextStage').classList.remove('hidden');
      scrollToNext();
      save();
    } else {
      setFeedback('bad', cfg.wrong[i] || 'Bu seçenek uygun değil.');
      cards.forEach(function (b, j) {
        if (j === i) b.classList.add('gk-decision-card--bad');
      });
      state.selectedDecision = null;
      cards.forEach(function (b) { b.classList.remove('gk-decision-card--pick'); });
    }
  }

  function renderDragList() {
    if (!state.dragOrder.length || isCorrectDrag(state.dragOrder)) {
      state.dragOrder = shuffleDrag();
    }
    var host = $('dragList');
    if (!host) return;
    host.innerHTML = state.dragOrder.map(function (idx, pos) {
      return '<li class="gk-drag-item" draggable="true" data-pos="' + pos + '">' +
        '<span class="gk-drag-handle"><i class="fa-solid fa-grip-vertical"></i></span>' +
        '<span class="gk-drag-text">' + esc(CFG.intervention[idx]) + '</span>' +
        '<span class="gk-drag-nudge">' +
        '<button type="button" class="gk-nudge" data-dir="up" data-pos="' + pos + '" title="Yukarı">▲</button>' +
        '<button type="button" class="gk-nudge" data-dir="down" data-pos="' + pos + '" title="Aşağı">▼</button>' +
        '</span></li>';
    }).join('');
    bindDrag();
  }

  function bindDrag() {
    var list = $('dragList');
    if (!list) return;
    var dragFrom = null;
    list.querySelectorAll('.gk-drag-item').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        dragFrom = +item.getAttribute('data-pos');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragover', function (e) { e.preventDefault(); });
      item.addEventListener('drop', function (e) {
        e.preventDefault();
        var to = +item.getAttribute('data-pos');
        if (dragFrom == null || dragFrom === to) return;
        var o = state.dragOrder.slice();
        var t = o[dragFrom];
        o.splice(dragFrom, 1);
        o.splice(to, 0, t);
        state.dragOrder = o;
        renderDragList();
      });
    });
    list.querySelectorAll('.gk-nudge').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var pos = +btn.getAttribute('data-pos');
        var dir = btn.getAttribute('data-dir');
        var o = state.dragOrder.slice();
        var np = dir === 'up' ? pos - 1 : pos + 1;
        if (np < 0 || np >= o.length) return;
        var t = o[pos];
        o[pos] = o[np];
        o[np] = t;
        state.dragOrder = o;
        renderDragList();
      };
    });
    var chk = $('btnCheckOrder');
    if (chk) chk.onclick = function () {
      if (isCorrectDrag(state.dragOrder)) {
        state.stageDone[7] = true;
        state.decisionLocked = true;
        updateScore(10);
        setFeedback('ok', 'Doğru müdahale sırası. Önce kanıt ve analiz, sonra düzeltme önerisi ve rapor.');
        $('btnNextStage').classList.remove('hidden');
        scrollToNext();
        save();
      } else {
        setFeedback('bad', 'Bu sıra eksik. Yapılandırma değişikliği yapılmadan önce mevcut port, servis, firewall ve log durumu belgelenmelidir.');
      }
    };
  }

  function renderStagePanel() {
    var st = CFG.stages[state.stage];
    if (!st) return;
    $('decisionSectionLabel').textContent = st.type === 'drag' ? 'Müdahale sırası' : 'Kararınız';
    var content = '';
    if (st.type === 'drag') {
      content = '<ul class="gk-drag-list" id="dragList"></ul><button type="button" class="gk-btn gk-btn--sm" id="btnCheckOrder" style="width:100%">Sırayı kontrol et</button>';
      $('stageContent').innerHTML = '<p class="gk-muted">Adımları sürükleyin veya oklarla sıralayın.</p>';
      $('decisionArea').innerHTML = content;
      renderDragList();
      state.decisionConfig = null;
      return;
    }
    if (st.type === 'report') {
      $('stageContent').innerHTML = '<p class="gk-muted">Final Report sekmesinde raporu tamamlayın.</p>';
      $('decisionArea').innerHTML = '';
      state.activeTab = 'report';
      renderTabs();
      renderWorkspace();
      return;
    }
    $('stageContent').innerHTML = st.question ? '<p class="gk-q">' + esc(st.question) + '</p>' : '';
    $('decisionArea').innerHTML = renderDecisionCards(st.options, false);
    if (st.tab) state.activeTab = st.tab;
    bindDecision(st);
    if (state.decisionLocked && state.stageDone[st.id]) {
      document.querySelectorAll('.gk-decision-card').forEach(function (b, j) {
        b.disabled = true;
        if (j === st.correct) b.classList.add('gk-decision-card--ok');
      });
    }
  }

  function nextStage() {
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
    }
    $('btnNextStage').classList.add('hidden');
    renderAll();
    save();
  }

  function showFinal() {
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
    if (window.SimulationTracker) window.SimulationTracker.complete(SIM_ID, { score: state.score });
    if (state.timerId) clearInterval(state.timerId);
    try { localStorage.removeItem(SIM_ID); } catch (e) {}
  }

  function renderAll() {
    renderTaskList();
    renderStepGuide();
    updateHintPopover();
    updateProgress();
    $('scoreLbl').textContent = String(state.score);
    renderTabs();
    renderWorkspace();
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
