const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const ML_DIR = path.join(__dirname, '..', 'ml');
const PREDICT_SCRIPT = path.join(ML_DIR, 'predict_student_profile.py');
const REPO_VENV_PYTHON = path.join(__dirname, '..', '..', '.venv-ml', 'bin', 'python3');

const DEFAULT_MODULE_NAME = 'Siber Güvenliğe Giriş';

/** Model eğitiminde kullanılan modül adlarına yakın eşleme */
const MODULE_TITLE_ALIASES = {
    'siber guvenlige giris': 'Siber Güvenliğe Giriş',
    'guncel siber guvenlige giris': 'Güncel Siber Güvenliğe Giriş',
    'temel siber guvenlik': 'Temel Siber Güvenlik',
    'temel network egitimi': 'Temel Network Eğitimi',
    'temel kriptografi': 'Temel Kriptografi',
    'network guvenligi': 'Network Güvenliği',
};

const PROFILE_INTERPRETATIONS = {
    Dengeli: {
        summary:
            'Yapay zeka modelimiz, teori ve pratik performansınızın dengeli olduğunu gösteriyor. Hem quiz hem simülasyon tarafında tutarlı bir profil sergiliyorsunuz.',
        strengths: [
            'Teori ve uygulama skorlarınız birbirine yakın.',
            'Öğrenme sürecinde istikrarlı ilerleme.',
        ],
        weaknesses: [],
        recommendations: [
            'Mevcut tempoyu koruyarak ileri modüllere geçebilirsiniz.',
            'Zor simülasyonlarda küçük hedeflerle pratiği sürdürün.',
        ],
    },
    'Gelişime Açık (Temel Eksik)': {
        summary:
            'Model, temel teorik ve pratik becerilerin henüz güçlendirilmesi gerektiğini öngörüyor. Düzenli tekrar ve rehberli simülasyonlar hızlı ilerleme sağlar.',
        strengths: ['Platforma yeni başlayanlar için tipik bir profil; gelişim alanı net.'],
        weaknesses: [
            'Quiz ve/veya simülasyon skorları hedef aralığın altında.',
            'Temel kavramlarda tekrar ihtiyacı olabilir.',
        ],
        recommendations: [
            'Temel Siber Güvenlik ve Giriş modüllerini baştan sona tekrar edin.',
            'Simülasyonlarda ipucu kullanımını azaltarak adım adım ilerleyin.',
        ],
    },
    'Pratik Zeka (Teorisi Zayıf)': {
        summary:
            'Simülasyon ve uygulama tarafında güçlüsünüz; teorik quiz performansınız modelde daha düşük görünüyor.',
        strengths: ['Pratik ve senaryo tabanlı görevlerde iyi performans potansiyeli.'],
        weaknesses: ['Teorik quiz ortalaması pratik skorunuzun gerisinde.'],
        recommendations: [
            'Modül ders notlarını ve değerlendirme testlerini tekrar çözün.',
            'Her simülasyon öncesi ilgili ders bölümünü kısa özetleyin.',
        ],
    },
    'Teorisyen (Pratiği Zayıf)': {
        summary:
            'Teorik bilginiz güçlü; simülasyon ve uygulama pratiğinde model daha fazla gelişim alanı görüyor.',
        strengths: ['Quiz ve teorik değerlendirmelerde iyi sonuçlar.'],
        weaknesses: ['Simülasyon skorları veya hata sayısı teorik seviyenin altında kalıyor.'],
        recommendations: [
            'Temel simülasyonları tekrar oynayın; yanlış aksiyonları not alın.',
            'Lab ortamında adım adım senaryo çözümüne odaklanın.',
        ],
    },
    'Uzman (Eksiksiz)': {
        summary:
            'Hem teori hem pratikte yüksek performans — model sizi eksiksiz uzman profili olarak sınıflandırdı.',
        strengths: [
            'Yüksek quiz ve simülasyon ortalamaları.',
            'Düşük hata ve kontrollü ipucu kullanımı.',
        ],
        weaknesses: [],
        recommendations: [
            'İleri seviye modül ve simülasyonlara yönelin.',
            'Mentorluk veya ekip çalışması senaryolarını deneyin.',
        ],
    },
};

function normalizeTitleKey(title) {
    return String(title || '')
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function resolveModuleNameForModel(title) {
    const raw = String(title || '').trim();
    if (!raw) return DEFAULT_MODULE_NAME;
    const key = normalizeTitleKey(raw);
    if (MODULE_TITLE_ALIASES[key]) return MODULE_TITLE_ALIASES[key];
    return raw.slice(0, 120);
}

function resolvePythonExecutable() {
    const fromEnv = (process.env.STUDENT_ML_PYTHON || '').trim();
    if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
    if (fs.existsSync(REPO_VENV_PYTHON)) return REPO_VENV_PYTHON;
    return 'python3';
}

function predictStudentProfile(features) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(PREDICT_SCRIPT)) {
            return reject(new Error('predict_student_profile.py bulunamadı'));
        }
        const python = resolvePythonExecutable();
        const proc = spawn(python, [PREDICT_SCRIPT], {
            cwd: ML_DIR,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });
        proc.on('error', (err) => reject(err));
        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(stderr.trim() || `Python çıkış kodu ${code}`));
            }
            try {
                const parsed = JSON.parse(stdout.trim() || '{}');
                if (!parsed.ok) {
                    return reject(new Error(parsed.error || 'ML tahmin başarısız'));
                }
                resolve(parsed);
            } catch (e) {
                reject(new Error(`ML JSON ayrıştırılamadı: ${e.message}`));
            }
        });
        proc.stdin.write(JSON.stringify(features));
        proc.stdin.end();
    });
}

function pickDominantModuleId(progressRows, quizResults, simulationRows) {
    const scores = new Map();
    for (const row of progressRows || []) {
        const id = row.module_id;
        if (!id) continue;
        const pct = Number(row.percent_complete) || 0;
        const mins = Number(row.time_spent_minutes) || 0;
        scores.set(id, (scores.get(id) || 0) + pct * 2 + mins * 0.1);
    }
    for (const q of quizResults || []) {
        if (q.moduleId) scores.set(q.moduleId, (scores.get(q.moduleId) || 0) + 5);
    }
    for (const s of simulationRows || []) {
        if (s.moduleId) scores.set(s.moduleId, (scores.get(s.moduleId) || 0) + 3);
    }
    let best = null;
    let bestScore = -1;
    for (const [id, sc] of scores) {
        if (sc > bestScore) {
            bestScore = sc;
            best = id;
        }
    }
    return best;
}

async function resolveModuleTitle(pool, moduleId) {
    if (!moduleId || !pool) return DEFAULT_MODULE_NAME;
    try {
        const r = await pool.query('SELECT title FROM modules WHERE id = $1 LIMIT 1', [moduleId]);
        if (r.rows[0] && r.rows[0].title) return r.rows[0].title;
    } catch (e) {
        logger.warn('ML modül başlığı alınamadı:', e.message);
    }
    return DEFAULT_MODULE_NAME;
}

function buildMlFeatures({
    moduleName,
    theoryScore,
    practiceScore,
    hintUsedCount,
    wrongActionsCount,
    timeSpentMins,
}) {
    return {
        module_name: resolveModuleNameForModel(moduleName),
        theory_score: Math.round(Math.max(0, Math.min(100, theoryScore)) * 100) / 100,
        practice_score: Math.round(Math.max(0, Math.min(100, practiceScore)) * 100) / 100,
        hint_used_count: Math.max(0, Math.floor(hintUsedCount || 0)),
        wrong_actions_count: Math.max(0, Math.floor(wrongActionsCount || 0)),
        time_spent_mins: Math.max(0, Math.floor(timeSpentMins || 0)),
    };
}

function applyProfileToInterpretation(report, mlResult) {
    const profile = mlResult.profile;
    const copy = PROFILE_INTERPRETATIONS[profile] || {
        summary: `Yapay zeka öğrenme profiliniz: ${profile}.`,
        strengths: [],
        weaknesses: [],
        recommendations: [],
    };
    const confidence = mlResult.probabilities && mlResult.probabilities[profile] != null
        ? Math.round(mlResult.probabilities[profile] * 1000) / 10
        : null;

    report.ml = {
        available: true,
        profile,
        confidencePercent: confidence,
        probabilities: mlResult.probabilities || {},
        features: mlResult.features || {},
        modelVersion: mlResult.modelVersion || 'xgboost_student_model_noisy',
    };

    const mlLine = copy.summary + (confidence != null ? ` (Güven: %${confidence})` : '');
    report.interpretation.mlProfile = mlLine;
    report.interpretation.overall = mlLine + (report.interpretation.overall ? '\n\n' + report.interpretation.overall : '');

    if (copy.strengths.length) {
        report.interpretation.strengths = [...new Set([...copy.strengths, ...(report.interpretation.strengths || [])])];
    }
    if (copy.weaknesses.length) {
        report.interpretation.weaknesses = [...new Set([...copy.weaknesses, ...(report.interpretation.weaknesses || [])])];
    }
    if (copy.recommendations.length) {
        report.interpretation.recommendations = [
            ...new Set([...copy.recommendations, ...(report.interpretation.recommendations || [])]),
        ];
    }
}

async function enrichEvaluationReportWithMl(report, ctx) {
    const { pool, progressRows, quizResults, simulationRows } = ctx;
    const quizScores = (quizResults || []).map((q) => q.score).filter((s) => typeof s === 'number');
    const simScores = (simulationRows || []).map((s) => s.score).filter((s) => typeof s === 'number');
    const theoryScore = quizScores.length
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : report.scores?.quizAverage || 0;
    const practiceScore = simScores.length
        ? simScores.reduce((a, b) => a + b, 0) / simScores.length
        : report.scores?.simulationAverage || 0;

    let hintUsed = 0;
    let wrongActions = 0;
    let simMinutes = 0;
    for (const row of simulationRows || []) {
        hintUsed += Number(row.hintUsedCount) || 0;
        wrongActions += Number(row.wrongActionsCount) || 0;
        const ts = Number(row.timeSpent) || 0;
        simMinutes += ts > 500 ? Math.round(ts / 60) : ts;
    }

    const dominantId = pickDominantModuleId(progressRows, quizResults, simulationRows);
    const moduleTitle = await resolveModuleTitle(pool, dominantId);
    const features = buildMlFeatures({
        moduleName: moduleTitle,
        theoryScore,
        practiceScore,
        hintUsedCount: hintUsed,
        wrongActionsCount: wrongActions,
        timeSpentMins: (report.scores?.totalTimeMinutes || 0) + simMinutes,
    });

    try {
        const mlResult = await predictStudentProfile(features);
        applyProfileToInterpretation(report, mlResult);
    } catch (err) {
        logger.warn('Öğrenci ML raporu atlandı:', err.message);
        report.ml = { available: false, error: err.message, features };
    }
}

module.exports = {
    enrichEvaluationReportWithMl,
    buildMlFeatures,
    predictStudentProfile,
    resolveModuleNameForModel,
    PROFILE_INTERPRETATIONS,
};
