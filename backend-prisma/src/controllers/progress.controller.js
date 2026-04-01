// Progress Controller - Supabase/Profile uyumlu, modül ilerlemesi veritabanına kaydedilir
import { prisma } from '../server.js';

export async function saveProgress(req, res, next) {
  try {
    const { moduleId, percentComplete, lastStep, isCompleted } = req.body;
    const userId = req.user.id; // Supabase auth user id = profiles.id

    // Profile kontrolü (Supabase)
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { accessLevel: true }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profil bulunamadı'
      });
    }

    // Modül var mı
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Modül bulunamadı'
      });
    }

    // Erişim seviyesi (kurs varsa)
    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevel = levelHierarchy[profile.accessLevel] || 0;
    const courseLevel = module.course ? (levelHierarchy[module.course.level] || 0) : 0;
    if (courseLevel > userLevel) {
      return res.status(403).json({
        success: false,
        message: `Bu modüle erişim için ${module.course?.level === 'intermediate' ? 'Orta' : 'İleri'} seviye gerekiyor.`
      });
    }

    const lastStepStr = typeof lastStep === 'object' ? JSON.stringify(lastStep) : (lastStep || null);

    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId }
      },
      create: {
        userId,
        moduleId,
        percentComplete: percentComplete ?? 0,
        lastStep: lastStepStr,
        isCompleted: isCompleted || false,
        timeSpentMinutes: 0
      },
      update: {
        percentComplete: percentComplete ?? undefined,
        lastStep: lastStepStr ?? undefined,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        lastAccessedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined
      }
    });

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
}

export async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const progress = await prisma.moduleProgress.findMany({
      where: { userId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: { lastAccessedAt: 'desc' }
    });
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
}

export async function getModuleProgress(req, res, next) {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    const progress = await prisma.moduleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress bulunamadı'
      });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
}

export async function updateTimeSpent(req, res, next) {
  try {
    const { moduleId, timeSpentMinutes, minutes } = req.body;
    const userId = req.user.id;
    const toAdd = Math.max(0, Math.round(timeSpentMinutes ?? minutes ?? 0));

    if (!moduleId || toAdd < 0) {
      return res.status(400).json({
        success: false,
        message: 'moduleId ve timeSpentMinutes (veya minutes) gerekli'
      });
    }

    const progress = await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      create: {
        userId,
        moduleId,
        timeSpentMinutes: toAdd,
        percentComplete: 0,
        lastAccessedAt: new Date()
      },
      update: {
        timeSpentMinutes: { increment: toAdd },
        lastAccessedAt: new Date()
      }
    });

    // Günlük modül süresi (UserModuleSession) - bugünün tarihi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      await prisma.userModuleSession.upsert({
        where: {
          userId_moduleId_sessionDate: {
            userId,
            moduleId,
            sessionDate: today
          }
        },
        create: {
          userId,
          moduleId,
          sessionDate: today,
          minutesSpent: toAdd
        },
        update: { minutesSpent: { increment: toAdd } }
      });
    } catch (e) {
      // Tablo yoksa veya unique constraint farklıysa sessizce devam et
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
}

export async function saveQuizResult(req, res, next) {
  try {
    const { moduleId, quizId, score, correctAnswers, wrongAnswers, answers, timeSpent } = req.body;
    const userId = req.user.id;

    const total = Math.max(0, (correctAnswers ?? 0) + (wrongAnswers ?? 0)) || 10;
    const correct = Math.max(0, correctAnswers ?? 0);
    const wrong = Math.max(0, wrongAnswers ?? total - correct);
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : (score ?? 0);

    if (!moduleId || !quizId) {
      return res.status(400).json({
        success: false,
        message: 'moduleId ve quizId gerekli'
      });
    }

    // QuizAttempt tablosuna kaydet (analitik için)
    await prisma.quizAttempt.create({
      data: {
        userId,
        moduleId,
        quizSectionId: String(quizId),
        totalQuestions: total,
        correctCount: correct,
        wrongCount: wrong,
        scorePercent: scorePct
      }
    }).catch(() => {}); // Tablo yoksa sessizce devam et

    const progress = await prisma.moduleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } }
    });

    let metadata = {};
    if (progress?.lastStep) {
      try {
        metadata = typeof progress.lastStep === 'string' ? JSON.parse(progress.lastStep) : (progress.lastStep || {});
      } catch (e) {
        metadata = {};
      }
    }

    if (!metadata.quizResults) metadata.quizResults = [];
    metadata.quizResults.push({
      quizId,
      score: scorePct,
      correctAnswers: correct,
      wrongAnswers: wrong,
      answers: answers || [],
      timeSpent: timeSpent || 0,
      timestamp: new Date().toISOString()
    });
    metadata.avgScore = Math.round(
      metadata.quizResults.reduce((sum, q) => sum + (q.score || 0), 0) / metadata.quizResults.length
    );

    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      create: {
        userId,
        moduleId,
        percentComplete: 0,
        lastStep: JSON.stringify(metadata)
      },
      update: { lastStep: JSON.stringify(metadata) }
    });

    res.json({
      success: true,
      message: 'Quiz sonucu kaydedildi',
      data: { quizId, score: scorePct, correct, wrong, total, avgScore: metadata.avgScore }
    });
  } catch (error) {
    next(error);
  }
}

// Dashboard overview - tüm modül ilerlemeleri veritabanından
export async function getProgressOverview(req, res, next) {
  try {
    const userId = req.user.id;

    const moduleProgress = await prisma.moduleProgress.findMany({
      where: { userId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: { title: true, category: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = moduleProgress.map((p) => ({
      id: p.id,
      moduleId: p.moduleId,
      title: p.module.title,
      courseTitle: p.module.course?.title || null,
      category: p.module.course?.category || null,
      percentComplete: p.percentComplete || 0,
      isCompleted: p.isCompleted || false,
      timeSpentMinutes: p.timeSpentMinutes || 0,
      lastUpdated: p.updatedAt
    }));

    res.json({
      success: true,
      data: {
        modules: formatted,
        totalModules: formatted.length,
        completedModules: formatted.filter((m) => m.isCompleted).length,
        totalTimeSpent: formatted.reduce((sum, m) => sum + (m.timeSpentMinutes || 0), 0)
      }
    });
  } catch (error) {
    next(error);
  }
}

// Sync progress from localStorage (login sonrası)
export async function syncProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { progressData } = req.body;

    if (!progressData || !Array.isArray(progressData)) {
      return res.status(400).json({
        success: false,
        message: 'progressData array olmalı'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { accessLevel: true }
    });
    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevel = levelHierarchy[profile?.accessLevel] || 0;

    const synced = [];
    const errors = [];

    for (const item of progressData) {
      try {
        const { moduleId, percentComplete, lastStep, isCompleted } = item;
        if (!moduleId) {
          errors.push({ moduleId: '?', error: 'moduleId gerekli' });
          continue;
        }

        const module = await prisma.module.findUnique({
          where: { id: moduleId },
          include: { course: true }
        });
        if (!module) {
          errors.push({ moduleId, error: 'Modül bulunamadı' });
          continue;
        }

        const courseLevel = module.course ? (levelHierarchy[module.course.level] || 0) : 0;
        if (courseLevel > userLevel) continue;

        const lastStepVal = typeof lastStep === 'object' ? JSON.stringify(lastStep) : lastStep;

        await prisma.moduleProgress.upsert({
          where: { userId_moduleId: { userId, moduleId } },
          create: {
            userId,
            moduleId,
            percentComplete: percentComplete ?? 0,
            lastStep: lastStepVal,
            isCompleted: isCompleted ?? false,
            timeSpentMinutes: 0
          },
          update: {
            percentComplete: percentComplete ?? undefined,
            lastStep: lastStepVal ?? undefined,
            isCompleted: isCompleted ?? undefined,
            lastAccessedAt: new Date()
          }
        });

        synced.push({ moduleId, moduleTitle: module.title });
      } catch (err) {
        errors.push({ moduleId: item.moduleId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `${synced.length} modül senkronize edildi`,
      data: { synced, errors: errors.length ? errors : undefined }
    });
  } catch (error) {
    next(error);
  }
}

// Giriş kaydı - kullanıcının her gün girip girmediği takibi
export async function logLogin(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.userLoginLog.create({
      data: { userId }
    }).catch(() => {});

    res.json({ success: true, message: 'Giriş kaydedildi' });
  } catch (error) {
    next(error);
  }
}
