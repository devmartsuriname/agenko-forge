import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}