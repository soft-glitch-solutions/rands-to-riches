import { clampInvestment } from "@/lib/investment";

/**
 * Shared `validateSearch` for routes that accept `?amount=`.
 * Returns `{}` (not `{ amount: undefined }`) so it type-checks under
 * `exactOptionalPropertyTypes`.
 */
export function parseAmountSearch(search: Record<string, unknown>): { amount?: number } {
  if (search["amount"] === undefined) return {};
  return { amount: clampInvestment(Number(search["amount"])) };
}
