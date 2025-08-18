-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  provider TEXT NOT NULL, -- 'stripe' or 'bank_transfer'
  provider_order_id TEXT, -- Stripe session ID or bank reference
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, canceled, awaiting_verification
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments table (for tracking payment events/history)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  provider_data JSONB DEFAULT '{}',
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid() OR (user_id IS NULL AND email = auth.email()));

CREATE POLICY "Service role can insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update orders" ON public.orders
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE
  USING (get_current_user_role() = 'admin');

-- RLS Policies for payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Service role can insert payments" ON public.payments
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update payments" ON public.payments
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can update payments" ON public.payments
  FOR UPDATE
  USING (get_current_user_role() = 'admin');

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_provider ON public.orders(provider);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_provider ON public.payments(provider);

-- Create updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();