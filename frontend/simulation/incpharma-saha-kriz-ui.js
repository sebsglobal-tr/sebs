/**
 * INCPHARMA simülasyonu — telefon ve sahne görselleri
 */
window.INCPHARMA_UI = (function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  var CHARACTERS = {
    'Hemşire Ece': { initials: 'EE', hue: '#e11d48', icon: 'fa-user-nurse' },
    'Dr. Selim Arda': { initials: 'SA', hue: '#1d4ed8', icon: 'fa-user-doctor' },
    'Dr. Hakan Er': { initials: 'HE', hue: '#b45309', icon: 'fa-user-doctor' },
    'Dr. Nermin Kaya': { initials: 'NK', hue: '#7c3aed', icon: 'fa-user-doctor' },
    'Levent Bey': { initials: 'LB', hue: '#475569', icon: 'fa-user-tie' },
    'Murat Bey': { initials: 'MB', hue: '#4338ca', icon: 'fa-user-tie' },
  };

  var SCENE_VISUALS = {
    opening: { icon: 'fa-hospital', label: 'Atlas Üniversitesi Hastanesi', tone: 'sky' },
    crisis: { icon: 'fa-heart-pulse', label: 'Onkoloji servisi — kriz', tone: 'rose' },
    lot: { icon: 'fa-vials', label: 'İlaç hazırlama alanı', tone: 'blue' },
    particle: { icon: 'fa-eye', label: 'Flakon görsel kontrol', tone: 'amber' },
    particle_mini: { icon: 'fa-comments', label: 'Hemşire ile netlik', tone: 'amber' },
    doctor: { icon: 'fa-stethoscope', label: 'Dr. Selim — gerilim', tone: 'blue' },
    nermin: { icon: 'fa-clock', label: 'Kısa bilgilendirme', tone: 'violet' },
    competitor: { icon: 'fa-handshake', label: 'Koridor — rakip baskısı', tone: 'slate' },
    offlabel: { icon: 'fa-flask', label: 'Bilimsel bilgi talebi', tone: 'violet' },
    service: { icon: 'fa-users', label: 'Servis sorumlusu', tone: 'slate' },
    brief: { icon: 'fa-bullhorn', label: 'Servis ekibi', tone: 'emerald' },
    report: { icon: 'fa-file-lines', label: 'Saha uygulaması — rapor', tone: 'blue' },
    evening_return: { icon: 'fa-building', label: 'INCPHARMA ofis', tone: 'indigo' },
    manager: { icon: 'fa-user-tie', label: 'Murat Bey — değerlendirme', tone: 'indigo' },
  };

  function character(who) {
    return CHARACTERS[who] || { initials: '?', hue: '#64748b', icon: 'fa-user' };
  }

  function renderLocationBanner(sceneId, location) {
    var v = SCENE_VISUALS[sceneId];
    if (!v && !location) return '';
    var tone = (v && v.tone) || 'sky';
    var icon = (v && v.icon) || 'fa-location-dot';
    var label = (v && v.label) || location || '';
    return (
      '<div class="ip-loc ip-loc--' +
      esc(tone) +
      '">' +
      '<span class="ip-loc__icon"><i class="fas ' +
      esc(icon) +
      '" aria-hidden="true"></i></span>' +
      '<span class="ip-loc__text">' +
      esc(label) +
      '</span></div>'
    );
  }

  function renderDialogueList(dialogue) {
    if (!dialogue || !dialogue.length) return '';
    var html = '<div class="ip-dialogues">';
    dialogue.forEach(function (d) {
      var c = character(d.who);
      html +=
        '<div class="ip-dialogue">' +
        '<div class="ip-dialogue__avatar" style="--av-color:' +
        esc(c.hue) +
        '"><i class="fas ' +
        esc(c.icon) +
        '" aria-hidden="true"></i></div>' +
        '<div class="ip-dialogue__bubble">' +
        '<span class="ip-dialogue__who">' +
        esc(d.who) +
        '</span>' +
        '<p>' +
        esc(d.text) +
        '</p></div></div>';
    });
    html += '</div>';
    return html;
  }

  function deviceStatusTime(time) {
    return time || '09:41';
  }

  /**
   * @param {object} o
   * mode: field-app | whatsapp | sms
   * ring, vibrate, critical
   * time, app, title, body, lines[], contactName, contactRole, messages[]
   */
  function renderPhone(o) {
    o = o || {};
    var mode = o.mode || 'field-app';
    var ringClass = o.ring ? ' ip-device-wrap--ring' : '';
    var vibrateClass = o.vibrate !== false && o.ring ? ' ip-device-wrap--vibrate' : '';
    var criticalClass = o.critical ? ' ip-push--critical' : '';

    var html =
      '<div class="ip-device-wrap' +
      ringClass +
      vibrateClass +
      '">' +
      (o.ring
        ? '<div class="ip-device-wrap__alert-band"><i class="fas fa-bell"></i> Telefon titriyor</div>'
        : '') +
      '<div class="ip-device" role="img" aria-label="Telefon ekranı simülasyonu">' +
      '<div class="ip-device__shell">' +
      '<div class="ip-device__island"></div>' +
      '<div class="ip-device__status">' +
      '<span class="ip-device__clock">' +
      esc(deviceStatusTime(o.time)) +
      '</span>' +
      '<span class="ip-device__status-icons" aria-hidden="true">' +
      '<i class="fas fa-signal"></i><i class="fas fa-wifi"></i><i class="fas fa-battery-full"></i>' +
      '</span></div>' +
      '<div class="ip-device__screen ip-device__screen--' +
      esc(mode) +
      '">';

    if (mode === 'field-app') {
      html += '<div class="ip-screen-wallpaper ip-screen-wallpaper--app"></div>';
      html += '<div class="ip-lock-time">' + esc(deviceStatusTime(o.time)) + '</div>';
      html += '<div class="ip-lock-date">Çarşamba, 20 Mayıs</div>';
      html +=
        '<div class="ip-push' +
        criticalClass +
        '">' +
        '<div class="ip-push__row">' +
        '<span class="ip-push__icon"><i class="fas fa-briefcase-medical"></i></span>' +
        '<div class="ip-push__meta">' +
        '<span class="ip-push__app">' +
        esc(o.app || 'INCPHARMA Saha') +
        '</span>' +
        '<span class="ip-push__when">şimdi</span></div></div>' +
        '<div class="ip-push__title">' +
        esc(o.title || 'Bildirim') +
        '</div>' +
        '<div class="ip-push__body">' +
        esc(o.body || '') +
        '</div>';
      if (o.lines && o.lines.length) {
        html += '<ul class="ip-push__list">';
        o.lines.forEach(function (ln) {
          html += '<li>' + esc(ln) + '</li>';
        });
        html += '</ul>';
      }
      html += '</div>';
    }

    if (mode === 'whatsapp') {
      var c = character(o.contactName || 'Dr. Hakan Er');
      html +=
        '<div class="ip-wa-header">' +
        '<span class="ip-wa-back"><i class="fas fa-chevron-left"></i></span>' +
        '<span class="ip-wa-avatar" style="--av-color:' +
        esc(c.hue) +
        '">' +
        esc(c.initials) +
        '</span>' +
        '<div class="ip-wa-contact">' +
        '<strong>' +
        esc(o.contactName || 'Kişi') +
        '</strong>' +
        '<span>' +
        esc(o.contactRole || 'çevrimiçi') +
        '</span></div>' +
        '<span class="ip-wa-actions"><i class="fas fa-video"></i><i class="fas fa-phone"></i></span></div>';
      html += '<div class="ip-wa-chat">';
      if (o.priorMessage) {
        html +=
          '<div class="ip-wa-bubble ip-wa-bubble--in">' +
          '<p>' +
          esc(o.priorMessage) +
          '</p><span class="ip-wa-time">10:12</span></div>';
      }
      html +=
        '<div class="ip-wa-bubble ip-wa-bubble--in ip-wa-bubble--new">' +
        '<p>' +
        esc(o.message || o.body || '') +
        '</p>' +
        '<span class="ip-wa-time">' +
        esc(o.messageTime || 'şimdi') +
        ' <i class="fas fa-check-double"></i></span></div>';
      html += '<div class="ip-wa-typing"><span></span><span></span><span></span></div>';
      html += '</div>';
      html +=
        '<div class="ip-wa-footer"><i class="fas fa-plus"></i><span>Mesaj yazın…</span><i class="fas fa-microphone"></i></div>';
    }

    if (mode === 'sms') {
      var c2 = character(o.contactName || 'Murat Bey');
      html +=
        '<div class="ip-sms-app-header">' +
        '<span class="ip-sms-back"><i class="fas fa-chevron-left"></i> Mesajlar</span>' +
        '<span class="ip-sms-compose"><i class="fas fa-pen-to-square"></i></span></div>';
      html +=
        '<div class="ip-sms-thread-header">' +
        '<span class="ip-sms-avatar" style="--av-color:' +
        esc(c2.hue) +
        '">' +
        esc(c2.initials) +
        '</span>' +
        '<strong>' +
        esc(o.contactName || 'Gönderen') +
        '</strong></div>';
      html += '<div class="ip-sms-thread">';
      html +=
        '<div class="ip-sms-bubble ip-sms-bubble--in">' +
        '<p>' +
        esc(o.message || o.body || '') +
        '</p>' +
        '<span class="ip-sms-time">' +
        esc(o.messageTime || '16:10') +
        '</span></div>';
      html += '</div>';
    }

    html +=
      '</div>' +
      '<div class="ip-device__bar">' +
      '<span></span><span></span><span></span>' +
      '</div></div></div>' +
      (o.caption ? '<p class="ip-device-wrap__caption">' + esc(o.caption) + '</p>' : '') +
      '</div>';

    return html;
  }

  function phoneFromScene(scene, sceneId) {
    if (scene.phoneVisual) return scene.phoneVisual;

    if (scene.type === 'phone') {
      return {
        mode: 'whatsapp',
        ring: true,
        vibrate: true,
        time: scene.time || '11:24',
        contactName: 'Dr. Hakan Er',
        contactRole: 'Onkoloji · Atlas Hastanesi',
        priorMessage: scene.priorWaMessage || null,
        message: scene.phoneMessage || '',
        messageTime: 'şimdi',
        caption: 'Kişisel WhatsApp — kayıt dışı paylaşım riski',
      };
    }

    if (scene.type === 'sms') {
      var name = (scene.smsFrom || 'Murat Bey').split('·')[0].trim();
      return {
        mode: 'sms',
        ring: true,
        time: scene.time || '16:10',
        contactName: name,
        message: scene.smsBody || '',
        messageTime: scene.time || '16:10',
        caption: scene.smsRole || 'Bölge müdürü — saha uygulaması',
      };
    }

    return null;
  }

  return {
    character: character,
    renderPhone: renderPhone,
    renderDialogueList: renderDialogueList,
    renderLocationBanner: renderLocationBanner,
    phoneFromScene: phoneFromScene,
    sceneVisual: SCENE_VISUALS,
  };
})();
