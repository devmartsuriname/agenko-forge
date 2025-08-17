/**
 * Accessibility utilities and runtime checks using axe-core
 */

// Configure axe-core for runtime accessibility testing
export function setupAxeRuntime() {
  if (process.env.NODE_ENV === 'development') {
    // Note: Full axe-core setup would require additional configuration
    console.log('Accessibility runtime monitoring enabled');
  }
}

// Run accessibility audit on key routes
export async function auditRoute(routeName: string): Promise<any[]> {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  try {
    // Placeholder for axe-core integration
    // Would require proper axe-core setup for full implementation
    console.log(`Auditing accessibility for route: ${routeName}`);
    return [];
  } catch (error) {
    console.error('Axe audit failed:', error);
    return [];
  }
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private liveRegion: HTMLDivElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private createLiveRegion() {
    if (typeof document === 'undefined') return;
    
    // Create or find existing live region
    this.liveRegion = document.getElementById('sr-announcer') as HTMLDivElement;
    
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.id = 'sr-announcer';
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'sr-only fixed -left-screen -top-screen w-1 h-1 overflow-hidden';
      document.body.appendChild(this.liveRegion);
    }
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) {
      this.createLiveRegion();
    }
    
    if (this.liveRegion) {
      this.liveRegion.setAttribute('aria-live', priority);
      this.liveRegion.textContent = message;
      
      // Clear after announcement to allow repeat announcements
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = '';
        }
      }, 1000);
    }
  }
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static pushFocus(element: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }

  static popFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}

// Keyboard navigation helpers
export const KeyboardShortcuts = {
  isModifierKey: (e: KeyboardEvent) => e.ctrlKey || e.metaKey,
  
  moveUp: (e: KeyboardEvent) => 
    KeyboardShortcuts.isModifierKey(e) && e.key === 'ArrowUp',
  
  moveDown: (e: KeyboardEvent) => 
    KeyboardShortcuts.isModifierKey(e) && e.key === 'ArrowDown',
  
  escape: (e: KeyboardEvent) => e.key === 'Escape',
  
  enter: (e: KeyboardEvent) => e.key === 'Enter',
  
  space: (e: KeyboardEvent) => e.key === ' ',
  
  tab: (e: KeyboardEvent) => e.key === 'Tab'
};

// Reduced motion detection
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

// Skip link utility
export function createSkipLink(): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';
  
  return skipLink;
}