export const MIN_INVESTMENT = 100;
export const MAX_INVESTMENT = 1000;
export const INVESTMENT_STEP = 50;
export const QUICK_AMOUNTS = [100, 250, 500, 750, 1000];
export const INVESTMENT_TERM_DAYS = 30;

/** Format whole rands as South African rand currency, e.g. 1250 -> "R1,250". */
export function formatRand(rands: number): string {
  return `R${Math.round(rands).toLocaleString("en-ZA")}`;
}

/** Format cents as South African rand currency, e.g. 125000 -> "R1,250". */
export function formatRandFromCents(cents: number): string {
  return formatRand(cents / 100);
}

/** Clamp any input to a valid investment amount on the R50 grid, R100-R1,000. */
export function clampInvestment(rands: number): number {
  if (!Number.isFinite(rands)) return MIN_INVESTMENT;
  const snapped = Math.round(rands / INVESTMENT_STEP) * INVESTMENT_STEP;
  return Math.min(MAX_INVESTMENT, Math.max(MIN_INVESTMENT, snapped));
}

/** Format a date like "12 Nov 2026". */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
