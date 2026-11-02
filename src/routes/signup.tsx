import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampInvestment, formatRand } from "@/lib/investment";
import { signInWithGoogle, signInWithLovable } from "@/lib/social-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
          "Sign up and start your MOTUS Capital investment from R100 in a 30-day mobility investment cycle.",
      },
      { property: "og:title", content: "Create your account — MOTUS Capital" },
      {
        property: "og:description",
        content: "Start investing in the mobility economy from R100.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const amount = Route.useSearch().amount ?? 500;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
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

  const social = async (kind: "google" | "lovable") => {
    setSocialBusy(true);
    const err =
      kind === "google"
        ? await signInWithGoogle(amount)
        : await signInWithLovable(amount);
    setSocialBusy(false);
    if (err) setError(err);
  };

  if (needsConfirmation) {
    return (
      <AuthShell title="Check your email">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to <strong>{email.trim()}</strong>. Click
          it to activate your account, then sign in to continue with your{" "}
          {formatRand(amount)} investment.
        </p>
        <Button asChild className="mt-6 w-full rounded-2xl font-bold">
          <Link to="/auth" search={{ amount }}>
            Back to sign in
          </Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={`To continue with your ${formatRand(amount)} investment, tell us who you are.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Thabo Mokoena"
            className="mt-1.5"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone number (optional)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="082 123 4567"
            className="mt-1.5"
            autoComplete="tel"
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
            className="mt-1.5"
            autoComplete="email"
            required
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
            className="mt-1.5"
            autoComplete="new-password"
            required
          />
        </div>
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl font-bold"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Creating account…
            </>
          ) : (
            `Sign up & invest ${formatRand(amount)}`
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          disabled={socialBusy}
          onClick={() => social("google")}
          className="rounded-2xl"
        >
          Continue with Google
        </Button>
        <Button
          variant="outline"
          disabled={socialBusy}
          onClick={() => social("lovable")}
          className="rounded-2xl"
        >
          Continue with Lovable
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth"
          search={{ amount }}
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

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
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
          M
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
          Motus Capital
        </span>
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
