// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{user: User | null, error: AuthError | null}>;
  signIn: (email: string, password: string) => Promise<{user: User | null, error: AuthError | null}>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{error: AuthError | null}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔐 Getting initial session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        } else if (session) {
          console.log('✅ Found existing session for:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Log user activity
          await logUserActivity('session_restored', {
            last_sign_in: session.user.last_sign_in_at
          });
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('❌ Unexpected error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Log authentication events
        if (event === 'SIGNED_IN' && session) {
          await logUserActivity('sign_in', {
            method: 'email_password',
            timestamp: new Date().toISOString()
          });
        } else if (event === 'SIGNED_OUT') {
          await logUserActivity('sign_out', {
            timestamp: new Date().toISOString()
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logUserActivity = async (activityType: string, activityData: any) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData
        });

      if (error) {
        console.warn('Failed to log user activity:', error);
      }
    } catch (error) {
      console.warn('Error logging user activity:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting to sign up user:', email);
    console.log('📋 With metadata:', metadata);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {
            full_name: '',
          }
        }
      });

      console.log('📨 Supabase signUp response:', { data, error });

      if (error) {
        console.error('❌ Sign up error:', error);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { user: null, error };
      }

      if (data.user) {
        console.log('✅ Sign up successful for:', email);
        console.log('📋 User metadata stored:', data.user.user_metadata);
        
        // Check if email confirmation is required
        if (!data.session) {
          toast({
            title: "Check Your Email",
            description: "Please check your email for a confirmation link.",
          });
        } else {
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
        }

        return { user: data.user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      const authError = error as AuthError;
      toast({
        title: "Sign Up Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { user: null, error: authError };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting to sign in user:', email);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { user: null, error };
      }

      if (data.user) {
        console.log('✅ Sign in successful for:', email);
        
        // Update last login time
        await supabase
          .from('user_profiles')
          .upsert({ 
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || '',
            last_login: new Date().toISOString()
          }, { 
            onConflict: 'id' 
          });

        toast({
          title: "Welcome Back!",
          description: "You have been signed in successfully.",
        });

        return { user: data.user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      const authError = error as AuthError;
      toast({
        title: "Sign In Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { user: null, error: authError };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out user:', user?.email);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ Sign out successful');
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error) {
      console.error('❌ Unexpected sign out error:', error);
      toast({
        title: "Sign Out Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('🔄 Requesting password reset for:', email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Password reset email sent');
      toast({
        title: "Check Your Email",
        description: "Password reset instructions have been sent to your email.",
      });

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected password reset error:', error);
      const authError = error as AuthError;
      toast({
        title: "Password Reset Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};