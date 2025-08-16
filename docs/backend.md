# Backend Documentation

## Supabase Configuration

### Database Tables
- All tables have RLS enabled
- Proper relationships with foreign keys
- Automatic timestamp updates via triggers
- Status-based content publishing system

### Authentication
- Email/password authentication
- Automatic profile creation on signup
- Role-based access control
- Secure function definitions with proper search_path

### Row Level Security
- Public read access to published content only
- Admin/Editor write permissions
- User can manage their own profile
- Contact submissions restricted to admin

### Functions
- `get_current_user_role()`: Returns user's role for RLS
- `update_updated_at_column()`: Automatic timestamp updates
- `handle_new_user()`: Creates profile on user registration

### Security Best Practices
- All functions use `SET search_path = public`
- RLS policies prevent unauthorized access
- No anonymous write access
- Proper type checking and validation

### Seed Data
- Sample services, projects, and blog posts
- Default site settings
- Admin user creation (via ADMIN_EMAIL env var)

## Admin CMS Features

### Dashboard
- KPI display (content counts)
- Recent activity tracking
- Role-aware content access

### Content Management
- **Pages**: Create/edit static pages with rich content
- **Services**: Manage service offerings with descriptions
- **Projects**: Complete portfolio management with image galleries and reordering
- **Blog**: Full blog management with tags, filtering, and publishing workflow
- **Media**: Placeholder interface for future file upload integration
- **Contact**: Read-only submissions with CSV export functionality
- **Users**: Role management for admin/editor permissions

### Lazy Loading Implementation
- All admin routes use `React.lazy()` for code splitting
- Suspense boundaries with loading spinners
- Bundle optimization prevents admin code in public build
- Clean default exports for all admin components

### Type System
- Centralized content types in `/types/content.ts`
- Consistent interfaces across admin and public APIs
- Optional vs required field distinctions
- Proper TypeScript inference throughout

### Gallery Management
- Project images stored in `project_images` table
- Reorderable with `sort_order` field
- Up/down controls for manual ordering
- Automatic sort persistence on reorder

### Tag System (Blog)
- String array storage for flexible tagging
- Chip-based input with add/remove
- Server-side validation for tag limits
- Filter by tag in admin interface

### Status Workflow
- All content supports draft/published states
- Published content sets `published_at` timestamp
- Public routes only show published content
- Admin routes show all content with status indicators

### Slug Generation
- Automatic slug creation from titles
- Kebab-case formatting with diacritic removal
- Uniqueness validation with `-2`, `-3` suffixes
- Manual override capability in editors

### CSV Export
- UTF-8 encoding for international characters
- Proper header row generation
- Comma and quote escaping
- Filename with date stamp pattern

### Access Control Matrix
| Role | View All | Create | Edit | Delete | Manage Users |
|------|----------|--------|------|--------|--------------|
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
- **Media**: Read-only media library showing project images (upload pipeline planned)
- **Contact Submissions**: View, search, and export form submissions
- **Settings**: Site configuration and social media links
- **Users**: User role management (admin only)

### Access Control
- **Admin**: Full access to all features including user management and deletion
- **Editor**: Content creation and editing, view submissions
- **Viewer**: Read-only access to dashboard and content

### CRUD Operations
- All content types support create/read/update operations
- Delete operations restricted to admin role only
- Slug auto-generation with uniqueness checking using kebab-case, diacritic removal
- Status workflow (draft/published) with automatic published_at timestamp setting
- Gallery management for projects with image reordering (up/down controls)
- Tag management for blog posts with validation (max 10 tags, 50 chars each)
- Optimistic UI updates with proper error handling and toast notifications

### Export Features
- CSV export for contact submissions with UTF-8 BOM encoding
- Formatted data with proper comma/quote escaping
- Timestamped filenames and progress indicators
- Standardized toast notifications for export status

### Production Polish
- ErrorBoundary components for resilient error handling
- EmptyState components with clear CTAs across all lists
- LoadingSkeleton components for consistent loading states
- ConfirmDialog components for destructive actions
- Standardized toast system with contextual icons (✓ ✗ ℹ ⚠)
- SEO protection with noindex meta tags on admin routes
- Global accessibility improvements (focus management, ARIA labels, keyboard navigation)
- Role-based access control with clear permission messaging

### Section-Based Page Editing
- Dynamic section system with Zod validation schemas
- Section types: hero, about, servicesPreview, portfolioPreview, testimonials, blogPreview, cta
- Visual section editor with drag-and-drop reordering
- SectionRenderer for dynamic page composition
- Homepage sections stored in pages.body JSONB field
- Content preview sections automatically fetch published data

### Admin Bootstrap & Recovery
- Secure admin seeding using Supabase Admin API
- Environment-based credentials (ADMIN_EMAIL, ADMIN_PASSWORD)
- Recovery procedures for lost admin access
- Public signup disabled; admin-controlled user promotion
- Service role key for bypassing RLS during seeding

## Security
- RLS policies ensure data isolation
- Rate limiting on contact forms (5 requests per minute)
- CAPTCHA verification stub for contact forms
- Admin-only access to sensitive operations
- IP tracking for contact submissions
- Theme isolation for admin vs public areas

## Performance
- Optimized queries with selective field loading
- Lazy loading for large content
- CDN-ready asset handling
- Efficient pagination for content lists
- Admin bundle separation from public frontend