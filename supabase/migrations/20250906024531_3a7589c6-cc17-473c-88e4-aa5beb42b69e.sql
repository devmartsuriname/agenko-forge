-- Update homepage about section with enhanced About3 data
UPDATE pages 
SET body = jsonb_set(
  body,
  '{sections,1}',
  '{
    "id": "about-enhanced",
    "type": "about",
    "data": {
      "title": "About Devmart",
      "description": "We are a passionate team of developers and designers dedicated to creating innovative digital solutions that empower businesses to thrive in the modern digital landscape.",
      "mainImage": {
        "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/hero-image.jpg",
        "alt": "Devmart team collaboration"
      },
      "secondaryImage": {
        "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/hero-image.jpg",
        "alt": "Modern workspace"
      },
      "breakout": {
        "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/logo.png",
        "alt": "Devmart logo",
        "title": "Innovation at Every Step",
        "description": "Providing businesses with cutting-edge tools to improve workflows, boost efficiency, and drive sustainable growth.",
        "buttonText": "Learn More",
        "buttonUrl": "/about"
      },
      "companiesTitle": "Trusted by leading companies worldwide",
      "companies": [
        {
          "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/logo.png",
          "alt": "Client 1"
        },
        {
          "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/logo.png", 
          "alt": "Client 2"
        },
        {
          "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/logo.png",
          "alt": "Client 3"
        },
        {
          "src": "https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/logo.png",
          "alt": "Client 4"
        }
      ],
      "achievementsTitle": "Our Impact in Numbers",
      "achievementsDescription": "Delivering exceptional results through innovative solutions and dedicated partnerships with businesses worldwide.",
      "achievements": [
        {
          "label": "Projects Completed",
          "value": "500+"
        },
        {
          "label": "Happy Clients", 
          "value": "300+"
        },
        {
          "label": "Years Experience",
          "value": "10+"
        },
        {
          "label": "Team Members",
          "value": "25+"
        }
      ]
    }
  }'::jsonb
)
WHERE slug = 'home' AND status = 'published';