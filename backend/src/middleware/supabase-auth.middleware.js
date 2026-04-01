// Supabase JWT Authentication Middleware
// Verifies Supabase JWT tokens from frontend

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // For admin operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // For JWT verification

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for JWT verification
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Middleware to authenticate requests using Supabase JWT
 * Extracts user info from JWT and attaches to req.user
 */
export async function authenticateSupabase(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, access_level')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Get user entitlements
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('category, level')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    // Tam erişim e-postası: her zaman admin ve tüm içeriğe erişir
    const fullAccessEmail = (process.env.SUPER_ADMIN_EMAIL || 'asasferfer4566@gmail.com').toLowerCase().trim();
    const isFullAccessEmail = user.email && user.email.toLowerCase().trim() === fullAccessEmail;

    req.user = {
      id: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
      fullName: profile.full_name,
      role: isFullAccessEmail ? 'admin' : (profile.role || 'user'),
      accessLevel: isFullAccessEmail ? 'advanced' : (profile.access_level || 'beginner'),
      entitlements: entitlements || []
    };

    next();
  } catch (error) {
    console.error('Supabase auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

/**
 * Middleware to require specific role(s)
 */
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

/**
 * Helper function to check if user has entitlement
 * Uses Supabase function: has_entitlement(user_id, category, level)
 */
export async function checkEntitlement(userId, category, level) {
  try {
    const { data, error } = await supabase.rpc('has_entitlement', {
      p_user_id: userId,
      p_category: category,
      p_level: level
    });

    if (error) {
      console.error('Entitlement check error:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Entitlement check error:', error);
    return false;
  }
}

/**
 * Middleware to check entitlement for specific category/level
 */
export function requireEntitlement(category, level) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const hasAccess = await checkEntitlement(req.user.id, category, level);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${category} - ${level}`
      });
    }

    next();
  };
}
