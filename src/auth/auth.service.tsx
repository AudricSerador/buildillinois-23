import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './supabase_client';
import { useRouter } from 'next/router';

interface DiningUser {
  id: string;
  email: string;
  name: string;
  allergies: string;
  preferences: string;
  isNew: boolean;
}

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
  const [user, setUser] = useState<DiningUser | null>(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const response = await fetch(`/api/user/get_user?id=${user?.id}`);
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          return;
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUser();

    const authListener = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      console.log(session);
      if (session) {
        const response = await fetch(`/api/user/get_user?id=${session.user.id}`);
        const data = await response.json();
        console.log(data)
        if (!data) {
          console.log("User not found.")
          const createUserResponse = await fetch('/api/user/create_user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: session.user.id, email: session.user.email }) // replace with actual user data
          });
      
          if (!createUserResponse.ok) {
            const errorData = await createUserResponse.json();
            console.error(errorData.error);
          } else {
            router.push('/user/dashboard');
          }
        } else {
          console.log("User found.");
          if (data.isNew) {
            router.push('/user/onboarding');
          } else {
            router.push('/user/dashboard');
          }
        }
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email offline_access',
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