import Head from "next/head";
import { useRouter } from "next/router";

interface SEOProps {
  title: string;
  description: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description}) => {
  const { asPath } = useRouter();

  return (
    <Head>
      <title>{title}</title>
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="IllinEats" />
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="Dining, Food, Restaurants, Meal planning, Nutrition, Healthy eating, Food recommendations, Restaurant finder, Meal tracker, Diet"
      />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta
        name="og:url"
        content={`https://illineats.com/${asPath === "/" ? "" : asPath}`}
      />
      <meta
        property="og:image"
        content="https://cdn.winsightmedia.com/platform/files/public/2022-04/background/BTP_BG-Univ_Illinois-10.jpg?VersionId=CxGysWKVQfOcieP_xj.1wXyIi2yOtI7U"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta content="#FF5F05" data-react-helmet="true" name="theme-color" />
    </Head>
  );
};
