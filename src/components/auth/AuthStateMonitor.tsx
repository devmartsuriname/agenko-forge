import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export const AuthStateMonitor: React.FC = () => {
  const { session, loading, refreshSession } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineWarning(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (session && !loading) {
      const now = Math.round(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;
      
      // Show warning if session expires in less than 5 minutes
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        setSessionWarning(`Session expires in ${Math.floor(timeUntilExpiry / 60)} minutes`);
      } else {
        setSessionWarning(null);
      }
    }
  }, [session, loading]);

  // Don't render anything if user is not authenticated
  if (!session || loading) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Offline Warning */}
      {showOfflineWarning && (
        <Alert variant="destructive" className="max-w-sm">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You're offline</span>
            {isOnline && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowOfflineWarning(false)}
              >
                Dismiss
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Session Warning */}
      {sessionWarning && (
        <Alert variant="default" className="max-w-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{sessionWarning}</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshSession}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Indicator */}
      <div className="flex items-center justify-end">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isOnline 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};