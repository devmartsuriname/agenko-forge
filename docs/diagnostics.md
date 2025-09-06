# Cache & Hydration Diagnostics

## Issue Summary
**Problem**: Hero and HomeAbout components occasionally flash old versions in Preview mode until hard refresh
**Status**: Phase 1 Complete - Database content validation and constraints implemented

## Diagnostic Analysis

### ✅ Phase 1: Database Content Cleanup (COMPLETED)

#### Issue Identification
- **Database Structure**: Verified homepage has proper sections array structure
- **Content Validation**: No malformed JSON detected in existing data  
- **Duplicate Prevention**: Added unique constraint for home page slug
- **Data Integrity**: Multiple content structures supported (sections/content/blocks)

#### Database Fixes Applied
```sql
-- Constraints Added:
1. unique_home_page - Prevents duplicate home pages
2. valid_body_structure - Ensures proper JSON object with required keys
3. valid_content_arrays - Validates sections/blocks are arrays when present  
4. valid_homepage_sections - Validates homepage section structure
5. update_page_cache_timestamp - Auto-updates timestamp on content changes

-- Performance Optimizations:
1. idx_pages_status_slug - Faster published page queries
2. idx_pages_home_published - Optimized homepage-specific queries
```

#### Validation Results
- ✅ Homepage validation: `validate_page_sections()` returns `true`
- ✅ Content structure: All pages have valid body structure
- ✅ Section integrity: All homepage sections have required `type` and `id` fields
- ✅ Database constraints: Active and preventing malformed content

### ✅ Phase 2: React Query Optimization (COMPLETED)

#### Implemented Optimizations
- **Content-Aware Caching**: Different strategies for homepage vs other content
- **Background Refresh**: Keeps content fresh without UI disruption
- **Query Key Versioning**: Cache keys include content timestamps
- **Smart Invalidation**: Related content invalidation patterns
- **Optimized QueryClient**: Custom defaults with intelligent retry logic

#### Cache Strategy Results
```typescript
// Homepage: Critical path optimization
staleTime: 2 * 60 * 1000, // 2 minutes fresh
refetchInterval: 5 * 60 * 1000, // Background refresh
refetchOnWindowFocus: false, // Prevents flashing
refetchIntervalInBackground: true // Continues in background
```

#### Performance Improvements
- ✅ **Eliminated component flashing**: Background refresh prevents UI disruption
- ✅ **Reduced unnecessary requests**: Intelligent stale time management
- ✅ **Better error handling**: Uses cached data when fetch fails
- ✅ **Smart retry logic**: Exponential backoff with sensible limits

### 🔄 Phase 3: Cache Management System (PENDING)

#### Asset Fingerprinting Analysis
- **Current**: Vite default asset hashing
- **Issue**: No systematic cache busting on content updates
- **Solution**: Enhanced asset versioning with content correlation

#### Service Worker Optimization
- **Current**: Basic SW caching in `public/sw.js`
- **Issue**: No intelligent invalidation on content changes
- **Solution**: Content-aware cache invalidation strategies

### 🔄 Phase 4: Performance Monitoring (PENDING)

#### Current Monitoring Issues
- Performance monitor generates false positives
- No distinction between dev/production environments
- Excessive logging in development mode

#### Planned Improvements
- Intelligent thresholds based on environment
- Content update propagation tracking
- Cache hit/miss ratio monitoring

## Debugging Commands

### Database Validation
```sql
-- Check homepage structure
SELECT validate_page_sections((SELECT body->'sections' FROM pages WHERE slug = 'home'));

-- Verify cache timestamps
SELECT slug, title, updated_at FROM pages WHERE slug = 'home';

-- Check for constraint violations
SELECT * FROM pages WHERE NOT (
  body IS NULL OR (
    jsonb_typeof(body) = 'object' AND
    (body ? 'sections' OR body ? 'content' OR body ? 'blocks')
  )
);
```

### Frontend Cache Debugging
```javascript
// Check React Query cache
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log('Homepage cache:', queryClient.getQueryData(['homepage']));

// Force cache invalidation
queryClient.invalidateQueries(['homepage']);

// Check for stale queries
console.log('Query state:', queryClient.getQueryState(['homepage']));
```

### Performance Monitoring
```javascript
// Check for hydration mismatches
if (typeof window !== 'undefined') {
  console.log('Client-side rendering detected');
  // Compare server vs client render results
}

// Monitor section parsing
console.log('Parsed sections:', sections);
console.log('Parse errors:', parseError);
```

## Common Issues & Solutions

### Issue: Components Flash Old Content
**Cause**: Stale cache or hydration mismatch
**Solution**: 
1. ✅ Database constraints prevent bad content (Phase 1)
2. 🔄 Optimize React Query settings (Phase 2)
3. 🔄 Implement content versioning (Phase 3)

### Issue: Hard Refresh Required
**Cause**: Cache not invalidating on content updates
**Solution**:
1. ✅ Auto-timestamp updates on content changes (Phase 1)
2. 🔄 Background refetch strategies (Phase 2)
3. 🔄 Smart cache invalidation (Phase 3)

### Issue: Performance Warnings
**Cause**: Overly aggressive monitoring in development
**Solution**: 🔄 Environment-aware monitoring (Phase 4)

## Status Dashboard

| Component | Status | Phase | Notes |
|-----------|--------|-------|-------|
| Database Validation | ✅ Complete | 1 | Constraints active, validation passing |
| Content Structure | ✅ Verified | 1 | Homepage sections properly formatted |
| Cache Timestamps | ✅ Active | 1 | Auto-updates on content changes |
| React Query Config | ✅ Complete | 2 | Optimized caching strategies implemented |
| Background Refresh | ✅ Active | 2 | Prevents flashing, keeps content fresh |
| Cache Versioning | ✅ Active | 2 | Query keys include content timestamps |
| Asset Fingerprinting | 🔄 Pending | 3 | Basic Vite hashing active |
| Performance Monitor | 🔄 Pending | 4 | Needs false positive reduction |

## Testing Checklist

### Phase 1 Verification ✅
- [x] Homepage loads without errors
- [x] Sections render in correct order  
- [x] No console errors on page load
- [x] Database constraints prevent bad content
- [x] Content updates trigger timestamp changes

### Phase 2 Verification ✅
- [x] Cache invalidation works on content updates
- [x] Background refetch maintains fresh content without flashing
- [x] Query deduplication prevents duplicate requests
- [x] Cache versioning includes content timestamps
- [x] Homepage loads without component flashing
- [x] Content stays fresh with background updates

### Phase 3 Testing (Pending)  
- [ ] Asset cache busting on deployments
- [ ] Service worker invalidates on content changes
- [ ] Smart cache warming for critical paths

### Phase 4 Testing (Pending)
- [ ] Performance monitoring adjusted for environment
- [ ] False positive warnings eliminated
- [ ] Cache/hydration monitoring active

---
*Last Updated: Phase 2 React Query Optimization - Background refresh active, component flashing eliminated*
*Status: ✅ Cache and hydration issues resolved*
*Next: Phase 3 Cache Management System (optional enhancement)*