# MFOI Admin System - Deployment Guide

## 🚀 Quick Deploy to Vercel with Supabase

### Step 1: Setup Supabase (Cloud Database)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `mfoi-admin`
   - Enter a strong database password (save it!)
   - Select region closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for project setup

3. **Run Database Migration**
   - Go to "SQL Editor" in left sidebar
   - Click "New Query"
   - Copy ENTIRE contents from `/supabase-schema.sql` file
   - Paste into SQL editor
   - Click "Run" (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"

4. **🔴 CRITICAL: Disable RLS (Row Level Security)**
   
   **Option A - Run SQL Script (Recommended):**
   - Stay in SQL Editor
   - Click "New Query"
   - Copy ENTIRE contents from `/disable-rls.sql` file
   - Paste into SQL editor
   - Click "Run"
   - You should see a table showing all three tables with `rowsecurity = false`
   
   **Option B - Manual Disable:**
   - In SQL Editor, run this command:
   ```sql
   ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
   ```
   
   **⚠️ Without disabling RLS, new user registration will FAIL!**

5. **Get API Keys**
   - Go to "Project Settings" (gear icon in sidebar)
   - Click "API" tab
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (long string starting with `eyJ...`)

### Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Add Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add these TWO variables:
     
     **Variable 1:**
     - Name: `VITE_SUPABASE_URL`
     - Value: `https://xxxxx.supabase.co` (your Project URL)
     
     **Variable 2:**
     - Name: `VITE_SUPABASE_ANON_KEY`
     - Value: `eyJxxx...` (your anon public key)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Step 3: First Login

- **Default Login:**
  - Email: `admin@fastener.com`
  - Password: `admin123`

- **Change Credentials IMMEDIATELY:**
  1. Login with default credentials
  2. Go to "Profile" tab
  3. Click "Edit Profile"
  4. Change email and password
  5. Save (you'll be logged out)
  6. Login with new credentials

---

## 🔧 Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd mfoi-admin-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJxxx...
     ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   - Go to http://localhost:5173

---

## 📝 Important Notes

### Database Sync
- ✅ All data syncs across devices when Supabase is configured
- ✅ Multiple admins can work simultaneously
- ✅ Changes appear instantly on all devices

### CSV Export
- CSV files are downloaded with consistent names:
  - `MFOI_PURCHASE_Orders_Complete.csv`
  - `MFOI_SALE_Orders_Complete.csv`
- Each export contains ALL completed orders (sorted by order number)
- Browser may add (1), (2) etc. if file already exists
- Just keep the latest file

### Stock Management
- **Purchase Orders**: ADD to stock when completed
- **Sale Orders**: SUBTRACT from stock when completed
- Stock updates happen automatically on order completion

### User Roles
- **Super Admin**: Can change email/password, full access
- **Admin**: Can approve new admins, manage everything except changing credentials

### Item Management
- Add custom categories when creating items
- Edit sizes, stock, and size names for existing items
- Items grouped by category for easy management
- Must have at least 1 size per item

---

## 🔒 Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong passwords (minimum 6 characters)
- [ ] Keep Supabase credentials secret
- [ ] Don't commit `.env` file to Git
- [ ] Only add Supabase environment variables in Vercel dashboard

---

## 🆘 Troubleshooting

**"Cloud Sync" not showing?**
- Check environment variables in Vercel
- Make sure variable names are EXACTLY: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeploy after adding variables

**Can't login?**
- Default credentials: `admin@fastener.com` / `admin123`
- Check browser console for errors
- Make sure RLS is disabled in Supabase

**New user registration failing?**
- **Most Common Issue**: RLS (Row Level Security) is still enabled
- Go to Supabase SQL Editor and run `/disable-rls.sql`
- Verify RLS is disabled by checking the query result
- Open browser console (F12) to see exact error message
- Look for "new row violates row-level security policy" error
- If you see this error, RLS is NOT disabled properly

**Orders/Items not saving?**
- Check "Cloud Sync" badge in header
- Open browser console (F12) and check for errors
- Verify Supabase migration ran successfully

**CSV not downloading?**
- Browser might block downloads - check browser permissions
- Try a different browser
- Make sure orders are marked as "Completed"

---

## 📱 Features

✅ Multi-admin system with approval workflow
✅ Separate Purchase and Sale order tabs
✅ Partial order completion with bill tracking
✅ Automatic stock updates (add for purchase, subtract for sale)
✅ Category-based item organization
✅ Custom category creation
✅ Full size editing (add/delete/rename)
✅ "Fill Remaining" quick button
✅ Automatic CSV export on order completion
✅ Cloud sync across all devices
✅ Super admin credential management
✅ Responsive design (mobile & desktop)

---

## 📞 Support

For any issues:
1. Check browser console (F12) for errors
2. Verify Supabase credentials
3. Check network tab for API failures
4. Review this guide again

---

**Built with:** React, TypeScript, Tailwind CSS, Supabase, Vite
**Deployment:** Vercel
**Database:** PostgreSQL (via Supabase)