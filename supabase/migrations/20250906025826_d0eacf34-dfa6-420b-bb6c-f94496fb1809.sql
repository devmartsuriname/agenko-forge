-- Fix the About section companies array and images
UPDATE pages 
SET body = jsonb_set(
  jsonb_set(
    jsonb_set(
      body,
      '{sections,1,data,mainImage,src}',
      '"/images/about-team-collaboration.jpg"'
    ),
    '{sections,1,data,secondaryImage,src}',
    '"/images/about-workspace.jpg"'
  ),
  '{sections,1,data,companies}',
  '[
    {"alt": "TechFlow", "src": "/images/client-logo-techflow.png"},
    {"alt": "FinanceX", "src": "/images/client-logo-financex.png"},
    {"alt": "HealthTech", "src": "/images/client-logo-healthtech.png"},
    {"alt": "ShopPro", "src": "/images/client-logo-shoppro.png"}
  ]'::jsonb
)
WHERE slug = 'home' AND status = 'published';