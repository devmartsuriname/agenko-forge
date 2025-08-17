# Authentication & Access Control

## Overview

Devmart uses Supabase Auth with a role-based access control system. The application supports three user roles with different permission levels:

- **Admin**: Full system access, can manage users and all content
- **Editor**: Can create and edit content, cannot delete or manage users  
- **Viewer**: Read-only access to admin panel for monitoring

## Bootstrap Process

### Method 1: Admin Seeding Script (Recommended)

1. **Set Environment Variables**
   ```bash
   # Required secrets in Supabase Edge Functions
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ADMIN_EMAIL=info@devmart.sr
   ADMIN_PASSWORD=secure_admin_password
   ```

2. **Run Admin Seeding Script**
   ```bash
   npm run seed:admin
   ```

   This script will:
   - Create the first admin user with email verification bypassed
   - Set up the admin profile with proper role assignment
   - Skip creation if admin already exists

### Method 2: Bootstrap Registration (UI Alternative)

1. **Set Bootstrap Code**
   ```bash
   # Add to Supabase Edge Functions secrets
   BOOTSTRAP_CODE=your_one_time_secret_code
   ```

2. **Access Registration Page**
   - Visit `/admin/register` (only available when no admin exists)
   - Use @devmart.sr email address
   - Enter the bootstrap code
   - Registration automatically disabled after first successful admin creation

3. **Configure Supabase Auth Settings**
   - Navigate to Supabase Dashboard → Authentication → Settings
   - **Disable** "Enable email confirmations" for faster testing
   - **Disable** "Enable signup" to prevent public registration
   - Set Site URL and Redirect URLs to your domain

### Security Configuration

#### Disable Public Signup
```sql
-- Ensure public signup is disabled at database level
UPDATE auth.config SET value = 'false' WHERE key = 'enable_signup';
```

#### Default User Role
All users created through any signup flow default to 'viewer' role via the `handle_new_user()` trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## User Management

### Role Promotion
Only admin users can promote other users:

1. Login to `/admin/login` as admin
2. Navigate to `/admin/users`
3. Select user and change role
4. Changes take effect immediately

### Admin Recovery

If you lose access to the admin account:

#### Method 1: Re-run Seeding Script
```bash
# Update ADMIN_PASSWORD if needed
npm run seed:admin
```

#### Method 2: Manual Database Update
```sql
-- Find user ID
SELECT id, email FROM auth.users WHERE email = 'info@devmart.sr';

-- Update profile role
UPDATE profiles SET role = 'admin' WHERE id = 'user_id_here';
```

#### Method 3: Create New Admin via Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Create new user manually
3. Copy user ID
4. Update profiles table with admin role

## Access Control Matrix

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| **Users** |
| View users | ✅ | ❌ | ❌ |
| Edit user roles | ✅ | ❌ | ❌ |
| **Content Management** |
| View all content | ✅ | ✅ | ✅ |
| Create content | ✅ | ✅ | ❌ |
| Edit content | ✅ | ✅ | ❌ |
| Delete content | ✅ | ❌ | ❌ |
| Publish content | ✅ | ✅ | ❌ |
| **System Settings** |
| View settings | ✅ | ❌ | ❌ |
| Edit settings | ✅ | ❌ | ❌ |
| **Contact Submissions** |
| View submissions | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ❌ | ❌ |

## Authentication Flow

### Login Process
1. User visits `/admin/login`
2. Enters email/password
3. Supabase Auth validates credentials
4. Session created with role-based permissions
5. Redirect to `/admin` dashboard

### Session Management
- Sessions persist across browser sessions
- Auto-refresh tokens prevent expiration
- Logout clears all session data
- Role changes require re-login

## Security Best Practices

### Environment Variables
- Never commit secrets to version control
- Use Supabase Edge Functions secrets for production
- Rotate admin password regularly

### Database Security
- Row Level Security (RLS) enforced on all tables
- Security definer functions prevent policy recursion
- Foreign keys reference primary keys only
- Audit trails on sensitive operations

### Access Control
- Principle of least privilege
- Role-based permissions at database level
- Admin actions logged and auditable
- Regular access reviews

### Auth Security Configuration
- **Email OTP Expiration**: 600 seconds (10 minutes)
- **Prevent leaked passwords**: ENABLED (powered by HaveIBeenPwned.org)
- **Secure email change**: ENABLED (requires confirmation on both addresses)
- **Public signup**: DISABLED (invite-only via admin seeding)
- **Email confirmations**: Can be disabled for faster testing
- **Minimum password length**: 6 characters minimum, 8+ recommended

## Troubleshooting

### Common Issues

**"Invalid login credentials"**
- Check email/password combination
- Verify user exists in auth.users table
- Ensure email is confirmed (email_confirm = true)

**"Access denied" after login**
- Check profiles table for correct role
- Verify RLS policies are working
- Check `get_current_user_role()` function

**Admin seeding fails**
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check environment variables are set
- Ensure service role has admin privileges

### Recovery Commands

```bash
# Re-seed admin user
npm run seed:admin

# Check user status
npx supabase sql --query "SELECT u.email, u.email_confirmed_at, p.role FROM auth.users u LEFT JOIN profiles p ON u.id = p.id WHERE u.email = 'info@devmart.sr';"

# Reset admin password (requires service role)
npx supabase sql --query "UPDATE auth.users SET encrypted_password = crypt('new_password', gen_salt('bf')) WHERE email = 'info@devmart.sr';"
```

## Bootstrap Registration API

### Endpoint: `/api/auth/register`

**Method:** `POST`

**Request Body:**
```json
{
  "email": "admin@devmart.sr",
  "password": "secure_password",
  "bootstrapCode": "your_bootstrap_code"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "user": {
    "id": "uuid",
    "email": "admin@devmart.sr"
  }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

### Security Features

- **Rate Limiting:** 5 requests per minute per IP
- **Domain Validation:** Only @devmart.sr emails allowed
- **One-time Use:** Registration disabled after first successful admin creation
- **Bootstrap Code:** Server-side validation with hashed storage
- **RLS Compliance:** Uses security definer functions for safe privilege escalation

### Managing Bootstrap Registration

#### Set Bootstrap Code (Admin Required)
```sql
SELECT set_bootstrap_hash('your_new_bootstrap_code');
```

#### Check Registration Status
```sql
SELECT is_registration_enabled();
```

#### Manually Enable/Disable Registration
```sql
-- Enable
UPDATE app_config SET value = 'true' WHERE key = 'registration_enabled';

-- Disable
UPDATE app_config SET value = 'false' WHERE key = 'registration_enabled';
```

#### Rotate Bootstrap Code
```sql
-- Only admins can call this
SELECT set_bootstrap_hash('new_bootstrap_code_here');
```

## Future Considerations

### Multi-tenancy
- Tenant isolation via organization_id
- Scoped roles per organization
- Cross-tenant admin capabilities

### Advanced Permissions
- Feature-level permissions
- Content-type specific roles
- Time-based access controls

### Audit Logging
- Track all admin actions
- User session monitoring
- Security event alerting