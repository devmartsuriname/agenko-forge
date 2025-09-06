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
 * Enhanced logout with comprehensive cleanup and retry logic
 */
export async function performSecureLogout(): Promise<{ success: boolean; error?: string }> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // First, check if there's an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn(`Error checking session during logout (attempt ${attempt}):`, sessionError.message);
      }

      // Attempt Supabase logout with timeout
      const logoutPromise = supabase.auth.signOut({ scope: 'global' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 10000)
      );

      const { error: logoutError } = await Promise.race([logoutPromise, timeoutPromise]) as any;
      
      if (logoutError && logoutError.message !== 'Session not found') {
        console.warn(`Supabase logout error (attempt ${attempt}):`, logoutError.message);
        if (attempt === maxRetries) {
          lastError = logoutError;
        } else {
          continue; // Retry
        }
      }

      // Always perform cleanup regardless of logout success
      await cleanupSessionData();

      // Verify cleanup was successful
      const isCleanedUp = await verifySessionCleanup();
      if (!isCleanedUp && attempt < maxRetries) {
        continue; // Retry cleanup
      }

      return { success: true };
    } catch (error: any) {
      console.error(`Secure logout error (attempt ${attempt}):`, error);
      lastError = error;
      
      if (attempt === maxRetries) {
        // Still attempt cleanup even on final error
        await cleanupSessionData();
        
        return { 
          success: false, 
          error: error?.message || 'Logout failed after multiple attempts' 
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return { 
    success: false, 
    error: lastError?.message || 'Logout failed after multiple attempts' 
  };
}

/**
 * Verify that session cleanup was successful
 */
async function verifySessionCleanup(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return true;
    
    // Check for remaining session data
    const hasLocalStorage = Object.keys(localStorage).some(key => 
      key.startsWith('supabase.auth.token') || key.startsWith('sb-')
    );
    
    const hasSessionStorage = Object.keys(sessionStorage).some(key => 
      key.startsWith('supabase.auth.token') || key.startsWith('sb-')
    );
    
    const hasCookies = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('sb-') || cookie.includes('supabase')
    );
    
    return !hasLocalStorage && !hasSessionStorage && !hasCookies;
  } catch (error) {
    console.warn('Error verifying session cleanup:', error);
    return true; // Assume success if verification fails
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