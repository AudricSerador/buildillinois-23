import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './supabase_client';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthContextProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log(data)
        if (error) {
          console.error(error);
          // If there's an error, log the user out
          await supabase.auth.signOut();
          return;
        } else {
          setUser(data?.user ?? null);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUser();

    const authListener = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session) {
        router.push('/user/dashboard'); // Redirect the user to the dashboard page
      }
    });

    const refreshInterval = setInterval(async () => {
      await supabase.auth.refreshSession();
    }, 5 * 60 * 1000);

    return () => {
      authListener.data.subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email offline_access',
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/user/dashboard`,
      },
    });
  
    if (error) {
      throw new Error(error.message);
    }
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}