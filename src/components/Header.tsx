
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, Bell, ChevronsUpDown, ArrowLeft, MailOpen } from 'lucide-react';
import { Input } from './ui/input';
import type React from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { cn } from '@/lib/utils';

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
};

export default function Header({ title, children, showBackButton = false }: HeaderProps) {
  const { 
    currentStore, stores, selectStore, user, 
    notifications, markNotificationAsRead, markAllNotificationsAsRead 
  } = useAppContext();
  const router = useRouter();
  
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const handleStoreChange = (storeId: string) => {
    selectStore(storeId);
    // Optionally refresh or navigate to reflect changes immediately
    window.location.reload(); 
  }
  
  const handleSwitchStore = () => {
    router.push('/select-store');
  }

  const handleNotificationClick = (notification: { id: string, href?: string }) => {
    markNotificationAsRead(notification.id);
    if (notification.href) {
      router.push(notification.href);
    }
  }

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <SidebarTrigger />
        {showBackButton && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
        )}
        <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 max-w-[150px] sm:max-w-[200px]">
                   <span className="truncate">{currentStore?.name || "No Store Selected"}</span>
                   <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Switch Store</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdminOrManager && (
                  <DropdownMenuItem onClick={() => handleStoreChange('all')} disabled={currentStore?.id === 'all'}>
                    All Stores
                  </DropdownMenuItem>
                )}
                {stores.map(store => (
                    <DropdownMenuItem key={store.id} onClick={() => handleStoreChange(store.id)} disabled={store.id === currentStore?.id}>
                        {store.name}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSwitchStore}>
                  Change Store Session
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {children}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background rounded-full" />
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                            {unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 {(notifications || []).length > 0 ? (
                    <ScrollArea className="h-[300px]">
                        {notifications.map(notification => (
                        <DropdownMenuItem 
                            key={notification.id} 
                            className={cn("flex flex-col items-start gap-1 p-2 cursor-pointer", !notification.isRead && "bg-primary/5")}
                            onSelect={() => handleNotificationClick(notification)}
                        >
                            <div className="flex justify-between w-full">
                                <p className="font-semibold">{notification.title}</p>
                                {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground w-full text-wrap">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                        </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                    ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">No new notifications</p>
                    )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={markAllNotificationsAsRead} disabled={unreadCount === 0}>
                    <MailOpen className="mr-2 h-4 w-4" />
                    <span>Mark all as read</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
