import { z } from 'zod';

// Base section schema
const BaseSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
});

// Hero section schema
export const HeroSectionSchema = BaseSectionSchema.extend({
  type: z.literal('hero'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.string().url().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    stats: z.array(z.object({
      number: z.string(),
      label: z.string(),
    })).optional(),
  }),
});

// About section schema
export const AboutSectionSchema = BaseSectionSchema.extend({
  type: z.literal('about'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    image: z.string().url().optional(),
    features: z.array(z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })).optional(),
  }),
});

// Services preview section schema
export const ServicesPreviewSectionSchema = BaseSectionSchema.extend({
  type: z.literal('servicesPreview'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    limit: z.number().min(1).max(12).default(6),
    showAll: z.boolean().default(true),
  }),
});

// Portfolio preview section schema
export const PortfolioPreviewSectionSchema = BaseSectionSchema.extend({
  type: z.literal('portfolioPreview'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    limit: z.number().min(1).max(12).default(6),
    showAll: z.boolean().default(true),
    layout: z.enum(['grid', 'carousel']).default('grid'),
    carousel: z.object({
      slidesPerView: z.object({
        xs: z.number().min(1).max(6).default(1),
        sm: z.number().min(1).max(6).default(1),
        md: z.number().min(1).max(6).default(2),
        lg: z.number().min(1).max(6).default(3),
      }).default({ xs: 1, sm: 1, md: 2, lg: 3 }),
      gap: z.number().min(0).max(64).default(16),
      autoplay: z.boolean().default(false),
      intervalMs: z.number().min(1000).max(10000).default(6000),
      loop: z.boolean().default(true),
      showArrows: z.boolean().default(true),
      showDots: z.boolean().default(true),
      aspectRatio: z.enum(['16/9', '4/3', '1/1']).default('16/9'),
      imageFit: z.enum(['cover', 'contain']).default('cover'),
    }).optional(),
  }),
});

// Testimonials section schema
export const TestimonialsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('testimonials'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    testimonials: z.array(z.object({
      name: z.string(),
      role: z.string(),
      company: z.string(),
      content: z.string(),
      avatar: z.string().url().optional(),
      rating: z.number().min(1).max(5).default(5),
    })),
  }),
});

// Blog preview section schema
export const BlogPreviewSectionSchema = BaseSectionSchema.extend({
  type: z.literal('blogPreview'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    limit: z.number().min(1).max(12).default(3),
    showAll: z.boolean().default(true),
    layout: z.enum(['grid', 'carousel']).default('grid'),
    carousel: z.object({
      slidesPerView: z.object({
        xs: z.number().min(1).max(6).default(1),
        sm: z.number().min(1).max(6).default(1),
        md: z.number().min(1).max(6).default(2),
        lg: z.number().min(1).max(6).default(3),
      }).default({ xs: 1, sm: 1, md: 2, lg: 3 }),
      gap: z.number().min(0).max(64).default(16),
      autoplay: z.boolean().default(false),
      intervalMs: z.number().min(1000).max(10000).default(6000),
      loop: z.boolean().default(true),
      showArrows: z.boolean().default(true),
      showDots: z.boolean().default(true),
    }).optional(),
  }),
});

// CTA section schema
export const CtaSectionSchema = BaseSectionSchema.extend({
  type: z.literal('cta'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    primaryCta: z.object({
      text: z.string(),
      link: z.string(),
    }),
    secondaryCta: z.object({
      text: z.string(),
      link: z.string(),
    }).optional(),
    backgroundImage: z.string().url().optional(),
  }),
});

// Union type for all sections
export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  AboutSectionSchema,
  ServicesPreviewSectionSchema,
  PortfolioPreviewSectionSchema,
  TestimonialsSectionSchema,
  BlogPreviewSectionSchema,
  CtaSectionSchema,
]);

// TypeScript types
export type Section = z.infer<typeof SectionSchema>;
export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type AboutSection = z.infer<typeof AboutSectionSchema>;
export type ServicesPreviewSection = z.infer<typeof ServicesPreviewSectionSchema>;
export type PortfolioPreviewSection = z.infer<typeof PortfolioPreviewSectionSchema>;
export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>;
export type BlogPreviewSection = z.infer<typeof BlogPreviewSectionSchema>;
export type CtaSection = z.infer<typeof CtaSectionSchema>;

// Page body schema
export const PageBodySchema = z.object({
  sections: z.array(SectionSchema),
});

export type PageBody = z.infer<typeof PageBodySchema>;

// Helper function to create new section with default data
export function createDefaultSection(type: Section['type']): Section {
  const id = crypto.randomUUID();
  
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        data: {
          title: 'Welcome to Devmart',
          subtitle: 'Your Technology Partner',
          description: 'We build innovative solutions that drive business growth.',
          ctaText: 'Get Started',
          ctaLink: '/contact',
          stats: [
            { number: '100+', label: 'Projects Completed' },
            { number: '5+', label: 'Years Experience' },
            { number: '50+', label: 'Happy Clients' },
            { number: '24/7', label: 'Support' },
          ],
        },
      } as HeroSection;
      
    case 'about':
      return {
        id,
        type: 'about',
        data: {
          title: 'About Devmart',
          description: 'We are a technology company focused on delivering innovative solutions.',
          features: [
            { icon: 'Zap', title: 'Fast Development', description: 'Rapid prototyping and development' },
            { icon: 'Shield', title: 'Secure Solutions', description: 'Enterprise-grade security' },
            { icon: 'Rocket', title: 'Scalable Systems', description: 'Built to grow with your business' },
          ],
        },
      } as AboutSection;
      
    case 'servicesPreview':
      return {
        id,
        type: 'servicesPreview',
        data: {
          title: 'Our Services',
          description: 'Comprehensive technology solutions for your business.',
          limit: 6,
          showAll: true,
        },
      } as ServicesPreviewSection;
      
    case 'portfolioPreview':
      return {
        id,
        type: 'portfolioPreview',
        data: {
          title: 'Our Work',
          description: 'Explore our portfolio of successful projects.',
          limit: 6,
          showAll: true,
          layout: 'grid' as const,
        },
      } as PortfolioPreviewSection;
      
    case 'testimonials':
      return {
        id,
        type: 'testimonials',
        data: {
          title: 'What Our Clients Say',
          description: 'Hear from businesses that trust Devmart.',
          testimonials: [
            {
              name: 'John Smith',
              role: 'CEO',
              company: 'TechCorp',
              content: 'Devmart delivered exceptional results for our project.',
              rating: 5,
            },
          ],
        },
      } as TestimonialsSection;
      
    case 'blogPreview':
      return {
        id,
        type: 'blogPreview',
        data: {
          title: 'Latest Insights',
          description: 'Stay updated with our latest thoughts and industry trends.',
          limit: 3,
          showAll: true,
          layout: 'grid' as const,
        },
      } as BlogPreviewSection;
      
    case 'cta':
      return {
        id,
        type: 'cta',
        data: {
          title: 'Ready to Get Started?',
          description: 'Let\'s discuss your project and how we can help.',
          primaryCta: {
            text: 'Start Your Project',
            link: '/contact',
          },
          secondaryCta: {
            text: 'View Our Work',
            link: '/portfolio',
          },
        },
      } as CtaSection;
      
    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}

// Section type metadata for UI
export const SECTION_TYPES = [
  { type: 'hero', label: 'Hero', description: 'Main banner with call-to-action' },
  { type: 'about', label: 'About', description: 'Company information and features' },
  { type: 'servicesPreview', label: 'Services Preview', description: 'Showcase of services' },
  { type: 'portfolioPreview', label: 'Portfolio Preview', description: 'Featured projects' },
  { type: 'testimonials', label: 'Testimonials', description: 'Client reviews and feedback' },
  { type: 'blogPreview', label: 'Blog Preview', description: 'Latest blog posts' },
  { type: 'cta', label: 'Call to Action', description: 'Conversion-focused section' },
] as const;