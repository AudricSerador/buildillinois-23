import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Home(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col items-stretch">
      <div
        className="hero h-[60vh]"
        style={{
          backgroundImage: "url(/images/dininghall.jpg)",
        }}>
        <div className="hero-overlay bg-opacity-70 bg-black"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-2xl">
            <h1 className={`mb-4 text-4xl sm:text-6xl font-custombold text-uiucorange transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Find your favorite dining hall food in <i>seconds</i>.
            </h1>
            <p className={`mb-4 text-md sm:text-xl font-custom transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Tired of going to dining halls and finding nothing you like?
              Find food that YOU want to eat with IllinEats. Search across all UIUC
              dining halls and get personalized recommendations.
            </p>
            <div className={`flex justify-center mt-6 transition-all duration-700 ease-out delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link href="/login">
                <button className="btn btn-accent font-custombold mr-4">
                  Login with your NetID
                </button>
              </Link>
              <button
                className="btn btn-warning text-black font-custombold"
                onClick={() => window.open('https://buymeacoffee.com/audricserador', '_blank', 'noopener,noreferrer')}
              >
                ☕ Support the project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}