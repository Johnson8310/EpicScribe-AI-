
"use client";

import Link from 'next/link';
import { useActionState } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAction, type SignInState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const initialState: SignInState = {
  message: '',
  errors: {},
  success: false,
};

export default function SignInPage() {
  const [state, formAction] = useActionState(signInAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // This listener handles cases where a user who is ALREADY logged in navigates to the signin page.
  // This is now the primary mechanism for redirection after a successful sign-in.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is detected, it means they are logged in.
        // We'll give a moment for any potential success toasts to show, then redirect.
        setTimeout(() => {
          const redirectPath = searchParams.get('redirect') || '/';
          router.push(redirectPath);
        }, 500); // A small delay to allow toast to be seen
      }
    });
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, [router, searchParams]);

  // This effect handles the success/error toasts from the form action.
  useEffect(() => {
    if (state.success && state.message) {
      toast({
        title: 'Signed In Successfully!',
        description: state.message,
      });
      // Redirection is now handled by the onAuthStateChanged listener above.
    } else if (!state.success && state.message) {
      // Display general errors from action, field errors are handled below inputs
      if (state.errors?.general || (Object.keys(state.errors || {}).length === 0 && state.message !== initialState.message)) {
         toast({
            title: 'Sign In Failed',
            description: state.message,
            variant: 'destructive',
        });
      }
    }
  }, [state, toast]);
  
  // This effect handles the "signup=success" query param to show a toast after registration.
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created. Please sign in.',
      });
      // Use replace to remove the query param from the URL without adding to history
      router.replace('/signin', { scroll: false });
    }
  }, [searchParams, toast, router]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <LogIn className="h-6 w-6 text-primary" />
          Sign In
        </CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="pl-10" />
            </div>
            {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-10" />
            </div>
            {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
          </div>
          
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          {state.errors?.general && (
             <p className="text-sm text-destructive text-center">{state.errors.general.join(', ')}</p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
