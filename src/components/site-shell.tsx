
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Music2,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

const LEGAL_LINKS = [
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy Policy" },
] as const;

// MOTUS Capital social media links
const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/motuscapital",
    Icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/motuscapital",
    Icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@MotusCapital",
    Icon: Youtube,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@motus.capital",
    Icon: Music2,
  },
];

/** Session-aware sign-in affordance for public pages. */
function AuthArea({ compact = false }: { compact?: boolean }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.session));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Avoid flashing "Sign in" then swapping to "My dashboard"
  if (signedIn === null) {
    return <div className="h-9 w-20" aria-hidden />;
  }

  return (
    <Button
      asChild
      variant="ghost"
      size={compact ? "sm" : "default"}
      className="px-2.5 sm:px-3"
    >
      <Link
        to={signedIn ? "/dashboard" : "/auth"}
        className="text-primary text-xs font-bold sm:text-sm"
      >
        {signedIn ? (compact ? "Dashboard" : "My dashboard") : "Sign in"}
      </Link>
    </Button>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-2.5"
      aria-label="Motus Capital home"
    >
      <img
        src={logo}
        alt="Motus Capital M"
        className={`w-auto shrink-0 object-contain ${compact ? "h-8" : "h-8 sm:h-9"}`}
      />
      <div className="flex min-w-0 flex-col justify-center">
        <span className="truncate font-display text-[13px] font-bold uppercase leading-tight tracking-wide text-[#0f2d59] sm:text-sm">
          Motus Capital
        </span>
        <span className="truncate text-[9px] font-semibold leading-tight text-[#1b6fbc] sm:text-[10px]">
          Money In Motion
        </span>
      </div>
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [children]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <BrandMark />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "text-primary bg-primary/10" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <div className="hidden sm:block">
              <AuthArea />
            </div>
            <AuthArea compact />

            {/* Hamburger (mobile only) */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden">
            <nav className="mx-auto max-w-6xl border-t border-border bg-card px-4 py-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "text-primary bg-primary/10" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Motus Capital
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Your money in motion. Invest in the mobility economy from R100.
              </p>

              {/* Social media links */}
              <div className="mt-4 flex gap-1.5">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer navigation */}
            <div className="flex flex-col gap-4 text-sm sm:items-end">
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <nav className="flex flex-col gap-2">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <p className="mt-8 max-w-3xl text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            Returns are dependent on the investment's actual performance and
            applicable fees. Investment capital and returns are subject to
            investment risks and are not guaranteed. This site demonstrates the
            investment concept only; no investment is being accepted or
            processed.
          </p>

          <p className="mt-4 text-[11px] text-muted-foreground sm:text-xs">
            © {new Date().getFullYear()} MOTUS Capital — Your money in motion.
          </p>
        </div>
      </footer>
    </div>
  );
}
