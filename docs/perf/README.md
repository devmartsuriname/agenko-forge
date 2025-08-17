# Performance Monitoring

This directory contains Lighthouse performance audit results and monitoring tools for the Devmart project.

## Structure

- `*.json` - Lighthouse audit results (auto-generated)
- `summary.md` - Performance summary report
- `README.md` - This documentation

## Running Performance Audits

### Automated Script (Recommended)
```bash
# Start production build
npm run build && npm run preview

# Run comprehensive audits for all routes
node scripts/lighthouse-runner.js
```

### Manual Lighthouse Commands
```bash
# Individual route audits
npm run perf:home:desktop
npm run perf:home:mobile
npm run perf:services:desktop
# ... etc
```

### Shell Script (Alternative)
```bash
chmod +x scripts/run-lighthouse-audits.sh
./scripts/run-lighthouse-audits.sh
```

## Performance Targets

| Metric | Desktop Target | Mobile Target |
|--------|---------------|---------------|
| Performance Score | ≥90 | ≥80 |
| LCP (Largest Contentful Paint) | <2.5s | <4.0s |
| CLS (Cumulative Layout Shift) | <0.05 | <0.05 |
| TBT (Total Blocking Time) | <300ms | <600ms |

## Optimizations Implemented

### Hero Section Performance
- **Dynamic preload**: CMS-driven hero image preloading
- **Aspect ratios**: Fixed dimensions prevent CLS
- **Connection awareness**: Respects 2G/reduced-data preferences
- **Priority loading**: `fetchpriority="high"` and `loading="eager"`

### CLS Prevention
- CSS custom properties for responsive aspect ratios:
  - `--hero-aspect-ratio: 16 / 9` (default)
  - `--hero-aspect-ratio-sm: 21 / 9` (tablet)
  - `--hero-aspect-ratio-lg: 32 / 9` (desktop)
- Transform/opacity animations only (no layout changes)
- Reserved space for all critical images

### Bundle Optimization
- React Query for efficient data fetching
- Code splitting with React.lazy()
- Tree shaking enabled in Vite build
- Production-optimized builds

## Monitoring Schedule

Run performance audits:
- **Before releases**: Full audit suite
- **Weekly**: Homepage baseline check
- **After major changes**: Affected routes only

## Troubleshooting

### Common Issues
1. **Server not running**: Ensure `npm run preview` is active on port 3000
2. **Chrome not found**: Install Chrome/Chromium or set CHROME_PATH
3. **Low mobile scores**: Review image optimization and bundle size
4. **High CLS**: Check for dynamic content causing layout shifts

### Performance Debugging
1. Use Chrome DevTools Performance tab
2. Enable Core Web Vitals in DevTools
3. Test on throttled connections (Fast 3G, Slow 3G)
4. Monitor real user metrics if deployed

## Architecture Notes

The performance system is designed to be:
- **CMS-driven**: No hardcoded optimizations
- **User-respectful**: Honors reduced-data preferences  
- **Maintainable**: Clear separation of concerns
- **Measurable**: Automated monitoring and reporting