// Entitlement Utility Functions
// Helper functions to check user access rights

const LEVEL_HIERARCHY = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3
};

/**
 * Check if user has access to a course based on category and level
 * @param {Object} user - User object with entitlements and accessLevel
 * @param {string} category - Course category (e.g., 'cybersecurity')
 * @param {string} level - Course level (e.g., 'beginner', 'intermediate', 'advanced')
 * @returns {boolean} - True if user has access, false otherwise
 */
export function hasAccess(user, category, level) {
  // Admin always has access
  if (user?.role === 'admin') {
    return true;
  }

  // If no user, no access
  if (!user) {
    return false;
  }

  // Check if user has specific entitlement for this category and level
  if (user.entitlements && Array.isArray(user.entitlements)) {
    const entitlement = user.entitlements.find(
      e => e.category === category && e.level === level
    );
    
    if (entitlement) {
      return true;
    }

    // Check if user has a higher level entitlement
    const userEntitlementsForCategory = user.entitlements.filter(
      e => e.category === category
    );

    for (const ent of userEntitlementsForCategory) {
      const entLevel = LEVEL_HIERARCHY[ent.level];
      const reqLevel = LEVEL_HIERARCHY[level];
      
      if (entLevel && reqLevel && entLevel >= reqLevel) {
        return true;
      }
    }
  }

  // Fallback to user's default accessLevel
  const userLevel = LEVEL_HIERARCHY[user.accessLevel] || 0;
  const reqLevel = LEVEL_HIERARCHY[level] || 0;

  return userLevel >= reqLevel;
}

/**
 * Filter courses based on user entitlements
 * @param {Array} courses - Array of courses
 * @param {Object} user - User object (optional, for unauthenticated users)
 * @returns {Array} - Filtered courses with isLocked flag
 */
export function filterCoursesByEntitlement(courses, user = null) {
  return courses.map(course => {
    const hasAccessToCourse = hasAccess(user, course.category, course.level);
    
    // If user doesn't have access, filter out modules but keep course metadata
    const filteredModules = hasAccessToCourse
      ? course.modules
      : course.modules.map(module => ({
          ...module,
          content: null, // Remove content for locked modules
          isLocked: true
        }));

    return {
      ...course,
      modules: filteredModules,
      isLocked: !hasAccessToCourse,
      // Keep module count even if locked
      moduleCount: course.modules?.length || 0
    };
  });
}

/**
 * Check access level for a specific category
 * @param {Object} user - User object
 * @param {string} category - Course category
 * @returns {string|null} - Highest access level for category, or null
 */
export function getAccessLevelForCategory(user, category) {
  if (!user || !user.entitlements) {
    return null;
  }

  const categoryEntitlements = user.entitlements.filter(
    e => e.category === category
  );

  if (categoryEntitlements.length === 0) {
    return null;
  }

  // Get the highest level entitlement
  let highestLevel = 'beginner';
  let highestValue = 1;

  for (const ent of categoryEntitlements) {
    const levelValue = LEVEL_HIERARCHY[ent.level] || 0;
    if (levelValue > highestValue) {
      highestValue = levelValue;
      highestLevel = ent.level;
    }
  }

  return highestLevel;
}