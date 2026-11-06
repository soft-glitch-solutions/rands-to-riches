import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Scale, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MOTUS Capital" },
      {
        name: "description",
        content:
          "Read the terms and conditions for MOTUS Capital, including how investments, payouts, risk disclosures, and account access work.",
      },
    ],
  }),
  component: TermsPage,
});

const KEY_POINTS = [
  {
    icon: FileText,
    title: "Investment overview",
    body:
      "MOTUS Capital provides a platform for investors to participate in commercial mobility opportunities in South Africa. These terms govern your access to and use of the platform, including the registration of an account, investment activities, payout preferences, and any communication made through the service.",
  },
  {
    icon: TrendingUp,
    title: "Returns and risk",
    body:
      "Any projected return figures are indicative only and are not guaranteed. Actual returns depend on vehicle performance, operating conditions, route demand, maintenance, insurance, and other commercial factors. Your capital remains subject to investment risk, and you should only invest funds you can afford to hold for the full investment cycle.",
  },
  {
    icon: ShieldCheck,
    title: "KYC and verification",
    body:
      "To open an account or complete an investment, you may be required to provide accurate identity, banking, tax, and contact information. We may request additional verification before allowing deposits, withdrawals, or changes to your account settings.",
  },
  {
    icon: Scale,
    title: "Account responsibilities",
    body:
      "You are responsible for keeping your login credentials, email address, password, and account details secure. You agree to provide truthful information and to notify us promptly if your account is compromised or if any details change.",
  },
] as const;

function TermsPage() {
  return (
    <SiteShell>
      <section className="bg-secondary py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground sm:text-[11px]">
            <FileText className="size-3.5" />
            Legal
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            These terms explain how MOTUS Capital operates, what to expect from investment activity,
            and the responsibilities of both the platform and the investor.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {KEY_POINTS.map(({ icon: Icon, title, body }) => (
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
              1. Acceptance of terms
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              By creating an account, continuing to use the MOTUS Capital platform, or submitting an
              investment request, you confirm that you have read, understood, and agree to these
              Terms & Conditions. If you do not agree, you must not use the platform or proceed with an
              investment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              2. Platform purpose and service
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              MOTUS Capital is a digital mobility investment platform connecting investors with
              income-generating commercial transport assets and operating opportunities across South
              Africa. The platform is designed to support transparent reporting, investment tracking,
              payout processing, and account management. We may update functionality, product terms, or
              support features as the platform evolves.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              3. Investment terms and payout mechanics
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Investments may be structured around stated cycle periods, target return bands, and payout
              arrangements described in the relevant product details at the time you invest. Any cycle
              start date, expected maturity date, and return calculation are estimates and may change as
              a result of vehicle performance, operating conditions, or required maintenance. Payouts
              are made to your verified bank account in accordance with our operational process and the
              information on your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              4. Risk disclosure
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Investing in mobility assets carries risk. Risks may include reduced route demand,
              vehicle downtime, unexpected maintenance costs, insurance exclusions, fraud or mismanagement,
              regulatory changes, or delays in operational performance. While MOTUS Capital applies
              operational controls and risk management procedures, your investment is not guaranteed and
              there is no promise of fixed income or certain capital recovery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              5. Fees, withdrawals, and changes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              MOTUS Capital may update fees, payout processing timelines, or product offerings from time
              to time. Any material change will be communicated clearly before it becomes effective.
              You acknowledge that deposits, withdrawals, and payouts may be delayed or rejected where
              account data is incomplete, the transaction is flagged for verification, or the operation
              is temporarily paused for risk management or service continuity reasons.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              6. Confidentiality and permitted use
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              You agree not to misuse the platform, share content unlawfully, attempt to access other
              users&apos; information, or interfere with the operation, security, or reliability of the
              service. You may use the platform only for lawful commercial and personal investment
              activities and in line with the purpose of the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              7. Limitation of liability
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              MOTUS Capital strives to provide accurate, up-to-date, and transparent information, but we
              do not guarantee uninterrupted service or error-free operation. To the extent permitted by
              law, we are not liable for indirect, incidental, or consequential losses arising out of
              the use of the platform, including losses related to investment decisions, market
              performance, or service interruption.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              8. Changes to these terms
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We may revise these terms from time to time to reflect changes in technology, product
              operations, compliance requirements, or investor experience. Continued use of the platform
              after changes are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              9. Contact and support
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              If you have questions about these terms, your account, or any investment-related matter,
              please contact MOTUS Capital through the support channels provided on the website.
            </p>
          </section>
        </article>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button asChild className="rounded-xl font-bold">
            <Link to="/auth">
              Continue to sign in
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Link to="/privacy" className="text-sm font-semibold text-primary hover:underline">
            Read our Privacy Policy
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
