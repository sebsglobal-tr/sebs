import { DIMENSION_ORDER, DIMENSION_LABELS, MODEL_INPUT_MODE } from './constants.js';

export function escapeHtml(text) {
  if (text == null || text === '') return '';
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = String(text);
    return div.innerHTML;
  }
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @typedef {'low'|'mid'|'high'} ScoreBand */

/** @type {Record<string, { icon: string, color: string, hex: string, tagline: string }>} */
const DIMENSION_META = {
  openness: {
    icon: 'fa-lightbulb',
    color: 'text-violet-700',
    hex: '#7c3aed',
    tagline: 'Yeni fikirler, keşif ve yaratıcı öğrenme',
  },
  conscientiousness: {
    icon: 'fa-list-check',
    color: 'text-blue-700',
    hex: '#2563eb',
    tagline: 'Plan, düzen ve sürdürülebilir ilerleme',
  },
  extraversion: {
    icon: 'fa-users',
    color: 'text-amber-700',
    hex: '#d97706',
    tagline: 'Sosyal etkileşim ve paylaşımlı öğrenme',
  },
  agreeableness: {
    icon: 'fa-handshake',
    color: 'text-emerald-700',
    hex: '#059669',
    tagline: 'İşbirliği, empati ve ekip uyumu',
  },
  emotional_sensitivity: {
    icon: 'fa-heart-pulse',
    color: 'text-rose-700',
    hex: '#e11d48',
    tagline: 'Duygusal tempo, baskı ve geri bildirim ihtiyacı',
  },
};

/**
 * @param {number} pct
 * @returns {ScoreBand}
 */
function scoreBand(pct) {
  if (pct <= 42) return 'low';
  if (pct >= 58) return 'high';
  return 'mid';
}

/**
 * @param {ScoreBand} band
 */
function bandLabel(band) {
  if (band === 'low') return 'Gelişime açık';
  if (band === 'high') return 'Belirgin güçlü';
  return 'Dengeli';
}

/**
 * @param {ScoreBand} band
 */
function bandBadgeClass(band) {
  if (band === 'low') return 'bf-band bf-band--low';
  if (band === 'high') return 'bf-band bf-band--high';
  return 'bf-band bf-band--mid';
}

/**
 * @param {string} dim
 * @param {number} pct
 */
function dimensionLearningLine(dim, pct) {
  const high = pct >= 58;
  const low = pct <= 42;
  if (dim === 'openness') {
    if (high) return 'Keşif, proje ve yeni fikirler üzerinden öğrenme sana daha uygun olabilir.';
    if (low) return 'Net yönergeler, örnekler ve adım adım anlatım senin için daha konforlu olabilir.';
    return 'Hem yapılandırılmış içerik hem de ara sıra keşif projeleri dengeli şekilde işine yarayabilir.';
  }
  if (dim === 'conscientiousness') {
    if (high) return 'Planlı modül takibi, hedef listeleri ve düzenli ilerleme sende iyi çalışabilir.';
    if (low) return 'Mikro görevler, kısa hedefler ve dış takip desteği öğrenme sürecini kolaylaştırabilir.';
    return 'Esnek takvimle birlikte küçük taahhütlerle ilerlemek senin için sürdürülebilir olabilir.';
  }
  if (dim === 'extraversion') {
    if (high) return 'Topluluk, mentörlük, grup çalışması ve sunum temelli öğrenme seni motive edebilir.';
    if (low) return 'Bireysel çalışma, kendi hızında ilerleme ve gerektiğinde mentör desteği daha uygun olabilir.';
    return 'Küçük grup oturumları ve yalnız derin çalışma bloklarını birlikte kullanmak dengeli olabilir.';
  }
  if (dim === 'agreeableness') {
    if (high) return 'Ekip çalışması, destekleyici ortam ve işbirliği odaklı projeler sana uygun olabilir.';
    if (low) return 'Bağımsız karar alanı ve net sorumluluklar daha rahat çalışmanı sağlayabilir.';
    return 'Net rol paylaşımı olan ekiplerde çalışmak hem işbirliği hem otonomi ihtiyacını karşılayabilir.';
  }
  if (dim === 'emotional_sensitivity') {
    if (high)
      return 'Yoğun baskı yerine küçük adımlar, net beklentiler ve sakin geri bildirimlerle ilerlemek daha iyi olabilir.';
    if (low) return 'Zorlu görevleri daha rahat tolere edebilirsin; proje ve simülasyon bazlı ilerleme sana uygun olabilir.';
    return 'Tempolu modüller arasında kısa molalar ve net kriterlerle ilerlemek verimli olabilir.';
  }
  return '';
}

/**
 * @param {string} dim
 * @param {number} pct
 */
function dimensionDetailParagraphs(dim, pct) {
  const band = scoreBand(pct);
  const label = DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (dim)] || dim;
  const tip = dimensionLearningLine(dim, pct);

  const intro =
    band === 'high'
      ? `${label} boyutunda skorun %${pct} ile profilinde belirgin şekilde öne çıkıyor. Bu, öğrenme ve çalışma tarzında bu alanın sık sık rehberlik ettiğini gösterir.`
      : band === 'low'
        ? `${label} boyutunda skorun %${pct} ile diğer alanlara kıyasla daha az baskın. Bu bir eksiklik değil; farklı ortamlarda farklı güçlü yönlerin öne çıkması doğaldır.`
        : `${label} boyutunda skorun %${pct} ile orta bantta. Hem yapılandırılmış hem esnek yaklaşımları bağlama göre kullanabilirsin.`;

  const practice =
    band === 'high'
      ? 'Bu gücü korurken aşırıya kaçmamak için çeşitlilik eklemek faydalıdır: farklı modül türleri, kısa simülasyonlar veya farklı tempo ile ilerleyen haftalar denge sağlar.'
      : band === 'low'
        ? 'Bu alanda küçük, ölçülebilir hedefler koymak (örneğin haftalık tek bir tamamlama taahhüdü) motivasyonu artırır; büyük ve belirsiz hedefler yerine net adımlar tercih et.'
        : 'İhtiyacına göre bu boyutu bazen güçlendirmek bazen de diğer güçlü alanlarına yaslanmak en verimli strateji olabilir.';

  return [intro, tip, practice];
}

/**
 * @param {Record<string, { percentage: number }>} classicalScores
 * @param {{ key: string, pct: number }[]} topTwo
 * @param {{ key: string, pct: number }[]} lowDims
 * @param {string} learningMode
 */
function buildExecutiveNarrative(classicalScores, topTwo, lowDims, learningMode) {
  const avg =
    DIMENSION_ORDER.reduce((s, d) => s + classicalScores[d].percentage, 0) / DIMENSION_ORDER.length;
  const top = topTwo[0];
  const second = topTwo[1];
  const low = lowDims[0];
  const topName = top ? DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (top.key)] : '—';
  const secondName = second ? DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (second.key)] : '';
  const lowName = low ? DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (low.key)] : '—';

  const p1 = `Verdiğin 50 cevaba göre beş boyutlu öğrenme profilin oluşturuldu. Profil ortalaman yaklaşık %${Math.round(avg)}; en belirgin güçlü alanın <strong>${escapeHtml(topName)}</strong> (%${top?.pct ?? '—'})${
    second && top && top.pct - second.pct < 12
      ? `; <strong>${escapeHtml(secondName)}</strong> (%${second.pct}) de yakın düzeyde öne çıkıyor.`
      : '.'
  } Bu rapor kişilik tanısı değil; SEBS içinde sana daha uygun tempo, içerik ve çalışma biçimi önerileri sunar.`;

  const p2 = `Önerilen öğrenme modun: <strong>${escapeHtml(learningMode)}</strong>. Günlük çalışmada önce güçlü olduğun alanlardan (${escapeHtml(topName)}${
    secondName ? ', ' + escapeHtml(secondName) : ''
  }) ritim alıp, ${escapeHtml(lowName)} boyutunda ise küçük ve net hedeflerle destek alman sürdürülebilir ilerleme sağlar.`;

  const p3 =
    'Aşağıdaki radar grafiği ve skor tablosu tüm boyutları bir arada gösterir. Her boyut için ayrıntılı yorum ve kişiselleştirilmiş tavsiyeler “Boyut analizi” bölümünde yer alır. Raporu PDF olarak indirebilir veya yazdırarak arşivleyebilirsin.';

  return [p1, p2, p3];
}

/**
 * @param {Record<string, { percentage: number }>} classicalScores
 */
function buildPersonalizedActions(classicalScores, topTwo, learningMode) {
  const actions = [];
  const topKey = topTwo[0]?.key;
  if (topKey === 'openness' || topKey === 'conscientiousness') {
    actions.push('Haftalık bir “keşif” modülü ile bir “tamamlama” modülünü çift olarak planla; hem yenilik hem ilerleme hissi korunur.');
  } else if (topKey === 'extraversion') {
    actions.push('Topluluk veya mentör oturumlarını takvime sabitle; sosyal öğrenme motivasyonunu düzenli hale getirir.');
  } else if (topKey === 'agreeableness') {
    actions.push('Ekip veya eşli laboratuvar görevlerinde net rol tanımı kullan; işbirliği gücünü verimliliğe dönüştürür.');
  } else {
    actions.push('Simülasyon ve proje tabanlı modüllerde ilerlemeyi küçük kilometre taşlarına böl; baskıyı yönetilebilir tutar.');
  }

  const low = pickLowDimensions(classicalScores, 1)[0];
  if (low) {
    const ln = DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (low.key)];
    actions.push(
      `${ln} alanında haftada bir kısa öz-değerlendirme yap: “Bu hafta hangi tek adımı tamamladım?” sorusu yeterlidir.`
    );
  }

  actions.push(`SEBS panelinde öğrenme modunu hatırla: ${learningMode}. Modül sırasını buna göre özelleştir.`);
  actions.push('Her 4–6 haftada testi tekrarlayarak değişimi gözlemle; eğilimler zamanla gelişebilir.');

  return actions.slice(0, 5);
}

/**
 * @param {Record<string, { percentage: number }>} classicalScores
 */
function buildSebsTips(classicalScores, topTwo, learningMode) {
  const tips = [
    'Modüllerde önce özet videoları izleyip ardından laboratuvar veya simülasyon adımlarına geçmek akışını netleştirir.',
    'İlerlemeyi panelinden takip et; seri gün hedeflerini küçük tutarak sürdürülebilir ritim kurabilirsin.',
  ];
  const top = topTwo[0]?.key;
  if (top === 'conscientiousness') {
    tips.push('Modül takvimini haftalık bloklara böl; tamamlanan her modül için kısa bir not düşmek motivasyonu artırır.');
  }
  if (top === 'openness') {
    tips.push('İlgi alanına yakın isteğe bağlı modülleri ana yolun yanına ekleyerek keşif alanını canlı tut.');
  }
  if (classicalScores.emotional_sensitivity?.percentage >= 58) {
    tips.push('Yoğun simülasyon haftalarında molalar ve net başarı kriterleri belirle; geri bildirimi yapıcı ve somut tut.');
  }
  tips.push(`Önerilen öğrenme modu: ${learningMode}`);
  return tips;
}

/**
 * @param {Record<string, { percentage: number }>} classicalScores
 */
function buildRadarSvg(classicalScores) {
  const cx = 130;
  const cy = 130;
  const maxR = 88;
  const angles = DIMENSION_ORDER.map((_, i) => -Math.PI / 2 + (2 * Math.PI * i) / 5);

  function polar(r, i) {
    return [cx + r * Math.cos(angles[i]), cy + r * Math.sin(angles[i])];
  }

  let grid = '';
  [0.25, 0.5, 0.75, 1].forEach((scale) => {
    const pts = DIMENSION_ORDER.map((_, i) => {
      const [x, y] = polar(maxR * scale, i);
      return `${x},${y}`;
    }).join(' ');
    grid += `<polygon points="${pts}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`;
  });

  let axes = '';
  DIMENSION_ORDER.forEach((_, i) => {
    const [x, y] = polar(maxR, i);
    axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#cbd5e1" stroke-width="1"/>`;
  });

  const dataPts = DIMENSION_ORDER.map((d, i) => {
    const pct = classicalScores[d].percentage / 100;
    const [x, y] = polar(maxR * pct, i);
    return `${x},${y}`;
  }).join(' ');

  let labels = '';
  DIMENSION_ORDER.forEach((d, i) => {
    const [x, y] = polar(maxR + 22, i);
    const short = (DIMENSION_LABELS[d] || d).split('/')[0].trim();
    const anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
    labels += `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="bf-radar-label">${escapeHtml(short)}</text>`;
  });

  return `
    <svg class="bf-radar-svg" viewBox="0 0 260 260" width="260" height="260" role="img" aria-label="Beş boyut radar grafiği">
      ${grid}
      ${axes}
      <polygon points="${dataPts}" fill="url(#bfRadarGrad)" fill-opacity="0.35" stroke="#4f46e5" stroke-width="2"/>
      <defs>
        <linearGradient id="bfRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#2563eb"/>
        </linearGradient>
      </defs>
      ${DIMENSION_ORDER.map((d, i) => {
        const pct = classicalScores[d].percentage / 100;
        const [x, y] = polar(maxR * pct, i);
        const col = DIMENSION_META[d]?.hex || '#4f46e5';
        return `<circle cx="${x}" cy="${y}" r="4" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
      }).join('')}
      ${labels}
    </svg>`;
}

/**
 * @param {Record<string, { raw: number, percentage: number }>} classicalScores
 */
export function pickTopDimensions(classicalScores, n = 2) {
  return DIMENSION_ORDER.map((d) => ({ key: d, pct: classicalScores[d].percentage }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, n);
}

/**
 * @param {Record<string, { raw: number, percentage: number }>} classicalScores
 */
export function pickLowDimensions(classicalScores, n = 2) {
  return DIMENSION_ORDER.map((d) => ({ key: d, pct: classicalScores[d].percentage }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, n);
}

/**
 * @param {{ key: string, pct: number }[]} topTwo
 */
export function buildLearningModeLabel(topTwo) {
  const [a, b] = topTwo;
  if (!a) return 'Dengeli modül ve simülasyon karışımı';
  const la = DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (a.key)] || a.key;
  if (!b || a.pct - b.pct < 8) {
    return `${la} ağırlıklı çok boyutlu öğrenme`;
  }
  const lb = DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (b.key)] || b.key;
  return `${la} + ${lb} dengeli yol`;
}

/**
 * @param {Record<string, { percentage: number }>} classicalScores
 * @param {number[]|null} modelOutput
 * @param {string|null} modelError
 * @param {{ key: string, pct: number }[]} topTwo
 * @param {{ key: string, pct: number }[]} lowDims
 * @param {string} learningMode
 * @param {string} [reportDate]
 */
export function buildReportHtml(
  classicalScores,
  modelOutput,
  modelError,
  topTwo,
  lowDims,
  learningMode,
  reportDate = new Date().toISOString()
) {
  const dateStr = reportDate.slice(0, 10);
  const avg = Math.round(
    DIMENSION_ORDER.reduce((s, d) => s + classicalScores[d].percentage, 0) / DIMENSION_ORDER.length
  );
  const top = topTwo[0];
  const narrative = buildExecutiveNarrative(classicalScores, topTwo, lowDims, learningMode);
  const actions = buildPersonalizedActions(classicalScores, topTwo, learningMode);
  const sebsTips = buildSebsTips(classicalScores, topTwo, learningMode);
  const radar = buildRadarSvg(classicalScores);

  const statCards = `
    <div class="bf-stat-card accent">
      <p class="bf-stat-label">Öne çıkan boyut</p>
      <p class="bf-stat-value">${escapeHtml(top ? DIMENSION_LABELS[/** @type {keyof typeof DIMENSION_LABELS} */ (top.key)] : '—')}</p>
      <p class="mt-1 text-xs font-bold text-indigo-600 tabular-nums">${top ? '%' + top.pct : ''}</p>
    </div>
    <div class="bf-stat-card">
      <p class="bf-stat-label">Profil ortalaması</p>
      <p class="bf-stat-value tabular-nums">%${avg}</p>
    </div>
    <div class="bf-stat-card">
      <p class="bf-stat-label">Öğrenme modu</p>
      <p class="bf-stat-value text-base leading-snug">${escapeHtml(learningMode)}</p>
    </div>
    <div class="bf-stat-card">
      <p class="bf-stat-label">Rapor tarihi</p>
      <p class="bf-stat-value tabular-nums">${escapeHtml(dateStr)}</p>
    </div>`;

  const tableRows = DIMENSION_ORDER.map((d) => {
    const p = classicalScores[d].percentage;
    const band = scoreBand(p);
    const meta = DIMENSION_META[d];
    let modelCell = '—';
    if (modelOutput && modelOutput.length === 5) {
      const idx = DIMENSION_ORDER.indexOf(d);
      modelCell = `%${(modelOutput[idx] * 100).toFixed(1)}`;
    }
    return `<tr>
      <td>
        <span class="inline-flex items-center gap-2 font-semibold text-slate-800">
          <i class="fas ${meta?.icon || 'fa-circle'} text-indigo-500" aria-hidden="true"></i>
          ${escapeHtml(DIMENSION_LABELS[d])}
        </span>
      </td>
      <td class="tabular-nums font-bold text-indigo-700">%${p}</td>
      <td><span class="${bandBadgeClass(band)}">${bandLabel(band)}</span></td>
      <td class="tabular-nums text-slate-500 text-xs">${modelCell}</td>
      <td class="w-36">
        <div class="bf-mini-bar"><div class="bf-mini-bar-fill" style="width:${p}%;background:${meta?.hex || '#4f46e5'}"></div></div>
      </td>
    </tr>`;
  }).join('');

  const dimDetails = DIMENSION_ORDER.map((d) => {
    const p = classicalScores[d].percentage;
    const band = scoreBand(p);
    const meta = DIMENSION_META[d];
    const paras = dimensionDetailParagraphs(d, p);
    const isTop = topTwo.some((t) => t.key === d);
    return `
      <article class="bf-dim-detail ${isTop ? 'ring-2 ring-indigo-200' : ''}" id="bf-dim-${d}">
        <header class="bf-dim-detail-header">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <i class="fas ${meta?.icon || 'fa-chart-bar'}" aria-hidden="true"></i>
            </span>
            <div>
              <h3 class="text-base font-bold text-slate-900">${escapeHtml(DIMENSION_LABELS[d])}</h3>
              <p class="text-xs text-slate-500">${escapeHtml(meta?.tagline || '')}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl font-extrabold tabular-nums text-indigo-700">%${p}</span>
            <span class="${bandBadgeClass(band)}">${bandLabel(band)}</span>
          </div>
        </header>
        <div class="bf-dim-detail-body text-sm leading-relaxed text-slate-600">
          ${paras.map((para) => `<p>${escapeHtml(para)}</p>`).join('')}
        </div>
      </article>`;
  }).join('');

  const strengths = topTwo
    .map(
      (x) =>
        `<li class="flex gap-2"><i class="fas fa-star mt-1 text-emerald-500 text-xs" aria-hidden="true"></i><span><strong>${escapeHtml(DIMENSION_LABELS[x.key])}</strong> — %${x.pct} skoru ile öğrenme tarzında doğal bir avantajın var; bu alanı bilinçli kullanmak verimliliği artırır.</span></li>`
    )
    .join('');

  const growth = lowDims
    .map(
      (x) =>
        `<li class="flex gap-2"><i class="fas fa-seedling mt-1 text-amber-600 text-xs" aria-hidden="true"></i><span><strong>${escapeHtml(DIMENSION_LABELS[x.key])}</strong> (%${x.pct}) — küçük adımlar, net hedefler ve düzenli tekrar bu alanda en etkili gelişim stratejisidir.</span></li>`
    )
    .join('');

  const actionCards = actions
    .map(
      (a, i) => `
      <div class="bf-action-card flex gap-3">
        <span class="bf-action-num">${i + 1}</span>
        <p class="text-sm leading-relaxed text-slate-700">${escapeHtml(a)}</p>
      </div>`
    )
    .join('');

  let modelBlock = '';
  if (modelOutput && modelOutput.length === 5) {
    const modeLabel =
      MODEL_INPUT_MODE === 'normalized_0_1'
        ? 'Likert cevapları 0–1 aralığına normalize edilerek modele verildi ((cevap−1)/4).'
        : 'Likert cevapları 1–5 aralığında doğrudan modele verildi.';
    const rows = DIMENSION_ORDER.map((d, i) => {
      const v = modelOutput[i];
      return `<tr>
        <td class="py-2 text-slate-700">${escapeHtml(DIMENSION_LABELS[d])}</td>
        <td class="py-2 text-right font-mono text-xs text-slate-700">%${(v * 100).toFixed(2)} <span class="text-slate-400">(${v.toFixed(4)})</span></td>
      </tr>`;
    }).join('');
    modelBlock = `
      <details class="bf-tech-details rounded-xl border border-slate-200 bg-slate-50/80 p-5">
        <summary><i class="fas fa-microchip mr-2 text-slate-500" aria-hidden="true"></i>Teknik ek: yapay sinir ağı çıktısı</summary>
        <p class="text-sm text-slate-600">Softmax olasılık benzeri yoğunluk; klinik anlam taşımaz. Ana yorum için klasik yüzdeleri kullanın.</p>
        <p class="mt-2 text-xs text-slate-500">${escapeHtml(modeLabel)}</p>
        <table class="bf-score-table mt-3">${rows}</table>
      </details>`;
  } else if (modelError) {
    modelBlock = `
      <details class="bf-tech-details rounded-xl border border-amber-200 bg-amber-50 p-4">
        <summary class="text-amber-900">Model çıktısı alınamadı</summary>
        <p class="mt-2 text-sm text-amber-900">${escapeHtml(modelError)} Klasik puanlama ile rapor tamamlandı.</p>
      </details>`;
  }

  return `
    <div id="bf-report-document" class="bf-report space-y-8">
      <header class="bf-report-cover">
        <div class="bf-report-cover-inner">
          <p class="bf-report-badge"><i class="fas fa-file-lines" aria-hidden="true"></i> Kişisel öğrenme raporu</p>
          <h1 class="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Big Five Öğrenme Profili</h1>
          <p class="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
            Cevaplarına göre hazırlanan detaylı farkındalık raporu · ${escapeHtml(dateStr)}
          </p>
          <p class="mt-3 text-sm font-semibold text-indigo-200">
            <i class="fas fa-graduation-cap mr-1" aria-hidden="true"></i>
            ${escapeHtml(learningMode)}
          </p>
        </div>
      </header>

      <div class="bf-report-actions bf-no-print">
        <button type="button" id="btnDownloadPdf" class="bf-btn-primary">
          <i class="fas fa-file-pdf" aria-hidden="true"></i> PDF indir
        </button>
        <button type="button" id="btnPrintReport" class="bf-btn-secondary">
          <i class="fas fa-print" aria-hidden="true"></i> Yazdır
        </button>
        <a href="#bf-section-summary" class="bf-btn-secondary" style="text-decoration:none">
          <i class="fas fa-arrow-down" aria-hidden="true"></i> Detaya in
        </a>
      </div>

      <nav class="bf-report-nav bf-no-print" aria-label="Rapor bölümleri">
        <a href="#bf-section-summary">Özet</a>
        <a href="#bf-section-chart">Grafik & tablo</a>
        <a href="#bf-section-dimensions">Boyut analizi</a>
        <a href="#bf-section-advice">Tavsiyeler</a>
        <a href="#bf-section-sebs">SEBS</a>
      </nav>

      <section id="bf-section-summary">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${statCards}</div>
        <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <h2 class="text-xl font-bold text-slate-900">Yönetici özeti</h2>
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            ${narrative.map((p) => `<p>${p}</p>`).join('')}
          </div>
        </div>
      </section>

      <section id="bf-section-chart" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h2 class="text-xl font-bold text-slate-900">Görsel profil</h2>
        <p class="mt-2 text-sm text-slate-600">Radar grafiği beş boyutu aynı ölçekte karşılaştırır; tablo klasik skorları ve varsa model çıktısını özetler.</p>
        <div class="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div class="bf-radar-wrap rounded-xl border border-slate-100 bg-slate-50/50 p-4">${radar}</div>
          <div class="overflow-x-auto">
            <table class="bf-score-table">
              <thead>
                <tr>
                  <th>Boyut</th>
                  <th>Skor</th>
                  <th>Düzey</th>
                  <th>Model</th>
                  <th>Görsel</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="bf-section-dimensions">
        <h2 class="mb-4 text-xl font-bold text-slate-900">Boyut analizi</h2>
        <p class="mb-6 text-sm text-slate-600">Her boyut için skor yorumu, öğrenme tarzı tavsiyesi ve uygulanabilir öneriler.</p>
        <div class="space-y-4">${dimDetails}</div>
      </section>

      <section id="bf-section-advice" class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-6">
          <h3 class="flex items-center gap-2 text-lg font-bold text-emerald-950">
            <i class="fas fa-trophy text-emerald-600" aria-hidden="true"></i> Güçlü yönlerin
          </h3>
          <ul class="mt-4 space-y-3 text-sm text-emerald-900">${strengths}</ul>
        </div>
        <div class="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-6">
          <h3 class="flex items-center gap-2 text-lg font-bold text-amber-950">
            <i class="fas fa-chart-line text-amber-600" aria-hidden="true"></i> Gelişim alanların
          </h3>
          <ul class="mt-4 space-y-3 text-sm text-amber-900">${growth}</ul>
        </div>
      </section>

      <section>
        <h2 class="mb-4 text-xl font-bold text-slate-900">Kişisel eylem planı</h2>
        <div class="grid gap-3 sm:grid-cols-2">${actionCards}</div>
      </section>

      <section id="bf-section-sebs" class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-card sm:p-8">
        <h3 class="flex items-center gap-2 text-lg font-bold">
          <i class="fas fa-route text-blue-300" aria-hidden="true"></i> SEBS öğrenme önerileri
        </h3>
        <ul class="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
          ${sebsTips.map((t) => `<li class="flex gap-2"><i class="fas fa-check mt-1 text-emerald-400 text-xs" aria-hidden="true"></i><span>${escapeHtml(t)}</span></li>`).join('')}
        </ul>
      </section>

      ${modelBlock}

      <section class="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p class="font-semibold text-slate-800"><i class="fas fa-circle-info mr-1 text-slate-500" aria-hidden="true"></i> Önemli uyarı</p>
        <p class="mt-2 leading-relaxed">
          Bu sonuç klinik bir tanı veya psikolojik değerlendirme değildir. Verdiğin cevaplara göre öğrenme ve çalışma eğilimlerini yorumlayan bir farkındalık raporudur. Profesyonel destek gerektiğinde uzmanlara başvurmalısın.
        </p>
      </section>
    </div>
  `;
}

export function buildPlainReportText(classicalScores, modelOutput, modelError, topTwo, lowDims, learningMode) {
  const lines = [];
  lines.push('Big Five — Öğrenme ve Çalışma Eğilimi Detaylı Rapor');
  lines.push('Tarih: ' + new Date().toISOString().slice(0, 10));
  lines.push('');
  const narrative = buildExecutiveNarrative(classicalScores, topTwo, lowDims, learningMode);
  narrative.forEach((p) => lines.push(p.replace(/<[^>]+>/g, '')));
  lines.push('');
  lines.push('Boyut skorları:');
  DIMENSION_ORDER.forEach((d) => {
    lines.push(`- ${DIMENSION_LABELS[d]}: %${classicalScores[d].percentage} (${bandLabel(scoreBand(classicalScores[d].percentage))})`);
    dimensionDetailParagraphs(d, classicalScores[d].percentage).forEach((para) => lines.push('  ' + para));
  });
  lines.push('');
  lines.push('Eylem planı:');
  buildPersonalizedActions(classicalScores, topTwo, learningMode).forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  lines.push('');
  lines.push(`Önerilen öğrenme modu: ${learningMode}`);
  if (modelOutput && modelOutput.length === 5) {
    lines.push('');
    lines.push('Model çıktısı:');
    lines.push(modelOutput.map((v, i) => `${DIMENSION_ORDER[i]}: ${(v * 100).toFixed(2)}%`).join(', '));
  } else if (modelError) {
    lines.push('Model: ' + modelError);
  }
  lines.push('');
  lines.push(
    'Bu sonuç klinik bir tanı değildir. Cevaplarına göre öğrenme ve çalışma eğilimlerini yorumlayan bir farkındalık raporudur.'
  );
  return lines.join('\n');
}

/**
 * Rapor butonları ve kaydırma davranışı.
 */
export function bindReportInteractions(onDownload, onPrint) {
  const dl = document.getElementById('btnDownloadPdf');
  const pr = document.getElementById('btnPrintReport');
  if (dl) dl.onclick = onDownload;
  if (pr) pr.onclick = onPrint;
}
