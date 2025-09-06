UPDATE pages 
SET body = jsonb_set(
  body,
  '{sections,1,data,breakout,src}',
  '"/images/logo.png"'
)
WHERE slug = 'home';