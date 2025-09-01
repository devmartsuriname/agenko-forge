import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface RouteTransitionProps {
  children: ReactNode;
  className?: string;
}

export function RouteTransition({ children, className }: RouteTransitionProps) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { prefersReducedMotion, getSafeDuration } = useReducedMotionSafe();

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Start transition
    setIsTransitioning(true);

    // End transition after animation completes
    const duration = getSafeDuration('fast') * 1000;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [location.pathname, prefersReducedMotion, getSafeDuration]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "transition-opacity duration-200 ease-out",
        isTransitioning ? "opacity-0" : "opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}