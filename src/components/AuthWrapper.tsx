'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import Nav from '@/components/Nav';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Settings, Store } from 'lucide-react';
import UserNav from './UserNav';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
    if (isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname !== '/login') {
    return null; // or a loading spinner
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex flex-col h-full">
          <SidebarHeader className="p-4 flex items-center gap-3">
             <div className="p-2 bg-primary/20 rounded-lg">
                <Store className="w-6 h-6 text-primary-foreground" />
             </div>
             <h1 className="text-xl font-semibold text-sidebar-foreground">CZium POS</h1>
          </SidebarHeader>
          <SidebarContent>
            <Nav />
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-2">
             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
             </Button>
             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10">
                <LifeBuoy className="w-4 h-4" />
                <span>Support</span>
             </Button>
             <div className="border-t border-sidebar-border/50 my-2"></div>
             <UserNav />
          </SidebarFooter>
        </div>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
