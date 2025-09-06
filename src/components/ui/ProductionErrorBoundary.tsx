import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Production Error Boundary', error, 'ErrorBoundary');
    
    // Log additional context
    logger.error('Error Info', {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ProductionErrorBoundary',
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Dispatch custom event for global error handling
    window.dispatchEvent(new CustomEvent('reacterror', {
      detail: { error, errorInfo, errorId: this.state.errorId }
    }));

    this.setState({ errorInfo });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: ''
    });
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // In production, this would send to error reporting service
    logger.error('User-reported error', errorReport);
    
    // Copy error details to clipboard for user to share
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert('Error details copied to clipboard. Please share with support.');
        })
        .catch(() => {
          alert(`Error ID: ${this.state.errorId}\nPlease share this ID with support.`);
        });
    } else {
      alert(`Error ID: ${this.state.errorId}\nPlease share this ID with support.`);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error ID for support */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error ID:</strong> <code className="text-sm">{this.state.errorId}</code>
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Share this ID when contacting support
                  </span>
                </AlertDescription>
              </Alert>

              {/* Development-only error details */}
              {isDevelopment && this.props.showDetails && this.state.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <details className="space-y-2">
                      <summary className="cursor-pointer font-medium">
                        Error Details (Development)
                      </summary>
                      <div className="text-sm font-mono bg-muted p-2 rounded mt-2 overflow-auto">
                        <div><strong>Error:</strong> {this.state.error.message}</div>
                        {this.state.error.stack && (
                          <div className="mt-2">
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div className="mt-2">
                            <strong>Component Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button onClick={this.handleRetry} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button onClick={this.handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                
                <Button onClick={this.handleReportError} variant="ghost" size="sm">
                  <Bug className="h-4 w-4 mr-2" />
                  Report Error
                </Button>
              </div>

              {/* User-friendly tips */}
              <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
                <p><strong>Quick fixes to try:</strong></p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Refresh the page or try again in a few moments</li>
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try using a different browser or incognito mode</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}