"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarTrigger, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import AppLogo from '@/components/AppLogo';
import MainNav from '@/components/MainNav';
import UserNav from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="p-1.5" /> {/* Ensure trigger is always available */}
            <AppLogo />
          </div>
          <UserNav />
        </header>
        
        <div className="flex flex-1 overflow-hidden"> {/* This div wraps Sidebar and SidebarInset */}
          <Sidebar 
            collapsible="icon" 
            variant="sidebar" 
            className="border-r"
            side="left"
          >
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
