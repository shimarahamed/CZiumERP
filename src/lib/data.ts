
import type { Customer, Invoice, Sale, Product, Vendor, Store, User, PurchaseOrder, RFQ, Asset, AttendanceEntry, LeaveRequest, Employee, LedgerEntry, TaxRate, Budget, Candidate, PerformanceReview, BillOfMaterials, ProductionOrder, QualityCheck, Lead } from '@/types';

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@czium.com', avatar: 'https://placehold.co/40x40', role: 'admin', password: 'password' },
  { id: 'user-2', name: 'Manager Mike', email: 'manager@czium.com', avatar: 'https://placehold.co/40x40', role: 'manager', password: 'password' },
  { id: 'user-3', name: 'Cashier Chloe', email: 'cashier@czium.com', avatar: 'https://placehold.co/40x40', role: 'cashier', password: 'password' },
  { id: 'user-4', name: 'Inventory Ian', email: 'inventory@czium.com', avatar: 'https://placehold.co/40x40', role: 'inventory-staff', password: 'password' },
];

export const initialEmployees: Employee[] = [
  { id: 'emp-1', userId: 'user-1', name: 'Admin User', email: 'admin@czium.com', avatar: 'https://placehold.co/40x40', jobTitle: 'System Administrator', department: 'IT', dateOfJoining: '2020-01-01', salary: 120000 },
  { id: 'emp-2', userId: 'user-2', name: 'Manager Mike', email: 'manager@czium.com', avatar: 'https://placehold.co/40x40', jobTitle: 'Store Manager', department: 'Operations', dateOfJoining: '2021-03-15', salary: 85000 },
  { id: 'emp-3', userId: 'user-3', name: 'Cashier Chloe', email: 'cashier@czium.com', avatar: 'https://placehold.co/40x40', jobTitle: 'Cashier', department: 'Sales', dateOfJoining: '2022-06-01', salary: 45000 },
  { id: 'emp-4', userId: 'user-4', name: 'Inventory Ian', email: 'inventory@czium.com', avatar: 'https://placehold.co/40x40', jobTitle: 'Inventory Specialist', department: 'Logistics', dateOfJoining: '2022-09-20', salary: 55000 },
  { id: 'emp-5', name: 'Warehouse William', email: 'william@czium.com', avatar: 'https://placehold.co/40x40', jobTitle: 'Warehouse Associate', department: 'Logistics', dateOfJoining: '2023-01-10', salary: 42000 },
];

export const initialStores: Store[] = [
  { id: 'store-1', name: 'Downtown Central', address: '123 Main St, Anytown, USA' },
  { id: 'store-2', name: 'Westside Mall', address: '456 Oak Ave, Anytown, USA' },
  { id: 'store-3', name: 'Northpoint Plaza', address: '789 Pine Ln, Anytown, USA' },
];

export const customers: Customer[] = [
  { id: 'cust-1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', avatar: 'https://placehold.co/40x40', billingAddress: '123 Billing Rd, Anytown, USA', shippingAddress: '123 Shipping Rd, Anytown, USA', loyaltyPoints: 525, tier: 'Silver' },
  { id: 'cust-2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', avatar: 'https://placehold.co/40x40', billingAddress: '456 Billing Ave, Anytown, USA', shippingAddress: '456 Shipping Ave, Anytown, USA', loyaltyPoints: 80, tier: 'Bronze' },
  { id: 'cust-3', name: 'Sam Wilson', email: 'sam@example.com', phone: '345-678-9012', avatar: 'https://placehold.co/40x40', billingAddress: '789 Billing Ln, Anytown, USA', shippingAddress: '789 Shipping Ln, Anytown, USA', loyaltyPoints: 130, tier: 'Bronze' },
  { id: 'cust-4', name: 'Alice Johnson', email: 'alice@example.com', phone: '456-789-0123', avatar: 'https://placehold.co/40x40', billingAddress: '101 Billing Blvd, Anytown, USA', shippingAddress: '101 Shipping Blvd, Anytown, USA', loyaltyPoints: 2150, tier: 'Gold' },
  { id: 'cust-5', name: 'Bob Brown', email: 'bob@example.com', phone: '567-890-1234', avatar: 'https://placehold.co/40x40', billingAddress: '212 Billing Ct, Anytown, USA', shippingAddress: '212 Shipping Ct, Anytown, USA', loyaltyPoints: 0, tier: 'Bronze' },
  { id: 'cust-6', name: 'Emily White', email: 'emily@example.com', phone: '678-901-2345', avatar: 'https://placehold.co/40x40', billingAddress: '333 Billing Dr, Anytown, USA', shippingAddress: '333 Shipping Dr, Anytown, USA', loyaltyPoints: 1200, tier: 'Silver' },
  { id: 'cust-7', name: 'Michael Green', email: 'michael@example.com', phone: '789-012-3456', avatar: 'https://placehold.co/40x40', billingAddress: '444 Billing Pl, Anytown, USA', shippingAddress: '444 Shipping Pl, Anytown, USA', loyaltyPoints: 340, tier: 'Bronze' },
  { id: 'cust-8', name: 'Sarah Black', email: 'sarah@example.com', phone: '890-123-4567', avatar: 'https://placehold.co/40x40', billingAddress: '555 Billing Way, Anytown, USA', shippingAddress: '555 Shipping Way, Anytown, USA', loyaltyPoints: 450, tier: 'Bronze' },
];

export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Espresso Machine', price: 499.99, cost: 350.00, stock: 5, sku: 'EM-499', category: 'Appliances', description: 'A high-quality espresso machine for home baristas.', reorderThreshold: 5, warrantyDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(), productType: 'manufactured' },
  { id: 'prod-2', name: 'Coffee Grinder', price: 129.50, cost: 80.00, stock: 30, sku: 'CG-129', category: 'Appliances', description: 'A conical burr grinder for a consistent grind.', reorderThreshold: 10, vendorId: 'vend-3', productType: 'standard' },
  { id: 'prod-3', name: 'Bag of Premium Coffee Beans (1kg)', price: 22.00, cost: 12.00, stock: 25, sku: 'CB-1KG', category: 'Consumables', description: 'Single-origin beans from Ethiopia.', reorderThreshold: 20, expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), vendorId: 'vend-1', productType: 'standard' },
  { id: 'prod-4', name: 'Milk Frother', price: 75.00, cost: 45.00, stock: 45, sku: 'MF-075', category: 'Accessories', description: 'Automatic milk frother for lattes and cappuccinos.', reorderThreshold: 15, vendorId: 'vend-2', productType: 'standard' },
  { id: 'prod-5', name: 'Set of 4 Ceramic Mugs', price: 40.00, cost: 20.00, stock: 60, sku: 'CM-SET4', category: 'Accessories', description: 'Durable and stylish ceramic mugs.', reorderThreshold: 20, vendorId: 'vend-2', productType: 'standard' },
  { id: 'prod-6', name: 'Almond Milk (1L)', price: 4.50, cost: 2.50, stock: 50, sku: 'AM-1L', category: 'Consumables', description: 'Unsweetened almond milk.', reorderThreshold: 20, expiryDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(), vendorId: 'vend-1', productType: 'standard' },
  { id: 'prod-7', name: 'Oat Milk (1L)', price: 4.75, cost: 2.75, stock: 40, sku: 'OM-1L', category: 'Consumables', description: 'Unsweetened oat milk.', reorderThreshold: 20, expiryDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), vendorId: 'vend-1', productType: 'standard' }, // Expired
  { id: 'prod-8', name: 'Assorted Pastries', price: 3.50, cost: 1.50, stock: 8, sku: 'PST-ASST', category: 'Consumables', description: 'Freshly baked pastries.', reorderThreshold: 10, expiryDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), productType: 'standard' },
  { id: 'prod-9', name: 'Cleaning Tablets', price: 15.00, cost: 8.00, stock: 80, sku: 'CL-TAB', category: 'Maintenance', description: 'Tablets for cleaning espresso machines.', reorderThreshold: 15, productType: 'standard' },
  { id: 'prod-10', name: 'Digital Scale', price: 35.00, cost: 20.00, stock: 0, sku: 'SCL-DGTL', category: 'Accessories', description: 'Precision digital scale for coffee weighing.', reorderThreshold: 10, vendorId: 'vend-2', productType: 'standard' }, // Out of Stock
  { id: 'prod-11', name: 'Gooseneck Kettle', price: 89.99, cost: 60.00, stock: 9, sku: 'KT-GNK', category: 'Appliances', description: 'Electric gooseneck kettle for pour-over coffee.', reorderThreshold: 10, vendorId: 'vend-3', productType: 'standard' }, // Low Stock
  { id: 'prod-12', name: 'Travel Mug', price: 25.00, cost: 15.00, stock: 100, sku: 'TM-16OZ', category: 'Accessories', description: '16oz insulated travel mug.', reorderThreshold: 30, vendorId: 'vend-2', productType: 'standard' },
  { id: 'prod-13', name: 'Barista Apron', price: 30.00, cost: 18.00, stock: 40, sku: 'APRN-BRST', category: 'Apparel', description: 'Canvas barista apron with leather straps.', reorderThreshold: 10, vendorId: 'vend-2', productType: 'standard' },
  { id: 'prod-14', name: 'Syrup Variety Pack', price: 18.00, cost: 10.00, stock: 60, sku: 'SYRP-PCK', category: 'Consumables', description: 'Pack of 3 flavored syrups.', reorderThreshold: 25, vendorId: 'vend-1', expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(), productType: 'standard' },
  { id: 'prod-15', name: 'Casing Unit', price: 0, cost: 150.00, stock: 200, sku: 'CS-UNIT', category: 'Components', description: 'Outer casing for Espresso Machine.', reorderThreshold: 10, vendorId: 'vend-3', productType: 'component' },
  { id: 'prod-16', name: 'Internal Pump Assembly', price: 0, cost: 200.00, stock: 200, sku: 'PMP-ASSY', category: 'Components', description: 'Pump and boiler assembly for Espresso Machine.', reorderThreshold: 5, vendorId: 'vend-3', productType: 'component' },
];

export const initialVendors: Vendor[] = [
  { id: 'vend-1', name: 'Beans & Co.', contactPerson: 'Mark R.', email: 'mark@beans.co', phone: '987-654-3210', leadTimeDays: 7 },
  { id: 'vend-2', name: 'Cup Supplies Inc.', contactPerson: 'Susan B.', email: 'susan@cups.inc', phone: '876-543-2109', leadTimeDays: 5 },
  { id: 'vend-3', name: 'Machinery Masters', contactPerson: 'Leo P.', email: 'leo@machinery.com', phone: '765-432-1098', leadTimeDays: 14 },
];

export const initialInvoices: Invoice[] = [
  { 
    id: 'INV-001', 
    storeId: 'store-1',
    customerId: 'cust-1', 
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
    customerId: 'cust-2', 
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
    customerId: 'cust-3', 
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
    customerId: 'cust-1', 
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
    customerId: 'cust-4', 
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 2, price: 40.00, cost: 20.00 }
    ],
    amount: 72.00, 
    status: 'pending', 
    date: '2023-10-28',
    discount: 10,
    taxRate: 0
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
    status: 'paid', 
    date: '2023-10-29' 
  },
  {
    id: 'INV-007',
    storeId: 'store-1',
    customerId: 'cust-6',
    customerName: 'Emily White',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    // Original sale was 1 grinder. Now 0 remain after full refund.
    items: [
      { productId: 'prod-2', productName: 'Coffee Grinder', quantity: 0, price: 129.50, cost: 80.00 }
    ],
    amount: 123.03,
    status: 'refunded',
    date: '2023-11-01',
    discount: 5,
    taxRate: 0,
  },
  {
    id: 'INV-008',
    storeId: 'store-2',
    customerId: 'cust-7',
    customerName: 'Michael Green',
    userId: 'user-2',
    userName: 'Manager Mike',
    // Original sale was 2 travel mugs. 1 was refunded. 1 remains.
    items: [
      { productId: 'prod-12', productName: 'Travel Mug', quantity: 1, price: 25.00, cost: 15.00 }
    ],
    amount: 52.50,
    status: 'partially-refunded',
    date: '2023-11-02',
    discount: 0,
    taxRate: 5,
  },
   {
    id: 'INV-009',
    storeId: 'store-3',
    customerId: 'cust-8',
    customerName: 'Sarah Black',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-13', productName: 'Barista Apron', quantity: 1, price: 30.00, cost: 18.00 },
      { productId: 'prod-14', productName: 'Syrup Variety Pack', quantity: 1, price: 18.00, cost: 10.00 }
    ],
    amount: 48.00,
    status: 'paid',
    date: '2023-11-05'
  },
  {
    id: 'INV-010',
    storeId: 'store-1',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-8', productName: 'Assorted Pastries', quantity: 3, price: 3.50, cost: 1.50 }
    ],
    amount: 10.50,
    status: 'paid',
    date: '2023-11-08'
  },
  {
    id: 'INV-011',
    storeId: 'store-2',
    customerId: 'cust-4',
    customerName: 'Alice Johnson',
    userId: 'user-2',
    userName: 'Manager Mike',
    items: [
      { productId: 'prod-1', productName: 'Espresso Machine', quantity: 1, price: 499.99, cost: 350.00 },
      { productId: 'prod-9', productName: 'Cleaning Tablets', quantity: 2, price: 15.00, cost: 8.00 }
    ],
    amount: 476.99,
    status: 'paid',
    date: '2023-11-10',
    discount: 10, // Gold tier discount
    taxRate: 0,
  },
   {
    id: 'INV-012',
    storeId: 'store-3',
    customerId: 'cust-5',
    customerName: 'Bob Brown',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-6', productName: 'Almond Milk (1L)', quantity: 2, price: 4.50, cost: 2.50 }
    ],
    amount: 9.00,
    status: 'pending',
    date: '2023-11-11'
  },
  {
    id: 'INV-013',
    storeId: 'store-1',
    customerId: 'cust-1',
    customerName: 'John Doe',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-7', productName: 'Oat Milk (1L)', quantity: 4, price: 4.75, cost: 2.75 }
    ],
    amount: 18.05,
    status: 'overdue',
    date: '2023-10-01',
    discount: 5,
    taxRate: 0
  },
    {
    id: 'INV-014',
    storeId: 'store-2',
    customerId: 'cust-2',
    customerName: 'Jane Smith',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-4', productName: 'Milk Frother', quantity: 1, price: 75.00, cost: 45.00 },
        { productId: 'prod-14', productName: 'Syrup Variety Pack', quantity: 2, price: 18.00, cost: 10.00 }
    ],
    amount: 116.55,
    status: 'paid',
    date: '2023-11-12',
    discount: 0,
    taxRate: 5,
  },
  {
    id: 'INV-015',
    storeId: 'store-3',
    customerId: 'cust-7',
    customerName: 'Michael Green',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-11', productName: 'Gooseneck Kettle', quantity: 1, price: 89.99, cost: 60.00 }
    ],
    amount: 89.99,
    status: 'pending',
    date: '2023-11-13'
  },
  {
    id: 'INV-016',
    storeId: 'store-1',
    customerId: 'cust-8',
    customerName: 'Sarah Black',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-12', productName: 'Travel Mug', quantity: 3, price: 25.00, cost: 15.00 }
    ],
    amount: 75.00,
    status: 'overdue',
    date: '2023-10-05'
  },
  {
    id: 'INV-017',
    storeId: 'store-1',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-8', productName: 'Assorted Pastries', quantity: 5, price: 3.50, cost: 1.50 }
    ],
    amount: 17.50,
    status: 'paid',
    date: '2023-11-14'
  },
  {
    id: 'INV-018',
    storeId: 'store-3',
    customerId: 'cust-4',
    customerName: 'Alice Johnson',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-1', productName: 'Espresso Machine', quantity: 1, price: 499.99, cost: 350.00 },
    ],
    amount: 472.49,
    status: 'paid',
    date: '2023-11-15',
    discount: 10,
    taxRate: 5
  },
  {
    id: 'INV-019',
    storeId: 'store-2',
    customerId: 'cust-6',
    customerName: 'Emily White',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-2', productName: 'Coffee Grinder', quantity: 1, price: 129.50, cost: 80.00 }
    ],
    amount: 123.03,
    status: 'paid',
    date: '2023-11-15',
    discount: 5,
    taxRate: 0
  },
  {
    id: 'INV-020',
    storeId: 'store-1',
    customerId: 'cust-5',
    customerName: 'Bob Brown',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 2, price: 22.00, cost: 12.00 }
    ],
    amount: 44.00,
    status: 'paid',
    date: '2023-11-16'
  },
  {
    id: 'INV-021',
    storeId: 'store-2',
    customerId: 'cust-3',
    customerName: 'Sam Wilson',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 1, price: 40.00, cost: 20.00 },
        { productId: 'prod-6', productName: 'Almond Milk (1L)', quantity: 3, price: 4.50, cost: 2.50 }
    ],
    amount: 53.50,
    status: 'pending',
    date: '2023-11-17'
  },
  {
    id: 'INV-022',
    storeId: 'store-3',
    customerId: 'cust-1',
    customerName: 'John Doe',
    userId: 'user-2',
    userName: 'Manager Mike',
    items: [
        { productId: 'prod-9', productName: 'Cleaning Tablets', quantity: 4, price: 15.00, cost: 8.00 },
    ],
    amount: 57,
    status: 'paid',
    date: '2023-11-18',
    discount: 5,
    taxRate: 0
  },
  {
    id: 'INV-023',
    storeId: 'store-1',
    customerId: 'cust-2',
    customerName: 'Jane Smith',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-13', productName: 'Barista Apron', quantity: 1, price: 30.00, cost: 18.00 }
    ],
    amount: 31.5,
    status: 'paid',
    date: '2023-08-20',
    taxRate: 5
  },
  {
    id: 'INV-024',
    storeId: 'store-2',
    customerId: 'cust-3',
    customerName: 'Sam Wilson',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-12', productName: 'Travel Mug', quantity: 1, price: 25.00, cost: 15.00 }
    ],
    amount: 25,
    status: 'overdue',
    date: '2023-10-10'
  },
  {
    id: 'INV-025',
    storeId: 'store-3',
    customerId: 'cust-8',
    customerName: 'Sarah Black',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-14', productName: 'Syrup Variety Pack', quantity: 1, price: 18.00, cost: 10.00 }
    ],
    amount: 18.00,
    status: 'paid',
    date: '2023-11-19'
  },
  {
    id: 'INV-026',
    storeId: 'store-1',
    customerId: 'cust-6',
    customerName: 'Emily White',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-4', productName: 'Milk Frother', quantity: 1, price: 75.00, cost: 45.00 }
    ],
    amount: 71.25,
    status: 'paid',
    date: '2023-11-20',
    discount: 5,
    taxRate: 0,
  },
  {
    id: 'INV-027',
    storeId: 'store-2',
    customerId: 'cust-7',
    customerName: 'Michael Green',
    userId: 'user-2',
    userName: 'Manager Mike',
    items: [
      { productId: 'prod-13', productName: 'Barista Apron', quantity: 2, price: 30.00, cost: 18.00 }
    ],
    amount: 63.00,
    status: 'pending',
    date: '2023-11-21',
    discount: 0,
    taxRate: 5,
  },
  {
    id: 'INV-028',
    storeId: 'store-3',
    customerId: 'cust-4',
    customerName: 'Alice Johnson',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-12', productName: 'Travel Mug', quantity: 4, price: 25.00, cost: 15.00 }
    ],
    amount: 90.00,
    status: 'paid',
    date: '2023-11-22',
    discount: 10,
    taxRate: 0,
  },
  {
    id: 'INV-029',
    storeId: 'store-1',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-8', productName: 'Assorted Pastries', quantity: 10, price: 3.50, cost: 1.50 }
    ],
    amount: 35.00,
    status: 'paid',
    date: '2023-11-22',
  },
  {
    id: 'INV-030',
    storeId: 'store-2',
    customerId: 'cust-1',
    customerName: 'John Doe',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 3, price: 22.00, cost: 12.00 }
    ],
    amount: 62.70,
    status: 'paid',
    date: '2023-08-15',
    discount: 5,
    taxRate: 0,
  },
  {
    id: 'INV-031',
    storeId: 'store-3',
    customerId: 'cust-2',
    customerName: 'Jane Smith',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-7', productName: 'Oat Milk (1L)', quantity: 5, price: 4.75, cost: 2.75 }
    ],
    amount: 24.94,
    status: 'overdue',
    date: '2023-09-30',
    discount: 0,
    taxRate: 5,
  },
  {
    id: 'INV-032',
    storeId: 'store-1',
    customerId: 'cust-5',
    customerName: 'Bob Brown',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-14', productName: 'Syrup Variety Pack', quantity: 2, price: 18.00, cost: 10.00 }
    ],
    amount: 36.00,
    status: 'paid',
    date: '2023-11-23',
  },
  {
    id: 'INV-033',
    storeId: 'store-2',
    customerId: 'cust-8',
    customerName: 'Sarah Black',
    userId: 'user-2',
    userName: 'Manager Mike',
    items: [
      { productId: 'prod-11', productName: 'Gooseneck Kettle', quantity: 1, price: 89.99, cost: 60.00 },
      { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 1, price: 40.00, cost: 20.00 }
    ],
    amount: 136.49,
    status: 'pending',
    date: '2023-11-24',
    taxRate: 5,
  },
  {
    id: 'INV-034',
    storeId: 'store-3',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-9', productName: 'Cleaning Tablets', quantity: 1, price: 15.00, cost: 8.00 }
    ],
    amount: 15,
    status: 'paid',
    date: '2023-11-25',
  },
  {
    id: 'INV-035',
    storeId: 'store-1',
    customerId: 'cust-4',
    customerName: 'Alice Johnson',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
      { productId: 'prod-2', productName: 'Coffee Grinder', quantity: 1, price: 129.50, cost: 80.00 }
    ],
    amount: 116.55,
    status: 'paid',
    date: '2023-11-26',
    discount: 10
  },
  {
    id: 'INV-036',
    storeId: 'store-1',
    customerId: 'cust-7',
    customerName: 'Michael Green',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-12', productName: 'Travel Mug', quantity: 2, price: 25.00, cost: 15.00 },
        { productId: 'prod-8', productName: 'Assorted Pastries', quantity: 4, price: 3.50, cost: 1.50 }
    ],
    amount: 67.20,
    status: 'paid',
    date: '2023-07-28',
    taxRate: 5,
  },
  {
    id: 'INV-037',
    storeId: 'store-2',
    customerId: 'cust-1',
    customerName: 'John Doe',
    userId: 'user-2',
    userName: 'Manager Mike',
    items: [
        { productId: 'prod-13', productName: 'Barista Apron', quantity: 1, price: 30.00, cost: 18.00 }
    ],
    amount: 28.50,
    status: 'overdue',
    date: '2023-10-12',
    discount: 5,
    taxRate: 0,
  },
  {
    id: 'INV-038',
    storeId: 'store-3',
    customerId: 'cust-4',
    customerName: 'Alice Johnson',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 10, price: 22.00, cost: 12.00 }
    ],
    amount: 198.00,
    status: 'paid',
    date: '2023-08-05',
    discount: 10,
  },
  {
    id: 'INV-039',
    storeId: 'store-1',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-6', productName: 'Almond Milk (1L)', quantity: 6, price: 4.50, cost: 2.50 }
    ],
    amount: 27.00,
    status: 'pending',
    date: '2023-11-28',
  },
  {
    id: 'INV-040',
    storeId: 'store-2',
    customerId: 'cust-5',
    customerName: 'Bob Brown',
    userId: 'user-3',
    userName: 'Cashier Chloe',
    items: [
        { productId: 'prod-4', productName: 'Milk Frother', quantity: 1, price: 75.00, cost: 45.00 },
    ],
    amount: 78.75,
    status: 'paid',
    date: '2023-11-28',
    taxRate: 5,
  }
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
    },
    {
        id: 'PO-003',
        vendorId: 'vend-2',
        vendorName: 'Cup Supplies Inc.',
        storeId: 'store-1',
        items: [
            { productId: 'prod-10', productName: 'Digital Scale', quantity: 15, cost: 20.00 },
            { productId: 'prod-12', productName: 'Travel Mug', quantity: 50, cost: 15.00 },
        ],
        totalCost: (15 * 20.00) + (50 * 15.00),
        status: 'pending-approval',
        orderDate: '2023-11-01',
        expectedDeliveryDate: '2023-11-06',
    },
    {
        id: 'PO-004',
        vendorId: 'vend-3',
        vendorName: 'Machinery Masters',
        storeId: 'store-1',
        items: [
            { productId: 'prod-11', productName: 'Gooseneck Kettle', quantity: 10, cost: 60.00 },
        ],
        totalCost: 600.00,
        status: 'pending',
        orderDate: '2023-11-05',
    },
    {
        id: 'PO-005',
        vendorId: 'vend-1',
        vendorName: 'Beans & Co.',
        storeId: 'store-3',
        items: [
            { productId: 'prod-7', productName: 'Oat Milk (1L)', quantity: 20, cost: 2.75 },
        ],
        totalCost: 55.00,
        status: 'cancelled',
        orderDate: '2023-10-18',
    }
];

export const initialRfqs: RFQ[] = [
    {
        id: 'RFQ-001',
        storeId: 'store-1',
        items: [
            { productId: 'prod-1', productName: 'Espresso Machine', quantity: 10 },
            { productId: 'prod-2', productName: 'Coffee Grinder', quantity: 20 },
        ],
        vendorIds: ['vend-3'],
        status: 'sent',
        creationDate: '2023-11-01',
        userId: 'user-2',
        userName: 'Manager Mike',
    },
    {
        id: 'RFQ-002',
        storeId: 'store-1',
        items: [
            { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 200 },
        ],
        vendorIds: ['vend-1', 'vend-2'],
        status: 'draft',
        creationDate: '2023-11-05',
        userId: 'user-2',
        userName: 'Manager Mike',
    },
    {
        id: 'RFQ-003',
        storeId: 'store-2',
        items: [
          { productId: 'prod-13', productName: 'Barista Apron', quantity: 50 },
        ],
        vendorIds: ['vend-2'],
        status: 'closed',
        creationDate: '2023-10-15',
        userId: 'user-4',
        userName: 'Inventory Ian'
    }
];

export const initialAssets: Asset[] = [
  { id: 'asset-1', name: 'Company Van', category: 'Vehicle', serialNumber: 'VIN123456789', purchaseDate: '2022-01-15', purchaseCost: 25000, status: 'in-use', location: 'store-1', assignedTo: 'user-2' },
  { id: 'asset-2', name: 'Head Office Printer', category: 'Office Equipment', serialNumber: 'PRINTER-XYZ', purchaseDate: '2021-05-20', purchaseCost: 800, status: 'in-use', location: 'Head Office' },
  { id: 'asset-3', name: 'Laptop - Manager 1', category: 'IT Equipment', serialNumber: 'LAPTOP-001', purchaseDate: '2023-02-10', purchaseCost: 1500, status: 'in-use', location: 'store-1', assignedTo: 'user-2' },
  { id: 'asset-4', name: 'Reserve Cash Register', category: 'Point of Sale', serialNumber: 'POS-005-RESERVE', purchaseDate: '2020-11-30', purchaseCost: 1200, status: 'in-storage', location: 'store-2' },
];

export const initialAttendance: AttendanceEntry[] = [];
export const initialLeaveRequests: LeaveRequest[] = [];


export const salesData: Sale[] = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
];

export const initialLedgerEntries: LedgerEntry[] = [
  { id: 'gl-1', date: '2023-10-01', account: 'Accounts Receivable', description: 'Invoice INV-001', debit: 524.99, credit: 0 },
  { id: 'gl-2', date: '2023-10-01', account: 'Sales Revenue', description: 'Invoice INV-001', debit: 0, credit: 524.99 },
  { id: 'gl-3', date: '2023-10-02', account: 'Cash', description: 'Payment for INV-001', debit: 524.99, credit: 0 },
  { id: 'gl-4', date: '2023-10-02', account: 'Accounts Receivable', description: 'Payment for INV-001', debit: 0, credit: 524.99 },
  { id: 'gl-5', date: '2023-10-15', account: 'Inventory', description: 'PO-002 Received', debit: 1700, credit: 0 },
  { id: 'gl-6', date: '2023-10-15', account: 'Accounts Payable', description: 'PO-002', debit: 0, credit: 1700 },
  { id: 'gl-7', date: '2023-10-20', account: 'Rent Expense', description: 'October Rent Payment', debit: 5000, credit: 0 },
  { id: 'gl-8', date: '2023-10-20', account: 'Cash', description: 'October Rent', debit: 0, credit: 5000 },
];

export const initialTaxRates: TaxRate[] = [
  { id: 'tax-1', name: 'Standard VAT', rate: 5, isDefault: true },
  { id: 'tax-2', name: 'Zero Rate', rate: 0 },
  { id: 'tax-3', name: 'Luxury Goods Tax', rate: 10 },
];

export const initialBudgets: Budget[] = [
  { id: 'bud-1', category: 'Marketing & Advertising', period: 'Monthly', budgetedAmount: 2000, actualAmount: 1570.50 },
  { id: 'bud-2', category: 'Operations & Utilities', period: 'Monthly', budgetedAmount: 10000, actualAmount: 9542.75 },
  { id: 'bud-3', category: 'Employee Payroll', period: 'Monthly', budgetedAmount: 25000, actualAmount: 24800 },
  { id: 'bud-4', category: 'IT & Software', period: 'Quarterly', budgetedAmount: 5000, actualAmount: 5250 },
  { id: 'bud-5', category: 'Capital Expenditures', period: 'Yearly', budgetedAmount: 50000, actualAmount: 25000 },
];

export const initialCandidates: Candidate[] = [
  { id: 'cand-1', name: 'Alicia Keys', email: 'alicia@example.com', phone: '111-222-3333', position: 'Senior Sales Associate', status: 'interviewing', applicationDate: '2023-11-10', avatar: 'https://placehold.co/40x40' },
  { id: 'cand-2', name: 'Ben Carter', email: 'ben@example.com', phone: '222-333-4444', position: 'Barista', status: 'applied', applicationDate: '2023-11-15', avatar: 'https://placehold.co/40x40' },
  { id: 'cand-3', name: 'Charlie Davis', email: 'charlie@example.com', phone: '333-444-5555', position: 'Barista', status: 'offer', applicationDate: '2023-11-05', avatar: 'https://placehold.co/40x40' },
  { id: 'cand-4', name: 'Diana Evans', email: 'diana@example.com', phone: '444-555-6666', position: 'Store Manager', status: 'hired', applicationDate: '2023-10-20', avatar: 'https://placehold.co/40x40' },
  { id: 'cand-5', name: 'Frank Green', email: 'frank@example.com', phone: '555-666-7777', position: 'Senior Sales Associate', status: 'rejected', applicationDate: '2023-11-12', avatar: 'https://placehold.co/40x40' },
];

export const initialPerformanceReviews: PerformanceReview[] = [
  { id: 'pr-1', employeeId: 'emp-3', employeeName: 'Cashier Chloe', reviewerId: 'user-2', reviewerName: 'Manager Mike', date: '2023-09-30', rating: 4, comments: 'Chloe has excellent customer service skills and is always punctual. Could improve upselling techniques.' },
  { id: 'pr-2', employeeId: 'emp-4', employeeName: 'Inventory Ian', reviewerId: 'user-2', reviewerName: 'Manager Mike', date: '2023-10-15', rating: 5, comments: 'Ian is extremely organized and has significantly improved inventory accuracy. A model employee.' },
  { id: 'pr-3', employeeId: 'emp-5', employeeName: 'Warehouse William', reviewerId: 'user-2', reviewerName: 'Manager Mike', date: '2023-10-25', rating: 3, comments: 'William is a hard worker but needs to be more careful with handling fragile items. Some breakages reported this quarter.' },
];

export const initialBillsOfMaterials: BillOfMaterials[] = [
  {
    id: 'bom-1',
    productId: 'prod-1',
    productName: 'Espresso Machine',
    items: [
      { componentId: 'prod-15', componentName: 'Casing Unit', quantity: 1 },
      { componentId: 'prod-16', componentName: 'Internal Pump Assembly', quantity: 1 },
    ],
    createdAt: '2023-01-01',
  }
];

export const initialProductionOrders: ProductionOrder[] = [
  {
    id: 'prod-ord-1',
    productId: 'prod-1',
    productName: 'Espresso Machine',
    quantity: 10,
    bomId: 'bom-1',
    status: 'planned',
    scheduledStartDate: new Date().toISOString(),
    scheduledEndDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
  },
  {
    id: 'prod-ord-2',
    productId: 'prod-1',
    productName: 'Espresso Machine',
    quantity: 5,
    bomId: 'bom-1',
    status: 'in-progress',
    scheduledStartDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    scheduledEndDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    actualStartDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
  }
];

export const initialQualityChecks: QualityCheck[] = [];

export const initialLeads: Lead[] = [
    { id: 'lead-1', name: 'Laura Williams', company: 'Innovate Corp', email: 'laura@innovate.com', phone: '123-111-2222', avatar: 'https://placehold.co/40x40', status: 'new', value: 5000, source: 'Website', assignedToId: 'user-2', assignedToName: 'Manager Mike', createdAt: new Date().toISOString() },
    { id: 'lead-2', name: 'Tom Harris', company: 'Data Solutions', email: 'tom@data.com', phone: '123-222-3333', avatar: 'https://placehold.co/40x40', status: 'contacted', value: 12000, source: 'Referral', assignedToId: 'user-2', assignedToName: 'Manager Mike', createdAt: new Date().toISOString() },
    { id: 'lead-3', name: 'Grace Lee', company: 'Quantum Tech', email: 'grace@quantum.com', phone: '123-333-4444', avatar: 'https://placehold.co/40x40', status: 'qualified', value: 8500, source: 'Cold Call', assignedToId: 'user-1', assignedToName: 'Admin User', createdAt: new Date().toISOString() },
    { id: 'lead-4', name: 'Peter Jones', company: 'Global Exports', email: 'peter@global.com', phone: '123-444-5555', avatar: 'https://placehold.co/40x40', status: 'proposal-won', value: 25000, source: 'Trade Show', assignedToId: 'user-1', assignedToName: 'Admin User', createdAt: new Date().toISOString() },
    { id: 'lead-5', name: 'Olivia Martinez', company: 'Healthful Goods', email: 'olivia@health.com', phone: '123-555-6666', avatar: 'https://placehold.co/40x40', status: 'proposal-lost', value: 3000, source: 'Website', assignedToId: 'user-2', assignedToName: 'Manager Mike', createdAt: new Date().toISOString() },
];
