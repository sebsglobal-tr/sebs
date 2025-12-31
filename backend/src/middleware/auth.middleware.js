// Authentication Middleware
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../server.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { publicId: decoded.publicId },
      select: { 
        id: true, 
        publicId: true, 
        email: true, 
        role: true, 
        isActive: true,
        accessLevel: true
      }
    });

    // Fetch entitlements separately to avoid select/include conflict
    let entitlements = [];
    if (user && user.isActive) {
      entitlements = await prisma.entitlement.findMany({
        where: {
          userId: user.id,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        select: {
          category: true,
          level: true
        }
      });
    }

    if (user) {
      user.entitlements = entitlements;
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: error.message || 'Authentication failed' 
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
}

