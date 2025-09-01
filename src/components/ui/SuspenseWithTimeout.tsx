import React, { Suspense, useState, useEffect, ReactNode } from 'react';
import { Spinner } from './spinner';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { RotateCcw } from 'lucide-react';

interface SuspenseWithTimeoutProps {
  children: ReactNode;
  fallback?: ReactNode;
  timeout?: number;
  onTimeout?: () => void;
}

export const SuspenseWithTimeout: React.FC<SuspenseWithTimeoutProps> = ({
  children,
  fallback = <Spinner />,
  timeout = 10000, // 10 seconds
  onTimeout
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout, key]);

  const handleRetry = () => {
    setHasTimedOut(false);
    setKey(prev => prev + 1);
  };

  if (hasTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-4">
        <Alert className="max-w-md">
          <AlertDescription className="space-y-4">
            <p>This component is taking longer than expected to load.</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Suspense key={key} fallback={fallback}>
      {children}
    </Suspense>
  );
};