import type { Customer, Invoice, Sale, Product } from '@/types';

export const customers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', avatar: 'https://placehold.co/40x40' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', avatar: 'https://placehold.co/40x40' },
  { id: '3', name: 'Sam Wilson', email: 'sam@example.com', phone: '345-678-9012', avatar: 'https://placehold.co/40x40' },
  { id: '4', name: 'Alice Johnson', email: 'alice@example.com', phone: '456-789-0123', avatar: 'https://placehold.co/40x40' },
  { id: '5', name: 'Bob Brown', email: 'bob@example.com', phone: '567-890-1234', avatar: 'https://placehold.co/40x40' },
];

export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Espresso Machine', price: 499.99, stock: 15 },
  { id: 'prod-2', name: 'Coffee Grinder', price: 129.50, stock: 30 },
  { id: 'prod-3', name: 'Bag of Premium Coffee Beans (1kg)', price: 22.00, stock: 100 },
  { id: 'prod-4', name: 'Milk Frother', price: 75.00, stock: 45 },
  { id: 'prod-5', name: 'Set of 4 Ceramic Mugs', price: 40.00, stock: 60 },
];

export const initialInvoices: Invoice[] = [
  { 
    id: 'INV-001', 
    customerId: '1', 
    customerName: 'John Doe', 
    items: [
      { productId: 'prod-1', productName: 'Espresso Machine', quantity: 1, price: 499.99 }
    ],
    amount: 499.99, 
    status: 'paid', 
    date: '2023-10-25' 
  },
  { 
    id: 'INV-002', 
    customerId: '2', 
    customerName: 'Jane Smith', 
    items: [
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 2, price: 22.00 },
      { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 1, price: 40.00 }
    ],
    amount: 84.00, 
    status: 'pending', 
    date: '2023-10-26' 
  },
  { 
    id: 'INV-003', 
    customerId: '3', 
    customerName: 'Sam Wilson', 
    items: [
      { productId: 'prod-2', productName: 'Coffee Grinder', quantity: 1, price: 129.50 }
    ],
    amount: 129.50, 
    status: 'overdue', 
    date: '2023-09-15' 
  },
  { 
    id: 'INV-004', 
    customerId: '1', 
    customerName: 'John Doe', 
    items: [
      { productId: 'prod-4', productName: 'Milk Frother', quantity: 1, price: 75.00 },
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 5, price: 22.00 }
    ],
    amount: 185.00, 
    status: 'paid', 
    date: '2023-10-27' 
  },
  { 
    id: 'INV-005', 
    customerName: 'Alice Johnson', 
    customerId: '4', 
    items: [
      { productId: 'prod-5', productName: 'Set of 4 Ceramic Mugs', quantity: 2, price: 40.00 }
    ],
    amount: 80.00, 
    status: 'pending', 
    date: '2023-10-28' 
  },
  { 
    id: 'INV-006', 
    items: [
      { productId: 'prod-3', productName: 'Bag of Premium Coffee Beans (1kg)', quantity: 1, price: 22.00 }
    ],
    amount: 22.00, 
    status: 'pending', 
    date: '2023-10-29' 
  },
];


export const salesData: Sale[] = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
];
