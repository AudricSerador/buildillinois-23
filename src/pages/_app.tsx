import "../styles/globalstyle.css";
import type { AppProps } from "next/app";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";
import { SEO } from "../components/layout/seo";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="UIUC Dining Buddy"
        description="The better dining hall experience."
      />
      <main className="flex-grow">
        <Navbar />
        <div className="h-16 md:block hidden"></div>
        <Component {...pageProps} />;
      </main>
      <Footer />
    </div>
  );
}
