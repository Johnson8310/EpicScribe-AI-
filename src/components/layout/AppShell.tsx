
"use client";
import { useState, useEffect, type ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarTrigger, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import AppLogo from '@/components/AppLogo';
import MainNav from '@/components/MainNav';
import UserNav from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background px-4 sm:px-6 shadow-sm justify-between">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block w-64 border-r p-2">
            <Skeleton className="h-8 mb-4" />
            <Skeleton className="h-8 mb-2" />
            <Skeleton className="h-8" />
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background px-4 sm:px-6 shadow-sm">
          {/* Left section for SidebarTrigger */}
          <div className="flex items-center">
            <SidebarTrigger className="p-1.5 md:hidden" /> {/* Hidden on md and up if sidebar is static */}
             <div className="hidden md:block"> {/* Placeholder for spacing, or keep trigger if sidebar is always collapsible */}
               <SidebarTrigger className="p-1.5" />
             </div>
          </div>

          {/* Center section for AppLogo */}
          <div className="flex-1 flex justify-center">
            <AppLogo />
          </div>

          {/* Right section for UserNav */}
          <div className="flex items-center">
            <UserNav />
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden"> {/* This div wraps Sidebar and SidebarInset */}
          <Sidebar 
            collapsible="icon" 
            variant="sidebar" 
            className="border-r"
            side="left"
          >
            <SidebarHeader className="p-2 flex items-center md:hidden">
                {/* Mobile view: Logo inside sidebar when it's an overlay */}
                <AppLogo />
            </SidebarHeader>
            <SidebarContent className="flex-1">
              <MainNav />
            </SidebarContent>
            <SidebarFooter className="p-2">
               <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton variant="ghost" size="default" className="justify-start w-full text-sm" tooltip={{ children: "Settings", side: 'right', align: 'center' }}>
                    <Settings className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset> {/* This should handle scrolling for its content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
