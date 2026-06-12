(function () {
  'use strict';

  const CORRECT_REGEX = /Doğru\s*(?:Cevap)?\s*:\s*([A-E])|Doğru:\s*([A-E])/i;
  const RATIONALE_REGEX = /Gerekçe\s*:\s*(.+)/i;
  const OPTION_LINE_REGEX = /^([A-E])\)\s*(.+)$/;

  function isValidOptionCount(n) {
    return n >= 4 && n <= 5;
  }

  function parseCorrect(text) {
    const m = String(text || '').match(CORRECT_REGEX);
    return m ? (m[1] || m[2]).toUpperCase() : null;
  }

  function stripHtmlToLine(chunk) {
    return String(chunk || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function linesFromBrHtml(html) {
    return String(html || '')
      .split(/<br\s*\/?>/i)
      .map(stripHtmlToLine)
      .filter(Boolean);
  }

  function pushOptionLine(optLines, line) {
    const m = line.match(OPTION_LINE_REGEX);
    if (!m) return false;
    optLines.push({ letter: m[1].toUpperCase(), text: m[2] });
    return true;
  }

  function parseRationale(text) {
    const m = String(text || '').match(RATIONALE_REGEX);
    return m ? m[1].trim() : '';
  }

  function extractRationaleFromUl(ul) {
    if (!ul) return '';
    var out = '';
    ul.querySelectorAll('li').forEach(function (li) {
      var t = (li.textContent || '').trim();
      if (/Gerekçe/i.test(t)) {
        out = parseRationale(t) || t.replace(/^Gerekçe\s*:\s*/i, '').trim();
      }
    });
    return out;
  }

  function createEvalQuestionBlock(qText, optLines, correct, extraClass, rationale) {
    const wrap = document.createElement('div');
    wrap.className = 'eval-question-block' + (extraClass ? ' ' + extraClass : '');

    const qDiv = document.createElement('div');
    qDiv.className = 'eval-question-text';
    qDiv.textContent = qText;
    wrap.appendChild(qDiv);

    const optsWrap = document.createElement('div');
    optsWrap.className = 'eval-options-wrap';
    optsWrap.dataset.correct = correct;
    if (rationale) optsWrap.dataset.rationale = rationale;

    const optionTexts = {};
    optLines.forEach(function (opt) {
      const letter = (opt.letter || opt[1] || '').toUpperCase();
      const txt = opt.text != null ? opt.text : opt[2];
      if (letter) optionTexts[letter] = txt;
    });
    try {
      optsWrap.dataset.optionTexts = JSON.stringify(optionTexts);
    } catch (e) {
      /* ignore */
    }

    const name = 'eval-' + Math.random().toString(36).slice(2, 10);
    optLines.forEach(function (opt) {
      const letter = (opt.letter || opt[1] || '').toUpperCase();
      const txt = opt.text != null ? opt.text : opt[2];
      const label = document.createElement('label');
      label.className = 'eval-option';
      label.dataset.letter = letter;
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = name;
      radio.value = letter;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + letter + ') ' + txt));
      optsWrap.appendChild(label);
    });
    wrap.appendChild(optsWrap);

    const feedback = document.createElement('div');
    feedback.className = 'eval-question-feedback';
    feedback.setAttribute('hidden', '');
    wrap.appendChild(feedback);

    return wrap;
  }

  function visibleQuizChildren(inner) {
    return Array.from(inner.children).filter(function (el) {
      if (!el || el.style.display === 'none') return false;
      if (el.classList.contains('eval-question-block')) return false;
      if (el.classList.contains('eval-submit-btn')) return false;
      if (el.classList.contains('eval-result')) return false;
      return true;
    });
  }

  /** <ol><li>1) Soru</li></ol><p>A)…</p>…<ul><li>Doğru: X</li> (Temel Network modül testi) */
  function processSplitFormatQuestions(inner) {
    let created = 0;
    var guard = 0;

    while (guard++ < 120) {
      const nodes = visibleQuizChildren(inner);
      const i = nodes.findIndex(function (el) {
        return el.tagName === 'OL';
      });
      if (i === -1) break;

      const el = nodes[i];
      const li = el.querySelector(':scope > li');
      if (!li) break;

      const qText = (li.textContent || '').trim().replace(/^\d+\)\s*/, '');
      const optLines = [];
      var j = i + 1;

      while (j < nodes.length && optLines.length < 5) {
        const p = nodes[j];
        if (!p || p.tagName !== 'P') break;
        const m = (p.textContent || '').trim().match(OPTION_LINE_REGEX);
        if (!m) break;
        optLines.push({ letter: m[1].toUpperCase(), text: m[2] });
        j++;
      }

      if (!isValidOptionCount(optLines.length)) break;

      var correct = null;
      var rationale = '';
      if (j < nodes.length && nodes[j].tagName === 'UL') {
        correct = parseCorrect(nodes[j].textContent || '');
        rationale = extractRationaleFromUl(nodes[j]);
        j++;
      }
      if (!correct) break;

      const block = createEvalQuestionBlock(qText, optLines, correct, 'eval-split-format', rationale);
      inner.insertBefore(block, el);
      el.style.display = 'none';
      for (var k = i + 1; k < j; k++) {
        if (nodes[k]) nodes[k].style.display = 'none';
      }
      created++;
    }

    return created;
  }

  /** <p><strong>1) Soru</strong><br />A) ... <strong>Doğru: X</strong> — gerekçe (Siber Giriş vb.) */
  function processBrParagraphQuestions(inner) {
    let created = 0;
    inner.querySelectorAll('p').forEach(function (p) {
      if (p.closest('.eval-question-block') || p.style.display === 'none') return;
      const rawHtml = p.innerHTML || '';
      if (!/<strong>\s*Doğru\s*(?:Cevap)?\s*:/i.test(rawHtml)) return;
      if (!/[A-E]\)/.test(rawHtml)) return;

      const fullText = p.textContent || '';
      const correct = parseCorrect(fullText);
      if (!correct) return;

      const parts = linesFromBrHtml(rawHtml);

      const optLines = [];
      let qText = '';
      let rationale = '';

      parts.forEach(function (line) {
        if (pushOptionLine(optLines, line)) return;
        const ratM = line.match(/Gerekçe\s*:\s*(.+)/i);
        if (ratM) {
          rationale = ratM[1].trim();
          return;
        }
        if (/^Doğru\s*:/i.test(line)) {
          if (!rationale) {
            rationale = line.replace(/^Doğru\s*:\s*[A-E]\s*[—–-]?\s*/i, '').trim();
          }
          return;
        }
        if (!qText && /^\d+\)/.test(line)) {
          qText = line.replace(/^\d+\)\s*/, '');
        } else if (!qText && line.length > 10) {
          qText = line;
        }
      });

      if (!rationale) {
        rationale = fullText.replace(/^[\s\S]*?Doğru\s*:\s*[A-E]\s*[—–-]?\s*/i, '').trim();
      }

      if (!isValidOptionCount(optLines.length) || !qText) return;

      const block = createEvalQuestionBlock(qText, optLines, correct, 'eval-br-format', rationale);
      p.parentNode.insertBefore(block, p);
      p.style.display = 'none';
      created++;
    });
    return created;
  }

  /** <ol><li><p>Soru<br />A) ... <strong>Doğru Cevap: X</strong> — Güncel Siber vb. */
  function processOlListBrQuestions(inner) {
    let created = 0;
    inner.querySelectorAll('ol > li').forEach(function (li) {
      if (li.querySelector('.eval-question-block')) return;
      const p = li.querySelector(':scope > p');
      if (!p || p.querySelector('.eval-options-wrap')) return;
      const rawHtml = p.innerHTML || '';
      if (!/[A-E]\)/.test(rawHtml) || !/Doğru/i.test(rawHtml)) return;

      const optLines = [];
      let qText = '';
      let correct = null;
      let rationale = '';

      linesFromBrHtml(rawHtml).forEach(function (line) {
        if (pushOptionLine(optLines, line)) return;
        if (/^Doğru/i.test(line)) {
          correct = parseCorrect(line);
          const inlineRat = line.replace(/^Doğru\s*(?:Cevap)?\s*:\s*[A-E]\s*[—–-]?\s*/i, '').trim();
          if (inlineRat && !/^Açıklama/i.test(inlineRat)) rationale = inlineRat;
          return;
        }
        if (/^Açıklama/i.test(line)) {
          rationale = line.replace(/^Açıklama\s*:\s*/i, '').trim();
          return;
        }
        if (!qText) qText = line.replace(/^\d+\)\s*/, '');
        else if (optLines.length === 0) qText += ' ' + line;
      });

      if (!correct) correct = parseCorrect(p.textContent || '');
      if (!isValidOptionCount(optLines.length) || !correct || !qText) return;

      const block = createEvalQuestionBlock(qText, optLines, correct, 'eval-ol-br', rationale);
      inner.insertBefore(block, li);
      li.style.display = 'none';
      created++;
    });
    return created;
  }

  /** <h3>Soru</h3><p>A)<br />...</p><p><strong>Doğru Cevap: X</strong> */
  function processH3StackQuestions(inner) {
    let created = 0;
    inner.querySelectorAll('h3').forEach(function (h3) {
      if (h3.closest('.eval-question-block') || h3.querySelector('.eval-question-block')) return;
      const optP = h3.nextElementSibling;
      if (!optP || optP.tagName !== 'P' || optP.style.display === 'none') return;
      if (!/[A-E]\)/.test(optP.innerHTML || optP.textContent || '')) return;

      const optLines = [];
      let qText = '';
      let correct = null;
      let rationale = '';
      const h3Raw = (h3.textContent || '').trim();
      const h3IsLabelOnly = /^Soru\s+\d+$/i.test(h3Raw);

      if (!h3IsLabelOnly) {
        qText = h3Raw.replace(/^\d+\)\s*/, '');
      }

      linesFromBrHtml(optP.innerHTML || '').forEach(function (line) {
        if (pushOptionLine(optLines, line)) return;
        if (/^Doğru/i.test(line)) {
          correct = parseCorrect(line);
          return;
        }
        if (/^Açıklama/i.test(line)) {
          rationale = line.replace(/^Açıklama\s*:\s*/i, '').trim();
          return;
        }
        if (!qText) qText = line.replace(/^\d+\)\s*/, '');
        else if (optLines.length === 0) qText += (qText ? ' ' : '') + line;
      });

      let answerP = optP.nextElementSibling;
      if (!correct && answerP && answerP.tagName === 'P') {
        const answerText = answerP.textContent || '';
        correct = parseCorrect(answerText);
        if (!rationale) {
          const ratM = answerText.match(/Açıklama\s*:\s*([\s\S]+)/i);
          if (ratM) rationale = ratM[1].trim();
        }
      }

      if (!isValidOptionCount(optLines.length) || !correct) return;
      if (!qText) qText = h3Raw.replace(/^\d+\)\s*/, '');

      const block = createEvalQuestionBlock(qText, optLines, correct, 'eval-h3-stack', rationale);
      inner.insertBefore(block, h3);
      h3.style.display = 'none';
      optP.style.display = 'none';
      if (answerP && answerP.tagName === 'P' && /Doğru|Açıklama/i.test(answerP.textContent || '')) {
        answerP.style.display = 'none';
      }
      created++;
    });
    return created;
  }

  function getOptionTexts(optsWrap) {
    try {
      if (optsWrap.dataset.optionTexts) {
        return JSON.parse(optsWrap.dataset.optionTexts);
      }
    } catch (e) {
      /* ignore */
    }
    const map = {};
    optsWrap.querySelectorAll('.eval-option').forEach(function (label) {
      const letter = (label.dataset.letter || '').toUpperCase();
      const t = label.textContent || '';
      const m = t.match(/^[A-E]\)\s*(.+)$/);
      if (letter && m) map[letter] = m[1].trim();
    });
    return map;
  }

  function gradeQuiz(inner) {
    const blocks = inner.querySelectorAll('.eval-question-block');
    let correctCount = 0;
    const total = blocks.length;

    blocks.forEach(function (block, idx) {
      const optsWrap = block.querySelector('.eval-options-wrap');
      const feedback = block.querySelector('.eval-question-feedback');
      if (!optsWrap || !feedback) return;

      const correctLetter = (optsWrap.dataset.correct || '').toUpperCase();
      const rationale = optsWrap.dataset.rationale || '';
      const optionTexts = getOptionTexts(optsWrap);
      const selected = optsWrap.querySelector('input:checked');
      const selectedLetter = selected ? selected.value.toUpperCase() : '';
      const isCorrect = selectedLetter && selectedLetter === correctLetter;

      if (isCorrect) correctCount++;

      optsWrap.querySelectorAll('.eval-option').forEach(function (label) {
        const letter = (label.dataset.letter || label.querySelector('input')?.value || '').toUpperCase();
        label.classList.remove('eval-option--correct', 'eval-option--wrong', 'eval-option--missed');
        const input = label.querySelector('input');
        if (input) input.disabled = true;

        if (letter === correctLetter) {
          label.classList.add('eval-option--correct');
        } else if (letter === selectedLetter) {
          label.classList.add('eval-option--wrong');
        }
      });

      block.classList.toggle('eval-question-block--correct', !!isCorrect);
      block.classList.toggle('eval-question-block--wrong', !isCorrect);

      let html =
        '<div class="eval-question-feedback__title">' +
        (isCorrect
          ? '<i class="fas fa-check-circle"></i> Doğru'
          : '<i class="fas fa-times-circle"></i> Yanlış') +
        '</div>';

      if (!isCorrect) {
        const correctText = optionTexts[correctLetter] || '';
        html +=
          '<p class="eval-question-feedback__answer"><strong>Doğru cevap:</strong> ' +
          correctLetter +
          ') ' +
          escapeHtml(correctText) +
          '</div>';
      }

      if (rationale) {
        html +=
          '<p class="eval-question-feedback__rationale"><strong>Açıklama:</strong> ' +
          escapeHtml(rationale) +
          '</div>';
      } else if (!isCorrect && selectedLetter) {
        html +=
          '<p class="eval-question-feedback__rationale">Seçiminiz: ' +
          selectedLetter +
          ') ' +
          escapeHtml(optionTexts[selectedLetter] || '') +
          '</div>';
      }

      feedback.innerHTML = html;
      feedback.removeAttribute('hidden');
    });

    return { correctCount, total };
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function attachSubmitButton(inner) {
    const allOpts = inner.querySelectorAll('.eval-options-wrap');
    if (allOpts.length === 0) return;

    let btn = inner.querySelector('.eval-submit-btn');
    if (btn) btn.remove();
    let res = inner.querySelector('.eval-result');
    if (res) res.remove();

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eval-submit-btn';
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Testi Gönder';

    res = document.createElement('div');
    res.className = 'eval-result';

    btn.addEventListener('click', async function () {
      const unanswered = Array.from(allOpts).filter(function (o) {
        return !o.querySelector('input:checked');
      });
      if (unanswered.length) {
        res.className = 'eval-result eval-result--warn';
        res.innerHTML =
          '<strong><i class="fas fa-exclamation-triangle"></i> Lütfen tüm soruları yanıtlayın.</strong> (' +
          unanswered.length +
          ' soru boş)';
        res.style.display = 'block';
        res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      const { correctCount, total } = gradeQuiz(inner);
      const wrong = total - correctCount;
      const pct = total ? Math.round((correctCount / total) * 100) : 0;

      res.className = 'eval-result';
      res.innerHTML =
        '<strong><i class="fas fa-chart-pie"></i> Sonuç: ' +
        correctCount +
        '/' +
        total +
        ' doğru (' +
        pct +
        '%)</strong>' +
        '<p class="eval-result__hint">Her sorunun altında doğru/yanlış durumu ve gerekirse doğru cevap gösterilir.</p>';
      res.style.display = 'block';
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      const section = inner.closest('.eval-quiz-section') || inner.closest('.content-section');
      const quizId =
        section?.id || section?.getAttribute('data-section') || inner.id || 'quiz';
      const moduleName =
        typeof window.MODULE_NAME !== 'undefined' ? window.MODULE_NAME : null;
      if (
        localStorage.getItem('authToken') &&
        window.APIClient?.saveQuizResult &&
        moduleName &&
        window.getModuleIdFromName
      ) {
        try {
          const moduleId = await window.getModuleIdFromName(moduleName);
          if (moduleId) {
            const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            await window.APIClient.saveQuizResult(
              moduleId,
              quizId,
              score,
              correctCount,
              wrong,
              [],
              0
            );
          }
        } catch (e) {
          console.warn('Quiz sonucu kaydedilemedi:', e);
        }
      }
    });

    inner.appendChild(btn);
    inner.appendChild(res);
  }

  function enrichQuestionBlock(wrap, correct, rationale, optLines) {
    const optsWrap = wrap.querySelector('.eval-options-wrap');
    if (!optsWrap) return;
    if (rationale && !optsWrap.dataset.rationale) optsWrap.dataset.rationale = rationale;
    if (!optsWrap.dataset.optionTexts && optLines) {
      const optionTexts = {};
      optLines.forEach(function (pair) {
        const letter = (pair[1] || pair.letter || '').toUpperCase();
        const txt = pair[2] != null ? pair[2] : pair.text;
        if (letter) optionTexts[letter] = txt;
      });
      try {
        optsWrap.dataset.optionTexts = JSON.stringify(optionTexts);
      } catch (e2) {
        /* ignore */
      }
    }
    optsWrap.querySelectorAll('.eval-option').forEach(function (label) {
      const input = label.querySelector('input');
      const letter = input ? input.value.toUpperCase() : '';
      if (letter) label.dataset.letter = letter;
    });
    if (!wrap.querySelector('.eval-question-feedback')) {
      const feedback = document.createElement('div');
      feedback.className = 'eval-question-feedback';
      feedback.setAttribute('hidden', '');
      wrap.appendChild(feedback);
    }
  }

  function processSection(section) {
    if (!section) return 0;
    const inner = section.querySelector('.section-inner') || section;
    if (
      inner.getAttribute('data-sebs-quiz-processed') === '1' &&
      inner.querySelector('.eval-options-wrap')
    ) {
      if (!inner.querySelector('.eval-submit-btn')) {
        attachSubmitButton(inner);
      }
      return inner.querySelectorAll('.eval-question-block').length;
    }
    inner.removeAttribute('data-sebs-quiz-processed');

    var created =
      processSplitFormatQuestions(inner) +
      processOlListBrQuestions(inner) +
      processH3StackQuestions(inner) +
      processBrParagraphQuestions(inner);

    inner.querySelectorAll('p').forEach(function (p) {
      const t = (p.textContent || '').trim();
      if (t && (t.match(CORRECT_REGEX) || /^Açıklama\s*:/.test(t)) && t.length < 300) {
        p.style.display = 'none';
      }
    });

    inner.querySelectorAll('p').forEach(function (p) {
      if (p.style.display === 'none' || p.closest('.eval-question-block')) return;
      const text = p.textContent || '';
      if (!/^\s*\d+\)/.test(text) || !/[A-E]\)\s*/.test(text) || !CORRECT_REGEX.test(text)) {
        return;
      }
      const correct = parseCorrect(text);
      if (!correct) return;

      const optLines = [];
      const parts = text.split(/\n/);
      let qText = '';
      let rationale = '';
      for (const part of parts) {
        const m = part.trim().match(OPTION_LINE_REGEX);
        if (m) optLines.push({ letter: m[1], text: m[2] });
        else if (part.trim() && !CORRECT_REGEX.test(part) && !/^Açıklama\s*:/.test(part)) {
          qText += part.trim() + ' ';
        } else if (/Gerekçe/i.test(part)) {
          rationale = parseRationale(part) || part.replace(/^Gerekçe\s*:\s*/i, '').trim();
        }
      }
      if (!isValidOptionCount(optLines.length)) return;

      const wrap = createEvalQuestionBlock(
        qText.replace(/\s*$/, '').replace(/\s*Doğru.*$/i, '').trim(),
        optLines,
        correct,
        '',
        rationale
      );
      p.parentNode.insertBefore(wrap, p);
      p.style.display = 'none';
    });

    inner.querySelectorAll('.eval-question-block').forEach(function (block) {
      const optsWrap = block.querySelector('.eval-options-wrap');
      if (!optsWrap || block.querySelector('.eval-question-feedback')) return;
      const feedback = document.createElement('div');
      feedback.className = 'eval-question-feedback';
      feedback.setAttribute('hidden', '');
      block.appendChild(feedback);
      optsWrap.querySelectorAll('.eval-option').forEach(function (label) {
        const input = label.querySelector('input');
        if (input) label.dataset.letter = input.value.toUpperCase();
      });
    });

    attachSubmitButton(inner);
    if (inner.querySelectorAll('.eval-options-wrap').length) {
      inner.setAttribute('data-sebs-quiz-processed', '1');
    }
    return created;
  }

  function addStyles() {
    if (document.getElementById('sebs-quiz-exam-styles')) return;
    const s = document.createElement('style');
    s.id = 'sebs-quiz-exam-styles';
    s.textContent = `
      .eval-question-block { margin: 1.25rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
      body.landing-site-body .eval-question-block,
      body.module-page--temel-network .eval-question-block,
      body.module-page--temel-siber .eval-question-block { background: #f8fafc; border-color: #e2e8f0; }
      body.landing-site-body .eval-option:hover,
      body.module-page--temel-network .eval-option:hover { background: #f1f5f9; }
      .eval-question-block--correct { border-color: rgba(34, 197, 94, 0.45); background: rgba(34, 197, 94, 0.08); }
      .eval-question-block--wrong { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06); }
      .eval-question-text { margin-bottom: 0.75rem; font-weight: 500; }
      .eval-options-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
      .eval-option { display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid transparent; }
      .eval-option:hover { background: rgba(255,255,255,0.08); }
      .eval-option input { margin-top: 0.2rem; flex-shrink: 0; }
      .eval-option--correct { background: rgba(34, 197, 94, 0.18) !important; border-color: rgba(34, 197, 94, 0.5) !important; font-weight: 600; }
      .eval-option--wrong { background: rgba(239, 68, 68, 0.15) !important; border-color: rgba(239, 68, 68, 0.45) !important; }
      .eval-question-feedback { margin-top: 0.75rem; padding: 0.65rem 0.85rem; border-radius: 6px; font-size: 0.9rem; line-height: 1.45; }
      .eval-question-block--correct .eval-question-feedback { background: rgba(34, 197, 94, 0.12); color: #166534; }
      .eval-question-block--wrong .eval-question-feedback { background: rgba(239, 68, 68, 0.1); color: #991b1b; }
      .eval-question-feedback__title { font-weight: 700; margin-bottom: 0.35rem; }
      .eval-question-feedback__answer { margin: 0.25rem 0; }
      .eval-question-feedback__rationale { margin: 0.35rem 0 0; opacity: 0.95; }
      .eval-submit-btn { margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary, #1e40af); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
      .eval-submit-btn:hover { background: var(--primary-light, #2563eb); }
      .eval-result { margin-top: 1rem; padding: 1rem; background: rgba(34,197,94,0.15); border-radius: 8px; }
      .eval-result--warn { background: rgba(251, 191, 36, 0.2); color: #92400e; }
      .eval-result__hint { margin: 0.5rem 0 0; font-size: 0.88rem; opacity: 0.9; }
    `;
    document.head.appendChild(s);
  }

  function init() {
    addStyles();
    document.querySelectorAll('.eval-quiz-section').forEach(processSection);
  }

  function scheduleInit() {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () {
        requestAnimationFrame(init);
      });
    } else {
      setTimeout(init, 0);
    }
  }

  window.SebsQuizExam = {
    init: init,
    scheduleInit: scheduleInit,
    processSection: processSection,
    processAll: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit);
  } else {
    scheduleInit();
  }

  window.addEventListener('sebs-lesson-cards-ready', scheduleInit);
})();
