// MFOI - Fastener Admin Order System Types

export type ItemCategory = 'Nut' | 'Bolts' | 'Fasteners' | 'Screw' | 'Scapfolding Items' | 'Washer' | 'Hand Tools';

export interface ItemSize {
  size: string;
  stock: number;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  sizes: ItemSize[];
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  size: string;
  quantity: number;
  completedQuantity: number;
  price: number;
  lineTotal: number;
  billNumbers?: string[];
}

export interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  partyName: string;
  items: OrderItem[];
  total: number;
  status: 'Open' | 'Partially Completed' | 'Completed';
  createdBy: string;
  createdByName: string;
  orderType: 'purchase' | 'sale';
}

export interface PendingAdmin {
  id: string;
  email: string;
  password: string;
  name: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Admin {
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin';
  approved: boolean;
  createdAt?: string;
}
