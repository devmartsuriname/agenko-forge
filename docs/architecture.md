# Agenko Agency MVP - Architecture Documentation

## Overview
This is a modern agency website with secure admin CMS, built with React, TypeScript, Tailwind CSS, and Supabase.

## Database Schema
- **profiles**: User profiles with role-based access (admin/editor/viewer)
- **services**: Service offerings with draft/published status
- **projects**: Portfolio projects with image galleries
- **blog_posts**: Blog content with tagging system
- **pages**: Static pages (About, Privacy, etc.)
- **contact_submissions**: Contact form submissions
- **settings**: Site configuration (metadata, social links)

## Security (RLS Policies)
- Public users can only view published content
- Anonymous users cannot write to any tables
- Editors/Admins can manage content
- Only Admins can delete and manage users
- Contact submissions are admin-only

## Design System
- **Theme**: Dark theme with green accent (#A1FF4C)
- **Brand Colors**: Agenko green, dark backgrounds, white text
- **Typography**: Inter font family
- **Components**: Enhanced shadcn/ui with custom variants
- **Responsive**: Mobile-first approach

## Authentication
- Supabase Auth with email/password
- Invite-only signup (no public registration)
- Role-based permissions (admin/editor/viewer)

## Frontend Structure
- **Public Routes**: /, /about, /services, /portfolio, /blog, /contact
- **Admin Routes**: /admin/* (protected)
- **Shared Utils**: SEO, CMS functions, auth context

## Technology Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Database + Auth + RLS)
- React Query for data fetching
- React Helmet Async for SEO

## Key Features Implemented
✅ Database schema with RLS policies
✅ Design system with Agenko branding
✅ Authentication system
✅ SEO optimization utilities
✅ Hero section with generated image
✅ Enhanced button variants
✅ CMS utility functions
✅ Complete Admin CMS with lazy-loaded routes
✅ Project gallery management with reordering
✅ Blog management with tags
✅ Media management placeholder
✅ Contact submissions with CSV export
✅ Role-based access control throughout

## Admin CMS Architecture
- **Lazy Loading**: All admin routes use React.lazy() for optimal bundle splitting
- **Type Safety**: Centralized TypeScript types in `/types/content.ts`
- **Route Protection**: Supabase authentication with role-based access
- **Style Isolation**: Admin uses `.admin-root` scope with semantic tokens
- **CRUD Operations**: Full create, read, update, delete for all content types
- **Gallery Management**: Project images with accessibility-enhanced reordering
- **Tag System**: Blog posts support tag filtering with keyboard-accessible chips
- **Status Workflow**: Draft/published states with automatic timestamp management
- **Error Boundaries**: Global error handling with friendly fallbacks
- **Loading States**: Consistent skeleton components across all interfaces
- **Toast System**: Standardized notifications with contextual icons
- **Accessibility**: WCAG AA compliant with focus management and ARIA labels
- **Empty States**: Clear CTAs when no content exists
- **Confirmation Dialogs**: Destructive actions require explicit confirmation
- **Section-Based Editing**: Dynamic page composition with visual editor
- **Schema Validation**: Zod schemas ensure data integrity
- **Live Preview**: Sections render dynamically with real published content

## Route Structure
### Public Routes
- `/` - Homepage
- `/about` - About page
- `/services` - Service listings
- `/services/:slug` - Service detail
- `/portfolio` - Project showcase
- `/portfolio/:slug` - Project detail
- `/blog` - Blog listings
- `/blog/:slug` - Blog post
- `/contact` - Contact form

### Admin Routes (Lazy Loaded with ErrorBoundary)
- `/admin/login` - Authentication
- `/admin` - Dashboard (wrapped in ErrorBoundary)
- `/admin/pages` - Page management (wrapped in ErrorBoundary)
- `/admin/pages/new` - Page editor (includes ErrorBoundary)
- `/admin/pages/:id/edit` - Page editor (includes ErrorBoundary)
- `/admin/services` - Service management (wrapped in ErrorBoundary)
- `/admin/services/new` - Service editor (includes ErrorBoundary)
- `/admin/services/:id/edit` - Service editor (includes ErrorBoundary)
- `/admin/projects` - Project management (wrapped in ErrorBoundary)
- `/admin/projects/new` - Project editor (includes ErrorBoundary)
- `/admin/projects/:id/edit` - Project editor (includes ErrorBoundary)
- `/admin/blog` - Blog management (wrapped in ErrorBoundary)
- `/admin/blog/new` - Blog editor (includes ErrorBoundary)
- `/admin/blog/:id/edit` - Blog editor (includes ErrorBoundary)
- `/admin/media` - Media management (wrapped in ErrorBoundary)
- `/admin/contact` - Contact submissions (wrapped in ErrorBoundary)
- `/admin/settings` - Site settings (wrapped in ErrorBoundary)
- `/admin/users` - User management (wrapped in ErrorBoundary)

## Next Steps
- Complete public pages implementation
- Implement file upload for media management
- Add email notifications for contact forms
- Performance optimization and caching
- SEO enhancements and sitemap generation

## Style Isolation
Admin styles use semantic tokens and can be scoped with `.admin-root` class to prevent conflicts with public frontend.