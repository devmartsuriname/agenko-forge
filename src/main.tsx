import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeProductionOptimizations } from './lib/production-optimizations'
import { logAssetHealth } from './lib/asset-validation'
import { initOptimizedPerformanceMonitoring } from './lib/performance-optimized'
import { initializeProductionErrorHandler } from './lib/production-error-handler'

// Initialize React with proper error boundaries and strict mode
const root = createRoot(document.getElementById("root")!);

const AppWithStrictMode = () => (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Render with error handling
try {
  root.render(<AppWithStrictMode />);
  
  // Run production optimizations after React initialization
  setTimeout(() => {
    try {
      initializeProductionOptimizations();
      // Initialize production error handler first
      initializeProductionErrorHandler();
      // Initialize optimized performance monitoring
      initOptimizedPerformanceMonitoring();
      // Perform asset health check in development only
      if (process.env.NODE_ENV === 'development') {
        logAssetHealth();
      }
    } catch (error) {
      console.error('Production optimizations failed to initialize:', error);
    }
  }, 100);
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Fallback render without StrictMode
  try {
    root.render(<App />);
  } catch (fallbackError) {
    console.error('Fallback render failed:', fallbackError);
    // Last resort: show basic error message
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">The application failed to load. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
