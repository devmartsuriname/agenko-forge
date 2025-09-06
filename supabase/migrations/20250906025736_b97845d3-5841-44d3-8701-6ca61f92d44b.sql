-- Update the About section with diverse test images and company logos
UPDATE pages 
SET body = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          body,
          '{sections,1,data,mainImage,src}',
          '"/images/about-team-collaboration.jpg"'
        ),
        '{sections,1,data,secondaryImage,src}',
        '"/images/about-workspace.jpg"'
      ),
      '{sections,1,data,companies,0}',
      '{"alt": "TechFlow", "src": "/images/client-logo-techflow.png"}'
    ),
    '{sections,1,data,companies,1}',
    '{"alt": "FinanceX", "src": "/images/client-logo-financex.png"}'
  ),
  '{sections,1,data,companies,2,3}',
  '[
    {"alt": "HealthTech", "src": "/images/client-logo-healthtech.png"},
    {"alt": "ShopPro", "src": "/images/client-logo-shoppro.png"}
  ]'
)
WHERE slug = 'home' AND status = 'published';