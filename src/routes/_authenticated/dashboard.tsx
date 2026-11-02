import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  INVESTMENT_TERM_DAYS,
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
  const [pendingAmount, setPendingAmount] = useState<number>(
    searchAmount ?? takePendingAmount() ?? 500,
  );
  const [newAction, setNewAction] = useState<MaturityAction>("withdraw");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-investments"],
    queryFn: fetchInvestments,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: checkAdmin,
  });

  const investNow = async () => {
    setBusy(true);
    setError(null);
    try {
      await startInvestment({
        data: { amountRands: pendingAmount, maturityAction: newAction },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-investments"] });
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

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const investments = data?.investments ?? [];
  const activeCents = investments
    .filter((inv) => inv.status === "active")
    .reduce((sum, inv) => sum + inv.amount_cents, 0);
  const totalCents = investments.reduce(
    (sum, inv) => sum + inv.amount_cents,
    0,
  );
  const nextMaturity = investments
    .filter((inv) => inv.status === "active")
    .map((inv) => inv.matures_at)
    .sort()[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin" className="text-primary">
                  <ShieldCheck className="mr-2 size-4" /> Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          {data?.fullName ? `Welcome back, ${data.fullName.split(" ")[0]}` : "Your dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data?.email ?? "Your investment account"}
          {data?.memberSince
            ? ` · Member since ${formatDate(data.memberSince)}`
            : ""}
        </p>

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
            {investments.length === 0
              ? "Start your first investment"
              : "Start another investment cycle"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an amount and how you'd like it handled after the{" "}
            {INVESTMENT_TERM_DAYS}-day cycle.
          </p>

          {/* Investment slider */}
          <div className="mt-6">
            <InvestmentSlider value={pendingAmount} onChange={setPendingAmount} />
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  value: "withdraw",
                  title: "Withdraw at maturity",
                  body: `Get your capital back at the end of the ${INVESTMENT_TERM_DAYS} days.`,
                },
                {
                  value: "reinvest",
                  title: "Reinvest automatically",
                  body: "Roll into the next cycle to keep it growing.",
                },
              ] as const
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
                <p className="text-sm font-bold text-foreground">
                  {option.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.body}
                </p>
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            size="lg"
            disabled={busy}
            onClick={investNow}
            className="mt-6 w-full rounded-2xl text-base font-bold sm:w-auto"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Starting…
              </>
            ) : (
              `Invest ${formatRand(pendingAmount)}`
            )}
          </Button>
        </section>

        {/* Investment list */}
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Your investments
          </h2>
          {isLoading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : investments.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-secondary px-5 py-6 text-sm text-secondary-foreground">
              No investments yet. Use the slider above to start your first
              cycle.
            </p>
          ) : (
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
                      onClick={() => switchAction(inv.id, "withdraw")}
                    >
                      Withdraw
                    </Button>
                    <Button
                      size="sm"
                      variant={inv.maturity_action === "reinvest" ? "default" : "outline"}
                      onClick={() => switchAction(inv.id, "reinvest")}
                    >
                      Reinvest
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
