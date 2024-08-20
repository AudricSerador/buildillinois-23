import "../styles/globalstyle.css";
import type { AppProps } from "next/app";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";
import { SEO } from "../components/layout/seo";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/components/layout/auth.service";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "react-toastify/dist/ReactToastify.css";
import BottomNav from "../components/layout/BottomNav";
import BackButton from '../components/layout/BackButton';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showFeedbackBanner =
    router.pathname !== "/" && router.pathname !== "/user/onboarding";
  const [isFeedbackBannerClosed, setFeedbackBannerClosed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleCloseFeedbackBanner = () => {
    setFeedbackBannerClosed(true);
  };

  const showNavbarAndFooter = router.pathname !== "/user/onboarding";
  const isMainPage = ['/', '/allfood', '/profile'].includes(router.pathname);

  return (
    <>
      <SEO title="IllinEats" description="The better UIUC dining hall experience." />
      <AuthProvider>
        <div className="flex flex-col min-h-screen w-full bg-custombg font-custom">
          {showNavbarAndFooter && (
            <>
              <Navbar className="hidden md:block" />
              <div className="h-16 hidden md:block" />
            </>
          )}
          {!isMainPage && <BackButton />}
          <main className="flex-grow pb-16 md:pb-0">
            {/* {showFeedbackBanner && !isFeedbackBannerClosed && (
              <FeedbackBanner onClose={handleCloseFeedbackBanner} />
            )} */}
            <Component {...pageProps} />
            <Analytics />
            <SpeedInsights />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </main>
          {showNavbarAndFooter && (
            <>
              <BottomNav className="md:hidden" />
              {!isMobile && <Footer />}
            </>
          )}
        </div>
      </AuthProvider>
    </>
  );
}