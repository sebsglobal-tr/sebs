// Frontend Supabase Auth Integration Example
// This shows how frontend should interact with Supabase Auth

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up new user
 * Supabase automatically sends verification email
 */
export async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    return {
      success: true,
      user: data.user,
      message: 'Verification email sent. Please check your inbox.'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Sign in existing user
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return {
      success: true,
      session: data.session,
      user: data.user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

/**
 * Get user profile
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, profile: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, profile: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ============================================
// ENTITLEMENT FUNCTIONS
// ============================================

/**
 * Get user entitlements
 */
export async function getUserEntitlements(userId) {
  try {
    const { data, error } = await supabase
      .from('entitlements')
      .select('category, level')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (error) throw error;
    return { success: true, entitlements: data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Check if user has entitlement (using RPC function)
 */
export async function checkEntitlement(userId, category, level) {
  try {
    const { data, error } = await supabase.rpc('has_entitlement', {
      p_user_id: userId,
      p_category: category,
      p_level: level
    });

    if (error) throw error;
    return { success: true, hasAccess: data === true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ============================================
// COURSE & LESSON FUNCTIONS
// ============================================

/**
 * Get published courses
 */
export async function getCourses(category, level) {
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (level) query = query.eq('level', level);

    const { data, error } = await query.order('sort_order');

    if (error) throw error;
    return { success: true, courses: data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Get course details (requires entitlement check)
 */
export async function getCourseDetails(courseId, userId) {
  try {
    // Get course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Check entitlement
    const { data: hasAccess } = await supabase.rpc('has_entitlement', {
      p_user_id: userId,
      p_category: course.category,
      p_level: course.level
    });

    if (!hasAccess) {
      return {
        success: false,
        message: 'Access denied. Please purchase this course.'
      };
    }

    // Get lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('order');

    if (lessonsError) throw lessonsError;

    return {
      success: true,
      course: { ...course, lessons: lessons || [] }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ============================================
// PROGRESS FUNCTIONS
// ============================================

/**
 * Get user progress
 */
export async function getUserProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*, lessons(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, progress: data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Update lesson progress
 */
export async function updateProgress(userId, lessonId, progressData) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        ...progressData,
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, progress: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ============================================
// API CALLS WITH AUTH TOKEN
// ============================================

/**
 * Make authenticated API call to Express backend
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8006'}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers
      }
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Sign up
const signUpResult = await signUp('user@example.com', 'password123', 'John Doe');
if (signUpResult.success) {
  console.log('Verification email sent!');
}

// Sign in
const signInResult = await signIn('user@example.com', 'password123');
if (signInResult.success) {
  console.log('Logged in:', signInResult.user);
  localStorage.setItem('session', JSON.stringify(signInResult.session));
}

// Listen to auth changes
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

// Check entitlement
const { hasAccess } = await checkEntitlement(userId, 'cybersecurity', 'beginner');
if (hasAccess) {
  // Show course content
}

// Make authenticated API call
const result = await apiCall('/api/admin/users', { method: 'GET' });
*/
