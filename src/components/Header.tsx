'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, Bell, ChevronsUpDown } from 'lucide-react';
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

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export default function Header({ title, children }: HeaderProps) {
  const { currentStore, stores, selectStore, logout } = useAppContext();
  const router = useRouter();

  const handleStoreChange = (storeId: string) => {
    selectStore(storeId);
    // Optionally refresh or navigate to reflect changes immediately
    window.location.reload(); 
  }
  
  const handleSwitchStore = () => {
    router.push('/select-store');
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 min-w-0">
        <SidebarTrigger className="md:hidden" />
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
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
