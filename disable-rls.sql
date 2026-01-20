-- IMPORTANT: Run this AFTER running supabase-schema.sql
-- This disables Row Level Security (RLS) for easier access
-- Since this is an admin-only system, we don't need RLS complexity

-- Disable RLS on all tables
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (should all return 'false')
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admins', 'items', 'orders');
