import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; needsEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session on mount
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        // Only set session and user if email is confirmed
        if (session?.user?.email_confirmed_at) {
          setSession(session);
          setUser(session.user);
        } else {
          // Clear any unconfirmed sessions
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          // Only set user if email is confirmed
          if (session?.user?.email_confirmed_at) {
            setSession(session);
            setUser(session.user);
          } else {
            // Email not confirmed, clear session
            setSession(null);
            setUser(null);
          }
          break;

        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          break;

        case 'USER_UPDATED':
          // Handle email confirmation
          if (session?.user?.email_confirmed_at) {
            setSession(session);
            setUser(session.user);
          }
          break;

        case 'TOKEN_REFRESHED':
          if (session?.user?.email_confirmed_at) {
            setSession(session);
            setUser(session.user);
          }
          break;

        default:
          // For other events, check if session is valid
          if (session?.user?.email_confirmed_at) {
            setSession(session);
            setUser(session.user);
          } else {
            setSession(null);
            setUser(null);
          }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user with email and password
   * Email confirmation is required before the user can sign in
   *
   * @param email - User's email address
   * @param password - User's password (min 6 characters)
   * @returns Object with error (if any) and needsEmailVerification flag
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect URL after email confirmation
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Don't automatically sign in after signup
          // This ensures user must verify email first
          data: {
            email_confirmed: false
          }
        }
      });

      if (error) {
        return {
          error,
          needsEmailVerification: false
        };
      }

      // CRITICAL: If session exists, email confirmation is DISABLED in Supabase
      // We MUST sign out immediately to enforce email verification
      if (data.session) {
        console.warn('⚠️ WARNING: Email confirmation is DISABLED in Supabase settings!');
        console.warn('Please enable it: Authentication > Providers > Email > Enable "Confirm email"');

        // Force sign out to prevent login without verification
        await supabase.auth.signOut();
      }

      // Always clear any session created during signup
      // User should ONLY get session after email verification
      setSession(null);
      setUser(null);

      return {
        error: null,
        needsEmailVerification: true
      };
    } catch (err: any) {
      return {
        error: err as AuthError,
        needsEmailVerification: false
      };
    }
  };

  /**
   * Sign in an existing user with email and password
   * User must have verified their email address
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Object with error (if any)
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // CRITICAL: Always check if email is confirmed
      // Even if Supabase email confirmation is disabled, we enforce it here
      if (!data.user?.email_confirmed_at) {
        console.warn('⚠️ User attempting to login without email verification');

        // FORCE sign out the user immediately
        await supabase.auth.signOut();

        // Clear local state
        setSession(null);
        setUser(null);

        // Return a custom error
        const unverifiedError: AuthError = {
          name: 'Email not confirmed',
          message: 'Email not confirmed. Please check your inbox and verify your email address before signing in.',
          status: 400
        };

        return { error: unverifiedError };
      }

      // Email is confirmed, session will be set by onAuthStateChange
      return { error: null };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  /**
   * Sign out the current user
   * Clears session and user state
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * Resend verification email to user
   * Useful if user didn't receive the initial email
   *
   * @param email - User's email address
   * @returns Object with error (if any)
   */
  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      return { error };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
