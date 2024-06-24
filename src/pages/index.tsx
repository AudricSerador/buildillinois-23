import React from "react";
import Link from "next/link";
import Image from 'next/image';

export default function Home(): JSX.Element {
  return (
    <div className="relative h-screen flex flex-col items-stretch m-0 p-0 mb-[-25px]">
      <Image
        src="/images/dininghall.jpg"
        alt="Dining Hall"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <div className="relative m-0 p-0 text-white flex-grow"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))`,
        }}
      >
        <div className="flex justify-center items-start mt-20 text-center px-4 sm:px-0">
          <p className="text-uiucorange font-custombold text-6xl">
            Find your favorite dining
            <br />
            hall food in <i>seconds</i>.
          </p>
        </div>
        <div className="mt-4 justify-center items-start text-center px-4 sm:px-0">
          <div className="container mx-auto max-w-2xl">
            <p className="font-custom text-xl">
              Tired of going to dining halls and finding nothing you like?
              Annoyed at having to check the menus of every dining hall to find
              something you want to eat? Find food that YOU want to eat with
              IllinEats. Search for your favorite items across all UIUC
              dining halls and get personalized recommendations based on your
              dietary preferences.
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-8 px-4 sm:px-0">
          <Link href="/login">
            <button className="bg-uiucblue text-white font-custombold py-2 px-4 rounded mr-4 transition duration-500 ease-in-out transform hover:scale-105">
              Sign Up
            </button>
          </Link>
          <button
            className="bg-yellow-300 text-black font-custombold py-2 px-4 rounded mr-4 transition duration-500 ease-in-out transform hover:scale-105"
            onClick={() => window.open('https://buymeacoffee.com/audricserador', '_blank', 'noopener,noreferrer')}
          >
            ☕ Buy me a Coffee
          </button>
        </div>
      </div>
    </div>
  );
}