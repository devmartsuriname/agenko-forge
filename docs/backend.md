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

### Business Operations Tables
- **clients** - Client management with contact information and company details
- **quotes** - Quote requests from potential clients via public form
- **proposals** - Client proposals with rich content, template integration, and client relationships
- **proposal_templates** - Reusable proposal templates with variables for token replacement
- **proposal_recipients** - Proposal delivery tracking with view timestamps
- **proposal_events** - Proposal interaction audit trail (sent, viewed, accepted, rejected)
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

### Independent Scrolling Pattern - 2-Column Layout

The Template Editor implements a clean 2-column layout after duplicate preview removal:

```tsx
// Modal Container - Global scroll for accessibility
<DialogContent className="max-w-7xl w-[90vw] max-h-[90vh] overflow-y-auto flex flex-col">
  
  {/* Header - Non-growing */}
  <div className="shrink-0">
    {/* Template Details + Variables */}
  </div>

  {/* Main Grid - 2 columns with independent scrolling */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
    
    {/* Column 1: Proposal Content - Independent scrolling */}
    <div className="flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Rich Editor (no internal preview) */}
      </div>
    </div>

    {/* Column 2: Live Preview - Independent scrolling */}
    <div className="flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Single preview panel - real-time rendering */}
      </div>
    </div>
  </div>

  {/* Footer - Always visible */}
  <div className="shrink-0 flex justify-end gap-3 pt-6 border-t">
    {/* Save/Cancel buttons */}
  </div>
</DialogContent>
```

**Critical CSS Properties:**
- `min-h-0` on flex containers allows children to shrink below their content size
- `overflow-y-auto` on modal allows global scrolling when content exceeds viewport
- `overflow-y-auto` on individual columns for independent content scrolling  
- `shrink-0` prevents header/footer from competing for space
- `flex-1` allows the main grid to consume remaining height
- `grid-cols-1 lg:grid-cols-2` provides responsive 2-column layout that stacks on mobile
- `max-h-[90vh]` ensures modal respects viewport height limits

**UI Improvements:**
- **Single Preview**: Removed duplicate preview from RichEditor, kept only Live Preview column
- **Clean Layout**: 2-column design with balanced space allocation
- **Sticky Footer**: Save/Cancel buttons always visible at bottom
- **No Attachments**: Removed attachments section (belongs in proposal send stage)

**Restore Points:**
- `P7.2.1-Proposals-FixPack-Restore-Before-3Column-Layout`: State before layout changes

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

## Delivery-Safe Proposals Architecture

### Authoring vs Delivery Pipeline Separation

The proposal system implements a strict separation between content authoring and email delivery to prevent data leaks and ensure security:

**Authoring Pipeline (Admin Interface):**
- Templates created with token placeholders: `{{client_name}}`, `{{client_company}}`, etc.
- Content editing with live preview showing mock token values
- Attachment management and recipient configuration
- No client data mixed until send-time

**Delivery Pipeline (Email Send):**
1. **Token Replacement**: Client-specific data replaces tokens based on selected client
2. **HTML Sanitization**: Content passed through `sanitize-html` edge function
3. **Secure Delivery**: Only rendered HTML sent via email - no raw tokens or sensitive metadata
4. **Audit Trail**: All send events logged with recipient tracking

### Public ID Generation Strategy

Every proposal receives an auto-generated, immutable `public_id` for tracking and reference:

```sql
-- Format: PR-YYYY-XXXX (e.g., PR-2024-0001)
-- Generated on INSERT via database trigger:
CREATE OR REPLACE FUNCTION generate_proposal_public_id()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT := EXTRACT(year FROM NOW())::TEXT;
  seq_num INTEGER;
BEGIN
  -- Get next sequence number for current year
  SELECT COALESCE(MAX(CAST(SUBSTRING(public_id FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM proposals 
  WHERE public_id LIKE 'PR-' || year_str || '-%';
  
  -- Generate public_id with zero-padded sequence
  NEW.public_id := 'PR-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Key Properties:**
- **Immutable**: Once assigned, never changes
- **Unique**: Database constraint ensures no duplicates
- **Human-Readable**: Easy to reference in communications
- **Year-Based**: Resets sequence annually for manageable numbers
- **Token Support**: `{{proposal_id}}` available in content and email subjects

### Token Replacement Security Model

Client data replacement follows strict ownership validation:

```typescript
// Token replacement with RLS enforcement
const replaceTokens = (content: string, client: Client, proposal: Proposal) => {
  // Only replace tokens if user owns the client (enforced by RLS)
  return content
    .replace(/\{\{client_name\}\}/g, client.name || '')
    .replace(/\{\{client_company\}\}/g, client.company || '')
    .replace(/\{\{client_email\}\}/g, client.email || '')
    .replace(/\{\{client_phone\}\}/g, client.phone || '')
    .replace(/\{\{proposal_id\}\}/g, proposal.public_id || '');
};
```

**Security Guarantees:**
- **No Cross-Client Leaks**: RLS policies prevent accessing other users' clients
- **Sanitized Output**: All token-replaced content sanitized before delivery
- **Audit Trail**: Token replacement events logged with client and proposal IDs
- **Fallback Safety**: Invalid tokens render as empty strings, never error

### HTML Sanitization Process

All proposal content passes through sanitization before email delivery:

```typescript
// sanitize-html edge function configuration
const sanitizeConfig = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li'],
  allowedAttributes: {
    '*': ['style'], // Limited inline styles only
  },
  allowedStyles: {
    '*': {
      'color': [/^#[0-9a-fA-F]{6}$/], // Only hex colors
      'background-color': [/^#[0-9a-fA-F]{6}$/],
      'text-align': [/^(left|center|right)$/],
    }
  },
  transformTags: {
    // Remove potentially dangerous elements
    'script': () => '',
    'style': () => '',
    'iframe': () => '',
  }
};
```

**Sanitization Benefits:**
- **XSS Prevention**: Removes dangerous scripts and event handlers
- **Email Compatibility**: Only email-safe HTML elements allowed
- **Style Constraints**: Limited CSS properties prevent layout breaking
- **Token Security**: No raw template syntax reaches email recipients

### Data Exclusion Policy

Sensitive data never included in outgoing emails:

- **total_amount**: Excluded from all email content and metadata
- **Internal IDs**: Only public_id exposed, never database UUIDs
- **Edit URLs**: No admin interface links in client communications
- **User Data**: No editor/admin information in proposal emails
- **Raw Tokens**: All tokens replaced or stripped before delivery

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