# 🚀 MFOI Deployment Checklist

Follow these steps to get your app live with cloud database sync.

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup (5 minutes)
- [ ] Created Supabase account at https://supabase.com
- [ ] Created new project "MFOI-System"
- [ ] Saved database password securely
- [ ] Waited for project initialization (2-3 minutes)
- [ ] Copied Project URL from Settings → API
- [ ] Copied anon public key from Settings → API
- [ ] Ran SQL migration in SQL Editor:
  - [ ] Opened SQL Editor
  - [ ] Pasted content from `/supabase/migrations/001_initial_schema.sql`
  - [ ] Clicked Run
  - [ ] Saw "Success. No rows returned"
- [ ] Verified tables in Table Editor:
  - [ ] `admins` table exists with default super admin
  - [ ] `items` table exists (empty is OK)
  - [ ] `orders` table exists (empty is OK)

### 2. Vercel Deployment (3 minutes)
- [ ] Code pushed to GitHub repository
- [ ] Created Vercel account at https://vercel.com
- [ ] Clicked "New Project"
- [ ] Imported GitHub repository
- [ ] Added environment variables:
  - [ ] `VITE_SUPABASE_URL` = (your Supabase project URL)
  - [ ] `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)
- [ ] Clicked Deploy
- [ ] Waited for deployment to complete
- [ ] Got live URL: `https://__________.vercel.app`

### 3. Testing (2 minutes)
- [ ] Opened Vercel URL in browser
- [ ] Saw login page with MFOI logo
- [ ] Logged in with default credentials:
  - Email: admin@fastener.com
  - Password: admin123
- [ ] Saw dashboard with navigation
- [ ] Created a test order
- [ ] Checked Supabase Table Editor → orders table has 1 row
- [ ] Opened same URL on mobile device
- [ ] Logged in with same credentials
- [ ] Saw the same test order ✅

## 🎯 Post-Deployment

### Share Your Live URL
Your app is now live at: `https://__________.vercel.app`

Share this URL with:
- [ ] Yourself (bookmark it!)
- [ ] Other admins who need access
- [ ] Save it somewhere safe

### Create Additional Admins (Optional)
1. [ ] Click "Need an account? Sign Up" on login page
2. [ ] Enter new admin details
3. [ ] Login as super admin
4. [ ] Go to "Admin Approval" tab
5. [ ] Approve new admin
6. [ ] New admin can now login

### Multi-Device Access Test
- [ ] Laptop: Open URL → Login → See data
- [ ] Mobile: Open same URL → Login → See same data
- [ ] Tablet: Open same URL → Login → See same data
- [ ] Create order on laptop → Instantly visible on mobile ✅

## 🔧 Troubleshooting

### App shows blank page
- Check browser console (F12) for errors
- Verify Vercel environment variables are set correctly
- Redeploy in Vercel if needed

### Login doesn't work
- Check Supabase Table Editor → admins table
- Verify default admin exists with approved=true
- Try clearing browser cache

### No data syncing between devices
- Verify Supabase URL and key in Vercel env vars
- Check Supabase logs for errors
- Make sure both devices use same URL (not localhost)

### "Cannot connect to Supabase" error
- Double-check VITE_SUPABASE_URL in Vercel
- Double-check VITE_SUPABASE_ANON_KEY in Vercel
- Verify Supabase project is running (not paused)

## 📊 Monitor Your Database

### View Data in Supabase
1. Go to Supabase dashboard
2. Click "Table Editor"
3. Select table (admins, items, orders)
4. View all data in spreadsheet format

### Check Logs
1. Supabase Dashboard → Logs
2. See all database queries
3. Identify any errors

### Backup (Optional)
1. Supabase Dashboard → Database → Backups
2. Enable daily automatic backups
3. Can restore from any point in time

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Login works on all devices
- ✅ Orders sync across devices
- ✅ Stock updates reflect everywhere
- ✅ No console errors
- ✅ Multiple admins can login simultaneously
- ✅ Data persists after browser refresh

## 📱 Next Steps

1. **Bookmark your live URL** on all devices
2. **Create admin accounts** for your team
3. **Add your inventory items** (or keep default 79 items)
4. **Start placing orders** - they'll sync everywhere!
5. **Test partial order completion** workflow
6. **Customize** - request any changes needed

## 🆘 Need Help?

If anything doesn't work:
1. Check this checklist again
2. Review error messages in browser console
3. Check Supabase logs
4. Message me with:
   - What step failed
   - Error message
   - Screenshot if possible

---

**Congratulations! Your MFOI system is now live! 🎊**
