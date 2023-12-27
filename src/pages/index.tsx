import React from 'react';
import Link from 'next/link';

export default function Home(): JSX.Element {
    return (
        <>
            <div className="flex justify-center items-start mt-20 text-center px-4 sm:px-0">
                <p className="text-uiucblue font-custombold text-6xl">
                    Find your favorite dining 
                    <br />
                    hall food in <i>seconds</i>.
                </p>
            </div>
            <div className="mt-4 justify-center items-start text-center px-4 sm:px-0">
                <div className="container mx-auto max-w-2xl">
                    <p className="font-custom text-xl">
                        Tired of going to dining halls and finding nothing you like? 
                        Annoyed at having to check the menus of every dining hall to find something you want to eat? Find food that YOU want to eat with Dining Buddy. Our platform allows you to easily search for your favorite items across all UIUC dining halls and provides you with recommendations based on your dietary preferences.
                    </p>
                </div>
            </div>
            <div className="flex justify-center mt-8 px-4 sm:px-0">
                <Link href="#">
                    <button className="bg-uiucblue text-white font-custombold py-2 px-4 rounded mr-4">
                        Sign Up
                    </button>
                </Link>
                <Link href="/allfood">
                    <button className="bg-uiucblue text-white font-custombold py-2 px-4 rounded">
                        View All Food
                    </button>
                </Link>
            </div>
        </>
    );
};