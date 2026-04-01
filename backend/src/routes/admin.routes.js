// Admin Routes
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

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.get('/users/:userId', getUserDetails);

// Simulations
router.get('/simulations', getSimulations);

// Analytics
router.get('/analytics/performance', getPerformanceAnalytics);
router.get('/analytics/behavior', getBehaviorAnalysis);

// AI Insights
router.get('/insights', getAIInsights);

// Security & Logs
router.get('/security/logs', getSecurityLogs);

export default router;
