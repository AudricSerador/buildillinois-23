import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/layout/auth.service";
import { FoodCarousel } from "@/components/FoodCarousel";

const subscribeToNotifications = async (userId: string | undefined) => {
  console.log('subscribeToNotifications called');
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log("Push notifications are not supported in this browser.");
    alert("Push notifications are not supported in your browser.");
    return;
  }

  try {
    console.log('Requesting notification permission');
    const permission = await Notification.requestPermission();
    console.log('Permission status:', permission);
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      alert("Notification permission denied. You won't receive push notifications.");
      return;
    }

    console.log('Getting service worker registration');
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker registration:', registration);

    console.log('Subscribing to push notifications');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
    console.log('Push subscription:', subscription);

    console.log('Sending subscription to server');
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription }),
    });
    const responseData = await response.json();
    console.log('Server response:', responseData);

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
        <FoodCarousel 
          title="Most Popular" 
          filters={{ ratingFilter: 'rated_only' }} 
        />
      </div>
    </div>
  );
}