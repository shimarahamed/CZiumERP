export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

export type Invoice = {
  id: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
};

export type Sale = {
  month: string;
  revenue: number;
};
