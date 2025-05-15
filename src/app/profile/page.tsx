
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Mail, User as UserIcon, Save, Loader2 } from 'lucide-react'; // Renamed User to UserIcon
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [initialDisplayName, setInitialDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        const storedDisplayName = localStorage.getItem(`userName-${user.uid}`);
        const nameToSet = storedDisplayName || user.email?.split('@')[0] || '';
        setDisplayName(nameToSet);
        setInitialDisplayName(nameToSet);
      } else {
        router.push('/signin?redirect=/profile'); // Redirect to signin if not authenticated
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSaveProfile = () => {
    if (firebaseUser && typeof window !== 'undefined') {
      localStorage.setItem(`userName-${firebaseUser.uid}`, displayName);
      setInitialDisplayName(displayName); 
      toast({
        title: 'Profile Updated',
        description: 'Your display name has been saved.',
      });
       // Dispatch a storage event so UserNav can pick up the change
      window.dispatchEvent(new StorageEvent('storage', {
        key: `userName-${firebaseUser.uid}`,
        newValue: displayName,
        oldValue: initialDisplayName, // Or the previous value from localStorage
        storageArea: localStorage,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    // Should be caught by isLoading or redirect, but as a fallback
    return (
         <div className="flex min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center p-4">
            <p>Redirecting to sign in...</p>
         </div>
    );
  }

  const hasUnsavedChanges = displayName !== initialDisplayName;

  return (
    <div className="flex flex-col min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center bg-background p-4 space-y-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            Your Profile
          </CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={firebaseUser.email || ''} readOnly disabled className="pl-10 bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} className="w-full" disabled={!hasUnsavedChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
        <CardFooter>
            <Button variant="link" onClick={() => router.push('/')} className="w-full text-sm">
                Back to Dashboard
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
