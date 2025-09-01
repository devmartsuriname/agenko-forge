import { useEffect, useState, useCallback } from 'react';
import { motionConfig } from '@/lib/motion.config';
import { useReducedMotionSafe } from './useReducedMotionSafe';

interface UseScrollProgressOptions {
  threshold?: number;
  offset?: number;
}

/**
 * Hook for tracking scroll progress within an element
 * Used for progress scrubbing and parallax effects
 */
export function useScrollProgress({ 
  threshold = 0.1, 
  offset = 0 
}: UseScrollProgressOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const { prefersReducedMotion } = useReducedMotionSafe();

  const handleScroll = useCallback(() => {
    if (prefersReducedMotion) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate progress as percentage of page scroll
    const maxScroll = documentHeight - windowHeight;
    const currentProgress = Math.min(scrollY / maxScroll, 1);
    
    setProgress(currentProgress);
    setIsInView(currentProgress > threshold);
  }, [threshold, prefersReducedMotion]);

  useEffect(() => {
    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // Calculate parallax transform value
  const getParallaxTransform = (layer: keyof typeof motionConfig.parallax = 'background') => {
    if (prefersReducedMotion) return 'translateY(0)';
    
    const multiplier = motionConfig.parallax[layer];
    const translateY = progress * 100 * multiplier + offset;
    
    // Cap the translation to prevent excessive movement
    const clampedTranslateY = Math.max(-100, Math.min(100, translateY));
    
    return `translateY(${clampedTranslateY}px)`;
  };

  return {
    progress,
    isInView,
    getParallaxTransform,
  };
}