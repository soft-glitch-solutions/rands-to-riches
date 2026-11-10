import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  getAssetPools,
  getMyPoolContributions,
  contributeToPool,
  generateShareLink,
} from "@/server-fn/asset-pools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRandFromCents } from "@/lib/investment";
import { cn } from "@/lib/utils";
import {
  Bike, Car, ArrowRight, Share2, TrendingUp, Users, Loader2,
  CheckCircle2, Clock, Star, Info, X,
} from "lucide-react";

function ProgressBar({ pct, tier }: { pct: number; tier: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          tier === "partner" ? "bg-brand-green" : "bg-primary"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    active: "bg-primary/15 text-primary border-primary/30",
    matured: "bg-brand-green/15 text-brand-green border-brand-green/30",
    withdrawn: "bg-secondary text-muted-foreground border-border",
  };
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="size-3" />,
    active: <TrendingUp className="size-3" />,
    matured: <CheckCircle2 className="size-3" />,
    withdrawn: <X className="size-3" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", cls[status] ?? cls.withdrawn)}>
      {icons[status]}
      {status}
    </span>
  );
}

// ─── Contribute Modal ───────────────────────────────────────────────────────

function ContributeModal({
  pool,
  onClose,
  onDone,
}: {
  pool: any;
  onClose: () => void;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const contribute = useServerFn(contributeToPool);
  const [amountRands, setAmountRands] = useState(
    Math.ceil(pool.min_contribution_cents / 100)
  );
  const [tier, setTier] = useState<"retail" | "partner">(pool.tier ?? "retail");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const minRands = Math.ceil(pool.min_contribution_cents / 100);
  const retPct = pool.return_rate_pct ?? 13;
  const earn = Math.round((amountRands * Number(retPct)) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const contrib = await contribute({
        data: {
          poolId: pool.id,
          amountCents: amountRands * 100,
          tier,
        },
      });
      qc.invalidateQueries({ queryKey: ["my-pool-contributions"] });
      qc.invalidateQueries({ queryKey: ["asset-pools"] });
      setDone(contrib.payment_reference ?? "");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-foreground">Join Pool</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">{pool.title}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 py-2 text-center">
            <div className="flex size-14 mx-auto items-center justify-center rounded-full bg-brand-green/15">
              <CheckCircle2 className="size-7 text-brand-green" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Contribution Submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">Reference: <code className="font-mono font-bold">{done}</code></p>
              <p className="text-xs text-muted-foreground mt-2">
                Make your EFT payment using this reference. Your slot will be confirmed once payment is verified by admin.
              </p>
            </div>
            <Button className="w-full rounded-xl" onClick={onDone}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

            <div className="space-y-1">
              <Label>Amount (R)</Label>
              <Input
                type="number"
                min={minRands}
                value={amountRands}
                onChange={(e) => setAmountRands(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Minimum R{minRands}</p>
            </div>

            {/* Tier selector */}
            <div className="grid grid-cols-2 gap-2">
              {(["retail", "partner"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={cn(
                    "rounded-xl border p-2.5 text-left transition-colors",
                    tier === t
                      ? t === "partner"
                        ? "border-brand-green bg-brand-green/10"
                        : "border-primary bg-primary/10"
                      : "border-border bg-secondary/40"
                  )}
                >
                  <p className="text-xs font-bold text-foreground">
                    {t === "retail" ? "🏍 Retail" : "⭐ Fleet Partner"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t === "retail" ? "13%–25%" : "35%"} return
                  </p>
                </button>
              ))}
            </div>

            {/* Projection */}
            <div className="rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your stake</span>
                <span className="font-semibold">R{amountRands.toLocaleString("en-ZA")}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Est. return ({retPct}%)</span>
                <span className="font-semibold text-brand-green">+R{earn.toLocaleString("en-ZA")}</span>
              </div>
              <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between">
                <span className="font-semibold text-muted-foreground">Total at maturity</span>
                <span className="font-bold text-foreground">R{(amountRands + earn).toLocaleString("en-ZA")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="sm" className="flex-1 gap-1.5" disabled={busy}>
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
                Confirm Stake
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Pool card (dashboard) ──────────────────────────────────────────────────

function DashPoolCard({ pool, onContribute }: { pool: any; onContribute: (pool: any) => void }) {
  const sharePoolFn = useServerFn(generateShareLink);
  const pct = pool.target_amount_cents > 0
    ? Math.round((pool.current_amount_cents / pool.target_amount_cents) * 100)
    : 0;
  const Icon = pool.vehicle_type === "motorcycle" ? Bike : Car;
  const isPartner = pool.tier === "partner";

  const handleShare = async () => {
    try {
      const { shareUrl } = await sharePoolFn({ data: { poolId: pool.id } });
      await navigator.share?.({ title: pool.title, url: shareUrl }) ??
        navigator.clipboard.writeText(shareUrl);
    } catch {
      // silent
    }
  };

  return (
    <div className={cn(
      "rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
      isPartner
        ? "border-brand-green/30 hover:border-brand-green/60"
        : "border-border/70 hover:border-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            isPartner ? "bg-brand-green/10" : "bg-primary/10"
          )}>
            <Icon className={cn("size-4", isPartner ? "text-brand-green" : "text-primary")} />
          </div>
          <div>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              isPartner ? "text-brand-green" : "text-primary"
            )}>
              {isPartner ? "Fleet Partner Circle" : "Retail Rider Pool"}
            </span>
            <h4 className="font-display text-sm font-bold text-foreground leading-tight">{pool.title}</h4>
          </div>
        </div>
        {isPartner && <Star className="size-4 shrink-0 text-brand-green" />}
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className={cn("font-bold", isPartner ? "text-brand-green" : "text-primary")}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} tier={pool.tier} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatRandFromCents(pool.current_amount_cents)}</span>
          <span>{formatRandFromCents(pool.target_amount_cents)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mb-3">
        <span className={cn("font-bold", isPartner ? "text-brand-green" : "text-primary")}>
          <TrendingUp className="inline size-3 mr-0.5" />{pool.return_rate_pct}% return
        </span>
        <span>· {pool.term_days}d cycle</span>
        <span>· min {formatRandFromCents(pool.min_contribution_cents)}</span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 rounded-xl gap-1 text-xs"
          onClick={() => onContribute(pool)}
        >
          <ArrowRight className="size-3" />
          Join Pool
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-xl gap-1 text-xs text-muted-foreground"
          onClick={handleShare}
        >
          <Share2 className="size-3" />
          Share
        </Button>
      </div>
    </div>
  );
}

// ─── My contribution card ───────────────────────────────────────────────────

function MyContribCard({ contrib }: { contrib: any }) {
  const pool = contrib.asset_pools;
  const pct = pool?.target_amount_cents > 0
    ? Math.round((pool.current_amount_cents / pool.target_amount_cents) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold text-foreground truncate">
            {pool?.title ?? "Pool"}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            ref: {contrib.payment_reference ?? "—"}
          </p>
        </div>
        <StatusChip status={contrib.status} />
      </div>

      {pool && (
        <div className="mb-2 space-y-1">
          <ProgressBar pct={pct} tier={pool.tier ?? "retail"} />
          <p className="text-[10px] text-muted-foreground">{pool.title} · {pct}% funded</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        <span>
          Staked: <strong className="text-foreground">{formatRandFromCents(contrib.amount_cents)}</strong>
        </span>
        {contrib.payout_amount_cents && (
          <span>
            Payout: <strong className="text-brand-green">{formatRandFromCents(contrib.payout_amount_cents)}</strong>
          </span>
        )}
        {contrib.matures_at && (
          <span className="text-muted-foreground">
            Matures: {new Date(contrib.matures_at).toLocaleDateString("en-ZA")}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main exported tab ──────────────────────────────────────────────────────

export function DashboardPoolsTab() {
  const fetchPools = useServerFn(getAssetPools);
  const fetchMyContribs = useServerFn(getMyPoolContributions);
  const [contributePool, setContributePool] = useState<any | null>(null);

  const { data: pools = [], isLoading: poolsLoading } = useQuery({
    queryKey: ["asset-pools"],
    queryFn: fetchPools,
  });

  const { data: myContribs = [], isLoading: contribsLoading } = useQuery({
    queryKey: ["my-pool-contributions"],
    queryFn: fetchMyContribs,
  });

  if (poolsLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading pools…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Open pools */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asset Pools</p>
            <h2 className="font-display text-base font-bold text-foreground">Open for investment</h2>
          </div>
          {pools.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-brand-green/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-green">
              <span className="size-1.5 animate-pulse rounded-full bg-brand-green" />
              {pools.length} open
            </span>
          )}
        </div>

        {pools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-muted-foreground">
            <Bike className="mx-auto mb-2 size-8 opacity-40" />
            <p className="text-sm">No open pools right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pools.map((pool: any) => (
              <DashPoolCard key={pool.id} pool={pool} onContribute={setContributePool} />
            ))}
          </div>
        )}
      </section>

      {/* Info callout */}
      <div className="flex gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
        <Info className="size-4 shrink-0 text-primary mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How pools work:</strong> Contribute to a pool, make an EFT payment with your reference, and once confirmed by admin your stake is activated. At maturity, you receive principal + returns in a single lump-sum payout.
        </p>
      </div>

      {/* My contributions */}
      {myContribs.length > 0 && (
        <section>
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">My Pool Stakes</p>
            <h2 className="font-display text-base font-bold text-foreground">Your contributions</h2>
          </div>
          <div className="space-y-3">
            {contribsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : (
              myContribs.map((c: any) => <MyContribCard key={c.id} contrib={c} />)
            )}
          </div>
        </section>
      )}

      {/* Contribute modal */}
      {contributePool && (
        <ContributeModal
          pool={contributePool}
          onClose={() => setContributePool(null)}
          onDone={() => setContributePool(null)}
        />
      )}
    </div>
  );
}
