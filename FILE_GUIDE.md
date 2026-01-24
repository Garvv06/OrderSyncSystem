# 📁 MFOI Admin System - File Guide

**Understanding what each file does in your project.**

---

## 🚀 New Files Created (Fix)

These files were created to fix the authentication and deployment issues:

### Essential Files

| File | Purpose | When to Edit |
|------|---------|-------------|
| `/index.html` | Entry point for the app - Vite loads this first | Never (unless changing app title) |
| `/src/main.tsx` | Bootstraps React application | Never |
| `/vercel.json` | Configures Vercel to handle SPA routing (fixes 404) | Never |
| `/.gitignore` | Prevents sensitive files from being committed to Git | Add new patterns if needed |
| `/.env` | Your Supabase credentials (YOU CREATE THIS) | Every deployment |

### Documentation Files

| File | Purpose | When to Read |
|------|---------|-------------|
| `/QUICK_START.md` | **START HERE** - Complete setup in 10 minutes | First time setup |
| `/AUTHENTICATION_SETUP_GUIDE.md` | Detailed auth setup with troubleshooting | If login issues |
| `/DEPLOYMENT_QUICK_FIX.md` | Quick deployment guide | Before deploying |
| `/FIX_SUMMARY.md` | What changed and why | Understanding fixes |
| `/DEPLOYMENT_CHECKLIST.md` | Step-by-step deployment checklist | During deployment |
| `/FILE_GUIDE.md` | This file - explains all files | When confused about files |
| `/README.md` | Project overview and quick reference | Anytime |

### Database Files

| File | Purpose | When to Use |
|------|---------|------------|
| `/supabase-schema-updated.sql` | **RECOMMENDED** - Complete database setup | First Supabase setup |
| `/supabase-schema.sql` | Original schema (still works) | Alternative to above |
| `/supabase/migrations/002_update_schema_for_auth.sql` | Updates old schema for auth | If upgrading from old version |
| `/supabase-admin-tasks.sql` | Common SQL admin tasks | Managing admins, backups |

---

## 📂 Existing Files (Your App)

### Root Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `/package.json` | Lists dependencies and scripts | ✅ When adding packages |
| `/vite.config.ts` | Vite build configuration | ❌ Rarely |
| `/postcss.config.mjs` | PostCSS configuration for Tailwind | ❌ Never |
| `/env.example` | Template for environment variables | ✅ When adding new env vars |

### Source Code - Main App

| File | Purpose | Edit? |
|------|---------|-------|
| `/src/app/App.tsx` | Main application component | ✅ For new features |
| `/src/app/types.ts` | TypeScript type definitions | ✅ When adding new data types |

### Source Code - Components

| File | Purpose | Edit? |
|------|---------|-------|
| `/src/app/components/Login.tsx` | Login & registration page | ✅ For auth UI changes |
| `/src/app/components/Dashboard.tsx` | Main dashboard view | ✅ For dashboard changes |
| `/src/app/components/ItemsList.tsx` | Manage items/inventory | ✅ For item management changes |
| `/src/app/components/OrdersList.tsx` | View and manage orders | ✅ For order list changes |
| `/src/app/components/CreateOrder.tsx` | Create new orders | ✅ For order creation changes |
| `/src/app/components/AdminApproval.tsx` | Approve pending admins | ✅ For approval workflow changes |
| `/src/app/components/UserManagement.tsx` | Manage admin users | ✅ For user management changes |
| `/src/app/components/Profile.tsx` | User profile page | ✅ For profile changes |

### Source Code - Utilities

| File | Purpose | Edit? |
|------|---------|-------|
| `/src/app/utils/supabase.ts` | Supabase client setup | ❌ Rarely |
| `/src/app/utils/storage.ts` | Data storage operations | ✅ For new storage features |
| `/src/app/utils/api.ts` | API helper functions | ✅ For new API calls |
| `/src/app/utils/auth-helpers.ts` | Authentication helpers | ✅ For auth utilities |
| `/src/app/utils/csvExport.ts` | CSV export/import logic | ✅ For CSV changes |
| `/src/app/utils/database.ts` | Database operations | ✅ For new DB operations |

### Source Code - Data

| File | Purpose | Edit? |
|------|---------|-------|
| `/src/app/data/defaultItems.ts` | Default 120+ items list | ✅ To add/edit default items |

### Source Code - Styles

| File | Purpose | Edit? |
|------|---------|-------|
| `/src/styles/index.css` | Main CSS entry point | ✅ For global styles |
| `/src/styles/tailwind.css` | Tailwind CSS imports | ❌ Never |
| `/src/styles/theme.css` | Custom theme variables | ✅ For theme changes |
| `/src/styles/fonts.css` | Font imports | ✅ When adding fonts |

### Source Code - UI Components

All files in `/src/app/components/ui/` are reusable UI components (buttons, dialogs, inputs, etc.)

**Edit?** ❌ Rarely - These are pre-built components from shadcn/ui

---

## 🗂️ Backend Files

### Supabase Edge Functions

| File | Purpose | Edit? |
|------|---------|-------|
| `/supabase/functions/server/index.tsx` | Main server routes | ❌ Don't edit - uses old auth system |
| `/supabase/functions/server/kv_store.tsx` | Key-value storage utility | ❌ PROTECTED - Don't edit |

**Note:** These files are from the old custom auth system. The new system uses Supabase Auth directly, so these are mostly unused now.

---

## 📊 When to Edit What

### Adding a New Feature

1. **New component?** 
   - Create in `/src/app/components/YourComponent.tsx`
   - Import in `/src/app/App.tsx`

2. **New data type?**
   - Add to `/src/app/types.ts`

3. **New database table?**
   - Add SQL to new migration file
   - Update `/src/app/utils/storage.ts`

4. **New environment variable?**
   - Add to `/.env` locally
   - Add to Vercel dashboard
   - Update `/env.example`

### Customizing Appearance

1. **Colors/theme?**
   - Edit `/src/styles/theme.css`
   - Or add Tailwind classes in components

2. **Layout changes?**
   - Edit specific component files
   - E.g., `/src/app/App.tsx` for sidebar

3. **New fonts?**
   - Add import to `/src/styles/fonts.css`
   - Use in components

### Managing Data

1. **Default items?**
   - Edit `/src/app/data/defaultItems.ts`

2. **Database queries?**
   - Edit `/src/app/utils/storage.ts`

3. **Admin users?**
   - Use SQL from `/supabase-admin-tasks.sql`
   - Or use app's Admin Approval page

---

## 🚫 Files You Should NEVER Edit

| File | Why? |
|------|------|
| `/utils/supabase/info.tsx` | Protected system file |
| `/supabase/functions/server/kv_store.tsx` | Protected system file |
| `/src/app/components/figma/ImageWithFallback.tsx` | Protected system file |
| `/pnpm-lock.yaml` | Auto-generated package lock file |
| `/.vite/` folder | Build cache |
| `/dist/` folder | Build output |
| `/node_modules/` folder | Dependencies |

---

## 📋 File Checklist

### Must Exist for App to Work

- [x] `/index.html`
- [x] `/src/main.tsx`
- [x] `/src/app/App.tsx`
- [x] `/package.json`
- [x] `/vite.config.ts`

### Must Create Yourself

- [ ] `/.env` (copy from `/env.example`)

### Should Exist for Deployment

- [x] `/vercel.json`
- [x] `/.gitignore`

### Should Exist for Reference

- [x] All documentation files (`.md`)
- [x] `/supabase-schema-updated.sql`

---

## 🔍 Finding Specific Code

### "Where is the login logic?"
**File:** `/src/app/components/Login.tsx`  
**Function:** `handleSubmit`

### "Where are orders stored?"
**File:** `/src/app/utils/storage.ts`  
**Functions:** `getOrders`, `addOrder`, `updateOrder`, `deleteOrder`

### "Where is the sidebar?"
**File:** `/src/app/App.tsx`  
**Search for:** `<aside`

### "Where are items defined?"
**File:** `/src/app/data/defaultItems.ts`  
**Variable:** `export const defaultItems`

### "Where is Supabase configured?"
**File:** `/src/app/utils/supabase.ts`  
**Variables:** `supabaseUrl`, `supabaseAnonKey`

### "Where are the database tables defined?"
**File:** `/supabase-schema-updated.sql`  
**Section:** `CREATE TABLE`

---

## 📖 Quick Reference

### Documentation Priority

1. **First time setup?** → `/QUICK_START.md`
2. **Login not working?** → `/AUTHENTICATION_SETUP_GUIDE.md`
3. **Deploying to Vercel?** → `/DEPLOYMENT_CHECKLIST.md`
4. **Want to understand changes?** → `/FIX_SUMMARY.md`
5. **Need SQL commands?** → `/supabase-admin-tasks.sql`
6. **General reference?** → `/README.md`
7. **Understanding files?** → This file

### Code Priority

1. **Main app?** → `/src/app/App.tsx`
2. **Login?** → `/src/app/components/Login.tsx`
3. **Orders?** → `/src/app/components/OrdersList.tsx`
4. **Items?** → `/src/app/components/ItemsList.tsx`
5. **Database?** → `/src/app/utils/storage.ts`
6. **Types?** → `/src/app/types.ts`

---

## 💡 Pro Tips

1. **Before editing any file:**
   - Read its purpose in this guide
   - Check if it's marked as "PROTECTED"
   - Make a backup if unsure

2. **When adding new files:**
   - Follow existing naming patterns
   - Add to this guide for future reference
   - Update `.gitignore` if needed

3. **When confused:**
   - Check this file first
   - Search for similar patterns in existing code
   - Check documentation files

4. **When deploying:**
   - Verify all required files exist
   - Check `.gitignore` to avoid committing secrets
   - Test build locally first: `npm run build`

---

**Last Updated:** January 24, 2026

**Need help understanding a file?** Check the relevant documentation in the list above!
