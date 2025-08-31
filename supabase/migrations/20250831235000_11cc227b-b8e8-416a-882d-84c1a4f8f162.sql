-- Fix jobs data insertion by checking constraint and inserting valid job types
INSERT INTO public.jobs (slug, title, team, location, work_mode, type, description, responsibilities, requirements, benefits, apply_url, email, status, published_at, created_by) VALUES
('senior-fullstack-developer', 'Senior Full-Stack Developer', 'Engineering', 'Remote', 'Remote', 'permanent', 'Join our growing team to build cutting-edge web applications that serve thousands of users worldwide.', 
ARRAY['Develop and maintain scalable web applications', 'Collaborate with cross-functional teams', 'Write clean, testable code'],
ARRAY['5+ years full-stack development experience', 'React, Node.js, TypeScript proficiency', 'Database experience (PostgreSQL, Redis)'],
ARRAY['Competitive salary ($120k - $180k)', 'Health, dental, vision insurance', 'Fully remote work options'],
'https://apply.devmart.sr/senior-fullstack', 'careers@devmart.sr', 'open', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));