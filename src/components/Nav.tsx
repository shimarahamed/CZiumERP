'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Lightbulb, Package, 
  Building2, History, Settings, Undo2, ShoppingCart, UserCog, Store, FileQuestion
} from 'lucide-react';
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
    admin: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'Inventory', 'Purchase Orders', 'Request for Quotation', 'Vendors', 'Stores', 'Reports', 'AI Upselling', 'Users', 'Activity Logs', 'Settings'],
    manager: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'Inventory', 'Purchase Orders', 'Request for Quotation', 'Vendors', 'Reports', 'Activity Logs', 'AI Upselling', 'Settings'],
    cashier: ['Dashboard', 'Invoices', 'Payments', 'Returns', 'Customers', 'AI Upselling'],
    'inventory-staff': ['Inventory', 'Purchase Orders', 'Vendors', 'Reports'],
};

const categories: NavCategory[] = [
  {
    label: 'Point of Sale',
    links: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/invoices', label: 'Invoices', icon: FileText },
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/returns', label: 'Returns', icon: Undo2 },
      { href: '/upselling', label: 'AI Upselling', icon: Lightbulb },
    ],
  },
  {
    label: 'Management',
    links: [
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { href: '/vendors', label: 'Vendors', icon: Building2 },
      { href: '/rfq', label: 'Request for Quotation', icon: FileQuestion },
    ],
  },
  {
    label: 'Administration',
    links: [
      { href: '/reports', label: 'Reports', icon: BarChart3 },
      { href: '/stores', label: 'Stores', icon: Store },
      { href: '/users', label: 'Users', icon: UserCog },
      { href: '/activity', label: 'Activity Logs', icon: History },
      { href: '/settings', label: 'Settings', icon: Settings },
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
             <h4 className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">{category.label}</h4>
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
