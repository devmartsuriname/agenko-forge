# Hero Section Replacement Restore Point

## Date: 2025-01-15
## Context: Replacing CMS-driven HeroSection with new Hero2 design

### Original HeroSection.tsx State
- CMS-driven component receiving data from database
- Uses ScrollReveal animations and FloatingElement components  
- Integrated with existing motion configuration
- Supports background images, titles, descriptions, CTA buttons, and stats
- Maintains responsive design with Tailwind classes

### Original Features Preserved
- CMS data structure and admin editing capabilities
- Scroll-based animations and parallax effects
- Responsive design patterns
- Accessibility considerations
- Performance optimizations (lazy loading, etc.)

### Key Files Modified
- `src/components/sections/HeroSection.tsx` - Complete component replacement
- `tailwind.config.ts` - Added noise/grainy background utilities
- `package.json` - Added framer-motion dependency

### Branding Updates
- Changed from "LeadGenie" to match existing site branding
- Integrated with existing logo and navigation structure
- Maintained existing color scheme and design tokens

### Rollback Instructions
If rollback is needed:
1. Revert `src/components/sections/HeroSection.tsx` to original CMS-driven version
2. Remove framer-motion dependency if not used elsewhere
3. Remove bg-noise and bg-grainy from tailwind.config.ts if not used elsewhere
4. Restore original ScrollReveal-based animations

### Original Component Structure
The original HeroSection used:
- CMS data props via `section.data`
- ScrollReveal for animations
- FloatingElement for background effects
- ResponsiveImage for optimized images
- Integration with useScrollProgress hook
- ProgressScrubbing for enhanced scroll effects