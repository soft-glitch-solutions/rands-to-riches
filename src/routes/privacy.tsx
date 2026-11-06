import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, ShieldCheck, UserRound, WalletCards } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MOTUS Capital" },
      {
        name: "description",
        content:
          "Read MOTUS Capital's privacy policy covering personal data, cookies, account security, and how investor information is handled.",
      },
    ],
  }),
  component: PrivacyPage,
});

const POLICY_POINTS = [
  {
    icon: UserRound,
    title: "Personal information",
    body:
      "We may collect personal information such as your name, contact details, identity information, bank account details, and investment preferences in order to create and manage your account.",
  },
  {
    icon: WalletCards,
    title: "Financial and account data",
    body:
      "We may process information required for onboarding, payment verification, payout transfers, compliance screening, and the administration of investments and reports.",
  },
  {
    icon: Lock,
    title: "Security measures",
    body:
      "We use reasonable technical and organisational safeguards to protect personal information, including restricted access, encryption, secure hosting, and account verification practices.",
  },
  {
    icon: ShieldCheck,
    title: "Purpose limitation",
    body:
      "We use your information only for the purposes for which it was provided, including risk management, customer support, legal compliance, and investment operations.",
  },
] as const;

function PrivacyPage() {
  return (
    <SiteShell>
      <section className="bg-secondary py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground sm:text-[11px]">
            <Lock className="size-3.5" />
            Privacy
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            This policy explains how MOTUS Capital collects, uses, stores, and protects the personal
            information of our customers, investors, and platform users.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {POLICY_POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-foreground sm:text-xl">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <article className="mt-10 space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              1. Information we collect
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We collect information you provide directly when you register, sign in, invest, or contact
              us. This may include your name, email address, phone number, identity information, bank
              account details, investment goals, and other information needed to deliver our services.
              We may also collect technical information such as browser type, device information, IP
              address, and usage data needed to maintain the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              2. How we use your information
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              MOTUS Capital uses personal information to create and administer user accounts, process
              investment activity, verify identities, provide customer support, manage payouts, meet legal
              and regulatory obligations, and improve the quality of our service. We may use your data to
              communicate important updates, security alerts, account notifications, or operational
              information related to your investments.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              3. Sharing your information
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We may share personal information with third-party service providers that support our
              platform, such as payment processors, identity verification providers, security systems,
              hosting providers, and analytics tools. These providers are required to operate under
              confidentiality obligations and only process information for the services they provide to
              us. We may also disclose information when required by law, regulation, fraud prevention,
              or legitimate legal process.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              4. Cookies and website analytics
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Our website may use cookies and similar tools to understand how users interact with the
              platform, improve user experience, and protect the security of digital services. You can
              control cookie preferences in your browser settings; however, disabling some cookies may
              affect the functionality of the site or specific features.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              5. Data retention and security
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We keep personal information for as long as necessary to provide our services, meet
              statutory obligations, resolve disputes, and enforce our agreements. We apply reasonable
              security controls to protect personal data against unauthorised access, loss, or misuse,
              but no system is completely risk-free. You are responsible for protecting any account
              credentials and for notifying us promptly if you suspect a security issue.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              6. Your rights
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Depending on your circumstances and applicable law, you may have rights relating to access,
              correction, deletion, or restriction of your personal information, as well as the right to
              object to processing or to request data portability. If you would like to exercise any of
              these rights, please contact us using the support details on the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              7. International transfers
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Some services or suppliers may process data outside South Africa. Where this occurs, we
              take reasonable steps to ensure that personal information remains protected through secure
              service arrangements and appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              8. Changes to this policy
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We may update this policy as our business, products, legal obligations, or security practices
              change. Any material update will be communicated through the platform or other reasonable
              channels, and continued use of the site after changes are published will constitute your
              acceptance of the updated policy.
            </p>
          </section>
        </article>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button asChild className="rounded-xl font-bold">
            <Link to="/auth">
              Go to sign in
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Link to="/terms" className="text-sm font-semibold text-primary hover:underline">
            Review the Terms & Conditions
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
