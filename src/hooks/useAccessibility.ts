import React, { useEffect, useState, useCallback, useRef } from "react";

// Hook for managing focus trapping
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
      
      if (e.key === 'Escape') {
        // Allow escape to close modals/dialogs
        container.dispatchEvent(new CustomEvent('escape'));
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
  
  return containerRef;
};

// Hook for managing reduced motion preferences
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return reducedMotion;
};

// Hook for managing announcement regions (for screen readers)
export const useAnnouncer = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 1000);
  }, []);
  
  const AnnouncementRegion = useCallback(() => {
    return React.createElement(React.Fragment, null,
      React.createElement('div', {
        'aria-live': 'polite',
        'aria-atomic': 'true',
        className: 'sr-only'
      }, announcements.filter((_, index) => index % 2 === 0).join('. ')),
      React.createElement('div', {
        'aria-live': 'assertive', 
        'aria-atomic': 'true',
        className: 'sr-only'
      }, announcements.filter((_, index) => index % 2 === 1).join('. '))
    );
  }, [announcements]);
  
  return { announce, AnnouncementRegion };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (items: any[], onSelect: (item: any, index: number) => void) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLElement>(null);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  }, [items, activeIndex, onSelect]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);
  
  return { activeIndex, setActiveIndex, containerRef };
};

// Hook for managing skip links
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLElement>(null);
  
  const addSkipLink = useCallback((id: string, label: string) => {
    if (!skipLinksRef.current) return;
    
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = label;
    link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md';
    
    skipLinksRef.current.appendChild(link);
  }, []);
  
  const SkipLinks = useCallback(() => {
    return React.createElement('div', {
      ref: skipLinksRef,
      className: 'skip-links'
    });
  }, []);
  
  return { addSkipLink, SkipLinks };
};

// Hook for color contrast validation
export const useColorContrast = () => {
  const checkContrast = useCallback((foreground: string, background: string): boolean => {
    // Simple contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    const getLuminance = (color: string) => {
      // This is a simplified version - you'd want a proper implementation
      return 0.5; // placeholder
    };
    
    const contrast = (getLuminance(foreground) + 0.05) / (getLuminance(background) + 0.05);
    return contrast >= 4.5; // WCAG AA standard
  }, []);
  
  return { checkContrast };
};

// Hook for managing loading states with proper announcements
export const useAccessibleLoading = (isLoading: boolean, loadingMessage: string = "Loading") => {
  const { announce } = useAnnouncer();
  
  useEffect(() => {
    if (isLoading) {
      announce(loadingMessage);
    } else {
      announce("Content loaded");
    }
  }, [isLoading, loadingMessage, announce]);
  
  return { announce };
};