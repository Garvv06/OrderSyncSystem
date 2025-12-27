import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const app = new Hono();

// Middleware
app.use('*', cors({ origin: '*', credentials: true }));
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to get authenticated user
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', user: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Unauthorized - invalid or expired token', user: null };
  }
  
  return { error: null, user };
}

// Initialize default admin on first run
app.get('/make-server-cd6a3d2a/init', async (c) => {
  try {
    // Check if any admin exists
    const admins = await kv.getByPrefix('admin_');
    if (admins && admins.length > 0) {
      return c.json({ message: 'System already initialized' });
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123');
    await kv.set('admin_admin@fastener.com', {
      email: 'admin@fastener.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      message: 'Default admin created successfully',
      credentials: {
        email: 'admin@fastener.com',
        password: 'admin123',
        note: 'Please change this password after first login'
      }
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return c.json({ error: 'Initialization failed: ' + error.message }, 500);
  }
});

// Admin Signup
app.post('/make-server-cd6a3d2a/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Check if admin already exists
    const existing = await kv.get(`admin_${email}`);
    if (existing) {
      return c.json({ error: 'Admin with this email already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password);
    
    // Store admin
    await kv.set(`admin_${email}`, {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      message: 'Admin account created successfully',
      admin: { email, name }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed: ' + error.message }, 500);
  }
});

// Admin Login
app.post('/make-server-cd6a3d2a/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get admin
    const admin = await kv.get(`admin_${email}`);
    if (!admin) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create session token (simple JWT-like token)
    const sessionToken = btoa(JSON.stringify({
      email: admin.email,
      name: admin.name,
      timestamp: Date.now(),
    }));

    // Store session
    await kv.set(`session_${sessionToken}`, {
      email: admin.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    return c.json({
      token: sessionToken,
      admin: {
        email: admin.email,
        name: admin.name,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed: ' + error.message }, 500);
  }
});

// Verify Session
app.post('/make-server-cd6a3d2a/verify', async (c) => {
  try {
    const { token } = await c.req.json();
    
    if (!token) {
      return c.json({ error: 'Token required' }, 400);
    }

    const session = await kv.get(`session_${token}`);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await kv.del(`session_${token}`);
      return c.json({ error: 'Session expired' }, 401);
    }

    // Get admin details
    const admin = await kv.get(`admin_${session.email}`);
    if (!admin) {
      return c.json({ error: 'Admin not found' }, 401);
    }

    return c.json({
      valid: true,
      admin: {
        email: admin.email,
        name: admin.name,
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return c.json({ error: 'Verification failed: ' + error.message }, 500);
  }
});

// Logout
app.post('/make-server-cd6a3d2a/logout', async (c) => {
  try {
    const { token } = await c.req.json();
    
    if (token) {
      await kv.del(`session_${token}`);
    }

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed: ' + error.message }, 500);
  }
});

// Get all items
app.get('/make-server-cd6a3d2a/items', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const items = await kv.getByPrefix('item_');
    return c.json({ items: items || [] });
  } catch (error) {
    console.error('Get items error:', error);
    return c.json({ error: 'Failed to fetch items: ' + error.message }, 500);
  }
});

// Save items
app.post('/make-server-cd6a3d2a/items', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { items } = await c.req.json();
    
    // Save each item
    for (const item of items) {
      await kv.set(`item_${item.id}`, item);
    }

    return c.json({ message: 'Items saved successfully' });
  } catch (error) {
    console.error('Save items error:', error);
    return c.json({ error: 'Failed to save items: ' + error.message }, 500);
  }
});

// Get all orders
app.get('/make-server-cd6a3d2a/orders', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orders = await kv.getByPrefix('order_');
    return c.json({ orders: orders || [] });
  } catch (error) {
    console.error('Get orders error:', error);
    return c.json({ error: 'Failed to fetch orders: ' + error.message }, 500);
  }
});

// Save orders
app.post('/make-server-cd6a3d2a/orders', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { orders } = await c.req.json();
    
    // Save each order
    for (const order of orders) {
      await kv.set(`order_${order.id}`, order);
    }

    return c.json({ message: 'Orders saved successfully' });
  } catch (error) {
    console.error('Save orders error:', error);
    return c.json({ error: 'Failed to save orders: ' + error.message }, 500);
  }
});

// Get order counter
app.get('/make-server-cd6a3d2a/order-counter', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const counter = await kv.get('order_counter');
    return c.json({ counter: counter || 0 });
  } catch (error) {
    console.error('Get counter error:', error);
    return c.json({ error: 'Failed to fetch counter: ' + error.message }, 500);
  }
});

// Save order counter
app.post('/make-server-cd6a3d2a/order-counter', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { counter } = await c.req.json();
    await kv.set('order_counter', counter);

    return c.json({ message: 'Counter saved successfully' });
  } catch (error) {
    console.error('Save counter error:', error);
    return c.json({ error: 'Failed to save counter: ' + error.message }, 500);
  }
});

Deno.serve(app.fetch);
