# 🔧 MFOI Admin Order System

**A complete admin dashboard for managing fastener inventory and orders with Supabase cloud sync.**

---

## 🚨 IMPORTANT: Start Here!

### ⚡ Quick Setup (10 Minutes)

**👉 READ THIS FIRST:** `/QUICK_START.md`

This guide will get you up and running in 10 minutes with:
- ✅ Supabase setup
- ✅ Environment configuration  
- ✅ First login
- ✅ Deployment to Vercel

### 🆘 Having Issues?

**Login not working?** → `/AUTHENTICATION_SETUP_GUIDE.md`  
**Vercel 404 error?** → `/DEPLOYMENT_QUICK_FIX.md`  
**Want to understand what changed?** → `/FIX_SUMMARY.md`

---

## 🚨 Important: Recent Updates

**Date:** January 24, 2026

### ✅ Fixed Issues
- ✅ **Login authentication** - Now properly configured with Supabase Auth
- ✅ **Vercel 404 errors** - Added proper SPA routing configuration
- ✅ **Missing entry files** - Created index.html and main.tsx
- ✅ **Error handling** - Enhanced with detailed logging

### 📚 New Documentation
- `/QUICK_START.md` - **Start here!** Complete setup in 10 minutes
- `/AUTHENTICATION_SETUP_GUIDE.md` - Detailed authentication guide
- `/DEPLOYMENT_QUICK_FIX.md` - Quick deployment instructions
- `/FIX_SUMMARY.md` - What changed and why

---

## ⚡ Quick Start

### 1. Setup Supabase (5 minutes)
```bash
# 1. Create project at supabase.com
# 2. Run SQL from /supabase-schema-updated.sql
# 3. Disable email confirmation in Auth settings
# 4. Get your Project URL and anon key
```

### 2. Configure Environment (1 minute)
```bash
# Copy example and add your credentials
cp env.example .env

# Edit .env and add:
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Application (1 minute)
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Login with:
# Email: admin@fastener.com
# Password: admin123
```

**Full guide:** See `/QUICK_START.md`

---

## 🎯 Features

### ✅ Currently Working
- 🔐 Secure authentication with Supabase Auth
- 👥 Multi-admin support with approval workflow
- 🎭 Role-based access (Superadmin & Admin)
- 📦 120+ fastener items across 7 categories
- 🛒 Multi-item order management
- 📊 Separate Purchase & Sale order tracking
- ✅ Partial order completion
- 📤 CSV export/import
- 🗑️ Bulk delete operations
- ☁️ Cloud sync across devices
- 📱 Responsive design

### 🎨 Branding
- Dark gray/black header
- Red accent colors
- MFOI logo integration

---

## 📁 Project Structure

```
/
├── index.html                     # Vite entry point
├── vercel.json                    # Vercel SPA routing
├── package.json                   # Dependencies & scripts
├── .env                          # Your secrets (create this)
│
├── src/
│   ├── main.tsx                  # React bootstrap
│   ├── app/
│   │   ├── App.tsx              # Main application
│   │   ├── components/          # All React components
│   │   ├── data/                # Default items data
│   │   ├── types.ts             # TypeScript types
│   │   └── utils/               # Utilities (API, storage, etc.)
│   └── styles/                  # CSS files
│
├── supabase/
│   ├── functions/               # Edge functions
│   └── migrations/              # Database migrations
│
└── Documentation/
    ├── QUICK_START.md          # ⭐ Start here!
    ├── AUTHENTICATION_SETUP_GUIDE.md
    ├── DEPLOYMENT_QUICK_FIX.md
    ├── FIX_SUMMARY.md
    ├── supabase-schema-updated.sql
    └── supabase-admin-tasks.sql
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Set environment variables:**
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

2. **Deploy:**
   ```bash
   git push
   # Vercel auto-deploys
   ```

3. **Test:**
   - Visit your Vercel URL
   - Should work without 404 errors

**Full guide:** See `/DEPLOYMENT_QUICK_FIX.md`

---

## 🔐 Security

### Authentication Flow
```
User Login → Supabase Auth → JWT Token → Session Storage
                    ↓
              Verify Admin → Check Approval → Grant Access
```

### Security Features
- ✅ Passwords hashed with bcrypt (handled by Supabase)
- ✅ JWT token-based sessions
- ✅ Row Level Security (RLS) enabled
- ✅ Admin approval workflow
- ✅ Role-based access control

### Default Credentials
```
Email: admin@fastener.com
Password: admin123
```

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

## 🐛 Troubleshooting

### Login Issues

**"Supabase is not configured"**
- Check environment variables are set
- Restart dev server: `Ctrl+C` then `npm run dev`
- Variables must start with `VITE_`

**"Invalid login credentials"**
- Run SQL from `/supabase-schema-updated.sql`
- Disable email confirmation in Supabase
- Check browser console (F12) for details

**"Admin record not found"**
- Admin must exist in both `auth.users` AND `public.admins`
- See `/supabase-admin-tasks.sql` for SQL commands

### Deployment Issues

**404 on Vercel**
- Verify `/vercel.json` exists
- Verify `/index.html` exists
- Redeploy after adding files

**Build errors**
- Test locally first: `npm run build`
- Check TypeScript errors: `npx tsc --noEmit`

**Full troubleshooting:** See `/AUTHENTICATION_SETUP_GUIDE.md`

---

## 📊 Database Schema

### Tables

1. **admins**
   - Links to `auth.users` via `user_id`
   - Stores: name, role, approval status
   - Used for app-specific admin data

2. **items**
   - Stores: name, category, sizes (JSONB)
   - 120+ default items
   - Supports stock tracking

3. **orders**
   - Stores: order details, items, status
   - Supports: Purchase & Sale orders
   - Tracks: Partial completion

### Manage Database

Use `/supabase-admin-tasks.sql` for common tasks:
- View all admins
- Approve pending admins
- Create new admins
- Reset passwords
- View statistics
- Backup data

---

## 🔧 Development

### Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Required for Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional (falls back to localStorage):
- If not set, app works in local-only mode
- Cloud sync disabled without Supabase

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `/QUICK_START.md` | **⭐ Start here** - Complete setup |
| `/AUTHENTICATION_SETUP_GUIDE.md` | Detailed auth setup & troubleshooting |
| `/DEPLOYMENT_QUICK_FIX.md` | Quick deployment guide |
| `/FIX_SUMMARY.md` | Recent changes summary |
| `/supabase-schema-updated.sql` | Complete database schema |
| `/supabase-admin-tasks.sql` | Common SQL admin tasks |
| `/env.example` | Environment variables reference |

---

## 🎓 Learn More

### Supabase Resources
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### React Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## ✅ Production Checklist

Before going live:

- [ ] Supabase project created and configured
- [ ] Database schema applied
- [ ] Default admin password changed
- [ ] Environment variables set (local & Vercel)
- [ ] All features tested
- [ ] CSV export/import tested
- [ ] Multi-admin workflow tested
- [ ] Order management tested
- [ ] Stock tracking tested
- [ ] Responsive design verified
- [ ] Error logging working
- [ ] Backup strategy in place

---

## 🆘 Support

### Getting Help

1. **Check documentation first:**
   - Start with `/QUICK_START.md`
   - Check `/AUTHENTICATION_SETUP_GUIDE.md` for auth issues
   - See `/FIX_SUMMARY.md` for recent changes

2. **Debug yourself:**
   - Open browser console (F12)
   - Check error messages (all errors are logged)
   - Verify environment variables
   - Test database connection in Supabase

3. **Common issues:**
   - See troubleshooting sections in each guide
   - Check `/supabase-admin-tasks.sql` for SQL fixes

---

## 📝 Notes

### Technology Stack
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **Build:** Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

### Key Dependencies
- @supabase/supabase-js - Supabase client
- lucide-react - Icons
- date-fns - Date formatting
- Various Radix UI components

---

## 📄 License

Private - MFOI Internal Use Only

---

## 🎯 Next Steps

1. ✅ Complete setup (see `/QUICK_START.md`)
2. ✅ Change default password
3. ✅ Test all features
4. ✅ Deploy to Vercel
5. ✅ Create additional admin users
6. ✅ Import your existing data (CSV)
7. ✅ Start managing orders!

---

**Status:** ✅ All systems operational

**Last Updated:** January 24, 2026

**Questions?** Check the documentation guides above!