import { buildHollandReportSection } from '../career-interest/report.js';
import { buildReportHtml, pickTopDimensions, pickLowDimensions, buildLearningModeLabel } from '../big-five/report.js';
import { buildCareerRecommendations } from './career-recommendations.js';
import { pickTopRiasec } from '../career-interest/scoring.js';

function escapeHtml(text) {
  if (text == null || text === '') return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * @param {object} session
 */
export function buildCombinedReportHtml(session) {
  const ci = session.career_interest;
  const bf = session.big_five;
  const createdAt = session.completed_at || new Date().toISOString();

  const hollandSection = buildHollandReportSection(
    ci.classical_scores,
    ci.model_output,
    ci.model_error,
    ci.created_at,
    { sectionId: 'report-holland' }
  );

  const classical = bf.classical_scores;
  const topTwo = pickTopDimensions(classical, 2);
  const lowDims = pickLowDimensions(classical, 2);
  const learningMode = bf.learning_mode || buildLearningModeLabel(topTwo, classical);

  const bfInner = buildReportHtml(
    classical,
    bf.model_output,
    bf.model_error,
    topTwo,
    lowDims,
    learningMode,
    bf.created_at
  );
  const bfSection = `
    <div id="report-bigfive" class="ca-bf-embed">
      <p class="ci-eyebrow">Adım 2 · Big Five öğrenme profili</p>
      ${bfInner}
    </div>`;

  const topRiasec = pickTopRiasec(ci.classical_scores, 3);
  const topBf = pickTopDimensions(classical, 2);
  const recs = buildCareerRecommendations(topRiasec, topBf, classical);

  const careerCards = recs.careers
    .map(
      (c) => `
    <article class="ca-career-card">
      <div class="ca-career-icon"><i class="fas ${escapeHtml(c.icon)}" aria-hidden="true"></i></div>
      <div>
        <h4 class="ca-career-title">${escapeHtml(c.title)}</h4>
        <p class="ca-career-desc">${escapeHtml(c.description)}</p>
        <p class="ca-career-match">Uyum: <span class="ca-match ca-match--${escapeHtml(c.match)}">${escapeHtml(c.match)}</span></p>
        <a href="${escapeHtml(c.href)}" class="ca-career-link">SEBS yoluna git →</a>
      </div>
    </article>`
    )
    .join('');

  return `
    <div id="ca-report-document" class="ca-report-root">
      <header class="ca-report-hero">
        <p class="ca-eyebrow">Birleşik kariyer değerlendirme raporu</p>
        <h1 class="ca-hero-title">Meslek ilgi + öğrenme profili</h1>
        <p class="ca-hero-date">${escapeHtml(new Date(createdAt).toLocaleString('tr-TR'))}</p>
        <p class="ca-hero-lead">
          Bu rapor iki aşamalı değerlendirmenin sonucudur: önce 48 maddelik meslek ilgi envanteri (Holland),
          ardından 50 maddelik Big Five öğrenme ve çalışma eğilimi testi. Son bölümde her iki profilin birleşimine göre meslek önerileri sunulur.
        </p>
      </header>

      <nav class="ca-toc" aria-label="Rapor içeriği">
        <a href="#report-holland">1. Meslek ilgi sonuçları</a>
        <a href="#report-bigfive">2. Big Five sonuçları</a>
        <a href="#report-careers">3. Meslek önerileri</a>
      </nav>

      ${hollandSection}

      <div class="ca-section-divider" role="separator"></div>

      ${bfSection}

      <div class="ca-section-divider" role="separator"></div>

      <section id="report-careers" class="ca-careers-section">
        <p class="ci-eyebrow">Bölüm 3 · Birleşik meslek önerisi</p>
        <h2 class="ci-title">Sana uygun kariyer yolları</h2>
        <p class="ci-lead">${recs.narrative}</p>
        <div class="ca-career-grid">${careerCards}</div>
        <p class="ci-disclaimer">
          Öneriler otomatik kural motoru ile üretilmiştir; kişisel danışmanlık veya işe alım kararı yerine geçmez.
          Profesyonel kariyer rehberliği için yetkin bir danışmanla çalışmanı öneririz.
        </p>
      </section>

      <div class="ca-report-actions no-print">
        <button type="button" id="btnDownloadPdf" class="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700">
          <i class="fas fa-file-pdf" aria-hidden="true"></i> PDF indir
        </button>
        <button type="button" id="btnPrintReport" class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">
          <i class="fas fa-print" aria-hidden="true"></i> Yazdır
        </button>
      </div>
    </div>`;
}
