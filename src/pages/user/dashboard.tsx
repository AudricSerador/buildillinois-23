import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth.service";
import { useRouter } from 'next/router';

export default function Dashboard(): JSX.Element {
    const [name, setName] = useState('');
    const router = useRouter();
    const { user } = useAuth(); // Destructure user from useAuth

    useEffect(() => {
        if (user) {
            setName(user.user_metadata.full_name); // Set the name state to the user's full name
        } else {
            router.push('/login'); // Redirect to login page
        }
    }, [user, router]); // Add user to the dependency array

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
            <p className="text-4xl font-custombold mt-4 mb-4">Hello, {name}!</p>
        </div>
    )
}