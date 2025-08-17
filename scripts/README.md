# Devmart Seed Boost Scripts

This directory contains scripts for managing content and media for the Devmart homepage carousels.

## Scripts Overview

### 1. `seed-devmart-extra.ts`
Idempotent TypeScript seeding script that adds blog posts and projects to ensure homepage carousels have sufficient content (≥6 items each).

**Features:**
- Safe to run multiple times (uses `ON CONFLICT` upserts)
- Sets proper `published_at` timestamps for published content
- Handles project images with unique constraints

**Usage:**
```bash
# Set environment variable first
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the script
npx ts-node scripts/seed-devmart-extra.ts
```

### 2. `migrate-images-to-storage.ts`
Migrates external image URLs to Supabase Storage for reliability and consistent aspect ratios.

**Features:**
- Downloads external images and uploads to `media` bucket
- Maintains 16/9 aspect ratio (1200x675) to prevent CLS
- Organizes images in `projects/{slug}/` folder structure
- Updates database records with new storage URLs

**Usage:**
```bash
# Set environment variable first
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the script
npx ts-node scripts/migrate-images-to-storage.ts
```

### 3. `run-seed-boost.js`
Node.js convenience wrapper that handles environment setup and error reporting.

**Usage:**
```bash
# Make sure SUPABASE_SERVICE_ROLE_KEY is in your environment
./scripts/run-seed-boost.js
```

## Seed Data Structure

The seed data in `seed/devmart_seed_extra.json` includes:

**Blog Posts (4 additional):**
- UX That Converts (UX, conversion optimization)
- Ship Faster With Guardrails (process, security)
- SEO Primer for Founders (SEO, content strategy)
- Analytics That Matter (analytics, growth)

**Projects (4 additional):**
- City Services Portal (government workflows)
- Micro‑SaaS Billing (subscription management)
- Learning Platform Lite (education technology)
- Ops Analytics (business intelligence)

## Database Constraints

- **Unique Index**: `project_images(project_id, sort_order)` prevents duplicate sort positions
- **Performance Indexes**: Optimized for slug lookups and published content queries
- **Media Storage**: Supabase Storage bucket with proper RLS policies

## Quality Assurance

After running scripts, verify:
- ✅ Blog posts: 6 published items
- ✅ Projects: 6 published items  
- ✅ Images: 16/9 aspect ratio (1200x675)
- ✅ Homepage carousels: No empty slots at lg=3 breakpoint
- ✅ Console: Clean, no TypeScript errors

## Troubleshooting

**Missing Service Role Key:**
```bash
# Get from Supabase Dashboard > Settings > API
export SUPABASE_SERVICE_ROLE_KEY=sbp_xxxxxxxxxxxx
```

**Permission Errors:**
Ensure the service role key has proper permissions for:
- Reading/writing to all content tables
- Managing storage buckets and objects

**Duplicate Conflicts:**
Scripts are idempotent - if content already exists with the same slug, it will be skipped safely.