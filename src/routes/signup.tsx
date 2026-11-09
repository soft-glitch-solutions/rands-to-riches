import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampInvestment, formatRand } from "@/lib/investment";
import {
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from "@/lib/social-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, ShieldCheck, TrendingUp, Car, Sparkles, CheckCircle2,
} from "lucide-react";
import { BrandMark } from "@/components/site-shell";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { amount?: number } => {
    const raw = Number(search["amount"]);
    return {
      amount: search["amount"] !== undefined ? clampInvestment(raw) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Create your account — MOTUS Capital" },
      {
        name: "description",
        content:
          "Sign up and start your MOTUS Capital investment from R100 with returns up to 25%.",
      },
      { property: "og:title", content: "Create your account — MOTUS Capital" },
      {
        property: "og:description",
        content: "Start investing in the mobility economy from R100 with returns up to 25%.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      throw redirect({
        to: "/dashboard",
        search: search.amount !== undefined ? { amount: search.amount } : undefined,
      });
    }
  },
  component: SignupPage,
});

/* ---------- Social icons ---------- */

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

function SignupPage() {
  const navigate = useNavigate();
  const amount = Route.useSearch().amount ?? 500;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<"google" | "apple" | "facebook" | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), phone: phone.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", search: { amount } });
      return;
    }
    setNeedsConfirmation(true);
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
    if (err) {
      setError(err);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate({
        to: "/dashboard",
        replace: true,
        ...(amount !== undefined ? { search: { amount } } : {}),
      });
    }
  };

  /* ---------- Confirmation screen (compact) ---------- */

  if (needsConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <BrandMark />
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <CheckCircle2 className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We sent a confirmation link to <strong className="text-foreground">{email.trim()}</strong>.
              Click it to activate your account, then sign in to continue with your{" "}
              <strong className="text-foreground">{formatRand(amount)}</strong> investment.
            </p>
            <Button asChild className="mt-6 h-11 w-full rounded-xl font-bold">
              <Link to="/auth" search={{ amount }}>
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Form panel ---------- */

  const formPanel = (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Start your {formatRand(amount)} investment in under a minute.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Thabo Mokoena"
              className="mt-1.5 h-11 text-sm"
              autoComplete="name"
              required
            />
          </div>
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
            <Label htmlFor="phone">
              Phone <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
              className="mt-1.5 h-11 text-sm"
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1.5 h-11 text-sm"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl font-bold"
          >
            {busy ? (
              <><Loader2 className="mr-2 size-4 animate-spin" /> Creating account…</>
            ) : (
              <>Sign up </>
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium text-muted-foreground">
            or continue with
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

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
          Already have an account?{" "}
          <Link
            to="/auth"
            search={{ amount }}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  /* ---------- Brand pitch ---------- */

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

          {/* Investment context strip */}
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Your investment
            </p>
            <p className="mt-0.5 font-display text-xl font-extrabold text-foreground">
              {formatRand(amount)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Target returns 13%–25% · 30–90 day cycle
            </p>
          </div>

          {formPanel}
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden min-h-screen lg:grid lg:grid-cols-2">
        {/* Left — brand */}
        <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background px-10 py-12">
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
              By signing up you agree to our{" "}
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

/* ---------- Legacy AuthShell (for any other page importing it) ---------- */

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-10">
      <div className="mb-8">
        <BrandMark />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}