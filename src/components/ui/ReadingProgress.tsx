import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface ReadingProgressProps {
  target?: string; // CSS selector for the content container
  className?: string;
}

export function ReadingProgress({ 
  target = 'main', 
  className 
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const { prefersReducedMotion } = useReducedMotionSafe();

  useEffect(() => {
    const updateProgress = () => {
      const targetElement = document.querySelector(target);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = targetElement.scrollHeight;
      
      // Calculate how much of the content has been scrolled past
      const scrolledPast = Math.max(0, -rect.top);
      const totalScrollable = documentHeight - windowHeight;
      
      if (totalScrollable <= 0) {
        setProgress(100);
        return;
      }
      
      const progressPercent = Math.min(100, (scrolledPast / totalScrollable) * 100);
      setProgress(progressPercent);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [target]);

  if (prefersReducedMotion) {
    return null; // Hide progress bar for reduced motion users
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 h-1 bg-border",
      className
    )}>
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Reading progress: ${Math.round(progress)}%`}
      />
    </div>
  );
}