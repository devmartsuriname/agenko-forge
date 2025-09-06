import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeProductionOptimizations } from './lib/production-optimizations'

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
    initializeProductionOptimizations();
  }, 100);
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Fallback render without StrictMode
  root.render(<App />);
}
