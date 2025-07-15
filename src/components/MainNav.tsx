
"use client";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BookCopy, LayoutDashboard, FileImage, Import, Wand2, Film } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/?tab=ai-generator', label: 'AI Generator', icon: Wand2, tab: 'ai-generator' },
  { href: '/?tab=import-content', label: 'Import', icon: Import, tab: 'import-content' },
  { href: '/?tab=cover-generator', label: 'Cover Generator', icon: FileImage, tab: 'cover-generator'},
  { href: '/?tab=storyboard', label: 'Storyboard', icon: Film, tab: 'storyboard' },
  { href: '/?tab=my-books', label: 'My Books', icon: BookCopy, tab: 'my-books' },
];

export default function MainNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'ai-generator';

  const isCurrentPage = (item: typeof navItems[0]) => {
    // For this app, all main navigation items lead to the root page.
    // We differentiate them by the 'tab' query parameter.
    if (pathname === '/') {
        return item.tab === currentTab;
    }
    // Handle other potential pages if the app grows
    return pathname.startsWith(item.href.split('?')[0]);
  };

  return (
    <nav className="flex flex-col gap-1 p-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref scroll={false}>
              <SidebarMenuButton
                variant="default"
                size="default"
                className={cn(
                  'justify-start w-full text-sm',
                  isCurrentPage(item)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                isActive={isCurrentPage(item)}
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
