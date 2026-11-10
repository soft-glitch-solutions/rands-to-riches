import { useNavigate } from "@tanstack/react-router";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bike, Car, Share2, TrendingUp, Users, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

function ProgressBar({ pct, color = "primary" }: { pct: number; color?: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000",
          color === "green" ? "bg-brand-green" : "bg-primary"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function fmt(rand: number) {
  return `R${rand.toLocaleString("en-ZA")}`;
}

// Demo pool data for the homepage
const DEMO_POOLS = [
  {
    id: "1",
    icon: Bike,
    label: "RETAIL RIDER POOL",
    title: "Honda CB125F — Delivery Pool #4",
    model: "Honda CB125F · Delivery Motorcycle",
    targetRands: 13000,
    raisedRands: 8840,
    returnPct: "13% – 25%",
    termDays: 30,
    tier: "retail",
    backers: 24,
    color: "primary",
  },
  {
    id: "2",
    icon: Car,
    label: "FLEET PARTNER CIRCLE",
    title: "Toyota Corolla Quest — Ride-Share Pool #7",
    model: "Toyota Corolla Quest · E-Hailing",
    targetRands: 60000,
    raisedRands: 51000,
    returnPct: "35%",
    termDays: 60,
    tier: "partner",
    backers: 8,
    color: "green",
  },
  {
    id: "3",
    icon: Bike,
    label: "RETAIL RIDER POOL",
    title: "Yamaha YBR125 — Last-Mile Pool #12",
    model: "Yamaha YBR125 · Courier Motorcycle",
    targetRands: 11500,
    raisedRands: 3200,
    returnPct: "13% – 25%",
    termDays: 30,
    tier: "retail",
    backers: 11,
    color: "primary",
  },
];

function PoolCard({ pool, delay = 0 }: { pool: (typeof DEMO_POOLS)[number]; delay?: number }) {
  const navigate = useNavigate();
  const pct = Math.round((pool.raisedRands / pool.targetRands) * 100);
  const Icon = pool.icon;

  return (
    <FadeIn direction="up" delay={delay}>
      <div className={cn(
        "group relative rounded-3xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg",
        pool.tier === "partner"
          ? "border-brand-green/40 hover:border-brand-green/70 hover:shadow-brand-green/10"
          : "border-border/70 hover:border-primary/40 hover:shadow-primary/10"
      )}>
        {/* Tier badge */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            pool.tier === "partner"
              ? "bg-brand-green/15 text-brand-green"
              : "bg-primary/10 text-primary"
          )}>
            {pool.tier === "partner" ? <Star className="size-3" /> : <Bike className="size-3" />}
            {pool.label}
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Icon className={cn("size-5", pool.tier === "partner" ? "text-brand-green" : "text-primary")} />
          </div>
        </div>

        <h3 className="font-display text-sm font-bold leading-snug text-foreground">
          {pool.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{pool.model}</p>

        {/* Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Pool Progress</span>
            <span className={cn("font-bold", pool.tier === "partner" ? "text-brand-green" : "text-primary")}>
              {pct}% Funded
            </span>
          </div>
          <ProgressBar pct={pct} color={pool.tier === "partner" ? "green" : "primary"} />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{fmt(pool.raisedRands)} raised</span>
            <span>Target {fmt(pool.targetRands)}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className={cn(
            "flex items-center gap-0.5 font-bold",
            pool.tier === "partner" ? "text-brand-green" : "text-primary"
          )}>
            <TrendingUp className="size-3" />
            {pool.returnPct} return
          </span>
          <span>· {pool.termDays}d cycle</span>
          <span className="flex items-center gap-0.5">
            · <Users className="size-3" /> {pool.backers} backers
          </span>
          <span>· R600/wk revenue</span>
        </div>

        <Button
          size="sm"
          className={cn(
            "mt-4 w-full rounded-xl gap-1.5 font-bold",
            pool.tier === "partner"
              ? "bg-brand-green text-brand-green-foreground hover:bg-brand-green/90"
              : ""
          )}
          onClick={() => navigate({ to: "/signup" })}
        >
          Join Pool
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </FadeIn>
  );
}

export function AssetPoolsSection() {
  const navigate = useNavigate();
  return (
    <section className="border-y border-border/50 bg-gradient-to-b from-secondary/40 to-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <FadeIn direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Bike className="size-3.5" />
              Asset Pools · Fund Real Vehicles
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Own a piece of every<br />
              <span className="text-primary underline decoration-brand-green decoration-4 underline-offset-6">productive vehicle</span>.
            </h2>
            <p className="text-muted-foreground leading-relaxed sm:text-lg">
              Every delivery motorcycle and e-hailing vehicle opens its own transparent funding pool.
              Contribute from R100, watch the progress bar fill, and earn returns once the vehicle hits the road.
            </p>
          </div>
        </FadeIn>

        {/* Dual-tier cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto">
          <FadeIn direction="up" delay={100}>
            <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Bike className="size-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Tier 1 — Retail Rider Pool</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Accessible from <strong className="text-foreground">R100</strong>. Designed for everyday retail investors and community micro-allocations. Pool together to fund delivery motorcycles.
              </p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-green shrink-0" />
                  <span>Target returns: <strong className="text-brand-green">13% – 25%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-green shrink-0" />
                  <span>30 to 90-day asset cycles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-green shrink-0" />
                  <span>Community sharing &amp; virality features</span>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={200}>
            <div className="rounded-3xl border border-brand-green/40 bg-card p-6 shadow-sm hover:shadow-md transition-all ring-1 ring-brand-green/10">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-green/10 mb-4">
                <Star className="size-6 text-brand-green" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Tier 2 — Fleet Partner Circle</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For premier participants who accelerate entire asset deployment blocks, earning higher yield in exchange for lower admin overhead per capital rand.
              </p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-green shrink-0" />
                  <span>Target returns: <strong className="text-brand-green">35%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-green shrink-0" />
                  <span>Accelerated pool deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-green shrink-0" />
                  <span>Priority vehicle assignment &amp; reporting</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Live pool demo cards */}
        <div className="mt-14">
          <FadeIn direction="up">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Live Pools</p>
                <h3 className="font-display text-xl font-bold text-foreground">Currently filling</h3>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-brand-green/15 px-3 py-1 text-xs font-bold text-brand-green">
                <span className="size-2 animate-pulse rounded-full bg-brand-green" />
                3 open pools
              </span>
            </div>
          </FadeIn>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_POOLS.map((pool, i) => (
              <PoolCard key={pool.id} pool={pool} delay={i * 120} />
            ))}
          </div>
        </div>

        {/* How it works row */}
        <div className="mt-14">
          <FadeIn direction="up">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Pool Lifecycle</p>
              <h3 className="font-display text-2xl font-bold text-foreground mt-1">How Asset Pools work</h3>
            </div>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Pool Opens",
                body: "A vehicle asset pool launches with a funding target — e.g. R13,000 for a delivery motorcycle.",
              },
              {
                step: "02",
                icon: Users,
                title: "Community Contributes",
                body: "Investors stake from R100. Share the pool link to accelerate contributions and reach 100% faster.",
              },
              {
                step: "03",
                icon: Car,
                title: "Vehicle Deployed",
                body: "At 100% funded, the pool locks. The motorcycle hits the road generating R600/week rental revenue.",
              },
              {
                step: "04",
                icon: TrendingUp,
                title: "Lump-Sum Payout",
                body: "On maturity, each contributor receives their principal plus tier-specific returns in a single payment.",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.step} direction="up" delay={i * 100}>
                  <div className="rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-display text-2xl font-black text-primary/20">{s.step}</span>
                      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                    </div>
                    <h4 className="font-display font-bold text-foreground">{s.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <FadeIn direction="up">
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: "/signup" })}
              className="gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Explore Asset Pools
              <ArrowRight className="size-4" />
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Invest from R100 · Retail &amp; Fleet Partner tiers · Lump-sum payout at maturity
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
