-- Create proposal management tables

-- Proposal templates for reusable content
CREATE TABLE public.proposal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich text content with variable placeholders
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable definitions
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual proposals created from templates
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.proposal_templates(id),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL, -- Rendered content with variables filled
  quote_id UUID REFERENCES public.quotes(id), -- Link to original quote if applicable
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  total_amount INTEGER, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recipients of proposals
CREATE TABLE public.proposal_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'primary', -- primary, cc, approver
  token TEXT NOT NULL UNIQUE, -- Signed token for action links
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity tracking for proposals
CREATE TABLE public.proposal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- created, sent, viewed, accepted, rejected, expired
  user_email TEXT, -- For external actions
  user_id UUID REFERENCES auth.users(id), -- For internal actions
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposal_templates
CREATE POLICY "Admins can manage all proposal templates" 
ON public.proposal_templates 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Editors can view and create proposal templates" 
ON public.proposal_templates 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'editor']));

CREATE POLICY "Editors can create proposal templates" 
ON public.proposal_templates 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin', 'editor']));

CREATE POLICY "Editors can update their own templates" 
ON public.proposal_templates 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin', 'editor']) AND created_by = auth.uid());

-- RLS Policies for proposals
CREATE POLICY "Admins can manage all proposals" 
ON public.proposals 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Editors can view and create proposals" 
ON public.proposals 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'editor']));

CREATE POLICY "Editors can create proposals" 
ON public.proposals 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin', 'editor']));

CREATE POLICY "Editors can update their own proposals" 
ON public.proposals 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin', 'editor']) AND created_by = auth.uid());

-- RLS Policies for proposal_recipients
CREATE POLICY "Admins can manage all proposal recipients" 
ON public.proposal_recipients 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Editors can view and manage recipients for their proposals" 
ON public.proposal_recipients 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin', 'editor']) AND 
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_recipients.proposal_id 
    AND proposals.created_by = auth.uid()
  )
);

-- RLS Policies for proposal_events
CREATE POLICY "Admins can view all proposal events" 
ON public.proposal_events 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Editors can view events for their proposals" 
ON public.proposal_events 
FOR SELECT 
USING (
  get_current_user_role() = ANY (ARRAY['admin', 'editor']) AND 
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_events.proposal_id 
    AND proposals.created_by = auth.uid()
  )
);

CREATE POLICY "Service role can insert proposal events" 
ON public.proposal_events 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_quote_id ON public.proposals(quote_id);
CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX idx_proposal_recipients_proposal_id ON public.proposal_recipients(proposal_id);
CREATE INDEX idx_proposal_recipients_token ON public.proposal_recipients(token);
CREATE INDEX idx_proposal_events_proposal_id ON public.proposal_events(proposal_id);
CREATE INDEX idx_proposal_events_created_at ON public.proposal_events(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON public.proposal_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate secure proposal tokens
CREATE OR REPLACE FUNCTION public.generate_proposal_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random 32-character token
  token := encode(gen_random_bytes(24), 'base64');
  -- Remove URL-unsafe characters
  token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;