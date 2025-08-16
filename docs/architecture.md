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

## Next Steps
- Complete public pages (services, portfolio, blog, contact)
- Build admin CMS interface
- Implement contact form with CAPTCHA
- Add remaining sections to homepage
- Set up email notifications

## Style Isolation
Admin styles use semantic tokens and can be scoped with `.admin-root` class to prevent conflicts with public frontend.