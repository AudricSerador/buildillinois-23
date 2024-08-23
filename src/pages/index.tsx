import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/layout/auth.service";
import { FoodCarousel } from "@/components/FoodCarousel";
// import { FaSync } from 'react-icons/fa';

export default function Home(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recommendation/get_recommendations?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      if (Array.isArray(data.foodItems) && data.foodItems.length > 0) {
        setRecommendations(data.foodItems);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  return (
    <div className="flex flex-col items-stretch">
      {/* Mobile-only navbar */}
      <div className="md:hidden bg-primary p-4 flex items-center">
        <Image
          src="/illineatslogo.svg"
          alt="IllinEats Icon"
          width={32}
          height={32}
          className="mr-2"
        />
        <Link href="/" className="text-2xl font-bold font-heading text-white">
          IllinEats
        </Link>
      </div>

      <div className="relative">
        <div
          className="hero min-h-[40vh] bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/dininghall.jpg)",
          }}>
          <div className="absolute inset-0 bg-black opacity-70"></div>
          <div className="relative z-10 hero-content text-neutral-content text-center py-8">
            <div className="max-w-2xl">
              <h1 className={`mb-4 text-4xl sm:text-6xl font-custombold text-uiucorange transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Find your favorite dining hall food in <i>seconds</i>.
              </h1>
              <p className={`mb-4 text-md sm:text-xl font-custom transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Tired of going to dining halls and finding nothing you like?
                Find food that YOU want to eat with IllinEats. Search across all UIUC
                dining halls and get personalized recommendations.
              </p>
              <div className={`flex justify-center items-center mt-6 transition-all duration-700 ease-out delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {!user && (
                  <Link href="/login">
                    <button className="btn btn-accent font-custombold mr-4">
                      Login with your NetID
                    </button>
                  </Link>
                )}
                {user && (
                  <button
                    className="btn btn-primary font-custombold mr-4"
                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScIAB14S8DdCi_xxFExLLl20vwsKQG5RDniBhZP1gT5U0JJSw/viewform', '_blank', 'noopener,noreferrer')}
                  >
                    Give Feedback
                  </button>
                )}
                <button
                  className="btn btn-warning text-black font-custombold mr-4"
                  onClick={() => window.open('https://buymeacoffee.com/audricserador', '_blank', 'noopener,noreferrer')}
                >
                  ☕ Support the project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        {/* {user && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <button
              className="btn btn-sm btn-outline"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh recommendations"
            >
              <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        )} */}
        {user && (
          <FoodCarousel 
            title="Recommended for You"
            recommendedItems={recommendations}
            isLoading={isLoading}
          />
        )}
        <FoodCarousel 
          title="Most Popular" 
          filters={{ ratingFilter: 'rated_only' }}
        />
      </div>
    </div>
  );
}