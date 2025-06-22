'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, FileText, CreditCard, BarChart3, Lightbulb } from 'lucide-react';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/upselling', label: 'AI Upselling', icon: Lightbulb },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
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
