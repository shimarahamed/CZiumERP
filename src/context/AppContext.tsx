'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog, Store, Currency, CurrencySymbols } from '@/types';
import { initialInvoices, customers as initialCustomers, initialProducts, initialVendors, initialStores } from '@/lib/data';

const currencySymbols: CurrencySymbols = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  AED: 'AED',
  LKR: 'LKR',
};

interface AppContextType {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  stores: Store[];
  currentStore: Store | null;
  selectStore: (storeId: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => void;
  currency: Currency;
  setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  currencySymbol: string;
  currencySymbols: CurrencySymbols;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [stores] = useState<Store[]>(initialStores);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedStoreId = localStorage.getItem('currentStoreId');
    const storedCurrency = localStorage.getItem('currency') as Currency;

    if (storedCurrency && currencySymbols[storedCurrency]) {
      setCurrency(storedCurrency);
      setCurrencySymbol(currencySymbols[storedCurrency]);
    }

    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUser({
        name: 'Admin User',
        email: 'admin@bizflow.com',
        avatar: 'https://placehold.co/40x40'
      });
      if (storedStoreId) {
        const store = stores.find(s => s.id === storedStoreId);
        setCurrentStore(store || null);
      }
    }
  }, [stores]);

  const handleSetCurrency = (newCurrency: Currency) => {
    if (currencySymbols[newCurrency]) {
      setCurrency(newCurrency);
      setCurrencySymbol(currencySymbols[newCurrency]);
      localStorage.setItem('currency', newCurrency);
      addActivityLog('Settings Updated', `Currency changed to ${newCurrency}`);
    }
  };

  const addActivityLog = (action: string, details: string) => {
    const currentUser = user || (isAuthenticated ? { name: 'Admin User', email: 'admin@bizflow.com', avatar: '' } : null);
    if (!currentUser) return;

    const storeInfo = currentStore ? ` (Store: ${currentStore.name})` : '';

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.email,
      action: action,
      details: `${details}${storeInfo}`,
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
      
      addActivityLog('User Login', `User ${loggedInUser.email} logged in.`);
      return true;
    }
    return false;
  };

  const selectStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
        setCurrentStore(store);
        localStorage.setItem('currentStoreId', store.id);
        addActivityLog('Store Selected', `Session set to store: ${store.name}`);
    }
  };

  const logout = () => {
    if(user) {
        addActivityLog('User Logout', `User ${user.email} logged out.`);
    }
    setIsAuthenticated(false);
    setUser(null);
    setCurrentStore(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentStoreId');
  };


  return (
    <AppContext.Provider value={{ 
      invoices, setInvoices, 
      customers, setCustomers,
      products, setProducts,
      vendors, setVendors,
      stores,
      currentStore,
      selectStore,
      isAuthenticated, user, login, logout,
      activityLogs, addActivityLog,
      currency,
      setCurrency: handleSetCurrency as React.Dispatch<React.SetStateAction<Currency>>,
      currencySymbol,
      currencySymbols
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
