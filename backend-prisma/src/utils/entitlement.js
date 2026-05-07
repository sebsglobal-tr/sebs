
const LEVEL_HIERARCHY = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3
};

export function hasAccess(user, category, level) {
  if (user?.role === 'admin') {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.entitlements && Array.isArray(user.entitlements)) {
    const entitlement = user.entitlements.find(
      e => e.category === category && e.level === level
    );
    
    if (entitlement) {
      return true;
    }

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

  const userLevel = LEVEL_HIERARCHY[user.accessLevel] || 0;
  const reqLevel = LEVEL_HIERARCHY[level] || 0;

  return userLevel >= reqLevel;
}

export function filterCoursesByEntitlement(courses, user = null) {
  return courses.map(course => {
    const hasAccessToCourse = hasAccess(user, course.category, course.level);
    
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
      moduleCount: course.modules?.length || 0
    };
  });
}

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