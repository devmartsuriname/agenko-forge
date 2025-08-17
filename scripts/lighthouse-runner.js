#!/usr/bin/env node

/**
 * Lighthouse Performance Testing Runner
 * 
 * Runs Lighthouse audits for all public routes and generates summary reports.
 * Usage: node scripts/lighthouse-runner.js
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/services', name: 'services' },
  { path: '/portfolio', name: 'portfolio' },
  { path: '/blog', name: 'blog' },
  { path: '/pricing', name: 'pricing' },
  { path: '/contact', name: 'contact' }
];

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './docs/perf';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runLighthouse(url, preset = 'mobile') {
  const chrome = await chromeLauncher.launch({ 
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'] 
  });
  
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    preset: preset,
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  
  return runnerResult;
}

async function runAllAudits() {
  console.log('🚀 Starting Lighthouse performance audits...\n');
  
  const results = [];
  
  for (const route of ROUTES) {
    const url = `${BASE_URL}${route.path}`;
    console.log(`Testing ${route.name} (${url})`);
    
    try {
      // Mobile audit
      console.log('  📱 Mobile...');
      const mobileResult = await runLighthouse(url, 'mobile');
      const mobileOutputPath = path.join(OUTPUT_DIR, `${route.name}-mobile.json`);
      fs.writeFileSync(mobileOutputPath, mobileResult.report);
      
      // Desktop audit  
      console.log('  🖥️  Desktop...');
      const desktopResult = await runLighthouse(url, 'desktop');
      const desktopOutputPath = path.join(OUTPUT_DIR, `${route.name}-desktop.json`);
      fs.writeFileSync(desktopOutputPath, desktopResult.report);
      
      // Extract key metrics
      const mobileMetrics = extractMetrics(mobileResult.lhr);
      const desktopMetrics = extractMetrics(desktopResult.lhr);
      
      results.push({
        route: route.name,
        url: route.path,
        mobile: mobileMetrics,
        desktop: desktopMetrics
      });
      
      console.log(`  ✅ Mobile: ${mobileMetrics.performance}/100, Desktop: ${desktopMetrics.performance}/100\n`);
      
    } catch (error) {
      console.error(`  ❌ Error testing ${route.name}:`, error.message);
      results.push({
        route: route.name,
        url: route.path,
        mobile: { error: error.message },
        desktop: { error: error.message }
      });
    }
  }
  
  // Generate summary report
  generateSummaryReport(results);
  console.log('📊 Performance audit complete! Check docs/perf/summary.md');
}

function extractMetrics(lhr) {
  const performance = Math.round(lhr.categories.performance.score * 100);
  const lcp = lhr.audits['largest-contentful-paint']?.numericValue || 0;
  const cls = lhr.audits['cumulative-layout-shift']?.numericValue || 0;
  const tbt = lhr.audits['total-blocking-time']?.numericValue || 0;
  
  return {
    performance,
    lcp: Math.round(lcp),
    cls: Math.round(cls * 1000) / 1000, // Round to 3 decimal places
    tbt: Math.round(tbt)
  };
}

function generateSummaryReport(results) {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(OUTPUT_DIR, 'summary.md');
  
  let markdown = `# Performance Baseline Summary

Last updated: ${timestamp}

## Target Scores
- **Desktop**: ≥90 Performance Score
- **Mobile**: ≥80 Performance Score  
- **CLS**: <0.05 for all routes
- **LCP**: <2.5s for hero content

## Current Baselines

| Route | Device | Performance | LCP (ms) | CLS | TBT (ms) | Status |
|-------|---------|-------------|----------|-----|----------|---------|
`;

  results.forEach(result => {
    if (result.mobile.error || result.desktop.error) {
      markdown += `| ${result.route} | Mobile | Error | - | - | - | ❌ |\n`;
      markdown += `| ${result.route} | Desktop | Error | - | - | - | ❌ |\n`;
    } else {
      const mobileStatus = result.mobile.performance >= 80 ? '✅' : '⚠️';
      const desktopStatus = result.desktop.performance >= 90 ? '✅' : '⚠️';
      
      markdown += `| ${result.route} | Mobile | ${result.mobile.performance} | ${result.mobile.lcp} | ${result.mobile.cls} | ${result.mobile.tbt} | ${mobileStatus} |\n`;
      markdown += `| ${result.route} | Desktop | ${result.desktop.performance} | ${result.desktop.lcp} | ${result.desktop.cls} | ${result.desktop.tbt} | ${desktopStatus} |\n`;
    }
  });

  markdown += `
## Performance Optimizations Implemented

### Hero Section (CMS-Driven)
- **Dynamic preload**: Hero images preloaded based on CMS data when hero is first section
- **Aspect ratio boxes**: Fixed aspect ratios to prevent CLS
- **Eager loading**: Hero images use \`loading="eager"\` and \`fetchpriority="high"\`
- **Smart skipping**: Preload skipped on 2G connections or reduced data mode

### CLS Prevention
- All hero images use explicit aspect ratios
- Transform/opacity animations only (no layout changes)
- Proper image sizing to prevent layout shifts

## Next Fixes (If Scores Below Target)

### For Mobile <80:
- [ ] Image optimization (WebP/AVIF formats)
- [ ] Code splitting for non-critical routes
- [ ] Bundle size reduction
- [ ] Critical CSS inlining

### For Desktop <90:
- [ ] Bundle optimization
- [ ] Tree shaking improvements
- [ ] Font preloading optimization

### For CLS >0.05:
- [ ] Review dynamic content loading
- [ ] Ensure all images have dimensions
- [ ] Check for layout-causing animations

## How to Run Audits

\`\`\`bash
# Start production build
npm run build && npm run preview

# Run all audits
node scripts/lighthouse-runner.js

# Or run individual routes
npm run perf:home:mobile
npm run perf:services:desktop
\`\`\`
`;

  fs.writeFileSync(reportPath, markdown);
}

// Run if called directly
if (require.main === module) {
  runAllAudits().catch(console.error);
}

module.exports = { runAllAudits, runLighthouse };