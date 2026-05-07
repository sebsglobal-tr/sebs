
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getEvaluationReport } from '../controllers/evaluation.controller.js';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';

const router = express.Router();

const evaluationLimiter = rateLimit({
  windowMs: parseInt(process.env.EVALUATION_RATE_LIMIT_WINDOW_MS) || 60000, // 1 dakika
  max: parseInt(process.env.EVALUATION_RATE_LIMIT_MAX) || 20, // 20 istek/dakika/IP
  message: 'Too many evaluation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health';
  }
});

router.get('/report', authenticate, evaluationLimiter, getEvaluationReport);

export default router;
