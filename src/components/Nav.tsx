
'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Lightbulb, Package, 
  Building2, History, Settings, Undo2, ShoppingCart, UserCog, Store, ClipboardList, 
  Archive, Clock, CalendarPlus, Banknote, UserRoundCog, BookCopy, Target, Landmark as LandmarkIcon, UserPlus, Star, Factory, Wrench, ClipboardCheck
} from '@/components/icons';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import type { Role } from '@/types';
import type { LucideIcon } from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavCategory = {
  label: string;
  links: NavLink[];
};


const navLinksConfig: Record<Role, string[]> = {
    admin: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'Inventory', 'Purchase Orders', 'Request for Quotation', 'Vendors', 'Stores', 'Reports', 'AI Upselling', 'Assets', 'Employees', 'User Accounts', 'Attendance', 'Leave Requests', 'Payroll', 'Activity Logs', 'Settings', 'General Ledger', 'Tax Management', 'Budgeting', 'Recruitment', 'Performance', 'Bill of Materials', 'Production Orders', 'Quality Control'],
    manager: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'Inventory', 'Purchase Orders', 'Request for Quotation', 'Vendors', 'Stores', 'Reports', 'Activity Logs', 'AI Upselling', 'Settings', 'Assets', 'Employees', 'General Ledger', 'Tax Management', 'Budgeting', 'Recruitment', 'Performance', 'Bill of Materials', 'Production Orders', 'Quality Control'],
    cashier: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'AI Upselling'],
    'inventory-staff': ['Inventory', 'Purchase Orders', 'Vendors', 'Reports', 'Bill of Materials', 'Production Orders', 'Quality Control'],
};

// Reorganized structure for better logical flow
const categories: NavCategory[] = [
  {
    label: 'General',
    links: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Sales & Customers',
    links: [
      { href: '/invoices', label: 'Invoices', icon: FileText },
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/returns', label: 'Returns', icon: Undo2 },
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/upselling', label: 'AI Upselling', icon: Lightbulb },
    ],
  },
  {
    label: 'Supply Chain',
    links: [
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { href: '/rfq', label: 'Request for Quotation', icon: ClipboardList },
      { href: '/vendors', label: 'Vendors', icon: Building2 },
    ],
  },
  {
    label: 'Manufacturing',
    links: [
      { href: '/manufacturing/bom', label: 'Bill of Materials', icon: Wrench },
      { href: '/manufacturing/production', label: 'Production Orders', icon: Factory },
      { href: '/manufacturing/quality', label: 'Quality Control', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Finance',
    links: [
      { href: '/accounting/general-ledger', label: 'General Ledger', icon: BookCopy },
      { href: '/accounting/assets', label: 'Assets', icon: Archive },
      { href: '/accounting/tax', label: 'Tax Management', icon: LandmarkIcon },
      { href: '/accounting/budgeting', label: 'Budgeting', icon: Target },
    ],
  },
  {
    label: 'Human Resources',
    links: [
      { href: '/human-resources/employees', label: 'Employees', icon: UserCog },
      { href: '/human-resources/recruitment', label: 'Recruitment', icon: UserPlus },
      { href: '/human-resources/performance', label: 'Performance', icon: Star },
      { href: '/human-resources/attendance', label: 'Attendance', icon: Clock },
      { href: '/human-resources/leave-requests', label: 'Leave Requests', icon: CalendarPlus },
      { href: '/human-resources/payroll', label: 'Payroll', icon: Banknote },
    ],
  },
  {
    label: 'System',
    links: [
      { href: '/stores', label: 'Stores', icon: Store },
      { href: '/users', label: 'User Accounts', icon: UserRoundCog },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/activity', label: 'Activity Logs', icon: History },
    ],
  }
];


export default function Nav() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  if (!user) return null;

  const allowedLinks = navLinksConfig[user.role] || [];

  return (
    <SidebarMenu className="p-2 space-y-4">
      {categories.map((category) => {
        const visibleLinks = category.links.filter(link => allowedLinks.includes(link.label));
        if (visibleLinks.length === 0) {
          return null;
        }

        return (
          <div key={category.label} className="space-y-1">
             <h4 className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">{category.label}</h4>
            {visibleLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(link.href)}
                  className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground"
                >
                  <Link href={link.href}>
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        );
      })}
    </SidebarMenu>
  );
}
