// Progress Routes
import express from 'express';
import { saveProgress, getProgress, getModuleProgress, updateTimeSpent, saveQuizResult, getProgressOverview, syncProgress, logLogin } from '../controllers/progress.controller.js';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';
import { validateSchema } from '../middleware/validation.middleware.js';
import { saveProgressSchema, syncProgressSchema } from '../validations/progress.validations.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateSchema(saveProgressSchema), saveProgress);
router.post('/sync', validateSchema(syncProgressSchema), syncProgress); // Sync progress from localStorage
router.post('/time', updateTimeSpent);
router.post('/activity/login', logLogin); // Giriş kaydı (günlük takip)
router.post('/quiz', saveQuizResult);
router.get('/overview', getProgressOverview);
router.get('/', getProgress);
router.get('/:moduleId', getModuleProgress);

export default router;

