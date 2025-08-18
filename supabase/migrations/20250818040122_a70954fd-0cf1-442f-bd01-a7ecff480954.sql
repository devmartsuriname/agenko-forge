-- Create quotes table for managing quote requests
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  service_type TEXT NOT NULL,
  project_scope TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  timeline TEXT NOT NULL,
  additional_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, quoted, accepted, rejected
  priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estimated_cost INTEGER, -- in cents
  quote_expires_at TIMESTAMPTZ,
  quoted_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "Users can view their own quotes" ON public.quotes
  FOR SELECT
  USING (user_id = auth.uid() OR (user_id IS NULL AND email = auth.email()));

CREATE POLICY "Admins can view all quotes" ON public.quotes
  FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Service role can insert quotes" ON public.quotes
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can update quotes" ON public.quotes
  FOR UPDATE
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Service role can update quotes" ON public.quotes
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_email ON public.quotes(email);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_priority ON public.quotes(priority);
CREATE INDEX idx_quotes_service_type ON public.quotes(service_type);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX idx_quotes_assigned_to ON public.quotes(assigned_to);

-- Create updated_at trigger for quotes
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create quote_activities table for tracking changes
CREATE TABLE public.quote_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL, -- created, status_changed, note_added, assigned, quoted
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for quote activities
ALTER TABLE public.quote_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy for quote activities
CREATE POLICY "Admins can view all quote activities" ON public.quote_activities
  FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Service role can insert quote activities" ON public.quote_activities
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Index for quote activities
CREATE INDEX idx_quote_activities_quote_id ON public.quote_activities(quote_id);
CREATE INDEX idx_quote_activities_created_at ON public.quote_activities(created_at DESC);