import { RIASEC_ORDER, RIASEC_LABELS, MODEL_CLUSTER_LABELS } from './constants.js';
import { pickTopRiasec } from './scoring.js';

export function escapeHtml(text) {
  if (text == null || text === '') return '';
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
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
 * @param {Record<string, { percentage: number }>} riasecScores
 * @param {number[]|null} modelProbs
 * @param {string|null} modelError
 * @param {string} createdAt
 * @param {{ sectionId?: string }} opts
 */
export function buildHollandReportSection(riasecScores, modelProbs, modelError, createdAt, opts = {}) {
  const sectionId = opts.sectionId || 'ci-report-section';
  const top = pickTopRiasec(riasecScores, 3);
  const dateStr = createdAt ? new Date(createdAt).toLocaleString('tr-TR') : '';

  const bars = RIASEC_ORDER.map((d) => {
    const pct = riasecScores[d].percentage;
    const label = (RIASEC_LABELS[d] || d).split('—')[0].trim();
    return `
      <div class="ci-bar-row">
        <div class="ci-bar-head">
          <span class="ci-bar-label">${escapeHtml(label)}</span>
          <span class="ci-bar-pct">%${pct}</span>
        </div>
        <div class="ci-bar-track"><div class="ci-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');

  let modelBlock = '';
  if (modelError) {
    modelBlock = `<p class="ci-note ci-note--warn">Model çıktısı alınamadı: ${escapeHtml(modelError)}. RIASEC klasik skorları kullanıldı.</p>`;
  } else if (modelProbs && modelProbs.length === MODEL_CLUSTER_LABELS.length) {
    const ranked = modelProbs
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p - a.p)
      .slice(0, 3);
    modelBlock = `
      <h4 class="ci-subtitle">Sinir ağı profil tahmini (üst 3)</h4>
      <ul class="ci-model-list">
        ${ranked
          .map(({ p, i }) => {
            const c = MODEL_CLUSTER_LABELS[i];
            return `<li><strong>${escapeHtml(c.label)}</strong> — %${Math.round(p * 100)} <span class="ci-muted">${escapeHtml(c.tagline)}</span></li>`;
          })
          .join('')}
      </ul>`;
  }

  const topNames = top.map((t) => RIASEC_LABELS[t.key]?.split('—')[0].trim() || t.key).join(', ');

  return `
    <section id="${escapeHtml(sectionId)}" class="ci-report-block bf-report-document">
      <header class="ci-report-header">
        <p class="ci-eyebrow">Adım 1 · Meslek ilgi envanteri</p>
        <h2 class="ci-title">Holland (RIASEC) sonuç özeti</h2>
        ${dateStr ? `<p class="ci-date">${escapeHtml(dateStr)}</p>` : ''}
      </header>
      <p class="ci-lead">
        48 aktivite tercihine göre en belirgin ilgi alanların: <strong>${escapeHtml(topNames)}</strong>.
        Bu bölüm mesleki ilgi eğilimini gösterir; yetkinlik veya performans ölçümü değildir.
      </p>
      <div class="ci-bars">${bars}</div>
      ${modelBlock}
      <p class="ci-disclaimer">RIASEC skorları cevaplarının ortalamasına dayanır. Model çıktısı eğitilmiş sınıflandırıcıdan gelir ve klasik skorla birlikte okunmalıdır.</p>
    </section>`;
}
