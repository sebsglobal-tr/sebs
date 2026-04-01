// Evaluation Routes
// Evidence-based evaluation endpoints

import express from 'express';
import rateLimit from 'express-rate-limit';
import { getEvaluationReport } from '../controllers/evaluation.controller.js';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';

const router = express.Router();

// Evaluation endpoint için özel rate limiting
// Bu endpoint AI çağrısı yaptığı için daha yavaş, daha az istek kabul ediyor
const evaluationLimiter = rateLimit({
  windowMs: parseInt(process.env.EVALUATION_RATE_LIMIT_WINDOW_MS) || 60000, // 1 dakika
  max: parseInt(process.env.EVALUATION_RATE_LIMIT_MAX) || 20, // 20 istek/dakika/IP
  message: 'Too many evaluation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Health check için skip
    return req.path === '/health';
  }
});

// Get evidence-based evaluation report
// Query params: ?category=siber-guvenlik (optional)
router.get('/report', authenticate, evaluationLimiter, getEvaluationReport);

export default router;
