-- Emergency seed data fix - Use correct job type values
-- Get admin user ID for proper foreign key references
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin user exists, skip seeding (should not happen in production)
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Skipping seed data insertion.';
        RETURN;
    END IF;

    -- Insert case studies with complete data
    INSERT INTO public.case_studies (
        slug, title, summary, client, industry, services, tech_stack, 
        hero_image, gallery, body, metrics, status, published_at, created_by
    ) VALUES
    (
        'ecommerce-platform-redesign',
        'E-commerce Platform Redesign',
        'Complete overhaul of legacy e-commerce platform resulting in 150% increase in conversions and 40% faster page load times.',
        'TechCorp Inc.',
        'E-commerce',
        ARRAY['UX/UI Design', 'Frontend Development', 'Performance Optimization'],
        ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Shopify API'],
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
        ARRAY[
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=800&q=80'
        ],
        '<h2>The Challenge</h2><p>TechCorp''s legacy e-commerce platform was struggling with poor user experience, slow load times, and declining conversion rates. The outdated technology stack was limiting their growth potential.</p><h2>Our Solution</h2><p>We redesigned the entire user experience from the ground up, implementing modern web technologies and performance optimization techniques. The new platform features a mobile-first design, advanced search capabilities, and streamlined checkout process.</p><h2>Results</h2><p>The redesigned platform exceeded all expectations, delivering significant improvements in user engagement and business metrics. Our data-driven approach ensured every design decision was backed by user research and analytics.</p>',
        '[
            {"label": "Conversion Rate Increase", "value": 150, "unit": "%"},
            {"label": "Page Load Time Improvement", "value": 40, "unit": "%"},
            {"label": "Mobile Traffic Increase", "value": 85, "unit": "%"},
            {"label": "Customer Satisfaction", "value": 94, "unit": "%"}
        ]'::jsonb,
        'published',
        now() - interval '30 days',
        admin_user_id
    ),
    (
        'fintech-mobile-app',
        'Fintech Mobile App Development',
        'Built a secure, user-friendly mobile banking app from scratch with advanced security features and real-time transaction processing.',
        'FinanceFlow',
        'Financial Services',
        ARRAY['Mobile App Development', 'API Development', 'Security Implementation'],
        ARRAY['React Native', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe API'],
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
        ARRAY[
            'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
        ],
        '<h2>The Challenge</h2><p>FinanceFlow needed a mobile banking solution that could compete with established players while maintaining the highest security standards. They required real-time transaction processing and a seamless user experience.</p><h2>Our Solution</h2><p>We developed a native mobile app with cutting-edge security features, including biometric authentication, end-to-end encryption, and fraud detection algorithms. The app features intuitive navigation and real-time financial insights.</p><h2>Results</h2><p>The app launched to critical acclaim and quickly gained market traction, establishing FinanceFlow as a serious competitor in the mobile banking space.</p>',
        '[
            {"label": "App Store Rating", "value": 4.8, "unit": "/5"},
            {"label": "User Onboarding Rate", "value": 92, "unit": "%"},
            {"label": "Transaction Processing Speed", "value": 200, "unit": "ms"},
            {"label": "Security Incidents", "value": 0, "unit": ""}
        ]'::jsonb,
        'published',
        now() - interval '45 days',
        admin_user_id
    ),
    (
        'healthcare-data-platform',
        'Healthcare Data Analytics Platform',
        'Developed a comprehensive healthcare analytics platform enabling real-time patient data insights and predictive health modeling.',
        'MedTech Solutions',
        'Healthcare Technology',
        ARRAY['Data Engineering', 'Analytics Dashboard', 'API Development'],
        ARRAY['Python', 'Django', 'PostgreSQL', 'D3.js', 'AWS Lambda'],
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=80',
        ARRAY[
            'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=800&q=80'
        ],
        '<h2>The Challenge</h2><p>MedTech Solutions needed to transform complex healthcare data into actionable insights for medical professionals. The challenge was creating an intuitive interface that could handle massive datasets while maintaining HIPAA compliance.</p><h2>Our Solution</h2><p>We built a scalable data platform with advanced visualization tools and predictive analytics capabilities. The system processes millions of patient records while maintaining strict security and privacy standards.</p><h2>Results</h2><p>The platform now serves over 50 healthcare facilities, enabling better patient outcomes through data-driven insights.</p>',
        '[
            {"label": "Healthcare Facilities Served", "value": 50, "unit": "+"},
            {"label": "Patient Records Processed", "value": 2.5, "unit": "M"},
            {"label": "Data Processing Speed", "value": 300, "unit": "%"},
            {"label": "Compliance Score", "value": 100, "unit": "%"}
        ]'::jsonb,
        'published',
        now() - interval '60 days',
        admin_user_id
    );

    -- Insert lab projects with complete data
    INSERT INTO public.lab_projects (
        slug, title, summary, demo_url, repo_url, hero_image, tags, body, 
        status, published_at, created_by
    ) VALUES
    (
        'ai-code-reviewer',
        'AI Code Reviewer',
        'An intelligent code review assistant powered by machine learning that provides automated feedback on code quality, security vulnerabilities, and best practices.',
        'https://ai-reviewer.devmart.sr',
        'https://github.com/devmart/ai-code-reviewer',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        ARRAY['AI/ML', 'Developer Tools', 'TypeScript', 'Python', 'OpenAI'],
        '<h2>Overview</h2><p>Our AI Code Reviewer leverages advanced machine learning models to provide intelligent feedback on code submissions. It analyzes code for potential bugs, security vulnerabilities, performance issues, and adherence to best practices.</p><h2>Key Features</h2><ul><li>Real-time code analysis</li><li>Security vulnerability detection</li><li>Performance optimization suggestions</li><li>Best practice recommendations</li><li>Integration with popular Git platforms</li></ul><h2>Technology Stack</h2><p>Built with TypeScript and Python, utilizing OpenAI''s models for natural language processing and code understanding. The system can be integrated into any CI/CD pipeline.</p>',
        'published',
        now() - interval '20 days',
        admin_user_id
    ),
    (
        'real-time-collaboration-tool',
        'Real-time Collaboration Platform',
        'A modern collaboration platform enabling seamless real-time editing, video conferencing, and project management in a single unified interface.',
        'https://collab.devmart.sr',
        'https://github.com/devmart/collab-platform',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
        ARRAY['Real-time', 'WebRTC', 'React', 'Socket.io', 'Collaboration'],
        '<h2>Overview</h2><p>Our collaboration platform combines the best features of document editing, video conferencing, and project management into a single, cohesive experience. Perfect for remote teams and distributed workforces.</p><h2>Key Features</h2><ul><li>Real-time document collaboration</li><li>Integrated video conferencing</li><li>Project timeline management</li><li>File sharing and version control</li><li>Custom workspace creation</li></ul><h2>Innovation</h2><p>The platform uses WebRTC for peer-to-peer communication and custom conflict resolution algorithms for simultaneous editing, ensuring smooth collaboration regardless of team size.</p>',
        'published',
        now() - interval '35 days',
        admin_user_id
    ),
    (
        'blockchain-supply-tracker',
        'Blockchain Supply Chain Tracker',
        'A transparent supply chain tracking system using blockchain technology to ensure product authenticity and trace origins from manufacturer to consumer.',
        'https://supply-tracker.devmart.sr',
        'https://github.com/devmart/blockchain-supply-tracker',
        'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=1200&q=80',
        ARRAY['Blockchain', 'Supply Chain', 'Ethereum', 'Smart Contracts', 'Web3'],
        '<h2>Overview</h2><p>This innovative platform uses blockchain technology to create an immutable record of product journey through the supply chain. From raw materials to finished products, every step is recorded and verifiable.</p><h2>Key Features</h2><ul><li>Immutable product tracking</li><li>Smart contract automation</li><li>QR code integration</li><li>Real-time supply chain visibility</li><li>Authenticity verification</li></ul><h2>Impact</h2><p>The system helps brands build consumer trust by providing complete transparency in their supply chain operations, reducing counterfeit products and improving sustainability tracking.</p>',
        'published',
        now() - interval '15 days',
        admin_user_id
    );

    -- Insert job postings with correct type values
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
        'permanent',
        'Join our growing engineering team to build cutting-edge web applications that serve thousands of users worldwide. You''ll work on challenging problems involving scalable architecture, real-time systems, and modern web technologies.',
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
            'Bachelor''s degree in Computer Science or equivalent experience'
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
    ),
    (
        'product-designer',
        'Senior Product Designer',
        'Design',
        'New York / Remote',
        'Hybrid',
        'permanent',
        'We''re looking for a creative and strategic Product Designer to join our design team. You''ll be responsible for creating intuitive user experiences that delight our customers and drive business growth.',
        ARRAY[
            'Lead end-to-end design process from research to final implementation',
            'Create wireframes, prototypes, and high-fidelity designs using Figma',
            'Conduct user research and usability testing to inform design decisions',
            'Collaborate closely with product managers and engineers',
            'Maintain and evolve our design system and component library',
            'Present design concepts and rationale to stakeholders'
        ],
        ARRAY[
            '4+ years of product design experience in tech companies',
            'Portfolio demonstrating strong visual design and UX skills',
            'Proficiency in Figma, Adobe Creative Suite, and prototyping tools',
            'Experience with user research methodologies and data-driven design',
            'Understanding of front-end development constraints and possibilities',
            'Excellent presentation and communication skills'
        ],
        ARRAY[
            'Competitive salary range: $100,000 - $140,000',
            'Comprehensive benefits package including health insurance',
            'Remote work flexibility with co-working space stipend',
            'Latest design tools and equipment provided',
            'Conference attendance and professional development support',
            'Creative and collaborative work environment'
        ],
        'https://apply.devmart.sr/product-designer',
        'careers@devmart.sr',
        'open',
        now() - interval '12 days',
        admin_user_id
    );

    RAISE NOTICE 'Successfully inserted seed data for case studies, lab projects, and jobs';
END $$;