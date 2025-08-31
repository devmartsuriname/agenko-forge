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
- **clients**: Client management with contact information and company details
- **proposals**: Client proposals with rich content, template integration, and client relationships
- **proposal_templates**: Reusable proposal templates with variables for token replacement
- **proposal_attachments**: File attachments with signed URL access

## Delivery-Safe Proposal Workflow

```mermaid
graph TD
    A[Admin Opens Create Proposal] --> B[Select Template]
    B --> C[Template Auto-fills Content]
    C --> D[Select Client]
    D --> E[Client Data Available for Tokens]
    E --> F[Edit Content with Live Preview]
    F --> G[Configure Recipients & Expiration]
    G --> H[Save Proposal - Gets public_id]
    H --> I[Send Proposal]
    
    I --> J[Token Replacement Pipeline]
    J --> K[HTML Sanitization]
    K --> L[Secure Email Delivery]
    L --> M[Audit Trail Logging]
    
    subgraph "Authoring Phase"
        B --> C
        C --> D
        D --> E
        E --> F
        F --> G
        G --> H
    end
    
    subgraph "Delivery Phase"
        I --> J
        J --> K
        K --> L
        L --> M
    end
    
    subgraph "Security Boundaries"
        N[Template: Raw tokens {{client_name}}]
        O[Preview: Mock client data]
        P[Delivery: Real client data - sanitized]
        Q[Email: Pure HTML - no tokens]
    end
```

## Public ID & Immutability

Every proposal receives a unique, immutable `public_id` generated at creation:

- **Format**: `PR-YYYY-XXXX` (e.g., `PR-2024-0001`)
- **Generation**: Auto-generated via database trigger on INSERT
- **Uniqueness**: Database constraint prevents duplicates
- **Immutability**: Never changes after creation - stable for references
- **Year-Based**: Sequence resets annually for manageable numbering
- **Token Support**: Available as `{{proposal_id}}` in content and email subjects

## RLS Security Model for Proposals
- **Admins**: Full access to all proposals and can select any client
- **Editors**: Can create/update proposals only for clients they own
- **Client Ownership**: Enforced through `client_id` foreign key and RLS policies
- **Token Security**: Tokens never leak cross-client data due to ownership validation

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
- Supabase Auth with secure admin bootstrap process (`npm run seed:admin`)
- Role-based permissions enforced at database level (admin/editor/viewer)
- Public signup disabled; invite-only user management with service role seeding
- Session management with auto-refresh and persistence

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

## Performance Optimizations

### Hero Preload System (CMS-Driven)
The hero preload system automatically optimizes the first contentful paint for hero sections:

**Rules:**
- Only preloads when first section is `type: "hero"` with `backgroundImage`
- Reads dynamically from CMS data (`pages.body[0]`)
- Never hardcodes URLs - always CMS-driven
- Respects user preferences and connection quality

**Connection Awareness:**
- Skips preload on 2G/slow-2G connections
- Honors `navigator.connection.saveData` flag
- Graceful fallback for unsupported browsers

**CLS Prevention:**
- Hero images use explicit aspect ratios (16:9, 21:9, 32:9)
- Transform/opacity animations only (no layout changes)
- `loading="eager"` and `fetchpriority="high"` for hero images
- Fixed container dimensions prevent layout shifts

**Implementation:**
```typescript
// Hero preload injection (src/lib/performance.ts)
injectHeroPreload(sections: Section[]): void

// Usage in homepage (src/pages/Index.tsx)
useEffect(() => {
  if (sections.length > 0) {
    injectHeroPreload(sections);
  }
}, [sections]);
```

## Key Features Implemented
✅ Database schema with RLS policies
✅ Design system with Agenko branding
✅ Authentication system
✅ Dynamic hero preload system
✅ CLS-optimized image loading
✅ Connection-aware performance features
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

## Carousel System

### Design Principles
- **Homepage Only**: Carousels are exclusive to homepage sections; /blog and /portfolio routes maintain grid/list layouts
- **Accessibility First**: Full keyboard navigation, proper ARIA labels, screen reader support
- **Performance Optimized**: Transform/opacity animations only, 60fps target, <30KB JS budget
- **Reduced Motion**: Honors `prefers-reduced-motion: reduce` with disabled autoplay and minimal transitions

### Technical Implementation
- **CarouselBase Component**: Headless carousel with touch/keyboard/mouse support
- **Motion System**: 120-180ms durations, 60-80ms stagger delays, standard ease-out curves
- **Responsive**: Configurable slides per viewport (xs/sm/md/lg breakpoints)
- **Focus Management**: Proper focus order, visible focus indicators, aria-current for active slides
- **Image Optimization**: Lazy loading, proper aspect ratios, sizes/srcset attributes

### Carousel Configuration
```typescript
carousel: {
  slidesPerView: { xs: 1, sm: 1, md: 2, lg: 3 },
  gap: 16,                  // Tailwind gap equivalent
  autoplay: false,          // Disabled by default
  intervalMs: 6000,         // Autoplay interval
  loop: true,               // Infinite loop
  showArrows: true,         // Navigation arrows
  showDots: true,           // Dot indicators
  // Portfolio-specific
  aspectRatio: '16/9',      // '16/9' | '4/3' | '1/1'
  imageFit: 'cover'         // 'cover' | 'contain'
}
```

## Content Management & Storage Strategy

### Image Pipeline & Responsive Storage (Phase 5E Complete)
- **Media Bucket**: All images stored in Supabase Storage `media` bucket with public READ policies
- **Format**: WebP-only for ~30% smaller file sizes vs JPEG while maintaining visual quality
- **Responsive Variants**: 4 sizes generated per image (320w, 640w, 960w, 1200w) at 16:9 aspect ratio
- **Path Structure**: 
  - Projects: `media/projects/{slug}/{basename}-{width}.webp`
  - Blog: `media/blog/{slug}/{basename}-{width}.webp`
  - Sections: `media/sections/{pageSlug}/{sectionType}/{basename}-{width}.webp`
- **Quality**: WebP quality 80 for optimal balance of compression and visual fidelity
- **Migration**: Complete with `scripts/migrate-images.ts` - idempotent external → WebP conversion
- **Preconnect**: Automatic DNS preconnect to storage origin for ~100-200ms faster image loads
- **Hero Preload**: First hero images preloaded with responsive `imagesrcset`/`imagesizes` attributes

### Responsive Image Implementation
- **Primary URL**: Always points to largest variant (1200w) for fallback
- **srcset Generation**: Automatic generation from primary URL using naming convention
- **Sizes Attribute**: Context-aware sizing for optimal loading
  - Cards: `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
  - Hero: `"100vw"`
- **Loading Strategy**: Priority loading for hero images, lazy loading for cards
- **CLS Prevention**: Fixed aspect ratios maintained across all variants

### Data Integrity
- **Unique Constraints**: `project_images(project_id, sort_order)` prevents duplicate sort positions
- **URL Uniqueness**: `project_images(project_id, url)` prevents duplicate URLs per project
- **Idempotent Upserts**: All seed operations use `ON CONFLICT (slug) DO NOTHING` for safe re-runs
- **Content Requirements**: Minimum 6 published items each for blog and portfolio carousels

### Carousel Content Strategy
- **Blog Posts**: Target ≥6 published posts for balanced display at lg=3 breakpoint
- **Portfolio Projects**: Target ≥6 published projects for consistent carousel experience
- **Homepage Limits**: Both blog and portfolio preview sections configured with `limit: 6`
- **Breakpoint Coverage**: Ensures no empty slots at xs=1, sm=1, md=2, lg=3 slides per view
- **Performance Indexes**: Optimized queries for published content and slug-based lookups
- **Idempotent Seeding**: `scripts/seed-devmart-extra.ts` safely re-runs without duplicates

### Carousel Content Requirements
- **Minimum Items**: 6 published items per carousel for optimal `lg=3` display
- **Configurable Counts**: Editors can adjust `count` via Sections editor for campaigns
- **Homepage Only**: Carousel layout restricted to homepage; `/blog` and `/portfolio` use grid/list
- **Future Enhancement**: Consider `settings.homepage_carousel_counts` for seasonal overrides

### Seeding & Migration Scripts
```bash
# Phase 5E: Complete image migration with WebP conversion and responsive variants
npm run migrate:images

# Alternative: Direct execution
npx ts-node scripts/migrate-images.ts

# Content seeding (idempotent upsert)
npx ts-node scripts/seed-devmart-extra.ts
```

### Orphan Management
- **Storage Orphan Scanner**: Automated daily scans at 2:00 AM UTC via cron job
- **Report-Only Mode**: Identifies orphaned files without deletion for safety
- **Manual Review**: Detailed logs help identify cleanup opportunities
- **Zero False Positives**: Only flags truly unreferenced storage files

### Image Naming Convention (Phase 5E Standard)
```
media/projects/ecommerce-platform/
  ├── image-1-320.webp   (320×180)   # Mobile
  ├── image-1-640.webp   (640×360)   # Small tablet
  ├── image-1-960.webp   (960×540)   # Large tablet  
  ├── image-1-1200.webp  (1200×675)  # Desktop (primary)
  ├── image-2-320.webp
  └── ...

media/blog/modern-web-design/
  ├── hero-320.webp      # Mobile hero
  ├── hero-640.webp      # Small tablet hero
  ├── hero-960.webp      # Large tablet hero
  └── hero-1200.webp     # Desktop hero (primary)

media/sections/home/hero/
  ├── hero-320.webp      # Homepage hero variants
  ├── hero-640.webp
  ├── hero-960.webp  
  └── hero-1200.webp
```

**Quality Assurance Checklist:**
- ✅ Blog ≥ 6 published posts with `published_at` timestamps  
- ✅ Projects ≥ 6 published with images and proper `sort_order`  
- ✅ No empty carousel slots at any breakpoint (xs/sm/md/lg)  
- ✅ Smooth swipe on Android Chrome, reduced-motion support  
- ✅ Aspect-ratio boxes prevent CLS, keyboard navigation functional  
- ✅ Console clean, 0 TypeScript errors, Lighthouse Mobile ≥ 80

## Style Isolation
Admin styles use semantic tokens and can be scoped with `.admin-root` class to prevent conflicts with public frontend.

## Modal Layout Patterns

### 2-Column Independent Scrolling Layout (Template Editor)

The Template Editor uses a clean 2-column layout optimized for template editing:

```tsx
// Modal Container - Global scroll for accessibility
<DialogContent className="max-w-7xl w-[90vw] max-h-[90vh] overflow-y-auto flex flex-col">
  
  {/* Header - Non-growing */}
  <div className="shrink-0">
    {/* Template Details + Variables */}
  </div>

  {/* Main Grid - 2 columns with independent scrolling */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
    
    {/* Column 1: Editor - Independent scrolling */}
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

**Key CSS Properties for Independent Scrolling:**
- `min-h-0` on flex containers allows children to shrink below their content size
- `overflow-y-auto` on modal enables global scrolling when content exceeds viewport
- `overflow-y-auto` on individual columns for independent content scrolling  
- `shrink-0` prevents header/footer from competing for space
- `flex-1` allows the main grid to consume remaining height
- `grid-cols-1 lg:grid-cols-2` provides responsive layout that stacks on mobile
- `max-h-[90vh]` ensures modal respects viewport height limits

**Benefits:**
- **Single Preview**: Eliminated duplicate preview sections - only the Live Preview column remains
- **Clean Layout**: Balanced 2-column design with proper space allocation
- **Always Accessible Actions**: Save/Cancel buttons in sticky footer
- **No Feature Creep**: Removed attachments section (belongs in proposal send stage, not template editing)
- **Independent Scrolling**: Editor and preview scroll independently without interference
- **Responsive Design**: Mobile-friendly with proper stacking behavior

**UI Improvements Made:**
- Removed duplicate "Preview" section from RichEditor component  
- Removed attachments column (not relevant for template editing)
- Added sticky footer with Save/Cancel buttons
- Optimized for template editing workflow specifically

**Restore Points:**
- `P7.2.1-Proposals-FixPack-Restore-Before-3Column-Layout`: State before layout changes