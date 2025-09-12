import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateSession, 
  refreshSessionIfNeeded, 
  performSecureLogout, 
  checkPermissions,
  getRoleLevel 
} from './auth-middleware';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  isEditor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (requiredRoles: string[]) => boolean;
  hasMinimumRole: (minimumRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Performance optimization: Track auth timing
  const authStartTime = useRef(performance.now());
  const roleCache = useRef<Map<string, { role: string; timestamp: number }>>(new Map());
  const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  
  // Debounce role fetching to avoid multiple concurrent requests
  const roleRequestTracker = useRef<Map<string, Promise<void>>>(new Map());

  const fetchUserRole = useCallback(async (userId: string) => {
    const perfStart = performance.now();
    console.log('[Auth] Starting role fetch for user:', userId);
    
    // Check cache first
    const cached = roleCache.current.get(userId);
    if (cached && Date.now() - cached.timestamp < ROLE_CACHE_TTL) {
      console.log('[Auth] Using cached role:', cached.role, `(${(performance.now() - perfStart).toFixed(2)}ms)`);
      setUserRole(cached.role);
      return;
    }
    
    // Check if already fetching this role
    const existingRequest = roleRequestTracker.current.get(userId);
    if (existingRequest) {
      console.log('[Auth] Role fetch already in progress, waiting...');
      await existingRequest;
      return;
    }
    
    // Create new request
    const roleRequest = async () => {
      try {
        console.log('[Auth] Fetching role from database...');
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        const fetchTime = performance.now() - perfStart;
        
        if (data && !error) {
          console.log('[Auth] Role fetched successfully:', data.role, `(${fetchTime.toFixed(2)}ms)`);
          setUserRole(data.role);
          
          // Cache the result
          roleCache.current.set(userId, {
            role: data.role,
            timestamp: Date.now()
          });
        } else if (error) {
          console.warn('[Auth] Error fetching user role:', error.message, `(${fetchTime.toFixed(2)}ms)`);
          // Set default role for new users
          setUserRole('viewer');
          roleCache.current.set(userId, {
            role: 'viewer',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        const fetchTime = performance.now() - perfStart;
        console.error('[Auth] Unexpected error fetching user role:', error, `(${fetchTime.toFixed(2)}ms)`);
        setUserRole('viewer');
      } finally {
        roleRequestTracker.current.delete(userId);
      }
    };
    
    roleRequestTracker.current.set(userId, roleRequest());
    await roleRequest();
  }, []);

  // Session refresh control
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const maxRefreshAttempts = 3;

  const refreshSession = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshing || refreshAttempts >= maxRefreshAttempts) {
      return;
    }

    try {
      setIsRefreshing(true);
      const refreshedSession = await refreshSessionIfNeeded(session);
      
      if (refreshedSession && refreshedSession !== session) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        setRefreshAttempts(0); // Reset attempts on success
        toast.success('Session refreshed successfully');
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setRefreshAttempts(prev => prev + 1);
      
      if (refreshAttempts >= maxRefreshAttempts - 1) {
        // Force logout after max attempts
        toast.error('Session refresh failed multiple times. Please log in again.');
        signOut();
      } else {
        toast.error('Session refresh failed. Please log in again.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [session, isRefreshing, refreshAttempts, maxRefreshAttempts]);

  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout;
    
    console.log('[Auth] Initializing auth system...', { 
      timestamp: new Date().toISOString(),
      startTime: `${(performance.now() - authStartTime.current).toFixed(2)}ms`
    });
    
    // Cross-tab session synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('sb-') && e.newValue === null) {
        console.log('[Auth] Session cleared in another tab, syncing...');
        // Session was cleared in another tab, sync this tab
        setSession(null);
        setUser(null);
        setUserRole(null);
        roleCache.current.clear();
      }
    };

    // Network status handling
    const handleOnline = () => {
      console.log('[Auth] Back online, refreshing session...');
      // Refresh session when coming back online
      if (session && !isRefreshing) {
        setTimeout(() => refreshSession(), 1000);
      }
    };

    // Optimized auth state change handler
    const handleAuthChange = async (event: string, newSession: Session | null) => {
      if (!mounted) return;

      const changeStartTime = performance.now();
      console.log('[Auth] Auth state change:', event, newSession?.user?.email, {
        timestamp: new Date().toISOString()
      });

      // Reset refresh attempts on successful auth change
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setRefreshAttempts(0);
      }

      // Optimized session handling - skip validation for some events
      if (newSession) {
        // Skip validation for token refresh if session looks valid
        if (event === 'TOKEN_REFRESHED' && newSession.expires_at && newSession.expires_at > Date.now() / 1000) {
          console.log('[Auth] Token refreshed, using session directly');
          setSession(newSession);
          setUser(newSession.user);
          // Use cached role if available
          const cached = roleCache.current.get(newSession.user.id);
          if (cached && Date.now() - cached.timestamp < ROLE_CACHE_TTL) {
            setUserRole(cached.role);
          } else {
            setTimeout(() => fetchUserRole(newSession.user.id), 0);
          }
        } else {
          // Full validation for other events
          const validation = await validateSession(newSession);
          const validationTime = performance.now() - changeStartTime;
          console.log('[Auth] Session validation completed', {
            isValid: validation.isValid,
            validationTime: `${validationTime.toFixed(2)}ms`
          });
          
          if (!validation.isValid) {
            console.warn('[Auth] Invalid session detected:', validation.error);
            if (validation.needsRefresh && !isRefreshing) {
              const refreshedSession = await refreshSessionIfNeeded(newSession);
              if (refreshedSession) {
                setSession(refreshedSession);
                setUser(refreshedSession.user);
                setTimeout(() => fetchUserRole(refreshedSession.user.id), 0);
              } else {
                setSession(null);
                setUser(null);
                setUserRole(null);
                roleCache.current.clear();
              }
            } else {
              setSession(null);
              setUser(null);
              setUserRole(null);
              roleCache.current.clear();
            }
          } else {
            setSession(newSession);
            setUser(newSession.user);
            setTimeout(() => fetchUserRole(newSession.user.id), 0);
          }
        }
      } else {
        console.log('[Auth] No session, clearing state');
        setSession(null);
        setUser(null);
        setUserRole(null);
        roleCache.current.clear();
      }
      
      const totalTime = performance.now() - changeStartTime;
      console.log('[Auth] Auth state change completed', {
        totalTime: `${totalTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // THEN check for existing session (with performance tracking)
    const getSessionStart = performance.now();
    console.log('[Auth] Checking for existing session...');
    
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!mounted) return;

      const sessionCheckTime = performance.now() - getSessionStart;
      console.log('[Auth] Session check completed', {
        hasSession: !!existingSession,
        checkTime: `${sessionCheckTime.toFixed(2)}ms`
      });

      if (existingSession) {
        // Skip validation if session looks fresh (less than 1 minute old)
        const sessionAge = Date.now() / 1000 - (existingSession.expires_at || 0) + 3600; // Approx age
        if (sessionAge < 60) {
          console.log('[Auth] Session is fresh, skipping validation');
          setSession(existingSession);
          setUser(existingSession.user);
          fetchUserRole(existingSession.user.id);
        } else {
          const validation = await validateSession(existingSession);
          if (validation.isValid) {
            setSession(existingSession);
            setUser(existingSession.user);
            fetchUserRole(existingSession.user.id);
          } else if (validation.needsRefresh && !isRefreshing) {
            const refreshedSession = await refreshSessionIfNeeded(existingSession);
            if (refreshedSession) {
              setSession(refreshedSession);
              setUser(refreshedSession.user);
              fetchUserRole(refreshedSession.user.id);
            }
          }
        }
      }
      
      const totalInitTime = performance.now() - authStartTime.current;
      console.log('[Auth] Auth initialization completed', {
        totalTime: `${totalInitTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    });

    // Set up session refresh interval with network awareness
    const setupRefreshInterval = () => {
      refreshInterval = setInterval(() => {
        if (session && navigator.onLine && !isRefreshing) {
          refreshSession();
        }
      }, 10 * 60 * 1000); // Refresh every 10 minutes
    };

    setupRefreshInterval();

    // Event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('online', handleOnline);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleOnline);
      
      console.log('[Auth] Auth system cleanup completed');
    };
  }, [fetchUserRole, refreshSession, isRefreshing]); // Removed session dependency to prevent loops

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message || 'Sign in failed');
      } else {
        toast.success('Signed in successfully');
      }
      
      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unexpected sign in error';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      const signOutStart = performance.now();
      console.log('[Auth] Starting sign out process...');
      
      setLoading(true);
      // Reset refresh attempts and state
      setRefreshAttempts(0);
      setIsRefreshing(false);
      
      // Clear cache
      roleCache.current.clear();
      roleRequestTracker.current.clear();
      
      const result = await performSecureLogout();
      const signOutTime = performance.now() - signOutStart;
      
      console.log('[Auth] Sign out completed', {
        success: result.success,
        signOutTime: `${signOutTime.toFixed(2)}ms`
      });
      
      if (result.success) {
        // Clear local state immediately
        setSession(null);
        setUser(null);
        setUserRole(null);
        toast.success('Signed out successfully');
      } else {
        // Still clear local state even if logout had issues
        setSession(null);
        setUser(null);
        setUserRole(null);
        toast.warning('Signed out (with cleanup issues)');
      }
    } catch (error: any) {
      console.error('[Auth] Sign out error:', error);
      // Force clear local state and cache
      setSession(null);
      setUser(null);
      setUserRole(null);
      roleCache.current.clear();
      roleRequestTracker.current.clear();
      toast.error('Sign out error, but session cleared');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback((requiredRoles: string[]) => {
    return checkPermissions(userRole, requiredRoles);
  }, [userRole]);

  const hasMinimumRole = useCallback((minimumRole: string) => {
    const userLevel = getRoleLevel(userRole);
    const requiredLevel = getRoleLevel(minimumRole);
    return userLevel >= requiredLevel;
  }, [userRole]);

  // Memoize computed values to prevent unnecessary re-renders
  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);
  const isEditor = useMemo(() => userRole === 'editor' || userRole === 'admin', [userRole]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    loading: loading || isRefreshing,
    userRole,
    isAdmin,
    isEditor,
    signIn,
    signOut,
    refreshSession,
    hasPermission,
    hasMinimumRole,
  }), [
    user, 
    session, 
    loading, 
    isRefreshing, 
    userRole, 
    isAdmin, 
    isEditor, 
    signIn, 
    signOut, 
    refreshSession, 
    hasPermission, 
    hasMinimumRole
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}