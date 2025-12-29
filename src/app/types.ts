export type ItemCategory = 'Nuts' | 'Bolts' | 'Fasteners' | 'Screws' | 'Scaffolding Items' | 'Washers' | 'Hand Tools';

export interface ItemSize {
  size: string;
  stock: number;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  sizes: ItemSize[]; // No rate here - rate will be in order
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  size: string;
  quantity: number;
  completedQuantity: number; // Track how much has been completed
  price: number;
  lineTotal: number;
  billNumbers?: string[]; // Track bill numbers for partial completions
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