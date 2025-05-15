"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookCopy, LayoutDashboard } from 'lucide-react'; // Changed Home to LayoutDashboard for distinctness
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-books', label: 'My Books', icon: BookCopy },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                variant="default"
                size="default"
                className={cn(
                  'justify-start w-full text-sm',
                  pathname === item.href
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
