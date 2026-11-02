export const MIN_INVESTMENT = 100;
export const MAX_INVESTMENT = 10000;

export const TIER1_MIN = 100;
export const TIER1_MAX = 1000;
export const TIER1_STEP = 50;
export const QUICK_AMOUNTS_TIER1 = [100, 250, 500, 750, 1000];

export const TIER2_MIN = 1500;
export const TIER2_MAX = 10000;
export const TIER2_STEP = 250;
export const QUICK_AMOUNTS_TIER2 = [1500, 2500, 5000, 7500, 10000];

// Default backward compatibility
export const QUICK_AMOUNTS = QUICK_AMOUNTS_TIER1;
export const INVESTMENT_STEP = TIER1_STEP;
export const INVESTMENT_TERM_DAYS = 30;

export type InvestmentPlan = "1month" | "2months" | "3months";

export interface PlanConfig {
  termDays: number;
  termLabel: string;
  minAmount: number;
  maxAmount: number;
  step: number;
  minPct: number;
  maxPct: number;
  quickAmounts: number[];
}

export const PLAN_CONFIGS: Record<InvestmentPlan, PlanConfig> = {
  "1month": {
    termDays: 30,
    termLabel: "1 Month (30 Days)",
    minAmount: TIER1_MIN,
    maxAmount: TIER1_MAX,
    step: TIER1_STEP,
    minPct: 0.13, // 13%
    maxPct: 0.20, // 20%
    quickAmounts: QUICK_AMOUNTS_TIER1,
  },
  "2months": {
    termDays: 60,
    termLabel: "2 Months (60 Days)",
    minAmount: TIER2_MIN,
    maxAmount: TIER2_MAX,
    step: TIER2_STEP,
    minPct: 0.20, // 20%
    maxPct: 0.22, // 22%
    quickAmounts: QUICK_AMOUNTS_TIER2,
  },
  "3months": {
    termDays: 90,
    termLabel: "3 Months (90 Days)",
    minAmount: TIER2_MIN,
    maxAmount: TIER2_MAX,
    step: TIER2_STEP,
    minPct: 0.22, // 22%
    maxPct: 0.25, // 25%
    quickAmounts: QUICK_AMOUNTS_TIER2,
  },
};

/**
 * Calculate returns based on amount and plan/term.
 */
export function calculateEarnings(amount: number, plan: InvestmentPlan = "1month") {
  const config = PLAN_CONFIGS[plan] ?? PLAN_CONFIGS["1month"];
  const minProfit = Math.round(amount * config.minPct);
  const maxProfit = Math.round(amount * config.maxPct);
  return {
    termDays: config.termDays,
    termLabel: config.termLabel,
    minPct: config.minPct,
    maxPct: config.maxPct,
    minProfit,
    maxProfit,
    minPayout: amount + minProfit,
    maxPayout: amount + maxProfit,
  };
}

/** Format whole rands as South African rand currency, e.g. 1250 -> "R1,250". */
export function formatRand(rands: number): string {
  return `R${Math.round(rands).toLocaleString("en-ZA")}`;
}

/** Format cents as South African rand currency, e.g. 125000 -> "R1,250". */
export function formatRandFromCents(cents: number): string {
  return formatRand(cents / 100);
}

/** Clamp any input to a valid investment amount on either tier. */
export function clampInvestment(rands: number): number {
  if (!Number.isFinite(rands)) return MIN_INVESTMENT;
  if (rands <= TIER1_MAX) {
    const snapped = Math.round(rands / TIER1_STEP) * TIER1_STEP;
    return Math.min(TIER1_MAX, Math.max(TIER1_MIN, snapped));
  }
  const snapped = Math.round(rands / TIER2_STEP) * TIER2_STEP;
  return Math.min(TIER2_MAX, Math.max(TIER2_MIN, snapped));
}

/** Format a date like "12 Nov 2026". */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
