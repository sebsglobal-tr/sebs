const KEY_ANSWERS = 'sebs_career_interest_answers';
const KEY_RESULT = 'sebs_career_interest_result';

export function saveCareerInterestAnswersDraft(answers) {
  try {
    localStorage.setItem(KEY_ANSWERS, JSON.stringify(answers));
  } catch (e) {
    console.warn('Meslek ilgi cevapları kaydedilemedi', e);
  }
}

export function loadCareerInterestAnswersDraft() {
  try {
    const raw = localStorage.getItem(KEY_ANSWERS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCareerInterestResult(payload) {
  try {
    localStorage.setItem(KEY_RESULT, JSON.stringify(payload));
  } catch (e) {
    console.warn('Meslek ilgi sonucu kaydedilemedi', e);
  }
}

export function loadCareerInterestResult() {
  try {
    const raw = localStorage.getItem(KEY_RESULT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCareerInterestStorage() {
  try {
    localStorage.removeItem(KEY_ANSWERS);
    localStorage.removeItem(KEY_RESULT);
  } catch {
    /* ignore */
  }
}
