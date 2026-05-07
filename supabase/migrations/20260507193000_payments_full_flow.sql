CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL DEFAULT 'nowpayments',
  status text NOT NULL DEFAULT 'payment_pending',
  provider_invoice_id text,
  provider_payment_id text,
  payment_url text,
  price_amount numeric,
  price_currency text,
  pay_amount numeric,
  pay_currency text,
  actually_paid numeric,
  pay_address text,
  tx_hash text,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS settlement_reference text,
  ADD COLUMN IF NOT EXISTS settlement_notes text,
  ADD COLUMN IF NOT EXISTS processing_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_key
  ON public.invoices(invoice_number)
  WHERE invoice_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_provider_key
  ON public.payments(invoice_id, provider);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_payment_id_key
  ON public.payments(provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric,
  description text,
  status text DEFAULT 'completed',
  method text,
  created_at timestamp with time zone DEFAULT now()
);

DROP POLICY IF EXISTS "payments_select" ON public.payments;
CREATE POLICY "payments_select"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_insert"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "payments_update" ON public.payments;
CREATE POLICY "payments_update"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
CREATE POLICY "invoices_select"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

CREATE OR REPLACE VIEW public.transaction_logs AS
  SELECT * FROM public.transactions;

CREATE OR REPLACE VIEW public.admin_actions AS
  SELECT * FROM public.admin_logs;
