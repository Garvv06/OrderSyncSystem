-- ============================================
-- SECURITY FIX: Remove password column from admins table
-- ============================================
-- Passwords are now ONLY managed by Supabase Auth (securely hashed)
-- This migration removes the insecure plaintext password storage

-- Step 1: Remove the password column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE public.admins DROP COLUMN password;
    RAISE NOTICE 'Password column removed successfully';
  ELSE
    RAISE NOTICE 'Password column does not exist, skipping';
  END IF;
END $$;

-- Step 2: Verify the schema is correct
COMMENT ON TABLE public.admins IS 'Admin users table - passwords managed by Supabase Auth, NOT stored here';
