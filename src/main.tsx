import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeProductionOptimizations } from './lib/production-optimizations'

// Initialize React first, then production optimizations
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Run production optimizations after React initialization
setTimeout(() => {
  initializeProductionOptimizations();
}, 100);
