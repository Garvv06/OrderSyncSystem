import { supabase } from './supabase';

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  if (!supabase) return null;
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
