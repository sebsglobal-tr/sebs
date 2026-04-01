// Purchase/Entitlement Controller
import { prisma } from '../server.js';

/**
 * Purchase a package (create entitlement)
 * This simulates a purchase - in production, integrate with payment gateway
 */
export async function purchasePackage(req, res, next) {
  try {
    const { category, level } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Category and level are required'
      });
    }

    const validCategories = ['cybersecurity', 'cloud', 'datascience', 'technology'];
    const validLevels = ['beginner', 'intermediate', 'advanced'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: `Invalid level. Must be one of: ${validLevels.join(', ')}`
      });
    }

    // Check if entitlement already exists
    const existingEntitlement = await prisma.entitlement.findUnique({
      where: {
        userId_category_level: {
          userId,
          category,
          level
        }
      }
    });

    // If exists and is active, return it
    if (existingEntitlement && existingEntitlement.isActive) {
      // Check if expired
      if (existingEntitlement.expiresAt && existingEntitlement.expiresAt < new Date()) {
        // Reactivate if expired
        const updated = await prisma.entitlement.update({
          where: { id: existingEntitlement.id },
          data: { isActive: true, expiresAt: null } // Lifetime access
        });

        return res.json({
          success: true,
          message: 'Package purchased successfully',
          data: updated
        });
      }

      return res.json({
        success: true,
        message: 'You already have access to this package',
        data: existingEntitlement
      });
    }

    // Create new entitlement
    const entitlement = await prisma.entitlement.create({
      data: {
        userId,
        category,
        level,
        isActive: true,
        expiresAt: null, // null means lifetime access - adjust based on your business logic
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    });

    // Update user's accessLevel if this is a higher level for cybersecurity
    if (category === 'cybersecurity') {
      const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
      const currentLevel = levelHierarchy[req.user.accessLevel] || 0;
      const newLevel = levelHierarchy[level] || 0;

      if (newLevel > currentLevel) {
        await prisma.user.update({
          where: { id: userId },
          data: { accessLevel: level }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Package purchased successfully',
      data: entitlement
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's entitlements
 */
export async function getUserEntitlements(req, res, next) {
  try {
    const userId = req.user.id;

    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { category: 'asc' },
        { level: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: entitlements
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get available packages for purchase
 */
export async function getAvailablePackages(req, res, next) {
  try {
    const userId = req.user?.id;

    // Get user's current entitlements if authenticated
    let userEntitlements = [];
    if (userId) {
      userEntitlements = await prisma.entitlement.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });
    }

    // Define available packages
    const packages = [
      {
        id: 'cybersecurity-beginner',
        category: 'cybersecurity',
        level: 'beginner',
        title: 'Cybersecurity Beginner Package',
        description: 'Access to all beginner level cybersecurity courses',
        price: 99.99, // Adjust based on your pricing
        currency: 'USD',
        isPurchased: userEntitlements.some(
          e => e.category === 'cybersecurity' && e.level === 'beginner'
        )
      },
      {
        id: 'cybersecurity-intermediate',
        category: 'cybersecurity',
        level: 'intermediate',
        title: 'Cybersecurity Intermediate Package',
        description: 'Access to all beginner and intermediate level cybersecurity courses',
        price: 199.99,
        currency: 'USD',
        isPurchased: userEntitlements.some(
          e => e.category === 'cybersecurity' && 
          (e.level === 'intermediate' || e.level === 'advanced')
        )
      },
      {
        id: 'cybersecurity-advanced',
        category: 'cybersecurity',
        level: 'advanced',
        title: 'Cybersecurity Advanced Package',
        description: 'Access to all cybersecurity courses (beginner, intermediate, and advanced)',
        price: 299.99,
        currency: 'USD',
        isPurchased: userEntitlements.some(
          e => e.category === 'cybersecurity' && e.level === 'advanced'
        )
      }
    ];

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
}