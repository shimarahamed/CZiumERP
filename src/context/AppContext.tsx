
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog, Store, Currency, CurrencySymbols, PurchaseOrder, RFQ, Asset, ITAsset, AttendanceEntry, LeaveRequest, Employee, LedgerEntry, TaxRate, Budget, Candidate, PerformanceReview, BillOfMaterials, ProductionOrder, QualityCheck, Lead, Campaign, Project, Task, Ticket, Notification, JobRequisition, Shipment, ThemeSettings, Module, LoyaltySettings } from '@/types';
import { initialInvoices, initialCustomers, initialProducts, initialVendors, initialStores, initialUsers, initialPurchaseOrders, initialRfqs, initialAssets, initialItAssets, initialAttendance, initialLeaveRequests, initialEmployees, initialLedgerEntries, initialTaxRates, initialBudgets, initialCandidates, initialPerformanceReviews, initialBillsOfMaterials, initialProductionOrders, initialQualityChecks, initialLeads, initialCampaigns, initialProjects, initialTasks, initialTickets, initialJobRequisitions, initialShipments } from '@/lib/data';
import { differenceInDays, parseISO } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';


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
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  currentStore: Store | null;
  selectStore: (storeId: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (email: string, pass: string) => User | null;
  logout: () => void;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// A static object for the "All Stores" view
const allStoresView: Store = { id: 'all', name: 'All Stores', address: 'Global Administrator View' };

let notificationIdCounter = 0;

// Generic hook for managing state with Firestore
function useFirestoreCollection<T extends { id: string }>(collectionName: string, initialData: T[], isHydrated: boolean) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    if (!isHydrated) return;

    const collRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(collRef, 
      (snapshot) => {
        if (snapshot.empty) {
          console.log(`No data found in ${collectionName}. Seeding initial data...`);
          const batch = writeBatch(db);
          initialData.forEach(item => {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
          });
          batch.commit().catch(e => console.error(`Failed to seed ${collectionName}:`, e));
        } else {
          const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
          setData(newData);
        }
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [isHydrated, collectionName, initialData]);

  const setCollection = useCallback(async (newData: T[] | ((prev: T[]) => T[])) => {
    const dataToSet = typeof newData === 'function' ? newData(data) : newData;
    const batch = writeBatch(db);
    dataToSet.forEach(item => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
  }, [collectionName, data]);

  return [data, setCollection] as const;
}

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
        } else {
            setCurrentStore(stores.find(s => s.id === storedStoreId) || null);
        }
    }
    setCurrency(getStoredState('currency', 'AED'));
    setCompanyName(getStoredState('companyName', 'CZium ERP'));
    setCompanyAddress(getStoredState('companyAddress', '123 Innovation Drive, Tech City, 12345'));
    setFiscalYearStartMonth(getStoredState('fiscalYearStartMonth', 1));
    setThemeSettings(getStoredState('themeSettings', defaultThemeSettings));
    
    setIsHydrated(true);
  }, [stores]); // Depend on stores to ensure it's loaded

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

  // Scoped data accessors
  const filterByStore = useCallback(<T extends { storeId?: string }>(data: T[]): T[] => {
    if (!isHydrated || !currentStore || currentStore.id === 'all') {
      return data;
    }
    return data.filter(item => item.storeId === currentStore.id);
  }, [currentStore, isHydrated]);
  
  const filteredCustomers = useMemo(() => filterByStore(customers), [customers, filterByStore]);
  const filteredProducts = useMemo(() => filterByStore(products), [products, filterByStore]);
  const filteredVendors = useMemo(() => filterByStore(vendors), [vendors, filterByStore]);
  const filteredEmployees = useMemo(() => filterByStore(employees), [employees, filterByStore]);
  const filteredProjects = useMemo(() => filterByStore(projects), [projects, filterByStore]);
  const filteredInvoices = useMemo(() => filterByStore(invoices), [invoices, filterByStore]);
  const filteredPurchaseOrders = useMemo(() => filterByStore(purchaseOrders), [purchaseOrders, filterByStore]);
  const filteredRfqs = useMemo(() => filterByStore(rfqs), [rfqs, filterByStore]);
  const filteredAssets = useMemo(() => filterByStore(assets), [assets, filterByStore]);
  const filteredBudgets = useMemo(() => filterByStore(budgets), [budgets, filterByStore]);
  const filteredProductionOrders = useMemo(() => filterByStore(productionOrders), [productionOrders, filterByStore]);
  const filteredQualityChecks = useMemo(() => filterByStore(qualityChecks), [qualityChecks, filterByStore]);
  const filteredLeads = useMemo(() => filterByStore(leads), [leads, filterByStore]);
  const filteredCampaigns = useMemo(() => filterByStore(campaigns), [campaigns, filterByStore]);
  const filteredTickets = useMemo(() => filterByStore(tickets), [tickets, filterByStore]);

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

  const fakeSetter = () => {};

  return (
    <AppContext.Provider value={{ 
      invoices: filteredInvoices, setInvoices: setInvoices as any,
      customers: filteredCustomers, setCustomers: setCustomers as any,
      products: filteredProducts, setProducts: setProducts as any,
      vendors: filteredVendors, setVendors: setVendors as any,
      purchaseOrders: filteredPurchaseOrders, setPurchaseOrders: setPurchaseOrders as any,
      rfqs: filteredRfqs, setRfqs: setRfqs as any,
      assets: filteredAssets, setAssets: setAssets as any,
      itAssets, setItAssets: setItAssets as any,
      employees: filteredEmployees, setEmployees: setEmployees as any,
      stores, setStores: setStores as any,
      currentStore,
      selectStore,
      isAuthenticated, user, users, setUsers: setUsers as any, login, logout,
      activityLogs, addActivityLog,
      currency,
      setCurrency: handleSetCurrency as React.Dispatch<React.SetStateAction<Currency>>,
      currencySymbol,
      currencySymbols,
      companyName, setCompanyName,
      companyAddress, setCompanyAddress,
      fiscalYearStartMonth, setFiscalYearStartMonth,
      themeSettings, setThemeSettings,
      isHydrated,
      attendance, setAttendance: setAttendance as any,
      leaveRequests, setLeaveRequests: setLeaveRequests as any,
      ledgerEntries, setLedgerEntries: setLedgerEntries as any,
      taxRates, setTaxRates: setTaxRates as any,
      budgets: filteredBudgets, setBudgets: setBudgets as any,
      candidates, setCandidates: setCandidates as any,
      performanceReviews, setPerformanceReviews: setPerformanceReviews as any,
      billsOfMaterials: filterByStore(billsOfMaterials), setBillsOfMaterials: setBillsOfMaterials as any,
      productionOrders: filteredProductionOrders, setProductionOrders: setProductionOrders as any,
      qualityChecks: filteredQualityChecks, setQualityChecks: setQualityChecks as any,
      leads: filteredLeads, setLeads: setLeads as any,
      campaigns: filteredCampaigns, setCampaigns: setCampaigns as any,
      projects: filteredProjects, setProjects: setProjects as any,
      tasks, setTasks: setTasks as any,
      tickets: filteredTickets, setTickets: setTickets as any,
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      jobRequisitions, setJobRequisitions: setJobRequisitions as any,
      shipments, setShipments: setShipments as any,
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
