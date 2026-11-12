import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Bike, Car, Loader2, ShieldCheck, Star, TrendingUp, UserRoundPlus } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { getPoolShareLandingPage } from "@/server-fn/asset-pools";

export const Route = createFileRoute("/pools")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
    pool: typeof search.pool === "string" ? search.pool : undefined,
  }),
  component: PoolLandingPage,
});

function PoolLandingPage() {
  const search = Route.useSearch();
  const fetchPool = useServerFn(getPoolShareLandingPage);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pool-share-page", search.pool ?? "", search.ref ?? ""],
    queryFn: () => fetchPool({ data: { poolId: search.pool, refCode: search.ref } }),
    enabled: Boolean(search.pool || search.ref),
  });

  const pool = data?.pool;
  const referrer = data?.referrer;
  const isPartner = pool?.tier === "partner";
  const pct = pool?.target_amount_cents > 0
    ? Math.round(((pool.current_amount_cents ?? 0) / pool.target_amount_cents) * 100)
    : 0;

  return (
    <SiteShell>
      <section className="bg-gradient-to-b from-secondary/60 via-background to-background py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {isLoading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-border bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading pool…
              </div>
            </div>
          ) : error || !pool ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <Bike className="mx-auto mb-3 size-10 text-primary/60" />
              <h1 className="font-display text-3xl font-bold text-foreground">This pool is unavailable.</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask the person who shared this link to send a fresh invitation.
              </p>
              <Button asChild className="mt-6 rounded-xl">
                <Link to="/signup">Create an account</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="relative h-72 sm:h-80">
                  {pool.image_url ? (
                    <img src={pool.image_url} alt={pool.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-background">
                      {pool.vehicle_type === "vehicle" ? (
                        <Car className="size-16 text-primary/70" />
                      ) : (
                        <Bike className="size-16 text-primary/70" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                      {isPartner ? <Star className="size-3 text-brand-green" /> : <TrendingUp className="size-3 text-primary" />}
                      {isPartner ? "Fleet Partner Circle" : "Retail Rider Pool"}
                    </div>
                    <h1 className="font-display text-2xl font-bold sm:text-4xl">{pool.title}</h1>
                    <p className="mt-2 text-sm text-white/80">{pool.vehicle_model || "Mobility asset pool"}</p>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">{pool.description || "A real MOTUS Capital pool funding a productive mobility asset."}</p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target</p>
                      <p className="mt-1 font-display text-base font-bold text-foreground">
                        R{((pool.target_amount_cents ?? 0) / 100).toLocaleString("en-ZA")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Raised</p>
                      <p className="mt-1 font-display text-base font-bold text-foreground">
                        R{((pool.current_amount_cents ?? 0) / 100).toLocaleString("en-ZA")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return</p>
                      <p className="mt-1 font-display text-base font-bold text-primary">
                        {Number(pool.return_rate_pct ?? 13)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Funding progress</span>
                      <span className="font-bold text-foreground">{pct}% funded</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${isPartner ? "bg-brand-green" : "bg-primary"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                {referrer && (
                  <div className="rounded-3xl border border-brand-green/30 bg-brand-green/5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green">Shared with you</p>
                    <div className="mt-3 flex items-center gap-3">
                      {referrer.avatar_url ? (
                        <img src={referrer.avatar_url} alt={referrer.full_name ?? "Referrer"} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRoundPlus className="size-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-display text-lg font-bold text-foreground">{referrer.full_name ?? "A MOTUS Capital member"}</p>
                        <p className="text-xs text-muted-foreground">invited you to this pool</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Why this pool matters</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Back real mobility income.</h2>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 text-brand-green" /> Transparent funding and status updates.</li>
                    <li className="flex items-start gap-2"><TrendingUp className="mt-0.5 size-4 text-primary" /> Target return of {Number(pool.return_rate_pct ?? 13)}% over {pool.term_days ?? 30} days.</li>
                    <li className="flex items-start gap-2"><Bike className="mt-0.5 size-4 text-primary" /> Funding supports a working commercial vehicle or delivery motorcycle.</li>
                  </ul>

                  <div className="mt-6 space-y-2.5">
                    <Button asChild className="w-full rounded-xl gap-2">
                      <Link to="/signup">
                        Register to contribute <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <Link to="/auth">Already registered? Sign in</Link>
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
