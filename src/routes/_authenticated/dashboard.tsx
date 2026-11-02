import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Loader2,
  LogOut,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInvestment,
  getMyInvestments,
  isUserAdmin,
  setMaturityAction,
  type MaturityAction,
} from "@/server-fn/investments";
import { BrandMark } from "@/components/site-shell";
import { InvestmentSlider } from "@/components/investment-slider";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { WithdrawModal } from "@/components/withdraw-modal";
import { Button } from "@/components/ui/button";
import {
  InvestmentPlan,
  PLAN_CONFIGS,
  clampInvestment,
  formatDate,
  formatRand,
  formatRandFromCents,
} from "@/lib/investment";
import { takePendingAmount } from "@/lib/social-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: (search: Record<string, unknown>): { amount?: number } => {
    const raw = Number(search["amount"]);
    return {
      amount: search["amount"] !== undefined ? clampInvestment(raw) : undefined,
    };
  },
  head: () => ({
    meta: [{ title: "My dashboard — MOTUS Capital" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchInvestments = useServerFn(getMyInvestments);
  const startInvestment = useServerFn(createInvestment);
  const changeAction = useServerFn(setMaturityAction);
  const checkAdmin = useServerFn(isUserAdmin);

  const { amount: searchAmount } = Route.useSearch();
  const initialAmount = searchAmount ?? takePendingAmount() ?? 500;
  const [pendingAmount, setPendingAmount] = useState<number>(initialAmount);
  const [pendingPlan, setPendingPlan] = useState<InvestmentPlan>(
    initialAmount > 1000 ? "3months" : "1month",
  );
  const [newAction, setNewAction] = useState<MaturityAction>("withdraw");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Withdrawal modal state
  const [withdrawTarget, setWithdrawTarget] = useState<{
    id: string;
    amount_cents: number;
    profit_cents?: number;
    term_days?: number;
  } | null>(null);
  const [withdrawnIds, setWithdrawnIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-investments"],
    queryFn: fetchInvestments,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: checkAdmin,
  });

  const activePlanConfig = PLAN_CONFIGS[pendingPlan];

  const investNow = async () => {
    setBusy(true);
    setError(null);
    try {
      await startInvestment({
        data: {
          amountRands: pendingAmount,
          maturityAction: newAction,
          termDays: activePlanConfig.termDays,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-investments"] });
      setSuccessToast(`Investment of ${formatRand(pendingAmount)} started successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const switchAction = async (id: string, action: MaturityAction) => {
    setError(null);
    try {
      await changeAction({ data: { id, action } });
      await queryClient.invalidateQueries({ queryKey: ["my-investments"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleWithdrawConfirm = (details: { bank: string; amountCents: number }) => {
    if (withdrawTarget) {
      setWithdrawnIds((prev) => [...prev, withdrawTarget.id]);
      setSuccessToast(
        `EFT Payout of ${formatRandFromCents(details.amountCents)} sent to ${details.bank}!`,
      );
      setTimeout(() => setSuccessToast(null), 5000);
    }
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const investments = data?.investments ?? [];

  // Filter helper: check if an investment has reached its maturity date
  const isInvestmentMatured = (inv: { matures_at: string; status: string; id: string }) => {
    if (withdrawnIds.includes(inv.id)) return false;
    const isPastDate = new Date(inv.matures_at).getTime() <= Date.now();
    return isPastDate || inv.status === "matured" || inv.status === "completed";
  };

  const activeCents = investments
    .filter((inv) => !isInvestmentMatured(inv) && !withdrawnIds.includes(inv.id))
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  const maturedCents = investments
    .filter((inv) => isInvestmentMatured(inv))
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  const totalCents = investments.reduce(
    (sum, inv) => sum + inv.amount_cents,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin" className="text-primary text-xs font-bold">
                  <ShieldCheck className="mr-1.5 size-4" /> Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs">
              <LogOut className="mr-1.5 size-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-brand-green shrink-0" />
          <span>{successToast}</span>
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
        {/* Top Area: Greeting & Summary Cards */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            {data?.fullName ? `Welcome, ${data.fullName.split(" ")[0]}` : "Your dashboard"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {data?.email ?? "Mobility Investment Portal"}
            {data?.memberSince ? ` · Member since ${formatDate(data.memberSince)}` : ""}
          </p>

          {/* Quick Balance Cards — Responsive Grid on Mobile */}
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
                Available to withdraw
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
                Primary Action
              </span>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                Start a New Investment Cycle
              </h2>
            </div>
            <p className="text-xs text-muted-foreground sm:text-right">
              Funds deployed directly into productive commercial vehicles
            </p>
          </div>

          {/* Investment Slider with 1-Month (13%–20%) and 2–3 Month (20%–25%) tabs */}
          <div className="mt-5">
            <InvestmentSlider
              value={pendingAmount}
              onChange={setPendingAmount}
              plan={pendingPlan}
              onPlanChange={setPendingPlan}
            />
          </div>

          {/* Reinvestment vs Withdrawal Preference */}
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {[
              {
                value: "withdraw" as const,
                title: "Withdraw at maturity",
                body: `Capital + profit paid out after ${activePlanConfig.termDays} days.`,
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

          {error && (
            <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            size="lg"
            disabled={busy}
            onClick={investNow}
            className="mt-6 w-full rounded-2xl text-base font-bold shadow-md shadow-primary/20"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Starting cycle…
              </>
            ) : (
              `Deploy ${formatRand(pendingAmount)} into ${activePlanConfig.termDays}-Day Cycle`
            )}
          </Button>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* YOUR INVESTMENTS & WITHDRAWALS SECTION                        */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Your Investment Cycles & Withdrawals
              </h2>
              <p className="text-xs text-muted-foreground">
                Funds are locked during active cycles. Only investments that have matured after their cycle can be withdrawn.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" /> Loading your investments…
            </div>
          ) : investments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center bg-card">
              <p className="text-sm font-medium text-muted-foreground">
                You have no active investment cycles yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the calculator above to start your first mobility cycle from just R100.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => {
                const isMatured = isInvestmentMatured(inv);
                const isWithdrawn = withdrawnIds.includes(inv.id);
                const termDays = inv.term_days || 30;

                // Estimated profit based on term
                const profitRate = termDays >= 90 ? 0.25 : termDays >= 60 ? 0.22 : 0.18;
                const profitCents = Math.round(inv.amount_cents * profitRate);
                const totalPayoutCents = inv.amount_cents + profitCents;

                // Days calculation
                const maturityTimestamp = new Date(inv.matures_at).getTime();
                const daysLeft = Math.max(
                  0,
                  Math.ceil((maturityTimestamp - Date.now()) / (1000 * 60 * 60 * 24)),
                );

                return (
                  <div
                    key={inv.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      isWithdrawn
                        ? "border-border/60 bg-secondary/30 opacity-75"
                        : isMatured
                          ? "border-brand-green/40 bg-accent/30 shadow-md shadow-brand-green/5"
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
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-0.5 text-xs font-bold text-white">
                              <CheckCircle2 className="size-3" /> Matured · Ready to Withdraw
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                              <Clock className="size-3" /> In {termDays}-Day Cycle (Locked)
                            </span>
                          )}

                          <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {termDays} Days ({(profitRate * 100).toFixed(0)}%)
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

                        {/* Profit preview if matured */}
                        {isMatured && !isWithdrawn && (
                          <p className="mt-1 text-xs font-semibold text-brand-green">
                            Earned Profit: +{formatRandFromCents(profitCents)} &rarr; Total Payout:{" "}
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
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              onClick={() =>
                                setWithdrawTarget({
                                  id: inv.id,
                                  amount_cents: inv.amount_cents,
                                  profit_cents: profitCents,
                                  term_days: termDays,
                                })
                              }
                              className="rounded-xl font-bold bg-brand-green hover:bg-brand-green/90 text-white w-full sm:w-auto"
                            >
                              <ArrowUpRight className="mr-1.5 size-4" />
                              Withdraw {formatRandFromCents(totalPayoutCents)}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center text-xs font-semibold text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-xl">
                              <Lock className="mr-1.5 size-3.5 text-muted-foreground" />
                              Withdrawal unlocked on {formatDate(inv.matures_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
