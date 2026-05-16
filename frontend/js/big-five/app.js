import { BIG_FIVE_QUESTIONS } from './questions.js';
import { LIKERT_OPTIONS, MODEL_INPUT_MODE } from './constants.js';
import { computeClassicalScores, validateAnswersComplete } from './scoring.js';
import { predictBigFiveSoftmax } from './model.js';
import {
  buildReportHtml,
  buildPlainReportText,
  pickTopDimensions,
  pickLowDimensions,
  buildLearningModeLabel,
  bindReportInteractions,
} from './report.js';
import { downloadBigFivePdf, printBigFiveReport } from './pdf-export.js';
import {
  saveAnswersDraft,
  loadAnswersDraft,
  saveBigFiveResult,
  clearBigFiveStorage,
  loadBigFiveResult,
} from './storage.js';

const TOTAL = BIG_FIVE_QUESTIONS.length;

/** @type {(number|null)[]} */
let answers = Array(TOTAL).fill(null);
let currentIndex = 0;
/** @type {'step'|'list'} */
let uiMode = 'step';
/** @type {object|null} */
let lastPayload = null;

const els = {};

function $(id) {
  return document.getElementById(id);
}

function countAnswered() {
  return answers.filter((a) => a != null && a >= 1 && a <= 5).length;
}

function setView(next) {
  const map = { intro: 'viewIntro', test: 'viewTest', loading: 'viewLoading', results: 'viewResults' };
  Object.keys(map).forEach((v) => {
    const el = $(map[v]);
    if (el) el.hidden = v !== next;
  });
}

function updateProgressUI() {
  const n = countAnswered();
  const pct = Math.round((n / TOTAL) * 100);
  if (els.progressText) els.progressText.textContent = `${n} / ${TOTAL} tamamlandı`;
  if (els.progressBar) els.progressBar.style.width = `${pct}%`;
  if (els.progressPct) els.progressPct.textContent = `%${pct}`;
  const submitBtn = $('btnSubmit');
  if (submitBtn) {
    const ok = n === TOTAL;
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('opacity-50', !ok);
    submitBtn.classList.toggle('cursor-not-allowed', !ok);
  }
}

function renderStepQuestion() {
  const q = BIG_FIVE_QUESTIONS[currentIndex];
  if (!q || !els.qCard) return;
  els.qCard.innerHTML = `
    <p class="text-xs font-semibold uppercase tracking-wider text-blue-600">Soru ${currentIndex + 1} / ${TOTAL}</p>
    <h2 class="mt-3 text-lg font-bold leading-snug text-slate-900 sm:text-xl">${escapeAttr(q.text)}</h2>
    <div class="mt-6 space-y-2" role="radiogroup" aria-labelledby="q-title-${currentIndex}">
      ${LIKERT_OPTIONS.map(
        (opt) => `
        <label class="bf-option flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/60">
          <input type="radio" name="bfq" value="${opt.value}" class="h-4 w-4 shrink-0 text-blue-600" ${answers[currentIndex] === opt.value ? 'checked' : ''} />
          <span class="text-sm font-medium text-slate-800">${escapeAttr(opt.label)}</span>
        </label>`
      ).join('')}
    </div>
  `;
  els.qCard.querySelectorAll('input[name="bfq"]').forEach((inp) => {
    inp.addEventListener('change', () => {
      answers[currentIndex] = Number(inp.value);
      saveAnswersDraft(answers);
      updateProgressUI();
      updateNavButtons();
    });
  });
  const titleEl = els.qCard.querySelector('h2');
  if (titleEl) titleEl.id = `q-title-${currentIndex}`;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderListView() {
  if (!els.listMount) return;
  els.listMount.innerHTML = BIG_FIVE_QUESTIONS.map((q, idx) => {
    const opts = LIKERT_OPTIONS.map(
      (opt) => `
      <label title="${escapeAttr(opt.label)}" class="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border px-1 py-2 text-center text-[10px] font-medium leading-tight sm:text-xs ${
        answers[idx] === opt.value
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }">
        <input type="radio" class="sr-only" name="bf-${q.id}" value="${opt.value}" ${answers[idx] === opt.value ? 'checked' : ''} />
        <span class="px-0.5">${opt.value}</span>
      </label>`
    ).join('');
    return `
      <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-idx="${idx}">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <span class="text-xs font-bold text-slate-400">${idx + 1}</span>
          <p class="flex-1 text-sm font-medium text-slate-900">${escapeAttr(q.text)}</p>
        </div>
        <div class="mt-3 flex flex-wrap gap-1 sm:gap-2">${opts}</div>
      </article>`;
  }).join('');

  els.listMount.querySelectorAll('article[data-idx]').forEach((art) => {
    const idx = Number(art.getAttribute('data-idx'));
    art.querySelectorAll('input[type="radio"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        answers[idx] = Number(inp.value);
        saveAnswersDraft(answers);
        updateProgressUI();
      });
    });
  });
}

function updateNavButtons() {
  const prev = $('btnPrev');
  const next = $('btnNext');
  if (prev) prev.disabled = currentIndex === 0;
  if (next) next.disabled = currentIndex >= TOTAL - 1;
}

function goStep(delta) {
  currentIndex = Math.max(0, Math.min(TOTAL - 1, currentIndex + delta));
  renderStepQuestion();
  updateNavButtons();
}

function toggleUiMode() {
  uiMode = uiMode === 'step' ? 'list' : 'step';
  const stepPanel = $('panelStep');
  const listPanel = $('panelList');
  const toggleBtn = $('btnToggleMode');
  if (stepPanel) stepPanel.hidden = uiMode !== 'step';
  if (listPanel) listPanel.hidden = uiMode !== 'list';
  if (toggleBtn) {
    toggleBtn.textContent = uiMode === 'step' ? 'Liste görünümü' : 'Soru soru';
  }
  if (uiMode === 'list') renderListView();
  else renderStepQuestion();
}

async function runAnalysis() {
  const validation = validateAnswersComplete(answers, BIG_FIVE_QUESTIONS);
  if (!validation.ok) {
    if (els.missingBox) {
      els.missingBox.hidden = false;
      els.missingBox.innerHTML = `<p class="font-semibold text-amber-900">Eksik sorular (${validation.missingIds.length})</p>
        <p class="mt-1 text-sm text-amber-800">${validation.missingIds.slice(0, 12).join(', ')}${validation.missingIds.length > 12 ? '…' : ''}</p>`;
      els.missingBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    return;
  }
  if (els.missingBox) els.missingBox.hidden = true;

  setView('loading');
  if (els.loadingText) els.loadingText.textContent = 'Cevapların analiz ediliyor…';

  const answersOrdered = /** @type {number[]} */ (answers.slice());
  const classical = computeClassicalScores(answersOrdered, BIG_FIVE_QUESTIONS);
  let modelOutput = null;
  let modelError = null;

  const tf = window.tf;
  if (tf) {
    try {
      modelOutput = await predictBigFiveSoftmax(tf, answersOrdered);
    } catch (e) {
      modelError = e && e.message ? e.message : String(e);
    }
  } else {
    modelError = 'TensorFlow.js bulunamadı.';
  }

  const topTwo = pickTopDimensions(classical, 2);
  const lowDims = pickLowDimensions(classical, 2);
  const learningMode = buildLearningModeLabel(topTwo, classical);

  const answersById = {};
  BIG_FIVE_QUESTIONS.forEach((q, i) => {
    answersById[q.id] = answersOrdered[i];
  });

  const payload = {
    test_type: 'big_five_learning',
    created_at: new Date().toISOString(),
    model_input_mode: MODEL_INPUT_MODE,
    answers: answersById,
    answersOrdered,
    classical_scores: classical,
    model_output: modelOutput,
    model_error: modelError,
    generated_report: buildPlainReportText(classical, modelOutput, modelError, topTwo, lowDims, learningMode),
    learning_mode: learningMode,
  };

  lastPayload = payload;
  saveBigFiveResult(payload);

  const html = buildReportHtml(
    classical,
    modelOutput,
    modelError,
    topTwo,
    lowDims,
    learningMode,
    payload.created_at
  );
  showResults(html);
  updateIntroLastReportButton();
}

function showResults(html) {
  if (els.resultMount) els.resultMount.innerHTML = html;
  bindReportInteractions(
    () => downloadBigFivePdf('bf-report-document'),
    () => printBigFiveReport()
  );
  setView('results');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function rebuildReportOnly() {
  if (!lastPayload || !lastPayload.answersOrdered) return;
  const classical = computeClassicalScores(lastPayload.answersOrdered, BIG_FIVE_QUESTIONS);
  const topTwo = pickTopDimensions(classical, 2);
  const lowDims = pickLowDimensions(classical, 2);
  const learningMode = buildLearningModeLabel(topTwo, classical);
  const plain = buildPlainReportText(
    classical,
    lastPayload.model_output,
    lastPayload.model_error,
    topTwo,
    lowDims,
    learningMode
  );
  lastPayload = {
    ...lastPayload,
    classical_scores: classical,
    generated_report: plain,
    learning_mode: learningMode,
  };
  saveBigFiveResult(lastPayload);
  const html = buildReportHtml(
    classical,
    lastPayload.model_output,
    lastPayload.model_error,
    topTwo,
    lowDims,
    learningMode,
    lastPayload.created_at
  );
  showResults(html);
}

function showSavedReportIfAny() {
  const saved = loadBigFiveResult();
  if (!saved || saved.test_type !== 'big_five_learning' || !saved.classical_scores) return false;
  lastPayload = saved;
  const classical = saved.classical_scores;
  const topTwo = pickTopDimensions(classical, 2);
  const lowDims = pickLowDimensions(classical, 2);
  const learningMode = saved.learning_mode || buildLearningModeLabel(topTwo, classical);
  const html = buildReportHtml(
    classical,
    saved.model_output,
    saved.model_error,
    topTwo,
    lowDims,
    learningMode,
    saved.created_at
  );
  showResults(html);
  return true;
}

function restartTest() {
  answers = Array(TOTAL).fill(null);
  currentIndex = 0;
  lastPayload = null;
  clearBigFiveStorage();
  uiMode = 'step';
  const stepPanel = $('panelStep');
  const listPanel = $('panelList');
  if (stepPanel) stepPanel.hidden = false;
  if (listPanel) listPanel.hidden = true;
  const toggleBtn = $('btnToggleMode');
  if (toggleBtn) toggleBtn.textContent = 'Liste görünümü';
  setView('intro');
  updateIntroLastReportButton();
  updateProgressUI();
}

function startFromIntro() {
  const draft = loadAnswersDraft();
  if (draft && Array.isArray(draft) && draft.length === TOTAL) {
    answers = draft.map((v) => (v >= 1 && v <= 5 ? v : null));
  } else {
    answers = Array(TOTAL).fill(null);
  }
  currentIndex = 0;
  setView('test');
  uiMode = 'step';
  const stepPanel = $('panelStep');
  const listPanel = $('panelList');
  if (stepPanel) stepPanel.hidden = false;
  if (listPanel) listPanel.hidden = true;
  const toggleBtn = $('btnToggleMode');
  if (toggleBtn) toggleBtn.textContent = 'Liste görünümü';
  renderStepQuestion();
  updateNavButtons();
  updateProgressUI();
}

function bind() {
  els.progressText = $('progressText');
  els.progressBar = $('progressBar');
  els.progressPct = $('progressPct');
  els.qCard = $('questionCard');
  els.listMount = $('listMount');
  els.missingBox = $('missingBox');
  els.resultMount = $('resultMount');
  els.loadingText = $('loadingText');

  $('btnStart')?.addEventListener('click', startFromIntro);
  $('btnViewLastReport')?.addEventListener('click', () => showSavedReportIfAny());
  $('btnSubmit')?.addEventListener('click', () => runAnalysis());
  $('btnPrev')?.addEventListener('click', () => goStep(-1));
  $('btnNext')?.addEventListener('click', () => goStep(1));
  $('btnToggleMode')?.addEventListener('click', toggleUiMode);
  $('btnRestart')?.addEventListener('click', restartTest);
  $('btnRegenerate')?.addEventListener('click', rebuildReportOnly);
  $('btnCareer')?.addEventListener('click', () => {
    window.location.href = '/fiyatlandirma';
  });
}

function updateIntroLastReportButton() {
  const btn = $('btnViewLastReport');
  if (!btn) return;
  const saved = loadBigFiveResult();
  const has = saved && saved.test_type === 'big_five_learning' && saved.classical_scores;
  btn.hidden = !has;
}

function init() {
  bind();
  updateIntroLastReportButton();
  setView('intro');
  updateProgressUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
