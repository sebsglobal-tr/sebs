/* Orion Gece Alarmı — uygulama mantığı */
(function () {
  'use strict';

  function bootError(msg) {
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.classList.remove('hide');
      var modal = overlay.querySelector('.or-modal');
      if (modal) {
        modal.innerHTML =
          '<p style="color:#fca5a5;font-weight:600;margin:0 0 0.5rem">Simülasyon başlatılamadı</p>' +
          '<p style="font-size:0.85rem;line-height:1.5;color:#a8a29e;margin:0">' + msg + '</p>';
      }
    }
  }

  if (!window.ORION_VAKA || !window.ORION_VAKA.stages) {
    bootError('Vaka verisi yüklenemedi. <code>sim\\baslat.ps1</code> ile sunucuyu başlatın.');
    return;
  }

  var SIM_ID = 'orion-gece-alarmi-kripto-vaka';
  var SIM_NAME = "Orion Arşivi'nde Gece Alarmı";
  var MODULE_NAME = 'Temel Kriptografi';
  var CFG = window.ORION_VAKA;
  var MOCK = CFG.mock;

  var stageIndex = 0;
  var toolsUsed = {};
  var tiffSelected = false;
  var computedMoonHash = '';
  var computedBadgeText = '';
  var findings = [];
  var maxRisk = 1;
  var stageScore = 0;
  var startedAt = 0;
  var reportSaved = false;
  var activeToolId = null;
  var view = 'launcher';

  var RISK_ORDER = { low: 1, medium: 2, high: 3, critical: 4 };
  var RISK_LABEL = { 1: 'Düşük', 2: 'Orta', 3: 'Yüksek', 4: 'Kritik' };
  var RISK_COLOR = { 1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444' };

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function currentStage() {
    return CFG.stages[stageIndex];
  }

  function stageKey() {
    return 's' + stageIndex;
  }

  function getStageTools() {
    if (!toolsUsed[stageKey()]) toolsUsed[stageKey()] = {};
    return toolsUsed[stageKey()];
  }

  function updateRisk(level) {
    var n = RISK_ORDER[level] || 1;
    if (n > maxRisk) {
      maxRisk = n;
      $('riskLbl').textContent = RISK_LABEL[maxRisk];
      $('riskDot').style.background = RISK_COLOR[maxRisk];
    }
  }

  function recalcScore() {
    $('scoreLbl').textContent = String(stageScore);
  }

  function scoreMsg(s) {
    if (s >= 105) return 'Çok iyi. Temel kriptografi kontrollerini doğru araçlarla tamamladın.';
    if (s >= 85) return 'İyi. Ana ayrımlar oturmuş; birkaç yorumu güçlendirebilirsin.';
    if (s >= 65) return 'Gelişiyor. Kavramları tekrar etmek faydalı olur.';
    return 'Simülasyonu tekrar çözmen önerilir.';
  }

  function requiredToolsDone() {
    var st = currentStage();
    var used = getStageTools();
    for (var i = 0; i < st.requiredTools.length; i++) {
      if (!used[st.requiredTools[i]]) return false;
    }
    if (st.needsTiffSelect && !tiffSelected) return false;
    return true;
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  async function sha256Hex(text) {
    var buf = new TextEncoder().encode(text);
    var hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  function decodeB64(str) {
    var bin = atob(str.replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    try {
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      return bin;
    }
  }

  function runProcessing(container, steps, duration) {
    return new Promise(function (resolve) {
      container.innerHTML =
        '<div class="tx-proc">' +
        '<div class="tx-proc-ring"></div>' +
        '<div class="tx-proc-steps" id="procSteps"></div></div>';
      var stepsEl = container.querySelector('#procSteps');
      var stepMs = duration / steps.length;
      var i = 0;
      function next() {
        if (i < steps.length) {
          stepsEl.innerHTML = '<div class="tx-proc-line tx-proc-line--active">' + esc(steps[i]) + '</div>';
          i++;
          setTimeout(next, stepMs);
        } else {
          setTimeout(resolve, 280);
        }
      }
      next();
    });
  }

  function showHint() {
    var pop = $('hintPopover');
    pop.textContent = currentStage().hint;
    pop.classList.add('show');
    $('hintBtn').setAttribute('aria-expanded', 'true');
  }

  function hideHint() {
    $('hintPopover').classList.remove('show');
    $('hintBtn').setAttribute('aria-expanded', 'false');
  }

  function renderTimeline() {
    var root = $('timelineRoot');
    root.innerHTML = '<div class="or-tl-item"><span class="or-tl-time">02:17</span><span>Alarm</span></div>';
    CFG.stages.forEach(function (st, i) {
      var cls = 'or-tl-item';
      if (i === stageIndex) cls += ' or-tl-item--active';
      else if (i < stageIndex) cls += ' or-tl-item--done';
      root.innerHTML +=
        '<div class="' + cls + '"><span class="or-tl-time">' + esc(st.time) + '</span><span>' + esc(st.tl) + '</span></div>';
    });
  }

  function selectTiff(pick) {
    tiffSelected = true;
    pick.classList.add('or-file--selected');
    updateCompleteBtn();
    syncShaToolUi();
  }

  function syncShaToolUi() {
    if (activeToolId !== 'sha') return;
    var meta = $('shaMeta');
    var btn = $('shaRun');
    if (meta) {
      meta.textContent = tiffSelected
        ? 'moonstone_scan_downloaded.tiff (seçildi)'
        : 'Önce Kanıt Kasası\'ndan TIFF seçin';
    }
    if (btn) btn.disabled = !tiffSelected;
  }

  function renderEvidence() {
    var st = currentStage();
    $('alarmBanner').innerHTML = '<strong>#OR-7721</strong> — ' + esc(st.alarmHint);
    $('stageStory').textContent = st.story;
    $('evidenceRoot').innerHTML = st.evidenceHtml;
    tiffSelected = false;
    computedMoonHash = '';
    if (st.needsTiffSelect) {
      var pick = $('pickTiff');
      if (pick) {
        pick.onclick = function () { selectTiff(pick); };
        pick.onkeydown = function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectTiff(pick);
          }
        };
      }
    }
    hideHint();
  }

  function renderFindings() {
    var root = $('findingsRoot');
    if (!findings.length) {
      root.innerHTML = '<p class="or-finding-empty">İnceleme ilerledikçe bulgular burada birikecek.</p>';
      return;
    }
    root.innerHTML = '';
    findings.forEach(function (fd, i) {
      var card = document.createElement('div');
      card.className = 'or-finding-card';
      card.innerHTML =
        '<div class="fc-title">Bulgu ' + (i + 1) + ' — ' + esc(fd.title) + '</div>' +
        '<p>' + esc(fd.evidence) + '</p>' +
        '<span class="fc-risk or-fc-risk--' + fd.riskLevel + '">Risk: ' + esc(fd.risk) + '</span>';
      root.appendChild(card);
    });
  }

  function updateCompleteBtn() {
    var btn = $('btnCompleteStage');
    var ok = requiredToolsDone();
    btn.disabled = !ok;
    btn.title = ok ? 'Bu aşamayı tamamla' : 'Gerekli araçları çalıştırın' + (currentStage().needsTiffSelect && !tiffSelected ? ' ve TIFF dosyasını seçin' : '');
  }

  function markToolUsed(id) {
    getStageTools()[id] = true;
    updateCompleteBtn();
  }

  function renderLauncher() {
    view = 'launcher';
    activeToolId = null;
    var host = $('toolWorkspace');
    var html = '<div class="tx-launcher">';
    CFG.tools.forEach(function (t) {
      html +=
        '<button type="button" class="tx-app-icon" data-tool="' + t.id + '" style="--tx-color:' + t.color + '">' +
        '<span class="tx-app-icon__glyph"><i class="' + t.icon + '"></i></span>' +
        '<span class="tx-app-icon__name">' + esc(t.label) + '</span>' +
        '<span class="tx-app-icon__sub">' + esc(t.sub) + '</span></button>';
    });
    html += '</div>';
    host.innerHTML = html;
    host.querySelectorAll('.tx-app-icon').forEach(function (btn) {
      btn.onclick = function () { openTool(btn.dataset.tool); };
    });
    $('toolNavTitle').textContent = 'Kripto Araç Paneli';
    $('btnToolBack').classList.add('hidden');
  }

  function openTool(id) {
    view = 'tool';
    activeToolId = id;
    $('btnToolBack').classList.remove('hidden');
    var meta = CFG.tools.filter(function (t) { return t.id === id; })[0];
    $('toolNavTitle').textContent = meta ? meta.label + ' · ' + meta.sub : id;
    var host = $('toolWorkspace');
    var builders = {
      b64: buildPageB64,
      sha: buildPageSha,
      compare: buildPageCompare,
      password: buildPagePassword,
      config: buildPageConfig,
      signature: buildPageSignature,
      cert: buildPageCert,
      tls: buildPageTls
    };
    if (builders[id]) builders[id](host);
  }

  function buildPageB64(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--b64">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Base64</span><span class="tx-page-sub">Decoder / RFC 4648</span></div>' +
      '<label class="tx-lbl">Girdi (Base64)</label>' +
      '<textarea class="tx-ta font-jb" id="b64In" spellcheck="false" placeholder="Kanıt kasasından badge_data değerini yapıştırın"></textarea>' +
      '<button type="button" class="tx-action" id="b64Run"><i class="fa-solid fa-play"></i> Çözümle</button>' +
      '<label class="tx-lbl">Çıktı (UTF-8)</label>' +
      '<div class="tx-out font-jb" id="b64Out"><span class="tx-out-placeholder">Çözümleme sonucu burada görünür</span></div>' +
      '</div>';
    $('b64Run').onclick = async function () {
      var out = $('b64Out');
      var raw = $('b64In').value.trim();
      if (!raw) {
        out.innerHTML = '<p class="tx-err">Girdi boş. Kanıt kasasından değeri kopyalayın.</p>';
        return;
      }
      await runProcessing(out, ['Girdi doğrulanıyor…', 'Base64 alfabe eşlemesi…', 'UTF-8 decode…'], 1600);
      try {
        var decoded = decodeB64(raw);
        try {
          var obj = JSON.parse(decoded);
          computedBadgeText = JSON.stringify(obj, null, 2);
          if (obj.employeeId) markToolUsed('b64');
        } catch (e) {
          computedBadgeText = decoded;
        }
        out.innerHTML = '<pre class="tx-pre">' + esc(computedBadgeText) + '</pre>';
      } catch (e) {
        out.innerHTML = '<p class="tx-err">Geçersiz Base64 girdisi.</p>';
      }
    };
  }

  function buildPageSha(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--sha">' +
      '<div class="tx-page-head"><span class="tx-page-logo">SHA-256</span><span class="tx-page-sub">Secure Hash Algorithm</span></div>' +
      '<label class="tx-lbl">Kaynak</label>' +
      '<div class="tx-meta" id="shaMeta">' + (tiffSelected ? 'moonstone_scan_downloaded.tiff (seçildi)' : 'Önce Kanıt Kasası\'ndan TIFF seçin') + '</div>' +
      '<button type="button" class="tx-action" id="shaRun" ' + (tiffSelected ? '' : 'disabled') + '><i class="fa-solid fa-hashtag"></i> Hash Hesapla</button>' +
      '<label class="tx-lbl">Özet (hex)</label>' +
      '<div class="tx-out font-jb" id="shaOut"><span class="tx-out-placeholder">256-bit özet</span></div>' +
      '</div>';
    $('shaRun').onclick = async function () {
      if (!tiffSelected) return;
      var out = $('shaOut');
      await runProcessing(out, ['Dosya okunuyor…', 'Bloklar işleniyor…', 'SHA-256 özet üretiliyor…'], 1800);
      computedMoonHash = await sha256Hex(MOCK.moonContent);
      out.innerHTML = '<pre class="tx-pre tx-pre--hash">' + esc(computedMoonHash) + '</pre>';
      markToolUsed('sha');
    };
    syncShaToolUi();
  }

  function buildPageCompare(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--cmp">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Hash Compare</span><span class="tx-page-sub">Bütünlük doğrulama</span></div>' +
      '<label class="tx-lbl">Referans hash</label>' +
      '<textarea class="tx-ta tx-ta--sm font-jb" id="cmpRefIn" spellcheck="false" placeholder="moonstone_original_hash.txt dosyasından"></textarea>' +
      '<label class="tx-lbl">Hesaplanan hash</label>' +
      '<textarea class="tx-ta tx-ta--sm font-jb" id="cmpCalcIn" spellcheck="false" placeholder="SHA-256 aracı çıktısından"></textarea>' +
      '<button type="button" class="tx-action" id="cmpRun" disabled><i class="fa-solid fa-scale-balanced"></i> Karşılaştır</button>' +
      '<div class="tx-out" id="cmpOut"></div></div>';
    function syncCmpBtn() {
      var ref = $('cmpRefIn').value.trim();
      var calc = $('cmpCalcIn').value.trim();
      $('cmpRun').disabled = !(ref && calc);
    }
    $('cmpRefIn').oninput = syncCmpBtn;
    $('cmpCalcIn').oninput = syncCmpBtn;
    $('cmpRun').onclick = async function () {
      var ref = $('cmpRefIn').value.trim().toLowerCase();
      var calc = $('cmpCalcIn').value.trim().toLowerCase();
      if (!ref || !calc) return;
      var out = $('cmpOut');
      await runProcessing(out, ['Hash dizileri hizalanıyor…', 'Sabitlem uzunluğu kontrolü…', 'Timing-safe karşılaştırma…'], 2000);
      var match = ref === calc;
      out.innerHTML = match
        ? '<div class="tx-match tx-match--ok"><i class="fa-solid fa-circle-check"></i> EŞLEŞİYOR — bütünlük olumlu</div>'
        : '<div class="tx-match tx-match--bad"><i class="fa-solid fa-circle-xmark"></i> EŞLEŞMİYOR</div>';
      if (match && ref === MOCK.moonHash.toLowerCase()) markToolUsed('compare');
    };
  }

  function buildPagePassword(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--pwd">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Password Audit</span><span class="tx-page-sub">Saklama yöntemi analizi</span></div>' +
      '<p class="tx-meta">Kanıt kasasındaki archive_password_sample.csv dosyasını inceleyin, ardından analiz başlatın.</p>' +
      '<button type="button" class="tx-action" id="pwdRun"><i class="fa-solid fa-magnifying-glass-chart"></i> Analiz Et</button>' +
      '<div class="tx-out" id="pwdOut"></div></div>';
    $('pwdRun').onclick = async function () {
      var out = $('pwdOut');
      await runProcessing(out, ['Kayıtlar okunuyor…', 'Algoritma tespiti…', 'OWASP kriterleri…'], 1700);
      out.innerHTML =
        '<div class="tx-report">' +
        '<p><strong>Sonuç:</strong> MD5 — parola saklama için uygun değil.</p>' +
        '<p>Salt görünmüyor · maliyet faktörü yok · hızlı hash.</p>' +
        '<p class="tx-report-rec">Öneri: Argon2id, bcrypt veya scrypt.</p></div>';
      markToolUsed('password');
    };
  }

  function buildPageConfig(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--cfg">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Crypto Config</span><span class="tx-page-sub">restoration_vault_crypto_config.json</span></div>' +
      '<label class="tx-lbl">Yapılandırma (JSON)</label>' +
      '<textarea class="tx-ta font-jb" id="cfgJson" spellcheck="false" placeholder="Kanıt kasasından JSON yapıştırın"></textarea>' +
      '<button type="button" class="tx-action" id="cfgRun"><i class="fa-solid fa-shield-halved"></i> Yapılandırmayı İncele</button>' +
      '<div class="tx-out" id="cfgOut"></div></div>';
    $('cfgRun').onclick = async function () {
      var out = $('cfgOut');
      var raw = $('cfgJson').value.trim();
      if (!raw) {
        out.innerHTML = '<p class="tx-err">JSON boş. Kanıt kasasından yapılandırmayı yapıştırın.</p>';
        return;
      }
      try { JSON.parse(raw); } catch (e) {
        out.innerHTML = '<p class="tx-err">Geçersiz JSON.</p>';
        return;
      }
      await runProcessing(out, ['JSON şema doğrulanıyor…', 'Mod / IV analizi…', 'AEAD tag kontrolü…', 'Anahtar saklama…'], 2200);
      out.innerHTML =
        '<div class="tx-report">' +
        '<p class="tx-risk-line tx-risk--bad"><strong>A</strong> ECB — desen sızıntısı riski</p>' +
        '<p class="tx-risk-line tx-risk--warn"><strong>B</strong> CBC + sabit IV — zayıf</p>' +
        '<p class="tx-risk-line tx-risk--ok"><strong>C</strong> AES-GCM, benzersiz nonce, tag doğrulama, secret manager — önerilen</p>' +
        '<p class="tx-risk-line tx-risk--bad"><strong>D</strong> Sabit nonce, tag doğrulama kapalı, anahtar kaynak kodda</p></div>';
      markToolUsed('config');
    };
  }

  function buildPageSignature(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--sig">' +
      '<div class="tx-page-head"><span class="tx-page-logo">OpenPGP Verify</span><span class="tx-page-sub">restoration_report.pdf.sig</span></div>' +
      '<label class="tx-lbl">Yayınlanan SHA-256</label>' +
      '<textarea class="tx-ta tx-ta--sm font-jb" id="sigHashIn" spellcheck="false" placeholder="Kanıt kasasından hash değerini yapıştırın"></textarea>' +
      '<button type="button" class="tx-action" id="sigRun"><i class="fa-solid fa-file-signature"></i> İmzayı Doğrula</button>' +
      '<div class="tx-out" id="sigOut"></div></div>';
    $('sigRun').onclick = async function () {
      var out = $('sigOut');
      var pasted = $('sigHashIn').value.trim().toLowerCase();
      if (!pasted) {
        out.innerHTML = '<p class="tx-err">Hash değeri girilmedi.</p>';
        return;
      }
      await runProcessing(out, ['Hash bütünlüğü kontrol ediliyor…', 'Açık anahtar yükleniyor…', 'İmza doğrulanıyor…'], 2000);
      var computed = await sha256Hex(MOCK.reportContent);
      var hashOk = computed.toLowerCase() === pasted && pasted === MOCK.reportHash.toLowerCase();
      out.innerHTML =
        '<div class="tx-report">' +
        (hashOk
          ? '<p class="tx-ok-line">SHA-256: referans ile eşleşiyor (' + esc(computed.slice(0, 16)) + '…)</p>'
          : '<p class="tx-err-line">SHA-256: referans ile eşleşmiyor</p>') +
        '<p class="tx-err-line"><strong>Signature Check: BAD signature</strong></p>' +
        '<p>External Restoration Consultant &lt;consultant@orion-archive.test&gt;</p>' +
        '<p class="tx-report-rec">Hash eşleşse bile imza hatası varken rapor onaylanmamalı.</p></div>';
      markToolUsed('signature');
    };
  }

  function buildPageCert(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--cert">' +
      '<div class="tx-page-head"><span class="tx-page-logo">X.509 Inspector</span><span class="tx-page-sub">archive_tls_certificate.txt</span></div>' +
      '<div class="tx-cert-grid">' +
      '<label class="tx-lbl">Requested Host</label><input class="tx-in font-jb" id="certHost" placeholder="vault.orion-archive.test" />' +
      '<label class="tx-lbl">SAN (virgülle)</label><input class="tx-in font-jb" id="certSan" placeholder="archive.orion-archive.test, cdn..." />' +
      '<label class="tx-lbl">Not After (YYYY-MM-DD)</label><input class="tx-in font-jb" id="certExpiry" placeholder="2026-04-01" />' +
      '<label class="tx-lbl">İnceleme tarihi</label><input class="tx-in font-jb" id="certSimDate" placeholder="2026-05-16" />' +
      '</div>' +
      '<button type="button" class="tx-action" id="certRun"><i class="fa-solid fa-certificate"></i> Sertifikayı Doğrula</button>' +
      '<div class="tx-out" id="certOut"></div></div>';
    $('certRun').onclick = async function () {
      var out = $('certOut');
      var host = $('certHost').value.trim().toLowerCase();
      var san = $('certSan').value.trim().toLowerCase();
      var expiry = $('certExpiry').value.trim();
      var simDate = $('certSimDate').value.trim();
      if (!host || !san || !expiry || !simDate) {
        out.innerHTML = '<p class="tx-err">Tüm alanları kanıt kasasından doldurun.</p>';
        return;
      }
      await runProcessing(out, ['SNI eşleşmesi…', 'SAN kontrolü…', 'Geçerlilik tarihi…'], 1800);
      var sanList = san.split(/[,\s]+/).filter(Boolean);
      var hostOk = sanList.indexOf(host) >= 0;
      var expired = expiry < simDate;
      out.innerHTML =
        '<div class="tx-report">' +
        (hostOk ? '' : '<p class="tx-err-line">Host adı uyuşmazlığı: ' + esc(host) + ' SAN listesinde yok</p>') +
        (expired ? '<p class="tx-err-line">Sertifika süresi dolmuş (' + esc(expiry) + ' &lt; ' + esc(simDate) + ')</p>' : '<p class="tx-ok-line">Süre kontrolü: geçerli aralıkta</p>') +
        '</div>';
      markToolUsed('cert');
    };
  }

  function buildPageTls(host) {
    host.innerHTML =
      '<div class="tx-page tx-page--tls">' +
      '<div class="tx-page-head"><span class="tx-page-logo">TLS Analyzer</span><span class="tx-page-sub">Handshake trace</span></div>' +
      '<button type="button" class="tx-action" id="tlsRun"><i class="fa-solid fa-network-wired"></i> Akışı Görüntüle</button>' +
      '<div class="tx-out" id="tlsOut"></div></div>';
    $('tlsRun').onclick = async function () {
      var out = $('tlsOut');
      await runProcessing(out, ['ClientHello…', 'Certificate mesajı…', 'Uygulama verisi…'], 1600);
      out.innerHTML =
        '<div class="tx-tls-flow font-jb">' +
        '<div class="tx-tls-step"><span>1</span> ClientHello · SNI: vault.orion-archive.test</div>' +
        '<div class="tx-tls-step"><span>2</span> ServerHello · TLS 1.3</div>' +
        '<div class="tx-tls-step tx-tls-step--warn"><span>3</span> Certificate · SAN / süre uyarısı</div>' +
        '<div class="tx-tls-step"><span>4</span> Application Data · Encrypted</div>' +
        '</div>';
      markToolUsed('tls');
    };
  }

  function renderAll() {
    $('progPill').textContent = 'Aşama ' + (stageIndex + 1) + '/6';
    renderTimeline();
    renderEvidence();
    renderLauncher();
    renderFindings();
    updateCompleteBtn();
    $('actionPrompt').textContent = 'Kanıtları inceleyin, uygun araçları kullanın, sonucu kendiniz yorumlayın.';
  }

  function completeStage() {
    if (!requiredToolsDone()) return;
    var st = currentStage();
    findings.push(st.finding);
    updateRisk(st.finding.riskLevel);
    stageScore += 20;
    recalcScore();
    renderFindings();
    stageIndex++;
    if (stageIndex >= CFG.stages.length) {
      showFinal();
      return;
    }
    renderAll();
  }

  function showFinal() {
    $('workspace').classList.add('hide');
    $('finalScreen').classList.remove('hidden');
    $('finalScore').textContent = stageScore + '/120';
    $('finalMsg').textContent = scoreMsg(stageScore);
    $('finalLead').textContent =
      'Orion gece alarmı incelemesi tamamlandı. Altı kontrolü kendi kararlarınla yürüttün; bulguları raporladın.';
    $('reportBox').value = CFG.finalReport;
    if (!reportSaved && window.SimulationTracker && window.SimulationTracker.saveCompletion) {
      reportSaved = true;
      window.SimulationTracker.saveCompletion(SIM_ID, SIM_NAME, {
        score: stageScore,
        maxScore: 120,
        timeSpentSeconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
        correctCount: findings.length,
        passed: stageScore >= 65,
        moduleName: MODULE_NAME
      });
    }
  }

  function restart() {
    stageIndex = 0;
    toolsUsed = {};
    tiffSelected = false;
    findings = [];
    maxRisk = 1;
    stageScore = 0;
    reportSaved = false;
    startedAt = Date.now();
    $('finalScreen').classList.add('hidden');
    $('workspace').classList.remove('hide');
    $('introOverlay').classList.add('hide');
    $('riskLbl').textContent = 'Düşük';
    $('riskDot').style.background = '#22c55e';
    recalcScore();
    renderAll();
  }

  $('btnStart').onclick = function () {
    $('introOverlay').classList.add('hide');
    $('workspace').classList.remove('hide');
    startedAt = Date.now();
    if (window.SimulationTracker && window.SimulationTracker.recordStart) {
      window.SimulationTracker.recordStart(SIM_ID, SIM_NAME, { moduleName: MODULE_NAME });
    }
    renderAll();
  };

  $('btnToolBack').onclick = renderLauncher;
  $('btnCompleteStage').onclick = completeStage;
  $('btnRestart').onclick = restart;
  $('btnCopy').onclick = function () {
    $('reportBox').select();
    try { navigator.clipboard.writeText($('reportBox').value); } catch (e) { document.execCommand('copy'); }
  };

  $('hintBtn').onclick = function (e) {
    e.stopPropagation();
    var pop = $('hintPopover');
    if (pop.classList.contains('show')) hideHint();
    else showHint();
  };

  document.addEventListener('click', function () { hideHint(); });
  $('hintWrap').addEventListener('click', function (e) { e.stopPropagation(); });

})();