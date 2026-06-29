/* LunaBox Teslimat Krizi — uygulama mantığı */
(function () {
  'use strict';

  function bootError(msg) {
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.classList.remove('hide');
      var modal = overlay.querySelector('.lb-modal');
      if (modal) {
        modal.innerHTML =
          '<p style="color:#fca5a5;font-weight:600;margin:0 0 0.5rem">Simülasyon başlatılamadı</p>' +
          '<p style="font-size:0.85rem;line-height:1.5;color:#a8a29e;margin:0">' + msg + '</p>';
      }
    }
  }

  if (!window.LUNABOX_VAKA || !window.LUNABOX_VAKA.stages) {
    bootError('Vaka verisi yüklenemedi. <code>sim\\baslat.ps1</code> ile sunucuyu başlatın.');
    return;
  }

  var SIM_ID = 'lunabox-teslimat-krizi';
  var SIM_NAME = "LunaBox Teslimat Krizi";
  var MODULE_NAME = 'Temel Kriptografi';
  var CFG = window.LUNABOX_VAKA;
  var MOCK = CFG.mock;

  var stageIndex = 0;
  var toolsUsed = {};
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
    if (s >= 125) return 'Çok iyi. Kriptografik mekanizmaların amacını ve sınırlarını doğru ayırt ettin.';
    if (s >= 100) return 'İyi. Temel kararların güçlü; birkaç risk yorumunu tekrar ederek netleşebilirsin.';
    if (s >= 75) return 'Gelişiyor. Token, HMAC, CSPRNG ve anahtar yönetimi ayrımlarını tekrar etmek faydalı olur.';
    return 'Simülasyonu tekrar çözmen önerilir. Kriptografik yapı taşları henüz birbirine karışıyor.';
  }

  function requiredToolsDone() {
    var st = currentStage();
    var used = getStageTools();
    for (var i = 0; i < st.requiredTools.length; i++) {
      if (!used[st.requiredTools[i]]) return false;
    }
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
    var html = '<div class="lb-stepper-track">';
    var seedDone = stageIndex > 0 ? ' lb-stepper-item--done' : '';
    html +=
      '<div class="lb-stepper-item lb-stepper-item--seed' + seedDone + '">' +
      '<span class="lb-step-num"><i class="fa-solid fa-box" aria-hidden="true"></i></span>' +
      '<span class="lb-step-label">Olay #LB-3091</span></div>';
    CFG.stages.forEach(function (st, i) {
      var cls = 'lb-stepper-item';
      if (i === stageIndex) cls += ' lb-stepper-item--active';
      else if (i < stageIndex) cls += ' lb-stepper-item--done';
      var num = String(i + 1).padStart(2, '0');
      html +=
        '<div class="' + cls + '">' +
        '<span class="lb-step-num">' + num + '</span>' +
        '<span class="lb-step-label">' + esc(st.tl) + '</span></div>';
    });
    html += '</div>';
    root.innerHTML = html;
  }

  function renderEvidence() {
    var st = currentStage();
    $('alarmBanner').innerHTML = '<strong>#LB-3091</strong> — ' + esc(st.alarmHint);
    $('stageStory').textContent = st.story;
    $('evidenceRoot').innerHTML = st.evidenceHtml;
    hideHint();
  }

  function renderFindings() {
    var root = $('findingsRoot');
    if (!findings.length) {
      root.innerHTML = '<p class="lb-finding-empty">İnceleme ilerledikçe bulgular burada birikecek.</p>';
      return;
    }
    root.innerHTML = '';
    findings.forEach(function (fd, i) {
      var card = document.createElement('div');
      card.className = 'lb-finding-card';
      card.innerHTML =
        '<div class="fc-title">Bulgu ' + (i + 1) + ' — ' + esc(fd.title) + '</div>' +
        '<p>' + esc(fd.evidence) + '</p>' +
        '<span class="fc-risk lb-fc-risk--' + fd.riskLevel + '">Risk: ' + esc(fd.risk) + '</span>';
      root.appendChild(card);
    });
  }

  function updateCompleteBtn() {
    var btn = $('btnCompleteStage');
    var ok = requiredToolsDone();
    btn.disabled = !ok;
    btn.title = ok ? 'Bu aşamayı tamamla' : 'Gerekli araçları çalıştırın';
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
    $('toolNavTitle').textContent = 'Kripto Araçları';
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
      jwt: buildPageJwt,
      sha: buildPageSha,
      hmac: buildPageHmac,
      entropy: buildPageEntropy,
      openssl: buildPageOpenssl,
      legacy: buildPageLegacy,
      xor: buildPageXor,
      key: buildPageKey,
      hybrid: buildPageHybrid
    };
    if (builders[id]) builders[id](host);
  }

  function b64urlDecode(seg) {
    var s = seg.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeB64(s);
  }

  function decodeJwtParts(token) {
    var parts = token.trim().split('.');
    if (parts.length < 2) throw new Error('invalid');
    return {
      header: JSON.parse(b64urlDecode(parts[0])),
      payload: JSON.parse(b64urlDecode(parts[1]))
    };
  }

  async function hmacSha256Hex(key, message) {
    var enc = new TextEncoder();
    var cryptoKey = await crypto.subtle.importKey(
      'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    var sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
    return Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function buildPageJwt(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">JWT Decoder</span><span class="tx-page-sub">RFC 7519 · Base64URL</span></div>' +
      '<label class="tx-lbl">Token</label>' +
      '<textarea class="tx-ta font-jb" id="jwtIn" spellcheck="false" placeholder="mobile_access_token.txt dosyasından"></textarea>' +
      '<button type="button" class="tx-action" id="jwtRun"><i class="fa-solid fa-play"></i> Decode</button>' +
      '<div class="tx-out font-jb" id="jwtOut"><span class="tx-out-placeholder">Header ve payload burada</span></div></div>';
    $('jwtRun').onclick = async function () {
      var out = $('jwtOut');
      var raw = $('jwtIn').value.trim();
      if (!raw) { out.innerHTML = '<p class="tx-err">Token boş.</p>'; return; }
      await runProcessing(out, ['Segment ayrıştırılıyor…', 'Base64URL decode…', 'JSON parse…'], 1600);
      try {
        var p = decodeJwtParts(raw);
        out.innerHTML = '<pre class="tx-pre">' + esc(JSON.stringify(p, null, 2)) + '</pre>';
        if (p.payload && p.payload.userId) markToolUsed('jwt');
      } catch (e) {
        out.innerHTML = '<p class="tx-err">Geçersiz JWT formatı.</p>';
      }
    };
  }

  function buildPageSha(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">SHA-256</span><span class="tx-page-sub">Secure Hash Algorithm</span></div>' +
      '<label class="tx-lbl">Girdi metni</label>' +
      '<textarea class="tx-ta font-jb" id="shaIn" spellcheck="false" placeholder="Özetlenecek metin"></textarea>' +
      '<button type="button" class="tx-action" id="shaRun"><i class="fa-solid fa-hashtag"></i> Hash Hesapla</button>' +
      '<div class="tx-out font-jb" id="shaOut"><span class="tx-out-placeholder">256-bit özet</span></div></div>';
    $('shaRun').onclick = async function () {
      var raw = $('shaIn').value.trim();
      var out = $('shaOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">Girdi boş.</p>'; return; }
      await runProcessing(out, ['Bloklar işleniyor…', 'SHA-256…'], 1400);
      var h = await sha256Hex(raw);
      out.innerHTML = '<pre class="tx-pre tx-pre--hash">' + esc(h) + '</pre>';
    };
  }

  function buildPageHmac(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">HMAC Verify</span><span class="tx-page-sub">Webhook kaynak doğrulama</span></div>' +
      '<label class="tx-lbl">Payload (JSON veya metin)</label>' +
      '<textarea class="tx-ta font-jb" id="hmacPayload" spellcheck="false" placeholder="Webhook payload"></textarea>' +
      '<label class="tx-lbl">İmza başlığı / yöntem</label>' +
      '<input class="tx-in font-jb" id="hmacSig" placeholder="ör. sha256=SHA256(payload)" />' +
      '<button type="button" class="tx-action" id="hmacRun"><i class="fa-solid fa-shield-halved"></i> Analiz Et</button>' +
      '<div class="tx-out" id="hmacOut"></div></div>';
    $('hmacRun').onclick = async function () {
      var payload = $('hmacPayload').value.trim();
      var sig = $('hmacSig').value.trim();
      var out = $('hmacOut');
      if (!payload || !sig) { out.innerHTML = '<p class="tx-err">Payload ve imza alanlarını doldurun.</p>'; return; }
      await runProcessing(out, ['Yöntem tespiti…', 'HMAC karşılaştırması…'], 1800);
      var plainSha = /sha256\s*\(\s*payload\s*\)/i.test(sig) || sig.toLowerCase().indexOf('sha256(payload)') >= 0;
      var hmacDemo = await hmacSha256Hex(MOCK.webhookSecret, payload);
      out.innerHTML =
        '<div class="tx-report">' +
        '<p class="tx-err-line"><strong>Mevcut:</strong> ' + esc(sig) + '</p>' +
        (plainSha ? '<p class="tx-err-line">Plain SHA-256 — gizli anahtar yok; kaynak doğrulaması zayıf.</p>' : '') +
        '<p class="tx-ok-line">Öneri: HMAC-SHA256(webhook_secret, payload)</p>' +
        '<p class="tx-meta">Örnek HMAC (eğitim): ' + esc(hmacDemo.slice(0, 24)) + '…</p></div>';
      if (plainSha) markToolUsed('hmac');
    };
  }

  function buildPageEntropy(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Entropy Audit</span><span class="tx-page-sub">CSPRNG vs Math.random</span></div>' +
      '<label class="tx-lbl">Kaynak kod</label>' +
      '<textarea class="tx-ta font-jb" id="entIn" spellcheck="false" placeholder="pickup_code_generator_note.txt"></textarea>' +
      '<button type="button" class="tx-action" id="entRun"><i class="fa-solid fa-dice"></i> Analiz Et</button>' +
      '<div class="tx-out" id="entOut"></div></div>';
    $('entRun').onclick = async function () {
      var raw = $('entIn').value.trim();
      var out = $('entOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">Kod boş.</p>'; return; }
      await runProcessing(out, ['Üretim yöntemi taranıyor…', 'Entropi değerlendirmesi…'], 1700);
      var bad = /Math\.random|Date\.now/i.test(raw);
      out.innerHTML =
        '<div class="tx-report">' +
        (bad ? '<p class="tx-err-line">Math.random / Date.now tespit edildi — güvenlik kodu için uygun değil.</p>' : '<p class="tx-ok-line">Belirgin zayıflık bulunamadı.</p>') +
        '<p class="tx-report-rec">Öneri: crypto.getRandomValues veya CSPRNG API.</p></div>';
      if (bad) markToolUsed('entropy');
    };
  }

  function buildPageOpenssl(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">OpenSSL Inspector</span><span class="tx-page-sub">Algorithm listing</span></div>' +
      '<label class="tx-lbl">Algoritma listesi</label>' +
      '<textarea class="tx-ta font-jb" id="osslIn" spellcheck="false" placeholder="gateway_openssl_algorithms.txt"></textarea>' +
      '<button type="button" class="tx-action" id="osslRun"><i class="fa-solid fa-list"></i> İncele</button>' +
      '<div class="tx-out" id="osslOut"></div></div>';
    $('osslRun').onclick = async function () {
      var raw = $('osslIn').value.trim().toLowerCase();
      var out = $('osslOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">Liste boş.</p>'; return; }
      await runProcessing(out, ['Algoritmalar sınıflandırılıyor…', 'Risk etiketleri…'], 1800);
      var risky = /\bdes\b|rc4|des-ecb/.test(raw);
      out.innerHTML =
        '<div class="tx-report">' +
        '<p class="tx-risk-line tx-risk--ok"><strong>aes-256-gcm, chacha20-poly1305</strong> — modern</p>' +
        '<p class="tx-risk-line tx-risk--bad"><strong>des-cbc, des-ecb, rc4</strong> — yeni sistemlerde kullanılmamalı</p>' +
        '<p class="tx-report-rec">Listedeki varlık ≠ güvenlik önerisi.</p></div>';
      if (risky) markToolUsed('openssl');
    };
  }

  function buildPageLegacy(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Legacy Cipher</span><span class="tx-page-sub">Klasik şifre analizi</span></div>' +
      '<label class="tx-lbl">Legacy not</label>' +
      '<textarea class="tx-ta font-jb" id="legIn" spellcheck="false" placeholder="legacy_offline_mode.txt"></textarea>' +
      '<button type="button" class="tx-action" id="legRun"><i class="fa-solid fa-scroll"></i> İncele</button>' +
      '<div class="tx-out" id="legOut"></div></div>';
    $('legRun').onclick = async function () {
      var raw = $('legIn').value.trim();
      var out = $('legOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">Not boş.</p>'; return; }
      await runProcessing(out, ['Yöntem tespiti…', 'Modern uygunluk…'], 1600);
      var vig = /vigenere|vigenère/i.test(raw);
      out.innerHTML =
        '<div class="tx-report">' +
        (vig ? '<p class="tx-err-line">Vigenère / klasik şifre — modern güvenlik için uygun değil.</p>' : '') +
        '<p class="tx-report-rec">Standart AEAD veya güncel kütüphane kullanın.</p></div>';
      if (vig) markToolUsed('legacy');
    };
  }

  function buildPageXor(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">XOR Reuse</span><span class="tx-page-sub">Key stream tekrarı</span></div>' +
      '<label class="tx-lbl">XOR kanıtı</label>' +
      '<textarea class="tx-ta font-jb" id="xorIn" spellcheck="false" placeholder="xor_key_reuse_demo.txt"></textarea>' +
      '<button type="button" class="tx-action" id="xorRun"><i class="fa-solid fa-code-merge"></i> Analiz Et</button>' +
      '<div class="tx-out" id="xorOut"></div></div>';
    $('xorRun').onclick = async function () {
      var raw = $('xorIn').value.trim();
      var out = $('xorOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">Girdi boş.</p>'; return; }
      await runProcessing(out, ['Anahtar tekrarı kontrolü…'], 1500);
      var reuse = /same\s+k|C1\s*=\s*P1\s*XOR/i.test(raw);
      out.innerHTML =
        '<div class="tx-report">' +
        (reuse ? '<p class="tx-err-line">Aynı XOR anahtarı tekrar kullanılmış (C1⊕C2 = P1⊕P2).</p>' : '') +
        '<p class="tx-report-rec">Her mesaj için benzersiz, güvenli anahtar akışı gerekir.</p></div>';
      if (reuse) markToolUsed('xor');
    };
  }

  function buildPageKey(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">PEM Inspector</span><span class="tx-page-sub">Public / Private key</span></div>' +
      '<label class="tx-lbl">PEM içeriği</label>' +
      '<textarea class="tx-ta font-jb" id="keyIn" spellcheck="false" placeholder="courier_device_*.pem içeriği"></textarea>' +
      '<button type="button" class="tx-action" id="keyRun"><i class="fa-solid fa-file-shield"></i> İncele</button>' +
      '<div class="tx-out" id="keyOut"></div></div>';
    $('keyRun').onclick = async function () {
      var raw = $('keyIn').value.trim();
      var out = $('keyOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">PEM boş.</p>'; return; }
      await runProcessing(out, ['PEM başlığı okunuyor…', 'Hassasiyet sınıfı…'], 1600);
      var isPriv = /BEGIN PRIVATE KEY/i.test(raw);
      var isPub = /BEGIN PUBLIC KEY/i.test(raw);
      out.innerHTML =
        '<div class="tx-report">' +
        (isPub ? '<p class="tx-ok-line">PUBLIC KEY — paylaşılabilir.</p>' : '') +
        (isPriv ? '<p class="tx-err-line">PRIVATE KEY — gizli kalmalı; repo içinde tutulmamalı.</p>' : '') +
        (!isPub && !isPriv ? '<p class="tx-err">Tanınmayan PEM.</p>' : '') +
        '</div>';
      if (isPriv) markToolUsed('key');
    };
  }

  function buildPageHybrid(host) {
    host.innerHTML =
      '<div class="tx-page">' +
      '<div class="tx-page-head"><span class="tx-page-logo">Hybrid Compare</span><span class="tx-page-sub">RSA vs AES+RSA</span></div>' +
      '<label class="tx-lbl">Şifreleme planı</label>' +
      '<textarea class="tx-ta font-jb" id="hybIn" spellcheck="false" placeholder="legal_report_encryption_plan.txt"></textarea>' +
      '<button type="button" class="tx-action" id="hybRun"><i class="fa-solid fa-layer-group"></i> Karşılaştır</button>' +
      '<div class="tx-out" id="hybOut"></div></div>';
    $('hybRun').onclick = async function () {
      var raw = $('hybIn').value.trim();
      var out = $('hybOut');
      if (!raw) { out.innerHTML = '<p class="tx-err">Plan boş.</p>'; return; }
      await runProcessing(out, ['Boyut/performans analizi…', 'Hibrit model…'], 2000);
      var directRsa = /doğrudan|dogrudan|direct/i.test(raw) && /rsa/i.test(raw);
      out.innerHTML =
        '<div class="tx-report">' +
        '<p class="tx-err-line"><strong>Yanlış:</strong> Büyük PDF doğrudan RSA ile şifreleme.</p>' +
        '<p class="tx-ok-line"><strong>Öneri:</strong> 1) AES-GCM ile veri 2) AES anahtarını RSA/OAEP ile koru.</p></div>';
      if (directRsa || (/250\s*mb/i.test(raw) && /rsa/i.test(raw))) markToolUsed('hybrid');
    };
  }

  function renderAll() {
    $('progPill').textContent = 'Aşama ' + (stageIndex + 1) + '/' + CFG.stages.length;
    var meta = $('caseMetaLbl');
    if (meta) {
      var st = currentStage();
      meta.textContent = st.time + ' · ' + st.tl;
    }
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
    $('finalScore').textContent = stageScore + '/140';
    $('finalMsg').textContent = scoreMsg(stageScore);
    $('finalLead').textContent =
      'LunaBox Teslimat Krizi incelemesi tamamlandı. JWT, webhook, teslimat kodu, OpenSSL, legacy mod, anahtar yönetimi ve hibrit şifreleme kontrollerini kendi kararlarınla yürüttün. Saldırı yapmadın; kriptografik varsayımları bir analist gibi inceledin.';
    $('reportBox').value = CFG.finalReport;
    if (!reportSaved && window.SimulationTracker && window.SimulationTracker.saveCompletion) {
      reportSaved = true;
      window.SimulationTracker.saveCompletion(SIM_ID, SIM_NAME, {
        score: stageScore,
        maxScore: 140,
        timeSpentSeconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
        correctCount: findings.length,
        passed: stageScore >= 75,
        moduleName: MODULE_NAME
      });
    }
  }

  function restart() {
    stageIndex = 0;
    toolsUsed = {};
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