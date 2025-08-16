-- Seed Devmart v1.0 content
-- Homepage with sections
INSERT INTO pages (slug, title, status, published_at, body) VALUES 
('home', 'Home', 'published', now(), 
'{
  "sections": [
    {
      "id": "hero-section",
      "type": "hero",
      "data": {
        "title": "Build it right. Launch it fast.",
        "subtitle": "Digital Agency · Suriname & Caribbean",
        "description": "Websites, apps, and custom software — engineered for speed, scalability, and real business results.",
        "ctaText": "Get a Quote",
        "ctaLink": "/contact",
        "backgroundImage": "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
        "stats": [
          {"number": "100+", "label": "Projects Delivered"},
          {"number": "5+", "label": "Years Experience"},
          {"number": "50+", "label": "Happy Clients"},
          {"number": "24/7", "label": "Support"}
        ]
      }
    },
    {
      "id": "about-section",
      "type": "about",
      "data": {
        "title": "Why Devmart",
        "description": "We combine senior engineering with AI-accelerated delivery to ship production-quality software in days, not months. From MVPs to enterprise systems: dependable, secure, and maintainable.",
        "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
        "features": [
          {"icon": "Zap", "title": "Fast delivery, zero shortcuts", "description": "Ship in days without sacrificing quality or security"},
          {"icon": "Shield", "title": "Security & RLS best-practices", "description": "Built-in security and data protection from day one"},
          {"icon": "Rocket", "title": "Performance budgets & SEO by default", "description": "Optimized for speed and search visibility"}
        ]
      }
    },
    {
      "id": "services-preview",
      "type": "servicesPreview",
      "data": {
        "title": "What we do",
        "description": "Comprehensive technology solutions for your business growth",
        "limit": 4,
        "showAll": true
      }
    },
    {
      "id": "portfolio-preview",
      "type": "portfolioPreview",
      "data": {
        "title": "Recent Work",
        "description": "Explore our portfolio of successful projects",
        "limit": 6,
        "showAll": true
      }
    },
    {
      "id": "testimonials-section",
      "type": "testimonials",
      "data": {
        "title": "What Our Clients Say",
        "description": "Hear from businesses that trust Devmart",
        "testimonials": [
          {
            "name": "Sarah Johnson",
            "role": "Operations Lead", 
            "company": "Retail Solutions",
            "content": "They shipped our MVP in record time — and it just worked.",
            "rating": 5,
            "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612d5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
          },
          {
            "name": "Michael Chen",
            "role": "Product Manager",
            "company": "FinTech Innovations", 
            "content": "Serious engineering with a product mindset.",
            "rating": 5,
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
          },
          {
            "name": "Lisa Rodriguez",
            "role": "Founder",
            "company": "GrowthLab",
            "content": "Professional, reliable, and they understand our business needs.",
            "rating": 5,
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
          }
        ]
      }
    },
    {
      "id": "blog-preview",
      "type": "blogPreview",
      "data": {
        "title": "Latest Insights",
        "description": "Stay updated with our latest thoughts and industry trends",
        "limit": 3,
        "showAll": true
      }
    },
    {
      "id": "cta-section",
      "type": "cta",
      "data": {
        "title": "Start today",
        "description": "Get a tailored proposal and timeline within 24 hours.",
        "primaryCta": {
          "text": "Talk to Devmart",
          "link": "/contact"
        },
        "secondaryCta": {
          "text": "View Our Work",
          "link": "/portfolio"
        },
        "backgroundImage": "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    }
  ]
}') ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  body = EXCLUDED.body,
  updated_at = now();

-- Services
INSERT INTO services (slug, title, excerpt, content, status, published_at) VALUES 
('web-development', 'Web Development', 'High-performance websites built for conversion and SEO.', 
'{"description": "Modern, responsive websites that drive results", "features": ["Next.js/React foundation", "Fast, secure, accessible", "CMS & analytics ready", "SEO optimized", "Mobile-first design"]}', 
'published', now()),

('app-development', 'App Development', 'Robust mobile & web apps that scale with your growth.',
'{"description": "Full-stack applications built for performance", "features": ["Modern stacks (React, Node.js)", "Authentication & user roles", "Real-time features", "Cloud deployment", "API integrations"]}',
'published', now()),

('custom-software-saas', 'Custom Software (SaaS)', 'Tailor-made platforms that streamline your operations.',
'{"description": "Enterprise-grade software solutions", "features": ["Workflow automation", "Role-based access control", "Advanced dashboards", "Reporting & analytics", "Multi-tenant architecture"]}',
'published', now()),

('branding-digital-marketing', 'Branding & Digital Marketing', 'Identity, content, and growth — aligned to outcomes.',
'{"description": "Comprehensive brand and marketing solutions", "features": ["Brand identity design", "Content strategy & creation", "SEO & digital marketing", "Social media management", "Performance tracking"]}',
'published', now()),

('ai-enablement', 'AI Enablement', 'Automations and assistants that save time and unlock value.',
'{"description": "AI-powered solutions for modern businesses", "features": ["Chatbots & virtual assistants", "Process automation", "Document processing", "Predictive analytics", "Custom AI integrations"]}',
'published', now())

ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- Projects
INSERT INTO projects (slug, title, excerpt, body, status, published_at) VALUES 
('commerce-lite', 'Commerce Lite', 'A lightweight e-commerce MVP optimized for speed.',
'{"description": "Fast, responsive e-commerce platform", "outcomes": ["Lightning-fast catalog browsing", "Streamlined checkout process", "SEO-friendly product pages", "Mobile-optimized experience"], "tech_stack": ["React", "Next.js", "Stripe", "Tailwind CSS"]}',
'published', now()),

('govdocs-flow', 'GovDocs Flow', 'A secure document workflow system for public sector.',
'{"description": "Secure government document management", "outcomes": ["Role-based approval workflows", "Complete audit trail logging", "Searchable document archives", "Compliance-ready security"], "tech_stack": ["React", "Node.js", "PostgreSQL", "AWS"]}',
'published', now()),

('fieldops-mobile', 'FieldOps Mobile', 'Field data capture app with offline sync.',
'{"description": "Mobile-first data collection platform", "outcomes": ["Offline-first data capture", "Photo annotations and GPS", "Real-time supervisor reports", "Seamless cloud synchronization"], "tech_stack": ["React Native", "SQLite", "AWS Amplify", "GraphQL"]}',
'published', now()),

('fintech-dashboard', 'FinTech Dashboard', 'Real-time financial analytics and reporting platform.',
'{"description": "Advanced financial data visualization", "outcomes": ["Real-time market data", "Custom analytics dashboards", "Compliance reporting", "Multi-currency support"], "tech_stack": ["React", "D3.js", "Python", "PostgreSQL"]}',
'published', now()),

('healthcare-portal', 'Healthcare Portal', 'Patient management system with telemedicine features.',
'{"description": "Comprehensive healthcare management", "outcomes": ["Patient record management", "Telemedicine consultations", "Appointment scheduling", "HIPAA-compliant security"], "tech_stack": ["React", "Node.js", "MongoDB", "WebRTC"]}',
'published', now()),

('logistics-tracker', 'Logistics Tracker', 'Supply chain visibility and tracking platform.',
'{"description": "End-to-end logistics management", "outcomes": ["Real-time shipment tracking", "Inventory management", "Route optimization", "Predictive analytics"], "tech_stack": ["React", "Express.js", "Redis", "PostgreSQL"]}',
'published', now())

ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- Get project IDs for images
WITH project_data AS (
  SELECT id, slug FROM projects WHERE slug IN ('commerce-lite', 'govdocs-flow', 'fieldops-mobile', 'fintech-dashboard', 'healthcare-portal', 'logistics-tracker')
)
-- Project Images
INSERT INTO project_images (project_id, url, alt, sort_order) 
SELECT 
  p.id,
  CASE 
    WHEN p.slug = 'commerce-lite' THEN 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN p.slug = 'govdocs-flow' THEN 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN p.slug = 'fieldops-mobile' THEN 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN p.slug = 'fintech-dashboard' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN p.slug = 'healthcare-portal' THEN 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN p.slug = 'logistics-tracker' THEN 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  END as url,
  CASE 
    WHEN p.slug = 'commerce-lite' THEN 'Commerce Lite homepage'
    WHEN p.slug = 'govdocs-flow' THEN 'GovDocs workflow dashboard'
    WHEN p.slug = 'fieldops-mobile' THEN 'FieldOps mobile interface'
    WHEN p.slug = 'fintech-dashboard' THEN 'FinTech analytics dashboard'
    WHEN p.slug = 'healthcare-portal' THEN 'Healthcare portal interface'
    WHEN p.slug = 'logistics-tracker' THEN 'Logistics tracking dashboard'
  END as alt,
  1 as sort_order
FROM project_data p
ON CONFLICT (project_id, sort_order) DO UPDATE SET 
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- Blog Posts
INSERT INTO blog_posts (slug, title, excerpt, body, tags, status, published_at) VALUES 
('launch-faster-with-confidence', 'Launch Faster with Confidence', 'Ship in days without sacrificing quality.',
'{"content": "How to use guardrails, checklists, and RLS to move fast safely. Learn the frameworks and tools that enable rapid development without technical debt.", "sections": [{"type": "paragraph", "content": "Speed and quality don\'t have to be trade-offs. With the right processes and tools, you can ship production-ready features in days while maintaining high standards."}]}',
'{"delivery", "quality", "engineering"}', 'published', now()),

('from-mvp-to-product', 'From MVP to Product', 'Validate, iterate, and scale with purpose.',
'{"content": "A practical roadmap from first release to sustainable growth. Understanding when to optimize, when to pivot, and how to scale your technology stack.", "sections": [{"type": "paragraph", "content": "The journey from MVP to mature product requires careful planning and strategic decision-making at each stage of growth."}]}',
'{"mvp", "product", "scaling"}', 'published', now()),

('design-tokens-and-performance', 'Design Tokens & Performance', 'Consistency that fuels speed and DX.',
'{"content": "Why tokenization reduces drift and improves shipping velocity. How design systems and performance budgets work together for better user experiences.", "sections": [{"type": "paragraph", "content": "Design tokens create a foundation for scalable, maintainable interfaces while ensuring consistent performance across your application."}]}',
'{"design-systems", "performance", "frontend"}', 'published', now()),

('security-first-development', 'Security-First Development', 'Building secure applications from day one.',
'{"content": "Essential security practices for modern web applications. From authentication to data protection, learn how to build security into your development process.", "sections": [{"type": "paragraph", "content": "Security isn\'t something you add later—it\'s a fundamental part of how you design and build applications."}]}',
'{"security", "development", "best-practices"}', 'published', now()),

('ai-in-business-automation', 'AI in Business Automation', 'Practical applications of AI for business efficiency.',
'{"content": "Real-world examples of how AI can streamline operations and reduce manual work. From document processing to customer support automation.", "sections": [{"type": "paragraph", "content": "AI automation isn\'t about replacing humans—it\'s about freeing them to focus on higher-value work."}]}',
'{"ai", "automation", "business"}', 'published', now())

ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- Settings
INSERT INTO settings (key, value) VALUES 
('company_info', '{
  "name": "Devmart",
  "slogan": "Tomorrow''s Digital, Today",
  "email": "hello@devmart.example",
  "phone": "+597-000-0000",
  "address": "Paramaribo, Suriname",
  "description": "Leading technology company delivering innovative software solutions, web development, and digital transformation services."
}'),

('social_links', '{
  "website": "https://devmart.example",
  "linkedin": "https://linkedin.com/company/devmart",
  "twitter": "https://twitter.com/devmart",
  "github": "https://github.com/devmart",
  "facebook": ""
}'),

('pricing_plans', '{
  "plans": [
    {
      "name": "Starter",
      "price_srd": "TBD",
      "price_usd": "$2,500",
      "duration": "one-time",
      "features": [
        "1–3 pages",
        "Basic SEO setup",
        "Google Analytics",
        "1 revision round",
        "Mobile responsive"
      ],
      "cta": "/contact?subject=Starter%20Plan%20Inquiry",
      "popular": false
    },
    {
      "name": "Business",
      "price_srd": "TBD", 
      "price_usd": "$5,000",
      "duration": "one-time",
      "features": [
        "5–8 pages",
        "Blog & contact forms",
        "Advanced analytics",
        "2 revision rounds",
        "CMS integration"
      ],
      "cta": "/contact?subject=Business%20Plan%20Inquiry",
      "popular": true
    },
    {
      "name": "Pro",
      "price_srd": "TBD",
      "price_usd": "$10,000",
      "duration": "one-time", 
      "features": [
        "Advanced components",
        "Performance optimization",
        "3 revision rounds",
        "E-commerce ready",
        "Custom integrations"
      ],
      "cta": "/contact?subject=Pro%20Plan%20Inquiry",
      "popular": false
    },
    {
      "name": "Enterprise",
      "price_srd": "Custom",
      "price_usd": "Custom",
      "duration": "project-based",
      "features": [
        "Tailored scope",
        "Service level agreements",
        "Dedicated project manager",
        "Priority support",
        "Custom development"
      ],
      "cta": "/contact?subject=Enterprise%20Plan%20Inquiry",
      "popular": false
    }
  ]
}'),

('seo_defaults', '{
  "default_title": "Devmart - Technology Solutions That Drive Growth",
  "default_description": "Leading technology company delivering innovative software solutions, web development, and digital transformation services for businesses worldwide.",
  "default_keywords": ["technology", "software development", "web development", "digital solutions", "suriname", "caribbean"],
  "og_image": "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
}')

ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();