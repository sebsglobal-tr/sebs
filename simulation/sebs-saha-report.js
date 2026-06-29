/**
 * Medikal saha — seçimlerden oluşan canlı saha raporu
 */
window.SEBS_SAHA_REPORT = (function () {
  'use strict';

  var CFG = function () {
    return window.SEBS_SAHA_SIM;
  };

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

  /** choiceId → rapor bloğu şablonu */
  var ENTRY_BY_CHOICE = {
    crisis_own: entry(
      '1. Olay kaydı',
      'Ciddi reaksiyon şüphesi — ilk temas',
      [
        'Konum: Atlas Üniversitesi Hastanesi · Onkoloji servisi',
        'Ürün: OncoRelief IV · Lot ORV-24-118A',
        'Sınıflandırma: Ciddi advers olay / anafilaksi şüphesi (ön bildirim)',
        'Temsilci pozisyonu: Klinik müdahale hekim sorumluluğunda; nedensellik iddiası yok',
        'Başlatılan süreç: Farmakovijilans bildirimi · Medikal ekibe acil iletim',
      ],
      ['Farmakovijilans', 'Medikal eskalasyon']
    ),
    crisis_defensive: entry(
      '1. Olay kaydı',
      'Ciddi reaksiyon şüphesi — belirsizlik vurgusu',
      [
        'Olay kaydı açıldı; ürün kaynaklı olduğu hemen söylenmedi',
        'Ürün bilgi dosyası güvenlilik bölümü birlikte kontrol önerildi',
        'Risk: Savunmacı dil — hastane güveni zayıflayabilir',
      ],
      ['Farmakovijilans (gecikmeli risk)'],
      'İlişki / iletişim riski'
    ),
    crisis_clinical: entry(
      '1. Olay kaydı',
      'Ciddi reaksiyon — operasyonel müdahale talebi',
      [
        'Serviste ürün kullanımının durdurulması istendi',
        'Aynı lot ürünlerin ayrılması talep edildi',
        'UYARI: Temsilci klinik/operasyon kararına müdahale — rol aşımı',
      ],
      ['Firma bilgilendirme'],
      'Kritik rol aşımı'
    ),
    lot_record: entry(
      '2. Lot & izlenebilirlik',
      'Lot kaydı ve ayrıştırma',
      [
        'Kullanılan flakon ve ambalaj eşleştirildi',
        'Lot ORV-24-118A ve uygulama zamanı kayıt altına alındı',
        'Aynı lot stokları hastane prosedürüyle ayrıştırılacak',
        'Kalite bildirimi ve farmakovijilans süreçleri paralel yürütülecek',
      ],
      ['Kalite bildirimi', 'Farmakovijilans', 'Lot izlenebilirlik']
    ),
    lot_stop: entry(
      '2. Lot & izlenebilirlik',
      'Lot kullanım durdurma önerisi',
      [
        'Aynı lot ürünlerin kullanılmaması firma önerisi olarak iletildi',
        'Not: Hastane operasyonel kararı temsilci tarafından verilmedi',
      ],
      ['Kalite', 'Farmakovijilans'],
      'Sınır: firma önerisi / hastane kararı ayrımı'
    ),
    lot_analyze: entry(
      '2. Lot & izlenebilirlik',
      'Analitik eşleştirme önceliği',
      [
        'Kanıt eşleştirmesi tamamlanmadan genelleme yapılmadı',
        'Servis için net aksiyon planı gecikebilir — iletişim riski',
      ],
      ['Lot izlenebilirlik']
    ),
    lot_recover_levent: entry(
      '2. Lot & izlenebilirlik',
      'Servis sorumlusu geri bildirimi',
      [
        '«Kullanımı durdurun» ifadesi serviste duyuldu',
        'Rol sınırı açıklaması yapıldı; süreç kayıt altına alındı',
      ],
      ['İlişki yönetimi', 'Farmakovijilans']
    ),
    particle_clear: entry(
      '3. Flakon / görsel şüphe',
      'Partikül şüphesi — net ayrıştırma',
      [
        'Şüpheli flakon normal ürün gibi değerlendirilmemeli',
        'Görsel kontrol uyarısı paylaşıldı; kalite bildirimi gerekli',
        'Klinik uygulama kararı hekim/hastane prosedüründe',
      ],
      ['Kalite bildirimi', 'Ürün şikâyeti']
    ),
    particle_delegate: entry(
      '3. Flakon / görsel şüphe',
      'Partikül — sorumluluk devri',
      [
        'Karar hekime bırakıldı; kalite bildirimi vaadi',
        'Risk: Net «kullanmayın» ifadesi verilmedi',
      ],
      ['Kalite (kısmi)'],
      'Belirsiz flakon mesajı'
    ),
    particle_soften: entry(
      '3. Flakon / görsel şüphe',
      'Partikül — yumuşatılmış ifade',
      [
        '«Doktorla bakılabilir» izlenimi — şüpheli flakon için kullanım riski',
        'UYARI: Hasta güvenliği açısından kritik uyum riski',
      ],
      ['Kalite'],
      'Kritik flakon riski'
    ),
    mini_empathy: entry(
      '3. Flakon / görsel şüphe',
      'Hemşire netlik turu — empatik netlik',
      [
        'Şüpheli flakon kullanılmamalı — ürün güvenliği süreci olarak tekrarlandı',
      ],
      ['Kalite bildirimi']
    ),
    mini_legal: entry(
      '3. Flakon / görsel şüphe',
      'Hemşire netlik turu — yasal sınır',
      [
        'Kullanın/kullanmayın denmedi; yalnızca bildirim açılabileceği belirtildi',
      ],
      ['Kalite'],
      'Belirsizlik'
    ),
    mini_soft: entry(
      '3. Flakon / görsel şüphe',
      'Hemşire netlik turu — belirsiz',
      ['Partikül konusu belirsiz bırakıldı'],
      [],
      'İletişim riski'
    ),
    doc_process: entry(
      '4. Hekim görüşmesi',
      'Dr. Selim Arda — süreç özeti',
      [
        'İki bildirim: reaksiyon (FV) + flakon (kalite) ayrı süreçler',
        'Klinik karar hekim alanında; nedensellik yorumu yapılmadı',
      ],
      ['Farmakovijilans', 'Kalite']
    ),
    doc_recover: entry(
      '4. Hekim görüşmesi',
      'Dr. Selim — savunmacı algı düzeltme',
      [
        'Savunmacı izlenim düzeltildi; yazılı resmi dönüş organize edilecek',
      ],
      ['Farmakovijilans', 'Kalite', 'İlişki onarımı']
    ),
    doc_own_particle: entry(
      '4. Hekim görüşmesi',
      'Partikül hatası sahiplenildi',
      [
        'İlk ifadenin yanlış izlenim oluşturduğu kabul edildi',
        'Şüpheli flakon ayrıştırma ve kalite bildirimi netleştirildi',
      ],
      ['Kalite bildirimi']
    ),
    doc_blame: entry(
      '4. Hekim görüşmesi',
      'Sorumluluk hastaneye atıldı',
      ['Sorumluluk hastane kararına yüklendi — ilişki riski'],
      [],
      'İlişki riski'
    ),
    nermin_process: entry(
      '5. Servis bilgilendirme',
      'Dr. Nermin — 60 sn süreç özeti',
      [
        'İki bildirim ve yazılı resmi dönüş taahhüdü anlatıldı',
        'Ürün savunması yapılmadı',
      ],
      ['Farmakovijilans', 'Kalite', 'Kriz sonrası iletişim']
    ),
    nermin_short: entry(
      '5. Servis bilgilendirme',
      'Dr. Nermin — kısa yanıt',
      ['Detay sonraya bırakıldı — güven onarımı zayıf'],
      ['Farmakovijilans'],
      'Güven onarımı zayıf'
    ),
    nermin_defend: entry(
      '5. Servis bilgilendirme',
      'Dr. Nermin — savunmacı ürün dili',
      ['Ürün savunması — kriz sonrası güven zedelenir'],
      [],
      'Savunmacı dil'
    ),
    comp_neutral: entry(
      '6. Rakip baskısı',
      'Dr. Hakan — nötr süreç',
      [
        'Rakip ürün yorumu yapılmadı',
        'Resmi kalite ve farmakovijilans süreci vurgulandı',
      ],
      ['Etik temsil']
    ),
    comp_delay: entry(
      '6. Rakip baskısı',
      'Görüşme ertelendi',
      ['Ürün değerlendirmesi sonraya bırakıldı'],
      ['İlişki yönetimi']
    ),
    comp_claim: entry(
      '6. Rakip baskısı',
      'Rakip ürün genellemesi',
      ['Kanıtsız rakip karşılaştırması — UYUM RİSKİ'],
      [],
      'Kritik etik risk'
    ),
    off_cold: entry(
      '7. Off-label talep',
      'Soğuk red',
      [
        'Ruhsat dışı tanıtım kapsamında kaynak paylaşımı reddedildi',
        'Medikal kanal dışı iletişim yok',
      ],
      ['Off-label sınırı']
    ),
    off_channel: entry(
      '7. Off-label talep',
      'Medikal kanal yönlendirmesi',
      [
        'Talep resmi medikal bilgi sürecine yönlendirildi',
        'Off-label yorum veya kaynak paylaşımı yapılmadı',
      ],
      ['Medikal bilgi talebi', 'Off-label sınırı']
    ),
    off_grey: entry(
      '7. Off-label talep',
      'Gri alan — kaynak vaadi',
      [
        '«Sonra kaynak iletebilirim» — off-label paylaşım riski',
      ],
      [],
      'Off-label risk'
    ),
    wa_official: entry(
      '8. WhatsApp',
      'Kişisel kanal — resmi yönlendirme',
      [
        'WhatsApp üzerinden kaynak iletilmeyecek',
        'Talep kayıtlı medikal ekibe yönlendirildi',
      ],
      ['Medikal bilgi talebi', 'Kanal disiplini']
    ),
    wa_send: entry(
      '8. WhatsApp',
      'Yayın gönderme vaadi',
      ['Kişisel kanaldan kaynak gönderimi — KRİTİK UYUM RİSKİ'],
      [],
      'Kritik off-label risk'
    ),
    wa_verbal: entry(
      '8. WhatsApp',
      'Sözlü görüşme önerisi',
      ['Kayıt dışı sözlü off-label — KRİTİK UYUM RİSKİ'],
      [],
      'Kritik off-label risk'
    ),
    svc_clear: entry(
      '9. Destek talebi',
      'Levent Bey — etik sınır',
      [
        'Promosyonel destek / avantaj sunulmadı',
        'Şeffaf bilgilendirme ve resmi kanal vurgulandı',
      ],
      ['Etik temsil', 'HIBE sınırı']
    ),
    svc_ambiguous: entry(
      '9. Destek talebi',
      'Destek — yönetime taşıma',
      ['Belirsiz destek vaadi — bölge müdürüne taşındı'],
      ['Etik (belirsiz)'],
      'Belirsiz destek'
    ),
    svc_flexible: entry(
      '9. Destek talebi',
      'Esnek destek vaadi',
      ['Eğitim/kolaylık için «içeride konuşuruz» — KRİTİK UYUM RİSKİ'],
      [],
      'Kritik hibe riski'
    ),
    brief_transparent: entry(
      '10. Servis brifingi',
      'Ekip bilgilendirme — şeffaf',
      [
        'İki bildirim ayrı süreç olarak anlatıldı',
        'Kesin neden-sonuç yorumu yapılmayacak',
      ],
      ['Kriz sonrası güven', 'Farmakovijilans', 'Kalite']
    ),
    brief_short: entry(
      '10. Servis brifingi',
      'Ekip bilgilendirme — kısa',
      ['Süreç detayı yetersiz kaldı'],
      ['Kriz sonrası güven']
    ),
    brief_defensive: entry(
      '10. Servis brifingi',
      'Savunmacı ürün dili',
      ['Ürün savunması — güven onarımı zayıf'],
      [],
      'Savunmacı dil'
    ),
    sms_process: entry(
      '11. Bölge müdürü iletişimi',
      'Murat Bey SMS yanıtı',
      [
        'İki bildirim (FV + kalite) özetlendi',
        'Off-label medikal kanala; destek sınırlandı',
        'Gün sonu raporu olay sınıflandırmasıyla iletilecek',
      ],
      ['Raporlama disiplini']
    ),
    sms_vague: entry(
      '11. Bölge müdürü iletişimi',
      'Murat Bey — belirsiz SMS',
      ['«İyi gidiyor» — rapor detayı eksik'],
      [],
      'Raporlama zayıf'
    ),
    sms_pressure: entry(
      '11. Bölge müdürü iletişimi',
      'Murat Bey — esneklik vurgusu',
      ['İlişki için esnek davranıldığı yazıldı — etik risk'],
      [],
      'Etik risk'
    ),
    mgr_strong: entry(
      '12. Gün sonu değerlendirme',
      'Murat Bey toplantısı',
      ['Süreç ve kanal disiplini savunuldu'],
      ['Profesyonel temsil']
    ),
    mgr_recover: entry(
      '12. Gün sonu değerlendirme',
      'Murat Bey — toparlama planı',
      ['Sınır korunurken kanal açma planı'],
      ['İlişki onarımı']
    ),
    mgr_own_fatal: entry(
      '12. Gün sonu değerlendirme',
      'Fatal uyum — sahiplenme',
      ['Kişisel kanal ve destek hataları kabul edildi; düzeltme planı'],
      ['Uyum iyileştirme']
    ),
    mgr_defend: entry(
      '12. Gün sonu değerlendirme',
      'Savunma — niyet',
      ['Hata minimize edildi — uyum zayıf'],
      [],
      'Uyum zayıf'
    ),
    mgr_commercial: entry(
      '12. Gün sonu değerlendirme',
      'Ticari esneklik',
      ['Hastane stratejisi gerekçesiyle esneklik — etik risk'],
      [],
      'Etik risk'
    ),
  };

  function buildEntry(sceneId, scene, choice, state) {
    var def = ENTRY_BY_CHOICE[choice.id];
    var quote = spoken(choice);
    var at = (scene && scene.time) || nowTime();
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
      section = scene.title || sceneId;
      title = choice.label || choice.id;
      lines = ['Sahne kaydı oluşturuldu.'];
      processes = [];
      risk = null;
    }

    if (quote) {
      lines.push('Saha notu (sözel kayıt): «' + quote + '»');
    }

    return {
      id: sceneId + '_' + choice.id + '_' + state.fieldReport.entries.length,
      at: at,
      sceneId: sceneId,
      choiceId: choice.id,
      section: section,
      title: title,
      lines: lines,
      processes: processes,
      risk: risk,
    };
  }

  function append(report, item) {
    if (!item.id) item.id = 'e' + report.entries.length;
    if (!item.at) item.at = nowTime();
    report.entries.push(item);
    return item;
  }

  function appendOpening(report) {
    var sim = CFG();
    return append(
      report,
      entry(
        '0. Gün başlangıcı',
        'Acil saha bildirimi — ziyaret öncesi',
        [
          '08:42 · Atlas Üniversitesi Hastanesi · Otopark',
          'Saha uygulaması bildirimi alındı',
          'Ürün: ' + (sim && sim.product) + ' · Lot ' + (sim && sim.lot),
          'Bildirim: Ciddi reaksiyon / anafilaktik reaksiyon şüphesi — Onkoloji',
          'Durum: Saha temsilcisi servise yönlendirildi',
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
    var blocks = [];

    blocks.push({
      label: 'Farmakovijilans (ciddi reaksiyon)',
      value: state.history.some(function (h) {
        return h.choice === 'crisis_own' || h.choice === 'lot_record';
      })
        ? 'Bildirim süreci saha notlarında'
        : f.roleOverreach
          ? 'Rol aşımı kaydı mevcut'
          : 'Eksik veya gecikmeli risk',
      ok: !f.earlyDefensive && !f.roleOverreach,
    });

    blocks.push({
      label: 'Kalite / flakon şüphesi',
      value: f.particleRisk || f.fatalParticleUse
        ? 'Kritik uyum uyarısı işlendi'
        : f.particleUnclear
          ? 'Belirsiz flakon mesajı'
          : 'Ayrıştırma ve kalite bildirimi net',
      ok: !f.particleRisk && !f.fatalParticleUse,
    });

    blocks.push({
      label: 'Off-label / kanal',
      value: f.offLabelClean
        ? 'Medikal bilgi talebi resmi kanala'
        : f.offLabelRisk
          ? 'Kaynak paylaşım riski'
          : f.offLabelCold
            ? 'Soğuk red — ilişki riski'
            : 'Standart',
      ok: f.offLabelClean && !f.offLabelRisk,
    });

    blocks.push({
      label: 'Hibe / destek sınırı',
      value: f.supportRisk || f.fatalSupportPromise
        ? 'Uygunsuz destek vaadi'
        : f.supportAmbiguity
          ? 'Belirsiz destek'
          : 'Net etik sınır',
      ok: !f.supportRisk && !f.fatalSupportPromise,
    });

    return blocks;
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
      '" data-entry="' +
      esc(e.id) +
      '">';
    html += '<header class="ip-fr-entry__head">';
    html += '<span class="ip-fr-entry__time">' + esc(e.at) + '</span>';
    html += '<span class="ip-fr-entry__section">' + esc(e.section) + '</span>';
    html += '</header>';
    html += '<h4 class="ip-fr-entry__title">' + esc(e.title) + '</h4>';
    html += '<ul class="ip-fr-entry__lines">';
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
    html += '</article>';
    return html;
  }

  function renderDock(report, flashId) {
    if (!report.entries.length) return '';

    var latest = report.entries[report.entries.length - 1];
    var html =
      '<div class="ip-fr-dock' +
      (flashId ? ' ip-fr-dock--flash' : '') +
      '" id="ipFrDock">' +
      '<button type="button" class="ip-fr-dock__toggle" id="ipFrToggle" aria-expanded="false">' +
      '<i class="fas fa-file-medical"></i> ' +
      '<span>Saha raporu</span>' +
      '<em>' +
      report.entries.length +
      ' kayıt</em></button>' +
      '<div class="ip-fr-dock__panel" id="ipFrPanel" hidden>' +
      '<p class="ip-fr-dock__latest-label">Son eklenen</p>';

    html += renderEntryHtml(latest, flashId === latest.id);

    if (report.entries.length > 1) {
      html +=
        '<p class="ip-fr-dock__more">+' +
        (report.entries.length - 1) +
        ' önceki kayıt gün sonu belgesinde</p>';
    }
    html += '</div></div>';
    return html;
  }

  function renderFullDocument(report, state) {
    var sim = CFG();
    var dateStr = new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    var summary = classifySummary(state);

    var html = '<div class="ip-fr-doc" id="ipFieldReportDoc">';
    html += '<header class="ip-fr-doc__letterhead">';
    html += '<div class="ip-fr-doc__logo">Saha raporu</div>';
    html += '<div class="ip-fr-doc__meta">';
    html += '<h2>Gün Sonu Saha Raporu</h2>';
    html += '<dl>';
    html += '<div><dt>Rapor no</dt><dd>' + esc(report.reportNo) + '</dd></div>';
    html += '<div><dt>Tarih</dt><dd>' + esc(dateStr) + '</dd></div>';
    html += '<div><dt>Hastane</dt><dd>Atlas Üniversitesi Hastanesi · Onkoloji</dd></div>';
    html += '<div><dt>Ürün / Lot</dt><dd>' + esc(sim.product) + ' · ' + esc(sim.lot) + '</dd></div>';
    html += '<div><dt>Temsilci</dt><dd>Saha temsilcisi (demo)</dd></div>';
    html += '</dl></div></header>';

    html += '<section class="ip-fr-doc__exec"><h3>Özet</h3><p>';
    html +=
      'Gün boyunca alınan saha kararları aşağıdaki kayıtlara işlenmiştir. Bu belge simülasyon sırasında otomatik oluşturulmuştur; gerçek farmakovijilans veya kalite bildirimi yerine geçmez.';
    html += '</p></section>';

    html += '<section class="ip-fr-doc__summary"><h3>Uyum özeti (otomatik)</h3><div class="ip-fr-summary-grid">';
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
    html += '</div></section>';

    html += '<section class="ip-fr-doc__body"><h3>Olay ve aksiyon kayıtları</h3>';
    report.entries.forEach(function (e) {
      html += renderEntryHtml(e, false);
    });
    html += '</section>';

    if (state.fatalErrors && state.fatalErrors.length) {
      html += '<section class="ip-fr-doc__fatal"><h3>Kritik uyum uyarıları</h3><ul>';
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

    html +=
      '<footer class="ip-fr-doc__foot"><p>Bu rapor saha uygulaması simülasyon çıktısıdır · Eğitim amaçlı kurgu</p></footer>';
    html += '</div>';
    return html;
  }

  function renderFinalScene(report, state) {
    var html = '<div class="ip-fr-final">';
    html +=
      '<p class="ip-fr-final__lead"><i class="fas fa-tablet-screen-button"></i> Gün boyunca verdiğiniz her yanıt saha raporuna işlendi. Belgeyi kontrol edip onaylayın.</p>';
    html += renderFullDocument(report, state);
    html +=
      '<div class="ip-fr-final__actions">' +
      '<button type="button" class="ip-scene-action__btn" id="ipReportConfirm">Raporu onayla ve Murat Bey\'e gönder</button>' +
      '<button type="button" class="ip-btn ip-btn--ghost" id="ipPrintReport"><i class="fas fa-print"></i> Yazdır / PDF</button>' +
      '</div></div>';
    return html;
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
