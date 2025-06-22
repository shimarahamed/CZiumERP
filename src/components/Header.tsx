'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, Bell } from 'lucide-react';
import { Input } from './ui/input';

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
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
