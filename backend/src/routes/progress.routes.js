// Progress Routes
import express from 'express';
import { saveProgress, getProgress, getModuleProgress, updateTimeSpent, saveQuizResult, getProgressOverview, syncProgress } from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateSchema } from '../middleware/validation.middleware.js';
import { saveProgressSchema, syncProgressSchema } from '../validations/progress.validations.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateSchema(saveProgressSchema), saveProgress);
router.post('/sync', validateSchema(syncProgressSchema), syncProgress); // Sync progress from localStorage
router.post('/time', updateTimeSpent);
router.post('/quiz', saveQuizResult);
router.get('/overview', getProgressOverview);
router.get('/', getProgress);
router.get('/:moduleId', getModuleProgress);

export default router;

