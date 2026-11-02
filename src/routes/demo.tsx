import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LogOut,
  ShieldCheck,
  TrendingUp,
  Eye,
  Info,
  CheckCircle2,
  Lock,
  Clock,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { BrandMark } from "@/components/site-shell";
import { InvestmentSlider } from "@/components/investment-slider";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { WithdrawModal } from "@/components/withdraw-modal";
import { Button } from "@/components/ui/button";
import {
  InvestmentPlan,
  PLAN_CONFIGS,
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
// Mock data — demonstrates 1-month and 2-3 month investments
// ---------------------------------------------------------------------------
const DEMO_USER = {
  fullName: "Thabo Mokoena",
  email: "thabo@example.co.za",
  memberSince: "2026-08-15",
};

interface DemoInvestment {
  id: string;
  amount_cents: number;
  profit_cents: number;
  term_days: number;
  expected_return_pct: string;
  status: "active" | "matured" | "withdrawn";
  maturity_action: "withdraw" | "reinvest";
  created_at: string;
  matures_at: string;
}

const INITIAL_DEMO_INVESTMENTS: DemoInvestment[] = [
  // 1. MATURED 30-day investment ready for payout right now!
  {
    id: "inv-matured-1",
    amount_cents: 100000, // R1,000
    profit_cents: 18000,  // +R180 (18%)
    term_days: 30,
    expected_return_pct: "18%",
    status: "matured",
    maturity_action: "withdraw",
    created_at: "2026-10-02",
    matures_at: "2026-11-01", // Matured yesterday!
  },
  // 2. ACTIVE 30-day investment locked in current cycle
  {
    id: "inv-active-2",
    amount_cents: 50000, // R500
    profit_cents: 8500,  // +R85 (17%)
    term_days: 30,
    expected_return_pct: "17%",
    status: "active",
    maturity_action: "withdraw",
    created_at: "2026-10-18",
    matures_at: "2026-11-17", // 15 days left
  },
  // 3. ACTIVE 90-day growth fleet investment locked in 3-month cycle
  {
    id: "inv-active-3",
    amount_cents: 500000, // R5,000
    profit_cents: 125000, // +R1,250 (25%)
    term_days: 90,
    expected_return_pct: "25%",
    status: "active",
    maturity_action: "reinvest",
    created_at: "2026-09-15",
    matures_at: "2026-12-14", // 42 days left
  },
];

function DemoDashboard() {
  const [investments, setInvestments] = useState<DemoInvestment[]>(INITIAL_DEMO_INVESTMENTS);
  const [pendingAmount, setPendingAmount] = useState(500);
  const [pendingPlan, setPendingPlan] = useState<InvestmentPlan>("1month");
  const [newAction, setNewAction] = useState<"withdraw" | "reinvest">("withdraw");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Withdrawal modal state
  const [withdrawTarget, setWithdrawTarget] = useState<DemoInvestment | null>(null);

  const activePlanConfig = PLAN_CONFIGS[pendingPlan];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fakeInvest = () => {
    const today = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(today.getDate() + activePlanConfig.termDays);

    const minProfit = Math.round(pendingAmount * activePlanConfig.minPct);

    const newInv: DemoInvestment = {
      id: `inv-${Date.now()}`,
      amount_cents: pendingAmount * 100,
      profit_cents: minProfit * 100,
      term_days: activePlanConfig.termDays,
      expected_return_pct: `${(activePlanConfig.minPct * 100).toFixed(0)}%–${(activePlanConfig.maxPct * 100).toFixed(0)}%`,
      status: "active",
      maturity_action: newAction,
      created_at: today.toISOString().split("T")[0]!,
      matures_at: maturityDate.toISOString().split("T")[0]!,
    };

    setInvestments((prev) => [newInv, ...prev]);
    showToast(
      `Started ${formatRand(pendingAmount)} cycle on ${activePlanConfig.termLabel}! Funds deployed into fleet.`,
    );
  };

  const handleWithdrawConfirm = (details: { bank: string; amountCents: number }) => {
    if (withdrawTarget) {
      setInvestments((prev) =>
        prev.map((inv) =>
          inv.id === withdrawTarget.id ? { ...inv, status: "withdrawn" } : inv,
        ),
      );
      showToast(
        `EFT payout of ${formatRandFromCents(details.amountCents)} sent to your ${details.bank} account!`,
      );
    }
  };

  const activeCents = investments
    .filter((i) => i.status === "active")
    .reduce((s, i) => s + i.amount_cents, 0);

  const maturedCents = investments
    .filter((i) => i.status === "matured")
    .reduce((s, i) => s + (i.amount_cents + i.profit_cents), 0);

  const totalCents = investments.reduce((s, i) => s + i.amount_cents, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-primary px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-primary-foreground flex items-center justify-center gap-1.5 flex-wrap">
        <Eye className="size-4 shrink-0" />
        <span>Investor Demo Portal · Illustrative Data.</span>
        <Link to="/admin-demo" className="ml-2 underline hover:no-underline font-bold">
          View Admin Demo (Process Payments) &rarr;
        </Link>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin-demo" className="text-primary font-bold text-xs">
                <ShieldCheck className="mr-1.5 size-4" /> Admin Demo (Payments)
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/auth" className="text-xs">
                <LogOut className="mr-1.5 size-3.5" /> Sign in
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-brand-green shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Withdrawal Modal */}
      <WithdrawModal
        isOpen={withdrawTarget !== null}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdrawConfirm}
        investment={withdrawTarget}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Top Greeting & Balance Stats */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Welcome, {DEMO_USER.fullName.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {DEMO_USER.email} · Member since {formatDate(DEMO_USER.memberSince)}
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong>Mobile Demo:</strong> Test deploying new capital on top, watch returns compound in the analytics below, and test withdrawing matured funds directly to your bank account.
            </span>
          </div>

          {/* Quick Balance Cards — Mobile 2-column, Desktop 3-column */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                In Active Fleet
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-primary">
                {formatRandFromCents(activeCents)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Locked in earning cycles
              </p>
            </div>

            <div className="rounded-2xl border border-brand-green/30 bg-accent/40 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                Matured (Ready)
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-brand-green">
                {formatRandFromCents(maturedCents)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Ready to withdraw now
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Invested
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
                {formatRandFromCents(totalCents)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Lifetime contributions
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MAIN FEATURE ON TOP: START AN INVESTMENT                      */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border-2 border-primary/20 bg-card p-5 sm:p-8 shadow-xl shadow-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border/70 pb-4">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Main Feature
              </span>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                Start an Investment Cycle
              </h2>
            </div>
            <p className="text-xs text-muted-foreground sm:text-right">
              Choose your cycle and deploy capital into commercial vehicles
            </p>
          </div>

          {/* Investment Slider with 1-Month (13%–20%) and 2–3 Month (20%–25%) plans */}
          <div className="mt-5">
            <InvestmentSlider
              value={pendingAmount}
              onChange={setPendingAmount}
              plan={pendingPlan}
              onPlanChange={setPendingPlan}
            />
          </div>

          {/* Maturity Preference */}
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {[
              {
                value: "withdraw" as const,
                title: "Withdraw at maturity",
                body: `Capital + profit available to withdraw after ${activePlanConfig.termDays} days.`,
              },
              {
                value: "reinvest" as const,
                title: "Reinvest automatically",
                body: "Roll capital into the next cycle to continue compounding.",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setNewAction(option.value)}
                className={`rounded-2xl p-4 text-left transition-all ${
                  newAction === option.value
                    ? "border-2 border-primary bg-secondary/80 ring-1 ring-primary/20"
                    : "border border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-bold text-foreground">{option.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.body}</p>
              </button>
            ))}
          </div>

          <Button
            size="lg"
            onClick={fakeInvest}
            className="mt-6 w-full rounded-2xl text-base font-bold shadow-md shadow-primary/20"
          >
            Deploy {formatRand(pendingAmount)} ({activePlanConfig.termDays}-Day Cycle Demo)
          </Button>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* YOUR INVESTMENTS & WITHDRAWALS SECTION                        */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Your Investment Cycles & Withdrawals
            </h2>
            <p className="text-xs text-muted-foreground">
              Withdrawals unlock only once an investment reaches maturity after its 30, 60, or 90-day cycle.
            </p>
          </div>

          <div className="space-y-3">
            {investments.map((inv) => {
              const isMatured = inv.status === "matured";
              const isWithdrawn = inv.status === "withdrawn";
              const totalPayoutCents = inv.amount_cents + inv.profit_cents;

              // Calculate days left
              const maturityDate = new Date(inv.matures_at);
              const daysLeft = Math.max(
                0,
                Math.ceil((maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              );

              return (
                <div
                  key={inv.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    isWithdrawn
                      ? "border-border/60 bg-secondary/30 opacity-75"
                      : isMatured
                        ? "border-brand-green/40 bg-accent/30 shadow-md shadow-brand-green/5 ring-1 ring-brand-green/20"
                        : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl font-bold text-foreground">
                          {formatRandFromCents(inv.amount_cents)}
                        </p>

                        {/* Status Badge */}
                        {isWithdrawn ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                            <CheckCircle2 className="size-3" /> Withdrawn to Bank
                          </span>
                        ) : isMatured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                            <CheckCircle2 className="size-3" /> Matured · Ready to Withdraw!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                            <Clock className="size-3" /> In {inv.term_days}-Day Cycle (Locked)
                          </span>
                        )}

                        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {inv.term_days} Days ({inv.expected_return_pct})
                        </span>
                      </div>

                      {/* Dates & Lock Info */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span>Started {formatDate(inv.created_at)}</span>
                        <span>·</span>
                        <span>Matures {formatDate(inv.matures_at)}</span>
                        {!isMatured && !isWithdrawn && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-amber-600">
                              {daysLeft} days remaining
                            </span>
                          </>
                        )}
                      </div>

                      {/* Profit summary if matured */}
                      {isMatured && !isWithdrawn && (
                        <p className="mt-1 text-xs font-semibold text-brand-green">
                          Earned Profit: +{formatRandFromCents(inv.profit_cents)} &rarr; Total Payout:{" "}
                          <span className="font-extrabold">{formatRandFromCents(totalPayoutCents)}</span>
                        </p>
                      )}
                    </div>

                    {/* Action Area: Withdraw vs Locked */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                      {isWithdrawn ? (
                        <span className="text-xs font-semibold text-muted-foreground">
                          Payout Completed ✓
                        </span>
                      ) : isMatured ? (
                        <Button
                          size="sm"
                          onClick={() => setWithdrawTarget(inv)}
                          className="rounded-xl font-bold bg-brand-green hover:bg-brand-green/90 text-white w-full sm:w-auto shadow-sm"
                        >
                          <ArrowUpRight className="mr-1.5 size-4" />
                          Withdraw {formatRandFromCents(totalPayoutCents)}
                        </Button>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-xl">
                          <Lock className="mr-1.5 size-3.5 text-muted-foreground" />
                          Withdrawal unlocked on {formatDate(inv.matures_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* BUSINESS PERFORMANCE & ANALYTICS GRAPHS                       */}
        {/* ------------------------------------------------------------- */}
        <section className="pt-2">
          <DashboardAnalytics />
        </section>
      </main>
    </div>
  );
}
