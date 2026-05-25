/**
 * Öğrenci için modül/quiz/simülasyon bazlı ayrıntılı değerlendirme raporu metinleri.
 */

const SIMULATION_LABELS = {
    'temel-siber-guvenlik': 'Temel Siber Güvenlik (CTF)',
    'siber-guvenlige-giris': 'Siber Güvenliğe Giriş',
    'temel-network-misafir-ag-karar': 'Temel Network — Misafir Ağ Kararı',
    'temel-network-simulasyonlari': 'Temel Network Simülasyonları',
    'linux-forensik-lab': 'Linux Forensik Lab',
    'kayit-haftasi-krizi': 'Kayıt Haftası Krizi',
    'bir-seyler-yanlis-ama-ne': 'Bir Şeyler Yanlış Ama Ne?',
    'kor-nokta-soc-simulasyonu': 'Kör Nokta SOC Simülasyonu',
    'malware-analizi': 'Malware Analizi',
    'incident-response': 'Olay Müdahalesi',
    'network-guvenligi': 'Network Güvenliği',
    'web-app-security': 'Web Uygulama Güvenliği',
    'threat-hunting': 'Threat Hunting',
    'penetration-testing': 'Penetrasyon Testi',
    'semptom-etki-zinciri': 'Semptom–Etki Zinciri',
    'bexacmp-kriptografik-dayaniklilik-kriz-masasi': 'Kriptografik Dayanıklılık Kriz Masası',
};

function humanizeSlug(slug) {
    if (!slug) return 'Bilinmeyen';
    const s = String(slug);
    if (SIMULATION_LABELS[s]) return SIMULATION_LABELS[s];
    return s
        .replace(/\.html$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function moduleStatus(percent, quizAvg, simBest, hasActivity) {
    if (!hasActivity && (percent || 0) < 5) return 'not_started';
    if ((quizAvg != null && quizAvg < 55) || (simBest != null && simBest < 55)) return 'weak';
    if ((percent || 0) >= 85 && (quizAvg == null || quizAvg >= 70) && (simBest == null || simBest >= 70)) {
        return 'strong';
    }
    if ((percent || 0) > 0) return 'in_progress';
    return 'in_progress';
}

function statusLabelTr(status) {
    const map = {
        not_started: 'Başlanmadı',
        in_progress: 'Devam ediyor',
        weak: 'Geliştirilmeli',
        strong: 'Güçlü',
    };
    return map[status] || status;
}

function analyzeQuizEntry(q) {
    const score = Number(q.score) || 0;
    const correct = Number(q.correctAnswers) || 0;
    const wrong = Number(q.wrongAnswers) || 0;
    const total = correct + wrong;
    const lines = [];
    if (total > 0) {
        lines.push(
            `${total} sorudan ${correct} doğru, ${wrong} yanlış (%${Math.round(score)} başarı).`
        );
        if (wrong > 0) {
            lines.push(
                `Bu bölümde ${wrong} kavram hatası tespit edildi; ilgili dersi ve açıklamaları tekrar okumanız önerilir.`
            );
        }
    } else if (score > 0) {
        lines.push(`Değerlendirme skoru: %${Math.round(score)}.`);
    } else {
        lines.push('Quiz tamamlanmış ancak detay skoru kayıtlı değil.');
    }
    if (score < 60) {
        lines.push('Temel kavramlarda eksiklik olabilir — konu anlatımını ve örnekleri yeniden çalışın.');
    } else if (score < 80) {
        lines.push('Orta seviye — bir kez daha test çözerek pekiştirme yapın.');
    } else {
        lines.push('Teorik tarafta iyi bir seviye gösteriyorsunuz.');
    }
    return lines.join(' ');
}

function analyzeSimulationEntry(s) {
    const score = Number(s.score) || 0;
    const wrongs = Number(s.wrongActionsCount) || 0;
    const hints = Number(s.hintUsedCount) || 0;
    const lines = [];
    lines.push(`Simülasyon skoru: %${Math.round(score)}.`);
    if (wrongs > 0) {
        lines.push(
            `${wrongs} hatalı aksiyon — senaryoda yanlış komut, eksik adım veya güvenlik ihlali yapılmış olabilir.`
        );
    }
    if (hints > 0) {
        lines.push(
            `${hints} ipucu kullanıldı — bağımsız çözüm için ipucusuz tekrar denemeniz faydalıdır.`
        );
    }
    if (s.finalGradeLabel) {
        lines.push(`Simülasyon notu: ${s.finalGradeLabel}.`);
    }
    if (score < 60) {
        lines.push('Pratik uygulama tarafında tekrar ve adım adım senaryo çalışması gerekli.');
    } else if (score < 80) {
        lines.push('Kabul edilebilir pratik seviye; mükemmelleştirmek için senaryoyu bir kez daha oynayın.');
    } else {
        lines.push('Simülasyonda güçlü performans.');
    }
    return lines.join(' ');
}

function buildTheoryPracticeNarrative(theory, practice, mlProfile) {
    const gap = Math.round((theory - practice) * 10) / 10;
    let explanation;
    if (theory === 0 && practice > 0) {
        explanation =
            'Henüz modül değerlendirme testi (quiz) çözmemiş veya sonuçlar kaydedilmemiş görünüyorsunuz; simülasyon tarafında ise aktivite var. ' +
            'Bu durumda model sizi pratik ağırlıklı değerlendirir ancak teorik temel eksikliği riski yüksektir.';
    } else if (gap > 15) {
        explanation =
            `Teori ortalamanız (%${Math.round(theory)}) pratikten (%${Math.round(practice)}) belirgin şekilde yüksek. ` +
            'Bilgiyi biliyorsunuz; uygulama ve simülasyon tekrarı ile beceriyi pekiştirmelisiniz.';
    } else if (gap < -15) {
        explanation =
            `Pratik skorunuz (%${Math.round(practice)}) teorik quiz ortalamanızdan (%${Math.round(theory)}) yüksek. ` +
            'Uygulamada iyisiniz; modül testleri ve ders notları ile teorik boşlukları kapatın.';
    } else {
        explanation =
            `Teori (%${Math.round(theory)}) ve pratik (%${Math.round(practice)}) birbirine yakın — dengeli veya gelişime açık bir profil.`;
    }
    if (mlProfile) {
        explanation += ` Yapay zeka öğrenme profiliniz: «${mlProfile}».`;
    }
    return { theory, practice, gap, explanation };
}

async function loadModulesCatalog(pool) {
    try {
        const sch = await pool.query(
            `SELECT column_name FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'modules'`
        );
        const cols = new Set(sch.rows.map((r) => r.column_name));
        const activeWhere = cols.has('is_active') ? 'WHERE is_active = true' : '';
        const orderBy = cols.has('sort_order') ? 'ORDER BY sort_order NULLS LAST, id' : 'ORDER BY id';
        const r = await pool.query(`SELECT id, title, description, level FROM modules ${activeWhere} ${orderBy}`);
        return r.rows.map((m) => ({
            id: m.id,
            title: m.title || 'Modül',
            description: m.description || '',
            level: m.level || 'beginner',
        }));
    } catch (e) {
        return [];
    }
}

function buildDetailedEvaluationReport(ctx) {
    const {
        user,
        progressRows = [],
        quizResults = [],
        simulationResults = [],
        modulesCatalog = [],
        report = {},
    } = ctx;

    const progressByModule = new Map();
    for (const row of progressRows) {
        progressByModule.set(row.module_id, {
            percentComplete: Number(row.percent_complete) || 0,
            timeSpentMinutes: Number(row.time_spent_minutes) || 0,
            updatedAt: row.updated_at,
        });
    }

    const titleById = new Map(modulesCatalog.map((m) => [m.id, m.title]));

    const quizzesByModule = new Map();
    for (const q of quizResults) {
        const mid = q.moduleId;
        if (!quizzesByModule.has(mid)) quizzesByModule.set(mid, []);
        quizzesByModule.get(mid).push(q);
    }

    const simsByModule = new Map();
    for (const s of simulationResults) {
        const mid = s.moduleId || '_general';
        if (!simsByModule.has(mid)) simsByModule.set(mid, []);
        simsByModule.get(mid).push(s);
    }

    const moduleIds = new Set([
        ...modulesCatalog.map((m) => m.id),
        ...progressByModule.keys(),
        ...quizResults.map((q) => q.moduleId).filter(Boolean),
        ...simulationResults.map((s) => s.moduleId).filter(Boolean),
    ]);

    const modules = [];
    const globalGaps = [];
    const advice = [];

    for (const moduleId of moduleIds) {
        if (!moduleId || moduleId === '_general') continue;
        const title = titleById.get(moduleId) || `Modül #${moduleId}`;
        const prog = progressByModule.get(moduleId) || { percentComplete: 0, timeSpentMinutes: 0 };
        const quizzes = quizzesByModule.get(moduleId) || [];
        const sims = simsByModule.get(moduleId) || [];

        const quizScores = quizzes.map((q) => Number(q.score) || 0).filter((n) => n >= 0);
        const quizAvg = quizScores.length
            ? Math.round((quizScores.reduce((a, b) => a + b, 0) / quizScores.length) * 10) / 10
            : null;
        const simScores = sims.map((s) => Number(s.score) || 0);
        const simBest = simScores.length ? Math.max(...simScores) : null;

        const hasActivity =
            quizzes.length > 0 || sims.length > 0 || prog.percentComplete > 0 || prog.timeSpentMinutes > 0;
        const status = moduleStatus(prog.percentComplete, quizAvg, simBest, hasActivity);

        const issues = [];
        const recommendations = [];

        if (status === 'not_started') {
            issues.push('Bu modüle henüz anlamlı ilerleme veya ölçüm kaydı düşmemiş.');
            recommendations.push(`«${title}» modülünü açın; en az bir ders + değerlendirme testi tamamlayın.`);
        }
        if (prog.percentComplete > 0 && prog.percentComplete < 50 && quizzes.length === 0) {
            issues.push('Modülde ilerleme var ancak quiz sonucu yok — teorik seviye ölçülemiyor.');
            recommendations.push('Modül sonundaki değerlendirme testini mutlaka gönderin (sonuçlar rapora yansır).');
        }
        if (quizAvg != null && quizAvg < 60) {
            issues.push(`Quiz ortalaması düşük (%${quizAvg}) — ders içi kavramlarda eksiklik.`);
            recommendations.push('Yanlış yaptığınız soruların altındaki açıklamaları okuyun; testi tekrar çözün.');
        }
        if (simBest != null && simBest < 60) {
            issues.push(`Simülasyon performansı zayıf (en iyi: %${simBest}).`);
            recommendations.push('Simülasyonu ipucusuz tekrarlayın; her hatalı adımı not alın.');
        }

        const totalWrongs = sims.reduce((a, s) => a + (Number(s.wrongActionsCount) || 0), 0);
        const totalHints = sims.reduce((a, s) => a + (Number(s.hintUsedCount) || 0), 0);
        if (totalWrongs >= 10) {
            issues.push(`Toplam ${totalWrongs} hatalı simülasyon aksiyonu — pratik karar verme alışkanlığı geliştirilmeli.`);
        }
        if (totalHints >= 5) {
            issues.push(`Toplam ${totalHints} ipucu kullanımı — bağımsız problem çözme pratiği artırılmalı.`);
        }

        modules.push({
            moduleId,
            title,
            percentComplete: prog.percentComplete,
            timeSpentMinutes: prog.timeSpentMinutes,
            status,
            statusLabel: statusLabelTr(status),
            quizAverage: quizAvg,
            simulationBest: simBest,
            quizzes: quizzes.map((q) => ({
                quizId: q.quizId,
                quizTitle: humanizeSlug(q.quizId),
                score: q.score,
                correctAnswers: q.correctAnswers,
                wrongAnswers: q.wrongAnswers,
                timeSpent: q.timeSpent,
                analysis: analyzeQuizEntry(q),
            })),
            simulations: sims.map((s) => ({
                simulationId: s.simulationId,
                title: humanizeSlug(s.simulationId),
                score: s.score,
                wrongActionsCount: s.wrongActionsCount,
                hintUsedCount: s.hintUsedCount,
                finalGradeLabel: s.finalGradeLabel,
                completedAt: s.completedAt,
                analysis: analyzeSimulationEntry(s),
            })),
            issues,
            recommendations,
        });
    }

    modules.sort((a, b) => {
        const order = { weak: 0, in_progress: 1, not_started: 2, strong: 3 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.title.localeCompare(b.title, 'tr');
    });

    const startedIds = new Set(
        [...progressByModule.entries()]
            .filter(([, p]) => p.percentComplete > 0 || p.timeSpentMinutes > 0)
            .map(([id]) => id)
    );
    const unstartedModules = modulesCatalog
        .filter((m) => !startedIds.has(m.id) && !(quizzesByModule.has(m.id) || simsByModule.has(m.id)))
        .map((m) => ({
            moduleId: m.id,
            title: m.title,
            reason:
                'Henüz bu modülde kayıtlı ilerleme, quiz veya simülasyon yok. Öğrenme yol haritanızda boşluk oluşturabilir.',
        }));

    if (unstartedModules.length > 0) {
        globalGaps.push({
            severity: 'medium',
            type: 'unstarted_modules',
            title: 'Başlanmamış modüller',
            description: `${unstartedModules.length} modülde henüz ölçülebilir aktivite yok.`,
        });
    }

    const scores = report.scores || {};
    if ((scores.quizCount || 0) === 0 && (scores.simulationCount || 0) > 0) {
        globalGaps.push({
            severity: 'high',
            type: 'missing_quizzes',
            title: 'Teorik ölçüm eksik',
            description:
                'Simülasyon veriniz var ancak quiz kaydı yok. Değerlendirme testlerini göndermezseniz hangi derste hangi konuda yanlış yaptığınız rapora işlenmez.',
        });
        advice.push('Her tamamladığınız modülde «Testi Gönder» ile quiz sonucunu kaydedin.');
    }

    if ((scores.overall || 0) < 60 && (scores.quizCount || 0) + (scores.simulationCount || 0) > 0) {
        globalGaps.push({
            severity: 'high',
            type: 'low_overall',
            title: 'Genel performans hedefin altında',
            description: `Genel skor %${scores.overall}. Temel modüllerde sistematik tekrar önerilir.`,
        });
    }

    const weakModules = modules.filter((m) => m.status === 'weak');
    for (const m of weakModules.slice(0, 5)) {
        advice.push(`Öncelik: «${m.title}» — ${m.issues[0] || 'quiz ve simülasyon tekrarı'}`);
    }

    if (report.ml && report.ml.profile) {
        advice.push(`AI profil hedefi (${report.ml.profile}): ${(report.interpretation && report.interpretation.recommendations && report.interpretation.recommendations[0]) || 'haftalık plana uygun çalışın'}`);
    }

    if (advice.length < 3) {
        advice.push('Haftada en az 2 modül dersi + 1 simülasyon tamamlayın.');
        advice.push('Zayıf gördüğünüz bölümlerde not alın; aynı hatayı üçüncü kez yapmayın.');
    }

    const studyPlan = [];
    let week = 1;
    for (const m of weakModules.slice(0, 3)) {
        studyPlan.push({
            week,
            focus: m.title,
            actions: [
                `Modül ilerlemesi: %${m.percentComplete} → hedef %${Math.min(100, m.percentComplete + 25)}`,
                m.quizzes.length
                    ? 'Mevcut quizleri tekrar çözün; yanlış soruların konu başlıklarını listeleyin.'
                    : 'İlk değerlendirme testini tamamlayıp gönderin.',
                m.simulations.length
                    ? 'Son simülasyonu ipucusuz tekrar oynayın.'
                    : 'Modüle bağlı en az bir simülasyon tamamlayın.',
            ],
        });
        week += 1;
    }
    if (unstartedModules.length > 0 && studyPlan.length < 4) {
        const u = unstartedModules[0];
        studyPlan.push({
            week,
            focus: u.title,
            actions: ['Modüle giriş derslerini izleyin/okuyun.', 'İlk quiz veya mini testi tamamlayın.'],
        });
    }

    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Öğrenci';
    const theory = scores.quizAverage || 0;
    const practice = scores.simulationAverage || 0;
    const tvp = buildTheoryPracticeNarrative(theory, practice, report.ml && report.ml.profile);

    let executiveSummary = `${userName}, platformdaki quiz, modül ilerlemesi ve simülasyon verileriniz analiz edildi. `;
    executiveSummary += `Genel skorunuz %${scores.overall || 0}; `;
    executiveSummary += `${scores.quizCount || 0} quiz, ${scores.simulationCount || 0} simülasyon kaydı ve yaklaşık ${Math.round((scores.totalTimeMinutes || 0) / 60)} saat çalışma süresi tespit edildi. `;
    if (weakModules.length) {
        executiveSummary += `Öncelikli geliştirme gereken ${weakModules.length} modül belirlendi. `;
    }
    if (report.interpretation && report.interpretation.overall) {
        executiveSummary += report.interpretation.overall.split('\n\n')[0];
    }

    return {
        userName,
        executiveSummary,
        theoryVsPractice: tvp,
        modules,
        unstartedModules: unstartedModules.slice(0, 12),
        globalGaps,
        personalizedAdvice: [...new Set(advice)].slice(0, 12),
        studyPlan,
        stats: {
            moduleCount: modules.length,
            weakCount: weakModules.length,
            unstartedCount: unstartedModules.length,
        },
    };
}

module.exports = {
    buildDetailedEvaluationReport,
    loadModulesCatalog,
    humanizeSlug,
};
