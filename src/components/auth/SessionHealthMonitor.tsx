import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { validateSession } from '@/lib/auth-middleware';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SessionHealth {
  status: 'healthy' | 'warning' | 'critical' | 'recovering';
  message: string;
  lastCheck: Date;
  expiresIn?: number;
}

export const SessionHealthMonitor: React.FC = () => {
  const { session, loading, refreshSession } = useAuth();
  const { isRecovering, recoveryAttempts, maxRecoveryAttempts, attemptRecovery, canRetry } = useSessionRecovery();
  const [health, setHealth] = useState<SessionHealth>({
    status: 'healthy',
    message: 'Session is healthy',
    lastCheck: new Date()
  });
  const [showDetails, setShowDetails] = useState(false);

  // Check session health
  const checkSessionHealth = async () => {
    if (!session || loading) {
      setHealth({
        status: 'critical',
        message: 'No active session',
        lastCheck: new Date()
      });
      return;
    }

    try {
      const validation = await validateSession(session);
      const now = Math.round(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const expiresIn = Math.max(0, expiresAt - now);

      if (!validation.isValid) {
        setHealth({
          status: 'critical',
          message: validation.error || 'Session is invalid',
          lastCheck: new Date(),
          expiresIn
        });
      } else if (validation.needsRefresh) {
        setHealth({
          status: 'warning',
          message: 'Session needs refresh',
          lastCheck: new Date(),
          expiresIn
        });
      } else if (expiresIn < 300) { // Less than 5 minutes
        setHealth({
          status: 'warning',
          message: `Session expires in ${Math.floor(expiresIn / 60)} minutes`,
          lastCheck: new Date(),
          expiresIn
        });
      } else {
        setHealth({
          status: 'healthy',
          message: 'Session is healthy',
          lastCheck: new Date(),
          expiresIn
        });
      }
    } catch (error) {
      setHealth({
        status: 'critical',
        message: 'Session health check failed',
        lastCheck: new Date()
      });
    }
  };

  // Update health when recovering
  useEffect(() => {
    if (isRecovering) {
      setHealth(prev => ({
        ...prev,
        status: 'recovering',
        message: `Recovering session... (${recoveryAttempts}/${maxRecoveryAttempts})`,
        lastCheck: new Date()
      }));
    }
  }, [isRecovering, recoveryAttempts, maxRecoveryAttempts]);

  // Regular health checks
  useEffect(() => {
    checkSessionHealth();
    const interval = setInterval(checkSessionHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [session, loading]);

  // Don't render if no session and not loading
  if (!session && !loading) {
    return null;
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <ShieldCheck className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <ShieldAlert className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'recovering':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'recovering':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2">
      {/* Session Health Status */}
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${getStatusColor()}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{health.message}</span>
        {health.status === 'warning' && canRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              refreshSession();
            }}
            className="ml-2 h-6 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <Alert className="max-w-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session Details</span>
                <Badge variant="outline" className="text-xs">
                  {health.status}
                </Badge>
              </div>
              
              {health.expiresIn !== undefined && (
                <div className="text-xs text-muted-foreground">
                  Expires in: {Math.floor(health.expiresIn / 60)}m {health.expiresIn % 60}s
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Last check: {health.lastCheck.toLocaleTimeString()}
              </div>
              
              {health.status === 'critical' && canRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={attemptRecovery}
                  disabled={isRecovering}
                  className="w-full mt-2"
                >
                  {isRecovering ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Recovering...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Attempt Recovery
                    </>
                  )}
                </Button>
              )}
              
              {!canRetry && recoveryAttempts > 0 && (
                <div className="flex items-center text-xs text-red-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  Recovery failed ({recoveryAttempts}/{maxRecoveryAttempts})
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};