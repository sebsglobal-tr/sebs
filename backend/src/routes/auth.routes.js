// Authentication Routes
import express from 'express';
import { register, login, refreshTokens, logout, verifyEmail } from '../controllers/auth.controller.js';
import { validateSchema } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validations.js';

const router = express.Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/verify', verifyEmail);
router.post('/refresh', validateSchema(refreshTokenSchema), refreshTokens);
router.post('/logout', logout);

export default router;

