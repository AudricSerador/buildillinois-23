import React from "react";
import { signInWithAzure } from "../auth/auth.service";

export default function Login(): JSX.Element {
    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
            <p className="text-4xl font-custombold mt-4 mb-4">Login</p>
            <button onClick={signInWithAzure} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login with Azure</button>
        </div>
    )
}