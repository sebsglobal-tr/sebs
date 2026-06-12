import { RIASEC_ORDER } from './constants.js';

/**
 * @param {number[]} answersOrdered
 * @param {{ dimension: string }[]} questions
 */
export function computeRiasecScores(answersOrdered, questions) {
  /** @type {Record<string, { sum: number, count: number }>} */
  const buckets = {};
  RIASEC_ORDER.forEach((d) => {
    buckets[d] = { sum: 0, count: 0 };
  });

  questions.forEach((q, idx) => {
    const a = answersOrdered[idx];
    if (!buckets[q.dimension]) return;
    buckets[q.dimension].sum += a;
    buckets[q.dimension].count += 1;
  });

  /** @type {Record<string, { raw: number, percentage: number, count: number }>} */
  const scores = {};
  RIASEC_ORDER.forEach((d) => {
    const { sum, count } = buckets[d];
    const min = count;
    const max = count * 5;
    const percentage = count ? Math.round(((sum - min) / (max - min)) * 100) : 0;
    scores[d] = {
      raw: sum,
      count,
      percentage: Math.max(0, Math.min(100, percentage)),
    };
  });
  return scores;
}

/**
 * @param {(number|null|undefined)[]} answersOrdered
 * @param {{ id: string }[]} questions
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

/**
 * @param {Record<string, { percentage: number }>} scores
 * @param {number} n
 */
export function pickTopRiasec(scores, n = 3) {
  return RIASEC_ORDER.map((d) => ({ key: d, pct: scores[d].percentage }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, n);
}
