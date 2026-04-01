/**
 * Değerlendirme sorularını test sınavı formatına çevirir.
 * Doğru cevapları gizler; kullanıcı seçim yapar, sadece skor gösterilir.
 */
(function() {
  'use strict';

  const CORRECT_REGEX = /Doğru\s*(?:Cevap)?\s*:\s*([A-D])|Doğru:\s*([A-D])/i;

  function parseCorrect(text) {
    const m = text.match(CORRECT_REGEX);
    return m ? (m[1] || m[2]).toUpperCase() : null;
  }

  function processSection(section) {
    const inner = section.querySelector('.section-inner') || section;

    // 1) Gizle: "Doğru cevap", "Doğru:", "Açıklama" içeren paragraflar
    inner.querySelectorAll('p').forEach(p => {
      const t = (p.textContent || '').trim();
      if (t && (t.match(CORRECT_REGEX) || /^Açıklama\s*:/.test(t)) && t.length < 300) {
        p.style.display = 'none';
      }
    });

    // 2) h3 + p formatı (Değerlendirme Testi 10 Soru)
    // Doğru cevap aynı p'de veya hemen sonraki p'de olabilir
    inner.querySelectorAll('h3').forEach(h3 => {
      let p = h3.nextElementSibling;
      if (!p || p.tagName !== 'P') return;
      const text = p.textContent || '';
      if (!/[A-D]\)\s+/.test(text)) return;
      let correct = parseCorrect(text);
      let answerP = null;
      if (!correct) {
        const nextP = p.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          correct = parseCorrect(nextP.textContent || '');
          if (correct) answerP = nextP;
        }
      }
      if (!correct) return;

      const wrap = document.createElement('div');
      wrap.className = 'eval-question-block';
      const qDiv = document.createElement('div');
      qDiv.className = 'eval-question-text';
      const lines = text.split(/\n/);
      let optLines = [];
      let qParts = [];
      for (const line of lines) {
        const m = line.trim().match(/^([A-D])\)\s*(.+)$/);
        if (m) optLines.push(m);
        else if (!line.match(CORRECT_REGEX) && !/^Açıklama\s*:/.test(line) && line.trim()) {
          qParts.push(line.trim());
        }
      }
      if (optLines.length !== 4) {
        const chunks = text.split(/\s*(?=[A-D]\)\s)/).filter(Boolean);
        optLines = [];
        chunks.forEach((ch, i) => {
          const m2 = ch.trim().match(/^([A-D])\)\s*(.+)$/);
          if (m2 && optLines.length < 4) optLines.push(m2);
          else if (i === 0 && !ch.trim().match(CORRECT_REGEX) && !/^Açıklama\s*:/.test(ch)) {
            qParts = [ch.trim()];
          }
        });
      }
      if (optLines.length !== 4) return;
      qDiv.innerHTML = qParts.join('<br>').replace(/<strong>Doğru[^<]*<\/strong>.*/gi, '');
      wrap.appendChild(qDiv);

      const optsWrap = document.createElement('div');
      optsWrap.className = 'eval-options-wrap';
      optsWrap.dataset.correct = correct;
      const name = 'eval-' + (h3.id || 'q') + '-' + Math.random().toString(36).slice(2, 8);
      optLines.forEach(([_, letter, txt]) => {
        const label = document.createElement('label');
        label.className = 'eval-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = letter;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + letter + ') ' + txt));
        optsWrap.appendChild(label);
      });
      wrap.appendChild(optsWrap);
      p.parentNode.insertBefore(wrap, p);
      p.style.display = 'none';
      if (answerP) answerP.style.display = 'none';
    });

    // 3) <p><strong>1) ...</strong> ... A) B) C) D) <strong>Doğru: X</strong> formatı
    inner.querySelectorAll('p').forEach(p => {
      if (p.style.display === 'none' || p.closest('.eval-question-block')) return;
      const text = p.textContent || '';
      if (!/^\s*\d+\)/.test(text) || !/[A-D]\)\s+/.test(text) || !CORRECT_REGEX.test(text)) return;
      const correct = parseCorrect(text);
      if (!correct) return;

      const optLines = [];
      const parts = text.split(/\n/);
      let qText = '';
      for (const part of parts) {
        const m = part.trim().match(/^([A-D])\)\s*(.+)$/);
        if (m) optLines.push(m);
        else if (part.trim() && !CORRECT_REGEX.test(part) && !/^Açıklama\s*:/.test(part)) qText += part.trim() + ' ';
      }
      if (optLines.length !== 4) return;

      const wrap = document.createElement('div');
      wrap.className = 'eval-question-block';
      const qDiv = document.createElement('div');
      qDiv.className = 'eval-question-text';
      qDiv.textContent = qText.replace(/\s*$/, '').replace(/\s*Doğru.*$/i, '').replace(/\s*—\s*.*$/, '').trim();
      wrap.appendChild(qDiv);

      const optsWrap = document.createElement('div');
      optsWrap.className = 'eval-options-wrap';
      optsWrap.dataset.correct = correct;
      const name = 'eval-p-' + Math.random().toString(36).slice(2, 10);
      optLines.forEach(([_, letter, txt]) => {
        const label = document.createElement('label');
        label.className = 'eval-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = letter;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + letter + ') ' + txt));
        optsWrap.appendChild(label);
      });
      wrap.appendChild(optsWrap);
      p.parentNode.insertBefore(wrap, p);
      p.style.display = 'none';
    });

    // 4) <ol><li><p>... A) B) C) D) Doğru Cevap: X ...</p></li></ol>
    inner.querySelectorAll('ol li, ul li').forEach(li => {
      const p = li.querySelector('p') || li;
      if (p.style.display === 'none' || p.querySelector('.eval-options-wrap')) return;
      let text = (p.textContent || '').trim();
      if (!/[A-D]\)\s+/.test(text) || !CORRECT_REGEX.test(text)) return;
      const correct = parseCorrect(text);
      if (!correct) return;

      const optLines = [];
      const rawLines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
      let qText = '';
      for (const line of rawLines) {
        const m = line.match(/^([A-D])\)\s*(.+)$/);
        if (m) optLines.push(m);
        else if (!line.match(CORRECT_REGEX) && !/^Açıklama\s*:/.test(line) && line) qText += line + ' ';
      }
      if (optLines.length !== 4) {
        const chunks = text.split(/\s*(?=[A-D]\)\s)/).filter(Boolean);
        chunks.forEach(ch => {
          const m2 = ch.trim().match(/^([A-D])\)\s*(.+)$/);
          if (m2 && optLines.length < 4) optLines.push(m2);
        });
      }
      if (optLines.length !== 4) return;

      const wrap = document.createElement('div');
      wrap.className = 'eval-question-block eval-list-item';
      const qDiv = document.createElement('div');
      qDiv.className = 'eval-question-text';
      qDiv.innerHTML = qText.replace(/\s*$/, '').trim();
      wrap.appendChild(qDiv);

      const optsWrap = document.createElement('div');
      optsWrap.className = 'eval-options-wrap';
      optsWrap.dataset.correct = correct;
      const name = 'eval-li-' + Math.random().toString(36).slice(2, 10);
      optLines.forEach(([_, letter, txt]) => {
        const label = document.createElement('label');
        label.className = 'eval-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = letter;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + letter + ') ' + txt));
        optsWrap.appendChild(label);
      });
      wrap.appendChild(optsWrap);

      const oldContent = p.innerHTML;
      p.innerHTML = '';
      p.appendChild(wrap);
    });

    const allOpts = inner.querySelectorAll('.eval-options-wrap');
    if (allOpts.length === 0) return;

    let btn = inner.querySelector('.eval-submit-btn');
    if (btn) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eval-submit-btn';
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Testi Gönder';
    const res = document.createElement('div');
    res.className = 'eval-result';
    btn.addEventListener('click', async () => {
      let n = 0;
      allOpts.forEach(o => {
        const sel = o.querySelector('input:checked');
        if (sel && sel.value.toUpperCase() === (o.dataset.correct || '').toUpperCase()) n++;
      });
      const total = allOpts.length;
      const wrong = total - n;
      res.innerHTML = '<strong>Sonuç: ' + n + '/' + total + ' doğru</strong>';
      res.style.display = 'block';

      // Veritabanına kaydet (giriş yapılmışsa)
      const section = inner.closest('.eval-quiz-section');
      const quizId = section?.id || section?.getAttribute('data-section') || 'quiz';
      const moduleName = typeof window.MODULE_NAME !== 'undefined' ? window.MODULE_NAME : null;
      if (localStorage.getItem('authToken') && window.APIClient?.saveQuizResult && moduleName && window.getModuleIdFromName) {
        try {
          const moduleId = await window.getModuleIdFromName(moduleName);
          if (moduleId) {
            const score = total > 0 ? Math.round((n / total) * 100) : 0;
            await window.APIClient.saveQuizResult(moduleId, quizId, score, n, wrong, [], 0);
          }
        } catch (e) { console.warn('Quiz sonucu kaydedilemedi:', e); }
      }
    });
    inner.appendChild(btn);
    inner.appendChild(res);
  }

  function addStyles() {
    const s = document.createElement('style');
    s.textContent = `
      .eval-question-block { margin: 1.25rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; }
      .eval-question-text { margin-bottom: 0.75rem; font-weight: 500; }
      .eval-options-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
      .eval-option { display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 6px; }
      .eval-option:hover { background: rgba(255,255,255,0.08); }
      .eval-option input { margin-top: 0.2rem; flex-shrink: 0; }
      .eval-submit-btn { margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary, #1e40af); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
      .eval-submit-btn:hover { background: var(--primary-light, #2563eb); }
      .eval-result { margin-top: 1rem; padding: 1rem; background: rgba(34,197,94,0.15); border-radius: 8px; }
    `;
    document.head.appendChild(s);
  }

  function init() {
    addStyles();
    document.querySelectorAll('.eval-quiz-section').forEach(processSection);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
