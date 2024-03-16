import React, { useEffect } from "react";
import { useAuth } from "../auth/auth.service";
import { useRouter } from 'next/router';

export default function Login(): JSX.Element {
    const router = useRouter();
    const { user, signIn, signOut, handleUserSignedIn } = useAuth();

    useEffect(() => {
        console.log('User:', user);
        if (user && user.isNew) {
            router.push('/user/onboarding');
        } else if (user) {
            router.push('/user/dashboard');
        }
    }, [user, router]);

    const handleSignIn = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error(error);
        }
    }

    const handleSignOut = async () => {
        await signOut();
        console.log('User signed out'); 
    }

    return (
        <div className="flex flex-col font-custom items-center justify-center min-h-screen bg-gray-100 py-2">
          <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md">
          <img src="./images/blockI.gif" alt="Description of the GIF" />
            <div className="flex justify-center items-center">
              <span className="text-gray-700 font-custombold text-2xl">Login with your NetID</span>
            </div>
            <div className="mt-4">
              <button 
                onClick={handleSignIn} 
                className="flex items-center justify-center w-full px-4 py-2 text-white text-sm rounded-md bg-uiucorange transition duration-500 hover:shadow-glow">
                Continue
              </button>
            </div>
          </div>
        </div>
      );
}