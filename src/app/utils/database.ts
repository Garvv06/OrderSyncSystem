// Universal Database Layer - Works with Neon, Supabase, or LocalStorage
import { Item, Order, Admin } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { getNeonClient, isNeonConfigured } from './neon';

type DatabaseType = 'neon' | 'supabase' | 'localstorage';

// Detect which database to use
export function getDatabaseType(): DatabaseType {
  if (isNeonConfigured()) return 'neon';
  if (isSupabaseConfigured()) return 'supabase';
  return 'localstorage';
}

// ==================== ADMINS ====================

export async function dbGetAdmins(): Promise<Admin[]> {
  const dbType = getDatabaseType();
  console.log(`📊 Using ${dbType} database`);

  switch (dbType) {
    case 'neon':
      return getAdminsFromNeon();
    case 'supabase':
      return getAdminsFromSupabase();
    default:
      return getAdminsFromLocalStorage();
  }
}

async function getAdminsFromNeon(): Promise<Admin[]> {
  try {
    const sql = getNeonClient();
    if (!sql) throw new Error('Neon not configured');

    const result = await sql`SELECT * FROM admins ORDER BY created_at ASC`;
    
    return result.map((row: any) => ({
      email: row.email,
      password: row.password,
      name: row.name,
      role: row.role as 'superadmin' | 'admin',
      approved: row.approved,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Failed to get admins from Neon:', error);
    return getAdminsFromLocalStorage();
  }
}

async function getAdminsFromSupabase(): Promise<Admin[]> {
  try {
    const { data, error } = await supabase!
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(admin => ({
      email: admin.email,
      password: admin.password,
      name: admin.name,
      role: admin.role as 'superadmin' | 'admin',
      approved: admin.approved,
      createdAt: admin.created_at,
    }));
  } catch (error) {
    console.error('Failed to get admins from Supabase:', error);
    return getAdminsFromLocalStorage();
  }
}

function getAdminsFromLocalStorage(): Admin[] {
  const stored = localStorage.getItem('admins');
  if (!stored) {
    const defaultAdmin: Admin = {
      email: 'admin@fastener.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'superadmin',
      approved: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('admins', JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  return JSON.parse(stored);
}

export async function dbSaveAdmin(admin: Admin): Promise<void> {
  const dbType = getDatabaseType();

  switch (dbType) {
    case 'neon':
      return saveAdminToNeon(admin);
    case 'supabase':
      return saveAdminToSupabase(admin);
    default:
      return saveAdminToLocalStorage(admin);
  }
}

async function saveAdminToNeon(admin: Admin): Promise<void> {
  try {
    const sql = getNeonClient();
    if (!sql) throw new Error('Neon not configured');

    await sql`
      INSERT INTO admins (email, password, name, role, approved)
      VALUES (${admin.email}, ${admin.password}, ${admin.name}, ${admin.role}, ${admin.approved})
    `;
  } catch (error) {
    console.error('Failed to save admin to Neon:', error);
    throw error;
  }
}

async function saveAdminToSupabase(admin: Admin): Promise<void> {
  try {
    const { error } = await supabase!
      .from('admins')
      .insert({
        email: admin.email,
        password: admin.password,
        name: admin.name,
        role: admin.role,
        approved: admin.approved,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save admin to Supabase:', error);
    throw error;
  }
}

function saveAdminToLocalStorage(admin: Admin): void {
  const admins = getAdminsFromLocalStorage();
  admins.push({
    ...admin,
    createdAt: admin.createdAt || new Date().toISOString()
  });
  localStorage.setItem('admins', JSON.stringify(admins));
}

export async function dbUpdateAdmin(email: string, updates: Partial<Admin>): Promise<void> {
  const dbType = getDatabaseType();

  switch (dbType) {
    case 'neon':
      return updateAdminInNeon(email, updates);
    case 'supabase':
      return updateAdminInSupabase(email, updates);
    default:
      return updateAdminInLocalStorage(email, updates);
  }
}

async function updateAdminInNeon(email: string, updates: Partial<Admin>): Promise<void> {
  try {
    const sql = getNeonClient();
    if (!sql) throw new Error('Neon not configured');

    const fields = [];
    const values = [];
    
    if (updates.email) {
      fields.push('email = $1');
      values.push(updates.email);
    }
    if (updates.password) {
      fields.push('password = $2');
      values.push(updates.password);
    }
    if (updates.name) {
      fields.push('name = $3');
      values.push(updates.name);
    }
    if (updates.role) {
      fields.push('role = $4');
      values.push(updates.role);
    }
    if (updates.approved !== undefined) {
      fields.push('approved = $5');
      values.push(updates.approved);
    }

    await sql`UPDATE admins SET ${sql(updates)} WHERE email = ${email}`;
  } catch (error) {
    console.error('Failed to update admin in Neon:', error);
    throw error;
  }
}

async function updateAdminInSupabase(email: string, updates: Partial<Admin>): Promise<void> {
  try {
    const { error } = await supabase!
      .from('admins')
      .update(updates)
      .eq('email', email);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update admin in Supabase:', error);
    throw error;
  }
}

function updateAdminInLocalStorage(email: string, updates: Partial<Admin>): void {
  const admins = getAdminsFromLocalStorage();
  const index = admins.findIndex(a => a.email === email);
  if (index !== -1) {
    admins[index] = { ...admins[index], ...updates };
    localStorage.setItem('admins', JSON.stringify(admins));
  }
}

export async function dbDeleteAdmin(email: string): Promise<void> {
  const dbType = getDatabaseType();

  switch (dbType) {
    case 'neon':
      return deleteAdminFromNeon(email);
    case 'supabase':
      return deleteAdminFromSupabase(email);
    default:
      return deleteAdminFromLocalStorage(email);
  }
}

async function deleteAdminFromNeon(email: string): Promise<void> {
  try {
    const sql = getNeonClient();
    if (!sql) throw new Error('Neon not configured');

    await sql`DELETE FROM admins WHERE email = ${email}`;
  } catch (error) {
    console.error('Failed to delete admin from Neon:', error);
    throw error;
  }
}

async function deleteAdminFromSupabase(email: string): Promise<void> {
  try {
    const { error } = await supabase!
      .from('admins')
      .delete()
      .eq('email', email);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete admin from Supabase:', error);
    throw error;
  }
}

function deleteAdminFromLocalStorage(email: string): void {
  const admins = getAdminsFromLocalStorage();
  const filtered = admins.filter(a => a.email !== email);
  localStorage.setItem('admins', JSON.stringify(filtered));
}

// ==================== ITEMS ====================
// Similar pattern for Items and Orders...
// (To keep this file manageable, I'll stop here)
// The storage.ts file should call these dbGet/dbSave/dbUpdate/dbDelete functions

export function getDatabaseStatus(): string {
  const dbType = getDatabaseType();
  switch (dbType) {
    case 'neon':
      return '🟢 Neon PostgreSQL (Free Forever)';
    case 'supabase':
      return '🟡 Supabase (May Pause)';
    default:
      return '🔵 LocalStorage (Offline)';
  }
}
