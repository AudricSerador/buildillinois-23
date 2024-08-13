import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/auth/supabase_client";
import { useRouter } from "next/router";
import { generateRecommendations } from "@/utils/create_recommendation";

interface DiningUser {
  id: string;
  email: string;
  name: string;
  allergies: string;
  preferences: string;
  locations: string;
  goal: string;
  isNew: boolean;
}

interface AuthContextType {
  user: DiningUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  handleUserSignedIn: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
}

// Helper function to check if a route is protected
const isProtectedRoute = (pathname: string) => {
  return pathname.startsWith('/user');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiningUser | null>(null);
  const [initialized, setInitialized] = useState(false); // Track initialization
  const router = useRouter();

  const handleUserSignedIn = useCallback(async () => {
    try {
      console.log('Fetching session data...');
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data.session) {
        const response = await fetch(
          `/api/user/get_user?id=${data.session.user.id}`
        );

        if (response.status === 404) {
          const createUserResponse = await fetch("/api/user/create_user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email,
            }),
          });

          if (createUserResponse.ok) {
            const new_res = await fetch(
              `/api/user/get_user?id=${data.session.user.id}`
            );
            const new_user = await new_res.json();
            setUser({ ...new_user.data });
            sessionStorage.setItem('user', JSON.stringify(new_user.data));
            console.log('User signed in and session stored in session storage.');
          } else {
            const errorData = await createUserResponse.json();
            console.error(errorData.error);
          }
        } else {
          const res = await response.json();
          setUser({ ...res.data });
          sessionStorage.setItem('user', JSON.stringify(res.data));
          console.log('User session restored from server.');
          if (res.data.isNew) {
            router.push("/user/onboarding");
          }
        }
      } else {
        console.log("No session found.");
      }
    } catch (error) {
      console.error('Error handling user sign in:', error);
    }
  }, [router]);

  const signIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "email offline_access",
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      sessionStorage.removeItem('user');
      router.push("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log('Auth state change detected:', event);
      if (event === "SIGNED_IN" && session) {
        handleUserSignedIn();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        sessionStorage.removeItem('user');
        router.push('/login');
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    const fetchUserData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const response = await fetch(
            `/api/user/get_user?id=${data.session.user.id}`
          );
          if (response.ok) {
            const res = await response.json();
            setUser({ ...res.data });
            sessionStorage.setItem('user', JSON.stringify(res.data));
            console.log('User data fetched and session stored in session storage.');
          }
        }
        setInitialized(true); // Mark initialization as complete
      } catch (error) {
        console.error('Error fetching user data:', error);
        setInitialized(true); // Mark initialization as complete even if there is an error
      }
    };

    // Check for user in session storage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setInitialized(true); // Mark initialization as complete
      console.log('User session restored from session storage.');
    } else {
      fetchUserData();
    }

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleUserSignedIn, router]);

  useEffect(() => {
    if (initialized) {
      if (!user && isProtectedRoute(router.pathname)) {
        console.log('Redirecting to login...');
        router.push('/login'); 
      } else if (user && user.isNew && router.pathname !== '/user/onboarding') {
        console.log('Redirecting to onboarding...');
        router.push('/user/onboarding'); 
      }
    }
  }, [user, router, initialized]); // Add `initialized` to the dependency array

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, handleUserSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}