// Purchase/Entitlement Routes
import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
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

    const token = authHeader.substring(7);
    const { verifyAccessToken } = await import('../utils/jwt.js');
    const decoded = verifyAccessToken(token);
    const { prisma } = await import('../server.js');
    
    const user = await prisma.user.findUnique({
      where: { publicId: decoded.publicId },
      select: { id: true, isActive: true }
    });

    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    return getAvailablePackages(req, res, next);
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