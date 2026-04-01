// Purchase/Entitlement Routes
import express from 'express';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';
import { purchasePackage, getUserEntitlements, getAvailablePackages } from '../controllers/purchase.controller.js';

const router = express.Router();

// Get available packages (public endpoint)
router.get('/packages', async (req, res, next) => {
  // Use optional auth to show purchase status
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return getAvailablePackages({ user: null }, res, next);
    }

    // Try to authenticate, but don't fail if token is invalid
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

// Protected routes
router.use(authenticate);

// Purchase a package
router.post('/purchase', purchasePackage);

// Get user entitlements
router.get('/entitlements', getUserEntitlements);

export default router;