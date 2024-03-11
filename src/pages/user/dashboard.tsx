import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth.service";
import { useRouter } from 'next/router';

export default function Dashboard(): JSX.Element {
    const [name, setName] = useState('');
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetch(`/api/get_user?id=${user.id}`)
                .then(response => response.json())
                .then(data => setName(data.data.name))
                .catch(error => console.error(error));
        } else {
            router.push('/login'); 
        }
    }, [user, router]);

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
            <p className="text-4xl font-custombold mt-4 mb-4">Hello, {name}!</p>
        </div>
    )
}