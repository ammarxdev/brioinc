ALTER TABLE public.users
  ALTER COLUMN status SET DEFAULT 'kyc_required';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, status, role, is_verified)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    'kyc_required',
    'user',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE public.users u
SET status = 'kyc_required'
WHERE u.status = 'pending'
  AND COALESCE(u.is_verified, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.kyc_submissions k
    WHERE k.user_id = u.id
      AND k.is_current = true
  );
