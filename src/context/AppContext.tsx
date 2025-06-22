'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Invoice, Customer, Product } from '@/types';
import { initialInvoices, customers as initialCustomers, initialProducts } from '@/lib/data';

interface AppContextType {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  return (
    <AppContext.Provider value={{ invoices, setInvoices, customers, products, setProducts }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
