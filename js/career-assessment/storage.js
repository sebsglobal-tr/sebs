const KEY_SESSION = 'sebs_career_assessment_session';

export function saveAssessmentSession(session) {
  try {
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.warn('Kariyer değerlendirme oturumu kaydedilemedi', e);
  }
}

export function loadAssessmentSession() {
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAssessmentSession() {
  try {
    localStorage.removeItem(KEY_SESSION);
  } catch {
    /* ignore */
  }
}
