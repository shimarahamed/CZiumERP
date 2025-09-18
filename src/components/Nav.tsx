

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Lightbulb, Package, 
  Building2, History, Settings, Undo2, ShoppingCart, UserCog, Store, ClipboardList, 
  Archive, Clock, CalendarPlus, Banknote, UserRoundCog, BookCopy, Target, Landmark as LandmarkIcon, 
  UserPlus, Star, ClipboardCheck, Megaphone, Briefcase, LifeBuoy, Truck, Map, ChevronDown
} from '@/components/icons';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import type { Role, Module } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavCategory = {
  label: Module;
  icon: LucideIcon;
  links: NavLink[];
};


const navLinksConfig: Record<Role, string[]> = {
    admin: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'AI Upselling', 'Leads', 'Marketing Campaigns', 'Inventory', 'Purchase Orders', 'Request for Quotation', 'Vendors', 'Stores', 'Reports', 'Assets', 'Employees', 'User Accounts', 'Attendance', 'Leave Requests', 'Payroll', 'Activity Logs', 'Settings', 'General Ledger', 'Tax Management', 'Budgeting', 'Job Requisitions', 'Candidate Pipeline', 'Performance', 'Bill of Materials', 'Production Orders', 'Quality Control', 'Projects', 'Support Tickets', 'HR Dashboard', 'Fleet Management', 'Route Planning', 'Shipment Tracking'],
    manager: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'AI Upselling', 'Leads', 'Marketing Campaigns', 'Inventory', 'Purchase Orders', 'Request for Quotation', 'Vendors', 'Stores', 'Reports', 'Activity Logs', 'Settings', 'Assets', 'Employees', 'General Ledger', 'Tax Management', 'Budgeting', 'Job Requisitions', 'Candidate Pipeline', 'Performance', 'Bill of Materials', 'Production Orders', 'Quality Control', 'Projects', 'Support Tickets', 'HR Dashboard', 'Fleet Management', 'Route Planning', 'Shipment Tracking'],
    cashier: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'AI Upselling'],
    'inventory-staff': ['Inventory', 'Purchase Orders', 'Vendors', 'Reports', 'Bill of Materials', 'Production Orders', 'Quality Control'],
};

// Reorganized structure for better logical flow
const categories: NavCategory[] = [
  {
    label: 'General',
    icon: LayoutDashboard,
    links: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Sales & Customers',
    icon: ShoppingCart,
    links: [
      { href: '/campaigns', label: 'Marketing Campaigns', icon: Megaphone },
      { href: '/leads', label: 'Leads', icon: Target },
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/invoices', label: 'Invoices', icon: FileText },
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/returns', label: 'Returns', icon: Undo2 },
      { href: '/upselling', label: 'AI Upselling', icon: Lightbulb },
    ],
  },
  {
    label: 'Supply Chain',
    icon: Package,
    links: [
      { href: '/vendors', label: 'Vendors', icon: Building2 },
      { href: '/rfq', label: 'Request for Quotation', icon: ClipboardList },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { href: '/inventory', label: 'Inventory', icon: Package },
    ],
  },
    {
    label: 'Shipping & Logistics',
    icon: Truck,
    links: [
      { href: '/shipping/shipments', label: 'Shipment Tracking', icon: ClipboardList },
      { href: '/shipping/vehicles', label: 'Fleet Management', icon: UserCog },
      { href: '/shipping/routes', label: 'Route Planning', icon: Map },
    ],
  },
  {
    label: 'Manufacturing',
    icon: Settings,
    links: [
      { href: '/manufacturing/bom', label: 'Bill of Materials', icon: Settings },
      { href: '/manufacturing/production', label: 'Production Orders', icon: Settings },
      { href: '/manufacturing/quality', label: 'Quality Control', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Project Management',
    icon: Briefcase,
    links: [
      { href: '/projects', label: 'Projects', icon: Briefcase },
    ]
  },
  {
    label: 'Finance',
    icon: LandmarkIcon,
    links: [
      { href: '/accounting/general-ledger', label: 'General Ledger', icon: BookCopy },
      { href: '/accounting/budgeting', label: 'Budgeting', icon: Target },
      { href: '/accounting/tax', label: 'Tax Management', icon: LandmarkIcon },
      { href: '/accounting/assets', label: 'Assets', icon: Archive },
    ],
  },
  {
    label: 'Human Resources',
    icon: UserCog,
    links: [
      { href: '/human-resources/dashboard', label: 'HR Dashboard', icon: Users },
      { href: '/human-resources/jobs', label: 'Job Requisitions', icon: ClipboardList },
      { href: '/human-resources/recruitment', label: 'Candidate Pipeline', icon: UserPlus },
      { href: '/human-resources/employees', label: 'Employees', icon: UserCog },
      { href: '/human-resources/attendance', label: 'Attendance', icon: Clock },
      { href: '/human-resources/leave-requests', label: 'Leave Requests', icon: CalendarPlus },
      { href: '/human-resources/performance', label: 'Performance', icon: Star },
      { href: '/human-resources/payroll', label: 'Payroll', icon: Banknote },
    ],
  },
  {
    label: 'Service Desk',
    icon: LifeBuoy,
    links: [
      { href: '/support/tickets', label: 'Support Tickets', icon: LifeBuoy },
    ]
  },
  {
    label: 'System',
    icon: Settings,
    links: [
      { href: '/stores', label: 'Stores', icon: Store },
      { href: '/users', label: 'User Accounts', icon: UserRoundCog },
      { href: '/activity', label: 'Activity Logs', icon: History },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  }
];


export default function Nav() {
  const pathname = usePathname();
  const { user, themeSettings } = useAppContext();
  const { state, setOpen } = useSidebar();

  // Determine initially open categories based on the active link
  const initialOpenState = categories.reduce((acc, category) => {
      if (category.links.some(link => isActive(link.href, pathname))) {
          acc[category.label] = true;
      }
      return acc;
  }, {} as Record<string, boolean>);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(initialOpenState);

  function isActive(href: string, currentPath: string) {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  }

  const toggleCategory = (label: string) => {
    if (state === 'collapsed') {
      setOpen(true);
    }
    setOpenCategories(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (!user) return null;

  const allowedLinks = navLinksConfig[user.role] || [];
  const disabledModules = themeSettings.disabledModules || [];

  return (
    <SidebarMenu className="p-2 space-y-1">
      {categories
        .filter(category => !disabledModules.includes(category.label))
        .map((category) => {
        const visibleLinks = category.links.filter(link => allowedLinks.includes(link.label));
        if (visibleLinks.length === 0) {
          return null;
        }

        const isCategoryOpen = openCategories[category.label];

        return (
          <div key={category.label}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => toggleCategory(category.label)}
                className="font-semibold text-sidebar-foreground/90"
                tooltip={category.label}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.label}</span>
                <ChevronDown className={cn(
                  "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                  isCategoryOpen && "rotate-180",
                  "group-data-[collapsible=icon]:hidden"
                )} />
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuSub data-state={isCategoryOpen ? 'open' : 'closed'}>
              {visibleLinks.map((link) => (
                <SidebarMenuSubItem key={link.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive(link.href, pathname)}
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link href={link.href}>
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </div>
        );
      })}
    </SidebarMenu>
  );
}
