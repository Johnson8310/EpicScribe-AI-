import Link from 'next/link';
import { APP_NAME } from '@/constants';

export default function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors">
       <div 
        className="text-3xl font-cursive bg-gradient-to-r from-teal-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm"
        style={{ fontFamily: "'Great Vibes', cursive" }}
      >
        {APP_NAME}
      </div>
    </Link>
  );
}
