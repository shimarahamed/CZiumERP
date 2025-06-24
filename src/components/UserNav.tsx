'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const { user, logout } = useAppContext();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
      <Avatar className="h-10 w-10 border-2 border-primary/50">
        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person user" />
        <AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
        <span className="text-sm font-medium text-sidebar-foreground">{user.name}</span>
        <span className="text-xs text-sidebar-foreground/60">{user.email}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 group-data-[collapsible=icon]:hidden"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
