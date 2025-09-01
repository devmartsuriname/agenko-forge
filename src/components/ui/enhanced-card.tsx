import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui-system";
import { Skeleton } from "@/components/ui/skeleton";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-md hover:shadow-lg",
        interactive: "shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        flat: "border-0 shadow-none",
        outline: "border-2",
        ghost: "border-0 shadow-none bg-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      rounded: {
        default: "rounded-lg",
        sm: "rounded-md",
        lg: "rounded-xl",
        full: "rounded-2xl",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      rounded: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, loading, children, ...props }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant, padding, rounded, className }))}
          {...props}
        >
          <CardLoadingSkeleton />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, rounded, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "none" | "sm" | "default" | "lg";
  }
>(({ className, spacing = "default", ...props }, ref) => {
  const spacingMap = {
    none: "space-y-0",
    sm: "space-y-1",
    default: "space-y-1.5",
    lg: "space-y-2",
  };

  return (
    <div
      ref={ref}
      className={cn("flex flex-col", spacingMap[spacing], className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    size?: "sm" | "default" | "lg" | "xl";
  }
>(({ className, as: Component = "h3", size = "default", ...props }, ref) => {
  const sizeMap = {
    sm: "text-lg font-medium",
    default: "text-xl font-semibold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "leading-none tracking-tight",
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "sm" | "default" | "lg";
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeMap = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  return (
    <p
      ref={ref}
      className={cn("text-muted-foreground", sizeMap[size], className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "none" | "sm" | "default" | "lg";
  }
>(({ className, spacing = "default", ...props }, ref) => {
  const spacingMap = {
    none: "pt-0",
    sm: "pt-2",
    default: "pt-0",
    lg: "pt-4",
  };

  return (
    <div
      ref={ref}
      className={cn(spacingMap[spacing], className)}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: "start" | "center" | "end" | "between";
  }
>(({ className, justify = "start", ...props }, ref) => {
  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      ref={ref}
      className={cn("flex items-center pt-0", justifyMap[justify], className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

// Loading skeleton for cards
const CardLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardLoadingSkeleton,
  cardVariants 
};