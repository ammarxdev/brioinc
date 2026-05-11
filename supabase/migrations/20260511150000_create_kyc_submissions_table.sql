-- Create kyc_submissions table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    cnic_front_path text NOT NULL,
    cnic_back_path text NOT NULL,
    selfie_path text,
    is_current boolean DEFAULT true,
    rejection_reason text,
    submitted_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for users to view their own submissions
CREATE POLICY "Users can view their own kyc submissions"
ON public.kyc_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for admins to view all submissions
CREATE POLICY "Admins can view all kyc submissions"
ON public.kyc_submissions FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy for admins to update submissions (e.g. approve/reject)
CREATE POLICY "Admins can update kyc submissions"
ON public.kyc_submissions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Index for performance
CREATE INDEX IF NOT EXISTS kyc_submissions_user_id_idx ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS kyc_submissions_is_current_idx ON public.kyc_submissions(is_current);
