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
  ArrowUpRight,
  Hourglass,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInvestment,
  getMyInvestments,
  isUserAdmin,
  type MaturityAction,
} from "@/server-fn/investments";
import { BrandMark } from "@/components/site-shell";
import { InvestmentSlider } from "@/components/investment-slider";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { WithdrawModal } from "@/components/withdraw-modal";
import { PaymentInstructions } from "@/components/payment-instructions";
import { ProfilePanel } from "@/components/profile-panel";
import { Button } from "@/components/ui/button";
import {
  InvestmentPlan,
  PLAN_CONFIGS,
  formatDate,
  formatRand,
  formatRandFromCents,
  getInvestmentState,
} from "@/lib/investment";
import { parseAmountSearch } from "@/lib/search";
import { takePendingAmount } from "@/lib/social-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: parseAmountSearch,
  head: () => ({
    meta: [{ title: "My dashboard — MOTUS Capital" }],
  }),
  component: DashboardPage,
});

/** Minimum target return for a term; used for the payout preview. */
function minReturnRate(termDays: number): number {
  if (termDays >= 90) return PLAN_CONFIGS["3months"].minPct;
  if (termDays >= 60) return PLAN_CONFIGS["2months"].minPct;
  return PLAN_CONFIGS["1month"].minPct;
}

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchInvestments = useServerFn(getMyInvestments);
  const startInvestment = useServerFn(createInvestment);
  const checkAdmin = useServerFn(isUserAdmin);

  const { amount: searchAmount } = Route.useSearch();
  const [initialAmount] = useState(() => searchAmount ?? takePendingAmount() ?? 500);
  const [pendingAmount, setPendingAmount] = useState<number>(initialAmount);
  const [pendingPlan, setPendingPlan] = useState<InvestmentPlan>(
    initialAmount > 1000 ? "3months" : "1month",
  );
  const [newAction, setNewAction] = useState<MaturityAction>("withdraw");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<{
    amountCents: number;
    reference: string;
  } | null>(null);

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

  const toast = (text: string, ms = 4000) => {
    setSuccessToast(text);
    setTimeout(() => setSuccessToast(null), ms);
  };

  const investNow = async () => {
    setBusy(true);
    setError(null);
    try {
      const row = await startInvestment({
        data: {
          amountRands: pendingAmount,
          maturityAction: newAction,
          termDays: activePlanConfig.termDays,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-investments"] });
      setJustCreated({
        amountCents: row.amount_cents,
        reference: row.payment_reference ?? "",
      });
      toast("Cycle created. Pay using the details below so we can start it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const handleWithdrawConfirm = (details: { bank: string; amountCents: number }) => {
    if (withdrawTarget) {
      setWithdrawnIds((prev) => [...prev, withdrawTarget.id]);
      toast(`Payout of ${formatRandFromCents(details.amountCents)} requested to ${details.bank}.`, 5000);
    }
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const investments = data?.investments ?? [];
  const stateOf = (inv: (typeof investments)[number]) =>
    getInvestmentState(inv, withdrawnIds.includes(inv.id));

  const sum = (state: ReturnType<typeof getInvestmentState>) =>
    investments.filter((i) => stateOf(i) === state).reduce((s, i) => s + i.amount_cents, 0);

  const activeCents = sum("active");
  const pendingCents = sum("pending");
  const maturedCents = sum("matured");
  const totalCents = investments
    .filter((i) => {
      const s = stateOf(i);
      return s !== "pending" && s !== "rejected";
    })
    .reduce((s, i) => s + i.amount_cents, 0);

  return (
    <div className="min-h-screen bg-background">
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

      {successToast && (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-brand-green shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <WithdrawModal
        isOpen={withdrawTarget !== null}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdrawConfirm}
        investment={withdrawTarget}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        <div>
          <div className="flex items-center gap-3">
            {data?.avatarUrl && (
              <img src={data.avatarUrl} alt="" className="size-12 rounded-full border border-border object-cover" />
            )}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                {data?.fullName ? `Welcome, ${data.fullName.split(" ")[0]}` : "Your dashboard"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {data?.email ?? "Mobility Investment Portal"}
                {data?.memberSince ? ` · Member since ${formatDate(data.memberSince)}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">In Active Fleet</span>
              <p className="mt-1 font-display text-2xl font-bold text-primary">{formatRandFromCents(activeCents)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Locked in earning cycles</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Awaiting payment</span>
              <p className="mt-1 font-display text-2xl font-bold text-amber-600">{formatRandFromCents(pendingCents)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Starts once we confirm</p>
            </div>
            <div className="rounded-2xl border border-brand-green/30 bg-accent/40 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">Matured (Ready)</span>
              <p className="mt-1 font-display text-2xl font-bold text-brand-green">{formatRandFromCents(maturedCents)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Available to withdraw</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Invested</span>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{formatRandFromCents(totalCents)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Confirmed contributions</p>
            </div>
          </div>
        </div>

        {/* Start an investment */}
        <section className="rounded-3xl border-2 border-primary/20 bg-card p-5 sm:p-8 shadow-xl shadow-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border/70 pb-4">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Primary Action</span>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">Start a New Investment Cycle</h2>
            </div>
            <p className="text-xs text-muted-foreground sm:text-right">
              Pay by EFT, then we confirm and start your cycle
            </p>
          </div>

          <div className="mt-5">
            <InvestmentSlider
              value={pendingAmount}
              onChange={setPendingAmount}
              plan={pendingPlan}
              onPlanChange={setPendingPlan}
            />
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {[
              { value: "withdraw" as const, title: "Withdraw at maturity", body: `Capital + profit paid out after ${activePlanConfig.termDays} days.` },
              { value: "reinvest" as const, title: "Reinvest automatically", body: "Roll capital into the next cycle to continue compounding." },
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
            <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">{error}</p>
          )}

          <Button
            size="lg"
            disabled={busy}
            onClick={investNow}
            className="mt-6 w-full rounded-2xl text-base font-bold shadow-md shadow-primary/20"
          >
            {busy ? (
              <><Loader2 className="mr-2 size-4 animate-spin" /> Creating cycle…</>
            ) : (
              `Invest ${formatRand(pendingAmount)} for ${activePlanConfig.termDays} days`
            )}
          </Button>

          {justCreated && justCreated.reference && (
            <div className="mt-6">
              <PaymentInstructions amountCents={justCreated.amountCents} paymentReference={justCreated.reference} />
            </div>
          )}
        </section>

        {/* Investments list */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Your Investment Cycles & Withdrawals</h2>
            <p className="text-xs text-muted-foreground">
              A cycle starts counting only after your payment is confirmed. Withdrawals unlock at maturity.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" /> Loading your investments…
            </div>
          ) : investments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center bg-card">
              <p className="text-sm font-medium text-muted-foreground">You have no investment cycles yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">Use the calculator above to start your first cycle from just R100.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => {
                const state = stateOf(inv);
                const termDays = inv.term_days || 30;
                const profitCents = Math.round(inv.amount_cents * minReturnRate(termDays));
                const totalPayoutCents = inv.amount_cents + profitCents;
                const daysLeft = Math.max(
                  0,
                  Math.ceil((new Date(inv.matures_at).getTime() - Date.now()) / 86_400_000),
                );

                return (
                  <div
                    key={inv.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      state === "withdrawn" || state === "rejected"
                        ? "border-border/60 bg-secondary/30 opacity-75"
                        : state === "matured"
                          ? "border-brand-green/40 bg-accent/30 shadow-md shadow-brand-green/5"
                          : state === "pending"
                            ? "border-amber-500/40 bg-amber-500/5"
                            : "border-border bg-card"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-xl font-bold text-foreground">{formatRandFromCents(inv.amount_cents)}</p>

                          {state === "withdrawn" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                              <CheckCircle2 className="size-3" /> Withdrawn
                            </span>
                          )}
                          {state === "matured" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-0.5 text-xs font-bold text-white">
                              <CheckCircle2 className="size-3" /> Matured · Ready to Withdraw
                            </span>
                          )}
                          {state === "active" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                              <Clock className="size-3" /> In {termDays}-Day Cycle (Locked)
                            </span>
                          )}
                          {state === "pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                              <Hourglass className="size-3" /> Awaiting payment confirmation
                            </span>
                          )}
                          {state === "rejected" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                              <XCircle className="size-3" /> Payment rejected
                            </span>
                          )}

                          <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {termDays} days · from {(minReturnRate(termDays) * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                          <span>Created {formatDate(inv.created_at)}</span>
                          {(state === "active" || state === "matured" || state === "withdrawn") && (
                            <>
                              <span>·</span>
                              <span>Matures {formatDate(inv.matures_at)}</span>
                            </>
                          )}
                          {state === "active" && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-amber-600">{daysLeft} days remaining</span>
                            </>
                          )}
                          {inv.payment_reference && state === "pending" && (
                            <>
                              <span>·</span>
                              <span className="font-mono font-semibold text-foreground">Ref {inv.payment_reference}</span>
                            </>
                          )}
                        </div>

                        {state === "matured" && (
                          <p className="mt-1 text-xs font-semibold text-brand-green">
                            Target profit: +{formatRandFromCents(profitCents)} → Total:{" "}
                            <span className="font-extrabold">{formatRandFromCents(totalPayoutCents)}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                        {state === "matured" ? (
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
                        ) : state === "active" ? (
                          <span className="inline-flex items-center text-xs font-semibold text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-xl">
                            <Lock className="mr-1.5 size-3.5" />
                            Unlocks {formatDate(inv.matures_at)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {state === "pending" && inv.payment_reference && (
                      <div className="mt-4">
                        <PaymentInstructions amountCents={inv.amount_cents} paymentReference={inv.payment_reference} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {data && (
          <ProfilePanel
            key={data.userId}
            profile={{
              userId: data.userId,
              email: data.email,
              fullName: data.fullName,
              phone: data.phone,
              avatarUrl: data.avatarUrl,
              bankName: data.bankName,
              bankAccountHolder: data.bankAccountHolder,
              bankAccountNumber: data.bankAccountNumber,
              bankBranchCode: data.bankBranchCode,
              bankAccountType: data.bankAccountType,
            }}
          />
        )}

        <section className="pt-2">
          <DashboardAnalytics />
        </section>
      </main>
    </div>
  );
}
