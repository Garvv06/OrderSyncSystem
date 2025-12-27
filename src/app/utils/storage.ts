import { Item, Order } from '../types';
import { defaultItems } from '../data/defaultItems';
import { api } from './api';

let currentToken: string | null = null;
let itemsCache: Item[] | null = null;
let ordersCache: Order[] | null = null;
let counterCache: number | null = null;

export function setAuthToken(token: string) {
  currentToken = token;
}

// Items Management
export async function getItems(): Promise<Item[]> {
  if (!currentToken) {
    throw new Error('Not authenticated');
  }

  if (itemsCache) {
    return itemsCache;
  }

  try {
    const result = await api.getItems(currentToken);
    if (result.items && result.items.length > 0) {
      itemsCache = result.items;
      return result.items;
    }
    
    // Initialize with default items
    const items = defaultItems.map((item, index) => ({
      ...item,
      id: `item_${Date.now()}_${index}`,
    }));
    
    await api.saveItems(currentToken, items);
    itemsCache = items;
    return items;
  } catch (error) {
    console.error('Failed to get items:', error);
    throw error;
  }
}

export async function saveItems(items: Item[]): Promise<void> {
  if (!currentToken) {
    throw new Error('Not authenticated');
  }

  await api.saveItems(currentToken, items);
  itemsCache = items;
}

export async function addItem(item: Omit<Item, 'id'>): Promise<Item> {
  const items = await getItems();
  const newItem: Item = {
    ...item,
    id: `item_${Date.now()}`,
  };
  items.push(newItem);
  await saveItems(items);
  return newItem;
}

export async function updateItem(id: string, updates: Partial<Omit<Item, 'id'>>): Promise<void> {
  const items = await getItems();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    await saveItems(items);
  }
}

export async function updateItemStock(itemId: string, size: string, newStock: number): Promise<void> {
  const items = await getItems();
  const item = items.find(i => i.id === itemId);
  if (item) {
    const sizeIndex = item.sizes.findIndex(s => s.size === size);
    if (sizeIndex !== -1) {
      item.sizes[sizeIndex].stock = newStock;
      await saveItems(items);
    }
  }
}

export async function deleteItem(id: string): Promise<void> {
  const items = await getItems();
  const filtered = items.filter((item) => item.id !== id);
  await saveItems(filtered);
}

// Orders Management
export async function getOrders(): Promise<Order[]> {
  if (!currentToken) {
    throw new Error('Not authenticated');
  }

  if (ordersCache) {
    return ordersCache;
  }

  try {
    const result = await api.getOrders(currentToken);
    ordersCache = result.orders || [];
    return ordersCache;
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw error;
  }
}

export async function saveOrders(orders: Order[]): Promise<void> {
  if (!currentToken) {
    throw new Error('Not authenticated');
  }

  await api.saveOrders(currentToken, orders);
  ordersCache = orders;
}

export async function getNextOrderNumber(): Promise<string> {
  if (!currentToken) {
    throw new Error('Not authenticated');
  }

  if (counterCache !== null) {
    counterCache++;
  } else {
    const result = await api.getOrderCounter(currentToken);
    counterCache = (result.counter || 0) + 1;
  }
  
  await api.saveOrderCounter(currentToken, counterCache);
  return `ORD-${String(counterCache).padStart(5, '0')}`;
}

export const addOrder = async (orderData: Omit<Order, 'id' | 'orderNo'>) => {
  const orders = await getOrders();
  const orderNo = `ORD-${String(orders.length + 1).padStart(4, '0')}`;
  
  const newOrder: Order = {
    id: `order_${Date.now()}`,
    orderNo,
    ...orderData,
  };

  orders.push(newOrder);
  await saveOrders(orders);

  // Update stock if order is completed
  if (orderData.status === 'Completed') {
    await updateStockForOrder(newOrder);
  }

  return newOrder;
};

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
  const orders = await getOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index !== -1) {
    const oldOrder = orders[index];
    orders[index] = { ...oldOrder, ...updates };
    
    // Update stock if status changed to Completed
    if (oldOrder.status !== 'Completed' && updates.status === 'Completed') {
      await updateStockForOrder(orders[index]);
    }
    
    await saveOrders(orders);
  }
}

async function updateStockForOrder(order: Order): Promise<void> {
  const items = await getItems();
  let updated = false;
  
  order.items.forEach((orderItem) => {
    const itemIndex = items.findIndex((item) => item.id === orderItem.itemId);
    if (itemIndex !== -1) {
      const item = items[itemIndex];
      const sizeIndex = item.sizes.findIndex((s) => s.size === orderItem.size);
      if (sizeIndex !== -1) {
        items[itemIndex].sizes[sizeIndex].stock = Math.max(
          0,
          items[itemIndex].sizes[sizeIndex].stock - orderItem.quantity
        );
        updated = true;
      }
    }
  });
  
  if (updated) {
    await saveItems(items);
  }
}

export async function deleteOrder(id: string): Promise<void> {
  const orders = await getOrders();
  const filtered = orders.filter((order) => order.id !== id);
  await saveOrders(filtered);
}

// Clear cache on logout
export function clearCache() {
  currentToken = null;
  itemsCache = null;
  ordersCache = null;
  counterCache = null;
}