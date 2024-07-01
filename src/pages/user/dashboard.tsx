import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth.service";
import { useRouter } from 'next/router';

export default function Dashboard(): JSX.Element {
    const [name, setName] = useState('');
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.isNew) {
            router.push('/user/onboarding'); 
        } else if (user === null) {
            router.push('/login'); 
        } else {
            setName(user.name);
        }
    }, [user, router]);

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
            <p className="text-4xl font-custombold mt-4 mb-4">Hello, {name}!</p>
            <p>
                {user?.allergies && user.allergies.length > 0 ? `Your allergies: ${user.allergies}` : 'You have no allergies.'}
                {user?.preferences && user.preferences.length > 0 ? `Your preferences: ${user.preferences}` : 'You have no preferences.'}
            </p>
        </div> 
    )
}