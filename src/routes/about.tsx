import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Users, Target, Heart, TrendingUp, Shield, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — MOTUS Capital" },
      {
        name: "description",
        content:
          "Learn about MOTUS Capital's mission to democratise mobility investment and empower South African drivers, riders and fleet operators.",
      },
    ],
  }),
  component: AboutPage,
});

const TEAM = [
  {
    name: "Leadership Team",
    role: "Guiding MOTUS Capital's Vision",
    description:
      "Our leadership team combines deep expertise in finance, technology and the South African mobility sector to build a platform that creates real opportunity.",
  },
];

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

const MILESTONES = [
  {
    year: "2023",
    title: "Concept & Research",
    body: "MOTUS Capital was founded on the idea that pooled community investment could power South Africa's booming e-hailing and delivery economy.",
  },
  {
    year: "2024",
    title: "Platform Development",
    body: "We built and tested our investment platform, establishing relationships with fleet operators and commercial vehicle partners across South Africa.",
  },
  {
    year: "2025",
    title: "Pilot Launch",
    body: "Our pilot programme brought together our first investors and vehicle operators, validating the model with real-world commercial deployments.",
  },
  {
    year: "2026",
    title: "Growing Together",
    body: "Today, MOTUS Capital continues to grow its investor community and vehicle fleet, expanding opportunity for everyone in the mobility ecosystem.",
  },
];

function AboutPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-secondary py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              About MOTUS Capital
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Putting South Africa's money in motion.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              MOTUS Capital was founded on a simple belief: that everyday South
              Africans should be able to invest in the growing mobility economy
              — and that those investments should create tangible opportunity for
              drivers, delivery riders and fleet operators in their communities.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Our mission
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We are on a mission to democratise access to mobility investment
              in South Africa. By pooling everyday capital — starting from as
              little as R100 — we fund commercial vehicles and motorcycles that
              create income-generating opportunities for people across the
              country.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              South Africa's e-hailing and delivery economy is growing rapidly,
              yet access to vehicles remains one of the biggest barriers for
              aspiring drivers and fleet operators. MOTUS Capital bridges this
              gap by connecting investors who want their money to work for them
              with operators who need capital to put vehicles on the road.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Our vision
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A South Africa where investment in mobility is inclusive,
              transparent and empowering — where anyone can be part of the
              growing mobility economy, and where every rand invested creates
              real opportunity.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Accessible investment from R100 per cycle.",
                "Commercial vehicles and motorcycles generating returns on the road.",
                "Income opportunities for drivers and delivery riders.",
                "Transparent 30-day investment cycles with flexible reinvestment.",
                "A growing community of investors and mobility partners.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-green" />
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
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">
            What we stand for
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
            Our values guide every decision we make — from how we build our
            platform to how we serve our investors and vehicle operators.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl bg-card p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent">
                  <Icon className="size-5 text-accent-foreground" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Our journey
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          From a bold idea to a growing platform — here's how MOTUS Capital has
          evolved.
        </p>
        <div className="mt-10 space-y-6">
          {MILESTONES.map((milestone, i) => (
            <div key={milestone.year} className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                  {milestone.year.slice(2)}
                </span>
                {i < MILESTONES.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {milestone.year}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">
                  {milestone.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {milestone.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display text-3xl font-bold">
            Ready to put your money in motion?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Join the MOTUS Capital community and start investing in South
            Africa's mobility economy from just R100.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3 font-bold text-primary transition-colors hover:bg-white/90"
          >
            Start investing
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
