import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/layout/auth.service";
import { FoodCarousel } from "@/components/FoodCarousel";
import { FaSync } from 'react-icons/fa';

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
      console.log("Fetched recommendations data:", data);
      if (Array.isArray(data.foodItems) && data.foodItems.length > 0) {
        setRecommendations(data.foodItems);
        console.log("Set recommendations:", data.foodItems);
      } else {
        console.log("No recommendations in response");
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

  const subscribeToNotifications = async (userId: string) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: userId,
        }),
      });

      if (response.ok) {
        console.log('Subscription successful');
      } else {
        console.error('Subscription failed');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  console.log("Rendering Home component, recommendations:", recommendations);

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

      <div
        className="hero min-h-[40vh] bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/dininghall.jpg)",
        }}>
        <div className="hero-overlay bg-opacity-70 bg-black"></div>
        <div className="hero-content text-neutral-content text-center py-8">
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
                  onClick={() => subscribeToNotifications(user.id)}
                >
                  Enable Notifications
                </button>
              )}
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

      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        {user && (
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
        )}
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