

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog, Store, Currency, CurrencySymbols, PurchaseOrder, RFQ, Asset, AttendanceEntry, LeaveRequest, Employee, LedgerEntry, TaxRate, Budget, Candidate, PerformanceReview, BillOfMaterials, ProductionOrder, QualityCheck } from '@/types';
import { initialInvoices, customers as initialCustomers, initialProducts, initialVendors, initialStores, initialUsers, initialPurchaseOrders, initialRfqs, initialAssets, initialAttendance, initialLeaveRequests, initialEmployees, initialLedgerEntries, initialTaxRates, initialBudgets, initialCandidates, initialPerformanceReviews, initialBillsOfMaterials, initialProductionOrders, initialQualityChecks } from '@/lib/data';

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
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
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
  attendance: AttendanceEntry[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceEntry[]>>;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  ledgerEntries: LedgerEntry[];
  setLedgerEntries: React.Dispatch<React.SetStateAction<LedgerEntry[]>>;
  taxRates: TaxRate[];
  setTaxRates: React.Dispatch<React.SetStateAction<TaxRate[]>>;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  performanceReviews: PerformanceReview[];
  setPerformanceReviews: React.Dispatch<React.SetStateAction<PerformanceReview[]>>;
  billsOfMaterials: BillOfMaterials[];
  setBillsOfMaterials: React.Dispatch<React.SetStateAction<BillOfMaterials[]>>;
  productionOrders: ProductionOrder[];
  setProductionOrders: React.Dispatch<React.SetStateAction<ProductionOrder[]>>;
  qualityChecks: QualityCheck[];
  setQualityChecks: React.Dispatch<React.SetStateAction<QualityCheck[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// A static object for the "All Stores" view
const allStoresView: Store = { id: 'all', name: 'All Stores', address: 'Global Administrator View' };

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with server-safe defaults
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [rfqs, setRfqs] = useState<RFQ[]>(initialRfqs);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(initialAttendance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [taxRates, setTaxRates] = useState<TaxRate[]>(initialTaxRates);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(initialPerformanceReviews);
  const [billsOfMaterials, setBillsOfMaterials] = useState<BillOfMaterials[]>(initialBillsOfMaterials);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>(initialQualityChecks);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [currency, setCurrency] = useState<Currency>('AED');
  const [currencySymbol, setCurrencySymbol] = useState<string>('AED');

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
    setAssets(getStoredState('assets', initialAssets));
    setUsers(getStoredState('users', initialUsers));
    setEmployees(getStoredState('employees', initialEmployees));
    setActivityLogs(getStoredState('activityLogs', []));
    setAttendance(getStoredState('attendance', initialAttendance));
    setLeaveRequests(getStoredState('leaveRequests', initialLeaveRequests));
    setLedgerEntries(getStoredState('ledgerEntries', initialLedgerEntries));
    setTaxRates(getStoredState('taxRates', initialTaxRates));
    setBudgets(getStoredState('budgets', initialBudgets));
    setCandidates(getStoredState('candidates', initialCandidates));
    setPerformanceReviews(getStoredState('performanceReviews', initialPerformanceReviews));
    setBillsOfMaterials(getStoredState('billsOfMaterials', initialBillsOfMaterials));
    setProductionOrders(getStoredState('productionOrders', initialProductionOrders));
    setQualityChecks(getStoredState('qualityChecks', initialQualityChecks));
    
    const storedAuth = getStoredState('isAuthenticated', false);
    setIsAuthenticated(storedAuth);
    const storedUser = getStoredState('user', null);
    setUser(storedUser);

    const storedStoreId = getStoredState('currentStoreId', null);
    if(storedStoreId){
        if (storedStoreId === 'all' && (storedUser?.role === 'admin' || storedUser?.role === 'manager')) {
            setCurrentStore(allStoresView);
        } else {
            setCurrentStore(loadedStores.find(s => s.id === storedStoreId) || null);
        }
    }
    setCurrency(getStoredState('currency', 'AED'));
    
    setIsHydrated(true);
  }, []);

  // Effects to persist state changes to localStorage after hydration
  useEffect(() => { if (isHydrated) localStorage.setItem('invoices', JSON.stringify(invoices)); }, [invoices, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('customers', JSON.stringify(customers)); }, [customers, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('products', JSON.stringify(products)); }, [products, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('vendors', JSON.stringify(vendors)); }, [vendors, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('rfqs', JSON.stringify(rfqs)); }, [rfqs, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('assets', JSON.stringify(assets)); }, [assets, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('users', JSON.stringify(users)); }, [users, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('employees', JSON.stringify(employees)); }, [employees, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('stores', JSON.stringify(stores)); }, [stores, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('activityLogs', JSON.stringify(activityLogs)); }, [activityLogs, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('attendance', JSON.stringify(attendance)); }, [attendance, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests)); }, [leaveRequests, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('ledgerEntries', JSON.stringify(ledgerEntries)); }, [ledgerEntries, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('taxRates', JSON.stringify(taxRates)); }, [taxRates, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('budgets', JSON.stringify(budgets)); }, [budgets, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('candidates', JSON.stringify(candidates)); }, [candidates, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('performanceReviews', JSON.stringify(performanceReviews)); }, [performanceReviews, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('billsOfMaterials', JSON.stringify(billsOfMaterials)); }, [billsOfMaterials, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('productionOrders', JSON.stringify(productionOrders)); }, [productionOrders, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('qualityChecks', JSON.stringify(qualityChecks)); }, [qualityChecks, isHydrated]);

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
    const currentUser = user || (isAuthenticated ? { name: 'Admin User', email: 'admin@czium.com', avatar: '', role: 'admin' } : null);
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
      
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'manager') {
        selectStore('all');
      } else {
        // For other roles, ensure no store is selected initially so they go to select-store page
        setCurrentStore(null);
      }

      return true;
    }
    return false;
  };

  const selectStore = (storeId: string) => {
    if (storeId === 'all') {
      setCurrentStore(allStoresView);
      addActivityLog('Store Selected', 'Session set to All Stores (Global View)');
      return;
    }

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
    localStorage.removeItem('employees');
    localStorage.removeItem('stores');
    localStorage.removeItem('rfqs');
    localStorage.removeItem('assets');
    localStorage.removeItem('attendance');
    localStorage.removeItem('leaveRequests');
    localStorage.removeItem('ledgerEntries');
    localStorage.removeItem('taxRates');
    localStorage.removeItem('budgets');
    localStorage.removeItem('candidates');
    localStorage.removeItem('performanceReviews');
    localStorage.removeItem('billsOfMaterials');
    localStorage.removeItem('productionOrders');
    localStorage.removeItem('qualityChecks');
  };


  return (
    <AppContext.Provider value={{ 
      invoices, setInvoices, 
      customers, setCustomers,
      products, setProducts,
      vendors, setVendors,
      purchaseOrders, setPurchaseOrders,
      rfqs, setRfqs,
      assets, setAssets,
      employees, setEmployees,
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
      isHydrated,
      attendance, setAttendance,
      leaveRequests, setLeaveRequests,
      ledgerEntries, setLedgerEntries,
      taxRates, setTaxRates,
      budgets, setBudgets,
      candidates, setCandidates,
      performanceReviews, setPerformanceReviews,
      billsOfMaterials, setBillsOfMaterials,
      productionOrders, setProductionOrders,
      qualityChecks, setQualityChecks
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
