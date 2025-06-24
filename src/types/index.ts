export type Role = 'admin' | 'manager' | 'cashier' | 'inventory-staff';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  password?: string;
}

export type Store = {
  id: string;
  name: string;
  address: string;
};

export type CustomerTier = 'Bronze' | 'Silver' | 'Gold';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  loyaltyPoints?: number;
  tier?: CustomerTier;
};

export type Vendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export type Product = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  supplier?: string;
  reorderThreshold?: number;
  expiryDate?: string;
};

export type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price per item at the time of sale
  cost: number; // Cost per item at the time of sale
};

export type Invoice = {
  id: string;
  storeId?: string;
  customerId?: string;
  customerName?: string;
  userId?: string;
  userName?: string;
  items: InvoiceItem[];
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'partially-refunded';
  date: string;
  discount?: number;
  taxRate?: number;
};

export type RefundItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Refund = {
  id: string;
  invoiceId: string;
  storeId?: string;
  items: RefundItem[];
  amount: number;
  reason: string;
  date: string;
};

export type PurchaseOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
};

export type PurchaseOrder = {
  id: string;
  vendorId: string;
  vendorName: string;
  storeId?: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
};

export type Sale = {
  month: string;
  revenue: number;
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
};

export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AED' | 'LKR';

export type CurrencySymbols = {
  [key in Currency]: string;
};
