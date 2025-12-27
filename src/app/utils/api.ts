// Simple API for localStorage-based authentication
const API_URL = 'http://localhost:3000'; // Placeholder - not used with localStorage

export const api = {
  async signup(email: string, password: string, name: string) {
    // Store pending admin request
    const pendingAdmins = JSON.parse(localStorage.getItem('pending_admins') || '[]');
    
    // Check if already exists
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.find((a: any) => a.email === email)) {
      return { error: 'Admin with this email already exists' };
    }
    
    if (pendingAdmins.find((a: any) => a.email === email)) {
      return { error: 'Request already pending for this email' };
    }

    const newRequest = {
      id: `pending_${Date.now()}`,
      email,
      password, // In production, this would be hashed
      name,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    pendingAdmins.push(newRequest);
    localStorage.setItem('pending_admins', JSON.stringify(pendingAdmins));

    return { 
      message: 'Account request submitted. Please wait for admin approval.',
      pending: true
    };
  },

  async getPendingAdmins(token: string) {
    const pendingAdmins = JSON.parse(localStorage.getItem('pending_admins') || '[]');
    return { pendingAdmins: pendingAdmins.filter((a: any) => a.status === 'pending') };
  },

  async approveAdmin(token: string, requestId: string) {
    const pendingAdmins = JSON.parse(localStorage.getItem('pending_admins') || '[]');
    const request = pendingAdmins.find((a: any) => a.id === requestId);
    
    if (!request) {
      return { error: 'Request not found' };
    }

    // Add to approved admins
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    admins.push({
      email: request.email,
      password: request.password,
      name: request.name,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('admins', JSON.stringify(admins));

    // Update pending status
    const updated = pendingAdmins.map((a: any) => 
      a.id === requestId ? { ...a, status: 'approved' } : a
    );
    localStorage.setItem('pending_admins', JSON.stringify(updated));

    return { message: 'Admin approved successfully' };
  },

  async rejectAdmin(token: string, requestId: string) {
    const pendingAdmins = JSON.parse(localStorage.getItem('pending_admins') || '[]');
    const updated = pendingAdmins.map((a: any) => 
      a.id === requestId ? { ...a, status: 'rejected' } : a
    );
    localStorage.setItem('pending_admins', JSON.stringify(updated));

    return { message: 'Admin request rejected' };
  },

  async login(email: string, password: string) {
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find((a: any) => a.email === email && a.password === password);

    if (!admin) {
      // Check if request is pending
      const pendingAdmins = JSON.parse(localStorage.getItem('pending_admins') || '[]');
      const pending = pendingAdmins.find((a: any) => a.email === email && a.status === 'pending');
      
      if (pending) {
        return { error: 'Your account is pending approval. Please wait for admin approval.' };
      }
      
      return { error: 'Invalid credentials' };
    }

    const token = btoa(JSON.stringify({ email, name: admin.name, timestamp: Date.now() }));
    
    // Store session
    localStorage.setItem('current_session', token);
    localStorage.setItem(`session_${token}`, JSON.stringify({
      email: admin.email,
      name: admin.name,
      createdAt: new Date().toISOString(),
    }));

    return {
      token,
      admin: {
        email: admin.email,
        name: admin.name,
      }
    };
  },

  async verify(token: string) {
    const session = localStorage.getItem(`session_${token}`);
    
    if (!session) {
      return { error: 'Invalid session', valid: false };
    }

    const sessionData = JSON.parse(session);
    return {
      valid: true,
      admin: {
        email: sessionData.email,
        name: sessionData.name,
      }
    };
  },

  async logout(token: string) {
    localStorage.removeItem(`session_${token}`);
    localStorage.removeItem('current_session');
    return { message: 'Logged out successfully' };
  },

  async getItems(token: string) {
    const items = JSON.parse(localStorage.getItem('fastener_items') || '[]');
    return { items };
  },

  async saveItems(token: string, items: any[]) {
    localStorage.setItem('fastener_items', JSON.stringify(items));
    return { message: 'Items saved successfully' };
  },

  async getOrders(token: string) {
    const orders = JSON.parse(localStorage.getItem('fastener_orders') || '[]');
    return { orders };
  },

  async saveOrders(token: string, orders: any[]) {
    localStorage.setItem('fastener_orders', JSON.stringify(orders));
    return { message: 'Orders saved successfully' };
  },

  async getOrderCounter(token: string) {
    const counter = parseInt(localStorage.getItem('fastener_order_counter') || '0');
    return { counter };
  },

  async saveOrderCounter(token: string, counter: number) {
    localStorage.setItem('fastener_order_counter', counter.toString());
    return { message: 'Counter saved successfully' };
  },
};

// Initialize with default admin account
const initializeAdmin = () => {
  const admins = JSON.parse(localStorage.getItem('admins') || '[]');
  if (admins.length === 0) {
    admins.push({
      email: 'admin@fastener.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('admins', JSON.stringify(admins));
  }
};

initializeAdmin();