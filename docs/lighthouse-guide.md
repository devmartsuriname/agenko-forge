# Lighthouse Performance Testing Guide

## Overview
Comprehensive guide for running, analyzing, and acting on Lighthouse performance audits to maintain optimal application performance.

## Lighthouse Testing Framework

### Automated Testing Setup
**Location**: `scripts/lighthouse-runner.js`

The framework provides automated performance testing across all critical application routes with consistent reporting and historical tracking.

#### Key Features
- Multi-route testing (desktop & mobile)
- Consistent test environment setup
- Automated report generation
- Historical performance tracking
- CI/CD integration ready

### Test Configuration

#### Tested Routes
```javascript
const ROUTES = [
  { path: '/', name: 'home', critical: true },
  { path: '/services', name: 'services', critical: true },
  { path: '/portfolio', name: 'portfolio', critical: false },
  { path: '/blog', name: 'blog', critical: false },
  { path: '/pricing', name: 'pricing', critical: true },
  { path: '/contact', name: 'contact', critical: true }
];
```

#### Performance Targets
- **Desktop**: ≥90 Performance Score (Target: 95+)
- **Mobile**: ≥80 Performance Score (Target: 85+)
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s
  - CLS (Cumulative Layout Shift): <0.05
  - FID (First Input Delay): <100ms

## Running Lighthouse Audits

### Prerequisites
```bash
# Ensure dependencies are installed
npm install -g lighthouse
npm install chrome-launcher

# Verify Chrome is available
which google-chrome || which chromium-browser
```

### Manual Testing

#### Single Route Testing
```bash
# Test homepage on mobile
lighthouse http://localhost:3000 \
  --only-categories=performance \
  --preset=mobile \
  --output=json \
  --output-path=./docs/perf/home-mobile.json

# Test services page on desktop  
lighthouse http://localhost:3000/services \
  --only-categories=performance \
  --preset=desktop \
  --output=json \
  --output-path=./docs/perf/services-desktop.json
```

#### Comprehensive Testing
```bash
# Start production build
npm run build
npm run preview

# Run all automated tests
node scripts/lighthouse-runner.js

# Results saved to docs/perf/ directory
ls docs/perf/
# home-mobile.json, home-desktop.json
# services-mobile.json, services-desktop.json
# etc.
```

### Automated Testing

#### npm Scripts
```json
{
  "scripts": {
    "perf:all": "node scripts/lighthouse-runner.js",
    "perf:home": "npm run perf:home:mobile && npm run perf:home:desktop",
    "perf:home:mobile": "lighthouse http://localhost:3000 --preset=mobile --only-categories=performance --output=json --output-path=docs/perf/home-mobile.json",
    "perf:home:desktop": "lighthouse http://localhost:3000 --preset=desktop --only-categories=performance --output=json --output-path=docs/perf/home-desktop.json"
  }
}
```

#### CI/CD Integration
```yaml
name: Performance Audit
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Start preview server
        run: npm run preview &
        
      - name: Wait for server
        run: sleep 10
        
      - name: Run Lighthouse audits
        run: node scripts/lighthouse-runner.js
        
      - name: Upload performance reports
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: docs/perf/
```

## Performance Analysis

### Report Structure
Each Lighthouse audit generates detailed JSON reports containing:

#### Core Metrics
```typescript
interface LighthouseMetrics {
  // Performance Score (0-100)
  performance: number;
  
  // Core Web Vitals
  lcp: number;        // Largest Contentful Paint (ms)
  cls: number;        // Cumulative Layout Shift (0-1)
  fid: number;        // First Input Delay (ms)
  
  // Additional Metrics  
  ttfb: number;       // Time to First Byte (ms)
  fcp: number;        // First Contentful Paint (ms)
  tbt: number;        // Total Blocking Time (ms)
  si: number;         // Speed Index (ms)
}
```

#### Audit Results
- **Passed Audits**: Green indicators for optimized areas
- **Opportunities**: Specific recommendations with potential savings
- **Diagnostics**: Detailed analysis of performance bottlenecks
- **Failed Audits**: Critical issues requiring immediate attention

### Performance Summary Report
**Location**: `docs/perf/summary.md`

Automatically generated summary containing:
- Performance scores for all routes and devices
- Core Web Vitals measurements
- Historical trend analysis
- Specific optimization recommendations
- Status indicators (✅ Pass, ⚠️ Warning, ❌ Fail)

#### Sample Report Format
```markdown
| Route | Device | Performance | LCP (ms) | CLS | TBT (ms) | Status |
|-------|---------|-------------|----------|-----|----------|---------|
| / | Mobile | 87 | 2,340 | 0.02 | 245 | ✅ |
| / | Desktop | 94 | 1,890 | 0.01 | 156 | ✅ |
| /services | Mobile | 82 | 2,680 | 0.04 | 312 | ⚠️ |
| /services | Desktop | 91 | 2,120 | 0.03 | 203 | ✅ |
```

## Performance Optimization Strategies

### Common Issues & Solutions

#### High LCP (>2.5s)
**Causes**: Large images, render-blocking resources, slow server response
**Solutions**:
```typescript
// Implement image optimization
<ResponsiveImage 
  src="/hero-image.webp"
  priority={true}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="eager"
  fetchpriority="high"
/>

// Preload critical resources
<link rel="preload" href="/critical-font.woff2" as="font" type="font/woff2" crossorigin />

// Optimize hero section loading
const HeroSection = React.memo(({ data }) => {
  // Component optimization
});
```

#### High CLS (>0.1)
**Causes**: Images without dimensions, dynamic content insertion, web fonts
**Solutions**:
```css
/* Reserve space for images */
.hero-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Prevent font loading shifts */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter.woff2') format('woff2');
}
```

#### High TBT (>300ms)
**Causes**: Large JavaScript bundles, blocking third-party scripts, inefficient code
**Solutions**:
```javascript
// Code splitting for admin routes
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Optimize component rendering
const OptimizedComponent = memo(({ data }) => {
  const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);
  return <div>{memoizedValue}</div>;
});

// Defer non-critical scripts
<script src="/analytics.js" defer></script>
```

### Optimization Checklist

#### Image Optimization
- [ ] WebP/AVIF format implementation
- [ ] Responsive image srcsets
- [ ] Proper sizing attributes (width/height)
- [ ] Lazy loading for below-fold images
- [ ] Priority hints for critical images
- [ ] Compression optimization (80-85% quality)

#### Resource Loading
- [ ] Critical resource preloading
- [ ] Non-critical resource prefetching
- [ ] Resource bundling and minification  
- [ ] CDN implementation for static assets
- [ ] Service worker caching strategy

#### Code Optimization
- [ ] Bundle size analysis and optimization
- [ ] Code splitting for route-based loading
- [ ] Tree shaking for unused code removal
- [ ] Critical CSS extraction and inlining
- [ ] JavaScript minification and compression

#### Performance Monitoring
- [ ] Real User Monitoring (RUM) implementation
- [ ] Performance budget enforcement
- [ ] Continuous performance testing in CI/CD
- [ ] Performance regression alerts
- [ ] Core Web Vitals tracking

## Performance Budgets

### Resource Budgets
```javascript
const PERFORMANCE_BUDGETS = {
  // Size budgets (bytes)
  javascript: 500000,     // 500KB total JS
  css: 100000,           // 100KB total CSS
  images: 1000000,       // 1MB total images
  fonts: 100000,         // 100KB total fonts
  
  // Count budgets
  requests: 50,          // Maximum HTTP requests
  domains: 5,            // Maximum third-party domains
  
  // Timing budgets (milliseconds)
  lcp: 2500,            // Largest Contentful Paint
  fid: 100,             // First Input Delay
  cls: 0.1,             // Cumulative Layout Shift
  ttfb: 600,            // Time to First Byte
  fcp: 1800             // First Contentful Paint
};
```

### Budget Enforcement
```javascript
// Automated budget checking
function validatePerformanceBudgets(lighthouseResult) {
  const violations = [];
  
  // Check timing budgets
  if (lighthouseResult.lcp > PERFORMANCE_BUDGETS.lcp) {
    violations.push({
      metric: 'LCP',
      actual: lighthouseResult.lcp,
      budget: PERFORMANCE_BUDGETS.lcp,
      severity: 'error'
    });
  }
  
  // Check resource budgets
  const totalJS = lighthouseResult.resources
    .filter(r => r.resourceType === 'Script')
    .reduce((sum, r) => sum + r.transferSize, 0);
    
  if (totalJS > PERFORMANCE_BUDGETS.javascript) {
    violations.push({
      metric: 'JavaScript Bundle Size',
      actual: totalJS,
      budget: PERFORMANCE_BUDGETS.javascript,
      severity: 'warning'
    });
  }
  
  return violations;
}
```

## Continuous Performance Monitoring

### Performance Regression Detection
```javascript
// Historical performance tracking
function trackPerformanceRegression(currentResults, historicalResults) {
  const regressions = [];
  
  Object.keys(currentResults).forEach(metric => {
    const current = currentResults[metric];
    const historical = historicalResults[metric];
    const threshold = 0.1; // 10% regression threshold
    
    if (current > historical * (1 + threshold)) {
      regressions.push({
        metric,
        current,
        historical,
        regression: ((current - historical) / historical * 100).toFixed(1)
      });
    }
  });
  
  return regressions;
}
```

### Performance Dashboard Integration
The Lighthouse results integrate with the admin performance dashboard:
- Real-time performance score display
- Historical trend visualization  
- Regression alerts and notifications
- Optimization recommendation engine

### Alerting & Notifications
```typescript
interface PerformanceAlert {
  route: string;
  device: 'mobile' | 'desktop';
  metric: string;
  threshold: number;
  actual: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
}

// Example alert configuration
const ALERT_RULES = [
  {
    condition: 'performance_score < 80',
    severity: 'error',
    message: 'Performance score below acceptable threshold'
  },
  {
    condition: 'lcp > 4000',
    severity: 'critical', 
    message: 'LCP exceeds poor threshold - immediate action required'
  },
  {
    condition: 'cls > 0.25',
    severity: 'error',
    message: 'High layout shift affecting user experience'
  }
];
```

## Best Practices

### Testing Environment
1. **Consistent Setup**: Use same Chrome version and flags for all tests
2. **Network Throttling**: Test under realistic network conditions
3. **Clean Environment**: Clear cache and close other applications
4. **Multiple Runs**: Take median of 3-5 runs for accurate results
5. **Production Build**: Always test optimized/minified builds

### Analysis & Action
1. **Priority Focus**: Address critical path performance first
2. **User Impact**: Prioritize metrics affecting real users
3. **Incremental Improvement**: Make small, measurable improvements
4. **Continuous Monitoring**: Track performance over time
5. **Cross-Device Testing**: Ensure performance across device types

### Reporting & Communication
1. **Regular Reporting**: Weekly performance summaries
2. **Trend Analysis**: Monitor performance over time
3. **Stakeholder Updates**: Communicate impact to business metrics
4. **Actionable Insights**: Provide specific optimization recommendations
5. **Performance Culture**: Foster performance awareness across team

---

*This guide ensures consistent, comprehensive performance testing using Lighthouse to maintain optimal application performance and user experience.*