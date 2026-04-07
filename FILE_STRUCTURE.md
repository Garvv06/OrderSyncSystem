# 📁 Repository Files Overview

Essential files for the MFOI Admin System GitHub repository.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation (start here) |
| `ARCHITECTURE.md` | Complete code architecture and component guide |
| `SYSTEM_PROMPT.md` | Full system specification (for AI assistants) |
| `SETUP.md` | Supabase setup guide |
| `LICENSE` | MIT License |

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `vercel.json` | Vercel deployment settings |
| `postcss.config.mjs` | PostCSS configuration |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore rules |

---

## 🎯 Entry Point

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `src/main.tsx` | React application bootstrap |

---

## 📦 Source Code

### Main Application
- `src/app/App.tsx` - Root component with routing & auth
- `src/app/types.ts` - TypeScript type definitions

### Components (`src/app/components/`)
- `Login.tsx` - Authentication page
- `Dashboard.tsx` - Overview dashboard
- `ItemsList.tsx` - Inventory management
- `CreateOrder.tsx` - Order creation form
- `OrdersList.tsx` - Order management & completion
- `AdminApproval.tsx` - Approve new admins
- `UserManagement.tsx` - Manage admin users
- `Profile.tsx` - User profile (unused)

### UI Components (`src/app/components/ui/`)
40+ reusable Radix UI components (buttons, dialogs, tables, etc.)

### Utilities (`src/app/utils/`)
- `supabase.ts` - Supabase client & types
- `auth-helpers.ts` - Authentication functions
- `storage.ts` - Database CRUD operations
- `database.ts` - Database abstraction layer
- `csvExport.ts` - CSV import/export functions
- `api.ts` - API helpers (future use)

### Data
- `src/app/data/defaultItems.ts` - 120+ default fastener items

### Styles (`src/styles/`)
- `index.css` - Main stylesheet
- `theme.css` - Theme tokens & CSS variables
- `tailwind.css` - Tailwind base imports
- `fonts.css` - Font imports

---

## 🗄️ Database

### Migrations (`supabase/migrations/`)
- `001_initial_schema.sql` - Create tables
- `002_update_schema_for_auth.sql` - Add auth integration
- `003_remove_password_column.sql` - Security fix
- `004_secure_rls_policies.sql` - Row-Level Security policies

### Functions (`supabase/functions/`)
- Server-side functions (currently unused)

---

## 📊 File Count Summary

```
Documentation:     5 files
Configuration:     6 files
Source Code:       80+ files
  - Components:    8 main + 40+ UI
  - Utilities:     6 files
  - Styles:        4 files
Database:          4 migrations
Total:            ~95 files
```

---

## 🚀 Quick Navigation

**For Setup:**
1. Read `README.md`
2. Follow `SETUP.md`
3. Configure `.env` using `.env.example`

**For Development:**
1. Read `ARCHITECTURE.md`
2. Start with `src/app/App.tsx`
3. Explore components in `src/app/components/`

**For AI Assistance:**
1. Use `SYSTEM_PROMPT.md`
2. Combine with specific questions

---

## ✅ Ready for GitHub

All unnecessary development/debug files have been removed.

This is a clean, professional repository ready for:
- ✅ Public or private GitHub hosting
- ✅ Team collaboration
- ✅ Production deployment
- ✅ Open source contribution
- ✅ Portfolio showcase

---

**Last Updated:** February 2026
