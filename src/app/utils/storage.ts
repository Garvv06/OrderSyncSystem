import { Item, Order, Admin } from '../types';
import { defaultItems } from '../data/defaultItems';
import { supabase, isSupabaseConfigured } from './supabase';

let currentToken: string | null = null;
let currentUser: Admin | null = null;

export function setAuthToken(token: string) {
  currentToken = token;
}

export function setCurrentUser(user: Admin) {
  currentUser = user;
}

// ==================== ADMIN MANAGEMENT ====================

export async function getAdmins(): Promise<Admin[]> {
  // Try Supabase first
  if (isSupabaseConfigured && supabase) {
    const supabaseAdmins = await getAdminsFromSupabase();
    if (supabaseAdmins.length > 0) {
      console.log('📊 Loaded admins from Supabase:', supabaseAdmins.length, 'admins');
      console.log('Admins:', supabaseAdmins.map(a => ({ email: a.email, approved: a.approved })));
      return supabaseAdmins;
    }
  }
  // Fallback to localStorage
  const localAdmins = getAdminsFromLocalStorage();
  console.log('📊 Loaded admins from localStorage:', localAdmins.length, 'admins');
  return localAdmins;
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
      // Do NOT include password - it's managed by Supabase Auth
      name: admin.name,
      role: admin.role as 'superadmin' | 'admin',
      approved: admin.approved,
      createdAt: admin.created_at,
    }));
  } catch (error) {
    console.error('Failed to get admins from Supabase:', error);
    return [];
  }
}

function getAdminsFromLocalStorage(): Admin[] {
  const stored = localStorage.getItem('admins');
  if (!stored) {
    // Initialize with default admin
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

export async function saveAdmin(admin: Admin): Promise<void> {
  // Save to Supabase first
  if (isSupabaseConfigured && supabase) {
    await saveAdminToSupabase(admin);
    // Also save to localStorage as backup
    saveAdminToLocalStorage(admin);
    return;
  }
  // Fallback to localStorage only
  return saveAdminToLocalStorage(admin);
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

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log('✅ Admin saved to Supabase successfully');
  } catch (error: any) {
    console.error('Failed to save admin to Supabase:', error);
    throw new Error(error.message || 'Failed to save to database');
  }
}

function saveAdminToLocalStorage(admin: Admin): void {
  const admins = getAdminsFromLocalStorage();
  const newAdmin = {
    ...admin,
    createdAt: admin.createdAt || new Date().toISOString()
  };
  admins.push(newAdmin);
  localStorage.setItem('admins', JSON.stringify(admins));
}

export async function updateAdmin(email: string, updates: Partial<Admin>): Promise<void> {
  // Update in Supabase first
  if (isSupabaseConfigured && supabase) {
    await updateAdminInSupabase(email, updates);
    // Also update localStorage cache
    updateAdminInLocalStorage(email, updates);
    return;
  }
  // Fallback to localStorage only
  return updateAdminInLocalStorage(email, updates);
}

async function updateAdminInSupabase(email: string, updates: Partial<Admin>): Promise<void> {
  try {
    // Prepare update object - exclude password as it's managed by Supabase Auth
    const updateData: any = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.approved !== undefined) updateData.approved = updates.approved;
    // NOTE: Password is NOT updated here - use Supabase Auth password reset

    const { error } = await supabase!
      .from('admins')
      .update(updateData)
      .eq('email', email);

    if (error) throw error;

    // If email changed, update orders
    if (updates.email && updates.email !== email) {
      await supabase!
        .from('orders')
        .update({ created_by: updates.email })
        .eq('created_by', email);
    }
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

    // Update orders if email changed
    if (updates.email && updates.email !== email) {
      const ordersKey = 'mfoi_orders';
      const ordersData = localStorage.getItem(ordersKey);
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        orders.forEach((order: Order) => {
          if (order.createdBy === email) {
            order.createdBy = updates.email!;
          }
        });
        localStorage.setItem(ordersKey, JSON.stringify(orders));
      }
    }
  }
}

export async function deleteAdmin(email: string): Promise<void> {
  // Delete from Supabase first
  if (isSupabaseConfigured && supabase) {
    await deleteAdminFromSupabase(email);
    // Also delete from localStorage cache
    deleteAdminFromLocalStorage(email);
    return;
  }
  // Fallback to localStorage only
  return deleteAdminFromLocalStorage(email);
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

// ==================== ITEMS MANAGEMENT ====================

export async function getItems(): Promise<Item[]> {
  if (isSupabaseConfigured && supabase) {
    return getItemsFromSupabase();
  }
  return getItemsFromLocalStorage();
}

async function getItemsFromSupabase(): Promise<Item[]> {
  try {
    const { data, error } = await supabase!
      .from('items')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      await initializeDefaultItemsSupabase();
      return getItemsFromSupabase();
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category as any,
      sizes: item.sizes,
    }));
  } catch (error) {
    console.error('Failed to get items from Supabase:', error);
    return [];
  }
}

async function initializeDefaultItemsSupabase(): Promise<void> {
  try {
    const items = defaultItems.map(item => ({
      name: item.name,
      category: item.category,
      sizes: item.sizes,
    }));

    const { error } = await supabase!
      .from('items')
      .insert(items);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to initialize default items in Supabase:', error);
  }
}

function getItemsFromLocalStorage(): Item[] {
  // Use fixed key instead of token-based key to persist data across sessions
  const key = 'mfoi_items';
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    // Generate unique IDs for each default item
    const itemsWithIds: Item[] = defaultItems.map((item, index) => ({
      ...item,
      id: `item_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
    }));
    localStorage.setItem(key, JSON.stringify(itemsWithIds));
    return itemsWithIds;
  }
  
  return JSON.parse(stored);
}

export async function saveItems(items: Item[]): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return saveItemsToSupabase(items);
  }
  return saveItemsToLocalStorage(items);
}

async function saveItemsToSupabase(items: Item[]): Promise<void> {
  try {
    await supabase!.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const itemsToInsert = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      sizes: item.sizes,
    }));

    const { error } = await supabase!
      .from('items')
      .insert(itemsToInsert);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save items to Supabase:', error);
    throw error;
  }
}

function saveItemsToLocalStorage(items: Item[]): void {
  // Use fixed key instead of token-based key to persist data across sessions
  const key = 'mfoi_items';
  localStorage.setItem(key, JSON.stringify(items));
}

export async function addItem(item: Omit<Item, 'id'>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return addItemToSupabase(item);
  }
  return addItemToLocalStorage(item);
}

async function addItemToSupabase(item: Omit<Item, 'id'>): Promise<void> {
  try {
    const { error } = await supabase!
      .from('items')
      .insert({
        name: item.name,
        category: item.category,
        sizes: item.sizes,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to add item to Supabase:', error);
    throw error;
  }
}

function addItemToLocalStorage(item: Omit<Item, 'id'>): void {
  const items = getItemsFromLocalStorage();
  const newItem: Item = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  items.push(newItem);
  saveItemsToLocalStorage(items);
}

export async function updateItem(id: string, updates: Partial<Omit<Item, 'id'>>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return updateItemInSupabase(id, updates);
  }
  return updateItemInLocalStorage(id, updates);
}

async function updateItemInSupabase(id: string, updates: Partial<Omit<Item, 'id'>>): Promise<void> {
  try {
    const { error } = await supabase!
      .from('items')
      .update({
        name: updates.name,
        category: updates.category,
        sizes: updates.sizes,
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update item in Supabase:', error);
    throw error;
  }
}

function updateItemInLocalStorage(id: string, updates: Partial<Omit<Item, 'id'>>): void {
  const items = getItemsFromLocalStorage();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveItemsToLocalStorage(items);
  }
}

export async function updateItemStock(itemId: string, stockUpdates: { [size: string]: number }): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return updateItemStockInSupabase(itemId, stockUpdates);
  }
  return updateItemStockInLocalStorage(itemId, stockUpdates);
}

async function updateItemStockInSupabase(itemId: string, stockUpdates: { [size: string]: number }): Promise<void> {
  try {
    const { data, error: fetchError } = await supabase!
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    const updatedSizes = data.sizes.map((s: any) => {
      if (stockUpdates.hasOwnProperty(s.size)) {
        return { ...s, stock: stockUpdates[s.size] };
      }
      return s;
    });

    const { error: updateError } = await supabase!
      .from('items')
      .update({ sizes: updatedSizes })
      .eq('id', itemId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Failed to update item stock in Supabase:', error);
    throw error;
  }
}

function updateItemStockInLocalStorage(itemId: string, stockUpdates: { [size: string]: number }): void {
  const items = getItemsFromLocalStorage();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.sizes.forEach(sizeData => {
      if (stockUpdates.hasOwnProperty(sizeData.size)) {
        sizeData.stock = stockUpdates[sizeData.size];
      }
    });
    saveItemsToLocalStorage(items);
  }
}

export async function deleteItem(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return deleteItemFromSupabase(id);
  }
  return deleteItemFromLocalStorage(id);
}

async function deleteItemFromSupabase(id: string): Promise<void> {
  try {
    const { error } = await supabase!
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete item from Supabase:', error);
    throw error;
  }
}

function deleteItemFromLocalStorage(id: string): void {
  const items = getItemsFromLocalStorage();
  const filtered = items.filter(i => i.id !== id);
  saveItemsToLocalStorage(filtered);
}

// ==================== ORDERS MANAGEMENT ====================

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    return getOrdersFromSupabase();
  }
  return getOrdersFromLocalStorage();
}

async function getOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabase!
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      orderNo: order.order_no,
      orderDate: order.order_date,
      partyName: order.party_name,
      items: order.items,
      total: parseFloat(order.total.toString()),
      status: order.status as any,
      createdBy: order.created_by,
      createdByName: order.created_by_name,
      orderType: order.order_type || 'purchase',
    }));
  } catch (error) {
    console.error('Failed to get orders from Supabase:', error);
    return [];
  }
}

function getOrdersFromLocalStorage(): Order[] {
  // Use fixed key instead of token-based key to persist data across sessions
  const key = 'mfoi_orders';
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return [];
  }
  
  return JSON.parse(stored);
}

export async function getNextOrderNumber(): Promise<number> {
  if (isSupabaseConfigured && supabase) {
    return getNextOrderNumberFromSupabase();
  }
  return getNextOrderNumberFromLocalStorage();
}

async function getNextOrderNumberFromSupabase(): Promise<number> {
  try {
    const { data, error } = await supabase!
      .from('orders')
      .select('order_no')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return 1;
    }

    const lastOrderNo = data[0].order_no;
    const match = lastOrderNo.match(/ORD-(\d+)/);
    if (match) {
      return parseInt(match[1]) + 1;
    }

    return 1;
  } catch (error) {
    console.error('Failed to get next order number from Supabase:', error);
    return 1;
  }
}

function getNextOrderNumberFromLocalStorage(): number {
  const orders = getOrdersFromLocalStorage();
  if (orders.length === 0) return 1;
  
  const lastOrder = orders[0];
  const match = lastOrder.orderNo.match(/ORD-(\d+)/);
  if (match) {
    return parseInt(match[1]) + 1;
  }
  
  return 1;
}

export async function addOrder(order: Omit<Order, 'id' | 'orderNo'>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return addOrderToSupabase(order);
  }
  return addOrderToLocalStorage(order);
}

// Insert order with specific ID and orderNo (for CSV import)
export async function insertOrder(order: Order): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return insertOrderToSupabase(order);
  }
  return insertOrderToLocalStorage(order);
}

async function insertOrderToSupabase(order: Order): Promise<void> {
  try {
    const { error } = await supabase!
      .from('orders')
      .insert({
        id: order.id,
        order_no: order.orderNo,
        order_date: order.orderDate,
        party_name: order.partyName,
        items: order.items,
        total: order.total,
        status: order.status,
        created_by: order.createdBy,
        created_by_name: order.createdByName,
        order_type: order.orderType,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to insert order to Supabase:', error);
    throw error;
  }
}

function insertOrderToLocalStorage(order: Order): void {
  const orders = getOrdersFromLocalStorage();
  orders.unshift(order);
  saveOrdersToLocalStorage(orders);
}

async function addOrderToSupabase(order: Omit<Order, 'id' | 'orderNo'>): Promise<void> {
  try {
    const nextNum = await getNextOrderNumberFromSupabase();
    const orderNo = `ORD-${String(nextNum).padStart(4, '0')}`;

    const { error } = await supabase!
      .from('orders')
      .insert({
        order_no: orderNo,
        order_date: order.orderDate,
        party_name: order.partyName,
        items: order.items,
        total: order.total,
        status: order.status,
        created_by: order.createdBy,
        created_by_name: order.createdByName,
        order_type: order.orderType,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to add order to Supabase:', error);
    throw error;
  }
}

function addOrderToLocalStorage(order: Omit<Order, 'id' | 'orderNo'>): void {
  const orders = getOrdersFromLocalStorage();
  const nextNum = getNextOrderNumberFromLocalStorage();
  const orderNo = `ORD-${String(nextNum).padStart(4, '0')}`;
  
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderNo,
  };
  
  orders.unshift(newOrder);
  saveOrdersToLocalStorage(orders);
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return updateOrderInSupabase(id, updates);
  }
  return updateOrderInLocalStorage(id, updates);
}

async function updateOrderInSupabase(id: string, updates: Partial<Order>): Promise<void> {
  try {
    const { error } = await supabase!
      .from('orders')
      .update({
        order_no: updates.orderNo,
        order_date: updates.orderDate,
        party_name: updates.partyName,
        items: updates.items,
        total: updates.total,
        status: updates.status,
        order_type: updates.orderType,
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order in Supabase:', error);
    throw error;
  }
}

function updateOrderInLocalStorage(id: string, updates: Partial<Order>): void {
  const orders = getOrdersFromLocalStorage();
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    console.error('Order not found:', id);
    return;
  }
  
  orders[orderIndex] = {
    ...orders[orderIndex],
    ...updates,
  };
  
  saveOrdersToLocalStorage(orders);
}

// Helper function to update just the order status
export async function updateOrderStatus(id: string, status: 'Open' | 'Partially Completed' | 'Completed'): Promise<void> {
  return updateOrder(id, { status });
}

export async function deleteOrder(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    return deleteOrderFromSupabase(id);
  }
  return deleteOrderFromLocalStorage(id);
}

async function deleteOrderFromSupabase(id: string): Promise<void> {
  try {
    const { error } = await supabase!
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting order from Supabase:', error);
    throw error;
  }
}

function deleteOrderFromLocalStorage(id: string): void {
  const orders = getOrdersFromLocalStorage();
  const filteredOrders = orders.filter(o => o.id !== id);
  saveOrdersToLocalStorage(filteredOrders);
}

function saveOrdersToLocalStorage(orders: Order[]): void {
  // Use fixed key instead of token-based key to persist data across sessions
  const key = 'mfoi_orders';
  localStorage.setItem(key, JSON.stringify(orders));
}