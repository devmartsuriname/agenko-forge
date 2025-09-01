import React from "react";
import { cn } from "@/lib/ui-system";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";

// Loading spinner variants
interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "muted";
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  variant = "default", 
  className 
}: LoadingSpinnerProps) => {
  const sizeMap = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const variantMap = {
    default: "text-muted-foreground",
    primary: "text-primary",
    muted: "text-muted-foreground/60",
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeMap[size],
        variantMap[variant],
        className
      )}
    />
  );
};

// Page loading state
interface PageLoadingProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export const PageLoading = ({ 
  message = "Loading...", 
  showSpinner = true, 
  className 
}: PageLoadingProps) => (
  <div className={cn(
    "flex flex-col items-center justify-center min-h-[400px] space-y-4",
    className
  )}>
    {showSpinner && <LoadingSpinner size="lg" variant="primary" />}
    <p className="text-lg text-muted-foreground animate-pulse">
      {message}
    </p>
  </div>
);

// Content loading skeleton templates
export const ContentLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export const ListLoadingSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

export const TableLoadingSkeleton = ({ 
  rows = 5, 
  cols = 4 
}: { 
  rows?: number; 
  cols?: number; 
}) => (
  <div className="space-y-4">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {/* Header row */}
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={rowIndex} 
        className="grid gap-4" 
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-6 w-full" />
        ))}
      </div>
    ))}
  </div>
);

// Error states
interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an error while loading this content.",
  action,
  icon,
  className
}: ErrorStateProps) => (
  <div className={cn(
    "flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center",
    className
  )}>
    <div className="text-destructive">
      {icon || <AlertCircle className="h-12 w-12" />}
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
    {action && (
      <Button onClick={action.onClick} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        {action.label}
      </Button>
    )}
  </div>
);

// Network status indicator
interface NetworkStatusProps {
  isOnline?: boolean;
  className?: string;
}

export const NetworkStatus = ({ isOnline = true, className }: NetworkStatusProps) => (
  <div className={cn(
    "inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs",
    isOnline 
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    className
  )}>
    {isOnline ? (
      <Wifi className="h-3 w-3" />
    ) : (
      <WifiOff className="h-3 w-3" />
    )}
    {isOnline ? "Online" : "Offline"}
  </div>
);

// Empty state component
interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  title = "No data found",
  message = "There's nothing here yet.",
  action,
  icon,
  className
}: EmptyStateProps) => (
  <div className={cn(
    "flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center",
    className
  )}>
    <div className="text-muted-foreground/60">
      {icon || <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">📭</div>}
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground/80 max-w-md">{message}</p>
    </div>
    {action && (
      <Button onClick={action.onClick} variant="outline" size="sm">
        {action.label}
      </Button>
    )}
  </div>
);

// Progress indicator
interface ProgressIndicatorProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressIndicator = ({
  progress,
  label,
  showPercentage = true,
  className
}: ProgressIndicatorProps) => (
  <div className={cn("space-y-2", className)}>
    {(label || showPercentage) && (
      <div className="flex justify-between items-center">
        {label && <span className="text-sm font-medium">{label}</span>}
        {showPercentage && (
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        )}
      </div>
    )}
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);