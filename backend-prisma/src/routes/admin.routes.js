import express from 'express';
import { authenticateSupabase as authenticate, requireRole } from '../middleware/supabase-auth.middleware.js';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  getSimulations,
  getPerformanceAnalytics,
  getBehaviorAnalysis,
  getAIInsights,
  getSecurityLogs
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/dashboard/stats', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/:userId', getUserDetails);

router.get('/simulations', getSimulations);

router.get('/analytics/performance', getPerformanceAnalytics);
router.get('/analytics/behavior', getBehaviorAnalysis);

router.get('/insights', getAIInsights);

router.get('/security/logs', getSecurityLogs);

export default router;
