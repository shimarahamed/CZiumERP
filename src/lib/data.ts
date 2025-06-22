import type { Customer, Invoice, Sale } from '@/types';

export const customers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', avatar: 'https://placehold.co/40x40' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', avatar: 'https://placehold.co/40x40' },
  { id: '3', name: 'Sam Wilson', email: 'sam@example.com', phone: '345-678-9012', avatar: 'https://placehold.co/40x40' },
  { id: '4', name: 'Alice Johnson', email: 'alice@example.com', phone: '456-789-0123', avatar: 'https://placehold.co/40x40' },
  { id: '5', name: 'Bob Brown', email: 'bob@example.com', phone: '567-890-1234', avatar: 'https://placehold.co/40x40' },
];

export const invoices: Invoice[] = [
  { id: 'INV-001', customerId: '1', customerName: 'John Doe', amount: 250.00, status: 'paid', date: '2023-10-25' },
  { id: 'INV-002', customerId: '2', customerName: 'Jane Smith', amount: 150.75, status: 'pending', date: '2023-10-26' },
  { id: 'INV-003', customerId: '3', customerName: 'Sam Wilson', amount: 350.00, status: 'overdue', date: '2023-09-15' },
  { id: 'INV-004', customerId: '1', customerName: 'John Doe', amount: 450.50, status: 'paid', date: '2023-10-27' },
  { id: 'INV-005', customerId: '4', customerName: 'Alice Johnson', amount: 50.25, status: 'pending', date: '2023-10-28' },
];

export const salesData: Sale[] = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
];
