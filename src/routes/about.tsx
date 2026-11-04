import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import {
  Users, Target, Heart, TrendingUp, Shield, Globe,
  Rocket, Sparkles,
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

const VALUES = [
  {
    Icon: Target,
    title: "Purpose-driven",
    body: "We exist to democratise investment in South Africa's growing mobility economy — making it accessible from as little as R100.",
  },
  {
    Icon: Heart,
    title: "Community first",
    body: "Every investment fuels drivers, delivery riders and fleet operators who rely on these vehicles to earn a living.",
  },
  {
    Icon: Shield,
    title: "Transparent",
    body: "We are committed to clear, honest communication about how your money is put to work and what you can expect in return.",
  },
  {
    Icon: TrendingUp,
    title: "Growth-oriented",
    body: "We reinvest in technology, partnerships and people to continually expand opportunities for investors and vehicle operators alike.",
  },
  {
    Icon: Users,
    title: "Inclusive",
    body: "We believe everyone deserves the chance to participate in the economy — as an investor, a driver or a fleet partner.",
  },
  {
    Icon: Globe,
    title: "South African",
    body: "Built for South Africa, by South Africans. We understand the local mobility landscape and the communities we serve.",
  },
];

/** 2026-only journey — the whole company fits in one year so far. */
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

function AboutPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="border-b border-border/50 bg-secondary py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground sm:px-4 sm:py-1.5 sm:text-xs">
              <Sparkles className="size-3 sm:size-3.5" />
              About MOTUS Capital · Launching 2026
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:mt-5 sm:text-5xl">
              Putting South Africa&apos;s money in motion.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              MOTUS Capital is a new platform launching at the <strong className="text-foreground">end of 2026</strong>.
              We&apos;re building it now — because everyday South Africans deserve a simple, transparent way to
              invest in the vehicles that are already earning on our streets, and because drivers and
              delivery riders deserve a reliable path to a working vehicle.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Our mission
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              We&apos;re on a mission to democratise access to mobility investment
              in South Africa. By pooling everyday capital — starting from as
              little as R100 — we fund commercial vehicles and motorcycles that
              create income-generating opportunities for people across the
              country.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              South Africa&apos;s e-hailing and delivery economy is growing fast,
              yet access to vehicles remains one of the biggest barriers for
              aspiring drivers and fleet operators. MOTUS Capital bridges this
              gap by connecting investors who want their money to work for them
              with operators who need capital to put vehicles on the road.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Our vision
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              A South Africa where investment in mobility is inclusive,
              transparent and empowering — where anyone can be part of the
              growing mobility economy, and where every rand invested creates
              real opportunity.
            </p>
            <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
              {[
                "Accessible investment from R100 per cycle.",
                "Commercial vehicles and motorcycles generating returns on the road.",
                "Income opportunities for drivers and delivery riders.",
                "Transparent 30 to 90-day investment cycles with flexible reinvestment.",
                "A growing community of investors and mobility partners.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 sm:gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-green sm:size-2" />
                  <p className="text-sm leading-relaxed text-foreground sm:text-base">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            What we stand for
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-center text-sm text-muted-foreground sm:mt-3 sm:text-base">
            Our values guide every decision we make — from how we build our
            platform to how we serve our investors and vehicle operators.
          </p>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl bg-card p-5 shadow-sm sm:rounded-3xl sm:p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent sm:size-11">
                  <Icon className="size-4 text-accent-foreground sm:size-5" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-foreground sm:mt-4 sm:text-lg">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline — single year, honest */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:text-[11px]">
            <Rocket className="size-3" />
            Our journey so far
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:mt-4 sm:text-3xl">
            Founded 2026. Launching 2026.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            We&apos;re brand new — and we&apos;re being upfront about it. Here&apos;s the whole story,
            start to finish.
          </p>
        </div>

        <ol className="relative mt-8 space-y-6 sm:mt-10">
          {MILESTONES.map((m, i) => (
            <li key={i} className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:size-12 sm:text-sm ${
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
              <div className="min-w-0 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[11px]">
                  {m.tag}
                </p>
                <h3 className="mt-0.5 font-display text-base font-bold text-foreground sm:text-lg">
                  {m.title}
                  {!m.done && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary align-middle sm:text-[10px]">
                      Next
                    </span>
                  )}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-base">
                  {m.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Launch / get-in-early */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:rounded-3xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground sm:text-[11px]">
                End of 2026 launch
              </span>
              <h2 className="mt-3 font-display text-xl font-bold text-foreground sm:mt-4 sm:text-2xl">
                Get in on the ground floor.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Early access is opening to our founding investor cohort at the end of 2026.
                No fees to join. No obligation to invest until you&apos;re ready.
              </p>
            </div>
            <ul className="flex-1 space-y-2.5">
              {LAUNCH_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="rounded-2xl bg-primary px-5 py-10 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:rounded-3xl sm:px-12 sm:py-14">
          <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
            Ready to put your money in motion?
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-sm text-primary-foreground/80 sm:mt-3 sm:text-base">
            Reserve your spot in the founding investor cohort — launching end of 2026,
            from just R100.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Button asChild size="lg" variant="secondary" className="h-11 w-full rounded-xl font-bold sm:w-auto">
              <Link to="/signup">Start investing</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 w-full rounded-xl bg-primary-foreground/10 border-white/20 text-primary-foreground hover:bg-white/20 sm:w-auto"
            >
              <Link to="/faq">Read the FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}