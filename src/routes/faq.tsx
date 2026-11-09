import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import {
  Search,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Car,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  category: "plans" | "payments" | "vehicles" | "account";
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  // Plans & Returns
  {
    id: "plans-1",
    category: "plans",
    question: "How do the 1-month and 2–3 month investment plans work?",
    answer:
      "We offer two flexible mobility investment tiers:\n\n• 1-Month Plan (30 Days): Invest from R100 to R1,000 with target returns of 13% to 20% at the end of the 30-day cycle.\n\n• 2–3 Month Growth Plan (60 to 90 Days): Invest from R1,500 up to R10,000. Choose a 2-month (60-day) term for 20% to 22% returns, or a 3-month (90-day) term for 22% to 25% returns.\n\nAt maturity, your principal plus profits are paid out directly to your bank account, or you can choose to reinvest automatically.",
  },
  {
    id: "plans-2",
    category: "plans",
    question: "How are the 13% to 25% returns generated?",
    answer:
      "Pooled investor funds are deployed into income-generating commercial vehicles (e-hailing cars like Toyota Vitz and Suzuki Swift, and delivery motorcycles) operated by vetted drivers and courier partners in South Africa. Revenue is earned daily from passenger fares and delivery fees. After vehicle maintenance, insurance, and operating expenses, returns are shared with investors according to their cycle terms.",
  },
  {
    id: "plans-3",
    category: "plans",
    question: "Can I reinvest my profits at the end of a cycle?",
    answer:
      "Yes! When you initiate an investment, you can select whether you want your funds automatically rolled over into the next cycle or paid out to your bank account upon maturity. You can switch this preference at any time from your dashboard before the maturity date.",
  },
  {
    id: "plans-4",
    category: "plans",
    question: "Are returns guaranteed?",
    answer:
      "No investment returns are 100% guaranteed. Returns depend on actual commercial vehicle utilization, route demand, and operating performance. However, MOTUS Capital mitigates risks by pooling funds across diverse fleets, installing GPS telematics, and securing comprehensive commercial vehicle insurance.",
  },

  // Payments & Withdrawals
  {
    id: "pay-1",
    category: "payments",
    question: "How do I deposit funds to start my investment?",
    answer:
      "You can fund your investment using South African bank EFT, instant Ozow EFT, or credit/debit cards. Once you register and choose an amount, bank payment details and a unique reference code will be generated on your dashboard.",
  },
  {
    id: "pay-2",
    category: "payments",
    question: "How and when do I get paid out?",
    answer:
      "When your 30, 60, or 90-day cycle matures, your payout (initial capital + earned returns) is automatically queued for transfer to your verified South African bank account (FNB, Standard Bank, Capitec, Nedbank, Absa, etc.). Payouts are processed within 1 to 2 business days of cycle completion.",
  },
  {
    id: "pay-3",
    category: "payments",
    question: "Are there any hidden fees or deposit charges?",
    answer:
      "No. We do not charge registration fees or monthly account keeping fees. All vehicle servicing, insurance, and fleet operations costs are factored into the gross fleet revenues before net returns are calculated.",
  },

  // Vehicles & Security
  {
    id: "veh-1",
    category: "vehicles",
    question: "What vehicles does MOTUS Capital fund?",
    answer:
      "We finance commercial e-hailing vehicles (fuel-efficient compacts like Suzuki Swift, Toyota Vitz, and Hyundai Grand i10) and two-wheel commercial motorcycles for on-demand delivery services across major metro areas including Johannesburg, Pretoria, Cape Town, and Durban.",
  },
  {
    id: "veh-2",
    category: "vehicles",
    question: "How are the vehicles and drivers managed?",
    answer:
      "All drivers undergo background checks, license verification, and driver training. Vehicles are equipped with live 24/7 telematics, GPS geofencing, and remote immobilizers, and are covered by commercial passenger and goods-in-transit insurance.",
  },

  // Account
  {
    id: "acc-1",
    category: "account",
    question: "Who is eligible to invest?",
    answer:
      "Any individual aged 18 or older with a South African ID or valid passport and a South African bank account can create an account and start investing with as little as R100.",
  },
  {
    id: "acc-2",
    category: "account",
    question: "Can I have multiple investments running at the same time?",
    answer:
      "Yes! You can have multiple concurrent cycles. For example, you can have a 1-month R500 starter cycle running while also having a 3-month R5,000 growth cycle deployed in commercial fleet operations.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", Icon: HelpCircle },
  { id: "plans", label: "Plans & Returns", Icon: TrendingUp },
  { id: "payments", label: "Payments & Payouts", Icon: CreditCard },
  { id: "vehicles", label: "Vehicles & Fleet", Icon: Car },
  { id: "account", label: "Account & Eligibility", Icon: ShieldCheck },
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — MOTUS Capital Returns, Safety & Payouts" },
      {
        name: "description",
        content:
          "Find answers to all questions about investing in MOTUS Capital: 13%–25% returns, 30–90 day cycles, bank EFT withdrawals, and vehicle fleet security.",
      },
      { property: "og:title", content: "Frequently Asked Questions — MOTUS Capital" },
      {
        property: "og:description",
        content:
          "Learn how MOTUS Capital generates 13% to 25% returns on South African mobility and delivery fleets.",
      },
      { property: "og:url", content: "https://motuscapital.co.za/faq" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQ_DATA.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer.replace(/\n\n/g, " "),
            },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("plans-1");

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-secondary/70 py-16 sm:py-20 border-b border-border/60">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/80 px-4 py-1.5 text-xs font-semibold text-accent-foreground animate-fade-down shadow-xs">
            <span className="size-2 rounded-full bg-brand-green" />
            Help & Knowledge Base
          </div>

          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl animate-fade-up delay-100">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg animate-fade-up delay-200">
            Everything you need to know about investing in the mobility economy,
            our 13%–25% returns, and how vehicles earn on the road.
          </p>

          {/* Search bar */}
          <div className="relative mx-auto mt-8 max-w-xl animate-fade-up delay-300">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. returns, payouts, vehicles)..."
              className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main FAQ Content */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-8 animate-fade-in delay-200">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeCategory === id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <FadeIn direction="up">
            <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-xs">
              <HelpCircle className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 font-display text-lg font-bold text-foreground">
                No matching questions found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try searching with different terms or reset your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 inline-flex items-center text-sm font-bold text-primary hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              return (
                <FadeIn key={faq.id} direction="up" delay={Math.min(index * 60, 400)}>
                  <div
                    className={cn(
                      "rounded-2xl border bg-card transition-all duration-300",
                      isOpen
                        ? "border-primary/50 shadow-md shadow-primary/5 ring-1 ring-primary/20"
                        : "border-border/80 hover:border-primary/40 hover:shadow-xs",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display text-base sm:text-lg font-bold text-foreground">
                        {faq.question}
                      </span>
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform duration-300",
                          isOpen && "rotate-180 bg-primary text-primary-foreground",
                        )}
                      >
                        <ChevronDown className="size-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border/50 px-5 pb-5 pt-3 animate-fade-in">
                        <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Still have questions CTA */}
        <FadeIn direction="up" delay={200}>
          <div className="mt-14 rounded-3xl border border-primary/20 bg-secondary/50 p-8 text-center sm:p-10 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Still have questions?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Can't find the answer you're looking for? Reach out directly to our
              Johannesburg team or test our live interactive demo.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-2xl font-bold gap-2 shadow-sm",
                )}
              >
                <span>Contact our team</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/demo"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-2xl font-semibold border-border hover:bg-card",
                )}
              >
                Try Investor Demo
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </SiteShell>
  );
}
