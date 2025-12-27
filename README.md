# MFOI - Fastener Order Management System

A comprehensive admin-only order management system for fastener inventory with multi-admin support, partial order completion, role-based access control, and **cloud database sync across all devices**.

## 🌐 **NEW: Cloud Database - Access from Any Device!**

Your MFOI system now supports **Supabase** cloud database with automatic fallback to localStorage:

✅ **Works immediately** - Uses localStorage by default (no setup required)  
✅ **Upgrade to cloud** - 5-minute Supabase setup for multi-device sync  
✅ **Same data on all devices** - Laptop, mobile, tablet, desktop (after Supabase setup)  
✅ **Real-time sync** - Changes visible instantly everywhere (cloud mode)  
✅ **No data loss** - Everything stored safely  

**Current Mode:** Local Storage (device-only)  
**To Enable Cloud Sync:** See [SUPABASE_SETUP.md](/SUPABASE_SETUP.md) for 5-minute setup

## 🚀 Features

### 📦 **Order Management**
- **Multi-Item Orders**: Add multiple items with different sizes to one order
- **Partial Completion**: Complete orders in multiple shipments with separate bill numbers
- **Bill Tracking**: Track multiple bill numbers per order item
- **Party Management**: Filter and search orders by party name
- **Order Status**: Open → Partially Completed → Completed
- **Delete Orders**: Remove open, partial, or completed orders

### 🔧 **Inventory Management**
- **79 Default Items** across 7 categories
- **Multiple Sizes**: Each item can have multiple sizes with individual stock levels
- **Inline Editing**: Edit items directly in the list (no scrolling)
- **Stock Tracking**: Automatic stock reduction on order completion
- **Low Stock Alerts**: Visual warnings for items with stock < 100

### 👥 **User Management**
- **Multi-Admin System**: Multiple admins can access the system
- **Role-Based Access**:
  - **Super Admin**: Full system control + user management
  - **Admin**: Full access except user management
- **Credential Management**: Super Admin can edit any user's email/password
- **Admin Approval**: New signups require approval from existing admins

### 📊 **Dashboard**
- Total orders, completed orders, pending orders
- Total revenue tracking
- Quick navigation to all sections
- User-specific statistics

## 🎨 **Design Features**
- Professional white interface with red accents matching MFOI logo
- Responsive design for desktop and tablet
- Inline editing for better UX
- Progress indicators for workflows
- Clean, modern UI with clear visual hierarchy

## 🔐 **Default Credentials**

**Super Admin Account:**
- Email: admin@fastener.com
- Password: admin123

## 📝 **How to Use**

### **Placing an Order (5-Step Workflow)**

1. **Enter Party Name** → ABC Industries
2. **Select Category** → Nuts
3. **Select Item** → SS Nut
4. **Add Multiple Sizes**:
   - M6: 100 units @ ₹10 = ₹1000
   - M8: 50 units @ ₹12 = ₹600
   - M10: 30 units @ ₹15 = ₹450
5. **Add to Order** → Can add more items from other categories
6. **Submit Order** → Order created as "Open"

### **Partial Order Completion**

**Scenario**: Order has 3 items, but you only have stock for 2

1. Go to **Remaining Orders**
2. Click **Complete Items** (green checkmark icon)
3. See **Previous Bills** (if any)
4. **Select quantities** to complete:
   - SS Nut M6: 50 out of 100 (partial)
   - SS Nut M8: 50 out of 50 (full)
   - SS Nut M10: 0 out of 30 (skip)
5. Enter **Bill Number**: BILL-001
6. Click **Complete Selected Items**
7. Stock reduced only for completed quantities
8. Order status → "Partially Completed"
9. Later, complete remaining items with a new bill number

### **User Management (Super Admin Only)**

**Edit User Credentials:**
1. Go to **User Management**
2. Click **Edit Credentials** on any user
3. Change **Name**, **Email**, or **Password**
4. Changes affect login immediately
5. Orders are automatically updated if email changes

**Change User Role:**
1. Click **Change Role** on any user (except yourself)
2. Select **Admin** or **Super Admin**
3. Click **Save**

**Delete User:**
1. Click **Delete User** (cannot delete yourself)
2. Confirm deletion

### **Item Management**

**Add New Item:**
1. Go to **Item List**
2. Click **Add New Item**
3. Enter item name and category
4. Add multiple sizes with stock levels
5. Click **Save Item**

**Edit Item (Inline):**
1. Find item in list
2. Click **Edit** icon
3. Edit form appears **right there** (no scrolling!)
4. Modify sizes, stock, or name
5. Click **Update Item**

**Stock Updates:**
- Stock fields properly handle zero values (won't just overwrite)
- Can set stock to 0, 10, 100, etc. without issues

## 🛠️ **Technical Details**

### **Built With**
- React + TypeScript
- Tailwind CSS v4.0
- Lucide React Icons
- Supabase for cloud database

### **Key Files**
- `/src/app/App.tsx` - Main application
- `/src/app/components/NewOrder.tsx` - Order creation (multi-size selection)
- `/src/app/components/OrdersList.tsx` - Order viewing & partial completion
- `/src/app/components/UserManagement.tsx` - User credential management
- `/src/app/components/ItemsList.tsx` - Inline item editing
- `/src/app/utils/storage.ts` - Data persistence layer
- `/src/app/types.ts` - TypeScript definitions

### **Data Structure**

**Order Item:**
```typescript
{
  id: string;
  itemId: string;
  itemName: string;
  size: string;
  quantity: number;              // Total ordered
  completedQuantity: number;     // Amount completed so far
  price: number;
  lineTotal: number;
  billNumbers: string[];         // Multiple bills per item
}
```

**Order Status:**
- `Open` - Nothing completed
- `Partially Completed` - Some items/quantities completed
- `Completed` - All items fully completed

## 🌐 **Deployment**

### **🎯 Complete Setup (First Time)**

**Step 1: Set Up Supabase (5 minutes)**
Follow the detailed guide: [SUPABASE_SETUP.md](/SUPABASE_SETUP.md)

Quick summary:
1. Create free Supabase account at https://supabase.com
2. Create new project (wait 2-3 minutes)
3. Copy Project URL and anon key from Settings → API
4. Run SQL migration from `/supabase/migrations/001_initial_schema.sql`

**Step 2: Deploy to Vercel**
1. Push your code to GitHub
2. Go to https://vercel.com and sign in
3. Click **"New Project"**
4. Import your GitHub repository
5. **Add Environment Variables**:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy**
7. Wait 2-3 minutes
8. Get your live URL: `https://your-app.vercel.app`

**Step 3: Test Multi-Device Access**
1. Open your Vercel URL on laptop
2. Login: admin@fastener.com / admin123
3. Create an order
4. Open same URL on mobile
5. Login with same credentials
6. See the same order! ✅

### **📱 Access Your App**

**From Any Device:**
- **Laptop**: Open browser → Your Vercel URL → Login
- **Mobile**: Open browser → Same URL → Same login
- **Tablet**: Open browser → Same URL → Same login
- **Desktop**: Open browser → Same URL → Same login

**All devices will see the same data in real-time!**

### **🔄 Update Deployment (After Changes)**

If you request any changes:
1. Changes will be made to the code
2. Push to GitHub
3. Vercel automatically redeploys
4. Refresh your browser to see updates
5. No data loss - everything stays in Supabase

### **Local Development**
```bash
# Create .env file
echo "VITE_SUPABASE_URL=your_url" > .env
echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env

# Install and run
npm install
npm run dev
```
Access at: http://localhost:5173

### **Option 2: Build for Production**
```bash
npm run build
```
Deploy the `/dist` folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

### **Option 3: Deploy to Vercel (Recommended)**
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically
4. Access via provided URL

**Live URL**: Your Vercel deployment URL will be something like:
`https://your-project-name.vercel.app`

## 📱 **Browser Support**

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with localStorage support

## 🔒 **Security Notes**

- This is an admin-only system (no customer access)
- Authentication via localStorage (browser-based)
- Multi-admin support with role-based permissions
- Super Admin required to manage users
- Data persists locally in browser storage

## 💡 **Tips**

1. **Partial Orders**: Use when you fulfill orders in multiple shipments
2. **Bill Numbers**: Use alphanumeric codes like "BILL-001", "INV-2024-123"
3. **Stock Management**: System automatically reduces stock only for completed quantities
4. **User Roles**: Use Admin for regular users, Super Admin for managers
5. **Inline Editing**: Edit items without losing your place in the list
6. **Multi-Size Orders**: Add all sizes of an item in one go during order creation

## 📞 **Support**

For changes or updates, describe your requirements and they will be implemented immediately.

## 📄 **License**

Proprietary - MFOI Internal Use Only

---

**Built with ❤️ for MFOI**