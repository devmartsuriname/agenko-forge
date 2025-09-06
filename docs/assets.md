# Asset Management Documentation

## Overview
This document outlines the asset management system for the DevMart project, including image optimization, fallback handling, and asset validation.

## Asset Structure

### Primary Assets
- `src/assets/logo.png` - Main company logo (512x512px, optimized)
- `src/assets/hero-image.jpg` - Hero image for About page (1920x1080px, high quality)

### Fallback Assets
- `public/logo.png` - Public fallback for logo
- `public/images/about-workspace.jpg` - Fallback workspace image
- `public/images/about-team-collaboration.jpg` - Fallback team image
- `public/placeholder.svg` - Default Lovable placeholder

## Asset Components

### OptimizedAssetImage
Enhanced image component with multiple fallback layers:

```tsx
<OptimizedAssetImage 
  src={primaryAsset} 
  fallbackSrc="/fallback-asset.jpg"
  publicFallback="/placeholder.svg"
  alt="Descriptive alt text" 
  className="styling-classes"
/>
```

**Fallback Chain:**
1. Primary asset from `src/assets/`
2. Custom fallback from `public/`
3. Public fallback (if specified)
4. Default placeholder

### LazyImageWithFallback
Base component for lazy loading with single fallback:

```tsx
<LazyImageWithFallback 
  src={primarySrc} 
  fallbackSrc={fallbackSrc}
  alt="Alt text" 
  className="classes"
/>
```

## Asset Optimization Guidelines

### Logo Requirements
- **Format:** PNG with transparency
- **Size:** 512x512px minimum (scalable)
- **Usage:** Navigation headers, footers, SEO
- **Optimization:** Compressed but high quality for branding

### Hero Images
- **Format:** JPG for photographs, PNG for graphics
- **Size:** 1920x1080px (16:9 aspect ratio)
- **Usage:** Page headers, feature sections
- **Optimization:** High quality with reasonable file size

### Fallback Images
- **Location:** `public/images/` directory
- **Purpose:** Backup when primary assets fail to load
- **Requirements:** Same dimensions as primary assets

## SEO Integration

### Structured Data
Logo URLs are automatically included in JSON-LD structured data:

```tsx
logo: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : ''
```

### Open Graph
Hero images can be used for social media previews via SEO configuration.

## Asset Validation

### Build-time Checks
- Import validation ensures assets exist at build time
- TypeScript catches missing asset references
- Fallback chain prevents 404 errors

### Runtime Validation
- `OptimizedAssetImage` component handles load failures gracefully
- Error states trigger fallback chain automatically
- No broken images displayed to users

## Best Practices

### Development
1. Always import assets as ES6 modules from `src/assets/`
2. Provide appropriate fallbacks in `public/` directory
3. Use descriptive alt text for accessibility
4. Optimize images before adding to project

### Production
1. Assets are automatically optimized during build
2. Lazy loading improves performance
3. Fallback chain ensures reliability
4. CDN-ready structure for future scaling

## Asset Pipeline

### Development Flow
1. Generate/create optimized assets
2. Place in `src/assets/` directory
3. Import in components as ES6 modules
4. Use `OptimizedAssetImage` component
5. Test fallback chain

### Build Process
1. Vite processes and optimizes assets
2. Generates efficient bundles
3. Creates public assets for fallbacks
4. Enables tree-shaking for unused assets

## Troubleshooting

### Common Issues
- **404 Errors:** Check fallback chain configuration
- **Large Bundle Size:** Ensure proper lazy loading
- **Load Failures:** Verify asset paths and permissions
- **Missing Fallbacks:** Add appropriate public assets

### Debug Tools
- Browser Network tab shows asset load status
- Console errors indicate missing assets
- React DevTools shows component states
- Lighthouse audits check image optimization

## Future Enhancements

### Planned Improvements
- WebP format support with fallbacks
- Responsive image sets for different screen sizes
- Automatic image optimization pipeline
- Asset preloading for critical images
- CDN integration for global distribution