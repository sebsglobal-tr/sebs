/**
 * INCPHARMA — sahne illüstrasyonları, zaman çizelgesi, seçenek stilleri
 */
window.INCPHARMA_VISUALS = (function () {
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
    { id: 'nermin', time: '12:00', label: 'Servis' },
    { id: 'competitor', time: '13:30', label: 'Koridor' },
    { id: 'offlabel', time: '14:45', label: 'Off-label' },
    { id: 'whatsapp', time: '11:24', label: 'WA' },
    { id: 'service', time: '15:20', label: 'Destek' },
    { id: 'brief', time: '16:00', label: 'Brifing' },
    { id: 'murat_sms', time: '16:10', label: 'SMS' },
    { id: 'report', time: '17:00', label: 'Rapor' },
    { id: 'evening_return', time: '17:45', label: 'Ofis' },
    { id: 'manager', time: '18:00', label: 'Sonuç' },
  ];

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

  var CHOICE_STYLES = {
    crisis_own: { tone: 'ok', icon: 'fa-shield-heart' },
    crisis_defensive: { tone: 'warn', icon: 'fa-scale-balanced' },
    crisis_clinical: { tone: 'danger', icon: 'fa-ban' },
    particle_clear: { tone: 'ok', icon: 'fa-eye' },
    particle_delegate: { tone: 'warn', icon: 'fa-user-doctor' },
    particle_soften: { tone: 'danger', icon: 'fa-triangle-exclamation' },
    mini_empathy: { tone: 'ok', icon: 'fa-hand-holding-heart' },
    mini_legal: { tone: 'warn', icon: 'fa-gavel' },
    mini_soft: { tone: 'danger', icon: 'fa-question' },
    comp_neutral: { tone: 'ok', icon: 'fa-handshake' },
    comp_delay: { tone: 'warn', icon: 'fa-clock' },
    comp_claim: { tone: 'danger', icon: 'fa-comment-slash' },
    off_cold: { tone: 'warn', icon: 'fa-shield' },
    off_channel: { tone: 'ok', icon: 'fa-route' },
    off_grey: { tone: 'danger', icon: 'fa-door-open' },
    wa_official: { tone: 'ok', icon: 'fa-building' },
    wa_send: { tone: 'danger', icon: 'fa-paper-plane' },
    wa_verbal: { tone: 'danger', icon: 'fa-comment-dots' },
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
    var pct = Math.round((idx / (DAY_STEPS.length - 1)) * 100);
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
    var chars = window.INCPHARMA_UI && window.INCPHARMA_UI.character;
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
      '<div class="ip-hero__env ip-env-pharmacy">' +
      '<div class="ip-pharmacy__shelf"></div>' +
      '<div class="ip-pharmacy__shelf ip-pharmacy__shelf--2"></div>' +
      '<div class="ip-pharmacy__counter"></div>' +
      '<div class="ip-pharmacy__screen"><span>Lot sorgu</span></div></div>'
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
      '<div class="ip-hero__env ip-env-consult">' +
      '<div class="ip-consult__desk"></div>' +
      '<div class="ip-consult__doc"></div>' +
      '<div class="ip-consult__folder"><i class="fas fa-file-medical"></i> Ruhsatlı bilgi</div></div>'
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
      '<div class="ip-office__logo">INCPHARMA</div>' +
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

  function renderDecisionPrompt(sceneId) {
    var labels = {
      crisis: 'İlk 60 saniye — ne söylersiniz?',
      particle: 'Flakon kararı — netlik gerekli',
      offlabel: 'Sınırı nasıl korursunuz?',
      whatsapp: 'Mesaja nasıl yanıt verirsiniz?',
    };
    var t = labels[sceneId];
    if (!t) return '';
    return (
      '<div class="ip-decision-prompt"><i class="fas fa-crosshairs"></i> ' + esc(t) + '</div>'
    );
  }

  function choiceStyle(choiceId) {
    return CHOICE_STYLES[choiceId] || { tone: 'neutral', icon: 'fa-circle-dot' };
  }

  function renderChoiceIcon(choiceId) {
    var st = choiceStyle(choiceId);
    return (
      '<span class="ip-choice__icon ip-choice__icon--' +
      esc(st.tone) +
      '"><i class="fas ' +
      esc(st.icon) +
      '"></i></span>'
    );
  }

  return {
    renderDayTimeline: renderDayTimeline,
    renderSceneHero: renderSceneHero,
    renderNarrativeCard: renderNarrativeCard,
    renderDecisionPrompt: renderDecisionPrompt,
    choiceStyle: choiceStyle,
    renderChoiceIcon: renderChoiceIcon,
    DAY_STEPS: DAY_STEPS,
  };
})();
