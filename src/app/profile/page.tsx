
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Mail, User, Save } from 'lucide-react';
import AppLogo from '@/components/AppLogo'; // Optional: if you want the logo here too

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [initialDisplayName, setInitialDisplayName] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail');
      if (!storedEmail) {
        router.push('/signin');
      } else {
        setEmail(storedEmail);
        const storedDisplayName = localStorage.getItem('userName');
        if (storedDisplayName) {
          setDisplayName(storedDisplayName);
          setInitialDisplayName(storedDisplayName);
        } else {
          // Default display name from email if not set
          const nameFromEmail = storedEmail.split('@')[0];
          setDisplayName(nameFromEmail);
          setInitialDisplayName(nameFromEmail);
        }
      }
    }
  }, [router]);

  const handleSaveProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', displayName);
      setInitialDisplayName(displayName); // Update initial state to prevent "unsaved changes" feel
      toast({
        title: 'Profile Updated',
        description: 'Your display name has been saved.',
      });
    }
  };

  if (!email) {
    // Still loading or redirecting
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center p-4">
        <p>Loading profile...</p>
      </div>
    );
  }

  const hasUnsavedChanges = displayName !== initialDisplayName;

  return (
    <div className="flex flex-col min-h-[calc(100vh-var(--header-height,4rem))] items-center justify-center bg-background p-4 space-y-8">
      {/* <AppLogo /> Optional: if you want the logo here */}
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
              <Input id="email" type="email" value={email} readOnly disabled className="pl-10 bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
