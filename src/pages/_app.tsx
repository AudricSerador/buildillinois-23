import "../styles/globalstyle.css";
import type { AppProps } from "next/app";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";
import { SEO } from "../components/layout/seo";
import FeedbackBanner from "@/components/layout/feedback";
import { useRouter } from "next/router";
import { useState } from "react";
import { AuthProvider } from "@/auth/auth.service";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showFeedbackBanner =
    router.pathname !== "/" && router.pathname !== "/user/onboarding";
  const [isFeedbackBannerClosed, setFeedbackBannerClosed] = useState(false);

  const handleCloseFeedbackBanner = () => {
    setFeedbackBannerClosed(true);
  };

  const showNavbarAndFooter = router.pathname !== "/user/onboarding";

  return (
    <>
      <SEO title="IllinEats" description="The better dining hall experience." />
      <AuthProvider>
        <div className="flex flex-col min-h-screen w-full">
          <main className="flex-grow">
            {showNavbarAndFooter && <Navbar />}
            {showNavbarAndFooter && (
              <div
                className={
                  !showFeedbackBanner
                    ? "h-16 md:block hidden"
                    : isFeedbackBannerClosed
                    ? "h-16 md:block hidden"
                    : "h-32 md:block hidden"
                }
              ></div>
            )}
            {showFeedbackBanner && !isFeedbackBannerClosed && (
              <FeedbackBanner onClose={handleCloseFeedbackBanner} />
            )}
            <Component {...pageProps} />;
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
          {showNavbarAndFooter && <Footer />}
        </div>
      </AuthProvider>
    </>
  );
}
