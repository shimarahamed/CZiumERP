

export type Role = 'admin' | 'manager' | 'cashier' | 'inventory-staff';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  password?: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  userId?: string;
  jobTitle?: string;
  department?: string;
  dateOfJoining: string;
  salary: number;
};

export type Store = {
  id: string;
  name: string;
  address: string;
};

export type CustomerTier = 'Bronze' | 'Silver' | 'Gold';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  billingAddress?: string;
  shippingAddress?: string;
  loyaltyPoints?: number;
  tier?: CustomerTier;
};

export type Vendor = {
  id:string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays?: number;
};

export type Product = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  vendorId?: string;
  reorderThreshold?: number;
  expiryDate?: string;
  warrantyDate?: string;
  productType?: 'manufactured' | 'component' | 'standard';
};

export type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price per item at the time of sale
  cost: number; // Cost per item at the time of sale
};

export type Invoice = {
  id: string;
  storeId?: string;
  customerId?: string;
  customerName?: string;
  userId?: string;
  userName?: string;
  items: InvoiceItem[];
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'partially-refunded';
  date: string;
  discount?: number;
  taxRate?: number;
};

export type RefundItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Refund = {
  id: string;
  invoiceId: string;
  storeId?: string;
  items: RefundItem[];
  amount: number;
  reason: string;
  date: string;
};

export type PurchaseOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
};

export type PurchaseOrder = {
  id: string;
  vendorId: string;
  vendorName: string;
  storeId?: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: 'pending' | 'pending-approval' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
};

export type RFQItem = {
  productId: string;
  productName: string;
  quantity: number;
};

export type RFQ = {
  id: string;
  storeId?: string;
  items: RFQItem[];
  vendorIds: string[];
  status: 'draft' | 'sent' | 'closed';
  creationDate: string;
  userId?: string;
  userName?: string;
};

export type Sale = {
  month: string;
  revenue: number;
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
};

export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AED' | 'LKR';

export type CurrencySymbols = {
  [key in Currency]: string;
};

export type AssetStatus = 'in-use' | 'in-storage' | 'under-maintenance' | 'retired';

export type Asset = {
  id: string;
  name: string;
  category: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost: number;
  status: AssetStatus;
  location: string;
  assignedTo?: string; // User ID
};

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half-day';

export type AttendanceEntry = {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
};

export type LeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; // ISO Date String
};

export type LedgerEntry = {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
};

export type TaxRate = {
  id: string;
  name: string;
  rate: number; // e.g., 5 for 5%
  isDefault?: boolean;
};

export type Budget = {
  id: string;
  category: string;
  period: 'Monthly' | 'Quarterly' | 'Yearly';
  budgetedAmount: number;
  actualAmount: number;
};

export type CandidateStatus = 'applied' | 'interviewing' | 'offer' | 'hired' | 'rejected';

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: CandidateStatus;
  applicationDate: string; // ISO string
  avatar: string;
};

export type PerformanceReview = {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  date: string; // ISO string
  rating: number; // 1-5
  comments: string;
};

export type BOMItem = {
  componentId: string; // productId of the component
  componentName: string;
  quantity: number;
};

export type BillOfMaterials = {
  id: string;
  productId: string; // The finished product this BOM is for
  productName: string;
  items: BOMItem[];
  createdAt: string;
};

export type ProductionOrderStatus = 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

export type ProductionOrder = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  bomId: string;
  status: ProductionOrderStatus;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  notes?: string;
};

export type QualityCheck = {
  id: string;
  productionOrderId: string;
  productName: string;
  checkDate: string;
  inspectorId: string;
  inspectorName: string;
  status: 'pass' | 'fail' | 'pending';
  notes: string;
};

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal-won' | 'proposal-lost';

export type Lead = {
    id: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    avatar: string;
    status: LeadStatus;
    value?: number;
    source?: string;
    assignedToId: string;
    assignedToName: string;
    createdAt: string; // ISO String
};

export type CampaignStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type CampaignChannel = 'email' | 'social-media' | 'sms' | 'paid-ads' | 'other';

export type Campaign = {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  channel: CampaignChannel;
  targetAudience?: string;
  budget: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export type ProjectStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export type Project = {
  id: string;
  name: string;
  description: string;
  client?: string;
  status: ProjectStatus;
  managerId: string;
  teamIds: string[];
  startDate: string;
  endDate: string;
  budget: number;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  startDate: string;
  endDate: string;
  cost?: number;
};
