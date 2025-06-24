import type { Customer, Invoice, Sale, Product, Vendor, Store, User, PurchaseOrder } from '@/types';

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@cziumpos.com', avatar: 'https://placehold.co/40x40', role: 'admin', password: 'password' },
  { id: 'user-2', name: 'Manager Mike', email: 'manager@cziumpos.com', avatar: 'https://placehold.co/40x40', role: 'manager', password: 'password' },
  { id: 'user-3', name: 'Cashier Chloe', email: 'cashier@cziumpos.com', avatar: 'https://placehold.co/40x40', role: 'cashier', password: 'password' },
  { id: 'user-4', name: 'Inventory Ian', email: 'inventory@cziumpos.com', avatar: 'https://placehold.co/40x40', role: 'inventory-staff', password: 'password' },
];

export const initialStores: Store[] = [
  { id: 'store-1', name: 'Downtown Central', address: '123 Main St, Anytown, USA' },
  { id: 'store-2', name: 'Westside Mall', address: '456 Oak Ave, Anytown, USA' },
  { id: 'store-3', name: 'Northpoint Plaza', address: '789 Pine Ln, Anytown, USA' },
];

export const customers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', avatar: 'https://placehold.co/40x40', loyaltyPoints: 525, tier: 'Silver' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', avatar: 'https://placehold.co/40x40', loyaltyPoints: 80, tier: 'Bronze' },
  { id: '3', name: 'Sam Wilson', email: 'sam@example.com', phone: '345-678-9012', avatar: 'https://placehold.co/40x40', loyaltyPoints: 130, tier: 'Bronze' },
  { id: '4', name: 'Alice Johnson', email: 'alice@example.com', phone: '456-789-0123', avatar: 'https://placehold.co/40x40', loyaltyPoints: 80, tier: 'Bronze' },
  { id: '5', name: 'Bob Brown', email: 'bob@example.com', phone: '567-890-1234', avatar: 'https://placehold.co/40x40', loyaltyPoints: 0, tier: 'Bronze' },
];

export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Espresso Machine', price: 499.99, cost: 350.00, stock: 5, sku: 'EM-499', category: 'Appliances', description: 'A high-quality espresso machine for home baristas.', reorderThreshold: 5 },
  { id: 'prod-2', name: 'Coffee Grinder', price: 129.50, cost: 80.00, stock: 30, sku: 'CG-129', category: 'Appliances', description: 'A conical burr grinder for a consistent grind.', reorderThreshold: 10 },
  { id: 'prod-3', name: 'Bag of Premium Coffee Beans (1kg)', price: 22.00, cost: 12.00, stock: 25, sku: 'CB-1KG', category: 'Consumables', description: 'Single-origin beans from Ethiopia.', reorderThreshold: 20, expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'prod-4', name: 'Milk Frother', price: 75.00, cost: 45.00, stock: 45, sku: 'MF-075', category: 'Accessories', description: 'Automatic milk frother for lattes and cappuccinos.', reorderThreshold: 15 },
  { id: 'prod-5', name: 'Set of 4 Ceramic Mugs', price: 40.00, cost: 20.00, stock: 60, sku: 'CM-SET4', category: 'Accessories', description: 'Durable and stylish ceramic mugs.', reorderThreshold: 20 },
  { id: 'prod-6', name: 'Almond Milk (1L)', price: 4.50, cost: 2.50, stock: 50, sku: 'AM-1L', category: 'Consumables', description: 'Unsweetened almond milk.', reorderThreshold: 20, expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
];

export const initialVendors: Vendor[] = [
  { id: 'vend-1', name: 'Beans & Co.', contactPerson: 'Mark R.', email: 'mark@beans.co', phone: '987-654-3210' },
  { id: 'vend-2', name: 'Cup Supplies Inc.', contactPerson: 'Susan B.', email: 'susan@cups.inc', phone: '876-543-2109' },
  { id: 'vend-3', name: 'Machinery Masters', contactPerson: 'Leo P.', email: 'leo@machinery.com', phone: '765-432-1098' },
];

export const initialInvoices: Invoice[] = [
  { 
    id: 'INV-001', 
    storeId: 'store-1',
    customerId: '1', 
    customerName: 'John Doe', 
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-1', productName: 'Espresso Machine', quantity: 1, price: 499.99, cost: 350.00 }
    ],
    amount: 524.99, 
    status: 'paid', 
    date: '2023-10-25',
    discount: 0,
    taxRate: 5,
  },
  { 
    id: 'INV-002', 
    storeId: 'store-2',
    customerId: '2', 
    customerName: 'Jane Smith', 
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 2, price: 22.00, cost: 12.00 },
      { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 1, price: 40.00, cost: 20.00 }
    ],
    amount: 79.80,
    status: 'pending', 
    date: '2023-10-26',
    discount: 5,
    taxRate: 0,
  },
  { 
    id: 'INV-003', 
    storeId: 'store-1',
    customerId: '3', 
    customerName: 'Sam Wilson', 
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-2', productName: 'Coffee Grinder', quantity: 1, price: 129.50, cost: 80.00 }
    ],
    amount: 129.50, 
    status: 'overdue', 
    date: '2023-09-15' 
  },
  { 
    id: 'INV-004', 
    storeId: 'store-2',
    customerId: '1', 
    customerName: 'John Doe', 
    userId: 'user-2',
    userName: 'Manager Mike',
    items: [
      { productId: 'prod-4', productName: 'Milk Frother', quantity: 1, price: 75.00, cost: 45.00 },
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 5, price: 22.00, cost: 12.00 }
    ],
    amount: 185.00, 
    status: 'paid', 
    date: '2023-10-27' 
  },
  { 
    id: 'INV-005', 
    storeId: 'store-1',
    customerName: 'Alice Johnson', 
    customerId: '4', 
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 2, price: 40.00, cost: 20.00 }
    ],
    amount: 80.00, 
    status: 'pending', 
    date: '2023-10-28' 
  },
  { 
    id: 'INV-006',
    storeId: 'store-3',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 1, price: 22.00, cost: 12.00 }
    ],
    amount: 22.00, 
    status: 'pending', 
    date: '2023-10-29' 
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
    {
        id: 'PO-001',
        vendorId: 'vend-1',
        vendorName: 'Beans & Co.',
        storeId: 'store-1',
        items: [
            { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 50, cost: 11.50 },
            { productId: 'prod-6', productName: 'Almond Milk (1L)', quantity: 100, cost: 2.25 },
        ],
        totalCost: (50 * 11.50) + (100 * 2.25),
        status: 'ordered',
        orderDate: '2023-10-20',
        expectedDeliveryDate: '2023-10-28',
    },
    {
        id: 'PO-002',
        vendorId: 'vend-3',
        vendorName: 'Machinery Masters',
        storeId: 'store-2',
        items: [
            { productId: 'prod-1', productName: 'Espresso Machine', quantity: 5, cost: 340.00 },
        ],
        totalCost: 5 * 340.00,
        status: 'received',
        orderDate: '2023-10-15',
        expectedDeliveryDate: '2023-10-25',
        receivedDate: '2023-10-24',
    }
];


export const salesData: Sale[] = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
];
