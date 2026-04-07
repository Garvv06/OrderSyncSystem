# 🔧 MFOI Admin System - Complete System Prompt

## Copy this prompt to recreate the system or explain it to AI assistants

---

## SYSTEM OVERVIEW PROMPT

```
Create a comprehensive Fastener Admin Order Management System called "MFOI Admin System" with the following specifications:

## TECH STACK
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS v4 + Radix UI components
- Backend: Supabase (PostgreSQL + Authentication + Real-time sync)
- Icons: Lucide React
- State Management: React hooks (useState, useEffect)
- Build: Vite
- Deployment: Vercel

## BRANDING & DESIGN
- Logo: MFOI company logo
- Color scheme: Dark gray/black header with red accent colors (#DC2626 for primary red)
- Navigation: Left sidebar with dark gradient (gray-900 to gray-800) and red border
- Header: Dark gradient with red bottom border
- Responsive design with mobile hamburger menu
- Modern, professional admin dashboard aesthetic

## CORE FEATURES

### 1. AUTHENTICATION & USER MANAGEMENT
- Multi-admin system with role-based access
- Two roles: "superadmin" and "admin"
- Secure login using Supabase Authentication (bcrypt password hashing)
- New admin signup requires approval workflow
- Admin approval page (only accessible to approved admins)
- User management page for editing admin details (name, email, role)
- Password reset via Supabase email flow (NO password display in UI)
- Session management with JWT tokens
- Database status indicator (Cloud Sync/Local Mode)

Security Requirements:
- NO plaintext passwords stored anywhere
- Use Supabase Auth for password management (automatic bcrypt hashing)
- Passwords never returned from database or displayed in UI
- Row-Level Security (RLS) policies on all tables
- Only approved admins can access the system
- Admins can only update their own profile unless they're superadmin

### 2. INVENTORY MANAGEMENT (Items)
- Manage 120+ fastener items across 7 categories:
  * Nut
  * Bolts
  * Fasteners
  * Screw
  * Scapfolding Items
  * Washer
  * Hand Tools

Item Structure:
- Item name
- Category (dropdown selection)
- Multiple sizes per item (e.g., M6, M8, M10, M12)
- Stock quantity per size
- Add/Edit/Delete operations
- Real-time stock updates
- Default items pre-loaded on first run

UI Features:
- Searchable/filterable item list
- Category-based filtering
- Table view with all items and sizes
- Add Item modal with dynamic size fields
- Edit Item modal (modify name, category, adjust stock quantities)
- Delete confirmation dialogs

### 3. ORDER MANAGEMENT

#### Order Types:
- Purchase Orders (buying from suppliers)
- Sale Orders (selling to customers)

#### Order Creation (CreateOrder Component):
- Separate pages for Purchase Order and Sale Order
- Multi-item orders (add multiple items to one order)
- Different sizes allowed in same order
- Order fields:
  * Order number (auto-generated or manual)
  * Order date (date picker)
  * Party name (supplier/customer name)
  * Multiple line items with:
    - Item selection (dropdown)
    - Size selection (dropdown based on item)
    - Quantity (number input)
    - Price per unit (number input)
    - Line total (auto-calculated: quantity × price)
  * Total amount (auto-calculated sum of all line items)
  * Order type (purchase/sale)
  * Created by (current admin name & email)

Stock Management on Order Creation:
- Sale Orders: Reduce stock immediately when order is created
- Purchase Orders: Don't change stock on creation
- Validate stock availability for sale orders
- Show error if insufficient stock

#### Order Viewing & Management (OrdersList Component):
- Two separate tabs:
  * Purchase Orders
  * Sale Orders
- Filter options:
  * All Orders
  * Pending Orders (status = "Open" or "Partially Completed")
- Order table displays:
  * Order number
  * Order date
  * Party name
  * Total amount
  * Status badge (Open/Partially Completed/Completed)
  * Created by
  * Actions (Complete, Delete)

#### Partial Order Completion Feature:
- Complete different items at different times
- Complete same item in multiple batches
- For each item completion:
  * Enter quantity completed (can be less than ordered)
  * Enter bill number for this completion
  * Multiple bill numbers stored per item (array)
  * Track remaining quantity
- Order status calculation:
  * "Open" = No items completed (completedQuantity = 0 for all)
  * "Partially Completed" = Some items completed or partially completed
  * "Completed" = All items fully completed (completedQuantity = quantity for all)

Stock Management on Order Completion:
- Sale Orders: Restore stock when completed (because it was already reduced on creation)
- Purchase Orders: Increase stock when completed (receiving goods)

#### Order Operations:
- Select individual orders (checkboxes)
- Select all orders (checkbox in header)
- Bulk delete selected orders
- Manual CSV export (button to export current view)
- Manual CSV import (button to import orders)
- Expand/collapse order details to see all line items

### 4. DASHBOARD
- Overview with key metrics cards:
  * Total Items (count of unique items)
  * Total Orders (all purchase + sale orders)
  * Pending Orders (orders not completed)
  * Total Admins (approved users count)
- Quick action buttons:
  * Create Purchase Order
  * Create Sale Order
  * Manage Items
  * View All Orders
  * View Pending Orders
- Color-coded cards:
  * Purchase orders: Blue theme
  * Sale orders: Green theme
  * General stats: Red/gray theme

### 5. NAVIGATION
Left Sidebar Menu:
- Dashboard (LayoutDashboard icon)
- Items (Package icon)
- Purchase Order (ShoppingCart icon - blue highlight)
- Sale Order (ShoppingBag icon - green highlight)
- All Orders (FileText icon)
- Pending Orders (Clock icon)
- Approvals (UserCheck icon)
- Users (Users icon)
- Logout button at bottom (LogOut icon, red background)

Header:
- MFOI Admin System title
- Welcome message with admin name
- Database status badge (Cloud Sync/Local Mode)
- Hamburger menu for mobile

## DATABASE SCHEMA

### Table: admins
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```
NOTE: No password column - passwords managed by Supabase Auth

### Table: items
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Nut', 'Bolts', 'Fasteners', 'Screw', 'Scapfolding Items', 'Washer', 'Hand Tools')),
  sizes JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
sizes JSONB format: [{"size": "M6", "stock": 1000}, {"size": "M8", "stock": 500}]

### Table: orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no TEXT UNIQUE NOT NULL,
  order_date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Partially Completed', 'Completed')),
  order_type TEXT NOT NULL CHECK (order_type IN ('purchase', 'sale')),
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
items JSONB format: 
```json
[{
  "id": "item-1",
  "itemId": "uuid-of-item",
  "itemName": "Hex Bolt",
  "size": "M8",
  "quantity": 100,
  "completedQuantity": 50,
  "price": 5.50,
  "lineTotal": 550.00,
  "billNumbers": ["BILL-001", "BILL-002"]
}]
```

### Row-Level Security (RLS) Policies
All tables must have RLS enabled with these policies:
- Users must be authenticated (logged in via Supabase Auth)
- Users must have an approved admin record (approved = true)
- Admins can read all data
- Admins can insert/update/delete data
- Superadmins have elevated permissions for user management
- Admins can only update their own profile unless they're superadmin

## TYPESCRIPT TYPES

```typescript
export type ItemCategory = 'Nut' | 'Bolts' | 'Fasteners' | 'Screw' | 'Scapfolding Items' | 'Washer' | 'Hand Tools';

export interface ItemSize {
  size: string;
  stock: number;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  sizes: ItemSize[];
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  size: string;
  quantity: number;
  completedQuantity: number;
  price: number;
  lineTotal: number;
  billNumbers?: string[];
}

export interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  partyName: string;
  items: OrderItem[];
  total: number;
  status: 'Open' | 'Partially Completed' | 'Completed';
  createdBy: string;
  createdByName: string;
  orderType: 'purchase' | 'sale';
}

export interface Admin {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  approved: boolean;
  createdAt?: string;
}
```

## COMPONENT STRUCTURE

### Main App (App.tsx)
- Root component with authentication state
- Navigation state management
- Sidebar with menu items
- Header with branding and status
- Route to different views based on currentView state
- Handle login/logout

### Login (Login.tsx)
- Email/password login form
- New admin signup form (creates pending admin)
- Uses Supabase Auth (signInWithEmail, signUp)
- Check if admin exists and is approved after login
- Show "pending approval" message if not approved

### Dashboard (Dashboard.tsx)
- Display stat cards with counts
- Quick action buttons
- Navigate to other views

### ItemsList (ItemsList.tsx)
- Display all items in table format
- Search and filter functionality
- Add item modal (item name, category, sizes with stock)
- Edit item modal (update details, adjust stock)
- Delete item confirmation

### CreateOrder (CreateOrder.tsx)
- Props: adminName, adminEmail, orderType ('purchase' | 'sale')
- Order information form (order number, date, party name)
- Add multiple line items
- Item selection dropdown (from items table)
- Size selection dropdown (from selected item's sizes)
- Quantity and price inputs
- Show line total per item
- Show grand total
- Validate stock for sale orders
- Submit order and adjust stock

### OrdersList (OrdersList.tsx)
- Props: filter ('all' | 'pending'), orderType ('purchase' | 'sale')
- Display orders in table
- Expandable rows to show line items
- Complete item button with modal:
  * Enter completed quantity
  * Enter bill number
  * Update stock based on order type
- Select checkboxes for each order
- Select all checkbox
- Bulk delete button
- Export CSV button (current filtered view)
- Import CSV button

### AdminApproval (AdminApproval.tsx)
- List pending admin requests
- Approve button: Set approved = true
- Reject button: Delete admin record
- Only accessible to approved admins

### UserManagement (UserManagement.tsx)
- List all admins
- Edit admin modal: Change name, email, role
- Delete admin button (with confirmation)
- Password reset button (sends Supabase email)
- Cannot edit own role
- Cannot delete self
- NO password display anywhere

## UTILITY FUNCTIONS

### supabase.ts
- Create Supabase client with env variables
- Export client and database types
- Check if Supabase is configured

### auth-helpers.ts
- signInWithEmail(email, password)
- signUpWithEmail(email, password, name)
- signOut()
- getCurrentUser()
- resetPassword(email)

### storage.ts
- getItems(), addItem(), updateItem(), deleteItem()
- getOrders(), addOrder(), updateOrder(), deleteOrder()
- completeOrder(orderId, itemId, completedQty, billNumber)
- getAdmins(), addAdmin(), updateAdmin(), deleteAdmin()
- Fallback to localStorage if Supabase not configured

### csvExport.ts
- exportOrdersToCSV(orders, filename)
- importOrdersFromCSV(file)

## DATA INITIALIZATION

Default admin (if no Supabase):
- Email: admin@fastener.com
- Password: admin123
- Name: Super Admin
- Role: superadmin
- Approved: true

Default items (120+ items):
Include common fasteners like:
- Hex Bolts (various sizes)
- Hex Nuts (various sizes)
- Washers (various sizes)
- Screws (various types and sizes)
- Scaffolding items
- Hand tools
(Provide comprehensive list of 120+ items with realistic stock quantities)

## UI/UX REQUIREMENTS

### General:
- Clean, modern design
- Responsive (desktop, tablet, mobile)
- Loading states for all async operations
- Success/error toast notifications (use Sonner)
- Confirmation dialogs for destructive actions
- Form validation with error messages

### Colors:
- Primary: Red (#DC2626)
- Secondary: Dark Gray (#1F2937, #111827)
- Success: Green (#059669)
- Info: Blue (#2563EB)
- Backgrounds: White (#FFFFFF), Light Gray (#F9FAFB)

### Components:
- Use Radix UI primitives (Dialog, Select, Checkbox, etc.)
- Lucide React icons throughout
- Tailwind CSS for styling
- Consistent spacing and sizing
- Hover states and transitions
- Focus states for accessibility

## SECURITY BEST PRACTICES

1. **Never store plaintext passwords**
   - Use Supabase Auth for all password management
   - Passwords automatically bcrypt hashed by Supabase

2. **Never display passwords**
   - Remove password fields from all forms
   - Use password reset email flow instead

3. **Implement Row-Level Security**
   - Enable RLS on all tables
   - Require authentication for all operations
   - Verify admin approval status

4. **Validate all inputs**
   - Server-side validation in database constraints
   - Client-side validation in forms
   - Sanitize user inputs

5. **Handle errors securely**
   - Don't expose sensitive error details
   - Log errors server-side
   - Show user-friendly messages

## DEPLOYMENT

### Environment Variables:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Vercel Deployment:
- Auto-deploy from GitHub
- Set environment variables in Vercel dashboard
- Build command: npm run build
- Output directory: dist

### Supabase Setup:
1. Create tables using migration SQL
2. Enable RLS on all tables
3. Apply security policies
4. Configure email settings for password reset
5. Create first superadmin user

## ADDITIONAL FEATURES

### CSV Import/Export:
- Export orders to CSV with all details
- Import orders from CSV
- Validate imported data
- Handle errors gracefully

### Search & Filter:
- Search items by name
- Filter items by category
- Search orders by party name, order number
- Filter orders by status, date range, order type

### Responsive Design:
- Mobile-friendly sidebar (hamburger menu)
- Touch-friendly buttons and inputs
- Responsive tables (horizontal scroll on mobile)
- Adaptive layouts for different screen sizes

### Real-time Updates:
- Use Supabase real-time subscriptions where beneficial
- Auto-refresh data after CRUD operations
- Show loading indicators during updates

## SUCCESS CRITERIA

The system should:
✅ Allow secure admin login with approval workflow
✅ Manage 120+ fastener items with multiple sizes
✅ Create purchase and sale orders with multiple items
✅ Track stock automatically (reduce on sale, increase on purchase completion)
✅ Support partial order completion with bill numbers
✅ Provide clear separation between purchase and sale orders
✅ Include dashboard with key metrics
✅ Support CSV import/export for orders
✅ Implement production-grade security (no plaintext passwords, RLS)
✅ Be fully responsive and user-friendly
✅ Sync data across all devices via Supabase
✅ Work offline with localStorage fallback
✅ Be deployable to Vercel with minimal configuration

## NOTES

- This is an internal admin system (not public-facing)
- Optimized for desktop use but must work on tablets/mobile
- Performance is important (lazy loading, pagination if needed)
- Accessibility considerations (keyboard nav, ARIA labels)
- Clear visual feedback for all user actions
- Comprehensive error handling throughout
```

---

## SHORT VERSION (Quick Prompt)

If you need a shorter version:

```
Build a fastener inventory and order management admin system with:
- React + TypeScript + Supabase + Tailwind CSS
- Multi-admin with role-based access (approval workflow)
- 120+ fastener items (7 categories, multiple sizes per item)
- Purchase & Sale orders (multi-item, different sizes per order)
- Partial order completion (complete items at different times with bill numbers)
- Automatic stock management (reduce on sale, increase on purchase completion)
- Dark gray/black header with red accents (MFOI branding)
- Separate tabs for Purchase/Sale orders
- Dashboard with stats, order management, admin approval
- CSV export/import, bulk delete, order selection
- Production-ready security (Supabase Auth, RLS policies, no plaintext passwords)
- Responsive design with mobile sidebar
```

---

## HOW TO USE THIS PROMPT

### To Recreate the System:
Copy the "SYSTEM OVERVIEW PROMPT" section and paste it to an AI assistant like:
- Claude
- ChatGPT
- GitHub Copilot
- Cursor AI

### To Explain the System:
Use the SHORT VERSION to quickly describe what the system does.

### To Get Help:
Combine this prompt with your specific question:
```
[Paste SHORT VERSION]

I need help with: [your specific question]
```

### To Train Team Members:
Share this document so new developers understand the system requirements and architecture.

---

**Created:** February 3, 2026  
**Version:** 1.0 (Production-Ready with Security Upgrade)
