import { useCallback } from "react";
import {
  INVESTMENT_STEP,
  MAX_INVESTMENT,
  MIN_INVESTMENT,
  QUICK_AMOUNTS,
  formatRand,
} from "@/lib/investment";
import { cn } from "@/lib/utils";

interface InvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * 13% to 15% return for the 30-day investment cycle.
 */
const MIN_RETURN_PCT = 0.13;
const MAX_RETURN_PCT = 0.15;

function calcMonthlyEarnings(amount: number) {
  const minProfit = Math.round(amount * MIN_RETURN_PCT);
  const maxProfit = Math.round(amount * MAX_RETURN_PCT);
  return {
    minProfit,
    maxProfit,
    minPayout: amount + minProfit,
    maxPayout: amount + maxProfit,
  };
}

export function InvestmentSlider({
  value,
  onChange,
  className,
}: InvestmentSliderProps) {
  const fillPercent = Math.min(
    100,
    Math.max(
      0,
      ((value - MIN_INVESTMENT) / (MAX_INVESTMENT - MIN_INVESTMENT)) * 100,
    ),
  );

  const handleSlider = useCallback(
    (raw: number) => {
      const snapped = Math.round(raw / INVESTMENT_STEP) * INVESTMENT_STEP;
      onChange(Math.min(MAX_INVESTMENT, Math.max(MIN_INVESTMENT, snapped)));
    },
    [onChange],
  );

  const { minProfit, maxProfit, minPayout, maxPayout } = calcMonthlyEarnings(value);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Top row: Investment Amount + Est. Return Payout */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            You invest
          </span>
          <p className="font-display text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            {formatRand(value)}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-green/30 bg-accent/40 px-3.5 py-2.5 sm:text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            Est. 30-day payout (13%–15%)
          </span>
          <p className="font-display text-2xl font-bold text-brand-green sm:text-3xl">
            {formatRand(minPayout)} – {formatRand(maxPayout)}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            Estimated profit:{" "}
            <span className="text-foreground">
              +{formatRand(minProfit)} – +{formatRand(maxProfit)}
            </span>
          </p>
        </div>
      </div>

      {/* Interactive Slider Track */}
      <div className="relative py-2">
        {/* Background track */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          {/* Active fill (blue) */}
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-75"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Custom styled thumb that stays in sync with fillPercent */}
        <div
          className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary bg-card shadow-md transition-[left] duration-75"
          style={{ left: `${fillPercent}%` }}
        />

        {/* Transparent native range input over the entire hit area */}
        <input
          type="range"
          min={MIN_INVESTMENT}
          max={MAX_INVESTMENT}
          step={INVESTMENT_STEP}
          value={value}
          aria-label="Investment amount in rand"
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 touch-none"
        />
      </div>

      {/* Min / Max Labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Min {formatRand(MIN_INVESTMENT)}</span>
        <span>Max {formatRand(MAX_INVESTMENT)}</span>
      </div>

      {/* Quick Amount Buttons — responsive grid on mobile */}
      <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {QUICK_AMOUNTS.map((amount) => {
          const isSelected = value === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => onChange(amount)}
              className={cn(
                "rounded-xl border py-2 text-center text-xs font-bold transition-all sm:rounded-full sm:px-4 sm:py-1.5 sm:text-sm",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
              )}
            >
              {formatRand(amount)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
