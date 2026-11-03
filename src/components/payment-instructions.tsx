import { useState } from "react";
import { Check, Copy, Landmark, TriangleAlert } from "lucide-react";
import { PAYOUT_ACCOUNT, IS_PLACEHOLDER_ACCOUNT } from "@/lib/payment-details";
import { formatRandFromCents } from "@/lib/investment";

interface Props {
  amountCents: number;
  paymentReference: string;
}

/** "Pay into this account" card shown for pending investment cycles. */
export function PaymentInstructions({ amountCents, paymentReference }: Props) {
  const [copied, setCopied] = useState(false);

  const rows: Array<[string, string]> = [
    ["Bank", PAYOUT_ACCOUNT.bank],
    ["Account name", PAYOUT_ACCOUNT.accountName],
    ["Account number", PAYOUT_ACCOUNT.accountNumber],
    ["Branch code", PAYOUT_ACCOUNT.branchCode],
    ["Account type", PAYOUT_ACCOUNT.accountType],
  ];

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(paymentReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; the reference is still visible on screen
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Landmark className="size-5 text-primary" />
        <h3 className="font-display text-base font-bold text-foreground">
          Pay {formatRandFromCents(amountCents)} into this account
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Make an EFT using the exact reference below. Your cycle starts once we confirm the payment.
      </p>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 sm:block">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </dt>
            <dd className="font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-primary/30">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Payment reference
          </p>
          <p className="font-mono text-lg font-bold tracking-wider text-primary">
            {paymentReference}
          </p>
        </div>
        <button
          type="button"
          onClick={copyReference}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary"
        >
          {copied ? <Check className="size-3.5 text-brand-green" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {IS_PLACEHOLDER_ACCOUNT && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          These are placeholder bank details. Do not pay until MOTUS Capital confirms the real account.
        </p>
      )}
    </div>
  );
}
