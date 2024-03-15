import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase_client";
import { useRouter } from "next/router";

interface DiningUser {
  id: string;
  email: string;
  name: string;
  allergies: string;
  preferences: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiningUser | null>(null);
  const router = useRouter(); // Initialize useRouter

  const handleUserSignedIn = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log(data);
    if (data.session) {
      const response = await fetch(
        `/api/user/get_user?id=${data.session.user.id}`
      );

      if (response.status === 404) {
        console.log("User not found. Creating new user.");
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

        const new_res = await fetch(
          `/api/user/get_user?id=${data.session.user.id}`
        );
        const new_user = await new_res.json();
        setUser({ ...new_user.data });
        
        if (!createUserResponse.ok) {
          const errorData = await createUserResponse.json();
          console.error(errorData.error);
        } else {
          router.push("/user/dashboard");
        }
      } else {
        const res = await response.json();
        console.log("User found.");
        setUser({ ...res.data });
        if (res.data.isNew) {
          router.push("/user/onboarding");
        } else {
          router.push("/user/dashboard");
        }
      }
    } else {
      console.log("No session found.");
    }
  };

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email offline_access",
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
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getSession()
      console.log(data);
      if (data.session) {
        const response = await fetch(`/api/user/get_user?id=${data.session.user.id}`);
        const res = await response.json();
        setUser({ ...res.data });
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (window.location.hash.includes("#access_token=")) {
      handleUserSignedIn();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, handleUserSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
