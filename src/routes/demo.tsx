import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, ShieldCheck, TrendingUp, Eye, Info } from "lucide-react";
import { BrandMark } from "@/components/site-shell";
import { InvestmentSlider } from "@/components/investment-slider";
import { Button } from "@/components/ui/button";
import {
  INVESTMENT_TERM_DAYS,
  formatDate,
  formatRand,
  formatRandFromCents,
} from "@/lib/investment";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [{ title: "Demo Dashboard — MOTUS Capital" }],
  }),
  component: DemoDashboard,
});

// ---------------------------------------------------------------------------
// Mock data — gives visitors a realistic feel for the dashboard
// ---------------------------------------------------------------------------
const DEMO_USER = {
  fullName: "Thabo Mokoena",
  email: "thabo@example.co.za",
  memberSince: "2026-08-15",
};

const DEMO_INVESTMENTS = [
  {
    id: "inv-1",
    amount_cents: 50000,
    status: "active" as const,
    maturity_action: "reinvest" as const,
    created_at: "2026-10-03",
    matures_at: "2026-11-02",
  },
  {
    id: "inv-2",
    amount_cents: 25000,
    status: "active" as const,
    maturity_action: "withdraw" as const,
    created_at: "2026-10-15",
    matures_at: "2026-11-14",
  },
  {
    id: "inv-3",
    amount_cents: 75000,
    status: "completed" as const,
    maturity_action: "withdraw" as const,
    created_at: "2026-09-01",
    matures_at: "2026-10-01",
  },
];

const activeCents = DEMO_INVESTMENTS.filter((i) => i.status === "active").reduce(
  (s, i) => s + i.amount_cents,
  0,
);
const totalCents = DEMO_INVESTMENTS.reduce((s, i) => s + i.amount_cents, 0);
const nextMaturity = DEMO_INVESTMENTS.filter((i) => i.status === "active")
  .map((i) => i.matures_at)
  .sort()[0];

function DemoDashboard() {
  const [investments, setInvestments] = useState(DEMO_INVESTMENTS);
  const [pendingAmount, setPendingAmount] = useState(500);
  const [newAction, setNewAction] = useState<"withdraw" | "reinvest">("withdraw");
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleAction = (id: string, action: "withdraw" | "reinvest") => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, maturity_action: action } : inv)),
    );
  };

  const fakeInvest = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">
        <Eye className="mr-1.5 inline-block size-4 align-text-bottom" />
        You're viewing a <strong>demo account</strong> — data is illustrative only.{" "}
        <Link to="/auth" className="ml-3 underline underline-offset-2 hover:no-underline">
          Sign in with a real account →
        </Link>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin" className="text-primary">
                <ShieldCheck className="mr-2 size-4" /> Admin (demo)
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">
                <LogOut className="mr-2 size-4" /> Sign in
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome */}
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Welcome back, {DEMO_USER.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {DEMO_USER.email} · Member since {formatDate(DEMO_USER.memberSince)}
        </p>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            This is a <strong>demo view</strong> with illustrative data. No real money is involved.
            All investment amounts, returns and dates shown are examples only.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Invested to date
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              {formatRandFromCents(totalCents)}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              In active cycles
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">
              {formatRandFromCents(activeCents)}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Next maturity
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              {nextMaturity ? formatDate(nextMaturity) : "—"}
            </p>
          </div>
        </div>

        {/* Start a new investment */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
          <h2 className="font-display text-xl font-bold text-foreground">
            Start another investment cycle
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an amount and how you'd like it handled after the{" "}
            {INVESTMENT_TERM_DAYS}-day cycle.
          </p>

          <div className="mt-6">
            <InvestmentSlider value={pendingAmount} onChange={setPendingAmount} />
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  value: "withdraw" as const,
                  title: "Withdraw at maturity",
                  body: `Get your capital back at the end of the ${INVESTMENT_TERM_DAYS} days.`,
                },
                {
                  value: "reinvest" as const,
                  title: "Reinvest automatically",
                  body: "Roll into the next cycle to keep it growing.",
                },
              ]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setNewAction(option.value)}
                className={
                  newAction === option.value
                    ? "rounded-2xl border-2 border-primary bg-secondary p-4 text-left"
                    : "rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50"
                }
              >
                <p className="text-sm font-bold text-foreground">{option.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{option.body}</p>
              </button>
            ))}
          </div>

          {showSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
              <TrendingUp className="size-4" />
              Demo investment of {formatRand(pendingAmount)} started! (no real money moved)
            </div>
          )}

          <Button
            size="lg"
            onClick={fakeInvest}
            className="mt-6 w-full rounded-2xl text-base font-bold sm:w-auto"
          >
            Invest {formatRand(pendingAmount)} (demo)
          </Button>
        </section>

        {/* Investment list */}
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Your investments
          </h2>
          <ul className="mt-4 space-y-3">
            {investments.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-xl font-bold text-foreground">
                    {formatRandFromCents(inv.amount_cents)}
                    <span
                      className={
                        inv.status === "active"
                          ? "ml-3 inline-block rounded-full bg-accent px-2.5 py-0.5 align-middle text-xs font-bold text-accent-foreground"
                          : "ml-3 inline-block rounded-full bg-secondary px-2.5 py-0.5 align-middle text-xs font-bold text-secondary-foreground"
                      }
                    >
                      {inv.status === "active" ? "Active" : "Completed"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Started {formatDate(inv.created_at)} · matures{" "}
                    {formatDate(inv.matures_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    At maturity:
                  </span>
                  <Button
                    size="sm"
                    variant={inv.maturity_action === "withdraw" ? "default" : "outline"}
                    onClick={() => toggleAction(inv.id, "withdraw")}
                  >
                    Withdraw
                  </Button>
                  <Button
                    size="sm"
                    variant={inv.maturity_action === "reinvest" ? "default" : "outline"}
                    onClick={() => toggleAction(inv.id, "reinvest")}
                  >
                    Reinvest
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
