
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
import { LifeBuoy, Store } from '@/components/icons';
import UserNav from './UserNav';
import Image from 'next/image';

const UNAUTH_ROUTES = ['/login'];
const AUTH_NO_STORE_ROUTES = ['/login', '/select-store'];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentStore, isHydrated, themeSettings } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated) {
        document.title = themeSettings.appName;
    }
  }, [isHydrated, themeSettings.appName]);

  useEffect(() => {
    if (!isHydrated) return; // Wait for rehydration before running effects

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    if (!isAuthenticated && !UNAUTH_ROUTES.includes(pathname) && !AUTH_NO_STORE_ROUTES.includes(pathname)) {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.push(currentStore ? '/' : '/select-store');
    } else if (isAuthenticated && !currentStore && !AUTH_NO_STORE_ROUTES.includes(pathname)) {
      router.push('/select-store');
    } else if (isAuthenticated && currentStore && pathname === '/select-store') {
      router.push('/');
    }
  }, [isAuthenticated, currentStore, pathname, router, isHydrated]);

  if (!isHydrated) {
    return null; // Render nothing until hydration is complete to avoid mismatch
  }
  
  const isPublicPage = AUTH_NO_STORE_ROUTES.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // App is redirecting, render nothing to avoid content flash
  }


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <div className="flex flex-col h-full">
          <SidebarHeader className="p-4 flex items-center gap-3">
             <div className="p-2 bg-primary/20 rounded-lg flex items-center justify-center h-10 w-10">
                {themeSettings.logoUrl ? (
                    <Image src={themeSettings.logoUrl} alt={themeSettings.appName} width={24} height={24} className="object-contain" />
                ) : (
                    <Store className="w-6 h-6 text-primary-foreground" />
                )}
             </div>
             <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">{themeSettings.appName}</h1>
          </SidebarHeader>
          <SidebarContent>
            <Nav />
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-2">
             <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 group-data-[collapsible=icon]:justify-center">
                <LifeBuoy className="w-4 h-4" />
                <span className="group-data-[collapsible=icon]:hidden">Support</span>
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
