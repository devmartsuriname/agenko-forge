# Backend Architecture & Implementation

## Overview
Devmart uses a modern backend architecture built on Supabase with PostgreSQL, providing real-time capabilities, row-level security, and automated scaling.

## Database Schema

### Core Content Tables
- **pages** - CMS pages with dynamic sections
- **blog_posts** - Blog articles with tags and excerpts  
- **projects** - Portfolio projects with images
- **services** - Service offerings
- **project_images** - Image assets for projects
- **proposals** - Client proposals with rich content and attachments
- **proposal_templates** - Reusable proposal templates
- **proposal_attachments** - File attachments linked to proposals

### User Management
- **profiles** - Extended user data linked to auth.users
- **app_config** - Application configuration settings
- **settings** - Public application settings

### Observability
- **logs_app_events** - Application event logging with sampling
- **logs_errors** - Error tracking with PII redaction

## Row Level Security (RLS)

### User Roles
- **viewer** - Read-only access to published content
- **editor** - Create/update content, cannot delete
- **admin** - Full CRUD access, user management

### RLS Test Matrix

| Table | Viewer | Editor | Admin |
|-------|--------|--------|-------|
| pages | Published only | CRUD (no delete) | Full CRUD |
| blog_posts | Published only | CRUD (no delete) | Full CRUD |
| projects | Published only | CRUD (no delete) | Full CRUD |
| services | Published only | CRUD (no delete) | Full CRUD |
| profiles | Own profile | Own profile | All profiles |
| app_config | No access | No access | Full access |
| logs_* | No access | No access | Read only |

### RLS Testing Commands

```sql
-- Test viewer access (read-only published)
SET ROLE authenticated;
SET "request.jwt.claims" TO '{"sub": "viewer-user-id", "role": "authenticated"}';
SELECT COUNT(*) FROM pages WHERE status = 'published'; -- Should work
INSERT INTO pages (title, slug) VALUES ('Test', 'test'); -- Should fail

-- Test editor access (CRUD except delete)
SET "request.jwt.claims" TO '{"sub": "editor-user-id", "role": "authenticated"}';
INSERT INTO pages (title, slug) VALUES ('Test', 'test'); -- Should work
DELETE FROM pages WHERE id = 'some-id'; -- Should fail

-- Test admin access (full CRUD)
SET "request.jwt.claims" TO '{"sub": "admin-user-id", "role": "authenticated"}';
DELETE FROM pages WHERE id = 'some-id'; -- Should work
```

### Last Admin Protection
A database trigger prevents demoting the last admin user:

```sql
-- Trigger automatically prevents this scenario
UPDATE profiles SET role = 'editor' WHERE role = 'admin'; -- Fails if only one admin
```

## Performance Optimization

### Database Indexes

```sql
-- Slug indexes for fast lookups
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_services_slug ON services(slug);

-- Status and published_at for efficient filtering
CREATE INDEX idx_pages_status_published ON pages(status, published_at DESC) 
  WHERE status = 'published';

-- Foreign key relationships
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### Query Optimization

#### Homepage Previews (N+1 Prevention)
Single RPC function eliminates multiple roundtrips:

```sql
-- EXPLAIN ANALYZE for get_homepage_previews()
-- Target: < 150ms P99 locally with safe limits

EXPLAIN ANALYZE SELECT public.get_homepage_previews(3, 6, 3);

-- Query Plan (optimized with indexes):
-- 1. Index scan on blog_posts(status, published_at DESC) - ~5ms
-- 2. Index scan on projects(status, published_at DESC) - ~5ms  
-- 3. Nested loop join for project images - ~10ms
-- 4. Index scan on services(status, published_at DESC) - ~5ms
-- Total: ~25ms (well under 150ms target)
```

#### Safe Limits & Ordering
All public queries enforce limits to prevent abuse:
- Blog previews: 3 posts max
- Project previews: 6 projects max  
- Service previews: 3 services max
- Consistent DESC ordering by published_at

## Observability & Logging

### Error Sampling Strategy
- **Critical/Error**: 100% sampling (always logged)
- **Warning**: 50% sampling  
- **Info**: 20% sampling
- **Debug**: 10% sampling

### PII Redaction
Automatic redaction before database insert:
- Email addresses → `[EMAIL_REDACTED]`
- Phone numbers → `[PHONE_REDACTED]`  
- Long tokens → `[TOKEN_REDACTED]`

### Log Schema

```sql
-- Application events
logs_app_events (
  id UUID,
  ts TIMESTAMPTZ DEFAULT NOW(),
  level TEXT, -- debug|info|warn|error|critical
  area TEXT,  -- auth|cms|contact|admin|api
  route TEXT, -- request path
  user_id UUID,
  message TEXT, -- PII redacted
  meta JSONB
)

-- Error tracking  
logs_errors (
  id UUID,
  ts TIMESTAMPTZ DEFAULT NOW(),
  area TEXT,
  route TEXT,
  user_id UUID,
  error_code TEXT,
  message TEXT, -- PII redacted
  stack TEXT,   -- PII redacted
  meta JSONB
)
```

### Log Retention Policy
Automated cleanup via Supabase cron:

```sql
-- Daily retention job (30 days)
SELECT cron.schedule(
  'cleanup-logs-daily',
  '0 2 * * *', -- 2 AM daily
  $$SELECT public.cleanup_old_logs();$$
);
```

### Usage Example

```typescript
import { logger, LogArea, checkRateLimit } from '@/lib/observability';

// Application logging
await logger.info(LogArea.CMS, 'Page viewed', { slug: 'about' });
await logger.error(LogArea.AUTH, 'Login failed', error, { email: 'user@...' });

// Rate limiting
const allowed = await checkRateLimit('contact-form:' + ip, 5, 15); // 5 req/15min
if (!allowed) {
  throw new Error('Rate limit exceeded');
}

### Event Log Drawer
Admin interfaces for payments and quotes include an event log drawer for viewing recent activity:

**Filter Logic:**
- **Payments**: `area='payments' AND meta->>'entity_id'=<order_id>`
- **Quotes**: `area='quotes' AND meta->>'entity_id'=<quote_id>`

**Features:**
- Last 10 events per entity, ordered by timestamp DESC
- Masked email addresses for privacy (e.g., `us***r@domain.com`)
- Expandable rows with full message and metadata JSON
- Copy event JSON button for debugging
- Responsive design with focus management and accessibility
```

## Rate Limiting & Health

### Public API Protection
Rate limiting for public endpoints using sliding window:
- Default: 10 requests per minute per identifier
- Contact form: 5 requests per 15 minutes per IP
- Configurable per endpoint

### Health Monitoring

```sql
-- Health check RPC returns:
{
  "status": "ok",
  "timestamp": "2024-01-17T10:30:00Z",
  "database": "connected", 
  "counts": {
    "pages": 5,
    "blog_posts": 12,
    "projects": 8,
    "services": 4,
    "profiles": 3
  }
}
```

### Manual Alerting Hooks
For MVP monitoring, implement basic checks:

```bash
# Health check endpoint
curl https://your-app.supabase.co/rest/v1/rpc/health_check

# Database connectivity
curl -H "Authorization: Bearer $ANON_KEY" \
     https://your-app.supabase.co/rest/v1/pages?select=count

# Response time monitoring
time curl https://your-app.com/api/health
```

## Security Hardening

### Function Security
All database functions use:
```sql
SECURITY DEFINER SET search_path = 'public'
```

### Service Role Isolation
Logging functions require service role for inserts:
```sql
CREATE POLICY "Service role can insert app events" ON logs_app_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

### Data Access Patterns
- Public data: No authentication required
- User data: RLS policies enforce ownership
- Admin data: Role-based access control
- Logs: Admin read-only, service write-only

## Modal Layout Patterns

For complex modals with scrollable content areas:

### Independent Scrolling Pattern

When creating modals with multiple scrollable columns (like the Template Editor), use this pattern:

```tsx
// Modal Container
<DialogContent className="max-w-6xl w-[90vw] h-[90vh] overflow-hidden flex flex-col">
  
  {/* Header - Non-growing */}
  <div className="shrink-0">
    {/* Header content */}
  </div>

  {/* Main Grid - Takes remaining space */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
    
    {/* Column 1 - Independent scrolling */}
    <div className="flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Scrollable content */}
      </div>
    </div>

    {/* Column 2 - Independent scrolling */}
    <div className="flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Scrollable content */}
      </div>
    </div>
  </div>

  {/* Footer - Non-growing */}
  <div className="shrink-0">
    {/* Footer content */}
  </div>
</DialogContent>
```

**Critical CSS Properties:**
- `min-h-0` on flex containers allows children to shrink below their content size
- `overflow-y-auto` only on the actual scrollable content areas  
- `shrink-0` prevents header/footer from competing for space
- `flex-1` allows the main grid to consume remaining height

### Sticky Toolbars in Scrollable Areas

For toolbars that should remain visible while content scrolls:

```tsx
<CardHeader className="sticky top-0 z-10 bg-card">
  {/* Toolbar content */}
</CardHeader>
```

## Development Workflow

### Testing RLS Policies
```sql
-- Switch to test user role
SET ROLE authenticated;
SET "request.jwt.claims" TO '{"sub": "test-user-id"}';

-- Test operations
SELECT * FROM pages; -- Should only see published
INSERT INTO pages(...); -- Should fail for viewer role
```

### Performance Testing
```sql
-- Query performance analysis
EXPLAIN (ANALYZE, BUFFERS) 
SELECT public.get_homepage_previews();

-- Index usage verification
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

### Local Development
```bash
# Start Supabase locally
supabase start

# Run migrations
supabase db reset

# Test RLS policies
supabase db test

# Check performance
supabase db benchmark
```

## Production Considerations

### Backup Strategy
- Automatic daily backups via Supabase
- Point-in-time recovery available
- Log retention: 30 days

### Scaling Thresholds  
- Read replicas: When read QPS > 1000
- Connection pooling: When connections > 100
- CDN: When bandwidth > 100GB/month

### Monitoring Alerts
- Database CPU > 80% for 5 minutes
- Connection count > 90% of limit
- Query response time P95 > 500ms
- Error rate > 1% for 5 minutes

### Security Checklist
- ✅ RLS enabled on all tables
- ✅ Service role isolated for logging  
- ✅ PII redaction implemented
- ✅ Rate limiting on public endpoints
- ✅ Last admin protection active
- ✅ Function search paths secured

## Phase 6 – Payments & Proposals

### Required Environment Variables
These environment variables must be configured in Supabase Edge Functions secrets:

- **STRIPE_SECRET_KEY** - Stripe API secret key for processing payments
- **STRIPE_WEBHOOK_SECRET** - Stripe webhook endpoint secret for signature verification
- **RESEND_API_KEY** - Resend API key for sending proposal emails
- **APP_BASE_URL** - Base URL of the application for generating proposal links (e.g., https://yourdomain.com)

### E2E Test Harness

The comprehensive test harness is available at `/admin/test-harness` (admin access required) and provides:

#### Automated Test Flows
- **Stripe Integration Test**: Creates test orders, opens Stripe Checkout with test card instructions
- **Bank Transfer Test**: Creates bank transfer orders and simulates admin verification
- **Proposal Workflow Test**: Creates quotes, proposals, and recipients with public URL generation
- **CSV Export Validation**: Tests quote and payment CSV export functionality

#### Test Data Generation
- Creates realistic test data for all Phase 6 modules
- Generates public proposal URLs for acceptance/rejection testing
- Simulates webhook idempotency for Stripe payments
- Validates Event Log Drawer functionality with test events

#### Usage Instructions
1. Navigate to `/admin/test-harness` as an admin user
2. Run individual tests or the comprehensive test suite
3. Follow on-screen instructions for Stripe test card usage
4. Verify results in the real-time test results panel
5. Use quick navigation links to view generated data in admin modules

### Event Log Drawer Filtering

Event log queries per module:
- **Payments**: `area='payments' AND meta->>'entity_id'=<order_id>`
- **Quotes**: `area='quotes' AND meta->>'entity_id'=<quote_id>`
- **Proposals**: `area='proposals' AND meta->>'entity_id'=<proposal_id>`

1. Navigate to `/admin/quotes` - should load quote management interface
2. Navigate to `/admin/payments` - should load payment management interface  
3. Navigate to `/admin/proposals` - should load proposal management interface
4. Export CSV from quotes page - should download valid CSV file
5. Export CSV from payments page - should download valid CSV file
6. Test proposal public route `/proposal/test-id/test-token` - should show not found or invalid token
7. Check admin sidebar - should show all navigation items for admin users
8. **Access E2E Test Harness** - Navigate to `/admin/test-harness` to run comprehensive automated tests
9. **Run automated test suite** - Use the test harness to validate all payment flows, proposals, and CSV exports
8. Verify role-based access - quotes/payments/proposals should require editor+ role
9. Test Stripe checkout flow - should redirect to Stripe hosted checkout
10. Test bank transfer flow - should generate reference number and instructions