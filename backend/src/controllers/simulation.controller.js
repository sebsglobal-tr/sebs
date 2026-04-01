// Simulation Controller
import { prisma } from '../server.js';

// Save simulation completion
export async function saveSimulationCompletion(req, res, next) {
  try {
    const { simulationId, simulationName, score, flagsFound, timeSpent, moduleName } = req.body;
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

    // Save simulation run
    const simulationRun = await prisma.simulationRun.create({
      data: {
        userId,
        moduleId: module?.id || '00000000-0000-0000-0000-000000000000', // Dummy ID if no module
        simulationId,
        score: score || null,
        flagsFound: flagsFound || [],
        timeSpent: Math.round(timeSpent || 0),
        completedAt: new Date()
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
        module: {
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

