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
      const res = await response.json();
      if (!res) {
        console.log("User not found.");
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

        if (!createUserResponse.ok) {
          const errorData = await createUserResponse.json();
          console.error(errorData.error);
        } else {
          router.push("/user/dashboard");
        }
      } else {
        console.log("User found.");
        setUser({ ...res.data });
        if (res.data.isNew) {
          router.push("/user/onboarding");
        } else {
          router.push("/user/dashboard");
        }
      }
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
  };

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
