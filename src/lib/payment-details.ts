/**
 * Bank account investors pay into for new investment cycles.
 *
 * The real details live in the database (`payout_settings`) and are edited by
 * admins in the admin area. Until an admin saves them there, the clearly
 * marked PLACEHOLDER values below are shown.
 */

export interface PayoutAccount {
  bank: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

const PLACEHOLDER: PayoutAccount = {
  bank: "First National Bank (FNB)",
  accountName: "MOTUS Capital (Pty) Ltd",
  accountNumber: "630 000 000 0",
  branchCode: "250 655",
  accountType: "Cheque account",
};

/** True while the placeholder account number is still in use. */
export function isPlaceholderPayout(p: PayoutAccount): boolean {
  return (
    p.accountNumber.replace(/\s/g, "") ===
    PLACEHOLDER.accountNumber.replace(/\s/g, "")
  );
}

/** Use the saved details when present, otherwise the placeholders. */
export function resolvePayout(payout: PayoutAccount | null | undefined): {
  account: PayoutAccount;
  isPlaceholder: boolean;
} {
  if (payout && payout.accountNumber.trim() !== "") {
    return { account: payout, isPlaceholder: isPlaceholderPayout(payout) };
  }
  return { account: PLACEHOLDER, isPlaceholder: true };
}

/** One line of payment instructions for investors. */
export function paymentInstructions(p: PayoutAccount): string[] {
  return [
    `Bank: ${p.bank}`,
    `Account name: ${p.accountName}`,
    `Account number: ${p.accountNumber}`,
    `Branch code: ${p.branchCode}`,
    `Account type: ${p.accountType}`,
  ];
}
