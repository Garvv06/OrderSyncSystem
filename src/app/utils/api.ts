import { supabase } from './supabase';
import { getAdmins, saveAdmin, updateAdmin, deleteAdmin } from './storage';
import { Admin } from '../types';

// Session storage for active tokens - persisted in localStorage
const SESSION_STORAGE_KEY = 'admin_sessions';

function getActiveSessions(): Map<string, { email: string; expiresAt: number }> {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) {
    try {
      const sessions = JSON.parse(stored);
      return new Map(Object.entries(sessions));
    } catch (error) {
      console.error('Failed to parse sessions:', error);
    }
  }
  return new Map();
}

function saveActiveSessions(sessions: Map<string, { email: string; expiresAt: number }>) {
  const sessionsObj = Object.fromEntries(sessions.entries());
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionsObj));
}

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
      const sessions = getActiveSessions();
      sessions.set(token, { email: admin.email, expiresAt });
      saveActiveSessions(sessions);

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
        return { success: false, message: 'Email already exists' };
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

      return { success: true, message: '✅ Registration successful! Your request is pending approval from an existing admin.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  },

  // Alias for signup (for backward compatibility)
  async register(email: string, password: string, name: string) {
    return this.signup(email, password, name);
  },

  async verify(token: string) {
    try {
      const session = getActiveSessions().get(token);
      if (!session) {
        return { valid: false };
      }

      if (Date.now() > session.expiresAt) {
        const sessions = getActiveSessions();
        sessions.delete(token);
        saveActiveSessions(sessions);
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
    const sessions = getActiveSessions();
    sessions.delete(token);
    saveActiveSessions(sessions);
    return { success: true };
  },

  async getPendingAdmins(token: string) {
    try {
      const session = getActiveSessions().get(token);
      if (!session) {
        throw new Error('Invalid token');
      }

      const admins = await getAdmins();
      const pendingAdmins = admins
        .filter((a) => !a.approved)
        .map((a) => ({
          id: a.email, // Using email as ID for approval/rejection
          email: a.email,
          password: a.password,
          name: a.name,
          requestedAt: a.createdAt || new Date().toISOString(),
          status: 'pending' as const,
        }));
      
      return { success: true, admins: pendingAdmins };
    } catch (error) {
      console.error('Get pending admins error:', error);
      return { success: false, admins: [] };
    }
  },

  async approveAdmin(token: string, email: string) {
    try {
      const session = getActiveSessions().get(token);
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
      const session = getActiveSessions().get(token);
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

  async getAdmins(token: string) {
    try {
      const session = getActiveSessions().get(token);
      if (!session) {
        return { success: false, message: 'Invalid token' };
      }

      const admins = await getAdmins();
      const sanitizedAdmins = admins
        .filter(a => a.approved) // Only show approved admins
        .map(a => ({
          email: a.email,
          name: a.name,
          role: a.role,
          password: a.password, // Include password for editing
        }));

      return { success: true, admins: sanitizedAdmins };
    } catch (error) {
      console.error('Get admins error:', error);
      return { success: false, message: 'Failed to get admins' };
    }
  },

  async deleteAdmin(token: string, email: string) {
    try {
      const session = getActiveSessions().get(token);
      if (!session) {
        throw new Error('Invalid token');
      }

      await deleteAdmin(email);
      return { success: true };
    } catch (error) {
      console.error('Delete admin error:', error);
      return { success: false, message: 'Failed to delete admin' };
    }
  },

  async updateAdmin(token: string, oldEmail: string, newEmail: string, newPassword: string) {
    try {
      const session = getActiveSessions().get(token);
      if (!session) {
        return { success: false, message: 'Invalid token' };
      }

      const updates: any = { email: newEmail };
      if (newPassword) {
        updates.password = newPassword;
      }

      await updateAdmin(oldEmail, updates);
      
      return { success: true };
    } catch (error) {
      console.error('Update admin error:', error);
      return { success: false, message: 'Failed to update admin' };
    }
  },

  async updateAdminFull(token: string, oldEmail: string, name: string, newEmail: string, password: string, role: 'admin' | 'superadmin') {
    try {
      const session = getActiveSessions().get(token);
      if (!session) {
        return { success: false, message: 'Invalid token' };
      }

      const updates = {
        name,
        email: newEmail,
        password,
        role,
      };

      await updateAdmin(oldEmail, updates);
      
      return { success: true };
    } catch (error) {
      console.error('Update admin full error:', error);
      return { success: false, message: 'Failed to update admin' };
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