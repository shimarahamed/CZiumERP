





'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Invoice, Customer, Product, User, Vendor, ActivityLog, Store, Currency, CurrencySymbols, PurchaseOrder, RFQ, Asset, AttendanceEntry, LeaveRequest, Employee, LedgerEntry, TaxRate, Budget, Candidate, PerformanceReview, BillOfMaterials, ProductionOrder, QualityCheck, Lead, Campaign, Project, Task, Ticket, Notification, JobRequisition, Shipment, ThemeSettings, Module, LoyaltySettings } from '@/types';
import { initialInvoices, customers as initialCustomers, initialProducts, initialVendors, initialStores, initialUsers, initialPurchaseOrders, initialRfqs, initialAssets, initialAttendance, initialLeaveRequests, initialEmployees, initialLedgerEntries, initialTaxRates, initialBudgets, initialCandidates, initialPerformanceReviews, initialBillsOfMaterials, initialProductionOrders, initialQualityChecks, initialLeads, initialCampaigns, initialProjects, initialTasks, initialTickets, initialJobRequisitions, initialShipments } from '@/lib/data';
import { differenceInDays, parseISO } from 'date-fns';


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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Raw, unfiltered data states
  const [_invoices, _setInvoices] = useState<Invoice[]>(initialInvoices);
  const [_customers, _setCustomers] = useState<Customer[]>(initialCustomers);
  const [_products, _setProducts] = useState<Product[]>(initialProducts);
  const [_vendors, _setVendors] = useState<Vendor[]>(initialVendors);
  const [_purchaseOrders, _setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [_rfqs, _setRfqs] = useState<RFQ[]>(initialRfqs);
  const [_assets, _setAssets] = useState<Asset[]>(initialAssets);
  const [_users, _setUsers] = useState<User[]>(initialUsers);
  const [_employees, _setEmployees] = useState<Employee[]>(initialEmployees);
  const [_stores, _setStores] = useState<Store[]>(initialStores);
  const [_activityLogs, _setActivityLogs] = useState<ActivityLog[]>([]);
  const [_attendance, _setAttendance] = useState<AttendanceEntry[]>(initialAttendance);
  const [_leaveRequests, _setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [_ledgerEntries, _setLedgerEntries] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [_taxRates, _setTaxRates] = useState<TaxRate[]>(initialTaxRates);
  const [_budgets, _setBudgets] = useState<Budget[]>(initialBudgets);
  const [_candidates, _setCandidates] = useState<Candidate[]>(initialCandidates);
  const [_performanceReviews, _setPerformanceReviews] = useState<PerformanceReview[]>(initialPerformanceReviews);
  const [_billsOfMaterials, _setBillsOfMaterials] = useState<BillOfMaterials[]>(initialBillsOfMaterials);
  const [_productionOrders, _setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [_qualityChecks, _setQualityChecks] = useState<QualityCheck[]>(initialQualityChecks);
  const [_leads, _setLeads] = useState<Lead[]>(initialLeads);
  const [_campaigns, _setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [_projects, _setProjects] = useState<Project[]>(initialProjects);
  const [_tasks, _setTasks] = useState<Task[]>(initialTasks);
  const [_tickets, _setTickets] = useState<Ticket[]>(initialTickets);
  const [_jobRequisitions, _setJobRequisitions] = useState<JobRequisition[]>(initialJobRequisitions);
  const [_shipments, _setShipments] = useState<Shipment[]>(initialShipments);
  const [_notifications, _setNotifications] = useState<Notification[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [currency, setCurrency] = useState<Currency>('AED');
  const [currencySymbol, setCurrencySymbol] = useState<string>('AED');
  const [companyName, setCompanyName] = useState<string>('CZium ERP');
  const [companyAddress, setCompanyAddress] = useState<string>('123 Innovation Drive, Tech City, 12345');
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState<number>(1);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);

  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate state from localStorage on client-side mount
  useEffect(() => {
    const loadedStores = getStoredState('stores', initialStores);
    _setStores(loadedStores);
    
    _setInvoices(getStoredState('invoices', initialInvoices));
    _setCustomers(getStoredState('customers', initialCustomers));
    _setProducts(getStoredState('products', initialProducts));
    _setVendors(getStoredState('vendors', initialVendors));
    _setPurchaseOrders(getStoredState('purchaseOrders', initialPurchaseOrders));
    _setRfqs(getStoredState('rfqs', initialRfqs));
    _setAssets(getStoredState('assets', initialAssets));
    _setUsers(getStoredState('users', initialUsers));
    _setEmployees(getStoredState('employees', initialEmployees));
    _setActivityLogs(getStoredState('activityLogs', []));
    _setAttendance(getStoredState('attendance', initialAttendance));
    _setLeaveRequests(getStoredState('leaveRequests', initialLeaveRequests));
    _setLedgerEntries(getStoredState('ledgerEntries', initialLedgerEntries));
    _setTaxRates(getStoredState('taxRates', initialTaxRates));
    _setBudgets(getStoredState('budgets', initialBudgets));
    _setCandidates(getStoredState('candidates', initialCandidates));
    _setPerformanceReviews(getStoredState('performanceReviews', initialPerformanceReviews));
    _setBillsOfMaterials(getStoredState('billsOfMaterials', initialBillsOfMaterials));
    _setProductionOrders(getStoredState('productionOrders', initialProductionOrders));
    _setQualityChecks(getStoredState('qualityChecks', initialQualityChecks));
    _setLeads(getStoredState('leads', initialLeads));
    _setCampaigns(getStoredState('campaigns', initialCampaigns));
    _setProjects(getStoredState('projects', initialProjects));
    _setTasks(getStoredState('tasks', initialTasks));
    _setTickets(getStoredState('tickets', initialTickets));
    _setJobRequisitions(getStoredState('jobRequisitions', initialJobRequisitions));
    _setNotifications(getStoredState('notifications', []));
    _setShipments(getStoredState('shipments', initialShipments));
    
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
    setCompanyName(getStoredState('companyName', 'CZium ERP'));
    setCompanyAddress(getStoredState('companyAddress', '123 Innovation Drive, Tech City, 12345'));
    setFiscalYearStartMonth(getStoredState('fiscalYearStartMonth', 1));
    setThemeSettings(getStoredState('themeSettings', defaultThemeSettings));
    
    setIsHydrated(true);
  }, []);

  // Effects to persist state changes to localStorage after hydration
  useEffect(() => { if (isHydrated) localStorage.setItem('invoices', JSON.stringify(_invoices)); }, [_invoices, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('customers', JSON.stringify(_customers)); }, [_customers, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('products', JSON.stringify(_products)); }, [_products, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('vendors', JSON.stringify(_vendors)); }, [_vendors, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('purchaseOrders', JSON.stringify(_purchaseOrders)); }, [_purchaseOrders, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('rfqs', JSON.stringify(_rfqs)); }, [_rfqs, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('assets', JSON.stringify(_assets)); }, [_assets, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('users', JSON.stringify(_users)); }, [_users, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('employees', JSON.stringify(_employees)); }, [_employees, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('stores', JSON.stringify(_stores)); }, [_stores, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('activityLogs', JSON.stringify(_activityLogs)); }, [_activityLogs, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('attendance', JSON.stringify(_attendance)); }, [_attendance, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('leaveRequests', JSON.stringify(_leaveRequests)); }, [_leaveRequests, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('ledgerEntries', JSON.stringify(_ledgerEntries)); }, [_ledgerEntries, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('taxRates', JSON.stringify(_taxRates)); }, [_taxRates, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('budgets', JSON.stringify(_budgets)); }, [_budgets, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('candidates', JSON.stringify(_candidates)); }, [_candidates, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('performanceReviews', JSON.stringify(_performanceReviews)); }, [_performanceReviews, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('billsOfMaterials', JSON.stringify(_billsOfMaterials)); }, [_billsOfMaterials, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('productionOrders', JSON.stringify(_productionOrders)); }, [_productionOrders, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('qualityChecks', JSON.stringify(_qualityChecks)); }, [_qualityChecks, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('leads', JSON.stringify(_leads)); }, [_leads, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('campaigns', JSON.stringify(_campaigns)); }, [_campaigns, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('projects', JSON.stringify(_projects)); }, [_projects, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('tasks', JSON.stringify(_tasks)); }, [_tasks, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('tickets', JSON.stringify(_tickets)); }, [_tickets, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('jobRequisitions', JSON.stringify(_jobRequisitions)); }, [_jobRequisitions, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('shipments', JSON.stringify(_shipments)); }, [_shipments, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('notifications', JSON.stringify(_notifications)); }, [_notifications, isHydrated]);

  useEffect(() => { if (isHydrated) localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated)); }, [isAuthenticated, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('user', JSON.stringify(user)); }, [user, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('currentStoreId', JSON.stringify(currentStore ? currentStore.id : null)); }, [currentStore, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('currency', JSON.stringify(currency)); }, [currency, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('companyName', JSON.stringify(companyName)); }, [companyName, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('companyAddress', JSON.stringify(companyAddress)); }, [companyAddress, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('fiscalYearStartMonth', JSON.stringify(fiscalYearStartMonth)); }, [fiscalYearStartMonth, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('themeSettings', JSON.stringify(themeSettings)); }, [themeSettings, isHydrated]);

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
    _setActivityLogs(prevLogs => [newLog, ...prevLogs]);
  };
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    _setNotifications(prev => {
        const existing = prev.find(n => n.title === notification.title && n.description === notification.description && !n.isRead);
        if (existing) return prev;
        
        notificationIdCounter++;
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${notificationIdCounter}`,
            createdAt: new Date().toISOString(),
            isRead: false,
            ...notification,
        };
        return [newNotification, ...prev].slice(0, 50); // Keep last 50
    });
  }, []);

  const markNotificationAsRead = (id: string) => {
    _setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    _setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  };

  // Scoped data accessors
  const filterByStore = useCallback(<T extends { storeId?: string }>(data: T[]): T[] => {
    if (!isHydrated || !currentStore || currentStore.id === 'all') {
      return data;
    }
    return data.filter(item => item.storeId === currentStore.id);
  }, [currentStore, isHydrated]);
  
  const customers = useMemo(() => filterByStore(_customers), [_customers, filterByStore]);
  const products = useMemo(() => filterByStore(_products), [_products, filterByStore]);
  const vendors = useMemo(() => filterByStore(_vendors), [_vendors, filterByStore]);
  const employees = useMemo(() => filterByStore(_employees), [_employees, filterByStore]);
  const projects = useMemo(() => filterByStore(_projects), [_projects, filterByStore]);
  const invoices = useMemo(() => filterByStore(_invoices), [_invoices, filterByStore]);
  const purchaseOrders = useMemo(() => filterByStore(_purchaseOrders), [_purchaseOrders, filterByStore]);
  const rfqs = useMemo(() => filterByStore(_rfqs), [_rfqs, filterByStore]);
  const assets = useMemo(() => filterByStore(_assets), [_assets, filterByStore]);
  const budgets = useMemo(() => filterByStore(_budgets), [_budgets, filterByStore]);
  const productionOrders = useMemo(() => filterByStore(_productionOrders), [_productionOrders, filterByStore]);
  const qualityChecks = useMemo(() => filterByStore(_qualityChecks), [_qualityChecks, filterByStore]);
  const leads = useMemo(() => filterByStore(_leads), [_leads, filterByStore]);
  const campaigns = useMemo(() => filterByStore(_campaigns), [_campaigns, filterByStore]);
  const tickets = useMemo(() => filterByStore(_tickets), [_tickets, filterByStore]);

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
    const foundUser = _users.find(u => u.email === email && u.password === pass);

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

    const store = _stores.find(s => s.id === storeId);
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
    localStorage.removeItem('leads');
    localStorage.removeItem('campaigns');
    localStorage.removeItem('projects');
    localStorage.removeItem('tasks');
    localStorage.removeItem('tickets');
    localStorage.removeItem('jobRequisitions');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyAddress');
    localStorage.removeItem('fiscalYearStartMonth');
    localStorage.removeItem('notifications');
    localStorage.removeItem('shipments');
    localStorage.removeItem('themeSettings');
  };


  return (
    <AppContext.Provider value={{ 
      invoices, setInvoices: _setInvoices, 
      customers, setCustomers: _setCustomers,
      products, setProducts: _setProducts,
      vendors, setVendors: _setVendors,
      purchaseOrders, setPurchaseOrders: _setPurchaseOrders,
      rfqs, setRfqs: _setRfqs,
      assets, setAssets: _setAssets,
      employees, setEmployees: _setEmployees,
      stores: _stores,
      setStores: _setStores,
      currentStore,
      selectStore,
      isAuthenticated, user, users: _users, setUsers: _setUsers, login, logout,
      activityLogs: _activityLogs, addActivityLog,
      currency,
      setCurrency: handleSetCurrency as React.Dispatch<React.SetStateAction<Currency>>,
      currencySymbol,
      currencySymbols,
      companyName, setCompanyName,
      companyAddress, setCompanyAddress,
      fiscalYearStartMonth, setFiscalYearStartMonth,
      themeSettings, setThemeSettings,
      isHydrated,
      attendance: _attendance, setAttendance: _setAttendance,
      leaveRequests: _leaveRequests, setLeaveRequests: _setLeaveRequests,
      ledgerEntries: _ledgerEntries, setLedgerEntries: _setLedgerEntries,
      taxRates: _taxRates, setTaxRates: _setTaxRates,
      budgets, setBudgets: _setBudgets,
      candidates: _candidates, setCandidates: _setCandidates,
      performanceReviews: _performanceReviews, setPerformanceReviews: _setPerformanceReviews,
      billsOfMaterials: filterByStore(_billsOfMaterials), setBillsOfMaterials: _setBillsOfMaterials,
      productionOrders, setProductionOrders: _setProductionOrders,
      qualityChecks, setQualityChecks: _setQualityChecks,
      leads, setLeads: _setLeads,
      campaigns, setCampaigns: _setCampaigns,
      projects, setProjects: _setProjects,
      tasks: _tasks, setTasks: _setTasks,
      tickets, setTickets: _setTickets,
      notifications: _notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      jobRequisitions: _jobRequisitions, setJobRequisitions: _setJobRequisitions,
      shipments: _shipments, setShipments: _setShipments,
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

    
