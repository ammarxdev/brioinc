-- Create the kyc bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc', 'kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the kyc bucket
CREATE POLICY "Allow authenticated users to upload to kyc bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to read their own kyc uploads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Note: We might also want a policy to allow the service role (admin) to read the KYC documents.
-- But the service role bypasses RLS anyway, so we don't strictly need it.