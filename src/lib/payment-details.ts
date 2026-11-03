/**
 * Bank account investors pay into for new investment cycles.
 *
 * Set the real details with these env vars (build time):
 *   VITE_PAYOUT_BANK, VITE_PAYOUT_ACCOUNT_NAME, VITE_PAYOUT_ACCOUNT_NUMBER,
 *   VITE_PAYOUT_BRANCH_CODE, VITE_PAYOUT_ACCOUNT_TYPE
 * Until then the clearly-marked PLACEHOLDER values below are shown.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const PAYOUT_ACCOUNT = {
  bank: env["VITE_PAYOUT_BANK"] ?? "First National Bank (FNB)",
  accountName: env["VITE_PAYOUT_ACCOUNT_NAME"] ?? "MOTUS Capital (Pty) Ltd",
  accountNumber: env["VITE_PAYOUT_ACCOUNT_NUMBER"] ?? "630 000 000 0",
  branchCode: env["VITE_PAYOUT_BRANCH_CODE"] ?? "250 655",
  accountType: env["VITE_PAYOUT_ACCOUNT_TYPE"] ?? "Cheque account",
};

/** True while the placeholder account number is still in use. */
export const IS_PLACEHOLDER_ACCOUNT = env["VITE_PAYOUT_ACCOUNT_NUMBER"] === undefined;

/** One line of payment instructions for investors. */
export function paymentInstructions(paymentReference: string): string[] {
  return [
    `Bank: ${PAYOUT_ACCOUNT.bank}`,
    `Account name: ${PAYOUT_ACCOUNT.accountName}`,
    `Account number: ${PAYOUT_ACCOUNT.accountNumber}`,
    `Branch code: ${PAYOUT_ACCOUNT.branchCode}`,
    `Account type: ${PAYOUT_ACCOUNT.accountType}`,
    `Payment reference: ${paymentReference}`,
  ];
}
