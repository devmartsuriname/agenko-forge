/**
 * UI System Design Tokens & Utilities
 * Comprehensive design system for consistent UI/UX patterns
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Enhanced utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Spacing system
export const SPACING = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
  "4xl": "6rem",   // 96px
} as const;

// Typography scales
export const TYPOGRAPHY = {
  // Font sizes
  text: {
    xs: "text-xs",     // 12px
    sm: "text-sm",     // 14px
    base: "text-base", // 16px
    lg: "text-lg",     // 18px
    xl: "text-xl",     // 20px
    "2xl": "text-2xl", // 24px
    "3xl": "text-3xl", // 30px
    "4xl": "text-4xl", // 36px
    "5xl": "text-5xl", // 48px
    "6xl": "text-6xl", // 60px
  },
  // Font weights
  weight: {
    light: "font-light",     // 300
    normal: "font-normal",   // 400
    medium: "font-medium",   // 500
    semibold: "font-semibold", // 600
    bold: "font-bold",       // 700
  },
  // Line heights
  leading: {
    tight: "leading-tight",   // 1.25
    snug: "leading-snug",     // 1.375
    normal: "leading-normal", // 1.5
    relaxed: "leading-relaxed", // 1.625
    loose: "leading-loose",   // 2
  },
} as const;

// Color system utilities
export const COLORS = {
  semantic: {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
    muted: "hsl(var(--muted))",
    destructive: "hsl(var(--destructive))",
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    info: "hsl(var(--info))",
  },
  brand: {
    green: "hsl(var(--agenko-green))",
    dark: "hsl(var(--agenko-dark))",
    gray: "hsl(var(--agenko-gray))",
    white: "hsl(var(--agenko-white))",
  },
} as const;

// Shadow system
export const SHADOWS = {
  xs: "shadow-xs",
  sm: "shadow-sm",
  base: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  soft: "shadow-soft",
  glow: "shadow-glow",
  card: "shadow-card",
} as const;

// Border radius system
export const RADIUS = {
  none: "rounded-none",
  sm: "rounded-sm",
  base: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const;

// Animation utilities
export const ANIMATIONS = {
  transition: {
    none: "transition-none",
    all: "transition-all",
    colors: "transition-colors",
    opacity: "transition-opacity",
    shadow: "transition-shadow",
    transform: "transition-transform",
  },
  duration: {
    75: "duration-75",
    100: "duration-100",
    150: "duration-150",
    200: "duration-200",
    300: "duration-300",
    500: "duration-500",
    700: "duration-700",
    1000: "duration-1000",
  },
  ease: {
    linear: "ease-linear",
    in: "ease-in",
    out: "ease-out",
    "in-out": "ease-in-out",
  },
  animate: {
    none: "animate-none",
    spin: "animate-spin",
    ping: "animate-ping",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    "fade-in": "animate-fade-in",
    "slide-up": "animate-slide-up",
    "slide-down": "animate-slide-down",
    "scale-in": "animate-scale-in",
    float: "animate-float",
  },
} as const;

// Responsive breakpoints helper
export const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

// Layout utilities
export const LAYOUT = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-16 md:py-24",
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 md:grid-cols-2",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    auto: "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",
  },
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  },
} as const;

// Focus styles for accessibility
export const FOCUS = {
  ring: "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  visible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  within: "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
} as const;

// Interactive states
export const INTERACTIVE = {
  hover: {
    scale: "hover:scale-105",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    glow: "hover:shadow-glow",
    brightness: "hover:brightness-110",
  },
  active: {
    scale: "active:scale-95",
    press: "active:translate-y-0.5",
  },
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
} as const;

// Status color variants
export const STATUS_COLORS = {
  success: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800",
  error: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
  info: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
} as const;

// Component size variants
export const SIZES = {
  xs: { padding: "px-2 py-1", text: "text-xs", height: "h-6" },
  sm: { padding: "px-3 py-2", text: "text-sm", height: "h-8" },
  md: { padding: "px-4 py-2", text: "text-base", height: "h-10" },
  lg: { padding: "px-6 py-3", text: "text-lg", height: "h-12" },
  xl: { padding: "px-8 py-4", text: "text-xl", height: "h-14" },
} as const;

// Utility class generators
export const generateClasses = {
  button: (variant: keyof typeof STATUS_COLORS, size: keyof typeof SIZES) => cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    FOCUS.ring,
    INTERACTIVE.hover.scale,
    INTERACTIVE.active.scale,
    INTERACTIVE.disabled,
    SIZES[size].padding,
    SIZES[size].text,
    STATUS_COLORS[variant]
  ),
  
  card: (elevated = false) => cn(
    "rounded-lg border bg-card text-card-foreground",
    elevated ? SHADOWS.lg : SHADOWS.sm,
    ANIMATIONS.transition.all,
    ANIMATIONS.duration[200],
    INTERACTIVE.hover.lift
  ),
  
  input: () => cn(
    "flex w-full rounded-md border border-input bg-background px-3 py-2",
    "text-sm ring-offset-background file:border-0 file:bg-transparent",
    "file:text-sm file:font-medium placeholder:text-muted-foreground",
    FOCUS.visible,
    INTERACTIVE.disabled
  ),
};

// Screen reader utilities
export const ACCESSIBILITY = {
  srOnly: "sr-only",
  notSrOnly: "not-sr-only",
  focusable: "focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md",
} as const;