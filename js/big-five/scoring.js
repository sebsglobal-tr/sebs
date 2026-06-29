import { DIMENSION_ORDER } from './constants.js';

/**
 * @param {number[]} answersOrdered Soru sırasıyla 1–5 (50 eleman, hepsi dolu olmalı).
 * @param {{ dimension: string, reverse: boolean }[]} questions
 */
export function computeClassicalScores(answersOrdered, questions) {
  /** @type {Record<string, number>} */
  const sums = {};
  DIMENSION_ORDER.forEach((d) => {
    sums[d] = 0;
  });

  questions.forEach((q, idx) => {
    const a = answersOrdered[idx];
    const scored = q.reverse ? 6 - a : a;
    sums[q.dimension] += scored;
  });

  /** @type {Record<string, { raw: number, percentage: number }>} */
  const scores = {};
  DIMENSION_ORDER.forEach((d) => {
    const raw = sums[d];
    const percentage = Math.round(((raw - 10) / 40) * 100);
    scores[d] = {
      raw,
      percentage: Math.max(0, Math.min(100, percentage)),
    };
  });
  return scores;
}

/**
 * @param {(number|null|undefined)[]} answersOrdered
 * @param {{ id: string }[]} questions
 * @returns {{ ok: boolean, missingIds: string[] }}
 */
export function validateAnswersComplete(answersOrdered, questions) {
  const missingIds = [];
  questions.forEach((q, i) => {
    const v = answersOrdered[i];
    if (v == null || v < 1 || v > 5 || Number.isNaN(v)) {
      missingIds.push(q.id);
    }
  });
  return { ok: missingIds.length === 0, missingIds };
}
