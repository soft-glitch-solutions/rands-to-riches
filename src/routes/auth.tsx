import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampInvestment, formatRand } from "@/lib/investment";
import { savePendingAmount, signInWithGoogle, signInWithLovable } from "@/lib/social-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/routes/signup";

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
    // Signed-in visitors go straight to their dashboard.
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});

import { redirect } from "@tanstack/react-router";

function AuthPage() {
  const navigate = useNavigate();
  const { amount } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);

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

  const social = async (kind: "google" | "lovable") => {
    setSocialBusy(true);
    const err =
      kind === "google"
        ? await signInWithGoogle(amount)
        : await signInWithLovable(amount);
    setSocialBusy(false);
    if (err) setError(err);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your investment account.">
      <form onSubmit={submit} className="space-y-4">
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
            placeholder="Your password"
            className="mt-1.5"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full rounded-2xl font-bold">
          {busy ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button variant="outline" disabled={socialBusy} onClick={() => social("google")} className="rounded-2xl">
          Continue with Google
        </Button>
        <Button variant="outline" disabled={socialBusy} onClick={() => social("lovable")} className="rounded-2xl">
          Continue with Lovable
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to MOTUS Capital?{" "}
        <Link
          to="/signup"
          search={amount !== undefined ? { amount } : undefined}
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
