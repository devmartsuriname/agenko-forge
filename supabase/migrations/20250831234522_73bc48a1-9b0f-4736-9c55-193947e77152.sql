-- Fix settings table RLS to be admin-only
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Only admins can view settings" ON public.settings FOR SELECT USING (get_current_user_role() = 'admin');

-- Insert seed data for case studies
INSERT INTO public.case_studies (slug, title, summary, client, industry, services, tech_stack, hero_image, body, status, published_at, created_by) VALUES
('fintech-app-scaling', 'FinTech App Scaling Solution', 'Helped a financial technology startup scale from 10K to 1M+ users with zero downtime', 'PayFlow Inc', 'Financial Technology', ARRAY['Backend Development', 'Database Optimization', 'Performance Engineering'], ARRAY['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'Our client, a growing FinTech startup, faced critical performance bottlenecks as their user base exploded. We implemented a comprehensive scaling strategy including database sharding, caching layers, and microservices architecture. The result was a 10x improvement in response times and seamless handling of peak traffic loads.', 'published', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('ecommerce-conversion-boost', 'E-commerce Conversion Optimization', 'Increased online sales by 340% through UX redesign and performance optimization', 'ShopSmart Ltd', 'E-commerce', ARRAY['UX/UI Design', 'Frontend Development', 'Performance Optimization'], ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'], 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'A complete e-commerce platform overhaul that focused on user experience, page load speeds, and conversion funnel optimization. Through data-driven design decisions and technical improvements, we transformed an underperforming online store into a conversion machine.', 'published', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('saas-platform-launch', 'SaaS Platform MVP Development', 'Built and launched a complete SaaS platform from concept to 500+ paying customers', 'CloudSync Technologies', 'Software as a Service', ARRAY['Full-Stack Development', 'DevOps', 'Product Strategy'], ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS', 'Docker'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 'From initial concept to market launch, we built a comprehensive SaaS platform for team collaboration. The project included user authentication, real-time collaboration features, payment processing, and a scalable infrastructure that supported rapid user growth.', 'published', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));

-- Insert metrics for case studies
UPDATE public.case_studies SET metrics = '[
  {"label": "Performance Improvement", "value": "10x", "description": "Faster response times"},
  {"label": "User Growth", "value": "1M+", "description": "Active users supported"},
  {"label": "Uptime", "value": "99.99%", "description": "System availability"}
]'::jsonb WHERE slug = 'fintech-app-scaling';

UPDATE public.case_studies SET metrics = '[
  {"label": "Conversion Rate", "value": "+340%", "description": "Sales increase"},
  {"label": "Page Speed", "value": "2.1s", "description": "Load time improvement"},
  {"label": "Customer Satisfaction", "value": "4.8/5", "description": "User rating"}
]'::jsonb WHERE slug = 'ecommerce-conversion-boost';

UPDATE public.case_studies SET metrics = '[
  {"label": "Time to Market", "value": "3 months", "description": "From concept to launch"},
  {"label": "Paying Customers", "value": "500+", "description": "Within first 6 months"},
  {"label": "Revenue Growth", "value": "$50K MRR", "description": "Monthly recurring revenue"}
]'::jsonb WHERE slug = 'saas-platform-launch';

-- Insert seed data for lab projects
INSERT INTO public.lab_projects (slug, title, summary, demo_url, repo_url, hero_image, tags, body, status, published_at, created_by) VALUES
('ai-chatbot-component', 'AI-Powered React Chatbot', 'Open-source React component for AI-powered customer support chatbots', 'https://chatbot-demo.devmart.sr', 'https://github.com/devmart/ai-chatbot-react', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', ARRAY['React', 'AI', 'TypeScript', 'OpenAI', 'Chatbot'], 'A fully customizable React component that integrates with OpenAI GPT models to provide intelligent customer support. Features include conversation memory, custom styling, and easy integration with existing applications. Perfect for startups looking to add AI-powered support without building from scratch.', 'published', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('performance-monitoring-dashboard', 'Real-time Performance Monitor', 'Beautiful dashboard for monitoring web application performance metrics', 'https://perf-monitor.devmart.sr', 'https://github.com/devmart/perf-monitor', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', ARRAY['React', 'D3.js', 'Performance', 'Analytics', 'Dashboard'], 'An open-source performance monitoring solution that provides real-time insights into web application metrics. Built with React and D3.js, it offers beautiful visualizations and actionable performance data for development teams.', 'published', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('component-library-starter', 'Modern Component Library', 'Production-ready React component library with Storybook and automated testing', 'https://components.devmart.sr', 'https://github.com/devmart/modern-components', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', ARRAY['React', 'Storybook', 'TypeScript', 'Testing', 'Components'], 'A comprehensive starter template for building modern React component libraries. Includes Storybook for documentation, automated testing with Jest, TypeScript support, and CI/CD pipeline setup. Everything you need to create and maintain a professional component library.', 'published', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));

-- Insert seed data for jobs
INSERT INTO public.jobs (slug, title, team, location, work_mode, type, description, responsibilities, requirements, benefits, apply_url, email, status, published_at, created_by) VALUES
('senior-fullstack-developer', 'Senior Full-Stack Developer', 'Engineering', 'Remote', 'Remote', 'Full-time', 'Join our growing team to build cutting-edge web applications that serve thousands of users worldwide. You''ll work on both frontend and backend systems, collaborating with designers and product managers to deliver exceptional user experiences.', 
ARRAY[
  'Develop and maintain scalable web applications using modern technologies',
  'Collaborate with cross-functional teams to define and implement new features',
  'Write clean, testable, and well-documented code',
  'Participate in code reviews and technical discussions',
  'Mentor junior developers and contribute to team growth',
  'Stay up-to-date with emerging technologies and best practices'
],
ARRAY[
  '5+ years of experience in full-stack web development',
  'Strong proficiency in React, Node.js, and TypeScript',
  'Experience with modern databases (PostgreSQL, Redis)',
  'Knowledge of cloud platforms (AWS, GCP, or Azure)',
  'Familiarity with DevOps practices and CI/CD pipelines',
  'Excellent problem-solving and communication skills',
  'Experience with agile development methodologies'
],
ARRAY[
  'Competitive salary ($120k - $180k based on experience)',
  'Comprehensive health, dental, and vision insurance',
  'Flexible working hours and fully remote work options',
  'Professional development budget ($3k annually)',
  'Stock options and performance bonuses',
  '4 weeks paid vacation + holidays',
  'Latest equipment and home office setup allowance'
],
'https://apply.devmart.sr/senior-fullstack', 'careers@devmart.sr', 'open', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)),

('ux-ui-designer', 'UX/UI Designer', 'Design', 'Hybrid', 'Hybrid', 'Full-time', 'We''re looking for a talented UX/UI Designer to create beautiful, user-centered digital experiences. You''ll work closely with our engineering and product teams to design interfaces that are both functional and delightful to use.',
ARRAY[
  'Design user interfaces for web and mobile applications',
  'Conduct user research and usability testing',
  'Create wireframes, prototypes, and high-fidelity designs',
  'Collaborate with developers to ensure design implementation',
  'Maintain and evolve our design system',
  'Present design concepts to stakeholders and clients'
],
ARRAY[
  '3+ years of experience in UX/UI design',
  'Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)',
  'Strong portfolio showcasing web and mobile design work',
  'Understanding of user-centered design principles',
  'Experience with design systems and component libraries',
  'Knowledge of HTML/CSS and basic frontend development',
  'Excellent communication and presentation skills'
],
ARRAY[
  'Competitive salary ($90k - $140k based on experience)',
  'Health, dental, and vision insurance coverage',
  'Flexible hybrid work arrangement (2-3 days in office)',
  'Professional development and conference budget',
  'Stock options and quarterly bonuses',
  '3 weeks paid vacation + personal days',
  'Creative workspace with latest design tools and equipment'
],
'https://apply.devmart.sr/ux-ui-designer', 'careers@devmart.sr', 'open', now(), (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1));