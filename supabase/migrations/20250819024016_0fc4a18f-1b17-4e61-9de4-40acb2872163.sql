-- Seed proposal templates for Phase 7
INSERT INTO public.proposal_templates (name, subject, content, variables, is_active, created_by) VALUES
(
  'Website Build - Basic Package',
  'Website Development Proposal - {{client_name}}',
  '<h2>Website Development Proposal</h2>
  <p>Dear {{client_name}},</p>
  <p>Thank you for considering our website development services. We are excited to present this proposal for your {{project_scope}} project.</p>
  
  <h3>Project Overview</h3>
  <p>We will create a modern, responsive website that meets your business objectives and provides an excellent user experience across all devices.</p>
  
  <h3>Scope of Work</h3>
  <ul>
    <li>Custom responsive design</li>
    <li>Up to 5 pages of content</li>
    <li>Contact form integration</li>
    <li>SEO optimization</li>
    <li>Mobile-friendly design</li>
    <li>Basic analytics setup</li>
  </ul>
  
  <h3>Timeline</h3>
  <p>Estimated completion: 2-3 weeks from project start</p>
  
  <h3>Investment</h3>
  <p>Total project cost: {{total_amount}}</p>
  
  <h3>Next Steps</h3>
  <p>If you would like to proceed, please accept this proposal by {{expires_at}}. We look forward to working with you!</p>
  
  <p>Best regards,<br>{{sender_name}}</p>',
  '[
    {"name": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"name": "project_scope", "label": "Project Scope", "type": "text", "default_value": "business website"},
    {"name": "total_amount", "label": "Total Amount", "type": "currency", "required": true},
    {"name": "expires_at", "label": "Expires At", "type": "date"},
    {"name": "sender_name", "label": "Sender Name", "type": "text", "default_value": "The Development Team"}
  ]'::jsonb,
  true,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
),
(
  'Website Build - Professional Package',
  'Professional Website Development Proposal - {{client_name}}',
  '<h2>Professional Website Development Proposal</h2>
  <p>Dear {{client_name}},</p>
  <p>We are pleased to present this comprehensive proposal for your {{project_scope}} project.</p>
  
  <h3>Professional Package Includes</h3>
  <ul>
    <li>Custom responsive design with advanced animations</li>
    <li>Up to 10 pages of content</li>
    <li>E-commerce integration (if required)</li>
    <li>Advanced SEO optimization</li>
    <li>Performance optimization</li>
    <li>Social media integration</li>
    <li>Newsletter signup</li>
    <li>Advanced analytics and tracking</li>
    <li>Content management system</li>
    <li>Security features</li>
  </ul>
  
  <h3>Timeline</h3>
  <p>Estimated completion: 4-6 weeks from project start</p>
  
  <h3>Investment</h3>
  <p>Total project cost: {{total_amount}}</p>
  <p>Payment terms: 50% upfront, 50% on completion</p>
  
  <p>Best regards,<br>{{sender_name}}</p>',
  '[
    {"name": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"name": "project_scope", "label": "Project Scope", "type": "text", "default_value": "professional website"},
    {"name": "total_amount", "label": "Total Amount", "type": "currency", "required": true},
    {"name": "expires_at", "label": "Expires At", "type": "date"},
    {"name": "sender_name", "label": "Sender Name", "type": "text", "default_value": "The Development Team"}
  ]'::jsonb,
  true,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
),
(
  'Branding & Identity Package',
  'Brand Identity Development Proposal - {{client_name}}',
  '<h2>Brand Identity Development Proposal</h2>
  <p>Dear {{client_name}},</p>
  <p>We are excited to help develop a compelling brand identity for {{client_company}}.</p>
  
  <h3>Branding Package Includes</h3>
  <ul>
    <li>Brand strategy and positioning</li>
    <li>Logo design (3 concepts + revisions)</li>
    <li>Color palette development</li>
    <li>Typography selection</li>
    <li>Brand guidelines document</li>
    <li>Business card design</li>
    <li>Letterhead design</li>
    <li>Social media assets</li>
  </ul>
  
  <h3>Process</h3>
  <ol>
    <li>Discovery workshop (1 week)</li>
    <li>Concept development (2 weeks)</li>
    <li>Refinement and finalization (1 week)</li>
  </ol>
  
  <h3>Investment</h3>
  <p>Total project cost: {{total_amount}}</p>
  
  <p>Best regards,<br>{{sender_name}}</p>',
  '[
    {"name": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"name": "client_company", "label": "Client Company", "type": "text"},
    {"name": "total_amount", "label": "Total Amount", "type": "currency", "required": true},
    {"name": "expires_at", "label": "Expires At", "type": "date"},
    {"name": "sender_name", "label": "Sender Name", "type": "text", "default_value": "The Design Team"}
  ]'::jsonb,
  true,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
),
(
  'Intelligent Architecture Consultation',
  'Architecture Consultation Proposal - {{client_name}}',
  '<h2>Intelligent Architecture Consultation</h2>
  <p>Dear {{client_name}},</p>
  <p>We propose a comprehensive architecture review and optimization plan for your {{project_scope}}.</p>
  
  <h3>Consultation Includes</h3>
  <ul>
    <li>Current system architecture audit</li>
    <li>Performance bottleneck analysis</li>
    <li>Scalability assessment</li>
    <li>Security review</li>
    <li>Technology stack recommendations</li>
    <li>Migration strategy (if applicable)</li>
    <li>Implementation roadmap</li>
    <li>Documentation and diagrams</li>
  </ul>
  
  <h3>Deliverables</h3>
  <ul>
    <li>Architecture assessment report</li>
    <li>Recommended improvements</li>
    <li>Implementation timeline</li>
    <li>Cost-benefit analysis</li>
  </ul>
  
  <h3>Timeline</h3>
  <p>Estimated completion: 2-3 weeks</p>
  
  <h3>Investment</h3>
  <p>Total consultation cost: {{total_amount}}</p>
  
  <p>Best regards,<br>{{sender_name}}</p>',
  '[
    {"name": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"name": "project_scope", "label": "Project Scope", "type": "text", "default_value": "technical infrastructure"},
    {"name": "total_amount", "label": "Total Amount", "type": "currency", "required": true},
    {"name": "expires_at", "label": "Expires At", "type": "date"},
    {"name": "sender_name", "label": "Sender Name", "type": "text", "default_value": "The Architecture Team"}
  ]'::jsonb,
  true,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
),
(
  'Business Consulting & Support',
  'Business Consulting Proposal - {{client_name}}',
  '<h2>Business Consulting & Support Services</h2>
  <p>Dear {{client_name}},</p>
  <p>We are pleased to offer our business consulting services to help {{client_company}} achieve its strategic objectives.</p>
  
  <h3>Consulting Services Include</h3>
  <ul>
    <li>Business process optimization</li>
    <li>Digital transformation strategy</li>
    <li>Market analysis and research</li>
    <li>Competitive analysis</li>
    <li>Growth strategy development</li>
    <li>Operational efficiency improvements</li>
    <li>Technology integration planning</li>
    <li>Staff training and development</li>
  </ul>
  
  <h3>Support Package</h3>
  <ul>
    <li>Monthly strategy sessions</li>
    <li>Quarterly business reviews</li>
    <li>On-demand consultation hours</li>
    <li>Implementation support</li>
  </ul>
  
  <h3>Investment</h3>
  <p>Total engagement cost: {{total_amount}}</p>
  <p>Duration: 6-month initial engagement</p>
  
  <p>Best regards,<br>{{sender_name}}</p>',
  '[
    {"name": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"name": "client_company", "label": "Client Company", "type": "text"},
    {"name": "total_amount", "label": "Total Amount", "type": "currency", "required": true},
    {"name": "expires_at", "label": "Expires At", "type": "date"},
    {"name": "sender_name", "label": "Sender Name", "type": "text", "default_value": "The Consulting Team"}
  ]'::jsonb,
  true,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT DO NOTHING;