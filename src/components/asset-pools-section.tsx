import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { getAssetPools } from "@/server-fn/asset-pools";
import { ArrowRight, Bike, Car, TrendingUp, Users, Zap, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
];

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

function formatRandFromCents(cents: number) {
  return `R${Math.max(0, cents / 100).toLocaleString("en-ZA")}`;
}

function PoolCard({ pool, index = 0, delay = 0 }: { pool: any; index?: number; delay?: number }) {
  const navigate = useNavigate();
  const isPartner = (pool.tier ?? "retail") === "partner";
  const total = Number(pool.target_amount_cents ?? 0);
  const raised = Number(pool.current_amount_cents ?? 0);
  const pct = total > 0 ? Math.min(100, Math.round((raised / total) * 100)) : 0;
  const Icon = pool.vehicle_type === "vehicle" ? Car : Bike;
  const imageUrl = pool.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <FadeIn direction="up" delay={delay}>
      <div className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg",
        isPartner
          ? "border-brand-green/40 hover:border-brand-green/70 hover:shadow-brand-green/10"
          : "border-border/70 hover:border-primary/40 hover:shadow-primary/10"
      )}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={pool.title || "Listed MOTUS Capital asset"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-sm">
            {isPartner ? <Star className="size-3 text-brand-green" /> : <Bike className="size-3 text-primary" />}
            {isPartner ? "Fleet Partner" : "Retail Pool"}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Available</p>
              <p className="text-xs font-semibold">{pool.vehicle_model || pool.title}</p>
            </div>
            <span className="rounded-full bg-black/35 px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
              {pool.term_days ?? 30}d cycle
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-sm font-bold leading-snug text-foreground">
            {pool.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{pool.vehicle_model || pool.title}</p>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pool Progress</span>
              <span className={cn("font-bold", isPartner ? "text-brand-green" : "text-primary")}>
                {pct}% Funded
              </span>
            </div>
            <ProgressBar pct={pct} color={isPartner ? "green" : "primary"} />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{formatRandFromCents(raised)} raised</span>
              <span>Target {formatRandFromCents(total)}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className={cn("flex items-center gap-0.5 font-bold", isPartner ? "text-brand-green" : "text-primary")}>
              <TrendingUp className="size-3" />
              {Number(pool.return_rate_pct ?? 13)}% return
            </span>
            <span>· {pool.term_days ?? 30}d cycle</span>
            <span className="flex items-center gap-0.5">
              · <Users className="size-3" /> {pool.backers ?? 0} backers
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="size-3.5" />
              </span>
              {pool.vehicle_type === "vehicle" ? "Vehicle pool" : "Delivery pool"}
            </div>
            <Button
              size="sm"
              className={cn(
                "rounded-xl gap-1.5 font-bold",
                isPartner ? "bg-brand-green text-brand-green-foreground hover:bg-brand-green/90" : ""
              )}
              onClick={() => navigate({ to: "/signup" })}
            >
              Join Pool
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export function AssetPoolsSection() {
  const fetchPools = useServerFn(getAssetPools);
  const { data: pools = [], isLoading } = useQuery({
    queryKey: ["asset-pools-public"],
    queryFn: fetchPools,
  });

  const visiblePools = pools.filter(
    (pool: any) =>
      ["filling", "active"].includes(pool.status) &&
      (pool.title || pool.vehicle_model || pool.image_url)
  );

  return (
    <section className="border-y border-border/50 bg-gradient-to-b from-secondary/40 to-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn direction="up">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Bike className="size-3.5" />
              Asset Pools · Fund Real Vehicles
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Own a piece of every
              <br />
              <span className="text-primary underline decoration-brand-green decoration-4 underline-offset-6">
                productive vehicle
              </span>
              .
            </h2>
            <p className="leading-relaxed text-muted-foreground sm:text-lg">
              Every listed delivery motorcycle and e-hailing vehicle is added to a transparent
              funding pool. Only open and active listings appear here, with real vehicle detail,
              progress tracking, and current return information.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid max-w-2xl gap-5 sm:grid-cols-2 lg:max-w-none lg:grid-cols-2">
          <FadeIn direction="up" delay={100}>
            <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Bike className="size-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Tier 1 — Retail Rider Pool</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Built for everyday investors who want to back delivery motorcycles and commuter mobility
                from as little as <strong className="text-foreground">R100</strong>.
              </p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-green" />
                  <span>Target returns: <strong className="text-brand-green">13% – 25%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-green" />
                  <span>30 to 90-day asset cycles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-green" />
                  <span>Transparent funding and payout reporting</span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="rounded-3xl border border-brand-green/40 bg-card p-6 shadow-sm ring-1 ring-brand-green/10 transition-all hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-green/10">
                <Star className="size-6 text-brand-green" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Tier 2 — Fleet Partner Circle</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Built for investors backing higher-volume vehicle deployments with a clear performance
                profile and accelerated capital deployment.
              </p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-green" />
                  <span>Target returns: <strong className="text-brand-green">22% – 35%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-green" />
                  <span>Higher-capacity deployment blocks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-green" />
                  <span>Priority monitoring and volume reporting</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-14">
          <FadeIn direction="up">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Live listings</p>
                <h3 className="font-display text-xl font-bold text-foreground">Currently open for investment</h3>
              </div>
              {!isLoading && visiblePools.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-brand-green/15 px-3 py-1 text-xs font-bold text-brand-green">
                  <span className="size-2 animate-pulse rounded-full bg-brand-green" />
                  {visiblePools.length} active pool{visiblePools.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </FadeIn>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-border bg-card py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading listed vehicles…
            </div>
          ) : visiblePools.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              <Bike className="mx-auto mb-3 size-8 opacity-40" />
              <p className="font-display text-lg font-bold text-foreground">No vehicles are currently listed.</p>
              <p className="mt-1 text-sm">New mobility assets will appear here when they are approved for funding.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePools.map((pool: any, i: number) => (
                <PoolCard key={pool.id} pool={pool} index={i} delay={i * 120} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-14">
          <FadeIn direction="up">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Pool lifecycle</p>
              <h3 className="mt-1 font-display text-2xl font-bold text-foreground">How asset pools work</h3>
            </div>
          </FadeIn>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "1. Fund a vehicle",
                body: "Choose an open pool and contribute from as little as R100 toward an active commercial fleet asset.",
              },
              {
                icon: Users,
                title: "2. Track the fleet",
                body: "Each funded vehicle is monitored for usage, route demand, and cash generation through the lifecycle of the cycle.",
              },
              {
                icon: TrendingUp,
                title: "3. Earn at maturity",
                body: "When the cycle completes, investors receive principal plus returns into their verified bank account or can reinvest.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <FadeIn key={title} direction="up">
                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h4 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
