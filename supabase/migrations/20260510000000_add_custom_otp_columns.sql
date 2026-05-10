-- Add custom OTP columns to the users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS kyc_otp text,
  ADD COLUMN IF NOT EXISTS kyc_otp_expires_at timestamp with time zone;
