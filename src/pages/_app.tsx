import '../styles/globalstyle.css';
import type { AppProps } from 'next/app';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
  <div className="flex flex-col min-h-screen">
    <main className="flex-grow">
      <Navbar />
      <Component {...pageProps} />;
    </main>
    <Footer />
  </div>
  );
}