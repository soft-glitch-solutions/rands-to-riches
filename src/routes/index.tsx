import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InvestmentSlider } from "@/components/investment-slider";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import { supabase } from "@/integrations/supabase/client";
import { takePendingAmount } from "@/lib/social-auth";
import {
  clampInvestment,
  formatRand,
} from "@/lib/investment";
import heroImage from "@/assets/motus-hero.jpg";
import { ArrowRight, ShieldCheck, TrendingUp, Users, Car, CheckCircle2 } from "lucide-react";
import { AssetPoolsSection } from "@/components/asset-pools-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MOTUS Capital — Mobility & E-Hailing Fleet Investments South Africa" },
      {
        name: "description",
        content:
          "Invest from R100 in South Africa's high-demand e-hailing and delivery fleet. Earn 13% to 25% returns across 30 to 90-day cycles with monthly payouts.",
      },
      { property: "og:title", content: "MOTUS Capital — Fleet Investments with 13%–25% Returns" },
      {
        property: "og:description",
        content:
          "Turn your spare Rands into wealth by funding productive e-hailing vehicles and delivery motorcycles in South Africa.",
      },
      { property: "og:url", content: "https://motuscapital.co.za/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FinancialProduct",
          "name": "MOTUS Fleet Mobility Investment",
          "provider": {
            "@type": "FinancialService",
            "name": "MOTUS Capital",
            "url": "https://motuscapital.co.za",
          },
          "description":
            "Retail micro-investments in commercial e-hailing vehicles and delivery bikes offering 13% to 25% returns across 30 to 90-day cycles.",
          "annualPercentageRate": "13% - 25%",
          "feesAndCommissionsSpecification": "Zero account keeping fees",
          "amount": {
            "@type": "MonetaryAmount",
            "currency": "ZAR",
            "minValue": 100,
            "maxValue": 10000,
          },
        }),
      },
    ],
  }),
  component: Index,
});

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Invest",
    body: "Make mobility investments accessible from R100. Pool everyday capital into high-yield productive fleet assets.",
  },
  {
    icon: Car,
    title: "Mobilise",
    body: "Put capital directly into commercial e-hailing cars and delivery motorcycles that generate active daily road revenue.",
  },
  {
    icon: Users,
    title: "Empower",
    body: "Support vetted local drivers and delivery riders with reliable income-generating opportunities and vehicle access.",
  },
];

const STEPS = [
  "Investors contribute capital, starting from R100 up to R10,000 depending on their chosen cycle.",
  "Pooled funds are deployed into fully insured, telematics-tracked commercial vehicles and motorcycles.",
  "Vehicles enter commercial operations with professional drivers on South Africa's leading platforms.",
  "The vehicle operations generate daily cash flow from commuter fares and logistics deliveries.",
  "At maturity (30, 60 or 90 days), investors withdraw capital plus target returns (13%–25%) directly to their bank account, or reinvest.",
];

function Index() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(500);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isOAuthReturn =
      hash.includes("access_token=") ||
      hash.includes("refresh_token=") ||
      search.includes("code=") ||
      sessionStorage.getItem("motus:oauth-in-progress") === "true";

    if (isOAuthReturn) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          sessionStorage.removeItem("motus:oauth-in-progress");
          const pendingAmount = takePendingAmount();
          navigate({
            to: "/dashboard",
            replace: true,
            search: pendingAmount ? { amount: pendingAmount } : undefined,
          });
        }
      });
    }
  }, [navigate]);

  const startInvestment = () => {
    navigate({ to: "/signup", search: { amount: clampInvestment(amount) } });
  };

  return (
    <SiteShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left Hero Content with Fade Animations */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/80 px-4 py-1.5 text-xs font-semibold text-accent-foreground animate-fade-down shadow-xs">
              <span className="size-2 rounded-full bg-brand-green animate-pulse" />
              Invest in Mobility · Create Real Opportunity
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-up delay-100">
              Put your money in <span className="text-primary underline decoration-brand-green decoration-4 underline-offset-6">motion</span>.
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground animate-fade-up delay-200">
              Invest in South Africa&apos;s fast-growing e-hailing and delivery fleet.
              Help power the vehicles that keep commuters and commerce moving —
              starting from just <strong className="text-foreground">R100</strong> with returns of{" "}
              <strong className="text-brand-green">13% to 25%</strong>.
            </p>

            {/* Stat Counters with staggered entry */}
            <div className="grid max-w-md grid-cols-3 gap-3 text-center animate-fade-up delay-300">
              <div className="rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-xs transition-transform hover:-translate-y-1">
                <p className="font-display text-xl font-bold text-primary sm:text-2xl">
                  R100
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Minimum Start
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-xs transition-transform hover:-translate-y-1">
                <p className="font-display text-xl font-bold text-primary sm:text-2xl">
                  30–90d
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Flexible Cycles
                </p>
              </div>
              <div className="rounded-2xl border border-brand-green/30 bg-accent/30 p-3.5 shadow-xs transition-transform hover:-translate-y-1">
                <p className="font-display text-xl font-bold text-brand-green sm:text-2xl">
                  13%–25%
                </p>
                <p className="mt-0.5 text-xs font-semibold text-accent-foreground">
                  Target Returns
                </p>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2 animate-fade-up delay-400">
              <Button
                size="lg"
                onClick={startInvestment}
                className="gap-2 rounded-2xl px-6 font-bold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Investing Today</span>
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate({ to: "/demo" })}
                className="rounded-2xl font-semibold border-border hover:bg-secondary"
              >
                Explore Live Demo
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground animate-fade-up delay-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-brand-green" />
                <span>Asset-Backed Fleet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-brand-green" />
                <span>Zero Account Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-brand-green" />
                <span>Direct EFT Payouts</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Image + Calculator Card */}
          <div className="space-y-6 animate-scale-in delay-200">
            <div className="relative group overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
              <img
                src={heroImage}
                alt="MOTUS Capital e-hailing vehicles and logistics fleet in South Africa"
                loading="eager"
                fetchPriority="high"
                width={800}
                height={450}
                className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white drop-shadow-md">
                <span className="font-semibold">Active Fleet: Johannesburg & Pretoria</span>
                <span className="rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-xs">100% Insured</span>
              </div>
            </div>

            {/* Slider Widget */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
              <div className="mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Calculate your investment
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust your amount to see returns across 1, 2 or 3-month cycles.
                </p>
              </div>

              <InvestmentSlider value={amount} onChange={setAmount} />

              <Button
                size="lg"
                onClick={startInvestment}
                className="mt-6 w-full rounded-2xl text-base font-bold shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Start with {formatRand(amount)}
              </Button>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                Cycles from 30 to 90 days · Withdraw or reinvest at maturity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-secondary/60 py-16 sm:py-20 border-y border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Pillars</span>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Invest. Mobilise. Empower.
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                Our model bridges individual South African capital with real-world mobility demand.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <FadeIn key={pillar.title} direction="up" delay={i * 150}>
                  <div className="group rounded-3xl bg-card p-6 shadow-sm border border-border/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/30">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {pillar.body}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Asset Pools & Fleet Partner Section */}
      <AssetPoolsSection />

      {/* How it Works Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <FadeIn direction="up">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple Lifecycle</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              How MOTUS Capital works
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">
              A clear, transparent lifecycle where your capital is linked to active, earning mobility assets.
            </p>

            <ol className="mt-8 space-y-4">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-4 items-start p-3 rounded-2xl transition-colors hover:bg-secondary/40">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-sm font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground sm:text-base pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </FadeIn>

          <FadeIn direction="scale" delay={200}>
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green">Socio-Economic Impact</span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                More than just vehicles
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every Rand invested puts another commercial vehicle or delivery bike on South African roads, creating sustainable livelihoods for local drivers and riders.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "More commercial vehicles available to drivers and delivery riders.",
                  "Opportunities for breadwinners who need vehicle access to earn daily income.",
                  "Transparent fleet telemetry tracking mileage, trips, and vehicle health.",
                  "Asset-backed vehicle portfolio fully comprehensively insured.",
                  "Direct monthly EFT payouts to your verified South African bank account.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-green" />
                    <p className="text-sm leading-relaxed text-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: "/about" })}
                  className="rounded-2xl w-full font-semibold border-border hover:bg-secondary"
                >
                  Read our Story & Mission
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Bottom CTA with Glow */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <FadeIn direction="up">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16 shadow-xl shadow-primary/20">
            {/* Background design elements */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-brand-green/20 blur-2xl" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Ready to put your money in motion?
              </h2>
              <p className="text-sm text-primary-foreground/90 sm:text-base leading-relaxed">
                Choose a 1-month plan for 13%–20% returns, or a 2 to 3-month growth plan for 20%–25%.
                Withdraw capital and returns automatically at maturity, or compound into the next cycle.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={startInvestment}
                  className="rounded-2xl px-8 font-bold text-base shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all"
                >
                  Start Investing from R100
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: "/faq" })}
                  className="rounded-2xl px-6 font-semibold bg-primary-foreground/10 border-white/20 text-primary-foreground hover:bg-white/20"
                >
                  Frequently Asked Questions
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </SiteShell>
  );
}
