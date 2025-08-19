-- Phase 7: Settings-driven Payments & Proposals with Templates (Fixed)
-- Restore point: Devmart-RP-P7-20241219

-- 1. Create proposal_attachments table
CREATE TABLE IF NOT EXISTS public.proposal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for proposal_attachments
ALTER TABLE public.proposal_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for proposal_attachments
CREATE POLICY "read_own_proposals_attachments" ON public.proposal_attachments
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.proposals p 
    WHERE p.id = proposal_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "admin_all_attachments" ON public.proposal_attachments 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "editors_manage_own_attachments" ON public.proposal_attachments
  FOR ALL
  USING (
    get_current_user_role() = ANY(ARRAY['admin', 'editor']) AND
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id AND p.created_by = auth.uid()
    )
  );

-- 2. Create safe app_config view (hides secrets from client)
CREATE OR REPLACE VIEW public.v_app_config_public AS
SELECT jsonb_build_object(
  'payments', 
  CASE 
    WHEN (SELECT value FROM public.app_config WHERE key = 'payments') IS NULL THEN '{}'::jsonb
    ELSE (SELECT value FROM public.app_config WHERE key = 'payments')::jsonb - 'stripe'::text 
         || jsonb_build_object('stripe', jsonb_build_object(
           'mode', COALESCE((SELECT value FROM public.app_config WHERE key = 'payments')->'stripe'->>'mode', 'test')
         ))
  END,
  'proposals',
  COALESCE((SELECT value FROM public.app_config WHERE key = 'proposals'), '{}'::jsonb)
) as config;

-- Grant access to the view
GRANT SELECT ON public.v_app_config_public TO authenticated;

-- 3. Create clients table for basic CRM
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "admins_all_clients" ON public.clients
  FOR ALL
  USING (get_current_user_role() = 'admin');

CREATE POLICY "editors_manage_clients" ON public.clients
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'editor']));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposal_attachments_proposal_id ON public.proposal_attachments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);

-- Add updated_at trigger for clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();