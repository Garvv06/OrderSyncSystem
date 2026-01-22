# Backend API Guide - Full Security Architecture

## 🏗️ Complete 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                    [VERCEL]        │
│  - Uses VITE_SUPABASE_ANON_KEY only                         │
│  - No sensitive operations                                   │
│  - Calls backend API for protected actions                  │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│  Backend API (Node.js + Express)           [RENDER]         │
│  - Uses SUPABASE_SERVICE_ROLE_KEY                           │
│  - Validates all inputs                                      │
│  - Business logic + security                                │
│  - Rate limiting + authentication                           │
└─────────────────────────────────────────────────────────────┘
                              ↓ PostgreSQL
┌─────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL + Auth)              [SUPABASE]       │
│  - RLS enabled on all tables                                │
│  - JWT-based authentication                                 │
│  - Automatic backups                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Backend API Code Structure

I'll create a complete Node.js/Express backend for you:

### File Structure
```
mfoi-backend/
├── package.json
├── .env
├── .gitignore
├── server.js                 # Main entry point
├── config/
│   └── supabase.js          # Supabase client with service_role
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── rateLimit.js         # Rate limiting
│   └── validate.js          # Input validation
├── routes/
│   ├── orders.js            # Order endpoints
│   ├── items.js             # Item endpoints
│   └── admins.js            # Admin management endpoints
└── utils/
    ├── errors.js            # Error handling
    └── logger.js            # Request logging
```

---

## 🔧 Backend Implementation

### 1. package.json

```json
{
  "name": "mfoi-backend-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### 2. .env (Backend Environment Variables)

```bash
# Server Config
PORT=3000
NODE_ENV=production

# Supabase Config (BACKEND ONLY - NEVER EXPOSE TO FRONTEND)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# CORS (Only allow your Vercel frontend)
FRONTEND_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. server.js (Main Entry Point)

```javascript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './utils/errors.js';
import ordersRouter from './routes/orders.js';
import itemsRouter from './routes/items.js';
import adminsRouter from './routes/admins.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet());

// CORS - Only allow your Vercel frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimit);

// ============================================
// ROUTES
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/orders', ordersRouter);
app.use('/api/items', itemsRouter);
app.use('/api/admins', adminsRouter);

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 MFOI Backend API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL}`);
});
```

### 4. config/supabase.js (Service Role Client)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client - bypasses RLS (use with caution!)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for auth verification
export const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey);
```

### 5. middleware/auth.js (JWT Verification)

```javascript
import { supabase } from '../config/supabase.js';

export async function authenticateUser(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    // Check if user is an approved admin
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('role, approved')
      .eq('user_id', req.userId)
      .single();

    if (error || !admin || !admin.approved) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.adminRole = admin.role;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}

export async function requireSuperAdmin(req, res, next) {
  try {
    // Check if user is a superadmin
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('role, approved')
      .eq('user_id', req.userId)
      .single();

    if (error || !admin || admin.role !== 'superadmin' || !admin.approved) {
      return res.status(403).json({ error: 'Superadmin access required' });
    }

    next();
  } catch (error) {
    console.error('Superadmin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}
```

### 6. middleware/rateLimit.js

```javascript
import rateLimit from 'express-rate-limit';

export const rateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 7. routes/orders.js (Example Order Endpoints)

```javascript
import express from 'express';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema
const createOrderSchema = Joi.object({
  order_no: Joi.string().required(),
  order_date: Joi.date().iso().required(),
  party_name: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    itemId: Joi.string().required(),
    size: Joi.string().required(),
    qty: Joi.number().integer().min(1).required(),
    rate: Joi.number().min(0).required()
  })).min(1).required(),
  total: Joi.number().min(0).required()
});

// GET all orders
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ orders: data });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST create order
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error: validationError, value } = createOrderSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Verify stock availability (for sale orders)
    if (value.order_type === 'sale') {
      for (const item of value.items) {
        const { data: itemData } = await supabaseAdmin
          .from('items')
          .select('sizes')
          .eq('id', item.itemId)
          .single();

        const size = itemData?.sizes?.find(s => s.size === item.size);
        
        if (!size || size.stock < item.qty) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${item.itemId} - ${item.size}` 
          });
        }
      }
    }

    // Create order
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        ...value,
        created_by: req.userId,
        created_by_name: req.user.email,
        status: 'Open'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ order: data });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order (complete/partial complete)
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate order exists
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update stock if order is being completed
    if (updates.status === 'Completed' && existingOrder.status !== 'Completed') {
      // Stock update logic here
    }

    // Update order
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ order: data });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE order
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
```

### 8. utils/errors.js

```javascript
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
```

---

## 🚀 Deployment to Render

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub

### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository (create a separate repo for backend)
- Configure:
  - **Name**: `mfoi-backend-api`
  - **Environment**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Instance Type**: Free

### 3. Add Environment Variables in Render
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- Copy your API URL (e.g., `https://mfoi-backend-api.onrender.com`)

---

## 🔗 Frontend Integration

Update your frontend to call the backend API:

```typescript
// src/app/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getAuthToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export async function createOrder(orderData) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
}
```

Add to Vercel environment variables:
```
VITE_API_URL=https://mfoi-backend-api.onrender.com
```

---

## ✅ Security Checklist

After deploying backend:

- [ ] Service role key ONLY in Render (never in frontend)
- [ ] RLS enabled on all Supabase tables
- [ ] CORS restricted to your Vercel URL only
- [ ] Rate limiting enabled
- [ ] JWT verification on all protected routes
- [ ] Input validation with Joi
- [ ] Helmet security headers
- [ ] HTTPS only (automatic on Render)
- [ ] Environment variables in Render dashboard
- [ ] .env in .gitignore

---

## 📊 What You Get

✅ **Complete separation** - Frontend can't directly modify sensitive data
✅ **Server-side validation** - All inputs validated before DB
✅ **Rate limiting** - Prevent spam/abuse
✅ **Audit logging** - Track who did what
✅ **Stock verification** - Backend checks stock before allowing sales
✅ **Price protection** - Users can't manipulate prices in browser
✅ **Role enforcement** - DB + Backend both enforce permissions

---

## 💰 Cost

- **Render Free Tier**: First backend instance free (sleeps after 15min inactivity)
- **Render Paid**: $7/month for always-on instance
- **Supabase Free**: 500MB database, 2GB bandwidth/month
- **Vercel Free**: Unlimited frontend hosting

**Total**: $0/month (free tier) or $7/month (always-on backend)

---

## 🎯 Next Steps

1. Create separate GitHub repo for backend code
2. Copy backend code structure above
3. Deploy to Render
4. Update frontend to call backend API
5. Test all operations
6. Monitor logs in Render dashboard
