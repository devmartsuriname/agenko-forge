/**
 * Enhanced Production Error Boundary
 * Phase 5: Production Console Cleanup - Better error handling
 */

import React, { Component, ReactNode } from 'react';
import { useErrorHandler } from '@/lib/production-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class EnhancedProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to production error handler
    if (typeof window !== 'undefined') {
      const { productionErrorHandler } = require('@/lib/production-error-handler');
      productionErrorHandler.handleError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'EnhancedProductionErrorBoundary'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Go Back
              </button>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono text-muted-foreground overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useProductionErrorBoundary = () => {
  const { handleError, getErrorStats } = useErrorHandler();
  
  const reportError = (error: Error, context?: any) => {
    handleError(error, context);
  };

  return {
    reportError,
    errorStats: getErrorStats()
  };
};