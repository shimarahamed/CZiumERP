
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog, Store, Currency, CurrencySymbols, PurchaseOrder, RFQ, Asset, ITAsset, AttendanceEntry, LeaveRequest, Employee, LedgerEntry, TaxRate, Budget, Candidate, PerformanceReview, BillOfMaterials, ProductionOrder, QualityCheck, Lead, Campaign, Project, Task, Ticket, Notification, JobRequisition, Shipment, ThemeSettings, Module, LoyaltySettings } from '@/types';
import { initialInvoices, initialCustomers, initialProducts, initialVendors, initialStores, initialUsers, initialPurchaseOrders, initialRfqs, initialAssets, initialItAssets, initialAttendance, initialLeaveRequests, initialEmployees, initialLedgerEntries, initialTaxRates, initialBudgets, initialCandidates, initialPerformanceReviews, initialBillsOfMaterials, initialProductionOrders, initialQualityChecks, initialLeads, initialCampaigns, initialProjects, initialTasks, initialTickets, initialJobRequisitions, initialShipments } from '@/lib/data';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { useFirestoreCollection } from '@/hooks/use-firestore-collection';

// Helper to get item from localStorage. This is now only used for user session info.
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

const defaultThemeSettings: ThemeSettings = {
    appName: 'CZium ERP',
    logoUrl: '',
    primaryColor: '231 48% 48%',
    backgroundColor: '220 17% 95%',
    accentColor: '187 100% 15%',
    invoicePrefix: 'INV-',
    purchaseOrderPrefix: 'PO-',
    disabledModules: [],
    loyaltySettings: {
        tiers: {
            Silver: { points: 500, discount: 5 },
            Gold: { points: 2000, discount: 10 },
        }
    }
};

interface AppContextType {
  // Raw Data & Setters
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
  itAssets: ITAsset[];
  setItAssets: React.Dispatch<React.SetStateAction<ITAsset[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => void;
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
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  jobRequisitions: JobRequisition[];
  setJobRequisitions: React.Dispatch<React.SetStateAction<JobRequisition[]>>;
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  
  // Auth & Store
  currentStore: Store | null;
  selectStore: (storeId: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => User | null;
  logout: () => void;
  
  // Settings
  currency: Currency;
  setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  currencySymbol: string;
  currencySymbols: CurrencySymbols;
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  companyAddress: string;
  setCompanyAddress: React.Dispatch<React.SetStateAction<string>>;
  fiscalYearStartMonth: number;
  setFiscalYearStartMonth: React.Dispatch<React.SetStateAction<number>>;
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  isHydrated: boolean;

  // Derived & Memoized Data Maps for performance
  customersMap: Map<string, Customer>;
  productsMap: Map<string, Product>;
  employeesMap: Map<string, Employee>;
  usersMap: Map<string, User>;
  vendorsMap: Map<string, Vendor>;
  storesMap: Map<string, Store>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// A static object for the "All Stores" view
const allStoresView: Store = { id: 'all', name: 'All Stores', address: 'Global Administrator View' };

let notificationIdCounter = 0;


// Memoize initial data arrays outside the component
const memoizedInitialInvoices = initialInvoices;
const memoizedInitialCustomers = initialCustomers;
const memoizedInitialProducts = initialProducts;
const memoizedInitialVendors = initialVendors;
const memoizedInitialPurchaseOrders = initialPurchaseOrders;
const memoizedInitialRfqs = initialRfqs;
const memoizedInitialAssets = initialAssets;
const memoizedInitialItAssets = initialItAssets;
const memoizedInitialUsers = initialUsers;
const memoizedInitialEmployees = initialEmployees;
const memoizedInitialStores = initialStores;
const memoizedInitialAttendance = initialAttendance;
const memoizedInitialLeaveRequests = initialLeaveRequests;
const memoizedInitialLedgerEntries = initialLedgerEntries;
const memoizedInitialTaxRates = initialTaxRates;
const memoizedInitialBudgets = initialBudgets;
const memoizedInitialCandidates = initialCandidates;
const memoizedInitialPerformanceReviews = initialPerformanceReviews;
const memoizedInitialBillsOfMaterials = initialBillsOfMaterials;
const memoizedInitialProductionOrders = initialProductionOrders;
const memoizedInitialQualityChecks = initialQualityChecks;
const memoizedInitialLeads = initialLeads;
const memoizedInitialCampaigns = initialCampaigns;
const memoizedInitialProjects = initialProjects;
const memoizedInitialTasks = initialTasks;
const memoizedInitialTickets = initialTickets;
const memoizedInitialJobRequisitions = initialJobRequisitions;
const memoizedInitialShipments = initialShipments;

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Settings that are still stored locally
  const [currency, setCurrency] = useState<Currency>('AED');
  const [companyName, setCompanyName] = useState<string>('CZium ERP');
  const [companyAddress, setCompanyAddress] = useState<string>('123 Innovation Drive, Tech City, 12345');
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState<number>(1);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [currencySymbol, setCurrencySymbol] = useState<string>('AED');
  
  const [invoices, setInvoices] = useFirestoreCollection<Invoice>('invoices', memoizedInitialInvoices, isHydrated);
  const [customers, setCustomers] = useFirestoreCollection<Customer>('customers', memoizedInitialCustomers, isHydrated);
  const [products, setProducts] = useFirestoreCollection<Product>('products', memoizedInitialProducts, isHydrated);
  const [vendors, setVendors] = useFirestoreCollection<Vendor>('vendors', memoizedInitialVendors, isHydrated);
  const [purchaseOrders, setPurchaseOrders] = useFirestoreCollection<PurchaseOrder>('purchaseOrders', memoizedInitialPurchaseOrders, isHydrated);
  const [rfqs, setRfqs] = useFirestoreCollection<RFQ>('rfqs', memoizedInitialRfqs, isHydrated);
  const [assets, setAssets] = useFirestoreCollection<Asset>('assets', memoizedInitialAssets, isHydrated);
  const [itAssets, setItAssets] = useFirestoreCollection<ITAsset>('itAssets', memoizedInitialItAssets, isHydrated);
  const [users, setUsers] = useFirestoreCollection<User>('users', memoizedInitialUsers, isHydrated);
  const [employees, setEmployees] = useFirestoreCollection<Employee>('employees', memoizedInitialEmployees, isHydrated);
  const [stores, setStores] = useFirestoreCollection<Store>('stores', memoizedInitialStores, isHydrated);
  const [activityLogs, setActivityLogs] = useFirestoreCollection<ActivityLog>('activityLogs', [], isHydrated);
  const [attendance, setAttendance] = useFirestoreCollection<AttendanceEntry>('attendance', memoizedInitialAttendance, isHydrated);
  const [leaveRequests, setLeaveRequests] = useFirestoreCollection<LeaveRequest>('leaveRequests', memoizedInitialLeaveRequests, isHydrated);
  const [ledgerEntries, setLedgerEntries] = useFirestoreCollection<LedgerEntry>('ledgerEntries', memoizedInitialLedgerEntries, isHydrated);
  const [taxRates, setTaxRates] = useFirestoreCollection<TaxRate>('taxRates', memoizedInitialTaxRates, isHydrated);
  const [budgets, setBudgets] = useFirestoreCollection<Budget>('budgets', memoizedInitialBudgets, isHydrated);
  const [candidates, setCandidates] = useFirestoreCollection<Candidate>('candidates', memoizedInitialCandidates, isHydrated);
  const [performanceReviews, setPerformanceReviews] = useFirestoreCollection<PerformanceReview>('performanceReviews', memoizedInitialPerformanceReviews, isHydrated);
  const [billsOfMaterials, setBillsOfMaterials] = useFirestoreCollection<BillOfMaterials>('billsOfMaterials', memoizedInitialBillsOfMaterials, isHydrated);
  const [productionOrders, setProductionOrders] = useFirestoreCollection<ProductionOrder>('productionOrders', memoizedInitialProductionOrders, isHydrated);
  const [qualityChecks, setQualityChecks] = useFirestoreCollection<QualityCheck>('qualityChecks', memoizedInitialQualityChecks, isHydrated);
  const [leads, setLeads] = useFirestoreCollection<Lead>('leads', memoizedInitialLeads, isHydrated);
  const [campaigns, setCampaigns] = useFirestoreCollection<Campaign>('campaigns', memoizedInitialCampaigns, isHydrated);
  const [projects, setProjects] = useFirestoreCollection<Project>('projects', memoizedInitialProjects, isHydrated);
  const [tasks, setTasks] = useFirestoreCollection<Task>('tasks', memoizedInitialTasks, isHydrated);
  const [tickets, setTickets] = useFirestoreCollection<Ticket>('tickets', memoizedInitialTickets, isHydrated);
  const [jobRequisitions, setJobRequisitions] = useFirestoreCollection<JobRequisition>('jobRequisitions', memoizedInitialJobRequisitions, isHydrated);
  const [shipments, setShipments] = useFirestoreCollection<Shipment>('shipments', memoizedInitialShipments, isHydrated);
  const [notifications, setNotifications] = useFirestoreCollection<Notification>('notifications', [], isHydrated);

  // Rehydrate state from localStorage on client-side mount
  useEffect(() => {
    const storedAuth = getStoredState('isAuthenticated', false);
    setIsAuthenticated(storedAuth);
    const storedUser = getStoredState('user', null);
    setUser(storedUser);

    const storedStoreId = getStoredState('currentStoreId', null);
    if(storedStoreId){
        if (storedStoreId === 'all' && (storedUser?.role === 'admin' || storedUser?.role === 'manager')) {
            setCurrentStore(allStoresView);
        } else if (stores.length > 0) {
            setCurrentStore(stores.find(s => s.id === storedStoreId) || null);
        }
    }
    setCurrency(getStoredState('currency', 'AED'));
    setCompanyName(getStoredState('companyName', 'CZium ERP'));
    setCompanyAddress(getStoredState('companyAddress', '123 Innovation Drive, Tech City, 12345'));
    setFiscalYearStartMonth(getStoredState('fiscalYearStartMonth', 1));
    setThemeSettings(getStoredState('themeSettings', defaultThemeSettings));
    
    setIsHydrated(true);
  }, [stores.length]); // Depend on stores to ensure it's loaded before setting current store

  // Effects to persist non-Firestore state changes to localStorage after hydration
  useEffect(() => { if (isHydrated) localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated)); }, [isAuthenticated, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('user', JSON.stringify(user)); }, [user, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('currentStoreId', JSON.stringify(currentStore ? currentStore.id : null)); }, [currentStore, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('currency', JSON.stringify(currency)); }, [currency, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('companyName', JSON.stringify(companyName)); }, [companyName, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('companyAddress', JSON.stringify(companyAddress)); }, [companyAddress, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('fiscalYearStartMonth', JSON.stringify(fiscalYearStartMonth)); }, [fiscalYearStartMonth, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('themeSettings', JSON.stringify(themeSettings)); }, [themeSettings, isHydrated]);

  const addActivityLog = useCallback(async (action: string, details: string) => {
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
    await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
  }, [user, isAuthenticated, currentStore]);
  
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    notificationIdCounter++;
    const newNotification: Notification = {
        id: `notif-${Date.now()}-${notificationIdCounter}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        ...notification,
    };
    await setDoc(doc(db, 'notifications', newNotification.id), newNotification);
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    const notificationRef = doc(db, 'notifications', id);
    await setDoc(notificationRef, { isRead: true }, { merge: true });
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => {
        const docRef = doc(db, 'notifications', n.id);
        batch.update(docRef, { isRead: true });
    });
    await batch.commit();
  }, [notifications]);
  
  // Memoized maps for performant lookups
  const customersMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
  const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const employeesMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);
  const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const vendorsMap = useMemo(() => new Map(vendors.map(v => [v.id, v])), [vendors]);
  const storesMap = useMemo(() => new Map(stores.map(s => [s.id, s])), [stores]);

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

  const login = (email: string, pass: string): User | null => {
    const foundUser = users.find(u => u.email === email && u.password === pass);

    if (foundUser) {
      const loggedInUser: User = { ...foundUser };
      delete loggedInUser.password;

      setIsAuthenticated(true);
      setUser(loggedInUser);
      
      addActivityLog('User Login', `User ${loggedInUser.email} logged in.`);
      
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'manager') {
        setCurrentStore(allStoresView);
      } else {
        // For other roles, ensure no store is selected initially so they go to select-store page
        setCurrentStore(null);
      }

      return loggedInUser;
    }
    return null;
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
    // Keep localstorage for offline data, but clear auth state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('currentStoreId');
  };
  
  const contextValue = useMemo(() => ({
      // Raw Data & Setters
      invoices, setInvoices: setInvoices as any,
      customers, setCustomers: setCustomers as any,
      products, setProducts: setProducts as any,
      vendors, setVendors: setVendors as any,
      purchaseOrders, setPurchaseOrders: setPurchaseOrders as any,
      rfqs, setRfqs: setRfqs as any,
      assets, setAssets: setAssets as any,
      itAssets, setItAssets: setItAssets as any,
      employees, setEmployees: setEmployees as any,
      users, setUsers: setUsers as any,
      stores, setStores: setStores as any,
      activityLogs, addActivityLog,
      attendance, setAttendance: setAttendance as any,
      leaveRequests, setLeaveRequests: setLeaveRequests as any,
      ledgerEntries, setLedgerEntries: setLedgerEntries as any,
      taxRates, setTaxRates: setTaxRates as any,
      budgets, setBudgets: setBudgets as any,
      candidates, setCandidates: setCandidates as any,
      performanceReviews, setPerformanceReviews: setPerformanceReviews as any,
      billsOfMaterials, setBillsOfMaterials: setBillsOfMaterials as any,
      productionOrders, setProductionOrders: setProductionOrders as any,
      qualityChecks, setQualityChecks: setQualityChecks as any,
      leads, setLeads: setLeads as any,
      campaigns, setCampaigns: setCampaigns as any,
      projects, setProjects: setProjects as any,
      tasks, setTasks: setTasks as any,
      tickets, setTickets: setTickets as any,
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      jobRequisitions, setJobRequisitions: setJobRequisitions as any,
      shipments, setShipments: setShipments as any,
      
      // Auth & Store
      currentStore,
      selectStore,
      isAuthenticated, user, login, logout,
      
      // Settings
      currency,
      setCurrency: handleSetCurrency as React.Dispatch<React.SetStateAction<Currency>>,
      currencySymbol,
      currencySymbols,
      companyName, setCompanyName,
      companyAddress, setCompanyAddress,
      fiscalYearStartMonth, setFiscalYearStartMonth,
      themeSettings, setThemeSettings,
      isHydrated,
    
      // Derived & Memoized Data Maps
      customersMap,
      productsMap,
      employeesMap,
      usersMap,
      vendorsMap,
      storesMap
  }), [
      invoices, customers, products, vendors, purchaseOrders, rfqs, assets, itAssets, employees, users, stores, activityLogs, attendance, leaveRequests, ledgerEntries, taxRates, budgets, candidates, performanceReviews, billsOfMaterials, productionOrders, qualityChecks, leads, campaigns, projects, tasks, tickets, notifications, jobRequisitions, shipments,
      setInvoices, setCustomers, setProducts, setVendors, setPurchaseOrders, setRfqs, setAssets, setItAssets, setEmployees, setUsers, setStores, setAttendance, setLeaveRequests, setLedgerEntries, setTaxRates, setBudgets, setCandidates, setPerformanceReviews, setBillsOfMaterials, setProductionOrders, setQualityChecks, setLeads, setCampaigns, setProjects, setTasks, setTickets, setJobRequisitions, setShipments,
      addActivityLog, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      currentStore, isAuthenticated, user,
      currency, currencySymbol, companyName, companyAddress, fiscalYearStartMonth, themeSettings, isHydrated,
      customersMap, productsMap, employeesMap, usersMap, vendorsMap, storesMap
  ]);


  return (
    <AppContext.Provider value={contextValue as any}>
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
