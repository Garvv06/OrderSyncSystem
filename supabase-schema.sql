-- MFOI Fastener Admin Order System - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sizes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  order_date TEXT NOT NULL,
  party_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Partially Completed', 'Completed')),
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'purchase' CHECK (order_type IN ('purchase', 'sale')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_approved ON public.admins(approved);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_party_name ON public.orders(party_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);

-- Insert default super admin (change password after first login!)
INSERT INTO public.admins (email, password, name, role, approved)
VALUES ('admin@fastener.com', 'admin123', 'Super Admin', 'superadmin', true)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow all authenticated access
-- Note: Since this is an admin-only system, we allow full access to all authenticated users

-- Admins table policies
CREATE POLICY "Allow all access to admins table" ON public.admins
  FOR ALL USING (true) WITH CHECK (true);

-- Items table policies
CREATE POLICY "Allow all access to items table" ON public.items
  FOR ALL USING (true) WITH CHECK (true);

-- Orders table policies
CREATE POLICY "Allow all access to orders table" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.admins TO authenticated;
GRANT ALL ON public.items TO authenticated;
GRANT ALL ON public.orders TO authenticated;

GRANT ALL ON public.admins TO anon;
GRANT ALL ON public.items TO anon;
GRANT ALL ON public.orders TO anon;