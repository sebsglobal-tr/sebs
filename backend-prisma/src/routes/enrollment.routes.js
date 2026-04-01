// Enrollment Routes
import express from 'express';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';
import { prisma } from '../server.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
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

    // Get course to check level
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check access level
    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevel = levelHierarchy[user.accessLevel] || 0;
    const courseLevel = levelHierarchy[course.level] || 0;

    if (courseLevel > userLevel) {
      return res.status(403).json({
        success: false,
        message: `Bu kursa erişim için ${course.level === 'intermediate' ? 'Orta' : 'İleri'} seviye satın almanız gerekiyor.`
      });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: {
        course: true
      }
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

export default router;

