import React from "react";
import { cn } from "@/lib/ui-system";

// Responsive grid system
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const ResponsiveGrid = ({ 
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
  className,
  children,
  ...props
}: ResponsiveGridProps) => {
  const gapMap = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  const getColsClass = () => {
    let classes = [];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(" ");
  };

  return (
    <div 
      className={cn(
        "grid",
        getColsClass(),
        gapMap[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Auto-fit grid that adjusts columns based on content
interface AutoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minWidth?: string;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const AutoGrid = ({ 
  minWidth = "250px",
  gap = "md",
  className,
  children,
  style,
  ...props
}: AutoGridProps) => {
  const gapMap = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  return (
    <div 
      className={cn("grid", gapMap[gap], className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Masonry-style grid
interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const MasonryGrid = ({ 
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
  className,
  children,
  ...props
}: MasonryGridProps) => {
  const gapMap = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  const getColsClass = () => {
    let classes = [];
    
    if (cols.default) classes.push(`columns-${cols.default}`);
    if (cols.sm) classes.push(`sm:columns-${cols.sm}`);
    if (cols.md) classes.push(`md:columns-${cols.md}`);
    if (cols.lg) classes.push(`lg:columns-${cols.lg}`);
    
    return classes.join(" ");
  };

  return (
    <div 
      className={cn(
        getColsClass(),
        gapMap[gap],
        "space-y-4",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="break-inside-avoid">
          {child}
        </div>
      ))}
    </div>
  );
};

// Flex grid for equal height items
interface FlexGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  equalHeight?: boolean;
  children: React.ReactNode;
}

export const FlexGrid = ({ 
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
  equalHeight = true,
  className,
  children,
  ...props
}: FlexGridProps) => {
  const gapMap = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };

  const getFlexBasis = () => {
    const { default: def = 1, sm, md, lg, xl } = cols;
    
    return {
      flexBasis: `${100 / def}%`,
      [`@media (min-width: 640px)`]: sm ? { flexBasis: `${100 / sm}%` } : {},
      [`@media (min-width: 768px)`]: md ? { flexBasis: `${100 / md}%` } : {},
      [`@media (min-width: 1024px)`]: lg ? { flexBasis: `${100 / lg}%` } : {},
      [`@media (min-width: 1280px)`]: xl ? { flexBasis: `${100 / xl}%` } : {},
    };
  };

  return (
    <div 
      className={cn(
        "flex flex-wrap",
        gapMap[gap],
        equalHeight && "items-stretch",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className={cn(
            "flex-shrink-0",
            `basis-full`,
            cols.sm && `sm:basis-1/${cols.sm}`,
            cols.md && `md:basis-1/${cols.md}`,
            cols.lg && `lg:basis-1/${cols.lg}`,
            cols.xl && `xl:basis-1/${cols.xl}`,
            equalHeight && "flex flex-col"
          )}
        >
          {equalHeight ? (
            <div className="flex-1 flex flex-col">{child}</div>
          ) : (
            child
          )}
        </div>
      ))}
    </div>
  );
};