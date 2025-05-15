
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Settings, LogOut, LifeBuoy, LogInIcon, UserCog } from "lucide-react"; // Added UserCog for profile

export default function UserNav() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("User");
  const router = useRouter();

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail');
      setCurrentUserEmail(storedEmail);

      if (storedEmail) {
        const storedDisplayName = localStorage.getItem('userName');
        setCurrentUserName(storedDisplayName || storedEmail.split('@')[0]);
      }
    }
  }, []); // Re-run if router changes, e.g. after navigation

  // This effect will update the display name if it changes on the profile page
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userName' && currentUserEmail) {
         setCurrentUserName(event.newValue || currentUserEmail.split('@')[0]);
      }
       if (event.key === 'userEmail') {
        const newEmail = event.newValue;
        setCurrentUserEmail(newEmail);
        if (!newEmail) { // If email is removed (logout)
          setCurrentUserName("User"); // Reset user name
        } else if (!localStorage.getItem('userName')) { // If email is set but no username (new login without display name yet)
           setCurrentUserName(newEmail.split('@')[0]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserEmail]);


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName'); // Also clear display name on logout
    }
    setCurrentUserEmail(null);
    setCurrentUserName("User"); // Reset display name
    router.push('/signin');
  };
  
  const getAvatarFallback = () => {
    if (currentUserName && currentUserName !== "User" && currentUserName.length > 0) {
        return currentUserName.charAt(0).toUpperCase();
    }
    if (currentUserEmail) {
        return currentUserEmail.charAt(0).toUpperCase();
    }
    return <UserCircle className="h-5 w-5" />;
  }


  if (!currentUserEmail) {
    return (
      <Link href="/signin" passHref>
        <Button variant="outline" size="sm">
          <LogInIcon className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={`https://avatar.vercel.sh/${currentUserEmail}.png?s=36`} alt={currentUserName} />
            <AvatarFallback>
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 py-1">
            <p className="text-sm font-medium leading-none">{currentUserName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUserEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a> {/* Anchor tag for proper styling and click handling within DropdownMenuItem */}
                <UserCog className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </a>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

