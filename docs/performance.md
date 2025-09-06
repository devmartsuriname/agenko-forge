# Performance Optimization Guide

## Overview
This guide documents the comprehensive performance optimization system implemented across Phases 1-4 of the cache and hydration optimization project.

## Architecture Summary

### Cache & Hydration System
The application implements a multi-layer caching strategy designed to eliminate component flashing and provide instant navigation:

1. **Database Layer**: Content validation and automatic cache busting
2. **React Query Layer**: Intelligent query caching with background refresh
3. **Service Worker Layer**: Asset caching and offline functionality  
4. **Browser Layer**: Memory management and performance monitoring

## Performance Monitoring System

### Unified Performance Monitor
Location: `src/components/performance/UnifiedPerformanceMonitor.tsx`

The system provides two modes:
- **Widget Mode**: Non-intrusive floating monitor for development
- **Dashboard Mode**: Comprehensive admin panel for detailed analysis

#### Core Web Vitals Tracked
- **LCP (Largest Contentful Paint)**: Target <2.5s
- **CLS (Cumulative Layout Shift)**: Target <0.1
- **FID (First Input Delay)**: Target <100ms
- **TTFB (Time to First Byte)**: Target <800ms
- **FCP (First Contentful Paint)**: Target <1.8s

#### System Metrics
- Memory usage (JS heap size)
- Network connectivity status
- Resource loading count
- Bundle size analysis
- JavaScript error tracking

### Performance Thresholds

```typescript
// Production-grade thresholds
const PERFORMANCE_THRESHOLDS = {
  memory: 300, // MB - Realistic for modern web apps
  pageLoad: 3000, // ms - Target load time
  domContentLoaded: 2000, // ms
  lcp: { good: 2500, poor: 4000 }, // ms
  cls: { good: 0.1, poor: 0.25 }, // unitless
  fid: { good: 100, poor: 300 } // ms
};
```

## Cache Strategy Implementation

### React Query Configuration
Location: `src/lib/react-query-config.ts`

#### Homepage Optimization
```typescript
// Critical path - aggressive caching
staleTime: 2 * 60 * 1000, // 2 minutes fresh
refetchInterval: 5 * 60 * 1000, // Background refresh
refetchOnWindowFocus: false, // Prevents flashing
```

#### Content Pages
```typescript
// Standard caching for non-critical content
staleTime: 5 * 60 * 1000, // 5 minutes fresh
refetchInterval: 10 * 60 * 1000, // Less frequent updates
```

### Service Worker Caching
Location: `public/sw.js`

#### Cache Strategies
1. **Static Assets**: Cache-first with 1 year TTL
2. **API Responses**: Network-first with cache fallback
3. **Images**: Cache-first with WebP optimization
4. **Critical Pages**: StaleWhileRevalidate for instant loading

### Smart Cache Invalidation
Location: `src/lib/cache-management.ts`

The system automatically invalidates related content:
- Homepage invalidates when services/projects/blog change
- Content relationships tracked via dependency graph
- Deployment detection triggers full cache reset

## Performance Optimization Techniques

### Image Optimization
Location: `src/components/ui/responsive-image.tsx`

Features:
- WebP format with fallback support
- Responsive srcset generation
- Lazy loading with intersection observer
- Priority hints for critical images
- Aspect ratio preservation to prevent CLS

### Bundle Optimization
- Code splitting for admin routes
- Dynamic imports for non-critical components
- Tree shaking for unused code elimination
- Critical CSS extraction

### Memory Management
Location: `src/lib/production-optimizations.ts`

Features:
- Periodic memory monitoring
- Garbage collection optimization
- Memory leak detection
- Performance budget enforcement

## Lighthouse Performance Testing

### Automated Testing
Location: `scripts/lighthouse-runner.js`

The system includes automated Lighthouse audits for all public routes:

#### Target Scores
- **Desktop**: ≥90 Performance Score
- **Mobile**: ≥80 Performance Score
- **CLS**: <0.05 for all routes
- **LCP**: <2.5s for hero content

#### Testing Routes
- `/` (Homepage - critical path)
- `/services` (Service listing)
- `/portfolio` (Portfolio showcase)
- `/blog` (Content pages)
- `/pricing` (Conversion pages)
- `/contact` (Lead generation)

### Running Performance Audits

```bash
# Start production build
npm run build && npm run preview

# Run all audits
node scripts/lighthouse-runner.js

# Individual route testing
npm run perf:home:mobile
npm run perf:services:desktop
```

### Performance Report Generation
Results are automatically compiled into `docs/perf/summary.md` with:
- Performance scores for each route and device
- Core Web Vitals measurements  
- Recommendations for optimization
- Historical trend tracking

## Monitoring & Alerting

### Development Monitoring
- Real-time performance widget in bottom-right corner
- Console logging with categorized performance data
- Memory usage tracking with warnings
- Error boundary integration

### Production Monitoring
- Performance metrics stored in localStorage
- Error tracking with stack traces
- Bundle analysis and warnings
- Critical path performance validation

### Alert Thresholds
```typescript
const ALERTS = {
  memory: 300, // MB - Warn above 300MB
  errorRate: 5, // errors per minute
  loadTime: 5000, // ms - Critical load time
  lcp: 4000, // ms - Poor LCP threshold
  cls: 0.25 // Poor visual stability
};
```

## Best Practices

### Performance Optimization
1. **Critical Path Optimization**: Prioritize homepage and conversion paths
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Resource Prioritization**: Use `fetchpriority` for critical assets
4. **Cache Warming**: Preload critical paths on application start
5. **Bundle Splitting**: Separate admin/public code for better caching

### Monitoring
1. **Environment Awareness**: Different thresholds for dev/production
2. **User-Centric Metrics**: Focus on Web Vitals over synthetic metrics
3. **Continuous Monitoring**: Track performance trends over time
4. **Actionable Alerts**: Only alert on user-impacting issues

### Development Workflow
1. **Performance Budgets**: Enforce bundle size and timing budgets
2. **Automated Testing**: Run Lighthouse audits on every deployment
3. **Performance Reviews**: Include performance impact in code reviews
4. **Monitoring Integration**: Use performance data to guide optimization

## Troubleshooting

### Common Issues

#### Component Flashing
**Symptoms**: Old content briefly appears before updating
**Solution**: Check React Query cache configuration and ensure background refresh is enabled

#### Slow Loading
**Symptoms**: Long initial page load times
**Solution**: 
- Verify critical asset preloading is active
- Check bundle size and implement code splitting
- Review image optimization and compression

#### High Memory Usage
**Symptoms**: Browser becomes sluggish, memory warnings in console
**Solution**:
- Check for memory leaks in React components
- Review large data structures and implement pagination
- Verify garbage collection is working properly

#### Cache Misses
**Symptoms**: Frequent network requests for cached content
**Solution**:
- Review cache key generation logic
- Check service worker registration and updates
- Verify cache invalidation patterns

### Performance Debugging

```javascript
// Check React Query cache state
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log('Cache state:', queryClient.getQueryCache());

// Monitor performance metrics
import { performanceMonitor } from '@/lib/performance-monitor';
console.log('Performance data:', performanceMonitor.getCurrentData());

// Check service worker cache
navigator.serviceWorker.ready.then(registration => {
  registration.active.postMessage({ type: 'GET_CACHE_NAMES' });
});
```

## Future Optimizations

### Planned Enhancements
- CDN integration for static assets
- Advanced image optimization with AVIF format
- Critical CSS inlining
- Server-side rendering for better initial paint
- Real-time performance monitoring dashboard

### Monitoring Improvements
- Integration with external performance monitoring services
- Advanced error tracking and reporting
- Performance regression detection
- Automated performance optimization suggestions

---

*This documentation is part of the comprehensive performance optimization system implemented in Phases 1-4. For implementation details, see the respective phase documentation in `docs/diagnostics.md`.*