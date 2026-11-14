import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import {
  Users,
  Target,
  Heart,
  TrendingUp,
  Shield,
  Globe,
  Rocket,
  Sparkles,
  CheckCircle2,
  Zap,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — MOTUS Capital" },
      {
        name: "description",
        content:
          "MOTUS Capital is launching in late 2026 to democratise mobility investment — funding e-hailing, delivery and shuttle vehicles that create real jobs across South Africa.",
      },
      { property: "og:title", content: "About MOTUS Capital — Launching 2026" },
      {
        property: "og:description",
        content:
          "A new platform putting everyday South African capital to work in real mobility assets. Launching end of 2026.",
      },
    ],
  }),
  component: AboutPage,
});

// ============================================================
// DATA
// ============================================================

const VALUES = [
  {
    Icon: Target,
    title: "Purpose-driven",
    body: "We exist to democratise investment in South Africa's growing mobility economy — making it accessible from as little as R100.",
    color: "bg-blue-100",
    textColor: "text-blue-900",
    tag: "Why we exist",
  },
  {
    Icon: Heart,
    title: "Community first",
    body: "Every investment fuels drivers, delivery riders and fleet operators who rely on these vehicles to earn a living.",
    color: "bg-pink-100",
    textColor: "text-pink-900",
    tag: "Who we serve",
  },
  {
    Icon: Shield,
    title: "Transparent",
    body: "We are committed to clear, honest communication about how your money is put to work and what you can expect in return.",
    color: "bg-[#EAFF00]",
    textColor: "text-black",
    tag: "How we act",
  },
  {
    Icon: TrendingUp,
    title: "Growth-oriented",
    body: "We reinvest in technology, partnerships and people to continually expand opportunities for investors and vehicle operators alike.",
    color: "bg-purple-100",
    textColor: "text-purple-900",
    tag: "Where we're going",
  },
  {
    Icon: Users,
    title: "Inclusive",
    body: "We believe everyone deserves the chance to participate in the economy — as an investor, a driver or a fleet partner.",
    color: "bg-emerald-100",
    textColor: "text-emerald-900",
    tag: "Who we invite",
  },
  {
    Icon: Globe,
    title: "South African",
    body: "Built for South Africa, by South Africans. We understand the local mobility landscape and the communities we serve.",
    color: "bg-orange-100",
    textColor: "text-orange-900",
    tag: "Where we're from",
  },
];

const MILESTONES = [
  {
    year: "2026",
    tag: "Early 2026",
    title: "Concept & research",
    body: "MOTUS Capital began with one question: how do we let everyday South Africans own a slice of the vehicles earning on their streets? The model, the platform and the partnerships took shape over the first half of 2026.",
    done: true,
  },
  {
    year: "2026",
    tag: "Mid 2026",
    title: "Platform build & fleet partners",
    body: "We built the investment platform end-to-end and signed our first fleet operators and vehicle partners in Johannesburg and Pretoria. First vehicles are being prepared for commercial deployment.",
    done: true,
  },
  {
    year: "2026",
    tag: "End of 2026",
    title: "Public launch",
    body: "We're opening early access to our founding investors at the end of 2026. The first cycles go live, the first drivers get funded, and the first payouts begin.",
    done: false,
  },
];

const LAUNCH_POINTS = [
  "Founding investors get in at the ground floor — with early access to first cycles.",
  "First fleet: Johannesburg & Pretoria, e-hailing and delivery vehicles.",
  "More cities, more platforms and more vehicle types rolling out through 2027.",
];

const VISION_POINTS = [
  "Accessible investment from R100 per cycle.",
  "Commercial vehicles and motorcycles generating returns on the road.",
  "Income opportunities for drivers and delivery riders.",
  "Transparent 30 to 90-day investment cycles with flexible reinvestment.",
  "A growing community of investors and mobility partners.",
];

// ============================================================
// PAGE
// ============================================================

function AboutPage() {
  const prefersReduced = useReducedMotion();

  return (
    <SiteShell>
      <AnimatedBackground prefersReduced={!!prefersReduced} />
      <BlueFlowTransition />

      <HeroScene prefersReduced={!!prefersReduced} />
      <MissionVisionScene prefersReduced={!!prefersReduced} />
      <ValuesScene prefersReduced={!!prefersReduced} />
      <TimelineScene prefersReduced={!!prefersReduced} />
      <LaunchScene prefersReduced={!!prefersReduced} />
      <CtaScene prefersReduced={!!prefersReduced} />
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

function HeroScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <ScrollScene
      id="about-hero"
      bg="bg-background"
      trackHeight="h-auto min-h-screen lg:h-[160vh]"
      ghostText="ABOUT"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, x: -40 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="size-3.5" />
            About MOTUS Capital · Launching 2026
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Putting South Africa&apos;s money in{" "}
            <span className="relative inline-block text-primary">
              motion
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-[6px] rounded-full bg-brand-green opacity-90"
              />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            MOTUS Capital is a new platform launching at the{" "}
            <strong className="text-foreground">end of 2026</strong>. We&apos;re
            building it now — because everyday South Africans deserve a simple,
            transparent way to invest in the vehicles that are already earning on
            our streets, and because drivers and delivery riders deserve a
            reliable path to a working vehicle.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-brand-green" />
              <span>Founding cohort opening</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="size-4 text-brand-green" />
              <span>Built for South Africa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-brand-green" />
              <span>From R100 per cycle</span>
            </div>
          </div>
        </motion.div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 2 — MISSION & VISION
// ============================================================

function MissionVisionScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <ScrollScene
      id="mission"
      bg="bg-secondary/60"
      trackHeight="h-auto min-h-screen lg:h-[170vh]"
      ghostText="VISION"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="Mission & Vision"
          title="Why we're"
          accentWord="building"
          accentColor="text-brand-green"
          description="Two ideas guide everything we do — what we're solving and what the future looks like when we've solved it."
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: -50 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[1.75rem] bg-card border border-border/60 shadow-xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                Our Mission
              </span>
              <div className="size-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Target className="size-5" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              Democratise mobility investment
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We&apos;re on a mission to democratise access to mobility investment
              in South Africa. By pooling everyday capital — starting from as
              little as R100 — we fund commercial vehicles and motorcycles that
              create income-generating opportunities for people across the
              country.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              South Africa&apos;s e-hailing and delivery economy is growing fast,
              yet access to vehicles remains one of the biggest barriers for
              aspiring drivers and fleet operators. MOTUS Capital bridges this
              gap by connecting investors who want their money to work for them
              with operators who need capital to put vehicles on the road.
            </p>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: 50 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="rounded-[1.75rem] bg-card border border-border/60 shadow-xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Our Vision
              </span>
              <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Sparkles className="size-5" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              A more inclusive economy
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A South Africa where investment in mobility is inclusive,
              transparent and empowering — where anyone can be part of the
              growing mobility economy, and where every rand invested creates
              real opportunity.
            </p>
            <ul className="mt-5 space-y-2.5">
              {VISION_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-brand-green" />
                  <span className="text-sm leading-relaxed text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 3 — VALUES
// ============================================================

function ValuesScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <ScrollScene
      id="values"
      bg="bg-background"
      trackHeight="h-auto min-h-screen lg:h-[190vh]"
      ghostText="VALUES"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="What we stand for"
          title="Our"
          accentWord="values"
          accentColor="text-brand-green"
          description="Six principles that guide every decision — from how we build the platform to how we serve investors and vehicle operators."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {VALUES.map((value, i) => {
            const Icon = value.Icon;
            return (
              <motion.div
                key={value.title}
                initial={prefersReduced ? false : { opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.08 }}
                whileHover={prefersReduced ? undefined : { y: -6 }}
                className="bg-card rounded-[1.75rem] p-3 shadow-xl border border-border/60"
              >
                <div
                  className={`w-full h-36 rounded-[1.25rem] ${value.color} relative overflow-hidden flex items-center justify-center p-5`}
                >
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1 text-[10px] font-bold text-black shadow-sm">
                    {value.tag}
                  </div>
                  <div className="flex flex-col items-center text-center space-y-2 relative z-10">
                    <div
                      className={`size-14 rounded-full bg-white/50 flex items-center justify-center shadow-inner ${value.textColor}`}
                    >
                      <Icon className="size-7" />
                    </div>
                    <h3
                      className={`font-display text-xl sm:text-2xl font-extrabold tracking-tight ${value.textColor}`}
                    >
                      {value.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-5">
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                    {value.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 4 — TIMELINE
// ============================================================

function TimelineScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <ScrollScene
      id="timeline"
      bg="bg-secondary/40"
      trackHeight="h-auto min-h-screen lg:h-[170vh]"
      ghostText="JOURNEY"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="Our journey so far"
          title="Founded 2026."
          accentWord="Launching 2026."
          accentColor="text-brand-green"
          description="We're brand new — and we're being upfront about it. Here's the whole story, start to finish."
        />

        <ol className="relative space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          {MILESTONES.map((m, i) => (
            <motion.li
              key={i}
              initial={prefersReduced ? false : { opacity: 0, x: -40 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              className="flex gap-4 sm:gap-6"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:size-12 sm:text-sm ${
                    m.done
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-dashed border-primary/40 bg-primary/5 text-primary"
                  }`}
                >
                  {m.done ? "✓" : m.tag.split(" ")[0]}
                </span>
                {i < MILESTONES.length - 1 && (
                  <div className="mt-1.5 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="min-w-0 pb-2 rounded-[1.5rem] bg-card border border-border/60 shadow-sm p-4 sm:p-5 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[11px]">
                  {m.tag}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">
                  {m.title}
                  {!m.done && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary align-middle sm:text-[10px]">
                      Next
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {m.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 5 — LAUNCH
// ============================================================

function LaunchScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <ScrollScene
      id="launch"
      bg="bg-background"
      trackHeight="h-auto min-h-screen lg:h-[160vh]"
      ghostText="LAUNCH"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <SceneHeader
          eyebrow="End of 2026 launch"
          title="Get in on the"
          accentWord="ground floor"
          accentColor="text-brand-green"
          description="Early access is opening to our founding investor cohort at the end of 2026. No fees to join. No obligation to invest until you're ready."
        />

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 30 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[1.75rem] border border-primary/20 bg-primary/5 p-6 sm:p-10 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
              <Rocket className="size-3" />
              Founding Cohort
            </span>
          </div>

          <ul className="space-y-4">
            {LAUNCH_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="size-3.5 text-primary" />
                </span>
                <span className="text-sm leading-relaxed text-foreground sm:text-base">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </ScrollScene>
  );
}

// ============================================================
// SCENE 6 — FINAL CTA
// ============================================================

function CtaScene({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <section id="about-cta" className="relative bg-primary">
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

          <p className="mt-8 text-sm sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Reserve your spot in the founding investor cohort — launching end of
            2026, from just R100.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full px-6 py-5 font-bold text-sm sm:text-base shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all sm:px-10 sm:py-6"
            >
              <Link to="/signup">
                Start investing
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-6 py-5 font-semibold text-sm sm:text-base bg-primary-foreground/10 border-white/20 text-primary-foreground hover:bg-white/20 sm:px-8 sm:py-6"
            >
              <Link to="/faq">Read the FAQ</Link>
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-xs text-primary-foreground/60">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5" />
              <span>No fees to join</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="size-3.5" />
              <span>Fully asset-backed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>No obligation until you're ready</span>
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
          {/* Top blue bleed */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 sm:h-48 z-20"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--primary) / 0.15), transparent)",
            }}
          />

          {/* Bottom blue bleed */}
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
// SCENE HEADER — clean green underline, no blob
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