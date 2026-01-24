-- MFOI Admin System - Common Admin Tasks
-- Use these SQL commands in Supabase SQL Editor for common tasks

-- ============================================
-- VIEW ALL ADMINS
-- ============================================

SELECT 
  a.email,
  a.name,
  a.role,
  a.approved,
  a.created_at,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM public.admins a
LEFT JOIN auth.users u ON a.user_id = u.id
ORDER BY a.created_at DESC;

-- ============================================
-- APPROVE PENDING ADMIN
-- ============================================

-- Approve a specific admin by email
UPDATE public.admins 
SET approved = true 
WHERE email = 'user@example.com';  -- Change this email

-- View all pending admins
SELECT email, name, created_at
FROM public.admins
WHERE approved = false
ORDER BY created_at DESC;

-- ============================================
-- CREATE NEW ADMIN
-- ============================================

-- Option 1: Create admin with Supabase Auth (RECOMMENDED)
DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'newadmin@example.com';  -- Change this
  user_password TEXT := 'ChangeMe123!';       -- Change this
  user_name TEXT := 'New Admin';              -- Change this
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', user_name),
    NOW(),
    NOW()
  ) RETURNING id INTO new_user_id;

  -- Create admin record
  INSERT INTO public.admins (user_id, email, name, role, approved)
  VALUES (new_user_id, user_email, user_name, 'admin', true);

  RAISE NOTICE 'Admin created successfully: %', user_email;
END $$;

-- ============================================
-- RESET ADMIN PASSWORD
-- ============================================

-- Reset password for an existing admin
UPDATE auth.users
SET 
  encrypted_password = crypt('NewPassword123!', gen_salt('bf')),  -- Change this
  updated_at = NOW()
WHERE email = 'admin@example.com';  -- Change this

-- ============================================
-- DELETE ADMIN
-- ============================================

-- Delete admin and their auth user (CASCADE will delete admin record)
DELETE FROM auth.users
WHERE email = 'admin@example.com';  -- Change this

-- Or delete just the admin record (keeps auth user)
DELETE FROM public.admins
WHERE email = 'admin@example.com';  -- Change this

-- ============================================
-- CHANGE ADMIN ROLE
-- ============================================

-- Promote admin to superadmin
UPDATE public.admins
SET role = 'superadmin'
WHERE email = 'admin@example.com';  -- Change this

-- Demote superadmin to admin
UPDATE public.admins
SET role = 'admin'
WHERE email = 'superadmin@example.com';  -- Change this

-- ============================================
-- VIEW DATABASE STATISTICS
-- ============================================

SELECT 'Total Admins' as metric, COUNT(*) as count FROM public.admins
UNION ALL
SELECT 'Approved Admins', COUNT(*) FROM public.admins WHERE approved = true
UNION ALL
SELECT 'Pending Admins', COUNT(*) FROM public.admins WHERE approved = false
UNION ALL
SELECT 'Total Items', COUNT(*) FROM public.items
UNION ALL
SELECT 'Total Orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'Open Orders', COUNT(*) FROM public.orders WHERE status = 'Open'
UNION ALL
SELECT 'Completed Orders', COUNT(*) FROM public.orders WHERE status = 'Completed';

-- ============================================
-- VIEW RECENT ACTIVITY
-- ============================================

-- Recent orders
SELECT 
  order_no,
  party_name,
  total,
  status,
  order_type,
  created_by_name,
  created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;

-- Recent logins
SELECT 
  a.name,
  a.email,
  u.last_sign_in_at
FROM public.admins a
JOIN auth.users u ON a.user_id = u.id
WHERE u.last_sign_in_at IS NOT NULL
ORDER BY u.last_sign_in_at DESC
LIMIT 10;

-- ============================================
-- CLEANUP ORPHANED RECORDS
-- ============================================

-- Find admins without auth users
SELECT a.email, a.name
FROM public.admins a
LEFT JOIN auth.users u ON a.user_id = u.id
WHERE u.id IS NULL;

-- Delete admins without auth users (cleanup)
DELETE FROM public.admins
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ============================================
-- BACKUP DATA
-- ============================================

-- Export all admins (copy results and save as JSON)
SELECT jsonb_pretty(jsonb_agg(row_to_json(a.*)))
FROM public.admins a;

-- Export all items (copy results and save as JSON)
SELECT jsonb_pretty(jsonb_agg(row_to_json(i.*)))
FROM public.items i;

-- Export all orders (copy results and save as JSON)
SELECT jsonb_pretty(jsonb_agg(row_to_json(o.*)))
FROM public.orders o;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('admins', 'items', 'orders');

-- View RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';

-- Check user permissions
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('admins', 'items', 'orders')
ORDER BY table_name, grantee;

-- ============================================
-- RESET EVERYTHING (DANGEROUS!)
-- ============================================

-- ⚠️ WARNING: This deletes ALL data!
-- Only use this if you want to start completely fresh

-- Uncomment the lines below to use:
/*
TRUNCATE auth.users CASCADE;
TRUNCATE public.admins CASCADE;
TRUNCATE public.items CASCADE;
TRUNCATE public.orders CASCADE;

-- Then re-run the setup from supabase-schema-updated.sql
*/
