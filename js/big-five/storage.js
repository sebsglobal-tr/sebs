const KEY_ANSWERS = 'sebs_big_five_answers';
const KEY_RESULT = 'sebs_big_five_result';

/**
 * @param {number[]} answersOrdered
 */
export function saveAnswersDraft(answersOrdered) {
  try {
    localStorage.setItem(KEY_ANSWERS, JSON.stringify(answersOrdered));
  } catch (e) {
    console.warn('Big Five cevapları kaydedilemedi', e);
  }
}

export function loadAnswersDraft() {
  try {
    const raw = localStorage.getItem(KEY_ANSWERS);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/**
 * @param {object} payload
 */
export function saveBigFiveResult(payload) {
  try {
    localStorage.setItem(KEY_RESULT, JSON.stringify(payload));
    if (payload.answersOrdered) {
      localStorage.setItem(KEY_ANSWERS, JSON.stringify(payload.answersOrdered));
    }
  } catch (e) {
    console.warn('Big Five sonucu kaydedilemedi', e);
  }
}

export function loadBigFiveResult() {
  try {
    const raw = localStorage.getItem(KEY_RESULT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearBigFiveStorage() {
  try {
    localStorage.removeItem(KEY_ANSWERS);
    localStorage.removeItem(KEY_RESULT);
  } catch (e) {
    console.warn(e);
  }
}

export { KEY_ANSWERS, KEY_RESULT };
