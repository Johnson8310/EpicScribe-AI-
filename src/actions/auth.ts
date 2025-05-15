
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  FirebaseError
} from 'firebase/auth';

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
  path: ['confirmPassword'],
});

// State types for useFormState
export interface SignInState {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[]; // For Firebase errors or other non-field specific errors
  };
  success: boolean;
  email?: string; 
  uid?: string;
}

export interface SignUpState {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[]; // For Firebase errors
  };
  success: boolean;
}

function handleFirebaseError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password is too weak. It should be at least 6 characters.';
      default:
        console.error('Firebase Auth Error:', error.code, error.message);
        return 'An unexpected error occurred. Please try again.';
    }
  }
  console.error('Unknown Auth Error:', error);
  return 'An unknown error occurred. Please try again.';
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

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // On successful sign-in, Firebase automatically handles session.
    // The client-side UserNav will pick up the auth state change.
    return {
      message: 'Successfully signed in. Redirecting...',
      success: true,
      email: userCredential.user.email || undefined,
      uid: userCredential.user.uid,
    };
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    return {
      message: errorMessage,
      errors: { general: [errorMessage] },
      success: false,
    };
  }
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

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // Firebase handles session. Client-side UserNav picks up change.
    // User will be redirected to sign-in page to log in with new credentials.
    return {
      message: 'Account created successfully! Redirecting to sign in...',
      success: true,
    };
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    return {
      message: errorMessage,
      errors: { general: [errorMessage] },
      success: false,
    };
  }
}
