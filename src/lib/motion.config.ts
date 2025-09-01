/**
 * Centralized motion configuration for Phase 3
 * Provides consistent timing, easing, and animation tokens
 */

export const motionConfig = {
  // Duration tokens (in seconds)
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.6,
    verySlow: 1.0,
  },

  // Easing curves
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Stagger delays (in seconds)
  stagger: {
    items: 0.1,
    cards: 0.15,
    sections: 0.2,
  },

  // Parallax multipliers
  parallax: {
    background: 0.5,
    midground: 0.3,
    foreground: 0.1,
  },

  // Scroll thresholds
  scroll: {
    triggerOffset: '0px 0px -100px 0px',
    progressStart: 0.1,
    progressEnd: 0.9,
  },

  // Reduced motion fallbacks
  reducedMotion: {
    duration: 0.01,
    transform: 'none',
    transition: 'opacity 0.2s ease',
  },

  // Z-index layers
  zIndex: {
    background: -1,
    content: 1,
    overlay: 10,
    modal: 50,
    tooltip: 100,
  },
} as const;

// Type helpers
export type MotionDuration = keyof typeof motionConfig.duration;
export type MotionEasing = keyof typeof motionConfig.easing;
export type ParallaxLayer = keyof typeof motionConfig.parallax;