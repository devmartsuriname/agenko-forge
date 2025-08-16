-- Update home page with complete section structure including carousels
UPDATE pages 
SET body = jsonb_build_object(
  'sections', jsonb_build_array(
    jsonb_build_object(
      'id', 'hero-section',
      'type', 'hero',
      'data', jsonb_build_object(
        'title', 'Build it right. Launch it fast.',
        'subtitle', 'Digital Agency · Suriname & Caribbean',
        'description', 'Websites, apps, and custom software — engineered for speed, scalability, and real business results.',
        'ctaText', 'Get a Quote',
        'ctaLink', '/contact',
        'backgroundImage', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
        'stats', jsonb_build_array(
          jsonb_build_object('number', '100+', 'label', 'Projects Delivered'),
          jsonb_build_object('number', '5+', 'label', 'Years Experience'),
          jsonb_build_object('number', '50+', 'label', 'Happy Clients'),
          jsonb_build_object('number', '24/7', 'label', 'Support')
        )
      )
    ),
    jsonb_build_object(
      'id', 'about-section',
      'type', 'about',
      'data', jsonb_build_object(
        'title', 'Why Devmart',
        'description', 'We combine senior engineering with AI-accelerated delivery to ship production-quality software in days, not months. From MVPs to enterprise systems: dependable, secure, and maintainable.',
        'image', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
        'features', jsonb_build_array(
          jsonb_build_object('icon', 'Zap', 'title', 'Fast delivery, zero shortcuts', 'description', 'Ship in days without sacrificing quality or security'),
          jsonb_build_object('icon', 'Shield', 'title', 'Security & RLS best-practices', 'description', 'Built-in security and data protection from day one'),
          jsonb_build_object('icon', 'Rocket', 'title', 'Performance budgets & SEO by default', 'description', 'Optimized for speed and search visibility')
        )
      )
    ),
    jsonb_build_object(
      'id', 'services-preview',
      'type', 'servicesPreview',
      'data', jsonb_build_object(
        'title', 'What we do',
        'description', 'Comprehensive technology solutions for your business growth',
        'limit', 4,
        'showAll', true
      )
    ),
    jsonb_build_object(
      'id', 'portfolio-preview',
      'type', 'portfolioPreview',
      'data', jsonb_build_object(
        'title', 'Recent Work',
        'description', 'Explore our portfolio of successful projects',
        'limit', 6,
        'showAll', true,
        'layout', 'carousel',
        'carousel', jsonb_build_object(
          'slidesPerView', jsonb_build_object('xs', 1, 'sm', 1, 'md', 2, 'lg', 3),
          'gap', 16,
          'autoplay', false,
          'intervalMs', 6000,
          'loop', true,
          'showArrows', true,
          'showDots', true,
          'aspectRatio', '16/9',
          'imageFit', 'cover'
        )
      )
    ),
    jsonb_build_object(
      'id', 'testimonials-section',
      'type', 'testimonials',
      'data', jsonb_build_object(
        'title', 'What Our Clients Say',
        'description', 'Hear from businesses that trust Devmart',
        'testimonials', jsonb_build_array(
          jsonb_build_object(
            'name', 'John Smith',
            'role', 'CEO',
            'company', 'TechCorp',
            'content', 'Devmart delivered exceptional results for our project. Their team expertise and dedication exceeded our expectations.',
            'rating', 5
          ),
          jsonb_build_object(
            'name', 'Sarah Johnson',
            'role', 'Marketing Director',
            'company', 'GrowthCo',
            'content', 'The speed and quality of delivery was impressive. They truly understand modern business needs.',
            'rating', 5
          ),
          jsonb_build_object(
            'name', 'Michael Chen',
            'role', 'Founder',
            'company', 'StartupXYZ',
            'content', 'From MVP to enterprise scale, Devmart has been our trusted technology partner.',
            'rating', 5
          )
        )
      )
    ),
    jsonb_build_object(
      'id', 'blog-preview',
      'type', 'blogPreview',
      'data', jsonb_build_object(
        'title', 'Latest Insights',
        'description', 'Stay updated with our latest thoughts and industry trends',
        'limit', 3,
        'showAll', true,
        'layout', 'carousel',
        'carousel', jsonb_build_object(
          'slidesPerView', jsonb_build_object('xs', 1, 'sm', 1, 'md', 2, 'lg', 3),
          'gap', 16,
          'autoplay', false,
          'intervalMs', 6000,
          'loop', true,
          'showArrows', true,
          'showDots', true
        )
      )
    ),
    jsonb_build_object(
      'id', 'cta-section',
      'type', 'cta',
      'data', jsonb_build_object(
        'title', 'Start today',
        'description', 'Get a tailored proposal and timeline within 24 hours.',
        'primaryCta', jsonb_build_object('text', 'Talk to Devmart', 'link', '/contact'),
        'secondaryCta', jsonb_build_object('text', 'View Our Work', 'link', '/portfolio'),
        'backgroundImage', 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
      )
    )
  )
),
updated_at = now()
WHERE slug = 'home';