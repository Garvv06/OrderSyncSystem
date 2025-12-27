# Supabase Setup Guide - MFOI System

This guide will help you set up Supabase to sync your database across all devices (laptop, mobile, tablet, etc.).

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or Email (FREE)

### Step 2: Create New Project
1. Click **"New Project"**
2. Enter project details:
   - **Name**: MFOI-System
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to you (e.g., Singapore, Mumbai, etc.)
   - **Pricing Plan**: FREE
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### Step 3: Get Your API Keys
1. Go to **Settings** (gear icon on left sidebar)
2. Click **"API"** tab
3. Copy these values:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon public** key (long string starting with eyJ...)

### Step 4: Set Up Database Tables
1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from `/supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** button
6. You should see "Success. No rows returned"

### Step 5: Configure Your App
1. In your project root, create a file named `.env`
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

3. Save the file

### Step 6: Deploy to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. In **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy**

## ✅ You're Done!

Now your database is in the cloud and will sync across all devices!

### Test It:
1. Open your app on laptop: https://your-app.vercel.app
2. Login: admin@fastener.com / admin123
3. Create an order
4. Open same URL on mobile
5. Login with same credentials
6. You'll see the same order! 🎉

## 🔧 Verify Database Setup

### Check Tables Created:
1. Go to Supabase dashboard
2. Click **"Table Editor"** (left sidebar)
3. You should see 3 tables:
   - **admins** - All admin users
   - **items** - All inventory items
   - **orders** - All orders

### Check Default Admin:
1. Click on **"admins"** table
2. You should see one row:
   - email: admin@fastener.com
   - password: admin123
   - role: superadmin
   - approved: true

## 🌍 How It Works

**Before (localStorage):**
```
Laptop Browser → Local Storage (only on laptop)
Mobile Browser → Local Storage (only on mobile)
❌ Data doesn't sync
```

**After (Supabase):**
```
Laptop Browser → Supabase Cloud Database
Mobile Browser → Supabase Cloud Database
Tablet Browser → Supabase Cloud Database
✅ All devices see same data in real-time!
```

## 📱 Access From Any Device

1. **Same URL** on all devices: https://your-app.vercel.app
2. **Same login** credentials work everywhere
3. **Same data** visible instantly across all devices
4. **Real-time sync** - changes appear immediately

## 🔐 Security Notes

- Your Supabase **anon key** is safe to expose (it's public)
- Row Level Security (RLS) is enabled
- Only authenticated admins can access data
- Database password is separate (never share it)

## 💡 Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env` file exists
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Make sure Vercel environment variables are set

### "No data showing up"
- Check SQL migration ran successfully
- Go to Table Editor and verify tables exist
- Check browser console for errors

### "Login not working"
- Verify default admin was created in database
- Check admins table has at least one approved admin
- Clear browser cache and try again

## 📊 View Your Data

Anytime you want to see your data:
1. Go to Supabase dashboard
2. Click **"Table Editor"**
3. Select table (admins, items, orders)
4. See all data in a spreadsheet-like view
5. Can manually edit if needed (advanced)

## 🔄 Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to move to Supabase:

1. Open your app in the browser where you have data
2. Open browser console (F12)
3. Run this script:

```javascript
// Export all localStorage data
const data = {
  admins: JSON.parse(localStorage.getItem('admins') || '[]'),
  items: JSON.parse(localStorage.getItem('items_token_xxxxx') || '[]'),
  orders: JSON.parse(localStorage.getItem('orders_token_xxxxx') || '[]')
};
console.log(JSON.stringify(data, null, 2));
```

4. Copy the output
5. Contact support to import this data into Supabase

## 🎯 Next Steps

1. ✅ Set up Supabase (5 minutes)
2. ✅ Deploy to Vercel with environment variables
3. ✅ Test login from different devices
4. ✅ Create an order on laptop, view on mobile
5. ✅ Enjoy seamless multi-device access!

## 🆘 Need Help?

If you encounter any issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Verify environment variables in Vercel
4. Message me with the specific error

---

**Your MFOI system is now enterprise-grade with cloud database! 🚀**
