import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Loader2, LogOut, ShieldCheck, Lock, CheckCircle2, Clock,
  ArrowUpRight, Hourglass, XCircle, User,
  Wallet, ListChecks, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInvestment, getMyInvestments, isUserAdmin, type MaturityAction,
} from "@/server-fn/investments";
import { BrandMark } from "@/components/site-shell";
import { InvestmentSlider } from "@/components/investment-slider";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { WithdrawModal } from "@/components/withdraw-modal";
import { PaymentInstructions } from "@/components/payment-instructions";
import { ProfilePanel } from "@/components/profile-panel";
import { DashboardPoolsTab } from "@/components/dashboard-pools-tab";
import { getMyPoolContributions } from "@/server-fn/asset-pools";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InvestmentPlan, PLAN_CONFIGS, formatDate, formatRand,
  formatRandFromCents, getInvestmentState,
} from "@/lib/investment";
import { parseAmountSearch } from "@/lib/search";
import { takePendingAmount } from "@/lib/social-auth";
import { cn } from "@/lib/utils";
import {
  GreetingSkeleton, StatSkeleton, InvestCardSkeleton,
  CyclesListSkeleton, AnalyticsSkeleton, ProfileSkeleton,
} from "@/components/dashboard-skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: parseAmountSearch,
  head: () => ({ meta: [{ title: "My dashboard — MOTUS Capital" }] }),
  component: DashboardPage,
});

function minReturnRate(termDays: number): number {
  if (termDays >= 90) return PLAN_CONFIGS["3months"].minPct;
  if (termDays >= 60) return PLAN_CONFIGS["2months"].minPct;
  return PLAN_CONFIGS["1month"].minPct;
}

function StatTile({
  label, value, tone,
}: { label: string; value: number; tone: "primary" | "amber" | "green" | "neutral" }) {
  const toneCls =
    tone === "primary" ? "text-primary"
    : tone === "amber" ? "text-amber-600"
    : tone === "green" ? "text-brand-green"
    : "text-foreground";
  const borderCls =
    tone === "amber" ? "border-amber-500/30 bg-amber-500/5"
    : tone === "green" ? "border-brand-green/30 bg-accent/30"
    : "border-border bg-card";

  return (
    <div className={`rounded-2xl border ${borderCls} px-3 py-2.5 sm:px-3.5 sm:py-3`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 font-display text-base font-bold sm:text-lg ${toneCls}`}>
        {formatRandFromCents(value)}
      </p>
    </div>
  );
}

type Tab = "invest" | "pools" | "cycles" | "analytics" | "account";

const NAV_ITEMS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: "invest", label: "Invest", icon: Wallet },
  { id: "cycles", label: "Cycles", icon: ListChecks },
  { id: "pools", label: "Pools", icon: Layers },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "account", label: "Account", icon: User },
];

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchInvestments = useServerFn(getMyInvestments);
  const fetchPoolContribs = useServerFn(getMyPoolContributions);
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
    id: string; amount_cents: number; profit_cents?: number; term_days?: number;
  } | null>(null);
  const [withdrawnIds, setWithdrawnIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("invest");

  const { data, isLoading } = useQuery({
    queryKey: ["my-investments"],
    queryFn: fetchInvestments,
  });
  const { data: poolContribs = [], isLoading: poolContribsLoading } = useQuery({
    queryKey: ["my-pool-contributions"],
    queryFn: fetchPoolContribs,
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
      toast("Cycle created. Pay below to start it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const handleWithdrawConfirm = (details: { bank: string; amountCents: number }) => {
    if (withdrawTarget) {
      setWithdrawnIds((prev) => [...prev, withdrawTarget.id]);
      queryClient.invalidateQueries({ queryKey: ["my-investments"] });
      toast(`Payout of ${formatRandFromCents(details.amountCents)} requested.`, 5000);
    }
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const investments = data?.investments ?? [];
  const stateOf = (inv: (typeof investments)[number]) => {
    const hasActivePayout = data?.payoutRequests?.some(
      (p) => p.investment_id === inv.id && (p.status === "pending" || p.status === "processing" || p.status === "completed")
    );
    return getInvestmentState(inv, withdrawnIds.includes(inv.id) || hasActivePayout);
  };
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

  /* ---------- Fragments ---------- */

  const statsGrid = (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
      <StatTile label="Active" value={activeCents} tone="primary" />
      <StatTile label="Pending" value={pendingCents} tone="amber" />
      <StatTile label="Matured" value={maturedCents} tone="green" />
      <StatTile label="Total" value={totalCents} tone="neutral" />
    </div>
  );

  const investCard = (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-foreground">
          New investment
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {activePlanConfig.termDays}-day cycle
        </span>
      </div>

      <InvestmentSlider
        value={pendingAmount}
        onChange={setPendingAmount}
        plan={pendingPlan}
        onPlanChange={setPendingPlan}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { value: "withdraw" as const, label: "Withdraw at maturity" },
          { value: "reinvest" as const, label: "Reinvest" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setNewAction(option.value)}
            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
              newAction === option.value
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <Button
        size="lg"
        disabled={busy}
        onClick={investNow}
        className="mt-4 w-full rounded-xl text-sm font-bold"
      >
        {busy ? (
          <><Loader2 className="mr-2 size-4 animate-spin" /> Creating…</>
        ) : (
          <>Invest {formatRand(pendingAmount)} · {activePlanConfig.termDays}d</>
        )}
      </Button>

      {justCreated?.reference && (
        <div className="mt-4">
          <PaymentInstructions
            amountCents={justCreated.amountCents}
            paymentReference={justCreated.reference}
            payout={data?.payout ?? null}
          />
        </div>
      )}
    </section>
  );

  const cyclesList = (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
          Your cycles
        </h2>
        {investments.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {investments.length} total
          </span>
        )}
      </div>

      {investments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No cycles yet — start one from the Invest tab.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
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
                className={`rounded-2xl border p-3.5 transition-all ${
                  state === "withdrawn" || state === "rejected"
                    ? "border-border/60 bg-secondary/20 opacity-70"
                    : state === "matured"
                      ? "border-brand-green/40 bg-accent/30"
                      : state === "pending"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-display text-base font-bold text-foreground">
                        {formatRandFromCents(inv.amount_cents)}
                      </p>
                      {state === "withdrawn" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                          <CheckCircle2 className="size-2.5" /> Withdrawn
                        </span>
                      )}
                      {state === "matured" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-bold text-white">
                          <CheckCircle2 className="size-2.5" /> Ready
                        </span>
                      )}
                      {state === "active" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <Clock className="size-2.5" /> {daysLeft}d left
                        </span>
                      )}
                      {state === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <Hourglass className="size-2.5" /> Awaiting pay
                        </span>
                      )}
                      {state === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                          <XCircle className="size-2.5" /> Rejected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {termDays}d · from {(minReturnRate(termDays) * 100).toFixed(0)}%
                      {state === "active" && ` · matures ${formatDate(inv.matures_at)}`}
                      {state === "matured" && ` · +${formatRandFromCents(profitCents)} profit`}
                    </p>
                  </div>

                  {state === "matured" && (
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
                      className="shrink-0 rounded-lg bg-brand-green text-xs font-bold text-white hover:bg-brand-green/90"
                    >
                      <ArrowUpRight className="mr-1 size-3.5" />
                      {formatRandFromCents(totalPayoutCents)}
                    </Button>
                  )}
                  {state === "active" && (
                    <Lock className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                  )}
                </div>

                {state === "pending" && inv.payment_reference && (
                  <div className="mt-3">
                    <PaymentInstructions
                      amountCents={inv.amount_cents}
                      paymentReference={inv.payment_reference}
                      payout={data?.payout ?? null}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {poolContribs.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">
              Pool stakes
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {poolContribs.length} active
            </span>
          </div>

          {poolContribsLoading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading pool stakes…
            </div>
          ) : (
            poolContribs.map((contrib: any) => {
              const pool = contrib.asset_pools;
              const funded = pool?.target_amount_cents > 0
                ? Math.round((pool.current_amount_cents / pool.target_amount_cents) * 100)
                : 0;

              return (
                <div key={contrib.id} className="rounded-2xl border border-border bg-card p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-foreground truncate">
                        {pool?.title ?? "Pool stake"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Ref: {contrib.payment_reference ?? "—"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                      <Clock className="size-3" /> {contrib.status}
                    </span>
                  </div>

                  {pool && (
                    <div className="space-y-2">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, funded)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{formatRandFromCents(contrib.amount_cents)} staked</span>
                        <span>{funded}% funded</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );

  const profileCard = data && (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <User className="size-4 text-primary" />
        <h2 className="font-display text-base font-bold text-foreground">
          Profile & bank details
        </h2>
      </div>
      <ProfilePanel
        key={data.userId}
        showIdentity={false}
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
    </section>
  );

  const greeting = (
    <div className="flex items-center gap-3">
      {data?.avatarUrl ? (
        <img
          src={data.avatarUrl}
          alt=""
          className="size-10 rounded-full border border-border object-cover sm:size-12"
        />
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12">
          <User className="size-5" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="truncate font-display text-lg font-bold text-foreground sm:text-2xl">
          {data?.fullName ? `Hi, ${data.fullName.split(" ")[0]}` : "Your dashboard"}
        </h1>
        <p className="truncate text-xs text-muted-foreground sm:text-sm">
          {data?.email ?? "Mobility Investment Portal"}
        </p>
      </div>
    </div>
  );

  /* ---------- Tab content with skeletons ---------- */

  const tabContent: Record<Tab, React.ReactNode> = {
    invest: isLoading ? (
      <div className="space-y-4">
        <StatSkeleton />
        <InvestCardSkeleton />
      </div>
    ) : (
      <div className="space-y-4">
        {statsGrid}
        {investCard}
      </div>
    ),
    cycles: isLoading ? (
      <div className="space-y-4">
        <StatSkeleton />
        <CyclesListSkeleton rows={4} />
      </div>
    ) : (
      <div className="space-y-4">
        {statsGrid}
        {cyclesList}
      </div>
    ),
    pools: <DashboardPoolsTab />,
    analytics: <DashboardAnalytics />,
    account: isLoading ? <ProfileSkeleton /> : profileCard,
  };

  const currentLabel = NAV_ITEMS.find((n) => n.id === tab)?.label ?? "";

  /* ---------- Layout ---------- */

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <BrandMark />
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/admin" className="text-xs font-bold text-primary">
                    <ShieldCheck className="mr-1.5 size-4" /> Admin
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="size-8 sm:hidden">
                  <Link to="/admin" aria-label="Admin">
                    <ShieldCheck className="size-4 text-primary" />
                  </Link>
                </Button>
              </>
            )}
            <Button
              variant="outline" size="sm" onClick={handleSignOut}
              className="hidden text-xs sm:inline-flex"
            >
              <LogOut className="mr-1.5 size-3.5" /> Sign out
            </Button>
            <Button
              variant="ghost" size="icon" onClick={handleSignOut}
              className="size-8 sm:hidden" aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {successToast && (
        <div className="fixed inset-x-4 bottom-28 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-2xl sm:bottom-6 sm:left-auto sm:right-6">
          <CheckCircle2 className="size-4 shrink-0 text-brand-green" />
          <span>{successToast}</span>
        </div>
      )}

      <WithdrawModal
        isOpen={withdrawTarget !== null}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdrawConfirm}
        investment={withdrawTarget}
        defaultBank={data?.bankName}
        defaultAccountHolder={data?.bankAccountHolder || data?.fullName}
        defaultAccountNumber={data?.bankAccountNumber}
        defaultBranchCode={data?.bankBranchCode}
      />

      {/* ===== MOBILE: curved bottom nav with animated active pill ===== */}
      <div className="lg:hidden">
        <main className="mx-auto max-w-md px-4 pt-4 pb-32">
          {(tab === "invest" || tab === "account") && (
            <div className="mb-4">{isLoading ? <GreetingSkeleton /> : greeting}</div>
          )}
          {tabContent[tab]}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Curved floating container */}
          <div className="mx-auto max-w-md px-3 pb-3">
            <div className="relative rounded-[28px] border border-border/70 bg-card/95 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              <div className="grid grid-cols-5 p-1.5">
                {NAV_ITEMS.map((item) => {
                  const active = tab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      aria-current={active ? "page" : undefined}
                      className="group relative flex flex-col items-center justify-center gap-0.5 py-1 outline-none"
                    >
                      {/* Active pill behind icon */}
                      <span
                        className={cn(
                          "absolute top-0 left-1/2 h-11 w-14 -translate-x-1/2 rounded-2xl bg-primary/10 transition-all duration-300 ease-out",
                          active
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-75",
                        )}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "relative z-10 flex flex-col items-center gap-0.5 transition-all duration-300 ease-out",
                          active ? "-translate-y-1" : "translate-y-0",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-5 transition-colors duration-300",
                            active
                              ? "text-primary stroke-[2.5]"
                              : "text-muted-foreground stroke-2",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[10px] transition-colors duration-300",
                            active
                              ? "text-primary font-bold"
                              : "text-muted-foreground font-medium",
                          )}
                        >
                          {item.label}
                        </span>
                        {/* Active dot */}
                        <span
                          className={cn(
                            "absolute -bottom-1 size-1 rounded-full bg-primary transition-all duration-300",
                            active ? "opacity-100 scale-100" : "opacity-0 scale-0",
                          )}
                          aria-hidden
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ===== DESKTOP: sidebar nav ===== */}
      <div className="mx-auto hidden max-w-7xl lg:flex lg:gap-6 lg:px-6 lg:py-6">
        <aside className="w-60 shrink-0">
          <div className="sticky top-20 space-y-4">
            {isLoading ? <GreetingSkeleton /> : greeting}

            <nav className="space-y-1 rounded-2xl border border-border bg-card p-2">
              {NAV_ITEMS.map((item) => {
                const active = tab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {active && (
                      <span className="ml-auto size-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Section
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {currentLabel}
            </h2>
          </div>

          <div className="max-w-3xl">{tabContent[tab]}</div>
        </main>
      </div>
    </div>
  );
}