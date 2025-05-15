
import type { ReactNode } from 'react';
import AppLogo from '@/components/AppLogo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center bg-background p-4 space-y-8">
      <AppLogo />
      {children}
    </div>
  );
}
