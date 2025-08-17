-- Fixed seed boost for immediate carousel content
-- Insert additional blog posts
INSERT INTO blog_posts (slug, title, excerpt, body, tags, status, published_at) VALUES
  (
    'ux-that-converts',
    'UX That Converts',
    'Design moves that drive action.',
    '{"blocks": [{"type": "p", "text": "Practical patterns for conversion without dark patterns."}, {"type": "p", "text": "User experience design that drives meaningful action requires understanding psychology, not manipulation."}]}',
    ARRAY['ux', 'conversion'],
    'published',
    now()
  ),
  (
    'ship-faster-with-guardrails',
    'Ship Faster With Guardrails',
    'Speed + safety via checklists and RLS.',
    '{"blocks": [{"type": "p", "text": "Guardrails let you move fast while staying safe."}, {"type": "p", "text": "Row Level Security policies enable rapid development without sacrificing security."}]}',
    ARRAY['process', 'quality'],
    'published',
    now()
  ),
  (
    'seo-primer-for-founders',
    'SEO Primer for Founders',
    'What actually matters early.',
    '{"blocks": [{"type": "p", "text": "Focus on IA, content depth, and performance budgets."}, {"type": "p", "text": "Early-stage SEO should prioritize information architecture and Core Web Vitals."}]}',
    ARRAY['seo', 'content'],
    'published',
    now()
  ),
  (
    'analytics-that-matter',
    'Analytics That Matter',
    'Signals, not noise.',
    '{"blocks": [{"type": "p", "text": "Define events that map to business outcomes."}, {"type": "p", "text": "Design event tracking that correlates with business objectives and user satisfaction."}]}',
    ARRAY['analytics', 'growth'],
    'published',
    now()
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert additional projects (simplified approach)
INSERT INTO projects (slug, title, excerpt, body, status, published_at) VALUES
  (
    'city-services-portal',
    'City Services Portal',
    'Citizen self-service with role-based workflows.',
    '{"outcomes": ["Faster case handling", "Accessible UI", "Audit logs"], "description": "A comprehensive digital platform enabling citizens to access municipal services online."}',
    'published',
    now()
  ),
  (
    'micro-saas-billing',
    'Micro‑SaaS Billing',
    'Subscriptions and metered usage.',
    '{"outcomes": ["Usage tracking", "Invoices", "Webhooks"], "description": "A lightweight billing system designed for micro-SaaS applications."}',
    'published',
    now()
  ),
  (
    'learning-platform-lite',
    'Learning Platform Lite',
    'Courses, quizzes, progress.',
    '{"outcomes": ["Content authoring", "Progress tracking", "Mobile-first design"], "description": "A streamlined learning management system focused on content delivery."}',
    'published',
    now()
  ),
  (
    'ops-analytics',
    'Ops Analytics',
    'Dashboards that drive decisions.',
    '{"outcomes": ["ETL pipelines", "Role-based dashboards", "Data exports"], "description": "An operational analytics platform providing real-time insights."}',
    'published',
    now()
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert project images (separate queries for clarity)
-- City Services Portal images
INSERT INTO project_images (project_id, url, alt, sort_order)
SELECT 
  p.id,
  'https://picsum.photos/seed/city1/1200/675',
  'City services dashboard overview',
  1
FROM projects p 
WHERE p.slug = 'city-services-portal'
ON CONFLICT (project_id, sort_order) DO NOTHING;

INSERT INTO project_images (project_id, url, alt, sort_order)
SELECT 
  p.id,
  'https://picsum.photos/seed/city2/1200/675',
  'Case management view',
  2
FROM projects p 
WHERE p.slug = 'city-services-portal'
ON CONFLICT (project_id, sort_order) DO NOTHING;

-- Other project images
INSERT INTO project_images (project_id, url, alt, sort_order)
SELECT 
  p.id,
  'https://picsum.photos/seed/bill1/1200/675',
  'Billing dashboard overview',
  1
FROM projects p 
WHERE p.slug = 'micro-saas-billing'
ON CONFLICT (project_id, sort_order) DO NOTHING;

INSERT INTO project_images (project_id, url, alt, sort_order)
SELECT 
  p.id,
  'https://picsum.photos/seed/learn1/1200/675',
  'Course content page',
  1
FROM projects p 
WHERE p.slug = 'learning-platform-lite'
ON CONFLICT (project_id, sort_order) DO NOTHING;

INSERT INTO project_images (project_id, url, alt, sort_order)
SELECT 
  p.id,
  'https://picsum.photos/seed/ops1/1200/675',
  'Analytics metrics dashboard',
  1
FROM projects p 
WHERE p.slug = 'ops-analytics'
ON CONFLICT (project_id, sort_order) DO NOTHING;