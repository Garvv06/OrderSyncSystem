-- ============================================
-- SECURE RLS POLICIES - CRITICAL SECURITY FIX
-- ============================================
-- This replaces the insecure USING (true) policies with proper authentication

-- ============================================
-- STEP 1: Drop all existing policies
-- ============================================

DROP POLICY IF EXISTS "Allow all operations on admins" ON public.admins;
DROP POLICY IF EXISTS "Allow all operations on items" ON public.items;
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;
DROP POLICY IF EXISTS "authenticated_read_admins" ON public.admins;
DROP POLICY IF EXISTS "users_update_own_admin" ON public.admins;
DROP POLICY IF EXISTS "superadmin_insert_admins" ON public.admins;
DROP POLICY IF EXISTS "superadmin_delete_admins" ON public.admins;
DROP POLICY IF EXISTS "approved_admins_read_items" ON public.items;
DROP POLICY IF EXISTS "approved_admins_insert_items" ON public.items;
DROP POLICY IF EXISTS "approved_admins_update_items" ON public.items;
DROP POLICY IF EXISTS "approved_admins_delete_items" ON public.items;
DROP POLICY IF EXISTS "approved_admins_read_orders" ON public.orders;
DROP POLICY IF EXISTS "approved_admins_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "approved_admins_update_orders" ON public.orders;
DROP POLICY IF EXISTS "approved_admins_delete_orders" ON public.orders;

-- ============================================
-- STEP 2: Ensure RLS is enabled on all tables
-- ============================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: ADMINS TABLE POLICIES
-- ============================================

-- Allow authenticated users to read all admins (needed for approval workflow)
CREATE POLICY "authenticated_users_read_admins" 
  ON public.admins 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow users to insert their own admin record during signup (approved=false)
CREATE POLICY "users_insert_pending_admin" 
  ON public.admins 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = user_id 
    AND approved = false
  );

-- Allow users to update only their own record (name, email only - NOT role or approved status)
CREATE POLICY "users_update_own_profile" 
  ON public.admins 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND approved = (SELECT approved FROM public.admins WHERE user_id = auth.uid())
    AND role = (SELECT role FROM public.admins WHERE user_id = auth.uid())
  );

-- Allow superadmins to update any admin (for approval and role changes)
CREATE POLICY "superadmins_update_any_admin" 
  ON public.admins 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin' 
      AND approved = true
    )
  );

-- Allow superadmins to delete admins
CREATE POLICY "superadmins_delete_admins" 
  ON public.admins 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin' 
      AND approved = true
    )
  );

-- ============================================
-- STEP 4: ITEMS TABLE POLICIES
-- ============================================

-- Only approved admins can read items
CREATE POLICY "approved_admins_read_items" 
  ON public.items 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- Only approved admins can insert items
CREATE POLICY "approved_admins_insert_items" 
  ON public.items 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- Only approved admins can update items
CREATE POLICY "approved_admins_update_items" 
  ON public.items 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- Only approved admins can delete items
CREATE POLICY "approved_admins_delete_items" 
  ON public.items 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- ============================================
-- STEP 5: ORDERS TABLE POLICIES
-- ============================================

-- Only approved admins can read orders
CREATE POLICY "approved_admins_read_orders" 
  ON public.orders 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- Only approved admins can insert orders
CREATE POLICY "approved_admins_insert_orders" 
  ON public.orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- Only approved admins can update orders
CREATE POLICY "approved_admins_update_orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- Only approved admins can delete orders
CREATE POLICY "approved_admins_delete_orders" 
  ON public.orders 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid() 
      AND approved = true
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- List all policies to verify
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
