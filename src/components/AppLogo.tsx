import Link from 'next/link';
import { BookMarked } from 'lucide-react';
import { APP_NAME } from '@/constants';

export default function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-xl font-semibold text-foreground hover:text-primary transition-colors">
      <BookMarked className="h-6 w-6 text-primary" />
      <span className="hidden sm:inline-block">{APP_NAME}</span>
    </Link>
  );
}
