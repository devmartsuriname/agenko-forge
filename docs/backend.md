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

## API Endpoints (Future)
- Contact form submission with rate limiting
- CAPTCHA verification
- CSV export for contact submissions
- File upload for media management

## Edge Functions

### submit-contact
- **Purpose**: Handles contact form submissions with validation and rate limiting
- **Rate Limiting**: 5 requests per minute per IP address
- **Validation**: Email format, field lengths, required fields
- **CAPTCHA**: Stub implementation ready for hCaptcha/reCAPTCHA integration
- **Security**: Server-side validation, IP tracking, error handling

## Environment Variables Required
- `ADMIN_EMAIL`: Initial admin user email
- `RESEND_API_KEY`: For email notifications (future)
- `CAPTCHA_SECRET`: For form protection (future)
- `SUPABASE_URL`: Automatically provided
- `SUPABASE_SERVICE_ROLE_KEY`: Automatically provided for edge functions