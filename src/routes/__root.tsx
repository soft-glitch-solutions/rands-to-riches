import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { takePendingAmount } from "@/lib/social-auth";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// ============================================================
// GLOBAL ANIMATED BACKGROUND
// ============================================================

function GlobalAnimatedBackground({ prefersReduced }: { prefersReduced: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 200 });

  useEffect(() => {
    if (prefersReduced || typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 60);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 60);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReduced, mouseX, mouseY]);

  const orb1X = useTransform(smoothX, [-60, 60], [-20, 20]);
  const orb1Y = useTransform(smoothY, [-60, 60], [-15, 15]);
  const orb2X = useTransform(smoothX, [-60, 60], [15, -15]);
  const orb2Y = useTransform(smoothY, [-60, 60], [12, -12]);
  const orb3X = useTransform(smoothX, [-60, 60], [-10, 10]);
  const orb3Y = useTransform(smoothY, [-60, 60], [8, -8]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "hsl(var(--primary))",
        }}
      />

      <motion.div
        className="absolute -top-32 -left-24 size-[520px] rounded-full bg-blue-300/30 blur-[100px]"
        style={prefersReduced ? undefined : { x: orb1X, y: orb1Y }}
        animate={prefersReduced ? undefined : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-1/3 -right-32 size-[480px] rounded-full bg-emerald-300/20 blur-[110px]"
        style={prefersReduced ? undefined : { x: orb2X, y: orb2Y }}
        animate={prefersReduced ? undefined : { scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-purple-300/20 blur-[100px]"
        style={prefersReduced ? undefined : { x: orb3X, y: orb3Y }}
        animate={prefersReduced ? undefined : { scale: [0.95, 1.15, 0.95], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================================
// 404 NOT FOUND
// ============================================================

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="font-display text-8xl sm:text-9xl font-extrabold tracking-tighter text-black">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-foreground">Page not found</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ERROR COMPONENT
// ============================================================

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-white/50 backdrop-blur-sm px-8 py-4 text-base font-bold text-foreground transition-transform hover:scale-105 active:scale-95"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCHEMA
// ============================================================

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

// ============================================================
// ROUTE
// ============================================================

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
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const hasOAuthParams =
      hash.includes("access_token=") ||
      hash.includes("refresh_token=") ||
      search.includes("code=") ||
      search.includes("token=");
    const hasOAuthIntent = sessionStorage.getItem("motus:oauth-in-progress") === "true";

    const pathname = window.location.pathname;
    const isAlreadyOnAuthRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

    if (hasOAuthParams || hasOAuthIntent) {
      // If we just arrived from OAuth, make sure we direct the user to their dashboard
      const handleRedirect = () => {
        if (!isAlreadyOnAuthRoute) {
          sessionStorage.removeItem("motus:oauth-in-progress");
          const pendingAmount = takePendingAmount();
          navigate({
            to: "/dashboard",
            replace: true,
            search: pendingAmount ? { amount: pendingAmount } : undefined,
          });
        }
      };

      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          handleRedirect();
        }
      });

      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          handleRedirect();
        }
      });

      return () => {
        sub.subscription.unsubscribe();
      };
    }
  }, [navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Global Google Labs Style Background */}
      <GlobalAnimatedBackground prefersReduced={!!prefersReduced} />
      
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div className="relative z-0">
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}