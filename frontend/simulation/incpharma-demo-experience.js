/**
 * INCPHARMA — kurumsal demo deneyimi (sinematik düzen, anlar, güven sunumu)
 */
window.INCPHARMA_DEMO = (function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  var HOSPITAL_SCENES = {
    opening: 1,
    crisis: 1,
    lot: 1,
    particle: 1,
    particle_mini: 1,
    doctor: 1,
    nermin: 1,
    competitor: 1,
    offlabel: 1,
    service: 1,
    brief: 1,
    whatsapp: 1,
    murat_sms: 1,
  };

  function renderPremiumIntro(cfg) {
    return (
      '<div class="ip-intro-cinema">' +
      '<div class="ip-intro-cinema__bg" aria-hidden="true"></div>' +
      '<div class="ip-intro-cinema__content">' +
      '<div class="ip-intro-cinema__brands">' +
      '<span class="ip-brand-pill ip-brand-pill--sebs">SEBS Global</span>' +
      '<span class="ip-brand-pill ip-brand-pill--inc">INCPHARMA</span>' +
      '</div>' +
      '<p class="ip-intro-cinema__kicker">Kurumsal saha simülasyonu · Demo</p>' +
      '<h1>' +
      esc(cfg.title) +
      '</h1>' +
      '<p class="ip-intro-cinema__lead">Atlas Üniversitesi Hastanesi, onkoloji servisi. ' +
      'Sıradan bir ziyaret — bir bildirimle krize dönüşür. Telefonunuz, koridorunuz ve gün sonu raporunuz aynı masada.</p>' +
      '<div class="ip-role-card">' +
      '<div class="ip-role-card__avatar"><i class="fas fa-user-tie"></i></div>' +
      '<div><strong>Rolünüz</strong><p>INCPHARMA saha temsilcisi · OncoRelief IV</p></div>' +
      '</div>' +
      '<ul class="ip-trust-row">' +
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
    if (!window.INCPHARMA_UI) return '';
    var UI = window.INCPHARMA_UI;
    var opts = scene.phoneVisual || UI.phoneFromScene(scene, sceneId);
    if (!opts && !HOSPITAL_SCENES[sceneId]) return '';
    if (!opts && HOSPITAL_SCENES[sceneId]) {
      opts = {
        mode: 'field-app',
        time: scene.time || '09:15',
        app: 'INCPHARMA Saha',
        title: 'Saha uygulaması',
        body: 'Gün içi bildirimler aktif',
        ring: false,
      };
    }
    return (
      '<div class="ip-companion-phone">' +
      '<p class="ip-companion-phone__label"><i class="fas fa-mobile"></i> Cebinizde</p>' +
      UI.renderPhone(opts) +
      '</div>'
    );
  }

  function wrapCinema(sceneId, visualHtml, playHtml, extraClass) {
    return (
      '<div class="ip-cinema ip-cinema--' +
      esc(sceneId) +
      ' ip-cinema--enter' +
      (extraClass ? ' ' + extraClass : '') +
      '">' +
      '<aside class="ip-cinema__visual">' +
      renderAtmosphere(sceneId) +
      visualHtml +
      '</aside>' +
      '<section class="ip-cinema__play">' +
      playHtml +
      '</section></div>'
    );
  }

  function momentBeat(sceneId, choice) {
    var beats = {
      crisis_own: 'Ekip nefes aldı — süreç konuşuluyor.',
      crisis_clinical: 'Koridor gerildi — rol sınırı tartışması.',
      wa_official: 'Mesaj resmi kanala taşındı.',
      wa_send: 'Kişisel kanal riski oluştu.',
      particle_soften: 'Flakon konusu belirsiz kaldı.',
      comp_claim: 'Rakip ürün yorumu kayda geçti.',
    };
    return beats[choice.id] || 'An kayda geçti — gün devam ediyor.';
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

  function showMoment(entry, scene, choice, done) {
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
      '<p>' +
      esc(line) +
      '</p>' +
      '<div class="ip-moment__bar"><i></i></div>' +
      '<span class="ip-moment__skip">Tıklayın veya bekleyin…</span></div>';

    overlay.hidden = false;
    overlay.dataset.ipMomentOpen = '1';
    overlay._ipMomentDone = done;
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
    }, 1400);

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

  function renderFinalePremium(cfg, state, flakonHtml, compsHtml, fatalHtml, score, label) {
    return (
      '<div class="ip-finale-premium">' +
      '<header class="ip-finale-premium__head">' +
      '<div class="ip-finale-premium__brand">INCPHARMA</div>' +
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
