import { DIMENSION_ORDER, DIMENSION_LABELS } from './constants.js';

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
    if (high) return 'Yoğun baskı yerine küçük adımlar, net beklentiler ve sakin geri bildirimlerle ilerlemek daha iyi olabilir.';
    if (low) return 'Zorlu görevleri daha rahat tolere edebilirsin; proje ve simülasyon bazlı ilerleme sana uygun olabilir.';
    return 'Tempolu modüller arasında kısa molalar ve net kriterlerle ilerlemek verimli olabilir.';
  }
  return '';
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
 * @param {Record<string, { percentage: number }>} classicalScores
 */
export function buildLearningModeLabel(topTwo, classicalScores) {
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
 * @param {number[]} modelOutput
 * @param {Record<string, { percentage: number }>} classicalScores
 */
export function buildPlainReportText(classicalScores, modelOutput, modelError, topTwo, lowDims, learningMode) {
  const lines = [];
  lines.push('Big Five — öğrenme ve çalışma eğilimi özeti (cevaplarına göre)');
  lines.push('');
  lines.push('Boyut yüzdeleri (klasik puanlama):');
  DIMENSION_ORDER.forEach((d) => {
    lines.push(`- ${DIMENSION_LABELS[d]}: %${classicalScores[d].percentage}`);
  });
  lines.push('');
  lines.push(`Öne çıkan güçlü alanlar: ${topTwo.map((x) => DIMENSION_LABELS[x.key] + ' (%' + x.pct + ')').join(', ')}`);
  lines.push(`Gelişim için dikkat çeken alanlar: ${lowDims.map((x) => DIMENSION_LABELS[x.key] + ' (%' + x.pct + ')').join(', ')}`);
  lines.push('');
  lines.push(`Önerilen öğrenme modu: ${learningMode}`);
  lines.push('');
  if (modelOutput && modelOutput.length === 5) {
    lines.push('Model çıktısı (ek bağlam — olasılık dağılımı):');
    lines.push(modelOutput.map((v, i) => `${DIMENSION_ORDER[i]}: ${(v * 100).toFixed(1)}%`).join(', '));
  } else if (modelError) {
    lines.push('Model çıktısı alınamadı: ' + modelError);
  }
  lines.push('');
  lines.push(
    'Bu sonuç klinik bir tanı değildir. Cevaplarına göre öğrenme ve çalışma eğilimlerini yorumlayan bir farkındalık raporudur.'
  );
  return lines.join('\n');
}

/**
 * @param {Record<string, { raw: number, percentage: number }>} classicalScores
 * @param {number[]|null} modelOutput
 * @param {string|null} modelError
 */
export function buildReportHtml(classicalScores, modelOutput, modelError, topTwo, lowDims, learningMode) {
  const summaryParts = [
    'Cevaplarına göre beş boyutta öğrenme ve çalışma eğilimlerin <strong>öne çıkan</strong> yönleri ile birlikte yorumlandı.',
    'Bu rapor kesin hüküm vermez; SEBS içinde sana daha uygun içerik ve tempo önerileri sunmayı amaçlar.',
  ];

  let bars = '';
  DIMENSION_ORDER.forEach((d) => {
    const p = classicalScores[d].percentage;
    const isTop = topTwo.some((t) => t.key === d);
    const ring = isTop ? 'ring-2 ring-blue-400/50' : '';
    bars += `
      <div class="bf-dim-row rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ${ring}">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm font-semibold text-slate-900">${escapeHtml(DIMENSION_LABELS[d])}</span>
          <span class="text-sm font-bold tabular-nums text-blue-700">${p}%</span>
        </div>
        <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div class="bf-progress-bar h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all" style="width:${p}%"></div>
        </div>
        <p class="mt-2 text-xs leading-relaxed text-slate-600">${escapeHtml(dimensionLearningLine(d, p))}</p>
      </div>`;
  });

  const strengths = topTwo
    .map((x) => `<li><strong>${escapeHtml(DIMENSION_LABELS[x.key])}</strong> (%${x.pct})</li>`)
    .join('');
  const growth = lowDims
    .map((x) => `<li><strong>${escapeHtml(DIMENSION_LABELS[x.key])}</strong> (%${x.pct}) — bu alanda küçük adımlar ve net hedefler faydalı olabilir.</li>`)
    .join('');

  let modelBlock = '';
  if (modelOutput && modelOutput.length === 5) {
    const rows = DIMENSION_ORDER.map((d, i) => {
      const v = modelOutput[i];
      const pct = Math.round(v * 1000) / 10;
      return `<tr><td class="py-2 pr-4 text-slate-700">${escapeHtml(DIMENSION_LABELS[d])}</td><td class="py-2 font-mono text-xs text-slate-600">${pct}%</td></tr>`;
    }).join('');
    modelBlock = `
      <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
        <h3 class="text-lg font-bold text-slate-900">Model çıktısı (yardımcı)</h3>
        <p class="mt-1 text-sm text-slate-600">Yapay sinir ağı, cevaplarından türetilen <em>yoğunluk</em> dağılımı üretir. Klinik anlam taşımaz; klasik skorlarla birlikte değerlendirilir.</p>
        <table class="mt-3 w-full text-sm">${rows}</table>
      </div>`;
  } else if (modelError) {
    modelBlock = `
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Model yüklenemedi veya çalışmadı.</strong> ${escapeHtml(modelError)} Klasik puanlama ile rapor tamamlandı.
      </div>`;
  }

  const sebsTips = [
    'Modüllerde önce özet videoları izleyip ardından laboratuvar veya simülasyon adımlarına geçmek akışını netleştirir.',
    'İlerlemeyi panelinden takip et; seri gün hedeflerini küçük tutarak sürdürülebilir ritim kurabilirsin.',
  ];

  return `
    <div class="space-y-8">
      <section class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card sm:p-8">
        <h2 class="text-xl font-bold text-slate-900 sm:text-2xl">Genel sonuç özeti</h2>
        <p class="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">${summaryParts.join(' ')}</p>
      </section>

      <section>
        <h2 class="mb-4 text-xl font-bold text-slate-900">Boyut skorları</h2>
        <div class="grid gap-4 sm:grid-cols-2">${bars}</div>
      </section>

      <section class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-6">
          <h3 class="text-lg font-bold text-emerald-950">En güçlü özellikler</h3>
          <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900">${strengths}</ul>
        </div>
        <div class="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6">
          <h3 class="text-lg font-bold text-amber-950">Gelişim alanları</h3>
          <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900">${growth}</ul>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-card sm:p-8">
        <h3 class="text-lg font-bold">SEBS öğrenme önerisi</h3>
        <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
          ${sebsTips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
        <p class="mt-4 text-sm font-semibold text-blue-200">Önerilen öğrenme modu: ${escapeHtml(learningMode)}</p>
      </section>

      ${modelBlock}

      <section class="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p class="font-medium text-slate-800">Önemli uyarı</p>
        <p class="mt-2 leading-relaxed">
          Bu sonuç klinik bir tanı değildir. Cevaplarına göre öğrenme ve çalışma eğilimlerini yorumlayan bir farkındalık raporudur.
        </p>
      </section>
    </div>`;
}
