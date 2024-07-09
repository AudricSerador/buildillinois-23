import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth.service";
import { useRouter } from 'next/router';
import { FaInfo } from "react-icons/fa";

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

    useEffect(() => {
        console.log("User Data:", user);
    }, [user]);

    const renderList = (data: string) => {
        return data.split(',').map((item, index) => (
            <li key={index} className="ml-4 list-disc">{item.trim()}</li>
        ));
    };

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
            <div role="alert" className="alert alert-info">
                <FaInfo />
                <span>This page is in active development! Check back soon :)</span>
            </div>
            <p className="text-4xl font-bold mt-4 mb-8">Hello, {name}!</p>
            <div className="grid gap-4">
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Allergies</h2>
                    {user?.allergies && user.allergies.length > 0 ? (
                        <ul>{renderList(user.allergies)}</ul>
                    ) : (
                        <p>You have no allergies.</p>
                    )}
                </div>
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Dietary Restrictions</h2>
                    {user?.preferences && user.preferences.length > 0 ? (
                        <ul>{renderList(user.preferences)}</ul>
                    ) : (
                        <p>You have no dietary restrictions.</p>
                    )}
                </div>
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Location Preferences</h2>
                    {user?.locations && user.locations.length > 0 ? (
                        <ul>{renderList(user.locations)}</ul>
                    ) : (
                        <p>You have no location preferences.</p>
                    )}
                </div>
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Dietary Goal</h2>
                    <p>{user?.goal ? user.goal : 'You currently have no dietary goals.'}</p>
                </div>
            </div>
        </div>
    );
}
