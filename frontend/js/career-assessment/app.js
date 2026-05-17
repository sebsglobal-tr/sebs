import { CAREER_INTEREST_QUESTIONS } from '../career-interest/questions.js';
import { LIKERT_OPTIONS as CI_LIKERT } from '../career-interest/constants.js';
import { computeRiasecScores, validateAnswersComplete as validateCi } from '../career-interest/scoring.js';
import { predictCareerInterestSoftmax } from '../career-interest/model.js';
import { saveCareerInterestAnswersDraft, saveCareerInterestResult } from '../career-interest/storage.js';

import { BIG_FIVE_QUESTIONS } from '../big-five/questions.js';
import { LIKERT_OPTIONS as BF_LIKERT } from '../big-five/constants.js';
import { computeClassicalScores, validateAnswersComplete as validateBf } from '../big-five/scoring.js';
import { predictBigFiveSoftmax } from '../big-five/model.js';
import {
  buildPlainReportText,
  pickTopDimensions,
  pickLowDimensions,
  buildLearningModeLabel,
} from '../big-five/report.js';
import { saveAnswersDraft as saveBfDraft, saveBigFiveResult } from '../big-five/storage.js';

import { buildCombinedReportHtml } from './combined-report.js';
import { saveAssessmentSession, loadAssessmentSession, clearAssessmentSession } from './storage.js';
import { downloadBigFivePdf, printBigFiveReport } from '../big-five/pdf-export.js';

const CI_TOTAL = CAREER_INTEREST_QUESTIONS.length;
const BF_TOTAL = BIG_FIVE_QUESTIONS.length;

/** @type {'intro'|'step1'|'step1_done'|'step2'|'loading'|'results'} */
let phase = 'intro';
/** @type {(number|null)[]} */
let ciAnswers = Array(CI_TOTAL).fill(null);
/** @type {(number|null)[]} */
let bfAnswers = Array(BF_TOTAL).fill(null);
let ciIndex = 0;
let bfIndex = 0;
/** @type {'step'|'list'} */
let uiMode = 'step';
/** @type {'ci'|'bf'} */
let activeTest = 'ci';

/** @type {object|null} */
let session = null;

const els = {};

function $(id) {
  return document.getElementById(id);
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function currentQuestions() {
  return activeTest === 'ci' ? CAREER_INTEREST_QUESTIONS : BIG_FIVE_QUESTIONS;
}

function currentAnswers() {
  return activeTest === 'ci' ? ciAnswers : bfAnswers;
}

function currentTotal() {
  return activeTest === 'ci' ? CI_TOTAL : BF_TOTAL;
}

function currentIndex() {
  return activeTest === 'ci' ? ciIndex : bfIndex;
}

function setCurrentIndex(v) {
  if (activeTest === 'ci') ciIndex = v;
  else bfIndex = v;
}

function likertOptions() {
  return activeTest === 'ci' ? CI_LIKERT : BF_LIKERT;
}

function countAnswered(arr) {
  return arr.filter((a) => a != null && a >= 1 && a <= 5).length;
}

function setView() {
  const views = {
    intro: 'viewIntro',
    step1: 'viewTest',
    step1_done: 'viewStep1Done',
    step2: 'viewTest',
    loading: 'viewLoading',
    results: 'viewResults',
  };
  Object.entries(views).forEach(([p, id]) => {
    const el = $(id);
    if (el) el.hidden = phase !== p;
  });
  if ($('viewStep1Done')) $('viewStep1Done').hidden = phase !== 'step1_done';

  const onStep1 = phase === 'step1' || phase === 'step1_done';
  const onStep2 = phase === 'step2';
  $('pillStep1')?.classList.toggle('is-active', onStep1);
  $('pillStep1')?.classList.toggle('is-done', phase === 'step1_done' || onStep2 || phase === 'loading' || phase === 'results');
  $('pillStep2')?.classList.toggle('is-active', onStep2 || phase === 'loading');
  $('pillStep2')?.classList.toggle('is-done', phase === 'results');

  const stepLabel = $('stepLabel');
  if (stepLabel) {
    if (phase === 'step1') stepLabel.textContent = 'Adım 1 / 2 — Meslek ilgi envanteri (48 soru)';
    else if (phase === 'step1_done') stepLabel.textContent = 'Adım 1 tamamlandı';
    else if (phase === 'step2') stepLabel.textContent = 'Adım 2 / 2 — Big Five öğrenme profili (50 soru)';
    else stepLabel.textContent = '';
  }

  const submitBtn = $('btnSubmit');
  if (submitBtn) {
    if (phase === 'step1') {
      submitBtn.innerHTML = 'Adım 1 sonucunu kaydet ve devam et <i class="fas fa-arrow-right text-xs" aria-hidden="true"></i>';
    } else if (phase === 'step2') {
      submitBtn.innerHTML = 'Birleşik raporu oluştur <i class="fas fa-chart-pie text-xs" aria-hidden="true"></i>';
    }
  }
}

function updateProgressUI() {
  const arr = currentAnswers();
  const total = currentTotal();
  const n = countAnswered(arr);
  const pct = Math.round((n / total) * 100);
  if (els.progressText) els.progressText.textContent = `${n} / ${total} tamamlandı`;
  if (els.progressBar) els.progressBar.style.width = `${pct}%`;
  if (els.progressPct) els.progressPct.textContent = `%${pct}`;
  const submitBtn = $('btnSubmit');
  if (submitBtn && (phase === 'step1' || phase === 'step2')) {
    const ok = n === total;
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('opacity-50', !ok);
    submitBtn.classList.toggle('cursor-not-allowed', !ok);
  }
}

function renderStepQuestion() {
  const questions = currentQuestions();
  const idx = currentIndex();
  const q = questions[idx];
  const opts = likertOptions();
  if (!q || !els.qCard) return;

  els.qCard.innerHTML = `
    <p class="text-xs font-semibold uppercase tracking-wider text-emerald-600">Soru ${idx + 1} / ${questions.length}</p>
    <h2 class="mt-3 text-lg font-bold leading-snug text-slate-900 sm:text-xl">${escapeAttr(q.text)}</h2>
    <p class="mt-2 text-xs text-slate-500">Bu aktiviteyi yapmayı ne kadar seversin?</p>
    <div class="mt-6 space-y-2" role="radiogroup">
      ${opts
        .map(
          (opt) => `
        <label class="bf-option flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/40 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/60">
          <input type="radio" name="caq" value="${opt.value}" class="h-4 w-4 shrink-0 text-emerald-600" ${currentAnswers()[idx] === opt.value ? 'checked' : ''} />
          <span class="text-sm font-medium text-slate-800">${escapeAttr(opt.label)}</span>
        </label>`
        )
        .join('')}
    </div>`;

  els.qCard.querySelectorAll('input[name="caq"]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const val = Number(inp.value);
      if (activeTest === 'ci') {
        ciAnswers[idx] = val;
        saveCareerInterestAnswersDraft(ciAnswers);
      } else {
        bfAnswers[idx] = val;
        saveBfDraft(bfAnswers);
      }
      updateProgressUI();
      updateNavButtons();
    });
  });
}

function renderListView() {
  const questions = currentQuestions();
  const answers = currentAnswers();
  const opts = likertOptions();
  if (!els.listMount) return;

  els.listMount.innerHTML = questions
    .map((q, idx) => {
      const optHtml = opts
        .map(
          (opt) => `
        <label title="${escapeAttr(opt.label)}" class="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border px-1 py-2 text-center text-[10px] font-medium leading-tight sm:text-xs ${
          answers[idx] === opt.value
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }">
          <input type="radio" class="sr-only" name="ca-${q.id}" value="${opt.value}" ${answers[idx] === opt.value ? 'checked' : ''} />
          <span>${opt.value}</span>
        </label>`
        )
        .join('');
      return `
      <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-idx="${idx}">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <span class="text-xs font-bold text-slate-400">${idx + 1}</span>
          <p class="flex-1 text-sm font-medium text-slate-900">${escapeAttr(q.text)}</p>
        </div>
        <div class="mt-3 flex flex-wrap gap-1 sm:gap-2">${optHtml}</div>
      </article>`;
    })
    .join('');

  els.listMount.querySelectorAll('article[data-idx]').forEach((art) => {
    const idx = Number(art.getAttribute('data-idx'));
    art.querySelectorAll('input[type="radio"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const val = Number(inp.value);
        if (activeTest === 'ci') {
          ciAnswers[idx] = val;
          saveCareerInterestAnswersDraft(ciAnswers);
        } else {
          bfAnswers[idx] = val;
          saveBfDraft(bfAnswers);
        }
        updateProgressUI();
      });
    });
  });
}

function updateNavButtons() {
  const idx = currentIndex();
  const total = currentTotal();
  const prev = $('btnPrev');
  const next = $('btnNext');
  if (prev) prev.disabled = idx === 0;
  if (next) next.disabled = idx >= total - 1;
}

function goStep(delta) {
  setCurrentIndex(Math.max(0, Math.min(currentTotal() - 1, currentIndex() + delta)));
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
  if (toggleBtn) toggleBtn.textContent = uiMode === 'step' ? 'Liste görünümü' : 'Soru soru';
  if (uiMode === 'list') renderListView();
  else renderStepQuestion();
}

async function finishStep1() {
  const validation = validateCi(ciAnswers, CAREER_INTEREST_QUESTIONS);
  if (!validation.ok) {
    showMissing(validation.missingIds);
    return;
  }
  hideMissing();

  phase = 'loading';
  activeTest = 'ci';
  setView();
  if (els.loadingText) els.loadingText.textContent = 'Meslek ilgi profilin hesaplanıyor…';

  const answersOrdered = /** @type {number[]} */ (ciAnswers.slice());
  const classical = computeRiasecScores(answersOrdered, CAREER_INTEREST_QUESTIONS);
  let modelOutput = null;
  let modelError = null;
  const tf = window.tf;
  if (tf) {
    try {
      modelOutput = await predictCareerInterestSoftmax(tf, answersOrdered);
    } catch (e) {
      modelError = e?.message || String(e);
    }
  } else {
    modelError = 'TensorFlow.js bulunamadı.';
  }

  const ciPayload = {
    test_type: 'career_interest_holland',
    created_at: new Date().toISOString(),
    answersOrdered,
    classical_scores: classical,
    model_output: modelOutput,
    model_error: modelError,
  };
  saveCareerInterestResult(ciPayload);

  session = {
    career_interest: ciPayload,
    big_five: null,
    completed_at: null,
  };
  saveAssessmentSession(session);

  phase = 'step1_done';
  setView();
}

async function finishStep2AndReport() {
  const validation = validateBf(bfAnswers, BIG_FIVE_QUESTIONS);
  if (!validation.ok) {
    showMissing(validation.missingIds);
    return;
  }
  hideMissing();

  phase = 'loading';
  setView();
  if (els.loadingText) els.loadingText.textContent = 'Big Five profili ve birleşik meslek önerileri hazırlanıyor…';

  const answersOrdered = /** @type {number[]} */ (bfAnswers.slice());
  const classical = computeClassicalScores(answersOrdered, BIG_FIVE_QUESTIONS);
  let modelOutput = null;
  let modelError = null;
  const tf = window.tf;
  if (tf) {
    try {
      modelOutput = await predictBigFiveSoftmax(tf, answersOrdered);
    } catch (e) {
      modelError = e?.message || String(e);
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

  const bfPayload = {
    test_type: 'big_five_learning',
    created_at: new Date().toISOString(),
    answers: answersById,
    answersOrdered,
    classical_scores: classical,
    model_output: modelOutput,
    model_error: modelError,
    generated_report: buildPlainReportText(classical, modelOutput, modelError, topTwo, lowDims, learningMode),
    learning_mode: learningMode,
  };
  saveBigFiveResult(bfPayload);

  session = {
    ...session,
    big_five: bfPayload,
    completed_at: new Date().toISOString(),
  };
  saveAssessmentSession(session);

  const html = buildCombinedReportHtml(session);
  if (els.resultMount) els.resultMount.innerHTML = html;
  bindReportButtons();
  phase = 'results';
  setView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMissing(ids) {
  if (els.missingBox) {
    els.missingBox.hidden = false;
    els.missingBox.innerHTML = `<p class="font-semibold text-amber-900">Eksik sorular (${ids.length})</p>
      <p class="mt-1 text-sm text-amber-800">${ids.slice(0, 12).join(', ')}${ids.length > 12 ? '…' : ''}</p>`;
    els.missingBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function hideMissing() {
  if (els.missingBox) els.missingBox.hidden = true;
}

function bindReportButtons() {
  const dl = $('btnDownloadPdf');
  const pr = $('btnPrintReport');
  if (dl) {
    const clone = dl.cloneNode(true);
    dl.replaceWith(clone);
    clone.addEventListener('click', () => downloadBigFivePdf('ca-report-document'));
  }
  if (pr) {
    const clone = pr.cloneNode(true);
    pr.replaceWith(clone);
    clone.addEventListener('click', () => printBigFiveReport());
  }
}

function startStep1() {
  phase = 'step1';
  activeTest = 'ci';
  const draft = loadAssessmentSession();
  const ciDraft = ciAnswers.some((a) => a != null) ? ciAnswers : null;
  const stored = ciDraft || (() => {
    try {
      const raw = localStorage.getItem('sebs_career_interest_answers');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  if (stored && Array.isArray(stored) && stored.length === CI_TOTAL) {
    ciAnswers = stored.map((v) => (v >= 1 && v <= 5 ? v : null));
  } else {
    ciAnswers = Array(CI_TOTAL).fill(null);
  }
  ciIndex = 0;
  uiMode = 'step';
  resetPanels();
  setView();
  renderStepQuestion();
  updateNavButtons();
  updateProgressUI();
}

function continueToStep2() {
  session = loadAssessmentSession() || session;
  phase = 'step2';
  activeTest = 'bf';
  const stored = (() => {
    try {
      const raw = localStorage.getItem('sebs_big_five_answers');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  if (stored && Array.isArray(stored) && stored.length === BF_TOTAL) {
    bfAnswers = stored.map((v) => (v >= 1 && v <= 5 ? v : null));
  } else {
    bfAnswers = Array(BF_TOTAL).fill(null);
  }
  bfIndex = 0;
  uiMode = 'step';
  resetPanels();
  setView();
  renderStepQuestion();
  updateNavButtons();
  updateProgressUI();
}

function resetPanels() {
  const stepPanel = $('panelStep');
  const listPanel = $('panelList');
  if (stepPanel) stepPanel.hidden = false;
  if (listPanel) listPanel.hidden = true;
  const toggleBtn = $('btnToggleMode');
  if (toggleBtn) toggleBtn.textContent = 'Liste görünümü';
}

function restartAll() {
  clearAssessmentSession();
  ciAnswers = Array(CI_TOTAL).fill(null);
  bfAnswers = Array(BF_TOTAL).fill(null);
  session = null;
  phase = 'intro';
  setView();
  updateIntroButtons();
}

function showSavedReport() {
  const saved = loadAssessmentSession();
  if (!saved?.career_interest || !saved?.big_five) return false;
  session = saved;
  const html = buildCombinedReportHtml(session);
  if (els.resultMount) els.resultMount.innerHTML = html;
  bindReportButtons();
  phase = 'results';
  setView();
  return true;
}

function updateIntroButtons() {
  const saved = loadAssessmentSession();
  const btn = $('btnViewLastReport');
  if (btn) btn.hidden = !(saved?.career_interest && saved?.big_five);
  const resume = $('btnResume');
  if (resume) {
    if (saved?.career_interest && !saved?.big_five) {
      resume.hidden = false;
      resume.textContent = 'Adım 2\'ye devam et';
    } else {
      resume.hidden = true;
    }
  }
}

function onSubmit() {
  if (phase === 'step1') finishStep1();
  else if (phase === 'step2') finishStep2AndReport();
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

  $('btnStart')?.addEventListener('click', startStep1);
  $('btnContinueStep2')?.addEventListener('click', continueToStep2);
  $('btnResume')?.addEventListener('click', () => {
    session = loadAssessmentSession();
    if (session?.career_interest) continueToStep2();
  });
  $('btnViewLastReport')?.addEventListener('click', showSavedReport);
  $('btnSubmit')?.addEventListener('click', onSubmit);
  $('btnPrev')?.addEventListener('click', () => goStep(-1));
  $('btnNext')?.addEventListener('click', () => goStep(1));
  $('btnToggleMode')?.addEventListener('click', toggleUiMode);
  $('btnRestart')?.addEventListener('click', restartAll);
}

function init() {
  bind();
  updateIntroButtons();
  phase = 'intro';
  setView();
  updateProgressUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
