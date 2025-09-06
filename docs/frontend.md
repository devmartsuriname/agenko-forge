# Frontend Architecture & Cache Management

## Overview
This document outlines the frontend architecture, cache management strategies, and solutions implemented to prevent hydration/cache issues.

## Homepage Component Architecture

### Component Hierarchy
```
Index.tsx (Main Page)
├── SEOHead
├── GlobalNavigation
├── SectionRenderer
│   ├── HeroSection
│   ├── AboutSection (About3Section)
│   ├── ServicesPreviewSection
│   ├── PortfolioPreviewSection
│   ├── TestimonialsSection
│   ├── BlogPreviewSection
│   └── CtaSection
└── Footer
```

### Data Flow
1. **Homepage Query**: `useQuery(['homepage'])` fetches page data from CMS with optimized caching
2. **Section Parsing**: Body content parsed using `PageBodySchema` 
3. **Dynamic Rendering**: `SectionRenderer` renders sections based on type/configuration
4. **Error Handling**: Fallback to default sections if parsing fails

## Cache & Hydration Issues (RESOLVED)

### Problem Analysis
- **Issue**: Old Hero/AboutSection components occasionally flashing in Preview mode
- **Root Cause**: Suboptimal React Query configuration, lack of cache versioning
- **Impact**: User experience degradation, unnecessary refetches causing flashing

### Phase 1 Solution: Database Content Cleanup ✅

#### Database Constraints Added
```sql
-- Ensure unique home page
CREATE UNIQUE INDEX unique_home_page ON pages (slug) WHERE slug = 'home';

-- Validate JSON structure (sections/content/blocks)
ALTER TABLE pages ADD CONSTRAINT valid_body_structure CHECK (
  body IS NULL OR (
    jsonb_typeof(body) = 'object' AND
    (body ? 'sections' OR body ? 'content' OR body ? 'blocks')
  )
);

-- Validate arrays are properly formatted
ALTER TABLE pages ADD CONSTRAINT valid_content_arrays CHECK (
  body IS NULL OR 
  (body->'sections' IS NULL OR jsonb_typeof(body->'sections') = 'array') AND
  (body->'blocks' IS NULL OR jsonb_typeof(body->'blocks') = 'array')
);

-- Homepage sections validation
ALTER TABLE pages ADD CONSTRAINT valid_homepage_sections
CHECK (validate_page_sections(body->'sections'));
```

#### Automatic Cache Invalidation
- Added trigger `page_body_update_trigger` to update timestamps when content changes
- Performance indexes for faster homepage queries
- JSON cleanup to remove null values

#### Validation Status
- ✅ Homepage structure validation: PASSED
- ✅ Section integrity: VERIFIED
- ✅ Database constraints: ACTIVE
- ✅ Cache timestamp triggers: ENABLED

### Phase 2 Solution: React Query Optimization ✅

#### Content-Aware Cache Strategies
```typescript
// Homepage content - critical path, longer cache with background refresh
HOMEPAGE: {
  staleTime: 2 * 60 * 1000, // 2 minutes - consider fresh
  cacheTime: 15 * 60 * 1000, // 15 minutes - keep in memory
  refetchOnWindowFocus: false, // Don't refetch on focus to prevent flashing
  refetchOnMount: false, // Don't refetch on mount if data exists
  refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
  refetchIntervalInBackground: true, // Continue refreshing in background
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}
```

#### Query Key Versioning
- Implemented `createVersionedKey()` and `createHomepageKey()` functions
- Cache keys now include content timestamps for automatic invalidation
- Background refetch strategy prevents flashing while keeping content fresh

#### Smart Cache Invalidation
```typescript
// Invalidate related content based on type
invalidateRelatedContent: (queryClient, contentType, id) => {
  switch (contentType) {
    case 'pages':
      // If homepage is updated, invalidate homepage cache
      invalidateHomepage(queryClient);
      break;
    // ... other content types
  }
}
```

#### Optimized QueryClient
- Custom default options with intelligent retry logic
- Error handling that doesn't show noisy errors to users
- Background refresh with stale-while-revalidate pattern

#### Results
- ✅ **Eliminated flashing behavior**: Background refresh prevents UI disruption
- ✅ **Improved performance**: Longer stale times reduce unnecessary requests
- ✅ **Better user experience**: Content stays fresh without visual disruption
- ✅ **Smart caching**: Different strategies for different content types

## Next Phases (Pending)

### Phase 3: Cache Management System  
- Smart cache invalidation based on content updates
- Asset fingerprinting improvements
- Service worker cache optimization

### Phase 4: Performance Monitoring Cleanup
- Reduce false positive warnings
- Development vs production monitoring
- Intelligent performance thresholds

## Current Cache Configuration

### Homepage Query Strategy
```typescript
// Optimized homepage query with content-aware caching and versioning
const { data: homePage, isLoading, error } = useQuery<Page | null>({
  queryKey: createHomepageKey(), // Versioned cache keys
  queryFn: async (): Promise<Page | null> => {
    const pages = await cms.getPublishedPages();
    return pages.find(p => p.slug === 'home') || null;
  },
  staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
  refetchIntervalInBackground: true, // Continue in background
  refetchOnWindowFocus: false, // Prevent flashing on focus
});
```

### Cache Strategies by Content Type
1. **Homepage**: 2min stale, 15min cache, 5min background refresh
2. **Static Content**: 5min stale, 30min cache, 10min background refresh
3. **Dynamic Content**: 1min stale, 10min cache, immediate refresh
4. **User Data**: 30sec stale, 5min cache, immediate refresh
5. **Settings**: 10min stale, 1hr cache, no background refresh

## Best Practices

### Content Updates
1. Always use admin interface for content changes
2. Database constraints prevent malformed content
3. Cache timestamps automatically update on changes
4. Background refresh keeps content fresh without flashing

### Development Guidelines
1. Use semantic design tokens from `index.css` and `tailwind.config.ts`
2. All colors must be HSL format with theme variables
3. Component-level caching respects updated_at timestamps
4. Test both hard refresh and standard navigation scenarios

### Query Key Management
1. Use versioned keys for content that changes frequently
2. Include relevant identifiers in cache keys
3. Implement smart invalidation patterns
4. Monitor cache hit/miss ratios in development

## Monitoring & Diagnostics

### React Query DevTools
```typescript
// Log cache statistics in development
DevTools.logCacheStats(queryClient);

// Clear all cache for testing
DevTools.clearAllCache(queryClient);
```

### Cache Performance Metrics
- Total queries and cache hit rate
- Background refresh frequency
- Stale data usage patterns
- Error recovery with cached data

### Database Validation
- Automatic content structure validation
- Performance indexes optimize query speed
- Automatic cache invalidation on content changes
- Detailed logging in `docs/diagnostics.md`

---
*Last Updated: Phase 2 React Query Optimization - Completed*
*Status: Cache and hydration issues resolved, no more component flashing*
*Next: Phase 3 Cache Management System (optional optimization)*
