<<<<<<< HEAD
# 🔧 OrderSync System

> A production-ready fastener inventory and order management system with secure cloud sync.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

**MFOI Admin System** is a comprehensive admin dashboard for managing fastener inventory, purchase orders, and sale orders with real-time cloud synchronization. Built for internal business operations with production-grade security.

### ✨ Key Features

- 🔐 **Secure Multi-Admin Access** - Role-based authentication with approval workflow
- 📦 **120+ Fastener Items** - Manage inventory across 7 categories with multiple sizes
- 📝 **Smart Order Management** - Purchase & Sale orders with partial completion tracking
- 🔄 **Automatic Stock Sync** - Real-time stock adjustments on order operations
- 📊 **Comprehensive Dashboard** - Overview of inventory, orders, and system stats
- 💾 **CSV Import/Export** - Bulk data operations for items and orders
- ☁️ **Cloud Sync** - Supabase backend with real-time multi-device synchronization
- 🎨 **Modern UI** - Dark theme with MFOI branding (responsive design)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/mfoi-admin-system.git
cd mfoi-admin-system
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Get these from: Supabase Dashboard → Settings → API

### 3. Setup Database

Run the migrations in Supabase SQL Editor (in order):

```sql
-- 1. Create tables
-- Run: /supabase/migrations/001_initial_schema.sql

-- 2. Add auth support
-- Run: /supabase/migrations/002_update_schema_for_auth.sql

-- 3. Remove password column (security)
-- Run: /supabase/migrations/003_remove_password_column.sql

-- 4. Apply RLS policies
-- Run: /supabase/migrations/004_secure_rls_policies.sql
```

### 4. Create First Admin

In Supabase Dashboard → Authentication → Users:

1. Create new user (email + password)
2. Copy the user's `id` (UUID)
3. Go to SQL Editor and run:

```sql
INSERT INTO admins (user_id, email, name, role, approved)
VALUES (
  'paste-user-id-here',
  'admin@yourcompany.com',
  'Super Admin',
  'superadmin',
  true
);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Import project in Vercel dashboard
# Add environment variables
# Deploy!
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete code architecture and component guide
- **[SYSTEM_PROMPT.md](SYSTEM_PROMPT.md)** - Full system specification (use with AI assistants)

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | Frontend framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Supabase** | Database, Auth, Real-time sync |
| **PostgreSQL** | Database (via Supabase) |
| **Tailwind CSS** | Styling |
| **Radix UI** | Accessible UI primitives |
| **Lucide React** | Icon library |
| **Vercel** | Hosting & deployment |

---

## 🔒 Security Features

✅ **Production-Ready Security (9/10)**

| Feature | Implementation |
|---------|----------------|
| Password Storage | ❌ None (Supabase Auth with bcrypt) |
| Authentication | ✅ JWT tokens with auto-refresh |
| Database Access | ✅ Row-Level Security (RLS) policies |
| Password Management | ✅ Email-based reset flow |
| Role-Based Access | ✅ Superadmin & Admin roles |
| Session Management | ✅ Auto-expiry & secure cookies |
| Password Visibility | ❌ Never displayed in UI |
| Approval Workflow | ✅ New admins require approval |

**Security Status: 🟢 PRODUCTION-READY for internal admin tools**

### What's Included:
- Bcrypt password hashing (automatic via Supabase Auth)
- Row-Level Security policies enforced at database level
- JWT session tokens with automatic refresh
- Secure password reset via email
- No plaintext password storage anywhere
- Database-level access control

### Optional Enhancements (not included):
- Email verification on signup
- Multi-factor authentication (MFA)
- IP whitelisting
- Audit logging
- Rate limiting

---

## 📦 Project Structure

```
mfoi-admin-system/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root component
│   │   ├── types.ts                   # TypeScript definitions
│   │   ├── components/                # React components
│   │   │   ├── Login.tsx              # Authentication
│   │   │   ├── Dashboard.tsx          # Overview page
│   │   │   ├── ItemsList.tsx          # Inventory management
│   │   │   ├── CreateOrder.tsx        # Order creation
│   │   │   ├── OrdersList.tsx         # Order management
│   │   │   ├── AdminApproval.tsx      # User approval
│   │   │   ├── UserManagement.tsx     # Admin management
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── data/
│   │   │   └── defaultItems.ts        # 120+ default items
│   │   └── utils/
│   │       ├── supabase.ts            # Supabase client
│   │       ├── auth-helpers.ts        # Auth functions
│   │       ├── storage.ts             # Data operations
│   │       ├── database.ts            # DB queries
│   │       └── csvExport.ts           # Import/export
│   ├── styles/                        # CSS files
│   └── main.tsx                       # Entry point
├── supabase/
│   └── migrations/                    # Database migrations
│       ├── 001_initial_schema.sql
│       ├── 002_update_schema_for_auth.sql
│       ├── 003_remove_password_column.sql
│       └── 004_secure_rls_policies.sql
├── ARCHITECTURE.md                    # Architecture guide
├── SYSTEM_PROMPT.md                   # System specification
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## 🎯 Core Features Deep Dive

### 1. Multi-Admin Authentication
- **Signup:** Users request access → Pending approval state
- **Approval:** Superadmin approves → User can login
- **Roles:** Superadmin (full access) & Admin (restricted)
- **Security:** Bcrypt passwords + JWT tokens + RLS policies

### 2. Inventory Management (120+ Items)
- **Categories:** Nut, Bolts, Fasteners, Screw, Scaffolding Items, Washer, Hand Tools
- **Multi-Size Support:** Each item can have multiple sizes (e.g., M6, M8, M10)
- **Stock Tracking:** Real-time stock quantities per size
- **Operations:** Add, Edit, Delete items with full CRUD

### 3. Order Management
- **Order Types:**
  - 🔵 Purchase Orders (buying from suppliers)
  - 🟢 Sale Orders (selling to customers)
- **Multi-Item Orders:** Add multiple items with different sizes to one order
- **Partial Completion:** Complete items at different times with separate bill numbers
- **Stock Automation:**
  - Sale Order Created → Stock reduced
  - Sale Order Completed → Stock restored
  - Purchase Order Created → No stock change
  - Purchase Order Completed → Stock increased

### 4. Dashboard Analytics
- Total Items Count
- Total Orders (Purchase + Sale)
- Pending Orders Count
- Active Admins Count
- Quick action buttons for common tasks

### 5. Bulk Operations
- Select individual orders
- Select all orders
- Bulk delete selected
- CSV export (current view)
- CSV import with validation

---

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGc...` |

### Local Development Tips

- Hot reload enabled (Vite)
- TypeScript strict mode
- ESLint for code quality
- Works without Supabase (falls back to localStorage)

---

## 📊 Database Schema

### Table: `admins`
Stores admin user profiles (linked to Supabase Auth)

```typescript
{
  id: UUID
  user_id: UUID (FK to auth.users)
  email: TEXT
  name: TEXT
  role: 'superadmin' | 'admin'
  approved: BOOLEAN
  created_at: TIMESTAMP
}
```

### Table: `items`
Fastener inventory with JSONB sizes

```typescript
{
  id: UUID
  name: TEXT
  category: TEXT
  sizes: JSONB // [{ size: "M6", stock: 1000 }]
  created_at: TIMESTAMP
}
```

### Table: `orders`
Purchase and sale orders with JSONB items

```typescript
{
  id: UUID
  order_no: TEXT
  order_date: TEXT
  party_name: TEXT
  items: JSONB // [{ itemId, size, quantity, price, billNumbers }]
  total: NUMERIC
  status: 'Open' | 'Partially Completed' | 'Completed'
  order_type: 'purchase' | 'sale'
  created_by: TEXT
  created_by_name: TEXT
  created_at: TIMESTAMP
}
```

---

## 🤝 Contributing

This is an internal business tool. For feature requests or bug reports, please contact the development team.

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Troubleshooting

### Can't Login?
1. Verify Supabase credentials in `.env`
2. Check user exists in Supabase Auth → Users
3. Verify admin record exists with `approved = true`
4. Check browser console for errors

### Database Connection Issues?
1. Verify `VITE_SUPABASE_URL` is correct
2. Verify `VITE_SUPABASE_ANON_KEY` is correct
3. Check Supabase project status (not paused)
4. Check RLS policies are applied

### Stock Not Updating?
1. Check order status (only completed orders adjust stock)
2. Verify item sizes match exactly
3. Check browser console for errors
4. Refresh page to see latest data

### For Detailed Help:
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for code structure
- Check Supabase logs in dashboard
- Inspect browser DevTools → Console/Network tabs

---

## 🎨 Branding

- **Primary Color:** Red (#DC2626)
- **Secondary:** Dark Gray (#1F2937, #111827)
- **Accent Colors:**
  - Purchase Orders: Blue (#2563EB)
  - Sale Orders: Green (#059669)
- **Theme:** Dark header/sidebar with light content area

---

## 📈 Roadmap

Future enhancements under consideration:
- [ ] Email verification on signup
- [ ] Multi-factor authentication (MFA)
- [ ] Advanced reporting & analytics
- [ ] Supplier management module
- [ ] Mobile app (React Native)
- [ ] Barcode scanning integration
- [ ] PDF invoice generation
- [ ] Audit logs & activity tracking

---

## 👨‍💻 Built With

This project was built using modern web technologies and best practices for maintainability, security, and developer experience.

**Tech Highlights:**
- TypeScript for type safety
- React hooks for state management
- Supabase for backend-as-a-service
- Tailwind CSS for rapid UI development
- Radix UI for accessible components
- Vite for lightning-fast development

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** 🟢 Production Ready

---

## ⭐ Star this repo if you find it useful!

For questions or support, reach out to the development team.
=======
# OrderSyncSystem
>>>>>>> f74ee81e1c0abce3bbf6238e34bc8fe3f978f403
