
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog, Store, Currency, CurrencySymbols, PurchaseOrder, RFQ } from '@/types';
import { initialInvoices, customers as initialCustomers, initialProducts, initialVendors, initialStores, initialUsers, initialPurchaseOrders, initialRfqs } from '@/lib/data';

// Helper to get item from localStorage. This will only be called on the client.
const getStoredState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const storedValue = localStorage.getItem(key);
  if (storedValue && storedValue !== "undefined") {
    try {
      return JSON.parse(storedValue);
    } catch (e) {
      console.warn(`Could not parse data for localStorage key "${key}". Using default.`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};


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
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  rfqs: RFQ[];
  setRfqs: React.Dispatch<React.SetStateAction<RFQ[]>>;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  currentStore: Store | null;
  selectStore: (storeId: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => void;
  currency: Currency;
  setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  currencySymbol: string;
  currencySymbols: CurrencySymbols;
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with server-safe defaults
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [rfqs, setRfqs] = useState<RFQ[]>(initialRfqs);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');

  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate state from localStorage on client-side mount
  useEffect(() => {
    const loadedStores = getStoredState('stores', initialStores);
    setStores(loadedStores);
    
    setInvoices(getStoredState('invoices', initialInvoices));
    setCustomers(getStoredState('customers', initialCustomers));
    setProducts(getStoredState('products', initialProducts));
    setVendors(getStoredState('vendors', initialVendors));
    setPurchaseOrders(getStoredState('purchaseOrders', initialPurchaseOrders));
    setRfqs(getStoredState('rfqs', initialRfqs));
    setUsers(getStoredState('users', initialUsers));
    setActivityLogs(getStoredState('activityLogs', []));
    setIsAuthenticated(getStoredState('isAuthenticated', false));
    setUser(getStoredState('user', null));
    const storedStoreId = getStoredState('currentStoreId', null);
    if(storedStoreId){
        setCurrentStore(loadedStores.find(s => s.id === storedStoreId) || null);
    }
    setCurrency(getStoredState('currency', 'USD'));
    
    setIsHydrated(true);
  }, []);

  // Effects to persist state changes to localStorage after hydration
  useEffect(() => { if (isHydrated) localStorage.setItem('invoices', JSON.stringify(invoices)); }, [invoices, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('customers', JSON.stringify(customers)); }, [customers, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('products', JSON.stringify(products)); }, [products, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('vendors', JSON.stringify(vendors)); }, [vendors, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('rfqs', JSON.stringify(rfqs)); }, [rfqs, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('users', JSON.stringify(users)); }, [users, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('stores', JSON.stringify(stores)); }, [stores, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('activityLogs', JSON.stringify(activityLogs)); }, [activityLogs, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated)); }, [isAuthenticated, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('user', JSON.stringify(user)); }, [user, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('currentStoreId', JSON.stringify(currentStore ? currentStore.id : null)); }, [currentStore, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('currency', JSON.stringify(currency)); }, [currency, isHydrated]);

  // Effect to update currency symbol when currency changes
  useEffect(() => {
    setCurrencySymbol(currencySymbols[currency]);
  }, [currency]);


  const handleSetCurrency = (newCurrency: Currency) => {
    if (currencySymbols[newCurrency]) {
      setCurrency(newCurrency);
      addActivityLog('Settings Updated', `Currency changed to ${newCurrency}`);
    }
  };

  const addActivityLog = (action: string, details: string) => {
    const currentUser = user || (isAuthenticated ? { name: 'Admin User', email: 'admin@cziumpos.com', avatar: '', role: 'admin' } : null);
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
    const foundUser = users.find(u => u.email === email && u.password === pass);

    if (foundUser) {
      const loggedInUser: User = { ...foundUser };
      delete loggedInUser.password;

      setIsAuthenticated(true);
      setUser(loggedInUser);
      
      addActivityLog('User Login', `User ${loggedInUser.email} logged in.`);
      return true;
    }
    return false;
  };

  const selectStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
        setCurrentStore(store);
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
    // Clear all app data on logout
    localStorage.removeItem('invoices');
    localStorage.removeItem('customers');
    localStorage.removeItem('products');
    localStorage.removeItem('vendors');
    localStorage.removeItem('activityLogs');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('currentStoreId');
    localStorage.removeItem('currency');
    localStorage.removeItem('purchaseOrders');
    localStorage.removeItem('users');
    localStorage.removeItem('stores');
    localStorage.removeItem('rfqs');
  };


  return (
    <AppContext.Provider value={{ 
      invoices, setInvoices, 
      customers, setCustomers,
      products, setProducts,
      vendors, setVendors,
      purchaseOrders, setPurchaseOrders,
      rfqs, setRfqs,
      stores,
      setStores,
      currentStore,
      selectStore,
      isAuthenticated, user, users, setUsers, login, logout,
      activityLogs, addActivityLog,
      currency,
      setCurrency: handleSetCurrency as React.Dispatch<React.SetStateAction<Currency>>,
      currencySymbol,
      currencySymbols,
      isHydrated
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
