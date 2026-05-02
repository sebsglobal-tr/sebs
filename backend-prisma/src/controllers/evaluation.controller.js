// Evaluation Controller
// Evidence-based evaluation using expert weights and AI interpretation

import { prisma } from '../server.js';
import { calculateWeightedScore } from '../utils/score-calculator.js';
import { generateEvidenceBasedReport } from '../utils/evidence-based-ai-reporter.js';

/**
 * Get evidence-based evaluation report for user
 * Calculates scores deterministically, then uses AI for interpretation
 */
export async function getEvaluationReport(req, res, next) {
  try {
    const { publicId } = req.user;
    const { category } = req.query; // Optional: filter by category

    // Get user
    const user = await prisma.user.findUnique({ where: { publicId } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // 1. Collect user data
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    // 2. Get quiz results
    const quizResults = await getQuizResults(user.id, category);
    
    // 3. Get simulation results
    const simulationResults = await getSimulationResults(user.id, category);
    
    // 4. Get time spent data
    const timeSpent = await getTimeSpentData(user.id, category);

    // 5. Calculate weighted scores (deterministic)
    const scoreData = calculateWeightedScore(
      userData,
      quizResults,
      simulationResults,
      timeSpent
    );

    // 6. Prepare metadata for AI
    const metadata = {
      quizResults,
      simulations: simulationResults,
      totalTime: calculateTotalTime(timeSpent),
      modules: await getModuleProgress(user.id, category)
    };

    // 7. Generate AI interpretation (AI only interprets, never scores)
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

/**
 * Get quiz results for user
 */
async function getQuizResults(userId, category = null) {
  try {
    // Get all module progress for user
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

    // Extract quiz results from module progress metadata
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

/**
 * Get simulation results for user
 */
async function getSimulationResults(userId, category = null) {
  try {
    const simulations = await prisma.simulationRun.findMany({
      where: {
        userId,
        ...(category && {
          // TODO: Add category filter if simulations have category
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

/**
 * Get time spent data per topic/module
 */
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

    // Map time spent to topics (simplified - 1:1 mapping for now)
    // TODO: Implement proper module-to-topic mapping
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

/**
 * Get module progress summary
 */
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

/**
 * Calculate total time spent
 */
function calculateTotalTime(timeSpent) {
  return Object.values(timeSpent).reduce((sum, time) => sum + (time || 0), 0);
}
