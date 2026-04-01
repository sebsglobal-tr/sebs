// User Routes
import express from 'express';
import { authenticateSupabase as authenticate } from '../middleware/supabase-auth.middleware.js';
import { prisma } from '../server.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        role: true,
        accessLevel: true,
        createdAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profil bulunamadı' });
    }

    res.json({
      success: true,
      data: {
        id: profile.id,
        fullName: profile.fullName,
        email: req.user.email,
        role: profile.role,
        accessLevel: profile.accessLevel,
        createdAt: profile.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

