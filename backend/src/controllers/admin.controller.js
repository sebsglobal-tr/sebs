atabilermiyimmmmmhihihihih// Admin Controller
import { prisma } from '../server.js';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(req, res, next) {
  try {
    // Total Users
    const totalUsers = await prisma.user.count();
    
    // Active Users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers7d = await prisma.user.count({
      where: {
        lastLogin: { gte: sevenDaysAgo }
      }
    });
    
    // Active Users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers30d = await prisma.user.count({
      where: {
        lastLogin: { gte: thirtyDaysAgo }
      }
    });
    
    // Completed Simulations
    const completedSimulations = await prisma.simulationRun.count({
      where: {
        completedAt: { not: null }
      }
    });
    
    // Average Skill Score
    const avgSkillScoreResult = await prisma.skillScore.aggregate({
      _avg: { score: true }
    });
    const avgSkillScore = avgSkillScoreResult._avg.score || 0;
    
    // Risk/Weak Area Count
    const riskUsers = await prisma.aiAnalysis.count({
      where: {
        riskLevel: { in: ['medium', 'high'] },
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    // Simulation Success vs Failure
    const successCount = await prisma.simulationRun.count({
      where: {
        completedAt: { not: null },
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    const failureCount = await prisma.simulationRun.count({
      where: {
        completedAt: null,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    // Recent AI Alerts
    const aiAlerts = await prisma.aiAnalysis.findMany({
      where: {
        riskLevel: { in: ['medium', 'high'] },
        createdAt: { gte: sevenDaysAgo }
      },
      include: {
        user: {
          select: {
            publicId: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Skill Distribution
    const skillDistribution = await prisma.skillScore.groupBy({
      by: ['skillName'],
      _avg: { score: true },
      _count: true
    });
    
    res.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          activeUsers7d,
          activeUsers30d,
          completedSimulations,
          avgSkillScore: Math.round(avgSkillScore * 10) / 10,
          riskWeakAreaCount: riskUsers
        },
        simulationStats: {
          success: successCount,
          failure: failureCount,
          total: successCount + failureCount
        },
        skillDistribution: skillDistribution.map(s => ({
          skill: s.skillName,
          avgScore: Math.round(s._avg.score * 10) / 10,
          userCount: s._count
        })),
        aiAlerts: aiAlerts.map(alert => ({
          id: alert.id,
          userId: alert.user.publicId,
          userName: `${alert.user.firstName || ''} ${alert.user.lastName || ''}`.trim() || alert.user.publicId,
          insight: alert.insightText,
          recommendation: alert.recommendation,
          riskLevel: alert.riskLevel,
          createdAt: alert.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get users list with filters
 */
export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 50, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          publicId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          accessLevel: true,
          isActive: true,
          isVerified: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    // Get additional data for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [enrollments, avgSkillScore, recentAIAnalysis] = await Promise.all([
          prisma.enrollment.count({ where: { userId: user.id } }),
          prisma.skillScore.aggregate({
            where: { userId: user.id },
            _avg: { score: true }
          }),
          prisma.aiAnalysis.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
          })
        ]);
        
        const riskLevel = recentAIAnalysis?.riskLevel || 'low';
        const skillScore = avgSkillScore._avg.score || 0;
        
        return {
          ...user,
          assignedTracks: enrollments,
          avgSkillScore: Math.round((skillScore || 0) * 10) / 10,
          riskFlag: riskLevel
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user details
 */
export async function getUserDetails(req, res, next) {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { publicId: userId },
      select: {
        id: true,
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        accessLevel: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true
          }
        }
      }
    });
    
    // Get skill scores
    const skillScores = await prisma.skillScore.findMany({
      where: { userId: user.id },
      orderBy: { lastUpdated: 'desc' }
    });
    
    // Get behavior data summary
    const behaviorSummary = await prisma.behaviorData.aggregate({
      where: { userId: user.id },
      _avg: {
        decisionLatency: true,
        retryRate: true,
        stressIndicator: true,
        deviationScore: true
      },
      _max: {
        decisionLatency: true,
        retryRate: true,
        stressIndicator: true
      }
    });
    
    // Get AI analysis
    const aiAnalyses = await prisma.aiAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    // Get simulation runs
    const simulationRuns = await prisma.simulationRun.findMany({
      where: { userId: user.id },
      include: {
        module: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    res.json({
      success: true,
      data: {
        user,
        enrollments,
        skillScores,
        behaviorSummary: {
          avgDecisionLatency: Math.round((behaviorSummary._avg.decisionLatency || 0) * 10) / 10,
          avgRetryRate: Math.round((behaviorSummary._avg.retryRate || 0) * 100 * 10) / 10,
          avgStressIndicator: Math.round((behaviorSummary._avg.stressIndicator || 0) * 100 * 10) / 10,
          avgDeviationScore: Math.round((behaviorSummary._avg.deviationScore || 0) * 100 * 10) / 10,
          maxDecisionLatency: behaviorSummary._max.decisionLatency || 0
        },
        aiAnalyses,
        recentSimulations: simulationRuns.map(s => ({
          id: s.id,
          simulationId: s.simulationId,
          moduleTitle: s.module.title,
          score: s.score,
          timeSpent: s.timeSpent,
          attempts: s.attempts,
          decisionCount: s.decisionCount || 0,
          errorCount: s.errorCount || 0,
          successRate: s.successRate ? Math.round(s.successRate * 100 * 10) / 10 : null,
          completedAt: s.completedAt,
          createdAt: s.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get simulations list
 */
export async function getSimulations(req, res, next) {
  try {
    const simulationRuns = await prisma.simulationRun.groupBy({
      by: ['simulationId'],
      _count: { id: true },
      _avg: {
        score: true,
        timeSpent: true,
        successRate: true
      }
    });
    
    // Get most common errors
    const simulationsWithErrors = await Promise.all(
      simulationRuns.map(async (sim) => {
        const failedRuns = await prisma.simulationRun.findMany({
          where: {
            simulationId: sim.simulationId,
            OR: [
              { completedAt: null },
              { successRate: { lt: 0.7 } }
            ]
          },
          take: 10
        });
        
        return {
          simulationId: sim.simulationId,
          totalRuns: sim._count.id,
          avgScore: sim._avg.score ? Math.round(sim._avg.score * 10) / 10 : null,
          avgTimeSpent: sim._avg.timeSpent ? Math.round(sim._avg.timeSpent) : null,
          avgSuccessRate: sim._avg.successRate ? Math.round(sim._avg.successRate * 100 * 10) / 10 : null,
          commonIssues: failedRuns.length > 0 ? `High error rate: ${failedRuns.length} failed runs` : 'No major issues'
        };
      })
    );
    
    res.json({
      success: true,
      data: simulationsWithErrors
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get performance analytics
 */
export async function getPerformanceAnalytics(req, res, next) {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    // Skill-based distribution
    const skillDistribution = await prisma.skillScore.groupBy({
      by: ['skillName'],
      _avg: { score: true },
      _count: true,
      where: {
        lastUpdated: { gte: daysAgo }
      }
    });
    
    // Time series data for improvement tracking
    const skillTrends = await prisma.skillScore.findMany({
      where: {
        lastUpdated: { gte: daysAgo }
      },
      orderBy: { lastUpdated: 'asc' }
    });
    
    res.json({
      success: true,
      data: {
        skillDistribution: skillDistribution.map(s => ({
          skill: s.skillName,
          avgScore: Math.round(s._avg.score * 10) / 10,
          userCount: s._count
        })),
        trends: skillTrends
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get behavior analysis
 */
export async function getBehaviorAnalysis(req, res, next) {
  try {
    const { userId } = req.query;
    
    const where = {};
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { publicId: userId },
        select: { id: true }
      });
      if (user) where.userId = user.id;
    }
    
    const behaviorData = await prisma.behaviorData.findMany({
      where,
      include: {
        user: {
          select: {
            publicId: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    // Aggregate statistics
    const stats = await prisma.behaviorData.aggregate({
      where,
      _avg: {
        decisionLatency: true,
        retryRate: true,
        stressIndicator: true,
        deviationScore: true
      }
    });
    
    res.json({
      success: true,
      data: {
        behaviors: behaviorData,
        statistics: {
          avgDecisionLatency: Math.round((stats._avg.decisionLatency || 0) * 10) / 10,
          avgRetryRate: Math.round((stats._avg.retryRate || 0) * 100 * 10) / 10,
          avgStressIndicator: Math.round((stats._avg.stressIndicator || 0) * 100 * 10) / 10,
          avgDeviationScore: Math.round((stats._avg.deviationScore || 0) * 100 * 10) / 10
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get AI insights
 */
export async function getAIInsights(req, res, next) {
  try {
    const { userId, riskLevel } = req.query;
    
    const where = {};
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { publicId: userId },
        select: { id: true }
      });
      if (user) where.userId = user.id;
    }
    if (riskLevel) where.riskLevel = riskLevel;
    
    const insights = await prisma.aiAnalysis.findMany({
      where,
      include: {
        user: {
          select: {
            publicId: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({
      success: true,
      data: insights.map(insight => ({
        id: insight.id,
        userId: insight.user.publicId,
        userName: `${insight.user.firstName || ''} ${insight.user.lastName || ''}`.trim() || insight.user.publicId,
        insight: insight.insightText,
        recommendation: insight.recommendation,
        riskLevel: insight.riskLevel,
        category: insight.category,
        createdAt: insight.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get security logs
 */
export async function getSecurityLogs(req, res, next) {
  try {
    const { page = 1, limit = 100, action, adminId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (action) where.action = action;
    if (adminId) {
      const admin = await prisma.user.findUnique({
        where: { publicId: adminId },
        select: { id: true }
      });
      if (admin) where.adminId = admin.id;
    }
    
    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          admin: {
            select: {
              publicId: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.securityLog.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          admin: log.admin ? {
            publicId: log.admin.publicId,
            email: log.admin.email,
            name: `${log.admin.firstName || ''} ${log.admin.lastName || ''}`.trim()
          } : null,
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          ipAddress: log.ipAddress,
          success: log.success,
          createdAt: log.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log security event (helper function for other controllers)
 */
export async function logSecurityEvent(adminId, action, resource, resourceId, ipAddress, userAgent, success = true, details = null) {
  try {
    await prisma.securityLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        success,
        details: details ? JSON.stringify(details) : null
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}
