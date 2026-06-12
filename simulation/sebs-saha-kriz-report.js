/**
 * Medikal saha — seçimlerden oluşan canlı saha raporu
 */
window.SEBS_SAHA_REPORT = (function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function spoken(ch) {
    return (ch && (ch.say || ch.detail || ch.label)) || '';
  }

  function nowTime() {
    var d = new Date();
    return (
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0')
    );
  }

  function createEmpty() {
    return {
      reportNo: 'SR-' + Date.now().toString(36).toUpperCase().slice(-8),
      startedAt: new Date().toISOString(),
      entries: [],
    };
  }

  function entry(section, title, lines, processes, risk) {
    return {
      section: section,
      title: title,
      lines: lines,
      processes: processes || [],
      risk: risk || null,
    };
  }

  var ENTRY_BY_CHOICE = {
    crisis_own: entry(
      '1. Olay kaydı',
      'Ciddi reaksiyon şüphesi — ilk temas',
      [
        'Konum: Atlas Üniversitesi Hastanesi · Onkoloji servisi',
        'Ürün: OncoRelief IV · Lot ORV-24-118A',
        'Sınıflandırma: Ciddi advers olay / anafilaksi şüphesi',
        'Başlatılan süreç: Farmakovijilans · Medikal eskalasyon',
      ],
      ['Farmakovijilans', 'Medikal eskalasyon']
    ),
    crisis_defensive: entry(
      '1. Olay kaydı',
      'Belirsizlik vurgusu',
      [
        'Olay kaydı açıldı; ürün kaynaklı olduğu hemen söylenmedi',
        'Risk: Savunmacı dil — hastane güveni zayıflayabilir',
      ],
      ['Farmakovijilans (gecikmeli risk)'],
      'İlişki riski'
    ),
    crisis_clinical: entry(
      '1. Olay kaydı',
      'Operasyonel müdahale talebi',
      [
        'Kullanımın durdurulması istendi — rol aşımı',
        'UYARI: Klinik karar alanına müdahale',
      ],
      ['Firma bilgilendirme'],
      'Kritik rol aşımı'
    ),
    lot_record: entry(
      '2. Lot & izlenebilirlik',
      'Lot kaydı ve ayrıştırma',
      [
        'Lot ORV-24-118A kayıt altına alındı',
        'Kalite ve farmakovijilans süreçleri paralel',
      ],
      ['Kalite bildirimi', 'Farmakovijilans']
    ),
    lot_stop: entry(
      '2. Lot & izlenebilirlik',
      'Lot durdurma önerisi',
      ['Aynı lot kullanılmaması firma önerisi olarak iletildi'],
      ['Kalite', 'Farmakovijilans']
    ),
    lot_analyze: entry(
      '2. Lot & izlenebilirlik',
      'Analitik eşleştirme',
      ['Kanıt eşleştirmesi önceliklendirildi'],
      ['Lot izlenebilirlik']
    ),
    lot_recover_levent: entry(
      '2. Lot & izlenebilirlik',
      'Servis sorumlusu geri bildirimi',
      ['Rol sınırı açıklandı'],
      ['İlişki yönetimi']
    ),
    particle_clear: entry(
      '3. Flakon şüphesi',
      'Net ayrıştırma',
      ['Şüpheli flakon ayrıştırılmalı; kalite bildirimi'],
      ['Kalite bildirimi']
    ),
    particle_delegate: entry(
      '3. Flakon şüphesi',
      'Sorumluluk devri',
      ['Net kullanmayın ifadesi verilmedi'],
      ['Kalite (kısmi)'],
      'Belirsizlik'
    ),
    particle_soften: entry(
      '3. Flakon şüphesi',
      'Yumuşatılmış ifade',
      ['Kullanım riski — kritik uyum'],
      ['Kalite'],
      'Kritik flakon riski'
    ),
    mini_empathy: entry('3. Flakon şüphesi', 'Empatik netlik', ['Şüpheli flakon kullanılmamalı'], ['Kalite']),
    mini_legal: entry('3. Flakon şüphesi', 'Yasal sınır', ['Yalnızca bildirim'], ['Kalite'], 'Belirsizlik'),
    mini_soft: entry('3. Flakon şüphesi', 'Belirsiz', ['Partikül belirsiz'], [], 'İletişim riski'),
    doc_process: entry('4. Hekim', 'Süreç özeti', ['FV + kalite ayrı süreçler'], ['Farmakovijilans', 'Kalite']),
    doc_recover: entry('4. Hekim', 'Algı düzeltme', ['Yazılı dönüş organize edilecek'], ['İlişki onarımı']),
    doc_own_particle: entry('4. Hekim', 'Partikül sahiplenme', ['Ayrıştırma netleştirildi'], ['Kalite']),
    doc_blame: entry('4. Hekim', 'Sorumluluk atma', ['İlişki riski'], [], 'İlişki riski'),
    nermin_process: entry('5. Servis', 'Süreç özeti', ['İki bildirim anlatıldı'], ['Kriz sonrası iletişim']),
    nermin_short: entry('5. Servis', 'Kısa yanıt', ['Detay eksik'], [], 'Güven zayıf'),
    nermin_defend: entry('5. Servis', 'Savunmacı dil', ['Ürün savunması'], [], 'Savunmacı'),
    comp_neutral: entry('6. Koridor', 'Nötr süreç', ['Rakip yorumu yok'], ['Etik temsil']),
    comp_delay: entry('6. Koridor', 'Erteleme', ['Görüşme ertelendi'], ['İlişki']),
    comp_claim: entry('6. Koridor', 'Rakip genellemesi', ['UYUM RİSKİ'], [], 'Kritik etik'),
    off_cold: entry('7. Off-label', 'Soğuk red', ['Kaynak paylaşımı yok'], ['Off-label sınırı']),
    off_channel: entry('7. Off-label', 'Medikal kanal', ['Resmi sürece yönlendirme'], ['Medikal bilgi']),
    off_grey: entry('7. Off-label', 'Kaynak vaadi', ['Off-label risk'], [], 'Off-label risk'),
    wa_official: entry('8. WhatsApp', 'Resmi kanal', ['Kişisel kanal reddedildi'], ['Kanal disiplini']),
    wa_send: entry('8. WhatsApp', 'Gönderme vaadi', ['KRİTİK RİSK'], [], 'Kritik off-label'),
    wa_verbal: entry('8. WhatsApp', 'Sözlü görüşme', ['KRİTİK RİSK'], [], 'Kritik off-label'),
    svc_clear: entry('9. Destek', 'Etik sınır', ['Avantaj sunulmadı'], ['HIBE sınırı']),
    svc_ambiguous: entry('9. Destek', 'Belirsiz', ['Yönetime taşındı'], [], 'Belirsiz'),
    svc_flexible: entry('9. Destek', 'Esnek vaat', ['KRİTİK RİSK'], [], 'Kritik hibe'),
    brief_transparent: entry('10. Brifing', 'Şeffaf', ['İki bildirim anlatıldı'], ['Güven onarımı']),
    brief_short: entry('10. Brifing', 'Kısa', ['Detay yetersiz'], ['Güven']),
    brief_defensive: entry('10. Brifing', 'Savunmacı', ['Ürün savunması'], [], 'Savunmacı'),
    sms_process: entry('11. SMS Murat', 'Süreç özeti', ['FV + kalite özet'], ['Raporlama']),
    sms_vague: entry('11. SMS Murat', 'Belirsiz', ['Detay eksik'], [], 'Rapor zayıf'),
    sms_pressure: entry('11. SMS Murat', 'Esneklik', ['Etik risk'], [], 'Etik risk'),
    mgr_strong: entry('12. Değerlendirme', 'Dengeli temsil', ['Süreç savunuldu'], ['Profesyonel temsil']),
    mgr_recover: entry('12. Değerlendirme', 'Toparlama', ['Kanal planı'], ['İlişki']),
    mgr_own_fatal: entry('12. Değerlendirme', 'Fatal sahiplenme', ['Düzeltme planı'], ['Uyum']),
    mgr_defend: entry('12. Değerlendirme', 'Savunma', ['Uyum zayıf'], [], 'Uyum zayıf'),
    mgr_commercial: entry('12. Değerlendirme', 'Ticari esneklik', ['Etik risk'], [], 'Etik risk'),
  };

  function append(report, item) {
    if (!item.id) item.id = 'e' + report.entries.length;
    if (!item.at) item.at = nowTime();
    report.entries.push(item);
    return item;
  }

  function buildEntry(sceneId, scene, choice, state) {
    var def = ENTRY_BY_CHOICE[choice.id];
    var quote = spoken(choice);
    var lines;
    var section;
    var title;
    var processes;
    var risk;

    if (def) {
      section = def.section;
      title = def.title;
      lines = def.lines.slice();
      processes = def.processes.slice();
      risk = def.risk;
    } else {
      section = (scene && scene.title) || sceneId;
      title = choice.label || choice.id;
      lines = [];
      processes = [];
      risk = null;
    }

    if (quote) lines.push('Saha notu (sözel kayıt): «' + quote + '»');

    return {
      id: sceneId + '_' + choice.id + '_' + state.fieldReport.entries.length,
      at: (scene && scene.time) || nowTime(),
      sceneId: sceneId,
      choiceId: choice.id,
      section: section,
      title: title,
      lines: lines,
      processes: processes,
      risk: risk,
    };
  }

  function appendOpening(report) {
    var sim = window.SEBS_SAHA_SIM;
    return append(
      report,
      entry(
        '0. Gün başlangıcı',
        'Acil saha bildirimi',
        [
          '08:42 · Atlas Üniversitesi Hastanesi',
          'Ürün: ' + (sim && sim.product) + ' · Lot ' + (sim && sim.lot),
          'Ciddi reaksiyon / anafilaksi şüphesi — Onkoloji',
        ],
        ['Acil saha bildirimi']
      )
    );
  }

  function appendFromChoice(state, sceneId, scene, choice) {
    var item = buildEntry(sceneId, scene, choice, state);
    append(state.fieldReport, item);
    state.lastReportEntryId = item.id;
    return item;
  }

  function classifySummary(state) {
    var f = state.flags || {};
    var hist = state.history || [];
    function picked(id) {
      return hist.some(function (h) {
        return h.choice === id;
      });
    }

    return [
      {
        label: 'Farmakovijilans',
        value: picked('crisis_own') || picked('lot_record') ? 'Süreç saha notlarında' : 'Eksik / risk',
        ok: picked('crisis_own') && !f.roleOverreach,
      },
      {
        label: 'Kalite / flakon',
        value: f.particleRisk || f.fatalParticleUse ? 'Kritik uyarı' : 'Kayıt mevcut',
        ok: !f.particleRisk && !f.fatalParticleUse,
      },
      {
        label: 'Off-label / kanal',
        value: f.offLabelClean ? 'Medikal kanal' : f.offLabelRisk ? 'Paylaşım riski' : 'Kayıtlandı',
        ok: f.offLabelClean && !f.offLabelRisk,
      },
      {
        label: 'Hibe / destek',
        value: f.supportRisk || f.fatalSupportPromise ? 'Uygunsuz vaat' : 'Sınır net',
        ok: !f.supportRisk && !f.fatalSupportPromise,
      },
    ];
  }

  function assessReportingScore(state) {
    var blocks = classifySummary(state);
    var ok = 0;
    blocks.forEach(function (b) {
      if (b.ok) ok++;
    });
    return ok / blocks.length;
  }

  function renderEntryHtml(e, isNew) {
    var html =
      '<article class="ip-fr-entry' +
      (isNew ? ' ip-fr-entry--new' : '') +
      '">' +
      '<header class="ip-fr-entry__head"><span class="ip-fr-entry__time">' +
      esc(e.at) +
      '</span><span class="ip-fr-entry__section">' +
      esc(e.section) +
      '</span></header>' +
      '<h4 class="ip-fr-entry__title">' +
      esc(e.title) +
      '</h4><ul class="ip-fr-entry__lines">';
    e.lines.forEach(function (ln) {
      html += '<li>' + esc(ln) + '</li>';
    });
    html += '</ul>';
    if (e.processes && e.processes.length) {
      html += '<div class="ip-fr-entry__tags">';
      e.processes.forEach(function (p) {
        html += '<span class="ip-fr-tag">' + esc(p) + '</span>';
      });
      html += '</div>';
    }
    if (e.risk) {
      html += '<p class="ip-fr-entry__risk"><i class="fas fa-triangle-exclamation"></i> ' + esc(e.risk) + '</p>';
    }
    return html + '</article>';
  }

  function renderDock(report, flashId) {
    if (!report.entries.length) return '';
    var latest = report.entries[report.entries.length - 1];
    var html =
      '<div class="ip-fr-dock' +
      (flashId ? ' ip-fr-dock--flash' : '') +
      '">' +
      '<button type="button" class="ip-fr-dock__toggle" id="ipFrToggle" aria-expanded="false">' +
      '<i class="fas fa-file-medical"></i><span>Saha raporu</span><em>' +
      report.entries.length +
      ' kayıt</em></button>' +
      '<div class="ip-fr-dock__panel" id="ipFrPanel" hidden>' +
      '<p class="ip-fr-dock__latest-label">Son eklenen</p>' +
      renderEntryHtml(latest, flashId === latest.id);
    if (report.entries.length > 1) {
      html +=
        '<p class="ip-fr-dock__more">+' +
        (report.entries.length - 1) +
        ' kayıt tam belgede</p>';
    }
    return html + '</div></div>';
  }

  function renderFullDocument(report, state) {
    var sim = window.SEBS_SAHA_SIM;
    var dateStr = new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    var summary = classifySummary(state);
    var html =
      '<div class="ip-fr-doc" id="ipFieldReportDoc">' +
      '<header class="ip-fr-doc__letterhead">' +
      '<div class="ip-fr-doc__logo">Saha raporu</div>' +
      '<div class="ip-fr-doc__meta"><h2>Gün Sonu Saha Raporu</h2><dl>' +
      '<div><dt>Rapor no</dt><dd>' +
      esc(report.reportNo) +
      '</dd></div>' +
      '<div><dt>Tarih</dt><dd>' +
      esc(dateStr) +
      '</dd></div>' +
      '<div><dt>Hastane</dt><dd>Atlas Üniversitesi · Onkoloji</dd></div>' +
      '<div><dt>Ürün</dt><dd>' +
      esc(sim && sim.product) +
      ' · ' +
      esc(sim && sim.lot) +
      '</dd></div></dl></div></header>' +
      '<section class="ip-fr-doc__exec"><h3>Özet</h3><p>Gün boyunca verilen saha yanıtları aşağıdaki kayıtlara işlenmiştir. Eğitim amaçlı simülasyon çıktısıdır.</p></section>' +
      '<section class="ip-fr-doc__summary"><h3>Uyum özeti</h3><div class="ip-fr-summary-grid">';
    summary.forEach(function (b) {
      html +=
        '<div class="ip-fr-summary-item' +
        (b.ok ? ' ip-fr-summary-item--ok' : ' ip-fr-summary-item--warn') +
        '"><strong>' +
        esc(b.label) +
        '</strong><span>' +
        esc(b.value) +
        '</span></div>';
    });
    html += '</div></section><section class="ip-fr-doc__body"><h3>Olay kayıtları</h3>';
    report.entries.forEach(function (e) {
      html += renderEntryHtml(e, false);
    });
    html += '</section>';
    if (state.fatalErrors && state.fatalErrors.length) {
      html += '<section class="ip-fr-doc__fatal"><h3>Kritik uyarılar</h3><ul>';
      state.fatalErrors.forEach(function (code) {
        html +=
          '<li><code>' +
          esc(code) +
          '</code> — ' +
          esc((sim && sim.fatalLabels[code]) || code) +
          '</li>';
      });
      html += '</ul></section>';
    }
    return (
      html +
      '<footer class="ip-fr-doc__foot"><p>Saha uygulaması · Simülasyon raporu</p></footer></div>'
    );
  }

  function renderFinalScene(report, state) {
    return (
      '<div class="ip-fr-final">' +
      '<p class="ip-fr-final__lead"><i class="fas fa-tablet-screen-button"></i> Gün boyunca verdiğiniz yanıtlar rapora işlendi. Belgeyi kontrol edip onaylayın.</p>' +
      renderFullDocument(report, state) +
      '<div class="ip-fr-final__actions">' +
      '<button type="button" class="ip-scene-action__btn" id="ipReportConfirm">Raporu onayla ve gönder</button>' +
      '<button type="button" class="ip-btn ip-btn--ghost" id="ipPrintReport"><i class="fas fa-print"></i> Yazdır</button>' +
      '</div></div>'
    );
  }

  function bindDock() {
    var toggle = document.getElementById('ipFrToggle');
    var panel = document.getElementById('ipFrPanel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  return {
    createEmpty: createEmpty,
    append: append,
    appendOpening: appendOpening,
    appendFromChoice: appendFromChoice,
    renderDock: renderDock,
    renderFullDocument: renderFullDocument,
    renderFinalScene: renderFinalScene,
    assessReportingScore: assessReportingScore,
    bindDock: bindDock,
  };
})();
