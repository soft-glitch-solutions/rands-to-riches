/**
 * Bank account investors pay into for new investment cycles.
 *
 * NOTE — PLACEHOLDER DETAILS: replace these with the real MOTUS Capital
 * receiving account as soon as the owner supplies them. They are shown to
 * investors on the dashboard's payment instructions.
 */
export const PAYOUT_ACCOUNT = {
  bank: "First National Bank (FNB)",
  accountName: "MOTUS Capital (Pty) Ltd",
  accountNumber: "630 000 000 0",
  branchCode: "250 655",
  accountType: "Cheque account",
};

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
