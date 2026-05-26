(function () {
  'use strict';

  var CFG = window.INCPHARMA_SIM;
  var UI = window.INCPHARMA_UI;
  var VIS = window.INCPHARMA_VISUALS;
  var DEMO = window.INCPHARMA_DEMO;

  function reportApi() {
    return window.INCPHARMA_REPORT;
  }

  if (!CFG) return;

  var state = null;
  var $ = function (id) {
    return document.getElementById(id);
  };

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function initState() {
    var scores = {};
    CFG.competencies.forEach(function (c) {
      scores[c.key] = 72;
    });
    return {
      sceneId: 'intro',
      scores: scores,
      flags: {},
      fatalErrors: [],
      history: [],
      reportAnswers: {},
      fieldReport: reportApi() ? reportApi().createEmpty() : { reportNo: 'SR-LOCAL', entries: [] },
      lastReportEntryId: null,
      openingLogged: false,
    };
  }

  function renderLiveReportDock() {
    var REPORT = reportApi();
    if (!REPORT || state.sceneId === 'intro' || state.sceneId === 'finale') {
      var gone = document.getElementById('ipLiveReportWrap');
      if (gone) gone.remove();
      return;
    }
    if (!state.fieldReport.entries.length) return;

    var wrap = document.getElementById('ipLiveReportWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'ipLiveReportWrap';
      document.body.appendChild(wrap);
    }
    wrap.innerHTML = REPORT.renderDock(state.fieldReport, state.lastReportEntryId);
    state.lastReportEntryId = null;
    REPORT.bindDock();
  }

  function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function applyEffects(effects) {
    if (!effects) return;
    Object.keys(effects).forEach(function (key) {
      if (key === 'flags') {
        Object.keys(effects.flags).forEach(function (fk) {
          state.flags[fk] = effects.flags[fk];
        });
        return;
      }
      if (key === 'fatal') {
        if (state.fatalErrors.indexOf(effects.fatal) === -1) {
          state.fatalErrors.push(effects.fatal);
        }
        return;
      }
      if (state.scores[key] != null) {
        state.scores[key] = clamp(state.scores[key] + effects[key]);
      }
    });
  }

  function getScene(id) {
    if (id === 'doctor' || id === 'lot' || id === 'whatsapp' || id === 'manager') {
      return CFG.resolveScene(id, state);
    }
    var base = CFG.scenes[id];
    if (base && base.dynamic === 'lot') {
      return CFG.resolveScene('lot', state);
    }
    return base;
  }

  function sceneProgress() {
    var order = [
      'intro',
      'opening',
      'crisis',
      'lot',
      'particle',
      'particle_mini',
      'doctor',
      'nermin',
      'competitor',
      'offlabel',
      'whatsapp',
      'service',
      'brief',
      'murat_sms',
      'report',
      'evening_return',
      'manager',
      'finale',
    ];
    var idx = order.indexOf(state.sceneId);
    if (idx < 0) return 0;
    return Math.round((idx / (order.length - 1)) * 100);
  }

  function renderProgress() {
    var el = $('ipProgress');
    if (el) el.style.width = sceneProgress() + '%';
    var lbl = $('ipProgressLbl');
    if (lbl) lbl.textContent = sceneProgress() + '%';
  }

  function renderFlakon() {
    return (
      '<div class="ip-flakon" aria-hidden="true">' +
      '<div class="ip-flakon__cap"></div>' +
      '<div class="ip-flakon__body">' +
      '<span class="ip-flakon__logo">INCPHARMA</span>' +
      '<strong>OncoRelief IV</strong>' +
      '<span>Relivansetron</span>' +
      '<span class="ip-flakon__sub">Steril IV Flakon</span>' +
      '<span class="ip-flakon__lot">Lot: ' +
      esc(CFG.lot) +
      '</span>' +
      '<span class="ip-flakon__skt">SKT: 08/2027</span>' +
      '<em>Hastane kullanımı içindir</em>' +
      '</div>' +
      '<div class="ip-flakon__stripe"></div></div>'
    );
  }

  function renderIntro() {
    var root = $('ipRoot');
    root.innerHTML = DEMO
      ? DEMO.renderPremiumIntro(CFG)
      : '<div class="ip-intro"><h1>' +
        esc(CFG.title) +
        '</h1><button type="button" class="ip-btn ip-btn--primary" id="ipStart">Başlat</button></div>';
    $('ipStart').addEventListener('click', function () {
      state.sceneId = 'opening';
      render();
    });
  }

  function renderContinue(scene) {
    var label = scene.continueLabel || 'Devam et';
    return VIS
      ? VIS.renderSceneAction(label, 'ipContinue')
      : '<div class="ip-continue-wrap"><button type="button" class="ip-btn ip-btn--primary" id="ipContinue">' +
          esc(label) +
          '</button></div>';
  }

  function renderPlayerTurn(scene) {
    if (scene.choices && scene.choices.length) {
      return VIS ? VIS.renderReplies(scene, state) : renderRepliesFallback(scene);
    }
    return scene.next ? renderContinue(scene) : '';
  }

  function renderRepliesFallback(scene) {
    var html = '<div class="ip-replies"><div class="ip-replies__list">';
    scene.choices.forEach(function (ch) {
      if (typeof ch.showIf === 'function' && !ch.showIf(state)) return;
      var spoken = ch.say || ch.detail || ch.label;
      html +=
        '<button type="button" class="ip-reply" data-choice="' +
        esc(ch.id) +
        '"><span class="ip-reply__bubble"><q>' +
        esc(spoken) +
        '</q></span></button>';
    });
    html += '</div></div>';
    return html;
  }

  function renderScene() {
    var scene = getScene(state.sceneId);
    if (!scene) return;

    if (scene.type === 'finale') {
      renderFinale();
      return;
    }

    var root = $('ipRoot');
    if (DEMO) DEMO.setSceneId(state.sceneId);

    var phoneOpts = UI ? UI.phoneFromScene(scene, state.sceneId) : null;
    var hasPhoneHero = !!(scene.phoneVisual || phoneOpts);
    var useCinema = DEMO && DEMO.isCinemaScene(state.sceneId, scene);

    var visualHtml = '';
    if (useCinema && hasPhoneHero && UI) {
      visualHtml =
        '<div class="ip-visual-phone-focus">' + UI.renderPhone(scene.phoneVisual || phoneOpts) + '</div>';
    } else if (VIS) {
      visualHtml += VIS.renderSceneHero(state.sceneId, scene);
      if (DEMO && !hasPhoneHero) visualHtml += DEMO.renderCompanionPhone(state.sceneId, scene);
    }

    var html =
      '<article class="ip-scene ip-scene--' +
      esc(state.sceneId) +
      (hasPhoneHero ? ' ip-scene--with-phone' : '') +
      '">';

    if (VIS) html += VIS.renderDayTimeline(state.sceneId);

    if (!useCinema && VIS) html += visualHtml;
    else if (!useCinema && UI) {
      html += UI.renderLocationBanner(state.sceneId, scene.location);
      html += '<h2 class="ip-scene-title">' + esc(scene.title) + '</h2>';
    }

    html += '<div class="ip-scene-stage">';

    if (hasPhoneHero && UI && !useCinema) {
      html += '<div class="ip-scene-grid">';
      html +=
        '<div class="ip-scene-grid__phone">' +
        UI.renderPhone(scene.phoneVisual || phoneOpts) +
        '</div>';
      html += '<div class="ip-scene-grid__body">';
    }

    if (scene.transition) {
      html +=
        '<p class="ip-transition"><i class="fas fa-shield-halved"></i> ' + esc(scene.transition) + '</p>';
    }

    if (scene.thought) {
      html += '<p class="ip-thought"><i class="fas fa-brain"></i> ' + esc(scene.thought) + '</p>';
    }

    if (scene.agenda && scene.agenda.length) {
      html += '<div class="ip-agenda"><h4><i class="fas fa-list-check"></i> Günün programı</h4><ul>';
      scene.agenda.forEach(function (item) {
        html += '<li><span>' + esc(item.time) + '</span> ' + esc(item.label) + '</li>';
      });
      html += '</ul></div>';
    }

    if (scene.narrative) {
      html += VIS
        ? VIS.renderNarrativeCard(scene.narrative, state.sceneId)
        : '<p class="ip-narrative">' + esc(scene.narrative) + '</p>';
    }

    if (scene.productNote) {
      html +=
        '<div class="ip-product-note"><h4><i class="fas fa-vial"></i> Ürün bilgi notu</h4><p>' +
        esc(scene.productNote) +
        '</p></div>';
    }

    if (scene.dialogue && scene.dialogue.length) {
      html += '<div class="ip-conversation">';
      if (UI) html += UI.renderDialogueList(scene.dialogue);
      else {
        scene.dialogue.forEach(function (d) {
          html +=
            '<div class="ip-dialogue"><span class="ip-dialogue__who">' +
            esc(d.who) +
            '</span><p>' +
            esc(d.text) +
            '</p></div>';
        });
      }
      if (!scene.type || scene.type !== 'report') {
        html += renderPlayerTurn(scene);
      }
      html += '</div>';
    }

    if (hasPhoneHero && UI && !useCinema) {
      html += '</div></div>';
    }

    if (scene.type === 'report') {
      var R = reportApi();
      if (!R) {
        html +=
          '<div class="ip-fr-error"><p><i class="fas fa-circle-exclamation"></i> Rapor modülü yüklenemedi.</p>' +
          '<button type="button" class="ip-btn ip-btn--primary" id="ipReloadReport">Yeniden yükle</button></div>';
      } else {
        if (!state.fieldReport.entries.length && state.history.length) {
          rebuildReportFromHistory(R);
        }
        html += R.renderFinalScene(state.fieldReport, state);
      }
      html += '</div></article>';
      root.innerHTML = html;
      var reloadBtn = $('ipReloadReport');
      if (reloadBtn) {
        reloadBtn.addEventListener('click', function () {
          loadReportScript(function () {
            render();
          });
        });
      }
      var confirmBtn = $('ipReportConfirm');
      if (confirmBtn) confirmBtn.addEventListener('click', onReportConfirm);
      var printBtn = $('ipPrintReport');
      if (printBtn) {
        printBtn.addEventListener('click', function () {
          window.print();
        });
      }
      renderProgress();
      renderLiveReportDock();
      return;
    }

    if (!scene.dialogue || !scene.dialogue.length) {
      html += renderPlayerTurn(scene);
    }
    html += '</div></article>';

    var bodyHtml = html;
    if (useCinema && DEMO) {
      var extra = hasPhoneHero ? ' ip-cinema--phone-focus' : '';
      bodyHtml = DEMO.wrapCinema(state.sceneId, visualHtml, html, extra);
    }
    root.innerHTML = bodyHtml;

    root.querySelectorAll('[data-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pickChoice(btn.getAttribute('data-choice'));
      });
    });
    var cont = $('ipContinue');
    if (cont && scene.next) {
      cont.addEventListener('click', function () {
        var R = reportApi();
        if (state.sceneId === 'opening' && R && !state.openingLogged) {
          var openEntry = R.appendOpening(state.fieldReport);
          state.openingLogged = true;
          state.lastReportEntryId = openEntry.id;
          if (DEMO) {
            DEMO.showMoment(openEntry, scene, { id: 'opening' }, function () {
              goNext(scene.next);
            });
            return;
          }
        }
        goNext(scene.next);
      });
    }
    renderProgress();
    renderLiveReportDock();
  }

  function onReportConfirm() {
    var scene = getScene('report');
    var ratio = reportApi() ? reportApi().assessReportingScore(state) : 0.75;
    applyEffects({
      reportingDiscipline: ratio >= 1 ? 12 : ratio >= 0.75 ? 6 : ratio >= 0.5 ? 0 : -8,
      escalationDiscipline: ratio >= 0.75 ? 4 : -4,
      ethicalIntegrity: ratio >= 0.75 ? 4 : -6,
      decisionQuality: ratio >= 0.75 ? 4 : -4,
    });
    if (ratio < 0.75) state.flags.reportWeak = true;
    state.flags.reportSubmitted = true;
    goNext(scene.next);
  }

  function pickChoice(choiceId) {
    var scene = getScene(state.sceneId);
    var ch = scene.choices.find(function (c) {
      return c.id === choiceId;
    });
    if (!ch) return;
    state.history.push({ scene: state.sceneId, choice: choiceId });
    var R = reportApi();
    var entry = R ? R.appendFromChoice(state, state.sceneId, scene, ch) : null;
    applyEffects(ch.effects);

    var advance = function () {
      goNext(ch.next);
    };
    if (DEMO && entry) {
      DEMO.showMoment(entry, scene, ch, advance);
    } else {
      advance();
    }
  }

  function goNext(nextId) {
    if (nextId === 'doctor' || nextId === 'whatsapp' || nextId === 'manager') {
      state.sceneId = nextId;
      render();
      return;
    }
    state.sceneId = nextId;
    render();
  }

  function overallScore() {
    var keys = CFG.competencies.map(function (c) {
      return c.key;
    });
    var sum = 0;
    keys.forEach(function (k) {
      sum += state.scores[k] || 0;
    });
    var avg = sum / keys.length;
    if (state.fatalErrors.length) {
      avg = Math.min(avg, 74);
    }
    return clamp(avg);
  }

  function performanceLabel(score) {
    if (state.fatalErrors.length) return 'Kritik uyum riski';
    if (score >= 85) return 'Güçlü saha performansı';
    if (score >= 70) return 'Gelişime açık performans';
    if (score >= 55) return 'Etik güçlü / ilişki zayıf veya tersi';
    return 'Kriz yönetimi riskli';
  }

  function renderFinale() {
    var overall = overallScore();
    var root = $('ipRoot');
    var label = performanceLabel(overall);
    var fatalHtml = '';
    if (state.fatalErrors.length) {
      fatalHtml =
        '<div class="ip-fatal"><h3><i class="fas fa-triangle-exclamation"></i> Kritik uyum uyarısı</h3><p>' +
        state.fatalErrors.length +
        ' kritik uyum uyarısı kayıt altında.</p><ul>';
      state.fatalErrors.forEach(function (code) {
        fatalHtml += '<li><code>' + esc(code) + '</code> — ' + esc(CFG.fatalLabels[code] || code) + '</li>';
      });
      fatalHtml += '</ul></div>';
    } else {
      fatalHtml =
        '<p class="ip-fatal-ok"><i class="fas fa-check-circle"></i> Kritik uyum uyarısı yok (demo).</p>';
    }
    var compsHtml = '<div class="ip-comp-grid">';
    CFG.competencies.forEach(function (c) {
      var v = state.scores[c.key] || 0;
      compsHtml += '<div class="ip-comp"><span>' + esc(c.label) + '</span>';
      compsHtml += '<div class="ip-comp__track"><i style="width:' + v + '%"></i></div>';
      compsHtml += '<strong>' + v + '</strong></div>';
    });
    compsHtml += '</div>';

    var html = '<div class="ip-finale-wrap">';
    html += DEMO
      ? DEMO.renderFinalePremium(CFG, state, renderFlakon(), compsHtml, fatalHtml, overall, label)
      : '<div class="ip-finale"><p>Skor: ' + overall + '</p></div>';
    html += '<div class="ip-finale-actions">';
    html +=
      '<button type="button" class="ip-btn ip-btn--primary" id="ipRestart">Simülasyonu tekrarla</button>';
    html += '<button type="button" class="ip-btn ip-btn--ghost" id="ipPrint">Özeti yazdır</button>';
    html +=
      '<a href="/contact.html" class="ip-btn ip-btn--ghost">Kurumsal pilot talep et</a>';
    html += '<a href="/isverenler.html#demo-sim" class="ip-btn ip-btn--ghost">İşverenler</a>';
    html += '</div></div>';

    root.innerHTML = html;
    renderProgress();

    $('ipRestart').addEventListener('click', function () {
      state = initState();
      render();
    });
    $('ipPrint').addEventListener('click', function () {
      window.print();
    });

    if (typeof window.trackSimulationComplete === 'function') {
      try {
        window.trackSimulationComplete({
          simulationId: CFG.id,
          title: CFG.title,
          score: overall,
          moduleId: 'employer-demo',
        });
      } catch (err) {
        /* ignore */
      }
    }
  }

  function render() {
    renderProgress();
    if (state.sceneId === 'intro') {
      renderIntro();
      return;
    }
    var scene = getScene(state.sceneId);
    if (!scene && CFG.resolveScene) {
      scene = CFG.resolveScene(state.sceneId, state);
    }
    if (!scene) {
      $('ipRoot').innerHTML =
        '<p class="ip-error">Sahne bulunamadı: <code>' + esc(state.sceneId) + '</code></p>';
      return;
    }
    if (scene.type === 'finale') {
      renderFinale();
      return;
    }
    renderScene();
  }

  function rebuildReportFromHistory(R) {
    if (!R || !state.history.length) return;
    state.fieldReport = R.createEmpty();
    state.openingLogged = true;
    R.appendOpening(state.fieldReport);
    state.history.forEach(function (h) {
      var sc = getScene(h.scene);
      if (!sc || !sc.choices) return;
      var ch = sc.choices.find(function (c) {
        return c.id === h.choice;
      });
      if (ch) R.appendFromChoice(state, h.scene, sc, ch);
    });
  }

  function loadReportScript(cb) {
    if (window.INCPHARMA_REPORT) {
      cb();
      return;
    }
    var existing = document.querySelector('script[data-ip-report]');
    if (existing) {
      existing.addEventListener('load', cb);
      return;
    }
    var s = document.createElement('script');
    s.src = '/simulation/incpharma-saha-kriz-report.js?v=9';
    s.dataset.ipReport = '1';
    s.onload = cb;
    s.onerror = function () {
      cb();
    };
    document.body.appendChild(s);
  }

  function boot() {
    if (DEMO && DEMO.resetMomentOverlay) DEMO.resetMomentOverlay();
    loadReportScript(function () {
      state = initState();
      render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
