import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampInvestment, formatRand } from "@/lib/investment";
import {
  savePendingAmount,
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from "@/lib/social-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, ShieldCheck, TrendingUp, Car, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/site-shell";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { amount?: number } => {
    const raw = Number(search["amount"]);
    return {
      amount: search["amount"] !== undefined ? clampInvestment(raw) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Sign in — MOTUS Capital" },
      {
        name: "description",
        content: "Sign in to your MOTUS Capital investment account.",
      },
      { property: "og:title", content: "Sign in — MOTUS Capital" },
      {
        property: "og:description",
        content: "Sign in to manage your mobility investments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});

/* ---------- Small icon set for social buttons ---------- */

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.05 12.54c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.62-1.96-1.54-.16-3.01.9-3.8.9-.78 0-1.99-.88-3.27-.86-1.68.03-3.23.98-4.09 2.48-1.74 3.02-.44 7.5 1.25 9.95.83 1.2 1.82 2.55 3.12 2.5 1.25-.05 1.72-.81 3.23-.81 1.5 0 1.93.81 3.26.79 1.35-.03 2.2-1.22 3.02-2.43.95-1.4 1.34-2.75 1.36-2.82-.03-.01-2.6-1-2.63-3.98zM14.6 5.3c.69-.84 1.15-2 1.02-3.16-.99.04-2.18.66-2.89 1.49-.64.73-1.2 1.91-1.05 3.04 1.1.08 2.23-.56 2.92-1.37z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
    </svg>
  );
}

/* ---------- Page ---------- */

function AuthPage() {
  const navigate = useNavigate();
  const { amount } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<"google" | "apple" | "facebook" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    if (amount !== undefined) savePendingAmount(amount);
    navigate({ to: "/dashboard", ...(amount !== undefined ? { search: { amount } } : {}) });
  };

  const social = async (kind: "google" | "apple" | "facebook") => {
    setSocialBusy(kind);
    setError(null);
    const err =
      kind === "google"
        ? await signInWithGoogle(amount)
        : kind === "apple"
          ? await signInWithApple(amount)
          : await signInWithFacebook(amount);
    setSocialBusy(null);
    if (err) setError(err);
  };

  const signupLinkProps =
    amount !== undefined
      ? ({ to: "/signup", search: { amount } } as const)
      : ({ to: "/signup" } as const);

  /* ---------- Form panel (shared mobile + desktop) ---------- */

  const formPanel = (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Sign in to continue your investment.
            </p>
          </div>
          <div className="hidden sm:block lg:hidden">
            <BrandMark />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 h-11 text-sm"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-[11px] font-semibold text-primary hover:underline"
                onClick={() => {
                  if (!email) {
                    setError("Enter your email first, then tap again.");
                    return;
                  }
                  supabase.auth
                    .resetPasswordForEmail(email.trim(), {
                      redirectTo: `${window.location.origin}/auth`,
                    })
                    .then(({ error: resetErr }) => {
                      if (resetErr) setError(resetErr.message);
                      else setError("Password reset email sent.");
                    });
                }}
              >
                Forgot?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="mt-1.5 h-11 text-sm"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p
              className={`rounded-xl px-4 py-2.5 text-xs font-medium ${
                /sent/i.test(error)
                  ? "bg-accent text-accent-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl font-bold"
          >
            {busy ? (
              <><Loader2 className="mr-2 size-4 animate-spin" /> Signing in…</>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium text-muted-foreground">or continue with</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Social buttons — 3-up */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={socialBusy !== null}
            onClick={() => social("google")}
            aria-label="Continue with Google"
            className="h-11 rounded-xl"
          >
            {socialBusy === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-5" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={socialBusy !== null}
            onClick={() => social("apple")}
            aria-label="Continue with Apple"
            className="h-11 rounded-xl"
          >
            {socialBusy === "apple" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <AppleIcon className="size-5" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={socialBusy !== null}
            onClick={() => social("facebook")}
            aria-label="Continue with Facebook"
            className="h-11 rounded-xl"
          >
            {socialBusy === "facebook" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FacebookIcon className="size-5 text-[#1877F2]" />
            )}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to MOTUS Capital?{" "}
          <Link {...signupLinkProps} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      {/* Demo shortcuts */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          asChild
          variant="ghost"
          className="h-10 flex-1 rounded-xl text-xs text-muted-foreground hover:text-foreground"
        >
          <Link to="/demo">
            <Eye className="mr-2 size-3.5" />
            Preview investor demo
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 flex-1 rounded-xl border-primary/20 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <Link to="/admin-demo">
            Admin payment demo →
          </Link>
        </Button>
      </div>
    </div>
  );

  /* ---------- Brand pitch (desktop left, mobile compact top) ---------- */

  const brandPitch = (
    <div className="space-y-6">
      <BrandMark />

      <div className="space-y-3">
        <h2 className="font-display text-3xl font-extrabold leading-tight text-foreground xl:text-4xl">
          Put your money on the road.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground xl:text-base">
          Fund e-hailing, delivery, and shuttle vehicles that earn every day.
          Transparent weekly revenue. Real fleet telemetry. Returns from 13%–25%.
        </p>
      </div>

      <ul className="space-y-3">
        {[
          {
            icon: TrendingUp,
            title: "13%–25% per cycle",
            body: "Returns generated by real vehicle earnings.",
          },
          {
            icon: Car,
            title: "Asset-backed",
            body: "Every cycle is tied to a funded vehicle or bike.",
          },
          {
            icon: ShieldCheck,
            title: "Bank-grade payouts",
            body: "Verified payout account, encrypted at rest.",
          },
          {
            icon: Sparkles,
            title: "Compounding built in",
            body: "Reinvest or withdraw when each cycle matures.",
          },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <li key={f.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  /* ---------- Layout ---------- */

  return (
    <div className="min-h-screen bg-background">
      {/* ===== MOBILE ===== */}
      <div className="lg:hidden">
        <div className="mx-auto max-w-md px-4 py-6">
          <div className="mb-5 flex items-center justify-between">
            <BrandMark />
            <Link
              to="/"
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Back to site
            </Link>
          </div>

          {/* Compact value strip */}
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Returns from 13%–25%
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Backed by real e-hailing, delivery & shuttle revenue.
            </p>
          </div>

          {formPanel}
        </div>
      </div>

      {/* ===== DESKTOP: split 50/50 ===== */}
      <div className="hidden min-h-screen lg:grid lg:grid-cols-2">
        {/* Left — brand */}
        <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background px-10 py-12">
          {/* subtle radial */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, oklch(0.58 0.19 254 / 0.18), transparent 55%), radial-gradient(circle at 80% 80%, oklch(0.70 0.17 152 / 0.15), transparent 55%)",
            }}
          />
          <div className="relative z-10 max-w-md">{brandPitch}</div>
        </div>

        {/* Right — form */}
        <div className="flex items-center justify-center bg-card/40 px-10 py-12">
          <div className="w-full max-w-md">
            {formPanel}
            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              By continuing you agree to our{" "}
              <Link to="/terms" className="underline hover:text-foreground">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}