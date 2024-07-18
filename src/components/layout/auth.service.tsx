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
            router.push("/user/dashboard");
          } else {
            const errorData = await createUserResponse.json();
            console.error(errorData.error);
          }
        } else {
          const res = await response.json();
          setUser({ ...res.data });
          if (res.data.isNew) {
            router.push("/user/onboarding");
          } else {
            generateRecommendations(res.data.id);
            router.push("/user/dashboard");
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
      router.push("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          handleUserSignedIn();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    // Initial user fetch
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
          }
        }
        setInitialized(true); // Mark initialization as complete
      } catch (error) {
        console.error('Error fetching user data:', error);
        setInitialized(true); // Mark initialization as complete even if there is an error
      }
    };

    fetchUserData();

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleUserSignedIn]);

  useEffect(() => {
    if (initialized) {
      if (!user && isProtectedRoute(router.pathname)) {
        router.push('/login'); 
      } else if (user && user.isNew && router.pathname !== '/user/onboarding') {
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
