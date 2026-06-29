import express from 'express';
import { getUserCertificates, generateCategoryCertificate, getCertificateReport, checkCategoryCompletion } from '../controllers/certificate.controller.js';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getUserCertificates);

router.get('/check/:category', authenticate, checkCategoryCompletion);

router.post('/generate', authenticate, generateCategoryCertificate);

router.get('/:certificateId/report', authenticate, getCertificateReport);

export default router;

