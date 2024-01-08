import "../styles/globalstyle.css";
import type { AppProps } from "next/app";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";
import { SEO } from "../components/layout/seo";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="UIUC Dining Buddy - Find your favorite dining hall food in seconds."
        description="Tired of going to dining halls and finding nothing you like? Annoyed at having to check the menus of every dining hall to find something you want to eat? Find food that YOU want to eat with Dining Buddy. Search for your favorite items across all UIUC dining halls and get personalized recommendations based on your dietary preferences."
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
