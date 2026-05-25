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
        completed: 'Tamamlandı',
        weak: 'Geliştirilmeli',
        strong: 'Güçlü',
    };
    return map[status] || status;
}

function isModuleStarted(prog, quizzes, sims) {
    return (
        (quizzes && quizzes.length > 0) ||
        (sims && sims.length > 0) ||
        (prog && (Number(prog.percentComplete) > 0 || Number(prog.timeSpentMinutes) > 0))
    );
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

function slugModuleAnchor(moduleId) {
    return 'report-modul-' + String(moduleId || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function buildDetailedPersonalizedAdvice({
    scores,
    report,
    modules,
    weakModules,
    unstartedModules,
    globalGaps,
    theoryVsPractice,
}) {
    const items = [];
    let order = 0;

    function push(item) {
        items.push({ ...item, order: order++ });
    }

    const theory = theoryVsPractice?.theory ?? scores.quizAverage ?? 0;
    const practice = theoryVsPractice?.practice ?? scores.simulationAverage ?? 0;
    const gap = theoryVsPractice?.gap ?? theory - practice;

    if ((scores.quizCount || 0) === 0 && (scores.simulationCount || 0) > 0) {
        push({
            id: 'advice-missing-quiz',
            priority: 'high',
            category: 'theory',
            title: 'Değerlendirme testlerini sisteme kaydedin',
            why:
                'Simülasyon oynuyorsunuz ancak quiz sonuçları rapora düşmüyor. Hangi derste hangi konuda yanlış yaptığınızı görmek için her modül testinde «Testi Gönder» kullanılmalı.',
            actions: [
                'Tamamladığınız her modül bölümünde değerlendirme testini çözün ve gönderin.',
                'Göndermeden sayfadan ayrılırsanız skor veritabanına yazılmaz; rapor teorik tarafı boş kalır.',
                'Önce en son çalıştığınız modülün testini gönderin; ardından raporu yenileyin.',
            ],
            timeframe: 'Bu hafta — 1. öncelik',
            relatedSection: 'report-bosluklar',
        });
    }

    if (gap > 15 && theory >= 40) {
        push({
            id: 'advice-theory-practice-gap',
            priority: 'high',
            category: 'practice',
            title: 'Teoriyi simülasyona taşıyın',
            why:
                `Quiz ortalamanız (%${Math.round(theory)}) pratik skorunuzdan (%${Math.round(practice)}) yüksek. Bilgiyi biliyor olabilirsiniz; senaryo ve komut satırında uygulama eksik.`,
            actions: [
                'Her simülasyon öncesi ilgili modülün özet dersini 10 dakika gözden geçirin.',
                'Simülasyonu ikinci kez ipucusuz oynayın; ilk turdaki hatalı adımları not defterine yazın.',
                'Haftada en az 2 farklı simülasyon tamamlayın (aynı senaryoyu tekrar tercih edin).',
            ],
            timeframe: '2–3 hafta',
            relatedSection: 'report-teori',
        });
    } else if (gap < -15 && practice >= 35) {
        push({
            id: 'advice-practice-theory-gap',
            priority: 'high',
            category: 'theory',
            title: 'Pratik gücünüzü teorik testlerle destekleyin',
            why:
                `Simülasyon (%${Math.round(practice)}) quiz ortalamanızdan (%${Math.round(theory)}) yüksek. Uygulama iyi; kavram testlerinde boşluk rapora yansıyor.`,
            actions: [
                'Zayıf quiz bölümlerinde soru altı açıklamalarını okuyun; aynı testi 48 saat sonra tekrar çözün.',
                'Modül ders notlarında vurgulanan tanımları (CIA, OSI, hash vb.) kendi cümlelerinizle özetleyin.',
                'Her simülasyon sonrası «ne öğrendim?» için 3 madde yazın.',
            ],
            timeframe: '2 hafta',
            relatedSection: 'report-teori',
        });
    }

    if ((scores.overall || 0) < 60 && (scores.quizCount || 0) + (scores.simulationCount || 0) > 0) {
        push({
            id: 'advice-low-overall',
            priority: 'high',
            category: 'habit',
            title: 'Temel seviyede sistematik tekrar planı',
            why: `Genel skorunuz %${scores.overall}; hedef aralık genelde %70+. Dağınık çalışma yerine modül modül kapanış yapılmalı.`,
            actions: [
                'Günde 45–60 dk: 25 dk ders okuma + 20 dk quiz veya simülasyon.',
                'Önce zayıf modülleri bitirin; yeni modüle geçmeden quiz ≥ %60 olana kadar tekrar.',
                'Çalışma sürenizi modül içinde tutun (rapor süreyi takip eder).',
            ],
            timeframe: '4 hafta',
            relatedSection: 'report-plan',
        });
    }

    if (report.ml && report.ml.profile) {
        const prof = report.ml.profile;
        let profWhy =
            'Yapay zeka modeli öğrenme stilinizi bu profille sınıflandırdı. Aşağıdaki adımlar profile özel yönlendirmedir.';
        let profActions = [];
        if (prof.includes('Gelişime Açık')) {
            profActions = [
                'Temel Siber Güvenlik ve Giriş modüllerini baştan sona tekrarlayın.',
                'Her gün 1 kısa quiz + haftada 1 simülasyon minimum.',
                'Yanlış soru sayısını haftalık takip edin; hedef: önceki haftadan az yanlış.',
            ];
        } else if (prof.includes('Teorisyen')) {
            profActions = [
                'Teori testlerinizi koruyun; zamanın %60\'ını simülasyona ayırın.',
                'Lab senaryolarında süre tutun; hız ve doğruluk birlikte artsın.',
            ];
        } else if (prof.includes('Pratik Zeka')) {
            profActions = [
                'Simülasyon öncesi 15 dk konu özeti; ardından değerlendirme testi.',
                'Yanlış quiz konu başlıklarını listeleyip derslere geri dönün.',
            ];
        } else if (prof.includes('Uzman')) {
            profActions = [
                'İleri modül ve zor simülasyonlara geçin.',
                'SOC / forensik gibi çok adımlı senaryolarda ekip notu tutun.',
            ];
        } else {
            profActions = [
                'Teori ve pratik skorlarınızı dengede tutun; haftalık ritim koruyun.',
            ];
        }
        push({
            id: 'advice-ml-profile',
            priority: 'medium',
            category: 'profile',
            title: `AI profili: ${prof}`,
            why: profWhy + (report.ml.confidencePercent != null ? ` (Güven: %${report.ml.confidencePercent})` : ''),
            actions: profActions,
            timeframe: 'Sürekli — profil hedefinize göre',
            relatedSection: 'report-ai',
        });
    }

    for (const m of weakModules.slice(0, 6)) {
        const anchor = slugModuleAnchor(m.moduleId);
        const quizDetail =
            m.quizzes && m.quizzes.length
                ? m.quizzes
                      .filter((q) => (q.wrongAnswers || 0) > 0 || (q.score || 0) < 70)
                      .map((q) => `«${q.quizTitle}»: %${Math.round(q.score || 0)}${q.wrongAnswers ? `, ${q.wrongAnswers} yanlış` : ''}`)
                      .join('; ')
                : 'Quiz kaydı yok';
        const simDetail =
            m.simulations && m.simulations.length
                ? m.simulations
                      .map(
                          (s) =>
                              `«${s.title}»: %${Math.round(s.score || 0)}` +
                              (s.wrongActionsCount ? `, ${s.wrongActionsCount} hatalı aksiyon` : '')
                      )
                      .join('; ')
                : 'Simülasyon kaydı yok';

        push({
            id: 'advice-module-' + m.moduleId,
            priority: 'high',
            category: 'module',
            title: `Modül odağı: ${m.title}`,
            why:
                (m.issues && m.issues[0]) ||
                `İlerleme %${m.percentComplete}; quiz ort. ${m.quizAverage != null ? '%' + m.quizAverage : '—'}, sim. ${m.simulationBest != null ? '%' + m.simulationBest : '—'}.`,
            actions: [
                ...(m.recommendations || []),
                `Quiz durumu: ${quizDetail}.`,
                `Simülasyon durumu: ${simDetail}.`,
                'Modül sayfasında eksik ders bölümlerini tamamlayıp ardından test + simülasyon tekrarı yapın.',
            ].filter(Boolean),
            timeframe: 'Bu ve gelecek hafta',
            relatedSection: anchor,
            relatedModuleId: m.moduleId,
            relatedModuleTitle: m.title,
        });
    }

    for (const g of globalGaps || []) {
        if (g.type === 'unstarted_modules') {
            push({
                id: 'advice-unstarted',
                priority: 'medium',
                category: 'habit',
                title: 'Başlanmamış modüllere giriş yapın',
                why: g.description + ' Öğrenme yolunda boşluk, ileride zorlanmaya yol açar.',
                actions: [
                    (unstartedModules[0] && `İlk hedef: «${unstartedModules[0].title}» — giriş dersi + mini test.`) ||
                        'Katalogdan bir giriş modülü seçin.',
                    'Haftada 1 yeni modüle «tanışma» seansı ayırın (30 dk).',
                    'Her yeni modülde en az %20 ilerleme kaydedin.',
                ].filter(Boolean),
                timeframe: '3 hafta içinde',
                relatedSection: 'report-baslanmamis',
            });
        }
    }

    const highHintSims = modules.flatMap((m) =>
        (m.simulations || [])
            .filter((s) => (s.hintUsedCount || 0) >= 3)
            .map((s) => ({ module: m, sim: s }))
    );
    if (highHintSims.length > 0) {
        const ex = highHintSims[0];
        push({
            id: 'advice-hints',
            priority: 'medium',
            category: 'practice',
            title: 'İpucu kullanımını azaltın',
            why:
                'Birden fazla simülasyonda sık ipucu kullanılmış. Bağımsız müdahale becerisi gelişimi için ipucusuz tur hedeflenmeli.',
            actions: [
                `«${ex.sim.title}» simülasyonunu ipucusuz tekrar oynayın.`,
                'Takıldığınızda 5 dk kendi notlarınıza bakın; hemen ipucu açmayın.',
                'Her simülasyon sonrası ipucu sayısını bir önceki turdan azaltmayı hedefleyin.',
            ],
            timeframe: '2 hafta',
            relatedSection: slugModuleAnchor(ex.module.moduleId),
            relatedModuleTitle: ex.module.title,
        });
    }

    if (items.length < 4) {
        push({
            id: 'advice-routine',
            priority: 'low',
            category: 'habit',
            title: 'Sürdürülebilir öğrenme ritmi',
            why: 'Düzenli kısa oturumlar, uzun aralıklı yoğun çalışmadan daha etkilidir.',
            actions: [
                'Haftada 2 modül dersi + 1 simülasyon + 1 quiz tekrarı.',
                'Her oturum sonunda 1 paragraf özet yazın.',
                'Ayda bir bu raporu yenileyerek ilerlemeyi karşılaştırın.',
            ],
            timeframe: 'Sürekli',
            relatedSection: 'report-ozet',
        });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9) || a.order - b.order);

    return items;
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
        ...progressByModule.keys(),
        ...quizResults.map((q) => q.moduleId).filter(Boolean),
        ...simulationResults.map((s) => s.moduleId).filter(Boolean),
    ]);

    const modules = [];
    const globalGaps = [];

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

        if (!isModuleStarted(prog, quizzes, sims)) continue;

        const hasActivity = true;
        let status = moduleStatus(prog.percentComplete, quizAvg, simBest, hasActivity);
        if (Number(prog.percentComplete) >= 100) {
            status = 'completed';
        }

        const issues = [];
        const recommendations = [];
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
        const order = { weak: 0, in_progress: 1, strong: 2, completed: 3 };
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

    const detailedAdvice = buildDetailedPersonalizedAdvice({
        scores,
        report,
        modules,
        weakModules,
        unstartedModules,
        globalGaps,
        theoryVsPractice: tvp,
    });

    const personalizedAdvice = detailedAdvice.map((a) => a.title);

    return {
        userName,
        executiveSummary,
        theoryVsPractice: tvp,
        modules,
        unstartedModules: unstartedModules.slice(0, 12),
        globalGaps,
        personalizedAdvice,
        detailedAdvice,
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
    buildDetailedPersonalizedAdvice,
    loadModulesCatalog,
    humanizeSlug,
    slugModuleAnchor,
};
