import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { COMPANY } from "../data/company";
import { I18nProvider } from "../lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root error boundary caught error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: (ctx: any) => {
    const path = ctx.location?.pathname || "";
    const canonicalPath = path === "/" ? "" : path;
    
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
        { title: `${COMPANY.name} | ${COMPANY.tagline}` },
        { name: "description", content: COMPANY.description },
        {
          name: "keywords",
          content:
            "area codes, phone intelligence, NANPA lookup, NPA NXX, TCPA calling window, timezone converter, US area code, Canada area code, telecom carrier lookup, bulk phone cleanser, robocall scam alert",
        },
        { name: "author", content: `${COMPANY.name} (${COMPANY.legalName})` },
        { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
        { name: "theme-color", content: "#0f172a" },
        { name: "color-scheme", content: "light dark" },
        { name: "application-name", content: COMPANY.name },
        { name: "apple-mobile-web-app-title", content: COMPANY.name },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        // Google AdSense Account Verification
        { name: "google-adsense-account", content: "ca-pub-7997346618896033" },

        // Open Graph (Facebook, LinkedIn, Discord, WhatsApp)
        { property: "og:site_name", content: COMPANY.brand },
        { property: "og:title", content: `${COMPANY.name} | ${COMPANY.tagline}` },
        { property: "og:description", content: COMPANY.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${COMPANY.url}${canonicalPath}` },
        { property: "og:image", content: `${COMPANY.url}/entec-logo.webp` },
        { property: "og:image:width", content: "1024" },
        { property: "og:image:height", content: "1024" },
        { property: "og:image:alt", content: "ENTEC Phone Intelligence Logo" },
        { property: "og:locale", content: "en_US" },
        { property: "og:locale:alternate", content: "ar_EG" },

        // Twitter Cards (X)
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@entec" },
        { name: "twitter:creator", content: "@entec" },
        { name: "twitter:title", content: `${COMPANY.name} | ${COMPANY.brand}` },
        { name: "twitter:description", content: COMPANY.description },
        { name: "twitter:image", content: `${COMPANY.url}/entec-logo.webp` },
        { name: "twitter:image:alt", content: "ENTEC Phone Intelligence Logo" },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          // @ts-ignore
          media: "print",
          onLoad: "this.media='all'",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap",
        },
        {
          rel: "preload",
          as: "style",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        // Primary Favicon - Generated ENTEC Logo
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon.png" },
        { rel: "icon", type: "image/jpeg", href: "/entec-logo.webp" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "canonical", href: `${COMPANY.url}${canonicalPath}` },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(COMPANY.jsonLd).replace(/</g, '\\u003c') }}
        />
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7997346618896033"
          crossOrigin="anonymous"
        />
        {/* Google Analytics / Google Tag Manager (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XDZD19YSQS"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XDZD19YSQS');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </I18nProvider>
    </QueryClientProvider>
  );
}
