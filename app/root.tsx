import {
  Link,
  Links,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches
} from "remix";
import type { LinksFunction } from "remix";

import styles from "./tailwind.css";
import globalStylesUrl from "~/styles/global.css";
import highlightStylesUrl from "~/styles/highlight.css";
import ThemeSwitch from "./components/ThemeSwitch";
import ThemeScript from "./components/ThemeScript";
import config from "./config";
import { useMemo } from "react";

export let links: LinksFunction = () => {
  return [
    {
      rel: "icon",
      href: "/assets/favicon.png",
      type: "image/png"
    },
    { rel: "stylesheet", href: globalStylesUrl },
    { rel: "stylesheet", href: styles},
    { rel: "stylesheet", href: highlightStylesUrl }
  ];
};

export let meta: MetaFunction = () => {
  const siteUrl = config.siteUrl;
  const siteVerification = config.googleSiteVerification;
  const title = 'Frendy Guo Personal Website';
  const desc = "Hi 👋, I'm Frendy Guo a Frontend Engineer from Indonesia. Welcome to my personal blog. This is where I share my thoughts about the latest web technologies.";

  return {
    title,
    'og:title': title,
    description: desc,
    'og:description': desc,
    url: siteUrl,
    'og:type': 'website',
    'google-site-verification': siteVerification,
    'og:image': `${siteUrl}/assets/og-image.png`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@fiddleop",
    'twitter:image': `${siteUrl}/assets/og-image.png`
  };
};

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="My Bad!">
      <Layout>
        <div className="font-sans-serif text-center text-dark dark:text-white mt-16">
          <h1 className="text-4xl font-bold">My Bad</h1>
          <p  className="text-base mt-4">I think I broke something..</p>
        </div>
      </Layout>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  console.log(caught);

  let message;
  switch (caught.status) {
    case 404:
      message = (
        <div className="font-sans-serif text-center text-dark dark:text-white mt-16">
          <h1 className="text-8xl font-bold">404</h1>
          <p  className="text-2xl">Not Found</p>
        </div>
      );
      break;
    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        {message}
      </Layout>
    </Document>
  );
}

function Document({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const matches = useMatches();
  const match = matches.find((match) => match.data && match.data.canonical);
  const canonical = match?.data.canonical;

  const theme = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.__theme;
  }, []);

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya+Sans+SC:wght@900&display=swap" rel="stylesheet" />
        {!!canonical && <link rel="canonical" href={canonical} />}
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeScript />
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div id="__root">
      <div className="app bg-white dark:bg-dark font-sans-serif">
        <header className="p-4 tablet:pt-8">
          <div className="flex justify-between items-center text-neutral-500 dark:text-white mx-auto tablet:max-w-2xl laptop:max-w-2xl">
            <Link
              to="/"
              title="Frendy Guo"
              className="flex justify-center items-center h-[56px] w-[56px] rounded-lg text-[32px] bg-gradient text-white hover:text-white font-alegreya font-black"
            >
              FG.
            </Link>
            <ThemeSwitch />
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t dark:border-t-white text-center mt-auto">
          <div className="px-4 py-2 dark:text-white tablet:py-6">
            <div className="text-sm">
              <a className="inline-block underline" target="_blank" href="https://frendyguo.medium.com/" rel="nofollow noopener">Medium</a>
              <div className="inline-block mx-2">|</div>
              <a className="inline-block underline" target="_blank" href="https://twitter.com/fiddleop" rel="nofollow noopener">Twitter</a>
            </div>
            <p className="mt-1 text-sm font-semibold tablet:mt-3">&copy; {new Date().getFullYear()} Frendy Guo - Built with <a className="underline" target="_blank" href="https://remix.run/">Remix.run</a></p>
          </div>
        </footer>
      </div>
    </div>
  );
}
