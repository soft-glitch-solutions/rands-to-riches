import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { InvestmentSlider } from "@/components/investment-slider";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import {
  INVESTMENT_TERM_DAYS,
  clampInvestment,
  formatRand,
} from "@/lib/investment";
import heroImage from "@/assets/motus-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MOTUS Capital — Your money in motion" },
      {
        name: "description",
        content:
          "Invest in the growing e-hailing and delivery economy. Help power the vehicles that keep people and businesses moving — starting from just R100.",
      },
    ],
  }),
  component: Index,
});

const PILLARS = [
  {
    title: "Invest",
    body: "Make mobility investments accessible from R100. Pool everyday capital into something bigger.",
  },
  {
    title: "Mobilise",
    body: "Put capital into productive commercial vehicles and motorcycles that earn on the road.",
  },
  {
    title: "Empower",
    body: "Support drivers, delivery riders and fleet operators with income-generating opportunities.",
  },
];

const STEPS = [
  "Investors contribute capital, from R100 to R1,000 per cycle.",
  "Pooled funds are deployed into commercial vehicles and motorcycles.",
  "Vehicles enter commercial operations with drivers and delivery riders.",
  "The vehicle business generates revenue through commercial use.",
  `At the end of the ${INVESTMENT_TERM_DAYS}-day cycle, investors withdraw or reinvest.`,
];

function Index() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(500);

  const startInvestment = () => {
    navigate({ to: "/signup", search: { amount: clampInvestment(amount) } });
  };

  return (
    <SiteShell>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              Invest in Mobility. Create Opportunity.
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Put your money in motion.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Invest in the growing e-hailing and delivery economy. Help power
              the vehicles that keep people and businesses moving — starting
              from just R100.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-secondary px-2 py-4">
                <p className="font-display text-xl font-bold text-primary sm:text-2xl">
                  R100
                </p>
                <p className="mt-1 text-xs font-medium text-secondary-foreground sm:text-sm">
                  Starting investment
                </p>
              </div>
              <div className="rounded-2xl bg-secondary px-2 py-4">
                <p className="font-display text-xl font-bold text-primary sm:text-2xl">
                  {INVESTMENT_TERM_DAYS} days
                </p>
                <p className="mt-1 text-xs font-medium text-secondary-foreground sm:text-sm">
                  Investment cycle
                </p>
              </div>
              <div className="rounded-2xl bg-secondary px-2 py-4">
                <p className="font-display text-xl font-bold text-primary sm:text-2xl">
                  Flexible
                </p>
                <p className="mt-1 text-xs font-medium text-secondary-foreground sm:text-sm">
                  Reinvestment choice
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <img
              src={heroImage}
              alt="E-hailing car and delivery rider on a city street"
              className="aspect-[16/9] w-full rounded-3xl object-cover shadow-lg shadow-primary/10"
            />
            <div className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground">
                Start your investment
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how much you would like to invest.
              </p>
              <InvestmentSlider value={amount} onChange={setAmount} />
              <Button
                size="lg"
                onClick={startInvestment}
                className="mt-6 w-full rounded-2xl text-base font-bold"
              >
                Invest {formatRand(amount)}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You'll create an account to continue with this amount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">
            Invest. Mobilise. Empower.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className="rounded-3xl bg-card p-6 shadow-sm"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              How it works
            </h2>
            <ol className="mt-8 space-y-5">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-foreground sm:text-base">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              More than vehicles
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              MOTUS Capital is not just about investing in vehicles. It is about
              supporting the people who use those vehicles to earn a living.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "More commercial vehicles available to drivers and delivery riders.",
                "Opportunities for people who need access to vehicles to work.",
                "Potential growth for fleet operators and mobility businesses.",
                "New employment and income-generating opportunities.",
                "Greater participation in the expanding mobility economy.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-green" />
                  <p className="text-sm leading-relaxed text-foreground sm:text-base">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="font-display text-3xl font-bold">
            Your money in motion
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Start with an investment cycle of {INVESTMENT_TERM_DAYS} days.
            Withdraw your capital and any returns payable at maturity, or keep
            it invested in subsequent cycles.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={startInvestment}
            className="mt-8 rounded-2xl px-10 font-bold"
          >
            Start your investment
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
