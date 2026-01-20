# MFOI Admin System

**Professional Fastener Inventory & Order Management System**

A complete admin-only dashboard for managing fastener inventory (120+ items across 7 categories) with secure multi-admin login, role-based access, purchase/sale order management, and cloud synchronization.

---

## 🎯 **IMPORTANT: Just Fixed Issues!**

If you're experiencing issues with:
- ❌ New user registrations not showing in Approvals tab
- ❌ Super admin can't change password
- ❌ Confused about Admin vs Super Admin permissions

**→ See [FIXES_SUMMARY.md](./FIXES_SUMMARY.md) for solutions!**

---

## 📚 Documentation

- **[USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)** - Complete user management guide (NEW!)
- **[QUICK_TEST.md](./QUICK_TEST.md)** - Step-by-step testing guide
- **[FIXES_SUMMARY.md](./FIXES_SUMMARY.md)** - Recent fixes & troubleshooting
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[disable-rls.sql](./disable-rls.sql)** - Disable Supabase RLS (required!)

---

## 🚀 Quick Start

### For Deployment: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### For Local Development:

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd mfoi-admin-system
   npm install
   ```

2. **Setup Supabase** (see DEPLOYMENT_GUIDE.md)
   - Create Supabase project
   - Run migration from `supabase-schema.sql`
   - Get API keys

3. **Configure Environment**
   ```bash
   cp env.example .env
   ```
   Edit `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```

4. **Run**
   ```bash
   npm run dev
   ```

5. **Login**
   - Email: `admin@fastener.com`
   - Password: `admin123`
   - **Change immediately in Profile tab!**

---

## ✨ Key Features

- 🔐 Multi-admin system with approval workflow
- 📦 120+ fastener items across 7 categories
- 🛒 Separate Purchase & Sale order management
- 📊 Partial order completion with bill tracking
- 📈 Automatic stock updates (add/subtract based on order type)
- 📋 Category-based item organization
- ✏️ Full item editing (sizes, stock, categories)
- ⚡ "Fill Remaining" quick completion
- 📄 Automatic CSV export on order completion
- ☁️ Cloud sync across devices via Supabase
- 👤 Role-based permissions (Super Admin vs Admin)
- 📱 Fully responsive design

---

## 📁 Important Files

- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **env.example** - Environment variable template
- **supabase-schema.sql** - Database schema
- **package.json** - Dependencies

---

## 🔒 User Roles

**Super Admin**
- Full system access
- Can change email/password
- Approve new admins
- Manage items, orders, users

**Admin**
- Approve new admins
- Manage items & orders
- Cannot change credentials

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Build:** Vite

---

## 📞 Need Help?

Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- Supabase setup
- Vercel deployment
- Troubleshooting
- Security checklist

---

**Version:** 2.0  
**Last Updated:** January 2026