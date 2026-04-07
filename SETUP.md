# 🚀 Supabase Setup Guide

Quick guide to set up your Supabase backend for the MFOI Admin System.

---

## 📋 Prerequisites

- Supabase account ([Sign up free](https://supabase.com))
- Your project cloned and `.env` configured

---

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Name:** MFOI Admin System
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
4. Wait for project to initialize (~2 minutes)

---

## Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values to your `.env` file:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Step 3: Run Database Migrations

Go to **SQL Editor** in Supabase Dashboard and run these files **in order**:

### Migration 1: Initial Schema
Copy and run `/supabase/migrations/001_initial_schema.sql`

This creates:
- `admins` table
- `items` table
- `orders` table

### Migration 2: Auth Integration
Copy and run `/supabase/migrations/002_update_schema_for_auth.sql`

This adds:
- `user_id` column linking to auth.users
- Foreign key constraints

### Migration 3: Remove Password Column
Copy and run `/supabase/migrations/003_remove_password_column.sql`

This removes:
- Insecure password column (security fix)

### Migration 4: Security Policies
Copy and run `/supabase/migrations/004_secure_rls_policies.sql`

This enables:
- Row-Level Security (RLS)
- Access policies (only approved admins can access)

---

## Step 4: Create First Admin User

### 4a. Create Auth User

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** your-email@company.com
   - **Password:** (your secure password)
   - **Auto Confirm User:** ✅ Check this
4. Click **"Create user"**
5. **Copy the User ID** (UUID) - you'll need it next

### 4b. Create Admin Record

1. Go to **SQL Editor**
2. Run this query (replace values):

```sql
INSERT INTO admins (user_id, email, name, role, approved)
VALUES (
  'paste-user-id-from-step-4a',  -- The UUID you copied
  'your-email@company.com',       -- Same email as auth user
  'Your Name',                    -- Your display name
  'superadmin',                   -- Role: 'superadmin' or 'admin'
  true                            -- Must be true to login
);
```

---

## Step 5: Verify Setup

### 5a. Check Tables Exist

Run this query in SQL Editor:

```sql
SELECT 
  (SELECT COUNT(*) FROM admins) as admin_count,
  (SELECT COUNT(*) FROM items) as item_count,
  (SELECT COUNT(*) FROM orders) as order_count;
```

Expected result: `admin_count: 1, item_count: 0, order_count: 0`

### 5b. Check RLS Policies

Run this query:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

You should see multiple policies for each table.

### 5c. Test Login

1. Go to your deployed app (or `npm run dev`)
2. Login with your email and password
3. You should see the dashboard!

---

## 🔧 Troubleshooting

### Can't Login - "Invalid credentials"

**Check:**
1. Email/password correct?
2. User exists in **Authentication** → **Users**?
3. Admin record exists in database?
   ```sql
   SELECT * FROM admins WHERE email = 'your-email@company.com';
   ```

### Can't Login - "Pending approval"

**Fix:**
```sql
UPDATE admins 
SET approved = true 
WHERE email = 'your-email@company.com';
```

### Can't Login - "Failed to fetch admin data"

**Check:**
1. `user_id` in admins table matches auth user's `id`?
   ```sql
   SELECT a.email, a.user_id, u.id as auth_id
   FROM admins a
   LEFT JOIN auth.users u ON a.user_id = u.id
   WHERE a.email = 'your-email@company.com';
   ```
2. If `user_id` is NULL or doesn't match, update it:
   ```sql
   UPDATE admins 
   SET user_id = (SELECT id FROM auth.users WHERE email = 'your-email@company.com')
   WHERE email = 'your-email@company.com';
   ```

### Database Access Denied

**Check RLS is applied:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

If not, run migration 004 again.

### Environment Variables Not Working

**Vercel Deployment:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy the project

**Local Development:**
1. Check `.env` file exists in project root
2. Variables start with `VITE_` prefix
3. Restart dev server after changing `.env`

---

## 📧 Email Configuration (Optional)

For password reset emails:

1. Go to **Authentication** → **Email Templates**
2. Customize "Reset Password" template
3. Add your branding/logo
4. Configure SMTP (or use Supabase default)

---

## 🎯 Next Steps

Once setup is complete:

1. ✅ Login to your app
2. ✅ Add inventory items (Items page)
3. ✅ Create test orders
4. ✅ Invite more admins (they'll need approval)
5. ✅ Explore all features!

---

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)

---

## 🆘 Still Need Help?

1. Check Supabase logs: **Logs** → **Database** or **Auth**
2. Check browser console for errors
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for code structure
4. Check your `.env` variables are correct

---

**Setup Time:** ~10 minutes  
**Difficulty:** Beginner-friendly  
**Cost:** Free (Supabase free tier)
