-- Fix settings table RLS and add proper job types  
-- Update settings RLS policies for admin-only access
DROP POLICY IF EXISTS "Anyone can view settings" ON settings;
DROP POLICY IF EXISTS "Only admins can manage settings" ON settings;

-- Create secure settings policies
CREATE POLICY "Admins can manage all settings" ON settings
  FOR ALL USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- Allow public access only to specific non-sensitive settings
CREATE POLICY "Public can view safe settings" ON settings
  FOR SELECT USING (key IN ('site_title', 'contact_email', 'company_name'));

-- Check and add jobs with corrected type values (contract, permanent, internship)
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    SELECT id INTO admin_user_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Skipping job insertion.';
        RETURN;
    END IF;

    -- Insert jobs with corrected type values based on common job types
    INSERT INTO public.jobs (
        slug, title, team, location, work_mode, type, description, 
        responsibilities, requirements, benefits, apply_url, email, 
        status, published_at, created_by
    ) VALUES
    (
        'senior-fullstack-developer',
        'Senior Full-Stack Developer',
        'Engineering',
        'Remote / San Francisco',
        'Remote',
        'contract',
        'Join our growing engineering team to build cutting-edge web applications that serve thousands of users worldwide. You work on challenging problems involving scalable architecture, real-time systems, and modern web technologies.',
        ARRAY[
            'Develop and maintain scalable web applications using React, Node.js, and TypeScript',
            'Collaborate with cross-functional teams including design, product, and DevOps',
            'Write clean, testable, and well-documented code following best practices',
            'Participate in code reviews and contribute to technical architecture decisions',
            'Mentor junior developers and contribute to team knowledge sharing',
            'Optimize application performance and ensure high availability'
        ],
        ARRAY[
            '5+ years of full-stack development experience',
            'Strong proficiency in React, Node.js, and TypeScript',
            'Experience with databases (PostgreSQL, Redis) and cloud platforms (AWS/GCP)',
            'Knowledge of modern web development practices (CI/CD, testing, monitoring)',
            'Excellent communication skills and ability to work in a collaborative environment',
            'Bachelor degree in Computer Science or equivalent experience'
        ],
        ARRAY[
            'Competitive salary range: $120,000 - $180,000',
            'Comprehensive health, dental, and vision insurance',
            'Flexible work arrangements (remote-first culture)',
            'Professional development budget ($2,000/year)',
            'Equity participation and 401(k) matching',
            'Unlimited PTO and flexible working hours'
        ],
        'https://apply.devmart.sr/senior-fullstack-developer',
        'careers@devmart.sr',
        'open',
        now() - interval '7 days',
        admin_user_id
    );

    RAISE NOTICE 'Successfully inserted job data';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to insert jobs: %', SQLERRM;
END $$;