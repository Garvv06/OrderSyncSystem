-- Update admins table to work with Supabase Auth
-- This migration adds user_id column if it doesn't exist

-- Add user_id column to link with Supabase Auth users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN user_id UUID;
    CREATE INDEX idx_admins_user_id ON public.admins(user_id);
  END IF;
END $$;

-- Remove the password column as Supabase Auth handles authentication
-- Only do this if you're fully migrated to Supabase Auth
-- ALTER TABLE public.admins DROP COLUMN IF EXISTS password;

-- Note: For backwards compatibility during migration, we keep the password column
-- but it won't be used when Supabase Auth is properly configured
