import React from "react";
import { cn } from "@/lib/ui-system";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle, AlertCircle, AlertTriangle, Info, Clock, X } from "lucide-react";

// Status indicator variants
const statusVariants = cva(
  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success border border-success/20",
        error: "bg-destructive/10 text-destructive border border-destructive/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        info: "bg-info/10 text-info border border-info/20",
        pending: "bg-muted text-muted-foreground border border-border",
        neutral: "bg-background text-foreground border border-border",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
      },
      showIcon: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
      showIcon: true,
    },
  }
);

// Status badge component
interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const StatusIndicator = ({
  variant,
  size,
  showIcon,
  children,
  icon,
  className,
  ...props
}: StatusIndicatorProps) => {
  const getDefaultIcon = () => {
    if (!showIcon) return null;
    
    if (icon) return icon;
    
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(statusVariants({ variant, size, className }))}
      {...props}
    >
      {getDefaultIcon()}
      {children}
    </div>
  );
};

// Dot indicator for simple status
interface StatusDotProps {
  variant?: "success" | "error" | "warning" | "info" | "pending" | "neutral";
  size?: "sm" | "default" | "lg";
  animated?: boolean;
  className?: string;
}

export const StatusDot = ({ 
  variant = "neutral", 
  size = "default", 
  animated = false,
  className 
}: StatusDotProps) => {
  const sizeMap = {
    sm: "h-2 w-2",
    default: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const colorMap = {
    success: "bg-success",
    error: "bg-destructive",
    warning: "bg-warning",
    info: "bg-info",
    pending: "bg-muted-foreground",
    neutral: "bg-border",
  };

  return (
    <div 
      className={cn(
        "rounded-full",
        sizeMap[size],
        colorMap[variant],
        animated && "animate-pulse",
        className
      )}
    />
  );
};

// Progress status with steps
interface ProgressStatusProps {
  steps: Array<{
    label: string;
    status: "completed" | "current" | "pending" | "error";
    description?: string;
  }>;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const ProgressStatus = ({ 
  steps, 
  orientation = "horizontal", 
  className 
}: ProgressStatusProps) => {
  const isVertical = orientation === "vertical";
  
  return (
    <div className={cn(
      "flex",
      isVertical ? "flex-col space-y-4" : "flex-row items-center space-x-4",
      className
    )}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={index}>
            <div className={cn(
              "flex items-center",
              isVertical ? "flex-row space-x-3" : "flex-col space-y-2"
            )}>
              {/* Step indicator */}
              <div className="relative">
                {step.status === "completed" && (
                  <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success-foreground" />
                  </div>
                )}
                
                {step.status === "current" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <div className="h-3 w-3 rounded-full bg-primary-foreground" />
                  </div>
                )}
                
                {step.status === "pending" && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  </div>
                )}
                
                {step.status === "error" && (
                  <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center">
                    <X className="h-5 w-5 text-destructive-foreground" />
                  </div>
                )}
              </div>
              
              {/* Step content */}
              <div className={cn(isVertical ? "flex-1" : "text-center")}>
                <div className={cn(
                  "font-medium text-sm",
                  step.status === "completed" && "text-success",
                  step.status === "current" && "text-primary",
                  step.status === "pending" && "text-muted-foreground",
                  step.status === "error" && "text-destructive"
                )}>
                  {step.label}
                </div>
                
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                "bg-border",
                isVertical 
                  ? "w-px h-8 ml-4" 
                  : "h-px flex-1 min-w-8",
                (step.status === "completed" || steps[index + 1]?.status === "current") && "bg-success"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};