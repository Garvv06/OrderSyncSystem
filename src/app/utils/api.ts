import { supabase } from './supabase';
import { getAdmins, saveAdmin, updateAdmin, deleteAdmin } from './storage';
import { Admin } from '../types';

// Session storage for active tokens
const activeSessions = new Map<string, { email: string; expiresAt: number }>();

function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const api = {
  async login(email: string, password: string) {
    try {
      const admins = await getAdmins();
      const admin = admins.find((a) => a.email === email && a.password === password);

      if (!admin) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (!admin.approved) {
        return { success: false, error: 'Your account is pending approval' };
      }

      const token = generateToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      activeSessions.set(token, { email: admin.email, expiresAt });

      return {
        success: true,
        token,
        admin: { email: admin.email, name: admin.name, role: admin.role },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  },

  async signup(email: string, password: string, name: string) {
    try {
      const admins = await getAdmins();
      
      // Check if email already exists
      if (admins.some((a) => a.email === email)) {
        return { success: false, error: 'Email already exists' };
      }

      // Create new admin (not approved by default)
      const newAdmin: Admin = {
        email,
        password,
        name,
        role: 'admin',
        approved: false,
      };

      await saveAdmin(newAdmin);

      return { success: true, pending: true, message: 'Account created. Pending approval from existing admin.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  },

  async verify(token: string) {
    try {
      const session = activeSessions.get(token);
      if (!session) {
        return { valid: false };
      }

      if (Date.now() > session.expiresAt) {
        activeSessions.delete(token);
        return { valid: false };
      }

      const admins = await getAdmins();
      const admin = admins.find((a) => a.email === session.email);

      if (!admin || !admin.approved) {
        return { valid: false };
      }

      return {
        valid: true,
        admin: { email: admin.email, name: admin.name, role: admin.role },
      };
    } catch (error) {
      console.error('Verify error:', error);
      return { valid: false };
    }
  },

  async logout(token: string) {
    activeSessions.delete(token);
    return { success: true };
  },

  async getPendingAdmins(token: string) {
    try {
      const session = activeSessions.get(token);
      if (!session) {
        throw new Error('Invalid token');
      }

      const admins = await getAdmins();
      return { pendingAdmins: admins.filter((a) => !a.approved) };
    } catch (error) {
      console.error('Get pending admins error:', error);
      return { pendingAdmins: [] };
    }
  },

  async approveAdmin(token: string, email: string) {
    try {
      const session = activeSessions.get(token);
      if (!session) {
        throw new Error('Invalid token');
      }

      await updateAdmin(email, { approved: true });
      return { success: true };
    } catch (error) {
      console.error('Approve admin error:', error);
      return { success: false };
    }
  },

  async rejectAdmin(token: string, email: string) {
    try {
      const session = activeSessions.get(token);
      if (!session) {
        throw new Error('Invalid token');
      }

      await deleteAdmin(email);
      return { success: true };
    } catch (error) {
      console.error('Reject admin error:', error);
      return { success: false };
    }
  },

  // Legacy methods for backward compatibility
  async getItems(token: string) {
    return { items: [] }; // Will be handled by storage.ts
  },

  async saveItems(token: string, items: any[]) {
    return { success: true }; // Will be handled by storage.ts
  },

  async getOrders(token: string) {
    return { orders: [] }; // Will be handled by storage.ts
  },

  async saveOrders(token: string, orders: any[]) {
    return { success: true }; // Will be handled by storage.ts
  },
};