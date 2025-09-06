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
1. **Homepage Query**: `useQuery(['homepage'])` fetches page data from CMS
2. **Section Parsing**: Body content parsed using `PageBodySchema` 
3. **Dynamic Rendering**: `SectionRenderer` renders sections based on type/configuration
4. **Error Handling**: Fallback to default sections if parsing fails

## Cache & Hydration Issues (RESOLVED)

### Problem Analysis
- **Issue**: Old Hero/AboutSection components occasionally flashing in Preview mode
- **Root Cause**: Database content structure validation missing, potential hydration mismatches
- **Impact**: User experience degradation, cache invalidation failures

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

## Next Phases (Pending)

### Phase 2: React Query Optimization
- Configure optimal `staleTime`/`cacheTime` for content types
- Implement cache key versioning
- Add background refetch strategies

### Phase 3: Cache Management System  
- Smart cache invalidation based on content updates
- Asset fingerprinting improvements
- Service worker cache optimization

### Phase 4: Performance Monitoring Cleanup
- Reduce false positive warnings
- Development vs production monitoring
- Intelligent performance thresholds

## Best Practices

### Content Updates
1. Always use admin interface for content changes
2. Database constraints will prevent malformed content
3. Cache timestamps automatically update on changes
4. Validate sections structure before publishing

### Development Guidelines
1. Use semantic design tokens from `index.css` and `tailwind.config.ts`
2. All colors must be HSL format with theme variables
3. Component-level caching should respect updated_at timestamps
4. Test both hard refresh and standard navigation scenarios

## Monitoring & Diagnostics
- Database validation functions prevent bad content
- Performance indexes optimize query speed
- Automatic cache invalidation on content changes
- Detailed logging in `docs/diagnostics.md`

---
*Last Updated: Phase 1 Database Cleanup - Completed*
*Next: Phase 2 React Query Optimization*