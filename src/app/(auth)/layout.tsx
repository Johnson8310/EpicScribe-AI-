
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
