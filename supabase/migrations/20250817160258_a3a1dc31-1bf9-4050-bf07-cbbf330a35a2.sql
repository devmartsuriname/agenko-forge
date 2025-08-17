-- Manual seed boost for immediate carousel content
-- Insert additional blog posts
INSERT INTO blog_posts (slug, title, excerpt, body, tags, status, published_at) VALUES
  (
    'ux-that-converts',
    'UX That Converts',
    'Design moves that drive action.',
    '{"blocks": [{"type": "p", "text": "Practical patterns for conversion without dark patterns."}, {"type": "p", "text": "User experience design that drives meaningful action requires understanding psychology, not manipulation. We explore evidence-based approaches to creating interfaces that guide users naturally toward desired outcomes while maintaining trust and transparency."}]}',
    ARRAY['ux', 'conversion'],
    'published',
    now()
  ),
  (
    'ship-faster-with-guardrails',
    'Ship Faster With Guardrails',
    'Speed + safety via checklists and RLS.',
    '{"blocks": [{"type": "p", "text": "Guardrails let you move fast while staying safe."}, {"type": "p", "text": "Row Level Security (RLS) policies and systematic checklists enable rapid development without sacrificing security. Learn how to implement automated safety nets that prevent common vulnerabilities while maintaining development velocity."}]}',
    ARRAY['process', 'quality'],
    'published',
    now()
  ),
  (
    'seo-primer-for-founders',
    'SEO Primer for Founders',
    'What actually matters early.',
    '{"blocks": [{"type": "p", "text": "Focus on IA, content depth, and performance budgets."}, {"type": "p", "text": "Early-stage SEO should prioritize information architecture, semantic HTML, and Core Web Vitals over keyword stuffing. We break down the fundamentals that provide long-term organic growth without falling into optimization rabbit holes."}]}',
    ARRAY['seo', 'content'],
    'published',
    now()
  ),
  (
    'analytics-that-matter',
    'Analytics That Matter',
    'Signals, not noise.',
    '{"blocks": [{"type": "p", "text": "Define events that map to business outcomes."}, {"type": "p", "text": "Most analytics implementations collect vanity metrics that don''t drive decisions. We explore how to design event tracking that directly correlates with business objectives and user satisfaction, enabling data-driven product decisions."}]}',
    ARRAY['analytics', 'growth'],
    'published',
    now()
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert additional projects
WITH new_projects AS (
  INSERT INTO projects (slug, title, excerpt, body, status, published_at) VALUES
    (
      'city-services-portal',
      'City Services Portal',
      'Citizen self-service with role-based workflows.',
      '{"outcomes": ["Faster case handling", "Accessible UI", "Audit logs"], "description": "A comprehensive digital platform enabling citizens to access municipal services online, with automated workflows for common requests and administrative oversight capabilities."}',
      'published',
      now()
    ),
    (
      'micro-saas-billing',
      'Micro‑SaaS Billing',
      'Subscriptions and metered usage.',
      '{"outcomes": ["Usage tracking", "Invoices", "Webhooks"], "description": "A lightweight billing system designed for micro-SaaS applications, featuring flexible pricing models, automated invoicing, and comprehensive webhook integration for seamless payment processing."}',
      'published',
      now()
    ),
    (
      'learning-platform-lite',
      'Learning Platform Lite',
      'Courses, quizzes, progress.',
      '{"outcomes": ["Content authoring", "Progress tracking", "Mobile-first design"], "description": "A streamlined learning management system focused on content delivery and progress tracking, optimized for mobile-first educational experiences with intuitive course creation tools."}',
      'published',
      now()
    ),
    (
      'ops-analytics',
      'Ops Analytics',
      'Dashboards that drive decisions.',
      '{"outcomes": ["ETL pipelines", "Role-based dashboards", "Data exports"], "description": "An operational analytics platform providing real-time insights through customizable dashboards, automated data processing, and flexible export capabilities for business intelligence."}',
      'published',
      now()
    )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, slug
)
-- Insert project images with proper aspect ratios
INSERT INTO project_images (project_id, url, alt, sort_order)
SELECT 
  p.id,
  CASE 
    WHEN p.slug = 'city-services-portal' AND img.sort_order = 1 THEN 'https://picsum.photos/seed/city1/1200/675'
    WHEN p.slug = 'city-services-portal' AND img.sort_order = 2 THEN 'https://picsum.photos/seed/city2/1200/675'
    WHEN p.slug = 'micro-saas-billing' THEN 'https://picsum.photos/seed/bill1/1200/675'
    WHEN p.slug = 'learning-platform-lite' THEN 'https://picsum.photos/seed/learn1/1200/675'
    WHEN p.slug = 'ops-analytics' THEN 'https://picsum.photos/seed/ops1/1200/675'
  END as url,
  CASE 
    WHEN p.slug = 'city-services-portal' AND img.sort_order = 1 THEN 'City services dashboard overview'
    WHEN p.slug = 'city-services-portal' AND img.sort_order = 2 THEN 'Case management view'
    WHEN p.slug = 'micro-saas-billing' THEN 'Billing dashboard overview'
    WHEN p.slug = 'learning-platform-lite' THEN 'Course content page'
    WHEN p.slug = 'ops-analytics' THEN 'Analytics metrics dashboard'
  END as alt,
  img.sort_order
FROM new_projects p
CROSS JOIN (
  SELECT 1 as sort_order WHERE p.slug = 'city-services-portal'
  UNION ALL
  SELECT 2 as sort_order WHERE p.slug = 'city-services-portal'
  UNION ALL
  SELECT 1 as sort_order WHERE p.slug IN ('micro-saas-billing', 'learning-platform-lite', 'ops-analytics')
) img
ON CONFLICT (project_id, sort_order) DO NOTHING;