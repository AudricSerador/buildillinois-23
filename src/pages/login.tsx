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
        <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
            <p className="text-4xl font-custombold mt-4 mb-4">Login with your NetID</p>
            <button onClick={handleSignIn} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login with Azure</button>
        </div>
    )
}