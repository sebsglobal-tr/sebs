
import { prisma } from '../server.js';
import { calculateWeightedScore } from '../utils/score-calculator.js';
import { generateEvidenceBasedReport } from '../utils/evidence-based-ai-reporter.js';

export async function getEvaluationReport(req, res, next) {
  try {
    const { publicId } = req.user;
    const { category } = req.query; // Optional: filter by category

    const user = await prisma.user.findUnique({ where: { publicId } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    const quizResults = await getQuizResults(user.id, category);
    
    const simulationResults = await getSimulationResults(user.id, category);
    
    const timeSpent = await getTimeSpentData(user.id, category);

    const scoreData = calculateWeightedScore(
      userData,
      quizResults,
      simulationResults,
      timeSpent
    );

    const metadata = {
      quizResults,
      simulations: simulationResults,
      totalTime: calculateTotalTime(timeSpent),
      modules: await getModuleProgress(user.id, category)
    };

    const report = await generateEvidenceBasedReport(scoreData, userData, metadata);

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Evaluation Report Error:', error);
    next(error);
  }
}

async function getQuizResults(userId, category = null) {
  try {
    const moduleProgress = await prisma.moduleProgress.findMany({
      where: {
        userId,
        ...(category && {
          module: {
            course: {
              category
            }
          }
        })
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    const quizResults = [];

    for (const progress of moduleProgress) {
      if (progress.lastStep) {
        try {
          const metadata = typeof progress.lastStep === 'string' 
            ? JSON.parse(progress.lastStep) 
            : progress.lastStep;

          if (metadata.quizResults && Array.isArray(metadata.quizResults)) {
            for (const quiz of metadata.quizResults) {
              quizResults.push({
                quizId: quiz.quizId || quiz.id,
                moduleId: progress.moduleId,
                moduleName: progress.module.title,
                score: quiz.score || 0,
                correctAnswers: quiz.correctAnswers || 0,
                wrongAnswers: quiz.wrongAnswers || 0,
                timeSpent: quiz.timeSpent || 0,
                timestamp: quiz.timestamp || progress.updatedAt
              });
            }
          }
        } catch (e) {
          console.warn('Failed to parse module progress metadata:', e.message);
        }
      }
    }

    return quizResults;
  } catch (error) {
    console.error('Error getting quiz results:', error);
    return [];
  }
}

async function getSimulationResults(userId, category = null) {
  try {
    const simulations = await prisma.simulationRun.findMany({
      where: {
        userId,
        ...(category && {
        })
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    return simulations.map(sim => ({
      simulationId: sim.simulationId,
      simulationName: sim.simulationId,
      score: sim.score || 0,
      maxScore: sim.maxScore,
      successRate: sim.successRate != null ? Number(sim.successRate) : null,
      flagsFound: sim.flagsFound || [],
      timeSpent: sim.timeSpent || 0,
      correctCount: sim.correctCount,
      wrongCount: sim.wrongCount,
      wrongActionsCount: sim.wrongActionsCount,
      hintUsedCount: sim.hintUsedCount,
      resetCount: sim.resetCount,
      stepCompletionTimes: sim.stepCompletionTimes,
      finalGradeLabel: sim.finalGradeLabel,
      passed: sim.passed,
      completedAt: sim.completedAt
    }));
  } catch (error) {
    console.error('Error getting simulation results:', error);
    return [];
  }
}

async function getTimeSpentData(userId, category = null) {
  try {
    const moduleProgress = await prisma.moduleProgress.findMany({
      where: {
        userId,
        ...(category && {
          module: {
            course: {
              category
            }
          }
        })
      },
      include: {
        module: true
      }
    });

    const timeSpent = {};
    
    for (let i = 0; i < Math.min(moduleProgress.length, 10); i++) {
      const progress = moduleProgress[i];
      const topicId = i + 1; // Map to topic 1-10
      timeSpent[topicId] = progress.timeSpentMinutes || 0;
    }

    return timeSpent;
  } catch (error) {
    console.error('Error getting time spent data:', error);
    return {};
  }
}

async function getModuleProgress(userId, category = null) {
  try {
    const progress = await prisma.moduleProgress.findMany({
      where: {
        userId,
        ...(category && {
          module: {
            course: {
              category
            }
          }
        })
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    return progress.map(p => ({
      moduleId: p.moduleId,
      moduleName: p.module.title,
      category: p.module.course.category,
      percentComplete: p.percentComplete || 0,
      isCompleted: p.isCompleted || false,
      timeSpentMinutes: p.timeSpentMinutes || 0
    }));
  } catch (error) {
    console.error('Error getting module progress:', error);
    return [];
  }
}

function calculateTotalTime(timeSpent) {
  return Object.values(timeSpent).reduce((sum, time) => sum + (time || 0), 0);
}
