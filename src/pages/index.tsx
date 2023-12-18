import React from 'react';
import { Navbar } from '../components/navbar';

export default function Home(): JSX.Element {
    return (
        <div>
            <Navbar />
            <p className="text-4xl text-center">Hello World</p>
        </div>
    );
}