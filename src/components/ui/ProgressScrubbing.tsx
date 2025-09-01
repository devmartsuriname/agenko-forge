import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollProgress } from '@/hooks/useScrollProgress';

interface ProgressScrubbingProps {
  children: ReactNode;
  intensity?: number; // How much the element moves (0-1)
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function ProgressScrubbing({
  children,
  intensity = 0.5,
  direction = 'up',
  className,
}: ProgressScrubbingProps) {
  const { progress } = useScrollProgress();

  // Calculate transform value based on progress and intensity
  const getTransform = () => {
    const maxMovement = 50; // Maximum pixels to move
    const movement = progress * maxMovement * intensity;

    switch (direction) {
      case 'up':
        return `translateY(-${movement}px)`;
      case 'down':
        return `translateY(${movement}px)`;
      case 'left':
        return `translateX(-${movement}px)`;
      case 'right':
        return `translateX(${movement}px)`;
      default:
        return 'none';
    }
  };

  return (
    <div
      className={cn("transition-transform duration-75 ease-linear", className)}
      style={{
        transform: getTransform(),
      }}
    >
      {children}
    </div>
  );
}