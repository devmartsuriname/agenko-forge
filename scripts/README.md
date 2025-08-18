# Scripts Documentation

This folder contains utility scripts for seeding and managing content for the Devmart agency website.

## Scripts Overview

### `seed-devmart-extra.ts`

**Purpose**: Idempotently seed blog posts and projects to ensure sufficient content for homepage carousels.

**Features**:
- Safe multiple runs with `ON CONFLICT` upserts
- Sets proper `published_at` timestamps for content visibility  
- Handles project images with unique constraints
- Ensures ≥6 published items for optimal carousel display

**Usage**:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx ts-node scripts/seed-devmart-extra.ts
```

### `migrate-images.ts` (Phase 5E)

**Purpose**: Migrate external images (e.g., Picsum) to Supabase Storage with WebP conversion and responsive variants.

**Features**:
- Downloads images and converts to WebP format (quality 80)
- Generates 4 responsive variants: 320w, 640w, 960w, 1200w (16:9 aspect ratio)
- Deterministic file paths: `media/projects/{slug}/{basename}-{width}.webp`
- Updates database records with largest (1200w) URL for primary src
- Idempotent - skips already migrated images
- Preserves CLS prevention with consistent aspect ratios

**Usage**:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  
npx ts-node scripts/migrate-images.ts
```

**File Structure Created**:
```
media/projects/ecommerce-platform/
├── image-1-320.webp   (320×180)
├── image-1-640.webp   (640×360)
├── image-1-960.webp   (960×540)
└── image-1-1200.webp  (1200×675)
```

### `migrate-images-to-storage.ts` (Legacy)

**Purpose**: Basic migration of external image URLs to Supabase Storage with JPEG format.

**Features**:
- Downloads images and uploads as JPEG to `media` bucket
- Simple file structure: `projects/{slug}/image-{sort}.jpg`
- Idempotent operation with existence checks
- Updates `project_images` table with new storage URLs

**Usage**:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx ts-node scripts/migrate-images-to-storage.ts
```

### `run-seed-boost.js`

**Purpose**: Node.js convenience wrapper for simplified environment setup and error reporting.

**Features**:
- Simplified execution without TypeScript compilation
- Better error handling and reporting
- Environment variable management

**Usage**:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
./scripts/run-seed-boost.js
```

## Environment Requirements

All scripts require the `SUPABASE_SERVICE_ROLE_KEY` environment variable:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

This key provides server-side access to bypass RLS policies for data seeding and migration operations.

## Dependencies

- **TypeScript**: Scripts use TypeScript and require `ts-node` for execution
- **Sharp**: Image processing library for WebP conversion (Phase 5E only)
- **Supabase Client**: Database and storage operations

## Execution Order

For a complete setup:

1. **Content Seeding**: `npx ts-node scripts/seed-devmart-extra.ts`
2. **Image Migration**: `npx ts-node scripts/migrate-images.ts` (Phase 5E WebP + responsive)
3. **Verification**: Check homepage carousels have ≥6 items and images load from Supabase Storage

## Safety Features

- **Idempotent Operations**: All scripts can be run multiple times safely
- **Error Handling**: Continue processing even if individual items fail
- **Existence Checks**: Skip already processed content/images
- **Transaction Safety**: Database operations use proper conflict resolution

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