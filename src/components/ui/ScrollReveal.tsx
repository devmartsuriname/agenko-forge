import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';
import { motionConfig } from '@/lib/motion.config';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
  stagger?: boolean;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
  stagger = false,
}: ScrollRevealProps) {
  const { elementRef, isVisible } = useScrollReveal<HTMLDivElement>();
  const { getSafeDuration, getSafeTransform } = useReducedMotionSafe();

  // Get safe values for reduced motion
  const safeDuration = getSafeDuration('normal');
  const safeTransform = getSafeTransform('translateY(0)');

  return (
    <div
      ref={elementRef}
      className={cn(
        'scroll-reveal',
        `slide-${direction}`,
        {
          'revealed': isVisible,
          'stagger-children': stagger,
        },
        className
      )}
      style={{
        transitionDuration: `${safeDuration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: motionConfig.easing.smooth,
      }}
    >
      {children}
    </div>
  );
}