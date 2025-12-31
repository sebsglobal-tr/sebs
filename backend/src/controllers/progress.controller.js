// Progress Controller
import { prisma } from '../server.js';

export async function saveProgress(req, res, next) {
  try {
    const { moduleId, percentComplete, lastStep, isCompleted } = req.body;
    const userId = req.user.id;

    // Get user with access level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessLevel: true }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is enrolled in the course containing this module
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });

    if (!module) {
      return res.status(404).json({ 
        success: false, 
        message: 'Module not found' 
      });
    }

    // Check access level
    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevel = levelHierarchy[user.accessLevel] || 0;
    const courseLevel = levelHierarchy[module.course.level] || 0;

    if (courseLevel > userLevel) {
      return res.status(403).json({ 
        success: false, 
        message: `Bu modüle erişim için ${module.course.level === 'intermediate' ? 'Orta' : 'İleri'} seviye satın almanız gerekiyor.` 
      });
    }

    // Check enrollment, auto-enroll if not enrolled
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: module.courseId
        }
      }
    });

    if (!enrollment) {
      // Auto-enroll user in the course
      enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId: module.courseId
        }
      });
      console.log(`✅ Auto-enrolled user ${userId} in course ${module.courseId}`);
    }

    // Upsert progress
    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      },
      create: {
        userId,
        moduleId,
        percentComplete,
        lastStep,
        isCompleted: isCompleted || false,
        timeSpentMinutes: 0
      },
      update: {
        percentComplete,
        lastStep,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        timeSpentMinutes: { increment: 1 },
        lastAccessedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined
      }
    });

    res.json({
      success: true,
      data: progress
    });
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

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
}

export async function getModuleProgress(req, res, next) {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    const progress = await prisma.moduleProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId }
      },
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
        message: 'Progress not found' 
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
}

// Update time spent on module
export async function updateTimeSpent(req, res, next) {
  try {
    const { moduleId, timeSpentMinutes } = req.body;
    const userId = req.user.id;

    if (!moduleId || !timeSpentMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Module ID and time spent required'
      });
    }

    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      },
      create: {
        userId,
        moduleId,
        timeSpentMinutes: Math.round(timeSpentMinutes),
        percentComplete: 0,
        lastAccessedAt: new Date()
      },
      update: {
        timeSpentMinutes: Math.round(timeSpentMinutes),
        lastAccessedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
}

// Save quiz result
export async function saveQuizResult(req, res, next) {
  try {
    const { moduleId, quizId, score, correctAnswers, wrongAnswers, answers, timeSpent } = req.body;
    const userId = req.user.id;

    if (!moduleId || !quizId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Module ID, Quiz ID and score required'
      });
    }

    // Save quiz result to user's module progress metadata
    const progress = await prisma.moduleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      }
    });

    // Parse existing metadata or create new
    let metadata = {};
    if (progress?.lastStep) {
      try {
        metadata = JSON.parse(progress.lastStep);
      } catch (e) {
        metadata = {};
      }
    }

    // Initialize quizResults array if not exists
    if (!metadata.quizResults) {
      metadata.quizResults = [];
    }

    // Add quiz result
    metadata.quizResults.push({
      quizId,
      score,
      correctAnswers,
      wrongAnswers,
      answers: answers || [],
      timeSpent: timeSpent || 0,
      timestamp: new Date().toISOString()
    });

    // Calculate average score
    const avgScore = metadata.quizResults.reduce((sum, q) => sum + (q.score || 0), 0) / metadata.quizResults.length;
    metadata.avgScore = Math.round(avgScore);

    // Update progress
    await prisma.moduleProgress.update({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      },
      data: {
        lastStep: JSON.stringify(metadata)
      }
    });

    res.json({
      success: true,
      message: 'Quiz result saved',
      data: {
        quizId,
        score,
        avgScore: metadata.avgScore
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get progress overview for dashboard
export async function getProgressOverview(req, res, next) {
  try {
    const userId = req.user.id;

    // Get all module progress for user
    const moduleProgress = await prisma.moduleProgress.findMany({
      where: { userId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                title: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format response
    const formatted = moduleProgress.map(progress => ({
      id: progress.id,
      moduleId: progress.moduleId,
      title: progress.module.title,
      courseTitle: progress.module.course.title,
      category: progress.module.course.category,
      percentComplete: progress.percentComplete || 0,
      isCompleted: progress.isCompleted || false,
      timeSpentMinutes: progress.timeSpentMinutes || 0,
      lastUpdated: progress.updatedAt
    }));

    res.json({
      success: true,
      data: {
        modules: formatted,
        totalModules: formatted.length,
        completedModules: formatted.filter(m => m.isCompleted).length,
        totalTimeSpent: formatted.reduce((sum, m) => sum + (m.timeSpentMinutes || 0), 0)
      }
    });
  } catch (error) {
    next(error);
  }
}

// Sync progress from localStorage (called after login)
export async function syncProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { progressData } = req.body; // Array of { moduleId, percentComplete, lastStep, isCompleted }

    if (!progressData || !Array.isArray(progressData)) {
      return res.status(400).json({
        success: false,
        message: 'progressData must be an array'
      });
    }

    const syncedModules = [];
    const errors = [];

    // Get user access level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessLevel: true }
    });

    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevel = levelHierarchy[user?.accessLevel] || 0;

    for (const progressItem of progressData) {
      try {
        const { moduleId, percentComplete, lastStep, isCompleted } = progressItem;

        if (!moduleId) {
          errors.push({ moduleId: 'unknown', error: 'Module ID is required' });
          continue;
        }

        // Get module and course info
        const module = await prisma.module.findUnique({
          where: { id: moduleId },
          include: { course: true }
        });

        if (!module) {
          errors.push({ moduleId, error: 'Module not found' });
          continue;
        }

        // Check access level
        const courseLevel = levelHierarchy[module.course.level] || 0;
        if (courseLevel > userLevel) {
          errors.push({ 
            moduleId, 
            moduleTitle: module.title,
            error: `Access denied: ${module.course.level} level required` 
          });
          continue;
        }

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: module.courseId
            }
          }
        });

        if (!enrollment) {
          // Auto-enroll user if not enrolled
          await prisma.enrollment.create({
            data: {
              userId,
              courseId: module.courseId
            }
          });
        }

        // Upsert progress
        const lastStepValue = typeof lastStep === 'object' ? JSON.stringify(lastStep) : lastStep;

        const progress = await prisma.moduleProgress.upsert({
          where: {
            userId_moduleId: {
              userId,
              moduleId
            }
          },
          create: {
            userId,
            moduleId,
            percentComplete: percentComplete || 0,
            lastStep: lastStepValue,
            isCompleted: isCompleted || false,
            timeSpentMinutes: 0
          },
          update: {
            percentComplete: percentComplete !== undefined ? percentComplete : undefined,
            lastStep: lastStepValue || undefined,
            isCompleted: isCompleted !== undefined ? isCompleted : undefined,
            lastAccessedAt: new Date()
          }
        });

        syncedModules.push({
          moduleId,
          moduleTitle: module.title,
          percentComplete: progress.percentComplete,
          isCompleted: progress.isCompleted
        });
      } catch (error) {
        errors.push({ 
          moduleId: progressItem.moduleId || 'unknown', 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedModules.length} module(s)`,
      data: {
        synced: syncedModules,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    next(error);
  }
}

