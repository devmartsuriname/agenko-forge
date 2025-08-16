-- Simple seed for Devmart homepage with sections
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