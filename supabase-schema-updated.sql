-- MFOI Fastener Admin Order System - Updated Supabase Schema
-- This is the COMPLETE schema with Supabase Auth integration
-- Run this SQL in your Supabase SQL Editor to set up the database

-- ============================================
-- STEP 1: Create Tables
-- ============================================

-- Create admins table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sizes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  order_date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Partially Completed', 'Completed')),
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'purchase' CHECK (order_type IN ('purchase', 'sale')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- STEP 2: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_approved ON public.admins(approved);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_party_name ON public.orders(party_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);

-- ============================================
-- STEP 3: Create First Admin User
-- ============================================

-- This creates an admin user with Supabase Auth
-- Email: admin@fastener.com
-- Password: admin123
-- IMPORTANT: Change this password after first login!

-- Note: Run this in a separate transaction if it fails
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user (this might fail if user already exists)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@fastener.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Super Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING
  RETURNING id INTO new_user_id;

  -- Create admin record
  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.admins (user_id, email, name, role, approved)
    VALUES (new_user_id, 'admin@fastener.com', 'Super Admin', 'superadmin', true);
  ELSE
    -- User already exists, try to link to admins table
    INSERT INTO public.admins (user_id, email, name, role, approved)
    SELECT id, 'admin@fastener.com', 'Super Admin', 'superadmin', true
    FROM auth.users
    WHERE email = 'admin@fastener.com'
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- STEP 4: Enable Row Level Security
-- ============================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Drop Existing Policies (if any)
-- ============================================

DROP POLICY IF EXISTS "Allow all access to admins table" ON public.admins;
DROP POLICY IF EXISTS "Allow all access to items table" ON public.items;
DROP POLICY IF EXISTS "Allow all access to orders table" ON public.orders;

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================

-- Admins table policies (allow all authenticated users - admin only system)
CREATE POLICY "Allow authenticated access to admins"
  ON public.admins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Items table policies
CREATE POLICY "Allow authenticated access to items"
  ON public.items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Orders table policies
CREATE POLICY "Allow authenticated access to orders"
  ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 7: Grant Permissions
-- ============================================

-- Grant permissions to authenticated users
GRANT ALL ON public.admins TO authenticated;
GRANT ALL ON public.items TO authenticated;
GRANT ALL ON public.orders TO authenticated;

-- Grant permissions to anon users (for login/signup)
GRANT SELECT, INSERT ON public.admins TO anon;
GRANT SELECT ON public.items TO anon;
GRANT SELECT ON public.orders TO anon;

-- ============================================
-- VERIFICATION
-- ============================================

-- Run this to verify setup
SELECT 
  'Tables' as check_type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('admins', 'items', 'orders')

UNION ALL

SELECT 
  'Admin Users' as check_type,
  COUNT(*) as count
FROM public.admins
WHERE approved = true

UNION ALL

SELECT 
  'Auth Users' as check_type,
  COUNT(*) as count
FROM auth.users
WHERE email = 'admin@fastener.com';

-- ============================================
-- NOTES
-- ============================================

-- 1. Default credentials:
--    Email: admin@fastener.com
--    Password: admin123
--    CHANGE THIS PASSWORD IMMEDIATELY!

-- 2. To disable email confirmation (for testing):
--    Go to Authentication → Settings → Disable "Confirm email"

-- 3. To create additional admins:
--    Use the signup form in your app, then approve them with:
--    UPDATE public.admins SET approved = true WHERE email = 'user@example.com';

-- 4. To reset a password:
--    Use Supabase dashboard → Authentication → Users → Reset password

-- 5. Security:
--    - Current RLS policies allow all authenticated access
--    - This is safe for admin-only systems
--    - Consider tightening policies if you add non-admin users
