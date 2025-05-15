
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

// Validation Schemas
const SignInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const SignUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'], // path of error
});

// State types for useFormState
export interface SignInState {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
  success: boolean;
}

export interface SignUpState {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
  success: boolean;
}

export async function signInAction(prevState: SignInState, formData: FormData): Promise<SignInState> {
  const validatedFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  console.log('Attempting to sign in with:', { email }); // Placeholder

  // TODO: Implement actual sign-in logic here (e.g., Firebase Auth)
  // For now, we'll simulate a successful sign-in for a known user or fail
  if (email === 'user@example.com' && password === 'password123') {
    // In a real app, you'd set a session cookie or token here
    console.log('Sign-in successful (placeholder)');
  } else {
    console.log('Sign-in failed: Invalid credentials (placeholder)');
    return {
      message: 'Invalid email or password.',
      errors: {},
      success: false,
    };
  }
  
  // On successful (placeholder) sign-in, redirect to dashboard
  redirect('/'); 
  // This redirect means the success message in the component's useEffect might not show,
  // which is fine for a redirect. Alternatively, return success and let client redirect.
  // For now, server redirect is cleaner.
}

export async function signUpAction(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  console.log('Attempting to sign up with:', { email }); // Placeholder

  // TODO: Implement actual sign-up logic here (e.g., Firebase Auth, create user in DB)
  // For now, we'll simulate a successful sign-up
  
  console.log('Sign-up successful (placeholder) for user:', email);

  // On successful (placeholder) sign-up, redirect to sign-in page
  redirect('/signin?signup=success'); 
  // Similar to sign-in, redirecting from server action.
}
