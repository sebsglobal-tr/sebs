
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


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

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}


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

export async function getCourseDetails(courseId, userId) {
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

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


