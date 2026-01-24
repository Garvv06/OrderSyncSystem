# ✅ MFOI Admin System - Deployment Checklist

Use this checklist to ensure everything is set up correctly before deploying.

---

## 📋 Pre-Deployment Checklist

### 1. ☁️ Supabase Setup

- [ ] Supabase account created
- [ ] New project created (note project name: _____________)
- [ ] Project is active and running
- [ ] SQL from `/supabase-schema-updated.sql` executed successfully
- [ ] Email confirmation disabled in Auth settings
- [ ] Default admin user created and working
- [ ] Can login to Supabase dashboard
- [ ] Have copied Project URL: `https://____________.supabase.co`
- [ ] Have copied anon public key: `eyJhbGci...`

**Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM auth.users WHERE email = 'admin@fastener.com';
SELECT * FROM public.admins WHERE email = 'admin@fastener.com';
-- Both should return 1 row
```

---

### 2. 💻 Local Development

- [ ] Project cloned/downloaded to local machine
- [ ] Dependencies installed: `npm install`
- [ ] `.env` file created in project root
- [ ] Environment variables added to `.env`:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- [ ] Dev server starts without errors: `npm run dev`
- [ ] App loads in browser at `http://localhost:5173`
- [ ] Can see login page
- [ ] Can login with admin@fastener.com / admin123
- [ ] Dashboard loads successfully
- [ ] Items page shows default items
- [ ] Can create a test order
- [ ] Can view orders list
- [ ] No errors in browser console (F12)

**Test Login:**
```
Email: admin@fastener.com
Password: admin123
Expected: Login successful, redirect to Dashboard
```

---

### 3. 🔧 Required Files

- [ ] `/index.html` exists
- [ ] `/src/main.tsx` exists
- [ ] `/vercel.json` exists
- [ ] `/.gitignore` exists
- [ ] `/package.json` has correct scripts
- [ ] No `.env` file committed to Git

**Verify files:**
```bash
ls -la index.html src/main.tsx vercel.json .gitignore
# All should exist
```

---

### 4. 🏗️ Build Test

- [ ] Production build works: `npm run build`
- [ ] No build errors
- [ ] `dist/` folder created
- [ ] Can preview build: `npm run preview`
- [ ] Preview works in browser

**Build command:**
```bash
npm run build
# Expected: ✓ built in XXXms
```

---

### 5. 🚀 Vercel Setup

- [ ] Vercel account created
- [ ] Connected to Git repository (GitHub/GitLab/Bitbucket)
- [ ] Project imported to Vercel
- [ ] Environment variables added in Vercel:
  - [ ] `VITE_SUPABASE_URL` = your Supabase URL
  - [ ] `VITE_SUPABASE_ANON_KEY` = your anon key
- [ ] Build command set to: `vite build` (or blank - uses package.json)
- [ ] Output directory set to: `dist` (or blank - Vite default)
- [ ] Node version: 18.x or higher

**Vercel Environment Variables Location:**
```
Dashboard → Your Project → Settings → Environment Variables
```

---

### 6. 🌐 First Deployment

- [ ] Code pushed to Git repository
- [ ] Vercel auto-deploys (wait 1-2 minutes)
- [ ] Deployment shows "Ready" status
- [ ] Deployment URL accessible (e.g., your-project.vercel.app)
- [ ] App loads without 404 error
- [ ] Login page appears
- [ ] Can login successfully
- [ ] All pages accessible
- [ ] No errors in browser console

**Test Deployment:**
```
1. Visit: https://your-project.vercel.app
2. Login: admin@fastener.com / admin123
3. Check: Dashboard, Items, Orders pages all load
```

---

### 7. 🔐 Security

- [ ] Default admin password changed
- [ ] New password is strong (12+ characters, mixed case, numbers, symbols)
- [ ] `.env` file NOT committed to Git
- [ ] Supabase service role key NOT exposed in frontend
- [ ] Only anon key used in frontend code

**Change Password:**
```sql
-- Run in Supabase SQL Editor
UPDATE auth.users
SET encrypted_password = crypt('YourNewStrongPassword123!', gen_salt('bf'))
WHERE email = 'admin@fastener.com';
```

---

### 8. 🎯 Feature Testing

After deployment, test all features:

- [ ] **Authentication:**
  - [ ] Can login
  - [ ] Can logout
  - [ ] Session persists on page refresh
  - [ ] Can register new admin (request access)

- [ ] **Dashboard:**
  - [ ] Shows correct stats
  - [ ] All navigation buttons work

- [ ] **Items:**
  - [ ] Can view items list
  - [ ] Can filter by category
  - [ ] Can edit item stock
  - [ ] Can add new item

- [ ] **Orders:**
  - [ ] Can create purchase order
  - [ ] Can create sale order
  - [ ] Can view all orders
  - [ ] Can filter pending orders
  - [ ] Can complete order (partial/full)
  - [ ] Can export CSV
  - [ ] Can import CSV
  - [ ] Can bulk delete

- [ ] **Admin Management:**
  - [ ] Can view pending approvals
  - [ ] Can approve new admins
  - [ ] Can manage users
  - [ ] Can change admin roles

---

### 9. 📊 Data Migration (if applicable)

- [ ] Old data exported to CSV
- [ ] CSV format verified
- [ ] Test import with small dataset
- [ ] Full import completed
- [ ] Data verified in app
- [ ] Stock levels correct

---

### 10. 📱 Responsive Testing

Test on different devices:

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Sidebar works on mobile
- [ ] All forms accessible
- [ ] Tables scrollable on small screens

---

### 11. 🌐 Browser Testing

Test on different browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

### 12. 📝 Documentation

- [ ] README.md updated with project info
- [ ] Team members have access to:
  - [ ] Supabase dashboard
  - [ ] Vercel dashboard
  - [ ] Git repository
  - [ ] Documentation files
- [ ] `.env.example` file provided for new developers
- [ ] Setup instructions documented

---

## 🚨 Post-Deployment Monitoring

### First 24 Hours

- [ ] Check Vercel analytics for errors
- [ ] Monitor Supabase logs
- [ ] Check browser console on production
- [ ] Verify no 404 errors in Vercel logs
- [ ] Test from multiple locations/networks

### First Week

- [ ] Monitor database size
- [ ] Check query performance
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Plan backups

---

## 🐛 Rollback Plan

If deployment fails:

1. **Check Vercel deployment logs**
   - Dashboard → Deployments → Click failed deployment → View logs

2. **Check browser console**
   - F12 → Console tab → Look for errors

3. **Verify environment variables**
   - Vercel → Settings → Environment Variables
   - Must match local .env

4. **Roll back to previous deployment**
   - Vercel → Deployments → Find working deployment → Promote to Production

5. **Common fixes:**
   ```bash
   # Redeploy with fresh build
   git commit --allow-empty -m "Redeploy"
   git push
   
   # Or redeploy from Vercel dashboard
   Deployments → Latest → Redeploy
   ```

---

## 📞 Emergency Contacts

**Supabase Issues:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com

**Vercel Issues:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com

**Documentation:**
- See `/QUICK_START.md` for setup
- See `/AUTHENTICATION_SETUP_GUIDE.md` for auth issues
- See `/DEPLOYMENT_QUICK_FIX.md` for deployment help

---

## ✅ Final Verification

All checked? You're ready to go live! 🎉

**Last Steps:**

1. Announce to team
2. Share login credentials securely
3. Schedule first team training
4. Plan regular backups
5. Set up monitoring alerts (optional)

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Production URL:** _____________

**Notes:** _____________

---

*Keep this checklist for future reference and updates.*
