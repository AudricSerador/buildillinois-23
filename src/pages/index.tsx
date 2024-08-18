import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/auth.service";
import { FoodCarousel } from "@/components/FoodCarousel";

const subscribeToNotifications = async (userId: string | undefined) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert("Push notifications are not supported in your browser.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert("Notification permission denied. You won't receive push notifications.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
    
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription }),
    });

    alert("Successfully subscribed to push notifications!");
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    alert("Failed to subscribe to push notifications. Please try again later.");
  }
};

export default function Home(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col items-stretch">
      <div
        className="hero h-[40vh]"
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
        <FoodCarousel 
          title="Most Popular" 
          filters={{ ratingFilter: 'rated_only' }} 
        />
      </div>
    </div>
  );
}