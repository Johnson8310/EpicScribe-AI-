import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/constants';

export default function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
      <Image
        src="/logo.png"
        alt={`${APP_NAME} Logo`}
        width={180}
        height={40}
        priority // Makes sure the logo loads quickly
        className="object-contain"
      />
    </Link>
  );
}
