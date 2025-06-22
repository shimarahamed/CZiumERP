import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import Nav from '@/components/Nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LifeBuoy, LogOut, Settings, Store } from 'lucide-react';
import { AppProvider } from '@/context/AppContext'; // Import AppProvider

export const metadata: Metadata = {
  title: 'CZium POS',
  description: 'Modern POS for your business',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider> {/* Wrap with AppProvider */}
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
                   <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/50">
                          <AvatarImage src="https://placehold.co/40x40" alt="Admin User" data-ai-hint="person user" />
                          <AvatarFallback>AU</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                          <span className="text-sm font-medium text-sidebar-foreground">Admin User</span>
                          <span className="text-xs text-sidebar-foreground/60">admin@bizflow.com</span>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10">
                          <LogOut className="w-4 h-4" />
                      </Button>
                   </div>
                </SidebarFooter>
              </div>
            </Sidebar>
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
