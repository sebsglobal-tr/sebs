/**
 * Medikal saha — sahne illüstrasyonları, zaman çizelgesi, seçenek stilleri
 */
window.SEBS_SAHA_VISUALS = (function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  var LOT = 'ORV-24-118A';

  var DAY_STEPS = [
    { id: 'opening', time: '08:42', label: 'Bildirim' },
    { id: 'crisis', time: '09:05', label: 'Kriz' },
    { id: 'lot', time: '09:25', label: 'Lot' },
    { id: 'particle', time: '09:40', label: 'Flakon' },
    { id: 'doctor', time: '10:15', label: 'Hekim' },
    { id: 'whatsapp', time: '11:24', label: 'WA' },
    { id: 'nermin', time: '12:00', label: 'Servis' },
    { id: 'competitor', time: '13:30', label: 'Koridor' },
    { id: 'offlabel', time: '14:45', label: 'Off-label' },
    { id: 'service', time: '15:20', label: 'Destek' },
    { id: 'brief', time: '16:00', label: 'Brifing' },
    { id: 'murat_sms', time: '16:10', label: 'SMS' },
    { id: 'report', time: '17:00', label: 'Rapor' },
    { id: 'evening_return', time: '17:45', label: 'Ofis' },
    { id: 'manager', time: '18:00', label: 'Sonuç' },
  ];

  var DAY_START = '08:42';
  var DAY_END = '18:00';

  var SCENE_TIME_OVERRIDE = {
    intro: '08:42',
    particle_mini: '09:40',
    finale: '18:00',
  };

  function parseTimeToMinutes(t) {
    if (!t || typeof t !== 'string') return null;
    var m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  function sceneClockTime(sceneId) {
    if (SCENE_TIME_OVERRIDE[sceneId]) return SCENE_TIME_OVERRIDE[sceneId];
    var id = DAY_INDEX_ALIAS[sceneId] || sceneId;
    for (var i = 0; i < DAY_STEPS.length; i++) {
      if (DAY_STEPS[i].id === id) return DAY_STEPS[i].time;
    }
    return null;
  }

  function dayProgressPercent(sceneId) {
    if (sceneId === 'intro') return 0;
    if (sceneId === 'finale') return 100;
    var cur = parseTimeToMinutes(sceneClockTime(sceneId));
    var start = parseTimeToMinutes(DAY_START);
    var end = parseTimeToMinutes(DAY_END);
    if (cur == null || start == null || end == null || end <= start) return 0;
    if (cur <= start) return 0;
    if (cur >= end) return 100;
    return Math.round(((cur - start) / (end - start)) * 100);
  }

  var SCENE_HEROES = {
    opening: {
      env: 'parking',
      mood: 'shift',
      compact: false,
      chips: ['Atlas Üniversitesi Hastanesi'],
    },
    crisis: {
      env: 'corridor',
      mood: 'critical',
      vitals: true,
      alert: 'Ciddi reaksiyon · Anafilaksi şüphesi',
      chips: ['Lot ' + LOT, 'OncoRelief IV'],
      chars: ['Hemşire Ece', 'Dr. Selim Arda'],
    },
    lot: { env: 'pharmacy', mood: 'focus', chips: ['Lot takibi', LOT] },
    particle: { env: 'vial', mood: 'tense', vialSuspect: true, chips: ['Görsel kontrol'] },
    particle_mini: { env: 'vial', mood: 'tense', compact: true },
    doctor: { env: 'corridor', mood: 'tense', chars: ['Dr. Selim Arda'] },
    nermin: { env: 'hallway', mood: 'pressure', chars: ['Dr. Nermin Kaya'] },
    competitor: { env: 'hallway', mood: 'neutral', chars: ['Dr. Hakan Er'] },
    offlabel: { env: 'consult', mood: 'ethical', chars: ['Dr. Hakan Er'] },
    whatsapp: { env: 'hallway', mood: 'trap', compact: true, chips: ['Kişisel kanal riski'] },
    service: { env: 'nurses', mood: 'pressure', chars: ['Levent Bey'] },
    brief: { env: 'ward', mood: 'calm', chips: ['Servis ekibi'] },
    murat_sms: { env: 'car', mood: 'evening', compact: true },
    report: { env: 'tablet', mood: 'focus', chips: ['Saha raporu'] },
    evening_return: { env: 'office-ext', mood: 'evening' },
    manager: { env: 'meeting', mood: 'boss', chars: ['Murat Bey'] },
  };

  var DAY_INDEX_ALIAS = {
    particle_mini: 'particle',
    doctor: 'doctor',
  };

  function dayIndex(sceneId) {
    var id = DAY_INDEX_ALIAS[sceneId] || sceneId;
    for (var i = 0; i < DAY_STEPS.length; i++) {
      if (DAY_STEPS[i].id === id) return i;
    }
    return -1;
  }

  function renderDayTimeline(sceneId) {
    var idx = dayIndex(sceneId);
    if (idx < 0) return '';
    var pct = dayProgressPercent(sceneId);
    var html =
      '<div class="ip-dayline" aria-label="Gün akışı">' +
      '<div class="ip-dayline__head"><i class="fas fa-calendar-day"></i> Bir günde sahada</div>' +
      '<div class="ip-dayline__track"><div class="ip-dayline__fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="ip-dayline__nodes">';
    DAY_STEPS.forEach(function (step, i) {
      var cls = 'ip-dayline__node';
      if (i < idx) cls += ' ip-dayline__node--done';
      if (i === idx) cls += ' ip-dayline__node--active';
      html +=
        '<span class="' +
        cls +
        '" title="' +
        esc(step.label) +
        '"><em>' +
        esc(step.time) +
        '</em><b>' +
        esc(step.label) +
        '</b></span>';
    });
    html += '</div></div>';
    return html;
  }

  function renderVitals() {
    return (
      '<div class="ip-vitals" aria-hidden="true">' +
      '<div class="ip-vitals__label"><i class="fas fa-heart-pulse"></i> Monitör</div>' +
      '<svg class="ip-vitals__wave" viewBox="0 0 120 28" preserveAspectRatio="none">' +
      '<polyline points="0,14 8,14 12,4 18,24 24,14 32,14 38,8 44,20 50,14 58,14 64,2 72,26 78,14 86,14 92,10 98,18 104,14 120,14" ' +
      'fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '<span class="ip-vitals__bpm">132</span></div>'
    );
  }

  function renderHeroChars(names) {
    if (!names || !names.length) return '';
    var chars = window.SEBS_SAHA_UI && window.SEBS_SAHA_UI.character;
    var html = '<div class="ip-hero__cast">';
    names.forEach(function (name, i) {
      var c = chars ? chars(name) : { initials: '?', hue: '#64748b', icon: 'fa-user' };
      html +=
        '<div class="ip-hero-char" style="--av-color:' +
        esc(c.hue) +
        ';--char-i:' +
        i +
        '">' +
        '<span class="ip-hero-char__fig"><i class="fas ' +
        esc(c.icon) +
        '"></i></span>' +
        '<span class="ip-hero-char__name">' +
        esc(name.split(' ').pop()) +
        '</span></div>';
    });
    html += '</div>';
    return html;
  }

  function renderChips(chips, mood) {
    if (!chips || !chips.length) return '';
    var html = '<div class="ip-hero__chips">';
    chips.forEach(function (t, i) {
      var critical = mood === 'critical' && i === 0;
      html +=
        '<span class="ip-hero-chip' +
        (critical ? ' ip-hero-chip--alert' : '') +
        '">' +
        esc(t) +
        '</span>';
    });
    html += '</div>';
    return html;
  }

  function envCorridor() {
    return (
      '<div class="ip-hero__env ip-env-corridor">' +
      '<div class="ip-corridor__vanish"></div>' +
      '<div class="ip-corridor__lights"><span></span><span></span><span></span></div>' +
      '<div class="ip-corridor__sign">ONKOLOJİ SERVİSİ</div>' +
      '<div class="ip-corridor__door ip-corridor__door--l"></div>' +
      '<div class="ip-corridor__door ip-corridor__door--r"></div>' +
      '<div class="ip-corridor__floor"></div></div>'
    );
  }

  function envParking() {
    return (
      '<div class="ip-hero__env ip-env-parking">' +
      '<div class="ip-parking__sky"></div>' +
      '<div class="ip-parking__building"><span>ATLAS</span><small>Üniversite Hastanesi</small></div>' +
      '<div class="ip-parking__car"></div>' +
      '<div class="ip-parking__lines"></div></div>'
    );
  }

  function envPharmacy() {
    return (
      '<div class="ip-hero__env ip-env-pharmacy" aria-hidden="true">' +
      '<div class="ip-pharmacy__room">' +
      '<div class="ip-pharmacy__lights"><span></span><span></span><span></span></div>' +
      '<div class="ip-pharmacy__sign"><i class="fas fa-vials"></i> İlaç hazırlama</div>' +
      '<div class="ip-pharmacy__fridge">' +
      '<div class="ip-pharmacy__fridge-glass"></div>' +
      '<div class="ip-pharmacy__fridge-shelves">' +
      '<span class="ip-pharmacy__vial"></span><span class="ip-pharmacy__vial"></span><span class="ip-pharmacy__vial ip-pharmacy__vial--alt"></span>' +
      '</div>' +
      '<span class="ip-pharmacy__fridge-temp"><i class="fas fa-temperature-low"></i> 2–8°C</span>' +
      '</div>' +
      '<div class="ip-pharmacy__rack">' +
      '<div class="ip-pharmacy__box ip-pharmacy__box--active"><span>OncoRelief IV</span><em>' +
      esc(LOT) +
      '</em></div>' +
      '<div class="ip-pharmacy__box"><span>OncoRelief IV</span><em>ORV-23-902C</em></div>' +
      '<div class="ip-pharmacy__box ip-pharmacy__box--small"></div>' +
      '</div>' +
      '<div class="ip-pharmacy__bench">' +
      '<div class="ip-pharmacy__tray">' +
      '<div class="ip-pharmacy__flakon-used" title="Kullanılmış flakon"></div>' +
      '<div class="ip-pharmacy__label-slip"><span>Lot</span><strong>' +
      esc(LOT) +
      '</strong></div>' +
      '</div>' +
      '<div class="ip-pharmacy__receipt"><i class="fas fa-receipt"></i> Teslim fişi</div>' +
      '</div>' +
      '<div class="ip-pharmacy__terminal">' +
      '<div class="ip-pharmacy__terminal-head"><i class="fas fa-barcode"></i> Lot izleme</div>' +
      '<div class="ip-pharmacy__terminal-screen">' +
      '<span class="ip-pharmacy__terminal-lot">' +
      esc(LOT) +
      '</span>' +
      '<span class="ip-pharmacy__terminal-status">Sorgu · Kayıt bekliyor</span>' +
      '<div class="ip-pharmacy__barcode" aria-hidden="true"></div>' +
      '</div></div>' +
      '<div class="ip-pharmacy__quarantine"><i class="fas fa-box-open"></i> Ayrıştırma alanı</div>' +
      '</div></div>'
    );
  }

  function envVial(suspect) {
    return (
      '<div class="ip-hero__env ip-env-vial">' +
      '<div class="ip-env-vial__glow"></div>' +
      '<div class="ip-env-vial__flakon">' +
      '<div class="ip-env-vial__cap"></div>' +
      '<div class="ip-env-vial__body">' +
      '<strong>OncoRelief IV</strong>' +
      '<span>Lot ' +
      esc(LOT) +
      '</span></div>' +
      (suspect ? '<div class="ip-env-vial__dot" title="Şüpheli partikül"></div>' : '') +
      '<div class="ip-env-vial__glass"></div></div></div>'
    );
  }

  function envHallway() {
    return (
      '<div class="ip-hero__env ip-env-hallway">' +
      '<div class="ip-hallway__window"></div>' +
      '<div class="ip-hallway__bench"></div>' +
      '<div class="ip-hallway__plant"></div></div>'
    );
  }

  function envConsult() {
    return (
      '<div class="ip-hero__env ip-env-consult" aria-hidden="true">' +
      '<div class="ip-consult__room">' +
      '<div class="ip-consult__window"></div>' +
      '<div class="ip-consult__bookshelf"></div>' +
      '<div class="ip-consult__desk">' +
      '<div class="ip-consult__monitor">' +
      '<span class="ip-consult__monitor-tag"><i class="fas fa-file-medical"></i> Ruhsatlı bilgi</span>' +
      '<span class="ip-consult__monitor-line"></span><span class="ip-consult__monitor-line"></span>' +
      '</div>' +
      '<div class="ip-consult__folder ip-consult__folder--smcp"><i class="fas fa-book"></i> SmPC</div>' +
      '</div>' +
      '<div class="ip-consult__chair"></div>' +
      '<div class="ip-consult__badge"><i class="fas fa-scale-balanced"></i> Etik sınır</div>' +
      '</div></div>'
    );
  }

  function envNurses() {
    return (
      '<div class="ip-hero__env ip-env-nurses">' +
      '<div class="ip-nurses__station"></div>' +
      '<div class="ip-nurses__board">Servis panosu</div></div>'
    );
  }

  function envWard() {
    return (
      '<div class="ip-hero__env ip-env-ward">' +
      '<div class="ip-ward__circle"></div>' +
      '<div class="ip-ward__avatars"><span></span><span></span><span></span><span></span></div></div>'
    );
  }

  function envCar() {
    return (
      '<div class="ip-hero__env ip-env-car">' +
      '<div class="ip-car__road"></div>' +
      '<div class="ip-car__dash"></div>' +
      '<div class="ip-car__phone-ping"></div></div>'
    );
  }

  function envTablet() {
    return (
      '<div class="ip-hero__env ip-env-tablet">' +
      '<div class="ip-tablet__device">' +
      '<div class="ip-tablet__row"></div><div class="ip-tablet__row"></div><div class="ip-tablet__row ip-tablet__row--active"></div>' +
      '</div></div>'
    );
  }

  function envOffice() {
    return (
      '<div class="ip-hero__env ip-env-office">' +
      '<div class="ip-office__logo">Kurumsal</div>' +
      '<div class="ip-office__glass"></div></div>'
    );
  }

  function envMeeting() {
    return (
      '<div class="ip-hero__env ip-env-meeting">' +
      '<div class="ip-meeting__table"></div>' +
      '<div class="ip-meeting__chair ip-meeting__chair--you"></div>' +
      '<div class="ip-meeting__chair ip-meeting__chair--boss"></div>' +
      '<div class="ip-meeting__screen">Performans</div></div>'
    );
  }

  function renderEnv(env, cfg) {
    switch (env) {
      case 'corridor':
        return envCorridor();
      case 'parking':
        return envParking();
      case 'pharmacy':
        return envPharmacy();
      case 'vial':
        return envVial(!!cfg.vialSuspect);
      case 'hallway':
        return envHallway();
      case 'consult':
        return envConsult();
      case 'nurses':
        return envNurses();
      case 'ward':
        return envWard();
      case 'car':
        return envCar();
      case 'tablet':
        return envTablet();
      case 'office-ext':
        return envOffice();
      case 'meeting':
        return envMeeting();
      default:
        return envHallway();
    }
  }

  function renderSceneHero(sceneId, scene) {
    var cfg = SCENE_HEROES[sceneId];
    if (!cfg) return '';

    var env = cfg.env || 'hallway';
    var mood = cfg.mood || 'neutral';
    var compact = cfg.compact ? ' ip-hero--compact' : '';
    var time = scene.time || '';
    var place = scene.location || '';
    var title = scene.title || '';

    var html =
      '<header class="ip-hero ip-hero--env-' +
      esc(env) +
      ' ip-hero--mood-' +
      esc(mood) +
      compact +
      '">' +
      renderEnv(env, cfg) +
      '<div class="ip-hero__shade"></div>' +
      '<div class="ip-hero__content">';

    if (cfg.vitals) html += renderVitals();

    if (cfg.alert) {
      html +=
        '<div class="ip-hero__alert-band"><i class="fas fa-triangle-exclamation"></i> ' +
        esc(cfg.alert) +
        '</div>';
    }

    html += renderChips(cfg.chips, cfg.mood);

    html +=
      '<div class="ip-hero__title-block">' +
      '<h2 class="ip-hero__title">' +
      esc(title) +
      '</h2>';

    if (time || place) {
      html += '<p class="ip-hero__meta">';
      if (time) html += '<span><i class="fas fa-clock"></i> ' + esc(time) + '</span>';
      if (place) html += '<span><i class="fas fa-location-dot"></i> ' + esc(place) + '</span>';
      html += '</p>';
    }

    html += '</div>';
    if (cfg.chars) html += renderHeroChars(cfg.chars);
    html += '</div></header>';
    return html;
  }

  function renderNarrativeCard(text, sceneId) {
    if (!text) return '';
    var icons = {
      crisis: 'fa-bolt',
      opening: 'fa-car',
      particle: 'fa-magnifying-glass',
      offlabel: 'fa-flask',
      competitor: 'fa-comments',
    };
    var icon = icons[sceneId] || 'fa-book-open';
    return (
      '<div class="ip-narrative-card">' +
      '<div class="ip-narrative-card__icon"><i class="fas ' +
      icon +
      '"></i></div>' +
      '<p>' +
      esc(text) +
      '</p></div>'
    );
  }

  var REPLY_PROMPTS = {
    crisis: 'Koridorda herkes sizi dinliyor…',
    particle: 'Hemşire net bir cümle bekliyor.',
    particle_mini: 'Ece hâlâ netlik istiyor.',
    offlabel: 'Dr. Hakan sizi dinliyor.',
    whatsapp: 'Mesajı nasıl yanıtlarsınız?',
    service: 'Levent Bey size bakıyor.',
    competitor: 'Dr. Hakan bekliyor.',
    nermin: 'Dr. Nermin kısa bir özet istiyor.',
  };

  /** Konuşma balonu — test şıkkı değil, temsilcinin söyleyeceği cümle */
  function renderReplies(scene, state) {
    if (!scene.choices || !scene.choices.length) return '';
    var prompt =
      scene.replyPrompt || REPLY_PROMPTS[state.sceneId] || 'Ne söylersiniz?';
    var html =
      '<div class="ip-replies">' +
      '<div class="ip-replies__divider"><span>Siz konuşuyorsunuz</span></div>' +
      '<p class="ip-replies__prompt">' +
      esc(prompt) +
      '</p>' +
      '<div class="ip-replies__list">';

    scene.choices.forEach(function (ch) {
      if (typeof ch.showIf === 'function' && !ch.showIf(state)) return;
      var spoken = ch.say || ch.detail || ch.label;
      html +=
        '<button type="button" class="ip-reply" data-choice="' +
        esc(ch.id) +
        '" aria-label="Yanıt: ' +
        esc(spoken.slice(0, 80)) +
        '…">' +
        '<span class="ip-reply__avatar" aria-hidden="true"><i class="fas fa-user-tie"></i></span>' +
        '<span class="ip-reply__bubble"><q>' +
        esc(spoken) +
        '</q></span>' +
        '<span class="ip-reply__go" aria-hidden="true"><i class="fas fa-chevron-right"></i></span>' +
        '</button>';
    });

    html += '</div></div>';
    return html;
  }

  function renderSceneAction(label, id) {
    return (
      '<div class="ip-scene-action">' +
      '<button type="button" class="ip-scene-action__btn" id="' +
      esc(id || 'ipContinue') +
      '">' +
      '<span>' +
      esc(label) +
      '</span>' +
      '<i class="fas fa-arrow-right" aria-hidden="true"></i></button></div>'
    );
  }

  return {
    renderDayTimeline: renderDayTimeline,
    renderSceneHero: renderSceneHero,
    renderNarrativeCard: renderNarrativeCard,
    renderReplies: renderReplies,
    renderSceneAction: renderSceneAction,
    dayProgressPercent: dayProgressPercent,
    sceneClockTime: sceneClockTime,
    DAY_STEPS: DAY_STEPS,
  };
})();
