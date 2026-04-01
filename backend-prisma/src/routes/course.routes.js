// Course Routes
import express from 'express';
import { prisma } from '../server.js';
import { authenticateSupabase } from '../middleware/supabase-auth.middleware.js';
import { filterCoursesByEntitlement, hasAccess } from '../utils/entitlement.js';

const router = express.Router();

// Optional authentication - check if token exists
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    // Try to authenticate with Supabase, but don't fail if invalid
    try {
      await authenticateSupabase(req, res, () => {
        next();
      });
    } catch (error) {
      req.user = null;
      next();
    }
  } catch (error) {
    req.user = null;
    next();
  }
};

// Get all courses (with entitlement filtering)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Filter courses based on user entitlements
    const filteredCourses = filterCoursesByEntitlement(courses, req.user || null);

    res.json({
      success: true,
      data: filteredCourses
    });
  } catch (error) {
    next(error);
  }
});

// Get single course (with entitlement filtering)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user has access
    const hasAccessToCourse = hasAccess(req.user || null, course.category, course.level);

    const filteredCourse = {
      ...course,
      modules: hasAccessToCourse 
        ? course.modules
        : course.modules.map(module => ({
            id: module.id,
            courseId: module.courseId,
            title: module.title,
            description: module.description,
            order: module.order,
            type: module.type,
            duration: module.duration,
            isActive: module.isActive,
            isLocked: true,
            // Don't send content for locked modules
            content: null
          })),
      isLocked: !hasAccessToCourse
    };

    res.json({
      success: true,
      data: filteredCourse
    });
  } catch (error) {
    next(error);
  }
});

export default router;

