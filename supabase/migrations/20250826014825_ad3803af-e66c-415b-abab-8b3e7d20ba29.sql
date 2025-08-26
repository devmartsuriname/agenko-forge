-- Add status column to proposal_templates table for better status management
ALTER TABLE proposal_templates ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'));

-- Update existing records to use the new status column
UPDATE proposal_templates SET status = CASE 
  WHEN is_active = true THEN 'active'
  ELSE 'draft'
END;

-- Add service_type column to proposal_templates for better categorization  
ALTER TABLE proposal_templates ADD COLUMN service_type text;

-- Create index for better filtering performance
CREATE INDEX idx_proposal_templates_status ON proposal_templates(status);
CREATE INDEX idx_proposal_templates_service_type ON proposal_templates(service_type);