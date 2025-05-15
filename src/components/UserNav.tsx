
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
import { UserCircle, Settings, LogOut, LifeBuoy, LogInIcon, UserCog } from "lucide-react";
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'; // Import Firebase auth functions

export default function UserNav() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("User");
  const [isLoading, setIsLoading] = useState(true); // To handle initial auth state loading
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (user && typeof window !== 'undefined') {
        const storedDisplayName = localStorage.getItem(`userName-${user.uid}`);
        setCurrentUserName(storedDisplayName || user.email?.split('@')[0] || "User");
      } else {
        setCurrentUserName("User");
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // This effect will update the display name if it changes on the profile page
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (currentUser && event.key === `userName-${currentUser.uid}`) {
         setCurrentUserName(event.newValue || currentUser.email?.split('@')[0] || "User");
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [currentUser]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        // Clear user-specific local storage if any (like display name)
        if (currentUser) {
            localStorage.removeItem(`userName-${currentUser.uid}`);
        }
      }
      setCurrentUser(null); // State update will trigger re-render
      setCurrentUserName("User");
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally show a toast message for logout error
    }
  };
  
  const getAvatarFallback = () => {
    if (currentUserName && currentUserName !== "User" && currentUserName.length > 0) {
        return currentUserName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
        return currentUser.email.charAt(0).toUpperCase();
    }
    return <UserCircle className="h-5 w-5" />;
  }

  if (isLoading) {
    // You can return a loading spinner or a placeholder here
    return (
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback>
                    <UserCircle className="h-5 w-5 animate-pulse" />
                </AvatarFallback>
            </Avatar>
        </Button>
    );
  }

  if (!currentUser) {
    return (
      <Link href="/signin" passHref legacyBehavior>
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
            {/* Consider a more robust avatar image source if available from Firebase user profile */}
            <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email || currentUser.uid}.png?s=36`} alt={currentUserName} />
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
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a>
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
