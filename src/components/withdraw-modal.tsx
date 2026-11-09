import { useState } from "react";
import {
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRandFromCents } from "@/lib/investment";
import { requestPayout } from "@/server-fn/investments";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bankDetails: { bank: string; accountNumber: string; amountCents: number }) => void;
  investment: {
    id: string;
    amount_cents: number;
    profit_cents?: number;
    term_days?: number;
  } | null;
  defaultBank?: string | null;
  defaultAccountHolder?: string | null;
  defaultAccountNumber?: string | null;
  defaultBranchCode?: string | null;
}

const SA_BANKS = [
  "Capitec Bank",
  "FNB / FirstRand",
  "Standard Bank",
  "Nedbank",
  "ABSA Bank",
  "TymeBank",
  "Discovery Bank",
];

export function WithdrawModal({
  isOpen,
  onClose,
  onConfirm,
  investment,
  defaultBank,
  defaultAccountHolder,
  defaultAccountNumber,
  defaultBranchCode,
}: WithdrawModalProps) {
  if (!isOpen || !investment) return null;

  const principalCents = investment.amount_cents;
  const profitCents =
    investment.profit_cents ?? Math.round(principalCents * 0.18);
  const totalPayoutCents = principalCents + profitCents;

  const [bank, setBank] = useState(defaultBank || SA_BANKS[0]!);
  const [accountHolder, setAccountHolder] = useState(defaultAccountHolder || "");
  const [accountNumber, setAccountNumber] = useState(defaultAccountNumber || "");
  const [branchCode, setBranchCode] = useState(defaultBranchCode || "");
  const [accountType, setAccountType] = useState<"cheque" | "savings">("savings");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    setBusy(true);
    setErrorMsg(null);

    try {
      if (investment.id && !investment.id.startsWith("demo-")) {
        await requestPayout({
          data: {
            investmentId: investment.id,
            amountCents: totalPayoutCents,
            bankName: bank,
            accountHolder: accountHolder.trim() || undefined,
            accountNumber: accountNumber.trim(),
            branchCode: branchCode.trim() || undefined,
            accountType,
          },
        });
      }

      setBusy(false);
      setDone(true);
      setTimeout(() => {
        onConfirm({
          bank,
          accountNumber,
          amountCents: totalPayoutCents,
        });
        setDone(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setBusy(false);
      setErrorMsg(err?.message || "Failed to submit withdrawal request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Withdraw Matured Funds
              </h3>
              <p className="text-xs text-muted-foreground">
                Direct EFT payout to your South African bank
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-brand-green">
              <CheckCircle2 className="size-8" />
            </div>
            <h4 className="font-display text-xl font-bold text-foreground">
              Withdrawal Queued!
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {formatRandFromCents(totalPayoutCents)} has been submitted for EFT transfer to your {bank} account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payout Breakdown Card */}
            <div className="rounded-2xl border border-brand-green/30 bg-accent/40 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/50">
                <span>Principal Capital</span>
                <span className="font-bold text-foreground">
                  {formatRandFromCents(principalCents)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-b border-border/50">
                <span>Earned Vehicle Return</span>
                <span className="font-bold text-brand-green">
                  +{formatRandFromCents(profitCents)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-sm text-foreground">Total Payout</span>
                <span className="font-display text-xl sm:text-2xl font-extrabold text-brand-green">
                  {formatRandFromCents(totalPayoutCents)}
                </span>
              </div>
            </div>

            {/* Bank Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recipient Bank
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                {SA_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Holder Name
              </label>
              <input
                type="text"
                placeholder="Full name as on account"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Account Number & Branch Code */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1029384756"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Branch Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 250655"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Type
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("savings")}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                    accountType === "savings"
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  Savings Account
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("cheque")}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                    accountType === "cheque"
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  Cheque / Current
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <ShieldCheck className="mr-1 inline size-3.5 text-brand-green align-text-bottom" />
              Payouts are verified and dispatched via EFT within 1 business day.
            </p>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/3 rounded-2xl font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy || !accountNumber.trim()}
                className="w-2/3 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white font-bold cursor-pointer"
              >
                {busy ? "Submitting Request..." : `Confirm ${formatRandFromCents(totalPayoutCents)} EFT`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
