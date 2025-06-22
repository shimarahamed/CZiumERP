'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog } from '@/types';
import { initialInvoices, customers as initialCustomers, initialProducts, initialVendors } from '@/lib/data';

interface AppContextType {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUser({
        name: 'Admin User',
        email: 'admin@bizflow.com',
        avatar: 'https://placehold.co/40x40'
      });
    }
  }, []);

  const addActivityLog = (action: string, details: string) => {
    const currentUser = user || (isAuthenticated ? { name: 'Admin User', email: 'admin@bizflow.com', avatar: '' } : null);
    if (!currentUser) return;

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.email,
      action,
      details,
    };
    setActivityLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const login = (email: string, pass: string): boolean => {
    if (email === 'admin@bizflow.com') {
      const loggedInUser: User = {
        name: 'Admin User',
        email: 'admin@bizflow.com',
        avatar: 'https://placehold.co/40x40'
      };
      setIsAuthenticated(true);
      setUser(loggedInUser);
      localStorage.setItem('isAuthenticated', 'true');
      
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: loggedInUser.email,
        action: 'User Login',
        details: `User ${loggedInUser.email} logged in.`,
      };
      setActivityLogs(prevLogs => [newLog, ...prevLogs]);

      return true;
    }
    return false;
  };

  const logout = () => {
    if(user) {
        addActivityLog('User Logout', `User ${user.email} logged out.`);
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
  };


  return (
    <AppContext.Provider value={{ 
      invoices, setInvoices, 
      customers, setCustomers,
      products, setProducts,
      vendors, setVendors,
      isAuthenticated, user, login, logout,
      activityLogs, addActivityLog
    }}>
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
