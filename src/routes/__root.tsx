import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

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

const SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": "https://motuscapital.co.za/#organization",
      "name": "MOTUS Capital",
      "legalName": "MOTUS Capital (Pty) Ltd",
      "url": "https://motuscapital.co.za",
      "logo": "https://motuscapital.co.za/favicon.ico",
      "description":
        "South Africa's premier mobility investment platform. Invest in commercial e-hailing and delivery fleets from R100 with returns up to 25%.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1 Sandton Drive, Sandhurst",
        "addressLocality": "Johannesburg",
        "addressRegion": "Gauteng",
        "postalCode": "2196",
        "addressCountry": "ZA",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -26.2041,
        "longitude": 28.0473,
      },
      "telephone": "+27 11 000 0000",
      "email": "invest@motuscapital.co.za",
      "priceRange": "R100 - R10000",
      "currenciesAccepted": "ZAR",
      "paymentAccepted": "EFT, Ozow, Capitec Pay, Bank Transfer",
      "sameAs": [
        "https://www.facebook.com/motuscapital",
        "https://twitter.com/motuscapital",
        "https://www.linkedin.com/company/motuscapital",
        "https://www.instagram.com/motuscapital",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://motuscapital.co.za/#website",
      "url": "https://motuscapital.co.za",
      "name": "MOTUS Capital",
      "publisher": {
        "@id": "https://motuscapital.co.za/#organization",
      },
      "inLanguage": "en-ZA",
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "MOTUS Capital — South Africa's Fleet Investment Platform" },
      {
        name: "description",
        content:
          "Invest in South Africa's growing e-hailing and delivery economy from just R100. Earn 13%–25% returns with flexible 30 to 90-day cycles and direct EFT payouts.",
      },
      {
        name: "keywords",
        content:
          "invest South Africa, micro investment SA, fleet investment, e-hailing Uber Bolt investment, passive income South Africa, R100 investment, high yield monthly return, Motus Capital",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "author", content: "MOTUS Capital" },
      { name: "application-name", content: "MOTUS Capital" },
      { name: "theme-color", content: "#1d63ed" },
      { name: "geo.region", content: "ZA-GP" },
      { name: "geo.placename", content: "Johannesburg" },
      { name: "geo.position", content: "-26.2041;28.0473" },
      { name: "ICBM", content: "-26.2041, 28.0473" },

      // Open Graph
      { property: "og:site_name", content: "MOTUS Capital" },
      { property: "og:locale", content: "en_ZA" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "MOTUS Capital — South Africa's Fleet Investment Platform" },
      {
        property: "og:description",
        content:
          "Put your money in motion. Invest in real commercial vehicles and motorcycles from R100 with returns up to 25%.",
      },
      { property: "og:url", content: "https://motuscapital.co.za" },

      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@motuscapital" },
      { name: "twitter:creator", content: "@motuscapital" },
      { name: "twitter:title", content: "MOTUS Capital — Your Money in Motion" },
      {
        name: "twitter:description",
        content:
          "South Africa's retail mobility investment platform. Start with R100, earn 13%–25% on 30-90 day cycles.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://motuscapital.co.za" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: SCHEMA_JSON_LD,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA">
      <head>
        <HeadContent />
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
