/**
 * Medikal saha — kurumsal demo deneyimi (sinematik düzen, anlar, güven sunumu)
 */
window.SEBS_SAHA_DEMO = (function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  /** Yalnızca bildirim / mesaj odaklı sahnelerde küçük telefon */
  var COMPANION_PHONE_SCENES = {
    opening: 1,
    crisis: 1,
    whatsapp: 1,
    murat_sms: 1,
  };

  function renderPremiumIntro(cfg) {
    return (
      '<div class="ip-intro-cinema ip-intro-cinema--premium">' +
      '<div class="ip-intro-cinema__mesh" aria-hidden="true"></div>' +
      '<div class="ip-intro-cinema__bg" aria-hidden="true"></div>' +
      '<div class="ip-intro-cinema__content">' +
      '<span class="ip-intro-cinema__badge"><i class="fas fa-building-circle-check"></i> Kurumsal demo</span>' +
      '<div class="ip-intro-cinema__brands">' +
      '<span class="ip-brand-pill ip-brand-pill--sebs">SEBS Global</span>' +
      '<span class="ip-brand-pill ip-brand-pill--inc">Medikal saha</span>' +
      '</div>' +
      '<p class="ip-intro-cinema__kicker">Canlı senaryo · İnteraktif değerlendirme</p>' +
      '<h1>' +
      esc(cfg.title) +
      '</h1>' +
      '<p class="ip-intro-cinema__lead">Atlas Üniversitesi Hastanesi, onkoloji servisi. ' +
      'Sıradan bir ziyaret — bir bildirimle krize dönüşür. Telefonunuz, koridorunuz ve gün sonu raporunuz aynı masada.</p>' +
      '<div class="ip-role-card">' +
      '<div class="ip-role-card__avatar"><i class="fas fa-user-tie"></i></div>' +
      '<div><strong>Rolünüz</strong><p>Saha temsilcisi · ' + esc(cfg.product) + '</p></div>' +
      '</div>' +
      '<ul class="ip-trust-grid">' +
      '<li><i class="fas fa-mobile-screen"></i> Canlı telefon bildirimi</li>' +
      '<li><i class="fas fa-comments"></i> Diyalog simülasyonu</li>' +
      '<li><i class="fas fa-file-medical"></i> Otomatik saha raporu</li>' +
      '<li><i class="fas fa-shield-halved"></i> Uyum & performans kartı</li>' +
      '</ul>' +
      '<p class="ip-intro-cinema__disclaimer"><i class="fas fa-circle-info"></i> Kurgusal ürün ve senaryo · Gerçek tedavi önerisi içermez</p>' +
      '<div class="ip-intro-cinema__actions">' +
      '<button type="button" class="ip-btn-cinema" id="ipStart"><i class="fas fa-play"></i> Sahaya çık</button>' +
      '<a href="/isverenler.html#demo-sim" class="ip-btn-cinema ip-btn-cinema--ghost">İşverenler</a>' +
      '</div>' +
      '<blockquote class="ip-intro-cinema__quote">«' +
      esc(cfg.tagline) +
      '»</blockquote>' +
      '</div></div>'
    );
  }

  function renderAtmosphere(sceneId) {
    var crisis = sceneId === 'crisis' || sceneId === 'opening';
    var html = '<div class="ip-atmosphere" aria-hidden="true">';
    if (crisis) {
      html += '<span class="ip-atmosphere__pulse"></span><span class="ip-atmosphere__pulse ip-atmosphere__pulse--2"></span>';
    }
    html += '<span class="ip-atmosphere__grain"></span></div>';
    return html;
  }

  function renderCompanionPhone(sceneId, scene) {
    if (!window.SEBS_SAHA_UI) return '';
    if (sceneId === 'lot' || sceneId === 'particle' || sceneId === 'particle_mini') return '';
    var UI = window.SEBS_SAHA_UI;
    var opts = scene.phoneVisual || UI.phoneFromScene(scene, sceneId);
    if (!opts && !COMPANION_PHONE_SCENES[sceneId]) return '';
    if (!opts && COMPANION_PHONE_SCENES[sceneId]) {
      opts = {
        mode: 'field-app',
        time: scene.time || '09:15',
        app: 'Saha uygulaması',
        title: 'Saha uygulaması',
        body: 'Gün içi bildirimler aktif',
        ring: sceneId === 'opening' || sceneId === 'crisis',
        compact: true,
      };
    } else if (opts) {
      opts = Object.assign({ compact: true }, opts);
    }
    return (
      '<div class="ip-companion-phone" aria-hidden="true">' +
      '<p class="ip-companion-phone__label"><i class="fas fa-mobile-screen-button"></i> Cebinizde</p>' +
      UI.renderPhone(opts) +
      '</div>'
    );
  }

  function wrapCinema(sceneId, visualHtml, playHtml, extraClass) {
    return (
      '<div class="ip-cinema ip-cinema--premium ip-cinema--' +
      esc(sceneId) +
      ' ip-cinema--enter' +
      (extraClass ? ' ' + extraClass : '') +
      '">' +
      '<aside class="ip-cinema__visual">' +
      renderAtmosphere(sceneId) +
      visualHtml +
      '</aside>' +
      '<section class="ip-cinema__play">' +
      '<div class="ip-reaction-rail" id="ipReactionRail" aria-live="polite" hidden></div>' +
      playHtml +
      '</section></div>'
    );
  }

  function compLabel(cfg, key) {
    if (!cfg || !cfg.competencies) return key;
    for (var i = 0; i < cfg.competencies.length; i++) {
      if (cfg.competencies[i].key === key) return cfg.competencies[i].label;
    }
    return key;
  }

  function choiceReactionChips(cfg, choice) {
    var chips = [];
    var e = (choice && choice.effects) || {};
    if (e.fatal && cfg && cfg.fatalLabels) {
      chips.push({
        tone: 'danger',
        icon: 'fa-triangle-exclamation',
        text: cfg.fatalLabels[e.fatal] || 'Kritik uyum uyarısı',
      });
    }
    var pos = [];
    var neg = [];
    Object.keys(e).forEach(function (key) {
      if (key === 'flags' || key === 'fatal') return;
      var v = e[key];
      if (typeof v !== 'number') return;
      var label = compLabel(cfg, key);
      if (v >= 8) pos.push(label);
      else if (v >= 4) pos.push(label);
      else if (v <= -8) neg.push(label);
      else if (v <= -4) neg.push(label);
    });
    pos.slice(0, 2).forEach(function (label) {
      chips.push({ tone: 'ok', icon: 'fa-arrow-trend-up', text: label + ' güçlendi' });
    });
    neg.slice(0, 2).forEach(function (label) {
      chips.push({ tone: 'warn', icon: 'fa-arrow-trend-down', text: label + ' zayıfladı' });
    });
    if (!chips.length) {
      chips.push({ tone: 'info', icon: 'fa-check', text: 'Yanıt kayda geçti' });
    }
    return chips;
  }

  function renderReactionChip(chip) {
    return (
      '<span class="ip-reaction-chip ip-reaction-chip--' +
      esc(chip.tone) +
      '"><i class="fas ' +
      esc(chip.icon) +
      '"></i> ' +
      esc(chip.text) +
      '</span>'
    );
  }

  function recordChoiceReaction(state, choice, cfg) {
    if (!state) return;
    if (!state.reactionLog) state.reactionLog = [];
    var chips = choiceReactionChips(cfg, choice);
    var beat = momentBeat(_sceneId, choice);
    var primary = chips[0];
    state.reactionLog.push({
      tone: primary.tone,
      icon: primary.icon,
      text: chips
        .map(function (c) {
          return c.text;
        })
        .join(' · '),
      beat: beat,
      at: Date.now(),
    });
    paintReactionRail(state);
  }

  function paintReactionRail(state) {
    var rail = document.getElementById('ipReactionRail');
    if (!rail || !state || !state.reactionLog || !state.reactionLog.length) {
      if (rail) {
        rail.hidden = true;
        rail.innerHTML = '';
      }
      return;
    }
    rail.hidden = false;
    var recent = state.reactionLog.slice(-8);
    rail.innerHTML =
      '<div class="ip-reaction-rail__head"><i class="fas fa-route"></i> Günün izleri</div>' +
      '<div class="ip-reaction-rail__track">' +
      recent
        .map(function (item) {
          return renderReactionChip(item);
        })
        .join('') +
      '</div>';
  }

  function momentBeat(sceneId, choice) {
    var beats = {
      opening: 'Gün başladı — saha raporu açıldı.',
      crisis_own: 'Ekip nefes aldı; süreç ve kayıt ön planda.',
      crisis_clinical: 'Koridor gerildi — rol sınırı tartışıldı.',
      crisis_defensive: 'Savunmacı ton algılandı.',
      lot_record: 'Lot ve ayrıştırma prosedürü netleşti.',
      lot_stop: 'Aynı lot için firma önerisi iletildi.',
      lot_analyze: 'Analitik tempo — servis beklentisi yönetildi.',
      lot_recover_levent: 'Rol sınırı yeniden çizildi.',
      particle_clear: 'Şüpheli flakon ayrıştırma netliği sağlandı.',
      particle_delegate: 'Sorumluluk hekime bırakıldı.',
      particle_soften: 'Flakon konusu belirsiz kaldı — risk.',
      doc_process: 'Resmi süreç dili güçlü.',
      doc_recover: 'Savunmacı algı düzeltildi.',
      doc_own_particle: 'Önceki ifade düzeltildi.',
      doc_blame: 'Sorumluluk dışarı atıldı — ilişki zedelendi.',
      wa_official: 'Mesaj resmi kanala taşındı.',
      wa_send: 'Kişisel kanal riski oluştu.',
      wa_verbal: 'Sözlü kanal riski işaretlendi.',
      comp_claim: 'Rakip ürün yorumu kayda geçti.',
      comp_neutral: 'Nötr bilimsel duruş korundu.',
      off_cold: 'Off-label sınırı soğuk ama net.',
      off_channel: 'Kaynak paylaşım vaadi — kritik risk.',
      off_grey: 'Gri alan riski — kayıt zayıf.',
      svc_clear: 'Destek sınırı netleşti.',
      svc_ambiguous: 'Belirsiz vaat algısı oluştu.',
      svc_flexible: 'Esnek destek — uyum riski.',
      mgr_strong: 'Gün sonu değerlendirmesi güçlü kapandı.',
      mgr_recover: 'Toparlanma dili kayda geçti.',
      nermin_process: 'Servis bilgilendirmesi yapılandı.',
      brief_transparent: 'Şeffaf brifing — güven arttı.',
    };
    return beats[(choice && choice.id) || ''] || 'Karar kayda geçti — gün akışı sürüyor.';
  }

  function reactionsHtml(cfg, choice) {
    var chips = choiceReactionChips(cfg, choice);
    if (!chips.length) return '';
    return (
      '<div class="ip-moment__reactions">' +
      chips.map(renderReactionChip).join('') +
      '</div>'
    );
  }

  function dismissMoment(overlay, done) {
    if (!overlay || overlay.dataset.ipMomentOpen !== '1') return;
    overlay.dataset.ipMomentOpen = '0';
    if (overlay._ipMomentTimer) {
      window.clearTimeout(overlay._ipMomentTimer);
      overlay._ipMomentTimer = null;
    }
    overlay.classList.remove('ip-moment--show');
    overlay.hidden = true;
    overlay.onclick = null;
    if (overlay._ipMomentEsc) {
      document.removeEventListener('keydown', overlay._ipMomentEsc);
      overlay._ipMomentEsc = null;
    }
    var cb = overlay._ipMomentDone;
    overlay._ipMomentDone = null;
    if (typeof cb === 'function') cb();
    if (typeof done === 'function' && done !== cb) done();
  }

  function showMoment(entry, scene, choice, stateOrDone, done) {
    var state = null;
    var cb = done;
    if (typeof stateOrDone === 'function') {
      cb = stateOrDone;
    } else {
      state = stateOrDone;
      cb = done;
    }
    var cfg = typeof window !== 'undefined' ? window.SEBS_SAHA_SIM : null;

    var overlay = document.getElementById('ipMoment');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ipMoment';
      overlay.className = 'ip-moment';
      overlay.hidden = true;
      document.body.appendChild(overlay);
    } else if (overlay.dataset.ipMomentOpen === '1') {
      dismissMoment(overlay);
    }

    var sceneId = (scene && scene.id) || _sceneId;
    var title = entry ? entry.title : (scene && scene.title) || 'Kayıt';
    var line =
      entry && entry.lines && entry.lines.length
        ? entry.lines[0]
        : momentBeat(sceneId, choice);

    overlay.innerHTML =
      '<div class="ip-moment__backdrop"></div>' +
      '<div class="ip-moment__card">' +
      '<span class="ip-moment__badge"><i class="fas fa-pen"></i> Saha raporuna işlendi</span>' +
      '<h3>' +
      esc(title) +
      '</h3>' +
      '<p class="ip-moment__story">' +
      esc(line) +
      '</p>' +
      reactionsHtml(cfg, choice) +
      '<div class="ip-moment__bar"><i></i></div>' +
      '<span class="ip-moment__skip">Tıklayın veya bekleyin…</span></div>';

    overlay.hidden = false;
    overlay.dataset.ipMomentOpen = '1';
    overlay._ipMomentDone = cb;
    overlay.classList.add('ip-moment--show');

    var bar = overlay.querySelector('.ip-moment__bar i');
    if (bar) {
      requestAnimationFrame(function () {
        bar.style.width = '100%';
      });
    }

    overlay._ipMomentTimer = window.setTimeout(function () {
      overlay._ipMomentTimer = null;
      dismissMoment(overlay);
    }, 1800);

    overlay.onclick = function () {
      dismissMoment(overlay);
    };

    overlay._ipMomentEsc = function (e) {
      if (e.key === 'Escape') dismissMoment(overlay);
    };
    document.addEventListener('keydown', overlay._ipMomentEsc);
  }

  function resetMomentOverlay() {
    var overlay = document.getElementById('ipMoment');
    if (!overlay) return;
    if (overlay.dataset.ipMomentOpen === '1') {
      dismissMoment(overlay);
      return;
    }
    overlay.classList.remove('ip-moment--show');
    overlay.hidden = true;
    overlay.onclick = null;
    if (overlay._ipMomentEsc) {
      document.removeEventListener('keydown', overlay._ipMomentEsc);
      overlay._ipMomentEsc = null;
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') resetMomentOverlay();
    });
    window.addEventListener('pageshow', function () {
      resetMomentOverlay();
    });
  }

  var _sceneId = '';
  function stateSceneId() {
    return _sceneId;
  }
  function setSceneId(id) {
    _sceneId = id;
  }

  function renderFinaleTimeline(state) {
    if (!state || !state.reactionLog || !state.reactionLog.length) return '';
    var items = state.reactionLog.slice(-6);
    var html =
      '<section class="ip-finale-timeline" aria-label="Gün boyunca öne çıkan kararlar">' +
      '<h3><i class="fas fa-clock-rotate-left"></i> Günün karar izleri</h3>' +
      '<ul class="ip-finale-timeline__list">';
    items.forEach(function (item) {
      html +=
        '<li class="ip-finale-timeline__item ip-finale-timeline__item--' +
        esc(item.tone) +
        '">' +
        '<span class="ip-finale-timeline__chip"><i class="fas ' +
        esc(item.icon) +
        '"></i> ' +
        esc(item.text) +
        '</span>' +
        (item.beat ? '<p>' + esc(item.beat) + '</p>' : '') +
        '</li>';
    });
    html += '</ul></section>';
    return html;
  }

  function renderFinalePremium(cfg, state, flakonHtml, compsHtml, fatalHtml, score, label, timelineHtml) {
    return (
      '<div class="ip-finale-premium">' +
      '<header class="ip-finale-premium__head">' +
      '<div class="ip-finale-premium__brand">Saha performansı</div>' +
      flakonHtml +
      '<div class="ip-finale-premium__score-ring" style="--score:' +
      score +
      '"><span class="ip-finale-premium__score-val">' +
      score +
      '</span><span class="ip-finale-premium__score-max">/100</span></div>' +
      '<div class="ip-finale-premium__titles">' +
      '<p class="ip-kicker">Performans kartı</p>' +
      '<h2>' +
      esc(label) +
      '</h2>' +
      '<p class="ip-finale-premium__sub">' +
      esc(cfg.title) +
      '</p></div></header>' +
      fatalHtml +
      (timelineHtml || '') +
      '<div class="ip-finale-premium__comps">' +
      compsHtml +
      '</div>' +
      '<p class="ip-finale-premium__note">Bu demo, saha kararlarınızı canlı rapor ve yetkinlik profili olarak sunar. Kurumsal pilot için özelleştirilebilir.</p>' +
      '</div>'
    );
  }

  return {
    renderPremiumIntro: renderPremiumIntro,
    renderAtmosphere: renderAtmosphere,
    renderCompanionPhone: renderCompanionPhone,
    wrapCinema: wrapCinema,
    showMoment: showMoment,
    recordChoiceReaction: recordChoiceReaction,
    paintReactionRail: paintReactionRail,
    renderFinaleTimeline: renderFinaleTimeline,
    resetMomentOverlay: resetMomentOverlay,
    setSceneId: setSceneId,
    renderFinalePremium: renderFinalePremium,
    isCinemaScene: function (sceneId, scene) {
      if (sceneId === 'intro' || sceneId === 'finale') return false;
      if (scene && scene.type === 'report') return false;
      return true;
    },
  };
})();
