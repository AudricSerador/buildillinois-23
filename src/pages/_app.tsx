import "../styles/globalstyle.css";
import type { AppProps } from "next/app";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";
import { SEO } from "../components/layout/seo";
import FeedbackBanner from "@/components/layout/feedback";
import { useRouter } from "next/router";
import { useState } from "react";
import { AuthProvider } from "@/auth/auth.service";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showFeedbackBanner = router.pathname !== "/";
  const [isFeedbackBannerClosed, setFeedbackBannerClosed] = useState(false);

  const handleCloseFeedbackBanner = () => {
    setFeedbackBannerClosed(true);
  };

  return (
    <>
      <SEO
        title="UIUC Dining Buddy"
        description="The better dining hall experience."
      />
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Navbar />
            <div
              className={
                !showFeedbackBanner
                  ? "h-16 md:block hidden"
                  : isFeedbackBannerClosed
                  ? "h-16 md:block hidden"
                  : "h-32 md:block hidden"
              }
            ></div>
            {showFeedbackBanner && !isFeedbackBannerClosed && (
              <FeedbackBanner onClose={handleCloseFeedbackBanner} />
            )}
            <Component {...pageProps} />;
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
