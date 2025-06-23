export type User = {
  name: string;
  email: string;
  avatar: string;
}

export type Store = {
  id: string;
  name: string;
  address: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

// New: Vendor type
export type Vendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

// New: Product type for inventory
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
};

// New: InvoiceItem for linking products to invoices
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
  items: InvoiceItem[]; // Replaces single amount
  amount: number; // Will be calculated from items
  status: 'paid' | 'pending' | 'overdue';
  date: string;
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

export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP';

export type CurrencySymbols = {
  [key in Currency]: string;
};
