import { useEffect, useState } from 'react';
import { motionConfig } from '@/lib/motion.config';

/**
 * Hook to detect and handle reduced motion preferences
 * Returns safe motion values when user prefers reduced motion
 */
export function useReducedMotionSafe() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getMotionValue = <T>(normalValue: T, reducedValue?: T): T => {
    if (prefersReducedMotion && reducedValue !== undefined) {
      return reducedValue;
    }
    return normalValue;
  };

  const getSafeDuration = (duration: keyof typeof motionConfig.duration) => {
    return getMotionValue(
      motionConfig.duration[duration],
      motionConfig.reducedMotion.duration
    );
  };

  const getSafeTransform = (transform: string) => {
    return getMotionValue(transform, motionConfig.reducedMotion.transform);
  };

  return {
    prefersReducedMotion,
    getMotionValue,
    getSafeDuration,
    getSafeTransform,
  };
}