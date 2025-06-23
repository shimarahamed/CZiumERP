'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, FileText, CreditCard, BarChart3, Lightbulb, Package, ScanLine, Building2, History, Settings, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import type { Role } from '@/types';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/vendors', label: 'Vendors', icon: Building2 },
  { href: '/scanner', label: 'Barcode Scanner', icon: ScanLine },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/returns', label: 'Returns', icon: Undo2 },
  { href: '/activity', label: 'Activity Logs', icon: History },
  { href: '/upselling', label: 'AI Upselling', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const navLinksConfig: Record<Role, string[]> = {
    admin: ['Dashboard', 'Customers', 'Invoices', 'Inventory', 'Vendors', 'Barcode Scanner', 'Payments', 'Reports', 'Returns', 'Activity Logs', 'AI Upselling', 'Settings'],
    manager: ['Dashboard', 'Customers', 'Invoices', 'Inventory', 'Vendors', 'Barcode Scanner', 'Payments', 'Reports', 'Returns', 'Activity Logs', 'AI Upselling', 'Settings'],
    cashier: ['Dashboard', 'Customers', 'Invoices', 'Barcode Scanner', 'Payments', 'Returns', 'AI Upselling'],
    'inventory-staff': ['Inventory', 'Vendors', 'Barcode Scanner', 'Reports'],
};


export default function Nav() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  if (!user) return null;

  const allowedLinks = navLinksConfig[user.role] || [];
  const visibleLinks = links.filter(link => allowedLinks.includes(link.label));

  return (
    <SidebarMenu className="p-2">
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
    </SidebarMenu>
  );
}
