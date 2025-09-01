import { useEffect, useRef, useState } from 'react';
import { useReducedMotionSafe } from './useReducedMotionSafe';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimal?: string;
  decimals?: number;
  trigger?: boolean;
}

/**
 * Hook for animating numbers with count-up effect
 * Respects reduced motion preferences
 */
export function useCountUp({
  start = 0,
  end,
  duration = 1.5,
  prefix = '',
  suffix = '',
  separator = ',',
  decimal = '.',
  decimals = 0,
  trigger = true,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const { prefersReducedMotion } = useReducedMotionSafe();
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!trigger) return;

    // If reduced motion, jump directly to end value
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    const startTime = Date.now();
    const startValue = start;
    const endValue = end;
    const totalDuration = duration * 1000;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [start, end, duration, trigger, prefersReducedMotion]);

  // Format the number
  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [integer, fraction] = fixed.split('.');
    
    // Add thousand separators
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    let result = formattedInteger;
    if (decimals > 0 && fraction) {
      result += decimal + fraction;
    }
    
    return prefix + result + suffix;
  };

  return formatNumber(count);
}