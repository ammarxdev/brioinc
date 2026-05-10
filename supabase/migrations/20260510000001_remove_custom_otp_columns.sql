-- Remove custom OTP columns from the users table since we are now using Supabase native Auth OTP
ALTER TABLE public.users
DROP COLUMN IF EXISTS kyc_otp,
DROP COLUMN IF EXISTS kyc_otp_expires_at;
