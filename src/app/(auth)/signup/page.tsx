
"use client";

import Link from 'next/link';
import { useActionState } from 'react'; // Changed from 'react-dom' and renamed
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUpAction, type SignUpState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, Lock } from 'lucide-react';

const initialState: SignUpState = {
  message: '',
  errors: {},
  success: false,
};

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUpAction, initialState); // Renamed from useFormState
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Account Created',
        description: state.message, // Message from server action
      });
      router.push('/signin?signup=success'); 
    } else if (state.message && !state.success && Object.keys(state.errors || {}).length === 0 && state.message !== '') {
      toast({
        title: 'Sign Up Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          Create Account
        </CardTitle>
        <CardDescription>Enter your details to create a new account.</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required className="pl-10" />
            </div>
            {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword.join(', ')}</p>}
          </div>
          
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
           {/* Display general errors from action that are not field-specific directly in the form as well */}
           {state.message && !state.success && Object.keys(state.errors || {}).length === 0 && state.message !== '' && (
             <p className="text-sm text-destructive text-center">{state.message}</p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

