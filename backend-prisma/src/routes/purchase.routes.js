import express from 'express';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';
import { purchasePackage, getUserEntitlements, getAvailablePackages } from '../controllers/purchase.controller.js';

const router = express.Router();

router.get('/packages', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return getAvailablePackages({ user: null }, res, next);
    }

    try {
      await authenticate(req, res, () => {
        getAvailablePackages(req, res, next);
      });
    } catch (error) {
      req.user = null;
      return getAvailablePackages(req, res, next);
    }
  } catch (error) {
    req.user = null;
    return getAvailablePackages(req, res, next);
  }
});

router.use(authenticate);

router.post('/purchase', purchasePackage);

router.get('/entitlements', getUserEntitlements);

export default router;