# 🔐 Authentication Setup Guide - MFOI Admin System

## Problem Summary

Your system was experiencing authentication failures and Vercel 404 errors due to:

1. ❌ Missing `index.html` entry point for Vite
2. ❌ Missing `main.tsx` React entry file
3. ❌ Incomplete Supabase Auth configuration
4. ❌ Missing Vercel SPA routing configuration

## ✅ Fixes Applied

### 1. Created Required Files

- ✅ `/index.html` - Main entry point for Vite
- ✅ `/src/main.tsx` - React application bootstrap
- ✅ `/vercel.json` - SPA routing configuration for Vercel
- ✅ `/supabase/migrations/002_update_schema_for_auth.sql` - Database migration for Supabase Auth

### 2. Fixed Authentication Flow

Updated the Login component to:
- ✅ Show clear error messages when Supabase is not configured
- ✅ Properly handle Supabase Auth responses
- ✅ Log errors to browser console for debugging
- ✅ Map database admin records to app's Admin type correctly

## 🚀 Setup Instructions

### Step 1: Configure Supabase

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready (2-3 minutes)

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your `Project URL`
   - Copy your `anon public` key

3. **Set Environment Variables**

   For local development, create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   For Vercel deployment:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` = your project URL
   - Add `VITE_SUPABASE_ANON_KEY` = your anon key

4. **Run Database Migrations**

   In your Supabase project:
   - Go to SQL Editor
   - Run the SQL from `/supabase-schema.sql`
   - Then run the SQL from `/supabase/migrations/002_update_schema_for_auth.sql`

5. **Configure Supabase Auth Settings**

   In your Supabase project:
   - Go to Authentication → Settings
   - **Disable** "Confirm email" (for quick testing)
   - Under "Email Auth":
     - Enable "Enable email provider"
   - Click Save

### Step 2: Create First Admin User

You have two options:

#### Option A: Manual SQL Insert (Recommended for first admin)

In Supabase SQL Editor, run:

```sql
-- First, create the auth user
-- Note: Replace 'your-password-here' with a secure password
SELECT auth.users_create(
  'admin@fastener.com',
  'admin123'
);

-- Then, insert the admin record
-- Note: Replace the user_id with the actual ID from auth.users
INSERT INTO public.admins (user_id, email, name, role, approved)
SELECT 
  id,
  'admin@fastener.com',
  'Super Admin',
  'superadmin',
  true
FROM auth.users
WHERE email = 'admin@fastener.com'
ON CONFLICT (email) DO NOTHING;
```

#### Option B: Use the Registration Form

1. Start your application
2. Click "Need access? Request here"
3. Enter your name, email, and password
4. After registration, manually approve yourself in Supabase:

```sql
UPDATE public.admins 
SET approved = true 
WHERE email = 'your-email@example.com';
```

### Step 3: Test Authentication

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the application in your browser**

3. **Try logging in:**
   - Email: `admin@fastener.com`
   - Password: `admin123` (or whatever you set)

4. **Check for errors:**
   - Open browser console (F12)
   - Look for any red error messages
   - All authentication errors are logged with details

### Step 4: Deploy to Vercel

1. **Push your changes to Git:**
   ```bash
   git add .
   git commit -m "Fix authentication and add entry point files"
   git push
   ```

2. **Deploy to Vercel:**
   - Vercel should auto-deploy when you push to your main branch
   - Make sure environment variables are set in Vercel dashboard

3. **Test the deployed app:**
   - Visit your Vercel URL
   - Try logging in
   - The 404 error should be fixed now

## 🔍 Troubleshooting

### Error: "Supabase is not configured"

**Solution:** Make sure you've set the environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

For Vite to pick up new env variables, restart your dev server.

### Error: "Invalid login credentials"

**Possible causes:**
1. User doesn't exist in Supabase Auth
2. Wrong password
3. Email confirmation is enabled but email not confirmed

**Solution:**
- Check if user exists in Supabase → Authentication → Users
- Try creating user via SQL as shown in Step 2
- Disable email confirmation in Supabase Auth settings

### Error: "Admin record not found"

**Possible causes:**
1. User exists in `auth.users` but not in `public.admins` table

**Solution:**
```sql
-- Insert admin record for existing auth user
INSERT INTO public.admins (user_id, email, name, role, approved)
SELECT 
  id,
  email,
  'Admin User',  -- Change this
  'admin',
  true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (email) DO NOTHING;
```

### Error: "Your account is pending approval"

**Solution:**
```sql
-- Approve the admin
UPDATE public.admins 
SET approved = true 
WHERE email = 'your-email@example.com';
```

### Vercel 404 Error

**Possible causes:**
1. Missing `vercel.json` file
2. Wrong build configuration

**Solution:**
- Make sure `/vercel.json` exists with the SPA rewrite rule
- Rebuild and redeploy

### Build Errors on Vercel

**Possible causes:**
1. Missing dependencies
2. TypeScript errors

**Solution:**
```bash
# Test the build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## 📝 Important Notes

1. **Password Storage:** 
   - Supabase Auth handles password hashing automatically
   - Never store plain text passwords
   - The `password` field in the `admins` table is now unused when Supabase Auth is configured

2. **User Management:**
   - All users must exist in both `auth.users` (managed by Supabase Auth) AND `public.admins` (your app table)
   - The `user_id` column links the two tables

3. **Security:**
   - Row Level Security (RLS) is enabled on all tables
   - Current policies allow all authenticated access (admin-only system)
   - Consider restricting policies if you add non-admin users later

4. **Email Confirmation:**
   - Currently disabled for easier setup
   - Enable it later for production security
   - You'll need to configure email templates in Supabase

## 🎯 Next Steps

1. ✅ Set up Supabase project and environment variables
2. ✅ Run database migrations
3. ✅ Create first admin user
4. ✅ Test login locally
5. ✅ Deploy to Vercel
6. ✅ Test deployed application
7. 🔒 Change default admin password
8. 🔒 Enable email confirmation (optional)
9. 🔒 Review and tighten RLS policies (optional)

## 📞 Still Having Issues?

Check the browser console for detailed error messages. All authentication errors are logged with full context.

Common things to verify:
- [ ] Environment variables are set correctly
- [ ] Supabase project is active and running
- [ ] Database migrations have been run
- [ ] Email confirmation is disabled in Supabase Auth
- [ ] Admin user exists in both `auth.users` and `public.admins`
- [ ] Admin user has `approved = true`
