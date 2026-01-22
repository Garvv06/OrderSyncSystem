# Quick Security Fix for MFOI Admin System

## ⚡ 1-Hour Security Upgrade (No Backend Needed)

This guide helps you secure your current frontend-only system using Supabase Auth + RLS.

---

## Step 1: Enable Supabase Auth

### 1.1 Create Auth Users in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - Email: `admin@fastener.com`
   - Password: `admin123` (or your preferred password)
   - Auto Confirm User: ✅ **YES** (important!)
4. Click **"Create user"**
5. **Copy the User ID** (looks like: `550e8400-e29b-41d4-a716-446655440000`)

### 1.2 Link Auth Users to Admin Table

Go to SQL Editor and run:

```sql
-- Add user_id column to admins table
ALTER TABLE public.admins ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing admin with the User ID you copied
UPDATE public.admins 
SET user_id = 'PASTE_YOUR_USER_ID_HERE'
WHERE email = 'admin@fastener.com';

-- Make user_id required for future admins
ALTER TABLE public.admins ALTER COLUMN user_id SET NOT NULL;
```

---

## Step 2: Enable Row Level Security (RLS)

### 2.1 Enable RLS on All Tables

```sql
-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
```

### 2.2 Create RLS Policies

```sql
-- ============================================
-- ADMINS TABLE POLICIES
-- ============================================

-- Allow authenticated users to read all admins
CREATE POLICY "Authenticated users can read admins"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own admin record (for registration)
CREATE POLICY "Users can insert their own admin record"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own admin record
CREATE POLICY "Users can update their own admin record"
ON public.admins
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only superadmins can update other users
CREATE POLICY "Superadmins can update any admin"
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

-- Only superadmins can delete admins
CREATE POLICY "Superadmins can delete admins"
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
-- ITEMS TABLE POLICIES
-- ============================================

-- All authenticated users can read items
CREATE POLICY "Authenticated users can read items"
ON public.items
FOR SELECT
TO authenticated
USING (true);

-- Only approved admins can insert items
CREATE POLICY "Approved admins can insert items"
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
CREATE POLICY "Approved admins can update items"
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
CREATE POLICY "Approved admins can delete items"
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
-- ORDERS TABLE POLICIES
-- ============================================

-- All authenticated users can read orders
CREATE POLICY "Authenticated users can read orders"
ON public.orders
FOR SELECT
TO authenticated
USING (true);

-- Only approved admins can insert orders
CREATE POLICY "Approved admins can insert orders"
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
CREATE POLICY "Approved admins can update orders"
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
CREATE POLICY "Approved admins can delete orders"
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
```

---

## Step 3: Update Frontend Code

The frontend code needs to be updated to:
1. Use Supabase Auth for login (instead of custom password checking)
2. Store the auth session
3. Pass the auth token with all requests (automatic with Supabase client)

**Key changes needed in:**
- `Login.tsx` - Use `supabase.auth.signInWithPassword()`
- `UserManagement.tsx` - Create auth users when creating admins
- All components - Check auth status with `supabase.auth.getSession()`

---

## Step 4: Test Security

After implementing:

1. **Test Login**: Can you login with Supabase Auth?
2. **Test RLS**: Open browser console and try to access data without logging in
3. **Test Permissions**: Try to create/edit/delete as different role users
4. **Test Registration**: Can new users register and get auto-approved/pending correctly?

---

## 🔒 What This Achieves

✅ **Passwords hashed** - Supabase Auth handles secure password hashing
✅ **RLS enabled** - Database enforces access rules (even if frontend is hacked)
✅ **JWT tokens** - Proper authentication with automatic token refresh
✅ **Role-based access** - Superadmin vs Admin permissions enforced at DB level
✅ **Session management** - Auto logout on token expiry

---

## ⚠️ Limitations of Frontend-Only Approach

Even with RLS, you still have these risks:
- Users can see all queries in browser dev tools
- Client-side validation can be bypassed
- Rate limiting is harder (anyone can spam requests)
- Business logic can be reverse-engineered

**For production with sensitive data, you NEED a backend API (see OPTION 2 below)**

---

## 📝 Migration Checklist

- [ ] Create auth users in Supabase Dashboard
- [ ] Add user_id column to admins table
- [ ] Link existing admins to auth users
- [ ] Enable RLS on all tables
- [ ] Create all RLS policies
- [ ] Update frontend to use supabase.auth
- [ ] Test login/registration
- [ ] Test all CRUD operations
- [ ] Test role permissions
- [ ] Deploy updated code to Vercel
- [ ] Add new env vars if needed

---

## Next Step: Backend API

Once this is working, consider building a proper backend API (see `/BACKEND_API_GUIDE.md`)
