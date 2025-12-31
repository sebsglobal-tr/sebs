// Simulation Routes
import express from 'express';
import { saveSimulationCompletion, getUserSimulations } from '../controllers/simulation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/complete', saveSimulationCompletion);
router.get('/', getUserSimulations);

export default router;

