import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { LogOut, Loader2 } from 'lucide-react';

interface SecureLogoutProps {
  children?: React.ReactNode;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onLogoutError?: (error: string) => void;
}

export const SecureLogout: React.FC<SecureLogoutProps> = ({
  children,
  showIcon = true,
  variant = 'ghost',
  size = 'default',
  className = '',
  onLogoutStart,
  onLogoutComplete,
  onLogoutError
}) => {
  const { signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutAttempts, setLogoutAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    
    setIsLoggingOut(true);
    setLastError(null);
    onLogoutStart?.();
    
    try {
      await signOut();
      setLogoutAttempts(0);
      onLogoutComplete?.();
    } catch (error: any) {
      const errorMessage = error?.message || 'Logout failed';
      console.error('Logout error:', error);
      setLastError(errorMessage);
      setLogoutAttempts(prev => prev + 1);
      onLogoutError?.(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={loading || isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {showIcon && <LogOut className="h-4 w-4 mr-2" />}
              {children || 'Sign Out'}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? This will end your current session and you'll need to sign in again to access the admin panel.
            {lastError && (
              <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                Previous logout failed: {lastError}
                {logoutAttempts > 1 && ` (${logoutAttempts} attempts)`}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};