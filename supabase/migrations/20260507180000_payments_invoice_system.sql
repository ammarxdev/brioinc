-- Migration: Payments & Invoice Management System Tables & Policies
-- Created: 2026-05-07

-- 1. Alter Invoices Table
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text, -- Encrypted at application level (AES-256-GCM)
  ADD COLUMN IF NOT EXISTS bank_country text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS nowpayment_pay_address text,
  ADD COLUMN IF NOT EXISTS nowpayment_pay_currency text,
  ADD COLUMN IF NOT EXISTS crypto_amount numeric,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Ensure invoices status covers all states (Pending, Payment Pending, Paid, Processing, Completed, Rejected)
-- (No special type constraints to keep updates highly extensible)

-- 2. Create Saved Bank Details Table
CREATE TABLE IF NOT EXISTS public.bank_details (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number_encrypted text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create Webhook Events Log Table (for Deduplication / Replay attack protection)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id text UNIQUE NOT NULL, -- NowPayments payment_id or unique callback reference
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'processed',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create Administrative Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details text,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Create Email Notifications Log Table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient text NOT NULL,
  subject text NOT NULL,
  action text NOT NULL,
  status text NOT NULL, -- 'sent' / 'failed'
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Configure Row-Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- ** Invoices RLS Policies **
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
CREATE POLICY "invoices_select"
  ON public.invoices
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_admin()
    OR true -- Allow public read of invoice by UUID so third-party clients can view and pay!
  );

DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
CREATE POLICY "invoices_insert"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
CREATE POLICY "invoices_update"
  ON public.invoices
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;
CREATE POLICY "invoices_delete"
  ON public.invoices
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- ** Bank Details RLS Policies **
DROP POLICY IF EXISTS "bank_details_select" ON public.bank_details;
CREATE POLICY "bank_details_select"
  ON public.bank_details
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "bank_details_insert" ON public.bank_details;
CREATE POLICY "bank_details_insert"
  ON public.bank_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "bank_details_update" ON public.bank_details;
CREATE POLICY "bank_details_update"
  ON public.bank_details
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "bank_details_delete" ON public.bank_details;
CREATE POLICY "bank_details_delete"
  ON public.bank_details
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- ** Webhook Events RLS Policies **
DROP POLICY IF EXISTS "webhook_events_admin_select" ON public.webhook_events;
CREATE POLICY "webhook_events_admin_select"
  ON public.webhook_events
  FOR SELECT
  USING (
    public.is_admin()
  );

-- ** Admin Logs RLS Policies **
DROP POLICY IF EXISTS "admin_logs_select" ON public.admin_logs;
CREATE POLICY "admin_logs_select"
  ON public.admin_logs
  FOR SELECT
  USING (
    public.is_admin()
  );

-- ** Email Logs RLS Policies **
DROP POLICY IF EXISTS "email_logs_select" ON public.email_logs;
CREATE POLICY "email_logs_select"
  ON public.email_logs
  FOR SELECT
  USING (
    public.is_admin()
  );
