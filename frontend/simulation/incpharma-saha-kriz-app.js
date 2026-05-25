(function () {
  'use strict';

  var CFG = window.INCPHARMA_SIM;
  var UI = window.INCPHARMA_UI;
  var VIS = window.INCPHARMA_VISUALS;
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
    };
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
    root.innerHTML =
      '<div class="ip-intro">' +
      '<p class="ip-kicker">INCPHARMA · Kurumsal demo</p>' +
      '<h1>' +
      esc(CFG.title) +
      '</h1>' +
      '<p class="ip-lead">' +
      esc(
        'Sıradan bir saha günü — onkoloji ziyareti, hekim görüşmeleri ve gün sonu raporu. Hastaneye girmeden acil bildirim: ciddi reaksiyon şüphesi. Kurgusal ürün; gerçek tedavi önerisi yoktur.'
      ) +
      '</p>' +
      renderFlakon() +
      '<ul class="ip-intro-list">' +
      '<li>Gün boyu canlı saha akışı · diyalog ve kriz anları</li>' +
      '<li>Telefon bildirimi, WhatsApp, gün sonu raporu</li>' +
      '<li>Performans özeti — test değil, senaryo deneyimi</li>' +
      '</ul>' +
      '<p class="ip-tagline"><i class="fas fa-quote-left"></i> ' +
      esc(CFG.tagline) +
      '</p>' +
      '<button type="button" class="ip-btn ip-btn--primary" id="ipStart">Simülasyonu başlat</button>' +
      '<a href="/isverenler.html" class="ip-btn ip-btn--ghost">İşverenler sayfası</a>' +
      '</div>';
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
    var phoneOpts = UI ? UI.phoneFromScene(scene, state.sceneId) : null;
    var hasPhoneHero = !!(scene.phoneVisual || phoneOpts);
    var html =
      '<article class="ip-scene ip-scene--' +
      esc(state.sceneId) +
      (hasPhoneHero ? ' ip-scene--with-phone' : '') +
      '">';

    if (VIS) {
      html += VIS.renderDayTimeline(state.sceneId);
      html += VIS.renderSceneHero(state.sceneId, scene);
    } else if (UI) {
      html += UI.renderLocationBanner(state.sceneId, scene.location);
      html += '<h2 class="ip-scene-title">' + esc(scene.title) + '</h2>';
    }

    html += '<div class="ip-scene-stage">';

    if (hasPhoneHero && UI) {
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

    if (hasPhoneHero && UI) {
      html += '</div></div>';
    }

    if (scene.type === 'report') {
      html += '<div class="ip-saha-form-wrap">';
      html += '<div class="ip-saha-form__bar"><i class="fas fa-tablet-screen-button"></i> INCPHARMA Saha · Gün sonu raporu</div>';
      html += '<form class="ip-report ip-saha-form" id="ipReportForm">';
      scene.fields.forEach(function (field) {
        html += '<div class="ip-saha-field"><h4>' + esc(field.q) + '</h4><div class="ip-saha-field__opts">';
        field.options.forEach(function (opt) {
          html +=
            '<label class="ip-saha-opt"><input type="radio" name="' +
            esc(field.id) +
            '" value="' +
            esc(opt.id) +
            '" required /><span>' +
            esc(opt.label) +
            '</span></label>';
        });
        html += '</div></div>';
      });
      html +=
        '<button type="submit" class="ip-scene-action__btn ip-scene-action__btn--submit">Raporu gönder</button></form></div>';
      html += '</div></article>';
      root.innerHTML = html;
      $('ipReportForm').addEventListener('submit', onReportSubmit);
      renderProgress();
      return;
    }

    if (!scene.dialogue || !scene.dialogue.length) {
      html += renderPlayerTurn(scene);
    }
    html += '</div></article>';
    root.innerHTML = html;

    root.querySelectorAll('[data-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pickChoice(btn.getAttribute('data-choice'));
      });
    });
    var cont = $('ipContinue');
    if (cont && scene.next) {
      cont.addEventListener('click', function () {
        goNext(scene.next);
      });
    }
    renderProgress();
  }

  function onReportSubmit(e) {
    e.preventDefault();
    var scene = getScene('report');
    var correct = 0;
    var total = scene.fields.length;
    scene.fields.forEach(function (field) {
      var picked = (e.target.elements[field.id] && e.target.elements[field.id].value) || '';
      var ok = field.options.find(function (o) {
        return o.id === picked && o.correct;
      });
      state.reportAnswers[field.id] = picked;
      if (ok) correct++;
    });
    var ratio = correct / total;
    applyEffects({
      reportingDiscipline: ratio >= 1 ? 12 : ratio >= 0.75 ? 6 : -8,
      escalationDiscipline: ratio >= 0.75 ? 4 : -4,
      ethicalIntegrity: ratio >= 0.75 ? 4 : -6,
      decisionQuality: ratio >= 0.75 ? 4 : -4,
    });
    if (ratio < 0.75) {
      state.flags.reportWeak = true;
    }
    goNext(scene.next);
  }

  function pickChoice(choiceId) {
    var scene = getScene(state.sceneId);
    var ch = scene.choices.find(function (c) {
      return c.id === choiceId;
    });
    if (!ch) return;
    state.history.push({ scene: state.sceneId, choice: choiceId });
    applyEffects(ch.effects);
    goNext(ch.next);
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
    var html = '<div class="ip-finale">';
    html += '<header class="ip-finale__head">';
    html += renderFlakon();
    html += '<div><p class="ip-kicker">INCPHARMA performans kartı</p>';
    html += '<h2>' + esc(CFG.title) + '</h2>';
    html +=
      '<p class="ip-finale__score">Genel skor <strong>' +
      overall +
      '</strong>/100 · <span>' +
      esc(performanceLabel(overall)) +
      '</span></p></div></header>';

    if (state.fatalErrors.length) {
      html += '<div class="ip-fatal"><h3><i class="fas fa-triangle-exclamation"></i> Kritik uyum uyarısı</h3><p>';
      html +=
        'Simülasyon sırasında ' +
        state.fatalErrors.length +
        ' fatal compliance error tespit edildi. Genel skor yeterli görünse bile ilgili karar kırmızı risk olarak değerlendirilmelidir.</p><ul>';
      state.fatalErrors.forEach(function (code) {
        html += '<li><code>' + esc(code) + '</code> — ' + esc(CFG.fatalLabels[code] || code) + '</li>';
      });
      html += '</ul></div>';
    } else {
      html +=
        '<p class="ip-fatal-ok"><i class="fas fa-check-circle"></i> Kritik uyum uyarısı: Yok (demo kapsamında).</p>';
    }

    html += '<div class="ip-comp-grid">';
    CFG.competencies.forEach(function (c) {
      var v = state.scores[c.key] || 0;
      html += '<div class="ip-comp"><span>' + esc(c.label) + '</span>';
      html += '<div class="ip-comp__track"><i style="width:' + v + '%"></i></div>';
      html += '<strong>' + v + '</strong></div>';
    });
    html += '</div>';

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

  function boot() {
    state = initState();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
