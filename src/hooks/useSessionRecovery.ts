import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { validateSession } from '@/lib/auth-middleware';
import { toast } from 'sonner';

interface SessionRecoveryOptions {
  maxRecoveryAttempts?: number;
  recoveryIntervalMs?: number;
  enableAutoRecovery?: boolean;
}

export function useSessionRecovery(options: SessionRecoveryOptions = {}) {
  const {
    maxRecoveryAttempts = 3,
    recoveryIntervalMs = 30000, // 30 seconds
    enableAutoRecovery = true
  } = options;

  const { session, refreshSession, signOut } = useAuth();
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastRecoveryTime, setLastRecoveryTime] = useState<number>(0);

  const attemptRecovery = useCallback(async () => {
    if (isRecovering || recoveryAttempts >= maxRecoveryAttempts) {
      return false;
    }

    const now = Date.now();
    if (now - lastRecoveryTime < recoveryIntervalMs) {
      return false; // Too soon to retry
    }

    setIsRecovering(true);
    setLastRecoveryTime(now);

    try {
      if (session) {
        const validation = await validateSession(session);
        if (validation.isValid || validation.needsRefresh) {
          await refreshSession();
          setRecoveryAttempts(0); // Reset on success
          toast.success('Session recovered successfully');
          return true;
        }
      }

      // If no session or invalid session, increment attempts
      setRecoveryAttempts(prev => prev + 1);
      
      if (recoveryAttempts >= maxRecoveryAttempts - 1) {
        toast.error('Session recovery failed. Please log in again.');
        await signOut();
        return false;
      }

      toast.warning(`Session recovery attempt ${recoveryAttempts + 1}/${maxRecoveryAttempts}`);
      return false;
    } catch (error) {
      console.error('Session recovery error:', error);
      setRecoveryAttempts(prev => prev + 1);
      
      if (recoveryAttempts >= maxRecoveryAttempts - 1) {
        toast.error('Session recovery failed. Please log in again.');
        await signOut();
      }
      
      return false;
    } finally {
      setIsRecovering(false);
    }
  }, [session, refreshSession, signOut, isRecovering, recoveryAttempts, maxRecoveryAttempts, lastRecoveryTime, recoveryIntervalMs]);

  // Auto-recovery on network reconnection
  useEffect(() => {
    if (!enableAutoRecovery) return;

    const handleOnline = () => {
      if (session && !isRecovering) {
        setTimeout(() => attemptRecovery(), 2000); // Wait 2 seconds after reconnection
      }
    };

    const handleFocus = () => {
      if (session && !isRecovering && document.visibilityState === 'visible') {
        // Check session validity when tab becomes visible
        setTimeout(() => attemptRecovery(), 1000);
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [session, isRecovering, attemptRecovery, enableAutoRecovery]);

  // Reset recovery attempts on successful session change
  useEffect(() => {
    if (session) {
      setRecoveryAttempts(0);
    }
  }, [session]);

  return {
    isRecovering,
    recoveryAttempts,
    maxRecoveryAttempts,
    attemptRecovery,
    canRetry: recoveryAttempts < maxRecoveryAttempts && !isRecovering
  };
}