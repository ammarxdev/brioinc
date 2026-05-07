ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cnic_front_path text NOT NULL,
  cnic_back_path text NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  rejection_reason text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS kyc_submissions_one_current_per_user
  ON public.kyc_submissions(user_id)
  WHERE is_current;

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_submissions_select" ON public.kyc_submissions;
CREATE POLICY "kyc_submissions_select"
  ON public.kyc_submissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "kyc_submissions_insert" ON public.kyc_submissions;
CREATE POLICY "kyc_submissions_insert"
  ON public.kyc_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND is_current = true
    AND (string_to_array(cnic_front_path, '/'))[1] = auth.uid()::text
    AND (string_to_array(cnic_back_path, '/'))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_submissions_update_admin" ON public.kyc_submissions;
CREATE POLICY "kyc_submissions_update_admin"
  ON public.kyc_submissions
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc', 'kyc', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_objects_insert_own" ON storage.objects;
CREATE POLICY "kyc_objects_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc'
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_objects_select_own" ON storage.objects;
CREATE POLICY "kyc_objects_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc'
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_objects_select_admin" ON storage.objects;
CREATE POLICY "kyc_objects_select_admin"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "kyc_objects_delete_own" ON storage.objects;
CREATE POLICY "kyc_objects_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'kyc'
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );
