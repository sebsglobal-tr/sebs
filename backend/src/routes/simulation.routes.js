// Simulation Routes
import express from 'express';
import { saveSimulationCompletion, getUserSimulations } from '../controllers/simulation.controller.js';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/complete', saveSimulationCompletion);
router.get('/', getUserSimulations);

export default router;

