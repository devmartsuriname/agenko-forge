import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
  children: ReactNode;
  variant?: 'default' | 'delayed';
  className?: string;
}

export function FloatingElement({
  children,
  variant = 'default',
  className,
}: FloatingElementProps) {
  return (
    <div
      className={cn(
        variant === 'delayed' ? 'floating-element-delayed' : 'floating-element',
        className
      )}
    >
      {children}
    </div>
  );
}