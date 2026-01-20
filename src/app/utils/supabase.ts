import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Only create Supabase client if configured
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          role: 'superadmin' | 'admin';
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name: string;
          role?: 'superadmin' | 'admin';
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          role?: 'superadmin' | 'admin';
          approved?: boolean;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          category: string;
          sizes: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          sizes: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          sizes?: any;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_no: string;
          order_date: string;
          party_name: string;
          items: any;
          total: number;
          status: 'Open' | 'Partially Completed' | 'Completed';
          created_by: string;
          created_by_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_no: string;
          order_date: string;
          party_name: string;
          items: any;
          total: number;
          status?: 'Open' | 'Partially Completed' | 'Completed';
          created_by: string;
          created_by_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_no?: string;
          order_date?: string;
          party_name?: string;
          items?: any;
          total?: number;
          status?: 'Open' | 'Partially Completed' | 'Completed';
          created_by?: string;
          created_by_name?: string;
          created_at?: string;
        };
      };
    };
  };
}