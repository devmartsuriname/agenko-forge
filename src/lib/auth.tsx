import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setUserRole(data.role);
      } else if (error) {
        console.warn('Error fetching user role:', error.message);
        // Set default role for new users
        setUserRole('viewer');
      }
    } catch (error) {
      console.error('Unexpected error fetching user role:', error);
      setUserRole('viewer');
    }
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
    
    // Cross-tab session synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('sb-') && e.newValue === null) {
        // Session was cleared in another tab, sync this tab
        setSession(null);
        setUser(null);
        setUserRole(null);
      }
    };

    // Network status handling
    const handleOnline = () => {
      // Refresh session when coming back online
      if (session && !isRefreshing) {
        setTimeout(() => refreshSession(), 1000);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('Auth state change:', event, newSession?.user?.email);

        // Reset refresh attempts on successful auth change
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setRefreshAttempts(0);
        }

        // Handle session validation
        if (newSession) {
          const validation = await validateSession(newSession);
          if (!validation.isValid) {
            console.warn('Invalid session detected:', validation.error);
            if (validation.needsRefresh && !isRefreshing) {
              const refreshedSession = await refreshSessionIfNeeded(newSession);
              if (refreshedSession) {
                setSession(refreshedSession);
                setUser(refreshedSession.user);
                setTimeout(() => fetchUserRole(refreshedSession.user.id), 0);
              } else {
                // Session refresh failed, clear state
                setSession(null);
                setUser(null);
                setUserRole(null);
              }
            } else {
              setSession(null);
              setUser(null);
              setUserRole(null);
            }
          } else {
            setSession(newSession);
            setUser(newSession.user);
            setTimeout(() => fetchUserRole(newSession.user.id), 0);
          }
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!mounted) return;

      if (existingSession) {
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
    };
  }, [fetchUserRole, refreshSession, session, isRefreshing]);

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
      setLoading(true);
      // Reset refresh attempts and state
      setRefreshAttempts(0);
      setIsRefreshing(false);
      
      const result = await performSecureLogout();
      
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
      console.error('Sign out error:', error);
      // Force clear local state
      setSession(null);
      setUser(null);
      setUserRole(null);
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

  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor' || userRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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