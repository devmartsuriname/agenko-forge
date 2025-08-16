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
- **Projects**: Portfolio management with image galleries (in progress)
- **Blog**: Full blog management with tags and publishing (in progress)
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
- Slug auto-generation with uniqueness checking
- Status workflow (draft/published) with publish timestamp
- Optimistic UI updates with proper error handling

### Export Features
- CSV export for contact submissions
- Formatted data with proper encoding

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