import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export interface SessionValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  error?: string;
}

/**
 * Validates the current session and checks if it needs refreshing
 */
export async function validateSession(session: Session | null): Promise<SessionValidationResult> {
  if (!session) {
    return { 
      isValid: false, 
      needsRefresh: false, 
      error: 'No session found' 
    };
  }

  // Check if session is expired
  const now = Math.round(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  
  if (expiresAt <= now) {
    return { 
      isValid: false, 
      needsRefresh: true, 
      error: 'Session expired' 
    };
  }

  // Check if session needs refresh (within 5 minutes of expiry)
  const refreshThreshold = now + (5 * 60); // 5 minutes
  const needsRefresh = expiresAt <= refreshThreshold;

  // Validate with Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
    
    if (error || !user) {
      return { 
        isValid: false, 
        needsRefresh: true, 
        error: error?.message || 'Invalid session token' 
      };
    }

    return { 
      isValid: true, 
      needsRefresh,
      error: undefined 
    };
  } catch (error) {
    return { 
      isValid: false, 
      needsRefresh: true, 
      error: 'Session validation failed' 
    };
  }
}

/**
 * Attempts to refresh the session if needed
 */
export async function refreshSessionIfNeeded(session: Session | null): Promise<Session | null> {
  if (!session) return null;

  const validation = await validateSession(session);
  
  if (!validation.needsRefresh) {
    return session;
  }

  try {
    const { data: { session: newSession }, error } = await supabase.auth.refreshSession({
      refresh_token: session.refresh_token
    });

    if (error) {
      console.warn('Session refresh failed:', error.message);
      return null;
    }

    return newSession;
  } catch (error) {
    console.warn('Session refresh error:', error);
    return null;
  }
}

/**
 * Domain-agnostic session cleanup
 */
export async function cleanupSessionData(): Promise<void> {
  try {
    // Clear all potential session storage across domains
    if (typeof window !== 'undefined') {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      });

      // Clear cookies if they exist
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('sb-') || name.includes('supabase')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    }
  } catch (error) {
    console.warn('Error cleaning up session data:', error);
  }
}

/**
 * Enhanced logout with comprehensive cleanup
 */
export async function performSecureLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    // First, check if there's an active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('Error checking session during logout:', sessionError.message);
    }

    // Attempt Supabase logout regardless of session status
    const { error: logoutError } = await supabase.auth.signOut({ scope: 'global' });
    
    if (logoutError && logoutError.message !== 'Session not found') {
      console.warn('Supabase logout error:', logoutError.message);
    }

    // Always perform cleanup regardless of logout success
    await cleanupSessionData();

    return { success: true };
  } catch (error: any) {
    console.error('Secure logout error:', error);
    
    // Still attempt cleanup even on error
    await cleanupSessionData();
    
    return { 
      success: false, 
      error: error?.message || 'Logout failed unexpectedly' 
    };
  }
}

/**
 * Check if user has required permissions
 */
export function checkPermissions(userRole: string | null, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get user role hierarchy level for comparison
 */
export function getRoleLevel(role: string | null): number {
  switch (role) {
    case 'admin': return 3;
    case 'editor': return 2;
    case 'viewer': return 1;
    default: return 0;
  }
}