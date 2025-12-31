// Certificate Routes
import express from 'express';
import { getUserCertificates, generateCategoryCertificate, getCertificateReport, checkCategoryCompletion } from '../controllers/certificate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user certificates (requires auth)
router.get('/', authenticate, getUserCertificates);

// Check category completion and auto-generate certificate (requires auth)
router.get('/check/:category', authenticate, checkCategoryCompletion);

// Generate certificate for category (requires auth)
router.post('/generate', authenticate, generateCategoryCertificate);

// Get AI report for certificate (requires auth)
router.get('/:certificateId/report', authenticate, getCertificateReport);

export default router;

