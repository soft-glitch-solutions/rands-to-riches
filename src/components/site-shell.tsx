import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

// TODO(owner): point these at the real MOTUS Capital social pages.
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
  { label: "X (Twitter)", href: "https://x.com/motuscapital", Icon: Twitter },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/motuscapital",
    Icon: Linkedin,
  },
  { label: "WhatsApp", href: "https://wa.me/27821234567", Icon: MessageCircle },
];

/** Session-aware sign-in affordance for public pages. */
function AuthArea() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.session));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (signedIn) {
    return (
      <Button asChild variant="ghost">
        <Link to="/dashboard" className="text-primary">
          My dashboard
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost">
      <Link to="/auth" className="text-primary">
        Sign in
      </Link>
    </Button>
  );
}

export function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
        M
      </span>
      <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground sm:text-base">
        Motus Capital
      </span>
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <BrandMark />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary [&.active]:text-primary"
                  activeProps={{ className: "text-primary" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <AuthArea />
          </div>
          <nav className="mt-2 flex gap-1 overflow-x-auto pb-1 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                Motus Capital
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Your money in motion. Invest in the mobility economy from R100.
              </p>
              <div className="mt-4 flex gap-2">
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
            <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-1">
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
          </div>
          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Returns are dependent on the investment's actual performance and
            applicable fees. Investment capital and returns are subject to
            investment risks and are not guaranteed. This site demonstrates the
            investment concept only; no investment is being accepted or
            processed.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} MOTUS Capital — Your money in motion.
          </p>
        </div>
      </footer>
    </div>
  );
}
