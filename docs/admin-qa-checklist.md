# Admin CMS Quality Assurance Checklist

## Pre-Deployment Testing

### Authentication & Authorization ✅
- [ ] Anonymous users redirected to `/admin/login` for all admin routes
- [ ] Viewer role: read-only access, no create/update/delete buttons
- [ ] Editor role: can create and edit content, delete buttons disabled
- [ ] Admin role: full CRUD access including deletions
- [ ] Last admin cannot demote themselves
- [ ] Clean error messages for permission denied actions

### UX Consistency ✅
- [ ] Toast notifications use consistent icons (✓ ✗ ℹ ⚠)
- [ ] Toast messages include action context ("Saved Project", "Deleted Blog Post")
- [ ] Buttons have consistent sizing and focus states
- [ ] Disabled states shown during loading/processing
- [ ] Empty states with friendly copy and clear CTAs
- [ ] All modals trap focus and support escape to close

### Accessibility (WCAG AA) ✅
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] All form fields have labels or aria-labelledby
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works for all controls
- [ ] Gallery reorder has keyboard alternatives (Move Up/Down)
- [ ] Color contrast meets AA standards for dark theme
- [ ] Screen reader announcements for dynamic content updates

### Error Handling & Resilience ✅
- [ ] ErrorBoundary catches React errors with friendly fallback
- [ ] Network errors show user-friendly messages (no stack traces)
- [ ] Form validation groups errors at top level
- [ ] Field-level validation appears inline
- [ ] Destructive actions require confirmation
- [ ] Published content deletions show extra warning
- [ ] Self-demotion prevention for last admin

### Performance & Loading ✅
- [ ] All admin routes are lazy-loaded
- [ ] Loading skeletons appear during initial data fetch
- [ ] Lists default to 20 items with pagination
- [ ] Search filters preserved in URL query parameters
- [ ] No N+1 database queries in dashboard panels
- [ ] Bundle analysis shows proper code splitting

### Content Management ✅

#### Pages
- [ ] Create/edit/delete functionality with LoadingSkeleton and ErrorBoundary
- [ ] Slug auto-generation with uniqueness validation
- [ ] Draft/published status toggle
- [ ] Rich content editing with proper validation
- [ ] SEO meta tags support with noindex for admin
- [ ] Standardized toast notifications (✓ ✗ ℹ ⚠)
- [ ] ConfirmDialog for delete operations (admin-only)

#### Services
- [ ] Full CRUD with excerpt and content fields
- [ ] Status workflow (draft → published)
- [ ] Search and filter by status
- [ ] EmptyState when no services exist
- [ ] LoadingSkeleton during data fetch
- [ ] ErrorBoundary wrapping all service routes
- [ ] Service editor with proper validation and accessibility
- [ ] ConfirmDialog for delete (admin-only)

#### Projects
- [ ] Project CRUD with gallery management
- [ ] GalleryManager with accessibility features
- [ ] Image upload/reorder/delete with keyboard support
- [ ] Up/down controls for image ordering + aria-live feedback
- [ ] Project tags support with TagInput component
- [ ] Portfolio visibility controls
- [ ] EmptyState for gallery when no images
- [ ] ErrorBoundary around project editor

#### Blog
- [ ] Article CRUD with tag support
- [ ] TagInput with chips interface and keyboard navigation
- [ ] Filter by tags and status
- [ ] Publication workflow with proper status management
- [ ] EmptyState when no posts exist
- [ ] LoadingSkeleton during editor load
- [ ] ErrorBoundary around blog routes

#### Media
- [ ] List view of all referenced images
- [ ] Placeholder for future upload functionality
- [ ] Media usage tracking across content

#### Contact Submissions
- [ ] Read-only list with search/filter
- [ ] Detail view in modal
- [ ] CSV export with proper UTF-8 encoding
- [ ] Export includes all required fields

### CSV Export Functionality ✅
- [ ] UTF-8 with BOM encoding for international characters
- [ ] Header row: id,name,email,subject,created_at
- [ ] Proper comma and quote escaping
- [ ] Timestamped filename: contact_submissions_YYYYMMDD.csv
- [ ] Large dataset handling (1000+ records)
- [ ] Progress indication for large exports
- [ ] No UI blocking during generation

### Theme Isolation ✅
- [ ] Admin styles scoped with `.admin-root` class
- [ ] No CSS leakage from public components
- [ ] Tailwind prefix working correctly
- [ ] Font loading optimized (no duplicates)
- [ ] Icon libraries loaded efficiently

### SEO & Robots ✅
- [ ] Admin pages include `noindex, nofollow` meta tags
- [ ] robots.txt blocks `/admin/` paths
- [ ] Public sitemap excludes admin routes
- [ ] Admin routes not indexed by search engines

### Data Validation ✅
- [ ] Server-side validation for all mutations
- [ ] Client-side validation provides immediate feedback
- [ ] Slug uniqueness enforced at database level
- [ ] Required field validation working
- [ ] Character limits respected

### Browser Compatibility ✅
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile responsive on all screen sizes

## Performance Benchmarks

### Lighthouse Scores (Desktop)
- [ ] Performance: ≥90
- [ ] Accessibility: ≥95
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

### Load Times
- [ ] Admin login page: <2s first load
- [ ] Dashboard: <3s with data
- [ ] List pages: <2s for 100 items
- [ ] Editors: <1s to interactive

## Security Verification

### Data Protection
- [ ] RLS policies prevent unauthorized data access
- [ ] Input sanitization on all user data
- [ ] SQL injection protection verified
- [ ] XSS protection in place

### Session Management
- [ ] Secure authentication token handling
- [ ] Automatic logout on token expiry
- [ ] Session refresh working correctly
- [ ] No sensitive data in client-side storage

## Documentation
- [ ] Role matrix documented in backend.md
- [ ] CRUD flows documented
- [ ] Troubleshooting runbook complete
- [ ] API changes documented

## Deployment Readiness
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Monitoring and logging enabled
- [ ] Backup procedures documented
- [ ] Rollback plan documented

---

## Quick Test Script

```bash
# Run these commands for rapid QA verification
npm run build          # Verify production build
npm run preview         # Test production bundle
npm run lint           # Code quality check
npm run type-check     # TypeScript validation
```

## Common Issues to Watch

1. **Memory Leaks**: Check for unsubscribed observables in useEffect
2. **Bundle Size**: Monitor admin chunk sizes after changes
3. **Focus Traps**: Ensure modals properly manage focus
4. **Race Conditions**: Test rapid user interactions
5. **Error Boundaries**: Verify fallbacks work as expected

## Sign-off

- [ ] **Developer**: Code review complete
- [ ] **QA**: Manual testing passed
- [ ] **PM**: Features match requirements
- [ ] **Security**: Security review approved
- [ ] **Performance**: Benchmarks met
- [ ] **Accessibility**: A11y audit passed

**Ready for Production**: ☐ Yes ☐ No

**Notes**:
_Add any specific issues, workarounds, or deployment notes here._