import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { InvestmentSlider } from "@/components/investment-slider";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import { supabase } from "@/integrations/supabase/client";
import { takePendingAmount } from "@/lib/social-auth";
import { clampInvestment, formatRand } from "@/lib/investment";
import heroImage from "@/assets/motus-hero.jpg";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Car,
  CheckCircle2,
  Bike,
  Truck,
  Zap,
  Crown,
  Star,
  Radio,
} from "lucide-react";
import { AssetPoolsSection } from "@/components/asset-pools-section";

const bikeImage =
  "https://images.pexels.com/photos/36547280/pexels-photo-36547280.jpeg?auto=compress&cs=tinysrgb&w=800";

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
          name: "MOTUS Fleet Mobility Investment",
          provider: {
            "@type": "FinancialService",
            name: "MOTUS Capital",
            url: "https://motuscapital.co.za",
          },
          description:
            "Retail micro-investments in commercial e-hailing vehicles and delivery bikes offering 13% to 25% returns across 30 to 90-day cycles.",
          annualPercentageRate: "13% - 25%",
          feesAndCommissionsSpecification: "Zero account keeping fees",
          amount: { "@type": "MonetaryAmount", currency: "ZAR", minValue: 100, maxValue: 10000 },
        }),
      },
    ],
  }),
  component: Index,
});

// ============================================================
// DATA
// ============================================================

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Invest",
    body: "Make mobility investments accessible from R100. Pool everyday capital into high-yield productive fleet assets.",
    color: "bg-blue-100",
    textColor: "text-blue-900",
    tag: "Easy Entry",
  },
  {
    icon: Car,
    title: "Mobilise",
    body: "Put capital directly into commercial e-hailing cars and delivery motorcycles that generate active daily road revenue.",
    color: "bg-[#EAFF00]",
    textColor: "text-black",
    tag: "Active Fleet",
  },
  {
    icon: Users,
    title: "Empower",
    body: "Support vetted local drivers and delivery riders with reliable income-generating opportunities and vehicle access.",
    color: "bg-purple-100",
    textColor: "text-purple-900",
    tag: "Real Impact",
  },
];

const STEPS = [
  "Investors contribute capital, starting from R100 up to R10,000 depending on their chosen cycle.",
  "Pooled funds are deployed into fully insured, telematics-tracked commercial vehicles and motorcycles.",
  "Vehicles enter commercial operations with professional drivers on South Africa's leading platforms.",
  "The vehicle operations generate daily cash flow from commuter fares and logistics deliveries.",
  "At maturity (30, 60 or 90 days), investors withdraw capital plus target returns (13%–25%) directly to their bank account, or reinvest.",
];

const IMPACT_ITEMS = [
  "More commercial vehicles available to drivers and delivery riders.",
  "Opportunities for breadwinners who need vehicle access to earn daily income.",
  "Transparent fleet telemetry tracking mileage, trips, and vehicle health.",
  "Asset-backed vehicle portfolio fully comprehensively insured.",
  "Direct monthly EFT payouts to your verified South African bank account.",
];

const POOLS = [
  {
    title: "E-Hailing Cars",
    body: "Sedans and hatchbacks running on Bolt, Uber and inDrive across Johannesburg, Pretoria and Cape Town.",
    tag: "13%–20%",
    color: "bg-blue-100",
    textColor: "text-blue-900",
    icon: Car,
    image: null,
  },
  {
    title: "Delivery Bikes",
    body: "Motorcycles operating on Mr D, Uber Eats and Bolt Food, generating daily short-cycle cash flow across South African cities.",
    tag: "18%–25%",
    color: "bg-[#EAFF00]",
    textColor: "text-black",
    icon: Bike,
    image: bikeImage,
  },
  {
    title: "Logistics Vans",
    body: "Panel vans servicing last-mile parcel and courier routes with stable B2B contracts.",
    tag: "15%–22%",
    color: "bg-purple-100",
    textColor: "text-purple-900",
    icon: Truck,
    image: null,
  },
];

const TIERS = [
  {
    tier: "Tier 1",
    name: "Retail Rider Pool",
    description:
      "Built for everyday investors who want to back delivery motorcycles and commuter mobility from as little as R100.",
    returns: "13% – 25%",
    features: [
      "30 to 90-day asset cycles",
      "Transparent funding and payout reporting",
      "Start from just R100",
    ],
    icon: Star,
    accent: "bg-accent",
    accentText: "text-accent-foreground",
    badge: "bg-brand-green text-black",
  },
  {
    tier: "Tier 2",
    name: "Fleet Partner Circle",
    description:
      "Built for investors backing higher-volume vehicle deployments with a clear performance profile and accelerated capital deployment.",
    returns: "22% – 35%",
    features: [
      "Higher-capacity deployment blocks",
      "Priority monitoring and volume reporting",
      "Dedicated fleet partner support",
    ],
    icon: Crown,
    accent: "bg-primary",
    accentText: "text-primary-foreground",
    badge: "bg-primary text-primary-foreground",
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

function Index() {
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
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
      <AnimatedBackground prefersReduced={!!prefersReduced} />
      <BlueFlowTransition />

      <HeroScene
        amount={amount}
        setAmount={setAmount}
        startInvestment={startInvestment}
        navigate={navigate}
        prefersReduced={!!prefersReduced}
      />

      <PillarsScene prefersReduced={!!prefersReduced} />

      {/* Scene 3 — Asset Pools (categories only — no listings) */}
      <AssetPoolsScene navigate={navigate} prefersReduced={!!prefersReduced} />

      {/* Scene 4 — Live Listings (its own scene now) */}
      <LiveListingsScene navigate={navigate} prefersReduced={!!prefersReduced} />

      <TiersScene navigate={navigate} prefersReduced={!!prefersReduced} />

      <HowItWorksScene navigate={navigate} prefersReduced={!!prefersReduced} />

      <CtaScene
        startInvestment={startInvestment}
        navigate={navigate}
        prefersReduced={!!prefersReduced}
      />
    </SiteShell>
  );
}

// ============================================================
// BLUE FLOW TRANSITION
// ============================================================

function BlueFlowTransition() {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      <motion.div
        className="absolute -left-[20%] top-0 h-[60vh] w-[60vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.14) 0%, transparent 70%)",
        }}
        animate={{ y: ["0%", "40%", "0%"], x: ["0%", "10%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[20%] top-[30vh] h-[70vh] w-[50vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.10) 0%, transparent 70%)",
        }}
        animate={{ y: ["0%", "-30%", "0%"], x: ["0%", "-8%", "0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================================
// SCENE 1 — HERO
// ============================================================

function HeroScene({
  amount,
  setAmount,
  startInvestment,
  navigate,
  prefersReduced,
}: {
  amount: number;
  setAmount: (n: number) => void;
  startInvestment: () => void;
  navigate: ReturnType<typeof useNavigate>;
  prefersReduced: boolean;
}) {
  return (
    <ScrollScene
      id="hero"
      bg="bg-background"
      trackHeight="h-auto min-h-screen lg:h-[180vh]"
      ghostText="MOTUS"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: -40 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
                <span className="size-2 rounded-full bg-brand-green animate-pulse" />
                Invest in Mobility · Create Real Opportunity
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.05]">
                Put your money in{" "}
                <span className="relative inline-block text-primary">
                  motion
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-brand-green opacity-90"
                  />
                </span>
                .
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Invest in South Africa&apos;s fast-growing e-hailing and delivery fleet.
                Help power the vehicles that keep commuters and commerce moving — starting
                from just <strong className="text-foreground">R100</strong> with returns of{" "}
                <strong className="text-brand-green">13% to 25%</strong>.
              </p>

              <div className="grid max-w-md grid-cols-3 gap-2 sm:gap-3 text-center">
                <GlowCard>
                  <p className="font-display text-lg font-bold text-primary sm:text-2xl">R100</p>
                  <p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
                    Minimum Start
                  </p>
                </GlowCard>
                <GlowCard>
                  <p className="font-display text-lg font-bold text-primary sm:text-2xl">30–90d</p>
                  <p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
                    Flexible Cycles
                  </p>
                </GlowCard>
                <GlowCard accent>
                  <p className="font-display text-lg font-bold text-brand-green sm:text-2xl">
                    13%–25%
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-accent-foreground sm:text-xs">
                    Target Returns
                  </p>
                </GlowCard>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={startInvestment}
                  className="gap-2 rounded-full px-6 py-6 font-bold text-base shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Start Investing Today</span>
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate({ to: "/demo" })}
                  className="rounded-full px-6 py-6 font-semibold text-base border-border hover:bg-secondary"
                >
                  Explore Live Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-muted-foreground sm:text-xs">
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
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: 40 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="relative group overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-xl shadow-primary/10 border border-border/50">
                <img
                  src={heroImage}
                  alt="MOTUS Capital e-hailing vehicles and logistics fleet in South Africa"
                  loading="eager"
                  fetchPriority="high"
                  width={800}
                  height={450}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs sm:text-sm font-medium text-white drop-shadow-md">
                  <span>Active Fleet: Johannesburg &amp; Pretoria</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 sm:px-3 sm:py-1 backdrop-blur-md">
                    100% Insured
                  </span>
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-[2rem] border border-border bg-card p-4 shadow-xl shadow-primary/5 sm:p-8">
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground sm:text-2xl">
                    Calculate your investment
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Adjust your amount to see returns across 1, 2 or 3-month cycles.
                  </p>
                </div>

                <InvestmentSlider value={amount} onChange={setAmount} />

                <Button
                  size="lg"
                  onClick={startInvestment}
                  className="mt-5 w-full rounded-full py-5 text-sm font-bold shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all sm:py-6 sm:text-base"
                >
                  Start with {formatRand(amount)}
                </Button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground sm:text-xs">
                  Cycles from 30 to 90 days · Withdraw or reinvest at maturity
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 2 — PILLARS
// ============================================================

function PillarsScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <ScrollScene
      id="pillars"
      bg="bg-secondary/60"
      trackHeight="h-auto min-h-screen lg:h-[160vh]"
      ghostText="PILLARS"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="Core Pillars"
          title="Invest. Mobilise."
          accentWord="Empower."
          accentColor="text-brand-green"
        />

        <div className="hidden lg:flex items-stretch justify-center gap-6">
          {PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.title} pillar={pillar} index={i} prefersReduced={prefersReduced} />
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              className={i === 2 ? "sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full" : ""}
            >
              <PillarCard pillar={pillar} index={i} prefersReduced={prefersReduced} />
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollScene>
  );
}

function PillarCard({
  pillar,
  index,
  prefersReduced,
}: {
  pillar: (typeof PILLARS)[number];
  index: number;
  prefersReduced: boolean;
}) {
  const Icon = pillar.icon;
  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full bg-card rounded-[1.75rem] p-3 shadow-xl border border-border/60"
    >
      <div
        className={`w-full h-40 sm:h-48 rounded-[1.25rem] ${pillar.color} relative overflow-hidden flex items-center justify-center p-6`}
      >
        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1 text-[10px] font-bold text-black shadow-sm sm:text-xs">
          {pillar.tag}
        </div>
        <div className="flex flex-col items-center justify-center text-center space-y-2 relative z-10">
          <div
            className={`size-14 sm:size-16 rounded-full bg-white/50 flex items-center justify-center shadow-inner ${pillar.textColor}`}
          >
            <Icon className="size-7 sm:size-8" />
          </div>
          <h3
            className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${pillar.textColor}`}
          >
            {pillar.title}
          </h3>
        </div>
      </div>
      <div className="p-4 sm:p-5 pt-5">
        <p className="text-sm leading-relaxed text-muted-foreground font-medium">
          {pillar.body}
        </p>
        <div className="mt-4 flex items-center text-sm font-bold text-foreground group cursor-pointer">
          Learn more
          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// SCENE 3 — ASSET POOLS (categories only, no listings)
// ============================================================

function AssetPoolsScene({
  navigate,
  prefersReduced,
}: {
  navigate: ReturnType<typeof useNavigate>;
  prefersReduced: boolean;
}) {
  return (
    <ScrollScene
      id="asset-pools"
      bg="bg-background"
      trackHeight="h-auto min-h-screen lg:h-[170vh]"
      ghostText="POOLS"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="Asset Classes"
          title="Choose your"
          accentWord="pool"
          accentColor="text-brand-green"
          description="Each pool funds a distinct fleet asset class with its own return profile and cycle length."
        />

        <CarouselRail>
          {POOLS.map((pool, i) => (
            <motion.div
              key={pool.title}
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              className="snap-start shrink-0 w-[280px] sm:w-[320px]"
            >
              <PlayfulCard
                title={pool.title}
                body={pool.body}
                tag={pool.tag}
                colorClass={pool.color}
                textColorClass={pool.textColor}
                icon={<pool.icon className="size-7" />}
                image={pool.image}
                ctaLabel="View pool"
                onCta={() => navigate({ to: "/dashboard" })}
              />
            </motion.div>
          ))}
        </CarouselRail>

        <FadeIn direction="up" delay={200}>
          <div className="mt-12 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-full px-8 py-5 font-semibold border-border hover:bg-secondary"
            >
              Browse all pools
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </FadeIn>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 4 — LIVE LISTINGS (formerly buried in AssetPoolsSection)
// ============================================================

function LiveListingsScene({
  navigate,
  prefersReduced,
}: {
  navigate: ReturnType<typeof useNavigate>;
  prefersReduced: boolean;
}) {
  return (
    <ScrollScene
      id="live-listings"
      bg="bg-secondary/40"
      trackHeight="h-auto"
      ghostText="LIVE"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        {/* Live indicator + header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-green/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-green mb-4">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-green" />
              </span>
              Live now
            </div>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
              Currently{" "}
              <span className="relative inline-block text-brand-green">
                open
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-brand-green opacity-90"
                />
              </span>{" "}
              for investment
            </h2>
            <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Real vehicles, real drivers, real revenue — every listing below is a
              specific physical asset currently being funded. Watch the progress bars
              fill in real-time and grab a stake before each pool closes.
            </p>
          </FadeIn>
        </div>

        {/* The actual live listings — this used to be inside AssetPoolsSection */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 30 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <AssetPoolsSection />
        </motion.div>

        {/* Trust row */}
        <FadeIn direction="up" delay={200}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Radio className="size-3.5 text-brand-green" />
              <span>Live progress updates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-brand-green" />
              <span>Asset-backed listings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-brand-green" />
              <span>Instant lock at 100%</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 5 — TIERS
// ============================================================

function TiersScene({
  navigate,
  prefersReduced,
}: {
  navigate: ReturnType<typeof useNavigate>;
  prefersReduced: boolean;
}) {
  return (
    <ScrollScene
      id="tiers"
      bg="bg-background"
      trackHeight="h-auto min-h-screen lg:h-[170vh]"
      ghostText="TIERS"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="Investment Tiers"
          title="Two paths to"
          accentWord="mobility"
          accentColor="text-brand-green"
          description="Pick the tier that matches your capital and ambition. Both fund real South African fleet assets."
        />

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: i === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
                className="rounded-[1.75rem] bg-card border border-border/60 shadow-xl p-6 sm:p-8 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${tier.badge}`}>
                    {tier.tier}
                  </span>
                  <div
                    className={`size-11 rounded-full flex items-center justify-center ${tier.accent} ${tier.accentText}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  {tier.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>

                <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Target returns
                  </p>
                  <p className="font-display text-3xl font-bold text-brand-green">
                    {tier.returns}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-brand-green" />
                      <span className="text-sm leading-relaxed text-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate({ to: "/signup" })}
                  className="mt-6 w-full rounded-full py-5 font-bold"
                >
                  Get started
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 6 — HOW IT WORKS
// ============================================================

function HowItWorksScene({
  navigate,
  prefersReduced,
}: {
  navigate: ReturnType<typeof useNavigate>;
  prefersReduced: boolean;
}) {
  return (
    <ScrollScene
      id="how-it-works"
      bg="bg-secondary/60"
      trackHeight="h-auto min-h-screen lg:h-[200vh]"
      ghostText="FLOW"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="Simple Lifecycle"
          title="How MOTUS"
          accentWord="works"
          accentColor="text-brand-green"
        />

        <div className="grid gap-10 lg:grid-cols-2 items-start lg:gap-12">
          <FadeIn direction="up">
            <StepsSequence prefersReduced={prefersReduced} />
          </FadeIn>

          <FadeIn direction="scale" delay={200}>
            <div className="rounded-[1.75rem] bg-card p-6 sm:p-10 space-y-5 shadow-xl border border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green">
                Socio-Economic Impact
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                More than just vehicles
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                Every Rand invested puts another commercial vehicle or delivery bike on
                South African roads, creating sustainable livelihoods for local drivers
                and riders.
              </p>

              <div className="space-y-3 pt-2">
                {IMPACT_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-green" />
                    <p className="text-sm sm:text-base leading-relaxed text-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: "/about" })}
                  className="rounded-full w-full py-5 font-semibold border-border hover:bg-secondary text-sm sm:text-base"
                >
                  Read our Story &amp; Mission
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 7 — FINAL CTA
// ============================================================

function CtaScene({
  startInvestment,
  navigate,
  prefersReduced,
}: {
  startInvestment: () => void;
  navigate: ReturnType<typeof useNavigate>;
  prefersReduced: boolean;
}) {
  return (
    <section id="cta" className="relative bg-primary">
      <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-primary-foreground leading-[1.05]">
            Ready to put your money in{" "}
            <span className="relative inline-block text-brand-green">
              motion
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-brand-green opacity-90"
              />
            </span>
            ?
          </h2>

          <p className="mt-6 sm:mt-8 text-sm sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Choose a 1-month plan for 13%–20% returns, or a 2 to 3-month growth plan for
            20%–25%. Withdraw capital and returns automatically at maturity, or compound
            into the next cycle.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={startInvestment}
              className="rounded-full px-6 py-5 font-bold text-sm sm:text-base shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all sm:px-10 sm:py-6"
            >
              Start Investing from R100
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/faq" })}
              className="rounded-full px-6 py-5 font-semibold text-sm sm:text-base bg-primary-foreground/10 border-white/20 text-primary-foreground hover:bg-white/20 sm:px-8 sm:py-6"
            >
              Frequently Asked Questions
            </Button>
          </div>

          <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-xs text-primary-foreground/60">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5" />
              <span>Live in under 3 minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              <span>Fully asset-backed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Zero hidden fees</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// SCROLL SCENE
// ============================================================

function ScrollScene({
  children,
  bg = "bg-background",
  trackHeight = "h-auto min-h-screen",
  id,
  className = "",
  ghostText,
}: {
  children: React.ReactNode;
  bg?: string;
  trackHeight?: string;
  id?: string;
  className?: string;
  blobClass?: string;
  ghostText?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const animate = !prefersReduced && isDesktop && trackHeight.includes("vh");

  const contentScale = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.92, 1, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.25], [0.6, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id={id} ref={ref} className={`relative ${trackHeight} ${className}`}>
      <div className={`${animate ? "sticky top-0 h-screen overflow-hidden" : "relative"}`}>
        <motion.div
          className={`relative flex h-full w-full flex-col justify-center ${bg}`}
          style={
            animate
              ? {
                  scale: contentScale,
                  opacity: contentOpacity,
                  y: contentY,
                  transform: "translateZ(0)",
                }
              : undefined
          }
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 sm:h-48 z-20"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--primary) / 0.15), transparent)",
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-48 z-20"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--primary) / 0.18), transparent)",
            }}
          />

          {ghostText && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[18vw] sm:text-[22vw] font-black leading-none tracking-tighter text-foreground/[0.035]"
            >
              {ghostText}
            </div>
          )}
          <div className="relative z-10 w-full">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ============================================================
// CAROUSEL RAIL
// ============================================================

function CarouselRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    let dir = 1;
    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      el.scrollLeft += dir * 1.2;
      if (el.scrollLeft >= max - 1) dir = -1;
      if (el.scrollLeft <= 1) dir = 1;
    }, 40);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  return (
    <div
      ref={ref}
      className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {children}
    </div>
  );
}

// ============================================================
// SCENE HEADER — clean green underline
// ============================================================

function SceneHeader({
  eyebrow,
  title,
  accentWord,
  accentColor = "text-primary",
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  accentWord?: string;
  accentColor?: string;
  blobClass?: string;
  description?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`relative z-10 max-w-4xl ${alignClass} mb-10 sm:mb-16`}>
      <FadeIn direction="up">
        {eyebrow && (
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 sm:mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
          {title}
          {accentWord && (
            <>
              {" "}
              <span className={`relative inline-block ${accentColor}`}>
                {accentWord}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-brand-green opacity-90"
                />
              </span>
            </>
          )}
        </h2>
        {description && (
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </FadeIn>
    </div>
  );
}

// ============================================================
// PLAYFUL CARD
// ============================================================

function PlayfulCard({
  title,
  body,
  tag,
  colorClass = "bg-card",
  textColorClass = "text-foreground",
  icon,
  image,
  ctaLabel = "Learn more",
  onCta,
}: {
  title: string;
  body: string;
  tag?: string;
  colorClass?: string;
  textColorClass?: string;
  icon?: React.ReactNode;
  image?: string | null;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-card rounded-[1.75rem] p-3 shadow-xl w-full h-full border border-border/60"
    >
      <div
        className={`w-full h-40 sm:h-48 rounded-[1.25rem] ${colorClass} relative overflow-hidden flex items-center justify-center p-5`}
      >
        {image && (
          <>
            <img
              src={image}
              alt={`${title} fleet in South Africa`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        )}

        {tag && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1 text-[10px] font-bold text-black shadow-sm z-10 sm:text-xs">
            {tag}
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-2 relative z-10">
          {icon && (
            <div
              className={`size-12 sm:size-14 rounded-full bg-white/50 flex items-center justify-center shadow-inner ${textColorClass}`}
            >
              {icon}
            </div>
          )}
          <h3
            className={`font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${textColorClass}`}
          >
            {title}
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-5 flex flex-col gap-3">
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">
          {body}
        </p>
        {onCta && (
          <button
            onClick={onCta}
            className="group flex items-center text-sm font-bold text-foreground"
          >
            {ctaLabel}
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// ANIMATED BACKGROUND
// ============================================================

function AnimatedBackground({ prefersReduced }: { prefersReduced: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 200 });

  useEffect(() => {
    if (prefersReduced || typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 60);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 60);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReduced, mouseX, mouseY]);

  const orb1X = useTransform(smoothX, [-60, 60], [-20, 20]);
  const orb1Y = useTransform(smoothY, [-60, 60], [-15, 15]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "hsl(var(--primary))",
        }}
      />
      <motion.div
        className="absolute -top-32 -left-24 size-[520px] rounded-full bg-primary/[0.06]"
        style={prefersReduced ? undefined : { x: orb1X, y: orb1Y }}
      />
      <div className="absolute top-1/3 -right-32 size-[480px] rounded-full bg-brand-green/[0.06]" />
      <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-accent/[0.08]" />
    </div>
  );
}

// ============================================================
// GLOW CARD
// ============================================================

function GlowCard({
  children,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        (accent
          ? "rounded-2xl border border-brand-green/30 bg-accent/40 "
          : "rounded-2xl border border-border/70 bg-card/70 ") +
        "relative overflow-hidden shadow-sm transition-transform hover:-translate-y-1 " +
        className
      }
    >
      <div className="relative z-10 p-3 sm:p-4">{children}</div>
    </div>
  );
}

// ============================================================
// STEPS SEQUENCE
// ============================================================

function StepsSequence({ prefersReduced }: { prefersReduced: boolean }) {
  if (prefersReduced) {
    return (
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-4 items-start p-3 rounded-2xl">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-sm font-bold">
              {i + 1}
            </span>
            <p className="text-sm sm:text-base leading-relaxed text-foreground pt-1">
              {step}
            </p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="mt-4 space-y-2">
      {STEPS.map((step, i) => (
        <StepItem key={step} step={step} index={i} />
      ))}
    </ol>
  );
}

function StepItem({ step, index }: { step: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-40% 0px -40% 0px", once: false });

  return (
    <li ref={ref} className="relative flex gap-3 sm:gap-4 items-start p-2.5 sm:p-3">
      <motion.span
        aria-hidden
        className="absolute left-[26px] sm:left-[29px] top-[44px] h-[calc(100%-24px)] w-px bg-border"
        initial={false}
        animate={{ scaleY: inView ? 1 : 0 }}
        style={{ transformOrigin: "top" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <motion.span
        className="relative z-10 flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full font-display text-xs sm:text-sm font-bold shadow-sm"
        initial={false}
        animate={{
          backgroundColor: inView ? "hsl(var(--primary))" : "hsl(var(--muted))",
          color: inView ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
          scale: inView ? 1 : 0.92,
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {index + 1}
      </motion.span>
      <motion.p
        className="text-sm sm:text-base leading-relaxed pt-1.5"
        initial={false}
        animate={{
          color: inView ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
          x: inView ? 0 : 4,
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {step}
      </motion.p>
    </li>
  );
}