// Simulation Controller
import { prisma } from '../server.js';

// Save simulation completion
export async function saveSimulationCompletion(req, res, next) {
  try {
    const body = req.body || {};
    const {
      simulationId,
      simulationName,
      score,
      flagsFound,
      timeSpent,
      timeSpentSeconds,
      moduleName,
      correctCount,
      wrongCount,
      passed,
      maxScore,
      successRate,
      wrongActionsCount,
      hintUsedCount,
      resetCount,
      stepCompletionTimes,
      finalGradeLabel
    } = body;
    const userId = req.user.id;

    if (!simulationId || !simulationName) {
      return res.status(400).json({
        success: false,
        message: 'Simulation ID and name required'
      });
    }

    // Find or create module for this simulation
    let module = null;
    if (moduleName) {
      module = await prisma.module.findFirst({
        where: { title: moduleName }
      });
    }

    const seconds = Math.round(timeSpentSeconds ?? timeSpent ?? 0);

    // Save simulation run (lessonId = modül eşlemesi; şema lesson_id kullanır)
    const simulationRun = await prisma.simulationRun.create({
      data: {
        userId,
        lessonId: module?.id || null,
        simulationId,
        score: score != null ? Math.round(Number(score)) : null,
        flagsFound: flagsFound || [],
        timeSpent: seconds,
        completedAt: new Date(),
        correctCount: correctCount != null ? Math.max(0, parseInt(String(correctCount), 10) || 0) : 0,
        wrongCount: wrongCount != null ? Math.max(0, parseInt(String(wrongCount), 10) || 0) : 0,
        passed: typeof passed === 'boolean' ? passed : null,
        maxScore: maxScore != null ? Math.max(0, parseInt(String(maxScore), 10) || 0) : null,
        successRate: successRate != null && successRate !== '' ? successRate : undefined,
        wrongActionsCount: wrongActionsCount != null ? Math.max(0, parseInt(String(wrongActionsCount), 10) || 0) : 0,
        hintUsedCount: hintUsedCount != null ? Math.max(0, parseInt(String(hintUsedCount), 10) || 0) : 0,
        resetCount: resetCount != null ? Math.max(0, parseInt(String(resetCount), 10) || 0) : 0,
        stepCompletionTimes: stepCompletionTimes != null ? stepCompletionTimes : undefined,
        finalGradeLabel: finalGradeLabel ? String(finalGradeLabel).slice(0, 64) : null
      }
    });

    res.json({
      success: true,
      message: 'Simulation completion saved',
      data: simulationRun
    });
  } catch (error) {
    next(error);
  }
}

// Get user simulation progress
export async function getUserSimulations(req, res, next) {
  try {
    const userId = req.user.id;

    const simulations = await prisma.simulationRun.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { simulations }
    });
  } catch (error) {
    next(error);
  }
}

