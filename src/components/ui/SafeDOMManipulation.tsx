/**
 * Safe DOM Manipulation Utilities
 * Phase 5: Production Console Cleanup - Prevent DOM manipulation errors
 */

interface SafeDOMOptions {
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
}

export class SafeDOMManipulation {
  /**
   * Safely append a child element
   */
  static appendChild(parent: Element, child: Element, options: SafeDOMOptions = {}): boolean {
    const { timeout = 100, retries = 3, onError } = options;
    
    try {
      if (!parent || !child) return false;
      if (!document.contains(parent)) return false;
      if (parent.contains(child)) return true; // Already appended
      
      parent.appendChild(child);
      return true;
    } catch (error) {
      if (onError) onError(error as Error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('appendChild failed:', error);
      }
      return false;
    }
  }

  /**
   * Safely remove a child element
   */
  static removeChild(parent: Element, child: Element, options: SafeDOMOptions = {}): boolean {
    const { timeout = 100, retries = 3, onError } = options;
    
    try {
      if (!parent || !child) return false;
      if (!document.contains(parent)) return false;
      if (!parent.contains(child)) return true; // Already removed
      
      parent.removeChild(child);
      return true;
    } catch (error) {
      if (onError) onError(error as Error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('removeChild failed:', error);
      }
      return false;
    }
  }

  /**
   * Safely remove a child element with retry logic
   */
  static removeChildSafe(parent: Element, child: Element, options: SafeDOMOptions = {}): Promise<boolean> {
    const { timeout = 100, retries = 3, onError } = options;
    
    return new Promise((resolve) => {
      let attempts = 0;
      
      const attempt = () => {
        if (attempts >= retries) {
          resolve(false);
          return;
        }
        
        attempts++;
        
        try {
          if (!parent || !child) {
            resolve(false);
            return;
          }
          
          // Check if elements still exist in DOM
          if (!document.contains(parent)) {
            resolve(true); // Parent removed, consider success
            return;
          }
          
          if (!parent.contains(child)) {
            resolve(true); // Child already removed
            return;
          }
          
          parent.removeChild(child);
          resolve(true);
        } catch (error) {
          if (attempts >= retries) {
            if (onError) onError(error as Error);
            if (process.env.NODE_ENV === 'development') {
              console.warn(`removeChildSafe failed after ${retries} attempts:`, error);
            }
            resolve(false);
          } else {
            // Retry after timeout
            setTimeout(attempt, timeout);
          }
        }
      };
      
      attempt();
    });
  }

  /**
   * Create and safely append a script element
   */
  static createScript(src: string, options: { async?: boolean; defer?: boolean; onLoad?: () => void; onError?: () => void } = {}): HTMLScriptElement | null {
    try {
      const script = document.createElement('script');
      script.src = src;
      script.async = options.async ?? true;
      script.defer = options.defer ?? false;
      
      if (options.onLoad) {
        script.onload = options.onLoad;
      }
      
      if (options.onError) {
        script.onerror = options.onError;
      }
      
      return script;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('createScript failed:', error);
      }
      return null;
    }
  }

  /**
   * Safely download a blob as a file
   */
  static downloadBlob(blob: Blob, filename: string, options: SafeDOMOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        const cleanup = () => {
          URL.revokeObjectURL(url);
          SafeDOMManipulation.removeChildSafe(document.body, a, options);
        };
        
        // Append, click, and cleanup
        if (SafeDOMManipulation.appendChild(document.body, a, options)) {
          a.click();
          setTimeout(() => {
            cleanup();
            resolve(true);
          }, 100);
        } else {
          cleanup();
          resolve(false);
        }
      } catch (error) {
        if (options.onError) options.onError(error as Error);
        if (process.env.NODE_ENV === 'development') {
          console.warn('downloadBlob failed:', error);
        }
        resolve(false);
      }
    });
  }
}